import type Klient from '.';

export type Extension = {
  name: string;
  initialize: (klient: Klient) => void;
};

class Extensions extends Array<Extension> {
  load(klient: Klient, extensions?: string[]): void {
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
