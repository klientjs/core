import Klient, { Bag } from '..';

class Test {}

test('constructor', () => {
  let klient = new Klient();

  expect(klient.url).toBe(undefined);
  expect(klient.debug).toBe(false);

  klient = new Klient('http://localhost');

  expect(klient.url).toBe('http://localhost');

  klient = new Klient({
    url: 'http://localhost',
    debug: true,
    request: {
      headers: {
        'Content-Type': 'application/json'
      }
    },
    customParam: [new Test()]
  });

  const { parameters } = klient;

  parameters.merge({
    name: 'KlientTest',
    customParam: [new Test(), new Test()]
  });

  expect(parameters.has('request')).toBe(true);
  expect(parameters.has('request.headers')).toBe(true);
  expect(parameters.has('request.headers.Content-Type')).toBe(true);
  expect(parameters.has('request.headers.Content-type')).toBe(false);
  expect(parameters.has('request.unknown')).toBe(false);

  expect(klient.url).toBe('http://localhost');
  expect(klient.debug).toBe(true);
  expect(parameters.get('request.headers.Content-Type')).toBe('application/json');
  expect(parameters).toBeInstanceOf(Bag);

  const customParam = parameters.get('customParam');

  expect(customParam).toBeInstanceOf(Array);
  expect(customParam.length).toBe(2);
  expect(customParam[0]).toBeInstanceOf(Test);
  expect(customParam[1]).toBeInstanceOf(Test);

  expect(parameters.all()).toBeInstanceOf(Object);
  expect(parameters.all()).not.toBeInstanceOf(Bag);
  expect(parameters.all().name).toBe('KlientTest');
});
