import { members } from './data'

const initials = (n) => n.split(' ').map((p) => p[0]).slice(0, 2).join('')

export default function Team() {
  return (
    <div>
      <ul className="flex flex-wrap justify-center gap-4">
        {members.map((m) => {
          const isLead = m.currentRole.toLowerCase() === 'responsabile'
          return (
            <li key={m.github} className="w-full sm:w-[calc(50%-0.5rem)] lg:w-[calc(25%-0.75rem)]">
              <a href={`https://github.com/${m.github}`} target="_blank" rel="noreferrer"
                aria-label={`${m.name}, profilo GitHub`}
                className="group flex h-full flex-col items-center border border-(--deco-color) bg-white p-6 text-center transition-colors hover:border-(--light-accent-color)">
                <div className="relative grid h-20 w-20 shrink-0 place-items-center bg-ink text-xl font-black text-white">
                  {initials(m.name)}
                  <img src={`https://github.com/${m.github}.png?size=160`} alt="" className="absolute rounded-full inset-0 h-full w-full object-cover"
                    onError={(e) => (e.currentTarget.style.display = 'none')} />
                </div>
                <h2 className="mt-4 text-lg font-bold">{m.name}</h2>
                <p className={`mt-1 text-sm text-(--txt-gray)`}>{m.matr}</p>
                <p className={`mt-4 text-m ${isLead ? 'text-(--light-accent-color)' : 'text-(--dark-accent-color)'}`}>
                  {m.currentRole}
                </p>
              </a>
            </li>
          )
        })}
      </ul>
    </div>
  )
}