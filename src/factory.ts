export interface FactoryDefinition<T> {
  create(injections?: object): T;
  teardown?(instance: object): void;
}

export interface Factory<T> {
  class: FactoryDefinition<T>;
  create(injections?: object): T;
  teardown(instance: any): void;
}
