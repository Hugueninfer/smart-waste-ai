import { ArrowUpRight } from 'lucide-react'
import { Link } from 'react-router-dom'
import type { Classification } from '../../types/classification'
import { formatPercent } from '../../utils/confidence'
import { formatDate } from '../../utils/date'
import { useLanguage } from '../../contexts/LanguageContext'
import { wasteInformation } from '../../data/wasteInformation'
export function RecentScans({ items }: { items: Classification[] }) { const { language, t } = useLanguage(); return <div className="panel rounded-3xl bg-white p-5 sm:p-7"><div className="mb-5 flex items-center justify-between"><div><p className="text-[10px] font-bold uppercase tracking-[.2em] text-[#5ba59b]">{t('activity')}</p><h2 className="display mt-1 text-2xl font-bold">{t('recentScans')}</h2></div><Link to="/history" className="text-xs font-bold text-[#5c9225]">{t('viewAll')} <ArrowUpRight className="inline" size={14}/></Link></div><div className="space-y-3">{items.slice(0, 5).map((item) => <div key={item.id} className="flex items-center justify-between gap-3 rounded-2xl bg-[#f5f8f3] px-3 py-3"><div className="min-w-0"><div className="truncate text-sm font-bold">{wasteInformation[item.predictedClass].name[language]}</div><div className="mt-1 text-[11px] text-[#61716d]">{item.source === 'upload' ? t('sourceUpload') : t('sourceWebcam')} · {formatDate(item.timestamp, language)}</div></div><span className="shrink-0 rounded-full bg-[#e5f8b8] px-2 py-1 text-xs font-bold text-[#31572a]">{formatPercent(item.confidence)}</span></div>)}</div></div> }
