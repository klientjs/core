"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const request_1 = require("./request");
class RequestSuccessEvent extends request_1.default {
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
exports.default = RequestSuccessEvent;
RequestSuccessEvent.NAME = 'request:success';
