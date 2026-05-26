import { useState } from "react";
import Icon from "@/components/ui/icon";
import { fmtMoney } from "@/lib/format";

// ─── Данные для отчёта по приёмам ────────────────────────────────────────────
const REPORT_DOCTORS = [
  { id: 1, name: "Петров А.В.",  specialization: "Терапевт",       color: "#1a9cbe" },
  { id: 2, name: "Белова Н.И.",  specialization: "УЗИ-специалист", color: "#20a869" },
  { id: 3, name: "Захаров С.Д.", specialization: "Кардиолог",      color: "#e67e22" },
  { id: 4, name: "Орлова Ю.М.",  specialization: "Гинеколог",      color: "#9b59b6" },
  { id: 5, name: "Смирнов П.О.", specialization: "Хирург",         color: "#c0392b" },
];

const REPORT_DATA: {
  doctorId: number;
  type: "primary" | "repeat";
  count: number;
  priceEach: number;
}[] = [
  { doctorId: 1, type: "primary", count: 38, priceEach: 2500 },
  { doctorId: 1, type: "repeat",  count: 54, priceEach: 1800 },
  { doctorId: 2, type: "primary", count: 21, priceEach: 3200 },
  { doctorId: 2, type: "repeat",  count: 35, priceEach: 2200 },
  { doctorId: 3, type: "primary", count: 17, priceEach: 3000 },
  { doctorId: 3, type: "repeat",  count: 29, priceEach: 2000 },
  { doctorId: 4, type: "primary", count: 12, priceEach: 3500 },
  { doctorId: 4, type: "repeat",  count: 19, priceEach: 2400 },
  { doctorId: 5, type: "primary", count: 9,  priceEach: 2500 },
  { doctorId: 5, type: "repeat",  count: 14, priceEach: 1800 },
];

// ─── Группировка для отчёта ──────────────────────────────────────────────────
function buildReportTree(filtered: typeof REPORT_DATA, type: "primary" | "repeat") {
  const rows = filtered.filter(r => r.type === type);
  const specMap = new Map<string, { count: number; sum: number; doctors: { doc: typeof REPORT_DOCTORS[0]; count: number; sum: number }[] }>();
  rows.forEach(row => {
    const doc = REPORT_DOCTORS.find(d => d.id === row.doctorId)!;
    const spec = doc.specialization;
    if (!specMap.has(spec)) specMap.set(spec, { count: 0, sum: 0, doctors: [] });
    const entry = specMap.get(spec)!;
    entry.count += row.count;
    entry.sum   += row.count * row.priceEach;
    entry.doctors.push({ doc, count: row.count, sum: row.count * row.priceEach });
  });
  return Array.from(specMap.entries()).map(([spec, data]) => ({ spec, ...data }));
}

