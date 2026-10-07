/**
 * 운동 세션 Context. 화면이 꺼지거나 새로고침해도 이어서 할 수 있게 sessionStorage에 보관한다.
 */
import { createContext, useContext, useEffect, useReducer } from 'react';
import { clearWorkout, loadWorkout, saveWorkout } from '../lib/storage.js';
import { workoutReducer } from './workoutReducer.js';

const WorkoutContext = createContext(null);

export function WorkoutProvider({ children }) {
  const [workout, dispatch] = useReducer(workoutReducer, null, loadWorkout);

  useEffect(() => {
    if (workout) saveWorkout(workout);
    else clearWorkout();
  }, [workout]);

  return <WorkoutContext.Provider value={{ workout, dispatch }}>{children}</WorkoutContext.Provider>;
}

export function useWorkout() {
  const ctx = useContext(WorkoutContext);
  if (!ctx) throw new Error('useWorkout은 WorkoutProvider 안에서 써야 합니다');
  return ctx;
}
