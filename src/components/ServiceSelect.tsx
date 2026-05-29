import { Select } from '@/components/ui/Select'
import { formatShortDate } from '@/lib/utils'
import type { Service } from '@/types'

interface ServiceSelectProps {
  services: Service[]
  value?: string
  onValueChange: (id: string) => void
}

export function ServiceSelect({ services, value, onValueChange }: ServiceSelectProps) {
  const options = services.map(s => ({
    value: s.id,
    label: `${s.title} · ${formatShortDate(s.date)}`,
  }))
  return (
    <Select
      ariaLabel="Select a service"
      value={value}
      onValueChange={onValueChange}
      options={options}
      placeholder="Choose a service"
    />
  )
}
