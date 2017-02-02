import { getOwner, setOwner, OWNER, Owner } from '../src/owner';
import { Factory } from '../src/factory';

const { module, test } = QUnit;

module('Owner');

class Application implements Owner {
  identify(specifier: string, referrer?: string): string {}

  factoryFor(specifier: string, referrer?: string): Factory<any> {
    return {
      create(injections?: Object) {
        return {};
      }
    };
  }

  lookup(specifier: string, referrer?: string): any {}
}

test('#getOwner / #setOwner - can get and set the owner of any object', function(assert) {
  let obj = {};
  let owner = new Application();

  assert.strictEqual(getOwner(obj), undefined, 'owner has not yet been set');

  setOwner(obj, owner);

  assert.strictEqual(getOwner(obj), owner, 'owner has been set');
  assert.strictEqual(obj[OWNER], owner, 'owner key has been set');
});
