import Event from '../../events/event';
import Listener from './listener';
import type Klient from '../../klient';
export declare type Callback<T extends Event> = (e: T) => Promise<void> | void;
export declare type Listeners = {
    [event: string]: Listener<never>[];
};
export default class Dispatcher {
    protected readonly klient: Klient;
    readonly listeners: Listeners;
    constructor(klient: Klient);
    on<T extends Event>(event: string, callback: Callback<T>, priority?: number, once?: boolean): this;
    once<T extends Event>(event: string, callback: Callback<T>, priority?: number): this;
    off<T extends Event>(event: string, callback: Callback<T>): this;
    dispatch(e: Event, abortOnFailure?: boolean): Promise<void>;
    protected findListenerIndex<T extends Event>(event: string, callback: Callback<T>): number | undefined;
    protected static handleListenerSkipping(event: Event, listener: Listener<never>): boolean | void;
    protected debug(action: string, relatedEvent: Event, handler: Listener<never> | Listener<never>[], error?: Error | null): void;
}
