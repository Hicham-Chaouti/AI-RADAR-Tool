import { useTranslation } from '../../hooks/useTranslation'

// TODO (Phase 6): Implement search bar with 300ms debounce
/** Search bar for natural language use case queries. */
export default function SearchBar() {
    const { t } = useTranslation()
    return <input type="text" placeholder={t('search.placeholder')} className="w-full border rounded-lg px-4 py-2" />
}
