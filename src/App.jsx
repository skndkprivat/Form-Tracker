import { useState, useMemo, useEffect, useRef } from "react";
import { useAuth, LoginScreen, UserBadge } from "./LoginScreen.jsx";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ReferenceLine, ResponsiveContainer
} from "recharts";

const addDays = (d, n) => { const r = new Date(d); r.setDate(r.getDate() + n); return r; };
const fmtDate = (d) => d.toLocaleDateString("da-DK", { weekday: "short", day: "numeric", month: "short" });
const isoDate = (d) => d.toISOString().slice(0, 10);
const todayIso = () => isoDate(new Date());
const WEEKDAYS = ["søn", "man", "tirs", "ons", "tors", "fre", "lør"];
const LS  = (k, fb) => { try { const v = localStorage.getItem(k); return v ? JSON.parse(v) : fb; } catch { return fb; } };
const LSset = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch {} };

const MOUNTAIN_PRESETS = [
  { id: 1, name: "VEN-TOP",          date: "2025-05-25", tss: 150, color: "#f97316" },
  { id: 2, name: "Cykelnerven dag 1", date: "2025-06-11", tss: 180, color: "#8b5cf6" },
  { id: 3, name: "Cykelnerven dag 2", date: "2025-06-12", tss: 170, color: "#8b5cf6" },
  { id: 4, name: "Cykelnerven dag 3", date: "2025-06-13", tss: 160, color: "#8b5cf6" },
];

const DEFAULT_PLAN = [
  { label: "Let Z2", tss: 40 },          { label: "Fri 🛌",               tss: 0  },
  { label: "Spin-off Z2 let", tss: 55 }, { label: "Z2 + 2×15 sweet spot", tss: 80 },
  { label: "Fri 🚫", tss: 0 },           { label: "Z2 lang 2,5t",         tss: 90 },
  { label: "Tærskel 3×10", tss: 70 },    { label: "Z2 let",                tss: 50 },
  { label: "Sim-tur bjerg-pace",tss:130 },{ label: "Z2 + spin",             tss: 55 },
  { label: "5×5 min @ 175W", tss: 75 },  { label: "Fri 🚫",                tss: 0  },
  { label: "Tærskel 2×12", tss: 55 },    { label: "Z2 let 1t",             tss: 45 },
  { label: "Opener 3×2 min", tss: 50 },  { label: "Z2 let 45m",            tss: 35 },
  { label: "Opener 3×1 min", tss: 25 },  { label: "Rejse 🚐",              tss: 0  },
  { label: "Race dag 1 🏔️", tss: 0 },    { label: "Race dag 2 🏔️",        tss: 0  },
  { label: "Race dag 3 🏔️", tss: 0 },    { label: "Race dag 4 🏔️",        tss: 0  },
];

