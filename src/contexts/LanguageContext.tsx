import { createContext, useContext, useMemo, useState, type ReactNode } from 'react'
import { readLanguage, writeLanguage } from '../services/storageService'
import { translate, type TranslationKey } from '../i18n/translations'
import type { Language } from '../types/waste'
type LanguageContextValue = { language: Language; setLanguage: (language: Language) => void; t: (key: TranslationKey) => string }
const LanguageContext = createContext<LanguageContextValue | null>(null)
export function LanguageProvider({ children }: { children: ReactNode }) { const [language, setValue] = useState<Language>(readLanguage); const setLanguage = (next: Language) => { setValue(next); writeLanguage(next) }; const value = useMemo(() => ({ language, setLanguage, t: (key: TranslationKey) => translate(language, key) }), [language]); return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider> }
export function useLanguage() { const value = useContext(LanguageContext); if (!value) throw new Error('useLanguage must be used within LanguageProvider'); return value }
