import type { RiskLevel } from '@twinforge/shared';

const STYLE: Record<RiskLevel, string> = {
  LOW: 'badge-low',
  MEDIUM: 'badge-medium',
  HIGH: 'badge-high',
  CRITICAL: 'badge-critical',
};

export default function RiskBadge({ level, size = 'sm' }: { level: RiskLevel; size?: 'sm' | 'lg' }) {
  return (
    <span className={`${STYLE[level]} ${size === 'lg' ? 'text-xs px-3 py-1' : 'text-[10px]'}`}>
      {level}
    </span>
  );
}
