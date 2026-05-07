import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Twin, Simulation, TwinModel, SimulationReport } from '@twinforge/shared';

interface AppState {
  // Twin management
  twins: Twin[];
  activeTwinId: string | null;
  archivedTwinIds: string[];
  setTwins: (twins: Twin[]) => void;
  addTwin: (twin: Twin) => void;
  updateTwin: (id: string, patch: Partial<Twin>) => void;
  removeTwin: (id: string) => void;
  setActiveTwin: (id: string | null) => void;
  archiveTwin: (id: string) => void;
  unarchiveTwin: (id: string) => void;

  // Simulation management
  simulations: Simulation[];
  activeSimulationId: string | null;
  addSimulation: (sim: Simulation) => void;
  updateSimulation: (id: string, patch: Partial<Simulation>) => void;
  setActiveSimulation: (id: string | null) => void;

  // Library state
  selectedModel: TwinModel | null;
  setSelectedModel: (model: TwinModel | null) => void;
  librarySearch: string;
  setLibrarySearch: (q: string) => void;
  libraryCategory: 'all' | 'human' | 'industrial';
  setLibraryCategory: (cat: 'all' | 'human' | 'industrial') => void;
  libraryComplexity: string[];
  setLibraryComplexity: (c: string[]) => void;

  // Studio state
  studioTwinName: string;
  setStudioTwinName: (name: string) => void;

  // Simulation progress
  simulationProgress: number;
  simulationMessage: string;
  simulationRunning: boolean;
  activeReport: SimulationReport | null;
  setSimulationProgress: (pct: number, msg: string) => void;
  setSimulationRunning: (running: boolean) => void;
  setActiveReport: (report: SimulationReport | null) => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      // Twins
      twins: [],
      activeTwinId: null,
      archivedTwinIds: [],
      setTwins: (twins) => set({ twins }),
      addTwin: (twin) => set((s) => ({ twins: [...s.twins, twin] })),
      updateTwin: (id, patch) =>
        set((s) => ({
          twins: s.twins.map((t) => (t.id === id ? { ...t, ...patch } : t)),
        })),
      removeTwin: (id) =>
        set((s) => ({
          twins: s.twins.filter((t) => t.id !== id),
          archivedTwinIds: s.archivedTwinIds.filter((aid) => aid !== id),
          activeTwinId: s.activeTwinId === id ? null : s.activeTwinId,
        })),
      setActiveTwin: (id) => set({ activeTwinId: id }),
      archiveTwin: (id) =>
        set((s) => ({ archivedTwinIds: [...s.archivedTwinIds.filter((x) => x !== id), id] })),
      unarchiveTwin: (id) =>
        set((s) => ({ archivedTwinIds: s.archivedTwinIds.filter((x) => x !== id) })),

      // Simulations
      simulations: [],
      activeSimulationId: null,
      addSimulation: (sim) =>
        set((s) => ({ simulations: [sim, ...s.simulations] })),
      updateSimulation: (id, patch) =>
        set((s) => ({
          simulations: s.simulations.map((sim) =>
            sim.id === id ? { ...sim, ...patch } : sim
          ),
        })),
      setActiveSimulation: (id) => set({ activeSimulationId: id }),

      // Library
      selectedModel: null,
      setSelectedModel: (model) => set({ selectedModel: model }),
      librarySearch: '',
      setLibrarySearch: (q) => set({ librarySearch: q }),
      libraryCategory: 'all',
      setLibraryCategory: (cat) => set({ libraryCategory: cat }),
      libraryComplexity: [],
      setLibraryComplexity: (c) => set({ libraryComplexity: c }),

      // Studio
      studioTwinName: '',
      setStudioTwinName: (name) => set({ studioTwinName: name }),

      // Simulation progress
      simulationProgress: 0,
      simulationMessage: '',
      simulationRunning: false,
      activeReport: null,
      setSimulationProgress: (pct, msg) =>
        set({ simulationProgress: pct, simulationMessage: msg }),
      setSimulationRunning: (running) => set({ simulationRunning: running }),
      setActiveReport: (report) => set({ activeReport: report }),
    }),
    {
      name: 'twinforge-app',
      partialize: (s) => ({
        twins: s.twins,
        simulations: s.simulations,
        archivedTwinIds: s.archivedTwinIds,
      }),
    }
  )
);
