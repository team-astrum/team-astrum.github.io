import { useState } from 'react'
import { baselines, docsBase, kinds } from './data'

export default function Documents() {
  const [bid, setBid] = useState(baselines[0].id)
  const baseline = baselines.find((b) => b.id === bid)
  const selBid = baselines.find((b) => b.id === bid);

  return (
    <div>
      <div role="tablist" className="flex flex-wrap justify-center sm:justify-start gap-1">
        {baselines.map((b) => (
          b.id === bid ?
          <span key={b.id} role="tab" aria-selected="true"
            className={`px-4 py-2 text-sm font-bold text-(--light-accent-color) border-b border-(--light-accent-color)`}>
            {b.id}
          </span> :
          <button key={b.id} role="tab"
            onClick={() => { setBid(b.id) }}
            className={`px-4 py-2 text-sm font-bold cursor-pointer hover:bg-(--deco-color)`}>
            {b.id}
          </button>
        ))}
      </div>

      <div className="mt-4">
        <div className="space-y-5">
          {Object.entries(kinds).map(([k, label]) => {
            const docs = baseline.docs.filter((d) => d.kind === k)
            if (!docs.length) return null
            return (
              <section key={k}>
                <h2 className="mb-1 text-sm font-bold text-(--dark-accent-color)">{label}</h2>
                <ul className="bg-white">
                  {docs.map((d) => (
                    <li key={d.file} className={`flex items-center justify-between gap-3 p-3 border-b border-(--deco-color)`}>
                      <button className="text-left" onClick={() => setOpen(d)}>
                        <span className="block font-bold">{d.title}</span>
                        <span className="text-sm text-(--txt-gray)">v{d.version} - {d.updated}</span>
                      </button>
                      <a className="text-sm font-bold underline" href={`${docsBase}${d.path}${d.file}`} target="_blank" rel="noreferrer">PDF</a>
                    </li>
                  ))}
                </ul>
              </section>
            )
          })}
        </div>
      </div>
    </div>
  )
}
