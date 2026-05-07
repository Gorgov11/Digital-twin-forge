import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import type { HumanParams, IndustrialParams, ScenarioPreset, SimulationReport } from '@twinforge/shared';
import { getModelById } from '@/lib/models';
import { computeHealthScore } from '@/lib/healthScore';
import { useAppStore } from '@/store/appStore';
import ModelPreview3D from '@/components/library/ModelPreview3D';
import HumanParamForm, { DEFAULT_HUMAN_PARAMS } from '@/components/studio/HumanParamForm';
import IndustrialParamForm, { DEFAULT_INDUSTRIAL_PARAMS } from '@/components/studio/IndustrialParamForm';
import TwinHealthScore from '@/components/studio/TwinHealthScore';
import ScenarioSelector from '@/components/studio/ScenarioSelector';
import ReportRenderer from '@/components/simulation/ReportRenderer';
import { generateMockReport } from '@/lib/mockSimulation';

type Tab = 'params' | 'scenarios' | 'report';

export default function Studio() {
  const { modelId, twinId } = useParams<{ modelId?: string; twinId?: string }>();
  const navigate = useNavigate();

  const twins = useAppStore((s) => s.twins);
  const addTwin = useAppStore((s) => s.addTwin);
  const updateTwin = useAppStore((s) => s.updateTwin);
  const addSimulation = useAppStore((s) => s.addSimulation);
  const updateSimulation = useAppStore((s) => s.updateSimulation);

  // Resolve model
  const existingTwin = twinId ? twins.find((t) => t.id === twinId) : undefined;
  const model = getModelById(existingTwin?.modelId ?? modelId ?? '');

  const [tab, setTab] = useState<Tab>('params');
  const [twinName, setTwinName] = useState(existingTwin?.name ?? `My ${model?.name ?? 'Twin'}`);
  const [humanParams, setHumanParams] = useState<HumanParams>(
    (existingTwin?.params as HumanParams) ?? DEFAULT_HUMAN_PARAMS
  );
  const [industrialParams, setIndustrialParams] = useState<IndustrialParams>(
    (existingTwin?.params as IndustrialParams) ?? DEFAULT_INDUSTRIAL_PARAMS
  );
  const [selectedScenario, setSelectedScenario] = useState<ScenarioPreset | null>(null);
  const [running, setRunning] = useState(false);
  const [progress, setProgress] = useState(0);
  const [progressMsg, setProgressMsg] = useState('');
  const [report, setReport] = useState<SimulationReport | null>(null);
  const [savedTwinId, setSavedTwinId] = useState<string | null>(existingTwin?.id ?? null);

  const category = model?.category ?? 'human';
  const params = category === 'human' ? humanParams : industrialParams;
  const healthScore = computeHealthScore(params, category);

  useEffect(() => {
    if (!model) navigate('/library');
  }, [model, navigate]);

  const handleSaveTwin = useCallback(() => {
    if (!model) return;
    const now = new Date().toISOString();

    if (savedTwinId) {
      updateTwin(savedTwinId, {
        name: twinName,
        params,
        healthScore,
        updatedAt: now,
      });
    } else {
      const newTwin = {
        id: crypto.randomUUID(),
        name: twinName,
        modelId: model.id,
        category: model.category,
        params,
        healthScore,
        createdAt: now,
        updatedAt: now,
        simulationCount: 0,
      };
      addTwin(newTwin);
      setSavedTwinId(newTwin.id);
    }
  }, [model, twinName, params, healthScore, savedTwinId, addTwin, updateTwin]);

  const handleRunSimulation = useCallback(async () => {
    if (!selectedScenario || !model) return;

    // Auto-save twin first
    let currentTwinId = savedTwinId;
    if (!currentTwinId) {
      const now = new Date().toISOString();
      const newTwin = {
        id: crypto.randomUUID(),
        name: twinName,
        modelId: model.id,
        category: model.category,
        params,
        healthScore,
        createdAt: now,
        updatedAt: now,
        simulationCount: 0,
      };
      addTwin(newTwin);
      currentTwinId = newTwin.id;
      setSavedTwinId(currentTwinId);
    }

    const simId = crypto.randomUUID();
    addSimulation({
      id: simId,
      twinId: currentTwinId,
      twinName,
      scenarioId: selectedScenario.id,
      scenarioName: selectedScenario.name,
      overallRisk: selectedScenario.estimatedRisk,
      status: 'running',
      createdAt: new Date().toISOString(),
    });

    setRunning(true);
    setProgress(0);
    setTab('report');

    // Simulate streaming progress
    const steps = [
      [10, 'Initialising twin state…'],
      [25, 'Loading scenario parameters…'],
      [40, 'Running AI inference engine…'],
      [60, 'Generating timeline phases…'],
      [75, 'Analysing risk factors…'],
      [88, 'Compiling recommendations…'],
      [95, 'Finalising report…'],
    ];

    for (const [pct, msg] of steps) {
      await new Promise((r) => setTimeout(r, 400 + Math.random() * 300));
      setProgress(pct as number);
      setProgressMsg(msg as string);
    }

    // Generate mock report (swap for real API call when ANTHROPIC_API_KEY is set)
    const generatedReport = generateMockReport({
      simId,
      twinId: currentTwinId,
      twinName,
      scenario: selectedScenario,
      params,
      category: model.category,
    });

    setProgress(100);
    setProgressMsg('Complete');
    setRunning(false);
    setReport(generatedReport);

    // Update store
    updateSimulation(simId, { status: 'complete', report: generatedReport, overallRisk: generatedReport.overallRisk });
    updateTwin(currentTwinId, {
      simulationCount: (twins.find((t) => t.id === currentTwinId)?.simulationCount ?? 0) + 1,
    });
  }, [selectedScenario, model, savedTwinId, twinName, params, healthScore, addTwin, addSimulation, updateSimulation, updateTwin, twins]);

  if (!model) return null;

  const TABS: { id: Tab; label: string; disabled?: boolean }[] = [
    { id: 'params', label: 'Parameters' },
    { id: 'scenarios', label: 'Scenarios' },
    { id: 'report', label: 'Report', disabled: !report && !running },
  ];

  return (
    <div className="flex h-full">
      {/* Left: 3D Viewer + controls */}
      <div className="w-72 shrink-0 flex flex-col border-r border-border bg-bg-surface">
        <div className="p-4 border-b border-border">
          <h2 className="text-sm font-semibold text-txt-primary truncate">{model.name}</h2>
          <p className="text-xs text-txt-muted capitalize">{model.category} twin</p>
        </div>

        {/* 3D Viewer */}
        <div className="p-3">
          <ModelPreview3D
            geometryType={model.geometryType}
            height="240px"
            interactive
            liveParams={{
              heartRate: humanParams.restingHeartRate,
              loadPercent: industrialParams.loadCyclePercent,
            }}
          />
        </div>

        {/* Twin name */}
        <div className="px-4 py-3 border-t border-border">
          <label className="label">Twin Name</label>
          <input
            type="text"
            value={twinName}
            onChange={(e) => setTwinName(e.target.value)}
            className="input text-sm"
          />
        </div>

        {/* Health score */}
        <div className="px-4 py-3 flex items-center gap-4 border-t border-border">
          <TwinHealthScore score={healthScore} size={80} />
          <div>
            <p className="text-xs text-txt-muted">Health Score</p>
            <p className="text-sm font-semibold text-txt-primary">Computed from parameters</p>
          </div>
        </div>

        {/* Save button */}
        <div className="px-4 py-3 border-t border-border mt-auto">
          <button onClick={handleSaveTwin} className="btn-secondary w-full justify-center text-xs">
            {savedTwinId ? 'Update Twin' : 'Save Twin'}
          </button>
          {savedTwinId && (
            <button
              onClick={() => navigate('/dashboard')}
              className="btn-ghost w-full justify-center text-xs mt-1.5"
            >
              View Dashboard →
            </button>
          )}
        </div>
      </div>

      {/* Right: Tabs (params / scenarios / report) */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Tab bar */}
        <div className="flex border-b border-border px-4 shrink-0 bg-bg-surface">
          {TABS.map((t) => (
            <button
              key={t.id}
              onClick={() => !t.disabled && setTab(t.id)}
              disabled={t.disabled}
              className={[
                'px-4 py-3 text-xs font-medium border-b-2 transition-colors -mb-px',
                tab === t.id
                  ? 'border-primary text-primary'
                  : t.disabled
                  ? 'border-transparent text-txt-disabled cursor-not-allowed'
                  : 'border-transparent text-txt-muted hover:text-txt-secondary',
              ].join(' ')}
            >
              {t.label}
              {t.id === 'report' && running && (
                <span className="ml-1.5 inline-block w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
              )}
            </button>
          ))}
        </div>

        {/* Tab content */}
        <div className="flex-1 overflow-y-auto">
          {tab === 'params' && (
            <div className="p-4">
              {category === 'human' ? (
                <HumanParamForm params={humanParams} onChange={setHumanParams} />
              ) : (
                <IndustrialParamForm params={industrialParams} onChange={setIndustrialParams} />
              )}
            </div>
          )}

          {tab === 'scenarios' && (
            <div className="h-full">
              <ScenarioSelector
                category={category}
                selected={selectedScenario}
                onSelect={setSelectedScenario}
                onRun={handleRunSimulation}
                running={running}
              />
            </div>
          )}

          {tab === 'report' && (
            <div className="p-6">
              {running ? (
                <div className="flex flex-col items-center justify-center py-20 gap-6">
                  <div className="relative w-20 h-20">
                    <svg className="animate-spin w-20 h-20 text-primary" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-20" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" />
                      <path className="opacity-90" stroke="currentColor" strokeWidth="2" strokeLinecap="round" d="M12 2a10 10 0 0110 10" />
                    </svg>
                    <span className="absolute inset-0 flex items-center justify-center text-sm font-bold text-primary">
                      {progress}%
                    </span>
                  </div>
                  <div className="text-center">
                    <p className="text-sm font-medium text-txt-primary">Running Simulation</p>
                    <p className="text-xs text-txt-muted mt-1 animate-pulse">{progressMsg}</p>
                  </div>
                  <div className="w-64 bg-bg-elevated rounded-full h-1.5 overflow-hidden">
                    <div
                      className="h-full bg-primary rounded-full transition-all duration-500"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                </div>
              ) : report ? (
                <ReportRenderer report={report} />
              ) : (
                <div className="flex flex-col items-center justify-center py-20 gap-3 text-center">
                  <p className="text-sm text-txt-secondary">No report yet</p>
                  <p className="text-xs text-txt-muted">Select a scenario and run simulation</p>
                  <button onClick={() => setTab('scenarios')} className="btn-primary mt-2 text-xs">
                    Choose Scenario
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
