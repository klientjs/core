import RequestEvent from './request';
import RequestSuccessEvent from './success';

import type RequestErrorEvent from './error';

export default class RequestDoneEvent<T = unknown> extends RequestEvent {
  static NAME = 'request:done';

  constructor(public relatedEvent: RequestSuccessEvent<T> | RequestErrorEvent<T>) {
    super(relatedEvent.request);
  }

  get success() {
    return this.relatedEvent instanceof RequestSuccessEvent;
  }

  get result() {
    return this.request.result;
  }

  get data() {
    return this.relatedEvent.data;
  }
}
