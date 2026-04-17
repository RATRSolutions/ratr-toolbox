# Design: RFLP Viewer

_2026-04-17_

## Kontekst

RFLP Viewer er verktøy nr. 3 i verktøykassen. Bygges fra bunnen av. Formål: read-only visning og navigasjon av RFLP-databaser (Requirements, Functions, Logical elements, Physical elements) fra Excel-filer – uten å bla i Excel. Brukes i kundemøter.

Input: `.xlsx` eller `.xlsm` filopplasting i nettleseren. Ingen data sendes til backend. Excel-parsing gjøres med SheetJS (`xlsx` npm-pakke).

---

## Arkitektur

Parser-lag (custom hook) er adskilt fra view-lag (komponenter). Excel-filen leses direkte i nettleseren med SheetJS. Ingen backend-kall.

```
frontend/src/
  pages/
    RflpViewer.jsx        ← hoved-side, koordinerer panelene og holder selectedId
    RflpViewer.css        ← all styling for RFLP Viewer
  components/
    rflp/
      FileUpload.jsx      ← filvelger (vises til fil er lastet)
      FunctionTree.jsx    ← venstre panel, kollapsbart funksjonstre
      DetailPanel.jsx     ← høyre panel, kollapsbare seksjoner
  hooks/
    useRflpData.js        ← all Excel-parsing, returnerer strukturerte data
```

`App.jsx` får route `/rflp-viewer`. `Home.jsx` får et tredje verktøykort.

---

## Datamodell

`useRflpData.js` eksponerer én hook som tar en `File`-referanse og returnerer:

```js
{
  functions: [
    {
      id: string,         // FunctionID
      parentId: string | null,
      name: string,
      children: [...],   // bygget rekursivt fra ParentID-hierarki
      metadata: {}       // alle øvrige kolonner fra tblFunctions
    }
  ],
  sections: {
    "Requirements": [{ functionId, ...rad }],
    "ContextDescription": [...],
    // alle oppdagede faner med FunctionID-kolonne
  },
  loading: boolean,
  error: string | null
}
```

**Parsing-strategi (ikke hardkodet):**
- Funksjonstabellen identifiseres ved fanenavnet `10_Function`
- Alle andre faner skannes: de som har en kolonne der kolonnenavnet er nøyaktig `FunctionID` (case-insensitive sammenligning) inkluderes automatisk som seksjoner
- Seksjonstitler renses: tall-prefiks og underscore fjernes (`20_Requirements` → `Requirements`)
- Nye faner i Excel-filen dukker opp automatisk i UI uten kodeendringer

---

## Komponenter

### `FileUpload.jsx`
Vises når ingen fil er lastet. Filopplastingsboks med drag-and-drop for `.xlsx`/`.xlsm`. Kaller `onLoad(file)` ved valg.

### `FunctionTree.jsx`
Props: `functions`, `selectedId`, `onSelect`

- Rendrer hierarkisk tre rekursivt
- Noder med barn: kollaps/ekspander-knapp (▶/▼)
- Klikk på node kaller `onSelect(id)`
- Valgt node: oransje venstrekant, lysere bakgrunn
- Innrykk: 16px per nivå

### `DetailPanel.jsx`
Props: `func` (valgt funksjon), `sections` (alle seksjonsdata)

- Viser funksjonsnavn og metadata fra `func.metadata` øverst
- Én kollapsbar seksjon per oppdag-fane som har rader med valgt `FunctionID`
- Seksjoner uten rader for valgt funksjon vises ikke
- Seksjonstittel viser antall rader i parentes: `Krav (4)`

### `RflpViewer.jsx`
- Holder `file` og `selectedId` i `useState`
- Viser `FileUpload` om ingen fil er lastet
- Viser 25/75 to-panel-layout (fast splitt) om fil er lastet
- Bruker `useRflpData(file)` for data

---

## Layout

Fast 25/75-splitt. Ingen resizing.

- **Venstre (25%):** `FunctionTree` – scrollbart, sticky header med filnavn
- **Høyre (75%):** `DetailPanel` – scrollbart uavhengig av venstre panel

Begge paneler scroller uavhengig av hverandre.

---

## Styling

Følger samme design-system som Læringsplan:

| Token | Verdi |
|-------|-------|
| Bakgrunn | `#1a1a1a` |
| Kortflater | `#1e1e1e` / `#242424` |
| Primærtekst | `#f5f3f0` |
| Sekundærtekst | `#8a8a8a` |
| Aksent | `#c97a1a` |
| Font display | Playfair Display |
| Font body | Source Sans 3 |
| Font mono | DM Mono |

---

## Feilhåndtering

- Feil filformat (ikke xlsx/xlsm): feilmelding i `FileUpload`
- Manglende `10_Function`-fane: tydelig feilmelding i UI
- Manglende `ParentID`-kolonne: funksjoner vises flatt uten hierarki
- Tom seksjon (ingen rader for valgt funksjon): seksjonen vises ikke

---

## Ikke i scope (MVP)

- Redigering av data
- Søk/filtrering i tre eller seksjoner
- Export
- Autentisering
