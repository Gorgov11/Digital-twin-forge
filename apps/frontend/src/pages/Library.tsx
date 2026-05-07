import { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { TwinModel } from '@twinforge/shared';
import { MODELS } from '@/lib/models';
import { useAppStore } from '@/store/appStore';
import FilterSidebar from '@/components/library/FilterSidebar';
import ModelCard from '@/components/library/ModelCard';
import ModelDetailPanel from '@/components/library/ModelDetailPanel';
import ComparisonPanel from '@/components/library/ComparisonPanel';
import { ModelCardSkeleton } from '@/components/ui/Skeleton';
import PageTransition from '@/components/ui/PageTransition';

function fuzzyMatch(text: string, query: string): boolean {
  const t = text.toLowerCase();
  const q = query.toLowerCase().trim();
  if (!q) return true;
  if (t.includes(q)) return true;
  let j = 0;
  for (let i = 0; i < t.length && j < q.length; i++) {
    if (t[i] === q[j]) j++;
  }
  return j === q.length;
}

const cardVariants = {
  container: { transition: { staggerChildren: 0.04 } },
};

export default function Library() {
  const [selected, setSelected] = useState<TwinModel | null>(null);
  const [compareIds, setCompareIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  // Simulate 350ms data-load skeleton
  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 350);
    return () => clearTimeout(t);
  }, []);

  const search = useAppStore((s) => s.librarySearch);
  const category = useAppStore((s) => s.libraryCategory);
  const complexity = useAppStore((s) => s.libraryComplexity);

  const filtered = useMemo(() => {
    return MODELS.filter((m) => {
      if (category !== 'all' && m.category !== category) return false;
      if (complexity.length > 0 && !complexity.includes(m.complexity)) return false;
      if (search) {
        const haystack = [m.name, m.description, ...m.tags, m.category].join(' ');
        if (!fuzzyMatch(haystack, search)) return false;
      }
      return true;
    });
  }, [search, category, complexity]);

  function toggleCompare(model: TwinModel) {
    setCompareIds((prev) => {
      if (prev.includes(model.id)) return prev.filter((id) => id !== model.id);
      if (prev.length >= 2) return [prev[1], model.id]; // replace oldest
      return [...prev, model.id];
    });
  }

  const compareModels = compareIds
    .map((id) => MODELS.find((m) => m.id === id))
    .filter(Boolean) as TwinModel[];

  return (
    <PageTransition>
      <div className="flex h-full">
        <FilterSidebar />

        <div className="flex-1 flex min-w-0">
          {/* Model Grid */}
          <div className={`flex-1 p-6 overflow-y-auto transition-all ${selected ? 'pr-4' : ''} ${compareIds.length > 0 ? 'pb-72' : ''}`}>
            {/* Header */}
            <div className="flex items-center justify-between mb-5">
              <div>
                <h2 className="text-base font-semibold text-txt-primary">
                  {loading ? '…' : `${filtered.length} model${filtered.length !== 1 ? 's' : ''}`}
                </h2>
                <p className="text-xs text-txt-muted mt-0.5">
                  {category === 'all' ? 'Human + Industrial twins' : `${category.charAt(0).toUpperCase() + category.slice(1)} twins`}
                  {compareIds.length > 0 && (
                    <span className="ml-2 text-accent">{compareIds.length}/2 selected for comparison</span>
                  )}
                </p>
              </div>
              <div className="flex items-center gap-2">
                {compareIds.length > 0 && (
                  <button onClick={() => setCompareIds([])} className="btn-ghost text-xs">
                    Clear compare
                  </button>
                )}
                {selected && (
                  <button onClick={() => setSelected(null)} className="btn-ghost text-xs">
                    Close detail
                  </button>
                )}
              </div>
            </div>

            {/* Skeleton loading state */}
            {loading ? (
              <div className={`grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4`}>
                {Array.from({ length: 8 }).map((_, i) => (
                  <ModelCardSkeleton key={i} />
                ))}
              </div>
            ) : filtered.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 text-center">
                <div className="w-16 h-16 rounded-full bg-bg-elevated border border-border flex items-center justify-center mb-4">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-7 h-7 text-txt-muted">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
                  </svg>
                </div>
                <p className="text-sm font-medium text-txt-secondary">No models found</p>
                <p className="text-xs text-txt-muted mt-1">Try adjusting your search or filters</p>
              </div>
            ) : (
              <motion.div
                variants={cardVariants.container}
                initial="hidden"
                animate="visible"
                className={`grid gap-4 ${selected
                  ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3'
                  : 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5'
                }`}
              >
                <AnimatePresence>
                  {filtered.map((model) => (
                    <ModelCard
                      key={model.id}
                      model={model}
                      isSelected={selected?.id === model.id}
                      isCompared={compareIds.includes(model.id)}
                      onSelect={setSelected}
                      onToggleCompare={toggleCompare}
                    />
                  ))}
                </AnimatePresence>
              </motion.div>
            )}
          </div>

          {/* Detail panel */}
          <AnimatePresence>
            {selected && (
              <motion.div
                key="detail-panel"
                initial={{ x: 72, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: 72, opacity: 0 }}
                transition={{ duration: 0.2, ease: 'easeOut' }}
                className="w-72 shrink-0 h-full"
              >
                <ModelDetailPanel model={selected} onClose={() => setSelected(null)} />
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Comparison panel (slide up from bottom) */}
        {compareModels.length === 2 && (
          <ComparisonPanel
            models={compareModels as [TwinModel, TwinModel]}
            onClear={() => setCompareIds([])}
          />
        )}
      </div>
    </PageTransition>
  );
}
