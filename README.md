# Repository sito web "cruscotto"
Il seguente repository contiene il codice del sito web "cruscotto" ideato per il progetto del gruppo Astrum, del corso di **Ingegneria del Software [SC01103936]** presso l'Università di Padova (L.T. Informatica, A.A. 2026/27).

## Sviluppo in locale
Per poter sviluppare e apportare modifiche al seguente codice è necessario eseguire i seguenti comandi (all'interno della cartella contenente il lavoro):
- `npm install` per installare tutti i moduli a supporto dell'architettura React;
- `npm run dev` per eseguire il codice sul proprio computer con dominio `https://localhost:5173`

## Funzionamento del sito
Questo prodotto ha lo scopo di mostrare i seguenti dati:
- avanzamento di progetto, con rendicontazione delle ore per ruolo e per membro;
- scostamenti del bilancio rispetto ai preventivi presentati in fase di candidatura;
- documenti, caricati automaticamente tramite parsing del file [manifest.json](https://team-astrum.github.io/Documentazione/manifest.json), generato dalla GitHub Action del repository [Documentazione](https://github.com/team-astrum/Documentazione);
- informazioni sui membri del gruppo _Astrum_.
