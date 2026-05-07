import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAppStore } from '@/store/appStore';
import TwinCard from '@/components/dashboard/TwinCard';
import SimulationHistoryLog from '@/components/dashboard/SimulationHistoryLog';
import PageTransition from '@/components/ui/PageTransition';

export default function Dashboard() {
  const navigate = useNavigate();
  const twins = useAppStore((s) => s.twins);
  const archivedTwinIds = useAppStore((s) => s.archivedTwinIds);
  const simulations = useAppStore((s) => s.simulations);
  const [showArchived, setShowArchived] = useState(false);

  const activeTwins = twins.filter((t) => !archivedTwinIds.includes(t.id));
  const archivedTwins = twins.filter((t) => archivedTwinIds.includes(t.id));

  const avgHealth = activeTwins.length > 0
    ? Math.round(activeTwins.reduce((a, t) => a + t.healthScore, 0) / activeTwins.length)
    : null;

  return (
    <PageTransition>
      <div className="p-6 max-w-6xl mx-auto">
        {/* KPI strip */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          {[
            { label: 'Active Twins', value: activeTwins.length, accent: 'text-primary' },
            { label: 'Simulations Run', value: simulations.length, accent: 'text-accent' },
            { label: 'Avg. Health Score', value: avgHealth !== null ? avgHealth : '—', accent: 'text-success' },
          ].map(({ label, value, accent }) => (
            <motion.div
              key={label}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.22 }}
              className="card-elevated text-center py-5"
            >
              <p className={`text-3xl font-bold ${accent}`}>{value}</p>
              <p className="text-xs text-txt-muted mt-1">{label}</p>
            </motion.div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Active twins */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <h2 className="text-sm font-semibold text-txt-primary">Active Twins</h2>
                {archivedTwins.length > 0 && (
                  <button
                    onClick={() => setShowArchived((v) => !v)}
                    className="text-[10px] text-txt-muted hover:text-txt-secondary transition-colors underline underline-offset-2"
                  >
                    {showArchived ? 'Hide' : 'Show'} archived ({archivedTwins.length})
                  </button>
                )}
              </div>
              <button onClick={() => navigate('/library')} className="btn-primary text-xs py-1.5 px-3">
                + Spawn Twin
              </button>
            </div>

            {activeTwins.length === 0 && !showArchived ? (
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
                <AnimatePresence>
                  {activeTwins.map((twin) => (
                    <TwinCard key={twin.id} twin={twin} archived={false} />
                  ))}
                  {showArchived && archivedTwins.map((twin) => (
                    <TwinCard key={twin.id} twin={twin} archived />
                  ))}
                </AnimatePresence>
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
    </PageTransition>
  );
}
