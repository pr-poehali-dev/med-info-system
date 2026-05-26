import React, { useState } from "react";
import Icon from "@/components/ui/icon";
import { fmtRub } from "@/lib/format";
import { MONTHS_PLAN, MONTH_PLANS_2026 } from "@/lib/plans";

// ─── Врачи и специализации из МИС ────────────────────────────────────────────
const MIS_SPECIALIZATIONS = [
  { key: "therapist", label: "Терапевт",       color: "#1a9cbe" },
  { key: "uzi",       label: "УЗИ-специалист", color: "#20a869" },
  { key: "cardio",    label: "Кардиолог",       color: "#e67e22" },
  { key: "gyneco",    label: "Гинеколог",       color: "#9b59b6" },
  { key: "surgeon",   label: "Хирург",          color: "#c0392b" },
];

const MIS_DOCTORS_BY_SPEC: Record<string, { name: string; shortName: string }[]> = {
  therapist: [{ name: "Петров Андрей Викторович",  shortName: "Петров А.В."  }],
  uzi:       [{ name: "Белова Наталья Ивановна",   shortName: "Белова Н.И."  }],
  cardio:    [{ name: "Захаров Сергей Дмитриевич", shortName: "Захаров С.Д." }],
  gyneco:    [{ name: "Орлова Юлия Максимовна",    shortName: "Орлова Ю.М."  }],
  surgeon:   [{ name: "Смирнов Павел Олегович",    shortName: "Смирнов П.О." }],
};

// ─── Генерация демо-данных дня по специализации и врачам ──────────────────────
interface SpecDayRow { primary: number; repeat: number; revenue: number; avgCheck: number; }
type DayReport = Record<string, SpecDayRow & { doctors: Record<string, SpecDayRow> }>;

function getDayReport(dateStr: string): DayReport {
  const d = new Date(dateStr);
  const day = d.getDate();
  const seed = day * 17 + d.getMonth() * 31;
  const rnd = (base: number, vary: number) => Math.max(0, base + ((seed * 13 + vary * 7) % (vary * 2 + 1)) - vary);

  const specConfigs: { key: string; base: [number,number,number]; doctors: { name: string; share: number }[] }[] = [
    { key: "therapist", base: [5, 4, 14000], doctors: [{ name: "Петров А.В.",  share: 1.0 }] },
    { key: "uzi",       base: [4, 3, 12800], doctors: [{ name: "Белова Н.И.",  share: 1.0 }] },
    { key: "cardio",    base: [3, 2, 10500], doctors: [{ name: "Захаров С.Д.", share: 1.0 }] },
    { key: "gyneco",    base: [3, 2, 11500], doctors: [{ name: "Орлова Ю.М.",  share: 1.0 }] },
    { key: "surgeon",   base: [2, 2,  8500], doctors: [{ name: "Смирнов П.О.", share: 1.0 }] },
  ];

  const result: DayReport = {};
  specConfigs.forEach(({ key, base, doctors }) => {
    const primary = rnd(base[0], 2);
    const repeat  = rnd(base[1], 2);
    const revenue = rnd(base[2], 2500);
    const total   = primary + repeat;
    const avgCheck = total > 0 ? Math.round(revenue / total) : 0;

    const docRows: Record<string, SpecDayRow> = {};
    doctors.forEach((doc) => {
      const dp = Math.round(primary * doc.share);
      const dr = Math.round(repeat  * doc.share);
      const drev = Math.round(revenue * doc.share);
      const dt = dp + dr;
      docRows[doc.name] = { primary: dp, repeat: dr, revenue: drev, avgCheck: dt > 0 ? Math.round(drev / dt) : 0 };
    });

    result[key] = { primary, repeat, revenue, avgCheck, doctors: docRows };
  });
  return result;
}

