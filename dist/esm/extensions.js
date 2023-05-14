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
export default new Extensions();
