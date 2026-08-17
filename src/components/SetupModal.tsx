import React, { useState, useEffect } from "react";
import { Language } from "../lang/locales";
import { Bot, UserCog, User, Key, ArrowRight, Info, Coins } from "lucide-react";
import { PanelSettings } from "../types";

const sTrans = {
  fa: {
    fillFields: "لطفا تمامی فیلدها را پر کنید.",
    ownerNumber: "آیدی عددی باید فقط شامل اعداد باشد.",
    tokenInvalid: "❌ توکن وارد شده نامعتبر است یا توسط BotFather منقضی/پاک شده است! تلگرام خطای روبرو را گزارش داد: ",
    guidesText: `🌐 راهنمای فعال‌سازی و اتصال به سرویس (لینک سابسکریپشن)

کاربر گرامی، ضمن تشکر از انتخاب و اعتماد شما، روش فعال‌سازی و راه‌اندازی سرویس به شرح زیر می‌باشد:

۱. نرم‌افزار متناسب با سیستم‌عامل خود را دانلود و نصب کنید:
• اندروید: v2rayNG
• آیفون (iOS): V2box یا Streisand
• ویندوز: Nekoray یا v2rayN

۲. لینک اشتراک (سابسکریپشن) دریافتی از ربات را کپی نمایید.

۳. وارد نرم‌افزار شده و پیوند کپی شده را اضافه نمایید (معمولاً دکمه + و انتخاب گزینه Import from clipboard یا Add Subscription).

۴. روی گزینه Update Subscription کلیک کنید تا تمام سرورها بارگذاری شوند.

۵. یکی از سرورها را انتخاب کرده و اتصال را برقرار نمایید. در صورت وجود هرگونه مشکل با ما در ارتباط باشید.`,
    guidesBtn: "💡 راهنمای اتصال",
    welcomeText: `<b>🛍️ به فروشگاه {nickname} خوش آمدید!</b>\n\nبهترین و معتبرترین پلن‌ها و اشتراک‌ها را با تحویل آنی و ضمانت بازگشت وجه تهیه فرمایید.\n\n🆔 شناسه تلگرام شما: <code>{tg_id}</code>\n💰 موجودی کیف پول: <code>{wallet_balance}</code> تومان\n\n👇 لطفا گزینه مورد نظر خود را از منوی زیر انتخاب نمایید:`,
    supportText: `📞 <b>پشتیبانی {nickname}:</b>\n\nمشتری گرامی! در صورت وجود هرگونه سوال، پیگیری خرید یا پشتیبانی قبل و بعد از فروش در خدمت شما هستیم.\n\n👤 پشتیبانی تلگرام: @mDaltoon\n\nپاسخگویی فعال: ۲۴ ساعته شبانه‌روز`,
    initialSetup: "راه‌اندازی اولیه دالتون بات",
    developedBy: "توسعه یافته توسط mDaltoon",
    haveBackup: "آیا فایل پشتیبان (بکاپ) دارید؟",
    backupDesc: "اگر از قبل فایل بکاپ (پسوند JSON) دارید، آن را بارگذاری کنید تا همه تنظیمات، کاربران، سرورها و پیام‌های قبلی شما با یک کلیک بازگردند.",
    selectBackup: "📁 انتخاب و بارگذاری فایل بکاپ (JSON)",
    backupSuccess: "✅ بکاپ با موفقیت بازگردانی شد! صفحه در حال بروزرسانی است...",
    backupError: "خطا در بازگردانی بکاپ",
    botNickname: "نام ربات / لقب شما (Nickname)",
    nicknamePlaceholder: "مثال: فروشگاه پروکسی من",
    nicknameDesc: "این نام در پیام‌های خوش‌آمدگویی و داخل ربات به جای Daltoon قرار می‌گیرد.",
    botToken: "توکن ربات تلگرام",
    tokenDesc: "توکن ربات خود را از BotFather@ دریافت کنید.",
    ownerId: "آیدی عددی مالک (Owner ID)",
    ownerPlaceholder: "فقط عدد (مثلا: 123456789)",
    ownerDesc: "آیدی عددی خود را می‌توانید از ربات تلگرامی infouserbot@ دریافت کنید.",
    currencyLabel: "واحد پول",
    currencyPlaceholder: "تومان",
    currencyDesc: "واحد پولی که در پیام‌ها، دکمه‌ها و بخش‌های مختلف ربات نمایش داده می‌شود.",
    receiptBotTokenLabel: "توکن ربات تایید رسیدها (اختیاری)",
    receiptBotTokenPlaceholder: "1234567890:AAH...",
    receiptBotTokenDesc: "اگر مایلید رسیدهای واریزی مستقیم به یک ربات دیگر ارسال شوند، توکن آن را اینجا وارد کنید.",
    verifying: "در حال بررسی اتصال به تلگرام...",
    saveAndEnter: "ذخیره و ورود به داشبورد"
  },
  en: {
    fillFields: "Please fill out all fields.",
    ownerNumber: "Owner ID must be a number.",
    tokenInvalid: "❌ The token entered is invalid or has expired/been deleted by BotFather! Telegram reported: ",
    guidesText: "Connection Guides...",
    guidesBtn: "💡 Connection Guides",
    welcomeText: "<b>🛍️ Welcome to {nickname} !</b>\n\nGet the best and most reliable plans and subscriptions with instant delivery and money-back guarantee.\n\n🆔 Your Telegram ID: <code>{tg_id}</code>\n💰 Wallet Balance: <code>{wallet_balance}</code>\n\n👇 Please select your desired option from the menu below:",
    supportText: "📞 <b>Support for {nickname}:</b>\n\nDear customer! If you have any questions, purchase tracking, or pre- and post-sales support, we are at your service.\n\n👤 Telegram Support: @mDaltoon\n\nActive response: 24/7",
    initialSetup: "Daltoon Bot Initial Setup",
    developedBy: "Developed by mDaltoon",
    haveBackup: "Have a database backup?",
    backupDesc: "If you have a previous backup file (JSON), upload it to restore all your previous settings, users, servers, and channels immediately.",
    selectBackup: "📁 Select & Restore Backup JSON",
    backupSuccess: "✅ Backup successfully restored! Reloading dashboard...",
    backupError: "Error restoring backup",
    botNickname: "Bot/Store Nickname",
    nicknamePlaceholder: "e.g. My Proxy Store",
    nicknameDesc: "This name will be placed in welcome messages instead of Daltoon.",
    botToken: "Telegram Bot Token",
    tokenDesc: "Get your token from @BotFather.",
    ownerId: "Owner Numeric ID",
    ownerPlaceholder: "Numbers only",
    ownerDesc: "Get your numeric ID from @infouserbot in Telegram.",
    currencyLabel: "Currency",
    currencyPlaceholder: "e.g. Toman",
    currencyDesc: "The currency shown in invoices and wallet inside the bot.",
    receiptBotTokenLabel: "Receipt Verification Bot Token (Optional)",
    receiptBotTokenPlaceholder: "1234567890:AAH...",
    receiptBotTokenDesc: "If set, payment receipt verification messages will be sent to this secondary bot.",
    verifying: "Verifying Telegram Bot Token...",
    saveAndEnter: "Save and Enter Dashboard"
  },
  ru: {
    fillFields: "Пожалуйста, заполните все поля.",
    ownerNumber: "ID владельца должен быть числом.",
    tokenInvalid: "❌ Токен недействителен или удален! Telegram сообщил: ",
    guidesText: "Инструкции по подключению...",
    guidesBtn: "💡 Инструкции по подключению",
    welcomeText: "<b>🛍️ Добро пожаловать в {nickname} !</b>\n\nПолучите лучшие и самые надежные планы и подписки с мгновенной доставкой.\n\n🆔 Ваш Telegram ID: <code>{tg_id}</code>\n💰 Баланс: <code>{wallet_balance}</code>\n\n👇 Пожалуйста, выберите нужный вариант из меню ниже:",
    supportText: "📞 <b>Поддержка {nickname}:</b>\n\nУважаемый клиент! Если у вас возникли вопросы, мы к вашим услугам.\n\n👤 Поддержка Telegram: @mDaltoon\n\nАктивный ответ: 24/7",
    initialSetup: "Первоначальная настройка Daltoon Bot",
    developedBy: "Разработано mDaltoon",
    haveBackup: "У вас есть резервная копия?",
    backupDesc: "Загрузите файл резервной копии (JSON), чтобы восстановить настройки.",
    selectBackup: "📁 Выбрать и восстановить резервную копию JSON",
    backupSuccess: "✅ Резервная копия успешно восстановлена! Перезагрузка...",
    backupError: "Ошибка восстановления резервной копии",
    botNickname: "Никнейм бота/магазина",
    nicknamePlaceholder: "например, My Proxy Store",
    nicknameDesc: "Это имя будет использоваться в приветственных сообщениях.",
    botToken: "Токен Telegram-бота",
    tokenDesc: "Получите токен у @BotFather.",
    ownerId: "ID владельца",
    ownerPlaceholder: "Только цифры",
    ownerDesc: "Получите свой ID у @infouserbot в Telegram.",
    currencyLabel: "Currency",
    currencyPlaceholder: "e.g. Toman",
    currencyDesc: "The currency shown in invoices and wallet inside the bot.",
    receiptBotTokenLabel: "Receipt Verification Bot Token (Optional)",
    receiptBotTokenPlaceholder: "1234567890:AAH...",
    receiptBotTokenDesc: "If set, payment receipt verification messages will be sent to this secondary bot.",
    verifying: "Проверка токена бота Telegram...",
    saveAndEnter: "Сохранить и войти в панель"
  },
  ar: {
    fillFields: "يرجى ملء جميع الحقول.",
    ownerNumber: "يجب أن يكون معرف المالك رقماً.",
    tokenInvalid: "❌ الرمز غير صالح أو منتهي الصلاحية! أبلغ تليجرام: ",
    guidesText: "أدلة الاتصال...",
    guidesBtn: "💡 أدلة الاتصال",
    welcomeText: "<b>🛍️ مرحبًا بك في {nickname} !</b>\n\nاحصل على أفضل الاشتراكات والخطط مع تسليم فوري.\n\n🆔 معرف تليجرام الخاص بك: <code>{tg_id}</code>\n💰 رصيد المحفظة: <code>{wallet_balance}</code>\n\n👇 يرجى اختيار الخيار المطلوب من القائمة أدناه:",
    supportText: "📞 <b>الدعم لـ {nickname}:</b>\n\nعميلنا العزيز! إذا كان لديك أي سؤال، فنحن في خدمتكم.\n\n👤 دعم تليجرام: @mDaltoon\n\nالرد النشط: 24/7",
    initialSetup: "الإعداد الأولي لبوت دالتون",
    developedBy: "تم التطوير بواسطة mDaltoon",
    haveBackup: "هل لديك نسخة احتياطية؟",
    backupDesc: "إذا كان لديك ملف نسخة احتياطية (JSON) سابق، فقم بتحميله لاستعادة بياناتك على الفور.",
    selectBackup: "📁 اختيار واستعادة النسخة الاحتياطية JSON",
    backupSuccess: "✅ تم استعادة النسخة الاحتياطية بنجاح! جاري تحديث الصفحة...",
    backupError: "خطأ في استعادة النسخة الاحتياطية",
    botNickname: "لقب البوت / المتجر",
    nicknamePlaceholder: "مثال: متجر البروكسي الخاص بي",
    nicknameDesc: "سيتم وضع هذا الاسم في رسائل الترحيب بدلاً من دالتون.",
    botToken: "رمز بوت تليجرام",
    tokenDesc: "احصل على رمز البوت من @BotFather.",
    ownerId: "معرف المالك الرقمي",
    ownerPlaceholder: "أرقام فقط",
    ownerDesc: "احصل على معرفك الرقمي من @infouserbot في تليجرام.",
    currencyLabel: "Currency",
    currencyPlaceholder: "e.g. Toman",
    currencyDesc: "The currency shown in invoices and wallet inside the bot.",
    receiptBotTokenLabel: "Receipt Verification Bot Token (Optional)",
    receiptBotTokenPlaceholder: "1234567890:AAH...",
    receiptBotTokenDesc: "If set, payment receipt verification messages will be sent to this secondary bot.",
    verifying: "التحقق من رمز بوت تليجرام...",
    saveAndEnter: "حفظ والدخول إلى لوحة التحكم"
  },
  tr: {
    fillFields: "Lütfen tüm alanları doldurun.",
    ownerNumber: "Sahip kimliği bir sayı olmalıdır.",
    tokenInvalid: "❌ Girilen jeton geçersiz veya süresi dolmuş! Telegram hatası: ",
    guidesText: "Bağlantı Kılavuzları...",
    guidesBtn: "💡 Bağlantı Kılavuzları",
    welcomeText: "<b>🛍️ {nickname} Mağazasına Hoş Geldiniz!</b>\n\nEn iyi ve en güvenilir planları ve abonelikleri anında teslimat ve para iadesi garantisiyle alın.\n\n🆔 Telegram Kimliğiniz: <code>{tg_id}</code>\n💰 Cüzdan Bakiyesi: <code>{wallet_balance}</code>\n\n👇 Lütfen aşağıdaki menüden istediğiniz seçeneği seçin:",
    supportText: "📞 <b>{nickname} için Destek:</b>\n\nDeğerli müşterimiz! Herhangi bir sorunuz, satın alma takibiniz veya satış öncesi/sonrası desteğiniz varsa hizmetinizdeyiz.\n\n👤 Telegram Desteği: @mDaltoon\n\nAktif yanıt: 24/7",
    initialSetup: "Daltoon Bot İlk Kurulumu",
    developedBy: "mDaltoon tarafından geliştirildi",
    haveBackup: "Veritabanı yedeğiniz var mı?",
    backupDesc: "Daha önceden alınmış bir yedek dosyanız (JSON) varsa, tüm ayarlarınızı hemen geri yüklemek için yükleyin.",
    selectBackup: "📁 Yedek JSON Seç ve Geri Yükle",
    backupSuccess: "✅ Yedek başarıyla geri yüklendi! Kontrol paneli yeniden yükleniyor...",
    backupError: "Yedek geri yüklenirken hata oluştu",
    botNickname: "Bot/Mağaza Takma Adı",
    nicknamePlaceholder: "örn. My Proxy Store",
    nicknameDesc: "Bu isim Daltoon yerine karşılama mesajlarında kullanılacaktır.",
    botToken: "Telegram Bot Belirteci",
    tokenDesc: "Belirtecinizi @BotFather adresinden alın.",
    ownerId: "Sahip Sayısal Kimliği",
    ownerPlaceholder: "Yalnızca sayılar",
    ownerDesc: "Sayısal kimliğinizi Telegram'da @infouserbot adresinden alabilirsiniz.",
    currencyLabel: "Currency",
    currencyPlaceholder: "e.g. Toman",
    currencyDesc: "The currency shown in invoices and wallet inside the bot.",
    receiptBotTokenLabel: "Receipt Verification Bot Token (Optional)",
    receiptBotTokenPlaceholder: "1234567890:AAH...",
    receiptBotTokenDesc: "If set, payment receipt verification messages will be sent to this secondary bot.",
    verifying: "Telegram Bot Belirteci Doğrulanıyor...",
    saveAndEnter: "Kaydet ve Panele Gir"
  },
  es: {
    fillFields: "Por favor complete todos los campos.",
    ownerNumber: "El ID del propietario debe ser un número.",
    tokenInvalid: "❌ El token ingresado no es válido o ha expirado. Telegram informó: ",
    guidesText: "Guías de conexión...",
    guidesBtn: "💡 Guías de Conexión",
    welcomeText: "<b>🛍️ ¡Bienvenido a la tienda {nickname}!</b>\n\nObtenga los mejores y más confiables planes y suscripciones con entrega instantánea.\n\n🆔 Su ID de Telegram: <code>{tg_id}</code>\n💰 Saldo de la billetera: <code>{wallet_balance}</code>\n\n👇 Por favor seleccione su opción deseada del menú inferior:",
    supportText: "📞 <b>Soporte para {nickname}:</b>\n\nEstimado cliente, si tiene alguna pregunta, estamos a su servicio.\n\n👤 Soporte de Telegram: @mDaltoon\n\nRespuesta activa: 24/7",
    initialSetup: "Configuración Inicial de Daltoon Bot",
    developedBy: "Desarrollado por mDaltoon",
    haveBackup: "¿Tiene una copia de seguridad?",
    backupDesc: "Si tiene un archivo de copia de seguridad previo (JSON), cárguelo para restaurar su configuración inmediatamente.",
    selectBackup: "📁 Seleccionar y Restaurar Copia de Seguridad JSON",
    backupSuccess: "✅ ¡Copia de seguridad restaurada con éxito! Recargando el tablero...",
    backupError: "Error al restaurar la copia de seguridad",
    botNickname: "Nombre de la tienda/bot",
    nicknamePlaceholder: "ej. Mi Tienda Proxy",
    nicknameDesc: "Este nombre se colocará en los mensajes de bienvenida en lugar de Daltoon.",
    botToken: "Token de Telegram Bot",
    tokenDesc: "Obtenga su token de @BotFather.",
    ownerId: "ID Numérico del Propietario",
    ownerPlaceholder: "Solo números",
    ownerDesc: "Puede obtener su ID numérico de @infouserbot en Telegram.",
    currencyLabel: "Currency",
    currencyPlaceholder: "e.g. Toman",
    currencyDesc: "The currency shown in invoices and wallet inside the bot.",
    receiptBotTokenLabel: "Receipt Verification Bot Token (Optional)",
    receiptBotTokenPlaceholder: "1234567890:AAH...",
    receiptBotTokenDesc: "If set, payment receipt verification messages will be sent to this secondary bot.",
    verifying: "Verificando el Token del Bot...",
    saveAndEnter: "Guardar y Entrar al Tablero"
  }
};

