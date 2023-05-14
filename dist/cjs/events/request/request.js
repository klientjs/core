"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const event_1 = require("../event");
class RequestEvent extends event_1.default {
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
exports.default = RequestEvent;
RequestEvent.NAME = 'request';
