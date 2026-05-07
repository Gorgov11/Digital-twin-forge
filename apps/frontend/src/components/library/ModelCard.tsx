import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import type { TwinModel } from '@twinforge/shared';
import ModelPreview3D from './ModelPreview3D';
import { useAppStore } from '@/store/appStore';

const COMPLEXITY_COLOR: Record<string, string> = {
  LOW: 'text-success bg-success/10 border-success/20',
  MED: 'text-accent bg-accent/10 border-accent/20',
  HIGH: 'text-warning bg-warning/10 border-warning/20',
  ULTRA: 'text-danger bg-danger/10 border-danger/20',
};

interface ModelCardProps {
  model: TwinModel;
  isSelected?: boolean;
  isCompared?: boolean;
  onSelect: (model: TwinModel) => void;
  onToggleCompare?: (model: TwinModel) => void;
}

export default function ModelCard({ model, isSelected, isCompared, onSelect, onToggleCompare }: ModelCardProps) {
  const navigate = useNavigate();
  const setSelectedModel = useAppStore((s) => s.setSelectedModel);

  function handleSpawn(e: React.MouseEvent) {
    e.stopPropagation();
    setSelectedModel(model);
    navigate(`/studio/${model.id}`);
  }

  function handleCompare(e: React.MouseEvent) {
    e.stopPropagation();
    onToggleCompare?.(model);
  }

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      whileHover={{ y: -2 }}
      whileTap={{ scale: 0.98 }}
      transition={{ duration: 0.18, ease: 'easeOut' }}
      onClick={() => onSelect(model)}
      className={[
        'group relative bg-bg-surface border rounded-xl overflow-hidden cursor-pointer transition-colors',
        isCompared
          ? 'border-accent shadow-lg shadow-accent/10'
          : isSelected
          ? 'border-primary shadow-lg shadow-primary/10'
          : 'border-border hover:border-primary/40 hover:shadow-lg',
      ].join(' ')}
    >
      {/* Compare toggle */}
      {onToggleCompare && (
        <button
          onClick={handleCompare}
          title={isCompared ? 'Remove from comparison' : 'Add to comparison'}
          className={[
            'absolute top-10 right-2 z-10 w-5 h-5 rounded-full border text-[9px] font-bold transition-all',
            'flex items-center justify-center',
            isCompared
              ? 'bg-accent border-accent text-bg-base'
              : 'bg-bg-elevated/90 border-border text-txt-muted opacity-0 group-hover:opacity-100',
          ].join(' ')}
        >
          {isCompared ? '✓' : '+'}
        </button>
      )}

      {/* 3D Preview */}
      <div className="relative">
        <ModelPreview3D geometryType={model.geometryType} height="160px" />

        {/* Complexity badge */}
        <span className={`absolute top-2 right-2 badge border text-[10px] font-bold ${COMPLEXITY_COLOR[model.complexity]}`}>
          {model.complexity}
        </span>

        {/* Category pill */}
        <span className="absolute top-2 left-2 badge bg-bg-elevated/90 border border-border text-txt-muted text-[10px] uppercase tracking-wider">
          {model.category}
        </span>

        {/* Spawn overlay on hover */}
        <div className="absolute inset-0 bg-primary/10 opacity-0 group-hover:opacity-100 transition-opacity flex items-end justify-center pb-3">
          <button
            onClick={handleSpawn}
            className="btn-primary text-xs py-1.5 px-4 shadow-lg glow-primary"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-3 h-3">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
            Spawn Twin
          </button>
        </div>
      </div>

      {/* Card body */}
      <div className="p-3">
        <h3 className="text-sm font-semibold text-txt-primary truncate">{model.name}</h3>
        <p className="text-xs text-txt-muted mt-0.5 line-clamp-2 leading-relaxed">{model.description}</p>

        {/* Tags */}
        <div className="flex flex-wrap gap-1 mt-2">
          {model.tags.slice(0, 3).map((tag) => (
            <span key={tag} className="text-[10px] px-1.5 py-0.5 rounded bg-bg-elevated text-txt-muted border border-border">
              {tag}
            </span>
          ))}
          {model.tags.length > 3 && (
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-bg-elevated text-txt-muted border border-border">
              +{model.tags.length - 3}
            </span>
          )}
        </div>

        {/* Stats row */}
        <div className="flex items-center justify-between mt-3 pt-3 border-t border-border">
          <span className="text-[10px] text-txt-muted font-mono">
            {(model.vertexCount / 1000).toFixed(1)}K verts
          </span>
          {model.category === 'industrial' && model.sensorCount !== undefined && (
            <span className="text-[10px] text-txt-muted">{model.sensorCount} sensors</span>
          )}
          {model.category === 'human' && model.organSystems && (
            <span className="text-[10px] text-txt-muted">{model.organSystems.length} systems</span>
          )}
          <button
            onClick={handleSpawn}
            className="text-[10px] font-medium text-primary hover:text-primary-hover transition-colors"
          >
            Spawn →
          </button>
        </div>
      </div>
    </motion.div>
  );
}
