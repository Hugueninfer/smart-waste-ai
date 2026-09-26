import { describe, expect, it } from 'vitest'
import { formatPercent, getConfidenceTier } from './confidence'
describe('confidence tiers', () => {
  it.each([[0.85, 'high'], [0.8499, 'medium'], [0.65, 'medium'], [0.6499, 'low']] as const)('maps %s to %s', (value, tier) => expect(getConfidenceTier(value)).toBe(tier))
  it('formats a probability', () => expect(formatPercent(0.9643)).toBe('96.43%'))
})
