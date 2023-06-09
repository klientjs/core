declare type BagItems = Record<string, unknown>;
export default class Bag {
    private items;
    constructor(items?: BagItems);
    get(path: string): any;
    set(path: string, value: unknown): this;
    merge(...items: BagItems[]): this;
    all(): BagItems;
}
export {};
