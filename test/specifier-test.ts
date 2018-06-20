import {
  Specifier,
  isSpecifierStringAbsolute,
  isSpecifierObjectAbsolute,
  serializeSpecifier,
  deserializeSpecifier
} from '../src/specifier';

const { module, test } = QUnit;

module('Specifier');

test('#isSpecifierStringAbsolute - determines whether a serialized specifier is absolute', function(assert) {
  assert.equal(isSpecifierStringAbsolute('component:text-editor'), false);
  assert.equal(isSpecifierStringAbsolute('component'), false);
  assert.equal(isSpecifierStringAbsolute('component:/text-editor'), false);
  assert.equal(isSpecifierStringAbsolute('component:/components/text-editor'), false);
  assert.equal(isSpecifierStringAbsolute('component:/app/components/text-editor'), true);
});

test('#isSpecifierObjectAbsolute - determines whether a specifier object is absolute', function(assert) {
  assert.equal(isSpecifierObjectAbsolute({
    name: 'text-editor',
    type: 'component'
  }), false);

  assert.equal(isSpecifierObjectAbsolute({
    type: 'component'
  }), false);

  assert.equal(isSpecifierObjectAbsolute({
    rootName: 'app',
    collection: 'components',
    name: 'text-editor',
    type: 'component'
  }), true);
});

test('#serializeSpecifier - serializes a type-only Specifier', function(assert) {
  let a: Specifier = {
    type: 'component'
  };

  assert.equal(serializeSpecifier(a), 'component');
});

test('#serializeSpecifier - serializes a type:name Specifier', function(assert) {
  let a: Specifier = {
    name: 'slick-input',
    type: 'component'
  };

  assert.equal(serializeSpecifier(a), 'component:slick-input');
});

test('#serializeSpecifier - serializes a type:namespace/name Specifier', function(assert) {
  let a: Specifier = {
    namespace: 'form',
    name: 'slick-input',
    type: 'component'
  };

  assert.equal(serializeSpecifier(a), 'component:form/slick-input');
});

test('#serializeSpecifier - serializes an Specifier object with a namespace', function(assert) {
  let a: Specifier = {
    rootName: 'app',
    collection: 'components',
    namespace: 'form',
    name: 'slick-input',
    type: 'component'
  };

  assert.equal(serializeSpecifier(a), 'component:/app/components/form/slick-input');
});

test('#serializeSpecifier - serializes a Specifier object without a namespace', function(assert) {
  let a: Specifier = {
    rootName: 'app',
    collection: 'components',
    name: 'slick-input',
    type: 'component'
  };

  assert.equal(serializeSpecifier(a), 'component:/app/components/slick-input');
});

test('#serializeSpecifier - serialier a Specificer object with a scoped rootName', function (assert) {
  let a: Specifier = {
    rootName: '@scoped/pkg-name',
    collection: 'components',
    name: 'slick-input',
    type: 'component'
  };

  assert.equal(serializeSpecifier(a), 'component:/@scoped/pkg-name/components/slick-input');
});

test('#deserializeSpecifier - deserializes a type-only specifier string into a Serializer object', function(assert) {
  let a = deserializeSpecifier('instance-initializer');

  assert.deepEqual(a, {
    type: 'instance-initializer'
  });
});

test('#deserializeSpecifier - deserializes a namespaced specifier string into a Serializer object', function(assert) {
  let a = deserializeSpecifier('component:/app/components/form/slick-input');

  assert.deepEqual(a, {
    rootName: 'app',
    collection: 'components',
    namespace: 'form',
    name: 'slick-input',
    type: 'component'
  });
});

test('#deserializeSpecifier - deserializes a multi-part-namespace specifier string into a Serializer object', function(assert) {
  let a = deserializeSpecifier('component:/app/components/slick-ui/form/inputs/slick-input');

  assert.deepEqual(a, {
    rootName: 'app',
    collection: 'components',
    namespace: 'slick-ui/form/inputs',
    name: 'slick-input',
    type: 'component'
  });
});

test('#deserializeSpecifier - deserialiers a scoped rootName specifier string into a Serializer object', function (assert) {
  let a = deserializeSpecifier('component:/@scoped/pkg-name/components/slick-input');
  
  assert.deepEqual(a, {
    rootName: '@scoped/pkg-name',
    collection: 'components',
    name: 'slick-input',
    type: 'component'
  });
});

test('#deserializeSpecifier - deserializes a no-namespace specifier string into a Serializer object', function(assert) {
  let a = deserializeSpecifier('component:/app/components/slick-input');

  assert.deepEqual(a, {
    rootName: 'app',
    collection: 'components',
    name: 'slick-input',
    type: 'component'
  });
});

test('#deserializeSpecifier - deserializes a relative specifier string into a Serializer object', function(assert) {
  let a = deserializeSpecifier('component:slick-input');

  assert.deepEqual(a, {
    name: 'slick-input',
    type: 'component'
  });
});

test('#deserializeSpecifier - deserializes a namespaced relative specifier string into a Serializer object', function(assert) {
  let a = deserializeSpecifier('component:slick-ui/inputs/slick-textarea');

  assert.deepEqual(a, {
    namespace: 'slick-ui/inputs',
    name: 'slick-textarea',
    type: 'component'
  });
});
