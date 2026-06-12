/**
 * Type-safe event emitter that enforces event names and payload types via a generic Events map.
 */
export class TypedEventEmitter<Events extends Record<string, any>> {
  private listeners = new Map<keyof Events, Set<(payload: any) => void>>();

  /**
   * Registers an event listener.
   * @param event - The event name to listen for
   * @param listener - Callback invoked when the event is emitted
   * @returns An unsubscribe function that removes this listener when called
   */
  on<K extends keyof Events>(
    event: K,
    listener: (payload: Events[K]) => void,
  ): () => void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event)!.add(listener);
    return () => this.off(event, listener);
  }

  /**
   * Registers a one-time event listener that automatically unsubscribes after first invocation.
   * @param event - The event name to listen for
   * @param listener - Callback invoked once when the event is emitted
   * @returns An unsubscribe function that removes this listener when called
   */
  once<K extends keyof Events>(
    event: K,
    listener: (payload: Events[K]) => void,
  ): () => void {
    const wrapper = (payload: Events[K]) => {
      this.off(event, wrapper);
      listener(payload);
    };
    return this.on(event, wrapper);
  }

  /**
   * Removes an event listener.
   * @param event - The event name
   * @param listener - The listener function to remove
   */
  off<K extends keyof Events>(
    event: K,
    listener: (payload: Events[K]) => void,
  ): void {
    const eventListeners = this.listeners.get(event);
    if (eventListeners) {
      eventListeners.delete(listener);
    }
  }

  /**
   * Emits an event to all registered listeners, invoking them synchronously in registration order.
   * @param event - The event name to emit
   * @param payload - The payload to pass to all listeners
   * @throws The first error thrown by any listener (subsequent listener errors are swallowed)
   */
  emit<K extends keyof Events>(event: K, payload: Events[K]): void {
    const eventListeners = this.listeners.get(event);
    if (!eventListeners || eventListeners.size === 0) {
      return;
    }

    const listenersSnapshot = Array.from(eventListeners);
    const errors: Error[] = [];

    for (const listener of listenersSnapshot) {
      try {
        listener(payload);
      } catch (error) {
        errors.push(error instanceof Error ? error : new Error(String(error)));
      }
    }

    if (errors.length > 0) {
      throw errors[0];
    }
  }

  /**
   * Returns the number of listeners registered for an event.
   * @param event - The event name
   * @returns The count of registered listeners
   */
  listenerCount(event: keyof Events): number {
    return this.listeners.get(event)?.size ?? 0;
  }
}
