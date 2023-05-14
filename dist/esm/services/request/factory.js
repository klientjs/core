import * as deepmerge from 'deepmerge';
import Request from './request';
export default class RequestFactory {
    constructor(klient) {
        this.klient = klient;
        this.requests = [];
    }
    request(urlOrConfig) {
        return this.createRequest(urlOrConfig).execute();
    }
    file(urlOrConfig) {
        const config = deepmerge({ responseType: 'blob', context: { action: 'file' } }, typeof urlOrConfig === 'string' ? { url: urlOrConfig } : urlOrConfig);
        return this.request(config).then(({ data }) => data);
    }
    cancelPendingRequests() {
        for (let i = 0, len = this.requests.length; i < len; i += 1) {
            this.requests[i].cancel();
        }
        return this;
    }
    createRequest(urlOrConfig) {
        const config = typeof urlOrConfig === 'string' ? { url: urlOrConfig } : urlOrConfig;
        const request = Request.new(this.prepare(config), this.klient);
        this.requests.push(request);
        request
            .then((r) => {
            this.removePendingRequest(request);
            return r;
        })
            .catch((e) => {
            this.removePendingRequest(request);
            return e;
        });
        return request;
    }
    prepare(config) {
        return deepmerge.all([
            { baseURL: this.klient.url },
            this.klient.parameters.get('request') || {},
            config
        ]);
    }
    removePendingRequest(request) {
        const i = this.requests.indexOf(request);
        if (this.requests[i] instanceof Request) {
            this.requests.splice(i, 1);
        }
    }
}
