import { BrowserRouter, Navigate, Route, Routes } from 'react-router';
import { AppDataProvider, useGym, useRoutine } from './hooks/useAppData.jsx';
import Complete from './pages/Complete.jsx';
import Home from './pages/Home.jsx';
import EquipmentSelect from './pages/onboarding/EquipmentSelect.jsx';
import RoutineChoice from './pages/onboarding/RoutineChoice.jsx';
import Workout from './pages/Workout.jsx';
import { WorkoutProvider } from './workout/WorkoutContext.jsx';

/** 첫 방문이면 온보딩으로: 기구가 없으면 화면 1, 루틴이 없으면 화면 2 */
function HomeGate() {
  const { hasGym } = useGym();
  const { routine } = useRoutine();
  if (!hasGym) return <Navigate to="/onboarding/equipment" replace />;
  if (!routine) return <Navigate to="/onboarding/routine" replace />;
  return <Home />;
}

export default function App() {
  return (
    <AppDataProvider>
      <WorkoutProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<HomeGate />} />
            <Route path="/onboarding/equipment" element={<EquipmentSelect next="/onboarding/routine" />} />
            <Route path="/onboarding/routine" element={<RoutineChoice />} />
            <Route path="/settings/equipment" element={<EquipmentSelect mode="settings" next="/" />} />
            <Route path="/workout" element={<Workout />} />
            <Route path="/complete" element={<Complete />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </WorkoutProvider>
    </AppDataProvider>
  );
}
