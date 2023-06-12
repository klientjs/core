import { Watchable, WatchCallback } from './watch';
declare type BagItems = Record<string, unknown>;
export default class Bag implements BagItems, Watchable {
    [x: string]: unknown;
    constructor(items?: BagItems);
    get watchers(): Record<string, {
        callback: WatchCallback<unknown, unknown>;
        deep: boolean;
    }[]>;
    get(path: string): any;
    all(): import("../../toolbox/object").AnyObject;
    set(path: string, value: unknown): this;
    merge(...items: BagItems[]): this;
    watch(path: string, onChange: WatchCallback, deep?: boolean): this;
    unwatch(path: string, onChange: WatchCallback): this;
}
export {};
