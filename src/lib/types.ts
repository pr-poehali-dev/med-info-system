// Общие типы данных проекта

export interface BranchLogo {
  id: string;
  name: string;
  purpose: string;
  url: string;
}

export interface BranchData {
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