// Накопленные данные с начала месяца по день D (сумма дней 1..D)
function getMonthAccum(year: number, month: number, upToDay: number) {
  let totPrimary = 0, totRepeat = 0, totRevenue = 0;
  const specPrimary: Record<string, number> = {};
  const specRepeat:  Record<string, number> = {};
  const specRevenue: Record<string, number> = {};
  for (let d = 1; d <= upToDay; d++) {
    const dateStr = `${year}-${String(month+1).padStart(2,"0")}-${String(d).padStart(2,"0")}`;
    const rep = getDayReport(dateStr);
    MIS_SPECIALIZATIONS.forEach(sp => {
      const row = rep[sp.key];
      totPrimary += row.primary;
      totRepeat  += row.repeat;
      totRevenue += row.revenue;
      specPrimary[sp.key] = (specPrimary[sp.key] ?? 0) + row.primary;
      specRepeat[sp.key]  = (specRepeat[sp.key]  ?? 0) + row.repeat;
      specRevenue[sp.key] = (specRevenue[sp.key] ?? 0) + row.revenue;
    });
  }
  return { totPrimary, totRepeat, totRevenue, specPrimary, specRepeat, specRevenue };
}

export default function ClinicAnalysisReport() {
  const [selectedDate, setSelectedDate] = useState("2026-05-21");
  const [expandedSpecs, setExpandedSpecs] = useState<Set<string>>(new Set());

  const toggleSpec = (key: string) =>
    setExpandedSpecs(prev => { const s = new Set(prev); if (s.has(key)) { s.delete(key); } else { s.add(key); } return s; });

  const selD   = new Date(selectedDate);
  const selDay = selD.getDate();
  const selMon = selD.getMonth();
  const selYear= selD.getFullYear();

  const currAccum = getMonthAccum(selYear, selMon, selDay);

  const avgCheckCalc = (revenue: number, primary: number) => primary > 0 ? Math.round(revenue / primary) : 0;

  const prevMonthCols = (() => {
    const cols = [];
    for (let i = 1; i <= 5; i++) {
      let m = selMon - i;
      let y = selYear;
      if (m < 0) { m += 12; y -= 1; }
      const daysInM = new Date(y, m + 1, 0).getDate();
      const d = Math.min(selDay, daysInM);
      const dateStr = `${y}-${String(m+1).padStart(2,"0")}-${String(d).padStart(2,"0")}`;
      const accum = getMonthAccum(y, m, d);
      const plan  = MONTH_PLANS_2026[m] ?? 0;
      const shouldBe = plan > 0 ? Math.round(plan / daysInM * d) : 0;
      cols.unshift({ label: MONTHS_PLAN[m].slice(0,3), dateStr, day: d, month: m, year: y, accum, plan, shouldBe, daysInM });
    }
    return cols;
  })();

  const currPlan     = MONTH_PLANS_2026[selMon] ?? 0;
  const currDaysInM  = new Date(selYear, selMon + 1, 0).getDate();
  const currShouldBe = currPlan > 0 ? Math.round(currPlan / currDaysInM * selDay) : 0;
  const currFactRev  = currAccum.totRevenue;
  const currPctPlan  = currPlan > 0 ? Math.round(currFactRev / currPlan * 100) : 0;

  const dateLabel = selD.toLocaleDateString("ru-RU", { weekday: "long", day: "numeric", month: "long", year: "numeric" });
  const totalCols = prevMonthCols.length + 1;

  // ── Рендер-функции (не компоненты — не пересоздаются React'ом) ──────────────
  const renderRowLabel = (label: string, bold?: boolean, indent?: number, specKey?: string) => {
    const isExp = specKey ? expandedSpecs.has(specKey) : false;
    return (
      <td className={`px-3 py-2.5 text-sm sticky left-0 bg-card z-10 border-r border-border/40 whitespace-nowrap ${bold ? "font-bold text-foreground" : "text-muted-foreground"}`}
        style={{ paddingLeft: indent ? indent * 16 + 12 : 12 }}>
        <div className="flex items-center gap-2">
          {specKey && (
            <button onClick={() => toggleSpec(specKey)}
              className="w-4 h-4 rounded border flex items-center justify-center shrink-0"
              style={isExp ? { background: "hsl(199,85%,38%)", borderColor: "hsl(199,85%,38%)" } : { borderColor: "hsl(var(--border))" }}>
              <Icon name={isExp ? "Minus" : "Plus"} size={8} className={isExp ? "text-white" : "text-muted-foreground"} />
            </button>
          )}
          {label}
        </div>
      </td>
    );
  };

  const gradientColor = (rank: number, total: number, isBg: boolean) => {
    if (total <= 1) return isBg ? "" : "hsl(var(--foreground))";
    const t = rank / (total - 1);
    if (isBg) {
      if (t >= 0.75) return "#dcfce7";
      if (t >= 0.4)  return "#fef9c3";
      return "#fee2e2";
    } else {
      if (t >= 0.75) return "#15803d";
      if (t >= 0.4)  return "#92400e";
      return "#dc2626";
    }
  };

  const renderRankedCell = (key: string | number, val: number, fmt: "rub"|"num"|"pct", rank: number, total: number, isCurr: boolean) => {
    const txt = fmt === "rub" ? (val ? fmtRub(val) : "—") : fmt === "pct" ? (val ? `${val}%` : "—") : (val ? String(val) : "—");
    const bg  = val > 0 ? gradientColor(rank, total, true)  : "";
    const fg  = val > 0 ? gradientColor(rank, total, false) : "hsl(var(--muted-foreground))";
    return (
      <td key={key} className={`text-center whitespace-nowrap ${isCurr ? "px-3 py-2.5 text-sm font-semibold" : "px-2 py-2.5"}`}
        style={{ background: bg, borderLeft: isCurr ? "2px solid hsl(199,85%,38%,0.3)" : undefined }}>
        <span className={isCurr ? "text-sm font-semibold" : "text-[11px]"} style={{ color: fg }}>{txt}</span>
      </td>
    );
  };

  const renderSectionRow = (key: string, label: string, color: string) => (
    <tr key={key}>
      <td colSpan={totalCols + 1} className="px-3 py-1.5 text-xs font-bold uppercase tracking-wider"
        style={{ background: color + "22", color, position: "sticky", left: 0 }}>
        {label}
      </td>
    </tr>
  );

  type DataRowArgs = {
    key: string;
    label: string; bold?: boolean; indent?: number; specKey?: string;
    getVal: (accum: ReturnType<typeof getMonthAccum>, plan: number, shouldBe: number, day: number, daysInM: number) => number;
    fmt: "rub"|"num"|"pct";
    hlCurr?: "green"|"amber"|"red"|"blue"|"none";
    isRevColor?: boolean;
  };
  const renderDataRow = ({ key, label, bold, indent, specKey, getVal, fmt, hlCurr }: DataRowArgs) => {
    const prevVals = prevMonthCols.map(c => getVal(c.accum, c.plan, c.shouldBe, c.day, c.daysInM));
    const currVal  = getVal(currAccum, currPlan, currShouldBe, selDay, currDaysInM);
    const allVals  = [...prevVals, currVal];

    const nonZero  = allVals.filter(v => v > 0).sort((a, b) => a - b);
    const getRank  = (v: number) => v > 0 ? nonZero.indexOf(v) : -1;

    return (
      <tr key={key} className="border-b border-border/40 hover:bg-muted/5">
        {renderRowLabel(label, bold, indent, specKey)}
        {prevVals.map((v, i) => {
          if (hlCurr !== undefined) {
            const txt = fmt === "rub" ? (v ? fmtRub(v) : "—") : fmt === "pct" ? (v ? `${v}%` : "—") : (v ? String(v) : "—");
            return (
              <td key={i} className="px-2 py-2.5 text-center whitespace-nowrap">
                <span className="text-[11px] text-muted-foreground">{txt}</span>
              </td>
            );
          }
          const rank = getRank(v);
          return renderRankedCell(i, v, fmt, rank < 0 ? 0 : rank, nonZero.length, false);
        })}
        {hlCurr !== undefined ? (
          (() => {
            const txt = fmt === "rub" ? (currVal ? fmtRub(currVal) : "—") : fmt === "pct" ? (currVal ? `${currVal}%` : "—") : (currVal ? String(currVal) : "—");
            const bg = hlCurr === "green" ? "#dcfce7" : hlCurr === "amber" ? "#fef9c3" : hlCurr === "red" ? "#fee2e2" : hlCurr === "blue" ? "hsl(199,85%,38%,0.1)" : "";
            const fg = hlCurr === "green" ? "#15803d" : hlCurr === "amber" ? "#92400e" : hlCurr === "red" ? "#dc2626" : hlCurr === "blue" ? "hsl(199,85%,38%)" : "hsl(var(--foreground))";
            return (
              <td key="curr" className="px-3 py-2.5 text-sm font-semibold text-center whitespace-nowrap"
                style={{ background: bg, borderLeft: "2px solid hsl(199,85%,38%,0.3)" }}>
                <span style={{ color: fg }}>{txt}</span>
              </td>
            );
          })()
        ) : (
          renderRankedCell("curr", currVal, fmt, getRank(currVal) < 0 ? 0 : getRank(currVal), nonZero.length, true)
        )}
      </tr>
    );
  };

  return (
    <div className="space-y-4">
      {/* Шапка */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-base font-bold text-foreground">Анализ загрузки клиники</h2>
          <p className="text-xs text-muted-foreground capitalize">{dateLabel} · данные накоплены с начала месяца</p>
        </div>
        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <span className="flex items-center gap-1"><span className="w-3 h-3 rounded inline-block bg-green-200" />Максимум</span>
            <span className="flex items-center gap-1"><span className="w-3 h-3 rounded inline-block bg-yellow-100 border border-yellow-200" />Середина</span>
            <span className="flex items-center gap-1"><span className="w-3 h-3 rounded inline-block bg-red-200" />Минимум</span>
          </div>
          <div className="flex items-center gap-1.5 border border-border rounded-lg px-2.5 py-1.5 bg-card">
            <Icon name="CalendarDays" size={14} className="text-muted-foreground" />
            <input type="date" value={selectedDate} max="2026-05-21"
              onChange={e => setSelectedDate(e.target.value)}
              className="text-sm bg-transparent outline-none text-foreground" />
          </div>
        </div>
      </div>

      {/* Таблица */}
      <div className="bg-card border border-border rounded-xl overflow-hidden shadow-sm">
        <div className="overflow-auto scrollbar-thin">
          <table className="text-sm border-collapse" style={{ minWidth: 900 }}>
            <thead>
              <tr className="border-b-2 border-border bg-muted/30 sticky top-0 z-20">
                <th className="text-left px-3 py-3 text-xs font-bold text-muted-foreground uppercase sticky left-0 bg-muted/30 z-30 min-w-[200px]">Показатель</th>
                {prevMonthCols.map((c, i) => (
                  <th key={i} className="text-center px-3 py-3 min-w-[110px]">
                    <div className="text-[11px] font-semibold text-muted-foreground uppercase">{c.label}</div>
                    <div className="text-[10px] font-normal text-muted-foreground/70 normal-case">по {c.day}-е число</div>
                  </th>
                ))}
                <th className="text-center px-3 py-3 min-w-[140px]"
                  style={{ background: "hsl(199,85%,38%,0.08)", borderLeft: "2px solid hsl(199,85%,38%,0.3)" }}>
                  <div className="text-xs font-bold uppercase" style={{ color: "hsl(199,85%,38%)" }}>
                    {MONTHS_PLAN[selMon].slice(0,3)}
                  </div>
                  <div className="text-[10px] font-normal text-muted-foreground normal-case">по {selDay}-е число</div>
                </th>
              </tr>
            </thead>

            <tbody>
              {/* ── Плановые строки ── */}
              {renderSectionRow("plan-sec", "Выполнение плана", "hsl(199,85%,38%)")}

              {renderDataRow({ key: "plan", label: "План на месяц", bold: true, fmt: "rub", hlCurr: "none",
                getVal: (_, plan) => plan })}

              {renderDataRow({ key: "should", label: `Должно быть (к ${selDay}-му)`, bold: true, fmt: "rub", hlCurr: "blue",
                getVal: (_, plan, shouldBe) => shouldBe })}

              {renderDataRow({ key: "fact", label: "Выручка (факт)", bold: true, fmt: "rub", isRevColor: true,
                getVal: (accum) => accum.totRevenue })}

              {renderDataRow({ key: "pct", label: "% выполнения", bold: true, fmt: "pct",
                hlCurr: currPctPlan >= 100 ? "green" : currPctPlan >= 80 ? "amber" : "red",
                getVal: (accum, plan) => plan > 0 ? Math.round(accum.totRevenue / plan * 100) : 0 })}

              {/* ── Итого по клинике ── */}
              {renderSectionRow("tot-sec", "Итого по клинике", "hsl(199,85%,38%)")}

              {renderDataRow({ key: "tot-prim", label: "Первичный приём", bold: true, fmt: "num", isRevColor: true,
                getVal: (accum) => accum.totPrimary })}

              {renderDataRow({ key: "tot-rep", label: "Повторный приём", bold: true, fmt: "num", isRevColor: true,
                getVal: (accum) => accum.totRepeat })}

              {renderDataRow({ key: "tot-pp", label: "ПП в день", bold: true, fmt: "num", isRevColor: true,
                getVal: (accum, _p, _s, day) => day > 0 ? Math.round(accum.totPrimary / day) : 0 })}

              {renderDataRow({ key: "tot-avg", label: "Средний чек", bold: true, fmt: "rub", isRevColor: true,
                getVal: (accum) => avgCheckCalc(accum.totRevenue, accum.totPrimary) })}

              {/* ── По каждой специализации ── */}
              {MIS_SPECIALIZATIONS.map(spec => {
                const isExp   = expandedSpecs.has(spec.key);
                const doctors = MIS_DOCTORS_BY_SPEC[spec.key] ?? [];

                return (
                  <React.Fragment key={spec.key}>
                    {renderSectionRow(`sec-${spec.key}`, spec.label, spec.color)}

                    {renderDataRow({ key: `${spec.key}-rev`, label: "Выручка", bold: true, fmt: "rub", isRevColor: true, specKey: spec.key,
                      getVal: (accum) => accum.specRevenue[spec.key] ?? 0 })}

                    {isExp && doctors.map(doc => (
                      renderDataRow({ key: `${spec.key}-${doc.shortName}`, label: doc.shortName, fmt: "rub", indent: 1,
                        getVal: (accum) => Math.round((accum.specRevenue[spec.key] ?? 0) * 0.6) })
                    ))}

                    {renderDataRow({ key: `${spec.key}-prim`, label: "Первичный приём", fmt: "num", isRevColor: true,
                      getVal: (accum) => accum.specPrimary[spec.key] ?? 0 })}

                    {renderDataRow({ key: `${spec.key}-rep`, label: "Повторный приём", fmt: "num", isRevColor: true,
                      getVal: (accum) => accum.specRepeat[spec.key] ?? 0 })}

                    {renderDataRow({ key: `${spec.key}-pp`, label: "ПП в день", fmt: "num", isRevColor: true,
                      getVal: (accum, _p, _s, day) => day > 0 ? Math.round((accum.specPrimary[spec.key] ?? 0) / day) : 0 })}

                    {renderDataRow({ key: `${spec.key}-avg`, label: "Средний чек", fmt: "rub", isRevColor: true,
                      getVal: (accum) => avgCheckCalc(accum.specRevenue[spec.key] ?? 0, accum.specPrimary[spec.key] ?? 1) })}
                  </React.Fragment>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
