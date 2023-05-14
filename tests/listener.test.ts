import 'jest-extended';

import { mockAxiosWithRestApi } from '@klient/testing';

import Klient from '../src';

jest.mock('axios');

mockAxiosWithRestApi();

test('listener:on', async () => {
  const klient = new Klient();

  const spyRequestEvent = jest.fn();

  klient.on('request', spyRequestEvent);
  // Check duplication
  klient.dispatcher.on('request', spyRequestEvent);

  await klient.request('/posts');

  expect(spyRequestEvent).toBeCalledTimes(1);

  await klient.request('/posts');

  expect(spyRequestEvent).toBeCalledTimes(2);
});

test('listener:once', async () => {
  const klient = new Klient();

  const spyRequestEvent = jest.fn();
  const spyRequestEvent2 = jest.fn();
  const spyRequestEvent3 = jest.fn();
  const spyRequestEventHigherPriority = jest.fn();

  klient.on('request', spyRequestEvent2, 0, true);
  klient.once('request', spyRequestEvent);
  klient.once('request', spyRequestEventHigherPriority, 2);
  klient.dispatcher.once('request', spyRequestEvent3);

  await klient.request('/posts');

  expect(spyRequestEvent).toBeCalledTimes(1);
  expect(spyRequestEvent2).toBeCalledTimes(1);
  expect(spyRequestEvent3).toBeCalledTimes(1);
  expect(spyRequestEventHigherPriority).toBeCalledTimes(1);

  expect(spyRequestEventHigherPriority).toHaveBeenCalledBefore(spyRequestEvent, false);
  expect(spyRequestEvent2).toHaveBeenCalledBefore(spyRequestEvent, false);

  await klient.request('/posts');

  expect(spyRequestEvent).toBeCalledTimes(1);
  expect(spyRequestEvent2).toBeCalledTimes(1);
  expect(spyRequestEvent3).toBeCalledTimes(1);
  expect(spyRequestEventHigherPriority).toBeCalledTimes(1);
});

test('listener:off', async () => {
  const klient = new Klient();

  const spyRequestEvent = jest.fn();

  klient.on('request', spyRequestEvent);
  klient.off('request', spyRequestEvent);
  klient.off('undefined', jest.fn());

  await klient.request('/posts');

  expect(spyRequestEvent).toBeCalledTimes(0);
});

test('listener:priority', async () => {
  const klient = new Klient();

  const spyRequestEvent = jest.fn();
  const spyRequestEventAfterFirst = jest.fn();
  const spyRequestEventHigherPriority = jest.fn();

  klient.on('request', spyRequestEvent);
  klient.on('request', spyRequestEventAfterFirst);
  klient.on('request', spyRequestEventHigherPriority, 2);

  await klient.request('/posts');

  expect(spyRequestEvent).toBeCalledTimes(1);
  expect(spyRequestEventAfterFirst).toBeCalledTimes(1);
  expect(spyRequestEventHigherPriority).toBeCalledTimes(1);
  expect(spyRequestEvent).toHaveBeenCalledBefore(spyRequestEventAfterFirst, false);
  expect(spyRequestEventHigherPriority).toHaveBeenCalledBefore(spyRequestEvent, false);
});

test('listener:skip:stop-propagation', async () => {
  const klient = new Klient();

  const spyRequestEvent = jest.fn();
  const spyRequestEventSkipped = jest.fn();
  const spyAfterRequestEventSkipped = jest.fn();
  const spyLastRequestEvent = jest.fn();

  klient.on('request', (e) => {
    spyRequestEvent();
    e.stopPropagation();
  });

  klient.on('request', spyRequestEventSkipped);
  klient.on('request', spyAfterRequestEventSkipped);
  klient.on('request', spyLastRequestEvent);

  await klient.request('/posts');

  expect(spyRequestEvent).toBeCalledTimes(1);
  expect(spyRequestEventSkipped).toBeCalledTimes(0);
  expect(spyAfterRequestEventSkipped).toBeCalledTimes(0);
  expect(spyLastRequestEvent).toBeCalledTimes(0);
});

test('listener:skip:goto', async () => {
  const klient = new Klient();

  const spyRequestEvent = jest.fn();
  const spyRequestEventSkipped = jest.fn();
  const spyOtherRequestEventSkipped = jest.fn();
  const spyLastRequestEvent = jest.fn();

  klient.on('request', (e) => {
    spyRequestEvent();
    e.skipUntilListener(3);
  });

  klient.on('request', spyRequestEventSkipped);
  klient.on('request', spyOtherRequestEventSkipped);
  klient.on('request', spyLastRequestEvent);

  await klient.request('/posts');

  expect(spyRequestEvent).toBeCalledTimes(1);
  expect(spyRequestEventSkipped).toBeCalledTimes(0);
  expect(spyOtherRequestEventSkipped).toBeCalledTimes(0);
  expect(spyLastRequestEvent).toBeCalledTimes(1);
});

test('listener:skip:next-listeners', async () => {
  const klient = new Klient();

  const spyRequestEvent = jest.fn();
  const spyRequestEventSkipped = jest.fn();
  const spyOtherRequestEventSkipped = jest.fn();
  const spyLastRequestEvent = jest.fn();

  klient.on('request', (e) => {
    spyRequestEvent();
    e.skipNextListeners(2);
  });

  klient.on('request', spyRequestEventSkipped);
  klient.on('request', spyOtherRequestEventSkipped);
  klient.on('request', spyLastRequestEvent);

  await klient.request('/posts');

  expect(spyRequestEvent).toBeCalledTimes(1);
  expect(spyRequestEventSkipped).toBeCalledTimes(0);
  expect(spyOtherRequestEventSkipped).toBeCalledTimes(0);
  expect(spyLastRequestEvent).toBeCalledTimes(1);
});
