# CLAUDE.md – Verktøykasse

_v1.4 – 2026-04-24_

## Prosjekt

En web-basert applikasjon som samler nyttige verktøy i én felles verktøykasse.

## Språk

- Forklaringer og samtale: norsk
- Kode, variabelnavn, kommentarer i filer, git commits: engelsk

## Arbeidsmetode

- Forklar hva og hvorfor før du utfører – ikke bare gjør.
- Spør før store endringer.
- Nevn alternativer kort når det finnes flere måter å løse noe på.
- Gjør antagelser eksplisitte. Ved flere mulige tolkninger: presenter dem, ikke velg stille.
- For flertrinnsoppgaver: legg frem en kort plan med verifiseringssjekker før du starter.
- Les `docs/project-status.md` ved sesjonstart og gi en kort orientering: nåtilstand, foreslått neste steg, eventuelle blokkeringer. Brukeren bekrefter retning før arbeid starter.
- Marker steg som fullført i aktiv `implementation-plan.md` umiddelbart – ikke samlet på slutten.
- Avvik fra plan kommuniseres til bruker før du fortsetter.
- Oppdater `project-status.md` automatisk når fase, prioritet eller aktive sub-prosjekter endres.
- Oppdater `project-log.md` kun ved hendelser av varig verdi – milepæler, viktige beslutninger, kursendringer.
- Ny idé med tydelig scope og estimert omfang > én arbeidsøkt → foreslå `/new-plan`.
- Ved mulige forbedringer til PM-systemet: flagg det kort verbalt. Hvis bekreftet, logg som `[PM-IMPROVEMENT]: <beskrivelse>` i project-log.md.

## Dokumentasjon

Les kun det som er relevant for sesjonen:

| Fil | Innhold | Les når |
|-----|---------|---------|
| `docs/project-status.md` | Nåværende fase, aktive sub-prosjekter, neste steg | Alltid ved sesjonstart |
| `docs/project-log.md` | Kronologisk hendelseslogg | Historisk kontekst |
| `docs/architecture.md` | Teknologivalg, mappestruktur, konvensjoner | Tekniske beslutninger, filopprettelse |
| `docs/spec.md` | Spesifikasjon, krav, scope | Implementere funksjoner, vurdere scope |
| `docs/verktøykasse-prosjekt.md` | Prosjektbeskrivelse og valgte prinsipper | Orientering, onboarding, prosjektspesifikke beslutninger |
| _(se `project-status.md`)_ | Aktive implementasjonsplaner | Under aktiv implementering |

## Prosjektspesifikt

_Ingen overstyringer._
