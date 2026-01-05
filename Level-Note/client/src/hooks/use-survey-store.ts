import { useState, useEffect, useCallback } from 'react';
import { surveySessionSchema, type SurveySession, type SurveyRow, type SavedBenchmark } from '@shared/schema';

/**
 * LocalStorage Keys:
 * - STORAGE_KEY_SESSION: 現在の測量セッション（据付・測点データ）
 * - STORAGE_KEY_BMS: 保存された既知点（BM名 + 既知標高）
 */
const STORAGE_KEY_SESSION = 'hi_survey_session';
const STORAGE_KEY_BMS = 'hi_saved_benchmarks';

const defaultSession: SurveySession = {
  id: crypto.randomUUID(),
  siteName: '',
  date: new Date().toISOString().split('T')[0],
  surveyor: '',
  rows: [],
  currentHI: null,
  lastUpdated: new Date().toISOString(),
};

/**
 * HI方式（器械高方式）の計算ロジック
 * 
 * 1. 基準点（BM）: HI = 既知標高 + BS
 * 2. FS点: 標高 = HI - FS
 */
function recalculateRows(rows: SurveyRow[]): { rows: SurveyRow[], currentHI: number | null } {
  let currentHI: number | null = null;
  
  const calculated = rows.map(row => {
    const newRow = { ...row };
    
    if (row.type === 'benchmark') {
      // 基準点: HI = 既知標高 + BS
      if (row.knownElevation != null && row.bs != null) {
        newRow.hi = Number((row.knownElevation + row.bs).toFixed(3));
        currentHI = newRow.hi;
      } else {
        newRow.hi = null;
      }
      // 基準点の標高は既知標高そのもの
      newRow.elevation = row.knownElevation ?? null;
      // FSはクリア（基準点には不要）
      newRow.fs = null;
    } else {
      // FS点: 標高 = HI - FS
      newRow.hi = null; // FS点にはHI表示不要
      newRow.knownElevation = null; // FS点には既知標高不要
      newRow.bs = null; // FS点にはBS不要
      
      if (currentHI != null && row.fs != null) {
        newRow.elevation = Number((currentHI - row.fs).toFixed(3));
      } else {
        newRow.elevation = null;
      }
    }
    
    return newRow;
  });
  
  return { rows: calculated, currentHI };
}

