import { useState, useEffect } from 'react'
import { isTeam } from './team'
import { docsBase, milestones, utilizzi, generalDocs, teamSections } from './data'

const format = (iso) => iso ?? '-'
const order = milestones.map(m => m.id)
const rank = (s) => (order.includes(s) ? order.indexOf(s) : /^(verbali|diari)/i.test(s) ? 100 : 50)   // Ordinamento delle baselines note
const bySection = (a, b) => rank(a) - rank(b) || a.localeCompare(b)
const GENERAL = 'Generali'
const href = (f) => (/^https?:\/\//.test(f) ? f : `${docsBase}${f}`)

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
function List({ titolo, docs, meta = true }) {
  return (
    <section>
      <h2 className="mb-2 text-sm font-bold text-(--dark-accent-color)">{titolo}</h2>
      <ul className="bg-white">
        {docs.map((d) => (
          <li key={d.file} className="flex items-center justify-between gap-3 p-3 border-b border-(--deco-color)">
            <div>
              <span className="block font-bold">{d.titolo}</span>
              {meta && <Meta d={d} className="block" />}
            </div>
            <a className="text-sm font-bold underline" href={`${docsBase}${d.file}`} target="_blank" rel="noreferrer">PDF</a>
          </li>
        ))}
      </ul>
    </section>
  )
}

// Scheda statica: non dipende dal manifest
function General() {
  return (
    <section>
      <h2 className="mb-1 text-sm font-bold text-(--dark-accent-color)">Validi per tutto il progetto</h2>
      <ul className="bg-white">
        {generalDocs.map((d) => (
          <li key={d.file} className="flex items-center justify-between gap-3 p-3 border-b border-(--deco-color)">
            <div>
              <span className="block font-bold">{d.titolo}</span>
              <span className="text-sm text-(--txt-gray)">{d.descrizione}</span>
            </div>
            <a className="text-sm font-bold underline" href={href(d.file)} target="_blank" rel="noreferrer">PDF</a>
          </li>
        ))}
      </ul>
    </section>
  )
}

export default function Documents() {
  const [docs, setDocs] = useState(null)
  const [error, setError] = useState(false)
  const [tab, setTab] = useState(GENERAL)
  const [team] = useState(isTeam)

  // Caricamento del file JSON
  useEffect(() => {
    console.log("Sto scaricando da:", `${docsBase}manifest.json`);
    fetch(`${docsBase}/manifest.json`, { cache: 'no-cache' })
      .then((r) => { if (!r.ok) throw new Error(r.status); return r.json() })
      .then((m) => setDocs(m.docs))
      .catch((err) => {setError(true)})
  }, [])

  const isTeamTab = (t) => teamSections.some((s) => s.toLowerCase() === t.toLowerCase())
  const hidden = (d) => teamSections.some((s) => s.toLowerCase() === (d.sezione ?? '').toLowerCase())
  const general = new Set(generalDocs.map((d) => d.file))   // I file generali non compaiono anche nelle schede automatiche
  const autoDocs = (docs ?? [])
    .filter((d) => !general.has(d.file))
    .filter((d) => team || !hidden(d))
  const tabs = [GENERAL, ...[...new Set(autoDocs.map((d) => d.sezione))].sort((a, b) => isTeamTab(a) - isTeamTab(b) || bySection(a, b))]
  const active = tab
  const inTab = autoDocs.filter((d) => d.sezione === active)
  const isVerbali = inTab.length > 0 && inTab.every((d) => d.baseline !== d.sezione)   // Logica di raggruppamento differente per i verbali

  // Verbali e diari: un gruppo per baseline di provenienza, dal più recente
  const groups = isVerbali
  ? [...new Set(inTab.map((d) => d.baseline))].sort((x, y) => bySection(y, x)).map((b) => [   // Gruppi: dalla fase più recente
      b,
      inTab.filter((d) => d.baseline === b).sort((x, y) => y.file.localeCompare(x.file)),   // Dentro il gruppo: i nomi dei file sono date ISO
    ])
  : Object.entries(utilizzi).map(([u, label]) => [
      label,
      inTab.filter((d) => (utilizzi[d.tipo] ? d.tipo : 'esterno') === u)
        .sort((x, y) => (y['data-modifica'] ?? '').localeCompare(x['data-modifica'] ?? '')),   // Dall'ultima modifica
    ])

  return (
    <div>
      <div role="tablist" className="flex flex-wrap justify-center sm:justify-start gap-1">
        {tabs.map((t) => (
            <button key={t} role="tab" aria-selected={t === active}
            onClick={() => { setTab(t); }}
            className={`px-4 py-2 text-sm font-bold cursor-pointer hover:bg-(--deco-color) ${isTeamTab(t) ? 'sm:ml-auto' : ''} ${t === active ? 'text-(--light-accent-color) border-b border-(--light-accent-color)' : ''}`}>
            { isTeamTab(t) && <span className="fa-solid fa-unlock mr-2" aria-hidden="true"></span> }
            {t}
          </button>
        ))}
      </div>

      <div className="mt-4 grid grid-cols-1 gap-6">
        <div className="min-w-0 space-y-5">
          {active === GENERAL && <General />}
          {active !== GENERAL && error && <p className="text-(--red-color)">Impossibile caricare l'elenco dei documenti.</p>}
          {active !== GENERAL && !error && !docs && <p className="text-(--txt-gray)">Caricamento...</p>}
          {active !== GENERAL && docs && inTab.length === 0 && <p className="text-(--txt-gray)">Nessun documento in questa scheda.</p>}
          {groups.filter(([, list]) => list.length).map(([label, list]) => (
            <List key={label} titolo={label} docs={list} meta={!isTeamTab(active)} />
          ))}
        </div>
      </div>
    </div>
  )
}
