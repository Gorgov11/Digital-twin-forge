import { useNavigate } from 'react-router-dom';
import type { Simulation } from '@twinforge/shared';
import RiskBadge from '@/components/simulation/RiskBadge';
import { useAppStore } from '@/store/appStore';

export default function SimulationHistoryLog() {
  const navigate = useNavigate();
  const simulations = useAppStore((s) => s.simulations);
  const setActiveReport = useAppStore((s) => s.setActiveReport);

  function openReport(sim: Simulation) {
    if (sim.report) {
      setActiveReport(sim.report);
      navigate(`/simulation/${sim.id}`);
    }
  }

  if (simulations.length === 0) {
    return (
      <div className="card text-center py-12">
        <div className="w-12 h-12 rounded-full bg-bg-elevated border border-border flex items-center justify-center mx-auto mb-3">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-5 h-5 text-txt-muted">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 17.25v1.007a3 3 0 01-.879 2.122L7.5 21h9l-.621-.621A3 3 0 0115 18.257V17.25m6-12V15a2.25 2.25 0 01-2.25 2.25H5.25A2.25 2.25 0 013 15V5.25m18 0A2.25 2.25 0 0018.75 3H5.25A2.25 2.25 0 003 5.25m18 0H3" />
          </svg>
        </div>
        <p className="text-sm text-txt-secondary">No simulations yet</p>
        <p className="text-xs text-txt-muted mt-1">Run a simulation in the Twin Studio</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {simulations.map((sim) => (
        <div
          key={sim.id}
          onClick={() => openReport(sim)}
          className={[
            'card flex items-center gap-4 transition-all',
            sim.status === 'complete' ? 'cursor-pointer hover:border-border-bright hover:bg-bg-elevated' : '',
          ].join(' ')}
        >
          <RiskBadge level={sim.overallRisk} />

          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold text-txt-primary truncate">{sim.scenarioName}</p>
            <p className="text-[10px] text-txt-muted truncate">Twin: {sim.twinName}</p>
          </div>

          <div className="text-right shrink-0">
            <p className="text-[10px] text-txt-muted">
              {new Date(sim.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
            </p>
            {sim.status === 'running' && (
              <span className="flex items-center gap-1 text-[10px] text-primary justify-end mt-0.5">
                <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                Running…
              </span>
            )}
            {sim.status === 'complete' && (
              <span className="text-[10px] text-txt-muted">Open →</span>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
