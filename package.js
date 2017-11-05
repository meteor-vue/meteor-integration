Package.describe({
  name: 'vuejs:meteor-integration',
  version: '0.1.2',
  summary: "Vue integration with Meteor."
});

Package.onUse(function(api) {
  api.versionsFrom('1.4.1');

  api.use([
    'check',
    'ecmascript',
    'meteor',
    'minimongo',
    'tracker'
  ]);

  api.mainModule('main.js', 'client');
});
