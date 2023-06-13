"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const deepmerge = require("deepmerge");
const objectPath = require("object-path");
const object_1 = require("../../toolbox/object");
const watch_1 = require("./watch");
class Bag {
    constructor(items = {}) {
        Object.keys(items).forEach((key) => {
            this[key] = items[key];
        });
    }
    get watchers() {
        return (0, watch_1.getWatchers)(this);
    }
    has(path) {
        return objectPath.get(this, path) !== undefined;
    }
    get(path) {
        return objectPath.get(this.all(), path);
    }
    all() {
        return (0, object_1.softClone)(this);
    }
    set(path, value) {
        const prevState = this.all();
        objectPath.set(this, path, value);
        return (0, watch_1.invokeWatchers)(this, this.all(), prevState);
    }
    merge(...items) {
        const prevState = this.all();
        const nextState = deepmerge.all([this.all(), ...items], {
            arrayMerge: (_destinationArray, sourceArray) => sourceArray,
            isMergeableObject: (o) => (0, object_1.isPlainArray)(o) || (0, object_1.isPlainObject)(o)
        });
        Object.keys(nextState).forEach((key) => {
            this[key] = nextState[key];
        });
        return (0, watch_1.invokeWatchers)(this, nextState, prevState);
    }
    watch(path, onChange, deep = false) {
        return (0, watch_1.watch)(this, path, onChange, deep);
    }
    unwatch(path, onChange) {
        return (0, watch_1.unwatch)(this, path, onChange);
    }
}
exports.default = Bag;
