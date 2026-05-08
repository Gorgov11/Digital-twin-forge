import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import Shell from '@/components/layout/Shell';
import Library from '@/pages/Library';
import Studio from '@/pages/Studio';
import Dashboard from '@/pages/Dashboard';
import SimulationReport from '@/pages/SimulationReport';
import About from '@/pages/About';

function AnimatedRoutes() {
  const location = useLocation();
  return (
    <AnimatePresence mode="wait" initial={false}>
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<Shell />}>
          <Route index element={<Navigate to="/library" replace />} />
          <Route path="library" element={<Library />} />
          <Route path="studio/:modelId" element={<Studio />} />
          <Route path="studio/twin/:twinId" element={<Studio />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="simulation/:simulationId" element={<SimulationReport />} />
          <Route path="about" element={<About />} />
        </Route>
      </Routes>
    </AnimatePresence>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AnimatedRoutes />
    </BrowserRouter>
  );
}
