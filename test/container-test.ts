import Registry, { RegistrationOptions } from '../src/registry';
import { Resolver } from '../src/resolver';
import Container from '../src/container';

const { module, test } = QUnit;

module('Container');

test('can be instantiated with a registry', function(assert) {
  let registry = new Registry();
  let container = new Container(registry);
  assert.ok(registry, 'container has been created');
});

test('#factoryFor - returns an object that creates the registered class', function(assert) {
  class Foo {
    static create() { return new this(); }
  }

  let registry = new Registry();
  let container = new Container(registry);

  registry.register('thing:foo', Foo);

  assert.ok(container.factoryFor('thing:foo').create() instanceof Foo, 'expected factory was returned');
});

test('#factoryFor - returns an object that creates the registered class with injections', function(assert) {
  class Foo {
    static create(options: Object) { return new this(options); }
    constructor(options: Object) { Object.assign(this, options); }
  }

  let registry = new Registry();
  let container = new Container(registry);
  let fooInstance;

  registry.register('thing:foo', Foo);
  registry.register('widget:main', 'widget');
  registry.registerInjection('thing', 'widget', 'widget:main');
  registry.registerOption('widget:main', 'instantiate', false);

  fooInstance = container.factoryFor('thing:foo').create();

  assert.equal(fooInstance.widget, 'widget', 'dependencies are injected');
});

test('#factoryFor - returns an object that creates the registered class with injections from fallback registry', function(assert) {
  class Foo {
    static create(options: Object) { return new this(options); }
    constructor(options: Object) { Object.assign(this, options); }
  }

  let baseRegistry = new Registry();
  let chainedRegistry = new Registry({ fallback: baseRegistry });
  let container = new Container(chainedRegistry);
  let fooInstance;

  chainedRegistry.register('thing:foo', Foo);
  baseRegistry.register('widget:main', 'widget');
  baseRegistry.registerInjection('thing', 'widget', 'widget:main');
  baseRegistry.registerOption('widget:main', 'instantiate', false);

  fooInstance = container.factoryFor('thing:foo').create();

  assert.equal(fooInstance.widget, 'widget', 'dependencies are injected');
});

test('#factoryFor - returns undefined when factory is not registered or resolved', function(assert) {
  assert.expect(1);

  let registry = new Registry();
  let container = new Container(registry);

  let foobar = container.factoryFor('foo:bar');
  assert.strictEqual(foobar, undefined, 'factory is undefined');
});

test('#factoryFor - returns an object that creates the registered class with give properties', function(assert) {
  class Foo {
    static create(options: Object) { return new this(options); }
    constructor(options: Object) { Object.assign(this, options); }
  }

  let registry = new Registry();
  let container = new Container(registry);
  let fooInstance;

  registry.register('thing:foo', Foo);

  fooInstance = container.factoryFor('thing:foo').create({ bar: 'bar' });

  assert.equal(fooInstance.bar, 'bar', 'properties are assigned');
});

test('#factoryFor - merges given properties with injections', function(assert) {
  class Foo {
    static create(options: Object) { return new this(options); }
    constructor(options: Object) { Object.assign(this, options); }
  }

  let registry = new Registry();
  let container = new Container(registry);
  let fooInstance;

  registry.register('thing:foo', Foo);
  registry.register('widget:main', 'widget');
  registry.registerInjection('thing', 'widget', 'widget:main');
  registry.registerOption('widget:main', 'instantiate', false);

  fooInstance = container.factoryFor('thing:foo').create({ bar: 'bar' });

  assert.equal(fooInstance.widget, 'widget', 'dependencies are injected');
  assert.equal(fooInstance.bar, 'bar', 'properties are assigned');
});

test('#factoryFor - will use a resolver to locate a factory', function(assert) {
  assert.expect(2);

  class Foo {
    static create() { return new this(); }
  }

  class FakeResolver implements Resolver {
    identify(fullName: string, referrer: string): string {
      assert.ok(false, 'should not be invoked');
      return '';
    }
    retrieve(specifier: string): any {
      assert.equal(specifier, 'foo:bar', 'FakeResolver#identify was invoked');
      return Foo;
    }
  }

  let resolver = new FakeResolver();
  let registry = new Registry();
  let container = new Container(registry, resolver);
  assert.strictEqual(container.factoryFor('foo:bar').class, Foo, 'expected factory was returned');
});

test('#factoryFor - will use a resolver to locate a factory, even if one is registered locally', function(assert) {
  assert.expect(2);

  class Foo {
    static create() { return new this(); }
  }

  class FooBar {
    static create() { return new this(); }
  }

  class FakeResolver implements Resolver {
    identify(fullName: string, referrer: string): string {
      assert.ok(false, 'should not be invoked');
      return '';
    }
    retrieve(specifier: string): any {
      assert.equal(specifier, 'foo:bar', 'FakeResolver#retrieve was invoked');
      return FooBar;
    }
  }

  let resolver = new FakeResolver();
  let registry = new Registry();
  let container = new Container(registry, resolver);

  registry.register('foo:bar', Foo);

  assert.strictEqual(container.factoryFor('foo:bar').class, FooBar, 'factory from resolver was returned');
});

