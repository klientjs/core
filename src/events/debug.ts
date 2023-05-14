import Event from './event';

import type Listener from '../services/dispatcher/listener';

export default class DebugEvent extends Event {
  static NAME = 'debug';

  constructor(
    public action: string,
    public relatedEvent: Event,
    public handler: Listener<never> | Listener<never>[],
    public error: Error | null
  ) {
    super();
  }
}
