import { expect, it } from 'vitest'
import { wasteInformation } from './wasteInformation'
it('contains complete localized information for every waste class', () => { expect(Object.keys(wasteInformation)).toHaveLength(6); Object.values(wasteInformation).forEach((entry) => { expect(entry.name.en).toBeTruthy(); expect(entry.name.pt).toBeTruthy(); expect(entry.examples.en.length).toBeGreaterThan(0); expect(entry.examples.pt.length).toBeGreaterThan(0) }) })
