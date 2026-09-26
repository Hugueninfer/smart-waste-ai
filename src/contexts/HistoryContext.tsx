import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react'
import { clearHistory as clearStored, readHistory, writeHistory } from '../services/storageService'
import type { Classification } from '../types/classification'
type HistoryValue = { history: Classification[]; addClassification: (item: Classification) => void; clearHistory: () => void }
const HistoryContext = createContext<HistoryValue | null>(null)
export function HistoryProvider({ children }: { children: ReactNode }) { const [history, setHistory] = useState<Classification[]>(readHistory); const addClassification = useCallback((item: Classification) => setHistory((current) => { const next = [item, ...current]; writeHistory(next); return next }), []); const clearHistory = useCallback(() => { clearStored(); setHistory([]) }, []); const value = useMemo(() => ({ history, addClassification, clearHistory }), [history, addClassification, clearHistory]); return <HistoryContext.Provider value={value}>{children}</HistoryContext.Provider> }
export function useClassificationHistory() { const value = useContext(HistoryContext); if (!value) throw new Error('useClassificationHistory must be used within HistoryProvider'); return value }
