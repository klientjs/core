declare type BagItems = Record<string, unknown>;
export default class Bag implements BagItems {
    [x: string]: unknown;
    constructor(items?: BagItems);
    get(path: string): any;
    set(path: string, value: unknown): this;
    merge(...items: BagItems[]): this;
    all(): BagItems;
}
export {};
