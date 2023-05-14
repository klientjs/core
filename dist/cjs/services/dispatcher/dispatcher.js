"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const debug_1 = require("../../events/debug");
const listener_1 = require("./listener");
class Dispatcher {
    constructor(klient) {
        this.klient = klient;
        this.listeners = {};
    }
    on(event, callback, priority = 0, once = false) {
        if (this.findListenerIndex(event, callback) !== undefined) {
            return this;
        }
        this.listeners[event] = this.listeners[event] || [];
        const listeners = this.listeners[event];
        const id = listeners.length ? Math.max(...listeners.map((l) => l.id)) + 1 : 0;
        listeners.push(new listener_1.default(callback, priority, once, id));
        listeners.sort((a, b) => b.id - a.id);
        listeners.sort((a, b) => a.priority - b.priority);
        return this;
    }
    once(event, callback, priority = 0) {
        return this.on(event, callback, priority, true);
    }
    off(event, callback) {
        const index = this.findListenerIndex(event, callback);
        if (index !== undefined) {
            this.listeners[event].splice(index, 1);
        }
        return this;
    }
    dispatch(e, abortOnFailure = true) {
        return __awaiter(this, void 0, void 0, function* () {
            const event = e.constructor.NAME;
            const listeners = this.listeners[event] || [];
            this.debug('start', e, listeners);
            for (let i = listeners.length - 1, listener = null; i >= 0; i -= 1) {
                listener = listeners[i];
                if (Dispatcher.handleListenerSkipping(e, listener)) {
                    this.debug('skipped', e, listener);
                    continue;
                }
                if (listener.once) {
                    this.listeners[event].splice(i, 1);
                }
                try {
                    this.debug('invoking', e, listener);
                    yield listener.invoke(e);
                    this.debug('invoked', e, listener);
                }
                catch (err) {
                    this.debug('failed', e, listener, err);
                    if (abortOnFailure) {
                        return Promise.reject(err);
                    }
                }
                if (!e.dispatch.propagation) {
                    this.debug('stopped', e, listener);
                    break;
                }
            }
            this.debug('end', e, listeners);
            return Promise.resolve();
        });
    }
    findListenerIndex(event, callback) {
        const listeners = this.listeners[event] || [];
        for (let i = 0, len = listeners.length; i < len; i += 1) {
            if (listeners[i].callback === callback) {
                return i;
            }
        }
        return undefined;
    }
    static handleListenerSkipping(event, listener) {
        const { skipNextListeners, skipUntilListener } = event.dispatch;
        if (skipNextListeners > 0) {
            event.dispatch.skipNextListeners -= 1;
            return true;
        }
        if (skipUntilListener) {
            if (listener.id === skipUntilListener) {
                event.dispatch.skipUntilListener = undefined;
                return;
            }
            return true;
        }
    }
    debug(action, relatedEvent, handler, error = null) {
        if (relatedEvent instanceof debug_1.default || !this.klient.debug) {
            return;
        }
        this.dispatch(new debug_1.default(action, relatedEvent, handler, error), false);
    }
}
exports.default = Dispatcher;
