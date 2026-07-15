import React, { useState, useEffect } from "react";
import {
  LayoutDashboard,
  Users,
  CheckSquare,
  Bot,
  Settings,
  RefreshCw,
  Globe,
  Server,
  Heart,
  LogOut,
  Command,
  Gift,
  Menu,
  Briefcase,
  X,
  Cloud,
  Clock,
  Tag,
  MessageSquare,
  ChevronDown,
  ChevronUp,
  Sun,
  Moon,
  Key,
} from "lucide-react";

// Types & Data
import {
  PanelSettings,
  InboundInfo,
  User,
  Transaction,
  VpnPlan,
  SubscriptionKey,
  CustomButton,
  GiftCode,
  PromoCode,
  PlanCategory,
  Ticket,
} from "./types";

import { Language, translations } from "./lang/locales";
import {
  initialSettings,
  initialInbounds,
  initialUsers,
  initialPlans,
  initialTransactions,
  initialSubscriptionKeys,
} from "./data";

// Sub Components
import DashboardOverview from "./components/DashboardOverview";
import UserManagement from "./components/UserManagement";
import { VpnKeysManager } from "./components/VpnKeysManager";
import TransactionApproval from "./components/TransactionApproval";
import BotSimulator from "./components/BotSimulator";
import ServerManagement from "./components/ServerManagement";
import ColleaguesManagement from "./components/ColleaguesManagement";
import ColleagueAccounts from "./components/ColleagueAccounts";
import SettingsPanel from "./components/SettingsPanel";
import BotButtonsPanel from "./components/BotButtonsPanel";
import GiftCodeManager from "./components/GiftCodeManager";
import TicketManager from "./components/TicketManager";
import BotLogs from "./components/BotLogs";
import { LoginScreen } from "./components/LoginScreen";
import ConfirmationModal from "./components/ConfirmationModal";
import SetupModal from "./components/SetupModal";
import { motion, AnimatePresence } from "motion/react";

const LionAndSunFlag = () => {
  return (
    <div
      className="inline-flex items-center select-none"
      title="درَفش شَهباز (پرچم کوروش بزرگ)"
    >
      <svg
        width="34"
        height="34"
        viewBox="0 0 100 100"
        fill="none"
        className="rounded-md overflow-hidden shadow-[0_4px_12px_rgba(0,0,0,0.6)] border border-yellow-600/50 transition duration-300 hover:scale-110 shrink-0"
      >
        <defs>
          <radialGradient id="royalRed" cx="50%" cy="50%" r="70%">
            <stop offset="0%" stopColor="#9C0000" />
            <stop offset="60%" stopColor="#6E0000" />
            <stop offset="100%" stopColor="#3A0000" />
          </radialGradient>
          <linearGradient
            id="goldSovereign"
            x1="0%"
            y1="0%"
            x2="100%"
            y2="100%"
          >
            <stop offset="0%" stopColor="#FFF4D0" />
            <stop offset="30%" stopColor="#FFD54F" />
            <stop offset="70%" stopColor="#FB8C00" />
            <stop offset="100%" stopColor="#8D6E63" />
          </linearGradient>
          <linearGradient id="goldInner" x1="0%" y1="100%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#E5A93B" />
            <stop offset="50%" stopColor="#FFD54F" />
            <stop offset="100%" stopColor="#FFE082" />
          </linearGradient>
          <filter id="goldGlow" x="-10%" y="-10%" width="120%" height="120%">
            <feGaussianBlur stdDeviation="0.5" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>

        {/* Deep rich crimson/burgundy background */}
        <rect width="100" height="100" fill="url(#royalRed)" />

        {/* Texture detail line pattern overlay (subtle royal pattern) */}
        <rect
          fill="none"
          stroke="url(#goldSovereign)"
          strokeWidth="0.8"
          className="opacity-70"
          x="2.5"
          y="2.5"
          width="95"
          height="95"
        />
        <rect
          fill="none"
          stroke="url(#goldSovereign)"
          strokeWidth="0.3"
          className="opacity-40"
          x="5.5"
          y="5.5"
          width="89"
          height="89"
        />

        {/* --- BORDER OF GOLDEN TRIANGLES (POINTING INWARDS) --- */}
        {/* Top edge pointing down */}
        {Array.from({ length: 15 }).map((_, i) => {
          const step = 88 / 15;
          const x1 = 6 + i * step;
          const x2 = 6 + (i + 1) * step;
          const xc = x1 + step / 2;
          return (
            <polygon
              key={`t-${i}`}
              points={`${x1},5.5 ${x2},5.5 ${xc},9.5`}
              fill="url(#goldSovereign)"
            />
          );
        })}
        {/* Bottom edge pointing up */}
        {Array.from({ length: 15 }).map((_, i) => {
          const step = 88 / 15;
          const x1 = 6 + i * step;
          const x2 = 6 + (i + 1) * step;
          const xc = x1 + step / 2;
          return (
            <polygon
              key={`b-${i}`}
              points={`${x1},94.5 ${x2},94.5 ${xc},90.5`}
              fill="url(#goldSovereign)"
            />
          );
        })}
        {/* Left edge pointing right */}
        {Array.from({ length: 15 }).map((_, i) => {
          const step = 88 / 15;
          const y1 = 6 + i * step;
          const y2 = 6 + (i + 1) * step;
          const yc = y1 + step / 2;
          return (
            <polygon
              key={`l-${i}`}
              points={`5.5,${y1} 5.5,${y2} 9.5,${yc}`}
              fill="url(#goldSovereign)"
            />
          );
        })}
        {/* Right edge pointing left */}
        {Array.from({ length: 15 }).map((_, i) => {
          const step = 88 / 15;
          const y1 = 6 + i * step;
          const y2 = 6 + (i + 1) * step;
          const yc = y1 + step / 2;
          return (
            <polygon
              key={`r-${i}`}
              points={`94.5,${y1} 94.5,${y2} 90.5,${yc}`}
              fill="url(#goldSovereign)"
            />
          );
        })}

        {/* --- ROYAL GOLD SHAHBAZ (THE CYRUS STANDARD EAGLE-FALCON) --- */}
        <g filter="url(#goldGlow)">
          {/* 1. Golden Disc above Head */}
          <circle cx="50" cy="22.5" r="4.5" fill="url(#goldSovereign)" />
          <circle cx="50" cy="22.5" r="3.2" fill="url(#goldInner)" />

          {/* 2. Shahbaz main body */}
          {/* Head & elegant beak facing right */}
          <path
            d="M 48 29 C 48 29, 45 30, 45 33 C 45 35, 47 36, 49 35.5 C 50.5 35, 52 35.5, 53.5 35 C 55 34.5, 56.5 33, 56.5 31 C 56.5 29, 54.5 29, 54.5 29 C 54.5 29, 56.5 27, 54.5 27 C 52.5 27, 51.5 28.5, 48 29 Z"
            fill="url(#goldSovereign)"
          />
          {/* Eye detail */}
          <circle cx="51.5" cy="31" r="0.8" fill="#540202" />
          <circle cx="51.5" cy="31" r="0.3" fill="#FFFED0" />

          {/* Detailed crown or small crest feathers on neck */}
          <path
            d="M 47.5 28 C 47.5 28, 46 26.5, 48 27 C 50 27.5, 48 29, 48 29 Z"
            fill="url(#goldInner)"
          />

          {/* 3. Horizontal Wing spreads left & right (Symmetric feather layers) */}
          {/* Left Wing upper curve */}
          <path
            d="M 48 37 C 35 34, 25 31, 14 36 C 14 36, 17 48, 26 48 L 47 43 Z"
            fill="url(#goldSovereign)"
          />
          {/* Left Wing feather details */}
          <path
            d="M 14.5 38.5 Q 24 38, 45.5 44"
            stroke="#783400"
            strokeWidth="0.5"
            fill="none"
            opacity="0.6"
          />
          <path
            d="M 16.5 41 Q 25 41, 44 45.5"
            stroke="#783400"
            strokeWidth="0.5"
            fill="none"
            opacity="0.6"
          />
          <path
            d="M 18.5 43.5 Q 26 43, 42.5 47"
            stroke="#783400"
            strokeWidth="0.5"
            fill="none"
            opacity="0.6"
          />

          {/* Beautiful gold stylized inner layers of feathers */}
          {Array.from({ length: 6 }).map((_, i) => {
            const rot = i * 2.5;
            return (
              <path
                key={`lw-${i}`}
                d="M 47 42 C 43 45, 25 43, 17 45.5 C 19 48, 30 49, 46 44.5 C 46 44.5, 46 43, 47 42 Z"
                fill="url(#goldInner)"
                transform={`rotate(${rot} 47 42)`}
                opacity="0.9"
              />
            );
          })}

          {/* Right Wing upper curve */}
          <path
            d="M 52 37 C 65 34, 75 31, 86 36 C 86 36, 83 48, 74 48 L 53 43 Z"
            fill="url(#goldSovereign)"
          />
          {/* Right Wing feather details */}
          <path
            d="M 85.5 38.5 Q 76 38, 54.5 44"
            stroke="#783400"
            strokeWidth="0.5"
            fill="none"
            opacity="0.6"
          />
          <path
            d="M 83.5 41 Q 75 41, 56 45.5"
            stroke="#783400"
            strokeWidth="0.5"
            fill="none"
            opacity="0.6"
          />
          <path
            d="M 81.5 43.5 Q 74 43, 57.5 47"
            stroke="#783400"
            strokeWidth="0.5"
            fill="none"
            opacity="0.6"
          />

          {/* Right wing feather layers */}
          {Array.from({ length: 6 }).map((_, i) => {
            const rot = -i * 2.5;
            return (
              <path
                key={`rw-${i}`}
                d="M 53 42 C 57 45, 75 43, 83 45.5 C 81 48, 70 49, 54 44.5 C 54 44.5, 54 43, 53 42 Z"
                fill="url(#goldInner)"
                transform={`rotate(${rot} 53 42)`}
                opacity="0.9"
              />
            );
          })}

          {/* 4. Elegant ribbed tall body torso */}
          <path
            d="M 46 36 C 46 36, 44 47, 43 62 C 43 62, 50 67, 57 62 C 56 47, 54 36, 54 36 Z"
            fill="url(#goldSovereign)"
            stroke="#5D4037"
            strokeWidth="0.3"
          />

          {/* Torso golden horizontal ribbing details */}
          {Array.from({ length: 9 }).map((_, i) => {
            const y = 39 + i * 2.6;
            const w = 8 - Math.abs(5 - i) * 0.45;
            return (
              <path
                key={`rib-${i}`}
                d={`M ${50 - w / 2} ${y} Q 50 ${y + 0.8} ${50 + w / 2} ${y}`}
                stroke="#5D4037"
                strokeWidth="0.65"
                fill="none"
              />
            );
          })}

          {/* 5. Imperial flared Tail Standard */}
          <path
            d="M 46.5 63 C 46.5 63, 44 76, 41 78.5 C 44 79, 56 79, 59 78.5 C 56 76, 53.5 63, 53.5 63 Z"
            fill="url(#goldSovereign)"
          />
          {/* Tail vertical gold details */}
          <g opacity="0.8">
            <line
              x1="50"
              y1="63"
              x2="50"
              y2="78.5"
              stroke="#783400"
              strokeWidth="0.6"
            />
            <line
              x1="48"
              y1="63.5"
              x2="45.5"
              y2="77.5"
              stroke="#783400"
              strokeWidth="0.5"
            />
            <line
              x1="52"
              y1="63.5"
              x2="54.5"
              y2="77.5"
              stroke="#783400"
              strokeWidth="0.5"
            />
            <line
              x1="46"
              y1="64"
              x2="42.5"
              y2="76"
              stroke="#783400"
              strokeWidth="0.4"
            />
            <line
              x1="54"
              y1="64"
              x2="57.5"
              y2="76"
              stroke="#783400"
              strokeWidth="0.4"
            />
          </g>
          {/* Intersecting design curve at base of tail */}
          <path
            d="M 41 78.5 Q 50 75.5 59 78.5"
            stroke="url(#goldInner)"
            strokeWidth="0.8"
            fill="none"
          />

          {/* 6. Powerful legs/talons holding golden circular elements */}
          {/* Left leg */}
          <path
            d="M 45 56 Q 36 67, 24.5 73.5"
            stroke="url(#goldSovereign)"
            strokeWidth="2.4"
            strokeLinecap="round"
            fill="none"
          />
          <path
            d="M 45 56 Q 36 67, 24.5 73.5"
            stroke="url(#goldInner)"
            strokeWidth="1.2"
            strokeLinecap="round"
            fill="none"
          />
          <circle
            cx="23"
            cy="74.5"
            r="4"
            fill="url(#goldSovereign)"
            stroke="#5D4037"
            strokeWidth="0.4"
          />
          <circle cx="23" cy="74.5" r="2.5" fill="url(#goldInner)" />

          {/* Right leg */}
          <path
            d="M 55 56 Q 64 67, 75.5 73.5"
            stroke="url(#goldSovereign)"
            strokeWidth="2.4"
            strokeLinecap="round"
            fill="none"
          />
          <path
            d="M 55 56 Q 64 67, 75.5 73.5"
            stroke="url(#goldInner)"
            strokeWidth="1.2"
            strokeLinecap="round"
            fill="none"
          />
          <circle
            cx="77"
            cy="74.5"
            r="4"
            fill="url(#goldSovereign)"
            stroke="#5D4037"
            strokeWidth="0.4"
          />
          <circle cx="77" cy="74.5" r="2.5" fill="url(#goldInner)" />
        </g>
      </svg>
    </div>
  );
};

