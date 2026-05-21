import { useState, useRef, useEffect } from "react";
import Icon from "@/components/ui/icon";

// ─── Типы ────────────────────────────────────────────────────────────────────

type ViewDays = 1 | 2 | 3 | 7 | 14 | 30;
type GroupBy = "doctor" | "specialization";
type StepMin = 5 | 10 | 15 | 20 | 30 | 40 | 45 | 60 | 90;

interface Doctor {
  id: number;
  name: string;
  shortName: string;
  specialization: string;
  color: string;
}

interface Appointment {
  id: number;
  doctorId: number;
  patientName: string;
  service: string;
  startMin: number;
  durationMin: number;
  status: "scheduled" | "in_progress" | "done" | "cancelled";
  isFirstVisit?: boolean;
  phone?: string;
  comment?: string;
}

interface TooltipState {
  appt: Appointment;
  x: number;
  y: number;
}

// ─── Данные ──────────────────────────────────────────────────────────────────

const DOCTORS: Doctor[] = [
  { id: 1, name: "Петров Андрей Викторович",   shortName: "Петров А.В.",  specialization: "Терапевт",       color: "#1a9cbe" },
  { id: 2, name: "Белова Наталья Ивановна",    shortName: "Белова Н.И.",  specialization: "УЗИ-специалист", color: "#20a869" },
  { id: 3, name: "Захаров Сергей Дмитриевич",  shortName: "Захаров С.Д.", specialization: "Кардиолог",      color: "#e67e22" },
  { id: 4, name: "Орлова Юлия Максимовна",     shortName: "Орлова Ю.М.", specialization: "Гинеколог",      color: "#9b59b6" },
  { id: 5, name: "Смирнов Павел Олегович",     shortName: "Смирнов П.О.", specialization: "Хирург",         color: "#c0392b" },
];

const APPOINTMENTS: Appointment[] = [
  { id: 1, doctorId: 1, patientName: "Иванова Мария Сергеевна",    service: "Первичный осмотр",          startMin: 8*60,      durationMin: 30, status: "done",        phone: "+7 903 123-45-67" },
  { id: 2, doctorId: 2, patientName: "Сидоров Константин Павлович", service: "УЗИ брюшной полости",       startMin: 9*60+45,   durationMin: 25, status: "done",        phone: "+7 916 234-56-78" },
  { id: 3, doctorId: 1, patientName: "Козлова Тамара Алексеевна",   service: "Повторный приём",           startMin: 10*60+30,  durationMin: 20, status: "in_progress", phone: "+7 925 345-67-89" },
  { id: 4, doctorId: 3, patientName: "Морозов Игорь Евгеньевич",    service: "Консультация кардиолога",   startMin: 11*60+15,  durationMin: 30, status: "scheduled",   isFirstVisit: true, phone: "+7 977 456-78-90" },
  { id: 5, doctorId: 2, patientName: "Федорова Ольга Николаевна",   service: "Гастроскопия",              startMin: 12*60,     durationMin: 45, status: "scheduled",   phone: "+7 963 567-89-01" },
  { id: 6, doctorId: 3, patientName: "Волков Денис Сергеевич",      service: "ЭКГ + консультация",        startMin: 13*60+30,  durationMin: 40, status: "scheduled",   phone: "+7 903 678-90-12" },
  { id: 7, doctorId: 1, patientName: "Новикова Анна Петровна",      service: "Осмотр хирурга",            startMin: 14*60+15,  durationMin: 30, status: "scheduled",   phone: "+7 916 789-01-23" },
  { id: 8, doctorId: 4, patientName: "Тимофеева Римма Сергеевна",   service: "Гинекологический осмотр",   startMin: 12*60,     durationMin: 30, status: "scheduled",   isFirstVisit: true, phone: "+7 925 890-12-34" },
  { id: 9, doctorId: 5, patientName: "Громов Василий Иванович",     service: "Хирургическая консультация", startMin: 13*60,    durationMin: 30, status: "scheduled",   phone: "+7 977 901-23-45" },
  { id: 10, doctorId: 4, patientName: "Лебедева Светлана Игоревна", service: "Плановый осмотр",           startMin: 15*60+30,  durationMin: 30, status: "scheduled",   phone: "+7 963 012-34-56" },
  { id: 11, doctorId: 5, patientName: "Крылов Антон Дмитриевич",    service: "Перевязка",                 startMin: 17*60,     durationMin: 20, status: "scheduled",   phone: "+7 903 123-56-78" },
  { id: 12, doctorId: 1, patientName: "Зайцева Вера Олеговна",      service: "Направление на анализы",    startMin: 19*60,     durationMin: 15, status: "scheduled",   phone: "+7 916 234-67-89" },
];

