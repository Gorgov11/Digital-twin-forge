import { useState, useEffect } from 'react';

export type ApiStatus = 'checking' | 'online' | 'offline';

const BASE = import.meta.env.VITE_API_URL ?? 'http://localhost:3001';

// Module-level cache so every component gets the same status without duplicate fetches
let cached: ApiStatus | null = null;
const subscribers = new Set<(s: ApiStatus) => void>();

function broadcast(status: ApiStatus) {
  cached = status;
  subscribers.forEach((fn) => fn(status));
}

let probeStarted = false;
function probe() {
  if (probeStarted) return;
  probeStarted = true;
  fetch(`${BASE}/api/twins`, { method: 'GET' })
    .then(() => broadcast('online'))
    .catch(() => broadcast('offline'));
}

export function useApiStatus(): ApiStatus {
  const [status, setStatus] = useState<ApiStatus>(cached ?? 'checking');

  useEffect(() => {
    if (cached) {
      setStatus(cached);
      return;
    }
    subscribers.add(setStatus);
    probe();
    return () => { subscribers.delete(setStatus); };
  }, []);

  return status;
}
