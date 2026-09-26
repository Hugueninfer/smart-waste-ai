export type ConfidenceTier = 'high' | 'medium' | 'low'
export function getConfidenceTier(probability: number): ConfidenceTier { return probability >= 0.85 ? 'high' : probability >= 0.65 ? 'medium' : 'low' }
export function formatPercent(probability: number): string { return `${(probability * 100).toFixed(2)}%` }
