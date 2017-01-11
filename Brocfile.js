const build = require('glimmer-build');

module.exports = build({
  testDependencies: [
    'node_modules/glimmer-engine/dist/amd/glimmer-common.amd.js'
  ]
});
