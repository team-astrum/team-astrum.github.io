const KEY = 'team-mode'   // Modalità gruppo: ?team la attiva, ?team=0 la disattiva

// Funzione localStorage salva la cronologia, funzione sessionStorage non la salva
export function isTeam() {
  const p = new URLSearchParams(location.search).get('team')
  try {
    if (p === '' || p === '1') localStorage.setItem(KEY, '1')   // È il team
    if (p === '0') localStorage.removeItem(KEY)   // Non è il team
    return localStorage.getItem(KEY) === '1'
  } catch {
    return p === '' || p === '1'   // Senza storage
  }
}