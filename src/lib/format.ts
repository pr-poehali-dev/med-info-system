// Общие форматтеры чисел и денег для всего проекта

export function fmtNum(n: number): string {
  return n.toLocaleString("ru-RU");
}

export function fmtRub(n: number): string {
  return fmtNum(n) + " ₽";
}

export function fmtMoney(n: number): string {
  return n.toLocaleString("ru-RU") + " ₽";
}

export function pct(fact: number, plan: number): number {
  return Math.min(100, Math.round((fact / plan) * 100));
}
