export declare type Watchable = object;
export declare type WatchCallback<T = unknown, Z = T> = (next: T, prev: Z) => void;
declare type WatcherItem = {
    callback: WatchCallback;
    deep: boolean;
};
export declare function getWatchers(wachtable: Watchable): Record<string, WatcherItem[]>;
export declare function watch<T extends Watchable>(watchable: T, path: string, onChange: WatchCallback, deep: boolean): T;
export declare function unwatch<T extends Watchable>(watchable: T, path: string, onChange: WatchCallback): T;
export declare function invokeWatchers<T extends Watchable>(watchable: T, next: object, prev: object): T;
export {};
