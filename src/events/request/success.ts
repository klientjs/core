import type { AxiosResponse } from 'axios';

import RequestEvent from './request';

export default class RequestSuccessEvent<T = unknown> extends RequestEvent {
  static NAME = 'request:success';

  constructor(public relatedEvent: RequestEvent<T>) {
    super(relatedEvent.request);
  }

  get response(): AxiosResponse<T> {
    return this.request.result as AxiosResponse<T>;
  }

  get data() {
    return this.response.data;
  }
}
