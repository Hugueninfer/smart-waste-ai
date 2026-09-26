import * as tmImage from '@teachablemachine/image'
import { WASTE_CLASSES, type WasteClass } from '../types/waste'
import type { Prediction } from '../types/prediction'
let model: tmImage.CustomMobileNet | null = null
let modelPromise: Promise<void> | null = null
const mockMode = import.meta.env.VITE_USE_MOCK_MODEL !== 'false'
export class ModelLoadError extends Error { constructor(message = 'MODEL_UNAVAILABLE') { super(message); this.name = 'ModelLoadError' } }
const normalize = (values: Array<{ className: string; probability: number }>): Prediction[] => {
  const byClass = new Map(values.map((item) => [item.className, Math.max(0, Math.min(1, item.probability))]))
  const total = WASTE_CLASSES.reduce((sum, name) => sum + (byClass.get(name) ?? 0), 0) || 1
  return WASTE_CLASSES.map((className) => ({ className, probability: (byClass.get(className) ?? 0) / total })).sort((a, b) => b.probability - a.probability)
}
export async function loadModel() { if (model || modelPromise) return modelPromise; modelPromise = (async () => { if (mockMode) return; try { model = await tmImage.load('/model/model.json', '/model/metadata.json') } catch { modelPromise = null; throw new ModelLoadError() } })(); return modelPromise }
export function resetModel() { model = null; modelPromise = null }
export async function predict(input: HTMLImageElement | HTMLVideoElement | HTMLCanvasElement): Promise<Prediction[]> { await loadModel(); if (mockMode) { const lead = WASTE_CLASSES[Math.floor(Math.random() * WASTE_CLASSES.length)]; const leadProbability = .68 + Math.random() * .25; const rest = (1 - leadProbability) / 5; return normalize(WASTE_CLASSES.map((className) => ({ className, probability: className === lead ? leadProbability : rest }))) } if (!model) throw new ModelLoadError(); try { return normalize(await model.predict(input)) } catch { throw new Error('PREDICTION_FAILED') } }
