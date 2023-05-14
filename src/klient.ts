import axios from 'axios';
import Bag from './services/bag';
import Dispatcher from './services/dispatcher/dispatcher';
import RequestFactory from './services/request/factory';
import Extensions from './extensions';
import { defaultParameters } from './parameters';

import type Event from './events/event';
import type Request from './services/request/request';
import type { KlientRequestConfig } from './services/request/request';
import type { Callback } from './services/dispatcher/dispatcher';
import type { Parameters } from './parameters';

export default class Klient<P extends Parameters = Parameters> {
  readonly extensions: string[] = [];

  readonly parameters = new Bag(defaultParameters);

  readonly services = new Bag();

  constructor(urlOrParams?: P | string) {
    let parameters: Parameters = {};

    if (typeof urlOrParams === 'string') {
      parameters.url = urlOrParams;
    } else if (urlOrParams && typeof urlOrParams === 'object') {
      parameters = urlOrParams;
    }

    this.parameters.merge(parameters);

    // prettier-ignore
    this.services
      .set('klient', this)
      .set('dispatcher', new Dispatcher(this))
      .set('factory', new RequestFactory(this));

    this.load(this.parameters.get('extensions') as string[] | undefined);
  }

  /** === Common parameters === */

  get url(): string | undefined {
    return this.parameters.get('url');
  }

  get debug(): boolean {
    return Boolean(this.parameters.get('debug'));
  }

  /** === Common services === */

  get factory(): RequestFactory {
    return this.services.get('factory') as RequestFactory;
  }

  get dispatcher(): Dispatcher {
    return this.services.get('dispatcher') as Dispatcher;
  }

  /** === Extensions === */

  extends(property: string, value: unknown, writable = false): this {
    return Object.defineProperty(this, property, { writable, value });
  }

  load(names?: string[]): this {
    Extensions.load(this, names);
    return this;
  }

  /** === Dispatcher/Events === */

  on<T extends Event>(event: string, callback: Callback<T>, priority = 0, once = false): this {
    this.dispatcher.on(event, callback, priority, once);
    return this;
  }

  once<T extends Event>(event: string, callback: Callback<T>, priority = 0): this {
    this.dispatcher.once(event, callback, priority);
    return this;
  }

  off<T extends Event>(event: string, callback: Callback<T>): this {
    this.dispatcher.off(event, callback);
    return this;
  }

  /** === Request === */

  request<T = unknown>(urlOrConfig: KlientRequestConfig | string): Request<T> {
    return this.factory.request(urlOrConfig);
  }

  get<T = unknown>(url: string, config?: KlientRequestConfig): Request<T> {
    return this.request<T>({ ...config, method: 'GET', url });
  }

  post<T = unknown>(url: string, data: unknown, config?: KlientRequestConfig): Request<T> {
    return this.request<T>({ ...config, method: 'POST', url, data });
  }

  put<T = unknown>(url: string, data: unknown, config?: KlientRequestConfig): Request<T> {
    return this.request<T>({ ...config, method: 'PUT', url, data });
  }

  patch<T = unknown>(url: string, data: unknown, config?: KlientRequestConfig): Request<T> {
    return this.request<T>({ ...config, method: 'PATCH', url, data });
  }

  delete<T = unknown>(url: string, config?: KlientRequestConfig): Request<T> {
    return this.request<T>({ ...config, method: 'DELETE', url });
  }

  head<T = unknown>(url: string, config?: KlientRequestConfig): Request<T> {
    return this.request<T>({ ...config, method: 'HEAD', url });
  }

  options<T = unknown>(url: string, config?: KlientRequestConfig): Request<T> {
    return this.request<T>({ ...config, method: 'OPTIONS', url });
  }

  file(urlOrConfig: KlientRequestConfig | string): Promise<Blob> {
    return this.factory.file(urlOrConfig);
  }

  cancelPendingRequests(): this {
    this.factory.cancelPendingRequests();
    return this;
  }

  // eslint-disable-next-line class-methods-use-this
  isCancel(e: Error) {
    return axios.isCancel(e);
  }
}
