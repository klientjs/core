"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const deepmerge = require("deepmerge");
const objectPath = require("object-path");
class Bag {
    constructor(items = {}) {
        this.items = items;
    }
    get(path) {
        return objectPath.get(this.items, path);
    }
    set(path, value) {
        objectPath.set(this.items, path, value);
        return this;
    }
    merge(...items) {
        this.items = deepmerge.all([this.items, ...items], {
            arrayMerge: (_destinationArray, sourceArray) => sourceArray,
            isMergeableObject: (o) => (o === null || o === void 0 ? void 0 : o.constructor) === Array || (o === null || o === void 0 ? void 0 : o.constructor) === Object
        });
        return this;
    }
    all() {
        return this.items;
    }
}
exports.default = Bag;
