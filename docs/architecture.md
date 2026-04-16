# Architecture – Verktøykasse

_v1.1 – 2026-04-16_

## Teknologistack

| Teknologi | Rolle | Begrunnelse |
|-----------|-------|-------------|
| React | Frontend-rammeverk | Mest brukte rammeverk, stort økosystem, nødvendig for dynamisk state-håndtering i RFLP-vieweren |
| Vite | Byggverktøy for React | Rask, enkel konfigurasjon, moderne erstatning for Create React App |
| Node.js | Server-kjøremiljø | Allerede installert, konsistent JavaScript på tvers av frontend og backend |
| Express | HTTP-rammeverk | Minimalt og lettvint, håndterer ruting og forespørsler på backend |
| Jest | Testverktøy | Mest brukte testverktøy for Node.js, god dokumentasjon – tas i bruk i Fase 4 |

**Ingen database i MVP.** Data lever i Excel-filer (.xlsm/.xlsx) og JSON-filer.
Dette revurderes når RFLP-vieweren videreutvikles til en ordentlig database.

## Prosjektstruktur – Monorepo

Prosjektet organiseres som en monorepo: én Git-repository med frontend og
backend som undermapper.

```
verktøykasse/
├── CLAUDE.md
├── docs/
├── frontend/        ← React + Vite
└── backend/         ← Node.js + Express
```

**Begrunnelse:** Frontend og backend hører til samme produkt og utvikles i takt.
En monorepo gir ett Git-repo å forholde seg til, enklere deling av konfigurasjon,
og en naturlig struktur for et lite team. Alternativet – separate repos – gir
unødvendig overhead på dette stadiet.

## Kodekvalitet

- Kommentarer beskriver **hvorfor**, ikke hva – koden beskriver hva
- Engelsk i all kode, variabelnavn og kommentarer i filer
- Enhetstester på kritiske backend-funksjoner fra start (filkonvertering, Excel-parsing)
- Ikke full testdekning i MVP – utvides etter behov

## Mappestruktur

```
toolbox/
├── CLAUDE.md
├── docs/
├── frontend/
│   ├── public/              ← Statiske filer (index.html, favicon)
│   └── src/
│       ├── assets/          ← Bilder, ikoner, fonter
│       ├── components/      ← Gjenbrukbare React-komponenter
│       └── pages/           ← Sidekomponenter (én per verktøy/visning)
└── backend/
    ├── uploads/             ← Midlertidige opplastede filer
    └── src/
        ├── controllers/     ← Forretningslogikk per rute
        ├── routes/          ← Express-ruter
        └── utils/           ← Hjelpefunksjoner (filparsing, konvertering)
```

## Navnekonvensjoner

| Kontekst | Konvensjon | Eksempel |
|----------|-----------|---------|
| React-komponenter | PascalCase | `ToolCard.jsx` |
| Andre JS-filer | camelCase | `parseExcel.js` |
| CSS-moduler | PascalCase (matcher komponent) | `ToolCard.module.css` |
| Backend-ruter/kontrollere | kebab-case | `file-upload.js` |
| Mapper | kebab-case | `file-upload/`, `components/` |
| Konstanter | UPPER_SNAKE_CASE | `MAX_FILE_SIZE` |

## Viktige beslutninger

| Dato | Beslutning | Begrunnelse |
|------|------------|-------------|
| 2026-04-16 | Monorepo fremfor separate repos | Ett prosjekt, ett team, enklere å håndtere på dette stadiet |
| 2026-04-16 | Ingen database i MVP | Data lever i Excel og JSON – revurderes ved videreutvikling av RFLP-viewer |
| 2026-04-16 | Express fremfor tyngre rammeverk | Minimalt og lettvint, tilstrekkelig for behovene i MVP |
| 2026-04-16 | Filopplasting fremfor filstier | Fungerer både lokalt og etter URL-deploy, mer profesjonelt grensesnitt |
