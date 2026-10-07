/**
 * 내 헬스장 기구 / 내 루틴. localStorage와 동기화되고, 앱 전체가 같은 값을 본다.
 * (예: 2-A에서 "기구 추가"를 누르면 같은 화면의 목록이 즉시 갱신)
 */
import { createContext, useCallback, useContext, useMemo, useState } from 'react';
import { loadGym, loadRoutine, saveGym, saveRoutine } from '../lib/storage.js';

const AppDataContext = createContext(null);

export function AppDataProvider({ children }) {
  const [gym, setGymState] = useState(loadGym); // string[] | null
  const [routine, setRoutineState] = useState(loadRoutine); // Routine | null

  const setGym = useCallback((equipmentIds) => {
    saveGym(equipmentIds);
    setGymState(equipmentIds);
  }, []);

  const setRoutine = useCallback((next) => {
    saveRoutine(next);
    setRoutineState(next);
  }, []);

  /** 데이터 초기화 후 화면 상태도 비운다 */
  const resetAll = useCallback(() => {
    setGymState(null);
    setRoutineState(null);
  }, []);

  const value = useMemo(
    () => ({ gym, setGym, routine, setRoutine, resetAll }),
    [gym, setGym, routine, setRoutine, resetAll],
  );
  return <AppDataContext.Provider value={value}>{children}</AppDataContext.Provider>;
}

export function useAppData() {
  const ctx = useContext(AppDataContext);
  if (!ctx) throw new Error('useAppData는 AppDataProvider 안에서 써야 합니다');
  return ctx;
}

/** 내 헬스장 기구 id 배열 (없으면 빈 배열) */
export function useGym() {
  const { gym, setGym } = useAppData();
  return { equipmentIds: gym ?? [], hasGym: gym !== null, setGym };
}

export function useRoutine() {
  const { routine, setRoutine } = useAppData();
  return { routine, setRoutine };
}
