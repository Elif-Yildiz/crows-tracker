import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from 'react'

/** Mobilde alttan açılan sayfa, masaüstünde ortalanmış pencere. */
export function Modal({ open, onClose, title, children }: { open: boolean; onClose: () => void; title: string; children: ReactNode }) {
  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose()
    document.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
    }
  }, [open, onClose])
  if (!open) return null
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center sm:p-4" role="dialog" aria-modal="true" aria-label={title}>
      <button className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} aria-label="Kapat" />
      <div className="card animate-sheet sm:animate-pop safe-bottom relative max-h-[90dvh] w-full overflow-y-auto rounded-b-none p-5 sm:max-w-lg sm:rounded-2xl">
        <div className="mx-auto mb-3 h-1.5 w-12 rounded-full bg-smoke sm:hidden" />
        <div className="mb-4 flex items-center justify-between gap-4">
          <h2 className="heading text-xl">{title}</h2>
          <button onClick={onClose} className="btn-ghost min-h-9 px-3 text-sm" aria-label="Kapat">✕</button>
        </div>
        {children}
      </div>
    </div>
  )
}

type Toast = { id: number; text: string; tone: 'info' | 'error' }
const ToastCtx = createContext<(text: string, tone?: Toast['tone']) => void>(() => {})

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([])
  const push = useCallback((text: string, tone: Toast['tone'] = 'info') => {
    const id = Date.now() + Math.random()
    setToasts((t) => [...t.slice(-2), { id, text, tone }])
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 2600)
  }, [])
  return (
    <ToastCtx.Provider value={push}>
      {children}
      <div className="pointer-events-none fixed inset-x-0 top-4 z-[60] flex flex-col items-center gap-2 px-4" aria-live="polite">
        {toasts.map((t) => (
          <div key={t.id} className={`animate-pop rounded-xl border px-4 py-2 text-sm font-medium shadow-lg ${t.tone === 'error' ? 'border-blood bg-blood/90' : 'border-smoke bg-ash/95'}`}>
            {t.text}
          </div>
        ))}
      </div>
    </ToastCtx.Provider>
  )
}

export const useToast = () => useContext(ToastCtx)

export function Stepper({ value, onChange, min = -99, max = 999, label }: { value: number; onChange: (v: number) => void; min?: number; max?: number; label: string }) {
  return (
    <div className="flex items-center gap-1" aria-label={label}>
      <button className="btn-ghost min-h-10 w-10 px-0 text-lg" onClick={() => onChange(Math.max(min, value - 1))} aria-label={`${label} azalt`}>−</button>
      <span className="w-10 text-center text-lg font-bold tabular-nums">{value}</span>
      <button className="btn-ghost min-h-10 w-10 px-0 text-lg" onClick={() => onChange(Math.min(max, value + 1))} aria-label={`${label} artır`}>+</button>
    </div>
  )
}

export function ConfirmButton({ onConfirm, children, className = 'btn-danger' }: { onConfirm: () => void; children: ReactNode; className?: string }) {
  const [armed, setArmed] = useState(false)
  useEffect(() => {
    if (!armed) return
    const t = setTimeout(() => setArmed(false), 3000)
    return () => clearTimeout(t)
  }, [armed])
  return (
    <button className={className} onClick={() => (armed ? onConfirm() : setArmed(true))}>
      {armed ? 'Emin misin? Tekrar dokun' : children}
    </button>
  )
}

export const signed = (n: number) => (n > 0 ? `+${n}` : `${n}`)
