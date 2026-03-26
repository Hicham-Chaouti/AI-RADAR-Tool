import SectionLabel from '../ui/SectionLabel'
import ChipSelect from '../ui/ChipSelect'
import { useTranslation } from '../../hooks/useTranslation'

interface Props {
  capabilities: string[]
  onToggle: (cap: string) => void
}

const groups = [
  { key: 'coreAi', items: ['AI', 'ML', 'GenAI', 'Agentic AI'] },
  { key: 'specialized', items: ['Computer Vision', 'NLP', 'RPA'] },
  { key: 'infrastructure', items: ['Cloud', 'Data', 'IoT', 'Security'] },
  { key: 'development', items: ['Dev'] },
]

export default function PhaseArsenalStack({ capabilities, onToggle }: Props) {
  const { t } = useTranslation()

  return (
    <div>
      <SectionLabel number="03" title={t('onboarding.arsenal.sectionLabel')} />
      <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 24, fontWeight: 800, color: 'var(--text-heading)', marginBottom: 8 }}>
        {t('onboarding.arsenal.title')}
      </h3>
      <p style={{ color: 'var(--text-secondary)', fontSize: 14, marginBottom: 8 }}>
        {t('onboarding.arsenal.subtitle')}
      </p>
      <p style={{ fontFamily: 'var(--font-mono)', fontSize: 13, fontWeight: 600, color: 'var(--dxc-blue)', marginBottom: 28 }}>
        {t('onboarding.arsenal.selectedCount', { count: capabilities.length })}
      </p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
        {groups.map(g => (
          <div key={g.key}>
            <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 10 }}>
              {t(`onboarding.arsenal.groups.${g.key}`)}
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {g.items.map(item => (
                <ChipSelect
                  key={item}
                  label={item}
                  selected={capabilities.includes(item)}
                  onToggle={() => onToggle(item)}
                />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
