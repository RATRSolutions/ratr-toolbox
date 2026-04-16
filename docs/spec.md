# Spec – Verktøykasse

_v1.1 – 2026-04-16_

## Formål

En web-basert intern verktøykasse for ratr solutions. Samler nyttige verktøy
som brukes i arbeidet med kunder. Opereres av ansatte – ikke eksponert mot kunder.

## Målgruppe

- Primær: Daglig leder / konsulent (én bruker i dag)
- Fremtidig: Ansatte i ratr solutions

## Overordnede krav til verktøykassen

- Kjører lokalt i dag, men bygges for enkel deploy via URL senere
- Ingen autentisering i MVP, men arkitekturen skal ikke hindre det senere
- Funksjonelt design med ratr solutions branding (se `docs/ratr_brandguide.md`)
- Verktøyene er uavhengige i dag, men arkitekturen skal tillate datautveksling mellom dem senere
- Nye verktøy skal kunne legges til uten å måtte bygge om kassen

---

## Verktøy

### 1 — md-to-docx

**Formål:** Konvertere et ferdig Markdown-dokument til et Word-dokument formatert
etter en gitt mal. Brukes på slutten av en dokumentasjonsprosess med Claude,
når et engineering-dokument skal leveres til kunde.

**Bruker:** Konsulent (deg)

**Input:**
- En `.md`-fil (dokumentinnhold)
- En `.docx`-malfil (formatering og layout)

**Output:**
- Et ferdig `.docx`-dokument formatert etter malen

**Grensesnitt:**
- Filopplasting via nettleser (dra-og-slipp eller filvelger) for begge filer
- Nedlastingslenke til ferdig `.docx` etter konvertering

**Status:** Eksisterende skript som fungerer – skal løftes inn i verktøykassen
med et brukergrensesnitt rundt seg.

**Fremtidige forbedringer:** Ingen identifisert ennå.

---

### 2 — RFLP Viewer

**Formål:** Review- og presentasjonsverktøy for RFLP-databaser (Requirements,
Functions, Logical elements, Physical elements) i møter med kunder. Gjør det
mulig å navigere relasjonelt mellom funksjoner, krav, kontekst og konsepter
uten å bla i Excel.

**Bruker:** Konsulent (deg) – brukes i kundemøter

**Input:**
- Filopplasting av `.xlsm` eller `.xlsx` ved oppstart av verktøyet

**Output:**
- Read-only visning av databasen – ingen redigering

**Grensesnitt:**
- To-panel layout
- **Venstre panel:** Kollapsbart funksjonstre basert på `ParentID`-hierarki
- **Høyre panel:** Alt tilknyttet valgt funksjon, organisert i seksjoner:
  - Funksjonsbeskrivelse og metadata
  - Tilknyttede krav
  - Kontekstbeskrivelser
  - Konseptbeslutninger
  - Logiske elementer

**Viktig:** Parsingen skal ikke hardkodes mot dagens fanestruktur – nye faner
i Excel-filen skal kunne håndteres uten kodeendringer. Dette er en MVP av
det som på sikt skal bli en ordentlig database med frontend.

**Status:** Ikke eksisterende – bygges fra bunnen.

**Fremtidige forbedringer:** Ingen identifisert ennå.

---

### 3 — Læringsplan

**Formål:** Strukturert læringsplan for å sette opp en AI-assistert bedrift.
Presenterer faser og temaer med lenker til eksterne lærekilder.

**Bruker:** Konsulent (deg)

**Dagens form:**
- En HTML-fil for presentasjon
- En JSON-fil for innhold (kan redigeres og diskuteres med Claude)

**Grensesnitt:**
- Visuell presentasjon av faser og temaer med eksterne lenker
- Innholdet styres via JSON-filen

**Status:** Eksisterer som HTML + JSON – skal løftes inn i verktøykassen.

**Fremtidige forbedringer:**
- Progresjonssporing – markere fullførte temaer og faser per bruker

---

## Utenfor scope (MVP)

- Autentisering og brukeradministrasjon
- Redigering av RFLP-data i vieweren
- Progresjonssporing i læringsplanen
- Deling av verktøykassen med kunder
- Datautveksling mellom verktøy