export function useSurveyStore() {
  const [session, setSession] = useState<SurveySession>(defaultSession);
  const [savedBMs, setSavedBMs] = useState<SavedBenchmark[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load from LocalStorage on mount
  useEffect(() => {
    try {
      const storedSession = localStorage.getItem(STORAGE_KEY_SESSION);
      if (storedSession) {
        const parsed = JSON.parse(storedSession);
        const result = surveySessionSchema.safeParse(parsed);
        if (result.success) {
          setSession(result.data);
        }
      }

      const storedBMs = localStorage.getItem(STORAGE_KEY_BMS);
      if (storedBMs) {
        const parsed = JSON.parse(storedBMs);
        if (Array.isArray(parsed)) {
          setSavedBMs(parsed);
        }
      }
    } catch (e) {
      console.error("Failed to load survey data", e);
    } finally {
      setIsLoaded(true);
    }
  }, []);

  // Auto-save to LocalStorage
  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem(STORAGE_KEY_SESSION, JSON.stringify(session));
    }
  }, [session, isLoaded]);

  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem(STORAGE_KEY_BMS, JSON.stringify(savedBMs));
    }
  }, [savedBMs, isLoaded]);

  const updateSessionField = useCallback((field: keyof SurveySession, value: unknown) => {
    setSession(prev => ({
      ...prev,
      [field]: value,
      lastUpdated: new Date().toISOString()
    }));
  }, []);

  // 基準点（BM）を追加
  const addBenchmark = useCallback(() => {
    setSession(prev => {
      const newRow: SurveyRow = {
        id: crypto.randomUUID(),
        rowNumber: prev.rows.length + 1,
        setNumber: `SET-${Math.floor(prev.rows.filter(r => r.type === 'benchmark').length / 1) + 1}`,
        type: 'benchmark',
        stationName: '',
        knownElevation: null,
        bs: null,
        fs: null,
        hi: null,
        elevation: null,
        note: '',
      };
      const newRows = [...prev.rows, newRow];
      const { rows, currentHI } = recalculateRows(newRows);
      return { ...prev, rows, currentHI, lastUpdated: new Date().toISOString() };
    });
  }, []);

  // FS点を追加（基準点のBS入力後のみ可能）
  const addForesight = useCallback(() => {
    setSession(prev => {
      // 基準点が存在しHIが計算済みか確認
      const hasBenchmarkWithHI = prev.rows.some(r => r.type === 'benchmark' && r.hi != null);
      if (!hasBenchmarkWithHI) {
        alert('先に基準点のBS（後視）を入力してください。');
        return prev;
      }

      const newRow: SurveyRow = {
        id: crypto.randomUUID(),
        rowNumber: prev.rows.length + 1,
        setNumber: prev.rows.find(r => r.type === 'benchmark')?.setNumber || 'SET-1',
        type: 'foresight',
        stationName: '',
        knownElevation: null,
        bs: null,
        fs: null,
        hi: null,
        elevation: null,
        note: '',
      };
      const newRows = [...prev.rows, newRow];
      const { rows, currentHI } = recalculateRows(newRows);
      return { ...prev, rows, currentHI, lastUpdated: new Date().toISOString() };
    });
  }, []);

  const updateRow = useCallback((id: string, updates: Partial<SurveyRow>) => {
    setSession(prev => {
      const newRows = prev.rows.map(row =>
        row.id === id ? { ...row, ...updates } : row
      );
      const { rows, currentHI } = recalculateRows(newRows);
      return { ...prev, rows, currentHI, lastUpdated: new Date().toISOString() };
    });
  }, []);

  const deleteRow = useCallback((id: string) => {
    setSession(prev => {
      const remaining = prev.rows.filter(r => r.id !== id);
      const renumbered = remaining.map((r, i) => ({ ...r, rowNumber: i + 1 }));
      const { rows, currentHI } = recalculateRows(renumbered);
      return { ...prev, rows, currentHI, lastUpdated: new Date().toISOString() };
    });
  }, []);

  const saveBenchmark = useCallback((bm: SavedBenchmark) => {
    setSavedBMs(prev => {
      const existing = prev.findIndex(p => p.name === bm.name);
      if (existing >= 0) {
        const copy = [...prev];
        copy[existing] = bm;
        return copy;
      }
      return [...prev, bm];
    });
  }, []);

  const deleteSavedBM = useCallback((id: string) => {
    setSavedBMs(prev => prev.filter(bm => bm.id !== id));
  }, []);

  const clearSession = useCallback(() => {
    if (confirm("全ての入力データを消去しますか？")) {
      setSession({ ...defaultSession, id: crypto.randomUUID() });
    }
  }, []);

  // 現在のHI（器械高）を取得
  const getCurrentHI = useCallback((): number | null => {
    const bmRow = session.rows.find(r => r.type === 'benchmark' && r.hi != null);
    return bmRow?.hi ?? null;
  }, [session.rows]);

  // FS入力時のバリデーション（FS > HI なら警告）
  const validateFS = useCallback((fsValue: number): string | null => {
    const hi = getCurrentHI();
    if (hi != null && fsValue > hi) {
      return `警告: FS(${fsValue.toFixed(3)}) が HI(${hi.toFixed(3)}) より大きいです。標高がマイナスになります。`;
    }
    return null;
  }, [getCurrentHI]);

  return {
    session,
    savedBMs,
    updateSessionField,
    addBenchmark,
    addForesight,
    updateRow,
    deleteRow,
    saveBenchmark,
    deleteSavedBM,
    clearSession,
    getCurrentHI,
    validateFS,
    isLoaded
  };
}
