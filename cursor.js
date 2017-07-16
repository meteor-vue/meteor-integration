import {LocalCollection} from 'meteor/minimongo';

// To allow cursors to be returned from computed fields.
// See: https://github.com/meteor/meteor/pull/8888
// Our fork of Vue supports v-for over iterators.
// See: https://github.com/vuejs/vue/issues/5893
if (typeof Symbol !== 'undefined' && Symbol.iterator) {
  if (!LocalCollection.Cursor.prototype[Symbol.iterator]) {
    LocalCollection.Cursor.prototype[Symbol.iterator] = function () {
      var self = this;

      var i = 0;
      var objects = self._getRawObjects({ordered: true});

      if (self.reactive) {
        self._depend({
          addedBefore: true,
          removed: true,
          changed: true,
          movedBefore: true});
      }

      return {
        next: function () {
          if (i < objects.length) {
            // This doubles as a clone operation.
            var elt = self._projectionFn(objects[i++]);

            if (self._transform)
              elt = self._transform(elt);

            return {
              value: elt
            };
          }
          else {
            return {
              done: true
            };
          }
        }
      };
    };
  }
}
else {
  console.error("Symbol.iterator is not defined. Vue v-for over Minimongo cursors is thus not supported. Is a es6-symbol polyfill missing?");
}
