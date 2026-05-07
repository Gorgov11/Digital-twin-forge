import { useState, useMemo } from 'react';
import type { TwinModel } from '@twinforge/shared';
import { MODELS } from '@/lib/models';
import { useAppStore } from '@/store/appStore';
import FilterSidebar from '@/components/library/FilterSidebar';
import ModelCard from '@/components/library/ModelCard';
import ModelDetailPanel from '@/components/library/ModelDetailPanel';

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

export default function Library() {
  const [selected, setSelected] = useState<TwinModel | null>(null);

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

  return (
    <div className="flex h-full">
      <FilterSidebar />

      <div className="flex-1 flex min-w-0">
        {/* Model Grid */}
        <div className={`flex-1 p-6 overflow-y-auto transition-all ${selected ? 'pr-4' : ''}`}>
          {/* Header */}
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="text-base font-semibold text-txt-primary">
                {filtered.length} model{filtered.length !== 1 ? 's' : ''}
              </h2>
              <p className="text-xs text-txt-muted mt-0.5">
                {category === 'all' ? 'Human + Industrial twins' : `${category.charAt(0).toUpperCase() + category.slice(1)} twins`}
              </p>
            </div>
            {selected && (
              <button
                onClick={() => setSelected(null)}
                className="btn-ghost text-xs"
              >
                Close detail
              </button>
            )}
          </div>

          {filtered.length === 0 ? (
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
            <div className={`grid gap-4 ${selected
              ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3'
              : 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5'
            }`}>
              {filtered.map((model) => (
                <ModelCard
                  key={model.id}
                  model={model}
                  isSelected={selected?.id === model.id}
                  onSelect={setSelected}
                />
              ))}
            </div>
          )}
        </div>

        {/* Detail panel */}
        {selected && (
          <div className="w-72 shrink-0 h-full">
            <ModelDetailPanel model={selected} onClose={() => setSelected(null)} />
          </div>
        )}
      </div>
    </div>
  );
}
