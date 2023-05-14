import Event from './event';
export default class DebugEvent extends Event {
    constructor(action, relatedEvent, handler, error) {
        super();
        this.action = action;
        this.relatedEvent = relatedEvent;
        this.handler = handler;
        this.error = error;
    }
}
DebugEvent.NAME = 'debug';
