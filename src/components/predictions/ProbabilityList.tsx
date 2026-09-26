import type { Prediction } from '../../types/prediction'
import { formatPercent } from '../../utils/confidence'
import { useLanguage } from '../../contexts/LanguageContext'
import { wasteInformation } from '../../data/wasteInformation'
export function ProbabilityList({ predictions }: { predictions: Prediction[] }) { const { language } = useLanguage(); return <div className="space-y-3">{predictions.map((prediction, index) => <div key={prediction.className}><div className="mb-1 flex items-center justify-between text-xs font-bold"><span>{wasteInformation[prediction.className].name[language]}</span><span className="text-[#61716d]">{formatPercent(prediction.probability)}</span></div><div className="h-2 overflow-hidden rounded-full bg-[#e8ede6]"><div className={`h-full rounded-full transition-all ${index === 0 ? 'bg-[#b8f34a]' : 'bg-[#79c8c4]'}`} style={{ width: `${Math.max(0, prediction.probability * 100)}%` }} /></div></div>)}</div> }
