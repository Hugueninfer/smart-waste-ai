import { createContext, useContext, type ReactNode } from 'react'
import { useModel } from '../hooks/useModel'
type ModelContextValue = ReturnType<typeof useModel>
const ModelContext = createContext<ModelContextValue | null>(null)
export function ModelProvider({ children }: { children: ReactNode }) { const value = useModel(); return <ModelContext.Provider value={value}>{children}</ModelContext.Provider> }
export function useSharedModel() { const value = useContext(ModelContext); if (!value) throw new Error('useSharedModel must be used within ModelProvider'); return value }
