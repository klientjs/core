"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const deepmerge = require("deepmerge");
const objectPath = require("object-path");
class Bag {
    constructor(items = {}) {
        Object.keys(items).forEach((key) => {
            this.set(key, items[key]);
        });
    }
    get(path) {
        return objectPath.get(this, path);
    }
    set(path, value) {
        objectPath.set(this, path, value);
        return this;
    }
    merge(...items) {
        const nextState = deepmerge.all([this, ...items], {
            arrayMerge: (_destinationArray, sourceArray) => sourceArray,
            isMergeableObject: (o) => (o === null || o === void 0 ? void 0 : o.constructor) === Array || (o === null || o === void 0 ? void 0 : o.constructor) === Object
        });
        Object.keys(nextState).forEach((key) => {
            this.set(key, nextState[key]);
        });
        return this;
    }
    all() {
        const all = {};
        Object.keys(this).forEach((key) => {
            all[key] = this[key];
        });
        return all;
    }
}
exports.default = Bag;
