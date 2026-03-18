export async function register() {
  // Node.js 25+ ships a built-in localStorage that requires --localstorage-file
  // to work properly. Without it, localStorage exists but getItem/setItem throw.
  // Firebase Auth (and other libs) detect localStorage exists and try to use it,
  // causing "localStorage.getItem is not a function" errors during SSR.
  // Fix: replace the broken global with a simple in-memory shim on the server.
  if (typeof window === "undefined") {
    const storage = new Map<string, string>();
    (globalThis as Record<string, unknown>).localStorage = {
      getItem: (key: string) => storage.get(key) ?? null,
      setItem: (key: string, value: string) => storage.set(key, String(value)),
      removeItem: (key: string) => storage.delete(key),
      clear: () => storage.clear(),
      get length() {
        return storage.size;
      },
      key: (index: number) => [...storage.keys()][index] ?? null,
    };
  }
}
