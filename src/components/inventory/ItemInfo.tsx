import { itemInfo } from '../../data/itemDescriptions'

/** Envanter kartındaki eşya özelliklerini (menzil, saldırı, etkiler, fiyat) gösterir. */
export default function ItemInfo({ name, category, compact = false }: { name: string; category?: string; compact?: boolean }) {
  const info = itemInfo(name, category)
  if (!info) return null
  if (compact) {
    return <span lang="en" className="line-clamp-2 block text-xs leading-snug text-dust">{info.text.replace(/\n/g, ' · ')}</span>
  }
  return (
    <section className="rounded-xl border border-gold/30 bg-ink/70 p-3" aria-label="Kart bilgisi">
      <div className="mb-1.5 flex items-center justify-between gap-2">
        <span className="label mb-0 text-gold">Kart bilgisi</span>
        {info.price && <span className="text-xs font-semibold text-gold">{info.price}</span>}
      </div>
      <div lang="en" className="space-y-1 text-sm leading-relaxed text-bone/90">
        {info.text.split('\n').map((line, i) => {
          // "Maneuver:", "Action:", "12-16:" gibi etiketleri vurgula
          const m = line.match(/^([^:·]{1,24}:)(.*)$/)
          return (
            <p key={i}>
              {m ? (
                <>
                  <strong className="font-semibold text-bone">{m[1]}</strong>
                  {m[2]}
                </>
              ) : (
                line
              )}
            </p>
          )
        })}
      </div>
    </section>
  )
}
