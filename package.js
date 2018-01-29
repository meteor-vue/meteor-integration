Package.describe({
  name: 'vuejs:meteor-integration',
  version: '0.1.5',
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
