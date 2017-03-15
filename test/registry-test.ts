import { default as Registry, RegistrationOptions } from '../src/registry';

const { module, test } = QUnit;

module('Registry');

test('can be instantiated', function(assert) {
  let registry = new Registry();
  assert.ok(registry, 'registry has been created');
});

test('#register - registers a factory', function(assert) {
  class Foo {
    static create() { return { foo: 'bar' }; }
  }

  let registry = new Registry();

  assert.strictEqual(registry.registration('foo:bar'), undefined, 'factory has not yet been registered');
  registry.register('foo:bar', Foo);
  assert.strictEqual(registry.registration('foo:bar'), Foo, 'factory has been registered');
});

test('#register - can register options together with a factory', function(assert) {
  class Foo {
    static create() { return { foo: 'bar' }; }
  }

  let registry = new Registry();

  assert.strictEqual(registry.registration('foo:bar'), undefined, 'factory has not yet been registered');
  registry.register('foo:bar', Foo, { instantiate: false });
  assert.strictEqual(registry.registration('foo:bar'), Foo, 'factory has been registered');
  assert.deepEqual(registry.registeredOptions('foo:bar'), { instantiate: false }, 'options have been registered');
});

test('#registration - returns a factory has been registered', function(assert) {
  class Foo {
    static create() { return { foo: 'bar' }; }
  }

  let registry = new Registry();

  assert.strictEqual(registry.registration('foo:bar'), undefined, 'factory has not yet been registered');
  registry.register('foo:bar', Foo);
  assert.strictEqual(registry.registration('foo:bar'), Foo, 'factory has been registered');
});

test('#registration - returns a factory has been registered in a fallback', function(assert) {
  class Foo {
    static create() { return { foo: 'bar' }; }
  }

  let fallbackRegistry = new Registry();
  let registry = new Registry({fallback: fallbackRegistry});

  assert.strictEqual(registry.registration('foo:bar'), undefined, 'factory has not yet been registered');
  fallbackRegistry.register('foo:bar', Foo);
  assert.strictEqual(registry.registration('foo:bar'), Foo, 'factory has been registered');
});

test('#unregister - unregisters a factory', function(assert) {
  class Foo {
    static create() { return { foo: 'bar' }; }
  }

  let registry = new Registry();

  registry.register('foo:bar', Foo);
  assert.strictEqual(registry.registration('foo:bar'), Foo, 'factory has been registered');
  registry.unregister('foo:bar');
  assert.strictEqual(registry.registration('foo:bar'), undefined, 'factory been unregistered');
});

test('#registerOption, #registeredOptions, #registeredOption, #unregisterOption', function(assert) {
  class Foo {
    static create() { return { foo: 'bar' }; }
  }

  let registry = new Registry();

  registry.register('foo:bar', Foo);
  assert.strictEqual(registry.registeredOptions('foo:bar'), undefined);
  assert.strictEqual(registry.registeredOption('foo:bar', 'singleton'), undefined);

  registry.registerOption('foo:bar', 'singleton', true);
  assert.deepEqual(registry.registeredOptions('foo:bar'), {singleton: true});
  assert.strictEqual(registry.registeredOption('foo:bar', 'singleton'), true);

  registry.unregisterOption('foo:bar', 'singleton');
  assert.deepEqual(registry.registeredOptions('foo:bar'), {});
  assert.strictEqual(registry.registeredOption('foo:bar', 'singleton'), undefined);
});

test('#registeredOption fallback', function(assert) {
  let baseRegistry = new Registry();
  let chainedRegistry = new Registry({fallback: baseRegistry});

  assert.strictEqual(chainedRegistry.registeredOption('foo:bar', 'singleton'), undefined);

  baseRegistry.registerOption('foo:bar', 'singleton', true);
  assert.strictEqual(chainedRegistry.registeredOption('foo:bar', 'singleton'), true);

  chainedRegistry.registerOption('foo:bar', 'singleton', false);
  assert.strictEqual(chainedRegistry.registeredOption('foo:bar', 'singleton'), false);

  chainedRegistry.unregisterOption('foo:bar', 'singleton');
  assert.strictEqual(chainedRegistry.registeredOption('foo:bar', 'singleton'), true);

  baseRegistry.unregisterOption('foo:bar', 'singleton');
  assert.strictEqual(chainedRegistry.registeredOption('foo:bar', 'singleton'), undefined);
});

test('Options registered by full name supercede those registered by type', function(assert) {
  class Foo {
    static create() { return { foo: 'bar' }; }
  }

  let registry = new Registry();

  registry.register('foo:bar', Foo);

  registry.registerOption('foo', 'singleton', false);
  assert.strictEqual(registry.registeredOption('foo:bar', 'singleton'), false);
  registry.registerOption('foo:bar', 'singleton', true);
  assert.strictEqual(registry.registeredOption('foo:bar', 'singleton'), true);
});

test('Options registered by type on chained registry supercede those by type on the base', function(assert) {
  let baseRegistry = new Registry();
  let chainedRegistry = new Registry({fallback: baseRegistry});

  baseRegistry.registerOption('foo:bar', 'singleton', true);
  chainedRegistry.registerOption('foo', 'singleton', false);

  assert.strictEqual(chainedRegistry.registeredOption('foo:bar', 'singleton'), false);
});