test('#lookup - returns an instance created by the factory with a set of default injections', function(assert) {
  assert.expect(3);

  let instance = { foo: 'bar' };

  class Foo {
    static create(injections) {
      assert.ok(true, 'Factory#create invoked');
      assert.equal(injections.owner, 'fake', 'default injections are included');
      return instance;
    }
  }

  let registry = new Registry();
  let container = new Container(registry);
  container.defaultInjections = function(specifier: string): Object {
    return { owner: 'fake' }; // note: `setOwner()` should actually be used here
  }

  registry.register('foo:bar', Foo);
  let foobar = container.lookup('foo:bar');
  assert.strictEqual(foobar, instance, 'instance created');
});

test('#lookup - returns undefined when factory is not registered or resolved', function(assert) {
  assert.expect(1);

  let registry = new Registry();
  let container = new Container(registry);

  let foobar = container.lookup('foo:bar');
  assert.strictEqual(foobar, undefined, 'instance is undefined');
});

test('#lookup - caches looked up instances by default', function(assert) {
  assert.expect(3);

  let createCounter = 0;

  class Foo {
    static create(): Foo {
      createCounter++;
      return new Foo();
    }
  }

  let registry = new Registry();
  let container = new Container(registry);

  registry.register('foo:bar', Foo);
  let foo1 = container.lookup('foo:bar');
  assert.equal(createCounter, 1);
  let foo2 = container.lookup('foo:bar');
  assert.equal(createCounter, 1);
  assert.strictEqual(foo1, foo2);
});

test('#lookup - will not cache lookups specified as non-singletons', function(assert) {
  assert.expect(3);

  let createCounter = 0;

  class Foo {
    static create(): Foo {
      createCounter++;
      return new Foo();
    }
  }

  let registry = new Registry();
  let container = new Container(registry);

  registry.register('foo:bar', Foo, { singleton: false });
  let foo1 = container.lookup('foo:bar');
  assert.equal(createCounter, 1);
  let foo2 = container.lookup('foo:bar');
  assert.equal(createCounter, 2);
  assert.notStrictEqual(foo1, foo2);
});

test('#lookup - returns the factory when registrations specify instantiate: false', function(assert) {
  assert.expect(1);

  let createCounter = 0;

  let factory = {};

  let registry = new Registry();
  let container = new Container(registry);

  registry.register('foo:bar', factory, { instantiate: false });
  let foo1 = container.lookup('foo:bar');
  assert.strictEqual(foo1, factory);
});

test('#lookup - uses the resolver to locate a registration', function(assert) {
  assert.expect(2);

  class Foo {
    static create() { return { foo: 'bar' }; }
  }

  class FakeResolver implements Resolver {
    identify(fullName: string, referrer: string): string {
      assert.ok(false, 'should not be invoked');
      return '';
    }
    retrieve(specifier: string): any {
      assert.equal(specifier, 'foo:bar', 'FakeResolver#retrieve was invoked');
      return Foo;
    }
  }

  let resolver = new FakeResolver();
  let registry = new Registry();
  let container = new Container(registry, resolver);

  let foo1 = container.lookup('foo:bar');

  assert.deepEqual(foo1, { foo: 'bar' }, 'expected factory was invoked');
});

test('#lookup - injects references registered by name', function(assert) {
  assert.expect(5);

  let instance = { foo: 'bar' };
  let router = { name: 'router' };

  class Foo {
    static create(injections) {
      assert.ok(true, 'FooFactory#create invoked');
      assert.strictEqual(injections['router'], router, 'expected injections passed to factory');
      instance['router'] = injections['router'];
      return instance;
    }
  }

  class Router {
    static create() {
      assert.ok(true, 'RouterFactory#create invoked');
      return router;
    }
  }

  let registry = new Registry();
  let container = new Container(registry);
  registry.register('foo:bar', Foo);
  registry.register('router:main', Router);
  registry.registerInjection('foo:bar', 'router', 'router:main');
  assert.strictEqual(container.lookup('foo:bar'), instance, 'instance returned');
  assert.strictEqual(instance['router'], router, 'injection has been applied to instance');
});

test('#lookup - injects references registered by type', function(assert) {
  assert.expect(5);

  let instance = { foo: 'bar' };
  let router = { name: 'router' };

  class Foo {
    static create(injections) {
      assert.ok(true, 'FooFactory#create invoked');
      assert.strictEqual(injections['router'], router, 'expected injections passed to factory');
      instance['router'] = injections['router'];
      return instance;
    }
  }

  class Router {
    static create() {
      assert.ok(true, 'RouterFactory#create invoked');
      return router;
    }
  }

  let registry = new Registry();
  let container = new Container(registry);
  registry.register('foo:bar', Foo);
  registry.register('router:main', Router);
  registry.registerInjection('foo', 'router', 'router:main');
  assert.strictEqual(container.lookup('foo:bar'), instance, 'instance returned');
  assert.strictEqual(instance['router'], router, 'injection has been applied to instance');
});
