import RequestEvent from './request';
export default class RequestCancelEvent<T = unknown> extends RequestEvent {
    relatedEvent: RequestEvent<T>;
    static NAME: string;
    constructor(relatedEvent: RequestEvent<T>);
}
