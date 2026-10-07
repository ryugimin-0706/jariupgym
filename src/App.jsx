import { BrowserRouter, Navigate, Route, Routes } from 'react-router';
import { AppDataProvider } from './hooks/useAppData.jsx';
import DevStart from './pages/DevStart.jsx';
import Workout from './pages/Workout.jsx';
import { WorkoutProvider } from './workout/WorkoutContext.jsx';

export default function App() {
  return (
    <AppDataProvider>
      <WorkoutProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<DevStart />} />
            <Route path="/workout" element={<Workout />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </WorkoutProvider>
    </AppDataProvider>
  );
}
