import React, { useState } from "react";
import Icon from "@/components/ui/icon";
import type { BranchData, BranchLogo } from "@/lib/types";
import { EMPTY_BRANCH, LOGO_PURPOSES, LEGAL_FORMS } from "@/lib/branches";

// ─── Права доступа (в реальной системе — из контекста авторизации) ────────────
const CURRENT_USER_ROLE = "admin"; // admin | manager | readonly
const CAN_EDIT_BRANCHES = CURRENT_USER_ROLE === "admin" || CURRENT_USER_ROLE === "manager";

// ─── Переиспользуемые поля ввода (объявлены вне родительской функции!) ────────
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

// ─── Компоненты карточки филиала (просмотр) ──────────────────────────────────
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

  const legalFull = [form.legalIndex, form.legalCity, form.legalStreet].filter(Boolean).join(", ");

  const handleSameAddress = (checked: boolean) => {
    set("sameAddress", checked);
    if (checked) {
      setForm(prev => ({ ...prev, sameAddress: true, factIndex: prev.legalIndex, factCity: prev.legalCity, factStreet: prev.legalStreet }));
    }
  };

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

// ─── Раздел «Филиалы» ─────────────────────────────────────────────────────────
export default function BranchesSection() {
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

  type ViewMode = "list" | "detail" | "edit";
  const [mode, setMode]           = useState<ViewMode>("list");
  const [selected, setSelected]   = useState<BranchData | null>(null);
  const [editBranch, setEditBranch] = useState<BranchData | null>(null);

  const handleSave = (b: BranchData) => {
    setBranchList(prev => prev.some(x => x.id === b.id) ? prev.map(x => x.id === b.id ? b : x) : [...prev, b]);
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
          <BranchDetailSection title="Контакты" icon="Phone">
            <BranchInfoRow icon="Phone"   label="Телефон"  value={b.phone} />
            <BranchInfoRow icon="Mail"    label="Email"    value={b.email} />
            <BranchInfoRow icon="Globe"   label="Сайт"     value={b.website} />
          </BranchDetailSection>

          <BranchDetailSection title="Адрес" icon="MapPin">
            <BranchInfoRow icon="MapPin"  label="Юридический адрес"
              value={[b.legalIndex, b.legalCity, b.legalStreet].filter(Boolean).join(", ")} />
            <BranchInfoRow icon="Navigation" label="Фактический адрес"
              value={b.sameAddress
                ? [b.legalIndex, b.legalCity, b.legalStreet].filter(Boolean).join(", ")
                : [b.factIndex, b.factCity, b.factStreet].filter(Boolean).join(", ")} />
          </BranchDetailSection>

          <BranchDetailSection title="Реквизиты" icon="FileSpreadsheet">
            <BranchInfoRow icon="Hash"   label="ИНН"   value={b.inn} />
            <BranchInfoRow icon="Hash"   label="КПП"   value={b.kpp} />
            <BranchInfoRow icon="Hash"   label="ОГРН"  value={b.ogrn} />
            <BranchInfoRow icon="Landmark" label="Банк" value={b.bankName} />
            <BranchInfoRow icon="CreditCard" label="Расчётный счёт" value={b.checkingAccount} />
          </BranchDetailSection>

          <BranchDetailSection title="Лицензия" icon="ShieldCheck">
            <BranchInfoRow icon="FileText"  label="Номер лицензии"  value={b.licenseNumber} />
            <BranchInfoRow icon="Calendar"  label="Дата выдачи"
              value={b.licenseDate ? new Date(b.licenseDate).toLocaleDateString("ru-RU") : ""} />
            <BranchInfoRow icon="CalendarX" label="Срок действия"
              value={b.licenseExpiry ? new Date(b.licenseExpiry).toLocaleDateString("ru-RU") : "Бессрочная"} />
            <BranchInfoRow icon="Building"  label="Орган выдачи"    value={b.licenseAuthority} />
          </BranchDetailSection>
        </div>

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
