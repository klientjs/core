"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class Listener {
    constructor(callback, priority, once, id) {
        this.callback = callback;
        this.priority = priority;
        this.once = once;
        this.id = id;
    }
    invoke(event) {
        let result;
        try {
            result = this.callback(event);
            if (!(result instanceof Promise)) {
                result = Promise.resolve();
            }
        }
        catch (error) {
            result = Promise.reject(error);
        }
        return result;
    }
}
exports.default = Listener;
