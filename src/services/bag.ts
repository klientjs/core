import * as deepmerge from 'deepmerge';
import * as objectPath from 'object-path';

type Collection = { [alias: string]: unknown };

export default class Bag {
  constructor(private collection: Collection = {}) {}

  get(path: string) {
    return objectPath.get(this.collection, path);
  }

  set(path: string, value: unknown): this {
    objectPath.set(this.collection, path, value);
    return this;
  }

  merge(...collection: Collection[]): this {
    this.collection = deepmerge.all<Collection>([this.collection, ...collection], {
      // Replacing array with next value
      arrayMerge: (_destinationArray: unknown[], sourceArray: unknown[]) => sourceArray,
      // Merge only array & plain object
      isMergeableObject: (o: object) => o?.constructor === Array || o?.constructor === Object
    });

    return this;
  }

  all() {
    return this.collection;
  }
}
