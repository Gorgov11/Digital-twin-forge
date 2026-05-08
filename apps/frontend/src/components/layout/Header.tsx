import { useLocation } from 'react-router-dom';
import { useAppStore } from '@/store/appStore';
import { useApiStatus } from '@/hooks/useApiStatus';

const PAGE_TITLES: Record<string, { title: string; subtitle: string }> = {
  '/library': { title: '3D Model Library', subtitle: 'Browse and spawn digital twins' },
  '/dashboard': { title: 'Twin Dashboard', subtitle: 'Manage your active digital twins' },
  '/about': { title: 'About TwinForge', subtitle: 'Platform overview and system status' },
};

export default function Header() {
  const location = useLocation();
  const twins = useAppStore((s) => s.twins);
  const simulations = useAppStore((s) => s.simulations);
  const apiStatus = useApiStatus();

  const isStudio = location.pathname.startsWith('/studio');
  const isReport = location.pathname.startsWith('/simulation');

  const meta = isStudio
    ? { title: 'Twin Studio', subtitle: 'Customise parameters and run simulations' }
    : isReport
    ? { title: 'Simulation Report', subtitle: 'AI-generated analysis and recommendations' }
    : PAGE_TITLES[location.pathname] ?? { title: 'TwinForge', subtitle: '' };

  return (
    <header className="h-14 flex items-center justify-between px-6 border-b border-border bg-bg-surface/80 backdrop-blur-sm shrink-0">
      <div>
        <h1 className="text-sm font-semibold text-txt-primary">{meta.title}</h1>
        {meta.subtitle && (
          <p className="text-xs text-txt-muted">{meta.subtitle}</p>
        )}
      </div>

      <div className="flex items-center gap-4">
        <div className="flex items-center gap-3 text-xs text-txt-muted">
          <span className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse" />
            {twins.length} twin{twins.length !== 1 ? 's' : ''}
          </span>
          <span className="text-border">·</span>
          <span>{simulations.length} simulation{simulations.length !== 1 ? 's' : ''}</span>
        </div>

        {/* API status chip */}
        <div
          className={[
            'flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-[11px] font-medium',
            apiStatus === 'online'
              ? 'bg-success/10 border-success/20 text-success'
              : apiStatus === 'offline'
              ? 'bg-warning/10 border-warning/20 text-warning'
              : 'bg-bg-elevated border-border text-txt-muted',
          ].join(' ')}
        >
          <span
            className={[
              'w-1.5 h-1.5 rounded-full',
              apiStatus === 'online'
                ? 'bg-success animate-pulse'
                : apiStatus === 'offline'
                ? 'bg-warning'
                : 'bg-txt-muted animate-pulse',
            ].join(' ')}
          />
          {apiStatus === 'online' ? 'API' : apiStatus === 'offline' ? 'Mock' : '…'}
        </div>

        <div className="flex items-center gap-2 px-3 py-1.5 bg-bg-elevated border border-border rounded-lg">
          <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center">
            <span className="text-xs font-bold text-primary">D</span>
          </div>
          <span className="text-xs font-medium text-txt-primary">Demo Workspace</span>
        </div>
      </div>
    </header>
  );
}
