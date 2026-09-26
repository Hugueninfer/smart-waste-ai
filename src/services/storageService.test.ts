import { beforeEach, expect, it } from 'vitest'
import { clearHistory, readHistory, readLanguage, writeHistory, writeLanguage } from './storageService'
beforeEach(() => localStorage.clear())
it('falls back to an empty history for malformed data', () => { localStorage.setItem('smart-waste-ai:history:v1', '{'); expect(readHistory()).toEqual([]) })
it('round trips history and language safely', () => { const item = { id: '1', predictedClass: 'Plastic', confidence: .9, predictions: [], source: 'upload', timestamp: new Date().toISOString() } as const; writeHistory([item as never]); expect(readHistory()).toEqual([item]); writeLanguage('pt'); expect(readLanguage()).toBe('pt'); clearHistory(); expect(readHistory()).toEqual([]) })
