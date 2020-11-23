import ElectronStore from 'electron-store';

export class Store {
  static instance: Store;

  static getInstance(): Store {
    if (this.instance === undefined) {
      this.instance = new Store(new ElectronStore());
    }
    return this.instance;
  }

  get(key: string): any {
    return this.internalStore.get(key);
  }

  has(key: string): boolean {
    return this.internalStore.has(key);
  }

  set(key: string, value: any): void {
    this.internalStore.set(key, value);
  }

  // eslint-disable-next-line no-useless-constructor
  private constructor(private internalStore: ElectronStore) {}
}