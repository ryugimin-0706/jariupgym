import { BrowserRouter, Navigate, Route, Routes } from 'react-router';
import { AppDataProvider } from './hooks/useAppData.jsx';
import Complete from './pages/Complete.jsx';
import DevStart from './pages/DevStart.jsx';
import EquipmentSelect from './pages/onboarding/EquipmentSelect.jsx';
import Workout from './pages/Workout.jsx';
import { WorkoutProvider } from './workout/WorkoutContext.jsx';

export default function App() {
  return (
    <AppDataProvider>
      <WorkoutProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<DevStart />} />
            {/* 6단계에서 next를 루틴 방식 선택 화면으로 바꾼다 */}
            <Route path="/onboarding/equipment" element={<EquipmentSelect next="/" />} />
            <Route path="/workout" element={<Workout />} />
            <Route path="/complete" element={<Complete />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </WorkoutProvider>
    </AppDataProvider>
  );
}
