import { CircleDot } from 'lucide-react'
import type { ModelStatus } from '../../types/waste'
import { useLanguage } from '../../contexts/LanguageContext'
export function ModelStatusBadge({ status }: { status: ModelStatus }) { const { t } = useLanguage(); const label = status === 'ready' ? t('modelReady') : status === 'loading' ? t('modelLoading') : status === 'error' ? t('modelUnavailable') : t('modelLoading'); return <div className="flex items-center gap-2 text-xs font-semibold text-white/70"><CircleDot size={14} className={status === 'ready' ? 'text-[#b8f34a]' : status === 'error' ? 'text-red-300' : 'text-amber-200'} />{t('model')}: {label}</div> }
