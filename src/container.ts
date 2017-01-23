import { Factory } from './factory';
import Registry, { Injection } from './registry';
import { Resolver } from './resolver';
import { dict, Dict } from '@glimmer/util';

export default class Container {
  private _registry: Registry;
  private _resolver: Resolver;
  private _lookups: Dict<any>;
  private _factoryLookups: Dict<any>;

  constructor(registry: Registry, resolver: Resolver = null) {
    this._registry = registry;
    this._resolver = resolver;
    this._lookups = dict<any>();
    this._factoryLookups = dict<any>();
  }

  factoryFor(specifier: string): Factory<any> {
    let factory = this._factoryLookups[specifier];

    if (!factory) {
      if (this._resolver) {
        factory = this._resolver.retrieve(specifier);
      }

      if (!factory) {
        factory = this._registry.registration(specifier);
      }

      if (factory) {
        this._factoryLookups[specifier] = factory;
      }
    }

    return factory;
  }

  lookup(specifier: string): any {
    let singleton = (this._registry.registeredOption(specifier, 'singleton') !== false);

    if (singleton && this._lookups[specifier]) {
      return this._lookups[specifier];
    }

    let factory = this.factoryFor(specifier);
    if (!factory) { return; }

    if (this._registry.registeredOption(specifier, 'instantiate') === false) {
      return factory;
    }

    let injections = this.buildInjections(specifier);

    let object = factory.create(injections);

    if (singleton && object) {
      this._lookups[specifier] = object;
    }

    return object;
  }

  defaultInjections(specifier: string): Object {
    return {};
  }

  buildInjections(specifier: string): Object {
    let hash = this.defaultInjections(specifier);
    let injections: Injection[] = this._registry.registeredInjections(specifier);
    let injection: Injection;

    for (let i = 0; i < injections.length; i++) {
      injection = injections[i];
      hash[injection.property] = this.lookup(injection.source);
    }

    return hash;
  }
}
