"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const event_1 = require("./event");
class DebugEvent extends event_1.default {
    constructor(action, relatedEvent, handler, error) {
        super();
        this.action = action;
        this.relatedEvent = relatedEvent;
        this.handler = handler;
        this.error = error;
    }
}
exports.default = DebugEvent;
DebugEvent.NAME = 'debug';
