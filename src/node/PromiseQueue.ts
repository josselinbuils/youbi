import { Deferred } from '@josselinbuils/utils';
import { Logger } from './Logger';

const logger = Logger.create('PromiseQueue');

export class PromiseQueue {
  private pool: Promise<any>[] = [];
  private queue: QueueElement[] = [];

  static create(maxConcurrent: number): PromiseQueue {
    return new PromiseQueue(maxConcurrent);
  }

  async enqueue(handler: () => Promise<any>): Promise<any> {
    const deferred = new Deferred();
    const element = { deferred, handler };

    if (this.pool.length < this.maxConcurrent) {
      this.exec(element);
    } else {
      this.queue.push(element);
    }

    return deferred.promise;
  }

  private dequeue(): void {
    const nextElement = this.queue.shift();

    if (nextElement !== undefined) {
      this.exec(nextElement);
    }
  }

  private exec(element: QueueElement): void {
    try {
      const promise = element
        .handler()
        .then(element.deferred.resolve)
        .catch(element.deferred.reject)
        .then(() => this.pool.splice(this.pool.indexOf(promise), 1))
        .then(() => this.dequeue()) as Promise<void>;

      this.pool.push(promise);
    } catch (error) {
      logger.error(error);
    }
  }

  private constructor(private maxConcurrent: number) {}
}

interface QueueElement {
  deferred: Deferred<any>;

  handler(): Promise<any>;
}
