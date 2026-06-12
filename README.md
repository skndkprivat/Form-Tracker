# 🏔️ Form-tracker — Bruger Manual

**Live app:** https://skndkprivat.github.io/Form-Tracker/

Form-tracker er et personligt træningsværktøj til cykelryttere der vil planlægge deres form mod en specifik begivenhed — fx et bjergløb, en flerdag-tur eller et stævne.

---

## 📋 Indhold

1. [Log ind](#-log-ind)
2. [Forstå tallene](#-forstå-tallene)
3. [Min profil](#-min-profil)
4. [Mine bjerge](#️-mine-bjerge)
5. [Formkurven](#-formkurven)
6. [Dag-for-dag plan](#-dag-for-dag-plan)
7. [Log dine træninger](#-log-dine-træninger)
8. [Importer fra Garmin / Intervals.icu / Strava](#-importer-fra-garmin--intervalsicu--strava)
9. [Gem til hjemmeskærm (iPhone)](#-gem-til-hjemmeskærm-iphone)
10. [Opdater koden](#-opdater-koden)

---

## 🔐 Log ind

Når du åbner appen første gang vises en login-skærm.

1. Klik **Fortsæt med Google**
2. Et vindue åbner sig — vælg din Google-konto
3. Du er nu logget ind og kan se din træningsplan

> **Tip:** Din browser skal tillade popups fra `skndkprivat.github.io`. Hvis login ikke virker, klik på adresselinjen → hængelåsikonet → Popups → Tillad.

Login huskes i browseren — du behøver ikke logge ind igen næste gang du åbner appen.

---

## 📊 Forstå tallene

Form-tracker bruger tre nøgletal fra sportsfysiologi:

| Tal | Navn | Beskrivelse |
|-----|------|-------------|
| **CTL** | Chronic Training Load / Fitness | Dit langsigtede træningsniveau. Stiger langsomt over uger og måneder med regelmæssig træning. Beregnes over 42 dage. |
| **ATL** | Acute Training Load / Træthed | Din kortsigtede træthed. Stiger hurtigt efter hård træning og falder hurtigt ved hvile. Beregnes over 7 dage. |
| **TSB** | Training Stress Balance / Form | Din aktuelle form = CTL minus ATL. Positivt tal = du er frisk og klar. Negativt tal = du er træt. |
| **TSS** | Training Stress Score | Et enkelt tal der beskriver hvor hård en træning var. En let 1-times tur = ca. 40. En hård bjergdag = 150-200. |

### Hvad er en god TSB på race day?

| TSB | Betydning |
|-----|-----------|
| Under -20 | Meget træt — for meget træning |
| -20 til -5 | Træt — reducer belastning |
| -5 til +5 | Neutral |
| +5 til +15 | **Optimal form** — frisk men ikke aftränet |
| Over +25 | For frisk — fitness er faldet |

Målet er at ramme race day med TSB mellem **+5 og +15**.

### Hvad er W/kg?

Watt per kilo er det vigtigste tal i cykelsport — især i bjerge.
- **W/kg krop** = FTP divideret med din kropsvægt
- **W/kg system** = FTP divideret med din samlede systemvægt (krop + cykel + vand + udstyr)

Jo højere W/kg, jo bedre klatrer du.

---

## 👤 Min profil

Her indtaster du dine personlige data. Alt gemmes automatisk i din browser.

| Felt | Hvad skal jeg skrive? |
|------|-----------------------|
| **FTP (W)** | Din Functional Threshold Power i watt. Find den med en FTP-test eller aflæs fra Garmin/Wahoo. |
| **Vægt (kg)** | Din kropsvægt i kg — eks. 77 |
| **Cykel (kg)** | Din cykels vægt — eks. 8,5 |
| **Dunke (×750ml)** | Antal vandflasker du typisk kører med — eks. 2 |
| **Udstyr (kg)** | Hjelm, sko, tøj, sadeltaske osv. — typisk 0,5-1,0 kg |
| **Start CTL** | Din nuværende CTL/Fitness-værdi. Find den i Intervals.icu eller Garmin Connect. |
| **Start ATL** | Din nuværende ATL/Træthed-værdi. Find den samme sted som CTL. |
| **Start dato** | Den dato dine startværdier er fra — typisk i dag. |

### Sådan finder du CTL og ATL i Intervals.icu

1. Gå til **intervals.icu** og log ind
2. Klik på **Fitness** i venstre menu
3. Hold musen over grafen på dagens dato
4. Aflæs **Fitness** (= CTL) og **Fatigue** (= ATL)

### Faste fridage

Klik på de ugedage du altid hviler. Disse dage får automatisk TSS = 0 i planen, medmindre du manuelt logger en træning.

---

## 🏔️ Mine bjerge

Her tilføjer du de begivenheder du træner mod — fx etaper, bjergløb eller fleretagers ture.

### Tilføj et bjerg

1. Klik **+ Tilføj bjerg**
2. Udfyld:
   - **Navn** — eks. "Cykelnerven dag 1"
   - **Dato** — datoen for begivenheden
   - **TSS** — forventet sværhedsgrad (se tabel nedenfor)
   - **Farve** — bruges til at markere dagen i grafen
3. Klik **Gem**

### Estimér TSS for en begivenhed

| Tur-type | Estimeret TSS |
|----------|---------------|
| Let 1-times tur, fladt | 40-60 |
| Moderat 2-timers tur | 80-100 |
| Hård 3-timers tur med stigninger | 120-150 |
| Bjergdag 4-5 timer | 150-200 |
| Ekstrem dag (gran fondo, Alpe d'Huez) | 200-300+ |

> **Tip:** Har du kørt lignende ture før, kan du se den faktiske TSS i Garmin Connect eller Intervals.icu.

### Rediger eller slet et bjerg

- Klik **✏️** for at redigere navn, dato, TSS eller farve
- Klik **🗑️** for at slette

---

## 📈 Formkurven

Grafen viser CTL (blå), ATL (rød) og TSB (grøn) over hele planperioden.

- **Lodrette stiplede linjer** markerer dine bjerge/begivenheder
- **✓** i tooltip betyder at dagen er logget med faktisk TSS
- Hover over grafen for at se præcise værdier på en given dato

Grafen opdateres automatisk når du ændrer din profil, tilføjer bjerge eller logger træninger.

---

## 📅 Dag-for-dag plan

Tabellen viser en dag-for-dag oversigt fra startdatoen til og med det seneste bjerg.

| Kolonne | Betydning |
|---------|-----------|
| **Dato** | Dag og dato |
| **Session** | Planlagt træningstype |
| **Plan TSS** | Forventet TSS ifølge planen |
| **Logget TSS** | Din faktiske TSS (grøn badge hvis logget) |
| **CTL/ATL/TSB** | Beregnede værdier for den dag |
| **+/✏️** | Klik for at logge eller redigere dagen |

Farver i tabellen:
- 🟤 **Brun** = bjerg/race dag
- **Nedtonet** = fridag
- 🟢 **Mørkegrøn** = logget træning

---

## ✍️ Log dine træninger

### Automatisk pop-up

Hver dag du åbner appen vises automatisk en pop-up for dagens dato (hvis ikke allerede logget). Den viser:
- Den planlagte session og TSS
- Et felt til at skrive din faktiske TSS
- Et notefelt (valgfrit)

Klik **Gem ✓** for at gemme, eller **Spring over** for at bruge plan-TSS.

### Manuel logning

1. Gå til **Dag-for-dag plan**
2. Find den dato du vil logge
3. Klik **+** (eller **✏️** hvis allerede logget)
4. Indtast faktisk TSS og evt. en note
5. Klik **Gem ✓**

Loggede træninger påvirker CTL/ATL/TSB-beregningen fra den dato og frem.

### Se alle loggede træninger

Klik på **Loggede træninger** fanen for en oversigt over alle dine loggede dage, sorteret med nyeste øverst.

---

## 📥 Importer fra Garmin / Intervals.icu / Strava

I stedet for at logge manuelt kan du importere dine træninger direkte fra en CSV-fil.

Klik **📥 Importer træninger** øverst til højre (eller i Loggede træninger-fanen).

### Intervals.icu

1. Gå til **intervals.icu** og log ind
2. Klik **Aktiviteter** i venstre menu
3. Klik **⋮** øverst til højre → **Eksporter CSV**
4. Upload filen i appen

### Garmin Connect

1. Gå til **connect.garmin.com**
2. Klik **Aktiviteter** → vælg datointerval
3. Klik **Eksporter CSV** øverst til højre
4. Upload filen i appen

### Strava

1. Gå til **strava.com** → Indstillinger
2. Klik **Mit konto** → **Download eller slet dine data**
3. Pak ZIP-filen ud og find **activities.csv**
4. Upload filen i appen
> ⚠️ TSS kræver Strava Premium

### Simpel CSV (manuel)

Du kan også lave en simpel tekstfil med Excel eller Notesblok:

```
date,tss
2025-06-01,75
2025-06-02,0
2025-06-03,95
```

Gem filen som `.csv` og upload den i appen.

### Vælg importstrategi

Når du har valgt en fil får du to muligheder:
- **Overskriv eksisterende** — erstatter dage der allerede er logget
- **Behold eksisterende** — springer dage over der allerede er logget

---

## 📱 Gem til hjemmeskærm (iPhone)

Du kan bruge appen som en rigtig app på din iPhone:

1. Åbn **https://skndkprivat.github.io/Form-Tracker/** i Safari
2. Tryk på **Del-ikonet** (firkant med pil op) nederst
3. Vælg **Føj til hjemmeskærm**
4. Tryk **Tilføj**

Appen åbner nu i fuld skærm uden browserens adresselinje — ligesom en rigtig app.

> **NB:** Data gemmes lokalt i den browser/app du bruger. Data på iPhone og PC deles ikke automatisk. Brug CSV-import til at synkronisere data mellem enheder.

---

## 🛠️ Opdater koden

Når der er ændringer i koden:

```bash
cd C:\Tools\Form-Tracker
git add .
git commit -m "Beskrivelse af ændring"
git push
```

GitHub Actions bygger og deployer automatisk inden for ~1 minut.

---

## 🔧 Teknisk stack

- **React 18** + **Vite** — frontend framework og build tool
- **Recharts** — grafer
- **Firebase Authentication** — Google login
- **localStorage** — lokal datalagring
- **GitHub Pages** — hosting (gratis)
- **GitHub Actions** — automatisk build og deploy

---

*Lavet med Claude · Sidst opdateret Juni 2026*
