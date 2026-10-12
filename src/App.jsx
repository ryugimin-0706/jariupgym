import { BrowserRouter, Navigate, Route, Routes } from 'react-router';
import { AppDataProvider, useGym, useRoutine } from './hooks/useAppData.jsx';
import Complete from './pages/Complete.jsx';
import Home from './pages/Home.jsx';
import EquipmentSelect from './pages/onboarding/EquipmentSelect.jsx';
import RecommendedRoutine from './pages/onboarding/RecommendedRoutine.jsx';
import RoutineChoice from './pages/onboarding/RoutineChoice.jsx';
import RoutineEditor from './pages/onboarding/RoutineEditor.jsx';
import Welcome from './pages/onboarding/Welcome.jsx';
import Workout from './pages/Workout.jsx';
import { WorkoutProvider } from './workout/WorkoutContext.jsx';

/** 설정이 덜 끝났으면 온보딩으로: 기구가 없으면 대표 화면, 루틴이 없으면 화면 2 */
function HomeGate() {
  const { hasGym } = useGym();
  const { routine } = useRoutine();
  if (!hasGym) return <Navigate to="/" replace />;
  if (!routine) return <Navigate to="/onboarding/routine" replace />;
  return <Home />;
}

export default function App() {
  return (
    <AppDataProvider>
      <WorkoutProvider>
        <BrowserRouter>
          <Routes>
            {/* 앱을 열거나 운동을 마치면 대표 화면부터. [시작하기]가 상황에 맞는 곳으로 보낸다 */}
            <Route path="/" element={<Welcome />} />
            <Route path="/home" element={<HomeGate />} />
            <Route path="/welcome" element={<Navigate to="/" replace />} />
            <Route path="/onboarding/equipment" element={<EquipmentSelect next="/onboarding/routine" />} />
            <Route path="/onboarding/routine" element={<RoutineChoice />} />
            <Route path="/onboarding/recommended" element={<RecommendedRoutine />} />
            <Route path="/onboarding/custom" element={<RoutineEditor />} />
            <Route path="/settings/equipment" element={<EquipmentSelect mode="settings" next="/home" />} />
            <Route path="/settings/routine" element={<RoutineEditor mode="settings" />} />
            <Route path="/workout" element={<Workout />} />
            <Route path="/complete" element={<Complete />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </WorkoutProvider>
    </AppDataProvider>
  );
}
