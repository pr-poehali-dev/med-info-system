import React, { useState } from "react";
import Icon from "@/components/ui/icon";
import Schedule from "@/components/Schedule";

type Section =
  | "schedule"
  | "dashboard"
  | "patients"
  | "crm"
  | "reports"
  | "plans"
  | "finances-payments"
  | "finances-dds"
  | "finances-pnl"
  | "protocols"
  | "documents"
  | "prices"
  | "print-services"
  | "work-schedule"
  | "employees"
  | "branches"
  | "rooms"
  | "settings";

// ─── Новая структура верхней навигации ───────────────────────────────────────
interface NavChild { id: Section; label: string; icon: string }
interface NavGroup  { id: string; label: string; icon: string; children: NavChild[] }

const TOP_NAV: NavGroup[] = [
  {
    id: "finances", label: "Финансы", icon: "Banknote",
    children: [
      { id: "finances-payments", label: "Платежи",  icon: "CreditCard" },
      { id: "finances-dds",      label: "ДДС",       icon: "ArrowLeftRight" },
      { id: "finances-pnl",      label: "ОПиУ",      icon: "TrendingUp" },
    ],
  },
  {
    id: "patients", label: "Пациенты", icon: "Users",
    children: [
      { id: "patients", label: "Пациенты", icon: "Users" },
      { id: "crm",      label: "CRM",      icon: "Handshake" },
    ],
  },
  {
    id: "analytics", label: "Аналитика", icon: "BarChart3",
    children: [
      { id: "dashboard", label: "Дашборд",  icon: "LayoutDashboard" },
      { id: "reports",   label: "Отчёты",   icon: "BarChart3" },
      { id: "plans",     label: "Планы",    icon: "Target" },
    ],
  },
  {
    id: "clinic", label: "Клиника", icon: "Building2",
    children: [
      { id: "employees",     label: "Сотрудники",            icon: "UserCheck" },
      { id: "branches",      label: "Филиалы",               icon: "Building2" },
      { id: "work-schedule", label: "График работы",         icon: "Clock" },
      { id: "rooms",         label: "Кабинеты",              icon: "DoorOpen" },
      { id: "protocols",     label: "Протоколы и шаблоны",   icon: "FileText" },
      { id: "documents",     label: "Договора и ИДС",        icon: "FolderOpen" },
      { id: "prices",        label: "Прайс-лист",            icon: "Tag" },
      { id: "print-services",label: "Перечень услуг",        icon: "Printer" },
      { id: "settings",      label: "Настройки",             icon: "Settings" },
    ],
  },
];

// Вспомогалка: по Section найти группу
function findGroup(section: Section): NavGroup | undefined {
  return TOP_NAV.find(g => g.children.some(c => c.id === section));
}

// Все дочерние секции для flatMap
const allNavItems = TOP_NAV.flatMap(g => g.children);

const groupLabels: Record<string, string> = {
  main: "Клиника",
  docs: "Документы",
  analytics: "Аналитика",
  staff: "Персонал",
  system: "Система",
};

const stats = [
  { label: "Приёмов сегодня", value: "24", sub: "+3 к вчера", icon: "CalendarCheck", color: "stat-card-blue" },
  { label: "Новых пациентов", value: "8", sub: "за неделю", icon: "UserPlus", color: "stat-card-green" },
  { label: "Выручка сегодня", value: "184 500 ₽", sub: "план 200 000 ₽", icon: "Banknote", color: "stat-card-teal" },
  { label: "Свободных окон", value: "11", sub: "на сегодня", icon: "CalendarX", color: "stat-card-slate" },
];

const todaySchedule = [
  { time: "09:00", patient: "Иванова М.С.", doctor: "Петров А.В.", service: "Первичный осмотр", status: "done" },
  { time: "09:45", patient: "Сидоров К.П.", doctor: "Белова Н.И.", service: "УЗИ брюшной полости", status: "done" },
  { time: "10:30", patient: "Козлова Т.А.", doctor: "Петров А.В.", service: "Повторный приём", status: "active" },
  { time: "11:15", patient: "Морозов И.Е.", doctor: "Захаров С.Д.", service: "Консультация кардиолога", status: "pending" },
  { time: "12:00", patient: "Федорова О.Н.", doctor: "Белова Н.И.", service: "Гастроскопия", status: "pending" },
  { time: "13:30", patient: "Волков Д.С.", doctor: "Захаров С.Д.", service: "ЭКГ + консультация", status: "pending" },
  { time: "14:15", patient: "Новикова А.П.", doctor: "Петров А.В.", service: "Осмотр хирурга", status: "pending" },
];

const recentPatients = [
  { name: "Иванова Мария Сергеевна", dob: "15.04.1985", phone: "+7 903 123-45-67", visits: 4, last: "21.05.2026" },
  { name: "Сидоров Константин Павлович", dob: "02.11.1972", phone: "+7 916 234-56-78", visits: 1, last: "21.05.2026" },
  { name: "Козлова Тамара Алексеевна", dob: "29.07.1990", phone: "+7 925 345-67-89", visits: 7, last: "20.05.2026" },
  { name: "Морозов Игорь Евгеньевич", dob: "10.01.1968", phone: "+7 977 456-78-90", visits: 2, last: "18.05.2026" },
  { name: "Федорова Ольга Николаевна", dob: "22.03.1995", phone: "+7 963 567-89-01", visits: 3, last: "15.05.2026" },
];

const employees = [
  { name: "Петров Андрей Викторович", role: "Терапевт", branch: "Центральный", status: "active", schedule: "Пн-Пт 9:00–18:00" },
  { name: "Белова Наталья Ивановна", role: "УЗИ-специалист", branch: "Центральный", status: "active", schedule: "Пн-Ср-Пт 9:00–15:00" },
  { name: "Захаров Сергей Дмитриевич", role: "Кардиолог", branch: "Северный", status: "active", schedule: "Вт-Чт 10:00–17:00" },
  { name: "Орлова Юлия Максимовна", role: "Гинеколог", branch: "Центральный", status: "vacation", schedule: "Пн-Пт 8:00–14:00" },
  { name: "Смирнов Павел Олегович", role: "Хирург", branch: "Северный", status: "active", schedule: "Ср-Пт 11:00–19:00" },
];

const priceList = [
  { code: "А01.31.001", name: "Первичный приём терапевта", price: "2 500", duration: "30 мин" },
  { code: "А01.31.002", name: "Повторный приём терапевта", price: "1 800", duration: "20 мин" },
  { code: "А04.16.001", name: "УЗИ брюшной полости", price: "3 200", duration: "25 мин" },
  { code: "А05.10.006", name: "ЭКГ с расшифровкой", price: "1 500", duration: "15 мин" },
  { code: "А01.17.001", name: "Консультация кардиолога", price: "3 000", duration: "30 мин" },
  { code: "А06.31.001", name: "Гастроскопия", price: "6 500", duration: "45 мин" },
];

const crmLeads = [
  { name: "Терехова Елена В.", channel: "Сайт", service: "Терапевт", date: "21.05", status: "new", sum: "2 500" },
  { name: "Григорьев Н.С.", channel: "Звонок", service: "Кардиолог", date: "20.05", status: "in-work", sum: "3 000" },
  { name: "Лукьянова А.Ф.", channel: "Instagram", service: "УЗИ", date: "20.05", status: "done", sum: "3 200" },
  { name: "Платонов В.О.", channel: "2ГИС", service: "Хирург", date: "19.05", status: "done", sum: "2 500" },
  { name: "Кузьмина О.Р.", channel: "Сарафан", service: "Гинеколог", date: "18.05", status: "lost", sum: "—" },
];

const branches = [
  { name: "Центральный", address: "ул. Ленина, 42", rooms: 8, doctors: 12 },
  { name: "Северный", address: "пр. Победы, 17", rooms: 4, doctors: 6 },
];

const rooms = [
  { number: "101", name: "Кабинет терапевта", branch: "Центральный", doctor: "Петров А.В.", status: "busy" },
  { number: "102", name: "УЗИ-кабинет", branch: "Центральный", doctor: "Белова Н.И.", status: "busy" },
  { number: "103", name: "Кабинет гинеколога", branch: "Центральный", doctor: "Орлова Ю.М.", status: "free" },
  { number: "104", name: "Процедурная", branch: "Центральный", doctor: "—", status: "free" },
  { number: "201", name: "Кабинет кардиолога", branch: "Северный", doctor: "Захаров С.Д.", status: "busy" },
  { number: "202", name: "Кабинет хирурга", branch: "Северный", doctor: "Смирнов П.О.", status: "free" },
];

const statusLabel: Record<string, { label: string; cls: string }> = {
  done: { label: "Завершён", cls: "badge-status-done" },
  active: { label: "Идёт приём", cls: "badge-status-active" },
  pending: { label: "Ожидает", cls: "badge-status-pending" },
  new: { label: "Новый", cls: "badge-status-pending" },
  "in-work": { label: "В работе", cls: "badge-status-active" },
  lost: { label: "Отказ", cls: "badge-status-done" },
  vacation: { label: "Отпуск", cls: "badge-status-pending" },
};

interface IndexProps {
  user?: { name: string; role: string } | null;
}

export default function Index({ user }: IndexProps) {
  const [active, setActive]       = useState<Section>("schedule");
  const [openGroup, setOpenGroup] = useState<string | null>(null); // hover-дропдаун
  const [pinnedGroup, setPinnedGroup] = useState<string | null>(null); // закреплённый сайдбар

  const activeGroup = findGroup(active);

  // Сайдбар показываем если есть закреплённая группа и это не расписание
  const showSidebar = active !== "schedule" && pinnedGroup !== null;
  const sidebarGroup = TOP_NAV.find(g => g.id === pinnedGroup);

  const handleNavClick = (group: NavGroup) => {
    // Клик по группе: закрепляем сайдбар и открываем первый дочерний пункт
    if (pinnedGroup === group.id) {
      setPinnedGroup(null);
    } else {
      setPinnedGroup(group.id);
      // Если текущий active не в этой группе — переключаем на первый пункт
      if (!group.children.some(c => c.id === active)) {
        setActive(group.children[0].id);
      }
    }
    setOpenGroup(null);
  };

  const handleScheduleClick = () => {
    setActive("schedule");
    setPinnedGroup(null);
    setOpenGroup(null);
  };

  return (
    <div className="flex flex-col h-screen bg-background overflow-hidden font-golos">

      {/* ═══ ВЕРХНЯЯ НАВИГАЦИЯ ═══ */}
      <header className="sidebar-gradient shrink-0 flex items-center px-4 h-14 border-b border-sidebar-border z-50 relative">

        {/* Логотип */}
        <div className="flex items-center gap-2.5 mr-6">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
            style={{ background: "linear-gradient(135deg, hsl(199,85%,55%), hsl(162,60%,48%))" }}>
            <Icon name="Heart" size={16} className="text-white" />
          </div>
          <div>
            <div className="text-white font-bold text-sm leading-tight">Ваш доктор</div>
            <div className="text-white/50 text-[10px]">МИС v1.0</div>
          </div>
        </div>

        {/* ── Расписание (отдельный пункт) ── */}
        <button
          onClick={handleScheduleClick}
          className={`flex items-center gap-2 px-3 py-2 rounded-lg mr-1 transition-all text-sm font-medium ${
            active === "schedule"
              ? "bg-white/20 text-white"
              : "text-white/70 hover:bg-white/10 hover:text-white"
          }`}
        >
          <Icon name="CalendarDays" size={17} />
          <span>Расписание</span>
        </button>

        {/* ── Группы с выпадающим меню ── */}
        {TOP_NAV.map(group => {
          const isOpen   = openGroup === group.id;
          const isPinned = pinnedGroup === group.id;
          const hasActive = group.children.some(c => c.id === active);
          return (
            <div key={group.id} className="relative"
              onMouseEnter={() => setOpenGroup(group.id)}
              onMouseLeave={() => setOpenGroup(null)}>
              <button
                onClick={() => handleNavClick(group)}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg mr-1 transition-all text-sm font-medium ${
                  isPinned || hasActive
                    ? "bg-white/20 text-white"
                    : "text-white/70 hover:bg-white/10 hover:text-white"
                }`}
              >
                <Icon name={group.icon} size={17} />
                <span>{group.label}</span>
                <Icon name="ChevronDown" size={13} className={`transition-transform ${isOpen ? "rotate-180" : ""}`} />
              </button>

              {/* Выпадающее меню при наведении */}
              {isOpen && (
                <div className="absolute top-full left-0 mt-1 bg-card border border-border rounded-xl shadow-2xl py-1.5 z-50 min-w-[200px] animate-fade-in">
                  <div className="px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-0.5">
                    {group.label}
                  </div>
                  {group.children.map(child => (
                    <button
                      key={child.id}
                      onClick={() => { setActive(child.id); setPinnedGroup(group.id); setOpenGroup(null); }}
                      className={`w-full flex items-center gap-2.5 px-3 py-2 text-sm transition-colors ${
                        active === child.id
                          ? "bg-primary/10 text-primary font-medium"
                          : "text-foreground hover:bg-muted"
                      }`}
                    >
                      <Icon name={child.icon} size={15} className={active === child.id ? "text-primary" : "text-muted-foreground"} />
                      {child.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          );
        })}

        {/* ── Правая часть ── */}
        <div className="ml-auto flex items-center gap-2">
          <button className="relative p-2 rounded-lg hover:bg-white/10 transition-colors">
            <Icon name="Bell" size={17} className="text-white/80" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-red-400" />
          </button>
          <div className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg hover:bg-white/10 cursor-pointer transition-colors">
            <div className="w-7 h-7 rounded-full flex items-center justify-center text-[11px] font-bold text-white shrink-0"
              style={{ background: "linear-gradient(135deg, hsl(199,85%,45%), hsl(162,60%,40%))" }}>
              {user?.name?.slice(0, 2).toUpperCase() || "АД"}
            </div>
            <div>
              <div className="text-white text-xs font-medium leading-tight">{user?.name || "Администратор"}</div>
              <div className="text-white/50 text-[10px] capitalize">{user?.role || "admin"}</div>
            </div>
          </div>
        </div>
      </header>

      {/* ═══ ТЕЛО: контекстный сайдбар + контент ═══ */}
      <div className="flex flex-1 overflow-hidden">

        {/* Контекстный левый сайдбар */}
        {showSidebar && sidebarGroup && (
          <aside className="w-52 shrink-0 sidebar-gradient border-r border-sidebar-border flex flex-col overflow-y-auto scrollbar-thin">
            <div className="px-3 pt-4 pb-2">
              <div className="text-white/50 text-[10px] font-bold uppercase tracking-wider px-2 mb-1">
                {sidebarGroup.label}
              </div>
              {sidebarGroup.children.map(child => (
                <button
                  key={child.id}
                  onClick={() => setActive(child.id)}
                  className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg mb-0.5 text-sm font-medium transition-all ${
                    active === child.id
                      ? "nav-item-active shadow-sm"
                      : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-white"
                  }`}
                >
                  <Icon name={child.icon} size={16} className="shrink-0" />
                  <span className="truncate">{child.label}</span>
                </button>
              ))}
            </div>
          </aside>
        )}

        {/* Контент */}
        <main className="flex-1 flex flex-col overflow-hidden">
          <div className={`flex-1 ${active === "schedule" ? "overflow-hidden flex flex-col p-0" : "overflow-y-auto scrollbar-thin p-6"}`}>
            <div className={`animate-fade-in ${active === "schedule" ? "h-full flex flex-col" : "max-w-[1280px]"}`}>
              {active === "schedule"          && <Schedule />}
              {active === "dashboard"         && <DashboardSection />}
              {active === "patients"          && <PatientsSection />}
              {active === "crm"               && <CRMSection />}
              {active === "reports"           && <ReportsSection />}
              {active === "plans"             && <PlansSection />}
              {active === "finances-payments" && <FinancesPlaceholder title="Платежи" />}
              {active === "finances-dds"      && <FinancesPlaceholder title="ДДС" />}
              {active === "finances-pnl"      && <FinancesPlaceholder title="ОПиУ" />}
              {active === "protocols"         && <ProtocolsSection />}
              {active === "documents"         && <DocumentsSection />}
              {active === "prices"            && <PricesSection />}
              {active === "print-services"    && <PrintServicesSection />}
              {active === "work-schedule"     && <WorkScheduleSection />}
              {active === "employees"         && <EmployeesSection />}
              {active === "branches"          && <BranchesSection />}
              {active === "rooms"             && <RoomsSection />}
              {active === "settings"          && <SettingsSection />}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

