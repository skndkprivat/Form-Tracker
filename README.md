# 🏔️ Form-Tracker

CTL/ATL/TSB form-tracker til cykeltræning — bygget med React + Recharts.

**Live app:** https://skndkprivat.github.io/Form-Tracker/

## Funktioner
- CTL/ATL/TSB beregning med 42/7-dages eksponentielle gennemsnit
- Redigerbare bjerge/events med dato, TSS og farve
- Import af træninger fra Intervals.icu, Garmin Connect og Strava CSV
- Manuel logning af daglige træninger med noter
- W/kg beregning (krop og system)
- Alt gemmes automatisk i localStorage

## Lokal udvikling
```bash
npm install
npm run dev
```

## Deploy
Push til `main` → GitHub Actions bygger og deployer automatisk til GitHub Pages.
