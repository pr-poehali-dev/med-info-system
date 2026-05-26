import React, { lazy, Suspense, useMemo } from 'react';
import type { LucideProps } from 'lucide-react';
import {
  // Навигация / стрелки
  ArrowDown, ArrowLeft, ArrowLeftRight, ArrowRight, ArrowUp,
  ChevronDown, ChevronLeft, ChevronRight, ChevronUp,
  // Алерты / статусы
  AlertCircle, CircleAlert, Check, Info, Loader2, X,
  // UI / общее
  Bell, Copy, Download, Edit2, ExternalLink, Eye, EyeOff, Image,
  Key, Lock, LogIn, Menu, Minus, MoreHorizontal, MoreVertical,
  Pencil, Plus, RefreshCw, Save, Search, Settings, Share2,
  Trash2, Upload,
  // Даты / время
  CalendarCheck, CalendarDays, CalendarPlus, CalendarX, Clock,
  // Контакты / адрес
  Building, Building2, DoorOpen, Globe, Mail, MapPin, Navigation, Phone,
  // Файлы / документы
  FilePlus, FileSpreadsheet, FileText, Folder, FolderOpen, Printer, Receipt,
  // Пользователи / роли
  Handshake, Heart, Shield, ShieldCheck, User, UserCheck, UserPlus, Users,
  // Аналитика / графики
  BarChart3, LayoutDashboard, Target, TrendingDown, TrendingUp,
  // Финансы
  Banknote, CreditCard, Hash, Landmark, Tag,
  // Прочее
  PhoneIncoming, Zap,
} from 'lucide-react';

// Whitelist часто используемых иконок — попадают в основной бандл (tree-shaken).
const ICONS: Record<string, React.FC<LucideProps>> = {
  ArrowDown, ArrowLeft, ArrowLeftRight, ArrowRight, ArrowUp,
  ChevronDown, ChevronLeft, ChevronRight, ChevronUp,
  AlertCircle, CircleAlert, Check, Info, Loader2, X,
  Bell, Copy, Download, Edit2, ExternalLink, Eye, EyeOff, Image,
  Key, Lock, LogIn, Menu, Minus, MoreHorizontal, MoreVertical,
  Pencil, Plus, RefreshCw, Save, Search, Settings, Share2,
  Trash2, Upload,
  CalendarCheck, CalendarDays, CalendarPlus, CalendarX, Clock,
  Building, Building2, DoorOpen, Globe, Mail, MapPin, Navigation, Phone,
  FilePlus, FileSpreadsheet, FileText, Folder, FolderOpen, Printer, Receipt,
  Handshake, Heart, Shield, ShieldCheck, User, UserCheck, UserPlus, Users,
  BarChart3, LayoutDashboard, Target, TrendingDown, TrendingUp,
  Banknote, CreditCard, Hash, Landmark, Tag,
  PhoneIncoming, Zap,
};

// Кеш для ленивых компонентов «редких» иконок, чтобы не пересоздавать
const lazyCache = new Map<string, React.LazyExoticComponent<React.FC<LucideProps>>>();

const getLazyIcon = (name: string) => {
  let comp = lazyCache.get(name);
  if (!comp) {
    comp = lazy(async () => {
      const mod = await import('lucide-react');
      const Found = (mod as unknown as Record<string, React.FC<LucideProps>>)[name];
      return { default: Found ?? CircleAlert };
    });
    lazyCache.set(name, comp);
  }
  return comp;
};

interface IconProps extends LucideProps {
  name: string;
  fallback?: string;
}

const Icon: React.FC<IconProps> = ({ name, fallback = 'CircleAlert', ...props }) => {
  const Direct = ICONS[name] ?? ICONS[fallback];
  // useMemo вызывается всегда (правила хуков); подгружаем только если иконки нет в whitelist
  const Lazy = useMemo(() => (Direct ? null : getLazyIcon(name)), [Direct, name]);

  if (Direct) return <Direct {...props} />;
  if (!Lazy) return null;

  return (
    <Suspense fallback={<span style={{ display: 'inline-block', width: props.size ?? 16, height: props.size ?? 16 }} />}>
      <Lazy {...props} />
    </Suspense>
  );
};

export default Icon;