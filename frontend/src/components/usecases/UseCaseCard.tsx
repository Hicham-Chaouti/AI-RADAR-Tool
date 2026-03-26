import { Link } from 'react-router-dom'
import type { UseCaseScored } from '../../types/useCase'
import { useTranslation } from '../../hooks/useTranslation'
import { useLocalizedDynamicText } from '../../hooks/useLocalizedDynamicText'

interface Props {
    item: UseCaseScored
}

/**
 * Reusable card example for localized dynamic backend content.
 * Intentionally renders the translated description/justification text first.
 */
export default function UseCaseCard({ item }: Props) {
    const { t } = useTranslation()
    const { text } = useLocalizedDynamicText(item.justification || item.title)

    return (
        <article className="border rounded-xl p-4 shadow-sm bg-white flex flex-col gap-3">
            <p className="text-sm text-gray-700 leading-6">{text}</p>

            <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-blue-700 bg-blue-50 px-2 py-1 rounded-md">
                    {item.radar_score.toFixed(1)}
                </span>
                <Link
                    to={`/usecase/${item.use_case_id || item.id}`}
                    className="text-sm font-semibold text-blue-700 hover:text-blue-800"
                >
                    {t('actions.readMore')}
                </Link>
            </div>
        </article>
    )
}
