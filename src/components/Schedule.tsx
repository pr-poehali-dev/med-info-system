import { useState, useRef, useEffect } from "react";
import Icon from "@/components/ui/icon";

// ─── Типы ────────────────────────────────────────────────────────────────────

type ViewMode = "day" | "2days" | "3days" | "week" | "2weeks" | "month";
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
  startMin: number; // минуты от начала дня
  durationMin: number;
  status: "scheduled" | "in_progress" | "done" | "cancelled";
  isFirstVisit?: boolean;
  comment?: string;
}

// ─── Данные ──────────────────────────────────────────────────────────────────

const DOCTORS: Doctor[] = [
  { id: 1, name: "Петров Андрей Викторович", shortName: "Петров А.В.", specialization: "Терапевт", color: "#1a9cbe" },
  { id: 2, name: "Белова Наталья Ивановна", shortName: "Белова Н.И.", specialization: "УЗИ-специалист", color: "#20a869" },
  { id: 3, name: "Захаров Сергей Дмитриевич", shortName: "Захаров С.Д.", specialization: "Кардиолог", color: "#e67e22" },
  { id: 4, name: "Орлова Юлия Максимовна", shortName: "Орлова Ю.М.", specialization: "Гинеколог", color: "#9b59b6" },
  { id: 5, name: "Смирнов Павел Олегович", shortName: "Смирнов П.О.", specialization: "Хирург", color: "#c0392b" },
];

const APPOINTMENTS: Appointment[] = [
  { id: 1, doctorId: 1, patientName: "Иванова М.С.", service: "Первичный осмотр", startMin: 660, durationMin: 30, status: "done" },
  { id: 2, doctorId: 2, patientName: "Сидоров К.П.", service: "УЗИ брюшной полости", startMin: 585, durationMin: 25, status: "done" },
  { id: 3, doctorId: 1, patientName: "Козлова Т.А.", service: "Повторный приём", startMin: 630, durationMin: 20, status: "in_progress" },
  { id: 4, doctorId: 3, patientName: "Морозов И.Е.", service: "Консультация кардиолога", startMin: 675, durationMin: 30, status: "scheduled", isFirstVisit: true },
  { id: 5, doctorId: 2, patientName: "Федорова О.Н.", service: "Гастроскопия", startMin: 720, durationMin: 45, status: "scheduled" },
  { id: 6, doctorId: 3, patientName: "Волков Д.С.", service: "ЭКГ + консультация", startMin: 810, durationMin: 40, status: "scheduled" },
  { id: 7, doctorId: 1, patientName: "Новикова А.П.", service: "Осмотр хирурга", startMin: 855, durationMin: 30, status: "scheduled" },
  { id: 8, doctorId: 4, patientName: "Тимофеева Р.С.", service: "Гинекологический осмотр", startMin: 720, durationMin: 30, status: "scheduled", isFirstVisit: true },
  { id: 9, doctorId: 5, patientName: "Громов В.И.", service: "Хирургическая консультация", startMin: 780, durationMin: 30, status: "scheduled" },
];

// ─── Вспомогательные функции ─────────────────────────────────────────────────

const STEP_OPTIONS: { label: string; value: StepMin }[] = [
  { label: "5 мин", value: 5 },
  { label: "10 мин", value: 10 },
  { label: "15 мин", value: 15 },
  { label: "20 мин", value: 20 },
  { label: "30 мин", value: 30 },
  { label: "40 мин", value: 40 },
  { label: "45 мин", value: 45 },
  { label: "1 час", value: 60 },
  { label: "1.5 часа", value: 90 },
];

const VIEW_OPTIONS: { label: string; value: ViewMode }[] = [
  { label: "1 день", value: "day" },
  { label: "2 дня", value: "2days" },
  { label: "3 дня", value: "3days" },
  { label: "Неделя", value: "week" },
  { label: "2 недели", value: "2weeks" },
  { label: "Месяц", value: "month" },
];

function minToTime(min: number): string {
  const h = Math.floor(min / 60).toString().padStart(2, "0");
  const m = (min % 60).toString().padStart(2, "0");
  return `${h}:${m}`;
}

const statusColors: Record<string, string> = {
  done: "#b0bec5",
  in_progress: "#43a047",
  scheduled: "#1a9cbe",
  cancelled: "#e57373",
};

const statusLabels: Record<string, string> = {
  done: "Завершён",
  in_progress: "Идёт приём",
  scheduled: "Ожидает",
  cancelled: "Отменён",
};

// ─── Компонент ───────────────────────────────────────────────────────────────