// ─── Вспомогательные ─────────────────────────────────────────────────────────

const STEP_OPTIONS: { label: string; value: StepMin }[] = [
  { label: "5",  value: 5  },
  { label: "10", value: 10 },
  { label: "15", value: 15 },
  { label: "20", value: 20 },
  { label: "30", value: 30 },
  { label: "40", value: 40 },
  { label: "45", value: 45 },
  { label: "60", value: 60 },
  { label: "90", value: 90 },
];

const DAYS_OPTIONS: { label: string; value: ViewDays }[] = [
  { label: "1",  value: 1  },
  { label: "2",  value: 2  },
  { label: "3",  value: 3  },
  { label: "7",  value: 7  },
  { label: "14", value: 14 },
  { label: "30", value: 30 },
];

const WEEKDAYS_SHORT = ["Пн", "Вт", "Ср", "Чт", "Пт", "Сб", "Вс"];
const MONTHS_RU = ["Январь","Февраль","Март","Апрель","Май","Июнь","Июль","Август","Сентябрь","Октябрь","Ноябрь","Декабрь"];
const MONTHS_GEN = ["января","февраля","марта","апреля","мая","июня","июля","августа","сентября","октября","ноября","декабря"];
const WEEKDAYS_FULL = ["воскресенье","понедельник","вторник","среда","четверг","пятница","суббота"];

function minToTime(min: number): string {
  const h = Math.floor(min / 60).toString().padStart(2, "0");
  const m = (min % 60).toString().padStart(2, "0");
  return `${h}:${m}`;
}

function addDays(date: Date, n: number): Date {
  const d = new Date(date);
  d.setDate(d.getDate() + n);
  return d;
}

function isSameDay(a: Date, b: Date) {
  return a.getDate() === b.getDate() && a.getMonth() === b.getMonth() && a.getFullYear() === b.getFullYear();
}

function getDayOfWeek(date: Date): string {
  return WEEKDAYS_FULL[date.getDay()];
}

// Заголовок колонки дат над врачами
function colDateLabel(date: Date, viewDays: ViewDays): string {
  if (viewDays <= 3) {
    const wd = getDayOfWeek(date);
    return `${wd.charAt(0).toUpperCase() + wd.slice(1)}, ${date.getDate()} ${MONTHS_GEN[date.getMonth()]}`;
  }
  return `${date.getDate()}.${(date.getMonth()+1).toString().padStart(2,"0")}`;
}

// ─── Мини-календарь ──────────────────────────────────────────────────────────

