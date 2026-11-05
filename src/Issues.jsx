import { useEffect, useState } from 'react'
import { members, issuesRepos, group } from './data'

const VISIBLE = 5
const KEY = 'issues-cache-v6'
const TTL = 5 * 60 * 1000
const HEADERS = { Accept: 'application/vnd.github+json' }

// Schede per etichetta (confronto senza distinzione tra maiuscole e minuscole). Con [] niente schede: si vedono tutte le issue
const TABS = ['RTB', 'PB']

// Accetta "proprietario/repository" oppure un indirizzo GitHub (anche con /issues, .git o barra finale)
const repoOf = (s) => {
  const m = s.trim().match(/github\.com[/:]([^/\s]+)\/([^/\s#?]+)/i)
  const path = m ? `${m[1]}/${m[2]}` : s.trim().replace(/^\/+|\/+$/g, '')
  return path.replace(/\.git$/i, '')
}
const REPOS = [...new Set(issuesRepos.map(repoOf))]

const isDate = (s) => { const d = new Date(`${s}T00:00:00Z`); return !Number.isNaN(d.getTime()) && d.toISOString().slice(0, 10) === s }

// Scadenza: "Scadenza: AAAA-MM-GG" nella descrizione dell'issue, altrimenti scadenza della milestone
function dueOf(i) {
  const m = (i.body ?? '').match(/scadenza\W{0,6}(\d{4}-\d{2}-\d{2})/i)
  if (m && isDate(m[1])) return m[1]
  return i.milestone?.due_on?.slice(0, 10) ?? null
}

function normalize(i, repo) {
  const labels = i.labels.map((l) => l.name)
  return {
    key: `${repo}#${i.number}`, repo, n: i.number, title: i.title, url: i.html_url, due: dueOf(i), labels,
    assignee: i.assignees?.[0]?.login ?? null,
    closed: i.state === 'closed',
    closedAt: i.closed_at?.slice(0, 10) ?? null,
  }
}

async function get(repo, query) {
  const r = await fetch(`https://api.github.com/repos/${repo}/issues?${query}`, { headers: HEADERS })
  if (!r.ok) throw new Error(String(r.status))
  return r.json()
}

// Tutte le aperte + le ultime chiuse (per la vista "Completate") di un repository
async function loadRepo(repo) {
  const [open, closed] = await Promise.all([
    get(repo, 'state=open&per_page=100'),
    get(repo, 'state=closed&per_page=50&sort=updated&direction=desc'),
  ])
  return [...open, ...closed].filter((i) => !i.pull_request).map((i) => normalize(i, repo))
}

// Un repository che non risponde non blocca gli altri: si segnala quali sono falliti
async function load() {
  try {
    const c = JSON.parse(sessionStorage.getItem(KEY))
    if (c && Date.now() - c.t < TTL) return c.data
  } catch { /* cache assente */ }
  const results = await Promise.allSettled(REPOS.map(loadRepo))
  if (results.every((r) => r.status === 'rejected')) throw results[0].reason
  const data = {
    rows: results.flatMap((r) => (r.status === 'fulfilled' ? r.value : [])),
    failed: REPOS.filter((_, k) => results[k].status === 'rejected'),
  }
  try { sessionStorage.setItem(KEY, JSON.stringify({ t: Date.now(), data })) } catch { /* ignora */ }
  return data
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

// Senza scheda scelta (TABS vuoto) passano tutte le issue
const inTab = (r, t) => !t || r.labels.some((l) => new RegExp(`(^|[^a-z0-9])${t}([^a-z0-9]|$)`, 'i').test(l))

export default function Issues() {
  const [data, setData] = useState(null)
  const [error, setError] = useState(null)
  const [all, setAll] = useState(false)
  const [tab, setTab] = useState(TABS[0] ?? null)
  const [show, setShow] = useState({ todo: true, late: true, done: false })

  useEffect(() => {
    load().then(setData).catch((e) => setError(e.message))
  }, [])

  const rows = (data?.rows ?? []).map((i) => ({ ...i, d: daysLeft(i.due) }))
  const tabRows = rows.filter((r) => inTab(r, tab))
  const openIn = (t) => rows.filter((r) => inTab(r, t) && !r.closed).length   // Aperte per scheda (numero accanto al nome)
  const count = Object.fromEntries(FILTERS.map((f) => [f.id, tabRows.filter((r) => category(r) === f.id).length]))
  const visible = tabRows
    .filter((r) => show[category(r)])
    .sort((a, b) => {
      if (a.closed !== b.closed) return a.closed ? 1 : -1                       // Le completate vanno in fondo
      if (a.closed) return (b.closedAt ?? '').localeCompare(a.closedAt ?? '')   // Dalla più recente
      return (a.d ?? 1e9) - (b.d ?? 1e9)                                        // In ordine di ritardo, quelle senza scadenza sono spostate in fondo
    })
  const shown = all ? visible : visible.slice(0, VISIBLE)
  const who = (u) => (u ? members.find((m) => m.github.toLowerCase() === u.toLowerCase())?.name.split(' ').slice(0, 2).join(' ') ?? u : '-')
  const repoLink = (r, label) => <a className="font-semibold underline" href={`https://github.com/${r}/issues`} target="_blank" rel="noreferrer">{label ?? r}</a>

  return (
    <section className="bg-white p-5" aria-labelledby="issues-title">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h2 id="issues-title" className="text-lg font-semibold">GitHub issues (<a href={group.proj} className="underline" target="_blank" rel="noreferrer">Project</a>)</h2>
        {data && (
          <p className="text-sm text-(--txt-gray)">
            {count.todo + count.late} aperte · <span className={count.late ? 'font-semibold text-(--red-color)' : ''}>{count.late} in ritardo</span>
          </p>
        )}
      </div>
      <p className="mt-1 text-sm text-(--txt-gray)">
        Issue ordinate per scadenza.
      </p>

      {data && TABS.length > 0 && (
        <div role="tablist" className="mt-3 flex flex-wrap gap-1">
          {TABS.map((t) => (
            <button key={t} role="tab" aria-selected={t === tab}
              onClick={() => { setTab(t); setAll(false) }}
              className={`px-4 py-2 text-sm font-semibold cursor-pointer hover:bg-(--deco-color) ${t === tab ? 'text-(--light-accent-color) border-b border-(--light-accent-color)' : ''}`}>
              {t} <span className="font-normal text-(--txt-gray)">({openIn(t)})</span>
            </button>
          ))}
        </div>
      )}

      {data && (
        <fieldset className="mt-4 flex flex-wrap gap-x-6 gap-y-2">
          <legend className="sr-only">Quali issue mostrare</legend>
          {FILTERS.map((f) => (
            <label key={f.id} className="flex cursor-pointer items-center gap-2 text-sm font-semibold">
              <input type="checkbox" className="h-4 w-4 cursor-pointer accent-(--light-accent-color)" checked={show[f.id]}
                onChange={(e) => { setShow({ ...show, [f.id]: e.target.checked }); setAll(false) }} />
              {f.label} <span className="font-normal text-(--txt-gray)">({count[f.id]})</span>
            </label>
          ))}
        </fieldset>
      )}
      {data && visible.length === 0 && (
        <p className="mt-6 text-(--txt-gray)">
          {tabRows.length > 0 ? 'Nessuna issue per i filtri selezionati.' : tab ? `Nessuna issue con l'etichetta ${tab}.` : 'Nessuna issue.'}
        </p>
      )}

      {visible.length > 0 && (
        <div className="mt-4 overflow-x-auto">
          <table className="w-full min-w-136 text-left text-sm">
            <thead>
              <tr className="border-b border-(--txt-color)">
                <th className="py-2 pr-4 font-semibold">Stato</th>
                <th className="py-2 pr-4 font-semibold">Repository</th>
                <th className="py-2 pr-4 font-semibold">Issue</th>
                <th className="py-2 pr-4 font-semibold">Assegnatario</th>
                <th className="py-2 text-right font-semibold">Scadenza</th>
              </tr>
            </thead>
            <tbody>
              {shown.map((r) => {
                const s = status(r)
                return (
                  <tr key={r.key} className="border-b border-(--deco-color)">
                    <td className={`whitespace-nowrap py-3 pr-4 font-semibold ${s.color}`}>
                      <span className={`mr-4 inline-block h-2.5 w-2.5 ${s.dot}`} aria-hidden="true" />
                      {s.text}
                    </td>
                    <td className="whitespace-nowrap py-3 pr-4">
                      <span className="text-(--txt-gray)">{REPOS.length > 1 ? r.repo.split('/')[1] : ''}</span>
                    </td>
                    <td className="py-3 pr-4">
                      <span className="text-(--txt-gray)">#{r.n}</span>
                      <a className="ml-2 font-semibold underline decoration-line underline-offset-2"
                        href={r.url} target="_blank" rel="noreferrer">{r.title}</a>
                    </td>
                    <td className="whitespace-nowrap py-3 pr-4">{who(r.assignee)}</td>
                    <td className="whitespace-nowrap py-3 text-right">
                      {r.due ? r.due : '-'}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}

      {visible.length > VISIBLE && (
        <button onClick={() => setAll(!all)} className="mt-3 text-sm font-semibold underline cursor-pointer">
          {all ? 'Mostra meno' : `Mostra tutte (${visible.length})`}
        </button>
      )}
    </section>
  )
}