# ratr solutions — Brand Guide v1.0

## Merkevareidentitet

**ratr solutions** er et konsulentselskap som leverer smarte, presise løsninger. Merkevaren er smidig, profesjonell, direkte og løsningsorientert — aldri byråkratisk eller full av jargon.

Navnet skrives alltid med liten r: **ratr solutions** — aldri «Ratr» eller «RATR».

---

## Farger

### Primærfarger

| Navn | Hex | Bruk |
|------|-----|------|
| Ekorneoransje | `#C97A1A` | Primær aksent, CTA-knapper, ikoner, aktive elementer |
| Kullsvart | `#1A1A1A` | Primærtekst, mørke bakgrunner, navigasjon |
| Hvit | `#FFFFFF` | Bakgrunn, tekst på mørkt |

### Støttefarger

| Navn | Hex | Bruk |
|------|-----|------|
| Oransje mørk | `#A8620F` | Hover-tilstand på primærknapper |
| Oransje lys | `#E8960E` | Highlights, sekundære bakgrunnsflater |
| Off-white | `#F5F3F0` | Sekundær bakgrunn, kortflater |
| Mørk grå | `#3D3D3D` | Sekundærtekst |
| Mellomgrå | `#8A8A8A` | Hjelpetekst, deaktiverte elementer |

### Statusfarger

| Navn | Hex | Bruk |
|------|-----|------|
| Suksess | `#2E7D4F` | Bekreftelse, fullført |
| Feil | `#C0392B` | Feilmeldinger, kritiske varsler |
| Info / lenker | `#1E6FA8` | Lenker, informasjonselementer |
| Advarsel | `#C97A1A` | Obs, pågående prosesser (samme som oransje) |

---

## Typografi

### Skriftpar

| Rolle | Font | Fallback |
|-------|------|---------|
| Overskrifter / display | Playfair Display | Georgia, serif |
| Brødtekst / UI | Source Sans 3 | Calibri, sans-serif |

### Hierarki

| Element | Font | Størrelse | Vekt | Notat |
|---------|------|-----------|------|-------|
| H1 | Playfair Display | 36–44px | Bold | Sideoverskrift |
| H2 | Playfair Display | 24–28px | Bold | Seksjonsoverskrift |
| H3 | Source Sans 3 | 18px | SemiBold | Underoverskrift |
| Brødtekst | Source Sans 3 | 15–16px | Regular | Linjehøyde 1.7 |
| Etikett | Source Sans 3 | 11px | SemiBold | Uppercase, letter-spacing 0.12em, oransje |
| Hjelpetekst | Source Sans 3 | 12–13px | Regular | Sekundær farge |

### CSS-variabler (forslag)

```css
:root {
  --font-display: 'Playfair Display', Georgia, serif;
  --font-body: 'Source Sans 3', Calibri, sans-serif;

  --color-orange:       #C97A1A;
  --color-orange-dark:  #A8620F;
  --color-orange-light: #E8960E;
  --color-black:        #1A1A1A;
  --color-white:        #FFFFFF;
  --color-offwhite:     #F5F3F0;
  --color-gray-dark:    #3D3D3D;
  --color-gray-mid:     #8A8A8A;
  --color-gray-light:   #DEDBD7;

  --color-success: #2E7D4F;
  --color-error:   #C0392B;
  --color-info:    #1E6FA8;
}
```

---

## Logo

Logoen består av **ekornsymbolet** (ikon) og **ordmerket** «ratr solutions». De kan brukes samlet eller hver for seg. Spør brukeren om en kopi når du trenger det.

### Godkjente kombinasjoner

| Bakgrunn | Logo-variant |
|----------|-------------|
| Hvit `#FFFFFF` | Svart + oransje logo |
| Kullsvart `#1A1A1A` | Hvit + oransje logo |
| Off-white `#F5F3F0` | Svart + oransje logo |
| Ekorneoransje `#C97A1A` | Svart + hvit logo |

### Regler

- Frysone: minimum logohøyde på alle kanter — ingen andre elementer innenfor denne sonen
- Digital minstestørrelse: 120px bredde
- Print minstestørrelse: 25mm bredde
- Favicon / avatar: kun ikonet i sirkelform
- Ikke strekk, roter eller forvreng proporsjoner
- Ikke endre farger utover godkjente kombinasjoner
- Ikke plasser logoen på bilder uten tilstrekkelig kontrast

---

## UI-komponenter

### Knapper

```css
/* Primærknapp */
background: #C97A1A;
color: #FFFFFF;
border-radius: 6px;
/* Hover: */
background: #A8620F;

/* Sekundærknapp */
background: transparent;
color: #1A1A1A;
border: 1.5px solid #1A1A1A;
border-radius: 6px;
/* Hover: */
background: #1A1A1A;
color: #FFFFFF;
```

### Fokusring

```css
outline: 2px solid #C97A1A;
outline-offset: 2px;
```

### Navigasjon

- Bakgrunn: `#1A1A1A`
- Tekst: `#FFFFFF`
- Aktiv indikator: `#C97A1A`

### Lenker

- Farge: `#1E6FA8` — aldri oransje for lenker
- Hover: underline

### Hjørneavrunding

| Verdi | Bruk |
|-------|------|
| `2px` | Tags, tabellceller, inline-elementer |
| `6px` | Knapper, inputs, badges |
| `10px` | Kort, paneler, modaler |
| `50%` | Avatar, profilbilde, logo-ikon |

---

## Layout og spacing

Spacing-systemet er basert på **8px**.

| Token | Verdi | Bruk |
|-------|-------|------|
| `--space-xxs` | 4px | Intern ikonmargin |
| `--space-xs` | 8px | Mellom ikon og tekst |
| `--space-sm` | 16px | Intern kortpadding |
| `--space-md` | 24px | Mellom komponenter |
| `--space-lg` | 40px | Seksjonsgap |
| `--space-xl` | 64px | Sidemargin, hero-padding |
| `--space-xxl` | 96px | Store seksjonspauser |

### Grid

- Maks innholdsbredde: `1200px`, sentrert
- Dokumentbredde (tekst): `760px`
- 12-kolonne grid med `24px` gutter
- Sidemargin: `64px` desktop, `24px` mobil

---

## Stemme og tone

### Personlighet
Smidig · Profesjonell · Direkte · Varm · Løsningsorientert · Ambisiøs

### Skriv slik

- Korte, aktive setninger
- Konkrete anbefalinger — unngå vage formuleringer
- Avslutt alltid med en konkret neste steg eller handling
- Norsk i norske kontekster, engelsk internasjonalt

### Unngå

- Buzzwords: «synergier», «helhetlig», «paradigmeskifte», «bransjeledende»
- Passiv form der aktiv er mulig
- Lange innledninger før poenget

---

## Sosiale medier — størrelser

| Format | Størrelse |
|--------|-----------|
| Profilbilde | 400×400px |
| LinkedIn-banner | 1584×396px |
| Instagram-innlegg | 1080×1080px (også 1080×1350px) |
| Open Graph / deling | 1200×630px |

### Visuelle prinsipper

- Svart og hvit som dominerende bakgrunner — oransje som aksent
- Ekornet og oransje = gjenkjennelig ratr-signatur i feed
- Unngå skriende fargebakgrunner
- Autentiske bilder av team og arbeid prioriteres over stockfoto
