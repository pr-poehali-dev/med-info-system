import { useState, useEffect } from "react";
import Icon from "@/components/ui/icon";
import { fmtNum, fmtRub } from "@/lib/format";
import { MONTHS_PLAN, MONTHS_DAYS } from "@/lib/plans";

const SPECIALIZATIONS = [
  { key: "trauma", label: "Травматология", color: "#1a9cbe" },
  { key: "neuro",  label: "Неврология",    color: "#e67e22" },
  { key: "other",  label: "Доп. приёмы",   color: "#9b59b6" },
];

// Данные планов по умолчанию (из файла пользователя)
const DEFAULT_PLANS: Record<string, number[]> = {
  total:  [4300000,4700000,5700000,5300000,5200000,5300000,5400000,6000000,5200000,6000000,5500000,5700000],
  trauma: [2500000,2700000,3300000,3000000,3000000,3000000,3100000,3400000,3000000,3400000,3100000,3200000],
  neuro:  [1500000,1700000,2000000,1900000,1800000,1900000,1900000,2100000,1800000,2100000,2000000,2000000],
  other:  [300000, 300000, 400000, 400000, 400000, 400000, 400000, 500000, 400000, 500000, 400000, 500000],
};

// Ячейка плана с локальным состоянием — не теряет курсор при наборе
function PlanCell({ value, onCommit }: { value: number; onCommit: (val: string) => void }) {
  const [text, setText] = useState<string>(fmtNum(value));
  const [focused, setFocused] = useState(false);

  useEffect(() => {
    if (!focused) setText(fmtNum(value));
  }, [value, focused]);

  return (
    <input
      type="text"
      value={text}
      onFocus={() => { setFocused(true); setText(String(value || "")); }}
      onChange={e => setText(e.target.value)}
      onBlur={() => {
        setFocused(false);
        const num = parseInt(text.replace(/\D/g, ""), 10) || 0;
        setText(fmtNum(num));
        onCommit(String(num));
      }}
      className="w-full text-xs text-center border border-border rounded px-1 py-1 bg-background outline-none focus:border-primary text-foreground"
    />
  );
}