interface SetupModalProps {
  lang: Language;
  onComplete: (settingsUpdate: Partial<PanelSettings>) => void;
}

export default function SetupModal({ lang, onComplete }: SetupModalProps) {
  const [nickname, setNickname] = useState(() => sessionStorage.getItem("setup_nickname") || "");
  const [botToken, setBotToken] = useState(() => sessionStorage.getItem("setup_botToken") || "");
  const [ownerId, setOwnerId] = useState(() => sessionStorage.getItem("setup_ownerId") || "");
  const [currency, setCurrency] = useState(() => sessionStorage.getItem("setup_currency") || "تومان");
  const [receiptBotToken, setReceiptBotToken] = useState(() => sessionStorage.getItem("setup_receiptBotToken") || "");
  const [error, setError] = useState<string | null>(null);
  const [isValidating, setIsValidating] = useState(false);

  useEffect(() => {
    sessionStorage.setItem("setup_nickname", nickname);
  }, [nickname]);

  useEffect(() => {
    sessionStorage.setItem("setup_botToken", botToken);
  }, [botToken]);

  useEffect(() => {
    sessionStorage.setItem("setup_ownerId", ownerId);
  }, [ownerId]);

  useEffect(() => {
    sessionStorage.setItem("setup_currency", currency);
  }, [currency]);

  useEffect(() => {
    sessionStorage.setItem("setup_receiptBotToken", receiptBotToken);
  }, [receiptBotToken]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const st = sTrans[lang] || sTrans.en;

    if (!nickname.trim() || !botToken.trim() || !ownerId.trim()) {
      setError(st.fillFields);
      return;
    }
    
    if (isNaN(Number(ownerId))) {
      setError(st.ownerNumber);
      return;
    }

    setIsValidating(true);
    setError(null);

    try {
      const response = await fetch("/api/bot/validate-token", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token: botToken.trim() })
      });
      const data = await response.json();
      
      if (!data.success) {
        setError(`${st.tokenInvalid}${data.error}`);
        setIsValidating(false);
        return;
      }
    } catch (err: any) {
      console.warn("Base validation connection issue:", err.message);
    }

    setIsValidating(false);
    
    sessionStorage.removeItem("setup_nickname");
    sessionStorage.removeItem("setup_botToken");
    sessionStorage.removeItem("setup_ownerId");
    sessionStorage.removeItem("setup_currency");
    sessionStorage.removeItem("setup_receiptBotToken");

    const guidesTextDefault = st.guidesText;

    const defaultWelcomeText = st.welcomeText.replace("{nickname}", nickname.trim());

    const defaultSupportText = st.supportText.replace("{nickname}", nickname.trim());

    onComplete({
      botToken: botToken.trim(),
      botNickname: nickname.trim(),
      ownerId: Number(ownerId.trim()),
      currency: currency.trim() || "تومان",
      receiptBotToken: receiptBotToken.trim() || undefined,
      welcomeText: defaultWelcomeText,
      supportText: defaultSupportText,
      btnTextGuides: st.guidesBtn,
      guidesText: guidesTextDefault,
      isFreeTestActive: false,
      hideBtnFreeTest: true,
      hideBtnAiChat: true,
      hideBtnColleagues: true,
      hideBtnReferral: true,
      hideBtnFeedback: true,
      hideBtnTicketSupport: true,
      hideBtnInstantSupport: true,
      hideBtnSupport: true,
      hideBtnBuyNew: true,
      hideBtnMySubs: true,
      hideBtnGuides: true,
      hideBtnProfile: true,
      hideBtnWallet: true,
      
      hideSupport: false, 
      hideBuy: false, 
      hideProfile: false, 
      hideWallet: true,
      admins: [
        {
          id: Math.random().toString(36).substring(2, 9),
          userId: Number(ownerId.trim()),
          username: "Owner",
          role: "super_admin",
          createdAt: new Date().toISOString()
        }
      ]
    });
  };

  const st = sTrans[lang] || sTrans.en;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-[100] flex items-center justify-center p-4">
      <div className="bg-[#0f172a] border border-[#1e293b] rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden animate-fade-in animate-duration-300">
        <div className="bg-gradient-to-r from-indigo-500/10 to-transparent p-6 border-b border-[#1e293b]">
          <div className="flex items-center gap-3">
            <div className="bg-indigo-500/20 p-3 rounded-xl border border-indigo-500/30">
              <UserCog className="w-6 h-6 text-indigo-400" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white mb-1">
                {st.initialSetup}
              </h2>
              <p className="text-xs text-indigo-300/80 font-medium font-sans">
                {st.developedBy}
              </p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {error && (
            <div className="bg-rose-500/10 border border-rose-500/20 text-rose-400 px-4 py-3 rounded-xl text-xs md:text-sm font-medium leading-relaxed font-sans">
              {error}
            </div>
          )}

          {/* Backup Restore Option */}
          <div className="bg-emerald-500/5 border border-emerald-500/20 rounded-xl p-4">
            <h3 className="text-xs font-bold text-emerald-400 mb-1 flex items-center gap-1.5">
              📥 {st.haveBackup}
            </h3>
            <p className="text-[11px] text-gray-400 mb-3 leading-relaxed">
              {st.backupDesc}
            </p>
            <label className="flex items-center justify-center gap-2 bg-emerald-500/10 hover:bg-emerald-500/25 text-emerald-300 py-2.5 px-4 rounded-lg border border-emerald-500/30 transition-all text-xs font-semibold cursor-pointer w-full text-center">
              <span>{st.selectBackup}</span>
              <input
                type="file"
                accept="*/*"
                className="hidden"
                disabled={isValidating}
                onChange={async (e) => {
                  const file = e.target.files?.[0];
                  if (!file) return;
                  
                  setIsValidating(true);
                  setError(null);
                  
                  const reader = new FileReader();
                  reader.onload = async (ev) => {
                    const content = ev.target?.result;
                    if (typeof content === 'string') {
                      try {
                        const fb = await fetch("/api/backup-restore", {
                          method: "POST",
                          headers: { "Content-Type": "application/json" },
                          body: JSON.stringify({ backupData: content })
                        });
                        const rJson = await fb.json();
                        if (rJson.success) {
                          setError(st.backupSuccess);
                          setTimeout(() => window.location.reload(), 2000);
                        } else {
                          setError(rJson.error || st.backupError);
                          setIsValidating(false);
                        }
                      } catch(er: any) {
                        setError(er.message);
                        setIsValidating(false);
                      }
                    } else {
                      setIsValidating(false);
                    }
                  }
                  reader.readAsText(file);
                }}
              />
            </label>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1.5 flex items-center gap-2">
                <User className="w-4 h-4 text-indigo-400" />
                {st.botNickname} <span className="text-rose-400">*</span>
              </label>
              <input
                type="text"
                value={nickname}
                disabled={isValidating}
                onChange={e => setNickname(e.target.value)}
                placeholder={st.nicknamePlaceholder}
                className="w-full bg-[#1b2230] border border-gray-700/80 rounded-xl px-4 py-3 text-sm text-white focus:ring-2 focus:ring-indigo-500/50 outline-none transition-all placeholder:text-gray-600 disabled:opacity-50"
              />
              <p className="text-xs text-gray-500 mt-1.5 font-sans">
                {st.nicknameDesc}
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1.5 flex items-center gap-2">
                <Bot className="w-4 h-4 text-emerald-400" />
                {st.botToken} <span className="text-rose-400">*</span>
              </label>
              <input
                type="text"
                value={botToken}
                disabled={isValidating}
                onChange={e => setBotToken(e.target.value)}
                placeholder="1234567890:AAH..."
                className="w-full bg-[#1b2230] border border-gray-700/80 rounded-xl px-4 py-3 text-sm text-white focus:ring-2 focus:ring-indigo-500/50 outline-none transition-all font-mono placeholder:text-gray-600 disabled:opacity-50"
                dir="ltr"
              />
              <p className="text-[11px] text-emerald-400/80 mt-1.5 flex items-center gap-1 font-sans">
                <Info className="w-3 h-3" />
                {st.tokenDesc}
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1.5 flex items-center gap-2">
                <Key className="w-4 h-4 text-amber-400" />
                {st.ownerId} <span className="text-rose-400">*</span>
              </label>
              <input
                type="text"
                value={ownerId}
                disabled={isValidating}
                onChange={e => setOwnerId(e.target.value)}
                placeholder={st.ownerPlaceholder}
                className="w-full bg-[#1b2230] border border-gray-700/80 rounded-xl px-4 py-3 text-sm text-white focus:ring-2 focus:ring-indigo-500/50 outline-none transition-all font-mono placeholder:text-gray-600 disabled:opacity-50"
                dir="ltr"
              />
              <p className="mt-1.5 text-xs text-indigo-300 font-medium flex items-center gap-1 font-sans">
                <Info className="w-3 h-3" />
                {st.ownerDesc}
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1.5 flex items-center gap-2">
                <Coins className="w-4 h-4 text-cyan-400" />
                {st.currencyLabel} <span className="text-rose-400">*</span>
              </label>
              <input
                type="text"
                value={currency}
                disabled={isValidating}
                onChange={e => setCurrency(e.target.value)}
                placeholder={st.currencyPlaceholder}
                className="w-full bg-[#1b2230] border border-gray-700/80 rounded-xl px-4 py-3 text-sm text-white focus:ring-2 focus:ring-indigo-500/50 outline-none transition-all placeholder:text-gray-600 disabled:opacity-50"
              />
              <p className="mt-1.5 text-xs text-gray-500 font-sans">
                {st.currencyDesc}
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1.5 flex items-center gap-2">
                <Bot className="w-4 h-4 text-teal-400" />
                {st.receiptBotTokenLabel}
              </label>
              <input
                type="text"
                value={receiptBotToken}
                disabled={isValidating}
                onChange={e => setReceiptBotToken(e.target.value)}
                placeholder={st.receiptBotTokenPlaceholder}
                className="w-full bg-[#1b2230] border border-gray-700/80 rounded-xl px-4 py-3 text-sm text-white focus:ring-2 focus:ring-indigo-500/50 outline-none transition-all font-mono placeholder:text-gray-600 disabled:opacity-50"
                dir="ltr"
              />
              <p className="mt-1.5 text-xs text-gray-500 font-sans">
                {st.receiptBotTokenDesc}
              </p>
            </div>
          </div>

          <button
            type="submit"
            disabled={isValidating}
            className="w-full bg-indigo-600 hover:bg-indigo-500 disabled:bg-indigo-700 disabled:text-gray-300 text-white font-medium py-3.5 rounded-xl transition-all shadow-lg flex items-center justify-center gap-2 mt-4 cursor-pointer disabled:cursor-not-allowed"
          >
            {isValidating ? (
              <span className="font-sans">{st.verifying}</span>
            ) : (
              <span className="flex items-center gap-2 font-sans justify-center w-full">
                {st.saveAndEnter}
                <ArrowRight className="w-5 h-5 rtl:hidden" />
                <ArrowRight className="w-5 h-5 hidden rtl:block rotate-180" />
              </span>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
