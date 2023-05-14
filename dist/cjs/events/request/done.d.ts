import RequestEvent from './request';
import RequestSuccessEvent from './success';
import type RequestErrorEvent from './error';
export default class RequestDoneEvent<T = unknown> extends RequestEvent {
    relatedEvent: RequestSuccessEvent<T> | RequestErrorEvent<T>;
    static NAME: string;
    constructor(relatedEvent: RequestSuccessEvent<T> | RequestErrorEvent<T>);
    get success(): boolean;
    get result(): import("axios").AxiosResponse<any, any> | import("axios").AxiosError<unknown, any> | undefined;
    get data(): unknown;
}
