import type { TwinModel } from '@twinforge/shared';
import { motion, AnimatePresence } from 'framer-motion';
import ModelPreview3D from './ModelPreview3D';
import { useNavigate } from 'react-router-dom';
import { useAppStore } from '@/store/appStore';

const COMPLEXITY_COLOR: Record<string, string> = {
  LOW: 'badge-low',
  MED: 'text-accent bg-accent/10 border border-accent/20 badge',
  HIGH: 'badge-medium',
  ULTRA: 'badge-high',
};

interface ComparisonPanelProps {
  models: [TwinModel, TwinModel];
  onClear: () => void;
}

function SpecRow({ label, a, b }: { label: string; a: React.ReactNode; b: React.ReactNode }) {
  return (
    <tr className="border-t border-border">
      <td className="py-2 pr-4 text-[10px] text-txt-muted font-medium whitespace-nowrap">{label}</td>
      <td className="py-2 pr-4 text-xs text-txt-primary">{a}</td>
      <td className="py-2 text-xs text-txt-primary">{b}</td>
    </tr>
  );
}

export default function ComparisonPanel({ models, onClear }: ComparisonPanelProps) {
  const navigate = useNavigate();
  const setSelectedModel = useAppStore((s) => s.setSelectedModel);
  const [a, b] = models;

  function spawn(m: TwinModel) {
    setSelectedModel(m);
    navigate(`/studio/${m.id}`);
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ y: '100%', opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: '100%', opacity: 0 }}
        transition={{ type: 'spring', stiffness: 400, damping: 35 }}
        className="fixed bottom-0 left-56 right-0 z-40 bg-bg-surface border-t border-border shadow-2xl"
      >
        <div className="flex items-center justify-between px-6 py-3 border-b border-border">
          <span className="text-xs font-semibold text-txt-primary">Model Comparison</span>
          <button onClick={onClear} className="btn-ghost text-xs">
            Clear comparison ×
          </button>
        </div>

        <div className="px-6 py-4 overflow-x-auto">
          <div className="grid grid-cols-[120px,1fr,1fr] gap-4 min-w-[600px]">
            {/* 3D previews */}
            <div />
            <div>
              <ModelPreview3D geometryType={a.geometryType} height="100px" />
            </div>
            <div>
              <ModelPreview3D geometryType={b.geometryType} height="100px" />
            </div>

            {/* Names */}
            <div />
            <div>
              <p className="text-sm font-bold text-txt-primary truncate">{a.name}</p>
              <span className={`${COMPLEXITY_COLOR[a.complexity]} text-[10px] mt-0.5 inline-block`}>{a.complexity}</span>
            </div>
            <div>
              <p className="text-sm font-bold text-txt-primary truncate">{b.name}</p>
              <span className={`${COMPLEXITY_COLOR[b.complexity]} text-[10px] mt-0.5 inline-block`}>{b.complexity}</span>
            </div>
          </div>

          {/* Spec table */}
          <table className="w-full mt-3 min-w-[600px]">
            <colgroup>
              <col style={{ width: '120px' }} />
              <col style={{ width: '50%' }} />
              <col style={{ width: '50%' }} />
            </colgroup>
            <tbody>
              <SpecRow
                label="Vertices"
                a={<span className="font-mono">{a.vertexCount.toLocaleString()}</span>}
                b={<span className="font-mono">{b.vertexCount.toLocaleString()}</span>}
              />
              <SpecRow
                label="Polygons"
                a={<span className="font-mono">{a.polygonCount.toLocaleString()}</span>}
                b={<span className="font-mono">{b.polygonCount.toLocaleString()}</span>}
              />
              <SpecRow
                label="Category"
                a={<span className="capitalize">{a.category}</span>}
                b={<span className="capitalize">{b.category}</span>}
              />
              {(a.organSystems || b.organSystems) && (
                <SpecRow
                  label="Organ Systems"
                  a={<span className="text-txt-muted">{a.organSystems?.join(', ') ?? '—'}</span>}
                  b={<span className="text-txt-muted">{b.organSystems?.join(', ') ?? '—'}</span>}
                />
              )}
              {(a.sensorCount !== undefined || b.sensorCount !== undefined) && (
                <SpecRow
                  label="Sensors"
                  a={a.sensorCount !== undefined ? <span className="text-accent font-mono">{a.sensorCount}</span> : '—'}
                  b={b.sensorCount !== undefined ? <span className="text-accent font-mono">{b.sensorCount}</span> : '—'}
                />
              )}
              {(a.failureModes || b.failureModes) && (
                <SpecRow
                  label="Failure Modes"
                  a={<span className="text-txt-muted text-[10px]">{a.failureModes?.slice(0, 2).join(', ') ?? '—'}{(a.failureModes?.length ?? 0) > 2 ? ` +${(a.failureModes?.length ?? 0) - 2}` : ''}</span>}
                  b={<span className="text-txt-muted text-[10px]">{b.failureModes?.slice(0, 2).join(', ') ?? '—'}{(b.failureModes?.length ?? 0) > 2 ? ` +${(b.failureModes?.length ?? 0) - 2}` : ''}</span>}
                />
              )}
              <SpecRow
                label="Tags"
                a={<div className="flex flex-wrap gap-1">{a.tags.slice(0, 3).map(t => <span key={t} className="badge bg-bg-elevated border border-border text-txt-muted text-[9px]">{t}</span>)}</div>}
                b={<div className="flex flex-wrap gap-1">{b.tags.slice(0, 3).map(t => <span key={t} className="badge bg-bg-elevated border border-border text-txt-muted text-[9px]">{t}</span>)}</div>}
              />
            </tbody>
          </table>

          {/* Spawn CTAs */}
          <div className="grid grid-cols-[120px,1fr,1fr] gap-4 mt-4">
            <div />
            <button onClick={() => spawn(a)} className="btn-primary justify-center text-xs py-1.5">
              Spawn {a.name.split(' ')[0]}
            </button>
            <button onClick={() => spawn(b)} className="btn-primary justify-center text-xs py-1.5">
              Spawn {b.name.split(' ')[0]}
            </button>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
