import RequestEvent from './request';
import RequestSuccessEvent from './success';
export default class RequestDoneEvent extends RequestEvent {
    constructor(relatedEvent) {
        super(relatedEvent.request);
        this.relatedEvent = relatedEvent;
    }
    get success() {
        return this.relatedEvent instanceof RequestSuccessEvent;
    }
    get result() {
        return this.request.result;
    }
    get data() {
        return this.relatedEvent.data;
    }
}
RequestDoneEvent.NAME = 'request:done';
