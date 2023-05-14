/**
 * @jest-environment jsdom
 */

import { AxiosError } from 'axios';
import { mockAxiosWithRestApi } from '@klient/testing';
import Klient, { RequestEvent, RequestErrorEvent } from '../src';

jest.mock('axios');

mockAxiosWithRestApi();

test('factory', () => {
  const { factory } = new Klient();

  const request = factory.createRequest('/posts');

  factory.createRequest('/example');
  factory.createRequest('/other');

  expect(factory.requests.length).toBe(3);

  return request.execute().then(() => {
    expect(factory.requests.length).toBe(2);
  });
});

test('request:success', async () => {
  const klient = new Klient();

  const spyRequestEvent = jest.fn();
  const spyRequestSuccessEvent = jest.fn();
  const spyRequestErrorEvent = jest.fn();
  const spyRequestDoneEvent = jest.fn();

  klient.on('request', spyRequestEvent);
  klient.on('request:success', spyRequestSuccessEvent);
  klient.on('request:error', spyRequestErrorEvent);
  klient.on('request:done', spyRequestDoneEvent);

  await klient.request('/posts');

  expect(spyRequestEvent).toBeCalledTimes(1);
  expect(spyRequestSuccessEvent).toBeCalledTimes(1);
  expect(spyRequestErrorEvent).toBeCalledTimes(0);
  expect(spyRequestDoneEvent).toBeCalledTimes(1);
});

test('request:error', () => {
  const klient = new Klient();

  const spyRequestEvent = jest.fn();
  const spyRequestSuccessEvent = jest.fn();
  const spyRequestErrorEvent = jest.fn();
  const spyRequestDoneEvent = jest.fn();

  klient.on('request', spyRequestEvent);
  klient.on('request:success', spyRequestSuccessEvent);
  klient.on('request:error', spyRequestErrorEvent);
  klient.on('request:done', spyRequestDoneEvent);

  return klient
    .request('/notfound')
    .then(() => {
      throw new Error('This request must failed');
    })
    .catch(() => {
      expect(spyRequestEvent).toBeCalledTimes(1);
      expect(spyRequestSuccessEvent).toBeCalledTimes(0);
      expect(spyRequestErrorEvent).toBeCalledTimes(1);
      expect(spyRequestDoneEvent).toBeCalledTimes(1);
    });
});

test('request:failure', async () => {
  let klient = new Klient();

  klient.on('request', () => {
    throw new Error('Aborted');
  });

  await klient
    .request('/posts')
    .then(() => {
      throw new Error('This request must failed');
    })
    .catch((e) => {
      expect(e.message).toBe('Aborted');
    });

  klient = new Klient();

  klient.on('request:success', () => {
    throw new Error('Not aborted');
  });

  await klient
    .request('/posts')
    .then(({ status }) => {
      expect(status).toBe(200);
    })
    .catch((e) => {
      console.log(e);
      throw e;
    });
});

test('request:cancelled', async () => {
  let klient = new Klient();

  const spyRequestSuccessEvent = jest.fn();
  const spyRequestCancelEvent = jest.fn();
  const spyRequestErrorEvent = jest.fn();
  const spyRequestDoneEvent = jest.fn();

  klient.on('request', (e: RequestEvent) => {
    e.request.cancel();
  });

  klient.on('request:success', spyRequestSuccessEvent);
  klient.on('request:error', spyRequestErrorEvent);
  klient.on('request:cancel', spyRequestCancelEvent);
  klient.on('request:done', spyRequestDoneEvent);

  await klient
    .request('/posts')
    .then(() => {
      throw new Error('This request must failed');
    })
    .catch((e) => {
      expect(klient.isCancel(e)).toBe(true);
      expect(spyRequestSuccessEvent).toBeCalledTimes(0);
      expect(spyRequestErrorEvent).toBeCalledTimes(0);
      expect(spyRequestDoneEvent).toBeCalledTimes(0);
      expect(spyRequestCancelEvent).toBeCalledTimes(1);
    });

  klient = new Klient();

  klient.on('request', () => {
    klient.cancelPendingRequests();
  });

  await klient
    .request('/posts')
    .then(() => {
      throw new Error('This request must failed');
    })
    .catch((e) => {
      expect(klient.isCancel(e)).toBe(true);
    });
});

test('request:file', async () => {
  const klient = new Klient();

  const spyRequestEvent = jest.fn();

  klient.on('request', (e: RequestEvent) => {
    spyRequestEvent(e.context.action, e.config.responseType);
  });

  await klient
    .file('/file')
    .then((file) => {
      expect(file).toBeInstanceOf(Blob);
      expect(spyRequestEvent).toBeCalledWith('file', 'blob');
    })
    .catch((e) => {
      console.log(e);
      throw e;
    });

  await klient
    .file({
      baseURL: 'http://localhost',
      url: '/file'
    })
    .then((file) => {
      expect(file).toBeInstanceOf(Blob);
      expect(spyRequestEvent).toBeCalledWith('file', 'blob');
    })
    .catch((e) => {
      console.log(e);
      throw e;
    });
});

