import { useState } from "react";
import Icon from "@/components/ui/icon";
import Schedule from "@/components/Schedule";

type Section =
  | "dashboard"
  | "schedule"
  | "patients"
  | "protocols"
  | "documents"
  | "prices"
  | "reports"
  | "work-schedule"
  | "print-services"
  | "crm"
  | "employees"
  | "branches"
  | "rooms"
  | "settings";

const navItems: { id: Section; label: string; icon: string; group: string }[] = [
  { id: "schedule", label: "Расписание приёмов", icon: "CalendarDays", group: "main" },
  { id: "dashboard", label: "Дашборд", icon: "LayoutDashboard", group: "main" },
  { id: "patients", label: "Пациенты", icon: "Users", group: "main" },
  { id: "protocols", label: "Протоколы и шаблоны", icon: "FileText", group: "main" },
  { id: "documents", label: "Договора и ИДС", icon: "FolderOpen", group: "docs" },
  { id: "prices", label: "Прайс-лист", icon: "Tag", group: "docs" },
  { id: "print-services", label: "Перечень услуг", icon: "Printer", group: "docs" },
  { id: "reports", label: "Отчёты", icon: "BarChart3", group: "analytics" },
  { id: "crm", label: "CRM", icon: "Handshake", group: "analytics" },
  { id: "work-schedule", label: "График работы", icon: "Clock", group: "staff" },
  { id: "employees", label: "Сотрудники", icon: "UserCheck", group: "staff" },
  { id: "branches", label: "Филиалы", icon: "Building2", group: "staff" },
  { id: "rooms", label: "Кабинеты", icon: "DoorOpen", group: "staff" },
  { id: "settings", label: "Настройки", icon: "Settings", group: "system" },
];

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
  const [active, setActive] = useState<Section>("schedule");
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const grouped: Record<string, typeof navItems> = {};
  navItems.forEach((item) => {
    if (!grouped[item.group]) grouped[item.group] = [];
    grouped[item.group].push(item);
  });

  return (
    <div className="flex h-screen bg-background overflow-hidden font-golos">
      {/* Sidebar */}
      <aside
        className={`sidebar-gradient flex flex-col transition-all duration-300 ${
          sidebarCollapsed ? "w-16" : "w-64"
        } shrink-0 border-r border-sidebar-border`}
      >
        {/* Logo */}
        <div className="flex items-center gap-3 px-4 py-5 border-b border-sidebar-border">
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
            style={{ background: "linear-gradient(135deg, hsl(199,85%,50%), hsl(162,60%,45%))" }}
          >
            <Icon name="Heart" size={16} className="text-white" />
          </div>
          {!sidebarCollapsed && (
            <div className="animate-fade-in">
              <div className="text-white font-bold text-sm leading-tight">Ваш доктор</div>
              <div className="text-sidebar-foreground text-xs opacity-60">МИС v1.0</div>
            </div>
          )}
          {!sidebarCollapsed && (
            <button
              onClick={() => setSidebarCollapsed(true)}
              className="ml-auto text-sidebar-foreground hover:text-white transition-colors p-1 rounded hover:bg-sidebar-accent"
              title="Свернуть меню"
            >
              <Icon name="ChevronLeft" size={16} />
            </button>
          )}
        </div>

        {/* Кнопка развернуть (только при свёрнутом) */}
        {sidebarCollapsed && (
          <button
            onClick={() => setSidebarCollapsed(false)}
            className="mx-auto mt-2 mb-1 w-9 h-9 flex items-center justify-center rounded-lg hover:bg-sidebar-accent text-sidebar-foreground hover:text-white transition-colors border border-sidebar-border"
            title="Развернуть меню"
          >
            <Icon name="ChevronRight" size={16} />
          </button>
        )}

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto scrollbar-thin py-3 px-2">
          {Object.entries(grouped).map(([group, items]) => (
            <div key={group} className="mb-4">
              {!sidebarCollapsed && (
                <div className="px-3 mb-1 text-xs font-semibold uppercase tracking-wider text-sidebar-foreground opacity-40">
                  {groupLabels[group]}
                </div>
              )}
              {items.map((item) => (
                <button
                  key={item.id}
                  onClick={() => setActive(item.id)}
                  title={sidebarCollapsed ? item.label : undefined}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg mb-0.5 text-sm font-medium transition-all duration-150 ${
                    active === item.id
                      ? "nav-item-active shadow-sm"
                      : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                  } ${sidebarCollapsed ? "justify-center" : ""}`}
                >
                  <Icon name={item.icon} size={18} className="shrink-0" />
                  {!sidebarCollapsed && <span className="truncate">{item.label}</span>}
                </button>
              ))}
            </div>
          ))}
        </nav>

        {/* User */}
        <div className="px-3 py-3 border-t border-sidebar-border">
          <div
            className={`flex items-center gap-3 px-2 py-2 rounded-lg hover:bg-sidebar-accent cursor-pointer transition-colors ${
              sidebarCollapsed ? "justify-center" : ""
            }`}
          >
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 text-xs font-bold text-white"
              style={{ background: "linear-gradient(135deg, hsl(199,85%,45%), hsl(162,60%,40%))" }}
            >
              {user?.name?.slice(0, 2).toUpperCase() || "АД"}
            </div>
            {!sidebarCollapsed && (
              <div className="min-w-0">
                <div className="text-sidebar-foreground text-xs font-medium truncate">{user?.name || "Администратор"}</div>
                <div className="text-sidebar-foreground text-xs opacity-50 truncate capitalize">{user?.role || "admin"}</div>
              </div>
            )}
          </div>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Topbar — скрыт для расписания */}
        {active !== "schedule" && (
          <header className="bg-card border-b border-border flex items-center justify-between px-6 py-3.5 shrink-0">
            <div>
              <h1 className="text-lg font-bold text-foreground">
                {navItems.find((n) => n.id === active)?.label || "Дашборд"}
              </h1>
              <p className="text-xs text-muted-foreground">
                {new Date().toLocaleDateString("ru-RU", {
                  weekday: "long",
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                })}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <button className="relative p-2 rounded-lg hover:bg-muted transition-colors">
                <Icon name="Bell" size={18} className="text-muted-foreground" />
                <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-red-500"></span>
              </button>
              <button className="flex items-center gap-2 px-3 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 transition-opacity">
                <Icon name="Plus" size={15} />
                Новый приём
              </button>
            </div>
          </header>
        )}

        {/* Content */}
        <div className={`flex-1 ${active === "schedule" ? "overflow-hidden flex flex-col p-0" : "overflow-y-auto scrollbar-thin p-6"}`}>
          <div className={`animate-fade-in ${active === "schedule" ? "h-full flex flex-col" : "max-w-[1280px]"}`}>
            {active === "dashboard" && <DashboardSection />}
            {active === "schedule" && <Schedule />}
            {active === "patients" && <PatientsSection />}
            {active === "protocols" && <ProtocolsSection />}
            {active === "documents" && <DocumentsSection />}
            {active === "prices" && <PricesSection />}
            {active === "reports" && <ReportsSection />}
            {active === "work-schedule" && <WorkScheduleSection />}
            {active === "print-services" && <PrintServicesSection />}
            {active === "crm" && <CRMSection />}
            {active === "employees" && <EmployeesSection />}
            {active === "branches" && <BranchesSection />}
            {active === "rooms" && <RoomsSection />}
            {active === "settings" && <SettingsSection />}
          </div>
        </div>
      </main>
    </div>
  );
}

/* ─── DASHBOARD ─── */

// Демо-данные из МИС (потом заменятся реальными из БД)
const TODAY_DATA = {
  date: "21 мая 2026, среда",
  // Из расписания
  primary:  { trauma: 9,  neuro: 4,  total: 13 },
  repeat:   { trauma: 6,  neuro: 3,  total: 9  },
  total:    22,
  // Выручка (расчёт: кол-во × ср.чек)
  revenue:  { trauma: 134_500, neuro: 58_200, total: 192_700 },
  avgCheck: { trauma: 8_969, neuro: 9_700, total: 8_759 },
  // Лиды
  leads:    { trauma: 6, neuro: 3, total: 9, converted: 7 },
};

const MONTH_DATA = {
  month: "Май 2026",
  daysTotal: 31,
  daysPassed: 21,
  plan: 5_200_000,
  // Должно быть к этому дню = план / дней * прошло
  shouldBe: Math.round(5_200_000 / 31 * 21),
  fact: 586_897 + 193_050 + 140_000, // травма + невро + прочие (демо май из файла)
  primary: { trauma: 24, neuro: 22, total: 46 },
  repeat:  { trauma: 21, neuro: 19, total: 40 },
  revenue: { trauma: 311_887, neuro: 193_050, total: 504_937 },
  avgCheck:{ trauma: 12_995, neuro: 8_775, total: 10_108 },
  leads:   { total: 91, trauma: 45, neuro: 43, converted: 47, convPct: 51 },
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
  const [tab, setTab] = useState<"today" | "month">("today");

  const todaySpecRows = [
    { label: "Травматология", primary: TODAY_DATA.primary.trauma, repeat: TODAY_DATA.repeat.trauma, revenue: TODAY_DATA.revenue.trauma, avgCheck: TODAY_DATA.avgCheck.trauma, color: "#1a9cbe" },
    { label: "Неврология",    primary: TODAY_DATA.primary.neuro,  repeat: TODAY_DATA.repeat.neuro,  revenue: TODAY_DATA.revenue.neuro,  avgCheck: TODAY_DATA.avgCheck.neuro,  color: "#e67e22" },
  ];

  const monthSpecRows = [
    { label: "Травматология", primary: MONTH_DATA.primary.trauma, repeat: MONTH_DATA.repeat.trauma, revenue: MONTH_DATA.revenue.trauma, avgCheck: MONTH_DATA.avgCheck.trauma, color: "#1a9cbe" },
    { label: "Неврология",    primary: MONTH_DATA.primary.neuro,  repeat: MONTH_DATA.repeat.neuro,  revenue: MONTH_DATA.revenue.neuro,  avgCheck: MONTH_DATA.avgCheck.neuro,  color: "#e67e22" },
  ];

  const monthPct    = pct(MONTH_DATA.fact, MONTH_DATA.plan);
  const shouldBePct = pct(MONTH_DATA.shouldBe, MONTH_DATA.plan);

  return (
    <div className="space-y-5">

      {/* Переключатель */}
      <div className="flex items-center gap-2">
        {([["today", "Сегодня · 21 мая"], ["month", "Май 2026"]] as const).map(([id, label]) => (
          <button key={id} onClick={() => setTab(id)}
            className="px-4 py-2 rounded-lg text-sm font-semibold border transition-colors"
            style={tab === id
              ? { background: "hsl(199,85%,38%)", color: "white", borderColor: "hsl(199,85%,38%)" }
              : { borderColor: "hsl(var(--border))", color: "hsl(var(--foreground))", background: "hsl(var(--card))" }}>
            {label}
          </button>
        ))}
        <span className="ml-auto text-xs text-muted-foreground">Данные из МИС · обновлено сейчас</span>
      </div>

      {/* ══ СЕГОДНЯ ══ */}
      {tab === "today" && (
        <div className="space-y-5">
          {/* KPI-карточки */}
          <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-5 gap-3">
            <KpiCard label="Приёмов сегодня"   value={String(TODAY_DATA.total)}             icon="CalendarCheck"  accent="hsl(199,85%,38%)" />
            <KpiCard label="Первичных"          value={String(TODAY_DATA.primary.total)}     icon="UserPlus"       accent="hsl(162,60%,40%)" />
            <KpiCard label="Повторных"          value={String(TODAY_DATA.repeat.total)}      icon="RefreshCw"      accent="hsl(38,92%,50%)" />
            <KpiCard label="Выручка за день"    value={fmtRub(TODAY_DATA.revenue.total)}     icon="Banknote"       accent="hsl(162,60%,40%)" />
            <KpiCard label="Ср. чек"            value={fmtRub(TODAY_DATA.avgCheck.total)}    icon="Receipt"        accent="hsl(199,85%,38%)" />
          </div>

          {/* Лиды сегодня */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <KpiCard label="Лидов сегодня"       value={String(TODAY_DATA.leads.total)}     icon="PhoneIncoming"  accent="hsl(271,70%,55%)" />
            <KpiCard label="Записались"          value={String(TODAY_DATA.leads.converted)} icon="CalendarPlus"   accent="hsl(162,60%,40%)" />
            <KpiCard label="Конверсия"           value={`${Math.round(TODAY_DATA.leads.converted/TODAY_DATA.leads.total*100)}%`} icon="TrendingUp" accent="hsl(199,85%,38%)"
              pctVal={Math.round(TODAY_DATA.leads.converted/TODAY_DATA.leads.total*100)} />
          </div>

          {/* Таблица по специализациям */}
          <div>
            <h3 className="text-sm font-semibold text-foreground mb-2">По специализациям — сегодня</h3>
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
          <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-5 gap-3">
            <KpiCard label="Всего приёмов"   value={String(MONTH_DATA.primary.total + MONTH_DATA.repeat.total)} icon="CalendarCheck" accent="hsl(199,85%,38%)" />
            <KpiCard label="Первичных"        value={String(MONTH_DATA.primary.total)}  icon="UserPlus"     accent="hsl(162,60%,40%)" />
            <KpiCard label="Повторных"        value={String(MONTH_DATA.repeat.total)}   icon="RefreshCw"    accent="hsl(38,92%,50%)" />
            <KpiCard label="Выручка (факт)"   value={fmtRub(MONTH_DATA.fact)}           icon="Banknote"     accent="hsl(162,60%,40%)" />
            <KpiCard label="Ср. чек"          value={fmtRub(MONTH_DATA.avgCheck.total)} icon="Receipt"      accent="hsl(199,85%,38%)" />
          </div>

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
                { label: "Всего лидов",    val: MONTH_DATA.leads.total,      color: "hsl(199,85%,38%)" },
                { label: "Записались",     val: MONTH_DATA.leads.converted,  color: "hsl(162,60%,40%)" },
                { label: "Травматология",  val: MONTH_DATA.leads.trauma,     color: "#1a9cbe" },
                { label: "Неврология",     val: MONTH_DATA.leads.neuro,      color: "#e67e22" },
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

  const ColHeader = () => (
    <div className="grid items-center border-b border-border bg-muted/30 sticky top-0 z-10"
      style={{ gridTemplateColumns: "1fr 100px 140px" }}>
      <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider px-5 py-2">Тип / Специализация / Врач</span>
      <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider text-right py-2 pr-4">Кол-во</span>
      <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider text-right py-2 pr-5">Сумма</span>
    </div>
  );

  const TypeRow = ({ label, total, expanded, onToggle, accent }: {
    label: string; total: { count: number; sum: number };
    expanded: boolean; onToggle: () => void; accent: string;
  }) => (
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

  const SpecRow = ({ specKey, spec, count, sum, expanded }: {
    specKey: string; spec: string; count: number; sum: number; expanded: boolean;
  }) => (
    <button onClick={() => toggleSpec(specKey)}
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

  const DoctorRow = ({ doc, count, sum }: { doc: typeof REPORT_DOCTORS[0]; count: number; sum: number }) => (
    <div className="grid items-center border-t border-border/30 hover:bg-muted/10 transition-colors"
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
            <SpecRow specKey={specKey} spec={group.spec} count={group.count} sum={group.sum} expanded={specExpanded} />
            {specExpanded && group.doctors.map(d => (
              <DoctorRow key={d.doc.id} doc={d.doc} count={d.count} sum={d.sum} />
            ))}
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
          <ColHeader />

          {/* Первичный */}
          <div className="border-b border-border">
            <TypeRow label="Первичный приём" total={primaryTotal} expanded={expandedPrimary}
              onToggle={() => setExpandedPrimary(v => !v)} accent="hsl(199,85%,38%)" />
            {expandedPrimary && (
              <div>{renderTree(primaryTree, "primary")}</div>
            )}
          </div>

          {/* Повторный */}
          <div className="border-b border-border">
            <TypeRow label="Повторный приём" total={repeatTotal} expanded={expandedRepeat}
              onToggle={() => setExpandedRepeat(v => !v)} accent="hsl(162,60%,40%)" />
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
  const [activeReport, setActiveReport] = useState<"summary" | "appointments" | "revenue">("appointments");

  const months = ["Янв", "Фев", "Мар", "Апр", "Май"];
  const revenue = [1420, 1680, 1950, 2100, 2184];
  const max = Math.max(...revenue);

  const reportTabs = [
    { id: "appointments" as const, label: "Отчёт по приёмам",    icon: "ClipboardList" },
    { id: "summary"      as const, label: "Сводный дашборд",     icon: "LayoutDashboard" },
    { id: "revenue"      as const, label: "Выручка по месяцам",  icon: "TrendingUp" },
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
function BranchesSection() {
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <p className="text-sm text-muted-foreground">{branches.length} филиала</p>
        <button className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:opacity-90">
          <Icon name="Plus" size={16} />
          Добавить филиал
        </button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {branches.map((b, i) => (
          <div key={i} className="bg-card border border-border rounded-xl p-6 card-hover">
            <div className="flex items-start justify-between mb-4">
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0"
                style={{ background: "linear-gradient(135deg, hsl(199,85%,38%), hsl(162,60%,40%))" }}
              >
                <Icon name="Building2" size={22} className="text-white" />
              </div>
              <span className="badge-status-active text-xs px-2.5 py-1 rounded-full font-medium">Активен</span>
            </div>
            <h3 className="font-bold text-foreground text-lg mb-1">{b.name}</h3>
            <p className="text-muted-foreground text-sm mb-4">{b.address}</p>
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-muted/50 rounded-lg p-3 text-center">
                <div className="text-2xl font-bold text-primary">{b.rooms}</div>
                <div className="text-xs text-muted-foreground">кабинетов</div>
              </div>
              <div className="bg-muted/50 rounded-lg p-3 text-center">
                <div className="text-2xl font-bold text-secondary">{b.doctors}</div>
                <div className="text-xs text-muted-foreground">врачей</div>
              </div>
            </div>
          </div>
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
function SettingsSection() {
  const items = [
    { icon: "Building2", title: "Реквизиты клиники", desc: "Название, адрес, ИНН, лицензия" },
    { icon: "CreditCard", title: "Платёжные системы", desc: "ЮKassa, Сбербанк Эквайринг, Robokassa" },
    { icon: "MessageSquare", title: "SMS и Email рассылки", desc: "Подключение СМС-шлюза, настройка уведомлений" },
    { icon: "PenLine", title: "Электронная подпись", desc: "Интеграция с УКЭП, настройка подписания" },
    { icon: "Bell", title: "Уведомления", desc: "Напоминания о приёмах, задачах" },
    { icon: "Lock", title: "Роли и доступ", desc: "Права пользователей по ролям" },
    { icon: "Smartphone", title: "Мобильное приложение", desc: "Настройки личного кабинета пациента" },
    { icon: "Database", title: "Резервное копирование", desc: "Расписание и хранение бэкапов" },
  ];
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
      {items.map((s, i) => (
        <button
          key={i}
          className="bg-card border border-border rounded-xl p-5 card-hover text-left flex items-start gap-4"
        >
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
  );
}