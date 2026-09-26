import type { Language } from '../types/waste'
export function formatDate(timestamp: string, language: Language): string { return new Intl.DateTimeFormat(language === 'pt' ? 'pt-BR' : 'en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' }).format(new Date(timestamp)) }