export default function App() {
  // State initialization with localStorage persistence
  const [lang, setLang] = useState<Language>(() => {
    const cached = localStorage.getItem("daltoon_lang");
    return (cached === "fa" || cached === "en" || cached === "ar" || cached === "ru" || cached === "tr" || cached === "es") ? (cached as Language) : "fa"; // Default to Persian as requested
  });

  const appTrans = {
    darkMode: {
      fa: "تم تاریک",
      en: "Dark Mode",
      ar: "الوضع الداكن",
      ru: "Тёмная тема",
      tr: "Karanlık Mod",
      es: "Modo oscuro"
    },
    lightMode: {
      fa: "تم روشن",
      en: "Light Mode",
      ar: "الوضع الفاتح",
      ru: "Светлая тема",
      tr: "Aydınlık Mod",
      es: "Modo claro"
    },
    selectLanguage: {
      fa: "🌐 انتخاب زبان ربات و پنل",
      en: "🌐 Select Language",
      ar: "🌐 اختر اللغة",
      ru: "🌐 Выберите язык",
      tr: "🌐 Dil Seçin",
      es: "🌐 Seleccione idioma"
    },
    refreshData: {
      fa: "بروزرسانی داده‌ها",
      en: "Refresh Data",
      ar: "تحديث البيانات",
      ru: "Обновить данные",
      tr: "Verileri Yenile",
      es: "Actualizar datos"
    },
    updating: {
      fa: "در حال بروزرسانی...",
      en: "Updating...",
      ar: "جاري التحديث...",
      ru: "Обновление...",
      tr: "Güncelleniyor...",
      es: "Actualizando..."
    },
    updateSuccess: {
      fa: "✅ بروزرسانی موفق. در حال راه‌اندازی مجدد...",
      en: "✅ Update success. Restarting...",
      ar: "✅ نجح التحديث. جاري إعادة التشغيل...",
      ru: "✅ Обновление успешно. Перезапуск...",
      tr: "✅ Güncelleme başarılı. Yeniden başlatılıyor...",
      es: "✅ Actualización exitosa. Reiniciando..."
    },
    updateFailed: {
      fa: "❌ خطا در بروزرسانی: ",
      en: "❌ Update failed: ",
      ar: "❌ فشل التحديث: ",
      ru: "❌ Ошибка обновления: ",
      tr: "❌ Güncelleme hatası: ",
      es: "❌ Error de actualización: "
    },
    communicationError: {
      fa: "❌ خطا در برقراری ارتباط برای بروزرسانی",
      en: "❌ Communication error during update.",
      ar: "❌ خطأ في الاتصال أثناء التحديث.",
      ru: "❌ Ошибка связи во время обновления.",
      tr: "❌ Güncelleme sırasında iletişim hatası.",
      es: "❌ Error de comunicación durante la actualización."
    },
    refreshSuccess: {
      fa: "✅ اطلاعات داشبورد با موفقیت بروزرسانی شد.",
      en: "✅ Dashboard data refreshed successfully.",
      ar: "✅ تم تحديث بيانات لوحة التحكم بنجاح.",
      ru: "✅ Данные панели управления успешно обновлены.",
      tr: "✅ Panel verileri başarıyla yenilendi.",
      es: "✅ Datos del panel actualizados con éxito."
    },
    refreshError: {
      fa: "❌ خطا در دریافت اطلاعات از سرور.",
      en: "❌ Failed refreshing data from server.",
      ar: "❌ فشل تحديث البيانات من الخادم.",
      ru: "❌ Не удалось обновить данные с сервера.",
      tr: "❌ Sunucudan veriler yenilenemedi.",
      es: "❌ Error al actualizar los datos desde el servidor."
    },
    userExists: {
      fa: "این شناسه کاربری تلگرام قبلاً در دیتابیس ثبت شده است.",
      en: "This Telegram User ID already exists in the bot database.",
      ar: "معرف مستخدم تليجرام هذا موجود بالفعل في قاعدة البيانات.",
      ru: "Этот Telegram ID уже зарегистрирован в базе данных.",
      tr: "Bu Telegram Kullanıcı ID'si zaten veritabanında mevcut.",
      es: "Este ID de usuario de Telegram ya existe en la base de datos."
    },
    approvedAndCredited: {
      fa: " - تایید و شارژ شد",
      en: " - Approved and credited",
      ar: " - تم اعتماده وشحنه",
      ru: " - Подтверждено и зачислено",
      tr: " - Onaylandı ve yüklendi",
      es: " - Aprobado y acreditado"
    },
    receiptApproved: {
      fa: "✅ فیش با موفقیت تایید و {amount} تومان شارژ شد.",
      en: "✅ Receipt approved & {amount} Tomans credited.",
      ar: "✅ تم قبول الإيصال وشحن {amount} تومان بنجاح.",
      ru: "✅ Чек подтвержден, зачислено {amount} Томанов.",
      tr: "✅ Dekont onaylandı ve {amount} Toman yüklendi.",
      es: "✅ Recibo aprobado y se acreditaron {amount} Tomanes."
    },
    invalidSlipRejected: {
      fa: " - فیش نامعتبر رد شد",
      en: " - Invalid slip rejected",
      ar: " - تم رفض الإيصال غير الصالح",
      ru: " - Недействительный чек отклонен",
      tr: " - Geçersiz dekont reddedildi",
      es: " - Recibo inválido rechazado"
    },
    receiptRejected: {
      fa: "❌ فیش پرداخت رد شد.",
      en: "❌ Payment receipt was rejected.",
      ar: "❌ تم رفض إيصال الدفع.",
      ru: "❌ Чек оплаты отклонен.",
      tr: "❌ Ödeme dekontu reddedildi.",
      es: "❌ El recibo de pago fue rechazado."
    },
    settingsSaved: {
      fa: "✅ تنظیمات با موفقیت ذخیره شد.",
      en: "✅ Settings saved successfully.",
      ar: "✅ تم حفظ الإعدادات بنجاح.",
      ru: "✅ Настройки успешно сохранены.",
      tr: "✅ Ayarlar başarıyla kaydedildi.",
      es: "✅ Configuración guardada con éxito."
    },
    settingsError: {
      fa: "❌ خطا در ذخیره تنظیمات.",
      en: "❌ Failed to save settings.",
      ar: "❌ فشل حفظ الإعدادات.",
      ru: "❌ Не удалось сохранить настройки.",
      tr: "❌ Ayarlar kaydedilemedi.",
      es: "❌ Error al guardar la configuración."
    },
    vpnConfigsManagement: {
      fa: "مدیریت کانفیگ‌ها",
      en: "VPN Configs Management",
      ar: "إدارة التكوينات VPN",
      ru: "Управление ключами VPN",
      tr: "VPN Yapılandırma Yönetimi",
      es: "Gestión de Configuración VPN"
    },
    serverManagement: {
      fa: "مدیریت سرورها",
      en: "Server Management",
      ar: "إدارة الخوادم",
      ru: "Управление серверами",
      tr: "Sunucu Yönetimi",
      es: "Gestión de Servidores"
    },
    giftCodes: {
      fa: "کدهای هدیه",
      en: "Gift Codes",
      ar: "أكواد الهدايا",
      ru: "Подарочные коды",
      tr: "Hediye Kodları",
      es: "Códigos de Regalo"
    },
    supportTickets: {
      fa: "سیستم تیکت",
      en: "Support Tickets",
      ar: "تذاكر الدعم",
      ru: "Тикеты поддержки",
      tr: "Destek Talepleri",
      es: "Tickets de Soporte"
    },
    logout: {
      fa: "خروج",
      en: "Logout",
      ar: "تسجيل الخروج",
      ru: "Выйти",
      tr: "Çıkış Yap",
      es: "Cerrar sesión"
    },
    developerBy: {
      fa: "توسعه دهنده توسط ",
      en: "Developer by ",
      ar: "المطور بواسطة ",
      ru: "Разработчик: ",
      tr: "Geliştirici: ",
      es: "Desarrollador por "
    },
    updatePanel: {
      fa: "پنل بروزرسانی",
      en: "Update Panel",
      ar: "لوحة التحديث",
      ru: "Панель обновления",
      tr: "Güncelleme Paneli",
      es: "Panel de actualización"
    },
    devChannel: {
      fa: "کانال آزمایشی (Dev)",
      en: "Dev channel",
      ar: "قناة التطوير (Dev)",
      ru: "Канал для разработчиков (Dev)",
      tr: "Geliştirici kanalı (Dev)",
      es: "Canal de desarrollo (Dev)"
    },
    devChannelDesc: {
      fa: "دریافت سریع‌ترین تغییرات (ناپایدار)",
      en: "Get fastest changes (unstable)",
      ar: "احصل على أسرع التغييرات (غير مستقرة)",
      ru: "Получайте самые быстрые обновления (нестабильно)",
      tr: "En hızlı değişiklikleri alın (kararsız)",
      es: "Obtenga los cambios más rápidos (inestables)"
    },
    currentVersion: {
      fa: "نسخه فعلی پنل",
      en: "Current panel version",
      ar: "نسخة اللوحة الحالية",
      ru: "Текущая версия панели",
      tr: "Mevcut panel sürümü",
      es: "Versión actual del panel"
    },
    newVersionAvailable: {
      fa: "نسخه جدید در دسترس است",
      en: "Update available",
      ar: "التحديث متاح",
      ru: "Доступно обновление",
      tr: "Güncelleme mevcut",
      es: "Actualización disponible"
    },
    panelIsUpToDate: {
      fa: "پنل بروز است",
      en: "Panel is up to date",
      ar: "اللوحة محدثة",
      ru: "Панель обновлена",
      tr: "Panel güncel",
      es: "El panel está actualizado"
    },
    forceUpdate: {
      fa: "مشکلی در شناسایی نسخه وجود دارد؟ بروزرسانی اجباری",
      en: "Trouble checking? Force Update",
      ar: "هل تواجه مشكلة في التحقق؟ تحديث إجباري",
      ru: "Проблемы с проверкой? Принудительное обновление",
      tr: "Kontrol etmede sorun mu var? Zorunlu Güncelleme",
      es: "¿Problemas al verificar? Actualización forzada"
    },
    confirmUpdate: {
      fa: "تایید بروزرسانی",
      en: "Confirm Update",
      ar: "تأكيد التحديث",
      ru: "Подтвердить обновление",
      tr: "Güncellemeyi Onayla",
      es: "Confirmar actualización"
    },
    confirmUpdateDesc: {
      fa: "آیا از بروزرسانی پنل به آخرین نسخه اطمینان دارید؟ این فرآیند ممکن است چند دقیقه طول بکشد.",
      en: "Are you sure you want to update the panel to the latest version? This may take a few minutes.",
      ar: "هل أنت متأكد من رغبتك في تحديث اللوحة إلى أحدث إصدار؟ قد يستغرق ذلك بضع دقائق.",
      ru: "Вы уверены, что хотите обновить панель до последней версии? Это может занять несколько минут.",
      tr: "Paneli en son sürüme güncellemek istediğinizden emin misiniz? Bu işlem birkaç dakika sürebilir.",
      es: "¿Está seguro de que desea actualizar el panel a la última versión? Esto puede tardar unos minutos."
    },
    startUpdate: {
      fa: "شروع بروزرسانی",
      en: "Start Update",
      ar: "بدء التحديث",
      ru: "Начать обновление",
      tr: "Güncellemeyi Başlat",
      es: "Iniciar actualización"
    },
    cancel: {
      fa: "انصراف",
      en: "Cancel",
      ar: "إلغاء",
      ru: "Отмена",
      tr: "İptal",
      es: "Cancelar"
    }
  };

  const curAppT = (key: keyof typeof appTrans) => {
    return appTrans[key][lang] || appTrans[key]["en"];
  };

  const isRtl = lang === "fa" || lang === "ar";

  const [showLangDropdown, setShowLangDropdown] = useState(false);

  const [settings, setSettings] = useState<PanelSettings>(() => {
    const cached = localStorage.getItem("daltoon_settings");
    return cached ? JSON.parse(cached) : initialSettings;
  });

  const handleLanguageSelect = (newLang: Language) => {
    setLang(newLang);
    localStorage.setItem("daltoon_lang", newLang);
    setShowLangDropdown(false);

    const updatedSettings = { ...settings, LANG: newLang };
    setSettings(updatedSettings);
    localStorage.setItem("daltoon_settings", JSON.stringify(updatedSettings));

    fetch("/api/settings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updatedSettings),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setToastMessage(
            newLang === "fa"
              ? "🌐 زبان ربات تلگرام و داشبورد با موفقیت هماهنگ شد."
              : "🌐 Dashboard & Telegram bot language synchronized successfully.",
          );
          setTimeout(() => setToastMessage(null), 3000);
        }
      })
      .catch((err) => {
        console.warn("Failed to synchronize language settings:", err);
      });
  };

  const [inbounds, setInbounds] = useState<InboundInfo[]>(() => {
    const cached = localStorage.getItem("daltoon_inbounds");
    return cached ? JSON.parse(cached) : initialInbounds;
  });

  const [users, setUsers] = useState<User[]>(() => {
    const cached = localStorage.getItem("daltoon_users");
    return cached ? JSON.parse(cached) : initialUsers;
  });

  const [transactions, setTransactions] = useState<Transaction[]>(() => {
    const cached = localStorage.getItem("daltoon_transactions");
    return cached ? JSON.parse(cached) : initialTransactions;
  });

  const [keys, setKeys] = useState<SubscriptionKey[]>(() => {
    const cached = localStorage.getItem("daltoon_keys");
    return cached ? JSON.parse(cached) : initialSubscriptionKeys;
  });

  const [vpnPlans, setVpnPlans] = useState<VpnPlan[]>(() => {
    const cached = localStorage.getItem("daltoon_vpn_plans");
    return cached ? JSON.parse(cached) : initialPlans;
  });
  const [planCategories, setPlanCategories] = useState<PlanCategory[]>([]);

  const [colleaguePackages, setColleaguePackages] = useState<any[]>(() => {
    const cached = localStorage.getItem("daltoon_colleague_packages");
    return cached ? JSON.parse(cached) : [];
  });

  const [colleagueAccounts, setColleagueAccounts] = useState<any[]>(() => {
    const cached = localStorage.getItem("daltoon_colleague_accounts");
    return cached ? JSON.parse(cached) : [];
  });

  const [colleagueCategories, setColleagueCategories] = useState<any[]>(() => {
    const cached = localStorage.getItem("daltoon_colleague_categories");
    return cached ? JSON.parse(cached) : [];
  });

  const [logs, setLogs] = useState<any[]>(() => {
    const cached = localStorage.getItem("daltoon_logs");
    return cached ? JSON.parse(cached) : [];
  });

  const isDemoEnv = window.location.hostname.includes("ais-dev") || window.location.hostname.includes("ais-pre") || window.location.hostname.includes("localhost") || window.location.hostname.includes("run.app");

  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    if (isDemoEnv) return true;
    const isAuth = localStorage.getItem("daltoon_dashboard_auth") === "true";
    const lastInteraction = parseInt(
      localStorage.getItem("daltoon_last_interaction") || "0",
      10,
    );
    // Auto-logout if more than 24 hours passed since last interaction
    if (isAuth && Date.now() - lastInteraction > 86400000) {
      localStorage.removeItem("daltoon_dashboard_auth");
      return false;
    }
    return isAuth;
  });

  const [customButtons, setCustomButtons] = useState<CustomButton[]>(() => {
    const cached = localStorage.getItem("daltoon_custom_buttons");
    if (cached) return JSON.parse(cached);
    return [];
  });

  const [giftCodes, setGiftCodes] = useState<GiftCode[]>(() => {
    const cached = localStorage.getItem("daltoon_gift_codes");
    return cached ? JSON.parse(cached) : [];
  });

  const [promoCodes, setPromoCodes] = useState<PromoCode[]>(() => {
    const cached = localStorage.getItem("daltoon_promo_codes");
    return cached ? JSON.parse(cached) : [];
  });

  const [tickets, setTickets] = useState<Ticket[]>(() => {
    const cached = localStorage.getItem("daltoon_tickets");
    return cached ? JSON.parse(cached) : [];
  });

  const [activeTab, setActiveTab] = useState<
    | "dashboard"
    | "users"
    | "transactions"
    | "simulator"
    | "servers"
    | "colleague_accounts"
    | "colleagues"
    | "buttons"
    | "giftcodes"
    | "promocodes"
    | "tickets"
    | "logs"
    | "settings"
    | "guide"
    | "xui_connector"
  >(() => {
    const cached = localStorage.getItem("daltoon_active_tab");
    return (cached as any) || "dashboard";
  });
  const [simulatedUserId, setSimulatedUserId] = useState<number>(() => {
    const cached = localStorage.getItem("daltoon_simulated_user_id");
    return cached ? Number(cached) : 6536288293;
  });
  const [deleteConfirm, setDeleteConfirm] = useState<any>(null);
  const [apiOnline, setApiOnline] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const CLIENT_VERSION = "3.1.3";
  const [appVersion, setAppVersion] = useState<string>(CLIENT_VERSION);
  const [updateAvailable, setUpdateAvailable] = useState(false);
  const [latestVersion, setLatestVersion] = useState("");
  const [isUpdating, setIsUpdating] = useState(false);
  const [showUpdateConfirm, setShowUpdateConfirm] = useState(false);
  const [showSetupModal, setShowSetupModal] = useState(false);
  const [isNewInstall, setIsNewInstall] = useState<boolean | null>(null);

  const [updateChannel, setUpdateChannel] = useState<"stable" | "dev">(() => {
    const cached = localStorage.getItem("daltoon_update_channel");
    return (cached as any) || "stable";
  });
  const [showUpdatePanel, setShowUpdatePanel] = useState(false);

  useEffect(() => {
    localStorage.setItem("daltoon_last_running_version", CLIENT_VERSION);
  }, []);

  useEffect(() => {
    localStorage.setItem("daltoon_update_channel", updateChannel);
    // Refresh update status when channel changes
    fetch(`/api/system/check-update?channel=${updateChannel}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.latestVersion) setLatestVersion(data.latestVersion);
        if (data.currentVersion) {
          setAppVersion(data.currentVersion);
          localStorage.setItem("daltoon_last_running_version", data.currentVersion);
        }
        setUpdateAvailable(data.updateAvailable);
      })
      .catch((err) => console.warn("Check update failed", err));
  }, [updateChannel]);

  const [isLightMode, setIsLightMode] = useState<boolean>(() => {
    return localStorage.getItem("theme") === "light";
  });

  useEffect(() => {
    if (isLightMode) {
      document.body.classList.add("light");
      localStorage.setItem("theme", "light");
    } else {
      document.body.classList.remove("light");
      localStorage.setItem("theme", "dark");
    }
  }, [isLightMode]);

  useEffect(() => {
    if (isAuthenticated && settings) {
      const isMissingConfig =
        !settings.botToken ||
        settings.botToken.trim() === "" ||
        settings.botToken === "DUMMY_TOKEN" ||
        !settings.ownerId ||
        Number(settings.ownerId) === 0;

      // Only force setup if critical config (Token/Owner) is missing OR if it's explicitly a new install
      // If we have a token but missing nickname, we don't block the whole dashboard anymore.
      if (!isDemoEnv && (isMissingConfig || isNewInstall === true)) {
        setShowSetupModal(true);
      }
    }
  }, [isAuthenticated, settings, isNewInstall]);


  const handleRestartAll = () => {
    if (confirm(lang === "fa" ? "آیا از راه‌اندازی مجدد کل سیستم اطمینان دارید؟ (ربات و داشبورد)" : "Are you sure you want to restart the entire system (bot & dashboard)?")) {
      setToastMessage(curAppT("updateSuccess"));
      fetch("/api/system/bot/action", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "restart-all" })
      }).then(() => {
        setTimeout(() => window.location.reload(), 4000);
      });
    }
  };

  const handleUpdate = () => {
    setShowUpdateConfirm(true);
  };

  const executeUpdate = () => {
    setShowUpdateConfirm(false);
    setIsUpdating(true);
    setToastMessage(curAppT("updating"));
    fetch("/api/system/update", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ channel: updateChannel }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setToastMessage(curAppT("updateSuccess"));
          setTimeout(() => window.location.reload(), 4000);
        } else {
          setToastMessage(curAppT("updateFailed") + (data.error || ""));
          setIsUpdating(false);
        }
      })
      .catch((err) => {
        setToastMessage(curAppT("communicationError"));
        setIsUpdating(false);
      });
  };
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [lastInteraction, setLastInteraction] = useState(() => {
    return parseInt(
      localStorage.getItem("daltoon_last_interaction") || String(Date.now()),
      10,
    );
  });

  // Inactivity timeout (24 hours)
  useEffect(() => {
    const checkTimeout = () => {
      if (isAuthenticated && Date.now() - lastInteraction > 86400000) {
        console.log("[Daltoon Session] Expired after 24h inactivity");
        localStorage.removeItem("daltoon_dashboard_auth");
        setIsAuthenticated(false);
      }
    };
    const interval = setInterval(checkTimeout, 60000); // Check every minute
    return () => clearInterval(interval);
  }, [isAuthenticated, lastInteraction]);

  useEffect(() => {
    let timeout: any;
    const handleActivity = () => {
      if (timeout) return;
      timeout = setTimeout(() => {
        const now = Date.now();
        setLastInteraction(now);
        localStorage.setItem("daltoon_last_interaction", String(now));
        timeout = null;
      }, 5000); // Only update once every 5 seconds
    };
    window.addEventListener("mousemove", handleActivity);
    window.addEventListener("keydown", handleActivity);
    window.addEventListener("click", handleActivity);
    window.addEventListener("scroll", handleActivity);

    // Initial save
    localStorage.setItem("daltoon_last_interaction", String(Date.now()));
    return () => {
      window.removeEventListener("mousemove", handleActivity);
      window.removeEventListener("keydown", handleActivity);
      window.removeEventListener("click", handleActivity);
      window.removeEventListener("scroll", handleActivity);
      if (timeout) clearTimeout(timeout);
    };
  }, []);

  // Close sidebar on tab change
  useEffect(() => {
    setIsSidebarOpen(false);
  }, [activeTab]);

  const t = { ...translations.en, ...translations[lang] };

  const _unusedAppTrans = {
    updating: {
      fa: "در حال بروزرسانی...",
      en: "Updating...",
      ar: "جاري التحديث...",
      ru: "Обновление...",
      tr: "Güncelleniyor...",
      es: "Actualizando..."
    },
    updateSuccess: {
      fa: "✅ بروزرسانی موفق. در حال راه‌اندازی مجدد...",
      en: "✅ Update success. Restarting...",
      ar: "✅ نجح التحديث. جاري إعادة التشغيل...",
      ru: "✅ Обновление успешно. Перезапуск...",
      tr: "✅ Güncelleme başarılı. Yeniden başlatılıyor...",
      es: "✅ Actualización exitosa. Reiniciando..."
    },
    updateFailed: {
      fa: "❌ خطا در بروزرسانی: ",
      en: "❌ Update failed: ",
      ar: "❌ فشل التحديث: ",
      ru: "❌ Ошибка обновления: ",
      tr: "❌ Güncelleme hatası: ",
      es: "❌ Error de actualización: "
    },
    communicationError: {
      fa: "❌ خطا در برقراری ارتباط برای بروزرسانی",
      en: "❌ Communication error during update.",
      ar: "❌ خطأ في الاتصال أثناء التحديث.",
      ru: "❌ Ошибка связи во время обновления.",
      tr: "❌ Güncelleme sırasında iletişim hatası.",
      es: "❌ Error de comunicación durante la actualización."
    },
    refreshSuccess: {
      fa: "✅ اطلاعات داشبورد با موفقیت بروزرسانی شد.",
      en: "✅ Dashboard data refreshed successfully.",
      ar: "✅ تم تحديث بيانات لوحة التحكم بنجاح.",
      ru: "✅ Данные панели управления успешно обновлены.",
      tr: "✅ Panel verileri başarıyla yenilendi.",
      es: "✅ Datos del panel actualizados con éxito."
    },
    refreshError: {
      fa: "❌ خطا در دریافت اطلاعات از سرور.",
      en: "❌ Failed refreshing data from server.",
      ar: "❌ فشل تحديث البيانات من الخادم.",
      ru: "❌ Не удалось обновить данные с сервера.",
      tr: "❌ Sunucudan veriler yenilenemedi.",
      es: "❌ Error al actualizar los datos desde el servidor."
    },
    userExists: {
      fa: "این شناسه کاربری تلگرام قبلاً در دیتابیس ثبت شده است.",
      en: "This Telegram User ID already exists in the bot database.",
      ar: "معرف مستخدم تليجرام هذا موجود بالفعل في قاعدة البيانات.",
      ru: "Этот Telegram ID уже зарегистрирован в базе данных.",
      tr: "Bu Telegram Kullanıcı ID'si zaten veritabanında mevcut.",
      es: "Este ID de usuario de Telegram ya existe en la base de datos."
    },
    approvedAndCredited: {
      fa: " - تایید و شارژ شد",
      en: " - Approved and credited",
      ar: " - تم اعتماده وشحنه",
      ru: " - Подтверждено и зачислено",
      tr: " - Onaylandı ve yüklendi",
      es: " - Aprobado y acreditado"
    },
    receiptApproved: {
      fa: "✅ فیش با موفقیت تایید و {amount} تومان شارژ شد.",
      en: "✅ Receipt approved & {amount} Tomans credited.",
      ar: "✅ تم قبول الإيصال وشحن {amount} تومان بنجاح.",
      ru: "✅ Чек подтвержден, зачислено {amount} Томанов.",
      tr: "✅ Dekont onaylandı ve {amount} Toman yüklendi.",
      es: "✅ Recibo aprobado y se acreditaron {amount} Tomanes."
    },
    invalidSlipRejected: {
      fa: " - فیش نامعتبر رد شد",
      en: " - Invalid slip rejected",
      ar: " - تم رفض الإيصال غير الصالح",
      ru: " - Недействительный чек отклонен",
      tr: " - Geçersiz dekont reddedildi",
      es: " - Recibo inválido rechazado"
    },
    receiptRejected: {
      fa: "❌ فیش پرداخت رد شد.",
      en: "❌ Payment receipt was rejected.",
      ar: "❌ تم رفض إيصال الدفع.",
      ru: "❌ Чек оплаты отклонен.",
      tr: "❌ Ödeme dekontu reddedildi.",
      es: "❌ El recibo de pago fue rechazado."
    },
    settingsSaved: {
      fa: "✅ تنظیمات با موفقیت ذخیره شد.",
      en: "✅ Settings saved successfully.",
      ar: "✅ تم حفظ الإعدادات بنجاح.",
      ru: "✅ Настройки успешно сохранены.",
      tr: "✅ Ayarlar başarıyla kaydedildi.",
      es: "✅ Configuración guardada con éxito."
    },
    settingsError: {
      fa: "❌ خطا در ذخیره تنظیمات.",
      en: "❌ Failed to save settings.",
      ar: "❌ فشل حفظ الإعدادات.",
      ru: "❌ Не удалось сохранить настройки.",
      tr: "❌ Ayarlar kaydedilemedi.",
      es: "❌ Error al guardar la configuración."
    },
    vpnConfigsManagement: {
      fa: "مدیریت کانفیگ‌ها",
      en: "VPN Configs Management",
      ar: "إdelà Ткоинат VPN",
      ru: "Управление ключами VPN",
      tr: "VPN Yapılandırma Yönetimi",
      es: "Gestión de Configuración VPN"
    },
    serverManagement: {
      fa: "مدیریت سرورها",
      en: "Server Management",
      ar: "إدارة الخوادم",
      ru: "Управление серверами",
      tr: "Sunucu Yönetimi",
      es: "Gestión de Servidores"
    },
    giftCodes: {
      fa: "کدهای هدیه",
      en: "Gift Codes",
      ar: "أكواد الهدايا",
      ru: "Подарочные коды",
      tr: "Hediye Kodları",
      es: "Códigos de Regalo"
    },
    supportTickets: {
      fa: "سیستم تیکت",
      en: "Support Tickets",
      ar: "تذاكر الدعم",
      ru: "Тикеты поддержки",
      tr: "Destek Talepleri",
      es: "Tickets de Soporte"
    },
    logout: {
      fa: "خروج",
      en: "Logout",
      ar: "تسجيل الخروج",
      ru: "Выйти",
      tr: "Çıkış Yap",
      es: "Cerrar sesión"
    },
    developerBy: {
      fa: "توسعه دهنده توسط ",
      en: "Developer by ",
      ar: "المطور بواسطة ",
      ru: "Разработчик: ",
      tr: "Geliştirici: ",
      es: "Desarrollador por "
    },
    updatePanel: {
      fa: "پنل بروزرسانی",
      en: "Update Panel",
      ar: "لوحة التحديث",
      ru: "Панель обновления",
      tr: "Güncelleme Paneli",
      es: "Panel de actualización"
    },
    devChannel: {
      fa: "کانال آزمایشی (Dev)",
      en: "Dev channel",
      ar: "قناة التطوير (Dev)",
      ru: "Канал для разработчиков (Dev)",
      tr: "Geliştirici kanalı (Dev)",
      es: "Canal de desarrollo (Dev)"
    },
    devChannelDesc: {
      fa: "دریافت سریع‌ترین تغییرات (ناپایدار)",
      en: "Get fastest changes (unstable)",
      ar: "احصل على أسرع التغييرات (غير مستقرة)",
      ru: "Получайте самые быстрые обновления (нестабильно)",
      tr: "En hızlı değişiklikleri alın (kararsız)",
      es: "Obtenga los cambios más rápidos (inestables)"
    },
    currentVersion: {
      fa: "نسخه فعلی پنل",
      en: "Current panel version",
      ar: "نسخة اللوحة الحالية",
      ru: "Текущая версия панели",
      tr: "Mevcut panel sürümü",
      es: "Versión actual del panel"
    },
    newVersionAvailable: {
      fa: "نسخه جدید در دسترس است",
      en: "Update available",
      ar: "التحديث متاح",
      ru: "Доступно обновление",
      tr: "Güncelleme mevcut",
      es: "Actualización disponible"
    },
    panelIsUpToDate: {
      fa: "پنل بروز است",
      en: "Panel is up to date",
      ar: "اللوحة محدثة",
      ru: "Панель обновлена",
      tr: "Panel güncel",
      es: "El panel está actualizado"
    },
    forceUpdate: {
      fa: "مشکلی در شناسایی نسخه وجود دارد؟ بروزرسانی اجباری",
      en: "Trouble checking? Force Update",
      ar: "هل تواجه مشكلة في التحقق؟ تحديث إجباري",
      ru: "Проблемы с проверкой? Принудительное обновление",
      tr: "Kontrol etmede sorun mu var? Zorunlu Güncelleme",
      es: "¿Problemas al verificar? Actualización forzada"
    },
    confirmUpdate: {
      fa: "تایید بروزرسانی",
      en: "Confirm Update",
      ar: "تأكيد التحديث",
      ru: "Подтвердить обновление",
      tr: "Güncellemeyi Onayla",
      es: "Confirmar actualización"
    },
    confirmUpdateDesc: {
      fa: "آیا از بروزرسانی پنل به آخرین نسخه اطمینان دارید؟ این فرآیند ممکن است چند دقیقه طول بکشد.",
      en: "Are you sure you want to update the panel to the latest version? This may take a few minutes.",
      ar: "هل أنت متأكد من رغبتك في تحديث اللوحة إلى أحدث إصدار؟ قد يستغرق ذلك بضع دقائق.",
      ru: "Вы уверены, что хотите обновить панель до последней версии? Это может занять несколько минут.",
      tr: "Paneli en son sürüme güncellemek istediğinizden emin misiniz? Bu işlem birkaç dakika sürebilir.",
      es: "¿Está seguro de que desea actualizar el panel a la última versión? Esto puede tardar unos minutos."
    },
    startUpdate: {
      fa: "شروع بروزرسانی",
      en: "Start Update",
      ar: "بدء التحديث",
      ru: "Начать обновление",
      tr: "Güncellemeyi Başlat",
      es: "Iniciar actualización"
    },
    cancel: {
      fa: "انصراف",
      en: "Cancel",
      ar: "إلغاء",
      ru: "Отмена",
      tr: "İptal",
      es: "Cancelar"
    }
  };

  const _unusedCurAppT = (key: keyof typeof _unusedAppTrans) => {
    return _unusedAppTrans[key][lang] || _unusedAppTrans[key]["en"];
  };

  // Sync to localStorage
  useEffect(() => {
    localStorage.setItem("daltoon_active_tab", activeTab);
  }, [activeTab]);

  useEffect(() => {
    localStorage.setItem("daltoon_simulated_user_id", String(simulatedUserId));
  }, [simulatedUserId]);

  useEffect(() => {
    localStorage.setItem("daltoon_lang", lang);
  }, [lang]);

  useEffect(() => {
    localStorage.setItem("daltoon_settings", JSON.stringify(settings));
  }, [settings]);

  useEffect(() => {
    localStorage.setItem("daltoon_inbounds", JSON.stringify(inbounds));
  }, [inbounds]);

  useEffect(() => {
    localStorage.setItem("daltoon_users", JSON.stringify(users));
  }, [users]);

  useEffect(() => {
    localStorage.setItem("daltoon_transactions", JSON.stringify(transactions));
  }, [transactions]);

  useEffect(() => {
    localStorage.setItem("daltoon_keys", JSON.stringify(keys));
  }, [keys]);

  useEffect(() => {
    localStorage.setItem("daltoon_vpn_plans", JSON.stringify(vpnPlans));
  }, [vpnPlans]);

  useEffect(() => {
    localStorage.setItem(
      "daltoon_custom_buttons",
      JSON.stringify(customButtons),
    );
  }, [customButtons]);

  useEffect(() => {
    localStorage.setItem("daltoon_gift_codes", JSON.stringify(giftCodes));
  }, [giftCodes]);

  useEffect(() => {
    localStorage.setItem("daltoon_promo_codes", JSON.stringify(promoCodes));
  }, [promoCodes]);

  useEffect(() => {
    localStorage.setItem("daltoon_tickets", JSON.stringify(tickets));
  }, [tickets]);

  useEffect(() => {
    localStorage.setItem(
      "daltoon_colleague_packages",
      JSON.stringify(colleaguePackages),
    );
  }, [colleaguePackages]);

  useEffect(() => {
    localStorage.setItem(
      "daltoon_colleague_accounts",
      JSON.stringify(colleagueAccounts),
    );
  }, [colleagueAccounts]);

  useEffect(() => {
    localStorage.setItem(
      "daltoon_colleague_categories",
      JSON.stringify(colleagueCategories),
    );
  }, [colleagueCategories]);

  useEffect(() => {
    localStorage.setItem("daltoon_logs", JSON.stringify(logs));
  }, [logs]);

  const refreshData = async (isAuto: boolean = false) => {
    if (!isAuto) setIsRefreshing(true);
    try {
      const response = await fetch("/api/data");
      const json = await response.json();
      if (json.success) {
        // Deep comparison optimization to prevent unnecessary re-renders and localStorage writes
        const updateIfChanged = (setter: any, current: any, next: any) => {
          if (JSON.stringify(current) !== JSON.stringify(next)) {
            setter(next);
          }
        };

        if (json.users) updateIfChanged(setUsers, users, json.users);
        if (json.transactions)
          updateIfChanged(setTransactions, transactions, json.transactions);
        if (json.keys) updateIfChanged(setKeys, keys, json.keys);
        if (json.vpnPlans)
          updateIfChanged(setVpnPlans, vpnPlans, json.vpnPlans);
        if (json.plan_categories)
          updateIfChanged(
            setPlanCategories,
            planCategories,
            json.plan_categories,
          );
        if (json.inbounds)
          updateIfChanged(setInbounds, inbounds, json.inbounds);
        if (json.customButtons)
          updateIfChanged(setCustomButtons, customButtons, json.customButtons);
        if (json.giftCodes)
          updateIfChanged(setGiftCodes, giftCodes, json.giftCodes);
        if (json.promoCodes)
          updateIfChanged(setPromoCodes, promoCodes, json.promoCodes);
        if (json.tickets) updateIfChanged(setTickets, tickets, json.tickets);
        if (json.colleaguePackages)
          updateIfChanged(
            setColleaguePackages,
            colleaguePackages,
            json.colleaguePackages,
          );
        if (json.colleagueAccounts)
          updateIfChanged(
            setColleagueAccounts,
            colleagueAccounts,
            json.colleagueAccounts,
          );
        if (json.colleagueCategories)
          updateIfChanged(
            setColleagueCategories,
            colleagueCategories,
            json.colleagueCategories,
          );
        if (json.logs) updateIfChanged(setLogs, logs, json.logs);

        if (json.settings && "botToken" in json.settings) {
          updateIfChanged(setSettings, settings, json.settings);
        }

        if (json.isNewInstall !== undefined) {
          setIsNewInstall(json.isNewInstall);
        }

        if (!isAuto) {
          console.log(
            "[Full-Stack Sync] SQLite database refreshed successfully.",
          );
          setToastMessage(curAppT("refreshSuccess"));
          setTimeout(() => {
            setToastMessage(null);
          }, 3000);
        }
      }
    } catch (err) {
      console.warn(
        "[Full-Stack Sync] Failed connecting to Express Database.",
        err,
      );
      if (!isAuto) {
        setToastMessage(curAppT("refreshError"));
        setTimeout(() => {
          setToastMessage(null);
        }, 3000);
      }
    } finally {
      if (!isAuto) setIsRefreshing(false);
    }
  };

  // Fetch complete SQLite database state on mount and update automatically
  useEffect(() => {
    refreshData(false);
  }, []);

  useEffect(() => {
    if (settings?.autoRefreshInterval && settings.autoRefreshInterval > 0) {
      const interval = setInterval(() => {
        refreshData(true);
      }, settings.autoRefreshInterval * 1000);
      return () => clearInterval(interval);
    }
  }, [settings?.autoRefreshInterval]);

  // Database mutations & action handlers (with API sync triggers)
  const toggleInbound = (id: number) => {
    const nextStatus =
      inbounds.find((ib) => ib.id === id)?.status === "active"
        ? "inactive"
        : "active";
    setInbounds((prev) =>
      prev.map((ib) => {
        if (ib.id === id) {
          return { ...ib, status: nextStatus };
        }
        return ib;
      }),
    );
    fetch("/api/inbounds/toggle", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, status: nextStatus }),
    }).catch((err) => console.warn("Failed syncing toggled inbound:", err));
  };

  const adjustUserWallet = (userId: number, amount: number) => {
    setUsers((prev) =>
      prev.map((u) => {
        if (u.userId === userId) {
          const nextBal = Math.max(0, u.walletBalance + amount);
          return { ...u, walletBalance: nextBal };
        }
        return u;
      }),
    );
    fetch("/api/users/adjust", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId, amount }),
    }).catch((err) => console.warn("Failed syncing adjusted wallet:", err));
  };

  const handleAddPromoCode = (
    code: string,
    type: "percent" | "extend_days" | "fixed_amount",
    value: number,
    maxUsage: number,
    durationDays?: number,
  ) => {
    const nextCode = {
      id: Math.random().toString(36).substring(2, 9),
      code,
      type,
      value,
      maxUsage,
      totalUsage: 0,
      usedBy: [],
      createdAt: new Date().toISOString(),
      durationDays,
    };
    setPromoCodes((prev) => [nextCode, ...prev]);

    fetch("/api/promo-codes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(nextCode),
    })
      .then(() => refreshData())
      .catch((err) => console.warn(err));
  };

  const handleDeletePromoCode = (id: string) => {
    setPromoCodes((prev) => prev.filter((p) => p.id !== id));
    fetch("/api/promo-codes/delete", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    })
      .then(() => refreshData())
      .catch((err) => console.warn(err));
  };

  const handleReplyTicket = (ticketId: string, replyMessage: string) => {
    fetch("/api/tickets/reply", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ticketId, reply: replyMessage }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          refreshData();
        }
      })
      .catch((err) => console.warn(err));
  };

  const handleCloseTicket = (ticketId: string) => {
    fetch("/api/tickets/close", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ticketId }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          refreshData();
        }
      })
      .catch((err) => console.warn(err));
  };

  const handleDeleteTicket = (ticketId: string) => {
    fetch("/api/tickets/delete", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ticketId }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          refreshData();
        }
      })
      .catch((err) => console.warn(err));
  };

  const toggleUserBan = (userId: number) => {
    let nextStatus: "active" | "banned" = "active";
    setUsers((prev) =>
      prev.map((u) => {
        if (u.userId === userId) {
          nextStatus = u.status === "active" ? "banned" : "active";
          return { ...u, status: nextStatus };
        }
        return u;
      }),
    );
    setTimeout(() => {
      fetch("/api/users/ban", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, status: nextStatus }),
      }).catch((err) =>
        console.warn("Failed syncing banned user status:", err),
      );
    }, 100);
  };

  const addNewUser = (user: User) => {
    if (users.some((u) => u.userId === user.userId)) {
      console.warn(curAppT("userExists"));
      return;
    }
    setUsers((prev) => [user, ...prev]);
    fetch("/api/users", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(user),
    }).catch((err) => console.warn("Failed syncing new user:", err));
  };

  const deleteUser = (userId: number) => {
    setUsers((prev) => prev.filter((u) => u.userId !== userId));
    setKeys((prev) => prev.filter((k) => k.userId !== userId));
    fetch("/api/users/delete", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId }),
    }).catch((err) => console.warn("Failed syncing deleted user:", err));
  };

  const deleteSubscriptionKey = (keyId: string) => {
    const keyObj = keys.find((k) => k.id === keyId);
    setKeys((prev) => prev.filter((k) => k.id !== keyId));
    setUsers((prev) =>
      prev.map((u) => {
        if (keyObj && u.userId === keyObj.userId) {
          return {
            ...u,
            activePlansCount: Math.max(0, u.activePlansCount - 1),
          };
        }
        return u;
      }),
    );
    if (keyObj) {
      fetch("/api/subscription-keys/delete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: keyId, userId: keyObj.userId }),
      }).catch((err) =>
        console.warn("Failed syncing deleted sub config:", err),
      );
    }
  };

  const toggleSubscriptionKey = (keyId: string) => {
    const key = keys.find((k) => k.id === keyId);
    if (!key) return;
    const nextStatus = key.status === "active" ? "suspended" : "active";

    setKeys((prev) =>
      prev.map((k) => {
        if (k.id === keyId) return { ...k, status: nextStatus };
        return k;
      }),
    );

    // If user's active count changes
    setUsers((prev) =>
      prev.map((u) => {
        if (u.userId === key.userId) {
          let count = keys.filter(
            (sk) => sk.userId === u.userId && sk.status === "active",
          ).length;
          if (nextStatus === "active") count++;
          else count--;
          return { ...u, activePlansCount: Math.max(0, count) };
        }
        return u;
      }),
    );

    fetch("/api/subscription-keys/toggle", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: keyId, status: nextStatus }),
    }).catch((err) => console.warn("Failed syncing toggled sub config:", err));
  };

  const approveTransaction = (txId: string, correctedAmount?: number) => {
    const tx = transactions.find((t) => t.id === txId);
    if (!tx || tx.status !== "pending") return;

    const finalAmount =
      correctedAmount !== undefined ? correctedAmount : tx.amount;

    setTransactions((prev) =>
      prev.map((t) => {
        if (t.id === txId) {
          return {
            ...t,
            status: "approved" as const,
            amount: finalAmount,
            description:
              (t.description || "") + curAppT("approvedAndCredited"),
          };
        }
        return t;
      }),
    );
    setUsers((prev) =>
      prev.map((u) => {
        if (u.userId === tx.userId) {
          return { ...u, walletBalance: u.walletBalance + finalAmount };
        }
        return u;
      }),
    );

    fetch("/api/transactions/approve", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: txId, amount: finalAmount }),
    })
      .then(() => {
        setToastMessage(
          curAppT("receiptApproved").replace("{amount}", finalAmount.toLocaleString()),
        );
        setTimeout(() => setToastMessage(null), 3500);
      })
      .catch((err) =>
        console.warn("Failed syncing approved transaction:", err),
      );
  };

  const rejectTransaction = (txId: string) => {
    setTransactions((prev) =>
      prev.map((t) => {
        if (t.id === txId) {
          return {
            ...t,
            status: "rejected" as const,
            description:
              (t.description || "") + curAppT("invalidSlipRejected"),
          };
        }
        return t;
      }),
    );
    fetch("/api/transactions/reject", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: txId }),
    })
      .then(() => {
        setToastMessage(curAppT("receiptRejected"));
        setTimeout(() => setToastMessage(null), 3000);
      })
      .catch((err) =>
        console.warn("Failed syncing rejected transaction:", err),
      );
  };

  const deleteTransaction = (txId: string) => {
    setTransactions((prev) => prev.filter((t) => t.id !== txId));
    fetch("/api/transactions/delete", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: txId }),
    }).catch((err) => console.warn("Failed syncing deleted transaction:", err));
  };

  const clearTransactionHistory = () => {
    setTransactions([]);
    fetch("/api/transactions/clear-history", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
    }).catch((err) =>
      console.warn("Failed syncing cleared transactional logs:", err),
    );
  };

  const saveSettings = (newSettings: PanelSettings) => {
    setSettings(newSettings);
    fetch("/api/settings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newSettings),
    })
      .then(() => {
        setToastMessage(curAppT("settingsSaved"));
        setTimeout(() => setToastMessage(null), 3000);
      })
      .catch((err) => {
        console.warn("Failed syncing setting parameter overrides:", err);
        setToastMessage(curAppT("settingsError"));
        setTimeout(() => setToastMessage(null), 3000);
      });
  };

  const handleSetupComplete = (updates: Partial<PanelSettings>) => {
    const newSettings = { ...settings, ...updates };
    saveSettings(newSettings);
    setShowSetupModal(false);
    setIsNewInstall(false);
  };

  const handleOpenSimulatedChat = (userId: number) => {
    setSimulatedUserId(userId);
    setActiveTab("simulator");
  };

  const addNewTransaction = (tx: Transaction) => {
    setTransactions((prev) => [tx, ...prev]);
    fetch("/api/transactions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(tx),
    }).catch((err) => console.warn("Failed syncing added transaction:", err));
  };

  const addNewSubscriptionKey = (key: SubscriptionKey) => {
    setKeys((prev) => [key, ...prev]);
    setUsers((prev) =>
      prev.map((u) => {
        if (u.userId === key.userId) {
          return { ...u, activePlansCount: u.activePlansCount + 1 };
        }
        return u;
      }),
    );
    fetch("/api/subscription-keys", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(key),
    }).catch((err) =>
      console.warn("Failed syncing added VPN sub config key:", err),
    );
  };

  const updateSubscriptionKey = (
    keyId: string,
    updatedFields: Partial<SubscriptionKey>,
  ) => {
    setKeys((prev) =>
      prev.map((k) => (k.id === keyId ? { ...k, ...updatedFields } : k)),
    );
  };

  const handleResetData = async () => {
    try {
      await fetch("/api/database/reset", { method: "POST" });
    } catch (e) {
      console.warn("Failed reset command on server", e);
    }
    localStorage.clear();
    window.location.reload();
  };

  // Metrics calculators
  const pendingTx = transactions.filter((t) => t.status === "pending");
  const totalVolume = transactions
    .filter((t) => t.status === "approved")
    .reduce((acc, curr) => acc + curr.amount, 0);

  if (!isAuthenticated && !isDemoEnv) {
    return (
      <LoginScreen
        onLoginSuccess={() => setIsAuthenticated(true)}
        lang={lang}
        setLang={setLang}
        appVersion={appVersion}
      />
    );
  }

  return (
    <div
      className="min-h-screen bg-[#030305] text-gray-100 flex flex-col font-sans select-none antialiased relative overflow-hidden"
      dir={isRtl ? "rtl" : "ltr"}
    >
      {/* Immersive visual ambient glowing spotlights */}
      <div className="fixed top-[-15%] left-[-15%] w-[60%] h-[60%] rounded-full bg-purple-600/5 blur-[120px] pointer-events-none pulse-glow-bg z-0" />
      <div className="fixed bottom-[-15%] right-[-15%] w-[60%] h-[60%] rounded-full bg-pink-600/5 blur-[120px] pointer-events-none pulse-glow-bg z-0" />
      <div className="fixed top-[40%] left-[30%] w-[40%] h-[40%] rounded-full bg-indigo-600/3 blur-[140px] pointer-events-none pulse-glow-bg z-0" />

      {showSetupModal && (
        <SetupModal lang={lang} onComplete={handleSetupComplete} />
      )}

      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-6 left-1/2 -translate-x-1/2 z-50 bg-[#0a0a0f]/95 text-white text-xs md:text-sm font-semibold rounded-2xl px-6 py-3.5 border border-purple-500/30 shadow-[0_4px_30px_rgba(168,85,247,0.25)] flex items-center gap-3 backdrop-blur-xl animate-fade-in transition duration-300">
          <div className="w-2 h-2 rounded-full bg-purple-400 shadow-[0_0_8px_#a855f7] animate-ping" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Sidebar Overlay */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/80 z-40 backdrop-blur-md transition-opacity duration-300"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar Drawer */}
      <div
        className={`fixed top-0 bottom-0 ${isRtl ? "right-0 border-l" : "left-0 border-r"} w-72 glass-panel border-white/5 z-50 transform transition-transform duration-300 ease-in-out flex flex-col shadow-[0_0_50px_rgba(0,0,0,0.8)] ${
          isSidebarOpen
            ? "translate-x-0"
            : isRtl
              ? "translate-x-full"
              : "-translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between p-5 border-b border-white/5 bg-black/20">
          <div className="flex items-center gap-2">
            <h2 className="font-display font-bold text-white tracking-wider flex items-center gap-2 whitespace-nowrap">
              <span className="bg-gradient-to-r from-white via-purple-200 to-gray-300 bg-clip-text text-transparent">
                {t.appTitle}
              </span>
              <LionAndSunFlag />
            </h2>
            <button
              onClick={() => {
                refreshData();
                setIsSidebarOpen(false);
              }}
              className="p-1.5 ms-2 bg-purple-950/40 hover:bg-purple-900/40 rounded-full text-purple-400 hover:text-purple-300 transition shadow-sm border border-purple-500/20"
              title={curAppT("refreshData")}
            >
              <RefreshCw
                className={`w-4 h-4 ${isRefreshing ? "animate-spin text-white" : ""}`}
              />
            </button>
          </div>
          <button
            onClick={() => setIsSidebarOpen(false)}
            className="text-gray-400 hover:text-white transition cursor-pointer p-1 bg-white/5 hover:bg-white/10 rounded-full"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto py-4 px-3 space-y-1.5">
          <button
            onClick={() => setActiveTab("dashboard")}
            className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-sm font-semibold cursor-pointer transition-all duration-300 group ${
              activeTab === "dashboard"
                ? "bg-gradient-to-r from-purple-600/15 via-indigo-600/5 to-transparent text-purple-200 border-s-2 border-purple-500 shadow-[inset_0_0_12px_rgba(168,85,247,0.06)]"
                : "text-gray-400 hover:text-gray-200 hover:bg-white/[0.02]"
            }`}
          >
            <div className="flex items-center gap-3">
              <LayoutDashboard
                className={`w-4 h-4 transition-colors duration-300 ${activeTab === "dashboard" ? "text-cyan-400 drop-shadow-[0_0_8px_rgba(34,211,238,0.4)]" : "text-gray-500 group-hover:text-gray-300"}`}
              />
              <span>{t.tabOverview}</span>
            </div>
            {activeTab === "dashboard" && (
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 shadow-[0_0_8px_rgba(34,211,238,0.8)] animate-pulse" />
            )}
          </button>


          <button
            onClick={() => setActiveTab("users")}
            className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-sm font-semibold cursor-pointer transition-all duration-300 group ${
              activeTab === "users"
                ? "bg-gradient-to-r from-purple-600/15 via-indigo-600/5 to-transparent text-purple-200 border-s-2 border-purple-500 shadow-[inset_0_0_12px_rgba(168,85,247,0.06)]"
                : "text-gray-400 hover:text-gray-200 hover:bg-white/[0.02]"
            }`}
          >
            <div className="flex items-center gap-3">
              <Users
                className={`w-4 h-4 transition-colors duration-300 ${activeTab === "users" ? "text-cyan-400 drop-shadow-[0_0_8px_rgba(34,211,238,0.4)]" : "text-gray-500 group-hover:text-gray-300"}`}
              />
              <span>{t.tabUsers}</span>
            </div>
            {activeTab === "users" && (
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 shadow-[0_0_8px_rgba(34,211,238,0.8)] animate-pulse" />
            )}
          </button>

          <button
            onClick={() => setActiveTab("vpn_keys")}
            className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-sm font-semibold cursor-pointer transition-all duration-300 group ${
              activeTab === "vpn_keys"
                ? "bg-gradient-to-r from-purple-600/15 via-indigo-600/5 to-transparent text-purple-200 border-s-2 border-purple-500 shadow-[inset_0_0_12px_rgba(168,85,247,0.06)]"
                : "text-gray-400 hover:text-gray-200 hover:bg-white/[0.02]"
            }`}
          >
            <div className="flex items-center gap-3">
              <Key
                className={`w-4 h-4 transition-colors duration-300 ${activeTab === "vpn_keys" ? "text-cyan-400 drop-shadow-[0_0_8px_rgba(34,211,238,0.4)]" : "text-gray-500 group-hover:text-gray-300"}`}
              />
              <span>{curAppT("vpnConfigsManagement")}</span>
            </div>
            {activeTab === "vpn_keys" && (
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 shadow-[0_0_8px_rgba(34,211,238,0.8)] animate-pulse" />
            )}
          </button>
          <button
            onClick={() => setActiveTab("transactions")}
            className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-sm font-semibold cursor-pointer transition-all duration-300 group relative ${
              activeTab === "transactions"
                ? "bg-gradient-to-r from-purple-600/15 via-indigo-600/5 to-transparent text-purple-200 border-s-2 border-purple-500 shadow-[inset_0_0_12px_rgba(168,85,247,0.06)]"
                : "text-gray-400 hover:text-gray-200 hover:bg-white/[0.02]"
            }`}
          >
            <div className="flex items-center gap-3">
              <CheckSquare
                className={`w-4 h-4 transition-colors duration-300 ${activeTab === "transactions" ? "text-cyan-400 drop-shadow-[0_0_8px_rgba(34,211,238,0.4)]" : "text-gray-500 group-hover:text-gray-300"}`}
              />
              <span>{t.tabApprovals}</span>
            </div>
            <div className="flex items-center gap-1">
              {pendingTx.length > 0 && (
                <span className="bg-amber-500/20 text-amber-400 border border-amber-500/30 text-[10px] font-bold px-2 py-0.5 rounded-full animate-pulse">
                  {pendingTx.length}
                </span>
              )}
              {activeTab === "transactions" && (
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 shadow-[0_0_8px_rgba(34,211,238,0.8)] animate-pulse" />
              )}
            </div>
          </button>

          <button
            onClick={() => setActiveTab("simulator")}
            className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-sm font-semibold cursor-pointer transition-all duration-300 group ${
              activeTab === "simulator"
                ? "bg-gradient-to-r from-purple-600/15 via-indigo-600/5 to-transparent text-purple-200 border-s-2 border-purple-500 shadow-[inset_0_0_12px_rgba(168,85,247,0.06)]"
                : "text-gray-400 hover:text-gray-200 hover:bg-white/[0.02]"
            }`}
          >
            <div className="flex items-center gap-3">
              <Bot
                className={`w-4 h-4 transition-colors duration-300 ${activeTab === "simulator" ? "text-cyan-400 drop-shadow-[0_0_8px_rgba(34,211,238,0.4)]" : "text-gray-500 group-hover:text-gray-300"}`}
              />
              <span>{t.tabSimulator}</span>
            </div>
            {activeTab === "simulator" && (
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 shadow-[0_0_8px_rgba(34,211,238,0.8)] animate-pulse" />
            )}
          </button>

          <button
            onClick={() => setActiveTab("servers")}
            className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-sm font-semibold cursor-pointer transition-all duration-300 group ${
              activeTab === "servers"
                ? "bg-gradient-to-r from-purple-600/15 via-indigo-600/5 to-transparent text-purple-200 border-s-2 border-purple-500 shadow-[inset_0_0_12px_rgba(168,85,247,0.06)]"
                : "text-gray-400 hover:text-gray-200 hover:bg-white/[0.02]"
            }`}
          >
            <div className="flex items-center gap-3">
              <Server
                className={`w-4 h-4 transition-colors duration-300 ${activeTab === "servers" ? "text-cyan-400 drop-shadow-[0_0_8px_rgba(34,211,238,0.4)]" : "text-gray-500 group-hover:text-gray-300"}`}
              />
              <span>
                {curAppT("serverManagement")}
              </span>
            </div>
            {activeTab === "servers" && (
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 shadow-[0_0_8px_rgba(34,211,238,0.8)] animate-pulse" />
            )}
          </button>

          <button
            onClick={() => setActiveTab("colleagues")}
            className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-sm font-semibold cursor-pointer transition-all duration-300 group ${
              activeTab === "colleagues"
                ? "bg-gradient-to-r from-purple-600/15 via-indigo-600/5 to-transparent text-purple-200 border-s-2 border-purple-500 shadow-[inset_0_0_12px_rgba(168,85,247,0.06)]"
                : "text-gray-400 hover:text-gray-200 hover:bg-white/[0.02]"
            }`}
          >
            <div className="flex items-center gap-3">
              <Briefcase
                className={`w-4 h-4 transition-colors duration-300 ${activeTab === "colleagues" ? "text-cyan-400 drop-shadow-[0_0_8px_rgba(34,211,238,0.4)]" : "text-gray-500 group-hover:text-gray-300"}`}
              />
              <span>{t.tabColleagues}</span>
            </div>
            {activeTab === "colleagues" && (
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 shadow-[0_0_8px_rgba(34,211,238,0.8)] animate-pulse" />
            )}
          </button>

          <button
            onClick={() => setActiveTab("buttons")}
            className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-sm font-semibold cursor-pointer transition-all duration-300 group ${
              activeTab === "buttons"
                ? "bg-gradient-to-r from-purple-600/15 via-indigo-600/5 to-transparent text-purple-200 border-s-2 border-purple-500 shadow-[inset_0_0_12px_rgba(168,85,247,0.06)]"
                : "text-gray-400 hover:text-gray-200 hover:bg-white/[0.02]"
            }`}
          >
            <div className="flex items-center gap-3">
              <Command
                className={`w-4 h-4 transition-colors duration-300 ${activeTab === "buttons" ? "text-cyan-400 drop-shadow-[0_0_8px_rgba(34,211,238,0.4)]" : "text-gray-500 group-hover:text-gray-300"}`}
              />
              <span>{t.tabBotButtons}</span>
            </div>
            {activeTab === "buttons" && (
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 shadow-[0_0_8px_rgba(34,211,238,0.8)] animate-pulse" />
            )}
          </button>

          <button
            onClick={() => setActiveTab("giftcodes")}
            className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-sm font-semibold cursor-pointer transition-all duration-300 group ${
              activeTab === "giftcodes"
                ? "bg-gradient-to-r from-purple-600/15 via-indigo-600/5 to-transparent text-purple-200 border-s-2 border-purple-500 shadow-[inset_0_0_12px_rgba(168,85,247,0.06)]"
                : "text-gray-400 hover:text-gray-200 hover:bg-white/[0.02]"
            }`}
          >
            <div className="flex items-center gap-3">
              <Gift
                className={`w-4 h-4 transition-colors duration-300 ${activeTab === "giftcodes" ? "text-cyan-400 drop-shadow-[0_0_8px_rgba(34,211,238,0.4)]" : "text-gray-500 group-hover:text-gray-300"}`}
              />
              <span>{curAppT("giftCodes")}</span>
            </div>
            {activeTab === "giftcodes" && (
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 shadow-[0_0_8px_rgba(34,211,238,0.8)] animate-pulse" />
            )}
          </button>

          <button
            onClick={() => setActiveTab("tickets")}
            className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-sm font-semibold cursor-pointer transition-all duration-300 group relative ${
              activeTab === "tickets"
                ? "bg-gradient-to-r from-purple-600/15 via-indigo-600/5 to-transparent text-purple-200 border-s-2 border-purple-500 shadow-[inset_0_0_12px_rgba(168,85,247,0.06)]"
                : "text-gray-400 hover:text-gray-200 hover:bg-white/[0.02]"
            }`}
          >
            <div className="flex items-center gap-3">
              <MessageSquare
                className={`w-4 h-4 transition-colors duration-300 ${activeTab === "tickets" ? "text-cyan-400 drop-shadow-[0_0_8px_rgba(34,211,238,0.4)]" : "text-gray-500 group-hover:text-gray-300"}`}
              />
              <span>{curAppT("supportTickets")}</span>
            </div>
            <div className="flex items-center gap-1">
              {tickets.filter((t) => t.status === "open").length > 0 && (
                <span className="bg-rose-500/20 text-rose-400 border border-rose-500/30 text-[10px] font-bold px-2 py-0.5 rounded-full animate-pulse">
                  {tickets.filter((t) => t.status === "open").length}
                </span>
              )}
              {activeTab === "tickets" && (
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 shadow-[0_0_8px_rgba(34,211,238,0.8)] animate-pulse" />
              )}
            </div>
          </button>

          <button
            onClick={() => setActiveTab("settings")}
            className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-sm font-semibold cursor-pointer transition-all duration-300 group ${
              activeTab === "settings"
                ? "bg-gradient-to-r from-purple-600/15 via-indigo-600/5 to-transparent text-purple-200 border-s-2 border-purple-500 shadow-[inset_0_0_12px_rgba(168,85,247,0.06)]"
                : "text-gray-400 hover:text-gray-200 hover:bg-white/[0.02]"
            }`}
          >
            <div className="flex items-center gap-3">
              <Settings
                className={`w-4 h-4 transition-colors duration-300 ${activeTab === "settings" ? "text-cyan-400 drop-shadow-[0_0_8px_rgba(34,211,238,0.4)]" : "text-gray-500 group-hover:text-gray-300"}`}
              />
              <span>{t.tabSettings}</span>
            </div>
            {activeTab === "settings" && (
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 shadow-[0_0_8px_rgba(34,211,238,0.8)] animate-pulse" />
            )}
          </button>
        </div>

        <div className="p-4 border-t border-white/5 bg-black/10">
          <div className="flex items-center gap-2 mb-4">
            <button
              onClick={() => {
                localStorage.removeItem("daltoon_dashboard_auth");
                setIsAuthenticated(false);
              }}
              className="w-full flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl text-sm font-semibold text-rose-400 bg-rose-500/5 hover:bg-rose-500/10 border border-rose-500/10 hover:border-rose-500/20 transition cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
              <span>{curAppT("logout")}</span>
            </button>
          </div>

          <div 
            className="text-center space-y-1 cursor-pointer hover:opacity-80 transition-opacity"
            onClick={() => setShowUpdatePanel(true)}
          >
            <div className="text-gray-500 text-[10px] font-mono tracking-wider">
              v{appVersion} {appVersion.toLowerCase().includes('dev') ? (
                <span className="text-amber-400 font-bold ml-1">
                  (Dev Build)
                </span>
              ) : (updateAvailable || (latestVersion && latestVersion !== appVersion)) ? (
                <span className="text-emerald-400 font-bold ml-1 animate-pulse">
                  (↑ v{latestVersion})
                </span>
              ) : (
                <span className="text-gray-600 ml-1 italic opacity-50">pro</span>
              )}
            </div>
            <div className="text-gray-400 text-xs">
              {curAppT("developerBy")}
              <a
                href="https://t.me/mDaltoon"
                target="_blank"
                rel="noopener noreferrer"
                className="text-purple-400 hover:text-purple-300 transition-colors font-medium"
              >
                mDaltoon
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Upper Navigation Header */}
      <header
        dir={isRtl ? "rtl" : "ltr"}
        className="bg-black/40 backdrop-blur-md border-b border-white/5 px-4 md:px-6 py-3 sticky top-0 z-30 shadow-md"
      >
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          {/* Logo Brand Header & Hamburger */}
          <div className="flex items-center gap-3 flex-1 justify-start">
            <button
              onClick={() => setIsSidebarOpen(true)}
              className="p-2 text-gray-400 hover:text-white transition cursor-pointer bg-white/5 hover:bg-white/10 rounded-full"
            >
              <Menu className="w-5 h-5 text-purple-400" />
            </button>
            <div className="flex items-center gap-2 flex-shrink-0">
              <div
                className="cursor-pointer flex items-center gap-2 flex-shrink-0"
                onClick={() => setIsSidebarOpen(true)}
              >
                <h1 className="font-display font-bold text-lg sm:text-xl md:text-2xl tracking-wide bg-gradient-to-r from-white via-purple-200 to-gray-300 bg-clip-text text-transparent whitespace-nowrap">
                  {t.appTitle}
                </h1>
                <LionAndSunFlag />
              </div>
            </div>
          </div>

          {/* Sync / State actions Panel */}
          <div className="flex items-center gap-3 flex-1 justify-end">
            {/* Theme Toggle Button */}
            <button
              onClick={() => setIsLightMode(!isLightMode)}
              className="p-2.5 text-gray-400 hover:text-white transition cursor-pointer bg-white/5 hover:bg-white/10 rounded-xl border border-white/5 flex items-center justify-center shadow-sm"
              title={
                isLightMode ? curAppT("darkMode") : curAppT("lightMode")
              }
            >
              {isLightMode ? (
                <Moon className="w-4 h-4 text-purple-600 drop-shadow-[0_0_8px_rgba(109,40,217,0.4)]" />
              ) : (
                <Sun className="w-4 h-4 text-amber-400 drop-shadow-[0_0_8px_rgba(245,158,11,0.4)]" />
              )}
            </button>

            {/* Language Selection List / Dropdown */}
            <div className="relative">
              <button
                onClick={() => setShowLangDropdown(!showLangDropdown)}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-black/60 hover:bg-black/80 border border-white/5 rounded-xl text-xs font-semibold text-gray-300 hover:text-white transition cursor-pointer"
              >
                <span>
                  {lang === "fa" && "فارسی"}
                  {lang === "en" && "🇬🇧 English"}
                  {lang === "ar" && "🇸🇦 العربية"}
                  {lang === "ru" && "🇷🇺 Русский"}
                  {lang === "tr" && "🇹🇷 Türkçe"}
                  {lang === "es" && "🇪🇸 Español"}
                </span>
                <svg
                  className={`w-3.5 h-3.5 transition-transform duration-200 ${
                    showLangDropdown ? "rotate-180" : ""
                  }`}
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </button>

              {showLangDropdown && (
                <>
                  {/* Backdrop to close dropdown on click outside */}
                  <div
                    className="fixed inset-0 z-40"
                    onClick={() => setShowLangDropdown(false)}
                  />
                  <div className="absolute right-0 mt-2 w-44 bg-zinc-950 border border-white/10 rounded-xl shadow-2xl p-1.5 z-50 animate-in fade-in slide-in-from-top-1 duration-150">
                    <div className="text-[10px] text-gray-500 px-2 py-1 font-semibold border-b border-white/5 mb-1 select-none">
                      {curAppT("selectLanguage")}
                    </div>
                    {[
                      { code: "fa", label: "🇮🇷 فارسی" },
                      { code: "en", label: "🇬🇧 English" },
                      { code: "ar", label: "🇸🇦 العربية" },
                      { code: "ru", label: "🇷🇺 Русский" },
                      { code: "tr", label: "🇹🇷 Türkçe" },
                      { code: "es", label: "🇪🇸 Español" },
                    ].map((item) => (
                      <button
                        key={item.code}
                        onClick={() => handleLanguageSelect(item.code as Language)}
                        className={`w-full flex items-center justify-between px-2.5 py-1.5 text-xs rounded-lg transition-all text-left ${
                          lang === item.code
                            ? "bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-semibold shadow-md shadow-purple-500/10"
                            : "text-gray-400 hover:bg-white/5 hover:text-white"
                        }`}
                      >
                        <span className="text-right w-full">{item.label}</span>
                        {lang === item.code && (
                          <span className="text-[10px] bg-white/20 px-1 rounded ml-2">✓</span>
                        )}
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 md:p-5 space-y-5">
        {/* Tab Content Renderer Selector */}
        <div className="min-h-[400px]">
          {activeTab === "dashboard" && (
            <DashboardOverview
              inbounds={inbounds}
              toggleInbound={toggleInbound}
              usersCount={users.length}
              activeSubsCount={
                keys.filter(
                  (k) =>
                    k.status === "active" && !k.planName.includes("تست رایگان"),
                ).length
              }
              totalIncome={totalVolume}
              pendingTransactionsCount={pendingTx.length}
              transactions={transactions}
              logs={logs}
              lang={lang}
              appVersion={appVersion}
              latestVersion={latestVersion}
              updateAvailable={updateAvailable}
              onOpenUpdatePanel={() => setShowUpdatePanel(true)}
              settings={settings}
            />
          )}

          {activeTab === "users" && (
            <UserManagement
              users={users}
              keys={keys}
              adjustUserWallet={adjustUserWallet}
              toggleUserBan={toggleUserBan}
              addNewUser={addNewUser}
              deleteUser={deleteUser}
              deleteSubscriptionKey={deleteSubscriptionKey}
              toggleSubscriptionKey={toggleSubscriptionKey}
              addNewSubscriptionKey={addNewSubscriptionKey}
              openSimulatedChat={handleOpenSimulatedChat}
              lang={lang}
              settings={settings}
              updateSubscriptionKey={updateSubscriptionKey}
            />
          )}

          {activeTab === "vpn_keys" && (
            <VpnKeysManager
              keys={keys}
              users={users}
              lang={lang}
              toggleSubscriptionKey={toggleSubscriptionKey}
              setDeleteConfirm={setDeleteConfirm}
              updateSubscriptionKey={updateSubscriptionKey}
            />
          )}

          {activeTab === "transactions" && (
            <TransactionApproval
              transactions={transactions}
              approveTransaction={approveTransaction}
              rejectTransaction={rejectTransaction}
              deleteTransaction={deleteTransaction}
              clearTransactionHistory={clearTransactionHistory}
              lang={lang}
              settings={settings}
            />
          )}

          {activeTab === "simulator" && (
            <BotSimulator
              users={users}
              plans={vpnPlans}
              setVpnPlans={setVpnPlans}
              transactions={transactions}
              keys={keys}
              setKeys={setKeys}
              setUsers={setUsers}
              tickets={tickets}
              setTickets={setTickets}
              activeUserId={simulatedUserId}
              setActiveUserId={setSimulatedUserId}
              updateUserBalance={adjustUserWallet}
              addNewTransaction={addNewTransaction}
              addNewSubscriptionKey={addNewSubscriptionKey}
              lang={lang}
              customButtons={customButtons}
              settings={settings}
              planCategories={planCategories}
            />
          )}

          {activeTab === "servers" && (
            <ServerManagement
              vpnPlans={vpnPlans}
              setVpnPlans={setVpnPlans}
              planCategories={planCategories}
              setPlanCategories={setPlanCategories}
              colleaguePackages={colleaguePackages}
              lang={lang}
              settings={settings}
              onSaveSettings={saveSettings}
              inbounds={inbounds}
              setInbounds={setInbounds}
            />
          )}

          {activeTab === "colleague_accounts" && (
            <div className="p-4 md:p-6 pb-24">
              <ColleagueAccounts
                accounts={colleagueAccounts}
                setAccounts={setColleagueAccounts}
                lang={lang}
              />
            </div>
          )}

          {activeTab === "colleagues" && (
            <div className="p-4 md:p-6 pb-24">
              <ColleaguesManagement
                packages={colleaguePackages}
                accounts={colleagueAccounts}
                setPackages={setColleaguePackages}
                setAccounts={setColleagueAccounts}
                settings={settings}
                onSaveSettings={saveSettings}
                lang={lang}
                planCategories={planCategories}
                colleagueCategories={colleagueCategories}
                setColleagueCategories={setColleagueCategories}
              />
            </div>
          )}

          {activeTab === "buttons" && (
            <BotButtonsPanel
              settings={settings}
              onSaveSettings={saveSettings}
              lang={lang}
              customButtons={customButtons}
              setCustomButtons={setCustomButtons}
            />
          )}

          {activeTab === "giftcodes" && (
            <GiftCodeManager
              giftCodes={giftCodes}
              onAddCode={async (code, amount, maxUsage, durationDays) => {
                const response = await fetch("/api/gift-codes", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({
                    code,
                    amount,
                    maxUsage,
                    durationDays,
                  }),
                });
                const data = await response.json();
                if (data.success) {
                  setGiftCodes((prev) => [...prev, data.item]);
                }
              }}
              onEditCode={async (id, code, amount, maxUsage, durationDays) => {
                const response = await fetch("/api/gift-codes/edit", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({
                    id,
                    code,
                    amount,
                    maxUsage,
                    durationDays,
                  }),
                });
                const data = await response.json();
                if (data.success) {
                  setGiftCodes((prev) =>
                    prev.map((c) => (c.id === id ? data.item : c)),
                  );
                }
              }}
              onDeleteCode={async (id) => {
                const response = await fetch("/api/gift-codes/delete", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({ id }),
                });
                const data = await response.json();
                if (data.success) {
                  setGiftCodes((prev) => prev.filter((c) => c.id !== id));
                }
              }}
              promoCodes={promoCodes}
              onAddPromoCode={handleAddPromoCode}
              onDeletePromoCode={handleDeletePromoCode}
              settings={settings}
              onSaveSettings={saveSettings}
              lang={lang}
            />
          )}

          {activeTab === "tickets" && (
            <TicketManager
              tickets={tickets}
              onReplyTicket={handleReplyTicket}
              onCloseTicket={handleCloseTicket}
              onDeleteTicket={handleDeleteTicket}
              lang={lang}
            />
          )}

          {activeTab === "settings" && (
            <SettingsPanel
              settings={settings}
              onSaveSettings={saveSettings}
              lang={lang}
              customButtons={customButtons}
              setCustomButtons={setCustomButtons}
            />
          )}

          {/* Update Panel Modal */}
          <AnimatePresence>
            {showUpdatePanel && (
              <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                <motion.div
                  initial={{ opacity: 0, scale: 0.95, y: 20 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: 20 }}
                  className="w-full max-w-md overflow-hidden bg-[#1a1c24] border border-gray-800 rounded-2xl shadow-2xl"
                >
                  <div className="flex items-center justify-between p-5 border-b border-gray-800">
                    <h3 className="text-lg font-bold text-gray-200">
                      {curAppT("updatePanel")}
                    </h3>
                    <button
                      onClick={() => setShowUpdatePanel(false)}
                      className="p-2 text-gray-400 transition-colors rounded-lg hover:bg-gray-800 hover:text-white"
                    >
                      <X size={20} />
                    </button>
                  </div>

                  <div className="p-5 space-y-4">
                    {/* Dev Channel Toggle */}
                    <div className="flex items-center justify-between p-4 transition-colors border border-gray-800 rounded-xl bg-gray-900/50 hover:bg-gray-800/50">
                      <div className="flex flex-col">
                        <span className="text-sm font-medium text-gray-200">
                          {curAppT("devChannel")}
                        </span>
                        <span className="text-[10px] text-gray-500">
                          {curAppT("devChannelDesc")}
                        </span>
                      </div>
                      <button
                        onClick={() => setUpdateChannel(updateChannel === "stable" ? "dev" : "stable")}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none p-1 ${
                          updateChannel === "dev" ? "bg-purple-600 justify-end" : "bg-gray-700 justify-start"
                        }`}
                      >
                        <span className="inline-block h-4 w-4 rounded-full bg-white transition-all" />
                      </button>
                    </div>

                    {/* Current Version */}
                    <div className="flex items-center justify-between p-4 border border-gray-800 rounded-xl bg-gray-900/50">
                      <span className="text-sm text-gray-400">
                        {curAppT("currentVersion")}
                      </span>
                      <span className="px-2 py-1 text-xs font-bold text-emerald-400 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
                        v{appVersion}
                      </span>
                    </div>

                    {/* Update Status */}
                    <div className="flex items-center justify-between p-4 border border-gray-800 rounded-xl bg-gray-900/50">
                      <span className="text-sm text-gray-400">
                        {updateAvailable ? curAppT("newVersionAvailable") : curAppT("panelIsUpToDate")}
                      </span>
                      {updateAvailable ? (
                        <span className="px-2 py-1 text-xs font-bold text-amber-400 rounded-lg bg-amber-500/10 border border-amber-500/20 animate-pulse">
                          v{latestVersion} available
                        </span>
                      ) : (
                        <span className="px-2 py-1 text-xs font-bold text-emerald-400 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
                          {curAppT("panelIsUpToDate")}
                        </span>
                      )}
                    </div>

                    {/* Update Button */}
                    <div className="pt-2 space-y-2">
                      <button
                        onClick={handleUpdate}
                        disabled={!updateAvailable || isUpdating}
                        className={`w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-bold transition-all ${
                          updateAvailable && !isUpdating
                            ? "bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-lg shadow-purple-500/20 hover:scale-[1.02] active:scale-[0.98]"
                            : "bg-gray-800 text-gray-500 cursor-not-allowed border border-gray-700"
                        }`}
                      >
                        <Cloud size={18} />
                        {isUpdating ? curAppT("updating") : curAppT("updatePanel")}
                      </button>

                      {!updateAvailable && !isUpdating && (
                        <button
                          onClick={() => {
                            setUpdateAvailable(true);
                            setLatestVersion("2.3.1");
                            setShowUpdateConfirm(true);
                          }}
                          className="w-full text-xs text-center text-gray-500 hover:text-purple-400 transition-colors py-1 underline underline-offset-4 cursor-pointer"
                        >
                          {curAppT("forceUpdate")}
                        </button>
                      )}
                    </div>
                  </div>
                </motion.div>
              </div>
            )}
          </AnimatePresence>

          {/* Confirmation Modal */}
          <ConfirmationModal
            isOpen={!!deleteConfirm}
            message={deleteConfirm?.message || ""}
            onConfirm={() => {
              if (deleteConfirm?.type === "key") {
                deleteSubscriptionKey(deleteConfirm.id);
              } else if (deleteConfirm?.type === "user") {
                deleteUser(deleteConfirm.id);
              }
              setDeleteConfirm(null);
            }}
            onCancel={() => setDeleteConfirm(null)}
            lang={lang}
            isDangerous={true}
          />

          <AnimatePresence>
            {showUpdateConfirm && (
              <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  className="w-full max-w-sm overflow-hidden bg-[#1a1c24] border border-gray-800 rounded-3xl shadow-2xl"
                >
                  <div className="p-8 text-center space-y-6">
                    <div className="flex justify-center">
                      <div className="p-4 bg-purple-500/10 rounded-full text-purple-400 border border-purple-500/20">
                        <RefreshCw className="animate-spin-slow" size={48} />
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <h3 className="text-2xl font-bold text-gray-100">
                        {curAppT("confirmUpdate")}
                      </h3>
                      <p className="text-gray-400 leading-relaxed">
                        {curAppT("confirmUpdateDesc")}
                      </p>
                    </div>

                    <div className="flex flex-col gap-3 pt-4">
                      <button
                        onClick={executeUpdate}
                        className="w-full py-4 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-2xl font-bold shadow-lg shadow-purple-500/20 hover:scale-[1.02] active:scale-[0.98] transition-all"
                      >
                        {curAppT("startUpdate")}
                      </button>
                      <button
                        onClick={() => setShowUpdateConfirm(false)}
                        className="w-full py-4 text-gray-400 font-medium hover:text-white transition-colors"
                      >
                        {curAppT("cancel")}
                      </button>
                    </div>
                  </div>
                </motion.div>
              </div>
            )}
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
}
