import 'jest-extended';

import { mockAxiosWithRestApi } from '@klient/testing';

import Klient, { Extensions } from '..';

jest.mock('axios');

mockAxiosWithRestApi();

interface KlientExtended extends Klient {
  writable: string;
  readonly unwritable: boolean;
}

test('extension:load', () => {
  Extensions.push({
    name: '@klient/test',
    initialize: (klient) => {
      klient.services.set('test', {
        run() {
          return true;
        }
      });

      klient.parameters.set('test', true);

      klient.extends('writable', 'something', true);
      klient.extends('unwritable', true);
    }
  });

  const klient = new Klient() as KlientExtended;

  expect(klient.extensions.includes('@klient/test')).toBe(true);
  expect(klient.services.get('test')).toBeDefined();
  expect(klient.parameters.get('test')).toBe(true);
  expect(klient.writable).toBe('something');

  klient.writable = 'else';
  expect(klient.writable).toBe('else');

  try {
    // eslint-disable-next-line
    (klient as any).unwritable = false;
    // Force to go in catch block
    throw new Error('Property is writable');
  } catch (e) {
    expect((e as Error).message).toBe("Cannot assign to read only property 'unwritable' of object '#<Klient>'");
  }

  const emptyKlient = new Klient({ extensions: [] });

  expect(emptyKlient.extensions.includes('@klient/test')).toBe(false);
  expect(emptyKlient.services.get('test')).toBeUndefined();

  emptyKlient.load(['@klient/test']);

  expect(emptyKlient.extensions.includes('@klient/test')).toBe(true);
  expect(emptyKlient.services.get('test')).toBeDefined();
});
