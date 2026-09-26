import '@testing-library/jest-dom/vitest'
Object.defineProperty(window, 'matchMedia', { writable: true, value: (query: string) => ({ matches: false, media: query, addEventListener: () => {}, removeEventListener: () => {}, addListener: () => {}, removeListener: () => {} }) })
globalThis.ResizeObserver = class { observe() {} unobserve() {} disconnect() {} }
Object.defineProperty(URL, 'createObjectURL', { writable: true, value: () => 'blob:smart-waste' })
Object.defineProperty(URL, 'revokeObjectURL', { writable: true, value: () => {} })