function MiniCalendar({ current, onChange }: { current: Date; onChange: (d: Date) => void }) {
  const [month, setMonth] = useState(new Date(current.getFullYear(), current.getMonth(), 1));
  const today = new Date(2026, 4, 21);

  const startOffset = (new Date(month.getFullYear(), month.getMonth(), 1).getDay() + 6) % 7;
  const daysInMonth = new Date(month.getFullYear(), month.getMonth() + 1, 0).getDate();
  const cells: (Date | null)[] = [];
  for (let i = 0; i < startOffset; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(new Date(month.getFullYear(), month.getMonth(), d));
  while (cells.length % 7 !== 0) cells.push(null);

  return (
    <div className="px-1.5 py-1">
      {/* Шапка */}
      <div className="flex items-center justify-between mb-0.5">
        <button onClick={() => setMonth(d => new Date(d.getFullYear(), d.getMonth()-1, 1))}
          className="w-4 h-4 flex items-center justify-center rounded hover:bg-muted text-muted-foreground">
          <Icon name="ChevronLeft" size={10} />
        </button>
        <span className="text-[10px] font-semibold text-foreground">
          {MONTHS_RU[month.getMonth()]} {month.getFullYear()}
        </span>
        <button onClick={() => setMonth(d => new Date(d.getFullYear(), d.getMonth()+1, 1))}
          className="w-4 h-4 flex items-center justify-center rounded hover:bg-muted text-muted-foreground">
          <Icon name="ChevronRight" size={10} />
        </button>
      </div>
      {/* Дни недели */}
      <div className="grid grid-cols-7">
        {WEEKDAYS_SHORT.map(d => (
          <div key={d} className="text-center text-[7px] font-medium text-muted-foreground leading-[11px]">{d}</div>
        ))}
      </div>
      {/* Числа */}
      <div className="grid grid-cols-7">
        {cells.map((cell, i) => {
          if (!cell) return <div key={i} className="h-[14px]" />;
          const isToday    = isSameDay(cell, today);
          const isSelected = isSameDay(cell, current);
          const isWeekend  = cell.getDay() === 0 || cell.getDay() === 6;
          return (
            <button key={i} onClick={() => onChange(cell)}
              className="h-[14px] w-full flex items-center justify-center text-[9px] font-medium rounded transition-colors"
              style={
                isSelected ? { background: "hsl(199,85%,38%)", color: "white" }
                : isToday   ? { color: "hsl(199,85%,38%)", outline: "1px solid hsl(199,85%,38%)", borderRadius: 2 }
                : isWeekend ? { color: "#ef4444" }
                : { color: "hsl(var(--foreground))" }
              }
            >
              {cell.getDate()}
            </button>
          );
        })}
      </div>
      {/* Сегодня */}
      <button
        onClick={() => { onChange(today); setMonth(new Date(today.getFullYear(), today.getMonth(), 1)); }}
        className="w-full text-center text-[7px] font-bold uppercase tracking-wider py-0.5 rounded hover:bg-muted transition-colors"
        style={{ color: "hsl(199,85%,38%)" }}
      >
        СЕГОДНЯ
      </button>
    </div>
  );
}

// ─── Основной компонент ───────────────────────────────────────────────────────

// Читаем сохранённые настройки из localStorage
function readLS<T>(key: string, fallback: T): T {
  try { const v = localStorage.getItem(key); return v !== null ? JSON.parse(v) as T : fallback; }
  catch { return fallback; }
}
function writeLS(key: string, value: unknown) {
  try { localStorage.setItem(key, JSON.stringify(value)); } catch { /* ignore */ }
}

export default function Schedule() {
  const [step, setStepRaw]        = useState<StepMin>(() => readLS("sch_step", 15));
  const [viewDays, setViewDaysRaw] = useState<ViewDays>(() => readLS("sch_days", 1));
  const [groupBy, setGroupBy]     = useState<GroupBy>("doctor");
  const [selectedSpec, setSelectedSpec] = useState<string>("all");
  const [currentDate, setCurrentDate]   = useState(new Date(2026, 4, 21));
  const [patientSearch, setPatientSearch] = useState("");
  const [tooltip, setTooltip]     = useState<TooltipState | null>(null);
  // Раскрывающиеся блоки в левой панели
  const [specOpen, setSpecOpen]       = useState(true);
  const [doctorsOpen, setDoctorsOpen] = useState(true);
  // Какие врачи отмечены (по умолчанию все)
  const [checkedDoctors, setCheckedDoctors] = useState<number[]>(DOCTORS.map(d => d.id));
  const gridRef   = useRef<HTMLDivElement>(null);
  const headerRef = useRef<HTMLDivElement>(null);
  const wrapRef   = useRef<HTMLDivElement>(null);

  const setStep = (v: StepMin) => { setStepRaw(v); writeLS("sch_step", v); };
  const setViewDays = (v: ViewDays) => { setViewDaysRaw(v); writeLS("sch_days", v); };

  const DAY_START   = 8 * 60;   // 08:00
  const DAY_END     = 21 * 60;  // 21:00
  const totalSlots  = (DAY_END - DAY_START) / step;
  const slotHeight  = 28;       // px на один слот
  const COL_WIDTH   = 110;      // px ширина колонки врача

  const specializations = ["all", ...Array.from(new Set(DOCTORS.map(d => d.specialization)))];

  // Список дат для отображения (1..viewDays)
  const dateCols: Date[] = Array.from({ length: viewDays }, (_, i) => addDays(currentDate, i));

  // Видимые врачи — фильтрация по специализации И по чекбоксам
  const visibleDoctors = DOCTORS.filter(d =>
    (selectedSpec === "all" || d.specialization === selectedSpec) &&
    checkedDoctors.includes(d.id)
  );

  const toggleDoctor = (id: number) =>
    setCheckedDoctors(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);

  // Все врачи с учётом фильтра по специализации (для отображения в списке)
  const specDoctors = DOCTORS.filter(d =>
    selectedSpec === "all" || d.specialization === selectedSpec
  );

  // Колонки: если groupBy=doctor → по одному врачу; если spec → по специализации; но умножаем на кол-во дней
  type Col = { key: string; dateIdx: number; date: Date; docIds: number[]; label: string; color?: string };
  const columns: Col[] = [];

  dateCols.forEach((date, dateIdx) => {
    if (groupBy === "doctor") {
      visibleDoctors.forEach(d => {
        columns.push({ key: `${d.id}-${dateIdx}`, dateIdx, date, docIds: [d.id], label: d.shortName, color: d.color });
      });
    } else {
      Array.from(new Set(visibleDoctors.map(d => d.specialization))).forEach(spec => {
        const docIds = visibleDoctors.filter(d => d.specialization === spec).map(d => d.id);
        columns.push({ key: `${spec}-${dateIdx}`, dateIdx, date, docIds, label: spec });
      });
    }
  });

  // Скролл к 08:00 при загрузке
  useEffect(() => {
    if (gridRef.current) gridRef.current.scrollTop = 0;
  }, []);

  // Синхронизация горизонтального скролла шапки с телом сетки
  const onGridScroll = () => {
    if (gridRef.current && headerRef.current) {
      headerRef.current.scrollLeft = gridRef.current.scrollLeft;
    }
  };

  const currentTimeMin = 10 * 60 + 30;
  const currentTimePx  = ((currentTimeMin - DAY_START) / step) * slotHeight;

  const getApptForSlot = (docIds: number[], slotMin: number): Appointment | undefined =>
    APPOINTMENTS.find(a =>
      docIds.includes(a.doctorId) &&
      a.startMin <= slotMin &&
      a.startMin + a.durationMin > slotMin
    );

  // Закрытие тултипа при клике вне
  useEffect(() => {
    const handler = () => setTooltip(null);
    window.addEventListener("click", handler);
    return () => window.removeEventListener("click", handler);
  }, []);

  const handleApptMouseEnter = (e: React.MouseEvent, appt: Appointment) => {
    const rect = wrapRef.current?.getBoundingClientRect();
    if (!rect) return;
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    setTooltip({ appt, x, y });
  };

  return (
    <div ref={wrapRef} className="flex h-full overflow-hidden rounded-xl border border-border bg-card shadow-sm relative" style={{ minHeight: 0 }}>

      {/* ═══ Левая панель ═══ */}
      <div className="w-48 shrink-0 border-r border-border flex flex-col bg-muted/20 overflow-y-auto scrollbar-thin">

        {/* Вкладки Врачи / Кабинеты */}
        <div className="px-2 pt-2.5 pb-1.5 border-b border-border shrink-0">
          <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-1.5 px-1">Специалисты</div>
          <div className="flex gap-1">
            <button className="flex-1 py-1 text-xs rounded font-medium bg-primary text-primary-foreground">Врачи</button>
            <button className="flex-1 py-1 text-xs rounded font-medium text-muted-foreground hover:bg-muted transition-colors border border-border">Кабинеты</button>
          </div>
        </div>

        {/* Мини-календарь */}
        <div className="border-b border-border shrink-0">
          <MiniCalendar current={currentDate} onChange={setCurrentDate} />
        </div>

        {/* Шаг + Кол-во дней — два выпадающих select в одну строку */}
        <div className="px-2 py-2 border-b border-border shrink-0">
          <div className="flex gap-1.5">
            <select
              value={step}
              onChange={e => setStep(Number(e.target.value) as StepMin)}
              className="flex-1 text-[11px] border border-border rounded px-1.5 py-1 bg-background text-foreground outline-none cursor-pointer"
            >
              {STEP_OPTIONS.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label} мин</option>
              ))}
            </select>
            <select
              value={viewDays}
              onChange={e => setViewDays(Number(e.target.value) as ViewDays)}
              className="flex-1 text-[11px] border border-border rounded px-1.5 py-1 bg-background text-foreground outline-none cursor-pointer"
            >
              {DAYS_OPTIONS.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label} {opt.value === 1 ? "день" : opt.value < 5 ? "дня" : "дней"}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Группировка */}
        <div className="px-2 py-2 border-b border-border shrink-0">
          <div className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-1 px-0.5">Группировка</div>
          <div className="flex gap-1">
            <button
              onClick={() => setGroupBy("doctor")}
              className="flex-1 py-0.5 text-[11px] rounded font-medium transition-colors"
              style={groupBy === "doctor"
                ? { background: "hsl(199,85%,38%)", color: "white" }
                : { background: "hsl(var(--muted))", color: "hsl(var(--muted-foreground))" }
              }
            >
              По врачу
            </button>
            <button
              onClick={() => setGroupBy("specialization")}
              className="flex-1 py-0.5 text-[11px] rounded font-medium transition-colors"
              style={groupBy === "specialization"
                ? { background: "hsl(199,85%,38%)", color: "white" }
                : { background: "hsl(var(--muted))", color: "hsl(var(--muted-foreground))" }
              }
            >
              По спец.
            </button>
          </div>
        </div>

        {/* Поиск пациента */}
        <div className="px-2 py-2 border-b border-border shrink-0">
          <div className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-1 px-0.5">Поиск пациента</div>
          <div className="flex items-center gap-1 bg-background border border-border rounded px-2 py-1">
            <Icon name="Search" size={11} className="text-muted-foreground shrink-0" />
            <input
              value={patientSearch}
              onChange={e => setPatientSearch(e.target.value)}
              className="bg-transparent text-[11px] outline-none w-full placeholder:text-muted-foreground"
              placeholder="ФИО или телефон..."
            />
          </div>
        </div>

        {/* Специализации — раскрывающийся список */}
        <div className="flex-1 overflow-y-auto scrollbar-thin">
          {/* Заголовок-аккордеон */}
          <button
            onClick={() => setSpecOpen(v => !v)}
            className="w-full flex items-center justify-between px-2 py-1.5 border-b border-border hover:bg-muted/40 transition-colors"
          >
            <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Специализации</span>
            <Icon name={specOpen ? "ChevronUp" : "ChevronDown"} size={11} className="text-muted-foreground" />
          </button>

          {specOpen && (
            <div>
              {/* Все */}
              <button
                onClick={() => setSelectedSpec("all")}
                className="w-full text-left px-3 py-1 text-[11px] transition-colors flex items-center justify-between"
                style={selectedSpec === "all"
                  ? { color: "hsl(199,85%,38%)", background: "hsl(199,85%,38%,0.07)", borderLeft: "2px solid hsl(199,85%,38%)" }
                  : { color: "hsl(var(--muted-foreground))", borderLeft: "2px solid transparent" }}
              >
                <span>Все</span>
                {selectedSpec === "all" && <Icon name="Check" size={10} />}
              </button>
              {specializations.slice(1).map(spec => (
                <button
                  key={spec}
                  onClick={() => setSelectedSpec(selectedSpec === spec ? "all" : spec)}
                  className="w-full text-left px-3 py-1 text-[11px] transition-colors flex items-center justify-between"
                  style={selectedSpec === spec
                    ? { color: "hsl(199,85%,38%)", background: "hsl(199,85%,38%,0.07)", borderLeft: "2px solid hsl(199,85%,38%)" }
                    : { color: "hsl(var(--foreground))", borderLeft: "2px solid transparent" }}
                >
                  <span>{spec}</span>
                  {selectedSpec === spec && <Icon name="Check" size={10} />}
                </button>
              ))}
            </div>
          )}

          {/* Врачи — раскрывающийся список с чекбоксами */}
          <button
            onClick={() => setDoctorsOpen(v => !v)}
            className="w-full flex items-center justify-between px-2 py-1.5 border-t border-b border-border hover:bg-muted/40 transition-colors mt-1"
          >
            <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Врачи</span>
            <Icon name={doctorsOpen ? "ChevronUp" : "ChevronDown"} size={11} className="text-muted-foreground" />
          </button>

          {doctorsOpen && (
            <div>
              {specDoctors.map(d => {
                const checked = checkedDoctors.includes(d.id);
                return (
                  <button
                    key={d.id}
                    onClick={() => toggleDoctor(d.id)}
                    className="w-full flex items-center gap-2 px-2.5 py-1 hover:bg-muted/40 transition-colors"
                  >
                    {/* Чекбокс */}
                    <div
                      className="w-3.5 h-3.5 rounded shrink-0 flex items-center justify-center border"
                      style={{
                        background: checked ? d.color : "transparent",
                        borderColor: checked ? d.color : "hsl(var(--border))",
                      }}
                    >
                      {checked && <Icon name="Check" size={9} className="text-white" />}
                    </div>
                    <div className="w-2 h-2 rounded-full shrink-0" style={{ background: d.color }} />
                    <span className="text-[11px] text-foreground truncate">{d.shortName}</span>
                  </button>
                );
              })}
              {/* Выбрать все / Снять */}
              <div className="flex gap-1 px-2 py-1.5 border-t border-border mt-0.5">
                <button
                  onClick={() => setCheckedDoctors(specDoctors.map(d => d.id))}
                  className="flex-1 text-[9px] font-medium text-primary hover:opacity-70 transition-opacity text-left"
                >
                  Все
                </button>
                <span className="text-muted-foreground text-[9px]">·</span>
                <button
                  onClick={() => setCheckedDoctors([])}
                  className="flex-1 text-[9px] font-medium text-muted-foreground hover:opacity-70 transition-opacity text-right"
                >
                  Снять
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Кнопка новая запись */}
        <div className="p-2 border-t border-border shrink-0">
          <button className="w-full flex items-center justify-center gap-1 py-1.5 rounded-lg text-xs font-medium text-white transition-opacity hover:opacity-90"
            style={{ background: "linear-gradient(90deg, hsl(199,85%,38%), hsl(162,60%,40%))" }}>
            <Icon name="Plus" size={13} />Новая запись
          </button>
        </div>
      </div>

      {/* ═══ Правая: шапка + сетка ═══ */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">

        {/* Шапка: фиксированная колонка времени + скроллируемые врачи */}
        <div className="flex shrink-0 border-b border-border" style={{ background: "hsl(var(--muted)/0.15)" }}>
          {/* Фиксированная колонка времени */}
          <div className="shrink-0 border-r border-border" style={{ width: 44 }} />
          {/* Скроллируемая область — overflow hidden, скролл синхронный с телом */}
          <div ref={headerRef} className="flex-1 overflow-hidden">
            {/* Структура: для каждого дня — один блок дата + врачи под ней */}
            <div className="flex" style={{ width: `${columns.length * COL_WIDTH}px` }}>
              {dateCols.map((date, dateIdx) => {
                // Колонки врачей этого дня
                const dayCols = columns.filter(c => c.dateIdx === dateIdx);
                if (!dayCols.length) return null;
                const isToday = isSameDay(date, new Date(2026, 4, 21));
                const dateStr = viewDays <= 3
                  ? (() => {
                      const wd = getDayOfWeek(date);
                      return `${wd.charAt(0).toUpperCase() + wd.slice(1)}, ${date.getDate()} ${MONTHS_GEN[date.getMonth()]}`;
                    })()
                  : `${date.getDate()}.${(date.getMonth()+1).toString().padStart(2,"0")}`;
                return (
                  <div key={dateIdx} style={{ width: dayCols.length * COL_WIDTH, borderRight: "2px solid hsl(var(--border))" }}>
                    {/* Одна строка даты над всеми врачами этого дня */}
                    <div
                      className="text-[10px] font-semibold py-0.5 border-b border-border text-center truncate px-1"
                      style={{
                        background: isToday ? "hsl(199,85%,38%,0.1)" : "hsl(var(--muted)/0.4)",
                        color: isToday ? "hsl(199,85%,38%)" : "hsl(var(--foreground))",
                      }}
                    >
                      {dateStr}
                    </div>
                    {/* Строки врачей этого дня */}
                    <div className="flex">
                      {dayCols.map(col => (
                        <div
                          key={col.key}
                          className="border-r last:border-r-0 border-border text-center py-0.5 px-1"
                          style={{ width: COL_WIDTH, minWidth: COL_WIDTH }}
                        >
                          <div
                            className="text-[10px] font-semibold truncate leading-tight"
                            style={{ color: col.color || "hsl(var(--foreground))" }}
                          >
                            {col.label}
                          </div>
                          {groupBy === "doctor" && (
                            <div className="text-[9px] text-muted-foreground truncate leading-tight">
                              {DOCTORS.find(d => d.id === col.docIds[0])?.specialization}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Сетка со скроллом */}
        <div ref={gridRef} className="flex-1 overflow-auto scrollbar-thin" onScroll={onGridScroll}>
          <div className="flex" style={{ minHeight: `${totalSlots * slotHeight}px` }}>
            {/* Колонка времени */}
            <div className="shrink-0 border-r border-border relative" style={{ width: 44 }}>
              {/* Линия текущего времени — маркер слева */}
              <div className="absolute right-0 z-10 flex items-center" style={{ top: `${currentTimePx}px` }}>
                <div className="w-2 h-2 rounded-full bg-red-500 translate-x-1" />
              </div>
              {Array.from({ length: totalSlots }, (_, si) => {
                const slotMin = DAY_START + si * step;
                const showTime = slotMin % 60 === 0;
                return (
                  <div
                    key={si}
                    className="flex items-start justify-end pr-1.5"
                    style={{ height: slotHeight, borderBottom: "1px solid hsl(var(--border)/0.3)" }}
                  >
                    {showTime && (
                      <span className="text-[10px] text-muted-foreground font-medium leading-none mt-0.5">
                        {minToTime(slotMin)}
                      </span>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Колонки врачей — сгруппированы по дням */}
            <div className="flex" style={{ width: `${columns.length * COL_WIDTH}px` }}>
              {columns.map((col, colIdx) => {
                const pxPerMin = slotHeight / step;
                const colAppts = APPOINTMENTS.filter(a => col.docIds.includes(a.doctorId));
                // Последняя колонка дня — правая граница толще
                const isLastOfDay = colIdx === columns.length - 1 ||
                  columns[colIdx + 1]?.dateIdx !== col.dateIdx;

                return (
                  <div
                    key={col.key}
                    className="relative shrink-0"
                    style={{
                      width: COL_WIDTH,
                      height: totalSlots * slotHeight,
                      borderRight: isLastOfDay
                        ? "2px solid hsl(var(--border))"
                        : "1px solid hsl(var(--border)/0.4)",
                    }}
                  >
                    {/* Линия текущего времени */}
                    <div
                      className="absolute left-0 right-0 z-10 pointer-events-none"
                      style={{ top: `${currentTimePx}px` }}
                    >
                      <div className="h-0.5 bg-red-400 opacity-60" />
                    </div>

                    {/* Фоновая сетка слотов */}
                    {Array.from({ length: totalSlots }, (_, si) => {
                      const slotMin = DAY_START + si * step;
                      const isHour  = slotMin % 60 === 0;
                      return (
                        <div
                          key={si}
                          className={`absolute left-0 right-0 ${isHour ? "bg-muted/5" : ""} hover:bg-primary/[0.03] cursor-pointer`}
                          style={{
                            top: si * slotHeight,
                            height: slotHeight,
                            borderBottom: `1px solid hsl(var(--border)/${isHour ? "0.5" : "0.2"})`,
                          }}
                        />
                      );
                    })}

                    {/* Приёмы — абсолютно по реальным минутам, не зависят от шага */}
                    {colAppts.map(appt => {
                      const topPx = (appt.startMin - DAY_START) * pxPerMin;
                      // Минимальная высота 18px, чтобы приём всегда был виден
                      const apptH = Math.max(18, appt.durationMin * pxPerMin - 2);
                      const doc = DOCTORS.find(d => d.id === appt.doctorId);
                      return (
                        <div
                          key={appt.id}
                          className="absolute left-0.5 right-0.5 z-20 rounded overflow-hidden cursor-pointer select-none"
                          style={{
                            top: topPx + 1,
                            height: apptH,
                            background: doc?.color || "#1a9cbe",
                            opacity: appt.status === "done" ? 0.55 : 1,
                          }}
                          onMouseEnter={e => { e.stopPropagation(); handleApptMouseEnter(e, appt); }}
                          onMouseLeave={() => setTooltip(null)}
                          onClick={e => e.stopPropagation()}
                        >
                          <div className="absolute left-0 top-0 bottom-0 w-1 bg-white/30" />
                          <div className="pl-2 pr-1 pt-0.5 h-full overflow-hidden">
                            <div className="text-white text-[10px] font-bold leading-tight truncate">
                              {minToTime(appt.startMin)}–{minToTime(appt.startMin + appt.durationMin)}
                            </div>
                            {apptH > 22 && (
                              <div className="text-white/90 text-[10px] leading-tight truncate font-medium">
                                {appt.patientName}
                              </div>
                            )}
                            {apptH > 38 && (
                              <div className="text-white/70 text-[10px] leading-tight truncate">
                                {appt.service}
                              </div>
                            )}
                            {appt.isFirstVisit && apptH > 52 && (
                              <span className="inline-block text-[9px] bg-white/20 rounded px-1 leading-tight mt-0.5">Первичный</span>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* ═══ Тултип при наведении ═══ */}
      {tooltip && (
        <div
          className="absolute z-50 pointer-events-none"
          style={{
            left: Math.min(tooltip.x + 12, (wrapRef.current?.offsetWidth || 800) - 220),
            top:  Math.min(tooltip.y + 8,  (wrapRef.current?.offsetHeight || 600) - 160),
          }}
        >
          <div className="bg-card border border-border rounded-xl shadow-xl p-3 w-52">
            {/* Цветная полоска */}
            <div
              className="h-1 rounded-full mb-2.5"
              style={{ background: DOCTORS.find(d => d.id === tooltip.appt.doctorId)?.color || "#1a9cbe" }}
            />
            <div className="text-xs font-bold text-foreground leading-tight mb-0.5">
              {tooltip.appt.patientName}
            </div>
            <div className="text-[11px] text-primary font-semibold mb-2">
              {minToTime(tooltip.appt.startMin)} — {minToTime(tooltip.appt.startMin + tooltip.appt.durationMin)}
              <span className="text-muted-foreground font-normal ml-1">({tooltip.appt.durationMin} мин)</span>
            </div>
            <div className="space-y-1">
              <div className="flex items-start gap-1.5">
                <Icon name="Stethoscope" size={11} className="text-muted-foreground mt-0.5 shrink-0" />
                <span className="text-[11px] text-foreground">{tooltip.appt.service}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Icon name="User" size={11} className="text-muted-foreground shrink-0" />
                <span className="text-[11px] text-muted-foreground">
                  {DOCTORS.find(d => d.id === tooltip.appt.doctorId)?.shortName}
                </span>
              </div>
              {tooltip.appt.phone && (
                <div className="flex items-center gap-1.5">
                  <Icon name="Phone" size={11} className="text-muted-foreground shrink-0" />
                  <span className="text-[11px] text-foreground">{tooltip.appt.phone}</span>
                </div>
              )}
              {tooltip.appt.isFirstVisit && (
                <div className="flex items-center gap-1.5 mt-1">
                  <span className="text-[10px] bg-blue-50 text-blue-600 border border-blue-100 rounded px-1.5 py-0.5 font-medium">
                    Первичный приём
                  </span>
                </div>
              )}
              <div className="flex items-center gap-1.5 mt-1">
                <span className={`text-[10px] rounded px-1.5 py-0.5 font-medium ${
                  tooltip.appt.status === "done"        ? "bg-gray-100 text-gray-500" :
                  tooltip.appt.status === "in_progress" ? "bg-green-50 text-green-600" :
                  tooltip.appt.status === "cancelled"   ? "bg-red-50 text-red-500" :
                                                          "bg-blue-50 text-blue-600"
                }`}>
                  {tooltip.appt.status === "done" ? "Завершён" :
                   tooltip.appt.status === "in_progress" ? "Идёт приём" :
                   tooltip.appt.status === "cancelled" ? "Отменён" : "Ожидает"}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}