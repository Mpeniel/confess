import ProgressBar from './ProgressBar'
import { Link } from 'react-router-dom'

interface CampaignCardProps {
    title: string
    subtitle?: string
    progress?: number
    cta?: string
    to?: string
}

export default function CampaignCard({ title, subtitle, progress = 0, cta = 'Continuer', to = '#' }: CampaignCardProps) {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h3 className="text-lg font-semibold">{title}</h3>
          {subtitle && <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">{subtitle}</p>}
        </div>

        <Link
          to={to}
          className="inline-flex items-center gap-2 rounded-xl bg-[#4A9EE6] px-4 py-2 text-white font-medium shadow-sm hover:opacity-95"
        >
          {cta}
          <span>→</span>
        </Link>
      </div>

      <div className="mt-5 space-y-2">
        <div className="text-xs text-gray-500 dark:text-gray-400">Progression</div>
        <ProgressBar value={progress} />
        <div className="text-right text-xs text-gray-500 dark:text-gray-400">{progress}%</div>
      </div>
    </div>
  )
}
