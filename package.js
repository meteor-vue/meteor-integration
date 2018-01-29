Package.describe({
  name: 'vuejs:meteor-integration',
  version: '0.1.4',
  summary: "Vue integration with Meteor."
});

Package.onUse(function(api) {
  api.versionsFrom('METEOR@1.4.4.5');

  // Core dependencies.
  api.use([
    'check',
    'ecmascript',
    'meteor',
    'minimongo',
    'tracker'
  ]);

  api.mainModule('main.js', 'client');
});

Package.onTest(function (api) {
  api.versionsFrom('METEOR@1.4.4.5');

  // Core dependencies.
  api.use([
    'ecmascript'
  ]);

  // Internal dependencies.
  api.use([
    'vuejs:meteor-integration'
  ]);

  // 3rd party dependencies.
  api.use([
    'akryum:vue-component',
    'peerlibrary:classy-test@0.3.0'
  ]);

  api.addFiles([
    'test-child.vue',
    'test-parent.vue',
    'tests.js'
  ], 'client');
});
