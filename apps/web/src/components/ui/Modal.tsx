import { type ReactNode } from 'react'
import * as Dialog from '@radix-ui/react-dialog'
import { X } from 'lucide-react'

interface ModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  description?: string
  children: ReactNode
  /** Optional footer area (e.g. action buttons) */
  footer?: ReactNode
}

export function Modal({ open, onOpenChange, title, description, children, footer }: ModalProps) {
  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/30 z-40 data-[state=open]:animate-in data-[state=open]:fade-in" />
        <Dialog.Content
          className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50
                     w-[calc(100vw-2rem)] max-w-md max-h-[85vh] overflow-y-auto
                     bg-white rounded-card-lg shadow-card-hover p-6 focus:outline-none"
        >
          <div className="flex items-start justify-between gap-4 mb-4">
            <div>
              <Dialog.Title className="text-lg font-semibold text-harmonic-text">{title}</Dialog.Title>
              {description && (
                <Dialog.Description className="text-sm text-harmonic-muted mt-1">
                  {description}
                </Dialog.Description>
              )}
            </div>
            <Dialog.Close
              className="p-1.5 rounded-full hover:bg-harmonic-surface transition-colors flex-shrink-0 min-w-[32px] min-h-[32px] flex items-center justify-center"
              aria-label="Close dialog"
            >
              <X size={18} className="text-harmonic-muted" />
            </Dialog.Close>
          </div>

          <div>{children}</div>

          {footer && <div className="mt-6 flex gap-2 justify-end">{footer}</div>}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
