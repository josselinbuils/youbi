import ElectronStore from 'electron-store';

export class Store {
  static instance: Store;

  static getInstance(): Store {
    if (this.instance === undefined) {
      this.instance = new Store(new ElectronStore());
    }
    return this.instance;
  }

  get<T>(key: string): T {
    return this.internalStore.get(key) as T;
  }

  has(key: string): boolean {
    return this.internalStore.has(key);
  }

  set<T>(key: string, value: T): void {
    if (this.has(key)) {
      this.internalStore.delete(key);
    }
    this.internalStore.set(key, value);
  }

  // eslint-disable-next-line no-useless-constructor
  private constructor(private internalStore: ElectronStore) {}
}
