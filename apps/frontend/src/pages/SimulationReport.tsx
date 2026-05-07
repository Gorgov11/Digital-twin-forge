import { useNavigate, useParams } from 'react-router-dom';
import { useAppStore } from '@/store/appStore';
import ReportRenderer from '@/components/simulation/ReportRenderer';

export default function SimulationReport() {
  const { simulationId } = useParams<{ simulationId: string }>();
  const navigate = useNavigate();
  const simulations = useAppStore((s) => s.simulations);
  const activeReport = useAppStore((s) => s.activeReport);

  const sim = simulations.find((s) => s.id === simulationId);
  const report = sim?.report ?? activeReport;

  if (!report) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-4">
        <p className="text-sm text-txt-secondary">Report not found</p>
        <button onClick={() => navigate('/dashboard')} className="btn-secondary text-xs">
          Back to Dashboard
        </button>
      </div>
    );
  }

  return (
    <div className="p-6">
      <button
        onClick={() => navigate(-1)}
        className="btn-ghost text-xs mb-6 -ml-1"
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-3.5 h-3.5">
          <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
        </svg>
        Back
      </button>
      <ReportRenderer report={report} />
    </div>
  );
}
