"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const request_1 = require("./request");
class RequestErrorEvent extends request_1.default {
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
exports.default = RequestErrorEvent;
RequestErrorEvent.NAME = 'request:error';
