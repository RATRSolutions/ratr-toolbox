# Design: Læringsplan – React-komponent

_2026-04-17_

## Kontekst

Læringsplan er verktøy nr. 2 i verktøykassen. Det eksisterer i dag som en HTML-fil + JSON-fil. Målet er å løfte det inn i React-applikasjonen som en egen side, og samtidig legge til routing og forside slik at verktøykassen kan vokse til tre verktøy.

---

## Arkitektur og routing

Vi legger til `react-router-dom`. App.jsx får tre routes:

| Route | Komponent |
|-------|-----------|
| `/` | `Home.jsx` |
| `/md-to-docx` | `MdToDocx.jsx` |
| `/laeringsplan` | `Laeringsplan.jsx` |

Filstruktur etter endringen:

```
frontend/src/
  pages/
    Home.jsx
    MdToDocx.jsx
    Laeringsplan.jsx
  components/
    laeringsplan/
      PhaseBlock.jsx
      ModuleCard.jsx
  data/
    laringsplan.json    ← allerede på plass
  App.jsx
```

`Home.jsx` er en forside med ett kort per verktøy. Klikk på et kort navigerer til verktøyets route.

---

## Komponenter

### `Laeringsplan.jsx`
- Leser `laringsplan.json` direkte (import)
- Rendrer header: tittel, eyebrow-tekst, stats-badges
- Rendrer oversiktsgrid: én klikkbar boks per fase, ankerlenkr ned til fasen på siden
- Lister ut `<PhaseBlock>` per fase

### `PhaseBlock.jsx`
Props: én fase fra JSON

- Rendrer fase-header: nummer, eyebrow, tittel, varighet-badge, mål
- Fargetema styres av `colorClass` (p1–p4) via CSS-klasser
- Lister ut `<ModuleCard>` per modul i fasen

### `ModuleCard.jsx`
Props: én modul fra JSON

- Kollapsbar: klikk på tittelen toggler innholdet med `useState`
- Chevron-ikon indikerer åpen/lukket tilstand
- Viser: mål, emner (med noter), ressurser (tag + lenke + note), øvelser
- `isNew`-flagget viser "NY"-badge ved siden av tittelen
- Milestone og judgment (finnes på noen moduler i JSON) vises nederst i modulen hvis de finnes

---

## Styling

Dedikert CSS-fil: `frontend/src/pages/Laeringsplan.css`

**Bakgrunn og farger:**
- Base bakgrunn: `#1A1A1A` (brand kullsvart – varmere enn HTML-versjonens `#0f0f11`)
- Kortflater: `#242424` / `#2c2c2c`
- Primærtekst: `#F5F3F0` (brand off-white)
- Sekundærtekst: `#8A8A8A` (brand mellomgrå)
- Aksent (UI-elementer, nav, fokusringer): `#C97A1A` (brand ekorneoransje)

**Fasefarger** (beholdes som semantiske markører):
- Fase 1: lilla `#a78bfa`
- Fase 2: grønn `#34d399`
- Fase 3: gul `#fbbf24`
- Fase 4: rød `#f87171`

**Fonter** (Google Fonts):
- Overskrifter: `Playfair Display` (erstatter DM Serif Display)
- UI/brødtekst: `Source Sans 3` (erstatter Outfit)
- Monospace-etiketter: `DM Mono` beholdes for tekniske labels

**Spacing:** 8px-basert system i tråd med brand guide.

---

## Dataflyt

JSON importeres statisk – ingen API-kall. Alle data er tilgjengelig ved første render. Ingen lasting, ingen feilhåndtering nødvendig.

---

## Ikke i scope

- Progresjonssporing (markere fullførte moduler) – nevnt i spec.md som fremtidig forbedring
- Søk eller filtrering
- Redigering av innhold
