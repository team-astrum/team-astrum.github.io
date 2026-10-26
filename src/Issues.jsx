import { useEffect, useState } from 'react'
import { members, issuesRepo } from './data'

const VISIBLE = 5
const KEY = 'issues-cache-v2'
const TTL = 5 * 60 * 1000
const HEADERS = { Accept: 'application/vnd.github+json' }

// Scadenza: etichetta "scadenza:AAAA-MM-GG", altrimenti scadenza della milestone
function normalize(i) {
  const labels = i.labels.map((l) => l.name)
  const due = labels.find((n) => /^scadenza:\d{4}-\d{2}-\d{2}$/.test(n))?.slice(9) ?? i.milestone?.due_on?.slice(0, 10) ?? null
  return {
    n: i.number, title: i.title, url: i.html_url, due,
    assignee: i.assignees?.[0]?.login ?? null,
    high: labels.includes('priorità:alta'),
    closed: i.state === 'closed',
    closedAt: i.closed_at?.slice(0, 10) ?? null,
  }
}

async function get(query) {
  const r = await fetch(`https://api.github.com/repos/${issuesRepo}/issues?${query}`, { headers: HEADERS })
  if (!r.ok) throw new Error(String(r.status))
  return r.json()
}

async function load() {
  try {
    const c = JSON.parse(sessionStorage.getItem(KEY))
    if (c && Date.now() - c.t < TTL) return c.rows
  } catch { /* cache assente */ }
  // Tutte le aperte + le ultime chiuse (per la vista "Completate")
  const [open, closed] = await Promise.all([
    get('state=open&per_page=100'),
    get('state=closed&per_page=50&sort=updated&direction=desc'),
  ])
  const rows = [...open, ...closed].filter((i) => !i.pull_request).map(normalize)
  try { sessionStorage.setItem(KEY, JSON.stringify({ t: Date.now(), rows })) } catch { /* ignora */ }
  return rows
}

// Giorni da oggi alla scadenza (negativo = in ritardo)
function daysLeft(iso) {
  if (!iso) return null
  const today = new Date(); today.setHours(0, 0, 0, 0)
  return Math.round((new Date(`${iso}T00:00:00`) - today) / 864e5)
}

function status(r) {
  if (r.closed) {
    const when = r.closedAt ? ` il ${r.closedAt}` : ''
    return { text: `Completata${when}`, color: 'text-(--purple-color)', dot: 'fa-solid fa-check' }
  }
  const d = r.d
  if (d === null) return { text: 'Senza scadenza', color: 'text-(--txt-gray)', dot: 'fa-solid fa-equals' }
  if (d < 0) return { text: `${-d} ${-d === 1 ? 'giorno' : 'giorni'} di ritardo`, color: 'text-(--red-color)', dot: 'fa-solid fa-arrow-trend-down' }
  if (d === 0) return { text: 'Scade oggi', color: 'text-(--orange-color)', dot: 'fa-regular fa-clock' }
  if (d <= 3) return { text: `Tra ${d} ${d === 1 ? 'giorno' : 'giorni'}`, color: 'text-(--orange-color)', dot: 'fa-regular fa-clock' }
  return { text: `Tra ${d} giorni`, color: 'text-(--green-color)', dot: 'fa-solid fa-arrow-trend-up' }
}

const category = (r) => (r.closed ? 'done' : r.d !== null && r.d < 0 ? 'late' : 'todo')
const FILTERS = [
  { id: 'todo', label: 'Da completare' },
  { id: 'late', label: 'In ritardo' },
  { id: 'done', label: 'Completate' },
]

