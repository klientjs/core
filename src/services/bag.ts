import * as deepmerge from 'deepmerge';
import * as objectPath from 'object-path';

type BagItems = Record<string, unknown>;

export default class Bag {
  constructor(private items: BagItems = {}) {}

  get(path: string) {
    return objectPath.get(this.items, path);
  }

  set(path: string, value: unknown): this {
    objectPath.set(this.items, path, value);
    return this;
  }

  merge(...items: BagItems[]): this {
    this.items = deepmerge.all<BagItems>([this.items, ...items], {
      // Replacing array with next value
      arrayMerge: (_destinationArray: unknown[], sourceArray: unknown[]) => sourceArray,
      // Merge only array & plain object
      isMergeableObject: (o: object) => o?.constructor === Array || o?.constructor === Object
    });

    return this;
  }

  all() {
    return this.items;
  }
}
