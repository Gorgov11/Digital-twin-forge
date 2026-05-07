import { useNavigate } from 'react-router-dom';
import type { TwinModel } from '@twinforge/shared';
import ModelPreview3D from './ModelPreview3D';
import { useAppStore } from '@/store/appStore';

const COMPLEXITY_COLOR: Record<string, string> = {
  LOW: 'badge-low',
  MED: 'text-accent bg-accent/10 border border-accent/20 badge',
  HIGH: 'badge-medium',
  ULTRA: 'badge-high',
};

interface ModelDetailPanelProps {
  model: TwinModel;
  onClose: () => void;
}

export default function ModelDetailPanel({ model, onClose }: ModelDetailPanelProps) {
  const navigate = useNavigate();
  const setSelectedModel = useAppStore((s) => s.setSelectedModel);

  function handleSpawn() {
    setSelectedModel(model);
    navigate(`/studio/${model.id}`);
  }

  return (
    <div className="h-full flex flex-col bg-bg-surface border-l border-border overflow-y-auto">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-border shrink-0">
        <div>
          <h2 className="text-sm font-semibold text-txt-primary">{model.name}</h2>
          <p className="text-xs text-txt-muted capitalize">{model.category} twin</p>
        </div>
        <button onClick={onClose} className="btn-ghost p-1.5">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4">
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {/* 3D preview */}
      <div className="p-4 border-b border-border shrink-0">
        <ModelPreview3D geometryType={model.geometryType} height="200px" interactive />
      </div>

      {/* Spec sheet */}
      <div className="p-4 space-y-4 flex-1">
        {/* Description */}
        <div>
          <p className="section-title mb-2">Description</p>
          <p className="text-xs text-txt-secondary leading-relaxed">{model.description}</p>
        </div>

        {/* Metrics */}
        <div>
          <p className="section-title mb-2">Mesh Metrics</p>
          <div className="grid grid-cols-2 gap-2">
            {[
              { label: 'Vertices', value: model.vertexCount.toLocaleString() },
              { label: 'Polygons', value: model.polygonCount.toLocaleString() },
              { label: 'Complexity', value: model.complexity },
              { label: 'Category', value: model.category },
            ].map(({ label, value }) => (
              <div key={label} className="bg-bg-base border border-border rounded-lg p-2">
                <p className="text-[10px] text-txt-muted">{label}</p>
                <p className="text-xs font-semibold text-txt-primary mt-0.5">{value}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Human-specific */}
        {model.category === 'human' && model.organSystems && (
          <div>
            <p className="section-title mb-2">Organ Systems</p>
            <div className="flex flex-wrap gap-1">
              {model.organSystems.map((sys) => (
                <span key={sys} className="badge bg-primary/10 text-primary border border-primary/20 capitalize">
                  {sys}
                </span>
              ))}
            </div>
          </div>
        )}

        {model.category === 'human' && model.simulationCompatibility && (
          <div>
            <p className="section-title mb-2">Simulation Compatibility</p>
            <div className="flex flex-wrap gap-1">
              {model.simulationCompatibility.map((s) => (
                <span key={s} className="badge bg-bg-elevated border border-border text-txt-muted">
                  {s}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Industrial-specific */}
        {model.category === 'industrial' && (
          <>
            {model.industry && (
              <div>
                <p className="section-title mb-2">Industry</p>
                <p className="text-xs text-txt-secondary">{model.industry}</p>
              </div>
            )}
            {model.sensorCount !== undefined && (
              <div className="grid grid-cols-2 gap-2">
                <div className="bg-bg-base border border-border rounded-lg p-2">
                  <p className="text-[10px] text-txt-muted">Sensor Points</p>
                  <p className="text-sm font-bold text-accent">{model.sensorCount}</p>
                </div>
                {model.maintenanceInterval && (
                  <div className="bg-bg-base border border-border rounded-lg p-2">
                    <p className="text-[10px] text-txt-muted">Maint. Interval</p>
                    <p className="text-xs font-semibold text-txt-primary">{model.maintenanceInterval}</p>
                  </div>
                )}
              </div>
            )}
            {model.failureModes && (
              <div>
                <p className="section-title mb-2">Failure Modes</p>
                <div className="space-y-1">
                  {model.failureModes.map((fm) => (
                    <div key={fm} className="flex items-center gap-2 text-xs text-txt-secondary">
                      <span className="w-1 h-1 rounded-full bg-warning shrink-0" />
                      {fm}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}

        {/* Tags */}
        <div>
          <p className="section-title mb-2">Tags</p>
          <div className="flex flex-wrap gap-1">
            {model.tags.map((tag) => (
              <span key={tag} className="badge bg-bg-elevated border border-border text-txt-muted">
                {tag}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Spawn CTA */}
      <div className="p-4 border-t border-border shrink-0">
        <button onClick={handleSpawn} className="btn-primary w-full justify-center glow-primary">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
          Spawn Twin
        </button>
        <p className="text-[10px] text-txt-muted text-center mt-2">
          Opens Twin Studio with this model
        </p>
      </div>
    </div>
  );
}
