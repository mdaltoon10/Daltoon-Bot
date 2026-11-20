// Global event bus for instant synchronization across components in the same client window
type SyncListener = (event: string, data?: any) => void;

class GlobalSyncBus {
  private listeners: Set<SyncListener> = new Set();

  subscribe(listener: SyncListener): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  emit(event: string, data?: any): void {
    this.listeners.forEach((listener) => {
      try {
        listener(event, data);
      } catch (err) {
        console.warn("[GlobalSyncBus] listener error:", err);
      }
    });
  }
}

export const globalSyncBus = new GlobalSyncBus();
