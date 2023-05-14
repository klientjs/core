import type { AxiosError } from 'axios';

import RequestEvent from './request';

export default class RequestErrorEvent<T = unknown> extends RequestEvent<T> {
  static NAME = 'request:error';

  constructor(public relatedEvent: RequestEvent<T>) {
    super(relatedEvent.request);
  }

  get error(): AxiosError {
    return this.request.result as AxiosError;
  }

  get response() {
    return this.error.response;
  }

  get data() {
    return this.response?.data;
  }
}
