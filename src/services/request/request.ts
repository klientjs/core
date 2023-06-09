import axios from 'axios';

import type { AxiosResponse, AxiosError, AxiosRequestConfig, AxiosPromise } from 'axios';
import RequestEvent from '../../events/request/request';
import RequestSuccessEvent from '../../events/request/success';
import RequestErrorEvent from '../../events/request/error';
import RequestDoneEvent from '../../events/request/done';
import RequestCancelEvent from '../../events/request/cancel';

import type Klient from '../..';

export type ResolveRequest = (response: AxiosResponse) => void;
export type RejectRequest = (error: AxiosError) => void;
export type RequestCallback = (resolve: ResolveRequest, reject: RejectRequest) => void;

type PromiseCallbacks = { resolve: ResolveRequest; reject: RejectRequest };
type RequestEventTypes = typeof RequestSuccessEvent | typeof RequestErrorEvent | typeof RequestCancelEvent;
type RequestContext = Record<string, any>; // eslint-disable-line @typescript-eslint/no-explicit-any

export interface KlientRequestConfig extends AxiosRequestConfig {
  context?: RequestContext;
}

/**
 * Request is a Promise object able to dispatch events before/after axios execution.
 * Theses events allow to access and make action on request config/result at any step of execution.
 * The Request will be resolved/rejected only after all events be dispatched.
 *
 * The events workflow is describe below :
 *
 * 1) RequestEvent (dispatched with abortOnFailure strategy)
 * 2) Axios execution
 *    2.1) Optional : RequestCancelEvent - only if request is cancelled (will reject promise and skip next events)
 * 3) RequestSuccessEvent OR RequestErrorEvent
 * 4) RequestDoneEvent
 */
export default class Request<T = unknown> extends Promise<AxiosResponse<T>> {
  context: RequestContext = { action: 'request' };

  config: KlientRequestConfig = {};

  result?: AxiosError | AxiosResponse;

  // Allow override axios execution
  handler: (config: AxiosRequestConfig) => AxiosPromise<T> = axios;

  protected klient!: Klient;

  protected callbacks!: PromiseCallbacks;

  protected readonly primaryEvent = new RequestEvent<T>(this);

  protected readonly abortController = new AbortController();

  protected constructor(callback: RequestCallback) {
    super(callback);
  }

  static new<T>({ context, ...axiosConfig }: KlientRequestConfig, klient: Klient): Request<T> {
    const callbacks = {} as PromiseCallbacks;

    const request = new this<T>((resolve: ResolveRequest, reject: RejectRequest) => {
      callbacks.resolve = resolve;
      callbacks.reject = reject;
    });

    request.klient = klient;
    request.config = axiosConfig;
    request.callbacks = callbacks;
    request.config.signal = request.abortController.signal;
    request.context = { ...request.context, ...context };

    return request;
  }

  resolve(response: AxiosResponse<T>): Promise<void> {
    this.result = response;
    return this.dispatchResultEvent(RequestSuccessEvent).then(() => {
      this.callbacks.resolve(this.result as AxiosResponse<T>);
    });
  }

  reject(error: AxiosError): Promise<void> {
    this.result = error;
    return this.dispatchResultEvent(Request.isCancel(error) ? RequestCancelEvent : RequestErrorEvent).then(() => {
      this.callbacks.reject(this.result as AxiosError);
    });
  }

  cancel(): this {
    this.abortController.abort();
    return this;
  }

  execute(): this {
    this.dispatcher
      .dispatch(this.primaryEvent)
      .then(() => {
        this.doRequest();
      })
      .catch((e) => {
        this.reject(e);
      });

    return this;
  }

  private doRequest(): this {
    if (!this.result) {
      this.handler(this.config)
        .then((r) => {
          this.resolve(r);
        })
        .catch((e) => {
          this.reject(e);
        });
    }

    return this;
  }

  private dispatchResultEvent(EventClass: RequestEventTypes): Promise<void> {
    const event = new EventClass(this.primaryEvent);

    return new Promise((resolve) => {
      this.dispatcher.dispatch(event, false).then(() => {
        if (event instanceof RequestCancelEvent) {
          return resolve();
        }

        this.dispatcher.dispatch(new RequestDoneEvent(event), false).then(resolve);
      });
    });
  }

  private get dispatcher() {
    return this.klient.dispatcher;
  }

  static isCancel(e: Error) {
    return axios.isCancel(e);
  }
}
