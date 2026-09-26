import { ScanLine } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useLanguage } from '../../contexts/LanguageContext'
export function EmptyState() { const { t } = useLanguage(); return <div className="panel rounded-3xl bg-white px-6 py-16 text-center"><div className="mx-auto mb-4 grid size-14 place-items-center rounded-2xl bg-[#e5f8b8] text-[#31572a]"><ScanLine/></div><h3 className="display text-xl font-bold text-[#102522]">{t('noScans')}</h3><p className="mx-auto mt-2 max-w-sm text-sm text-[#61716d]">{t('noScansHelp')}</p><Link to="/scanner" className="mt-6 inline-flex rounded-xl bg-[#b8f34a] px-5 py-3 text-sm font-bold text-[#062923]">{t('startScanning')}</Link></div> }
