import { useState } from 'react';
import type { ScenarioPreset, ModelCategory } from '@twinforge/shared';
import { getScenariosForCategory } from '@/lib/scenarios';

const RISK_STYLE: Record<string, string> = {
  LOW: 'badge-low',
  MEDIUM: 'badge-medium',
  HIGH: 'badge-high',
  CRITICAL: 'badge-critical',
};

interface ScenarioSelectorProps {
  category: ModelCategory;
  selected: ScenarioPreset | null;
  onSelect: (scenario: ScenarioPreset) => void;
  onRun: () => void;
  running: boolean;
}

export default function ScenarioSelector({ category, selected, onSelect, onRun, running }: ScenarioSelectorProps) {
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState<string>('all');

  const allScenarios = getScenariosForCategory(category);

  const categories = ['all', ...Array.from(new Set(allScenarios.map((s) => s.category)))];

  const filtered = allScenarios.filter((s) => {
    if (activeCategory !== 'all' && s.category !== activeCategory) return false;
    if (search) {
      const hay = [s.name, s.description, ...s.tags].join(' ').toLowerCase();
      if (!hay.includes(search.toLowerCase())) return false;
    }
    return true;
  });

  return (
    <div className="flex flex-col h-full">
      <div className="p-4 border-b border-border space-y-3">
        <div className="flex items-center gap-2">
          <input
            type="text"
            placeholder="Search scenarios…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="input flex-1 text-xs"
          />
        </div>
        <div className="flex flex-wrap gap-1">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={[
                'px-2 py-0.5 rounded text-[10px] font-medium transition-colors border capitalize',
                activeCategory === cat
                  ? 'bg-primary/10 text-primary border-primary/30'
                  : 'border-border text-txt-muted hover:text-txt-secondary',
              ].join(' ')}
            >
              {cat.replace('-', ' ')}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-3 space-y-2">
        {filtered.map((scenario) => (
          <button
            key={scenario.id}
            onClick={() => onSelect(scenario)}
            className={[
              'w-full text-left p-3 rounded-lg border transition-all',
              selected?.id === scenario.id
                ? 'border-primary bg-primary/5'
                : 'border-border hover:border-border-bright bg-bg-surface hover:bg-bg-elevated',
            ].join(' ')}
          >
            <div className="flex items-start justify-between gap-2">
              <span className="text-xs font-medium text-txt-primary leading-tight">{scenario.name}</span>
              <span className={`${RISK_STYLE[scenario.estimatedRisk]} shrink-0 text-[9px]`}>
                {scenario.estimatedRisk}
              </span>
            </div>
            <p className="text-[10px] text-txt-muted mt-1 line-clamp-2 leading-relaxed">{scenario.description}</p>
            <div className="flex items-center justify-between mt-2">
              <span className="text-[10px] text-txt-disabled">{scenario.durationLabel}</span>
              {selected?.id === scenario.id && (
                <span className="text-[10px] text-primary font-medium">Selected ✓</span>
              )}
            </div>
          </button>
        ))}

        {filtered.length === 0 && (
          <div className="text-center py-8 text-xs text-txt-muted">No scenarios match your search</div>
        )}
      </div>

      {/* Run button */}
      <div className="p-4 border-t border-border">
        <button
          onClick={onRun}
          disabled={!selected || running}
          className={[
            'w-full btn-primary justify-center py-2.5',
            !selected || running ? 'opacity-50 cursor-not-allowed' : 'glow-primary',
          ].join(' ')}
        >
          {running ? (
            <>
              <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
              </svg>
              Simulating…
            </>
          ) : (
            <>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4">
                <path strokeLinecap="round" strokeLinejoin="round" d="M5.25 5.653c0-.856.917-1.398 1.667-.986l11.54 6.348a1.125 1.125 0 010 1.971l-11.54 6.347a1.125 1.125 0 01-1.667-.985V5.653z" />
              </svg>
              Run Simulation
            </>
          )}
        </button>
        {!selected && (
          <p className="text-[10px] text-txt-muted text-center mt-1.5">Select a scenario to continue</p>
        )}
      </div>
    </div>
  );
}
