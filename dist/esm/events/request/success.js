import RequestEvent from './request';
export default class RequestSuccessEvent extends RequestEvent {
    constructor(relatedEvent) {
        super(relatedEvent.request);
        this.relatedEvent = relatedEvent;
    }
    get response() {
        return this.request.result;
    }
    get data() {
        return this.response.data;
    }
}
RequestSuccessEvent.NAME = 'request:success';
