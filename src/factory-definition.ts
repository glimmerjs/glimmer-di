export interface FactoryDefinition<T> {
  create(injections?: Object): T;
}
