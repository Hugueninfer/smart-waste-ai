export const WASTE_CLASSES = ['Cardboard', 'Glass', 'Metal', 'Paper', 'Plastic', 'Trash'] as const
export type WasteClass = (typeof WASTE_CLASSES)[number]
export type Language = 'en' | 'pt'
export type ModelStatus = 'idle' | 'loading' | 'ready' | 'error'
export interface LocalizedText { en: string; pt: string }
export interface WasteInformation { name: LocalizedText; recyclable: boolean; description: LocalizedText; disposalInstructions: LocalizedText; examples: { en: string[]; pt: string[] } }
