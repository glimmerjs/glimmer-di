export interface FactoryDefinition<T> {
  create(injections?: Object): T;
  teardown?(instance: Object): void;
}

export interface Factory<T> {
  class: FactoryDefinition<T>;
  create(injections?: Object): T;
  teardown(instance: any): void;
}
