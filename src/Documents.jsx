import { useState, useEffect } from 'react'
import { docsBase, milestones, utilizzi } from './data'

const format = (iso) => (iso ? new Date(`${iso}T00:00:00`).toLocaleDateString('it-IT') : '-')
const order = milestones.map(m => m.id)
const rank = (s) => (order.includes(s) ? order.indexOf(s) : s.toLowerCase().startsWith('verbali') ? 100 : 50)   // Ordinamento delle baselines note
const bySection = (a, b) => rank(a) - rank(b) || a.localeCompare(b)

// Funzione per il popolamento dei dati propri di ciascun documento
function Meta({ d }) {
  const versione = d.versione && d.versione !== '-' ? `v${d.versione}` : null
  const dataModifica = d['data-modifica'] ? format(d['data-modifica']) : null

  // Composizione pulita delle parti
  const parts = d.kind === 'verbale'
    ? [versione, dataModifica]
    : [d.status, versione, dataModifica]

  return (
    <span className="text-sm text-(--txt-gray)">
      {parts.filter(Boolean).map((p, i) => (
        <span key={i}>
          {i > 0 && ', '}
          <span className={p === 'Approvato' ? 'font-bold text-(--green-color)' : p === 'In bozza' ? 'font-bold text-(--orange-color)' : ''}>
            {p}
          </span>
        </span>
      ))}
    </span>
  )
}

// Funzione di listing ordinato dei documenti
function List({ titolo, docs }) {
  return (
    <section>
      <h2 className="mb-1 text-sm font-bold">{titolo}</h2>
      <ul className="bg-white">
        {docs.map((d) => (
          <li key={d.file} className="flex items-center justify-between gap-3 p-3 border-b border-(--deco-color)">
            <div>
              <span className="block font-bold">{d.titolo}</span>
              <Meta d={d} className="block" />
            </div>
            <a className="text-sm font-bold underline" href={`${docsBase}${d.file}`} target="_blank" rel="noreferrer">PDF</a>
          </li>
        ))}
      </ul>
    </section>
  )
}

export default function Documents() {
  const [docs, setDocs] = useState(null)
  const [error, setError] = useState(false)
  const [tab, setTab] = useState(null)

  // Caricamento del file JSON
  useEffect(() => {
    console.log("Sto scaricando da:", `${docsBase}manifest.json`);
    fetch(`${docsBase}/manifest.json`, { cache: 'no-cache' })
      .then((r) => { if (!r.ok) throw new Error(r.status); return r.json() })
      .then((m) => setDocs(m.docs))
      .catch((err) => {setError(true)})
  }, [])

  // Gestione degli errori
  if (error) return <p className="text-(--red-color)">Impossibile caricare l'elenco dei documenti.</p>
  if (!docs) return <p className="text-(--txt-gray)">Caricamento...</p>
  if (!docs.length) return <p className="text-(--txt-gray)">Nessun documento ancora pubblicato.</p>

  const tabs = [...new Set(docs.map((d) => d.sezione))].sort(bySection)
  const active = tab ?? tabs[0]
  const inTab = docs.filter((d) => d.sezione === active)
  const isVerbali = inTab.every((d) => d.kind === 'verbale')    // Logica di raggruppamento differente per i verbali

  // Verbali: un gruppo per baseline di provenienza, dal più recente.
  const groups = isVerbali
  ? [...new Set(inTab.map((d) => d.baseline))].sort(bySection).map((b) => [
      b,
      inTab.filter((d) => d.baseline === b).sort((x, y) => (y.date ?? '').localeCompare(x.date ?? '')),   // Dal più recente al più vecchio
    ])
  : Object.entries(utilizzi).map(([u, label]) => [
      label,
      inTab.filter((d) => (utilizzi[d.utilizzi] ? d.utilizzi : 'esterno') === u)    // Con parametro di fallback
        .sort((x, y) => x.titolo.localeCompare(y.titolo, 'it', { numeric: true })),   // Ordinamento alfabetico
    ])

  return (
    <div>
      <div role="tablist" className="flex flex-wrap justify-center sm:justify-start gap-1">
        {tabs.map((t) => (
            <button key={t} role="tab" aria-selected={t === active}
            onClick={() => { setTab(t); }}
            className={`px-4 py-2 text-sm font-bold cursor-pointer hover:bg-(--deco-color) ${t === active ? 'text-(--light-accent-color) border-b border-(--light-accent-color)' : ''}`}>
            {t}
          </button>
        ))}
      </div>

      <div className="mt-4 grid grid-cols-1 gap-6">
        <div className="min-w-0 space-y-5">
          {groups.filter(([, list]) => list.length).map(([label, list]) => (
            <List key={label} titolo={label} docs={list} />
          ))}
        </div>
      </div>
    </div>
  )
}