export default function Schedule() {
  const [step, setStep] = useState<StepMin>(30);
  const [view, setView] = useState<ViewMode>("day");
  const [groupBy, setGroupBy] = useState<GroupBy>("doctor");
  const [selectedSpec, setSelectedSpec] = useState<string>("all");
  const [selectedDoctors, setSelectedDoctors] = useState<number[]>(DOCTORS.map(d => d.id));
  const [currentDate, setCurrentDate] = useState(new Date(2026, 4, 21));
  const [showStepDropdown, setShowStepDropdown] = useState(false);
  const [showViewDropdown, setShowViewDropdown] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [hoveredAppt, setHoveredAppt] = useState<number | null>(null);
  const gridRef = useRef<HTMLDivElement>(null);

  // Начало/конец рабочего дня
  const DAY_START = 9 * 60; // 09:00
  const DAY_END = 18 * 60;  // 18:00
  const totalSlots = (DAY_END - DAY_START) / step;
  const slotHeight = 44; // px на слот

  const specializations = ["all", ...Array.from(new Set(DOCTORS.map(d => d.specialization)))];

  const visibleDoctors = DOCTORS.filter(d => {
    if (selectedSpec !== "all" && d.specialization !== selectedSpec) return false;
    if (!selectedDoctors.includes(d.id)) return false;
    return true;
  });

  const columns = groupBy === "specialization"
    ? Array.from(new Set(visibleDoctors.map(d => d.specialization))).map(spec => ({
        key: spec,
        label: spec,
        doctors: visibleDoctors.filter(d => d.specialization === spec),
      }))
    : visibleDoctors.map(d => ({
        key: String(d.id),
        label: d.shortName,
        doctors: [d],
      }));

  const getApptForSlot = (docIds: number[], slotMin: number): Appointment | undefined => {
    return APPOINTMENTS.find(a =>
      docIds.includes(a.doctorId) &&
      a.startMin <= slotMin &&
      a.startMin + a.durationMin > slotMin
    );
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString("ru-RU", { weekday: "short", day: "numeric", month: "long" });
  };

  const dateTitle = formatDate(currentDate);

  // Скролл к текущему времени при загрузке
  useEffect(() => {
    if (gridRef.current) {
      const now = new Date();
      const nowMin = now.getHours() * 60 + now.getMinutes();
      const scrollTo = ((nowMin - DAY_START) / step) * slotHeight - 80;
      gridRef.current.scrollTop = Math.max(0, scrollTo);
    }
  }, []);

  const currentTimeMin = 10 * 60 + 30; // 10:30 — текущее время
  const currentTimePx = ((currentTimeMin - DAY_START) / step) * slotHeight;

  return (
    <div className="flex h-full overflow-hidden rounded-xl border border-border bg-card shadow-sm" style={{ minHeight: 0 }}>
      {/* ── Левая панель ── */}
      <div className="w-52 shrink-0 border-r border-border flex flex-col bg-muted/20">
        {/* Заголовок */}
        <div className="px-3 py-3 border-b border-border">
          <div className="text-xs font-bold text-foreground uppercase tracking-wider mb-2">Специалисты</div>

          {/* Вкладки Врачи / Кабинеты */}
          <div className="flex gap-1 mb-3">
            <button className="flex-1 py-1 text-xs rounded font-medium bg-primary text-primary-foreground">Врачи</button>
            <button className="flex-1 py-1 text-xs rounded font-medium text-muted-foreground hover:bg-muted transition-colors">Кабинеты</button>
          </div>

          {/* Фильтр по услуге */}
          <div className="text-xs text-muted-foreground mb-1">Фильтр по услуге</div>
          <div className="flex items-center gap-1 bg-background border border-border rounded px-2 py-1 mb-2">
            <Icon name="Search" size={12} className="text-muted-foreground shrink-0" />
            <input
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="bg-transparent text-xs outline-none w-full placeholder:text-muted-foreground"
              placeholder="Поиск..."
            />
          </div>
        </div>

        {/* Список специализаций */}
        <div className="flex-1 overflow-y-auto scrollbar-thin">
          <button
            onClick={() => setSelectedSpec("all")}
            className={`w-full text-left px-3 py-2 text-xs font-medium transition-colors ${
              selectedSpec === "all"
                ? "bg-primary/10 text-primary border-l-2 border-primary"
                : "text-muted-foreground hover:bg-muted"
            }`}
          >
            Все
          </button>
          {specializations.slice(1).map(spec => {
            const docs = DOCTORS.filter(d => d.specialization === spec);
            const isActive = selectedSpec === spec;
            return (
              <button
                key={spec}
                onClick={() => setSelectedSpec(isActive ? "all" : spec)}
                className={`w-full text-left px-3 py-2 text-xs transition-colors ${
                  isActive
                    ? "bg-primary/10 text-primary border-l-2 border-primary font-medium"
                    : "text-foreground hover:bg-muted"
                }`}
              >
                {spec}
                <span className="text-muted-foreground ml-1">({docs.length})</span>
              </button>
            );
          })}
        </div>

        {/* Нижняя кнопка */}
        <div className="p-3 border-t border-border">
          <button className="w-full flex items-center justify-center gap-1 py-2 bg-primary text-primary-foreground rounded-lg text-xs font-medium hover:opacity-90">
            <Icon name="Plus" size={13} />
            Новая запись
          </button>
        </div>
      </div>

      {/* ── Основная область ── */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Тулбар */}
        <div className="flex items-center gap-2 px-4 py-2.5 border-b border-border bg-muted/10 flex-wrap shrink-0">
          {/* Дата */}
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setCurrentDate(d => { const nd = new Date(d); nd.setDate(nd.getDate() - 1); return nd; })}
              className="p-1.5 rounded hover:bg-muted transition-colors border border-border"
            >
              <Icon name="ChevronLeft" size={14} />
            </button>
            <button className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded border border-border hover:bg-muted transition-colors">
              <Icon name="Calendar" size={13} className="text-primary" />
              {dateTitle}
            </button>
            <button
              onClick={() => setCurrentDate(d => { const nd = new Date(d); nd.setDate(nd.getDate() + 1); return nd; })}
              className="p-1.5 rounded hover:bg-muted transition-colors border border-border"
            >
              <Icon name="ChevronRight" size={14} />
            </button>
          </div>

          {/* Разделитель */}
          <div className="h-5 w-px bg-border mx-1" />

          {/* Шаг сетки */}
          <div className="relative">
            <button
              onClick={() => { setShowStepDropdown(v => !v); setShowViewDropdown(false); }}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs border border-border rounded hover:bg-muted transition-colors font-medium"
            >
              <Icon name="Grid3x3" size={13} className="text-primary" />
              {STEP_OPTIONS.find(s => s.value === step)?.label}
              <Icon name="ChevronDown" size={12} className="text-muted-foreground" />
            </button>
            {showStepDropdown && (
              <div className="absolute top-full left-0 mt-1 bg-card border border-border rounded-lg shadow-lg z-50 py-1 w-32">
                {STEP_OPTIONS.map(opt => (
                  <button
                    key={opt.value}
                    onClick={() => { setStep(opt.value); setShowStepDropdown(false); }}
                    className={`w-full text-left px-3 py-1.5 text-xs hover:bg-muted transition-colors ${step === opt.value ? "text-primary font-semibold" : "text-foreground"}`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Вид (день/неделя/...) */}
          <div className="relative">
            <button
              onClick={() => { setShowViewDropdown(v => !v); setShowStepDropdown(false); }}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs border border-border rounded hover:bg-muted transition-colors font-medium"
            >
              <Icon name="CalendarDays" size={13} className="text-primary" />
              {VIEW_OPTIONS.find(v => v.value === view)?.label}
              <Icon name="ChevronDown" size={12} className="text-muted-foreground" />
            </button>
            {showViewDropdown && (
              <div className="absolute top-full left-0 mt-1 bg-card border border-border rounded-lg shadow-lg z-50 py-1 w-32">
                {VIEW_OPTIONS.map(opt => (
                  <button
                    key={opt.value}
                    onClick={() => { setView(opt.value); setShowViewDropdown(false); }}
                    className={`w-full text-left px-3 py-1.5 text-xs hover:bg-muted transition-colors ${view === opt.value ? "text-primary font-semibold" : "text-foreground"}`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Группировка */}
          <div className="flex rounded border border-border overflow-hidden text-xs">
            <button
              onClick={() => setGroupBy("doctor")}
              className={`px-3 py-1.5 font-medium transition-colors ${groupBy === "doctor" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-muted"}`}
            >
              По врачу
            </button>
            <button
              onClick={() => setGroupBy("specialization")}
              className={`px-3 py-1.5 font-medium transition-colors ${groupBy === "specialization" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-muted"}`}
            >
              По специализации
            </button>
          </div>

          {/* Поиск пациента */}
          <div className="ml-auto flex items-center gap-1.5 bg-background border border-border rounded px-3 py-1.5">
            <Icon name="Search" size={13} className="text-muted-foreground" />
            <input className="text-xs bg-transparent outline-none w-32 placeholder:text-muted-foreground" placeholder="Поиск пациента..." />
          </div>
        </div>

        {/* Сетка */}
        <div className="flex-1 overflow-hidden flex flex-col min-h-0">
          {/* Шапка с врачами */}
          <div className="flex shrink-0 border-b border-border bg-muted/20">
            {/* Колонка времени */}
            <div className="w-14 shrink-0 border-r border-border" />
            {/* Колонки врачей */}
            <div className="flex-1 flex overflow-hidden">
              {columns.map((col, ci) => (
                <div
                  key={col.key}
                  className="flex-1 min-w-[120px] px-2 py-2.5 border-r last:border-r-0 border-border text-center"
                >
                  {groupBy === "specialization" ? (
                    <>
                      <div className="text-xs font-bold text-foreground">{col.label}</div>
                      <div className="text-xs text-muted-foreground mt-0.5">{col.doctors.length} врачей</div>
                    </>
                  ) : (
                    <>
                      <div
                        className="inline-block w-7 h-7 rounded-full text-white text-xs font-bold leading-7 mb-1"
                        style={{ background: col.doctors[0]?.color }}
                      >
                        {col.doctors[0]?.shortName.split(" ").map(p => p[0]).join("").slice(0, 2)}
                      </div>
                      <div className="text-xs font-semibold text-foreground leading-tight">{col.label}</div>
                      <div className="text-xs text-muted-foreground">{col.doctors[0]?.specialization}</div>
                    </>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Тело сетки со скроллом */}
          <div ref={gridRef} className="flex-1 overflow-y-auto scrollbar-thin relative">
            {/* Линия текущего времени */}
            <div
              className="absolute left-14 right-0 z-10 pointer-events-none"
              style={{ top: `${currentTimePx}px` }}
            >
              <div className="relative">
                <div className="absolute -left-1 -top-1.5 w-2.5 h-2.5 rounded-full bg-red-500" />
                <div className="h-0.5 w-full bg-red-400 opacity-80" />
              </div>
            </div>

            {Array.from({ length: totalSlots }, (_, si) => {
              const slotMin = DAY_START + si * step;
              const isHour = slotMin % 60 === 0;
              const isHalfHour = slotMin % 30 === 0 && !isHour;

              return (
                <div
                  key={si}
                  className="flex border-b border-border/40"
                  style={{ height: `${slotHeight}px` }}
                >
                  {/* Время */}
                  <div
                    className={`w-14 shrink-0 border-r border-border flex items-start justify-end pr-2 pt-1 ${
                      isHour ? "bg-muted/10" : ""
                    }`}
                  >
                    {(isHour || step >= 30) && (
                      <span className={`text-xs ${isHour ? "font-semibold text-foreground" : "text-muted-foreground"}`}>
                        {minToTime(slotMin)}
                      </span>
                    )}
                  </div>

                  {/* Колонки */}
                  <div className="flex-1 flex">
                    {columns.map((col, ci) => {
                      const docIds = col.doctors.map(d => d.id);
                      const appt = getApptForSlot(docIds, slotMin);
                      const isFirstSlot = appt && appt.startMin === slotMin;
                      const apptHeightSlots = appt ? appt.durationMin / step : 1;
                      const apptHeightPx = apptHeightSlots * slotHeight;
                      const doc = appt ? DOCTORS.find(d => d.id === appt.doctorId) : null;

                      return (
                        <div
                          key={col.key}
                          className={`flex-1 min-w-[120px] border-r last:border-r-0 border-border/40 relative ${
                            isHour ? "bg-muted/5" : ""
                          } hover:bg-primary/3 transition-colors cursor-pointer`}
                          onClick={() => {
                            if (!appt) {
                              // Клик на пустую ячейку — новая запись
                            }
                          }}
                        >
                          {isFirstSlot && appt && (
                            <div
                              className="absolute left-1 right-1 z-20 rounded overflow-hidden cursor-pointer transition-all"
                              style={{
                                top: "2px",
                                height: `${apptHeightPx - 4}px`,
                                background: doc?.color || statusColors[appt.status],
                                opacity: hoveredAppt === appt.id ? 0.85 : 1,
                                boxShadow: hoveredAppt === appt.id ? "0 4px 12px rgba(0,0,0,0.15)" : "0 1px 3px rgba(0,0,0,0.1)",
                              }}
                              onMouseEnter={() => setHoveredAppt(appt.id)}
                              onMouseLeave={() => setHoveredAppt(null)}
                            >
                              {/* Индикатор статуса */}
                              <div
                                className="absolute left-0 top-0 bottom-0 w-1"
                                style={{ background: "rgba(255,255,255,0.4)" }}
                              />
                              <div className="pl-2 pr-1 py-1 text-white h-full overflow-hidden">
                                <div className="text-xs font-bold leading-tight truncate">
                                  {minToTime(appt.startMin)}–{minToTime(appt.startMin + appt.durationMin)}
                                </div>
                                {apptHeightPx > 30 && (
                                  <div className="text-xs leading-tight truncate opacity-95 font-medium">
                                    {appt.patientName}
                                  </div>
                                )}
                                {apptHeightPx > 50 && (
                                  <div className="text-xs leading-tight truncate opacity-75">
                                    {appt.service}
                                  </div>
                                )}
                                {appt.isFirstVisit && apptHeightPx > 64 && (
                                  <div className="mt-0.5">
                                    <span className="text-xs bg-white/20 rounded px-1 py-0.5">Первичный</span>
                                  </div>
                                )}
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
