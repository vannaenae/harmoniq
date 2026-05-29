import { cn, getInitials } from '@/lib/utils'

interface AvatarProps {
  src?: string | null
  name: string
  size?: 'sm' | 'md' | 'lg' | 'xl'
  className?: string
}

const sizeClasses = {
  sm: 'w-8 h-8 text-xs',
  md: 'w-10 h-10 text-sm',
  lg: 'w-14 h-14 text-lg',
  xl: 'w-20 h-20 text-2xl',
}

export function Avatar({ src, name, size = 'md', className }: AvatarProps) {
  return (
    <div
      className={cn(
        'rounded-full overflow-hidden flex items-center justify-center flex-shrink-0',
        'bg-harmonic-tertiary text-white font-semibold select-none',
        sizeClasses[size],
        className,
      )}
      aria-label={name}
    >
      {src ? (
        <img src={src} alt={name} className="w-full h-full object-cover" />
      ) : (
        <span>{getInitials(name)}</span>
      )}
    </div>
  )
}
