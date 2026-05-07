import { useNavigate } from 'react-router-dom';
import { useAppStore } from '@/store/appStore';
import TwinCard from '@/components/dashboard/TwinCard';
import SimulationHistoryLog from '@/components/dashboard/SimulationHistoryLog';

export default function Dashboard() {
  const navigate = useNavigate();
  const twins = useAppStore((s) => s.twins);
  const simulations = useAppStore((s) => s.simulations);

  const avgHealth = twins.length > 0
    ? Math.round(twins.reduce((a, t) => a + t.healthScore, 0) / twins.length)
    : null;

  return (
    <div className="p-6 max-w-6xl mx-auto">
      {/* KPI strip */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        {[
          { label: 'Active Twins', value: twins.length, accent: 'text-primary' },
          { label: 'Simulations Run', value: simulations.length, accent: 'text-accent' },
          { label: 'Avg. Health Score', value: avgHealth !== null ? avgHealth : '—', accent: 'text-success' },
        ].map(({ label, value, accent }) => (
          <div key={label} className="card-elevated text-center py-5">
            <p className={`text-3xl font-bold ${accent}`}>{value}</p>
            <p className="text-xs text-txt-muted mt-1">{label}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Active twins */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-txt-primary">Active Twins</h2>
            <button onClick={() => navigate('/library')} className="btn-primary text-xs py-1.5 px-3">
              + Spawn Twin
            </button>
          </div>

          {twins.length === 0 ? (
            <div className="card text-center py-12">
              <div className="w-12 h-12 rounded-full bg-bg-elevated border border-border flex items-center justify-center mx-auto mb-3">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-5 h-5 text-txt-muted">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                </svg>
              </div>
              <p className="text-sm text-txt-secondary">No twins yet</p>
              <p className="text-xs text-txt-muted mt-1">Browse the model library and spawn your first twin</p>
              <button onClick={() => navigate('/library')} className="btn-primary text-xs mt-4">
                Browse Library
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {twins.map((twin) => (
                <TwinCard key={twin.id} twin={twin} />
              ))}
            </div>
          )}
        </div>

        {/* Simulation history */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-txt-primary">Simulation History</h2>
            <span className="text-xs text-txt-muted">{simulations.length} total</span>
          </div>
          <SimulationHistoryLog />
        </div>
      </div>
    </div>
  );
}
