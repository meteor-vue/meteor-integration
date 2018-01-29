#!/bin/bash -e

rm -rf /tmp/vue-meteor-integration-tests
mkdir -p /tmp/vue-meteor-integration-tests

cat >/tmp/vue-meteor-integration-tests/package.json <<EOF
{
  "name": "vue-meteor-integration-tests",
  "private": true,
  "scripts": {
    "start": "meteor run"
  },
  "dependencies": {
    "babel-runtime": "^6.26.0",
    "bcrypt": "^1.0.3",
    "core-js": "^2.5.3",
    "meteor-node-stubs": "^0.2.11",
    "vue": "git://github.com/meteor-vue/vue.git#meteor"
  },
  "meteor": {
    "vueVersion": 2
  }
}
EOF

git clone https://github.com/meteor-vue/tracker.git /tmp/vue-meteor-integration-tests/packages/tracker

meteor test-packages --release 1.6.0.1 --show-test-app-path --test-app-path /tmp/vue-meteor-integration-tests ./
