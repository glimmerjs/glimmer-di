import { dict, Dict } from 'glimmer-util';
import { Factory } from './factory';

export interface RegistrationOptions {
  singleton?: boolean;
  instantiate?: boolean;
}

export interface Injection {
  property: string,
  source: string
}

export default class Registry {
  private _registrations: Dict<Factory<any>>;
  private _registeredOptions: Dict<any>;
  private _registeredInjections: Dict<Injection[]>;

  constructor() {
    this._registrations = dict<any>();
    this._registeredOptions = dict<any>();
    this._registeredInjections = dict<Injection[]>();
  }

  register(specifier: string, factory: any, options?: RegistrationOptions): void {
    this._registrations[specifier] = factory;
    if (options) {
      this._registeredOptions[specifier] = options;
    }
  }

  registration(specifier: string): any {
    return this._registrations[specifier];
  }

  unregister(specifier: string): void {
    delete this._registrations[specifier];
    delete this._registeredOptions[specifier];
    delete this._registeredInjections[specifier];
  }

  registerOption(specifier: string, option: string, value: any): void {
    let options = this._registeredOptions[specifier];

    if (!options) {
      options = {};
      this._registeredOptions[specifier] = options;
    }

    options[option] = value;
  }

  registeredOption(specifier: string, option: string): any {
    let options = this.registeredOptions(specifier);

    if (options) {
      return options[option];
    }
  }

  registeredOptions(specifier: string): any {
    let options = this._registeredOptions[specifier];
    if (options === undefined) {
      let [type] = specifier.split(':');
      options = this._registeredOptions[type];
    }
    return options;
  }

  unregisterOption(specifier: string, option: string): void {
    let options = this._registeredOptions[specifier];

    if (options) {
      delete options[option];
    }
  }

  registerInjection(specifier: string, property: string, source: string): void {
    let injections = this._registeredInjections[specifier];
    if (injections === undefined) {
      this._registeredInjections[specifier] = injections = [];
    }
    injections.push({
      property,
      source
    });
  }

  registeredInjections(specifier: string): Injection[] {
    let [type] = specifier.split(':');
    let injections: Injection[] = [];
    Array.prototype.push.apply(injections, this._registeredInjections[type]);
    Array.prototype.push.apply(injections, this._registeredInjections[specifier]);
    return injections;
  }  
}
