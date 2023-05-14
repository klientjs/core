import * as deepmerge from 'deepmerge';

import type { AxiosRequestConfig } from 'axios';
import type Klient from '../../klient';

import Request from './request';

import type { KlientRequestConfig } from './request';

export default class RequestFactory {
  // Requests are stocked during their execution only.
  readonly requests: Request[] = [];

  constructor(protected readonly klient: Klient) {}

  request<T = unknown>(urlOrConfig: KlientRequestConfig | string): Request<T> {
    return this.createRequest<T>(urlOrConfig).execute();
  }

  file(urlOrConfig: KlientRequestConfig | string): Promise<Blob> {
    const config = deepmerge(
      { responseType: 'blob', context: { action: 'file' } },
      typeof urlOrConfig === 'string' ? { url: urlOrConfig } : urlOrConfig
    );

    return this.request<Blob>(config).then(({ data }) => data);
  }

  cancelPendingRequests(): this {
    for (let i = 0, len = this.requests.length; i < len; i += 1) {
      this.requests[i].cancel();
    }

    return this;
  }

  createRequest<T = unknown>(urlOrConfig: KlientRequestConfig | string): Request<T> {
    const config = typeof urlOrConfig === 'string' ? { url: urlOrConfig } : urlOrConfig;
    const request = Request.new<T>(this.prepare(config), this.klient);

    // Store request during pending state only
    this.requests.push(request);

    // Remove request when promise has been fulfilled
    request
      .then((r) => {
        this.removePendingRequest(request);
        return r;
      })
      .catch((e) => {
        this.removePendingRequest(request);
        return e;
      });

    return request;
  }

  protected prepare(config: KlientRequestConfig): KlientRequestConfig {
    return deepmerge.all([
      { baseURL: this.klient.url },
      (this.klient.parameters.get('request') as AxiosRequestConfig) || {},
      config
    ]);
  }

  protected removePendingRequest(request: Request) {
    const i = this.requests.indexOf(request);
    if (this.requests[i] instanceof Request) {
      this.requests.splice(i, 1);
    }
  }
}
