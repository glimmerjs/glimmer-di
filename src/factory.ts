export interface Factory<T> {
  create(injections?: Object): T;
}
