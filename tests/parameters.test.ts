import Klient from '../src';

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

  klient.parameters.merge({
    name: 'KlientTest',
    customParam: [new Test(), new Test()]
  });

  expect(klient.url).toBe('http://localhost');
  expect(klient.debug).toBe(true);
  expect(klient.parameters.get('request.headers.Content-Type')).toBe('application/json');

  const customParam = klient.parameters.get('customParam');

  expect(customParam).toBeInstanceOf(Array);
  expect(customParam.length).toBe(2);
  expect(customParam[0]).toBeInstanceOf(Test);
  expect(customParam[1]).toBeInstanceOf(Test);

  expect(klient.parameters.all()).toBeInstanceOf(Object);
  expect(klient.parameters.all().name).toBe('KlientTest');
});
