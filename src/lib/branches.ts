import type { BranchData } from "./types";

// Пустой шаблон филиала для формы создания
export const EMPTY_BRANCH: BranchData = {
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

// Варианты назначения логотипа
export const LOGO_PURPOSES = [
  "Основной логотип",
  "Логотип для печати",
  "Мобильное приложение",
  "Сайт",
  "Факсимиле",
];

// Организационно-правовые формы
export const LEGAL_FORMS = [
  "ООО", "ОАО", "ЗАО", "ПАО", "АО", "ИП", "НКО", "ГБУЗ", "ФГБУ",
];
