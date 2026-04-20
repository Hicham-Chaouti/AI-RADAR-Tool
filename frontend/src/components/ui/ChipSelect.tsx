import type { ReactNode } from 'react'
import { CheckCircle2 } from 'lucide-react'

interface ChipSelectProps {
  label: string
  selected: boolean
  onToggle: () => void
  icon?: ReactNode
}

export default function ChipSelect({ label, selected, onToggle, icon }: ChipSelectProps) {
  return (
    <button
      type="button"
      onClick={onToggle}
      className={selected ? 'chip chip--active' : 'chip'}
    >
      {selected && <CheckCircle2 size={14} strokeWidth={2.5} />}
      {icon}
      {label}
    </button>
  )
}