function FinancesPlaceholder({ title }: { title: string }) {
  return (
    <div className="flex flex-col items-center justify-center h-64 gap-3 text-center">
      <div className="w-14 h-14 rounded-2xl bg-muted flex items-center justify-center">
        <Icon name="Banknote" size={28} className="text-muted-foreground" />
      </div>
      <h2 className="text-lg font-semibold text-foreground">{title}</h2>
      <p className="text-sm text-muted-foreground max-w-xs">Раздел в разработке — будет добавлен в ближайшее время</p>
    </div>
  );
}

/* ─── DASHBOARD ─── */

// Специализации и демо-данные из МИС
type SpecKey = "therapist" | "uzi" | "cardio" | "gyneco" | "surgeon";
interface SpecDayData { primary: number; repeat: number; revenue: number; avgCheck: number; }
interface DaySnapshot {
  date: string;
  specs: Record<SpecKey, SpecDayData>;
  leads: { total: number; converted: number };
}

const DASH_SPECS: { key: SpecKey; label: string; color: string }[] = [
  { key: "therapist", label: "Терапевт",       color: "#1a9cbe" },
  { key: "uzi",       label: "УЗИ-специалист", color: "#20a869" },
  { key: "cardio",    label: "Кардиолог",       color: "#e67e22" },
  { key: "gyneco",    label: "Гинеколог",       color: "#9b59b6" },
  { key: "surgeon",   label: "Хирург",          color: "#c0392b" },
];

const DAY_HISTORY: Record<string, DaySnapshot> = {
  "2026-05-21": {
    date: "21 мая 2026, среда",
    specs: {
      therapist: { primary: 4, repeat: 3, revenue: 17_500, avgCheck: 2_500 },
      uzi:       { primary: 3, repeat: 2, revenue: 16_000, avgCheck: 3_200 },
      cardio:    { primary: 2, repeat: 2, revenue: 12_000, avgCheck: 3_000 },
      gyneco:    { primary: 2, repeat: 2, revenue: 14_000, avgCheck: 3_500 },
      surgeon:   { primary: 2, repeat: 1, revenue:  7_500, avgCheck: 2_500 },
    },
    leads: { total: 9, converted: 7 },
  },
  "2026-05-20": {
    date: "20 мая 2026, вторник",
    specs: {
      therapist: { primary: 5, repeat: 3, revenue: 20_000, avgCheck: 2_500 },
      uzi:       { primary: 3, repeat: 1, revenue: 12_800, avgCheck: 3_200 },
      cardio:    { primary: 2, repeat: 1, revenue:  9_000, avgCheck: 3_000 },
      gyneco:    { primary: 1, repeat: 2, revenue: 10_500, avgCheck: 3_500 },
      surgeon:   { primary: 1, repeat: 1, revenue:  5_000, avgCheck: 2_500 },
    },
    leads: { total: 8, converted: 5 },
  },
  "2026-05-19": {
    date: "19 мая 2026, понедельник",
    specs: {
      therapist: { primary: 6, repeat: 4, revenue: 25_000, avgCheck: 2_500 },
      uzi:       { primary: 2, repeat: 2, revenue: 12_800, avgCheck: 3_200 },
      cardio:    { primary: 3, repeat: 1, revenue: 12_000, avgCheck: 3_000 },
      gyneco:    { primary: 2, repeat: 1, revenue: 10_500, avgCheck: 3_500 },
      surgeon:   { primary: 2, repeat: 2, revenue: 10_000, avgCheck: 2_500 },
    },
    leads: { total: 11, converted: 7 },
  },
};

const MONTH_DATA = {
  month: "Май 2026",
  daysTotal: 31,
  daysPassed: 21,
  plan: 5_200_000,
  shouldBe: Math.round(5_200_000 / 31 * 21),
  fact: 919_947,
  specs: {
    therapist: { primary: 88, repeat: 62, revenue: 187_500, avgCheck: 1_250 },
    uzi:       { primary: 55, repeat: 38, revenue: 172_800, avgCheck: 1_867 },
    cardio:    { primary: 42, repeat: 35, revenue: 165_000, avgCheck: 2_143 },
    gyneco:    { primary: 38, repeat: 30, revenue: 189_000, avgCheck: 2_773 },
    surgeon:   { primary: 28, repeat: 22, revenue: 125_000, avgCheck: 2_500 },
  } as Record<SpecKey, SpecDayData>,
  leads: { total: 91, converted: 47, convPct: 51 },
};

function pct(fact: number, plan: number) { return Math.min(100, Math.round(fact / plan * 100)); }
function fmtNum(n: number) { return n.toLocaleString("ru-RU"); }
function fmtRub(n: number) { return fmtNum(n) + " ₽"; }

function ProgressBar({ value, max, color }: { value: number; max: number; color: string }) {
  const p = Math.min(100, Math.round(value / max * 100));
  return (
    <div className="h-2 rounded-full bg-muted overflow-hidden">
      <div className="h-full rounded-full transition-all duration-700" style={{ width: `${p}%`, background: color }} />
    </div>
  );
}

function KpiCard({ label, value, sub, icon, accent, pctVal }: {
  label: string; value: string; sub?: string; icon: string; accent: string; pctVal?: number;
}) {
  return (
    <div className="bg-card border border-border rounded-xl p-4 shadow-sm flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <span className="text-xs text-muted-foreground">{label}</span>
        <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: accent + "20" }}>
          <Icon name={icon} size={16} style={{ color: accent }} />
        </div>
      </div>
      <p className="text-xl font-bold text-foreground">{value}</p>
      {sub && <p className="text-xs text-muted-foreground">{sub}</p>}
      {pctVal !== undefined && (
        <div className="h-1.5 rounded-full bg-muted overflow-hidden">
          <div className="h-full rounded-full transition-all duration-700"
            style={{ width: `${pctVal}%`, background: accent }} />
        </div>
      )}
    </div>
  );
}

function SpecTable({ rows }: { rows: { label: string; primary: number; repeat: number; revenue: number; avgCheck: number; color: string }[] }) {
  const totals = rows.reduce((s, r) => ({
    primary: s.primary + r.primary, repeat: s.repeat + r.repeat,
    revenue: s.revenue + r.revenue, avgCheck: 0,
  }), { primary: 0, repeat: 0, revenue: 0, avgCheck: 0 });
  totals.avgCheck = totals.primary + totals.repeat > 0
    ? Math.round(totals.revenue / (totals.primary + totals.repeat)) : 0;

  return (
    <div className="overflow-hidden rounded-xl border border-border">
      <table className="w-full text-sm">
        <thead>
          <tr className="bg-muted/30 border-b border-border">
            <th className="text-left px-4 py-2.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Специализация</th>
            <th className="text-right px-3 py-2.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Первичных</th>
            <th className="text-right px-3 py-2.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Повторных</th>
            <th className="text-right px-3 py-2.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Всего</th>
            <th className="text-right px-4 py-2.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Выручка</th>
            <th className="text-right px-4 py-2.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Ср. чек</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {rows.map((r, i) => (
            <tr key={i} className="hover:bg-muted/20 transition-colors">
              <td className="px-4 py-2.5">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: r.color }} />
                  <span className="font-medium text-foreground">{r.label}</span>
                </div>
              </td>
              <td className="px-3 py-2.5 text-right font-medium text-foreground">{r.primary}</td>
              <td className="px-3 py-2.5 text-right text-muted-foreground">{r.repeat}</td>
              <td className="px-3 py-2.5 text-right font-semibold text-foreground">{r.primary + r.repeat}</td>
              <td className="px-4 py-2.5 text-right font-semibold" style={{ color: "hsl(162,60%,40%)" }}>{fmtRub(r.revenue)}</td>
              <td className="px-4 py-2.5 text-right text-muted-foreground">{fmtRub(r.avgCheck)}</td>
            </tr>
          ))}
          <tr className="bg-muted/10 border-t-2 border-border font-bold">
            <td className="px-4 py-2.5 text-foreground">Итого</td>
            <td className="px-3 py-2.5 text-right text-foreground">{totals.primary}</td>
            <td className="px-3 py-2.5 text-right text-foreground">{totals.repeat}</td>
            <td className="px-3 py-2.5 text-right text-foreground">{totals.primary + totals.repeat}</td>
            <td className="px-4 py-2.5 text-right" style={{ color: "hsl(162,60%,40%)" }}>{fmtRub(totals.revenue)}</td>
            <td className="px-4 py-2.5 text-right text-foreground">{fmtRub(totals.avgCheck)}</td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}

