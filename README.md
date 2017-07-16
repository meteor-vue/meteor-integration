Vue and Meteor integration
==========================

This Meteor package extends [Vue](https://vuejs.org/) components with support for Meteor.

Adding this package to your Meteor application adds to Vue components:
 * `$autorun`, a version of [Tracker.autorun](https://docs.meteor.com/api/tracker.html#Tracker-autorun) that is stopped when the component is destroyed
 * `$subscribe`, a version of [Meteor.subscribe](https://docs.meteor.com/api/pubsub.html#Meteor-subscribe) that is stopped when the template is destroyed
 * `$subscriptionsReady` returns true when all of the subscriptions called with `$subscribe` are ready

**You have to use [Tracker-enabled fork of Vue](https://github.com/meteor-vue/vue) and
[fork of Tracker](https://github.com/meteor-vue/tracker).**
See [these instructions for more information](https://github.com/meteor-vue/guide).

Installation
------------

```
meteor add vuejs:meteor-integration
```
