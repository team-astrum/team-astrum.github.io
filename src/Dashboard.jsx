import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid,
  ReferenceLine, LineChart, Line, Legend,
} from 'recharts'
import { roles, plannedHours, hourBounds, members, milestones, periods } from './data'
import Issues from './Issues'

const eur = (n) => n.toLocaleString('it-IT', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 })
const sum = (a) => a.reduce((x, y) => x + y, 0)
const days = (iso) => Math.ceil((new Date(iso) - new Date()) / 864e5)

function Panel({ title, note, minWidth = 480, children }) {
  return (
    <section className="min-w-0 bg-white p-5">
      <h2 className="text-lg font-bold">{title}</h2>
      {note && <p className="mt-1 text-sm text-(--txt-gray)">{note}</p>}
      <p className="mt-2 text-xs font-bold text-(--txt-gray) sm:hidden">Scorri il grafico in orizzontale</p>
      <div className="mt-3 overflow-x-auto">
        <div className="h-72" style={{ minWidth }}>{children}</div>
      </div>
    </section>
  )
}

export default function Dashboard() {
  const roleKeys = Object.keys(roles)
  const budget = sum(roleKeys.map((k) => plannedHours[k] * roles[k].rate))
  const hoursByRole = Object.fromEntries(roleKeys.map((k) => [k, sum(members.map((m) => m.hours[k] ?? 0))]))
  const spent = sum(roleKeys.map((k) => hoursByRole[k] * roles[k].rate))
  const done = periods.filter((p) => p.ev != null)
  const last = done[done.length - 1]
  const cpi = last ? last.ev / last.ac : null
  const spi = last ? last.ev / last.pv : null
  const next = milestones.find((m) => m.progress < 100)

  const effort = members.map((m) => ({
    matricola: m.matr,
    name: m.name,
    ore: sum(Object.values(m.hours)),
  }))
  const perRole = roleKeys.map((k) => ({ ruolo: roles[k].label, Pianificate: plannedHours[k], Consuntivate: hoursByRole[k] }))
  const index = (v, good) => (v == null ? 'text-(--txt-gray)' : v >= good ? 'text-(--green-color)' : 'text-(--red-color)')

  return (
    <div className="space-y-6">
      <section aria-label="Avanzamento per milestone" className="bg-white p-5">
        <div className="flex items-baseline justify-between">
          <h2 className="text-lg font-bold">Avanzamento</h2>
          {next && <p className="text-sm text-(--txt-gray)"><span className="hidden lg:inline">Prossima milestone:</span> <span className="font-bold">{next.id}</span>, tra {days(next.date)} giorni.</p>}
        </div>
        <ol className="mt-5 grid grid-cols-3 gap-2">
          {milestones.map((m) => (
            <li key={m.id}>
              <div className="h-5 bg-line" role="progressbar" aria-valuenow={m.progress} aria-valuemin="0" aria-valuemax="100" aria-label={m.id}>
                <div className="h-full bg-(--dark-accent-color)" style={{width: `${m.progress}%`}} />
              </div>
              <p className="mt-2 text-3xl font-black">{m.progress}%</p>
              <p className="text-sm font-bold">{m.id}</p>
              <p className="hidden text-sm text-(--txt-gray) sm:block">{m.label}</p>
              <p className="text-sm text-(--txt-gray)">Scadenza: {new Date(m.date).toLocaleDateString('it-IT')}</p>
            </li>
          ))}
        </ol>
      </section>

      <dl className="grid grid-cols-2 gap-px bg-(--deco-color) lg:grid-cols-4">
        {[
          ['Budget preventivato', eur(budget)],
          ['Speso finora', `${eur(spent)} (${Math.round((spent / budget) * 100)}%)`],
          ['Residuo', eur(budget - spent)],
          ['CPI / SPI', cpi ? `${cpi.toFixed(2)} / ${spi.toFixed(2)}` : '-', index(Math.min(cpi ?? 0, spi ?? 0), 1)],
        ].map(([t, v, c]) => (
          <div key={t} className="bg-white p-5">
            <dt className="text-sm text-(--txt-gray)">{t}</dt>
            <dd className={`mt-1 text-2xl font-black ${c}`}>{v}</dd>
          </div>
        ))}
      </dl>
      <p className="-mt-3 text-sm text-(--txt-gray)">
        CPI = valore conseguito / costo reale; SPI = valore conseguito / valore pianificato. Sopra 1 si è in linea o in vantaggio.
      </p>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Panel title="Sforzo per persona" minWidth={460} note={`Ore consuntivate. Target finale ${hourBounds.min} – ${hourBounds.max}.`}>
          <ResponsiveContainer>
            <BarChart data={effort} margin={{ top: 8, right: 8, bottom: 0, left: 4 }}>
              <CartesianGrid vertical={false} stroke="#D3D9DF" />
              <XAxis dataKey="matricola" interval={0} tick={{ fontSize: 12 }} />
              <YAxis width={32} domain={[0, hourBounds.max + 5]} />
              <Tooltip labelFormatter={(value, payload) => {
                  const item = payload?.[0]?.payload;
                  return item ? `${item.name}` : value; 
                }}
                formatter={(val) => [`${val} ore`, "Ore totali"]}
              />
              <ReferenceLine y={hourBounds.min} stroke="#9B0014" strokeDasharray="4 4" />
              <ReferenceLine y={hourBounds.max} stroke="#9B0014" strokeDasharray="4 4" />
              <Bar dataKey="ore" name="Ore" fill="#1E3A87" />
            </BarChart>
          </ResponsiveContainer>
        </Panel>

        <Panel title="Consumo del budget" note="Valori cumulativi per periodo.">
          <ResponsiveContainer>
            <LineChart data={periods} margin={{ top: 8, right: 12, bottom: 0, left: 12 }}>
              <CartesianGrid vertical={false} stroke="#D3D9DF" />
              <XAxis dataKey="label" interval={0} />
              <YAxis width={36} tickFormatter={(v) => `${v / 1000}k`} />
              <Tooltip formatter={(v) => eur(v)} />
              <Legend />
              <Line dataKey="pv" name="Pianificato" stroke="#626973" strokeDasharray="5 4" dot={false} strokeWidth={2} />
              <Line dataKey="ev" name="Conseguito" stroke="#1F7A6D" strokeWidth={3} />
              <Line dataKey="ac" name="Speso" stroke="#9B0014" strokeWidth={3} />
            </LineChart>
          </ResponsiveContainer>
        </Panel>

        <div className="min-w-0 lg:col-span-2">
          <Issues />
        </div>

        <div className="min-w-0 lg:col-span-2">
          <Panel title="Ore per ruolo" minWidth={600} note="Ore pianificate nel preventivo contro ore consuntivate dal gruppo.">
            <ResponsiveContainer>
              <BarChart data={perRole} margin={{ top: 8, right: 8, bottom: 0, left: 4 }}>
                <CartesianGrid vertical={false} stroke="#D3D9DF" />
                <XAxis dataKey="ruolo" interval={0} tick={{ fontSize: 12 }} />
                <YAxis width={32} />
                <Tooltip />
                <Legend />
                <Bar dataKey="Pianificate" fill="#E5E9ED" />
                <Bar dataKey="Consuntivate" fill="#1E3A87" />
              </BarChart>
            </ResponsiveContainer>
          </Panel>
        </div>
      </div>
    </div>
  )
}
