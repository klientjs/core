export default class Event {
    static NAME: string;
    readonly dispatch: {
        propagation: boolean;
        skipNextListeners: number;
        skipUntilListener?: number;
    };
    stopPropagation(): void;
    skipNextListeners(total: number): void;
    skipUntilListener(id: number): void;
}
