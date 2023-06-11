import * as deepmerge from 'deepmerge';
import * as objectPath from 'object-path';

type BagItems = Record<string, unknown>;

export default class Bag implements BagItems {
  [x: string]: unknown;

  constructor(items: BagItems = {}) {
    Object.keys(items).forEach((key) => {
      this.set(key, items[key]);
    });
  }

  get(path: string) {
    return objectPath.get(this, path);
  }

  set(path: string, value: unknown): this {
    objectPath.set(this, path, value);
    return this;
  }

  merge(...items: BagItems[]): this {
    const nextState = deepmerge.all<BagItems>([this, ...items], {
      // Replacing array with next value
      arrayMerge: (_destinationArray: unknown[], sourceArray: unknown[]) => sourceArray,
      // Merge only array & plain object
      isMergeableObject: (o: object) => o?.constructor === Array || o?.constructor === Object
    });

    Object.keys(nextState).forEach((key) => {
      this.set(key, nextState[key]);
    });

    return this;
  }

  all() {
    const all: BagItems = {};

    Object.keys(this).forEach((key) => {
      all[key] = this[key];
    });

    return all;
  }
}
