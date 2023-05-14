"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const request_1 = require("./request");
const success_1 = require("./success");
class RequestDoneEvent extends request_1.default {
    constructor(relatedEvent) {
        super(relatedEvent.request);
        this.relatedEvent = relatedEvent;
    }
    get success() {
        return this.relatedEvent instanceof success_1.default;
    }
    get result() {
        return this.request.result;
    }
    get data() {
        return this.relatedEvent.data;
    }
}
exports.default = RequestDoneEvent;
RequestDoneEvent.NAME = 'request:done';
