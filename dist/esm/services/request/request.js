var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
import axios from 'axios';
import RequestEvent from '../../events/request/request';
import RequestSuccessEvent from '../../events/request/success';
import RequestErrorEvent from '../../events/request/error';
import RequestDoneEvent from '../../events/request/done';
import RequestCancelEvent from '../../events/request/cancel';
export default class Request extends Promise {
    constructor(callback) {
        super(callback);
        this.context = { action: 'request' };
        this.config = {};
        this.handler = axios;
        this.primaryEvent = new RequestEvent(this);
        this.abortController = new AbortController();
    }
    static new(_a, klient) {
        var { context } = _a, axiosConfig = __rest(_a, ["context"]);
        const callbacks = {};
        const request = new this((resolve, reject) => {
            callbacks.resolve = resolve;
            callbacks.reject = reject;
        });
        request.klient = klient;
        request.config = axiosConfig;
        request.callbacks = callbacks;
        request.config.signal = request.abortController.signal;
        request.context = Object.assign(Object.assign({}, request.context), context);
        return request;
    }
    resolve(response) {
        this.result = response;
        return this.dispatchResultEvent(RequestSuccessEvent).then(() => {
            this.callbacks.resolve(this.result);
        });
    }
    reject(error) {
        this.result = error;
        return this.dispatchResultEvent(axios.isCancel(error) ? RequestCancelEvent : RequestErrorEvent).then(() => {
            this.callbacks.reject(this.result);
        });
    }
    cancel() {
        this.abortController.abort();
        return this;
    }
    execute() {
        this.dispatcher
            .dispatch(this.primaryEvent)
            .then(() => {
            this.doRequest();
        })
            .catch((e) => {
            this.reject(e);
        });
        return this;
    }
    doRequest() {
        if (!this.result) {
            this.handler(this.config)
                .then((r) => {
                this.resolve(r);
            })
                .catch((e) => {
                this.reject(e);
            });
        }
        return this;
    }
    dispatchResultEvent(EventClass) {
        const event = new EventClass(this.primaryEvent);
        return new Promise((resolve) => {
            this.dispatcher.dispatch(event, false).then(() => {
                if (event instanceof RequestCancelEvent) {
                    return resolve();
                }
                this.dispatcher.dispatch(new RequestDoneEvent(event), false).then(resolve);
            });
        });
    }
    get dispatcher() {
        return this.klient.dispatcher;
    }
}
