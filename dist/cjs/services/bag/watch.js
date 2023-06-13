"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.invokeWatchers = exports.unwatch = exports.watch = exports.getWatchers = void 0;
const objectPath = require("object-path");
const deepDiff = require("deep-diff");
const instances = {};
const watchers = {};
function getInstanceId(watchable) {
    const ids = Object.keys(instances);
    let id = null;
    for (let i = 0, len = ids.length; i < len; i += 1) {
        if (instances[ids[i]] === watchable) {
            id = ids[i];
            break;
        }
    }
    if (id === null) {
        id = Math.random().toString(36).substring(2);
        instances[id] = watchable;
    }
    return id;
}
function getWatchers(watchable) {
    const id = getInstanceId(watchable);
    if (!watchers[id]) {
        watchers[id] = {};
    }
    return watchers[id];
}
exports.getWatchers = getWatchers;
function watch(watchable, path, onChange, deep) {
    const id = getInstanceId(watchable);
    watchers[id] = getWatchers(watchable);
    const collection = watchers[id][path] || [];
    for (let i = 0, len = collection.length; i < len; i += 1) {
        if (collection[i].callback === onChange) {
            return watchable;
        }
    }
    collection.push({ callback: onChange, deep });
    watchers[id][path] = collection;
    return watchable;
}
exports.watch = watch;
function unwatch(watchable, path, onChange) {
    const id = getInstanceId(watchable);
    watchers[id] = getWatchers(watchable);
    const collection = watchers[id][path] || [];
    let index = null;
    for (let i = 0, len = collection.length; i < len; i += 1) {
        if (collection[i].callback === onChange) {
            index = i;
            break;
        }
    }
    if (index === null) {
        return watchable;
    }
    collection.splice(index, 1);
    watchers[id][path] = collection;
    return watchable;
}
exports.unwatch = unwatch;
function invokeWatchers(watchable, next, prev) {
    var _a;
    const watched = getWatchers(watchable);
    const watchedPaths = Object.keys(watched);
    if (watchedPaths.length === 0) {
        return watchable;
    }
    const changedPaths = (_a = deepDiff(prev, next)) === null || _a === void 0 ? void 0 : _a.map((diff) => diff.path.join('.'));
    const invoked = [];
    changedPaths === null || changedPaths === void 0 ? void 0 : changedPaths.forEach((path) => {
        watchedPaths.forEach((targetPath) => {
            if (!path.startsWith(targetPath))
                return;
            watched[targetPath].forEach((watcher) => {
                if ((path === targetPath || watcher.deep) && !invoked.includes(watcher)) {
                    watcher.callback(objectPath.get(next, targetPath), objectPath.get(prev, targetPath));
                    invoked.push(watcher);
                }
            });
        });
    });
    return watchable;
}
exports.invokeWatchers = invokeWatchers;
