"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class Extensions extends Array {
    load(klient, extensions) {
        for (let i = 0, len = this.length; i < len; i += 1) {
            const { name, initialize } = this[i];
            if (!klient.extensions.includes(name) && (!extensions || extensions.includes(name))) {
                initialize(klient);
                klient.extensions.push(name);
            }
        }
    }
}
exports.default = new Extensions();
