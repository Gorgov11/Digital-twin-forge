import { useAppStore } from '@/store/appStore';

const CATEGORIES = [
  { value: 'all' as const, label: 'All Models' },
  { value: 'human' as const, label: 'Human' },
  { value: 'industrial' as const, label: 'Industrial' },
];

const COMPLEXITIES = ['LOW', 'MED', 'HIGH', 'ULTRA'];

const COMPLEXITY_STYLE: Record<string, string> = {
  LOW: 'border-success/30 text-success',
  MED: 'border-accent/30 text-accent',
  HIGH: 'border-warning/30 text-warning',
  ULTRA: 'border-danger/30 text-danger',
};

export default function FilterSidebar() {
  const category = useAppStore((s) => s.libraryCategory);
  const setCategory = useAppStore((s) => s.setLibraryCategory);
  const complexity = useAppStore((s) => s.libraryComplexity);
  const setComplexity = useAppStore((s) => s.setLibraryComplexity);
  const search = useAppStore((s) => s.librarySearch);
  const setSearch = useAppStore((s) => s.setLibrarySearch);

  function toggleComplexity(c: string) {
    setComplexity(
      complexity.includes(c) ? complexity.filter((x) => x !== c) : [...complexity, c]
    );
  }

  function clearFilters() {
    setCategory('all');
    setComplexity([]);
    setSearch('');
  }

  const hasFilters = category !== 'all' || complexity.length > 0 || search !== '';

  return (
    <aside className="w-52 shrink-0 flex flex-col gap-5 p-4 border-r border-border bg-bg-surface h-full overflow-y-auto">
      {/* Search */}
      <div>
        <label className="label">Search</label>
        <div className="relative">
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-txt-muted pointer-events-none"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
          </svg>
          <input
            type="text"
            placeholder="Search models…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="input pl-8 text-xs"
          />
        </div>
      </div>

      {/* Category */}
      <div>
        <p className="section-title mb-2">Category</p>
        <div className="space-y-0.5">
          {CATEGORIES.map((c) => (
            <button
              key={c.value}
              onClick={() => setCategory(c.value)}
              className={[
                'w-full text-left px-3 py-2 rounded-lg text-xs font-medium transition-colors',
                category === c.value
                  ? 'bg-primary/10 text-primary'
                  : 'text-txt-secondary hover:text-txt-primary hover:bg-bg-elevated',
              ].join(' ')}
            >
              {c.label}
            </button>
          ))}
        </div>
      </div>

      {/* Complexity */}
      <div>
        <p className="section-title mb-2">Complexity</p>
        <div className="flex flex-wrap gap-1.5">
          {COMPLEXITIES.map((c) => (
            <button
              key={c}
              onClick={() => toggleComplexity(c)}
              className={[
                'px-2.5 py-1 rounded-md text-[10px] font-bold border transition-colors',
                complexity.includes(c)
                  ? `${COMPLEXITY_STYLE[c]} bg-current/10`
                  : 'border-border text-txt-muted hover:border-border-bright',
              ].join(' ')}
            >
              {c}
            </button>
          ))}
        </div>
      </div>

      {/* Clear */}
      {hasFilters && (
        <button
          onClick={clearFilters}
          className="text-xs text-txt-muted hover:text-txt-secondary transition-colors underline underline-offset-2"
        >
          Clear filters
        </button>
      )}
    </aside>
  );
}