export default function Issues() {
  const [data, setData] = useState(null)
  const [error, setError] = useState(null)
  const [all, setAll] = useState(false)
  const [show, setShow] = useState({ todo: true, late: true, done: false })

  useEffect(() => {
    load().then(setData).catch((e) => setError(e.message))
  }, [])

  const rows = (data ?? []).map((i) => ({ ...i, d: daysLeft(i.due) }))
  const count = Object.fromEntries(FILTERS.map((f) => [f.id, rows.filter((r) => category(r) === f.id).length]))
  const visible = rows
    .filter((r) => show[category(r)])
    .sort((a, b) => {
      if (a.closed !== b.closed) return a.closed ? 1 : -1                       // Le completate vanno in fondo
      if (a.closed) return (b.closedAt ?? '').localeCompare(a.closedAt ?? '')   // Dalla più recente
      return (a.d ?? 1e9) - (b.d ?? 1e9)                                        // In ordine di ritardo, quelle senza scadenza sono spostate in fondo
    })
  const shown = all ? visible : visible.slice(0, VISIBLE)
  const who = (u) => (u ? members.find((m) => m.github.toLowerCase() === u.toLowerCase())?.name.split(' ').slice(0, 2).join(' ') ?? u : '-')

  return (
    <section className="bg-white p-5" aria-labelledby="issues-title">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h2 id="issues-title" className="text-lg font-bold">GitHub issues</h2>
        {data && (
          <p className="text-sm text-(--txt-gray)">
            {count.todo + count.late} aperte · <span className={count.late ? 'font-bold text-(--red-color)' : ''}>{count.late} in ritardo</span>
          </p>
        )}
      </div>
      <p className="mt-1 text-sm text-(--txt-gray)">
        Issue ordinate per scadenza.
      </p>

      {data && (
        <fieldset className="mt-4 flex flex-wrap gap-x-6 gap-y-2">
          <legend className="sr-only">Quali issue mostrare</legend>
          {FILTERS.map((f) => (
            <label key={f.id} className="flex cursor-pointer items-center gap-2 text-sm font-bold">
              <input type="checkbox" className="h-4 w-4 cursor-pointer accent-(--light-accent-color)" checked={show[f.id]}
                onChange={(e) => { setShow({ ...show, [f.id]: e.target.checked }); setAll(false) }} />
              {f.label} <span className="font-normal text-(--txt-gray)">({count[f.id]})</span>
            </label>
          ))}
        </fieldset>
      )}

      {!data && !error && <p className="mt-6 text-(--txt-gray)">Caricamento...</p>}
      {error && (
        <p className="mt-6 text-(--red-color)">
          Impossibile leggere le issue, aprile su&nbsp;
          <a className="font-bold underline" href={`https://github.com/${issuesRepo}/issues`} target="_blank" rel="noreferrer">GitHub</a>
        </p>
      )}
      {data && visible.length === 0 && (
        <p className="mt-6 text-(--txt-gray)">{rows.length === 0 ? 'Nessuna issue.' : 'Nessuna issue per i filtri selezionati.'}</p>
      )}

      {visible.length > 0 && (
        <div className="mt-4 overflow-x-auto">
          <table className="w-full min-w-136 text-left text-sm">
            <thead>
              <tr className="border-b border-(--txt-color)">
                <th className="py-2 pr-4 font-bold">Stato</th>
                <th className="py-2 pr-4 font-bold">Issue</th>
                <th className="py-2 pr-4 font-bold">Assegnatario</th>
                <th className="py-2 text-right font-bold">Scadenza</th>
              </tr>
            </thead>
            <tbody>
              {shown.map((r) => {
                const s = status(r)
                return (
                  <tr key={r.n} className="border-b border-(--deco-color)">
                    <td className={`whitespace-nowrap py-3 pr-4 font-bold ${s.color}`}>
                      <span className={`mr-4 inline-block h-2.5 w-2.5 ${s.dot}`} aria-hidden="true" />
                      {s.text}
                    </td>
                    <td className="py-3 pr-4">
                      <span className="text-(--txt-gray)">#{r.n}</span>
                      <a className="ml-2 font-bold underline decoration-line underline-offset-2"
                        href={r.url} target="_blank" rel="noreferrer">{r.title}</a>
                      {r.high && !r.closed && <span className="ml-2 text-xs font-bold text-(--red-color)">Priorità alta</span>}
                    </td>
                    <td className="whitespace-nowrap py-3 pr-4">{who(r.assignee)}</td>
                    <td className="whitespace-nowrap py-3 text-right">
                      {r.due ?? '-'}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}

      {visible.length > VISIBLE && (
        <button onClick={() => setAll(!all)} className="mt-3 text-sm font-bold underline cursor-pointer">
          {all ? 'Mostra meno' : `Mostra tutte (${visible.length})`}
        </button>
      )}
    </section>
  )
}