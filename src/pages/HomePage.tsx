import { useRef, useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { createGame, deleteGame, findGameByCode, forgetGame, importGame, useStore } from '../services/storage'
import { ConfirmButton, useToast } from '../components/ui'
import { Logo } from '../components/Layout'

export default function HomePage() {
  const { games, characters, uid } = useStore()
  const [busy, setBusy] = useState(false)
  const navigate = useNavigate()
  const toast = useToast()
  const [code, setCode] = useState('')
  const [form, setForm] = useState({ name: '', refName: '', village: '' })
  const fileRef = useRef<HTMLInputElement>(null)

  const join = async (e: FormEvent) => {
    e.preventDefault()
    setBusy(true)
    try {
      const game = await findGameByCode(code)
      if (!game) return toast('Bu kodla bir oyun bulunamadı', 'error')
      navigate(`/game/${game.code}/new`)
    } catch {
      toast('Bağlantı hatası, tekrar dene', 'error')
    } finally {
      setBusy(false)
    }
  }

  const create = async (e: FormEvent) => {
    e.preventDefault()
    if (!form.name.trim()) return toast('Oyuna bir isim ver', 'error')
    setBusy(true)
    try {
      const game = await createGame({ name: form.name.trim(), refName: form.refName.trim(), village: form.village.trim() })
      toast(`Oyun oluşturuldu · Kod: ${game.code}`)
      navigate(`/game/${game.code}`)
    } catch {
      toast('Oyun oluşturulamadı, bağlantını kontrol et', 'error')
    } finally {
      setBusy(false)
    }
  }

  const onImport = async (file?: File) => {
    if (!file) return
    try {
      const game = await importGame(await file.text())
      toast(`${game.name} içe aktarıldı`)
      navigate(`/game/${game.code}`)
    } catch {
      toast('Dosya okunamadı', 'error')
    }
  }

  return (
    <div className="space-y-8">
      <section className="py-6 text-center sm:py-10">
        <Logo className="mx-auto mb-4 h-16 w-16 text-bone" />
        <h1 className="heading text-3xl font-extrabold sm:text-5xl">Zindana girmeden önce</h1>
        <p className="mx-auto mt-3 max-w-xl text-dust">
          Ref oyunu kurar, oyuncular 6 haneli kodla katılıp karakterini yaratır. Stamina, yara ve envanteri tek ekrandan takip edin.
        </p>
      </section>

      <div className="grid gap-4 md:grid-cols-2">
        <form onSubmit={join} className="card p-5">
          <h2 className="heading mb-1 text-xl">Oyuna Katıl</h2>
          <p className="mb-4 text-sm text-dust">Ref'in verdiği kodu gir ve karakterini oluştur.</p>
          <label className="label" htmlFor="code">Oyun kodu</label>
          <div className="flex gap-2">
            <input
              id="code"
              className="input text-center font-mono text-xl tracking-[0.4em] uppercase"
              maxLength={6}
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              placeholder="ABC123"
              autoComplete="off"
            />
            <button className="btn-primary shrink-0" disabled={code.length < 6 || busy}>{busy ? '…' : 'Katıl'}</button>
          </div>
        </form>

        <form onSubmit={create} className="card p-5">
          <h2 className="heading mb-1 text-xl">Yeni Oyun Oluştur</h2>
          <p className="mb-4 text-sm text-dust">Ref olarak kampanyayı başlat, kodu oyuncularla paylaş.</p>
          <div className="space-y-3">
            <div>
              <label className="label" htmlFor="gname">Oyun adı</label>
              <input id="gname" className="input" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Kan Kütüphanesi Seferi" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="label" htmlFor="ref">Ref</label>
                <input id="ref" className="input" value={form.refName} onChange={(e) => setForm({ ...form, refName: e.target.value })} placeholder="İsim" />
              </div>
              <div>
                <label className="label" htmlFor="village">Köy</label>
                <input id="village" className="input" value={form.village} onChange={(e) => setForm({ ...form, village: e.target.value })} placeholder="Köy adı" />
              </div>
            </div>
            <button className="btn-primary w-full" disabled={busy}>{busy ? 'Oluşturuluyor…' : 'Oyunu Oluştur'}</button>
          </div>
        </form>
      </div>

      <section>
        <div className="mb-3 flex items-center justify-between gap-2">
          <h2 className="heading text-xl">Oyunlarım</h2>
          <button className="btn-ghost min-h-9 text-sm" onClick={() => fileRef.current?.click()}>Yedekten yükle</button>
          <input ref={fileRef} type="file" accept="application/json" hidden onChange={(e) => onImport(e.target.files?.[0])} />
        </div>
        {games.length === 0 ? (
          <p className="card p-6 text-center text-dust">Henüz oyun yok. Yeni bir oyun oluştur ya da kodla katıl.</p>
        ) : (
          <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {[...games].reverse().map((g) => {
              const count = characters.filter((c) => c.gameId === g.id).length
              return (
                <li key={g.id} className="card flex flex-col gap-3 p-4">
                  <Link to={`/game/${g.code}`} className="group">
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="heading text-lg group-hover:text-gold">{g.name}</h3>
                      <span className="rounded-lg bg-ink px-2 py-1 font-mono text-sm tracking-widest text-gold">{g.code}</span>
                    </div>
                    <p className="mt-1 text-sm text-dust">
                      {count} crow{g.refName && ` · Ref: ${g.refName}`}{g.village && ` · ${g.village}`}
                    </p>
                  </Link>
                  <div className="mt-auto flex gap-2">
                    <Link to={`/game/${g.code}`} className="btn-ghost flex-1 text-sm">Aç</Link>
                    {g.ownerUid === uid ? (
                      <ConfirmButton className="btn-danger flex-1 text-sm" onConfirm={() => deleteGame(g.id).then(() => toast('Oyun herkes için silindi'), () => toast('Silinemedi', 'error'))}>Sil</ConfirmButton>
                    ) : (
                      <button className="btn-ghost flex-1 text-sm" onClick={() => { forgetGame(g.id); toast('Listeden kaldırıldı') }}>Listeden kaldır</button>
                    )}
                  </div>
                </li>
              )
            })}
          </ul>
        )}
      </section>
    </div>
  )
}
