import Event from '../event';
export default class RequestEvent extends Event {
    constructor(request) {
        super();
        this.request = request;
    }
    get config() {
        return this.request.config;
    }
    get context() {
        return this.request.context;
    }
}
RequestEvent.NAME = 'request';
