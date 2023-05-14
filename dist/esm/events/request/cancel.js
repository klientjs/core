import RequestEvent from './request';
export default class RequestCancelEvent extends RequestEvent {
    constructor(relatedEvent) {
        super(relatedEvent.request);
        this.relatedEvent = relatedEvent;
    }
}
RequestCancelEvent.NAME = 'request:cancel';
