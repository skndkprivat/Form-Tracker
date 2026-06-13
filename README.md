# 🏔️ Form-tracker — Bruger Manual

**Live app:** https://skndkprivat.github.io/Form-Tracker/

Form-tracker er et personligt træningsværktøj til cykelryttere der vil planlægge deres form mod en specifik begivenhed — fx et bjergløb, en flerdag-tur eller et stævne. Data synkroniseres automatisk på tværs af alle dine enheder via Firebase.

---

## 📋 Indhold

1. [Log ind](#-log-ind)
2. [Forstå tallene](#-forstå-tallene)
3. [Min profil og plan-generator](#-min-profil-og-plan-generator)
4. [Mine bjerge](#️-mine-bjerge)
5. [Formkurven](#-formkurven)
6. [Dag-for-dag plan](#-dag-for-dag-plan)
7. [Log dine træninger](#-log-dine-træninger)
8. [Importer fra Garmin / Intervals.icu / Strava](#-importer-fra-garmin--intervalsicu--strava)
9. [Cloud sync — data på alle enheder](#-cloud-sync--data-på-alle-enheder)
10. [Gem til hjemmeskærm (iPhone)](#-gem-til-hjemmeskærm-iphone)
11. [Lokal udvikling](#-lokal-udvikling)
12. [Opdater og deploy](#-opdater-og-deploy)

---

## 🔐 Log ind

Når du åbner appen første gang vises en login-skærm.

1. Klik **Fortsæt med Google**
2. Et vindue åbner sig — vælg din Google-konto
3. Du er nu logget ind og dine data hentes automatisk fra skyen

> **Tip:** Din browser skal tillade popups fra `skndkprivat.github.io`. Klik på hængelåsikonet i adresselinjen → Popups → Tillad.

Login huskes i browseren — du behøver ikke logge ind igen næste gang.

---

## 📊 Forstå tallene

Form-tracker bruger tre nøgletal fra sportsfysiologi:

| Tal | Fuldt navn | Beskrivelse |
|-----|------------|-------------|
| **CTL** | Chronic Training Load · Fitness | Dit langsigtede træningsniveau. Stiger langsomt over uger og måneder. Beregnes over 42 dage. |
| **ATL** | Acute Training Load · Træthed | Din kortsigtede træthed. Stiger hurtigt efter hård træning og falder hurtigt ved hvile. Beregnes over 7 dage. |
| **TSB** | Training Stress Balance · Form | Din aktuelle form = CTL minus ATL. Positivt = frisk og klar. Negativt = træt. |
| **TSS** | Training Stress Score | Et enkelt tal der beskriver hvor hård en træning var. Let 1-times tur ≈ 40. Hård bjergdag ≈ 150-200. |

### Hvad er en god TSB på race day?

| TSB | Betydning |
|-----|-----------|
| Under -20 | Meget træt — for meget træning |
| -20 til -5 | Træt — reducer belastning |
| -5 til +5 | Neutral |
| **+5 til +15** | **Optimal form — frisk men ikke aftränet** |
| Over +25 | For frisk — fitness er faldet |

### W/kg

- **W/kg krop** = FTP ÷ kropsvægt
- **W/kg system** = FTP ÷ (krop + cykel + vand + udstyr)

Jo højere W/kg, jo bedre klatrer du i bjerge.

---

## 👤 Min profil og plan-generator

Her indtaster du dine data. Alt gemmes og synkroniseres automatisk til skyen.

| Felt | Hvad skal jeg skrive? |
|------|-----------------------|
| **FTP (W)** | Din Functional Threshold Power i watt |
| **Vægt (kg)** | Din kropsvægt — eks. 77 |
| **Cykel (kg)** | Din cykels vægt — eks. 8,5 |
| **Dunke (×750ml)** | Antal vandflasker du typisk kører med |
| **Udstyr (kg)** | Hjelm, sko, tøj, sadeltaske osv. — typisk 0,5-1,0 kg |
| **Start CTL** | Din nuværende CTL/Fitness-værdi fra Intervals.icu eller Garmin |
| **Start ATL** | Din nuværende ATL/Træthed-værdi |
| **Start dato** | Den dato dine startværdier er fra — typisk i dag |
| **Race dato 🏔️** | Datoen for din vigtigste begivenhed |
| **Base uge-TSS** | Din nuværende ugentlige træningsbelastning i TSS |

### Automatisk plan-generator

Når du sætter **Race dato** og **Base uge-TSS** genereres en træningsplan automatisk med:

- **4-ugers blokke**: uge 1 (basis), uge 2 (+5%), uge 3 (+10%), uge 4 (rolig = samme som uge 2)
- **+15% per blok** efterhånden som sæsonen skrider frem
- **Taper**: de sidste 2 uger reduceres til 50% og 30% for optimal form på race day
- **Sessionstyper**: Z2 let (mandag), Tærskel (tirsdag), fri (onsdag), Z2 moderat (torsdag), Sweet spot (fredag), Lang Z2 (lørdag), fri (søndag)

Planen opdateres automatisk når du ændrer race dato eller base uge-TSS.

### Faste fridage

Klik på de ugedage du altid hviler. Disse dage får TSS = 0 automatisk.

### Sådan finder du CTL og ATL

1. Gå til **intervals.icu** → **Fitness** i venstre menu
2. Hold musen over grafen på dagens dato
3. Aflæs **Fitness** (= CTL) og **Fatigue** (= ATL)

---

## 🏔️ Mine bjerge

Tilføj de begivenheder du træner mod.

### Tilføj et bjerg

1. Klik **+ Tilføj bjerg**
2. Udfyld navn, dato, TSS og farve
3. Klik **Gem**

### Estimér TSS for en begivenhed

| Tur-type | Estimeret TSS |
|----------|---------------|
| Let 1-times tur, fladt | 40-60 |
| Moderat 2-timers tur | 80-100 |
| Hård 3-timers tur med stigninger | 120-150 |
| Bjergdag 4-5 timer | 150-200 |
| Gran fondo / Alpe d'Huez | 200-300+ |

---

## 📈 Formkurven

Grafen viser **CTL · Fitness** (blå), **ATL · Træthed** (rød) og **TSB · Form** (grøn) over hele planperioden.

- Lodrette stiplede linjer markerer dine bjerge/begivenheder
- ✓ i tooltip = loggede træninger med faktisk TSS
- Hover over grafen for præcise værdier

---

## 📅 Dag-for-dag plan

Tabellen viser en dag-for-dag oversigt fra startdatoen til race day.

| Kolonne | Betydning |
|---------|-----------|
| **Dato** | Dag og dato |
| **Session** | Planlagt træningstype |
| **Plan TSS** | Forventet TSS |
| **Logget TSS** | Din faktiske TSS (grøn badge hvis logget) |
| **CTL · Fitness / ATL · Træthed / TSB · Form** | Beregnede værdier |
| **+/✏️** | Log eller rediger dagen |

Farver: 🟤 brun = bjerg/race, nedtonet = fridag, 🟢 mørkegrøn = logget.

---

## ✍️ Log dine træninger

### Automatisk pop-up

Hver dag åbner appen med en pop-up for dagens dato (hvis ikke allerede logget). Skriv faktisk TSS og evt. en note.

### Manuel logning

1. Gå til **Dag-for-dag plan**
2. Find datoen og klik **+**
3. Indtast faktisk TSS og note → **Gem ✓**

Loggede træninger påvirker CTL/ATL/TSB-beregningen fra den dato og frem.

---

## 📥 Importer fra Garmin / Intervals.icu / Strava

Klik **📥 Importer** øverst til højre.

### Intervals.icu
1. **intervals.icu** → Aktiviteter → **⋮ → Eksporter CSV**

### Garmin Connect
1. **connect.garmin.com** → Aktiviteter → **Eksporter CSV**

### Strava
1. **strava.com** → Indstillinger → Download dine data → pak ZIP ud → find `activities.csv`
> ⚠️ TSS kræver Strava Premium

### Simpel CSV
Lav en fil med Excel eller Notesblok:
```
date,tss
2025-06-01,75
2025-06-02,0
2025-06-03,95
```

---

## ☁️ Cloud sync — data på alle enheder

Dine data gemmes i **Firebase Firestore** og synkroniseres automatisk:

- Logger du ind på iPhone ser du præcis de samme data som på PC
- Ændringer gemmes til skyen ~1 sekund efter du stopper med at skrive
- `↑ gemmer` vises ved dit navn mens data uploades
- **Offline**: appen virker uden internet og synkroniserer når du er online igen

---

## 📱 Gem til hjemmeskærm (iPhone)

1. Åbn **https://skndkprivat.github.io/Form-Tracker/** i Safari
2. Tryk på **Del-ikonet** (firkant med pil op)
3. Vælg **Føj til hjemmeskærm** → **Tilføj**

Appen åbner nu i fuld skærm som en rigtig app.

---

## 🛠️ Lokal udvikling

```bash
# Klon repo
git clone https://github.com/skndkprivat/Form-Tracker.git
cd Form-Tracker

# Opret .env fil med Firebase credentials (se .env.example)
cp .env.example .env
# Udfyld værdierne i .env

# Installer og kør
npm install
npm run dev
```

### Miljøvariabler

Kopier `.env.example` til `.env` og udfyld med dine Firebase-værdier:

```
VITE_FIREBASE_API_KEY=...
VITE_FIREBASE_AUTH_DOMAIN=...
VITE_FIREBASE_PROJECT_ID=...
VITE_FIREBASE_STORAGE_BUCKET=...
VITE_FIREBASE_MESSAGING_SENDER_ID=...
VITE_FIREBASE_APP_ID=...
```

> ⚠️ `.env` filen må aldrig committes til Git — den er i `.gitignore`.
> Firebase credentials til GitHub Actions gemmes som **Repository Secrets** under Settings → Secrets and variables → Actions.

---

## 🚀 Opdater og deploy

```bash
cd C:\Tools\Form-Tracker
git add .
git commit -m "Beskrivelse af ændring"
git push
```

GitHub Actions bygger og deployer automatisk inden for ~1 minut.

---

## 🔧 Teknisk stack

| Teknologi | Formål |
|-----------|--------|
| **React 18** + **Vite** | Frontend framework og build tool |
| **Recharts** | Grafer og visualisering |
| **Firebase Auth** | Google login |
| **Firebase Firestore** | Cloud database og realtid-sync |
| **GitHub Pages** | Hosting (gratis) |
| **GitHub Actions** | Automatisk build og deploy |

---

*Lavet med Claude · Sidst opdateret Juni 2026*
