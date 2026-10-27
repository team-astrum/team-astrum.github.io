import { members, group, roles } from './data'

const sum = (a) => a.reduce((x, y) => x + y, 0)
const initials = (n) => n.split(' ').map((p) => p[0]).slice(0, 2).join('')

export default function Team() {
  return (
    <div>
      <ul className="grid gap-px bg-(--deco-color) sm:grid-cols-2 lg:grid-cols-3">
        {members.map((m) => {
          const mainRole = Object.entries(m.hours).sort((a, b) => b[1] - a[1])[0]
          return (
            <li key={m.github} className="flex gap-4 bg-white p-5">
              <div className="relative grid h-14 w-14 shrink-0 place-items-center font-black text-white">
                {initials(m.name)}
                <img src={`https://github.com/${m.github}.png?size=128`} alt={m.name} className="absolute inset-0 h-full w-full object-cover rounded-full"
                  onError={(e) => (e.currentTarget.style.display = 'none')} />
              </div>
              <div>
                <h2 className="font-bold">{m.name} - {m.matr}</h2>
                <p className="text-sm">Ruolo attuale: {m.currentRole}</p>
                <a className="mt-1 inline-block text-sm font-bold underline" href={`https://github.com/${m.github}`} target="_blank" rel="noreferrer">
                  github.com/{m.github}
                </a>
              </div>
            </li>
          )
        })}
      </ul>
    </div>
  )
}
