import * as deepmerge from 'deepmerge';
import * as objectPath from 'object-path';

import { isPlainObject, isPlainArray, softClone } from '../../toolbox/object';
import { watch, unwatch, invokeWatchers, getWatchers, Watchable, WatchCallback } from './watch';

type BagItems = Record<string, unknown>;

export default class Bag implements BagItems, Watchable {
  [x: string]: unknown;

  constructor(items: BagItems = {}) {
    Object.keys(items).forEach((key) => {
      this[key] = items[key];
    });
  }

  get watchers() {
    return getWatchers(this);
  }

  get(path: string) {
    return objectPath.get(this.all(), path);
  }

  all() {
    return softClone(this);
  }

  set(path: string, value: unknown): this {
    const prevState = this.all();

    objectPath.set(this, path, value);

    return invokeWatchers(this, this.all(), prevState);
  }

  merge(...items: BagItems[]): this {
    const prevState = this.all();
    const nextState = deepmerge.all<BagItems>([this.all(), ...items], {
      arrayMerge: (_destinationArray: unknown[], sourceArray: unknown[]) => sourceArray,
      isMergeableObject: (o: object) => isPlainArray(o) || isPlainObject(o)
    });

    Object.keys(nextState).forEach((key) => {
      this[key] = nextState[key];
    });

    return invokeWatchers(this, nextState, prevState);
  }

  watch(path: string, onChange: WatchCallback, deep = false): this {
    return watch(this, path, onChange, deep);
  }

  unwatch(path: string, onChange: WatchCallback): this {
    return unwatch(this, path, onChange);
  }
}
