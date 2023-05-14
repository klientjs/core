import type { AxiosResponse } from 'axios';
import RequestEvent from './request';
export default class RequestSuccessEvent<T = unknown> extends RequestEvent {
    relatedEvent: RequestEvent<T>;
    static NAME: string;
    constructor(relatedEvent: RequestEvent<T>);
    get response(): AxiosResponse<T>;
    get data(): T;
}