function DashboardSection() {
  const [tab, setTab]           = useState<"today" | "month">("today");
  const [selectedDate, setSelectedDate] = useState("2026-05-21");

  const daySnapshot = DAY_HISTORY[selectedDate] ?? DAY_HISTORY["2026-05-21"];
  const daySpecs    = daySnapshot.specs;
  const dayTotal    = DASH_SPECS.reduce((s, sp) => ({
    primary: s.primary + daySpecs[sp.key].primary,
    repeat:  s.repeat  + daySpecs[sp.key].repeat,
    revenue: s.revenue + daySpecs[sp.key].revenue,
  }), { primary: 0, repeat: 0, revenue: 0 });
  // Накопленные данные с начала месяца по выбранную дату (для ПП в день и ср. чека)
  const selD2 = new Date(selectedDate);
  const accumDay = (() => {
    let prim = 0, rev = 0;
    for (let d = 1; d <= selD2.getDate(); d++) {
      const ds = `${selD2.getFullYear()}-${String(selD2.getMonth()+1).padStart(2,"0")}-${String(d).padStart(2,"0")}`;
      const rep = DAY_HISTORY[ds];
      if (rep) {
        DASH_SPECS.forEach(sp => { prim += rep.specs[sp.key].primary; rev += rep.specs[sp.key].revenue; });
      }
    }
    return { primary: prim, revenue: rev };
  })();
  const dayPpInDay  = selD2.getDate() > 0 ? Math.round(accumDay.primary / selD2.getDate()) : 0;
  const dayAvgCheck = accumDay.primary > 0 ? Math.round(accumDay.revenue / accumDay.primary) : 0;

  const todaySpecRows = DASH_SPECS.map(sp => ({
    label:    sp.label,
    color:    sp.color,
    primary:  daySpecs[sp.key].primary,
    repeat:   daySpecs[sp.key].repeat,
    revenue:  daySpecs[sp.key].revenue,
    avgCheck: daySpecs[sp.key].avgCheck,
  }));

  const monthSpecRows = DASH_SPECS.map(sp => ({
    label:    sp.label,
    color:    sp.color,
    primary:  MONTH_DATA.specs[sp.key].primary,
    repeat:   MONTH_DATA.specs[sp.key].repeat,
    revenue:  MONTH_DATA.specs[sp.key].revenue,
    avgCheck: MONTH_DATA.specs[sp.key].avgCheck,
  }));

  const monthPct    = pct(MONTH_DATA.fact, MONTH_DATA.plan);
  const shouldBePct = pct(MONTH_DATA.shouldBe, MONTH_DATA.plan);

  return (
    <div className="space-y-5">

      {/* Переключатель */}
      <div className="flex items-center gap-2 flex-wrap">
        {([["today", "День"], ["month", "Май 2026"]] as const).map(([id, label]) => (
          <button key={id} onClick={() => setTab(id)}
            className="px-4 py-2 rounded-lg text-sm font-semibold border transition-colors"
            style={tab === id
              ? { background: "hsl(199,85%,38%)", color: "white", borderColor: "hsl(199,85%,38%)" }
              : { borderColor: "hsl(var(--border))", color: "hsl(var(--foreground))", background: "hsl(var(--card))" }}>
            {label}
          </button>
        ))}
        {tab === "today" && (
          <div className="flex items-center gap-1.5 border border-border rounded-lg px-2 py-1.5 bg-card">
            <Icon name="CalendarDays" size={14} className="text-muted-foreground" />
            <input type="date" value={selectedDate} max="2026-05-21"
              onChange={e => setSelectedDate(e.target.value)}
              className="text-sm bg-transparent outline-none text-foreground" />
          </div>
        )}
        <span className="ml-auto text-xs text-muted-foreground">Данные из МИС · обновлено сейчас</span>
      </div>

      {/* ══ ДЕНЬ ══ */}
      {tab === "today" && (
        <div className="space-y-5">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
            <span className="text-sm font-medium text-foreground">{daySnapshot.date}</span>
          </div>
          {/* KPI-карточки */}
          <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-5 gap-3">
            <KpiCard label="Первичных (день)"  value={String(dayTotal.primary)}   icon="UserPlus"      accent="hsl(162,60%,40%)" />
            <KpiCard label="Повторных (день)"  value={String(dayTotal.repeat)}    icon="RefreshCw"     accent="hsl(38,92%,50%)" />
            <KpiCard label="ПП в день"         value={String(dayPpInDay)}         icon="CalendarCheck" accent="hsl(199,85%,38%)" sub="первич. с нач.мес / дней" />
            <KpiCard label="Выручка за день"   value={fmtRub(dayTotal.revenue)}   icon="Banknote"      accent="hsl(162,60%,40%)" />
            <KpiCard label="Ср. чек"           value={fmtRub(dayAvgCheck)}        icon="Receipt"       accent="hsl(199,85%,38%)" sub="выручка / первич. с нач." />
          </div>

          {/* Лиды за день */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <KpiCard label="Лидов за день" value={String(daySnapshot.leads.total)}     icon="PhoneIncoming" accent="hsl(271,70%,55%)" />
            <KpiCard label="Записались"    value={String(daySnapshot.leads.converted)} icon="CalendarPlus"  accent="hsl(162,60%,40%)" />
            <KpiCard label="Конверсия"     value={`${Math.round(daySnapshot.leads.converted / daySnapshot.leads.total * 100)}%`} icon="TrendingUp" accent="hsl(199,85%,38%)"
              pctVal={Math.round(daySnapshot.leads.converted / daySnapshot.leads.total * 100)} />
          </div>

          {/* Таблица по специализациям */}
          <div>
            <h3 className="text-sm font-semibold text-foreground mb-2">По специализациям — {daySnapshot.date}</h3>
            <SpecTable rows={todaySpecRows} />
          </div>

          {/* Расписание */}
          <div className="bg-card rounded-xl border border-border shadow-sm">
            <div className="flex items-center justify-between px-5 pt-4 pb-3">
              <h3 className="font-semibold text-sm text-foreground">Приёмы сегодня</h3>
              <span className="text-xs text-muted-foreground bg-muted px-2.5 py-1 rounded-full">{todaySchedule.length} записей</span>
            </div>
            <div className="divide-y divide-border">
              {todaySchedule.map((row, i) => (
                <div key={i} className="flex items-center gap-4 px-5 py-2.5 hover:bg-muted/40 transition-colors">
                  <div className="text-sm font-semibold text-primary w-12 shrink-0">{row.time}</div>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-sm text-foreground truncate">{row.patient}</div>
                    <div className="text-xs text-muted-foreground truncate">{row.service} · {row.doctor}</div>
                  </div>
                  <span className={`text-xs px-2.5 py-1 rounded-full font-medium shrink-0 ${statusLabel[row.status].cls}`}>
                    {statusLabel[row.status].label}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ══ МЕСЯЦ ══ */}
      {tab === "month" && (
        <div className="space-y-5">

          {/* План / Факт / Должно быть */}
          <div className="bg-card border border-border rounded-xl p-5 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-foreground">Выполнение плана — {MONTH_DATA.month}</h3>
              <span className="text-xs text-muted-foreground">{MONTH_DATA.daysPassed} из {MONTH_DATA.daysTotal} рабочих дней</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
              <div className="text-center">
                <p className="text-xs text-muted-foreground mb-1">План на месяц</p>
                <p className="text-2xl font-bold text-foreground">{fmtRub(MONTH_DATA.plan)}</p>
              </div>
              <div className="text-center">
                <p className="text-xs text-muted-foreground mb-1">Должно быть к сегодня</p>
                <p className="text-2xl font-bold" style={{ color: "hsl(38,92%,50%)" }}>{fmtRub(MONTH_DATA.shouldBe)}</p>
              </div>
              <div className="text-center">
                <p className="text-xs text-muted-foreground mb-1">Факт</p>
                <p className="text-2xl font-bold" style={{ color: "hsl(162,60%,40%)" }}>{fmtRub(MONTH_DATA.fact)}</p>
              </div>
            </div>
            {/* Прогресс-бар двойной */}
            <div className="space-y-2">
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-muted-foreground">Факт от плана</span>
                  <span className="font-semibold" style={{ color: monthPct >= 100 ? "hsl(162,60%,40%)" : monthPct < shouldBePct - 10 ? "#ef4444" : "hsl(38,92%,50%)" }}>
                    {monthPct}%
                  </span>
                </div>
                <div className="h-4 rounded-full bg-muted overflow-hidden relative">
                  {/* Должно быть — маркер */}
                  <div className="absolute top-0 bottom-0 w-0.5 bg-amber-400 z-10" style={{ left: `${shouldBePct}%` }} />
                  <div className="h-full rounded-full transition-all duration-700"
                    style={{ width: `${monthPct}%`, background: monthPct >= shouldBePct ? "hsl(162,60%,40%)" : "#ef4444" }} />
                </div>
                <div className="flex justify-between text-[10px] mt-0.5 text-muted-foreground">
                  <span>0</span>
                  <span style={{ marginLeft: `${shouldBePct - 2}%` }}>▲ норма</span>
                  <span>{fmtRub(MONTH_DATA.plan)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* KPI месяца */}
          {(() => {
            const totalPrimary = DASH_SPECS.reduce((s, sp) => s + MONTH_DATA.specs[sp.key].primary, 0);
            const totalRepeat  = DASH_SPECS.reduce((s, sp) => s + MONTH_DATA.specs[sp.key].repeat,  0);
            const totalRevenue = MONTH_DATA.fact;
            // ПП в день = первичных с начала месяца / кол-во прошедших дней
            const ppInDay  = MONTH_DATA.daysPassed > 0 ? Math.round(totalPrimary / MONTH_DATA.daysPassed) : 0;
            // Средний чек = выручка с начала месяца / первичных с начала месяца
            const avgCheck = totalPrimary > 0 ? Math.round(totalRevenue / totalPrimary) : 0;
            return (
              <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-5 gap-3">
                <KpiCard label="Первичных"       value={String(totalPrimary)}  icon="UserPlus"      accent="hsl(162,60%,40%)" />
                <KpiCard label="Повторных"       value={String(totalRepeat)}   icon="RefreshCw"     accent="hsl(38,92%,50%)" />
                <KpiCard label="ПП в день"       value={String(ppInDay)}       icon="CalendarCheck" accent="hsl(199,85%,38%)" sub={`${MONTH_DATA.daysPassed} раб. дней`} />
                <KpiCard label="Выручка (факт)"  value={fmtRub(totalRevenue)}  icon="Banknote"      accent="hsl(162,60%,40%)" />
                <KpiCard label="Ср. чек"         value={fmtRub(avgCheck)}      icon="Receipt"       accent="hsl(199,85%,38%)" sub="выручка / первичных" />
              </div>
            );
          })()}

          {/* Таблица по специализациям */}
          <div>
            <h3 className="text-sm font-semibold text-foreground mb-2">По специализациям — {MONTH_DATA.month}</h3>
            <SpecTable rows={monthSpecRows} />
          </div>

          {/* Лиды за месяц */}
          <div className="bg-card border border-border rounded-xl p-5 shadow-sm">
            <h3 className="font-semibold text-sm text-foreground mb-4">Лиды и конверсия — {MONTH_DATA.month}</h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {[
                { label: "Всего лидов",  val: MONTH_DATA.leads.total,     color: "hsl(199,85%,38%)" },
                { label: "Записались",   val: MONTH_DATA.leads.converted,  color: "hsl(162,60%,40%)" },
              ].map((l, i) => (
                <div key={i} className="text-center p-3 rounded-lg bg-muted/20 border border-border/50">
                  <p className="text-2xl font-bold" style={{ color: l.color }}>{l.val}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{l.label}</p>
                </div>
              ))}
            </div>
            <div className="mt-4">
              <div className="flex justify-between text-xs mb-1">
                <span className="text-muted-foreground">Конверсия в запись</span>
                <span className="font-bold" style={{ color: "hsl(162,60%,40%)" }}>{MONTH_DATA.leads.convPct}%</span>
              </div>
              <ProgressBar value={MONTH_DATA.leads.convPct} max={100} color="hsl(162,60%,40%)" />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ─── PATIENTS ─── */
function PatientsSection() {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-2 bg-card border border-border rounded-lg px-3 py-2 flex-1 max-w-sm">
          <Icon name="Search" size={16} className="text-muted-foreground shrink-0" />
          <input
            className="bg-transparent text-sm outline-none w-full placeholder:text-muted-foreground"
            placeholder="Поиск по имени или телефону..."
          />
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:opacity-90">
          <Icon name="UserPlus" size={16} />
          Новый пациент
        </button>
      </div>
      <div className="bg-card rounded-xl border border-border shadow-sm overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border bg-muted/30">
              <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">ФИО</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Дата рождения</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Телефон</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Визитов</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Последний визит</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody>
            {recentPatients.map((p, i) => (
              <tr key={i} className="border-b last:border-b-0 border-border hover:bg-muted/20 transition-colors cursor-pointer">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white shrink-0"
                      style={{ background: `hsl(${180 + i * 15}, 55%, 45%)` }}
                    >
                      {p.name
                        .split(" ")
                        .slice(0, 2)
                        .map((n) => n[0])
                        .join("")}
                    </div>
                    <span className="font-medium text-sm text-foreground">{p.name}</span>
                  </div>
                </td>
                <td className="px-4 py-3 text-sm text-muted-foreground">{p.dob}</td>
                <td className="px-4 py-3 text-sm text-foreground">{p.phone}</td>
                <td className="px-4 py-3">
                  <span className="text-sm font-semibold text-primary">{p.visits}</span>
                </td>
                <td className="px-4 py-3 text-sm text-muted-foreground">{p.last}</td>
                <td className="px-4 py-3">
                  <button className="p-1.5 rounded-lg hover:bg-muted transition-colors">
                    <Icon name="MoreHorizontal" size={16} className="text-muted-foreground" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/* ─── PROTOCOLS ─── */
function ProtocolsSection() {
  const templates = [
    { name: "Первичный осмотр терапевта", type: "Протокол", updated: "15.05.2026", uses: 48 },
    { name: "Повторный приём", type: "Протокол", updated: "10.05.2026", uses: 92 },
    { name: "УЗИ брюшной полости", type: "Шаблон", updated: "08.05.2026", uses: 34 },
    { name: "ЭКГ с описанием", type: "Шаблон", updated: "01.05.2026", uses: 21 },
    { name: "Выписка после консультации", type: "Шаблон", updated: "20.04.2026", uses: 67 },
    { name: "Направление к специалисту", type: "Шаблон", updated: "18.04.2026", uses: 29 },
  ];
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <p className="text-sm text-muted-foreground">{templates.length} шаблонов</p>
        <button className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:opacity-90">
          <Icon name="FilePlus" size={16} />
          Новый шаблон
        </button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {templates.map((t, i) => (
          <div key={i} className="bg-card border border-border rounded-xl p-5 card-hover cursor-pointer">
            <div className="flex items-start justify-between mb-3">
              <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-blue-50">
                <Icon name="FileText" size={20} className="text-primary" />
              </div>
              <span className="text-xs px-2 py-1 rounded-full font-medium badge-status-active">{t.type}</span>
            </div>
            <h3 className="font-semibold text-sm text-foreground mb-1">{t.name}</h3>
            <p className="text-xs text-muted-foreground">
              Обновлён {t.updated} · использован {t.uses} раз
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ─── DOCUMENTS ─── */
function DocumentsSection() {
  const docs = [
    { name: "Договор на оказание медицинских услуг", cat: "Договор", date: "01.01.2026", count: 145 },
    { name: "ИДС на операцию", cat: "ИДС", date: "10.03.2026", count: 23 },
    { name: "ИДС на медикаментозный наркоз", cat: "ИДС", date: "10.03.2026", count: 8 },
    { name: "Согласие на обработку персональных данных", cat: "Согласие", date: "01.01.2026", count: 312 },
    { name: "Договор ДМС (корпоративный)", cat: "Договор", date: "15.04.2026", count: 12 },
    { name: "ИДС на УЗИ", cat: "ИДС", date: "20.02.2026", count: 67 },
  ];
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <p className="text-sm text-muted-foreground">{docs.length} документов</p>
        <button className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:opacity-90">
          <Icon name="FilePlus" size={16} />
          Загрузить документ
        </button>
      </div>
      <div className="bg-card rounded-xl border border-border shadow-sm overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border bg-muted/30">
              <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase">Название</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase">Категория</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase">Обновлён</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase">Подписаний</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody>
            {docs.map((d, i) => (
              <tr key={i} className="border-b last:border-b-0 border-border hover:bg-muted/20 transition-colors cursor-pointer">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <Icon name="FileText" size={18} className="text-primary shrink-0" />
                    <span className="text-sm font-medium text-foreground">{d.name}</span>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <span className="text-xs badge-status-active px-2.5 py-1 rounded-full font-medium">{d.cat}</span>
                </td>
                <td className="px-4 py-3 text-sm text-muted-foreground">{d.date}</td>
                <td className="px-4 py-3 text-sm font-semibold text-primary">{d.count}</td>
                <td className="px-4 py-3">
                  <div className="flex gap-1">
                    <button className="p-1.5 rounded-lg hover:bg-muted transition-colors">
                      <Icon name="Download" size={15} className="text-muted-foreground" />
                    </button>
                    <button className="p-1.5 rounded-lg hover:bg-muted transition-colors">
                      <Icon name="Pencil" size={15} className="text-muted-foreground" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/* ─── PRICES ─── */
function PricesSection() {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-2 bg-card border border-border rounded-lg px-3 py-2 flex-1 max-w-sm">
          <Icon name="Search" size={16} className="text-muted-foreground" />
          <input
            className="bg-transparent text-sm outline-none w-full placeholder:text-muted-foreground"
            placeholder="Поиск по услуге или коду..."
          />
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:opacity-90">
          <Icon name="Plus" size={16} />
          Добавить услугу
        </button>
      </div>
      <div className="bg-card rounded-xl border border-border shadow-sm overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border bg-muted/30">
              <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase">Код</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase">Наименование</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase">Длительность</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase">Цена</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody>
            {priceList.map((s, i) => (
              <tr key={i} className="border-b last:border-b-0 border-border hover:bg-muted/20 transition-colors">
                <td className="px-4 py-3 text-xs font-mono text-muted-foreground">{s.code}</td>
                <td className="px-4 py-3 text-sm font-medium text-foreground">{s.name}</td>
                <td className="px-4 py-3 text-sm text-muted-foreground">{s.duration}</td>
                <td className="px-4 py-3 text-sm font-bold text-foreground">{s.price} ₽</td>
                <td className="px-4 py-3">
                  <button className="p-1.5 rounded-lg hover:bg-muted transition-colors">
                    <Icon name="Pencil" size={15} className="text-muted-foreground" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/* ─── REPORTS ─── */
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

function fmtMoney(n: number) {
  return n.toLocaleString("ru-RU") + " ₽";
}

// ─── Вспомогательный хук для отчёта ─────────────────────────────────────────
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

// ─── Excel export ─────────────────────────────────────────────────────────────
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
function AppointmentsReport() {
  const [dateFrom, setDateFrom] = useState(`2026-05-01`);
  const [dateTo,   setDateTo]   = useState(`2026-05-21`);
  const [selectedDocs, setSelectedDocs] = useState<number[]>(REPORT_DOCTORS.map(d => d.id));
  const [expandedPrimary, setExpandedPrimary] = useState(false);
  const [expandedRepeat,  setExpandedRepeat]  = useState(false);
  // expandedSpecs: Set of keys "primary|Терапевт" etc.
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

function ReportsSection() {
  const [activeReport, setActiveReport] = useState<"summary" | "appointments" | "revenue" | "analysis">("appointments");

  const months = ["Янв", "Фев", "Мар", "Апр", "Май"];
  const revenue = [1420, 1680, 1950, 2100, 2184];
  const max = Math.max(...revenue);

  const reportTabs = [
    { id: "appointments" as const, label: "Отчёт по приёмам",       icon: "ClipboardList" },
    { id: "analysis"     as const, label: "Анализ загрузки клиники", icon: "TableProperties" },
    { id: "summary"      as const, label: "Сводный дашборд",         icon: "LayoutDashboard" },
    { id: "revenue"      as const, label: "Выручка по месяцам",      icon: "TrendingUp" },
  ];

  return (
    <div className="space-y-4">
      {/* Вкладки отчётов */}
      <div className="flex gap-2 flex-wrap">
        {reportTabs.map(tab => (
          <button key={tab.id} onClick={() => setActiveReport(tab.id)}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium border transition-colors"
            style={activeReport === tab.id
              ? { background: "hsl(199,85%,38%)", color: "white", borderColor: "hsl(199,85%,38%)" }
              : { borderColor: "hsl(var(--border))", color: "hsl(var(--foreground))", background: "hsl(var(--card))" }}>
            <Icon name={tab.icon} size={14} />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Отчёт по приёмам */}
      {activeReport === "appointments" && (
        <div className="bg-card border border-border rounded-xl overflow-hidden shadow-sm" style={{ minHeight: 500 }}>
          <AppointmentsReport />
        </div>
      )}

      {/* Анализ загрузки клиники */}
      {activeReport === "analysis" && <ClinicAnalysisReport />}

      {/* Сводный дашборд */}
      {activeReport === "summary" && (
        <div className="space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[
              { label: "Выручка (май)", val: "2 184 500 ₽", icon: "TrendingUp", color: "text-green-500" },
              { label: "Кол-во приёмов", val: "486", icon: "CalendarCheck", color: "text-primary" },
              { label: "Средний чек", val: "4 493 ₽", icon: "Receipt", color: "text-secondary" },
            ].map((r, i) => (
              <div key={i} className="bg-card border border-border rounded-xl p-5 card-hover">
                <div className="flex items-center gap-3 mb-1">
                  <Icon name={r.icon} size={18} className={r.color} />
                  <span className="text-xs text-muted-foreground">{r.label}</span>
                </div>
                <p className="text-2xl font-bold text-foreground">{r.val}</p>
              </div>
            ))}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="bg-card border border-border rounded-xl p-5 shadow-sm">
              <h3 className="font-semibold text-foreground mb-3">Топ услуг</h3>
              <div className="space-y-3">
                {priceList.slice(0, 4).map((s, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <span className="text-xs text-muted-foreground w-4">{i + 1}</span>
                    <span className="text-sm flex-1 text-foreground truncate">{s.name}</span>
                    <span className="text-sm font-bold text-primary">{s.price} ₽</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="bg-card border border-border rounded-xl p-5 shadow-sm">
              <h3 className="font-semibold text-foreground mb-3">Загрузка по врачам</h3>
              <div className="space-y-3">
                {[
                  { name: "Петров А.В.", pct: 92 },
                  { name: "Белова Н.И.", pct: 78 },
                  { name: "Захаров С.Д.", pct: 65 },
                ].map((d, i) => (
                  <div key={i}>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-muted-foreground">{d.name}</span>
                      <span className="font-semibold text-foreground">{d.pct}%</span>
                    </div>
                    <div className="h-2 rounded-full bg-muted overflow-hidden">
                      <div className="h-full rounded-full"
                        style={{ width: `${d.pct}%`, background: "hsl(199,85%,44%)" }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Выручка по месяцам */}
      {activeReport === "revenue" && (
        <div className="bg-card border border-border rounded-xl p-5 shadow-sm">
          <h3 className="font-semibold text-foreground mb-4">Выручка по месяцам (тыс. ₽)</h3>
          <div className="flex items-end gap-4 h-48">
            {months.map((m, i) => (
              <div key={m} className="flex-1 flex flex-col items-center gap-1">
                <span className="text-xs font-semibold text-foreground">{revenue[i]}</span>
                <div className="w-full rounded-t-lg transition-all duration-700"
                  style={{
                    height: `${(revenue[i] / max) * 160}px`,
                    background: i === months.length - 1
                      ? "linear-gradient(180deg, hsl(199,85%,38%), hsl(162,60%,40%))"
                      : "hsl(var(--muted))",
                  }} />
                <span className="text-xs text-muted-foreground">{m}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

/* ─── WORK SCHEDULE ─── */
function WorkScheduleSection() {
  const days = ["Пн", "Вт", "Ср", "Чт", "Пт", "Сб", "Вс"];
  const schedule: Record<string, string[]> = {
    "Петров А.В.": ["9-18", "9-18", "9-18", "9-18", "9-18", "", ""],
    "Белова Н.И.": ["9-15", "", "9-15", "", "9-15", "", ""],
    "Захаров С.Д.": ["", "10-17", "", "10-17", "", "", ""],
    "Орлова Ю.М.": ["", "", "", "", "", "", ""],
    "Смирнов П.О.": ["", "", "11-19", "", "11-19", "11-15", ""],
  };
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <button className="p-2 rounded-lg border border-border hover:bg-muted">
            <Icon name="ChevronLeft" size={16} />
          </button>
          <span className="font-semibold text-sm">Неделя 18–24 мая 2026</span>
          <button className="p-2 rounded-lg border border-border hover:bg-muted">
            <Icon name="ChevronRight" size={16} />
          </button>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:opacity-90">
          <Icon name="Plus" size={16} />
          Добавить смену
        </button>
      </div>
      <div className="bg-card rounded-xl border border-border shadow-sm overflow-hidden">
        <div
          className="grid border-b border-border"
          style={{ gridTemplateColumns: "160px repeat(7, 1fr)" }}
        >
          <div className="p-3 bg-muted/30" />
          {days.map((d, i) => (
            <div
              key={d}
              className={`p-3 text-center text-xs font-semibold border-l border-border ${
                i >= 5 ? "text-muted-foreground" : "text-foreground"
              }`}
            >
              {d}
            </div>
          ))}
        </div>
        {Object.entries(schedule).map(([doctor, shifts]) => (
          <div
            key={doctor}
            className="grid border-b last:border-b-0 border-border"
            style={{ gridTemplateColumns: "160px repeat(7, 1fr)" }}
          >
            <div className="p-3 border-r border-border">
              <div className="text-xs font-semibold text-foreground">{doctor.split(" ")[0]}</div>
              <div className="text-xs text-muted-foreground">{doctor.split(" ").slice(1).join(" ")}</div>
            </div>
            {shifts.map((s, i) => (
              <div key={i} className="p-1.5 border-l border-border min-h-[52px] flex items-center justify-center">
                {s ? (
                  <div className="rounded-lg px-2 py-1.5 text-xs font-medium text-center w-full badge-status-active cursor-pointer hover:opacity-80 transition-opacity">
                    {s}
                  </div>
                ) : (
                  <div className="text-muted-foreground/30 text-xs">—</div>
                )}
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

/* ─── PRINT SERVICES ─── */
function PrintServicesSection() {
  return (
    <div className="space-y-4">
      <div className="bg-card border border-border rounded-xl p-6 shadow-sm max-w-2xl">
        <h3 className="font-semibold text-foreground mb-4">Перечень полученных услуг</h3>
        <div className="space-y-3 mb-4">
          <div className="flex gap-3 flex-wrap">
            <div className="flex-1 min-w-[200px]">
              <label className="text-xs text-muted-foreground mb-1 block">Пациент</label>
              <select className="w-full border border-border rounded-lg px-3 py-2 text-sm bg-background text-foreground">
                {recentPatients.map((p, i) => (
                  <option key={i}>{p.name}</option>
                ))}
              </select>
            </div>
            <div className="flex-1 min-w-[200px]">
              <label className="text-xs text-muted-foreground mb-1 block">Период</label>
              <div className="flex gap-2">
                <input
                  type="date"
                  defaultValue="2026-05-01"
                  className="flex-1 border border-border rounded-lg px-3 py-2 text-sm bg-background text-foreground"
                />
                <input
                  type="date"
                  defaultValue="2026-05-21"
                  className="flex-1 border border-border rounded-lg px-3 py-2 text-sm bg-background text-foreground"
                />
              </div>
            </div>
          </div>
          <button className="w-full py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:opacity-90">
            Сформировать перечень
          </button>
        </div>
        <div className="border-t border-border pt-4">
          <div className="rounded-lg bg-muted/40 p-4 space-y-2">
            <div className="flex justify-between text-xs font-semibold text-muted-foreground uppercase border-b border-border pb-2">
              <span className="flex-1">Услуга</span>
              <span className="mx-4">Дата</span>
              <span>Цена</span>
            </div>
            {[
              { s: "Первичный приём терапевта", d: "10.05.2026", p: "2 500 ₽" },
              { s: "УЗИ брюшной полости", d: "10.05.2026", p: "3 200 ₽" },
              { s: "Повторный приём", d: "21.05.2026", p: "1 800 ₽" },
            ].map((r, i) => (
              <div key={i} className="flex justify-between text-sm">
                <span className="flex-1 text-foreground">{r.s}</span>
                <span className="text-muted-foreground mx-4">{r.d}</span>
                <span className="font-semibold text-foreground">{r.p}</span>
              </div>
            ))}
            <div className="border-t border-border pt-2 flex justify-between font-bold text-foreground">
              <span>Итого</span>
              <span>7 500 ₽</span>
            </div>
          </div>
          <div className="flex gap-3 mt-3">
            <button className="flex-1 flex items-center justify-center gap-2 py-2 border border-border rounded-lg text-sm hover:bg-muted transition-colors text-foreground">
              <Icon name="Printer" size={15} />
              Печать
            </button>
            <button className="flex-1 flex items-center justify-center gap-2 py-2 border border-border rounded-lg text-sm hover:bg-muted transition-colors text-foreground">
              <Icon name="Download" size={15} />
              PDF
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─── CRM ─── */
function CRMSection() {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: "Новые", val: 5, cls: "badge-status-pending" },
          { label: "В работе", val: 3, cls: "badge-status-active" },
          { label: "Завершены", val: 12, cls: "badge-status-done" },
          { label: "Отказы", val: 2, cls: "badge-status-done" },
        ].map((c, i) => (
          <div key={i} className="bg-card border border-border rounded-xl p-4 text-center card-hover cursor-default">
            <p className="text-2xl font-bold text-foreground">{c.val}</p>
            <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${c.cls}`}>{c.label}</span>
          </div>
        ))}
      </div>
      <div className="bg-card rounded-xl border border-border shadow-sm overflow-hidden">
        <div className="px-5 pt-5 pb-3 font-semibold text-foreground">Заявки</div>
        <table className="w-full">
          <thead>
            <tr className="border-b border-border bg-muted/30">
              <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase">Пациент</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase">Канал</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase">Услуга</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase">Дата</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase">Статус</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase">Сумма</th>
            </tr>
          </thead>
          <tbody>
            {crmLeads.map((l, i) => (
              <tr key={i} className="border-b last:border-b-0 border-border hover:bg-muted/20 transition-colors cursor-pointer">
                <td className="px-4 py-3 text-sm font-medium text-foreground">{l.name}</td>
                <td className="px-4 py-3 text-sm text-muted-foreground">{l.channel}</td>
                <td className="px-4 py-3 text-sm text-foreground">{l.service}</td>
                <td className="px-4 py-3 text-sm text-muted-foreground">{l.date}</td>
                <td className="px-4 py-3">
                  <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${statusLabel[l.status]?.cls || "badge-status-done"}`}>
                    {statusLabel[l.status]?.label}
                  </span>
                </td>
                <td className="px-4 py-3 text-sm font-semibold text-foreground">{l.sum}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/* ─── EMPLOYEES ─── */
function EmployeesSection() {
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <p className="text-sm text-muted-foreground">{employees.length} сотрудников</p>
        <button className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:opacity-90">
          <Icon name="UserPlus" size={16} />
          Добавить сотрудника
        </button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {employees.map((e, i) => (
          <div key={i} className="bg-card border border-border rounded-xl p-5 card-hover">
            <div className="flex items-start gap-4">
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center text-sm font-bold text-white shrink-0"
                style={{
                  background: `linear-gradient(135deg, hsl(${185 + i * 15},65%,38%), hsl(${185 + i * 15},60%,48%))`,
                }}
              >
                {e.name
                  .split(" ")
                  .slice(0, 2)
                  .map((n) => n[0])
                  .join("")}
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-semibold text-sm text-foreground">{e.name}</div>
                <div className="text-xs text-muted-foreground mb-2">
                  {e.role} · {e.branch}
                </div>
                <div className="text-xs text-muted-foreground">{e.schedule}</div>
              </div>
              <span
                className={`text-xs px-2 py-1 rounded-full font-medium shrink-0 ${
                  e.status === "active" ? "badge-status-active" : "badge-status-pending"
                }`}
              >
                {e.status === "active" ? "Работает" : "Отпуск"}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ─── BRANCHES ─── */
// ─── Типы филиала ─────────────────────────────────────────────────────────────
interface BranchLogo { id: string; name: string; purpose: string; url: string }
interface BranchData {
  id: string;
  tradeName: string;
  legalName: string;
  status: "active" | "inactive";
  // Контакты
  phone: string;
  email: string;
  website: string;
  // Юридический адрес
  legalIndex: string;
  legalCity: string;
  legalStreet: string;
  // Фактический адрес
  sameAddress: boolean;
  factIndex: string;
  factCity: string;
  factStreet: string;
  // Реквизиты
  inn: string;
  kpp: string;
  ogrn: string;
  legalForm: string;
  bankName: string;
  bik: string;
  checkingAccount: string;
  corrAccount: string;
  // Лицензия
  licenseNumber: string;
  licenseDate: string;
  licenseExpiry: string;
  licenseAuthority: string;
  licenseActivity: string;
  // Логотипы
  logos: BranchLogo[];
  // Статистика
  rooms: number;
  doctors: number;
}

const EMPTY_BRANCH: BranchData = {
  id: "", tradeName: "", legalName: "", status: "active",
  phone: "", email: "", website: "",
  legalIndex: "", legalCity: "", legalStreet: "",
  sameAddress: false,
  factIndex: "", factCity: "", factStreet: "",
  inn: "", kpp: "", ogrn: "", legalForm: "ООО",
  bankName: "", bik: "", checkingAccount: "", corrAccount: "",
  licenseNumber: "", licenseDate: "", licenseExpiry: "", licenseAuthority: "", licenseActivity: "",
  logos: [], rooms: 0, doctors: 0,
};

const LOGO_PURPOSES = ["Основной логотип", "Логотип для печати", "Мобильное приложение", "Сайт", "Факсимиле"];
const LEGAL_FORMS   = ["ООО", "ОАО", "ЗАО", "ПАО", "АО", "ИП", "НКО", "ГБУЗ", "ФГБУ"];

// ─── Переиспользуемые компоненты полей (объявлены ВНЕ функций-родителей!) ──────
function BranchField({ label, value, onChange, placeholder, type = "text", required }: {
  label: string; value: string; onChange: (v: string) => void;
  placeholder?: string; type?: string; required?: boolean;
}) {
  return (
    <div>
      <label className="block text-xs font-medium text-muted-foreground mb-1">
        {label}{required && <span className="text-red-500 ml-0.5">*</span>}
      </label>
      <input
        type={type} value={value} onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full text-sm border border-border rounded-lg px-3 py-2 bg-background outline-none focus:border-primary transition-colors"
      />
    </div>
  );
}

function BranchTextarea({ label, value, onChange, placeholder, rows = 3 }: {
  label: string; value: string; onChange: (v: string) => void;
  placeholder?: string; rows?: number;
}) {
  return (
    <div>
      <label className="block text-xs font-medium text-muted-foreground mb-1">{label}</label>
      <textarea
        value={value} onChange={e => onChange(e.target.value)}
        rows={rows} placeholder={placeholder}
        className="w-full text-sm border border-border rounded-lg px-3 py-2 bg-background outline-none focus:border-primary transition-colors resize-none"
      />
    </div>
  );
}

// Компоненты карточки филиала (просмотр) — модульного уровня
function BranchInfoRow({ icon, label, value }: { icon: string; label: string; value: string }) {
  if (!value) return null;
  return (
    <div className="flex items-start gap-3 py-3 border-b border-border/50 last:border-0">
      <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center shrink-0">
        <Icon name={icon} size={14} className="text-muted-foreground" />
      </div>
      <div className="min-w-0">
        <p className="text-[11px] text-muted-foreground mb-0.5">{label}</p>
        <p className="text-sm text-foreground font-medium">{value}</p>
      </div>
    </div>
  );
}

function BranchDetailSection({ title, icon, children }: { title: string; icon: string; children: React.ReactNode }) {
  return (
    <div className="bg-card border border-border rounded-xl overflow-hidden">
      <div className="flex items-center gap-2 px-4 py-3 border-b border-border bg-muted/20">
        <Icon name={icon} size={14} className="text-primary" />
        <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">{title}</span>
      </div>
      <div className="px-4">{children}</div>
    </div>
  );
}

// ─── Модальное окно филиала ───────────────────────────────────────────────────
function BranchModal({ branch, onClose, onSave, inline = false }: {
  branch: BranchData;
  onClose: () => void;
  onSave: (b: BranchData) => void;
  inline?: boolean;
}) {
  const [form, setForm] = useState<BranchData>({ ...branch, id: branch.id || String(Date.now()) });
  const [tab, setTab]   = useState<"general" | "requisites" | "license" | "logos">("general");

  const set = (field: keyof BranchData, val: string | boolean | BranchLogo[]) =>
    setForm(prev => ({ ...prev, [field]: val }));

  const isNew = !branch.id;

  // Синхронизация фактического адреса с юридическим
  const legalFull = [form.legalIndex, form.legalCity, form.legalStreet].filter(Boolean).join(", ");

  const handleSameAddress = (checked: boolean) => {
    set("sameAddress", checked);
    if (checked) {
      setForm(prev => ({ ...prev, sameAddress: true, factIndex: prev.legalIndex, factCity: prev.legalCity, factStreet: prev.legalStreet }));
    }
  };

  // Обновление фактического адреса при изменении юридического (если галочка стоит)
  const setLegal = (field: "legalIndex" | "legalCity" | "legalStreet", val: string) => {
    setForm(prev => {
      const updated = { ...prev, [field]: val };
      if (prev.sameAddress) {
        updated.factIndex  = field === "legalIndex"  ? val : prev.factIndex;
        updated.factCity   = field === "legalCity"   ? val : prev.factCity;
        updated.factStreet = field === "legalStreet" ? val : prev.factStreet;
      }
      return updated;
    });
  };

  // Загрузка логотипа (имитация)
  const addLogo = () => {
    const purpose = LOGO_PURPOSES[form.logos.length % LOGO_PURPOSES.length];
    const newLogo: BranchLogo = {
      id: String(Date.now()),
      name: `logo_${form.logos.length + 1}.png`,
      purpose,
      url: `https://placehold.co/200x60/1a9cbe/white?text=Logo`,
    };
    set("logos", [...form.logos, newLogo]);
  };

  const removeLogo = (id: string) => set("logos", form.logos.filter(l => l.id !== id));

  const canSave = form.tradeName.trim() && form.legalCity.trim();

  const TABS = [
    { id: "general",    label: "Основное",    icon: "Building2" },
    { id: "requisites", label: "Реквизиты",   icon: "FileSpreadsheet" },
    { id: "license",    label: "Лицензия",    icon: "ShieldCheck" },
    { id: "logos",      label: "Логотипы",    icon: "Image" },
  ] as const;

  return (
    <div className={inline ? "" : "fixed inset-0 z-50 flex items-center justify-center"} onClick={inline ? undefined : onClose}>
      {!inline && <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px]" />}
      <div
        className={`${inline ? "" : "relative"} bg-card rounded-2xl shadow-sm border border-border flex flex-col ${inline ? "w-full" : "w-[680px] max-w-[96vw] max-h-[90vh]"}`}
        onClick={inline ? undefined : e => e.stopPropagation()}
      >
        {/* Шапка */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center"
              style={{ background: "linear-gradient(135deg, hsl(199,85%,38%), hsl(162,60%,40%))" }}>
              <Icon name="Building2" size={18} className="text-white" />
            </div>
            <div>
              <h2 className="font-bold text-foreground">{isNew ? "Новый филиал" : form.tradeName || "Редактирование"}</h2>
              <p className="text-xs text-muted-foreground">{isNew ? "Заполните данные о филиале" : "Редактирование данных филиала"}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-muted transition-colors">
            <Icon name="X" size={16} className="text-muted-foreground" />
          </button>
        </div>

        {/* Вкладки */}
        <div className="flex border-b border-border shrink-0 px-6 gap-1">
          {TABS.map(t => (
            <button key={t.id} onClick={() => setTab(t.id)}
              className={`flex items-center gap-1.5 px-3 py-3 text-sm font-medium border-b-2 transition-colors -mb-px ${
                tab === t.id
                  ? "border-primary text-primary"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              }`}>
              <Icon name={t.icon} size={14} />
              {t.label}
            </button>
          ))}
        </div>

        {/* Тело */}
        <div className="flex-1 overflow-y-auto scrollbar-thin px-6 py-5">

          {/* ── ОСНОВНОЕ ── */}
          {tab === "general" && (
            <div className="space-y-5">
              {/* Статус */}
              <div className="flex items-center justify-between p-3 bg-muted/30 rounded-xl border border-border">
                <span className="text-sm font-medium text-foreground">Статус филиала</span>
                <div className="flex gap-1">
                  {(["active", "inactive"] as const).map(s => (
                    <button key={s} onClick={() => set("status", s)}
                      className="px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors"
                      style={form.status === s
                        ? { background: s === "active" ? "hsl(162,60%,40%)" : "#ef4444", color: "white" }
                        : { background: "hsl(var(--muted))", color: "hsl(var(--muted-foreground))" }}>
                      {s === "active" ? "Активен" : "Неактивен"}
                    </button>
                  ))}
                </div>
              </div>

              {/* Названия */}
              <div className="space-y-3">
                <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Название</h3>
                <BranchField label="Торговое название" value={form.tradeName} onChange={v => set("tradeName", v)}
                  placeholder="Например: Клиника «Ваш доктор» — Центральный" required />
                <BranchField label="Юридическое название организации" value={form.legalName} onChange={v => set("legalName", v)}
                  placeholder="Например: ООО «Медицинский центр»" />
              </div>

              {/* Контакты */}
              <div className="space-y-3">
                <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Контакты</h3>
                <div className="grid grid-cols-2 gap-3">
                  <BranchField label="Телефон" value={form.phone} onChange={v => set("phone", v)} placeholder="+7 (___) ___-__-__" />
                  <BranchField label="Email" value={form.email} onChange={v => set("email", v)} placeholder="clinic@example.ru" type="email" />
                </div>
                <BranchField label="Сайт" value={form.website} onChange={v => set("website", v)} placeholder="https://example.ru" />
              </div>

              {/* Юридический адрес */}
              <div className="space-y-3">
                <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Юридический адрес</h3>
                <div className="grid grid-cols-3 gap-3">
                  <BranchField label="Индекс" value={form.legalIndex} onChange={v => setLegal("legalIndex", v)} placeholder="123456" />
                  <div className="col-span-2">
                    <BranchField label="Город" value={form.legalCity} onChange={v => setLegal("legalCity", v)} placeholder="Москва" required />
                  </div>
                </div>
                <BranchField label="Улица, дом, офис" value={form.legalStreet} onChange={v => setLegal("legalStreet", v)}
                  placeholder="ул. Ленина, д. 42, оф. 101" />
              </div>

              {/* Фактический адрес */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Фактический адрес</h3>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <div className="relative">
                      <input type="checkbox" checked={form.sameAddress} onChange={e => handleSameAddress(e.target.checked)} className="sr-only" />
                      <div className={`w-8 h-4.5 rounded-full transition-colors ${form.sameAddress ? "bg-primary" : "bg-muted"}`}
                        style={{ height: 18, width: 32 }}>
                        <div className={`absolute top-0.5 w-3.5 h-3.5 rounded-full bg-white shadow transition-transform ${form.sameAddress ? "translate-x-4" : "translate-x-0.5"}`} />
                      </div>
                    </div>
                    <span className="text-xs text-muted-foreground">Совпадает с юридическим</span>
                  </label>
                </div>
                {form.sameAddress ? (
                  <div className="p-3 bg-muted/30 rounded-lg border border-border text-sm text-muted-foreground">
                    {legalFull || "Заполните юридический адрес"}
                  </div>
                ) : (
                  <>
                    <div className="grid grid-cols-3 gap-3">
                      <BranchField label="Индекс" value={form.factIndex} onChange={v => set("factIndex", v)} placeholder="123456" />
                      <div className="col-span-2">
                        <BranchField label="Город" value={form.factCity} onChange={v => set("factCity", v)} placeholder="Москва" />
                      </div>
                    </div>
                    <BranchField label="Улица, дом, офис" value={form.factStreet} onChange={v => set("factStreet", v)}
                      placeholder="ул. Пушкина, д. 10" />
                  </>
                )}
              </div>
            </div>
          )}

          {/* ── РЕКВИЗИТЫ ── */}
          {tab === "requisites" && (
            <div className="space-y-5">
              <div className="space-y-3">
                <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Организационно-правовая форма</h3>
                <div className="flex flex-wrap gap-1.5">
                  {LEGAL_FORMS.map(f => (
                    <button key={f} onClick={() => set("legalForm", f)}
                      className="px-3 py-1.5 rounded-lg text-xs font-semibold border transition-colors"
                      style={form.legalForm === f
                        ? { background: "hsl(199,85%,38%)", color: "white", borderColor: "hsl(199,85%,38%)" }
                        : { borderColor: "hsl(var(--border))", color: "hsl(var(--foreground))" }}>
                      {f}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-3">
                <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Налоговые данные</h3>
                <div className="grid grid-cols-3 gap-3">
                  <BranchField label="ИНН" value={form.inn} onChange={v => set("inn", v)} placeholder="7700000000" />
                  <BranchField label="КПП" value={form.kpp} onChange={v => set("kpp", v)} placeholder="770001001" />
                  <BranchField label="ОГРН / ОГРНИП" value={form.ogrn} onChange={v => set("ogrn", v)} placeholder="1027700000000" />
                </div>
              </div>

              <div className="space-y-3">
                <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Банковские реквизиты</h3>
                <BranchField label="Банк" value={form.bankName} onChange={v => set("bankName", v)} placeholder="ПАО Сбербанк" />
                <div className="grid grid-cols-3 gap-3">
                  <BranchField label="БИК" value={form.bik} onChange={v => set("bik", v)} placeholder="044525225" />
                  <div className="col-span-2">
                    <BranchField label="Расчётный счёт" value={form.checkingAccount} onChange={v => set("checkingAccount", v)} placeholder="40702810000000000000" />
                  </div>
                </div>
                <BranchField label="Корреспондентский счёт" value={form.corrAccount} onChange={v => set("corrAccount", v)} placeholder="30101810400000000225" />
              </div>
            </div>
          )}

          {/* ── ЛИЦЕНЗИЯ ── */}
          {tab === "license" && (
            <div className="space-y-5">
              <div className="p-4 bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900 rounded-xl">
                <div className="flex items-start gap-3">
                  <Icon name="Info" size={16} className="text-blue-500 shrink-0 mt-0.5" />
                  <p className="text-xs text-blue-700 dark:text-blue-300">
                    Лицензия на медицинскую деятельность обязательна. Укажите актуальные данные — они используются в документах и договорах.
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Данные лицензии</h3>
                <BranchField label="Номер лицензии" value={form.licenseNumber} onChange={v => set("licenseNumber", v)}
                  placeholder="ЛО-77-01-000000" />
                <div className="grid grid-cols-2 gap-3">
                  <BranchField label="Дата выдачи" value={form.licenseDate} onChange={v => set("licenseDate", v)} type="date" />
                  <BranchField label="Срок действия (если ограничен)" value={form.licenseExpiry} onChange={v => set("licenseExpiry", v)} type="date" />
                </div>
                <BranchField label="Орган, выдавший лицензию" value={form.licenseAuthority} onChange={v => set("licenseAuthority", v)}
                  placeholder="Департамент здравоохранения г. Москвы" />
                <BranchTextarea label="Лицензируемый вид деятельности" value={form.licenseActivity}
                  onChange={v => set("licenseActivity", v)} rows={3}
                  placeholder="Медицинская деятельность (за исключением деятельности, осуществляемой медицинскими организациями...)" />
              </div>

              {/* Статус лицензии */}
              {form.licenseDate && (
                <div className="flex items-center gap-3 p-3 rounded-xl border"
                  style={{ background: "hsl(162,60%,40%,0.08)", borderColor: "hsl(162,60%,40%,0.3)" }}>
                  <Icon name="ShieldCheck" size={18} className="text-green-600 shrink-0" />
                  <div>
                    <p className="text-sm font-medium text-foreground">Лицензия действительна</p>
                    <p className="text-xs text-muted-foreground">
                      Выдана: {new Date(form.licenseDate).toLocaleDateString("ru-RU")}
                      {form.licenseExpiry ? ` · Действует до: ${new Date(form.licenseExpiry).toLocaleDateString("ru-RU")}` : " · Бессрочная"}
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ── ЛОГОТИПЫ ── */}
          {tab === "logos" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-semibold text-foreground">Логотипы филиала</h3>
                  <p className="text-xs text-muted-foreground mt-0.5">Загрузите разные варианты для использования в разных местах</p>
                </div>
                <button onClick={addLogo}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium text-white transition-opacity hover:opacity-90"
                  style={{ background: "linear-gradient(90deg, hsl(199,85%,38%), hsl(162,60%,40%))" }}>
                  <Icon name="Upload" size={14} />
                  Загрузить
                </button>
              </div>

              {form.logos.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-40 border-2 border-dashed border-border rounded-xl text-center gap-2">
                  <Icon name="Image" size={32} className="text-muted-foreground/40" />
                  <p className="text-sm text-muted-foreground">Логотипы не загружены</p>
                  <p className="text-xs text-muted-foreground/70">Нажмите «Загрузить» чтобы добавить</p>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-3">
                  {form.logos.map(logo => (
                    <div key={logo.id} className="border border-border rounded-xl p-3 bg-muted/20 group">
                      <div className="h-16 bg-muted/40 rounded-lg mb-2.5 flex items-center justify-center overflow-hidden">
                        <img src={logo.url} alt={logo.name} className="max-h-full max-w-full object-contain" />
                      </div>
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <p className="text-xs font-medium text-foreground truncate">{logo.name}</p>
                          <select value={logo.purpose}
                            onChange={e => set("logos", form.logos.map(l => l.id === logo.id ? { ...l, purpose: e.target.value } : l))}
                            className="mt-1 text-[11px] border border-border rounded px-1.5 py-0.5 bg-background outline-none w-full">
                            {LOGO_PURPOSES.map(p => <option key={p}>{p}</option>)}
                          </select>
                        </div>
                        <button onClick={() => removeLogo(logo.id)}
                          className="p-1 rounded hover:bg-red-100 text-muted-foreground hover:text-red-500 transition-colors shrink-0">
                          <Icon name="Trash2" size={13} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <div className="p-3 bg-muted/30 rounded-lg">
                <p className="text-xs text-muted-foreground font-medium mb-1.5">Рекомендуемые форматы:</p>
                <div className="flex flex-wrap gap-1.5">
                  {["PNG с прозрачным фоном", "SVG", "JPEG (300 dpi)", "Горизонтальный", "Квадратный (иконка)"].map(f => (
                    <span key={f} className="text-[10px] px-2 py-0.5 bg-background border border-border rounded-full text-muted-foreground">{f}</span>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Подвал */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-border shrink-0 bg-muted/10">
          <div className="text-xs text-muted-foreground">
            {!canSave && <span className="text-amber-600">Заполните обязательные поля *</span>}
          </div>
          <div className="flex gap-2">
            <button onClick={onClose}
              className="px-4 py-2 rounded-lg text-sm border border-border hover:bg-muted transition-colors text-foreground">
              Отмена
            </button>
            <button onClick={() => canSave && onSave(form)} disabled={!canSave}
              className="flex items-center gap-1.5 px-5 py-2 rounded-lg text-sm font-semibold text-white transition-opacity"
              style={{ background: canSave ? "hsl(162,60%,40%)" : "hsl(var(--muted))", opacity: canSave ? 1 : 0.5, cursor: canSave ? "pointer" : "not-allowed" }}>
              <Icon name="Save" size={14} />
              {isNew ? "Создать филиал" : "Сохранить"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Раздел «Филиалы» ────────────────────────────────────────────────────────
// ─── Права доступа для филиалов (из ролей) ────────────────────────────────────
// В реальной системе — из контекста авторизации
const CURRENT_USER_ROLE = "admin"; // admin | manager | readonly
const CAN_EDIT_BRANCHES = CURRENT_USER_ROLE === "admin" || CURRENT_USER_ROLE === "manager";

function BranchesSection() {
  const [branchList, setBranchList] = useState<BranchData[]>([
    {
      id: "1", tradeName: "Центральный", legalName: "ООО «Медицинский центр»", status: "active",
      phone: "+7 (495) 000-00-01", email: "central@clinic.ru", website: "",
      legalIndex: "101000", legalCity: "Москва", legalStreet: "ул. Ленина, 42",
      sameAddress: true, factIndex: "101000", factCity: "Москва", factStreet: "ул. Ленина, 42",
      inn: "7700000001", kpp: "770001001", ogrn: "1027700000001", legalForm: "ООО",
      bankName: "ПАО Сбербанк", bik: "044525225", checkingAccount: "40702810000000000001", corrAccount: "30101810400000000225",
      licenseNumber: "ЛО-77-01-000001", licenseDate: "2020-01-15", licenseExpiry: "", licenseAuthority: "Департамент здравоохранения г. Москвы", licenseActivity: "Медицинская деятельность",
      logos: [], rooms: 8, doctors: 12,
    },
    {
      id: "2", tradeName: "Северный", legalName: "ООО «Медицинский центр»", status: "active",
      phone: "+7 (495) 000-00-02", email: "north@clinic.ru", website: "",
      legalIndex: "127000", legalCity: "Москва", legalStreet: "пр. Победы, 17",
      sameAddress: false, factIndex: "127001", factCity: "Москва", factStreet: "пр. Победы, 17",
      inn: "7700000001", kpp: "770001001", ogrn: "1027700000001", legalForm: "ООО",
      bankName: "", bik: "", checkingAccount: "", corrAccount: "",
      licenseNumber: "ЛО-77-01-000002", licenseDate: "2021-03-10", licenseExpiry: "", licenseAuthority: "Департамент здравоохранения г. Москвы", licenseActivity: "",
      logos: [], rooms: 4, doctors: 6,
    },
  ]);

  // view = список, detail = просмотр карточки, edit = режим редактирования
  type ViewMode = "list" | "detail" | "edit";
  const [mode, setMode]           = useState<ViewMode>("list");
  const [selected, setSelected]   = useState<BranchData | null>(null);
  const [editBranch, setEditBranch] = useState<BranchData | null>(null);

  const handleSave = (b: BranchData) => {
    setBranchList(prev => prev.some(x => x.id === b.id) ? prev.map(x => x.id === b.id ? b : x) : [...prev, b]);
    // После сохранения — возвращаемся в просмотр (или список если новый)
    if (b.id && branchList.some(x => x.id === b.id)) {
      setSelected(b);
      setMode("detail");
    } else {
      setMode("list");
    }
    setEditBranch(null);
  };

  const openDetail = (b: BranchData) => { setSelected(b); setMode("detail"); };
  const openEdit   = (b: BranchData) => { setEditBranch({ ...b }); setMode("edit"); };
  const openNew    = () => { setEditBranch({ ...EMPTY_BRANCH }); setMode("edit"); };
  const backToList = () => { setMode("list"); setSelected(null); setEditBranch(null); };

  // ── РЕЖИМ ПРОСМОТРА КАРТОЧКИ ────────────────────────────────────────────────
  if (mode === "detail" && selected) {
    const b = branchList.find(x => x.id === selected.id) ?? selected;
    return (
      <div className="space-y-4 max-w-3xl">
        {/* Хлебные крошки + действия */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm">
            <button onClick={backToList} className="text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1">
              <Icon name="ChevronLeft" size={15} />
              Филиалы
            </button>
            <Icon name="ChevronRight" size={13} className="text-muted-foreground/50" />
            <span className="font-semibold text-foreground">{b.tradeName}</span>
          </div>
          {CAN_EDIT_BRANCHES ? (
            <button onClick={() => openEdit(b)}
              className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-semibold text-white hover:opacity-90 transition-opacity"
              style={{ background: "linear-gradient(90deg, hsl(199,85%,38%), hsl(162,60%,40%))" }}>
              <Icon name="Pencil" size={14} />
              Редактировать
            </button>
          ) : (
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-muted border border-border text-xs text-muted-foreground">
              <Icon name="Lock" size={13} />
              Редактирование запрещено
            </div>
          )}
        </div>

        {/* Шапка карточки */}
        <div className="bg-card border border-border rounded-xl overflow-hidden">
          <div className="h-2" style={{ background: "linear-gradient(90deg, hsl(199,85%,38%), hsl(162,60%,40%))" }} />
          <div className="p-5 flex items-start gap-4">
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center shrink-0"
              style={{ background: "linear-gradient(135deg, hsl(199,85%,38%), hsl(162,60%,40%))" }}>
              <Icon name="Building2" size={26} className="text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <h2 className="text-xl font-bold text-foreground">{b.tradeName}</h2>
                <span className={`text-[11px] px-2 py-0.5 rounded-full font-semibold ${
                  b.status === "active" ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"
                }`}>
                  {b.status === "active" ? "Активен" : "Неактивен"}
                </span>
              </div>
              {b.legalName && <p className="text-sm text-muted-foreground">{b.legalForm} «{b.legalName}»</p>}
              <div className="flex flex-wrap gap-4 mt-3">
                {[
                  { icon: "DoorOpen", val: `${b.rooms} кабинетов` },
                  { icon: "UserCheck", val: `${b.doctors} врачей` },
                ].map(s => (
                  <div key={s.icon} className="flex items-center gap-1.5 text-sm text-muted-foreground">
                    <Icon name={s.icon} size={14} className="text-primary" />
                    {s.val}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Контакты */}
          <BranchDetailSection title="Контакты" icon="Phone">
            <BranchInfoRow icon="Phone"   label="Телефон"  value={b.phone} />
            <BranchInfoRow icon="Mail"    label="Email"    value={b.email} />
            <BranchInfoRow icon="Globe"   label="Сайт"     value={b.website} />
          </BranchDetailSection>

          {/* Адрес */}
          <BranchDetailSection title="Адрес" icon="MapPin">
            <BranchInfoRow icon="MapPin"  label="Юридический адрес"
              value={[b.legalIndex, b.legalCity, b.legalStreet].filter(Boolean).join(", ")} />
            <BranchInfoRow icon="Navigation" label="Фактический адрес"
              value={b.sameAddress
                ? [b.legalIndex, b.legalCity, b.legalStreet].filter(Boolean).join(", ")
                : [b.factIndex, b.factCity, b.factStreet].filter(Boolean).join(", ")} />
          </BranchDetailSection>

          {/* Реквизиты */}
          <BranchDetailSection title="Реквизиты" icon="FileSpreadsheet">
            <BranchInfoRow icon="Hash"   label="ИНН"   value={b.inn} />
            <BranchInfoRow icon="Hash"   label="КПП"   value={b.kpp} />
            <BranchInfoRow icon="Hash"   label="ОГРН"  value={b.ogrn} />
            <BranchInfoRow icon="Landmark" label="Банк" value={b.bankName} />
            <BranchInfoRow icon="CreditCard" label="Расчётный счёт" value={b.checkingAccount} />
          </BranchDetailSection>

          {/* Лицензия */}
          <BranchDetailSection title="Лицензия" icon="ShieldCheck">
            <BranchInfoRow icon="FileText"  label="Номер лицензии"  value={b.licenseNumber} />
            <BranchInfoRow icon="Calendar"  label="Дата выдачи"
              value={b.licenseDate ? new Date(b.licenseDate).toLocaleDateString("ru-RU") : ""} />
            <BranchInfoRow icon="CalendarX" label="Срок действия"
              value={b.licenseExpiry ? new Date(b.licenseExpiry).toLocaleDateString("ru-RU") : "Бессрочная"} />
            <BranchInfoRow icon="Building"  label="Орган выдачи"    value={b.licenseAuthority} />
          </BranchDetailSection>
        </div>

        {/* Логотипы */}
        {b.logos.length > 0 && (
          <div className="bg-card border border-border rounded-xl overflow-hidden">
            <div className="flex items-center gap-2 px-4 py-3 border-b border-border bg-muted/20">
              <Icon name="Image" size={14} className="text-primary" />
              <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Логотипы</span>
            </div>
            <div className="p-4 grid grid-cols-3 sm:grid-cols-4 gap-3">
              {b.logos.map(logo => (
                <div key={logo.id} className="border border-border rounded-lg p-2 bg-muted/20 text-center">
                  <img src={logo.url} alt={logo.name} className="h-10 w-full object-contain mb-1.5" />
                  <p className="text-[10px] text-muted-foreground truncate">{logo.purpose}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  }

  // ── РЕЖИМ РЕДАКТИРОВАНИЯ ────────────────────────────────────────────────────
  if (mode === "edit" && editBranch) {
    const isNew = !branchList.some(x => x.id === editBranch.id);
    return (
      <div className="max-w-3xl space-y-4">
        {/* Хлебные крошки */}
        <div className="flex items-center gap-2 text-sm">
          <button onClick={backToList} className="text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1">
            <Icon name="ChevronLeft" size={15} />
            Филиалы
          </button>
          {!isNew && selected && (
            <>
              <Icon name="ChevronRight" size={13} className="text-muted-foreground/50" />
              <button onClick={() => { setMode("detail"); }} className="text-muted-foreground hover:text-foreground transition-colors">
                {selected.tradeName}
              </button>
            </>
          )}
          <Icon name="ChevronRight" size={13} className="text-muted-foreground/50" />
          <span className="font-semibold text-foreground">{isNew ? "Новый филиал" : "Редактирование"}</span>
        </div>
        <BranchModal
          branch={editBranch}
          onClose={() => isNew ? backToList() : setMode("detail")}
          onSave={handleSave}
          inline
        />
      </div>
    );
  }

  // ── СПИСОК ──────────────────────────────────────────────────────────────────
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-foreground">Филиалы</h2>
          <p className="text-sm text-muted-foreground">{branchList.length} {branchList.length === 1 ? "филиал" : "филиала"}</p>
        </div>
        {CAN_EDIT_BRANCHES && (
          <button onClick={openNew}
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold text-white hover:opacity-90 transition-opacity"
            style={{ background: "linear-gradient(90deg, hsl(199,85%,38%), hsl(162,60%,40%))" }}>
            <Icon name="Plus" size={16} />
            Добавить филиал
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {branchList.map(b => (
          <button key={b.id} onClick={() => openDetail(b)}
            className="bg-card border border-border rounded-xl overflow-hidden text-left transition-all hover:shadow-md hover:-translate-y-0.5 hover:border-primary/30 group">
            <div className="h-1.5" style={{ background: "linear-gradient(90deg, hsl(199,85%,38%), hsl(162,60%,40%))" }} />
            <div className="p-5">
              <div className="flex items-center justify-between mb-3">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                  style={{ background: "linear-gradient(135deg, hsl(199,85%,38%), hsl(162,60%,40%))" }}>
                  <Icon name="Building2" size={18} className="text-white" />
                </div>
                <div className="flex items-center gap-1.5">
                  <span className={`text-[11px] px-2 py-0.5 rounded-full font-semibold ${
                    b.status === "active" ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"
                  }`}>
                    {b.status === "active" ? "Активен" : "Неактивен"}
                  </span>
                  <Icon name="ChevronRight" size={14} className="text-muted-foreground/40 group-hover:text-primary transition-colors" />
                </div>
              </div>
              <h3 className="font-bold text-foreground mb-0.5">{b.tradeName}</h3>
              <p className="text-xs text-muted-foreground mb-2 line-clamp-1">
                {[b.legalCity, b.legalStreet].filter(Boolean).join(", ") || "Адрес не указан"}
              </p>
              <div className="flex items-center gap-3 text-xs text-muted-foreground">
                {b.phone && <span className="flex items-center gap-1"><Icon name="Phone" size={10} />{b.phone}</span>}
              </div>
              <div className="flex gap-2 mt-3">
                <div className="flex-1 bg-muted/40 rounded-lg py-1.5 text-center">
                  <span className="text-sm font-bold text-primary">{b.rooms}</span>
                  <span className="text-[10px] text-muted-foreground ml-1">кабинет.</span>
                </div>
                <div className="flex-1 bg-muted/40 rounded-lg py-1.5 text-center">
                  <span className="text-sm font-bold" style={{ color: "hsl(162,60%,40%)" }}>{b.doctors}</span>
                  <span className="text-[10px] text-muted-foreground ml-1">врачей</span>
                </div>
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

/* ─── ROOMS ─── */
function RoomsSection() {
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <p className="text-sm text-muted-foreground">{rooms.length} кабинетов</p>
        <button className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:opacity-90">
          <Icon name="Plus" size={16} />
          Добавить кабинет
        </button>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
        {rooms.map((r, i) => (
          <div key={i} className="bg-card border border-border rounded-xl p-5 card-hover">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div
                  className="w-9 h-9 rounded-lg flex items-center justify-center font-bold text-sm text-white"
                  style={{ background: r.status === "busy" ? "hsl(199,85%,38%)" : "hsl(162,60%,40%)" }}
                >
                  {r.number}
                </div>
                <span className="font-semibold text-sm text-foreground">{r.name}</span>
              </div>
              <span
                className={`text-xs px-2 py-1 rounded-full font-medium ${
                  r.status === "busy" ? "badge-status-active" : "badge-status-pending"
                }`}
              >
                {r.status === "busy" ? "Занят" : "Свободен"}
              </span>
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Icon name="Building2" size={13} />
                <span>{r.branch}</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Icon name="User" size={13} />
                <span>{r.doctor}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ─── SETTINGS ─── */
// ─── PLANS ───────────────────────────────────────────────────────────────────

const MONTHS_PLAN = ["Январь","Февраль","Март","Апрель","Май","Июнь","Июль","Август","Сентябрь","Октябрь","Ноябрь","Декабрь"];
const MONTHS_DAYS = [31,28,31,30,31,30,31,31,30,31,30,31];

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
  const [text, setText] = React.useState<string>(fmtNum(value));
  const [focused, setFocused] = React.useState(false);

  // Синхронизация при внешнем изменении (например, после save)
  React.useEffect(() => {
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

function PlansSection() {
  const [year, setYear]   = useState(2026);
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
      const updated = { ...prev, [key]: [...prev[key]] };
      updated[key][monthIdx] = num;
      // Пересчитываем total
      updated.total = updated.total.map((_, i) =>
        (updated.trauma[i] || 0) + (updated.neuro[i] || 0) + (updated.other[i] || 0)
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

// ─── ANALYSIS REPORT ─────────────────────────────────────────────────────────

// Данные из файла пользователя за 2025 год
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

// Демо-данные по дням мая 2026 (в реале — из БД по дате)
// Структура: день → специализация → { primary, repeat, revenue }
function generateDayData(day: number) {
  const seed = day * 7;
  const rnd  = (base: number, vary: number) => Math.max(0, base + ((seed * 13 + vary) % (vary * 2)) - vary);
  return {
    therapist: { primary: rnd(4,2), repeat: rnd(3,2), revenue: rnd(12500,3000) },
    uzi:       { primary: rnd(3,2), repeat: rnd(2,1), revenue: rnd(9600,2500)  },
    cardio:    { primary: rnd(2,1), repeat: rnd(2,1), revenue: rnd(9000,2000)  },
    gyneco:    { primary: rnd(2,1), repeat: rnd(2,1), revenue: rnd(10500,2500) },
    surgeon:   { primary: rnd(2,1), repeat: rnd(1,1), revenue: rnd(7500,2000)  },
  };
}

// Планы на месяц
const MONTH_PLANS_2026 = [4300000,4700000,5700000,5300000,5200000,5300000,5400000,6000000,5200000,6000000,5500000,5700000];

// Генерация данных дня по специализации и врачам (демо, в реале — из БД)
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
    doctors.forEach((doc, di) => {
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

function ClinicAnalysisReport() {
  const [selectedDate, setSelectedDate] = useState("2026-05-21");
  const [expandedSpecs, setExpandedSpecs] = useState<Set<string>>(new Set());

  const toggleSpec = (key: string) =>
    setExpandedSpecs(prev => { const s = new Set(prev); if (s.has(key)) { s.delete(key); } else { s.add(key); } return s; });

  const selD   = new Date(selectedDate);
  const selDay = selD.getDate();        // день (например 21)
  const selMon = selD.getMonth();       // 0-based (4 = май)
  const selYear= selD.getFullYear();

  // Данные выбранного дня (накопленные с начала месяца)
  const currAccum = getMonthAccum(selYear, selMon, selDay);
  const currReport = getDayReport(selectedDate);

  // ПП в день = накопленных первичных с начала месяца / кол-во прошедших дней
  const ppInDay = (primary: number) => selDay > 0 ? Math.round(primary / selDay) : 0;

  // Средний чек = выручка с начала месяца / первичных с начала месяца
  const avgCheckCalc = (revenue: number, primary: number) => primary > 0 ? Math.round(revenue / primary) : 0;

  // Колонки предыдущих месяцев (до текущего, берём тот же день)
  // Показываем последние 5 месяцев до текущего
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

  // Данные текущего месяца для плановых строк
  const currPlan     = MONTH_PLANS_2026[selMon] ?? 0;
  const currDaysInM  = new Date(selYear, selMon + 1, 0).getDate();
  const currShouldBe = currPlan > 0 ? Math.round(currPlan / currDaysInM * selDay) : 0;
  const currFactRev  = currAccum.totRevenue;
  const currPctPlan  = currPlan > 0 ? Math.round(currFactRev / currPlan * 100) : 0;

  const dateLabel = selD.toLocaleDateString("ru-RU", { weekday: "long", day: "numeric", month: "long", year: "numeric" });
  const totalCols = prevMonthCols.length + 1; // предыдущие + текущий



  // ── Компоненты ──────────────────────────────────────────────────────────────

  // Рендер-функции (не компоненты) — не пересоздаются React'ом
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

  // Градиентный цвет ячейки: 0 = красный, 1 = зелёный (по позиции в ранге)
  const gradientColor = (rank: number, total: number, isBg: boolean) => {
    if (total <= 1) return isBg ? "" : "hsl(var(--foreground))";
    // rank: 0 = минимум (красный), total-1 = максимум (зелёный)
    const t = rank / (total - 1); // 0..1
    if (isBg) {
      if (t >= 0.75) return "#dcfce7";       // зелёный
      if (t >= 0.4)  return "#fef9c3";       // жёлтый
      return "#fee2e2";                       // красный
    } else {
      if (t >= 0.75) return "#15803d";
      if (t >= 0.4)  return "#92400e";
      return "#dc2626";
    }
  };

  // Ячейка с градиентным цветом по рангу среди всех значений в строке
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

  // Строка данных с ранжированием цветов по всем месяцам
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
    const total    = allVals.length;

    // Ранжируем: сортируем ненулевые значения, определяем позицию каждого
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

// ─── Типы для ролей и доступа ─────────────────────────────────────────────────
type Permission = "allow" | "deny";
interface RolePermissions {
  schedule_view: Permission;
  schedule_edit: Permission;
  patients_view: Permission;
  patients_edit: Permission;
  branches_view: Permission;
  branches_edit: Permission;
  reports_view: Permission;
  plans_edit: Permission;
  employees_edit: Permission;
  settings_edit: Permission;
  finances_view: Permission;
}
interface Role { id: string; name: string; desc: string; color: string; permissions: RolePermissions }

const DEFAULT_PERMISSIONS: RolePermissions = {
  schedule_view: "allow", schedule_edit: "allow",
  patients_view: "allow", patients_edit: "allow",
  branches_view: "allow", branches_edit: "allow",
  reports_view:  "allow", plans_edit:    "allow",
  employees_edit:"allow", settings_edit: "allow",
  finances_view: "allow",
};

const PERM_GROUPS: { label: string; items: { key: keyof RolePermissions; label: string }[] }[] = [
  {
    label: "Расписание",
    items: [
      { key: "schedule_view", label: "Просмотр расписания" },
      { key: "schedule_edit", label: "Редактирование расписания / запись пациентов" },
    ],
  },
  {
    label: "Пациенты",
    items: [
      { key: "patients_view", label: "Просмотр карточек пациентов" },
      { key: "patients_edit", label: "Редактирование данных пациентов" },
    ],
  },
  {
    label: "Филиалы",
    items: [
      { key: "branches_view", label: "Просмотр данных филиалов" },
      { key: "branches_edit", label: "Редактирование филиалов (реквизиты, лицензия, логотипы)" },
    ],
  },
  {
    label: "Аналитика и планы",
    items: [
      { key: "reports_view", label: "Просмотр отчётов и дашборда" },
      { key: "plans_edit",   label: "Редактирование планов по выручке" },
      { key: "finances_view","label": "Просмотр финансовых данных" } as { key: keyof RolePermissions; label: string },
    ],
  },
  {
    label: "Персонал и настройки",
    items: [
      { key: "employees_edit", label: "Редактирование сотрудников и графиков" },
      { key: "settings_edit",  label: "Изменение настроек системы" },
    ],
  },
];

function RolesSection() {
  const [roles, setRoles] = useState<Role[]>([
    {
      id: "admin", name: "Администратор", desc: "Полный доступ ко всем функциям системы", color: "hsl(199,85%,38%)",
      permissions: { ...DEFAULT_PERMISSIONS },
    },
    {
      id: "manager", name: "Управляющий", desc: "Управление клиникой без доступа к настройкам системы", color: "hsl(162,60%,40%)",
      permissions: { ...DEFAULT_PERMISSIONS, settings_edit: "deny" },
    },
    {
      id: "receptionist", name: "Регистратор", desc: "Запись пациентов, просмотр расписания", color: "hsl(38,92%,50%)",
      permissions: {
        schedule_view: "allow", schedule_edit: "allow",
        patients_view: "allow", patients_edit: "allow",
        branches_view: "allow", branches_edit: "deny",
        reports_view:  "deny",  plans_edit:    "deny",
        employees_edit:"deny",  settings_edit: "deny",
        finances_view: "deny",
      },
    },
    {
      id: "readonly", name: "Только просмотр", desc: "Доступ только для чтения, без права редактирования", color: "#9b59b6",
      permissions: {
        schedule_view: "allow", schedule_edit: "deny",
        patients_view: "allow", patients_edit: "deny",
        branches_view: "allow", branches_edit: "deny",
        reports_view:  "allow", plans_edit:    "deny",
        employees_edit:"deny",  settings_edit: "deny",
        finances_view: "allow",
      },
    },
  ]);
  const [activeRole, setActiveRole] = useState<string>("admin");
  const [saved, setSaved] = useState(false);

  const role = roles.find(r => r.id === activeRole)!;

  const togglePerm = (key: keyof RolePermissions) => {
    setRoles(prev => prev.map(r => r.id === activeRole
      ? { ...r, permissions: { ...r.permissions, [key]: r.permissions[key] === "allow" ? "deny" : "allow" } }
      : r
    ));
    setSaved(false);
  };

  const handleSave = () => { setSaved(true); setTimeout(() => setSaved(false), 2000); };

  const allowCount = Object.values(role.permissions).filter(v => v === "allow").length;
  const totalCount = Object.values(role.permissions).length;

  return (
    <div className="flex gap-5">
      {/* Левая панель — список ролей */}
      <div className="w-56 shrink-0 space-y-1.5">
        <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground px-2 mb-2">Роли</p>
        {roles.map(r => (
          <button key={r.id} onClick={() => setActiveRole(r.id)}
            className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-left transition-all border ${
              activeRole === r.id ? "border-transparent shadow-sm" : "border-border bg-card hover:bg-muted/40"
            }`}
            style={activeRole === r.id ? { background: r.color + "18", borderColor: r.color + "40" } : {}}>
            <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: r.color }} />
            <div className="min-w-0">
              <p className="text-sm font-semibold text-foreground truncate">{r.name}</p>
            </div>
          </button>
        ))}
      </div>

      {/* Правая панель — права роли */}
      <div className="flex-1 min-w-0">
        <div className="bg-card border border-border rounded-2xl overflow-hidden">
          {/* Шапка */}
          <div className="flex items-center justify-between px-5 py-4 border-b border-border"
            style={{ background: role.color + "0f" }}>
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center"
                style={{ background: role.color }}>
                <Icon name="Shield" size={17} className="text-white" />
              </div>
              <div>
                <h3 className="font-bold text-foreground">{role.name}</h3>
                <p className="text-xs text-muted-foreground">{role.desc}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="text-right">
                <p className="text-xs text-muted-foreground">Разрешений</p>
                <p className="text-sm font-bold" style={{ color: role.color }}>{allowCount} / {totalCount}</p>
              </div>
              <button onClick={handleSave}
                className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-semibold text-white transition-colors"
                style={{ background: saved ? "hsl(162,60%,40%)" : role.color }}>
                <Icon name={saved ? "Check" : "Save"} size={14} />
                {saved ? "Сохранено" : "Сохранить"}
              </button>
            </div>
          </div>

          {/* Группы прав */}
          <div className="divide-y divide-border">
            {PERM_GROUPS.map(group => (
              <div key={group.label} className="px-5 py-4">
                <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-3">{group.label}</p>
                <div className="space-y-2.5">
                  {group.items.map(item => {
                    const val = role.permissions[item.key];
                    const isAllow = val === "allow";
                    return (
                      <div key={item.key} className="flex items-center justify-between gap-4">
                        <div className="flex items-center gap-2.5">
                          <Icon name={isAllow ? "CheckCircle2" : "XCircle"} size={16}
                            className={isAllow ? "text-green-500 shrink-0" : "text-red-400 shrink-0"} />
                          <span className="text-sm text-foreground">{item.label}</span>
                        </div>
                        <button onClick={() => togglePerm(item.key)}
                          className={`relative shrink-0 w-11 h-6 rounded-full transition-colors ${isAllow ? "bg-green-500" : "bg-muted"}`}>
                          <div className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform ${isAllow ? "translate-x-5.5" : "translate-x-0.5"}`}
                            style={{ transform: isAllow ? "translateX(20px)" : "translateX(2px)" }} />
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function SettingsSection() {
  const [openSection, setOpenSection] = useState<string | null>(null);
  const items = [
    { icon: "Building2",    title: "Реквизиты клиники",     desc: "Название, адрес, ИНН, лицензия" },
    { icon: "CreditCard",   title: "Платёжные системы",      desc: "ЮKassa, Сбербанк Эквайринг, Robokassa" },
    { icon: "MessageSquare",title: "SMS и Email рассылки",   desc: "Подключение СМС-шлюза, настройка уведомлений" },
    { icon: "PenLine",      title: "Электронная подпись",    desc: "Интеграция с УКЭП, настройка подписания" },
    { icon: "Bell",         title: "Уведомления",            desc: "Напоминания о приёмах, задачах" },
    { icon: "Smartphone",   title: "Мобильное приложение",   desc: "Настройки личного кабинета пациента" },
    { icon: "Database",     title: "Резервное копирование",  desc: "Расписание и хранение бэкапов" },
  ];

  if (openSection === "roles") {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-2 text-sm">
          <button onClick={() => setOpenSection(null)} className="text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1">
            <Icon name="ChevronLeft" size={15} />
            Настройки
          </button>
          <Icon name="ChevronRight" size={13} className="text-muted-foreground/50" />
          <span className="font-semibold text-foreground">Роли и доступ</span>
        </div>
        <RolesSection />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-bold text-foreground">Настройки</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {/* Роли и доступ — выделенная карточка */}
        <button onClick={() => setOpenSection("roles")}
          className="bg-card border-2 border-primary/20 rounded-xl p-5 card-hover text-left flex items-start gap-4 col-span-1"
          style={{ background: "hsl(199,85%,38%,0.04)" }}>
          <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
            style={{ background: "hsl(199,85%,38%,0.15)" }}>
            <Icon name="Lock" size={20} className="text-primary" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="font-semibold text-sm text-foreground mb-0.5">Роли и доступ</div>
            <div className="text-xs text-muted-foreground">Настройка прав по ролям: расписание, филиалы, отчёты и др.</div>
          </div>
          <Icon name="ChevronRight" size={16} className="text-primary shrink-0 mt-1" />
        </button>

        {items.map((s, i) => (
          <button key={i}
            className="bg-card border border-border rounded-xl p-5 card-hover text-left flex items-start gap-4">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 bg-accent">
              <Icon name={s.icon} size={20} className="text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="font-semibold text-sm text-foreground mb-0.5">{s.title}</div>
              <div className="text-xs text-muted-foreground">{s.desc}</div>
            </div>
            <Icon name="ChevronRight" size={16} className="text-muted-foreground shrink-0 mt-1" />
          </button>
        ))}
      </div>
    </div>
  );
}