test('request:rejected', () => {
  const klient = new Klient();

  const spyRequestErrorEvent = jest.fn();

  klient.on('request', (e: RequestEvent) => {
    return e.request.reject(new AxiosError());
  });

  klient.on('request:error', (e: RequestErrorEvent) => {
    spyRequestErrorEvent(e.data);
  });

  return klient
    .request('/')
    .then(() => {
      throw new Error('This request must failed');
    })
    .catch(() => {
      expect(spyRequestErrorEvent).toBeCalledWith(undefined);
      expect(spyRequestErrorEvent).toBeCalledTimes(1);
    });
});

test('request:resolved', async () => {
  const klient = new Klient();

  const spyRequestSuccessEvent = jest.fn();

  klient.on('request', (e: RequestEvent) => {
    return e.request.resolve({ status: 200, statusText: 'OK', data: [], headers: {}, config: {} });
  });

  klient.on('request:success', (e: RequestErrorEvent) => {
    spyRequestSuccessEvent(e.data);
  });

  await klient
    .request('/')
    .then(() => {
      expect(spyRequestSuccessEvent).toBeCalledWith([]);
      expect(spyRequestSuccessEvent).toBeCalledTimes(1);
    })
    .catch((e) => {
      console.log(e);
      throw e;
    });
});

test('request:handler', async () => {
  const klient = new Klient();

  const spyRequestSuccessEvent = jest.fn();
  const spyRequestHandler = jest.fn();

  klient.on('request', (e: RequestEvent) => {
    e.request.handler = () => {
      spyRequestHandler();
      return Promise.resolve({ status: 200, statusText: 'OK', data: [], headers: {}, config: {} });
    };
  });

  klient.on('request:success', (e: RequestErrorEvent) => {
    spyRequestSuccessEvent(e.request.result);
  });

  await klient
    .request('/')
    .then((response) => {
      expect(spyRequestSuccessEvent).toBeCalledWith(response);
      expect(spyRequestSuccessEvent).toBeCalledTimes(1);
    })
    .catch((e) => {
      console.log(e);
      throw e;
    });
});

test('request:get', () => {
  const klient = new Klient();

  const spyRequestEvent = jest.fn();

  klient.on('request', (e: RequestEvent) => {
    spyRequestEvent(e.config.method);
  });

  return klient
    .get('/posts')
    .then(() => {
      expect(spyRequestEvent).toBeCalledWith('GET');
    })
    .catch((e) => {
      console.log(e);
      throw e;
    });
});

test('request:post', () => {
  const klient = new Klient();

  const spyRequestEvent = jest.fn();

  klient.on('request', (e: RequestEvent) => {
    spyRequestEvent(e.config.method);
  });

  return klient
    .post('/posts', {})
    .then(() => {
      throw new Error('This request must failed');
    })
    .catch(() => {
      expect(spyRequestEvent).toBeCalledWith('POST');
    });
});

test('request:put', () => {
  const klient = new Klient();

  const spyRequestEvent = jest.fn();

  klient.on('request', (e: RequestEvent) => {
    spyRequestEvent(e.config.method);
  });

  return klient
    .put('/posts/1', {})
    .then(() => {
      throw new Error('This request must failed');
    })
    .catch(() => {
      expect(spyRequestEvent).toBeCalledWith('PUT');
    });
});

test('request:patch', () => {
  const klient = new Klient();

  const spyRequestEvent = jest.fn();

  klient.on('request', (e: RequestEvent) => {
    spyRequestEvent(e.config.method);
  });

  return klient
    .patch('/posts/1', {})
    .then(() => {
      throw new Error('This request must failed');
    })
    .catch(() => {
      expect(spyRequestEvent).toBeCalledWith('PATCH');
    });
});

test('request:head', () => {
  const klient = new Klient();

  const spyRequestEvent = jest.fn();

  klient.on('request', (e: RequestEvent) => {
    spyRequestEvent(e.config.method);
  });

  return klient
    .head('/posts/1')
    .then(() => {
      throw new Error('This request must failed');
    })
    .catch(() => {
      expect(spyRequestEvent).toBeCalledWith('HEAD');
    });
});

test('request:options', () => {
  const klient = new Klient();

  const spyRequestEvent = jest.fn();

  klient.on('request', (e: RequestEvent) => {
    spyRequestEvent(e.config.method);
  });

  return klient
    .options('/posts/1')
    .then(() => {
      throw new Error('This request must failed');
    })
    .catch(() => {
      expect(spyRequestEvent).toBeCalledWith('OPTIONS');
    });
});

test('request:delete', () => {
  const klient = new Klient();

  const spyRequestEvent = jest.fn();

  klient.on('request', (e: RequestEvent) => {
    spyRequestEvent(e.config.method);
  });

  return klient
    .delete('/posts/1')
    .then(() => {
      throw new Error('This request must failed');
    })
    .catch(() => {
      expect(spyRequestEvent).toBeCalledWith('DELETE');
    });
});
