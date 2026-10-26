// Ore consuntivate per persona e ruolo
export const members = [
  { name: 'Corrado Bacco', matr:'2148615', github: 'mrobotcb30', currentRole: '',
    hours: { responsabile: 0, amministratore: 0, analista: 0, progettista: 0, programmatore: 0, verificatore: 0 } },

  { name: 'Gianluca Bacco', matr:'2111937', github: 'GianlucaBacco', currentRole: '',
    hours: { responsabile: 0, amministratore: 0, analista: 0, progettista: 0, programmatore: 0, verificatore: 0 } },

  { name: 'Gianluca Brotto', matr:'2148626', github: 'Gianluca-Br', currentRole: '',
    hours: { responsabile: 0, amministratore: 0, analista: 0, progettista: 0, programmatore: 0, verificatore: 0 } },

  { name: 'Matteo De Col', matr:'2148619', github: 'vSmatt', currentRole: '',
    hours: { responsabile: 0, amministratore: 0, analista: 0, progettista: 0, programmatore: 0, verificatore: 0 } },

  { name: 'Filippo De Guio', matr:'2113177', github: 'degghi24', currentRole: '',
    hours: { responsabile: 0, amministratore: 0, analista: 0, progettista: 0, programmatore: 0, verificatore: 0 } },

  { name: 'Samuele Gobbi', matr:'2148004', github: 'Smoker1210', currentRole: '',
    hours: { responsabile: 0, amministratore: 0, analista: 0, progettista: 0, programmatore: 0, verificatore: 0 } },

  { name: 'Thomas Morettin', matr:'2111001', github: 'thomasmorettin', currentRole: '',
    hours: { responsabile: 0, amministratore: 0, analista: 0, progettista: 0, programmatore: 0, verificatore: 0 } },
]

// Documenti presenti all'interno del cruscotto
export const baselines = [
  {
    id: 'Candidatura', path: 'Candidatura/',
    docs: [
    ]
  },
  {
    id: 'RTB', path: 'RTB/',
    docs: [
    ]
  },
  {
    id: 'PB', path: 'PB/',
    docs: [
    ]
  },
  {
    id: 'Verbali interni', path: '',
    docs: [
      { title: 'Verbale del 2026-10-16', kind: 'cand', path: 'Candidatura/Verbali-interni/', file: '2026-10-16.pdf', version: '1.0.0', updated: '2026-10-16' },
    ]
  },
  {
    id: 'Verbali esterni', path: '',
    docs: [
      { title: 'Verbale del 2026-10-20', kind: 'cand', path: 'Candidatura/Verbali-esterni/', file: '2026-10-20.pdf', version: '1.0.0', updated: '2026-10-21' },
      { title: 'Verbale del 2026-10-19', kind: 'cand', path: 'Candidatura/Verbali-esterni/', file: '2026-10-19.pdf', version: '1.1.0', updated: '2026-10-20' }
    ]
  }
]

// Valori cumulativi in euro: PV = pianificato, EV = conseguito, AC = speso
export const periods = [
  { label: 'S1', pv: 500, ev: null, ac: null },
  { label: 'S2', pv: 1300, ev: null, ac: null },
  { label: 'S3', pv: 2400, ev: null, ac: null },
  { label: 'S4', pv: 3800, ev: null, ac: null },
  { label: 'S5', pv: 5600, ev: null, ac: null },
  { label: 'S6', pv: 7800, ev: null, ac: null },
  { label: 'S7', pv: 10200, ev: null, ac: null },
  { label: 'S8', pv: 12950, ev: null, ac: null },
]

// Dati del gruppo
export const group = {
  name: 'Astrum',
  capitolato: "In attesa di aggiudicazione",
  proponente: "...",
  email: 'astrum.unipd@gmail.com',
  repo: 'https://team-astrum.github.io/',
  org: 'https://github.com/team-astrum'
}

// Costo orario per ruolo (€) – Regolamento, slide 10
export const roles = {
  responsabile: { label: 'Responsabile', rate: 30 },
  amministratore: { label: 'Amministratore', rate: 20 },
  analista: { label: 'Analista', rate: 25 },
  progettista: { label: 'Progettista', rate: 25 },
  programmatore: { label: 'Programmatore', rate: 15 },
  verificatore: { label: 'Verificatore', rate: 15 },
}

export const docsBase = 'https://team-astrum.github.io/Documentazione/'   // Path di base dei documenti

export const issuesRepo = 'team-astrum/Documentazione/'   // Repository da cui leggere le issue aperte

export const hourBounds = { min: 80, max: 95 }    // Ore produttive per persona: min 80, atteso 90, max 95

// Preventivo: ore pianificate per ruolo (totale di gruppo)
export const plannedHours = {
  responsabile: null, amministratore: null, analista: null,
  progettista: null, programmatore: null, verificatore: null,
}

// Milestone: progress 0–100
export const milestones = [
  { id: 'Candidatura', label: null, date: '2026-10-30', progress: 50 },
  { id: 'RTB', label: 'Requirements and Technology Baseline', date: null, progress: 0 },
  { id: 'PB', label: 'Product Baseline', date: null, progress: 0 },
]

// Documenti per baseline
export const kinds = {
  gestionale: 'Interni',
  interno: 'Esterni',
  cand: 'Candidatura',
  rtb: 'Requirements & Technology Baseline',
  pb: 'Project Baseline'
}