import { healthScoreColor, healthScoreLabel } from '@/lib/healthScore';

interface TwinHealthScoreProps {
  score: number;
  size?: number;
}

export default function TwinHealthScore({ score, size = 100 }: TwinHealthScoreProps) {
  const radius = (size - 12) / 2;
  const circumference = 2 * Math.PI * radius;
  const dash = (score / 100) * circumference;
  const gap = circumference - dash;
  const color = healthScoreColor(score);
  const label = healthScoreLabel(score);

  return (
    <div className="flex flex-col items-center gap-1">
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        {/* Track */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="#1E2330"
          strokeWidth={6}
        />
        {/* Progress */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={6}
          strokeLinecap="round"
          strokeDasharray={`${dash} ${gap}`}
          strokeDashoffset={circumference / 4}
          style={{ transition: 'stroke-dasharray 0.6s ease, stroke 0.4s ease', filter: `drop-shadow(0 0 6px ${color}80)` }}
        />
        {/* Label */}
        <text
          x={size / 2}
          y={size / 2}
          textAnchor="middle"
          dominantBaseline="central"
          fill={color}
          fontSize={size * 0.22}
          fontWeight="700"
          fontFamily="Inter, sans-serif"
        >
          {Math.round(score)}
        </text>
      </svg>
      <span className="text-xs font-medium" style={{ color }}>{label}</span>
    </div>
  );
}
