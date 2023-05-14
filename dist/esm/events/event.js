export default class Event {
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
Event.NAME = 'event';
