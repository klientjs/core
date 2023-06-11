import { mockAxiosWithRestApi } from '@klient/testing';

import Klient, { DebugEvent } from '..';

jest.mock('axios');

mockAxiosWithRestApi();

test('debug', async () => {
  const klient = new Klient({ debug: true });

  const spyRequestEvent = jest.fn();
  const spyRequest2Event = jest.fn();
  const spyStartDispatchEvent = jest.fn();
  const spySkippedEvent = jest.fn();
  const spyInvokingEvent = jest.fn();
  const spyInvokedEvent = jest.fn();
  const spyDispatchStoppedEvent = jest.fn();
  const spyDispatchFailedEvent = jest.fn();
  const spyDispatchEndEvent = jest.fn();

  klient.on('debug', (e: DebugEvent) => {
    switch (e.action) {
      case 'start':
        spyStartDispatchEvent();
        break;
      case 'invoking':
        spyInvokingEvent();
        break;
      case 'invoked':
        spyInvokedEvent();
        break;
      case 'stopped':
        spyDispatchStoppedEvent();
        break;
      case 'skipped':
        spySkippedEvent();
        break;
      case 'failed':
        spyDispatchFailedEvent();
        break;
      case 'end':
        spyDispatchEndEvent();
        break;
    }
  });

  klient.on('request', (e) => {
    spyRequestEvent();
    e.skipNextListeners(1);
  });

  klient.on('request', () => {
    return;
  });

  klient.on('request', spyRequest2Event);

  await klient
    .request('/posts')
    .then(() => {
      expect(spyRequestEvent).toBeCalledTimes(1);
      expect(spyStartDispatchEvent).toBeCalledTimes(3);
      expect(spyInvokingEvent).toBeCalledTimes(2);
      expect(spyInvokedEvent).toBeCalledTimes(2);
      expect(spyDispatchEndEvent).toBeCalledTimes(3);
      expect(spyDispatchFailedEvent).toBeCalledTimes(0);
      expect(spyDispatchStoppedEvent).toBeCalledTimes(0);
    })
    .catch((e) => {
      console.log(e);
      throw e;
    });

  klient.on('request', (e) => {
    e.stopPropagation();
  });

  await klient
    .request('/posts')
    .then(() => {
      expect(spyDispatchStoppedEvent).toBeCalledTimes(1);
    })
    .catch((e) => {
      console.log(e);
      throw e;
    });

  klient.on(
    'request',
    () => {
      throw new Error();
    },
    1
  );

  await klient
    .request('/posts')
    .then(() => {
      throw new Error('This request must failed');
    })
    .catch(() => {
      expect(spyDispatchFailedEvent).toBeCalledTimes(1);
    });
});
