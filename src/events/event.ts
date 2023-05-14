export default class Event {
  static NAME = 'event';

  readonly dispatch: {
    propagation: boolean;
    skipNextListeners: number;
    skipUntilListener?: number;
  } = {
    propagation: true,
    skipNextListeners: 0,
    skipUntilListener: undefined
  };

  stopPropagation() {
    this.dispatch.propagation = false;
  }

  skipNextListeners(total: number) {
    this.dispatch.skipNextListeners = total;
  }

  skipUntilListener(id: number) {
    this.dispatch.skipUntilListener = id;
  }
}
