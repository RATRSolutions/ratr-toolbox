# Project status – Verktøykasse

_v1.5 – 2026-04-17_

## Nåværende fase

Deployed ✅

## Faseliste

| # | Fase | Status |
|---|------|--------|
| 1 | Planlegging og spesifikasjon | ✅ Fullført |
| 2 | Mappestruktur og navnekonvensjoner | ✅ Fullført |
| 3 | Versjonskontroll med Git og GitHub | ✅ Fullført |
| 4 | Frontend og backend oppsett | ✅ Fullført |
| 5 | Hello world og verifisering | ✅ Fullført |
| 6 | Portere verktøyene inn | ✅ Fullført |
| 7 | Deploy | ✅ Fullført |

## Deploy

- **Platform:** Vercel (Hobby-plan, gratis)
- **URL:** https://ratr-toolbox.vercel.app/
- **Repo:** RATRSolutions/ratr-toolbox (GitHub)
- **Auto-deploy:** Nye endringer på `main` deployes automatisk

## Aktive verktøy

- **RFLP Viewer** – Live på Vercel. Read-only visning av RFLP-databaser fra Excel (.xlsx/.xlsm).
  Funksjoner per 2026-04-17:
  - Funksjonshierarki med ID-tag, statusfilter og kollapset startvisning
  - Detaljpanel med FunctionalIntent fremhevet, metadata som chips
  - Underfunksjoner som klikkbar liste (navigerer i treet)
  - Konseptbeslutninger med nestet LogiskElement → FysiskElement
  - Kontekstbeskrivelser og Krav komprimert med fokusfelter
  - Filter på SourceType i Krav-blokken
  - Kryssnavigasjon mellom Krav ↔ Kontekst ↔ Konsept med scroll og highlight

## Lokalt (ikke deployed)

- **md-to-docx** – Krever Python/pandoc-backend
- **Læringsplan** – Kan deployes ved behov

## Neste steg

Ingen definerte oppgaver. Mulige retninger:

- Ytterligere RFLP Viewer-forbedringer basert på bruk i kundemøter
- Deploy av Læringsplan
