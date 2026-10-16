import { Link } from 'react-router-dom'

export function Loading() {
  return (
    <div className="mt-16 flex flex-col items-center gap-3 text-dust" role="status">
      <span className="h-8 w-8 animate-spin rounded-full border-2 border-smoke border-t-gold" />
      Kargalar veriyi getiriyor…
    </div>
  )
}

export default function NotFound({ what = 'Sayfa' }: { what?: string }) {
  return (
    <div className="card mx-auto mt-10 max-w-md p-8 text-center">
      <h1 className="heading mb-2 text-2xl">{what} bulunamadı</h1>
      <p className="mb-6 text-dust">Kargalar burada hiçbir şey bulamadı. Kod yanlış olabilir ya da bu oyun silinmiş.</p>
      <Link to="/" className="btn-primary">Ana sayfaya dön</Link>
    </div>
  )
}