function parseCSV(text) {
  const lines = text.trim().split(/\r?\n/);
  if (lines.length < 2) return { rows: [], format: "ukendt" };
  const header = lines[0].toLowerCase();
  const cols = header.split(/[,;]/).map(c => c.trim().replace(/"/g, ""));
  const idxDate = cols.findIndex(c => c === "date" || c === "start_date_local");
  const idxTSS  = cols.findIndex(c => c === "training load" || c === "icu_training_load" || c === "tss" || c === "training stress score");
  const idxName = cols.findIndex(c => c === "name" || c === "activity name" || c === "title");
  if (idxDate !== -1 && idxTSS !== -1) {
    const rows = [];
    for (let i = 1; i < lines.length; i++) {
      const cells = splitCSVLine(lines[i]);
      const date = normalizeDate(cells[idxDate]?.replace(/"/g, "").trim());
      const tss  = parseFloat(cells[idxTSS]?.replace(/"/g, "").trim());
      const name = idxName !== -1 ? cells[idxName]?.replace(/"/g, "").trim() : "";
      if (date && !isNaN(tss)) rows.push({ date, tss: Math.round(tss), name: name || "Importeret" });
    }
    return { rows, format: "intervals.icu / Strava CSV" };
  }
  const idxGDate = cols.findIndex(c => c === "date");
  const idxGTSS  = cols.findIndex(c => c.includes("training stress"));
  const idxGName = cols.findIndex(c => c === "title" || c === "activity name" || c === "name");
  if (idxGDate !== -1 && idxGTSS !== -1) {
    const rows = [];
    for (let i = 1; i < lines.length; i++) {
      const cells = splitCSVLine(lines[i]);
      const date = normalizeDate(cells[idxGDate]?.replace(/"/g, "").trim());
      const tss  = parseFloat(cells[idxGTSS]?.replace(/"/g, "").trim().replace(",", "."));
      const name = idxGName !== -1 ? cells[idxGName]?.replace(/"/g, "").trim() : "";
      if (date && !isNaN(tss) && tss > 0) rows.push({ date, tss: Math.round(tss), name: name || "Garmin aktivitet" });
    }
    return { rows, format: "Garmin Connect CSV" };
  }
  const idxFDate = cols.findIndex(c => c.includes("date") || c.includes("dato"));
  const idxFTSS  = cols.findIndex(c => c.includes("tss") || c.includes("load") || c.includes("stress"));
  if (idxFDate !== -1 && idxFTSS !== -1) {
    const rows = [];
    for (let i = 1; i < lines.length; i++) {
      const cells = splitCSVLine(lines[i]);
      const date = normalizeDate(cells[idxFDate]?.replace(/"/g, "").trim());
      const tss  = parseFloat(cells[idxFTSS]?.replace(/"/g, "").replace(",",".").trim());
      if (date && !isNaN(tss) && tss > 0) rows.push({ date, tss: Math.round(tss), name: "Importeret" });
    }
    return { rows, format: "Generisk CSV" };
  }
  return { rows: [], format: "ukendt" };
}

function splitCSVLine(line) {
  const result = []; let cur = "", inQ = false;
  for (const ch of line) {
    if (ch === '"') { inQ = !inQ; }
    else if ((ch === "," || ch === ";") && !inQ) { result.push(cur); cur = ""; }
    else cur += ch;
  }
  result.push(cur); return result;
}

function normalizeDate(raw) {
  if (!raw) return null;
  const iso = raw.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (iso) return `${iso[1]}-${iso[2]}-${iso[3]}`;
  const dmy = raw.match(/^(\d{1,2})[\/\-\.](\d{1,2})[\/\-\.](\d{4})/);
  if (dmy) return `${dmy[3]}-${dmy[2].padStart(2,"0")}-${dmy[1].padStart(2,"0")}`;
  const mdy = raw.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})/);
  if (mdy) return `${mdy[3]}-${mdy[1].padStart(2,"0")}-${mdy[2].padStart(2,"0")}`;
  return null;
}

function computeSeries(startCTL, startATL, startDate, planDays, mountains, restDays, logged) {
  const mountainMap = {};
  mountains.forEach(m => { mountainMap[m.date] = { tss: m.tss, name: m.name, color: m.color }; });
  const lastMountainDate = mountains.length ? mountains.reduce((max, m) => m.date > max ? m.date : max, mountains[0].date) : null;
  const startIso = isoDate(startDate);
  let totalDays = planDays.length;
  if (lastMountainDate && lastMountainDate > startIso) {
    const diff = Math.round((new Date(lastMountainDate + "T12:00:00") - new Date(startIso + "T12:00:00")) / 86400000);
    totalDays = Math.max(totalDays, diff + 1);
  }
  let ctl = startCTL, atl = startATL;
  return Array.from({ length: totalDays }, (_, i) => {
    const d = addDays(startDate, i);
    const iso = isoDate(d);
    const isRestDay = restDays.includes(d.getDay());
    const mtn = mountainMap[iso];
    const planDay = planDays[i] || { label: isRestDay ? "Fri 🚫" : "Z2 træning", tss: isRestDay ? 0 : 50 };
    const logEntry = logged[iso];
    let tss, planTss;
    if (mtn)            { planTss = mtn.tss;    tss = logEntry ? logEntry.tss : mtn.tss; }
    else if (isRestDay) { planTss = 0;           tss = 0; }
    else                { planTss = planDay.tss; tss = logEntry ? logEntry.tss : planDay.tss; }
    ctl = ctl + (tss - ctl) / 42;
    atl = atl + (tss - atl) / 7;
    return {
      date: iso, label: fmtDate(d), planLabel: mtn ? "🏔️ " + mtn.name : planDay.label,
      planTss, tss, logged: !!logEntry, logNote: logEntry?.note || "",
      ctl: +ctl.toFixed(1), atl: +atl.toFixed(1), tsb: +(ctl - atl).toFixed(1),
      isMountain: !!mtn, mountainName: mtn?.name || null, mountainColor: mtn?.color || null,
    };
  });
}

function ImportModal({ onImport, onClose }) {
  const [step, setStep] = useState("choose");
  const [format, setFormat] = useState("");
  const [preview, setPreview] = useState([]);
  const [error, setError] = useState("");
  const [mergeMode, setMergeMode] = useState("overwrite");
  const [importedCount, setImportedCount] = useState(0);
  const fileRef = useRef();
  const handleFile = (e) => {
    const file = e.target.files[0]; if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const { rows, format: fmt } = parseCSV(ev.target.result);
      if (rows.length === 0) { setError(`Kunne ikke læse TSS-data.\nFormat: ${fmt}`); setStep("choose"); }
      else { setFormat(fmt); setPreview(rows.slice(0, 200)); setError(""); setStep("preview"); }
    };
    reader.readAsText(file, "utf-8");
  };
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal import-modal" onClick={e => e.stopPropagation()}>
        {step === "choose" && (<>
          <div className="import-header"><span className="import-badge">📥 Importer træninger</span></div>
          {error && <div className="import-error"><pre>{error}</pre></div>}
          <div className="import-sources">
            {[["🟣 Intervals.icu","intervals.icu → Aktiviteter → ⋮ → Eksporter CSV"],
              ["🔵 Garmin Connect","connect.garmin.com → Aktiviteter → Eksporter CSV"],
              ["🟠 Strava","strava.com → Indstillinger → Download dine data → activities.csv"]
            ].map(([title, desc]) => (
              <div key={title} className="import-source-card">
                <div className="import-source-title">{title}</div>
                <div style={{color:"#94a3b8",fontSize:12}}>{desc}</div>
              </div>
            ))}
          </div>
          <div className="import-manual-note">💡 Eller lav en simpel CSV med kolonner: <code>date,tss</code></div>
          <label className="btn-file-upload">📂 Vælg CSV-fil<input ref={fileRef} type="file" accept=".csv,.txt" onChange={handleFile} style={{display:"none"}} /></label>
          <button className="btn-cancel" onClick={onClose}>Annuller</button>
        </>)}
        {step === "preview" && (<>
          <div className="import-header"><span className="import-badge">📥 Forhåndsvisning</span><span className="import-format">{format}</span></div>
          <div className="import-stats"><strong>{preview.length}</strong> træninger fundet</div>
          <div className="import-merge">
            <label className="merge-opt"><input type="radio" name="merge" value="overwrite" checked={mergeMode==="overwrite"} onChange={()=>setMergeMode("overwrite")} />Overskriv eksisterende</label>
            <label className="merge-opt"><input type="radio" name="merge" value="keep" checked={mergeMode==="keep"} onChange={()=>setMergeMode("keep")} />Behold eksisterende</label>
          </div>
          <div className="import-preview-list">
            {preview.slice(0,8).map((r,i) => <div key={i} className="import-preview-row"><span className="ipr-date">{r.date}</span><span className="ipr-name">{r.name}</span><span className="ipr-tss">{r.tss} TSS</span></div>)}
            {preview.length > 8 && <div className="import-preview-more">... og {preview.length-8} flere</div>}
          </div>
          <div className="modal-btns">
            <button className="btn-save" onClick={() => { setImportedCount(preview.length); onImport(preview, mergeMode); setStep("done"); }}>Importer {preview.length}</button>
            <button className="btn-cancel" onClick={() => setStep("choose")}>← Tilbage</button>
          </div>
        </>)}
        {step === "done" && (<>
          <div className="import-done"><div className="import-done-icon">✅</div><div className="import-done-title">{importedCount} importeret</div><div className="import-done-sub">CTL/ATL/TSB opdateret</div></div>
          <button className="btn-save" onClick={onClose}>Luk</button>
        </>)}
      </div>
    </div>
  );
}

function LogModal({ row, onSave, onSkip }) {
  const [tss, setTss] = useState(String(row.planTss || 0));
  const [note, setNote] = useState(row.logNote || "");
  return (
    <div className="modal-overlay">
      <div className="modal log-modal">
        <div className="log-modal-header"><span className="log-badge">📋 Log træning</span><span className="log-date">{row.label}</span></div>
        <div className="log-plan-box">
          <div className="log-plan-label">Planlagt session</div>
          <div className="log-plan-name">{row.planLabel}</div>
          <div className="log-plan-tss">Plan TSS: <strong>{row.planTss || "—"}</strong></div>
        </div>
        <label className="log-field"><span>Faktisk TSS</span><input type="text" inputMode="decimal" value={tss} onChange={e => setTss(e.target.value)} autoFocus /></label>
        <label className="log-field"><span>Note (valgfri)</span><input type="text" value={note} onChange={e => setNote(e.target.value)} placeholder="Føltes godt..." /></label>
        <div className="modal-btns">
          <button className="btn-save" onClick={() => { const n = parseFloat(tss.replace(",",".")); onSave({ tss: isNaN(n)?0:n, note }); }}>Gem ✓</button>
          <button className="btn-skip" onClick={onSkip}>Spring over</button>
        </div>
      </div>
    </div>
  );
}

function MountainModal({ mountain, onSave, onClose }) {
  const [form, setForm] = useState({ ...mountain });
  const set = (k, v) => setForm(p => ({ ...p, [k]: v }));
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <h3>✏️ {mountain.id ? "Rediger bjerg" : "Nyt bjerg"}</h3>
        <label>Navn<input value={form.name} onChange={e => set("name", e.target.value)} /></label>
        <label>Dato<input type="date" value={form.date} onChange={e => set("date", e.target.value)} /></label>
        <label>TSS<input type="text" inputMode="decimal" value={form.tss} onChange={e => set("tss", e.target.value)} onBlur={e => { const n = parseFloat(String(e.target.value).replace(",",".")); if (!isNaN(n)) set("tss", n); }} /></label>
        <label>Farve<input type="color" value={form.color} onChange={e => set("color", e.target.value)} /></label>
        <div className="modal-btns"><button className="btn-save" onClick={() => onSave(form)}>Gem</button><button className="btn-cancel" onClick={onClose}>Annuller</button></div>
      </div>
    </div>
  );
}

function ChartTooltip({ active, payload }) {
  if (!active || !payload?.length) return null;
  const d = payload[0]?.payload;
  return (
    <div className="chart-tooltip">
      <div className="tt-date">{d?.label}{d?.logged ? " ✓" : ""}</div>
      {d?.isMountain && <div style={{color:d.mountainColor}}>🏔️ {d.mountainName}</div>}
      <div style={{color:"#94a3b8",fontSize:11}}>TSS: {d?.tss}{d?.logNote ? ` · ${d.logNote}` : ""}</div>
      {payload.map(p => <div key={p.dataKey} style={{color:p.color}}>{p.name}: <strong>{p.value}</strong></div>)}
    </div>
  );
}

// ─── Auth wrapper — ingen hooks efter tidlige returns ────────────────────────
export default function FormTracker() {
  const user = useAuth();
  if (user === undefined) return (
    <div style={{minHeight:"100vh",background:"#0a0f1e",display:"flex",alignItems:"center",justifyContent:"center",color:"#64748b",fontFamily:"Inter,system-ui,sans-serif",fontSize:16}}>
      Indlæser...
    </div>
  );
  if (!user) return <LoginScreen />;
  return <AppInner user={user} />;
}

// ─── Hoved-app — alle hooks her ──────────────────────────────────────────────
function AppInner({ user }) {
  const [ftp,          setFtp]          = useState(() => LS("ft_ftp", 180));
  const [weight,       setWeight]       = useState(() => LS("ft_weight", 77));
  const [bikeKg,       setBikeKg]       = useState(() => LS("ft_bikeKg", 8.5));
  const [bottles,      setBottles]      = useState(() => LS("ft_bottles", 2));
  const [extraKg,      setExtraKg]      = useState(() => LS("ft_extraKg", 0.7));
  const [startCTL,     setStartCTL]     = useState(() => LS("ft_startCTL", 67.3));
  const [startATL,     setStartATL]     = useState(() => LS("ft_startATL", 67.4));
  const [startDateStr, setStartDateStr] = useState(() => LS("ft_startDate", "2025-05-22"));
  const [restDays,     setRestDays]     = useState(() => LS("ft_restDays", [3]));
  const [mountains,    setMountains]    = useState(() => LS("ft_mountains", MOUNTAIN_PRESETS));
  const [logged,       setLogged]       = useState(() => LS("ft_logged", {}));
  const [editingMountain, setEditingMountain] = useState(null);
  const [showAddModal,    setShowAddModal]    = useState(false);
  const [logModal,        setLogModal]        = useState(null);
  const [showImport,      setShowImport]      = useState(false);
  const [activeTab,       setActiveTab]       = useState("chart");
  const [saveMsg,         setSaveMsg]         = useState("");

  useEffect(() => { LSset("ft_ftp",       ftp);          }, [ftp]);
  useEffect(() => { LSset("ft_weight",    weight);       }, [weight]);
  useEffect(() => { LSset("ft_bikeKg",    bikeKg);       }, [bikeKg]);
  useEffect(() => { LSset("ft_bottles",   bottles);      }, [bottles]);
  useEffect(() => { LSset("ft_extraKg",   extraKg);      }, [extraKg]);
  useEffect(() => { LSset("ft_startCTL",  startCTL);     }, [startCTL]);
  useEffect(() => { LSset("ft_startATL",  startATL);     }, [startATL]);
  useEffect(() => { LSset("ft_startDate", startDateStr); }, [startDateStr]);
  useEffect(() => { LSset("ft_restDays",  restDays);     }, [restDays]);
  useEffect(() => { LSset("ft_mountains", mountains);    }, [mountains]);
  useEffect(() => { LSset("ft_logged",    logged);       }, [logged]);

  const startDate    = useMemo(() => new Date(startDateStr + "T12:00:00"), [startDateStr]);
  const systemWeight = weight + bikeKg + bottles * 0.75 + extraKg;
  const series       = useMemo(() => computeSeries(startCTL, startATL, startDate, DEFAULT_PLAN, mountains, restDays, logged), [startCTL, startATL, startDate, mountains, restDays, logged]);

  useEffect(() => {
    const today = todayIso();
    if (logged[today] !== undefined) return;
    const row = series.find(s => s.date === today);
    if (row && !row.isMountain) { const t = setTimeout(() => setLogModal(row), 600); return () => clearTimeout(t); }
  }, []);

  const sortedMountains = [...mountains].sort((a,b) => a.date.localeCompare(b.date));
  const lastMountain    = sortedMountains[sortedMountains.length - 1];
  const raceRow         = series.find(s => s.date === lastMountain?.date) || series[series.length - 1];
  const todayRow        = series.find(s => s.date === todayIso()) || series[0];
  const toggleRestDay   = d => setRestDays(prev => prev.includes(d) ? prev.filter(x => x !== d) : [...prev, d]);
  const saveLog = (date, entry) => { setLogged(prev => ({ ...prev, [date]: entry })); setLogModal(null); setSaveMsg("Gemt ✓"); setTimeout(() => setSaveMsg(""), 2000); };
  const deleteLog = date => setLogged(prev => { const n = { ...prev }; delete n[date]; return n; });
  const handleImport = (rows, mode) => {
    setLogged(prev => {
      const next = { ...prev };
      rows.forEach(r => { if (mode === "keep" && next[r.date]) return; next[r.date] = { tss: r.tss, note: r.name !== "Importeret" ? r.name : "" }; });
      return next;
    });
    setSaveMsg(`${rows.length} træninger importeret ✓`); setTimeout(() => setSaveMsg(""), 3000);
  };
  const saveMountain   = m => { setMountains(prev => prev.map(p => p.id === m.id ? { ...m, tss: +m.tss } : p)); setEditingMountain(null); };
  const addMountain    = m => { setMountains(prev => [...prev, { ...m, id: Date.now(), tss: +m.tss }]); setShowAddModal(false); };
  const deleteMountain = id => setMountains(prev => prev.filter(m => m.id !== id));
  const newMountainTemplate = { id: null, name: "Nyt bjerg", date: isoDate(new Date()), tss: 120, color: "#06b6d4" };

  return (
    <div className="app">
      <style>{CSS}</style>
      <header>
        <div className="header-top">
          <div className="header-title">
            <span className="pill">Form-tracker</span>
            <h1>Mod Alperne 🏔️</h1>
            <p className="subtitle">FTP · CTL · ATL · TSB — planlæg din form mod næste begivenhed</p>
          </div>
          <div style={{display:"flex",gap:10,alignItems:"center",flexWrap:"wrap"}}>
            <UserBadge user={user} />
            <button className="btn-import-header" onClick={() => setShowImport(true)}>📥 Importer træninger</button>
          </div>
        </div>
        <div className="stats-row">
          <Stat label="W/kg krop"   value={(ftp/weight).toFixed(2)}       sub={`${ftp}W / ${weight}kg`} />
          <Stat label="W/kg system" value={(ftp/systemWeight).toFixed(2)} sub="inkl. cykel + dunke" />
          <Stat label="TSB i dag"   value={(todayRow?.tsb >= 0 ? "+" : "") + todayRow?.tsb} color={todayRow?.tsb > 5 ? "#4ade80" : todayRow?.tsb < -5 ? "#f87171" : "#facc15"} sub="form" />
          <Stat label="TSB race"    value={(raceRow?.tsb >= 0 ? "+" : "") + raceRow?.tsb} color="#4ade80" sub={raceRow?.label} />
        </div>
        {saveMsg && <div className="save-toast">{saveMsg}</div>}
      </header>

      <main>
        <section className="card">
          <h2>Min profil <span className="auto-save-note">· gemmes automatisk</span></h2>
          <div className="grid-4">
            <Field label="FTP (W)"        value={ftp}          onChange={setFtp}          type="number" />
            <Field label="Vægt (kg)"      value={weight}       onChange={setWeight}       type="number" />
            <Field label="Cykel (kg)"     value={bikeKg}       onChange={setBikeKg}       type="number" />
            <Field label="Dunke (×750ml)" value={bottles}      onChange={setBottles}      type="number" />
            <Field label="Udstyr (kg)"    value={extraKg}      onChange={setExtraKg}      type="number" />
            <Field label="Start CTL"      value={startCTL}     onChange={setStartCTL}     type="number" />
            <Field label="Start ATL"      value={startATL}     onChange={setStartATL}     type="number" />
            <Field label="Start dato"     value={startDateStr} onChange={setStartDateStr} type="date"   />
          </div>
          <div className="rest-days">
            <label className="rest-label">Faste fridage</label>
            <div className="day-btns">
              {WEEKDAYS.map((name, i) => <button key={i} className={"day-btn"+(restDays.includes(i)?" active":"")} onClick={() => toggleRestDay(i)}>{name}</button>)}
            </div>
          </div>
        </section>

        <section className="card">
          <div className="section-header">
            <h2>🏔️ Mine bjerge</h2>
            <button className="btn-add" onClick={() => setShowAddModal(true)}>+ Tilføj bjerg</button>
          </div>
          <div className="mountains-grid">
            {sortedMountains.map(m => (
              <div key={m.id} className="mountain-card" style={{borderLeft:`4px solid ${m.color}`}}>
                <div className="mountain-info">
                  <span className="mountain-name">{m.name}</span>
                  <span className="mountain-date">{new Date(m.date+"T12:00:00").toLocaleDateString("da-DK",{day:"numeric",month:"long",year:"numeric"})}</span>
                  <span className="mountain-tss">TSS: <strong>{m.tss}</strong></span>
                </div>
                <div className="mountain-actions">
                  <button className="btn-edit" onClick={() => setEditingMountain(m)}>✏️</button>
                  <button className="btn-delete" onClick={() => deleteMountain(m.id)}>🗑️</button>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="card">
          <div className="tabs">
            <button className={"tab"+(activeTab==="chart"?" active":"")} onClick={()=>setActiveTab("chart")}>Formkurve</button>
            <button className={"tab"+(activeTab==="plan" ?" active":"")} onClick={()=>setActiveTab("plan")}>Dag-for-dag plan</button>
            <button className={"tab"+(activeTab==="log"  ?" active":"")} onClick={()=>setActiveTab("log")}>Loggede træninger <span className="log-count">{Object.keys(logged).length}</span></button>
          </div>

          {activeTab === "chart" && (<>
            <div className="chart-legend-desc">Blå = CTL · Rød = ATL · Grøn = TSB · ✓ = logget</div>
            <div style={{height:320}}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={series} margin={{top:8,right:16,bottom:0,left:-8}}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                  <XAxis dataKey="label" tick={{fill:"#64748b",fontSize:10}} interval={2} />
                  <YAxis tick={{fill:"#64748b",fontSize:11}} />
                  <Tooltip content={<ChartTooltip />} />
                  {sortedMountains.map(m => { const row = series.find(s => s.date === m.date); return row ? <ReferenceLine key={m.id} x={row.label} stroke={m.color} strokeDasharray="4 2" label={{value:"🏔️ "+m.name,fill:m.color,fontSize:10,position:"top"}} /> : null; })}
                  <Line type="monotone" dataKey="ctl" stroke="#60a5fa" strokeWidth={2} dot={false} name="CTL" />
                  <Line type="monotone" dataKey="atl" stroke="#f87171" strokeWidth={2} dot={false} name="ATL" />
                  <Line type="monotone" dataKey="tsb" stroke="#4ade80" strokeWidth={2} dot={false} name="TSB" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </>)}

          {activeTab === "plan" && (
            <div className="table-wrap">
              <table>
                <thead><tr><th>Dato</th><th>Session</th><th>Plan TSS</th><th>Logget TSS</th><th>CTL</th><th>ATL</th><th>TSB</th><th></th></tr></thead>
                <tbody>
                  {series.map((row, i) => (
                    <tr key={i} className={row.isMountain?"row-mountain":row.tss===0?"row-rest":row.logged?"row-logged":""}>
                      <td className="td-date">{row.label}</td>
                      <td>{row.isMountain ? <span style={{color:row.mountainColor}}>🏔️ {row.mountainName}</span> : row.planLabel}</td>
                      <td>{row.planTss||"—"}</td>
                      <td className="td-logged">{row.logged ? <span className="logged-badge">{row.tss} ✓{row.logNote ? ` · ${row.logNote.slice(0,20)}` : ""}</span> : <span className="not-logged">—</span>}</td>
                      <td>{row.ctl}</td><td>{row.atl}</td>
                      <td className={"td-tsb "+(row.tsb>5?"pos":row.tsb<-5?"neg":"")}>{row.tsb>=0?"+":""}{row.tsb}</td>
                      <td><button className="btn-log-row" onClick={() => setLogModal(row)}>{row.logged?"✏️":"+"}</button></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {activeTab === "log" && (
            <div>
              <div className="log-toolbar">
                <span className="log-toolbar-count">{Object.keys(logged).length} træninger logget</span>
                <button className="btn-import-sm" onClick={() => setShowImport(true)}>📥 Importer CSV</button>
              </div>
              {Object.keys(logged).length === 0
                ? <div className="empty-log">Ingen loggede træninger. Klik "Importer CSV" eller brug + i plan-tabellen.</div>
                : <div className="log-list">
                    {Object.entries(logged).sort((a,b) => b[0].localeCompare(a[0])).map(([date, entry]) => {
                      const row = series.find(s => s.date === date);
                      return (
                        <div key={date} className="log-entry">
                          <div className="log-entry-left">
                            <span className="log-entry-date">{row ? row.label : date}</span>
                            <span className="log-entry-session">{row?.planLabel || "Træning"}</span>
                            {entry.note && <span className="log-entry-note">"{entry.note}"</span>}
                          </div>
                          <div className="log-entry-right">
                            <span className="log-entry-tss">{entry.tss} TSS</span>
                            <button className="btn-delete" onClick={() => deleteLog(date)}>🗑️</button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
              }
            </div>
          )}
        </section>
      </main>

      {logModal         && <LogModal row={logModal} onSave={e => saveLog(logModal.date, e)} onSkip={() => saveLog(logModal.date, {tss:logModal.planTss||0,note:""})} />}
      {editingMountain  && <MountainModal mountain={editingMountain} onSave={saveMountain} onClose={() => setEditingMountain(null)} />}
      {showAddModal     && <MountainModal mountain={newMountainTemplate} onSave={addMountain} onClose={() => setShowAddModal(false)} />}
      {showImport       && <ImportModal onImport={handleImport} onClose={() => setShowImport(false)} />}
    </div>
  );
}

function Stat({ label, value, sub, color }) {
  return <div className="stat"><div className="stat-value" style={color?{color}:{}}>{value}</div><div className="stat-label">{label}</div><div className="stat-sub">{sub}</div></div>;
}

function Field({ label, value, onChange, type = "text" }) {
  const [raw, setRaw] = useState(String(value));
  const [focused, setFocused] = useState(false);
  const displayVal = focused ? raw : (type === "number" ? String(value) : value);
  if (type !== "number") return <label className="field"><span>{label}</span><input type={type} value={value} onChange={e => onChange(e.target.value)} /></label>;
  return (
    <label className="field"><span>{label}</span>
      <input type="text" inputMode="decimal" value={displayVal}
        onFocus={() => { setRaw(String(value)); setFocused(true); }}
        onBlur={() => { setFocused(false); const n = parseFloat(raw.replace(",",".")); if (!isNaN(n)) { onChange(n); setRaw(String(n)); } else setRaw(String(value)); }}
        onChange={e => setRaw(e.target.value)} />
    </label>
  );
}

const CSS = `
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  .app { min-height: 100vh; background: #0a0f1e; color: #e2e8f0; font-family: 'Inter', system-ui, sans-serif; font-size: 14px; }
  header { background: linear-gradient(135deg, #0f172a 0%, #1e1b4b 100%); border-bottom: 1px solid #1e293b; padding: 28px 20px 20px; position: relative; }
  .header-top { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 16px; }
  .pill { display: inline-block; background: #312e81; color: #a5b4fc; font-size: 11px; font-weight: 600; letter-spacing: .08em; text-transform: uppercase; padding: 3px 10px; border-radius: 99px; margin-bottom: 10px; }
  h1 { font-size: 26px; font-weight: 700; color: #f1f5f9; margin-bottom: 4px; }
  .subtitle { color: #64748b; font-size: 13px; }
  .btn-import-header { background: #164e63; color: #67e8f9; border: 1px solid #0e7490; border-radius: 9px; padding: 9px 16px; font-size: 13px; font-weight: 600; cursor: pointer; white-space: nowrap; }
  .btn-import-header:hover { background: #0e7490; }
  .stats-row { display: grid; grid-template-columns: repeat(4,1fr); gap: 12px; }
  @media(max-width:600px) { .stats-row { grid-template-columns: repeat(2,1fr); } .header-top { flex-direction: column; gap: 12px; } }
  .stat { background: #0f172a; border: 1px solid #1e293b; border-radius: 10px; padding: 12px 14px; }
  .stat-value { font-size: 22px; font-weight: 700; color: #a5b4fc; }
  .stat-label { font-size: 11px; color: #64748b; text-transform: uppercase; letter-spacing: .05em; margin-top: 2px; }
  .stat-sub { font-size: 11px; color: #475569; margin-top: 2px; }
  .save-toast { position: absolute; top: 16px; right: 20px; background: #166534; color: #bbf7d0; font-size: 13px; font-weight: 600; padding: 6px 14px; border-radius: 8px; }
  .auto-save-note { font-size: 11px; color: #475569; font-weight: 400; text-transform: none; }
  main { max-width: 900px; margin: 0 auto; padding: 20px 16px 48px; display: flex; flex-direction: column; gap: 20px; }
  .card { background: #0f172a; border: 1px solid #1e293b; border-radius: 14px; padding: 20px; }
  h2 { font-size: 16px; font-weight: 600; color: #cbd5e1; margin-bottom: 14px; }
  .grid-4 { display: grid; grid-template-columns: repeat(4,1fr); gap: 12px; }
  @media(max-width:600px) { .grid-4 { grid-template-columns: repeat(2,1fr); } }
  .field { display: flex; flex-direction: column; gap: 4px; }
  .field span { font-size: 11px; color: #64748b; text-transform: uppercase; letter-spacing: .05em; }
  .field input { background: #1e293b; border: 1px solid #334155; border-radius: 7px; color: #e2e8f0; padding: 7px 10px; font-size: 14px; width: 100%; }
  .field input:focus { outline: none; border-color: #6366f1; }
  .rest-days { margin-top: 16px; }
  .rest-label { font-size: 11px; color: #64748b; text-transform: uppercase; letter-spacing: .05em; display: block; margin-bottom: 8px; }
  .day-btns { display: flex; gap: 6px; flex-wrap: wrap; }
  .day-btn { background: #1e293b; border: 1px solid #334155; color: #94a3b8; border-radius: 6px; padding: 5px 11px; font-size: 12px; cursor: pointer; }
  .day-btn.active { background: #312e81; border-color: #6366f1; color: #a5b4fc; }
  .day-btn:hover { border-color: #6366f1; }
  .section-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 14px; }
  .section-header h2 { margin-bottom: 0; }
  .btn-add { background: #1e40af; color: #bfdbfe; border: none; border-radius: 7px; padding: 7px 14px; font-size: 13px; font-weight: 600; cursor: pointer; }
  .btn-add:hover { background: #1d4ed8; }
  .mountains-grid { display: flex; flex-direction: column; gap: 8px; }
  .mountain-card { display: flex; justify-content: space-between; align-items: center; background: #1e293b; border-radius: 9px; padding: 12px 14px; }
  .mountain-info { display: flex; flex-direction: column; gap: 2px; }
  .mountain-name { font-weight: 600; color: #e2e8f0; }
  .mountain-date { font-size: 12px; color: #64748b; }
  .mountain-tss { font-size: 12px; color: #94a3b8; }
  .mountain-actions { display: flex; gap: 8px; }
  .btn-edit, .btn-delete { background: none; border: none; font-size: 16px; cursor: pointer; padding: 4px; border-radius: 5px; }
  .btn-edit:hover { background: #334155; }
  .btn-delete:hover { background: #450a0a; }
  .tabs { display: flex; gap: 4px; margin-bottom: 16px; flex-wrap: wrap; }
  .tab { background: #1e293b; border: 1px solid #334155; color: #64748b; border-radius: 7px; padding: 7px 16px; font-size: 13px; cursor: pointer; }
  .tab.active { background: #1e1b4b; border-color: #6366f1; color: #a5b4fc; }
  .log-count { background: #1e40af; color: #bfdbfe; font-size: 11px; padding: 1px 6px; border-radius: 99px; margin-left: 5px; }
  .chart-legend-desc { font-size: 12px; color: #475569; margin-bottom: 12px; }
  .chart-tooltip { background: #0f172a; border: 1px solid #334155; border-radius: 8px; padding: 10px 14px; font-size: 12px; line-height: 1.7; }
  .table-wrap { overflow-x: auto; }
  table { width: 100%; border-collapse: collapse; font-size: 12px; }
  th { text-align: left; color: #64748b; padding: 7px 10px; border-bottom: 1px solid #1e293b; font-weight: 600; text-transform: uppercase; letter-spacing: .04em; font-size: 11px; }
  td { padding: 7px 10px; border-bottom: 1px solid #0f172a; color: #cbd5e1; }
  tr:hover td { background: #1e293b44; }
  .row-mountain td { background: #1c1917; }
  .row-rest td { opacity: .5; }
  .row-logged td { background: #052e16; }
  .td-date { color: #475569; white-space: nowrap; }
  .td-tsb.pos { color: #4ade80; font-weight: 700; }
  .td-tsb.neg { color: #f87171; font-weight: 700; }
  .logged-badge { background: #166534; color: #86efac; font-size: 11px; padding: 2px 7px; border-radius: 99px; font-weight: 600; }
  .not-logged { color: #334155; }
  .btn-log-row { background: #1e293b; border: 1px solid #334155; color: #94a3b8; border-radius: 5px; padding: 2px 8px; font-size: 13px; cursor: pointer; }
  .btn-log-row:hover { border-color: #6366f1; color: #a5b4fc; }
  .log-toolbar { display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px; }
  .log-toolbar-count { font-size: 12px; color: #64748b; }
  .btn-import-sm { background: #164e63; color: #67e8f9; border: 1px solid #0e7490; border-radius: 7px; padding: 5px 12px; font-size: 12px; font-weight: 600; cursor: pointer; }
  .btn-import-sm:hover { background: #0e7490; }
  .log-list { display: flex; flex-direction: column; gap: 8px; }
  .log-entry { display: flex; justify-content: space-between; align-items: center; background: #1e293b; border-radius: 9px; padding: 12px 14px; }
  .log-entry-left { display: flex; flex-direction: column; gap: 2px; }
  .log-entry-date { font-size: 11px; color: #64748b; }
  .log-entry-session { font-weight: 600; color: #e2e8f0; }
  .log-entry-note { font-size: 12px; color: #64748b; font-style: italic; }
  .log-entry-right { display: flex; align-items: center; gap: 12px; }
  .log-entry-tss { font-size: 18px; font-weight: 700; color: #4ade80; }
  .empty-log { color: #475569; font-size: 13px; padding: 20px 0; text-align: center; }
  .modal-overlay { position: fixed; inset: 0; background: #00000099; backdrop-filter: blur(4px); display: flex; align-items: center; justify-content: center; z-index: 100; padding: 16px; }
  .modal { background: #0f172a; border: 1px solid #334155; border-radius: 14px; padding: 24px; width: 340px; display: flex; flex-direction: column; gap: 14px; max-height: 90vh; overflow-y: auto; }
  .modal h3 { font-size: 17px; font-weight: 700; color: #e2e8f0; }
  .modal label { display: flex; flex-direction: column; gap: 5px; font-size: 12px; color: #64748b; text-transform: uppercase; letter-spacing: .05em; }
  .modal input[type=text], .modal input[type=date] { background: #1e293b; border: 1px solid #334155; border-radius: 7px; color: #e2e8f0; padding: 8px 10px; font-size: 14px; }
  .modal input[type=color] { width: 48px; height: 32px; border-radius: 6px; border: 1px solid #334155; cursor: pointer; }
  .modal input:focus { outline: none; border-color: #6366f1; }
  .modal-btns { display: flex; gap: 10px; margin-top: 4px; }
  .btn-save { flex: 1; background: #1e40af; color: #bfdbfe; border: none; border-radius: 7px; padding: 9px; font-size: 14px; font-weight: 600; cursor: pointer; }
  .btn-save:hover { background: #1d4ed8; }
  .btn-cancel, .btn-skip { flex: 1; background: #1e293b; color: #94a3b8; border: 1px solid #334155; border-radius: 7px; padding: 9px; font-size: 14px; cursor: pointer; }
  .btn-cancel:hover, .btn-skip:hover { background: #334155; }
  .log-modal { width: 380px; }
  .log-modal-header { display: flex; justify-content: space-between; align-items: center; }
  .log-badge { background: #1e3a5f; color: #7dd3fc; font-size: 12px; font-weight: 600; padding: 3px 10px; border-radius: 99px; }
  .log-date { font-size: 13px; color: #64748b; }
  .log-plan-box { background: #1e293b; border-radius: 9px; padding: 12px 14px; }
  .log-plan-label { font-size: 11px; color: #64748b; text-transform: uppercase; letter-spacing: .05em; margin-bottom: 4px; }
  .log-plan-name { font-size: 15px; font-weight: 600; color: #e2e8f0; margin-bottom: 4px; }
  .log-plan-tss { font-size: 12px; color: #94a3b8; }
  .log-field { display: flex; flex-direction: column; gap: 5px; font-size: 12px; color: #64748b; text-transform: uppercase; letter-spacing: .05em; }
  .log-field input { background: #1e293b; border: 1px solid #334155; border-radius: 7px; color: #e2e8f0; padding: 8px 10px; font-size: 15px; font-weight: 600; }
  .log-field input:focus { outline: none; border-color: #6366f1; }
  .import-modal { width: 480px; max-width: 100%; }
  .import-header { display: flex; justify-content: space-between; align-items: center; }
  .import-badge { background: #164e63; color: #67e8f9; font-size: 12px; font-weight: 600; padding: 3px 12px; border-radius: 99px; }
  .import-format { font-size: 12px; color: #4ade80; }
  .import-sources { display: flex; flex-direction: column; gap: 10px; }
  .import-source-card { background: #1e293b; border-radius: 10px; padding: 14px; }
  .import-source-title { font-size: 14px; font-weight: 700; color: #e2e8f0; margin-bottom: 6px; }
  .import-manual-note { background: #1c1f2e; border: 1px solid #334155; border-radius: 8px; padding: 10px 14px; font-size: 12px; color: #64748b; }
  .import-manual-note code { background: #334155; color: #67e8f9; padding: 1px 5px; border-radius: 4px; font-size: 11px; }
  .btn-file-upload { display: block; background: #0e7490; color: #cffafe; border: none; border-radius: 9px; padding: 12px; font-size: 14px; font-weight: 700; cursor: pointer; text-align: center; }
  .btn-file-upload:hover { background: #0891b2; }
  .import-error { background: #450a0a; border: 1px solid #7f1d1d; border-radius: 8px; padding: 12px; }
  .import-error pre { font-size: 11px; color: #fca5a5; white-space: pre-wrap; }
  .import-stats { font-size: 13px; color: #94a3b8; }
  .import-stats strong { color: #4ade80; font-size: 18px; }
  .import-merge { display: flex; flex-direction: column; gap: 8px; }
  .merge-opt { display: flex; align-items: center; gap: 8px; font-size: 13px; color: #94a3b8; text-transform: none; letter-spacing: 0; cursor: pointer; }
  .merge-opt input { width: auto; }
  .import-preview-list { background: #1e293b; border-radius: 9px; padding: 8px; display: flex; flex-direction: column; gap: 4px; max-height: 180px; overflow-y: auto; }
  .import-preview-row { display: flex; gap: 10px; align-items: center; padding: 4px 6px; border-radius: 5px; }
  .import-preview-row:hover { background: #334155; }
  .ipr-date { font-size: 12px; color: #64748b; width: 90px; flex-shrink: 0; }
  .ipr-name { font-size: 12px; color: #cbd5e1; flex: 1; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
  .ipr-tss { font-size: 13px; font-weight: 700; color: #4ade80; width: 60px; text-align: right; flex-shrink: 0; }
  .import-preview-more { font-size: 12px; color: #475569; padding: 4px 6px; }
  .import-done { display: flex; flex-direction: column; align-items: center; gap: 8px; padding: 16px 0; }
  .import-done-icon { font-size: 40px; }
  .import-done-title { font-size: 18px; font-weight: 700; color: #4ade80; }
  .import-done-sub { font-size: 13px; color: #64748b; text-align: center; }
`;
