"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const request_1 = require("./request");
class RequestCancelEvent extends request_1.default {
    constructor(relatedEvent) {
        super(relatedEvent.request);
        this.relatedEvent = relatedEvent;
    }
}
exports.default = RequestCancelEvent;
RequestCancelEvent.NAME = 'request:cancel';
