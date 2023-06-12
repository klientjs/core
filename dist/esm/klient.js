import Bag from './services/bag/bag';
import Dispatcher from './services/dispatcher/dispatcher';
import RequestFactory from './services/request/factory';
import Extensions from './extensions';
import { defaultParameters } from './parameters';
export default class Klient {
    constructor(urlOrParams) {
        this.extensions = [];
        this.parameters = new Bag(defaultParameters);
        this.services = new Bag();
        let parameters = {};
        if (typeof urlOrParams === 'string') {
            parameters.url = urlOrParams;
        }
        else if (urlOrParams && typeof urlOrParams === 'object') {
            parameters = urlOrParams;
        }
        this.parameters.merge(parameters);
        this.services
            .set('klient', this)
            .set('dispatcher', new Dispatcher(this))
            .set('factory', new RequestFactory(this));
        this.load(this.parameters.get('extensions'));
    }
    get url() {
        return this.parameters.get('url');
    }
    get debug() {
        return Boolean(this.parameters.get('debug'));
    }
    get factory() {
        return this.services.get('factory');
    }
    get dispatcher() {
        return this.services.get('dispatcher');
    }
    extends(property, value, writable = false) {
        return Object.defineProperty(this, property, { writable, value });
    }
    load(names) {
        Extensions.load(this, names);
        return this;
    }
    on(event, callback, priority = 0, once = false) {
        this.dispatcher.on(event, callback, priority, once);
        return this;
    }
    once(event, callback, priority = 0) {
        this.dispatcher.once(event, callback, priority);
        return this;
    }
    off(event, callback) {
        this.dispatcher.off(event, callback);
        return this;
    }
    request(urlOrConfig) {
        return this.factory.request(urlOrConfig);
    }
    get(url, config) {
        return this.request(Object.assign(Object.assign({}, config), { method: 'GET', url }));
    }
    post(url, data, config) {
        return this.request(Object.assign(Object.assign({}, config), { method: 'POST', url, data }));
    }
    put(url, data, config) {
        return this.request(Object.assign(Object.assign({}, config), { method: 'PUT', url, data }));
    }
    patch(url, data, config) {
        return this.request(Object.assign(Object.assign({}, config), { method: 'PATCH', url, data }));
    }
    delete(url, config) {
        return this.request(Object.assign(Object.assign({}, config), { method: 'DELETE', url }));
    }
    head(url, config) {
        return this.request(Object.assign(Object.assign({}, config), { method: 'HEAD', url }));
    }
    options(url, config) {
        return this.request(Object.assign(Object.assign({}, config), { method: 'OPTIONS', url }));
    }
    file(urlOrConfig) {
        return this.factory.file(urlOrConfig);
    }
    cancelPendingRequests() {
        this.factory.cancelPendingRequests();
        return this;
    }
    isCancel(e) {
        return this.factory.isCancel(e);
    }
}
