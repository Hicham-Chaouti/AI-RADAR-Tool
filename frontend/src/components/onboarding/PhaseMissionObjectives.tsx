import SectionLabel from '../ui/SectionLabel'
import ChipSelect from '../ui/ChipSelect'

interface Props {
  objectives: string[]
  onToggle: (obj: string) => void
  notes: string
  onNotesChange: (n: string) => void
}

const objectiveOptions = [
  'Reduce operational costs',
  'Improve customer experience',
  'Accelerate digital transformation',
  'Enhance compliance & governance',
  'Drive revenue growth',
  'Optimize supply chain',
  'Boost employee productivity',
]

export default function PhaseMissionObjectives({ objectives, onToggle, notes, onNotesChange }: Props) {
  return (
    <div>
      <SectionLabel number="04" title="MISSION OBJECTIVES" />
      <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 24, fontWeight: 800, color: 'var(--text-heading)', marginBottom: 8 }}>
        Strategic Objectives
      </h3>
      <p style={{ color: 'var(--text-secondary)', fontSize: 14, marginBottom: 28 }}>
        What does the client want to achieve with AI?
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
          Additional context (optional)
        </label>
        <textarea
          className="input"
          rows={3}
          placeholder="Any specific requirements, constraints or context..."
          value={notes}
          onChange={e => onNotesChange(e.target.value)}
          style={{ resize: 'vertical', minHeight: 80 }}
        />
      </div>
    </div>
  )
}
