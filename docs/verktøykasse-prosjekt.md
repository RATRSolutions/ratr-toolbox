# Verktøykasse – Prosjektdokument

_v1.1 – 2026-04-16_

## Om dette dokumentet

Overordnet beskrivelse av Verktøykasse-prosjektet og prinsippene vi følger.
Detaljert innhold (status, arkitektur, spec) ligger i separate filer under `docs/`.

---

## Prosjektbeskrivelse

En web-basert applikasjon som samler nyttige verktøy i én felles verktøykasse.
Prosjektet bygges fra bunnen med en ryddig struktur og profesjonell pipeline.

### Planlagte verktøy

- **md-to-docx** – tar inn en Markdown-fil og en Word-mal, produserer et ferdig formatert Word-dokument
- **Excel-visning** – parser en Excel-basert database og presenterer datasett visuelt for menneskelig review
- **Læringsplan** – strukturert plan for å sette opp en AI-assistert bedrift

Nye verktøy kan legges til over tid.

---

## Prinsipper

### Sparse context loading

CLAUDE.md skal alltid være liten og ren – en inngangsport, ikke en encyclopedia.
Dokumentasjon deles inn i separate tematiske filer. Claude leser kun filen som
er relevant for den aktuelle sesjonen. Prinsippet er beskrevet i detalj i
`docs/dev-guide.md` og kan gjenbrukes i fremtidige prosjekter.

### Dokumentasjon underveis

Prosjektdokumentene oppdateres løpende, ikke etterpå. Claude foreslår oppdatering
når et steg er fullført eller en viktig beslutning er tatt – men spør alltid først.

---

*Opprettet: 2026-04-16*
