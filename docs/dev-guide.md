# Dev guide – Oppsettguide for nye prosjekter

_v1.3 – 2026-04-16_

Denne guiden dokumenterer hvordan et prosjekt settes opp fra bunnen,
steg for steg. Den er skrevet for å kunne gjenbrukes som mal i fremtidige
prosjekter, uavhengig av Verktøykasse-prosjektet spesifikt.

---

## Prinsipp: Sparse context loading

Hold CLAUDE.md liten og ren. Del dokumentasjon inn i separate tematiske filer
slik at Claude bare leser det som er relevant for hver sesjon. Dette holder
token-bruken lav og konteksten presis.

**Anbefalt struktur:**

```
prosjektrot/
├── CLAUDE.md                  ← alltid liten, alltid lest – inngangsport
└── docs/
    ├── verktøykasse-prosjekt.md  ← prosjektbeskrivelse og prinsipper
    ├── project-status.md         ← nåværende fase, faseliste, neste steg
    ├── project-log.md            ← kronologisk hendelseslogg
    ├── architecture.md           ← teknologivalg, mappestruktur, konvensjoner
    ├── spec.md                   ← spesifikasjon, krav, scope
    └── dev-guide.md              ← denne filen
```

**Regler:**
- CLAUDE.md skal ikke inneholde innhold – bare peke videre
- Hver fil har ett klart ansvar – ikke gjenta innhold på tvers av filer
- `project-status.md` holdes alltid kort – kun nåværende tilstand
- `project-log.md` vokser fritt – leses sjelden, kun ved behov
- Alle filer versjoneres med `_vX.Y – ÅÅÅÅ-MM-DD_` øverst
- Oppdater versjon og dato hver gang en fil endres

---

## Fase 1 – Planlegging og spesifikasjon

### 1a – Spesifikasjon

Før du velger teknologi, skriv ned hva du skal bygge. En god spec inneholder:

- **Formål** – hva løser applikasjonen, for hvem?
- **Målgruppe** – hvem bruker den, nå og fremover?
- **Overordnede krav** – kjøring, skalering, design, avhengigheter
- **Verktøy / funksjoner** – ett avsnitt per verktøy med formål, input, output og grensesnitt
- **Utenfor scope** – eksplisitt liste over hva som ikke er med i MVP

Skriv spesifikasjonen i `docs/spec.md` og hold den oppdatert når scope endrer seg.

### 1b – Teknologivalg

Velg teknologi *etter* at spesifikasjonen er klar – ikke omvendt.
Dokumenter hvert valg med begrunnelse i `docs/architecture.md`.

**Typiske valg for en web-basert verktøykasse:**

| Teknologi | Rolle | Hvorfor |
|-----------|-------|---------|
| React | Frontend | Stort økosystem, god for dynamisk state-håndtering |
| Vite | Byggverktøy | Rask, enkel konfigurasjon, moderne alternativ til Create React App |
| Node.js | Backend-kjøremiljø | Konsistent JavaScript på tvers av frontend og backend |
| Express | HTTP-rammeverk | Minimalt og lettvint, tilstrekkelig for de fleste MVP-behov |
| Jest | Testing | Mest brukte testverktøy for Node.js |

**Monorepo vs. separate repos:**
For små prosjekter med én frontend og én backend som utvikles i takt,
er monorepo enklere: ett repo, én Git-historikk, enklere konfigurasjonsdeling.
Separate repos gir mer overhead uten tilsvarende gevinst på dette stadiet.

**Kodekvalitetsprinsipper å bestemme i Fase 1:**
- Kommentarer beskriver *hvorfor*, ikke hva
- Språk i kode og kommentarer (anbefalt: engelsk)
- Teststrategi – enhetstester på kritiske funksjoner fra start, ikke full dekning

---

## Fase 2 – Mappestruktur og navnekonvensjoner

> Fylles inn når fasen er fullført.

---

## Fase 3 – Versjonskontroll med Git og GitHub

> Fylles inn når fasen er fullført.

---

## Fase 4 – Frontend og backend oppsett

> Fylles inn når fasen er fullført.

---

## Fase 5 – Hello world og verifisering

> Fylles inn når fasen er fullført.

---

## Fase 6 – Portere verktøyene inn

> Fylles inn når fasen er fullført.
