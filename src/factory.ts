import { FactoryDefinition } from './factory-definition';

export interface Factory<T> {
  class: FactoryDefinition<T>;
  create(injections?: Object): T;
}
