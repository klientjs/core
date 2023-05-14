"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const deepmerge = require("deepmerge");
const objectPath = require("object-path");
class Bag {
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
exports.default = Bag;
