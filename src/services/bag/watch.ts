import * as objectPath from 'object-path';
import * as deepDiff from 'deep-diff';

export type Watchable = object;
export type WatchCallback<T = unknown, Z = T> = (next: T, prev: Z) => void;

type WatcherItem = { callback: WatchCallback; deep: boolean };

/**
 * Each watchable object is stored with a generated ID
 */
const instances: Record<string, Watchable> = {};

/**
 * All watchers attached to watchable objects are stored as described below :
 *
 * watchers = {
 *   'watchableObjectID: {          // Storage is accessible with Instance ID
 *     'path.to.property': [        // Watchers are grouped by target path
 *         { callback, deep },
 *     ]
 *   }
 * }
 */
const watchers: Record<string, Record<string, WatcherItem[]>> = {};

/**
 * Determine the instance ID for given watchable object.
 */
function getInstanceId(watchable: Watchable) {
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

/**
 * Extract watchers collection, grouped by path, for given watchable object
 */
export function getWatchers(watchable: Watchable) {
  const id = getInstanceId(watchable);

  if (!watchers[id]) {
    watchers[id] = {};
  }

  return watchers[id];
}

/**
 * Register callback to listen changes made on specific path of given watchable object
 */
export function watch<T extends Watchable>(watchable: T, path: string, onChange: WatchCallback, deep: boolean): T {
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

/**
 * Unregister watcher callback for given path
 */
export function unwatch<T extends Watchable>(watchable: T, path: string, onChange: WatchCallback): T {
  const id = getInstanceId(watchable);

  watchers[id] = getWatchers(watchable);

  const collection = watchers[id][path] || [];
  let index: number | null = null;

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

/**
 * Invoke all watchers attached to given watchable object with prev and next state
 */
export function invokeWatchers<T extends Watchable>(watchable: T, next: object, prev: object): T {
  const watched = getWatchers(watchable);
  const watchedPaths = Object.keys(watched);

  if (watchedPaths.length === 0) {
    return watchable;
  }

  const changedPaths = deepDiff(prev, next)?.map((diff) => (diff.path as string[]).join('.'));
  const invoked: WatcherItem[] = [];

  changedPaths?.forEach((path) => {
    watchedPaths.forEach((targetPath) => {
      if (!path.startsWith(targetPath)) return;

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
