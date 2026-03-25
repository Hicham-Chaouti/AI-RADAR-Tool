import SectionLabel from '../ui/SectionLabel'
import ChipSelect from '../ui/ChipSelect'

interface Props {
  capabilities: string[]
  onToggle: (cap: string) => void
}

const groups = [
  { label: 'Core AI', items: ['AI', 'ML', 'GenAI', 'Agentic AI'] },
  { label: 'Specialized', items: ['Computer Vision', 'NLP', 'RPA'] },
  { label: 'Infrastructure', items: ['Cloud', 'Data', 'IoT', 'Security'] },
  { label: 'Development', items: ['Dev'] },
]

export default function PhaseArsenalStack({ capabilities, onToggle }: Props) {
  return (
    <div>
      <SectionLabel number="03" title="ARSENAL & STACK" />
      <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 24, fontWeight: 800, color: 'var(--text-heading)', marginBottom: 8 }}>
        AI Capabilities
      </h3>
      <p style={{ color: 'var(--text-secondary)', fontSize: 14, marginBottom: 8 }}>
        Select the capabilities relevant to the client.
      </p>
      <p style={{ fontFamily: 'var(--font-mono)', fontSize: 13, fontWeight: 600, color: 'var(--dxc-blue)', marginBottom: 28 }}>
        {capabilities.length} capabilities selected
      </p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
        {groups.map(g => (
          <div key={g.label}>
            <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 10 }}>
              {g.label}
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
