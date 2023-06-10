import type { AxiosResponse, AxiosError, AxiosRequestConfig, AxiosPromise } from 'axios';
import RequestEvent from '../../events/request/request';
import RequestSuccessEvent from '../../events/request/success';
import RequestErrorEvent from '../../events/request/error';
import RequestCancelEvent from '../../events/request/cancel';
import type Klient from '../..';
export declare type ResolveRequest = (response: AxiosResponse) => void;
export declare type RejectRequest = (error: AxiosError) => void;
export declare type RequestCallback = (resolve: ResolveRequest, reject: RejectRequest) => void;
declare type PromiseCallbacks = {
    resolve: ResolveRequest;
    reject: RejectRequest;
};
declare type RequestEventTypes = typeof RequestSuccessEvent | typeof RequestErrorEvent | typeof RequestCancelEvent;
declare type RequestContext = Record<string, any>;
export interface KlientRequestConfig extends AxiosRequestConfig {
    context?: RequestContext;
}
export default class Request<T = unknown> extends Promise<AxiosResponse<T>> {
    context: RequestContext;
    config: KlientRequestConfig;
    result?: AxiosError | AxiosResponse;
    handler: (config: AxiosRequestConfig) => AxiosPromise<T>;
    protected klient: Klient;
    protected callbacks: PromiseCallbacks;
    protected readonly primaryEvent: RequestEvent<T>;
    protected readonly abortController: AbortController;
    protected constructor(callback: RequestCallback);
    static new<T>({ context, ...axiosConfig }: KlientRequestConfig, klient: Klient): Request<T>;
    static isCancel(e: Error): boolean;
    cancel(): this;
    execute(): this;
    protected doRequest(): this;
    protected resolve(response: AxiosResponse<T>): Promise<void>;
    protected reject(error: AxiosError): Promise<void>;
    protected dispatchResultEvent(EventClass: RequestEventTypes): Promise<void>;
    protected get dispatcher(): import("../..").Dispatcher;
}
export {};
