import axios from 'axios';
import type { Twin, Simulation, SimulationReport } from '@twinforge/shared';

const client = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? 'http://localhost:3001',
  headers: { 'Content-Type': 'application/json' },
});

// ── Twins ─────────────────────────────────────────────────────────────────────

export async function fetchTwins(): Promise<Twin[]> {
  const { data } = await client.get('/api/twins');
  return data;
}

export async function createTwin(twin: Omit<Twin, 'id' | 'createdAt' | 'updatedAt' | 'simulationCount'>): Promise<Twin> {
  const { data } = await client.post('/api/twins', twin);
  return data;
}

export async function updateTwin(id: string, patch: Partial<Twin>): Promise<Twin> {
  const { data } = await client.patch(`/api/twins/${id}`, patch);
  return data;
}

export async function deleteTwin(id: string): Promise<void> {
  await client.delete(`/api/twins/${id}`);
}

// ── Simulations ───────────────────────────────────────────────────────────────

export async function fetchSimulations(twinId?: string): Promise<Simulation[]> {
  const params = twinId ? { twinId } : {};
  const { data } = await client.get('/api/simulations', { params });
  return data;
}

export async function fetchSimulation(id: string): Promise<Simulation> {
  const { data } = await client.get(`/api/simulations/${id}`);
  return data;
}

export async function runSimulation(payload: {
  twinId: string;
  twinName: string;
  scenarioId: string;
  scenarioName: string;
  category: string;
  params: object;
}): Promise<{ simulationId: string }> {
  const { data } = await client.post('/api/simulations', payload);
  return data;
}

// SSE stream for simulation progress
export function streamSimulationProgress(
  simulationId: string,
  onProgress: (pct: number, message: string) => void,
  onComplete: (report: SimulationReport) => void,
  onError: (err: Error) => void
): () => void {
  const url = `${import.meta.env.VITE_API_URL ?? 'http://localhost:3001'}/api/simulations/${simulationId}/stream`;
  const es = new EventSource(url);

  es.addEventListener('progress', (e) => {
    const { percent, message } = JSON.parse(e.data);
    onProgress(percent, message);
  });

  es.addEventListener('complete', (e) => {
    const report: SimulationReport = JSON.parse(e.data);
    onComplete(report);
    es.close();
  });

  es.addEventListener('error', () => {
    onError(new Error('Simulation stream error'));
    es.close();
  });

  return () => es.close();
}
