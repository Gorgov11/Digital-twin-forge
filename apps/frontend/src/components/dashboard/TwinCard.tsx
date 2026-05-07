import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import type { Twin } from '@twinforge/shared';
import { healthScoreColor, healthScoreLabel } from '@/lib/healthScore';
import { useAppStore } from '@/store/appStore';
import { getModelById } from '@/lib/models';

interface TwinCardProps {
  twin: Twin;
  archived?: boolean;
}

export default function TwinCard({ twin, archived = false }: TwinCardProps) {
  const navigate = useNavigate();
  const removeTwin = useAppStore((s) => s.removeTwin);
  const addTwin = useAppStore((s) => s.addTwin);
  const archiveTwin = useAppStore((s) => s.archiveTwin);
  const unarchiveTwin = useAppStore((s) => s.unarchiveTwin);
  const model = getModelById(twin.modelId);
  const color = healthScoreColor(twin.healthScore);
  const label = healthScoreLabel(twin.healthScore);

  const radius = 26;
  const circumference = 2 * Math.PI * radius;
  const dash = (twin.healthScore / 100) * circumference;

  function handleClone() {
    const now = new Date().toISOString();
    addTwin({
      ...twin,
      id: crypto.randomUUID(),
      name: `Copy of ${twin.name}`,
      simulationCount: 0,
      createdAt: now,
      updatedAt: now,
    });
  }

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: archived ? 0.6 : 1, y: 0 }}
      exit={{ opacity: 0, y: -4 }}
      transition={{ duration: 0.18 }}
      className="card hover:border-border-bright transition-all"
    >
      <div className="flex items-start gap-3">
        {/* Health donut */}
        <div className="shrink-0">
          <svg width="64" height="64" viewBox="0 0 64 64">
            <circle cx="32" cy="32" r={radius} fill="none" stroke="#1E2330" strokeWidth="5" />
            <circle
              cx="32"
              cy="32"
              r={radius}
              fill="none"
              stroke={archived ? '#374151' : color}
              strokeWidth="5"
              strokeLinecap="round"
              strokeDasharray={`${dash} ${circumference - dash}`}
              strokeDashoffset={circumference / 4}
              style={{ filter: archived ? 'none' : `drop-shadow(0 0 4px ${color}80)` }}
            />
            <text x="32" y="37" textAnchor="middle" fill={archived ? '#374151' : color} fontSize="13" fontWeight="700" fontFamily="Inter">
              {Math.round(twin.healthScore)}
            </text>
          </svg>
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div>
              <div className="flex items-center gap-1.5">
                <h3 className="text-sm font-semibold text-txt-primary truncate">{twin.name}</h3>
                {archived && (
                  <span className="badge bg-bg-elevated border border-border text-txt-muted text-[9px]">archived</span>
                )}
              </div>
              <p className="text-xs text-txt-muted capitalize">{twin.category} · {model?.name ?? twin.modelId}</p>
            </div>
            <span className="text-[10px] font-medium shrink-0" style={{ color: archived ? '#374151' : color }}>{label}</span>
          </div>

          <div className="flex flex-wrap gap-2 mt-3">
            <div className="bg-bg-base border border-border rounded px-2 py-1">
              <p className="text-[10px] text-txt-muted">Simulations</p>
              <p className="text-xs font-bold text-txt-primary">{twin.simulationCount}</p>
            </div>
            <div className="bg-bg-base border border-border rounded px-2 py-1">
              <p className="text-[10px] text-txt-muted">Created</p>
              <p className="text-xs font-medium text-txt-primary">
                {new Date(twin.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap gap-2 mt-3">
            {archived ? (
              <button
                onClick={() => unarchiveTwin(twin.id)}
                className="btn-secondary text-xs py-1.5 px-3"
              >
                Restore
              </button>
            ) : (
              <button
                onClick={() => navigate(`/studio/twin/${twin.id}`)}
                className="btn-primary text-xs py-1.5 px-3"
              >
                Edit / Simulate
              </button>
            )}
            {!archived && (
              <button
                onClick={handleClone}
                className="btn-secondary text-xs py-1.5 px-3"
                title="Clone this twin"
              >
                Clone
              </button>
            )}
            <button
              onClick={() => archived ? removeTwin(twin.id) : archiveTwin(twin.id)}
              className={`btn-ghost text-xs py-1.5 px-3 ${archived ? 'text-danger hover:bg-danger/10' : 'text-txt-muted hover:text-txt-secondary'}`}
            >
              {archived ? 'Delete' : 'Archive'}
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
