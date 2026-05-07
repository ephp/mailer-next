# MailFlow Frontend — Specifiche Tecniche

## Istruzioni Generali

- Usa sempre i file di traduzione (next-intl)
- Tutte le stringhe UI devono essere in `messages/it.json` e `messages/en.json`
- Mai hardcodare testo visibile all'utente

---

## Descrizione Progetto

**MailFlow** è una piattaforma web multi-tenant per l'invio massivo di email. Questo è il frontend React/Next.js che fornisce:

- Pannello di amministrazione account
- Gestione liste di contatti con import CSV/XLSX
- Wizard composizione campagne email (4 step)
- Dashboard statistiche con grafici
- Gestione template riusabili

---

## Stack Tecnologico

| Componente | Tecnologia | Versione |
|------------|------------|----------|
| Framework | Next.js | 16.1.1 |
| UI Library | React | 19.2.3 |
| Component Library | Material-UI (MUI) | 7.3.6 |
| Data Grid | MUI X DataGrid | 8.23.0 |
| Form Management | Formik + Yup | - |
| Styling | Emotion (CSS-in-JS) | - |
| i18n | next-intl | - |
| Notifications | Notistack | - |
| HTTP Client | Fetch API | - |

---

## Struttura Directory

```
src/
├── @oimmei/                    # Framework base Oimmei
│   ├── components/             # Componenti UI riusabili
│   ├── services/               # Auth provider, API helpers
│   └── helpers/                # Utility functions
├── app/
│   ├── (auth)/                 # Route pubbliche (login, reset)
│   └── (app)/                  # Route protette (dashboard, admin)
├── components/                 # Componenti specifici MailFlow
├── types/                      # TypeScript interfaces
├── shared/
│   ├── helpers/api/            # API call helpers
│   └── constants/              # Costanti app
├── modules/
│   └── routesConfig.tsx        # Configurazione menu sidebar
└── i18n/                       # Configurazione traduzioni
```

---

## Componenti Oimmei Disponibili

### Da @oimmei/components
- `OiAnimate` — Animazioni wrapper
- `OiTextField` — Input text con label floating
- `TextPasswordField` — Password con toggle visibilità
- `OiButton` — Button styled
- `OiDataGrid` — DataGrid wrapper con features extra
- `ConfirmDialog` — Dialog conferma azione
- `LoadingSkeleton` — Skeleton loading

### Da @oimmei/services
- `CookieAuthProvider` — Context autenticazione JWT
- `useAuthUser()` — Hook per dati utente corrente
- `useAuthMethod()` — Hook per azioni auth (login, logout, etc.)
- `asyncCallHelper` — Wrapper API calls con error handling

---

## Note Implementative

### Validazione Form
- Sempre usare Yup con messaggi chiave traduzione
- Schema condiviso tra frontend e validazione lato client

### Gestione Errori API
- Usare `asyncCallHelper` per tutte le chiamate
- Mostrare errori con Snackbar (notistack)
- Errori form inline sui campi

### Responsive Design
- Mobile-first approach
- Breakpoint MUI: xs, sm, md, lg, xl
- DataGrid con colonne nascoste su mobile

### Performance
- Lazy loading pagine con `dynamic()`
- Pagination server-side per liste lunghe
- Debounce su ricerca/filtri (300ms)

### Accessibilità
- Attributi aria-* su componenti interattivi
- Focus management nel wizard
- Contrast ratio WCAG AA
