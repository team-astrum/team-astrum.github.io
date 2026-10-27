import { useEffect, useState } from 'react'
import { group } from './data'
import Dashboard from './Dashboard'
import Documents from './Documents'
import Team from './Team'
import Logo from '/public/Assets/logo.svg'
import LogoUniPD from '/public/Assets/logo-unipd.svg'

const tabs = [
  { id: 'cruscotto', label: 'Cruscotto', View: Dashboard },
  { id: 'documenti', label: 'Documenti', View: Documents },
  { id: 'gruppo', label: 'Gruppo', View: Team },
]
const read = () => tabs.find((t) => t.id === location.hash.slice(1))?.id ?? 'cruscotto'

export default function App() {
  const [tab, setTab] = useState(read)
  useEffect(() => {
    const on = () => setTab(read())
    addEventListener('hashchange', on)
    return () => removeEventListener('hashchange', on)
  }, [])
  const { View } = tabs.find((t) => t.id === tab)

  return (
    <div className="mx-auto max-w-6xl px-4 pb-16 sm:px-6">
      <header className="flex flex-col gap-6 border-b border-(--deco-color) pt-8 pb-5 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="mt-1 text-4xl font-black tracking-tight sm:text-5xl flex gap-2.5 items-center">
            <img src={LogoUniPD} className="h-15"></img>
            <span className="bg-(--deco-color) h-15 w-px"></span>
            <img src={Logo} className="h-7.5"></img>
          </h1>
          <p className="mt-2 text-sm text-(--txt-gray)">
            <span className="block">Progetto di Ingegneria del software</span>
            <span className="block">Università di Padova - A.A. 26 / 27</span>
          </p>
          <p className="mt-2 text-base">{group.capitolato} - proponente {group.proponente}</p>
        </div>
        <nav aria-label="Sezioni" className="flex flex-wrap justify-center sm:justify-start gap-1">
          {tabs.map((t) => (
            t.id === tab ?
            <span key={t.id} href={`#${t.id}`} aria-current="page"
              className="px-4 py-2 text-sm font-bold text-(--light-accent-color) border-b border-(--light-accent-color)">
              {t.label}
            </span> :
            <a key={t.id} href={`#${t.id}`}
              className="px-4 py-2 text-sm font-bold hover:bg-(--deco-color)">
              {t.label}
            </a>
          ))}
          <div className="flex w-full justify-center gap-1 sm:w-auto sm:justify-start">
            <a className="px-4 py-2 text-sm font-bold hover:bg-(--txt-color) hover:text-(--bg-color)" href={group.repo} target="_blank" rel="noreferrer">
              <span className="fa-brands fa-github"></span>
            </a>
            <a className="px-4 py-2 text-sm font-bold hover:bg-(--red-color) hover:text-(--bg-color)" href={`mailto:${group.email}`} target="_blank" rel="noreferrer">
              <span className="fa-regular fa-envelope"></span>
            </a>
          </div>
        </nav>
      </header>
      <main className="pt-8"><View /></main>
    </div>
  )
}
