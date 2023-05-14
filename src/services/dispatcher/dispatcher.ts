import Event from '../../events/event';
import DebugEvent from '../../events/debug';
import Listener from './listener';

import type Klient from '../../klient';

export type Callback<T extends Event> = (e: T) => Promise<void> | void;
export type Listeners = { [event: string]: Listener<never>[] };

export default class Dispatcher {
  readonly listeners: Listeners = {};

  constructor(protected readonly klient: Klient) {}

  on<T extends Event>(event: string, callback: Callback<T>, priority = 0, once = false): this {
    // Avoid duplication
    if (this.findListenerIndex(event, callback) !== undefined) {
      return this;
    }

    // Initialize listeners collection if not exists
    this.listeners[event] = this.listeners[event] || [];
    // Get reference to array containing listeners
    const listeners = this.listeners[event];
    // Build listener id (incremental)
    const id = listeners.length ? Math.max(...listeners.map((l) => l.id)) + 1 : 0;
    // Register the listener
    listeners.push(new Listener(callback, priority, once, id));
    // Listener are sorted in order they are defined
    listeners.sort((a, b) => b.id - a.id);
    // Sort by priority listeners binded to same event
    // Lower priorities are first because we loop on collection from the end (see dispatch method)
    listeners.sort((a, b) => a.priority - b.priority);

    return this;
  }

  once<T extends Event>(event: string, callback: Callback<T>, priority = 0): this {
    return this.on(event, callback, priority, true);
  }

  off<T extends Event>(event: string, callback: Callback<T>): this {
    const index = this.findListenerIndex(event, callback);

    if (index !== undefined) {
      this.listeners[event].splice(index, 1);
    }

    return this;
  }

  /**
   * Invoke all listeners attached to given event.
   *
   * @param abortOnFailure - Specify if listener failures must abort dispatch process.
   */
  async dispatch(e: Event, abortOnFailure = true): Promise<void> {
    const event = (e.constructor as typeof Event).NAME;
    const listeners = this.listeners[event] || [];

    this.debug('start', e, listeners);

    // Use inverse loop because we need to remove listeners callable once
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
        // Wait for listener whose return a promise
        await listener.invoke(e as never); // eslint-disable-line no-await-in-loop
        this.debug('invoked', e, listener);
      } catch (err) {
        this.debug('failed', e, listener, err as Error);

        if (abortOnFailure) {
          // Reject promise on "abort on listener failure" strategy
          return Promise.reject(err);
        }
      }

      if (!e.dispatch.propagation) {
        this.debug('stopped', e, listener);
        // Stop listeners invokation
        break;
      }
    }

    this.debug('end', e, listeners);

    return Promise.resolve();
  }

  protected findListenerIndex<T extends Event>(event: string, callback: Callback<T>): number | undefined {
    const listeners = this.listeners[event] || [];

    for (let i = 0, len = listeners.length; i < len; i += 1) {
      if (listeners[i].callback === callback) {
        return i;
      }
    }

    return undefined;
  }

  protected static handleListenerSkipping(event: Event, listener: Listener<never>): boolean | void {
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

  protected debug(
    action: string,
    relatedEvent: Event,
    handler: Listener<never> | Listener<never>[],
    error: Error | null = null
  ): void {
    if (relatedEvent instanceof DebugEvent || !this.klient.debug) {
      return;
    }

    this.dispatch(new DebugEvent(action, relatedEvent, handler, error), false);
  }
}
