import * as deepmerge from 'deepmerge';
import * as objectPath from 'object-path';
export default class Bag {
    constructor(collection = {}) {
        this.collection = collection;
    }
    get(path) {
        return objectPath.get(this.collection, path);
    }
    set(path, value) {
        objectPath.set(this.collection, path, value);
        return this;
    }
    merge(...collection) {
        this.collection = deepmerge.all([this.collection, ...collection], {
            arrayMerge: (_destinationArray, sourceArray) => sourceArray,
            isMergeableObject: (o) => (o === null || o === void 0 ? void 0 : o.constructor) === Array || (o === null || o === void 0 ? void 0 : o.constructor) === Object
        });
        return this;
    }
    all() {
        return this.collection;
    }
}
