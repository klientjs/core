import { AxiosError } from 'axios';
import { mockAxiosWithRestApi } from '@klient/testing';

import Klient, {
  Request,
  RequestEvent,
  RequestSuccessEvent,
  RequestCancelEvent,
  RequestErrorEvent,
  RequestDoneEvent
} from '../src';

jest.mock('axios');

mockAxiosWithRestApi();

test('event:request', () => {
  const klient = new Klient();
  const config = {
    url: '/posts',
    context: { test: true }
  };

  const spyRequestEvent = jest.fn();

  klient.on('request', (e: RequestEvent) => {
    spyRequestEvent(e.context.action, e.config.url, e.context.test, e.request);
  });

  return klient
    .request(config)
    .then(() => {
      expect(spyRequestEvent).toBeCalledWith('request', config.url, true, expect.any(Request));
    })
    .catch((e) => {
      console.log(e);
      throw e;
    });
});

test('event:request:success', () => {
  const klient = new Klient();

  const spyRequestSuccessEvent = jest.fn();

  klient.on('request:success', (e: RequestSuccessEvent) => {
    spyRequestSuccessEvent(e.relatedEvent, e.response, e.data);
  });

  return klient
    .request('/posts')
    .then(() => {
      expect(spyRequestSuccessEvent).toBeCalledWith(
        expect.any(RequestEvent),
        expect.objectContaining({ status: 200, data: expect.any(Array) }),
        expect.any(Array)
      );
    })
    .catch((e) => {
      console.log(e);
      throw e;
    });
});

test('event:request:error', () => {
  const klient = new Klient();

  const spyRequestErrorEvent = jest.fn();

  klient.on('request:error', (e: RequestErrorEvent) => {
    spyRequestErrorEvent(e.relatedEvent, e.error, e.response, e.data);
  });

  return klient
    .request('/notfound')
    .then(() => {
      throw new Error('This request must failed');
    })
    .catch(() => {
      expect(spyRequestErrorEvent).toBeCalledWith(
        expect.any(RequestEvent),
        expect.any(AxiosError),
        expect.objectContaining({
          status: 404,
          data: expect.any(Object)
        }),
        expect.objectContaining({
          error: expect.any(String)
        })
      );
    });
});

test('event:request:done', async () => {
  const klient = new Klient();

  const spyRequestDoneEvent = jest.fn();

  klient.on('request:done', (e: RequestDoneEvent) => {
    spyRequestDoneEvent(e.relatedEvent, e.success, e.result, e.data);
  });

  await klient
    .request('/notfound')
    .then(() => {
      throw new Error('This request must failed');
    })
    .catch(() => {
      expect(spyRequestDoneEvent).toBeCalledWith(
        expect.any(RequestErrorEvent),
        false,
        expect.any(AxiosError),
        expect.objectContaining({
          error: expect.any(String)
        })
      );
    });

  await klient
    .request('/posts')
    .then(() => {
      expect(spyRequestDoneEvent).toHaveBeenLastCalledWith(
        expect.any(RequestSuccessEvent),
        true,
        expect.objectContaining({ status: 200, data: expect.any(Array) }),
        expect.any(Array)
      );
    })
    .catch((e) => {
      console.log(e);
      throw e;
    });
});

test('event:request:cancel', async () => {
  const klient = new Klient();

  const spyRequestCancelEvent = jest.fn();

  klient.on('request', (e: RequestEvent) => {
    e.request.cancel();
  });

  klient.on('request:cancel', (e: RequestCancelEvent) => {
    spyRequestCancelEvent(e.relatedEvent);
  });

  await klient
    .request('/posts')
    .then(() => {
      throw new Error('This request must failed');
    })
    .catch(() => {
      expect(spyRequestCancelEvent).toHaveBeenCalledWith(expect.any(RequestEvent));
    });
});
