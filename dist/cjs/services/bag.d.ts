declare type Collection = {
    [alias: string]: unknown;
};
export default class Bag {
    private collection;
    constructor(collection?: Collection);
    get(path: string): any;
    set(path: string, value: unknown): this;
    merge(...collection: Collection[]): this;
    all(): Collection;
}
export {};
