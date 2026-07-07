/**
 * A type-safe event emitter where event names and their payload types are
 * declared via the `Events` generic parameter, giving compile-time guarantees
 * on `emit` and listener callbacks.
 */
export class TypedEventEmitter<Events extends Record<string, any>> {
  private listeners = new Map<keyof Events, Set<(payload: any) => void>>();

  /**
   * Registers a listener for the given event and returns an unsubscribe
   * function that removes the listener when called.
   *
   * @param event - The event name to listen for.
   * @param listener - Callback invoked with the event payload when emitted.
   * @returns A function that, when called, removes the registered listener.
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
   * Registers a listener that is automatically removed after it fires once,
   * and returns an unsubscribe function for early removal.
   *
   * @param event - The event name to listen for once.
   * @param listener - Callback invoked exactly once with the event payload.
   * @returns A function that, when called, removes the registered listener
   *   before it has fired.
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
   * Removes a previously registered listener for the given event. No-op if
   * the listener was not registered.
   *
   * @param event - The event name whose listener should be removed.
   * @param listener - The exact listener function reference to remove.
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
   * Synchronously invokes every registered listener for the event in
   * registration order. If any listener throws, remaining listeners still
   * run and the first collected error is re-thrown after all have been
   * called.
   *
   * @param event - The event name to emit.
   * @param payload - The payload value matching the declared type for the event.
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
   * Returns the number of listeners currently registered for the event.
   *
   * @param event - The event name to count listeners for.
   * @returns The number of registered listeners, or `0` if none.
   */
  listenerCount(event: keyof Events): number {
    return this.listeners.get(event)?.size ?? 0;
  }
}
