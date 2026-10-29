/*
    UNICO DIZIONARIO DA MODIFICARE IN QUESTO DOCUMENTO
    Ore consuntivate per persona (con totale ore per ruolo)
*/
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

/*
    I DATI PRESENTI DA QUESTA RIGA IN POI NON VENGONO RISCRITTI AL NETTO DI CAMBI STRAORDINARI
    Inserimento di tutti i dati statici da utilizzare all'interno della pagina web
*/

// Dati fiscali del gruppo
export const group = {
  name: 'Astrum',
  capitolato: 'C[X] - [Nome capitolato]',
  proponente: '[Azienda]',
  email: 'astrum.unipd@gmail.com',
  repo: 'https://github.com/team-astrum/',
}

// Milestone: progresso 0–100%
export const milestones = [
  { id: 'Candidatura', label: null, date: '2026-10-30', progress: 75 },
  { id: 'RTB', label: 'Requirements and Technology Baseline', date: '2027-02-19', progress: 0 },
  { id: 'PB', label: 'Product Baseline', date: '2027-04-16', progress: 0 },
]

export const hourBounds = { min: 80, max: 95 }    // Ore produttive per persona: 80-95

// Valori cumulativi in euro: PV = pianificato, EV = conseguito, AC = speso
export const periods = [
  { label: 'S1', pv: 1127, ev: null, ac: null },
  { label: 'S2', pv: 2254, ev: null, ac: null },
  { label: 'S3', pv: 3381, ev: null, ac: null },
  { label: 'S4', pv: 4508, ev: null, ac: null },
  { label: 'S5', pv: 5072, ev: null, ac: null },
  { label: 'S6', pv: 5636, ev: null, ac: null },
  { label: 'S7', pv: 6200, ev: null, ac: null },
  { label: 'S8', pv: 6764, ev: null, ac: null },
  { label: 'S9', pv: 8267, ev: null, ac: null },
  { label: 'S10', pv: 9770, ev: null, ac: null },
  { label: 'S11', pv: 11273, ev: null, ac: null },
  { label: 'S12', pv: 12775, ev: null, ac: null },
]

export const issuesRepo = 'team-astrum/Documentazione'    // Repository da cui leggere le issue aperte
// export const issuesRepo = 'team-astrum/MVP'

// Preventivo: ore pianificate per ruolo (totale di gruppo)
export const plannedHours = {
  responsabile: 55, amministratore: 55, analista: 70,
  progettista: 100, programmatore: 195, verificatore: 190,
}

// Costo orario per ruolo
export const roles = {
  responsabile: { label: 'Responsabile', rate: 30 },
  amministratore: { label: 'Amministratore', rate: 20 },
  analista: { label: 'Analista', rate: 25 },
  progettista: { label: 'Progettista', rate: 25 },
  programmatore: { label: 'Programmatore', rate: 15 },
  verificatore: { label: 'Verificatore', rate: 15 },
}

export const docsBase = 'https://team-astrum.github.io/Documentazione'   // Path di base dei documenti

// Raggruppamento dei documenti dentro ogni baseline (campo "tipo" del template)
export const utilizzi = {
  esterno: 'Documenti esterni',
  interno: 'Documenti interni',
}

// Documenti generali: validi per tutto il progetto, non legati a una milestone
export const generalDocs = [
  { titolo: 'Glossario', descrizione: 'Definizione dei termini specifici del dominio del progetto.', file: '/glossario.pdf' },
  { titolo: 'Norme di Progetto', descrizione: 'Procedure, strumenti e regole di lavoro del gruppo (Way of Working).', file: '/norme-di-progetto.pdf' },
]

export const teamSections = ['Diari di bordo']    // Scheda visibile solamente in modalità gruppo