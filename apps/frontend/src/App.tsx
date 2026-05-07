import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Shell from '@/components/layout/Shell';
import Library from '@/pages/Library';
import Studio from '@/pages/Studio';
import Dashboard from '@/pages/Dashboard';
import SimulationReport from '@/pages/SimulationReport';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Shell />}>
          <Route index element={<Navigate to="/library" replace />} />
          <Route path="library" element={<Library />} />
          <Route path="studio/:modelId" element={<Studio />} />
          <Route path="studio/twin/:twinId" element={<Studio />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="simulation/:simulationId" element={<SimulationReport />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
