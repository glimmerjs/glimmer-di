const build = require('@glimmer/build');
const path = require('path');

const glimmerEnginePath = path.dirname(require.resolve('glimmer-engine/package'));

module.exports = build({
  testDependencies: [
    path.join(glimmerEnginePath, 'dist/amd/glimmer-common.amd.js')
  ]
});
