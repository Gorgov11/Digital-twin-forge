import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAppStore } from '@/store/appStore';
import { useApiStatus } from '@/hooks/useApiStatus';
import { MODELS } from '@/lib/models';
import PageTransition from '@/components/ui/PageTransition';

const TECH_STACK: { name: string; role: string; accent: string }[] = [
  { name: 'React 18', role: 'UI Framework', accent: 'text-accent' },
  { name: 'React Three Fiber', role: '3D Rendering', accent: 'text-primary' },
  { name: 'Framer Motion', role: 'Animations', accent: 'text-success' },
  { name: 'Zustand', role: 'State Management', accent: 'text-warning' },
  { name: 'Fastify', role: 'API Server', accent: 'text-accent' },
  { name: 'Drizzle ORM', role: 'Database Layer', accent: 'text-primary' },
  { name: 'SQLite', role: 'Zero-config Storage', accent: 'text-success' },
  { name: 'Claude Sonnet 4.6', role: 'AI Simulation Engine', accent: 'text-danger' },
];

const ARCH = [
  {
    title: 'Model Library',
    items: ['35 digital twin models', '20 human physiology types', '15 industrial machines', 'Procedural Three.js previews'],
    border: 'border-primary/30 bg-primary/5',
  },
  {
    title: 'Twin Studio',
    items: ['50+ configurable params', 'Real-time health score', '60+ scenario presets', 'Live 3D param feedback'],
    border: 'border-accent/30 bg-accent/5',
  },
  {
    title: 'AI Engine',
    items: ['Claude Sonnet 4.6', 'Streaming SSE reports', 'Risk stratification', 'Graceful mock fallback'],
    border: 'border-success/30 bg-success/5',
  },
];

export default function About() {
  const navigate = useNavigate();
  const twins = useAppStore((s) => s.twins);
  const simulations = useAppStore((s) => s.simulations);
  const apiStatus = useApiStatus();
  const BASE_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:3001';

  return (
    <PageTransition>
      <div className="p-6 max-w-4xl mx-auto">
        {/* Hero */}
        <div className="text-center mb-10">
          <div className="w-14 h-14 rounded-2xl bg-primary flex items-center justify-center mx-auto mb-4 glow-primary">
            <svg viewBox="0 0 24 24" fill="none" className="w-8 h-8 text-white">
              <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-txt-primary mb-2">TwinForge</h1>
          <p className="text-txt-muted text-sm max-w-xl mx-auto leading-relaxed">
            Digital Twin Intelligence Platform. Simulate human physiology and industrial machinery
            with AI-powered analysis, real-time 3D visualisation, and Claude-driven insights.
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          {[
            { label: 'Models Available', value: MODELS.length, accent: 'text-primary' },
            { label: 'Twins Created', value: twins.length, accent: 'text-accent' },
            { label: 'Simulations Run', value: simulations.length, accent: 'text-success' },
          ].map(({ label, value, accent }, i) => (
            <motion.div
              key={label}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.06 }}
              className="card-elevated text-center py-6"
            >
              <p className={`text-3xl font-bold ${accent}`}>{value}</p>
              <p className="text-xs text-txt-muted mt-1">{label}</p>
            </motion.div>
          ))}
        </div>

        {/* API Status */}
        <div className="card mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-txt-primary">API Status</h2>
            <span
              className={[
                'badge border text-xs font-medium flex items-center gap-1.5',
                apiStatus === 'online'
                  ? 'text-success bg-success/10 border-success/20'
                  : apiStatus === 'offline'
                  ? 'text-warning bg-warning/10 border-warning/20'
                  : 'text-txt-muted bg-bg-elevated border-border',
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
              {apiStatus === 'online' ? 'API Connected' : apiStatus === 'offline' ? 'Mock Mode' : 'Checking…'}
            </span>
          </div>
          <div className="grid grid-cols-2 gap-4 text-xs">
            <div>
              <p className="text-txt-muted mb-1">Backend URL</p>
              <code className="font-mono text-txt-secondary">{BASE_URL}</code>
            </div>
            <div>
              <p className="text-txt-muted mb-1">AI Model</p>
              <code className="font-mono text-txt-secondary">claude-sonnet-4-6</code>
            </div>
            <div>
              <p className="text-txt-muted mb-1">Simulation Engine</p>
              <code className="font-mono text-txt-secondary">
                {apiStatus === 'online' ? 'Anthropic API (live)' : 'Mock Report Generator'}
              </code>
            </div>
            <div>
              <p className="text-txt-muted mb-1">Database</p>
              <code className="font-mono text-txt-secondary">SQLite via Drizzle ORM</code>
            </div>
          </div>
          {apiStatus === 'offline' && (
            <p className="text-xs text-txt-muted mt-4 pt-4 border-t border-border">
              Backend not detected. To enable real Claude AI simulations, start the backend server
              and set <code className="font-mono">ANTHROPIC_API_KEY</code> in your environment.
            </p>
          )}
        </div>

        {/* Tech Stack */}
        <div className="mb-8">
          <h2 className="text-sm font-semibold text-txt-primary mb-4">Tech Stack</h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {TECH_STACK.map((tech, i) => (
              <motion.div
                key={tech.name}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.04 }}
                className="card py-4 text-center"
              >
                <p className={`text-xs font-semibold ${tech.accent}`}>{tech.name}</p>
                <p className="text-[10px] text-txt-muted mt-0.5">{tech.role}</p>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Architecture */}
        <div className="card mb-8">
          <h2 className="text-sm font-semibold text-txt-primary mb-4">Platform Architecture</h2>
          <div className="grid grid-cols-3 gap-4 text-xs">
            {ARCH.map(({ title, items, border }) => (
              <div key={title} className={`rounded-lg border p-4 ${border}`}>
                <p className="font-semibold text-txt-primary mb-2">{title}</p>
                <ul className="space-y-1">
                  {items.map((item) => (
                    <li key={item} className="text-txt-muted text-[11px] flex items-start gap-1.5">
                      <span className="text-txt-disabled mt-0.5">·</span>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div className="flex justify-center gap-3 pb-6">
          <button onClick={() => navigate('/library')} className="btn-primary text-xs">
            Browse Model Library
          </button>
          <button onClick={() => navigate('/dashboard')} className="btn-secondary text-xs">
            View Dashboard
          </button>
        </div>
      </div>
    </PageTransition>
  );
}