// ─── Выгрузка в CSV (Excel) ──────────────────────────────────────────────────
function exportToExcel(
  dateFrom: string,
  dateTo: string,
  primaryTree: ReturnType<typeof buildReportTree>,
  repeatTree:  ReturnType<typeof buildReportTree>,
  grandTotal: { count: number; sum: number },
) {
  const rows: string[][] = [
    ["Отчёт по приёмам"],
    [`Период: ${dateFrom} — ${dateTo}`],
    [],
    ["Тип", "Специализация", "Врач", "Кол-во приёмов", "Сумма (₽)"],
  ];

  const addGroup = (label: string, tree: ReturnType<typeof buildReportTree>) => {
    const total = tree.reduce((s, g) => ({ count: s.count + g.count, sum: s.sum + g.sum }), { count: 0, sum: 0 });
    rows.push([label, "", "", String(total.count), String(total.sum)]);
    tree.forEach(group => {
      rows.push(["", group.spec, "", String(group.count), String(group.sum)]);
      group.doctors.forEach(d => {
        rows.push(["", "", d.doc.name, String(d.count), String(d.sum)]);
      });
    });
  };

  addGroup("Первичный приём", primaryTree);
  addGroup("Повторный приём", repeatTree);
  rows.push([]);
  rows.push(["Итого", "", "", String(grandTotal.count), String(grandTotal.sum)]);

  const csv = "\uFEFF" + rows.map(r => r.map(c => `"${c}"`).join(";")).join("\r\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement("a");
  a.href     = url;
  a.download = `otchet_priemy_${dateFrom}_${dateTo}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

// ─── Отчёт по приёмам ────────────────────────────────────────────────────────
export default function AppointmentsReport() {
  const [dateFrom, setDateFrom] = useState(`2026-05-01`);
  const [dateTo,   setDateTo]   = useState(`2026-05-21`);
  const [selectedDocs, setSelectedDocs] = useState<number[]>(REPORT_DOCTORS.map(d => d.id));
  const [expandedPrimary, setExpandedPrimary] = useState(false);
  const [expandedRepeat,  setExpandedRepeat]  = useState(false);
  const [expandedSpecs, setExpandedSpecs] = useState<Set<string>>(new Set());
  const [docsOpen, setDocsOpen] = useState(true);

  const toggleDoc  = (id: number) =>
    setSelectedDocs(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  const toggleSpec = (key: string) =>
    setExpandedSpecs(prev => { const s = new Set(prev); if (s.has(key)) { s.delete(key); } else { s.add(key); } return s; });

  const filtered     = REPORT_DATA.filter(r => selectedDocs.includes(r.doctorId));
  const primaryTree  = buildReportTree(filtered, "primary");
  const repeatTree   = buildReportTree(filtered, "repeat");
  const primaryTotal = primaryTree.reduce((s, g) => ({ count: s.count + g.count, sum: s.sum + g.sum }), { count: 0, sum: 0 });
  const repeatTotal  = repeatTree.reduce( (s, g) => ({ count: s.count + g.count, sum: s.sum + g.sum }), { count: 0, sum: 0 });
  const grandTotal   = { count: primaryTotal.count + repeatTotal.count, sum: primaryTotal.sum + repeatTotal.sum };

  // Рендер-функции (не компоненты) — не пересоздаются React'ом
  const renderColHeader = () => (
    <div className="grid items-center border-b border-border bg-muted/30 sticky top-0 z-10"
      style={{ gridTemplateColumns: "1fr 100px 140px" }}>
      <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider px-5 py-2">Тип / Специализация / Врач</span>
      <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider text-right py-2 pr-4">Кол-во</span>
      <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider text-right py-2 pr-5">Сумма</span>
    </div>
  );

  const renderTypeRow = (label: string, total: { count: number; sum: number }, expanded: boolean, onToggle: () => void, accent: string) => (
    <button onClick={onToggle}
      className="w-full grid items-center hover:bg-muted/30 transition-colors"
      style={{ gridTemplateColumns: "1fr 100px 140px" }}>
      <div className="flex items-center gap-2 px-5 py-3">
        <div className="w-5 h-5 rounded flex items-center justify-center border shrink-0 transition-colors"
          style={expanded ? { background: accent, borderColor: accent } : { borderColor: "hsl(var(--border))" }}>
          <Icon name={expanded ? "Minus" : "Plus"} size={11} className={expanded ? "text-white" : "text-muted-foreground"} />
        </div>
        <span className="text-sm font-semibold text-foreground">{label}</span>
        <span className="text-[10px] px-1.5 py-0.5 rounded-full font-medium"
          style={{ background: accent + "20", color: accent }}>{total.count} шт</span>
      </div>
      <span className="text-sm font-bold text-foreground text-right pr-4">{total.count}</span>
      <span className="text-sm font-bold text-primary text-right pr-5">{fmtMoney(total.sum)}</span>
    </button>
  );

  const renderSpecRow = (specKey: string, spec: string, count: number, sum: number, expanded: boolean) => (
    <button key={specKey + "-row"} onClick={() => toggleSpec(specKey)}
      className="w-full grid items-center hover:bg-muted/20 transition-colors border-t border-border/40"
      style={{ gridTemplateColumns: "1fr 100px 140px", background: "hsl(var(--muted)/0.08)" }}>
      <div className="flex items-center gap-2 pl-12 pr-5 py-2.5">
        <div className="w-4 h-4 rounded flex items-center justify-center border border-border/60 shrink-0 transition-colors"
          style={expanded ? { background: "hsl(var(--muted-foreground))", borderColor: "hsl(var(--muted-foreground))" } : {}}>
          <Icon name={expanded ? "Minus" : "Plus"} size={9} className={expanded ? "text-white" : "text-muted-foreground"} />
        </div>
        <span className="text-sm text-foreground font-medium">{spec}</span>
      </div>
      <span className="text-sm text-foreground text-right pr-4">{count}</span>
      <span className="text-sm text-foreground font-medium text-right pr-5">{fmtMoney(sum)}</span>
    </button>
  );

  const renderDoctorRow = (doc: typeof REPORT_DOCTORS[0], count: number, sum: number) => (
    <div key={doc.id} className="grid items-center border-t border-border/30 hover:bg-muted/10 transition-colors"
      style={{ gridTemplateColumns: "1fr 100px 140px", background: "hsl(var(--card))" }}>
      <div className="flex items-center gap-2 pl-20 pr-5 py-2">
        <div className="w-2 h-2 rounded-full shrink-0" style={{ background: doc.color }} />
        <span className="text-sm text-foreground">{doc.name}</span>
        <span className="text-[10px] text-muted-foreground">{doc.specialization}</span>
      </div>
      <span className="text-sm text-muted-foreground text-right pr-4">{count}</span>
      <span className="text-sm text-foreground text-right pr-5">{fmtMoney(sum)}</span>
    </div>
  );

  const renderTree = (tree: ReturnType<typeof buildReportTree>, typeKey: "primary" | "repeat") => (
    <>
      {tree.map(group => {
        const specKey = `${typeKey}|${group.spec}`;
        const specExpanded = expandedSpecs.has(specKey);
        return (
          <div key={specKey}>
            {renderSpecRow(specKey, group.spec, group.count, group.sum, specExpanded)}
            {specExpanded && group.doctors.map(d => renderDoctorRow(d.doc, d.count, d.sum))}
          </div>
        );
      })}
    </>
  );

  return (
    <div className="flex gap-0 h-full" style={{ minHeight: 500 }}>

      {/* ── Левая панель фильтров ── */}
      <div className="w-52 shrink-0 border-r border-border bg-muted/20 flex flex-col rounded-l-xl overflow-y-auto scrollbar-thin">

        {/* Период */}
        <div className="px-3 pt-3 pb-2 border-b border-border">
          <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-2">Период</p>
          <div className="space-y-1.5">
            <div>
              <label className="text-[10px] text-muted-foreground">С</label>
              <input type="date" value={dateFrom} onChange={e => setDateFrom(e.target.value)}
                className="w-full text-xs border border-border rounded px-2 py-1 bg-background outline-none focus:border-primary" />
            </div>
            <div>
              <label className="text-[10px] text-muted-foreground">По</label>
              <input type="date" value={dateTo} onChange={e => setDateTo(e.target.value)}
                className="w-full text-xs border border-border rounded px-2 py-1 bg-background outline-none focus:border-primary" />
            </div>
          </div>
          <div className="flex flex-wrap gap-1 mt-2">
            {[
              { label: "Сегодня", from: "2026-05-21", to: "2026-05-21" },
              { label: "Неделя",  from: "2026-05-15", to: "2026-05-21" },
              { label: "Месяц",   from: "2026-05-01", to: "2026-05-31" },
            ].map(p => (
              <button key={p.label}
                onClick={() => { setDateFrom(p.from); setDateTo(p.to); }}
                className="text-[10px] px-2 py-0.5 rounded border border-border hover:bg-muted transition-colors"
                style={dateFrom === p.from && dateTo === p.to
                  ? { background: "hsl(199,85%,38%)", color: "white", borderColor: "hsl(199,85%,38%)" }
                  : { color: "hsl(var(--muted-foreground))" }}>
                {p.label}
              </button>
            ))}
          </div>
        </div>

        {/* Врачи */}
        <div className="border-b border-border">
          <button onClick={() => setDocsOpen(v => !v)}
            className="w-full flex items-center justify-between px-3 py-2 hover:bg-muted/40 transition-colors">
            <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Врачи</span>
            <Icon name={docsOpen ? "ChevronUp" : "ChevronDown"} size={11} className="text-muted-foreground" />
          </button>
          {docsOpen && (
            <div className="pb-1">
              <button
                onClick={() => setSelectedDocs(selectedDocs.length === REPORT_DOCTORS.length ? [] : REPORT_DOCTORS.map(d => d.id))}
                className="w-full text-left px-3 py-1 text-[11px] text-muted-foreground hover:bg-muted/40 transition-colors flex items-center gap-2">
                <div className="w-3.5 h-3.5 rounded border border-border flex items-center justify-center shrink-0"
                  style={selectedDocs.length === REPORT_DOCTORS.length ? { background: "hsl(199,85%,38%)", borderColor: "hsl(199,85%,38%)" } : {}}>
                  {selectedDocs.length === REPORT_DOCTORS.length && <Icon name="Check" size={9} className="text-white" />}
                </div>
                Все врачи
              </button>
              {REPORT_DOCTORS.map(d => {
                const checked = selectedDocs.includes(d.id);
                return (
                  <button key={d.id} onClick={() => toggleDoc(d.id)}
                    className="w-full flex items-center gap-2 px-3 py-1 hover:bg-muted/40 transition-colors">
                    <div className="w-3.5 h-3.5 rounded border flex items-center justify-center shrink-0"
                      style={{ background: checked ? d.color : "transparent", borderColor: checked ? d.color : "hsl(var(--border))" }}>
                      {checked && <Icon name="Check" size={9} className="text-white" />}
                    </div>
                    <div className="w-2 h-2 rounded-full shrink-0" style={{ background: d.color }} />
                    <span className="text-[11px] text-foreground truncate">{d.name}</span>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Кнопки */}
        <div className="p-3 mt-auto space-y-2">
          <button className="w-full py-1.5 rounded-lg text-xs font-semibold text-white transition-opacity hover:opacity-90"
            style={{ background: "linear-gradient(90deg, hsl(199,85%,38%), hsl(162,60%,40%))" }}>
            Сформировать
          </button>
          <button
            onClick={() => exportToExcel(dateFrom, dateTo, primaryTree, repeatTree, grandTotal)}
            className="w-full flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-xs font-semibold border border-border hover:bg-muted transition-colors text-foreground">
            <Icon name="FileSpreadsheet" size={13} />
            Выгрузить в Excel
          </button>
        </div>
      </div>

      {/* ── Правая: таблица ── */}
      <div className="flex-1 flex flex-col overflow-hidden rounded-r-xl">

        {/* Шапка */}
        <div className="px-5 py-3 border-b border-border bg-card flex items-center justify-between shrink-0">
          <div>
            <h2 className="font-bold text-sm text-foreground">Отчёт по приёмам</h2>
            <p className="text-[11px] text-muted-foreground">
              {dateFrom} — {dateTo} · {selectedDocs.length} врач{selectedDocs.length === 1 ? "" : selectedDocs.length < 5 ? "а" : "ей"}
            </p>
          </div>
          <div className="flex gap-4">
            <div className="text-right">
              <p className="text-[10px] text-muted-foreground">Всего приёмов</p>
              <p className="text-base font-bold text-foreground">{grandTotal.count}</p>
            </div>
            <div className="text-right">
              <p className="text-[10px] text-muted-foreground">Сумма</p>
              <p className="text-base font-bold text-primary">{fmtMoney(grandTotal.sum)}</p>
            </div>
          </div>
        </div>

        {/* Таблица */}
        <div className="flex-1 overflow-y-auto scrollbar-thin bg-card">
          {renderColHeader()}

          {/* Первичный */}
          <div className="border-b border-border">
            {renderTypeRow("Первичный приём", primaryTotal, expandedPrimary,
              () => setExpandedPrimary(v => !v), "hsl(199,85%,38%)")}
            {expandedPrimary && (
              <div>{renderTree(primaryTree, "primary")}</div>
            )}
          </div>

          {/* Повторный */}
          <div className="border-b border-border">
            {renderTypeRow("Повторный приём", repeatTotal, expandedRepeat,
              () => setExpandedRepeat(v => !v), "hsl(162,60%,40%)")}
            {expandedRepeat && (
              <div>{renderTree(repeatTree, "repeat")}</div>
            )}
          </div>

          {/* Итого */}
          <div className="grid items-center"
            style={{ gridTemplateColumns: "1fr 100px 140px", background: "hsl(199,85%,38%,0.05)", borderTop: "2px solid hsl(var(--border))" }}>
            <span className="text-sm font-bold text-foreground px-5 py-3">Итого</span>
            <span className="text-sm font-bold text-foreground text-right pr-4">{grandTotal.count}</span>
            <span className="text-base font-bold text-primary text-right pr-5">{fmtMoney(grandTotal.sum)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
