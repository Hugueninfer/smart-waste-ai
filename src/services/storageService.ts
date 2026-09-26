import { WASTE_CLASSES, type Language } from '../types/waste'
import type { Classification } from '../types/classification'
const HISTORY_KEY = 'smart-waste-ai:history:v1'
const LANGUAGE_KEY = 'smart-waste-ai:language:v1'
const isClass = (value: unknown) => typeof value === 'string' && WASTE_CLASSES.includes(value as never)
const isRecord = (value: unknown): value is Classification => {
  if (!value || typeof value !== 'object') return false
  const v = value as Record<string, unknown>
  return typeof v.id === 'string' && isClass(v.predictedClass) && typeof v.confidence === 'number' && v.confidence >= 0 && v.confidence <= 1 && (v.source === 'upload' || v.source === 'webcam') && typeof v.timestamp === 'string' && Array.isArray(v.predictions)
}
export function readHistory(): Classification[] { try { const raw = localStorage.getItem(HISTORY_KEY); if (!raw) return []; const parsed: unknown = JSON.parse(raw); return Array.isArray(parsed) ? parsed.filter(isRecord) : [] } catch { return [] } }
export function writeHistory(items: Classification[]) { try { localStorage.setItem(HISTORY_KEY, JSON.stringify(items)) } catch { /* storage is optional */ } }
export function clearHistory() { try { localStorage.removeItem(HISTORY_KEY) } catch { /* storage is optional */ } }
export function readLanguage(): Language { try { return localStorage.getItem(LANGUAGE_KEY) === 'pt' ? 'pt' : 'en' } catch { return 'en' } }
export function writeLanguage(language: Language) { try { localStorage.setItem(LANGUAGE_KEY, language) } catch { /* storage is optional */ } }
