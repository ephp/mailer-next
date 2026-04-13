# Repository template: Next.js

Questa è una repository template con la configurazione minima per creare
nuovi progetti Next.js 15 (App router) con Material UI (solo client).

La repository include:

- autenticazione con cookie e gestione funzionalità ricordami (deve essere supportata dal server);
- front end React con autenticazione (incluso modifica profilo, recupera password, prima
  login), homepage vuota.

Il progetto è configurato per la sola lingua italiana. Se ci sono esigenze diverse,
occorre modificare la configurazione del progetto.

## Note

- Per quanto riguarda le dipendenze Next.js/React, sono state incluse solo le minime per il funzionamento
  del progetto.
- Dato che nei progetti back end è relativamente raro, il progetto non ha abilitata la registrazione,
  anche se le parti front end per utilizzarla esistono. Se necessario, questa deve essere abilitata.
- Il CRUD utenti è incluso fra i file e al momento abilitato.
- L'autenticazione è gestita esclusivamente tramite JWT, o meglio JWT con un cookie che faccia da wrapper, per maggior
  sicurezza su web. Perché ciò funzioni, il server deve avere installato il bundle oi/user-api con la configurazione "
  cookieauth".
- Il progetto include alcuni componenti interamente commentati, come quelli per la gestione degli upload. I commenti
  sono dovuti al fatto che tali componenti richiedono l'installazione di librerie che non fanno parte del progetto
  template di base, oppure perché richiedono configurazioni di modelli dati che non sono adeguate per tutti i progetti;
  si faccia riferimento ai commenti nei file stessi per i dettagli. È possibile che ci siano anche da
  importare dei file di traduzione dedicati.

## Istruzioni

### Creazione nuovo progetto

1. Creare una nuova repository usando il template.
2. Installare e aggiornare le dipendenze Yarn.
3. In **.env** (o **.env.local**) inserire l'URL del server e il base URL per le chiamate API.
    1. Come da commento in **.env**, creare il file **.env.local** con la configurazione
       per il funzionamento del server locale in CORS (con bundle Nelmio).
4. Personalizzare la favicon sostituendo l'icona nella cartella **src/app**, e i metadati nei file layout, in
   particolare nel principale.
5. [opzionale] Se necessario, personalizzare le logiche e gli URL di autenticazione
   in **src/@oimmei/services/auth/cookie-auth/CookieAuthProvider.tsx**.
6. [opzionale] Se necessario, modificare la lingua di default, o impostare un modo per inferirla dalla richiesta,
   in **src/i18n/request.ts** e **src/@oimmei/utility/AppContextProvider/LocaleContextProvider.tsx**.
   **Importante**: modificare la lingua di default in **src/@oimmei/utility/AppContextProvider/defaultConfig.tsx**.
7. [opzionale] Se necessario, abilitare/disabilitare il CRUD utenti (pagine, elemento nella sidebar).
8. In **messages/[lingua/e]/messages.json**, impostare la chiave **common.base_title**.
9. Personalizzare le strutture dati utente **src/types/models/AuthUser.ts** e
   **src/types/models/User.ts** o aggiungerne altre a seconda delle esigenze di progetto.
10. Personalizzare **src/@oimmei/services/auth/cookie-auth/CookieAuthProvider.tsx** a seconda delle
    strutture utente di progetto.
11. Se il progetto richiede la registrazione, abilitarla e personalizzarla nelle pagine, rinominando il file pagina *
    *src/app**.
12. Se il progetto richiede di fornire agli utenti la possibilità di eliminare il proprio profilo,
    abilitarla in **src/components/profile/PersonalInfo/index.tsx**.
