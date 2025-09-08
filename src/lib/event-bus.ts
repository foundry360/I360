type EventCallback = (data?: any) => void;

class EventBus {
  private listeners: Record<string, EventCallback[]> = {};

  on(event: string, callback: EventCallback) {
    if (!this.listeners[event]) {
      this.listeners[event] = [];
    }
    this.listeners[event].push(callback);
  }

  off(event: string, callback: EventCallback) {
    if (!this.listeners[event]) return;

    this.listeners[event] = this.listeners[event].filter(
      (listener) => listener !== callback
    );
  }

  dispatch(event: string, data?: any) {
    if (!this.listeners[event]) return;

    this.listeners[event].forEach((listener) => listener(data));
  }
}

const eventBus = new EventBus();

export default eventBus;
