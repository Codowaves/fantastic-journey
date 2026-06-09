export type EventMap = Record<string, unknown[]>;

type Listener<Event extends unknown[]> = (...args: Event) => void;

/**
 * A typed event emitter that is fully type-safe over the provided event map.
 * Listeners are invoked in registration order.
 */
export class EventEmitter<Events extends EventMap> {
  private listeners: { [K in keyof Events]?: Set<Listener<Events[K]>> } = {};

  on<K extends keyof Events>(event: K, listener: Listener<Events[K]>): this {
    let set = this.listeners[event];
    if (!set) {
      set = new Set();
      this.listeners[event] = set;
    }
    set.add(listener);
    return this;
  }

  off<K extends keyof Events>(event: K, listener: Listener<Events[K]>): this {
    const set = this.listeners[event];
    if (!set) return this;
    set.delete(listener);
    if (set.size === 0) {
      delete this.listeners[event];
    }
    return this;
  }

  once<K extends keyof Events>(event: K, listener: Listener<Events[K]>): this {
    const wrapper: Listener<Events[K]> = (...args) => {
      this.off(event, wrapper);
      listener(...args);
    };
    return this.on(event, wrapper);
  }

  emit<K extends keyof Events>(event: K, ...args: Events[K]): boolean {
    const set = this.listeners[event];
    if (!set || set.size === 0) return false;
    for (const listener of [...set]) {
      listener(...args);
    }
    return true;
  }
}
