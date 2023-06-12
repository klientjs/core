import Klient from '..';

test('watch', () => {
  const unclonable = new Klient();
  const { parameters } = new Klient({
    request: {
      headers: {
        'Content-Type': 'application/json'
      }
    },
    arr: [{ prop: true }, unclonable]
  });

  const innerParams = parameters as any;
  const clonedParams = parameters.all() as any;

  expect(JSON.stringify(Object.keys(clonedParams))).toBe(
    JSON.stringify(['url', 'extensions', 'request', 'debug', 'arr'])
  );
  expect(clonedParams.arr === innerParams).toBeFalsy();
  expect(clonedParams.arr[0] === innerParams.arr[0]).toBeFalsy();
  expect(clonedParams.arr[1] === innerParams.arr[1]).toBeTruthy();

  const urlWatchSpy = jest.fn();
  const requestWatchSpy = jest.fn();

  parameters.watch('url', urlWatchSpy);
  // Check duplication
  parameters.watch('url', urlWatchSpy);
  parameters.watch('request.headers.Content-Type', requestWatchSpy);

  parameters.set('url', undefined);
  parameters.set('url', 'http://localhost');

  expect(urlWatchSpy).toBeCalledTimes(1);
  expect(urlWatchSpy).toBeCalledWith('http://localhost', undefined);

  parameters.set('request.headers', {});

  expect(requestWatchSpy).toBeCalledWith(undefined, 'application/json');

  parameters.merge({
    request: {
      headers: {
        'Content-Type': 'application/xml'
      }
    }
  });

  expect(requestWatchSpy).toBeCalledWith('application/xml', undefined);
});

test('unwatch', () => {
  const { parameters } = new Klient();

  const testWatchSpy = jest.fn();

  parameters.unwatch('test', () => undefined);
  parameters.watch('test', testWatchSpy);
  parameters.unwatch('test', testWatchSpy);

  parameters.set('test', true);

  expect(testWatchSpy).not.toBeCalled();
});

test('watch:deep', () => {
  const { parameters } = new Klient({
    example: {
      nested: {
        test: true
      }
    }
  });

  const exampleDeepSpy = jest.fn();
  const exampleSpy = jest.fn();
  const exampleNestedSpy = jest.fn();
  const exampleNestedDeepSpy = jest.fn();
  const exampleNestedTestSpy = jest.fn();

  parameters.watch('example', exampleSpy);
  parameters.watch('example', exampleDeepSpy, true);
  parameters.watch('example.nested', exampleNestedSpy);
  parameters.watch('example.nested', exampleNestedDeepSpy, true);
  parameters.watch('example.nested.test', exampleNestedTestSpy);

  expect(parameters.watchers['example'].length).toBe(2);
  expect(parameters.watchers['example.nested'].length).toBe(2);
  expect(parameters.watchers['example.nested.test'].length).toBe(1);

  parameters.set('example.nested.test', false);

  expect(exampleSpy).not.toBeCalled();
  expect(exampleNestedSpy).not.toBeCalled();

  expect(exampleDeepSpy).toBeCalledWith(
    {
      nested: {
        test: false
      }
    },
    {
      nested: {
        test: true
      }
    }
  );

  expect(exampleNestedDeepSpy).toBeCalledWith({ test: false }, { test: true });
  expect(exampleNestedTestSpy).toBeCalledWith(false, true);
});
