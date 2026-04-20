import SectionLabel from '../ui/SectionLabel'
import ChipSelect from '../ui/ChipSelect'
import { useTranslation } from '../../hooks/useTranslation'

interface Props {
  objectives: string[]
  onToggle: (obj: string) => void
  notes: string
  onNotesChange: (n: string) => void
}

export default function PhaseMissionObjectives({ objectives, onToggle, notes, onNotesChange }: Props) {
  const { t } = useTranslation()

  const objectiveOptions = [
    t('onboarding.objectives.options.reduceCosts'),
    t('onboarding.objectives.options.improveCx'),
    t('onboarding.objectives.options.accelerateTransformation'),
    t('onboarding.objectives.options.enhanceCompliance'),
    t('onboarding.objectives.options.driveRevenue'),
    t('onboarding.objectives.options.optimizeSupplyChain'),
    t('onboarding.objectives.options.boostProductivity'),
  ]

  return (
    <div>
      <SectionLabel number="04" title={t('onboarding.objectives.sectionLabel')} />
      <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 24, fontWeight: 800, color: 'var(--text-heading)', marginBottom: 8 }}>
        {t('onboarding.objectives.title')}
      </h3>
      <p style={{ color: 'var(--text-secondary)', fontSize: 14, marginBottom: 28 }}>
        {t('onboarding.objectives.subtitle')}
      </p>

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, marginBottom: 28 }}>
        {objectiveOptions.map(obj => (
          <ChipSelect
            key={obj}
            label={obj}
            selected={objectives.includes(obj)}
            onToggle={() => onToggle(obj)}
          />
        ))}
      </div>

      <div>
        <label style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-heading)', marginBottom: 6, display: 'block' }}>
          {t('onboarding.objectives.additionalContextLabel')}
        </label>
        <textarea
          className="input"
          rows={3}
          placeholder={t('onboarding.objectives.additionalContextPlaceholder')}
          value={notes}
          onChange={e => onNotesChange(e.target.value)}
          style={{ resize: 'vertical', minHeight: 80 }}
        />
      </div>
    </div>
  )
}
