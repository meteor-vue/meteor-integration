import {Match} from 'meteor/check';
import {Meteor} from 'meteor/meteor';
import {Tracker} from 'meteor/tracker';

// To not have dependency on underscore.
function isEmpty(object) {
  for (const name in object) {
    if (object.hasOwnProperty(name)) {
      return false;
    }
  }
  return true;
}

// In Blaze, life-cycle callbacks are not run inside a reactive computation but in Vue they are, so we isolate calls
// when inside a life-cycle callback. Otherwise $autorun's computation runs only the first time, but then when the outside
// reactive computation is invalidated, $autorun's computation stops. And because a life-cycle callback is not called
// again, $autorun's computation is not recreated. Those life-cycle callbacks are not called from inside current vm's
// main watcher, but from parent's or even ancestor's higher up. One possible check is to go over all ancestors and check
// if current computation's watcher is one of ancestor's main watcher. But it seems just checking that the current
// watcher is some component's main watcher is equivalent, but simpler.
function isolate(vm, f) {
  if (Tracker.currentComputation && Tracker.currentComputation._pureWatcher && Tracker.currentComputation._vueWatcher.vm && Tracker.currentComputation._vueWatcher.vm._watcher === Tracker.currentComputation._vueWatcher) {
    return Tracker.nonreactive(f);
  }
  return f();
}

export function install(Vue, options) {
  Vue.mixin({
    beforeCreate() {
      this._onDestroyedCallbacks = [];

      this._allSubsReadyDep = new Tracker.Dependency();
      this._allSubsReady = false;
      this._subscriptionHandles = new Map();
    },

    destroyed() {
      while (this._onDestroyedCallbacks.length) {
        const callback = this._onDestroyedCallbacks.shift();
        if (callback) {
          callback();
        }
      }
    }
  });

  function addOnDestroyedCallback(callbacks, callback) {
    callbacks.push(callback);
  }

  function removeOnDestroyedCallback (callbacks, callback) {
    const index = callbacks.lastIndexOf(callback);
    if (index !== -1) {
      callbacks.splice(index, 1);
    }
  }

  Vue.prototype.$autorun = function (f) {
    const computation = isolate(this, () => {
      return Tracker.autorun((computation) => {
        f.call(this, computation);
      });
    });

    const stopComputation = function () {
      computation.stop();
    };

    addOnDestroyedCallback(this._onDestroyedCallbacks, stopComputation);
    computation.onStop(() => {
      removeOnDestroyedCallback(this._onDestroyedCallbacks, stopComputation);
    });

    return computation;
  };

  Vue.prototype.$subscribe = function (/* arguments */) {
    const args = Array.prototype.slice.call(arguments);

    // Duplicate logic from Meteor.subscribe.
    let options = {};
    if (args.length) {
      const lastParam = args[args.length - 1];

      // Match pattern to check if the last arg is an options argument.
      const lastParamOptionsPattern = {
        onReady: Match.Optional(Function),
        onStop: Match.Optional(Function),
        connection: Match.Optional(Match.Any),
      };

      if (typeof lastParam === 'function') {
        options.onReady = args.pop();
      }
      else if (lastParam && !isEmpty(lastParam) && Match.test(lastParam, lastParamOptionsPattern)) {
        options = args.pop();
      }
    }

    const oldStopped = options.onStop;
    options.onStop = (error) => {
      // When the subscription is stopped, remove it from the set of tracked
      // subscriptions to avoid this list growing without bound.
      this._subscriptionHandles.delete(subHandle.subscriptionId);
      removeOnDestroyedCallback(this._onDestroyedCallbacks, stopHandle);

      // Removing a subscription can only change the result of subscriptionsReady
      // if we are not ready (that subscription could be the one blocking us being
      // ready).
      if (!this._allSubsReady) {
        this._allSubsReadyDep.changed();
      }

      if (oldStopped) {
        oldStopped(error);
      }
    };

    const callbacks = {};
    if (options.hasOwnProperty('onReady')) {
      callbacks.onReady = options.onReady;
    }
    if (options.hasOwnProperty('onStop')) {
      callbacks.onStop = options.onStop;
    }

    args.push(callbacks);

    const subHandle = isolate(this, () => {
      if (options.connection) {
        return options.connection.subscribe.apply(options.connection, args);
      }
      else {
        return Meteor.subscribe.apply(Meteor, args);
      }
    });

    const stopHandle = function () {
      subHandle.stop();
    };

    addOnDestroyedCallback(this._onDestroyedCallbacks, stopHandle);

    if (!this._subscriptionHandles.has(subHandle.subscriptionId)) {
      this._subscriptionHandles.set(subHandle.subscriptionId, subHandle);

      // Adding a new subscription will always cause us to transition from ready
      // to not ready, but if we are already not ready then this can't make us
      // ready.
      if (this._allSubsReady) {
        this._allSubsReadyDep.changed();
      }
    }

    return subHandle;
  };

  Vue.prototype.$subscriptionsReady = function () {
    this._allSubsReadyDep.depend();

    this._allSubsReady = Array.from(this._subscriptionHandles.values()).every(function (handle, index, array) {
      return handle.ready();
    });

    return this._allSubsReady;
  };
}
