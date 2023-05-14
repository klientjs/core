import type { AxiosResponse, AxiosError, AxiosRequestConfig, AxiosPromise } from 'axios';
import RequestEvent from '../../events/request/request';
import type Klient from '../..';
export declare type ResolveRequest = (response: AxiosResponse) => void;
export declare type RejectRequest = (error: AxiosError) => void;
export declare type RequestCallback = (resolve: ResolveRequest, reject: RejectRequest) => void;
declare type PromiseCallbacks = {
    resolve: ResolveRequest;
    reject: RejectRequest;
};
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
    private constructor();
    static new<T>({ context, ...axiosConfig }: KlientRequestConfig, klient: Klient): Request<T>;
    resolve(response: AxiosResponse<T>): Promise<void>;
    reject(error: AxiosError): Promise<void>;
    cancel(): this;
    execute(): this;
    private doRequest;
    private dispatchResultEvent;
    private get dispatcher();
}
export {};
