import RequestEvent from './request';
export default class RequestErrorEvent extends RequestEvent {
    constructor(relatedEvent) {
        super(relatedEvent.request);
        this.relatedEvent = relatedEvent;
    }
    get error() {
        return this.request.result;
    }
    get response() {
        return this.error.response;
    }
    get data() {
        var _a;
        return (_a = this.response) === null || _a === void 0 ? void 0 : _a.data;
    }
}
RequestErrorEvent.NAME = 'request:error';
