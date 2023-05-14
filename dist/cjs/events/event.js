"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class Event {
    constructor() {
        this.dispatch = {
            propagation: true,
            skipNextListeners: 0,
            skipUntilListener: undefined
        };
    }
    stopPropagation() {
        this.dispatch.propagation = false;
    }
    skipNextListeners(total) {
        this.dispatch.skipNextListeners = total;
    }
    skipUntilListener(id) {
        this.dispatch.skipUntilListener = id;
    }
}
exports.default = Event;
Event.NAME = 'event';
