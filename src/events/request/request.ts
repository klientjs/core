import Event from '../event';

import type Request from '../../services/request/request';
import type { KlientRequestConfig } from '../../services/request/request';

export default class RequestEvent<T = unknown> extends Event {
  static NAME = 'request';

  constructor(public request: Request<T>) {
    super();
  }

  get config(): KlientRequestConfig {
    return this.request.config;
  }

  get context() {
    return this.request.context;
  }
}
