import type Event from '../../events/event';
import type { Callback } from './dispatcher';

export default class Listener<T extends Event> {
  constructor(readonly callback: Callback<T>, readonly priority: number, readonly once: boolean, readonly id: number) {}

  invoke(event: T): Promise<void> {
    let result;

    try {
      result = this.callback(event);

      if (!(result instanceof Promise)) {
        result = Promise.resolve();
      }
    } catch (error) {
      result = Promise.reject(error);
    }

    return result;
  }
}