export default function PlansSection() {
  const [year] = useState(2026);
  const [plans, setPlans] = useState<Record<string, number[]>>(
    () => {
      try {
        const saved = localStorage.getItem("clinic_plans_2026");
        return saved ? JSON.parse(saved) : DEFAULT_PLANS;
      } catch { return DEFAULT_PLANS; }
    }
  );
  const [saved, setSaved] = useState(false);

  const updatePlan = (key: string, monthIdx: number, val: string) => {
    const num = parseInt(val.replace(/\D/g, ""), 10) || 0;
    setPlans(prev => {
      const updated = { ...prev, [key]: [...(prev[key] ?? [])] };
      updated[key][monthIdx] = num;
      // Пересчитываем total
      updated.total = (updated.total ?? []).map((_, i) =>
        (updated.trauma?.[i] || 0) + (updated.neuro?.[i] || 0) + (updated.other?.[i] || 0)
      );
      return updated;
    });
    setSaved(false);
  };

  const handleSave = () => {
    localStorage.setItem("clinic_plans_2026", JSON.stringify(plans));
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleReset = () => { setPlans(DEFAULT_PLANS); setSaved(false); };

  return (
    <div className="space-y-5">
      {/* Шапка */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-lg font-bold text-foreground">Планы на {year} год</h2>
          <p className="text-xs text-muted-foreground mt-0.5">Введите планы по выручке — общий и по специализациям. Средний чек и кол-во приёмов рассчитываются автоматически.</p>
        </div>
        <div className="flex gap-2">
          <button onClick={handleReset}
            className="px-3 py-2 rounded-lg text-xs font-medium border border-border hover:bg-muted transition-colors text-muted-foreground">
            Сбросить
          </button>
          <button onClick={handleSave}
            className="px-4 py-2 rounded-lg text-xs font-semibold text-white transition-colors flex items-center gap-1.5"
            style={{ background: saved ? "hsl(162,60%,40%)" : "hsl(199,85%,38%)" }}>
            <Icon name={saved ? "Check" : "Save"} size={13} />
            {saved ? "Сохранено!" : "Сохранить планы"}
          </button>
        </div>
      </div>

      {/* Общий план — таблица по месяцам */}
      <div className="bg-card border border-border rounded-xl overflow-hidden shadow-sm">
        <div className="px-5 py-3 border-b border-border bg-muted/20 flex items-center gap-2">
          <Icon name="Target" size={15} className="text-primary" />
          <h3 className="font-semibold text-sm text-foreground">Общий план по выручке</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left px-4 py-2.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider w-36 sticky left-0 bg-card">Показатель</th>
                {MONTHS_PLAN.map((m, i) => (
                  <th key={i} className="text-center px-2 py-2.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider min-w-[90px]">
                    {m.slice(0,3)}<span className="text-[9px] block font-normal opacity-60">{MONTHS_DAYS[i]} дн</span>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {/* Общий план (авто) */}
              <tr className="bg-muted/5">
                <td className="px-4 py-2.5 font-semibold text-foreground sticky left-0 bg-muted/5">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-primary" />
                    Итого план
                  </div>
                </td>
                {plans.total.map((v, i) => (
                  <td key={i} className="px-2 py-2.5 text-center">
                    <span className="text-xs font-bold text-primary">{fmtRub(v)}</span>
                  </td>
                ))}
              </tr>
              {/* По специализациям */}
              {SPECIALIZATIONS.map(spec => (
                <tr key={spec.key} className="hover:bg-muted/10 transition-colors">
                  <td className="px-4 py-2.5 sticky left-0 bg-card">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full shrink-0" style={{ background: spec.color }} />
                      <span className="text-sm text-foreground font-medium">{spec.label}</span>
                    </div>
                  </td>
                  {plans[spec.key].map((v, i) => (
                    <td key={i} className="px-2 py-1.5 text-center">
                      <PlanCell value={v} onCommit={val => updatePlan(spec.key, i, val)} />
                    </td>
                  ))}
                </tr>
              ))}
              {/* Должно быть к концу месяца (авто) */}
              <tr className="bg-amber-50/50 dark:bg-amber-900/10">
                <td className="px-4 py-2.5 font-medium text-amber-700 dark:text-amber-400 text-xs sticky left-0 bg-amber-50/50 dark:bg-amber-900/10">
                  <div className="flex items-center gap-2">
                    <Icon name="AlertCircle" size={12} />
                    В день (план/дней)
                  </div>
                </td>
                {plans.total.map((v, i) => (
                  <td key={i} className="px-2 py-2.5 text-center">
                    <span className="text-[11px] font-medium text-amber-700 dark:text-amber-400">
                      {fmtRub(Math.round(v / MONTHS_DAYS[i]))}
                    </span>
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Лиды — планы по специализациям */}
      <div className="bg-card border border-border rounded-xl overflow-hidden shadow-sm">
        <div className="px-5 py-3 border-b border-border bg-muted/20 flex items-center gap-2">
          <Icon name="PhoneIncoming" size={15} className="text-primary" />
          <h3 className="font-semibold text-sm text-foreground">План по первичным приёмам (лидам)</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left px-4 py-2.5 text-xs font-semibold text-muted-foreground uppercase sticky left-0 bg-card w-36">Специализация</th>
                {MONTHS_PLAN.map((m, i) => (
                  <th key={i} className="text-center px-2 py-2.5 text-xs font-semibold text-muted-foreground uppercase min-w-[70px]">
                    {m.slice(0,3)}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {[
                { key: "leads_trauma", label: "Травматология", color: "#1a9cbe", defaults: [220,230,250,240,220,220,230,250,220,240,220,230] },
                { key: "leads_neuro",  label: "Неврология",    color: "#e67e22", defaults: [180,190,200,190,180,185,190,200,185,195,180,185] },
                { key: "leads_other",  label: "Доп. приёмы",   color: "#9b59b6", defaults: [15,15,15,15,15,15,15,15,15,15,15,15] },
              ].map(row => {
                const vals = plans[row.key] ?? row.defaults;
                return (
                  <tr key={row.key} className="hover:bg-muted/10 transition-colors">
                    <td className="px-4 py-2.5 sticky left-0 bg-card">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full" style={{ background: row.color }} />
                        <span className="text-sm text-foreground font-medium">{row.label}</span>
                      </div>
                    </td>
                    {(vals as number[]).map((v, i) => (
                      <td key={i} className="px-2 py-1.5 text-center">
                        <input type="text" value={v}
                          onChange={e => updatePlan(row.key, i, e.target.value)}
                          className="w-full text-xs text-center border border-border rounded px-1 py-1 bg-background outline-none focus:border-primary text-foreground" />
                      </td>
                    ))}
                  </tr>
                );
              })}
              {/* Итого лидов */}
              <tr className="bg-muted/10 font-semibold">
                <td className="px-4 py-2.5 text-foreground text-sm sticky left-0 bg-muted/10">Итого лидов</td>
                {MONTHS_PLAN.map((_, i) => {
                  const t = (plans["leads_trauma"]?.[i] ?? 220) + (plans["leads_neuro"]?.[i] ?? 180) + (plans["leads_other"]?.[i] ?? 15);
                  return <td key={i} className="px-2 py-2.5 text-center text-sm font-bold text-foreground">{t}</td>;
                })}
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
