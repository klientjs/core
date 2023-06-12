import * as deepmerge from 'deepmerge';
import * as objectPath from 'object-path';
import { isPlainObject, isPlainArray, softClone } from '../../toolbox/object';
import { watch, unwatch, invokeWatchers, getWatchers } from './watch';
export default class Bag {
    constructor(items = {}) {
        Object.keys(items).forEach((key) => {
            this[key] = items[key];
        });
    }
    get watchers() {
        return getWatchers(this);
    }
    get(path) {
        return objectPath.get(this.all(), path);
    }
    all() {
        return softClone(this);
    }
    set(path, value) {
        const prevState = this.all();
        objectPath.set(this, path, value);
        return invokeWatchers(this, this.all(), prevState);
    }
    merge(...items) {
        const prevState = this.all();
        const nextState = deepmerge.all([this.all(), ...items], {
            arrayMerge: (_destinationArray, sourceArray) => sourceArray,
            isMergeableObject: (o) => isPlainArray(o) || isPlainObject(o)
        });
        Object.keys(nextState).forEach((key) => {
            this[key] = nextState[key];
        });
        return invokeWatchers(this, nextState, prevState);
    }
    watch(path, onChange, deep = false) {
        return watch(this, path, onChange, deep);
    }
    unwatch(path, onChange) {
        return unwatch(this, path, onChange);
    }
}
