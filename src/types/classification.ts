import type { Prediction } from './prediction'
import type { WasteClass } from './waste'
export interface Classification { id: string; predictedClass: WasteClass; confidence: number; predictions: Prediction[]; source: 'upload' | 'webcam'; timestamp: string }
