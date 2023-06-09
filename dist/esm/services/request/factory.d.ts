import type Klient from '../../klient';
import Request from './request';
import type { KlientRequestConfig } from './request';
export default class RequestFactory {
    protected readonly klient: Klient;
    model: typeof Request;
    readonly requests: Request[];
    constructor(klient: Klient);
    request<T = unknown>(urlOrConfig: KlientRequestConfig | string): Request<T>;
    file(urlOrConfig: KlientRequestConfig | string): Promise<Blob>;
    cancelPendingRequests(): this;
    createRequest<T = unknown>(urlOrConfig: KlientRequestConfig | string): Request<T>;
    isCancel(e: Error): boolean;
    protected prepare(config: KlientRequestConfig): KlientRequestConfig;
    protected removePendingRequest(request: Request): void;
}
