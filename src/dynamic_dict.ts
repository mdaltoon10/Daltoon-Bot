import { Language } from './lang/locales';

export const dynamicDictionary: Record<string, Partial<Record<Language, string>>> = {
  "Server": {
    "fa": "سرور",
    "ar": "خادم",
    "ru": "Сервер",
    "tr": "Sunucu",
    "es": "Servidor"
  },
  "Traffic": {
    "fa": "حجم درخواستی",
    "ar": "حركة المرور",
    "ru": "Трафик",
    "tr": "Trafik",
    "es": "Tráfico"
  },
  "GB": {
    "fa": "گیگابایت",
    "ar": "جيجابايت",
    "ru": "ГБ",
    "tr": "GB",
    "es": "GB"
  },
  "Duration": {
    "fa": "مدت زمان",
    "ar": "المدة",
    "ru": "Срок",
    "tr": "Süre",
    "es": "Duración"
  },
  "Total Price": {
    "fa": "جمع کل",
    "ar": "السعر الإجمالي",
    "ru": "Итоговая цена",
    "tr": "Toplam Fiyat",
    "es": "Precio Total"
  },
  "Service Username": {
    "fa": "نام کاربری سرویس",
    "ar": "اسم مستخدم الخدمة",
    "ru": "Имя пользователя службы",
    "tr": "Servis Kullanıcı Adı",
    "es": "Nombre de usuario del servicio"
  },
  "Plisio Secret Key (API)": {
    "fa": "کد امنیتی Plisio (API Key)",
    "ar": "مفتاح Plisio السري (API)",
    "ru": "Секретный ключ Plisio (API)",
    "tr": "Plisio Gizli Anahtarı (API)",
    "es": "Clave secreta de Plisio (API)"
},
  "Price per GB": {
    "fa": "هزینه هر گیگابایت",
    "ar": "سعر الجيجابايت",
    "ru": "Цена за ГБ",
    "tr": "GB başına fiyat",
    "es": "Precio por GB"
  },
  "Price per Day": {
    "fa": "هزینه هر روز",
    "ar": "السعر لليوم",
    "ru": "Цена в день",
    "tr": "Günlük fiyat",
    "es": "Precio por día"
  },
  "Selected Volume": {
    "fa": "حجم انتخابی",
    "ar": "الترافيك المحدد",
    "ru": "Выбранный объем",
    "tr": "Seçilen Hacim",
    "es": "Volumen seleccionado"
  },
  "Please enter duration in Days": {
    "fa": "لطفاً تعداد روزهای فعال بودن اشتراک را به روز (Days) وارد کنید",
    "ar": "يرجى إدخال المدة بالأيام",
    "ru": "Пожалуйста, введите продолжительность в днях",
    "tr": "Lütfen süreyi Gün olarak girin",
    "es": "Por favor ingrese la duración en días"
  },
  "Value must be a positive number (e.g. 30)": {
    "fa": "عدد ارسال شده باید یک عدد انگلیسی مثبت باشد (مثلاً ۳۰)",
    "ar": "يجب أن تكون القيمة عددًا إيجابيًا (مثل 30)",
    "ru": "Значение должно быть положительным числом (например, 30)",
    "tr": "Değer pozitif bir sayı olmalıdır (örn. 30)",
    "es": "El valor debe ser un número positivo (ej. 30)"
  },
  "Custom Config Pre-Invoice": {
    "fa": "پیش‌فاکتور ساخت کانفیگ دلخواه",
    "ar": "فاتورة التكوين المخصص",
    "ru": "Предварительный счет для настройки",
    "tr": "Özel Yapılandırma Ön Faturası",
    "es": "Pre-factura de Configuración Personalizada"
  },
  "The creation fee will be deducted directly from your wallet balance.": {
    "fa": "هزینه ساخت مستقیماً از موجودی کیف پول شما کسر خواهد شد.",
    "ar": "سيتم خصم رسوم الإنشاء مباشرة من رصيد محفظتك.",
    "ru": "Плата за создание будет списана непосредственно с баланса вашего кошелька.",
    "tr": "Kurulum ücreti doğrudan cüzdan bakiyenizden düşülecektir.",
    "es": "La tarifa de creación se deducirá directamente del saldo de su billetera."
  },
  "Renewal Pre-Invoice": {
    "fa": "پیش‌فاکتور تمدید و ارتقای اشتراک",
    "ar": "فاتورة التجديد والترقية",
    "ru": "Предварительный счет на продление",
    "tr": "Yenileme Ön Faturası",
    "es": "Pre-factura de Renovación"
  },
  "Extra Volume": {
    "fa": "حجم ترافیک اضافی",
    "ar": "الترافيك الإضافي",
    "ru": "Дополнительный объем",
    "tr": "Ek Hacim",
    "es": "Volumen adicional"
  },
  "Extra Duration": {
    "fa": "مدت زمان تمدید",
    "ar": "مدة التجديد",
    "ru": "Дополнительный срок",
    "tr": "Ek Süre",
    "es": "Duración adicional"
  },
  "Please select your payment method below:": {
    "fa": "لطفا یکی از روش‌های پرداخت زیر را جهت تمدید فوری انتخاب نمایید:",
    "ar": "يرجى اختيار طريقة الدفع أدناه:",
    "ru": "Пожалуйста, выберите способ оплаты ниже:",
    "tr": "Lütfen aşağıdan ödeme yönteminizi seçin:",
    "es": "Por favor seleccione su método de pago a continuación:"
  },
  "Custom Config ": {
    "fa": "کانفیگ دلخواه ",
    "ar": "تكوين مخصص ",
    "ru": "Настройка ",
    "tr": "Özel Yapılandırma ",
    "es": "Configuración personalizada "
  },
  "Invites:": {
    "fa": "دعوت:",
    "ar": "الدعوات:",
    "ru": "Приглашения:",
    "tr": "Davetler:",
    "es": "Invitaciones:"
},
  "Earned:": {
    "fa": "درآمد:",
    "ar": "المكتسب:",
    "ru": "Заработано:",
    "tr": "Kazanılan:",
    "es": "Ganado:"
},

  "Financial Codes & Referrals Manager": {
    "fa": "🎟️ مدیریت هوشمند کدهای مالی و معرف",
    "ar": "إدارة الرموز المالية والإحالات",
    "ru": "Управление финансовыми кодами и рефералами",
    "tr": "Finansal Kodlar ve Referanslar Yöneticisi",
    "es": "Gestor de códigos financieros y referidos"
},
  "Edit gift balances, percentage discounts, and reward triggers": {
    "fa": "ساخت و ویرایش کدهای افزایش شارژ مستقیم هدیه، درصدهای تخفیف و سیستم معرف",
    "ar": "تحرير أرصدة الهدايا، الخصومات المئوية، ومحفزات المكافآت",
    "ru": "Редактирование балансов подарков, процентных скидок и триггеров наград",
    "tr": "Hediye bakiyelerini, yüzde indirimlerini ve ödül tetikleyicilerini düzenle",
    "es": "Editar saldos de regalos, descuentos porcentuales y disparadores de recompensas"
},
  "Gift Cards": {
    "fa": "🎁 کدهای هدیه (افزایش اعتبار)",
    "ar": "بطاقات الهدايا",
    "ru": "Подарочные карты",
    "tr": "Hediye Kartları",
    "es": "Tarjetas de regalo"
},
  "Promo Codes": {
    "fa": "🎟️ کدهای تخفیف (درصدی و تمدید)",
    "ar": "الرموز الترويجية",
    "ru": "Промокоды",
    "tr": "Promosyon Kodları",
    "es": "Códigos promocionales"
},
  "Referrals": {
    "fa": "👥 سیستم زیرمجموعه‌گیری",
    "ar": "الإحالات",
    "ru": "Рефералы",
    "tr": "Referanslar",
    "es": "Referidos"
},
  "Add New Gift Code": {
    "fa": "افزودن کد هدیه جدید",
    "ar": "إضافة رمز هدية جديد",
    "ru": "Добавить новый подарочный код",
    "tr": "Yeni Hediye Kodu Ekle",
    "es": "Agregar nuevo código de regalo"
},
  "Gift Code": {
    "fa": "کد هدیه",
    "ar": "رمز الهدية",
    "ru": "Подарочный код",
    "tr": "Hediye Kodu",
    "es": "Código de regalo"
},
  "Amount (${currency})": {
    "fa": "مبلغ (${currency})",
    "ar": "المبلغ (${currency})",
    "ru": "Сумма (${currency})",
    "tr": "Tutar (${currency})",
    "es": "Cantidad (${currency})"
},
  "Max Usage": {
    "fa": "تعداد مجاز استفاده",
    "ar": "الحد الأقصى للاستخدام",
    "ru": "Макс. использований",
    "tr": "Maksimum Kullanım",
    "es": "Uso máximo"
},
  "Code Validity (Days)": {
    "fa": "مدت اعتبار کد (تعداد روز)",
    "ar": "صلاحية الرمز (بالأيام)",
    "ru": "Срок действия кода (в днях)",
    "tr": "Kod Geçerliliği (Gün)",
    "es": "Validez del código (días)"
},
  "e.g. 1 day. Expire after 1 day from creation.": {
    "fa": "مثلاً ۱ روز؛ پس از گذشت ۱ روز از ساخت، کد هدیه منقضی و غیرقابل استفاده می‌شود.",
    "ar": "مثال 1 يوم. تنتهي الصلاحية بعد يوم واحد من الإنشاء.",
    "ru": "напр. 1 день. Истекает через 1 день после создания.",
    "tr": "Örn. 1 gün. Oluşturulduktan 1 gün sonra sona erer.",
    "es": "Ej. 1 día. Expira 1 día después de su creación."
},
  "Create Code": {
    "fa": "ایجاد کد هدیه",
    "ar": "إنشاء الرمز",
    "ru": "Создать код",
    "tr": "Kod Oluştur",
    "es": "Crear código"
},
  "Registered Gift Codes": {
    "fa": "کدهای هدیه فعال ثبت شده",
    "ar": "رموز الهدايا المسجلة",
    "ru": "Зарегистрированные подарочные коды",
    "tr": "Kayıtlı Hediye Kodları",
    "es": "Códigos de regalo registrados"
},
  "Create New Discount Code": {
    "fa": "ثبت کد تخفیف جدید",
    "ar": "إنشاء رمز خصم جديد",
    "ru": "Создать новый код скидки",
    "tr": "Yeni İndirim Kodu Oluştur",
    "es": "Crear nuevo código de descuento"
},
  "🏷️ Promo Code": {
    "fa": "🏷️ کد تخفیف",
    "ar": "الرمز الترويجي",
    "ru": "Промокод",
    "tr": "Promosyon Kodu",
    "es": "Código promocional"
},
  "⚙️ Code Type": {
    "fa": "⚙️ نوع کد",
    "ar": "نوع الرمز",
    "ru": "Тип кода",
    "tr": "Kod Türü",
    "es": "Tipo de código"
},
  "Percentage (%)": {
    "fa": "درصدی (%)",
    "ar": "نسبة مئوية (%)",
    "ru": "Процент (%)",
    "tr": "Yüzde (%)",
    "es": "Porcentaje (%)"
},
  "Extension (Days)": {
    "fa": "تمدید (روز)",
    "ar": "تمديد (بالأيام)",
    "ru": "Продление (дни)",
    "tr": "Uzatma (Gün)",
    "es": "Extensión (Días)"
},
  "Discount %": {
    "fa": "📈 درصد تخفیف",
    "ar": "نسبة الخصم %",
    "ru": "Скидка %",
    "tr": "İndirim %",
    "es": "Descuento %"
},
  "Discount Amount": {
    "fa": "💰 مبلغ تخفیف",
    "ar": "مبلغ الخصم",
    "ru": "Сумма скидки",
    "tr": "İndirim Tutarı",
    "es": "Monto de descuento"
},
  "Extend Days": {
    "fa": "📅 تعداد روز",
    "ar": "أيام التمديد",
    "ru": "Дни продления",
    "tr": "Gün Uzat",
    "es": "Días de extensión"
},
  "🧮 Smart Value Calculator": {
    "fa": "🧮 محاسبه‌گر هوشمند ارزش نهایی",
    "ar": "حاسبة القيمة الذكية",
    "ru": "Умный калькулятор стоимости",
    "tr": "Akıllı Değer Hesaplayıcı",
    "es": "Calculadora de valor inteligente"
},
  "Test Base Amount (TOM):": {
    "fa": "مبلغ پایه جهت تست محاسبات (تومان):",
    "ar": "المبلغ الأساسي للاختبار:",
    "ru": "Базовая сумма для проверки:",
    "tr": "Test Taban Tutarı:",
    "es": "Monto base de prueba:"
},
  "Client Profit": {
    "fa": "سود مشتری",
    "ar": "ربح العميل",
    "ru": "Выгода клиента",
    "tr": "Müşteri Karı",
    "es": "Beneficio del cliente"
},
  "Final Price": {
    "fa": "پرداختی نهایی",
    "ar": "السعر النهائي",
    "ru": "Итоговая цена",
    "tr": "Son Fiyat",
    "es": "Precio final"
},
  "👥 Limit Users Count": {
    "fa": "👥 حداکثر استفاده مجاز",
    "ar": "حد عدد المستخدمين",
    "ru": "Ограничение количества пользователей",
    "tr": "Kullanıcı Sayısını Sınırla",
    "es": "Límite de usuarios"
},
  "⏳ Code Validity (Days)": {
    "fa": "⏳ مدت اعتبار کد (تعداد روز)",
    "ar": "صلاحية الرمز (بالأيام)",
    "ru": "Срок действия кода (в днях)",
    "tr": "Kod Geçerliliği (Gün)",
    "es": "Validez del código (días)"
},
  "Generate Promo Code": {
    "fa": "ایجاد و ذخیره کد تخفیف",
    "ar": "إنشاء الرمز الترويجي",
    "ru": "Сгенерировать промокод",
    "tr": "Promosyon Kodu Oluştur",
    "es": "Generar código promocional"
},
  "✅ Discount code registered!": {
    "fa": "✅ کد تخفیف با موفقیت ثبت شد!",
    "ar": "تم تسجيل رمز الخصم بنجاح!",
    "ru": "Код скидки успешно зарегистрирован!",
    "tr": "İndirim kodu başarıyla kaydedildi!",
    "es": "¡Código de descuento registrado!"
},
  "Active Promo Codes": {
    "fa": "لیست کدهای تخفیف و تمدید فعال",
    "ar": "الرموز الترويجية النشطة",
    "ru": "Активные промокоды",
    "tr": "Aktif Promosyon Kodları",
    "es": "Códigos promocionales activos"
},
  "No promo codes active.": {
    "fa": "هیچ کد تخفیف یا تمدیدی در سیستم ثبت نشده است.",
    "ar": "لا توجد رموز ترويجية نشطة.",
    "ru": "Нет активных промокодов.",
    "tr": "Aktif promosyon kodu yok.",
    "es": "No hay códigos promocionales activos."
},
  "% Discount": {
    "fa": "٪ تخفیف",
    "ar": "% خصم",
    "ru": "% Скидка",
    "tr": "% İndirim",
    "es": "% Descuento"
},
  "Discount": {
    "fa": "تخفیف",
    "ar": "خصم",
    "ru": "Скидка",
    "tr": "İndirim",
    "es": "Descuento"
},
  "days extension": {
    "fa": "روز تمدید رایگان",
    "ar": "أيام التمديد",
    "ru": "дней продления",
    "tr": "gün uzatma",
    "es": "días de extensión"
},
  "Used:": {
    "fa": "دفعات استفاده:",
    "ar": "المستخدم:",
    "ru": "Использовано:",
    "tr": "Kullanılan:",
    "es": "Usado:"
},
  "Validity:": {
    "fa": "اعتبار منقضی:",
    "ar": "الصلاحية:",
    "ru": "Срок действия:",
    "tr": "Geçerlilik:",
    "es": "Validez:"
},
  "Bot Telegram Username (No @)": {
    "fa": "آیدی ربات شما (بدون @)",
    "ar": "اسم مستخدم بوت تليجرام (بدون @)",
    "ru": "Имя пользователя Telegram бота (без @)",
    "tr": "Bot Telegram Kullanıcı Adı (@ olmadan)",
    "es": "Usuario de Telegram del bot (Sin @)"
},
  "Reward Condition": {
    "fa": "زمان پاداش‌دهی (تب انتخاب)",
    "ar": "شرط المكافأة",
    "ru": "Условие награды",
    "tr": "Ödül Şartı",
    "es": "Condición de recompensa"
},
  "On Invite Only": {
    "fa": "فقط هنگام ورود (Invite)",
    "ar": "عند الدعوة فقط",
    "ru": "Только при приглашении",
    "tr": "Sadece Davette",
    "es": "Solo al invitar"
},
  "On Purchase Only": {
    "fa": "فقط هنگام خرید (Purchase)",
    "ar": "عند الشراء فقط",
    "ru": "Только при покупке",
    "tr": "Sadece Satın Almada",
    "es": "Solo en compras"
},
  "Both": {
    "fa": "هر دو (هم ورود هم خرید)",
    "ar": "كلاهما",
    "ru": "Оба варианта",
    "tr": "Her İkisi",
    "es": "Ambos"
},
  "Reward Percentage per Invite": {
    "fa": "درصد پاداش به ازای دعوت (%)",
    "ar": "نسبة المكافأة لكل دعوة",
    "ru": "Процент награды за приглашение",
    "tr": "Davet Başına Ödül Yüzdesi",
    "es": "Porcentaje de recompensa por invitación"
},
  "Reward Percentage per Purchase": {
    "fa": "درصد پاداش به ازای خرید زیرمجموعه (%)",
    "ar": "نسبة المكافأة لكل عملية شراء",
    "ru": "Процент награды за покупку",
    "tr": "Satın Alma Başına Ödül Yüzdesi",
    "es": "Porcentaje de recompensa por compra"
},
  "Level 2 Reward Percentage": {
    "fa": "درصد پاداش لایه دوم (تیم)",
    "ar": "نسبة مكافأة المستوى 2",
    "ru": "Процент награды 2-го уровня",
    "tr": "Seviye 2 Ödül Yüzdesi",
    "es": "Porcentaje de recompensa Nivel 2"
},
  "Level 3 Reward Percentage": {
    "fa": "درصد پاداش لایه سوم (تیم)",
    "ar": "نسبة مكافأة المستوى 3",
    "ru": "Процент награды 3-го уровня",
    "tr": "Seviye 3 Ödül Yüzdesi",
    "es": "Porcentaje de recompensa Nivel 3"
},
  "Level 4 Reward Percentage": {
    "fa": "درصد پاداش لایه چهارم (تیم)",
    "ar": "نسبة مكافأة المستوى 4",
    "ru": "Процент награды 4-го уровня",
    "tr": "Seviye 4 Ödül Yüzdesi",
    "es": "Porcentaje de recompensa Nivel 4"
},
  "Base Calculation Amount": {
    "fa": "مبلغ پایه محاسبه (تومان)",
    "ar": "مبلغ الحساب الأساسي",
    "ru": "Базовая сумма для расчета",
    "tr": "Temel Hesaplama Tutarı",
    "es": "Monto base de cálculo"
},
  "Reward per Invite:": {
    "fa": "محاسبه پاداش مشتری به ازای هر دعوت جدید:",
    "ar": "المكافأة لكل دعوة:",
    "ru": "Награда за приглашение:",
    "tr": "Davet Başına Ödül:",
    "es": "Recompensa por invitación:"
},
  "${currency}": {
    "fa": "${currency} پاداش",
    "ar": "${currency}",
    "ru": "${currency}",
    "tr": "${currency}",
    "es": "${currency}"
},
  "Referral Message Content": {
    "fa": "متن پیام مجموعه گیری اختصاصی کاربر",
    "ar": "محتوى رسالة الإحالة",
    "ru": "Текст сообщения для рефералов",
    "tr": "Referans Mesajı İçeriği",
    "es": "Contenido del mensaje de referido"
},
  "Vars: {uid}, {link}, {amount}, {percent}, {purchase_percent}, {reward}, {invited}, {total_earned}": {
    "fa": "متغیرها: {uid}, {link}, {amount}, {percent}, {purchase_percent}, {reward}, {invited}, {total_earned}",
    "ar": "المتغيرات: {uid}, {link}, {amount}, {percent}, {purchase_percent}, {reward}, {invited}, {total_earned}",
    "ru": "Переменные: {uid}, {link}, {amount}, {percent}, {purchase_percent}, {reward}, {invited}, {total_earned}",
    "tr": "Değişkenler: {uid}, {link}, {amount}, {percent}, {purchase_percent}, {reward}, {invited}, {total_earned}",
    "es": "Variables: {uid}, {link}, {amount}, {percent}, {purchase_percent}, {reward}, {invited}, {total_earned}"
},
  "Enter your text here...": {
    "fa": "متن خود را اینجا وارد کنید...",
    "ar": "أدخل النص الخاص بك هنا...",
    "ru": "Введите ваш текст здесь...",
    "tr": "Metninizi buraya girin...",
    "es": "Ingrese su texto aquí..."
},
  "✅ Referral settings saved!": {
    "fa": "✅ تغییرات سیستم معرف با موفقیت ذخیره شد!",
    "ar": "تم حفظ إعدادات الإحالة بنجاح!",
    "ru": "Настройки рефералов успешно сохранены!",
    "tr": "Referans ayarları kaydedildi!",
    "es": "¡Configuración de referidos guardada!"
},
  "Professional Ticketing & Support": {
    "fa": "🎟️ سیستم تخصصی تیکت و پشتیبانی",
    "ar": "نظام الدعم الفني والتذاكر الاحترافي",
    "ru": "Профессиональная система тикетов и поддержки",
    "tr": "Profesyonel Destek ve Biletleme",
    "es": "Soporte y tickets profesionales"
},
  "Inbound Support Tickets": {
    "fa": "لیست تیکت‌های دریافتی",
    "ar": "تذاكر الدعم الواردة",
    "ru": "Входящие тикеты поддержки",
    "tr": "Gelen Destek Biletleri",
    "es": "Tickets de soporte entrantes"
},
  "Search user, subject, ID...": {
    "fa": "جستجو در شناسه، کاربر، موضوع...",
    "ar": "البحث عن مستخدم، موضوع، معرف...",
    "ru": "Поиск пользователя, темы, ID...",
    "tr": "Kullanıcı, konu, ID ara...",
    "es": "Buscar usuario, asunto, ID..."
},
  "All": {
    "fa": "همه",
    "ar": "الكل",
    "ru": "Все",
    "tr": "Tümü",
    "es": "Todos"
},
  "Open": {
    "fa": "باز",
    "ar": "مفتوح",
    "ru": "Открыт",
    "tr": "Açık",
    "es": "Abierto"
},
  "Reply": {
    "fa": "پاسخ",
    "ar": "رد",
    "ru": "Ответ",
    "tr": "Yanıtla",
    "es": "Responder"
},
  "No support tickets found.": {
    "fa": "هیچ تیکتی پیدا نشد.",
    "ar": "لم يتم العثور على أي تذاكر دعم.",
    "ru": "Тикеты поддержки не найдены.",
    "tr": "Destek bileti bulunamadı.",
    "es": "No se encontraron tickets de soporte."
},
  "Pending Answer": {
    "fa": "در انتظار پاسخ",
    "ar": "في انتظار الرد",
    "ru": "Ожидает ответа",
    "tr": "Yanıt Bekleniyor",
    "es": "Pendiente de respuesta"
},
  "Answered": {
    "fa": "پاسخ داده شده",
    "ar": "تم الرد",
    "ru": "Отвечен",
    "tr": "Yanıtlandı",
    "es": "Respondido"
},
  "Closed": {
    "fa": "بسته شده",
    "ar": "تم الإغلاق",
    "ru": "Закрыт",
    "tr": "Kapatıldı",
    "es": "Cerrado"
},
  "Delete Ticket": {
    "fa": "حذف تیکت",
    "ar": "حذف التذكرة",
    "ru": "Удалить тикет",
    "tr": "Bileti Sil",
    "es": "Eliminar ticket"
},
  "Back to List": {
    "fa": "بازگشت به لیست",
    "ar": "العودة إلى القائمة",
    "ru": "Вернуться к списку",
    "tr": "Listeye Dön",
    "es": "Volver a la lista"
},
  "Ticket ": {
    "fa": "پرونده تیکت ",
    "ar": "تذكرة ",
    "ru": "Тикет ",
    "tr": "Bilet ",
    "es": "Ticket "
},
  "Close Ticket Chain": {
    "fa": "بستن پرونده تیکت",
    "ar": "إغلاق سلسلة التذاكر",
    "ru": "Закрыть цепочку тикетов",
    "tr": "Bilet Zincirini Kapat",
    "es": "Cerrar cadena de tickets"
},
  "Author Info:": {
    "fa": "فرستنده تیکت:",
    "ar": "معلومات الكاتب:",
    "ru": "Инфо об авторе:",
    "tr": "Yazar Bilgisi:",
    "es": "Info. del autor:"
},
  "Registered At:": {
    "fa": "تاریخ ثبت اولیه:",
    "ar": "سجلت في:",
    "ru": "Зарегистрировано:",
    "tr": "Kayıt Tarihi:",
    "es": "Registrado el:"
},
  "Support": {
    "fa": "👨‍💼 مدیریت",
    "ar": "الدعم",
    "ru": "Поддержка",
    "tr": "Destek",
    "es": "Soporte"
},
  "Customer": {
    "fa": "👤 کاربر",
    "ar": "العميل",
    "ru": "Клиент",
    "tr": "Müşteri",
    "es": "Cliente"
},
  "Type support reply text here...": {
    "fa": "پاسخ مدیریت را اینجا بنویسید...",
    "ar": "اكتب رد الدعم هنا...",
    "ru": "Введите текст ответа поддержки здесь...",
    "tr": "Destek yanıtını buraya yazın...",
    "es": "Escriba aquí la respuesta de soporte..."
},
  "Send": {
    "fa": "ارسال",
    "ar": "إرسال",
    "ru": "Отправить",
    "tr": "Gönder",
    "es": "Enviar"
},
  "Select Support Chain": {
    "fa": "مکاتبات پشتیبانی",
    "ar": "اختر سلسلة الدعم",
    "ru": "Выберите цепочку поддержки",
    "tr": "Destek Zinciri Seçin",
    "es": "Seleccionar cadena de soporte"
},
  "Confirm Ticket Deletion": {
    "fa": "تایید حذف نهایی تیکت",
    "ar": "تأكيد حذف التذكرة",
    "ru": "Подтвердите удаление тикета",
    "tr": "Bilet Silmeyi Onayla",
    "es": "Confirmar eliminación de ticket"
},

  "🔌 Colleague Servers Management": {
    "fa": "🔌 مدیریت سرورهای همکاران",
    "ar": "🔌 إدارة خوادم الزملاء",
    "ru": "🔌 Управление серверами коллег",
    "tr": "🔌 Meslektaş Sunucuları Yönetimi",
    "es": "🔌 Gestión de servidores de colegas"
},
  "🔌 X-UI Servers Management": {
    "fa": "🔌 مدیریت سرورهای X-UI",
    "ar": "🔌 إدارة خوادم X-UI",
    "ru": "🔌 Управление серверами X-UI",
    "tr": "🔌 X-UI Sunucu Yönetimi",
    "es": "🔌 Gestión de servidores X-UI"
},
  "Manage X-UI panels designated for colleague accounts subscription delivery.": {
    "fa": "پنل‌های مخصوص همکاران را برای ساخت خودکار اشتراک‌های همکار اضافه کنید.",
    "ar": "إدارة لوحات X-UI المخصصة لتسليم اشتراكات حسابات الزملاء.",
    "ru": "Управление панелями X-UI, предназначенными для доставки подписок на счета коллег.",
    "tr": "Meslektaş hesaplarına abonelik teslimatı için belirlenmiş X-UI panellerini yönetin.",
    "es": "Administre los paneles X-UI designados para la entrega de suscripciones de cuentas de colegas."
},
  "Manage your X-UI panels for automated subscription delivery.": {
    "fa": "پنل‌های خود را برای ساخت خودکار اشتراک‌ها اضافه کنید.",
    "ar": "قم بإدارة لوحات X-UI الخاصة بك لتسليم الاشتراكات تلقائيًا.",
    "ru": "Управляйте панелями X-UI для автоматической доставки подписок.",
    "tr": "Otomatik abonelik teslimatı için X-UI panellerinizi yönetin.",
    "es": "Gestione sus paneles X-UI para la entrega automatizada de suscripciones."
},
  "Groups like VIP, Standard, etc.": {
    "fa": "مجموعه‌هایی مثل VIP و Standard و غیره.",
    "ar": "مجموعات مثل VIP و Standard وما إلى ذلك.",
    "ru": "Группы типа VIP, Standard и т.д.",
    "tr": "VIP, Standart vb. gibi gruplar.",
    "es": "Grupos como VIP, Estándar, etc."
},
  "Active VPN Subscription Keys": {
    "fa": "کانفیگ‌ها و اشتراک‌های فعال VPN",
    "ar": "مفاتيح اشتراك VPN النشطة",
    "ru": "Активные ключи подписки VPN",
    "tr": "Aktif VPN Abonelik Anahtarları",
    "es": "Claves de suscripción VPN activas"
},
  "These represent the subscription links generated by the Python bot and saved in sqlite/3x-ui.": {
    "fa": "این کانفیگ‌ها مستقیماً لینک‌های تولید شده توسط ربات هستند که در دیتابیس ۳x-ui یا sqlite ذخیره شده‌اند.",
    "ar": "تمثل هذه روابط الاشتراك التي تم إنشاؤها بواسطة روبوت بايثون وتم حفظها في sqlite/3x-ui.",
    "ru": "Они представляют собой ссылки на подписки, созданные ботом Python и сохраненные в sqlite/3x-ui.",
    "tr": "Bunlar Python botu tarafından oluşturulan ve sqlite/3x-ui'de kaydedilen abonelik bağlantılarını temsil eder.",
    "es": "Estos representan los enlaces de suscripción generados por el bot de Python y guardados en sqlite/3x-ui."
},
  "Subscription Link": {
    "fa": "لینک اتصال اختصاصی",
    "ar": "رابط الاشتراك",
    "ru": "Ссылка на подписку",
    "tr": "Abonelik Bağlantısı",
    "es": "Enlace de suscripción"
},
  "Owner ID/Handle": {
    "fa": "صاحب کانفیگ (کاربر)",
    "ar": "معرف/مقبض المالك",
    "ru": "ID/Имя владельца",
    "tr": "Sahip Kimliği/Kullanıcı Adı",
    "es": "ID/Alias del propietario"
},
  "Expiry Date": {
    "fa": "تاریخ انقضا اکانت",
    "ar": "تاريخ الانتهاء",
    "ru": "Дата истечения срока",
    "tr": "Son Kullanma Tarihi",
    "es": "Fecha de caducidad"
},

  "Button text cannot be empty.": {
    "fa": "عنوان دکمه نمی‌تواند خالی باشد.",
    "ar": "لا يمكن أن يكون نص الزر فارغًا.",
    "ru": "Текст кнопки не может быть пустым.",
    "tr": "Düğme metni boş olamaz.",
    "es": "El texto del botón no puede estar vacío."
  },
  "Bot reply response text cannot be empty.": {
    "fa": "پاسخ ربات نمی‌تواند خالی باشد.",
    "ar": "لا يمكن أن يكون نص الرد على برنامج الروبوت فارغًا.",
    "ru": "Текст ответа бота не может быть пустым.",
    "tr": "Bot yanıtı yanıt metni boş olamaz.",
    "es": "El texto de respuesta del bot no puede estar vacío."
  },
  "A button with this exact label already exists.": {
    "fa": "این دکمه قبلاً ایجاد شده است.",
    "ar": "يوجد بالفعل زر يحمل هذه التسمية بالضبط.",
    "ru": "Кнопка с таким названием уже существует.",
    "tr": "Tam olarak bu etikete sahip bir düğme zaten mevcut.",
    "es": "Ya existe un botón con esta etiqueta exacta."
  },
  "Failed to sync with the database.": {
    "fa": "خطا در برقراری ارتباط با دیتابیس.",
    "ar": "فشلت المزامنة مع قاعدة البيانات.",
    "ru": "Не удалось синхронизироваться с базой данных.",
    "tr": "Veritabanıyla senkronize edilemedi.",
    "es": "No se pudo sincronizar con la base de datos."
  },
  "Network connection failed.": {
    "fa": "خطا در برقراری ارتباط با سرور.",
    "ar": "فشل الاتصال بالشبكة.",
    "ru": "Сетевое соединение не удалось.",
    "tr": "Ağ bağlantısı başarısız oldu.",
    "es": "La conexión de red falló."
  },
  "Telegram Bot Menu & Buttons Management": {
    "fa": "مدیریت دکمه‌ها و منوهای ربات تلگرام",
    "ar": "إدارة قوائم وأزرار بوت تليجرام",
    "ru": "Управление меню и кнопками бота Telegram",
    "tr": "Telegram Bot Menüsü ve Buton Yönetimi",
    "es": "Gestión de botones y menú de Telegram Bot"
  },
  "In this interface, you can manage the layout, hierarchy, and labels of the Telegram bot's main keyboard menus. You can also define automated-reply custom buttons to offer features such as free test accounts, guides, or rules.": {
    "fa": "در این پنجره می‌توانید ترتیب، چیدمان و نام تمام دکمه‌های کیبورد ربات تلگرام را ویرایش کنید. همچنین امکان ساخت دکمه‌های پاسخ خودکار جدید برای ارائه‌ی خدماتی نظیر اکانت تست یا برگه قوانین وجود دارد.",
    "ar": "في هذه الواجهة، يمكنك إدارة التخطيط والتسلسل الهرمي والتسميات لقوائم لوحة المفاتيح الرئيسية لروبوت Telegram. يمكنك أيضًا تحديد أزرار مخصصة للرد التلقائي لتقديم ميزات مثل حسابات الاختبار المجانية أو الأدلة أو القواعد.",
    "ru": "В этом интерфейсе вы можете управлять макетом, иерархией и метками основных меню клавиатуры бота Telegram. Вы также можете определить пользовательские кнопки автоматического ответа, чтобы предлагать такие функции, как бесплатные тестовые учетные записи, руководства или правила.",
    "tr": "Bu arayüzde Telegram botunun ana klavye menülerinin düzenini, hiyerarşisini ve etiketlerini yönetebilirsiniz. Ücretsiz test hesapları, kılavuzlar veya kurallar gibi özellikler sunmak için otomatik yanıt özel düğmeleri de tanımlayabilirsiniz.",
    "es": "En esta interfaz, puede administrar el diseño, la jerarquía y las etiquetas de los menús principales del teclado del bot de Telegram. También puede definir botones personalizados de respuesta automática para ofrecer funciones como cuentas de prueba gratuitas, guías o reglas."
  },
  "Primary Keyboard Layout & Labels": {
    "fa": "چیدمان و عناوین کیبورد اصلی",
    "ar": "تخطيط لوحة المفاتيح الأساسية والتسميات",
    "ru": "Основная раскладка клавиатуры и метки",
    "tr": "Birincil Klavye Düzeni ve Etiketleri",
    "es": "Diseño y etiquetas del teclado principal"
  },
  "Configure keyboard spacing structures and edit text labels.": {
    "fa": "پیکربندی چیدمان ظاهری دکمه‌ها و ویرایش برچسب‌های متنی منوی اصلی.",
    "ar": "تكوين هياكل تباعد لوحة المفاتيح وتحرير التسميات النصية.",
    "ru": "Настройте структуру интервалов между клавиатурами и отредактируйте текстовые метки.",
    "tr": "Klavye aralığı yapılarını yapılandırın ve metin etiketlerini düzenleyin.",
    "es": "Configure estructuras de espaciado del teclado y edite etiquetas de texto."
  },
  "📐 Main Keyboard Layout Type": {
    "fa": "📐 چیدمان دکمه‌های اصلی کیبورد",
    "ar": "📐 نوع تخطيط لوحة المفاتيح الرئيسية",
    "ru": "📐 Тип раскладки основной клавиатуры",
    "tr": "📐 Ana Klavye Düzeni Türü",
    "es": "📐 Tipo de distribución del teclado principal"
  },
  "Determines how the primary bot buttons stack on Telegram messenger.": {
    "fa": "نحوه‌ی نمایش و قرارگیری دکمه‌های اصلی در تلگرام را تعیین کنید.",
    "ar": "يحدد كيفية تكديس أزرار الروبوت الأساسية على Telegram messenger.",
    "ru": "Определяет, как располагаются основные кнопки бота �� мессенджере Telegram.",
    "tr": "Birincil bot düğmelerinin Telegram messenger'da nasıl yığılacağını belirler.",
    "es": "Determina cómo se apilan los botones del bot principal en Telegram Messenger."
  },
  "Stepped": {
    "fa": "پله‌ای",
    "ar": "صعدت",
    "ru": "Ступенчатый",
    "tr": "Kademeli",
    "es": "Pisó"
  },
  "Horizontal": {
    "fa": "افقی",
    "ar": "أفقي",
    "ru": "Горизонтальный",
    "tr": "Yatay",
    "es": "Horizontales"
  },
  "Vertical": {
    "fa": "عمودی",
    "ar": "عمودي",
    "ru": "Вертикальный",
    "tr": "Dikey",
    "es": "verticales"
  },
  "ℹ️ Layout Guidelines": {
    "fa": "ℹ️ راهنمای چیدمان",
    "ar": "ℹ️ إرشادات التخطيط",
    "ru": "ℹ️ Рекомендации по макету",
    "tr": "ℹ️ Yerleşim Yönergeleri",
    "es": "ℹ�� Pautas de diseño"
  },
  "• Stepped: The first key takes standard full width, other keys follow grouped in pairs (default).\n• Horizontal: Arranges all action inputs side-by-side in columns.\n• Vertical: Extends all keys across full width on separate lines.": {
    "fa": "• چیدمان پله‌ای: دکمه اول بزرگتر در ردیف بالا قرار می‌گیرد و سایر دکمه‌ها منظم در کنار هم قرار می‌گیرند (پیش‌فرض).\n• چیدمان افقی: دکمه‌ها دو به دو روبروی هم چیده می‌شوند.\n• چیدمان عمودی: هر دکمه در یک ردیف جداگانه و بزرگ نمایش داده می‌شود.",
    "ar": "• متدرج: يأخذ المفتاح الأول عرضًا قياسيًا كاملاً، وتتبعه المفاتيح الأخرى مجمعة في أزواج (افتراضي).\n• أفقي: يرتب كافة مدخلات الإجراء جنبًا إلى جنب في أعمدة.\n• عمودي: يوسع كافة المفاتيح عبر العرض الكامل على خطوط منفصلة.",
    "ru": "• Ступенчатая: первая клавиша занимает стандартную полную ширину, остальные клавиши сгруппированы попарно (по умолчанию).\n• Горизонтально: все вводимые действия располагаются рядом в столбцах.\n• Вертикально: все клавиши растягиваются по всей ширине на отдельных строках.",
    "tr": "• Kademeli: İlk tuş standart tam genişliği alır, diğer tuşlar çiftler halinde gruplandırılmış olarak onu takip eder (varsayılan).\n• Yatay: Tüm eylem girişlerini sütunlar halinde yan yana düzenler.\n• Dikey: Tüm tuşları, ayrı satırlarda tam genişlikte genişletir.",
    "es": "• Escalonado: la primera clave ocupa el ancho completo estándar, otras claves siguen agrupadas en pares (predeterminado).\n• Horizontal: organiza todas las entradas de acción una al lado de la otra en columnas.\n• Vertical: extiende todas las claves en todo el ancho en líneas separadas."
  },
  "✍️ Custom Primary Keyboard Button Labels": {
    "fa": "✍️ برچسب متنی دکمه‌های اصلی کیبورد",
    "ar": "✍️ تسميات أزرار لوحة المفاتيح الأساسية المخصصة",
    "ru": "✍️ Пользовательские метки основных кнопок клавиатуры",
    "tr": "✍️ Özel Birincil Klavye Düğme Etiketleri",
    "es": "✍️ Etiquetas personalizadas para los botones del teclado principal"
  },
  "Buy Sub Button Label": {
    "fa": "عنوان دکمه خرید اشتراک",
    "ar": "شراء تسمية الزر الفرعي",
    "ru": "Купить ярлык дополнительной кнопки",
    "tr": "Alt Düğme Etiketi Satın Al",
    "es": "Comprar etiqueta de subbotón"
  },
  "My Subs Button Label": {
    "fa": "عنوان دکمه اشتراک‌ها",
    "ar": "تسمية زر الغواصات الخاصة بي",
    "ru": "Ярлык кнопки «Мои подписки»",
    "tr": "Aboneliklerim Düğme Etiketi",
    "es": "Etiqueta del botón Mis suscriptores"
  },
  "Connection Guide Button Label": {
    "fa": "عنوان دکمه راهنمای اتصال",
    "ar": "تسمية زر دليل الاتصال",
    "ru": "Наклейка кнопки руководства по подключению",
    "tr": "Bağlantı Kılavuzu Düğme Etiketi",
    "es": "Etiqueta del botón de la guía de conexión"
  },
  "Profile Button Label": {
    "fa": "عنوان دکمه حساب کاربری",
    "ar": "تسمية زر الملف الشخصي",
    "ru": "Метка кнопки профиля",
    "tr": "Profil Düğme Etiketi",
    "es": "Etiqueta del botón de perfil"
  },
  "Support Button Label": {
    "fa": "عنوان دکمه پشتیبانی",
    "ar": "تسمية زر الدعم",
    "ru": "Ярлык кнопки поддержки",
    "tr": "Destek Düğmesi Etiketi",
    "es": "Etiqueta del botón de soporte"
  },
  "Ticket Support Button Label": {
    "fa": "عنوان دکمه تیکت به پشتیبانی",
    "ar": "تسمية زر دعم التذاكر",
    "ru": "Ярлык кнопки поддержки билетов",
    "tr": "Bilet Destek Düğmesi Etiketi",
    "es": "Etiqueta del botón de soporte de tickets"
  },
  "Free Test Button Label": {
    "fa": "عنوان دکمه موجوده رایگان/تست",
    "ar": "تسمية زر اختبار مجاني",
    "ru": "Этикетка с кнопкой бесп��атного тестирования",
    "tr": "Ücretsiz Test Düğmesi Etiketi",
    "es": "Etiqueta de botón de prueba gratuita"
  },
  "AI Chat Button Label": {
    "fa": "عنوان دکمه چت با ربات",
    "ar": "تسمية زر الدردشة AI",
    "ru": "Ярлык кнопки чата с искусственным интеллектом",
    "tr": "AI Sohbet Düğmesi Etiketi",
    "es": "Etiqueta del botón de chat AI"
  },
  "Colleagues Button Label": {
    "fa": "عنوان دکمه همکاران",
    "ar": "تسمية زر الزملاء",
    "ru": "Метка кнопки \"Коллеги\"",
    "tr": "İş Arkadaşları Düğme Etiketi",
    "es": "Etiqueta del botón de colegas"
  },
  "Instant Support Button Label": {
    "fa": "عنوان دکمه پشتیبانی آنی",
    "ar": "تسمية زر الدعم الفوري",
    "ru": "Ярлык кнопки мгновенной поддержки",
    "tr": "Anında Destek Düğmesi Etiketi",
    "es": "Etiqueta del botón de soporte instantáneo"
  },
  "Feedback Button Label": {
    "fa": "عنوان دکمه بازخورد",
    "ar": "تسمية زر التعليقات",
    "ru": "Ярлык кнопки обратной связи",
    "tr": "Geri Bildirim Düğmesi Etiketi",
    "es": "Etiqueta del botón de comentarios"
  },
  "Referral Button Label": {
    "fa": "عنوان دکمه مجموعه‌گیری",
    "ar": "تسمية زر الإحالة",
    "ru": "Ярлык кнопки реферала",
    "tr": "Yönlendirme Düğmesi Etiketi",
    "es": "Etiqueta del botón de referencia"
  },
  "Wallet Button Label": {
    "fa": "عنوان دکمه کیف پول و شارژ",
    "ar": "تسمية زر المحفظة",
    "ru": "Этикетка на кнопке кошелька",
    "tr": "Cüzdan Düğmesi Etiketi",
    "es": "Etiqueta del botón de la billetera"
  },
  "Toggle visibility": {
    "fa": "فعال/غیرفعال کردن این دکمه در ربات",
    "ar": "تبديل الرؤية",
    "ru": "Переключить видимость",
    "tr": "Görünürlüğü aç/kapat",
    "es": "Alternar visibilidad"
  },
  "Edit Wallet Charge Amounts": {
    "fa": "ویرایش مبالغ شارژ کیف پول",
    "ar": "تحرير مبالغ رسوم المحفظة",
    "ru": "Изменение сумм списаний с кошелька",
    "tr": "Cüzdan Ücreti Tutarlarını Düzenle",
    "es": "Editar montos de cargos de billetera"
  },
  "🎥 Client Setup Video Tutorials": {
    "fa": "🎥 ویدیوها و فایل‌های آموزش اتصال کلاینت‌ها",
    "ar": "🎥 دروس فيديو لإعداد العميل",
    "ru": "🎥 Видеоуроки по настройке клиента",
    "tr": "🎥 İstemci Kurulumu Video Eğitimleri",
    "es": "🎥 Tutoriales en vídeo sobre configuración del cliente"
  },
  "Associate a Direct Video URL, Playable GIF link, or Telegram File ID for each connection client guide.": {
    "fa": "لینک مستقیم ویدیو/GIF یا شناسه فایل تلگرامی (File ID) را قرار دهید تا آموزش کلاینت مربوطه تصویری ارسال شود.",
    "ar": "قم بربط عنوان URL المباشر للفيديو أو رابط GIF القابل للتشغيل أو معرف ملف Telegram لكل دليل عميل اتصال.",
    "ru": "Свяжите URL-адрес прямого видео, ссылку на воспроизводимый GIF-файл или идентификатор файла Telegram для каждого руководства клиента подключения.",
    "tr": "Her bağlantı istemcisi kılavuzu için bir Doğrudan Video URL'sini, Oynatılabilir GIF bağlantısını veya Telegram Dosya Kimliğini ilişkilendirin.",
    "es": "Asocie una URL de video directo, un enlace GIF reproducible o una ID de archivo de Telegram para cada guía del cliente de conexión."
  },
  "How to specify an educational media file?": {
    "fa": "چگونه یک منبع تصویری یا ویدیو اضافه کنیم؟",
    "ar": "كيفية تحديد ملف الوسائط التعليمية؟",
    "ru": "Как указать образовательный медиафайл?",
    "tr": "Eğitici bir medya dosyası nasıl belirlenir?",
    "es": "¿Cómo especificar un archivo multimedia educativo?"
  },
  "1. Telegram File ID (Recommended): Best for high-speed delivery. Send any tutorial video/GIF file to your bot, note the generated file ID in terminal/logs, and paste it below.": {
    "fa": "۱. شناسه فایل تلگرام (File ID): برای ارسال سریع و پرسرعت مستقیم در تلگرام، ویدیو یا GIF مورد نظرتان را به ربات بفرستید؛ شناسه آن در لاگ‌های کنسول به شما نشان داده می‌شود. کپی کرده و در کادرهای زیر بگذارید.",
    "ar": "1. معرف ملف Telegram (مستحسن): الأفضل للتسليم عالي السرعة. أرسل أي ملف فيديو/GIF تعليمي إلى الروبوت الخاص بك، ولاحظ معرف الملف الذي تم إنشاؤه في الوحدة الطرفية/السجلات، وألصقه أدناه.",
    "ru": "1. Идентификатор файла Telegram (рекомендуется): лучше всего подходит для высокоскоростной доставки. Отправьте боту любое обучающее видео/GIF-файл, запишите сгенерированный идентификатор файла в терминале/журна��ах и вставьте его ниже.",
    "tr": "1. Telegram Dosya Kimliği (Önerilen): Yüksek hızlı teslimat için en iyisi. Herhangi bir eğitim videosunu/GIF dosyasını botunuza gönderin, oluşturulan dosya kimliğini terminalde/günlüklerde not edin ve aşağıya yapıştırın.",
    "es": "1. ID de archivo de Telegram (recomendado): lo mejor para entregas de alta velocidad. Envíe cualquier video tutorial/archivo GIF a su bot, anote el ID del archivo generado en el terminal/registros y péguelo a continuación."
  },
  "2. Direct Web Link: Provide a direct cloud hosted URL (e.g., https://yourdomain.com/setup.mp4) for users to interact or play natively.": {
    "fa": "۲. لینک مستقیم (URL): می‌توانید لینک مستقیم فایل ویدیویی خود (مثلاً https://example.com/guide.mp4) را قرار دهید تا ربات از آن جهت نمایش ویدیو استفاده کند.",
    "ar": "2. رابط الويب المباشر: قم بتوفير عنوان URL مباشر مستضاف على السحابة (على سبيل المثال، https://yourdomain.com/setup.mp4) للمستخدمين للتفاعل أو اللعب محليًا.",
    "ru": "2. Прямая веб-ссылка: укажите прямой URL-адрес, размещенный в облаке (например, https://yourdomain.com/setup.mp4), чтобы пользователи могли взаимодействовать или играть в исходном режиме.",
    "tr": "2. Doğrudan Web Bağlantısı: Kullanıcıların yerel olarak etkileşimde bulunabilmesi veya oyun oynayabilmesi için doğrudan bulutta barındırılan bir URL (ör. https://alaniniz.com/setup.mp4) sağlayın.",
    "es": "2. Enlace web directo: proporcione una URL alojada en la nube directa (por ejemplo, https://yourdomain.com/setup.mp4) para que los usuarios interactúen o jueguen de forma nativa."
  },
  "📱 HAPP Client Video / File ID": {
    "fa": "📱 کلاینت HAPP (موبایل)",
    "ar": "📱معرف فيديو / ملف عميل HAPP",
    "ru": "📱 Видео/идентификатор файла клиента HAPP",
    "tr": "📱 HAPP İstemci Videosu / Dosya Kimliği",
    "es": "📱 ID de archivo/vídeo del cliente HAPP"
  },
  "e.g., AgACAgIAAx...": {
    "fa": "شناسه فایل یا آدرس ویدیو",
    "ar": "على سبيل المثال، AgACAGIAAx...",
    "ru": "например, AgACAgIAAx...",
    "tr": "örneğin AgACAgIAAx...",
    "es": "por ejemplo, AgACAgIAAx..."
  },
  "🍎 iOS Clients Video / File ID": {
    "fa": "🍎 کلاینت‌های آیفون / iOS",
    "ar": "🍎 معرف الفيديو / الملف لعملاء iOS",
    "ru": "🍎 Идентификатор видео/файла клиентов iOS",
    "tr": "🍎 iOS İstemcileri Video / Dosya Kimliği",
    "es": "🍎 ID de archivo/vídeo de clientes iOS"
  },
  "🤖 Android v2rayNG Video / File ID": {
    "fa": "🤖 کلاینت اندروید (v2rayNG)",
    "ar": "🤖 معرف ملف/فيديو v2rayNG لنظام التشغيل Android",
    "ru": "🤖 Android v2rayNG Идентификатор видео/файла",
    "tr": "🤖 Android v2rayNG Video / Dosya Kimliği",
    "es": "🤖 ID de archivo/vídeo de Android v2rayNG"
  },
  "💻 Windows v2rayN Video / File ID": {
    "fa": "💻 کلاینت ویندوز (v2rayN)",
    "ar": "💻 Windows v2rayN Video / File ID",
    "ru": "💻 Windows v2rayN Идентификатор видео/файла",
    "tr": "💻 Windows v2rayN Video / Dosya Kimliği",
    "es": "💻 ID de archivo/vídeo de Windows v2rayN"
  },
  "💻 Windows Karing Video / File ID": {
    "fa": "💻 کلاینت ویندوز (Karing)",
    "ar": "💻 Windows Karing Video / معرف الملف",
    "ru": "💻 Windows Karing Видео / Идентификатор файла",
    "tr": "💻 Windows Karing Video / Dosya Kimliği",
    "es": "💻 ID de archivo/vídeo de Windows Karing"
  },
  "💻 macOS Client Video / File ID": {
    "fa": "💻 کلاینت مک (macOS)",
    "ar": "💻 معرف ملف / فيديو عميل macOS",
    "ru": "💻 Видео/идентификатор файла клиента macOS",
    "tr": "💻 macOS İstemci Videosu / Dosya Kimliği",
    "es": "💻 ID de archivo/vídeo del cliente macOS"
  },
  "🐧 Linux Client Video / File ID": {
    "fa": "🐧 کلاینت لینوکس (Linux)",
    "ar": "🐧 معرف ملف/فيديو عميل Linux",
    "ru": "🐧 Видео/идентификатор файла клиента Linux",
    "tr": "🐧 Linux İstemci Videosu / Dosya Kimliği",
    "es": "🐧 ID de archivo/vídeo del cliente Linux"
  },
  "Custom Auto-Reply Buttons": {
    "fa": "دکمه‌های سفارشی پاسخ خودکار (Custom Submenus)",
    "ar": "أزرار الرد التلقائي المخصصة",
    "ru": "Пользовательские кнопки автоответа",
    "tr": "Özel Otomatik Yanıt Düğmeleri",
    "es": "Botones de respuesta automática personalizados"
  },
  "Add custom reply options that trigger instant preset responses (like free test links, guides).": {
    "fa": "دکمه‌های فرعی ایجاد کنید که با کلیک روی آنها، ربات بلافاصله پاسخ متنی تنظیم شده را به کاربر بفرستد.",
    "ar": "أضف خيارات الرد المخصصة التي تؤدي إلى استجابات فورية محددة مسبقًا (مثل روابط الاختبار المجانية والأدلة).",
    "ru": "Добавьте пользовательские параметры ответа, которые вызывают мгновенные заранее заданные ответы (например, ссылки на бесплатные тесты, руководства).",
    "tr": "Anında önceden ayarlanmış yanıtları tetikleyen özel yanıt seçenekleri ekleyin (ücretsiz test bağlantıları, kılavuzlar gibi).",
    "es": "Agregue opciones de respuesta personalizadas que activen respuestas instantáneas preestablecidas (como enlaces de prueba gratuitos, guías)."
  },
  "Button Keyboard Display Label": {
    "fa": "عنوان دکمه (مثال: 🎁 تست رایگان)",
    "ar": "تسمية عرض لوحة المفاتيح للزر",
    "ru": "Кнопка Ярлык дисплея клавиатуры",
    "tr": "Düğme Klavye Ekran Etiketi",
    "es": "Etiqueta de visualización del teclado de botones"
  },
  "e.g., 🎁 Get Free Test": {
    "fa": "مثلا: 🎁 تست رایگان ۲ ساعته",
    "ar": "على سبيل المثال، 🎁 احصل على اختبار مجاني",
    "ru": "например, 🎁 Пройти бесплатный тест",
    "tr": "ör., 🎁 Ücretsiz Test Alın",
    "es": "por ejemplo, 🎁 Obtenga una prueba gratuita"
  },
  "Auto Reply Text (Telegram HTML allowed)": {
    "fa": "متن پاسخ ربات (پشتیبانی از تگ‌های HTML تلگرام)",
    "ar": "نص الرد التلقائي (مسموح بـ HTML لـ Telegram)",
    "ru": "Текст автоответа (разрешен Telegram HTML)",
    "tr": "Otomatik Yanıt Metni (Telegram HTML'sine izin verilir)",
    "es": "Texto de respuesta automática (se permite HTML de Telegram)"
  },
  "Hello! Here is your quick configuration...": {
    "fa": "سلام! جهت دریافت سرویس تست دکمه فعال شد:\\nvless://test-configs-daltoon...",
    "ar": "مرحبًا! هنا هو التكوين السريع الخاص بك...",
    "ru": "Привет! Вот ваша быстрая конфигурация...",
    "tr": "Merhaba! İşte hızlı yapılandırmanız...",
    "es": "¡Hola! Aquí está su configuración rápida..."
  },
  "✅ Button state synchronized!": {
    "fa": "✅ تغییرات دکمه با موفقیت همگام شد!",
    "ar": "✅ حالة الزر متزامنة!",
    "ru": "✅ Состояние кнопок синхронизировано!",
    "tr": "✅ Düğme durumu senkronize edildi!",
    "es": "✅ ¡Estado del botón sincronizado!"
  },
  "Save Modified Button": {
    "fa": "ذخیره تغییرات دکمه",
    "ar": "حفظ الزر المعدل",
    "ru": "Кнопка «Сохранить измененные»",
    "tr": "Save Modified Button",
    "es": "Botón Guardar Modificado"
  },
  "Create & Add Button": {
    "fa": "ذخیره و افزودن دکمه جدید",
    "ar": "إنشاء وإضافة زر",
    "ru": "Кнопка «Создать и добавить»",
    "tr": "Create & Add Button",
    "es": "Botón Crear y Agregar"
  },
  "Cancel": {
    "fa": "انصراف",
    "ar": "إلغاء",
    "ru": "Отмена",
    "tr": "İptal",
    "es": "Cancelar"
  },
  "Live Custom Reply Buttons:": {
    "fa": "دکمه‌های سفارشی فعال شده در ربات:",
    "ar": "أزرار الرد المباشر المخصصة:",
    "ru": "Кнопки ответа в режиме реального времени:",
    "tr": "Canlı Özel Yanıt Düğmeleri:",
    "es": "Botones de respuesta personalizados en vivo:"
  },
  "No custom buttons created yet. Create one on the left.": {
    "fa": "هیچ دکمه‌ی سفارشی ثبت نشده است. از فرم سمت چپ یکی اضافه کنید.",
    "ar": "لم يتم إنشاء أزرار مخصصة حتى الآن. إنشاء واحد على اليسار.",
    "ru": "Пользовательские кнопки пока не созданы. Создайте один слева.",
    "tr": "Henüz özel düğme oluşturulmadı. Create one on the left.",
    "es": "Aún no se han creado botones personalizados. Crea uno a la izquierda."
  },
  "Are you sure you want to delete this custom button?": {
    "fa": "آیا از حذف این دکمه اختصاصی اطمینان دارید؟",
    "ar": "هل أنت متأكد أنك تريد حذف هذا الزر المخصص؟",
    "ru": "Вы уверены, что хотите удалить эту пользовательскую кнопку?",
    "tr": "Bu özel düğmeyi silmek istediğinizden emin misiniz?",
    "es": "¿Está seguro de que desea eliminar este botón personalizado?"
  },
  "Telegram Bot Message & Button Customization": {
    "fa": "سفارشی‌سازی متن‌ها و دکمه‌های ربات تلگرام",
    "ar": "تخصيص الرسائل وأزرار بوت Telegram",
    "ru": "Настройка сообщений и кнопок бота Telegram",
    "tr": "Telegram Bot Mesajı ve Düğme Özelleştirme",
    "es": "Personalización de botones y mensajes de Telegram Bot"
  },
  "Customize primary bot responses and visibility of buttons without editing Python files directly.": {
    "fa": "بدون نیاز به ویرایش فایل‌های پایتون در سرور لینوکس، متن‌های اصلی و دکمه‌های فعال ربات را سفارشی کنید.",
    "ar": "قم بتخصيص استجابات الروبوت الأساسية ورؤية الأزرار دون تحرير ملفات Python مباشرة.",
    "ru": "Настраивайте основные ответы ботов и видимость кнопок без непосредственного редактирования файлов Python.",
    "tr": "Python dosyalarını doğrudan düzenlemeden birincil bot yanıtlarını ve düğmelerin görünürlüğünü özelleştirin.",
    "es": "Personalice las respuestas del bot principal y la visibilidad de los botones sin editar archivos Python directamente."
  },
  "Welcome Message Text (/start)": {
    "fa": "متن خوش‌آمدگویی استارت ربات (/start)",
    "ar": "نص رسالة الترحيب (/ابدأ)",
    "ru": "Текст приветственного сообщения (/start)",
    "tr": "Hoş Geldiniz Mesajı Metni (/start)",
    "es": "Texto del mensaje de bienvenida (/start)"
  },
  "Tip: Use {tg_id} for user's ID and {wallet_balance} for wallet credit. HTML tags are supported.": {
    "fa": "نکته: می‌توانید از کدهای {tg_id} برای نمایش آیدی کاربری و {wallet_balance} برای نمایش مانده اعتبار استفاده کنید. قالب‌بندی HTML مجاز است.",
    "ar": "نصيحة: استخدم {tg_id} لمعرف المستخدم و{wallet_balance} لرصيد المحفظة. علامات HTML مدعومة.",
    "ru": "Совет: используйте {tg_id} для идентификатора пользователя и {wallet_balance} для кредита кошелька. HTML-теги поддерживаются.",
    "tr": "İpucu: Kullanıcı kimliği için {tg_id} ve cüzdan kredisi için {wallet_balance} kullanın. HTML tags are supported.",
    "es": "Consejo: utilice {tg_id} para la identificación del usuario y {wallet_balance} para el crédito de la billetera. Se admiten etiquetas HTML."
  },
  "Support Button Content": {
    "fa": "متن دکمه پشتیبانی فنی",
    "ar": "محتوى زر الدعم",
    "ru": "Содержимое кнопки поддержки",
    "tr": "Support Button Content",
    "es": "Contenido del botón de soporte"
  },
  "Tip: HTML tags are supported.": {
    "fa": "نکته: قالب‌بندی HTML مجاز است.",
    "ar": "نصيحة: علامات HTML مدعومة.",
    "ru": "Совет: HTML-теги поддерживаются.",
    "tr": "İpucu: HTML etiketleri desteklenir.",
    "es": "Consejo: Se admiten etiquetas HTML."
  },
  "Enable Auto-Pinned Message": {
    "fa": "فعالسازی پین خودکار پیام",
    "ar": "تمكين الرسالة المثبتة تلقائيًا",
    "ru": "Включить автоматически закрепленное сообщение",
    "tr": "Otomatik Sabitlenen Mesajı Etkinleştir",
    "es": "Habilitar mensaje fijado automáticamente"
  },
  "If enabled, this message will be sent and pinned in the user's private chat when they /start the bot.": {
    "fa": "با فعالسازی این گزینه، پیام مشخص شده به محض ورود کاربر به ربات (/start) در چت خصوصی او فرستاده و پین می‌شود.",
    "ar": "إذا تم تمكينها، فسيتم إرسال هذه الرسالة وتثبيتها في الدردشة الخاصة للمستخدم عندما يبدأ تشغيل الروبوت.",
    "ru": "Если эта опция включена, это сообщение будет отправлено и закреплено в личном чате пользователя при запуске бота.",
    "tr": "Etkinleştirilirse, bu mesaj gönderilecek ve kullanıcı botu başlattığında kullanıcının özel sohbetine sabitlenecektir.",
    "es": "Si está habilitado, este mensaje se enviará y fijará en el chat privado del usuario cuando inicie el bot."
  },
  "translate-x-5": {
    "fa": "-translate-x-5",
    "ar": "ترجمة-س-5",
    "ru": "перевести-x-5",
    "tr": "translate-x-5",
    "es": "traducir-x-5"
  },
  "Pinned Message Text": {
    "fa": "متن پیام پین‌شونده",
    "ar": "نص الرسالة المثبتة",
    "ru": "Закрепленный текст сообщения",
    "tr": "Pinned Message Text",
    "es": "Texto del mensaje fijado"
  },
  "e.g. 📢 Follow our new channel: @Daltoon_Store": {
    "fa": "مثال: 📢 آدرس جدید کانال ما را حتما دنبال کنید: @Daltoon_Store",
    "ar": "على سبيل المثال 📢 تابعوا قناتنا الجديدة: @Daltoon_Store",
    "ru": "например 📢 Следите за нашим новым каналом: @Daltoon_Store.",
    "tr": "örneğin 📢 Yeni kanalımızı takip edin: @Daltoon_Store",
    "es": "por ej. 📢 Sigue nuestro nuevo canal: @Daltoon_Store"
  },
  "Tip: HTML tags are supported in the pinned message.": {
    "fa": "نکته: قالب‌بندی HTML در پیام پین شده مجاز است.",
    "ar": "نصيحة: علامات HTML مدعومة في الرسالة المثبتة.",
    "ru": "Совет. В закрепленном сообщении поддерживаются HTML-теги.",
    "tr": "İpucu: Sabitlenmiş mesajda HTML etiketleri desteklenir.",
    "es": "Consejo: Las etiquetas HTML se admiten en el mensaje fijado."
  },
  "📝 Config Delivery Success Note": {
    "fa": "📝 توضیحات پیوست پس از تحویل اکانت به مشتری",
    "ar": "📝 ملاحظة نجاح تسليم التكوين",
    "ru": "📝 Примечание об успешной доставке конфигурации",
    "tr": "📝 Yapılandırma Teslimatı Başarı Notu",
    "es": "📝 Nota de entrega exitosa de configuración"
  },
  "e.g., Client Tutorial Channel: @example_setup": {
    "fa": "مثلا: کانال آموزش کلاینت‌ها: @example_setup",
    "ar": "على سبيل المثال، قناة البرنامج التعليمي للعميل: @example_setup",
    "ru": "например, канал обучения клиентов: @example_setup",
    "tr": "ör. Müşteri Eğitimi Kanalı: @example_setup",
    "es": "por ejemplo, canal de tutorial del cliente: @example_setup"
  },
  "Remove": {
    "fa": "حذف",
    "ar": "إزالة",
    "ru": "Удалить",
    "tr": "Kaldır",
    "es": "Quitar"
  },
  "Tip: This text will be appended automatically beneath the premium config link upon successful customer checkout.": {
    "fa": "نکته: این متن به عنوان راهنما، بلافاصله در زیر کانفیگ صادر شده به مشتری تحویل داده می‌شود.",
    "ar": "نصيحة: سيتم إلحاق هذا النص تلقائيًا أسفل رابط التكوين المميز عند إتمام عملية الدفع بنجاح للعميل.",
    "ru": "Совет: Этот текст будет автоматически добавлен под ссылкой на премиум-конфигурацию после успешной оплаты заказа.",
    "tr": "İpucu: Bu metin, başarılı müşteri ödemesi sonrasında premium yapılandırma bağlantısının altına otomatik olarak eklenecektir.",
    "es": "Consejo: Este texto se agregará automáticamente debajo del enlace de configuración premium una vez que el cliente realice correctamente el pago."
  },
  "Saves straight to JSON Daltoon_Bot.json": {
    "fa": "ذخیره‌سازی آنی در دیتابیس ربات (Daltoon_Bot.json)",
    "ar": "يحفظ مباشرة إلى JSON Daltoon_Bot.json",
    "ru": "Сохраняет прямо в JSON Daltoon_Bot.json.",
    "tr": "Doğrudan JSON Daltoon_Bot.json'a kaydeder",
    "es": "Guarda directamente en JSON Daltoon_Bot.json"
  },
  "Save Button Layout & Labels": {
    "fa": "ذخیره تغییرات دکمه‌ها و چیدمان",
    "ar": "حفظ تخطيط الزر والتسميات",
    "ru": "Расположение и метки кнопки «Сохранить»",
    "tr": "Düğme Düzenini ve Etiketleri Kaydet",
    "es": "Guardar diseño de botones y etiquetas"
  },
  "Edit Connection Guide Text": {
    "fa": "ویرایش توضیحات راهنمای اتصال",
    "ar": "تحرير نص دليل الاتصال",
    "ru": "Редактировать текст руководства по подключению",
    "tr": "Bağlantı Kılavuzu Metnini Düzenle",
    "es": "Editar texto de la guía de conexión"
  },
  "📝 Description for Connection Guide button": {
    "fa": "📝 توضیحات برای دکمه راهنمای اتصال",
    "ar": "📝 وصف زر دليل الاتصال",
    "ru": "📝 Описание кнопки «Руководство по подключению»",
    "tr": "📝 Bağlantı Kılavuzu düğmesinin açıklaması",
    "es": "📝 Descripción del botón Guía de conexión"
  },
  "Write connection guide content here...": {
    "fa": "توضیحات دکمه آموزش را اینجا بنویسید...",
    "ar": "اكتب محتوى دليل الاتصال هنا...",
    "ru": "Напишите здесь содержание руководства по подключению...",
    "tr": "Bağlantı kılavuzu içeriğini buraya yazın...",
    "es": "Escriba el contenido de la guía de conexión aquí..."
  },
  "• You can use HTML codes like <b>bold</b> and <code>monospace</code> for rich formatting.": {
    "fa": "• می‌توانید از کدهای HTML مانند <b>برای ضخیم کردن متن</b> و یا <code>برای کپی سریع کلمات</code> استفاده فرمایید.",
    "ar": "• يمكنك استخدام أكواد HTML مثل <b>bold</b> و<code>monospace</code> للحصول على تنسيق غني.",
    "ru": "• Для форматирования можно использовать HTML-коды, например <b>жирный</b> и <code>моноширинный</code>.",
    "tr": "• Zengin biçimlendirme için <b>kalın</b> ve <code>monospace</code> gibi HTML kodlarını kullanabilirsiniz.",
    "es": "• Puede utilizar códigos HTML como <b>negrita</b> y <code>monoespacio</code> para obtener formato enriquecido."
  },
  "Save Changes & Close": {
    "fa": "ذخیره نهایی و بستن",
    "ar": "حفظ التغييرات والإغلاق",
    "ru": "Сохранить изменения и закрыть",
    "tr": "Değişiklikleri Kaydet ve Kapat",
    "es": "Guardar cambios y cerrar"
  },
  "Wallet Charge Amounts": {
    "fa": "تنظیم مبالغ شارژ کیف پول",
    "ar": "مبالغ رسوم المحفظة",
    "ru": "Суммы списаний с кошелька",
    "tr": "Cüzdan Ücreti Tutarları",
    "es": "Montos de cargos de billetera"
  },
  "Set preset charge amounts (in Tomans) for quick recharging buttons in the bot. Users will be shown these ready options.": {
    "fa": "مبالغی که جهت دکمه‌های شارژ سریع در ربات برای افزایش موجودی نمایش داده می‌شود را مشخص کنید (به تومان). کاربران با انتخاب هرکدام، لینک پرداخت کارت‌به‌کارت دریافت می‌کنند.",
    "ar": "قم بتعيين مبالغ الشحن المحددة مسبقًا (بالتومان) لأزرار إعادة الشحن السريعة في الروبوت. سيتم عرض هذه الخيارات الجاهزة للمستخدمين.",
    "ru": "Установите предустановленные суммы заряда (в томансах) для кнопок быстрого пополнения в боте. Пользователям будут показаны эти готовые варианты.",
    "tr": "Bottaki hızlı şarj düğmeleri için önceden ayarlanmış şarj miktarlarını (Toman cinsinden) ayarlayın. Kullanıcılara bu hazır seçenekler gösterilecektir.",
    "es": "Establezca cantidades de carga preestablecidas (en Tomans) para los botones de recarga rápida en el bot. A los usuarios se les mostrarán estas opciones listas."
  },
  "No amounts defined.": {
    "fa": "هیچ مبلغی تعریف نشده است.",
    "ar": "لم يتم تحديد أي مبالغ.",
    "ru": "Суммы не определены.",
    "tr": "Tanımlanmış tutar yok.",
    "es": "No hay montos definidos."
  },
  "Add New Preset Amount": {
    "fa": "افزودن مبلغ جدید",
    "ar": "إضافة مبلغ جديد محدد مسبقا",
    "ru": "Добавить новую предустановленную сумму",
    "tr": "Yeni Ön Ayar Tutarı Ekle",
    "es": "Agregar nueva cantidad preestablecida"
  },
  "Save Changes": {
    "fa": "ثبت نهایی تغییرات بسته",
    "ar": "حفظ التغييرات",
    "ru": "Сохранить изменения",
    "tr": "Değişiklikleri Kaydet",
    "es": "Guardar cambios"
  },
  "Bot Logs": {
    "fa": "وضعیت ربات (لاگ‌ها)",
    "ar": "سجلات الروبوت",
    "ru": "Журналы ботов",
    "tr": "Bot Günlükleri",
    "es": "Registros de robots"
  },
  "No logs available.": {
    "fa": "هیچ فعالیتی ثبت نشده است.",
    "ar": "لا توجد سجلات متاحة.",
    "ru": "Журналы отсутствуют.",
    "tr": "Günlük yok.",
    "es": "No hay registros disponibles."
  },
  "en-US": {
    "fa": "fa-IR",
    "ar": "ar-US",
    "ru": "ru-US",
    "tr": "tr-TR",
    "es": "es-US"
  },
  "Toman": {
    "fa": "تومان",
    "ar": "تومان",
    "ru": "Томан",
    "tr": "Tümen",
    "es": "tomán"
  },
  "Card-to-Card Transfer": {
    "fa": "واریز کارت به کارت",
    "ar": "التحويل من بطاقة إلى بطاقة",
    "ru": "Перевод с карты на карту",
    "tr": "Karttan Karta Transfer",
    "es": "Transferencia de tarjeta a tarjeta"
  },
  "💳 Renew Now": {
    "fa": "💳 تمدید این سرویس",
    "ar": "💳 جدد الآن",
    "ru": "💳 Продлить сейчас",
    "tr": "💳 Şimdi Yenile",
    "es": "💳 Renovar ahora"
  },
  "⚠️ <b>Invalid Username!</b>\\n\\nUsername must contain English letters, numbers, hyphens and be between 3 and 15 chars (no spaces).\\n\\nPlease write a valid English name:": {
    "fa": "⚠️ <b>نام وارد شده نامعتبر است!</b>\\n\\nنام کاربری باید فقط شامل حروف انگلیسی، اعداد و خط تیره بین ۳ تا ۱۵ کاراکتر باشد (بدون فاصله).\\n\\nلطفاً یک نام انگلیسی معتبر بنویسید:",
    "ar": "⚠️ <b>اسم مستخدم غير صالح!</b>\\n\\nيجب أن يحتوي اسم المستخدم على أحرف وأرقام وواصلات باللغة الإنجليزية وأن يتراوح عدد أحرفه بين 3 و15 حرفًا (بدون مسافات).\\n\\nالرجاء كتابة اسم باللغة الإنجليزية صالح:",
    "ru": "⚠️ <b>Неверное имя пользователя!</b>\\n\\nИмя пользователя должно содержать английские буквы, цифры, дефисы и иметь длину от 3 до 15 символов (без пробелов).\\n\\nПожалуйста, укажите допустимое английское имя:",
    "tr": "⚠️ <b>Geçersiz Kullanıcı Adı!</b>\\n\\nKullanıcı adı İngilizce harfler, sayılar ve kısa çizgiler içermeli ve 3 ile 15 karakter arasında (boşluksuz) olmalıdır.\\n\\nLütfen geçerli bir İngilizce ad yazın:",
    "es": "⚠️ <b>¡Nombre de usuario no válido!</b>\\n\\nEl nombre de usuario debe contener letras, números y guiones en inglés y tener entre 3 y 15 caracteres (sin espacios).\\n\\nEscriba un nombre en inglés válido:"
  },
  "❌ <b>Error: Invalid traffic limit!</b>\\n\\nPlease enter a valid integer (between 1 and 1000):": {
    "fa": "❌ <b>خطا: ترافیک نامعتبر است!</b>\\n\\nلطفاً یک عدد صحیح بزرگتر از صفر (بین ۱ تا ۱۰۰۰) وارد کنید:",
    "ar": "❌ <b>خطأ: حد حركة المرور غير صالح!</b>\\n\\nالرجاء إدخال عدد صحيح صالح (بين 1 و1000):",
    "ru": "❌ <b>Ошибка: неверный лимит трафика!</b>\\n\\nВведите допустимое целое число (от 1 до 1000):",
    "tr": "❌ <b>Hata: Geçersiz trafik sınırı!</b>\\n\\nLütfen geçerli bir tamsayı girin (1 ile 1000 arasında):",
    "es": "❌ <b>Error: ¡Límite de tráfico no válido!</b>\\n\\nIngrese un número entero válido (entre 1 y 1000):"
  },
  "❌ <b>Error: Invalid duration!</b>\\n\\nPlease enter a valid integer (between 1 and 365):": {
    "fa": "❌ <b>خطا: تعداد روزها نامعتبر است!</b>\\n\\nلطفاً یک عدد صحیح بزرگتر از صفر (بین ۱ تا ۳۶۵) وارد کنید:",
    "ar": "❌ <b>خطأ: المدة غير صالحة!</b>\\n\\nالرجاء إدخال عدد صحيح صالح (بين 1 و365):",
    "ru": "❌ <b>Ошибка: неверная продолжительность!</b>\\n\\nВведите допустимое целое число (от 1 до 365):",
    "tr": "❌ <b>Hata: Geçersiz süre!</b>\\n\\nLütfen geçerli bir tamsayı girin (1 ile 365 arasında):",
    "es": "❌ <b>Error: ¡Duración no válida!</b>\\n\\nIngrese un número entero válido (entre 1 y 365):"
  },
  "✅ Confirm & Pay": {
    "fa": "✅ تایید و پرداخت از کیف پول",
    "ar": "✅ التأكيد والدفع",
    "ru": "✅ Подтвердить и оплатить",
    "tr": "✅ Onayla ve Öde",
    "es": "✅ Confirmar y pagar"
  },
  "❌ Cancel": {
    "fa": "❌ لغو",
    "ar": "❌ إلغاء",
    "ru": "❌ Отмена",
    "tr": "❌ İptal",
    "es": "❌ Cancelar"
  },
  "❌ Renewal cancelled.": {
    "fa": "❌ عملیات تمدید لغو شد.",
    "ar": "❌ تم إلغاء التجديد.",
    "ru": "❌Продление отменено.",
    "tr": "❌Yenileme iptal edildi.",
    "es": "❌ Renovación cancelada."
  },
  "⏳ <b>Select Renewal Duration:</b>\\n\\nPlease enter additional days (e.g. <code>30</code>):": {
    "fa": "⏳ <b>انتخاب مدت زمان تمدید:</b>\\n\\nلطفاً تعداد روزهای اضافی جهت تمدید اشتراک را به <b>روز (Days)</b> وارد کنید (مثلاً <code>30</code>):",
    "ar": "⏳ <b>حدد مدة التجديد:</b>\\n\\nيُرجى إدخال أيام إضافية (على سبيل المثال <code>30</code>):",
    "ru": "⏳ <b>Выберите продолжительность продления:</b>\\n\\nУкажите дополнительные дни (например, <code>30</code>):",
    "tr": "⏳ <b>Yenileme Süresini Seçin:</b>\\n\\nLütfen ek günleri girin (ör. <code>30</code>):",
    "es": "⏳ <b>Seleccione la duración de la renovación:</b>\\n\\nIngrese días adicionales (por ejemplo, <code>30</code>):"
  },
  "✅ Pay from Wallet": {
    "fa": "✅ پرداخت از کیف پول",
    "ar": "✅ الدفع من المحفظة",
    "ru": "✅ Оплата с кошелька",
    "tr": "✅ Cüzdandan Ödeme",
    "es": "✅ Pagar desde Wallet"
  },
  "💳 Card-to-Card Pay": {
    "fa": "💳 کارت به کارت مستقیم",
    "ar": "💳 الدفع من بطاقة إلى بطاقة",
    "ru": "💳 Оплата с карты на карту",
    "tr": "💳 Karttan Karta Ödeme",
    "es": "💳 Pago tarjeta a tarjeta"
  },
  "❌ Ticket filing cancelled.": {
    "fa": "❌ فرآیند ثبت تیکت لغو شد.",
    "ar": "❌ تم إلغاء حجز التذاكر.",
    "ru": "❌Подача билетов отменена.",
    "tr": "❌ Bilet başvuruları iptal edildi.",
    "es": "❌ Cancelación de presentación de billetes."
  },
  "❌ Cancel Ticket": {
    "fa": "❌ انصراف از ثبت تیکت",
    "ar": "❌ إلغاء التذكرة",
    "ru": "❌ Отменить билет",
    "tr": "❌ Bileti İptal Et",
    "es": "❌ Cancelar billete"
  },
  "⏳ Submitting ticket to dashboard agents...": {
    "fa": "⏳ در حال فرستادن اطلاعات تیکت و ثبت در سامانه پرونده‌ها...",
    "ar": "⏳ إرسال التذكرة إلى وكلاء لوحة القيادة...",
    "ru": "⏳ Отправка заявки агентам информационной панели...",
    "tr": "⏳ Kontrol paneli temsilcilerine bilet gönderiliyor...",
    "es": "⏳ Envío de ticket a los agentes del panel..."
  },
  "❌ Network error registering ticket.": {
    "fa": "❌ خطایی در اتصال به سامانه رخ داد.",
    "ar": "❌خطأ في الشبكة أثناء تسجيل التذكرة.",
    "ru": "❌ Ошибка сети при регистрации билета.",
    "tr": "❌ Bilet kaydedilirken ağ hatası.",
    "es": "❌ Error de red al registrar ticket."
  },
  "❌ Ownership transfer cancelled.": {
    "fa": "❌ عملیات انتقال مالکیت لغو شد.",
    "ar": "❌ تم إلغاء نقل الملكية.",
    "ru": "❌Передача права собственности отменена.",
    "tr": "❌ Sahiplik aktarımı iptal edildi.",
    "es": "❌ Transferencia de propiedad cancelada."
  },
  "⏳ Initiating ownership transfer...": {
    "fa": "⏳ در حال اعتبارسنجی کاربر مقصد و انتقال مالکیت...",
    "ar": "⏳ البدء بنقل الملكية...",
    "ru": "⏳ Инициируем передачу права собственности...",
    "tr": "⏳ Sahiplik aktarımı başlatılıyor...",
    "es": "⏳ Iniciando transferencia de propiedad..."
  },
  "⚠️ <b>Invalid Username!</b>\\n\\nUsername must contain English letters, numbers, hyphens, and be between 3 and 15 characters long (no spaces/Persian).\\n\\nPlease write a valid English name:": {
    "fa": "⚠️ <b>نام وارد شده نامعتبر است!</b>\\n\\nنام کاربری باید فقط شامل حروف انگلیسی، اعداد، خط تیره و بین ۳ تا ۱۵ کاراکتر باشد (بدون فاصله یا حروف فارسی).\\n\\nلطفاً یک نام انگلیسی معتبر بنویسید:",
    "ar": "⚠️ <b>اسم مستخدم غير صالح!</b>\\n\\nيجب أن يحتوي اسم المستخدم على أحرف وأرقام وواصلات باللغة الإنجليزية، وأن يترا��ح طوله بين 3 و15 حرفًا (بدون مسافات/باللغة الفارسية).\\n\\nالرجاء كتابة اسم باللغة الإنجليزية صالح:",
    "ru": "⚠️ <b>Неверное имя пользователя!</b>\\n\\nИмя пользователя должно содержать английские буквы, цифры, дефисы и иметь длину от 3 до 15 символов (без пробелов/персидского языка).\\n\\nПожалуйста, укажите допустимое английское имя:",
    "tr": "⚠️ <b>Geçersiz Kullanıcı Adı!</b>\\n\\nKullanıcı adı İngilizce harfler, sayılar ve kısa çizgiler içermeli ve 3 ila 15 karakter uzunluğunda olmalıdır (boşluksuz/Farsça).\\n\\nLütfen geçerli bir İngilizce ad yazın:",
    "es": "⚠️ <b>¡Nombre de usuario no válido!</b>\\n\\nEl nombre de usuario debe contener letras, números y guiones en inglés y tener entre 3 y 15 caracteres (sin espacios/persa).\\n\\nEscriba un nombre en inglés válido:"
  },
  "🏠 Main Menu": {
    "fa": "🏠 بازگشت به منوی اصلی",
    "ar": "🏠 القائمة الرئيسية",
    "ru": "🏠 Главное меню",
    "tr": "🏠 Ana Menü",
    "es": "🏠 Menú principal"
  },
  "⏳ Generating your dedicated configurations on multiple active inbounds in the 3x-ui core...": {
    "fa": "⏳ در حال ساخت کانفیگ اختصاصی شما روی پروتکل‌های فعال چندگانه در هسته ۳x-ui و ثبت سابسکریپشن...",
    "ar": "⏳ إنشاء التكوينات المخصصة الخاصة بك على العديد من العناصر الداخلية النشطة في 3x-ui الأساسية...",
    "ru": "⏳ Генерация выделенных конфигураций для нескольких активных входящих подключений в ядре 3x-ui...",
    "tr": "⏳ 3x-ui çekirdeğindeki birden fazla etkin gelen bağlantıda özel yapılandırmalarınızı oluşturmak...",
    "es": "⏳ Generando sus configuraciones dedicadas en múltiples entradas activas en el núcleo 3x-ui..."
  },
  "❌ Insufficient sandbox balance. Please recharge your test wallet first.": {
    "fa": "❌ موجودی کیف پول شبیه‌ساز شما کافی نیست. لطفاً ابتدا کیف پول خود را شارژ آزمایشی کرده و مجدداً امتحان کنید.",
    "ar": "❌ رصيد رمل غير كافي. يرجى إعادة شحن محفظتك التجريبية أولاً.",
    "ru": "❌ Недостаточный баланс песочницы. Пожалуйста, сначала пополните свой тестовый кошелек.",
    "tr": "❌ Yetersiz sanal alan dengesi. Lütfen önce test cüzdanınızı yeniden şarj edin.",
    "es": "❌ Equilibrio insuficiente del sandbox. Primero recargue su billetera de prueba."
  },
  "🔗 Get Sub Link": {
    "fa": "🔗 دریافت لینک ساب",
    "ar": "🔗 احصل على الرابط الفرعي",
    "ru": "🔗 Получить дополнительную ссылку",
    "tr": "🔗 Alt Bağlantıyı Al",
    "es": "🔗 Obtener enlace secundario"
  },
  "🔗 Vless Links": {
    "fa": "🔗 لینک‌های vless",
    "ar": "🔗 روابط Vless",
    "ru": "🔗 Влесс Ссылки",
    "tr": "🔗Vless Bağlantılar",
    "es": "🔗 Enlaces sin V"
  },
  "🔙 Back": {
    "fa": "🔙 برگشت",
    "ar": "🔙 العودة",
    "ru": "🔙 Назад",
    "tr": "🔙 Geri",
    "es": "🔙 Volver"
  },
  "🌐 Please select your preferred server:": {
    "fa": "🌐 لطفا سرور مورد نظر خود را انتخاب کنید:",
    "ar": "🌐 يرجى اختيار الخادم المفضل لديك:",
    "ru": "🌐 Пожалуйста, выберите предпочитаемый сервер:",
    "tr": "🌐 Lütfen tercih ettiğiniz sunucuyu seçin:",
    "es": "🌐 Seleccione su servidor preferido:"
  },
  "Others": {
    "fa": "سایر",
    "ar": "الآخرين",
    "ru": "Другие",
    "tr": "Diğerleri",
    "es": "Otros"
  },
  "Please select one of the following categories to view plans:": {
    "fa": "لطفا یکی از دسته‌بندی‌های زیر را برای مشاهده طرح‌ها انتخاب کنید:",
    "ar": "يرجى اختيار إحدى الفئات التالية لعرض الخطط:",
    "ru": "Для просмотра планов выберите одну из следующих категорий:",
    "tr": "Planları görüntülemek için lütfen aşağıdaki kategorilerden birini seçin:",
    "es": "Seleccione una de las siguientes categorías para ver los planes:"
  },
  "🎁 Redeem Code": {
    "fa": "🎁 اعمال کد هدیه",
    "ar": "🎁 استرداد الرمز",
    "ru": "🎁 Активировать код",
    "tr": "🎁 Kodu Kullan",
    "es": "🎁 Canjear código"
  },
  "❌ You have no active subscriptions registered.": {
    "fa": "❌ شما تا کنون هیچ سرویس اشتراکی در حساب خود دریافت نکرده‌اید.",
    "ar": "❌ ليس لديك اشتراكات نشطة مسجلة.",
    "ru": "❌ У вас не зарегистрировано активных подписок.",
    "tr": "❌ Kayıtlı aktif aboneliğiniz yok.",
    "es": "❌ No tienes suscripciones activas registradas."
  },
  "Free test is not available right now.": {
    "fa": "اکانت تست رایگان فعلا موجود نیست.",
    "ar": "الاختبار المجاني غير متوفر في الوقت الحالي.",
    "ru": "Бесплатный тест сейчас недоступен.",
    "tr": "Ücretsiz test şu anda mevcut değil.",
    "es": "La prueba gratuita no está disponible en este momento."
  },
  "Instant support AI offline.": {
    "fa": "🤖 پاسخگوی خودکار غیرفعال است. لطفا به پشتیبانی انسانی پیام دهید.",
    "ar": "دعم فوري لمنظمة العفو الدولية دون اتصال بالإنترنت.",
    "ru": "Мгновенная поддержка AI в автономном режиме.",
    "tr": "AI çevrimdışı anında destek.",
    "es": "Soporte instantáneo AI sin conexión."
  },
  "Thank you for your feedback.": {
    "fa": "💌 با تشکر از بازخورد شما. نظرات شما ثبت خواهد شد.",
    "ar": "شكرا لتعليقاتك.",
    "ru": "Спасибо за ваш отзыв.",
    "tr": "Geri bildiriminiz için teşekkür ederiz.",
    "es": "Gracias por tus comentarios."
  },
  "Tutorials coming soon.": {
    "fa": "🌐 <b>راهنمای فعال‌سازی و اتصال به سرویس (لینک سابسکریپشن)</b>\\n\\nکاربر گرامی، ضمن تشکر از انتخاب و اعتماد شما، روش فعال‌سازی و راه‌اندازی سرویس به شرح زیر می‌باشد:\\n\\n۱. نرم‌افزار متناسب با سیستم‌عامل خود را دانلود و نصب کنید:\\n• اندروید: v2rayNG\\n• آیفون (iOS): V2box یا Streisand\\n• ویندوز: Nekoray یا v2rayN\\n\\n۲. لینک اشتراک (سابسکریپشن) دریافتی از ربات را کپی نمایید.\\n\\n۳. وارد نرم‌افزار شده و پیوند کپی شده را اضافه نمایید (معمولاً دکمه + و انتخاب گزینه Import from clipboard یا Add Subscription).\\n\\n۴. روی گزینه Update Subscription کلیک کنید تا تمام سرورها بارگذاری شوند.\\n\\n۵. یکی از سرورها را انتخاب کرده و اتصال را برقرار نمایید. در صورت بروز هرگونه مشکل با دکمه پشتیبانی در تماس باشید.",
    "ar": "الدروس قريبا.",
    "ru": "Скоро появятся обучающие материалы.",
    "tr": "Eğitimler yakında gelecek.",
    "es": "Próximamente tutoriales."
  },
  "🎟️ <b>File Support Ticket:</b>\\n\\nPlease type the <b>Subject</b> of your support request (e.g. Server down, subscription issue, etc.):": {
    "fa": "🎟️ <b>ثبت تیکت دیجیتال پشتیبانی:</b>\\n\\nدر این بخش شما یک پرونده الکترونیکی با دپارتمان پشتیبانی دالتون ایجاد می‌کنید.\\n\\nلطفاً <b>موضوع تیکت خود</b> (به عنوان مثال: قطع بودن سرور، عدم تمدید، شارژ نادرست کیف پول و...) را وارد کنید:",
    "ar": "🎟️ <b>ملف تذكرة الدعم:</b>\\n\\nيُرجى كتابة <b>الموضوع</b> لطلب الدعم الخاص بك (على سبيل المثال، تعطل الخادم، أو مشكلة الاشتراك، وما إلى ذلك):",
    "ru": "🎟️ <b>Запрос в службу поддержки файлов:</b>\\n\\nУкажите <b>Тему</b> вашего запроса в службу поддержки (например, сбой сервера, проблема с подпиской и т. д.):",
    "tr": "����️ <b>Dosya Destek Bildirimi:</b>\\n\\nLütfen destek talebinizin <b>Konusunu</b> yazın (ör. Sunucu kapalı, abonelik sorunu vb.):",
    "es": "🎟️ <b>Archivar ticket de soporte:</b>\\n\\nEscriba el <b>Asunto</b> de su solicitud de soporte (por ejemplo, servidor caído, problema de suscripción, etc.):"
  },
  "🎧 <b>DalToon Support & Ticketing Center:</b>\\n\\nOur support operations are live 24/7. You can contact support directly or register an official ticket trace.\\n\\nPlease choose one of the options below:": {
    "fa": "🎧 <b>مرکز پشتیبانی و تیکتینگ هوشمند دالتون:</b>\\n\\nهم‌اکنون پشتیبانی ما به صورت ۲۴ ساعته فعال است. شما می‌توانید مستقیماً با تیم پشتیبانی چت کنید یا یک تیکت رسمی ثبت نمایید تا به طور دقیق پرونده شما بررسی شود.\\n\\nلطفاً یکی از گزینه‌های زیر را انتخاب نمایید:",
    "ar": "🎧 <b>مركز دعم DalToon وحجز التذاكر:</b>\\n\\nعمليات الدعم لدينا متاحة على مدار الساعة طوال أيام الأسبوع. يمكنك الاتصال بالدعم مباشرة أو ��سجيل تتبع رسمي للتذكرة.\\n\\nالرجاء اختيار أحد الخيارات أدناه:",
    "ru": "🎧 <b>Центр поддержки и продажи билетов DalToon:</b>\\n\\nНаша служба поддержки работает круглосуточно и без выходных. Вы можете напрямую связаться со службой поддержки или зарегистрировать официальную отслеживание заявок.\\n\\nВыберите один из вариантов ниже:",
    "tr": "🎧 <b>DalToon Destek ve Bilet Merkezi:</b>\\n\\nDestek operasyonlarımız 7/24 canlı yayındadır. Doğrudan destek ekibiyle iletişime geçebilir veya resmi bir bilet takibi kaydedebilirsiniz.\\n\\nLütfen aşağıdaki seçeneklerden birini seçin:",
    "es": "🎧 <b>Centro de venta de entradas y soporte de DalToon:</b>\\n\\nNuestras operaciones de soporte están activas las 24 horas, los 7 días de la semana. Puede ponerse en contacto con el soporte directamente o registrar un seguimiento de ticket oficial.\\n\\nElija una de las siguientes opciones:"
  },
  "🎟️ File Support Ticket": {
    "fa": "🎟️ ثبت تیکت دیجیتال",
    "ar": "🎟️ تذكرة دعم الملف",
    "ru": "🎟️ Заявка на поддержку файлов",
    "tr": "🎟️ Dosya Destek Bileti",
    "es": "🎟️ Presentar ticket de soporte"
  },
  "💬 Chat with Support Agent": {
    "fa": "💬 پشتیبانی مستقیم تلگرام",
    "ar": "💬 الدردشة مع وكيل الدعم",
    "ru": "💬 Чат с агентом службы поддержки",
    "tr": "💬 Destek Temsilcisi ile sohbet edin",
    "es": "💬 Chatea con el agente de soporte"
  },
  "Command not recognized. Please use one of the action buttons on the visual keyboard panel below. 👇": {
    "fa": "دستور ارسال شده متوجه نشدم. لطفا از دکمه‌های منوی زیر استفاده کنید. 👇",
    "ar": "لم يتم التعرف على الأمر. يرجى استخدام أحد أزرار الإجراءات الموجودة على لوحة المفاتيح المرئية أدناه. 👇",
    "ru": "Команда не распознана. Используйте одну из кнопок действий на визуальной панели клавиатуры ниже. 👇",
    "tr": "Komut tanınmadı. Lütfen aşağıdaki görsel klavye panelindeki işlem düğmelerinden birini kullanın. 👇",
    "es": "Comando no reconocido. Utilice uno de los botones de acción en el panel de teclado visual a continuación. 👇"
  },
  "Returned to main menu.": {
    "fa": "✔️ شما به منوی اصلی بازگشتید.",
    "ar": "عاد إلى القائمة الرئيسية.",
    "ru": "Вернулся в главное меню.",
    "tr": "Ana menüye dönüldü.",
    "es": "Regresó al menú principal."
  },
  "✨ Create Custom Volume Config": {
    "fa": "✨ ساخت کانفیگ با حجم دلخواه",
    "ar": "✨ إنشاء تكوين حجم مخصص",
    "ru": "✨ Создать собственную конфигурацию тома",
    "tr": "✨ Özel Birim Yapılandırması Oluşturun",
    "es": "✨ Crear configuración de volumen personalizada"
  },
  "🔙 Back to Manage": {
    "fa": "🔙 بازگشت به مدیریت",
    "ar": "🔙 العودة إلى الإدارة",
    "ru": "🔙 Вернуться к управлению",
    "tr": "🔙 Yönet'e geri dön",
    "es": "🔙 Volver a Administrar"
  },
  "Gift codes not available in demo.": {
    "fa": "🎁 قابلیت اعمال کد هدیه در شبیه‌ساز غیرفعال است.",
    "ar": "رموز الهدايا غير متوفرة في العرض التوضيحي.",
    "ru": "Подарочные коды недоступны в демо-версии.",
    "tr": "Hediye kodları demoda mevcut değil.",
    "es": "Los códigos de regalo no están disponibles en la demostración."
  },
  "💬 Send a message to <b>@daltoon_support</b> on Telegram for direct support assistance.": {
    "fa": "💬 جهت گفتگوی مستقیم تلگرام به آیدی <b>@daltoon_support</b> پیام دهید. تیم ما پس از بررسی پیام شما، فوراً گفتگو را آغاز خواهد کرد.",
    "ar": "💬 أرسل رسالة إلى <b>@daltoon_support</b> على Telegram للحصول على مساعدة الدعم المباشر.",
    "ru": "💬 Отправьте сообщение на адрес <b>@daltoon_support</b> в Telegram для получения прямой поддержки.",
    "tr": "💬 Doğrudan destek yardımı için Telegram'da <b>@daltoon_support</b> adresine bir mesaj gönderin.",
    "es": "💬 Envíe un mensaje a <b>@daltoon_support</b> en Telegram para obtener asistencia de soporte directo."
  },
  "🔄 Reset UUID": {
    "fa": "🔄 تغییر کلید (Reset UUID)",
    "ar": "🔄 إعادة تعيين UUID",
    "ru": "🔄 Сбросить UUID",
    "tr": "🔄 UUID'yi sıfırla",
    "es": "🔄 Restablecer UUID"
  },
  "🎁 Transfer Owner": {
    "fa": "🎁 انتقال مالکیت به دوست",
    "ar": "🎁نقل المالك",
    "ru": "🎁 Владелец трансфера",
    "tr": "🎁 Sahibini Aktar",
    "es": "🎁 Transferir propietario"
  },
  "💳 Custom Renewal": {
    "fa": "💳 تمدید با حجم و روز دلخواه",
    "ar": "💳 تجديد مخصص",
    "ru": "💳 Пользовательское продление",
    "tr": "💳 Özel Yenileme",
    "es": "💳 Renovación personalizada"
  },
  "🔙 Core Menu": {
    "fa": "🔙 برگشت به منوی کل",
    "ar": "🔙 القائمة الأساسية",
    "ru": "🔙 Основное меню",
    "tr": "🔙 Temel Menü",
    "es": "🔙 Menú principal"
  },
  "✨ <b>Create Custom Configuration</b>\\n\\nPlease type your desired English <b>Username</b> (English letters, numbers, hyphens, no spaces):": {
    "fa": "✨ <b>فرآیند ساخت کانفیگ با مشخصات دلخواه</b>\\n\\nلطفاً <b>نام کاربری (Username)</b> انگلیسی مورد نظر خود را بنویسید:\\n⚠️ نام کاربری فقط شامل حروف انگلیسی، اعداد و خط تیره باشد (بدون فاصله):",
    "ar": "✨ <b>إنشاء تكوين مخصص</b>\\n\\nالرجاء كتابة <b>اسم المستخدم</b> باللغة الإنجليزية (الحروف الإنجليزية، والأرقام، والواصلات، وبدون مسافات):",
    "ru": "✨ <b>Создать пользовательскую конфигурацию</b>\\n\\nПожалуйста, введите желаемое английское <b>имя пользователя</b> (английские буквы, цифры, дефисы, без пробелов):",
    "tr": "✨ <b>Özel Yapılandırma Oluşturun</b>\\n\\nLütfen istediğiniz İngilizce <b>Kullanıcı Adını</b> yazın (İngilizce harfler, sayılar, kısa çizgiler, boşluksuz):",
    "es": "✨ <b>Crear configuración personalizada</b>\\n\\nEscriba el <b>nombre de usuario</b> en inglés que desee (letras, números, guiones en inglés, sin espacios):"
  },
  "⏳ Provisioning your custom client on 3x-ui panel...": {
    "fa": "⏳ در حال ساخت اکانت دلخواه شما و ارتباط با پنل...",
    "ar": "⏳ توفير العميل المخصص الخاص بك على لوحة 3x-ui...",
    "ru": "⏳ Подготовка вашего индивидуального клиента на панели 3x-ui...",
    "tr": "⏳ Özel istemcinizin provizyonu 3x-ui panelde yapılıyor...",
    "es": "⏳ Aprovisionamiento de su cliente personalizado en el panel 3x-ui..."
  },
  "❌ Insufficient funds in your simulated wallet.": {
    "fa": "❌ موجودی کیف پول شما برای تمدید کافی نیست.",
    "ar": "❌ الأموال غير كافية في محفظتك المحاكاة.",
    "ru": "❌ Недостаточно средств на вашем симулированном кошельке.",
    "tr": "❌ Simüle edilmiş cüzdanınızda yeterli para yok.",
    "es": "❌ Fondos insuficientes en su billetera simulada."
  },
  "🔄 <b>Renew Subscription with Custom Volume and Duration:</b>\\n\\n🔻 Please enter extra traffic limit in <b>GB</b> (e.g. <code>30</code>):": {
    "fa": "🔄 <b>تمدید اشتراک با ترافیک و روز دلخواه:</b>\\n\\n🔻 لطفاً مقدار ترافیک اضافی مورد نیاز خود را به <b>گیگابایت (GB)</b> وارد کنید:\\n⚠️ عدد ارسال شده باید یک عدد انگلیسی مثبت باشد (مثلاً <code>30</code>)",
    "ar": "🔄 <b>تجديد الاشتراك بحجم ومدة مخصصين:</b>\\n\\n🔻 يرجى إدخال حد حركة المرور الإضافي بـ <b>جيجابايت</b> (على سبيل المثال <code>30</code>):",
    "ru": "🔄 <b>Продлить подписку с пользовательским объемом и продолжительностью:</b>\\n\\n🔻 Введите дополнительный лимит трафика в <b>ГБ</b> (например, <code>30</code>):",
    "tr": "🔄 <b>Aboneliği Özel Hacim ve Süre ile Yenileyin:</b>\\n\\n🔻 Lütfen <b>GB</b> cinsinden ekstra trafik sınırını girin (ör. <code>30</code>):",
    "es": "🔄 <b>Renovar la suscripción con volumen y duración personalizados:</b>\\n\\n🔻 Ingrese el límite de tráfico adicional en <b>GB</b> (por ejemplo, <code>30</code>):"
  },
  "📸 Send Receipt": {
    "fa": "📸 ارسال فیش واریز",
    "ar": "📸 إرسال الإيصال",
    "ru": "📸 Отправить квитанцию",
    "tr": "📸 Makbuz Gönder",
    "es": "📸 Enviar recibo"
  },
  "⏳ Applying renewal and updating your service...": {
    "fa": "⏳ در حال اعمال تمدید و به‌روزرسانی سرویس شما...",
    "ar": "⏳تطبيق تجديد وتحديث خدمتك...",
    "ru": "⏳ Применение продления и обновление вашего сервиса...",
    "tr": "⏳ Yenileme uygulanıyor ve hizmetiniz güncelleniyor...",
    "es": "⏳ Solicitando renovación y actualizando tu servicio..."
  },
  "⚠️ <b>Change UUID Warning</b>\\n\\nDoing this invalidates the old config URL globally. Are you sure you wish to rotate?": {
    "fa": "⚠️ <b>هشدار تعویض شناسه اتصال (Reset UUID)</b>\\n\\nبا تغییر شناسه، اتصال روی تمام برنامه‌های کلاینت قبلی شما باطل شده و فوراً قطع می‌گردد.\\nآیا مایل به تولید لینک اتصال جدید هستید؟",
    "ar": "⚠️ <b>تحذير تغيير UUID</b>\\n\\nيؤدي القيام بذلك إلى إبطال عنوان URL للتكوين القديم عالميًا. هل أنت متأكد أنك ترغب في التدوير؟",
    "ru": "⚠️ <b>Предупреждение об изменении UUID</b>\\n\\nПри этом старый URL-адрес конфигурации станет недействительным во всем мире. Вы уверены, что хотите повернуть?",
    "tr": "⚠️ <b>UUID Uyarısını Değiştir</b>\\n\\nBunu yapmak eski yapılandırma URL'sini genel olarak geçersiz kılar. Döndürmek istediğinizden emin misiniz?",
    "es": "⚠️ <b>Advertencia sobre cambiar UUID</b>\\n\\nHacer esto invalida la URL de configuración anterior a nivel mundial. ¿Está seguro de que desea rotar?"
  },
  "✅ Yes, issue new UUID": {
    "fa": "✅ بله، کلید جدید صادر شود",
    "ar": "✅ نعم، قم بإصدار UUID جديد",
    "ru": "✅ Да, выдать новый UUID",
    "tr": "✅ Evet, yeni UUID yayınlayın",
    "es": "✅ Sí, emitir un nuevo UUID"
  },
  "⏳ Rotating encryption credentials...": {
    "fa": "⏳ در حال باطل ساختن لایسنس قبلی و تخصیص شناسه اتصال جدید...",
    "ar": "⏳ جارٍ تدوير بيانات اعتماد التشفير...",
    "ru": "⏳ Изменение учетных данных шифрования...",
    "tr": "⏳ Şifreleme kimlik bilgileri döndürülüyor...",
    "es": "⏳ Rotación de credenciales de cifrado..."
  },
  "🎁 <b>Gift Subscription Transfer</b>\\n\\nPlease enter the destination <b>Telegram User ID</b> or <b>Username</b> (no @) into this chat:": {
    "fa": "🎁 <b>مراحل هدیه دادن و انتقال مالکیت لایسنس سرویس</b>\\n\\nلطفاً <b>آیدی عددی تلگرام</b> یا <b>آیدی تلگرامی</b> کاربر مقصد را (به انگلیسی، بدون علامت @) در همین چت ارسال کنید:\\n\\nمثال: <code>6536288293</code> یا <code>reza_vpn</code>\\n\\n⚠️ توجه: پس از انتقال مالکیت، این کانفیگ و حجم و روزهایش متعلق به آیدی مقصد شده و از دسترسی شما خارج می‌شود.",
    "ar": "🎁 <b>تحويل اشتراك الهدية</b>\\n\\nالرجاء إدخال الوجهة <b>معرف مستخدم Telegram</b> أو <b>اسم ا��مستخدم</b> (بدون @) في هذه الدردشة:",
    "ru": "🎁 <b>Передача подарочной подписки</b>\\n\\nПожалуйста, введите <b>Идентификатор пользователя Telegram</b> или <b>Имя пользователя</b> (без @) в этот чат:",
    "tr": "🎁 <b>Hediye Abonelik Transferi</b>\\n\\nLütfen bu sohbete hedef <b>Telegram Kullanıcı Kimliğini</b> veya <b>Kullanıcı adını</b> (@ yok) girin:",
    "es": "🎁 <b>Transferencia de suscripción de regalo</b>\\n\\nIngrese el <b>ID de usuario de Telegram</b> o el <b>Nombre de usuario</b> (sin @) de destino en este chat:"
  },
  "⏳ Confirming receipt state...": {
    "fa": "⏳ در حال استعلام وضعیت پرداخت از بستر بلاک‌چین...",
    "ar": "⏳تأكيد حالة الاستلام...",
    "ru": "⏳ Подтверждение статуса получения...",
    "tr": "⏳ Alındı durumu onaylanıyor...",
    "es": "⏳ Confirmando estado de recepción..."
  },
  "Yes, complete buy": {
    "fa": "✅ بله، خرید نهایی شود",
    "ar": "نعم شراء كامل",
    "ru": "Да, полная покупка",
    "tr": "Evet, satın almayı tamamla",
    "es": "Si, compra completa"
  },
  "Cancel and back": {
    "fa": "❌ انصراف و برگشت به منو",
    "ar": "إلغاء والعودة",
    "ru": "Отменить и вернуться",
    "tr": "İptal et ve geri dön",
    "es": "Cancelar y regresar"
  },
  "Please enter a valid amount.": {
    "fa": "لطفا مبلغ معتبری وارد کنید.",
    "ar": "الرجاء إدخال مبلغ صالح.",
    "ru": "Пожалуйста, введите действительную сумму.",
    "tr": "Lütfen geçerli bir tutar girin.",
    "es": "Por favor ingrese una cantidad válida."
  },
  "T": {
    "fa": "ت",
    "ar": "ت",
    "ru": "Т",
    "tr": "T",
    "es": "t"
  },
  "active": {
    "fa": "فعال",
    "ar": "نشط",
    "ru": "активный",
    "tr": "aktif",
    "es": "activo"
  },
  "banned": {
    "fa": "مسدود",
    "ar": "محظور",
    "ru": "запрещен",
    "tr": "yasaklandı",
    "es": "prohibido"
  },
  "Daltoon Bot 🤖": {
    "fa": "ربات تلگرام دالتون بات 🤖",
    "ar": "دالتون بوت 🤖",
    "ru": "Далтун-бот 🤖",
    "tr": "Daltoon Botu 🤖",
    "es": "Bot Daltoon 🤖"
  },
  "Bot active": {
    "fa": "ربات فعال است",
    "ar": "بوت نشط",
    "ru": "Бот активен",
    "tr": "Bot etkin",
    "es": "robot activo"
  },
  "Creator: @mDaltoon": {
    "fa": "سازنده: @mDaltoon",
    "ar": "المنشئ: @mDaltoon",
    "ru": "Создатель: @mDaltoon",
    "tr": "Yaratıcı: @mDaltoon",
    "es": "Creador: @mDaltoon"
  },
  "📷 Scan to connect": {
    "fa": "📷 برای اتصال اسکن نمایید",
    "ar": "📷 المسح للاتصال",
    "ru": "📷 Сканируйте для подключения",
    "tr": "📷 Bağlanmak için tarayın",
    "es": "📷 Escanee para conectarse"
  },
  "Card-to-Card Receipt Details": {
    "fa": "اطلاعات حواله واریز کارت به کارت",
    "ar": "تفاصيل إيصال من بطاقة إلى بطاقة",
    "ru": "Детали квитанции с карты на карту",
    "tr": "Karttan Karta Fiş Detayları",
    "es": "Detalles del recibo de tarjeta a tarjeta"
  },
  "Are you sure you want to delete this colleague account?": {
    "fa": "آیا از حذف این حساب مستقل همکار اطمینان دارید؟",
    "ar": "هل أنت متأكد أنك تريد حذف حساب الزميل هذا؟",
    "ru": "Вы уверены, что хотите удалить эту учетную запись коллеги?",
    "tr": "Bu iş arkadaşınızın hesabını silmek istediğinizden emin misiniz?",
    "es": "¿Está seguro de que desea eliminar la cuenta de este colega?"
  },
  "Account deleted successfully.": {
    "fa": "حساب همکار حذف شد.",
    "ar": "تم حذف الحساب بنجاح.",
    "ru": "Аккаунт успешно удален.",
    "tr": "Hesap başarıyla silindi.",
    "es": "Cuenta eliminada exitosamente."
  },
  "Are you sure you want to reset credentials for this account?": {
    "fa": "آیا از ریست کردن نام کاربری و رمز عبور این حساب همکار اطمینان دارید؟",
    "ar": "هل أنت متأكد أنك تريد إعادة تعيين بيانات الاعتماد لهذا الحساب؟",
    "ru": "Вы уверены, что хотите сбросить учетные данные для этой учетной записи?",
    "tr": "Bu hesaba ilişkin kimlik bilgilerini sıfırlamak istediğinizden emin misiniz?",
    "es": "¿Está seguro de que desea restablecer las credenciales de esta cuenta?"
  },
  "Credentials reset successfully.": {
    "fa": "مشخصات اتصال نمایندگی با موفقیت ریست شد.",
    "ar": "تمت إعادة تعيين بيانات الاعتماد بنجاح.",
    "ru": "Учетные данные успешно сброшены.",
    "tr": "Kimlik bilgileri başarıyla sıfırlandı.",
    "es": "Las credenciales se restablecieron exitosamente."
  },
  "Changes saved successfully.": {
    "fa": "تغییرات با موفقیت ذخیره شد.",
    "ar": "تم حفظ التغييرات بنجاح.",
    "ru": "Изменения успешно сохранены.",
    "tr": "Değişiklikler başarıyla kaydedildi.",
    "es": "Los cambios se guardaron correctamente."
  },
  "Are you sure you want to reset usage to zero?": {
    "fa": "آیا از صفر کردن حجم مصرفی همکار اطمینان دارید؟",
    "ar": "هل أنت متأكد أنك تريد إعادة ضبط الاستخدام إلى الصفر؟",
    "ru": "Вы уверены, что хотите сбросить использование до нуля?",
    "tr": "Kullanımı sıfıra sıfırlamak istediğinizden emin misiniz?",
    "es": "¿Está seguro de que desea restablecer el uso a cero?"
  },
  "Usage reset successfully.": {
    "fa": "حجم مصرفی همکار با موفقیت صفر شد.",
    "ar": "تمت إعادة ضبط الاستخدام بنجاح.",
    "ru": "Использование успешно сброшено.",
    "tr": "Kullanım başarıyla sıfırlandı.",
    "es": "El uso se restableció correctamente."
  },
  "ltr": {
    "fa": "rtl",
    "ar": "لتر",
    "ru": "литр",
    "tr": "ltr",
    "es": "litros"
  },
  "Colleague Issued Accounts": {
    "fa": "حساب‌های صادر شده همکاران",
    "ar": "حسابات الزملاء الصادرة",
    "ru": "Аккаунты, выпущенные коллегами",
    "tr": "Meslektaş Tarafından Verilen Hesaplar",
    "es": "Cuentas emitidas por colegas"
  },
  "User ID": {
    "fa": "مخاطب (آیدی)",
    "ar": "معرف المستخدم",
    "ru": "Идентификатор пользователя",
    "tr": "Kullanıcı Kimliği",
    "es": "ID de usuario"
  },
  "Package": {
    "fa": "پکیج",
    "ar": "الحزمة",
    "ru": "Пакет",
    "tr": "Paket",
    "es": "Paquete"
  },
  "Prefix": {
    "fa": "پیشوند",
    "ar": "بادئة",
    "ru": "Префикс",
    "tr": "Önek",
    "es": "Prefijo"
  },
  "Recovery Token": {
    "fa": "توکن بازیابی",
    "ar": "رمز الاسترداد",
    "ru": "Токен восстановления",
    "tr": "Kurtarma Jetonu",
    "es": "Ficha de recuperación"
  },
  "Username": {
    "fa": "یوزرنیم",
    "ar": "اسم المستخدم",
    "ru": "Имя пользователя",
    "tr": "Kullanıcı adı",
    "es": "Nombre de usuario"
  },
  "Password": {
    "fa": "رمز عبور",
    "ar": "كلمة المرور",
    "ru": "Пароль",
    "tr": "Şifre",
    "es": "Contraseña"
  },
  "Total Traffic": {
    "fa": "کل حجم",
    "ar": "إجمالي حركة المرور",
    "ru": "Общий трафик",
    "tr": "Toplam Trafik",
    "es": "Tráfico total"
  },
  "Allocated": {
    "fa": "تخصیص داده شده",
    "ar": "المخصصة",
    "ru": "Выделено",
    "tr": "Tahsis Edildi",
    "es": "Asignado"
  },
  "Real Usage": {
    "fa": "مجموع مصرف کاربر",
    "ar": "الاستخدام الحقيقي",
    "ru": "Реальное использование",
    "tr": "Gerçek Kullanım",
    "es": "Uso real"
  },
  "Status": {
    "fa": "وضعیت",
    "ar": "الحالة",
    "ru": "Статус",
    "tr": "Durum",
    "es": "Estado"
  },
  "No accounts issued yet.": {
    "fa": "هیچ حسابی در سیستم صادر نشده است.",
    "ar": "لم يتم إصدار أي حسابات حتى الآن.",
    "ru": "Счета еще не выданы.",
    "tr": "Henüz hesap yayınlanmadı.",
    "es": "Aún no se han emitido cuentas."
  },
  "Edit Account Traffic": {
    "fa": "ویرایش حجم حساب همکار",
    "ar": "تحرير حركة الحساب",
    "ru": "Редактировать трафик аккаунта",
    "tr": "Hesap Trafiğini Düzenle",
    "es": "Editar tráfico de cuenta"
  },
  "Total Traffic (GB)": {
    "fa": "کل حجم (گیگابایت)",
    "ar": "إجمالي حركة المرور (جيجابايت)",
    "ru": "Общий трафик (ГБ)",
    "tr": "Toplam Trafik (GB)",
    "es": "Tráfico total (GB)"
  },
  "Increasing this value expands the colleague's limit for creating users.": {
    "fa": "با افزایش این عدد، سقف مجاز همکار برای ایجاد کاربر افزایش می‌یابد.",
    "ar": "تؤدي زيادة هذه القيمة إلى توسيع حد الزميل لإنشاء المستخدمين.",
    "ru": "Увеличение этого значения расширяет лимит создания пользователей для коллеги.",
    "tr": "Bu değerin arttırılması, iş arkadaşının kullanıcı oluşturma sınırını genişletir.",
    "es": "Al aumentar este valor se amplía el límite del colega para crear usuarios."
  },
  "Reset Usage to Zero": {
    "fa": "صفر کردن حجم مصرفی همکار",
    "ar": "إعادة ضبط الاستخدام إلى الصفر",
    "ru": "Сбросить использование до нуля",
    "tr": "Kullanımı Sıfıra Sıfırla",
    "es": "Restablecer el uso a cero"
  },
  "Confirm Operation": {
    "fa": "تایید نهایی عملیات",
    "ar": "تأكيد العملية",
    "ru": "Подтвердить операцию",
    "tr": "İşlemi Onayla",
    "es": "Confirmar operación"
  },
  "Confirm": {
    "fa": "تایید",
    "ar": "تأكيد",
    "ru": "Подтвердить",
    "tr": "Onayla",
    "es": "Confirmar"
  },
  "Category saved.": {
    "fa": "دسته همکار ذخیره شد.",
    "ar": "تم حفظ الفئة.",
    "ru": "Категория сохранена.",
    "tr": "Kategori kaydedildi.",
    "es": "Categoría guardada."
  },
  "Are you sure you want to delete this category?": {
    "fa": "آیا از حذف این دسته‌بندی اطمینان دارید؟",
    "ar": "هل أنت متأكد أنك تريد حذف هذه الفئة؟",
    "ru": "Вы уверены, что хотите удалить эту категорию?",
    "tr": "Bu kategoriyi silmek istediğinizden emin misiniz?",
    "es": "¿Estás seguro de que deseas eliminar esta categoría?"
  },
  "Category deleted.": {
    "fa": "دسته حذف شد.",
    "ar": "تم حذف الفئة.",
    "ru": "Категория удалена.",
    "tr": "Kategori silindi.",
    "es": "Categoría eliminada."
  },
  "Package saved successfully.": {
    "fa": "بسته با موفقیت ذخیره شد.",
    "ar": "تم حفظ الحزمة بنجاح.",
    "ru": "Пакет успешно сохранен.",
    "tr": "Paket başarıyla kaydedildi.",
    "es": "Paquete guardado exitosamente."
  },
  "Are you sure you want to delete this package?": {
    "fa": "آیا از حذف این بسته اطمینان دارید؟",
    "ar": "هل أنت متأكد أنك تريد حذف هذه الحزمة؟",
    "ru": "Вы уверены, что хотите удалить этот пакет?",
    "tr": "Bu paketi silmek istediğinizden emin misiniz?",
    "es": "¿Está seguro de que desea eliminar este paquete?"
  },
  "Package deleted successfully.": {
    "fa": "بسته با موفقیت حذف شد.",
    "ar": "تم حذف الحزمة بنجاح.",
    "ru": "Пакет успешно удален.",
    "tr": "Paket başarıyla silindi.",
    "es": "Paquete eliminado exitosamente."
  },
  "Colleague Servers": {
    "fa": "سرورهای همکاران",
    "ar": "خوادم الزملاء",
    "ru": "Коллеги по серверам",
    "tr": "Meslektaş Sunucuları",
    "es": "Servidores de colegas"
  },
  "Colleague Packages": {
    "fa": "بسته‌های همکاران",
    "ar": "حزم الزملاء",
    "ru": "Пакеты для коллег",
    "tr": "Meslektaş Paketleri",
    "es": "Paquetes para colegas"
  },
  "Issued Accounts": {
    "fa": "حساب‌های صادر شده",
    "ar": "الحسابات الصادرة",
    "ru": "Выпущенные счета",
    "tr": "Verilen Hesaplar",
    "es": "Cuentas emitidas"
  },
  "Categories": {
    "fa": "مدیریت دسته‌بندی‌ها",
    "ar": "الفئات",
    "ru": "Категории",
    "tr": "Kategoriler",
    "es": "Categorías"
  },
  "Add Category": {
    "fa": "تعریف دسته",
    "ar": "أضف فئة",
    "ru": "Добавить категорию",
    "tr": "Kategori Ekle",
    "es": "Agregar categoría"
  },
  "Name": {
    "fa": "نام دسته‌بندی",
    "ar": "الاسم",
    "ru": "Имя",
    "tr": "İsim",
    "es": "Nombre"
  },
  "Emoji": {
    "fa": "ایموجی",
    "ar": "الرموز التعبيرية",
    "ru": "Эмодзи",
    "tr": "Emoji",
    "es": "emojis"
  },
  "Save": {
    "fa": "ذخیره",
    "ar": "حفظ",
    "ru": "Сохранить",
    "tr": "Kaydet",
    "es": "Guardar"
  },
  "Move Up": {
    "fa": "انتقال به بالا",
    "ar": "تحرك لأعلى",
    "ru": "Двигаться вверх",
    "tr": "Yukarı Taşı",
    "es": "Subir"
  },
  "Move Down": {
    "fa": "انتقال به پایین",
    "ar": "تحرك للأسفل",
    "ru": "Вниз",
    "tr": "Aşağı Taşı",
    "es": "Mover hacia abajo"
  },
  "Direct Position Selection": {
    "fa": "انتخاب مستقیم جایگاه",
    "ar": "اختيار الموقف المباشر",
    "ru": "Прямой выбор позиции",
    "tr": "Doğrudan Pozisyon Seçimi",
    "es": "Selección de posición directa"
  },
  "Add New Package": {
    "fa": "افزودن پکیج جدید",
    "ar": "إضافة باقة جديدة",
    "ru": "Добавить новый пакет",
    "tr": "Yeni Paket Ekle",
    "es": "Agregar nuevo paquete"
  },
  "Edit Package": {
    "fa": "ویرایش پکیج",
    "ar": "تحرير الحزمة",
    "ru": "Редактировать пакет",
    "tr": "Paketi Düzenle",
    "es": "Editar paquete"
  },
  "Register New Package": {
    "fa": "ثبت پکیج جدید",
    "ar": "سجل باقة جديدة",
    "ru": "Зарегистрировать новый пакет",
    "tr": "Yeni Paket Kaydı",
    "es": "Registrar nuevo paquete"
  },
  "Title": {
    "fa": "عنوان پکیج",
    "ar": "العنوان",
    "ru": "Название",
    "tr": "Başlık",
    "es": "Título"
  },
  "Price (IRT)": {
    "fa": "قیمت (تومان)",
    "ar": "السعر (IRT)",
    "ru": "Цена (ИРТ)",
    "tr": "Fiyat (IRT)",
    "es": "Precio (IRT)"
  },
  "Traffic (GB)": {
    "fa": "حجم (گیگابایت)",
    "ar": "حركة المرور (جيجابايت)",
    "ru": "Трафик (ГБ)",
    "tr": "Trafik (GB)",
    "es": "Tráfico (GB)"
  },
  "Min GB per Client": {
    "fa": "حداقل حجم ساخت کلاینت",
    "ar": "الحد الأدنى للجيجابايت لكل عميل",
    "ru": "Мин ГБ на клиента",
    "tr": "İstemci başına minimum GB",
    "es": "GB mínimo por cliente"
  },
  "Category": {
    "fa": "دسته‌بندی",
    "ar": "الفئة",
    "ru": "Категория",
    "tr": "Kategori",
    "es": "categoría"
  },
  "No Category": {
    "fa": "بدون دسته‌بندی",
    "ar": "لا يوجد فئة",
    "ru": "Нет категории",
    "tr": "Kategori Yok",
    "es": "Sin categoría"
  },
  "Manual...": {
    "fa": "دستی...",
    "ar": "دليل...",
    "ru": "Руководство...",
    "tr": "Manuel...",
    "es": "Manual..."
  },
  "Description": {
    "fa": "توضیحات پکیج (نمایش به کاربر)",
    "ar": "الوصف",
    "ru": "Описание",
    "tr": "Açıklama",
    "es": "Descripción"
  },
  "Save Package": {
    "fa": "ذخیره پکیج",
    "ar": "حفظ الحزمة",
    "ru": "Сохранить пакет",
    "tr": "Paketi Kaydet",
    "es": "Guardar paquete"
  },
  "Edit": {
    "fa": "ویرایش",
    "ar": "تحرير",
    "ru": "Редактировать",
    "tr": "Düzenle",
    "es": "Editar"
  },
  "Delete": {
    "fa": "حذف",
    "ar": "حذف",
    "ru": "Удалить",
    "tr": "Sil",
    "es": "Eliminar"
  },
  "No packages found.": {
    "fa": "هیچ پکیجی ثبت نشده است.",
    "ar": "لم يتم العثور على الحزم.",
    "ru": "Пакеты не найдены.",
    "tr": "Hiçbir paket bulunamadı.",
    "es": "No se encontraron paquetes."
  },
  "Copy Token": {
    "fa": "کپی توکن",
    "ar": "نسخ الرمز المميز",
    "ru": "Копировать токен",
    "tr": "Jetonu Kopyala",
    "es": "Copiar token"
  },
  "Copy Username": {
    "fa": "کپی نام کاربری",
    "ar": "انسخ اسم المستخدم",
    "ru": "Копировать имя пользователя",
    "tr": "Kullanıcı Adını Kopyala",
    "es": "Copiar nombre de usuario"
  },
  "Copy Password": {
    "fa": "کپی رمز عبور",
    "ar": "نسخ كلمة المرور",
    "ru": "Скопировать пароль",
    "tr": "Şifreyi Kopyala",
    "es": "Copiar contraseña"
  },
  "Active": {
    "fa": "فعال",
    "ar": "نشط",
    "ru": "Активный",
    "tr": "Aktif",
    "es": "Activo"
  },
  "Expired": {
    "fa": "منقضی",
    "ar": "انتهت صلاحيتها",
    "ru": "Срок дейс��вия истек",
    "tr": "Süresi dolmuş",
    "es": "Caducado"
  },
  "Reset Credentials": {
    "fa": "ریست نام کاربری و رمز عبور",
    "ar": "إعادة تعيين بيانات الاعتماد",
    "ru": "Сбросить учетные данные",
    "tr": "Kimlik Bilgilerini Sıfırla",
    "es": "Restablecer credenciales"
  },
  "No accounts found.": {
    "fa": "هیچ حسابی صادر نشده است.",
    "ar": "لم يتم العثور على حسابات.",
    "ru": "Аккаунты не найдены.",
    "tr": "Hiçbir hesap bulunamadı.",
    "es": "No se encontraron cuentas."
  },
  "Are you sure you want to delete this gift code?": {
    "fa": "آیا از حذف این کدهدیه اطمینان دارید؟",
    "ar": "هل أنت متأكد أنك تريد حذف رمز الهدية هذا؟",
    "ru": "Вы уверены, что хотите удалить этот подарочный код?",
    "tr": "Bu hediye kodunu silmek istediğinizden emin misiniz?",
    "es": "¿Estás seguro de que deseas eliminar este código de regalo?"
  },
  "Are you sure you want to delete this promo code?": {
    "fa": "آیا از حذف این تخفیف اطمینان دارید؟",
    "ar": "هل أنت متأكد أنك تريد حذف هذا الرمز الترويجي؟",
    "ru": "Вы уверены, что хотите удалить этот промокод?",
    "tr": "Bu promosyon kodunu silmek istediğinizden emin misiniz?",
    "es": "¿Estás seguro de que deseas eliminar este código de promoción?"
  },
  "Could not reach full-stack server.": {
    "fa": "خطا در برقراری ارتباط با سرور.",
    "ar": "لا يمكن الوصول إلى خادم المكدس الكامل.",
    "ru": "Не удалось подключиться к полнофункциональному серверу.",
    "tr": "Tam yığın sunucusuna ulaşılamadı.",
    "es": "No se pudo acceder al servidor de pila completa."
  },
  "left-3": {
    "fa": "right-3",
    "ar": "اليسار-3",
    "ru": "слева-3",
    "tr": "sol-3",
    "es": "izquierda-3"
  },
  "pl-10 pr-4": {
    "fa": "pr-10 pl-4",
    "ar": "رر-10 العلاقات العامة-4",
    "ru": "пл-10 пр-4",
    "tr": "pl-10 pr-4",
    "es": "pl-10 pr-4"
  },
  "pl-10 pr-11": {
    "fa": "pr-10 pl-11",
    "ar": "رر-10 بر-11",
    "ru": "пл-10 пр-11",
    "tr": "pl-10 pr-11",
    "es": "pl-10 pr-11"
  },
  "right-3": {
    "fa": "left-3",
    "ar": "الحق-3",
    "ru": "правильно-3",
    "tr": "sağ-3",
    "es": "derecha-3"
  },
  "Modify credentials or add sub-admins anytime using the daltoon-dashboard server tool.": {
    "fa": "رمز عبور و یوزرهای ادمین را با استفاده از دستور daltoon-dashboard بازیابی کنید.",
    "ar": "قم بتعديل بيانات الاعتماد أو أضف مسؤولين فرعيين في أي وقت باستخدام أداة خادم daltoon-dashboard.",
    "ru": "Измените учетные данные или добавьте субадминистраторов в любое время с помощью серверного инструмента daltoon-dashboard.",
    "tr": "Daltoon-dashboard sunucu aracını kullanarak istediğiniz zaman kimlik bilgilerini değiştirin veya alt yöneticiler ekleyin.",
    "es": "Modifique las credenciales o agregue subadministradores en cualquier momento utilizando la herramienta del servidor daltoon-dashboard."
  },
  "Server name is required.": {
    "fa": "نام سرور الزامی است.",
    "ar": "اسم الخادم مطلوب.",
    "ru": "Требуется имя сервера.",
    "tr": "Sunucu adı gerekli.",
    "es": "El nombre del servidor es obligatorio."
  },
  "Connection failed.": {
    "fa": "خطا در اتصال به سرور.",
    "ar": "فشل الاتصال.",
    "ru": "Соединение не удалось.",
    "tr": "Bağlantı başarısız oldu.",
    "es": "La conexión falló."
  },
  "Add New Server +": {
    "fa": "افزودن سرور جدید +",
    "ar": "إضافة خادم جديد +",
    "ru": "Добавить новый сервер +",
    "tr": "Yeni Sunucu Ekle +",
    "es": "Agregar nuevo servidor +"
  },
  "Edit Server": {
    "fa": "ویرایش سرور",
    "ar": "تحرير الخادم",
    "ru": "Редактировать сервер",
    "tr": "Sunucuyu Düzenle",
    "es": "Editar servidor"
  },
  "Add New Connection": {
    "fa": "افزودن اتصال جدید",
    "ar": "إضافة اتصال جديد",
    "ru": "Добавить новое соединение",
    "tr": "Yeni Bağlantı Ekle",
    "es": "Agregar nueva conexión"
  },
  "Panel Type": {
    "fa": "نوع پنل",
    "ar": "نوع اللوحة",
    "ru": "Тип панели",
    "tr": "Panel Tipi",
    "es": "Tipo de panel"
  },
  "Sanaei": {
    "fa": "سنایی (Sanaei)",
    "ar": "سنائي",
    "ru": "Санаи",
    "tr": "Sanaei",
    "es": "sanaei"
  },
  "Reebeka": {
    "fa": "ربکا (Reebeka)",
    "ar": "ريبيكا",
    "ru": "Рибека",
    "tr": "Reebeka",
    "es": "reebeka"
  },
  "Pasarguard": {
    "fa": "پاسارگارد (Pasarguard)",
    "ar": "��اسارجارد",
    "ru": "Пасаргард",
    "tr": "Pasarguard",
    "es": "Pasarguardia"
  },
  "Server Name": {
    "fa": "نام سرور",
    "ar": "اسم الخادم",
    "ru": "Имя сервера",
    "tr": "Sunucu Adı",
    "es": "Nombre del servidor"
  },
  "e.g. Germany 1": {
    "fa": "مثلا: آلمان ۱",
    "ar": "على سبيل المثال ألمانيا 1",
    "ru": "например Германия 1",
    "tr": "örneğin Almanya 1",
    "es": "por ej. Alemania 1"
  },
  "Panel URL (with port)": {
    "fa": "آدرس پنل (با پورت)",
    "ar": "عنوان URL للوحة (مع منفذ)",
    "ru": "URL-адрес панели (с портом)",
    "tr": "Panel URL'si (bağlantı noktasıyla birlikte)",
    "es": "URL del panel (con puerto)"
  },
  "Subscription URL (Optional)": {
    "fa": "لینک سابسکریپشن (اختیاری)",
    "ar": "عنوان URL للاشتراك (اختياري)",
    "ru": "URL-адрес подписки (необязательно)",
    "tr": "Abonelik URL'si (İsteğe bağlı)",
    "es": "URL de suscripción (opcional)"
  },
  "Panel Username": {
    "fa": "نام کاربری پنل",
    "ar": "اسم مستخدم اللوحة",
    "ru": "Имя пользователя панели",
    "tr": "Panel Kullanıcı Adı",
    "es": "Nombre de usuario del panel"
  },
  "Panel Password": {
    "fa": "رمز عبور پنل",
    "ar": "كلمة مرور اللوحة",
    "ru": "Пароль панели",
    "tr": "Panel Şifresi",
    "es": "Contraseña del panel"
  },
  "Allowed Plan Categories for this server:": {
    "fa": "دسته‌بندی‌های پلن مجاز برای این سرور:",
    "ar": "فئات الخطة المسموح بها لهذا الخادم:",
    "ru": "Разрешенные категории планов для этого сервера:",
    "tr": "Bu sunucu için İzin Verilen Plan Kategorileri:",
    "es": "Categorías de planes permitidas para este servidor:"
  },
  "No categories created yet.": {
    "fa": "هنوز هیچ دسته‌بندی ایجاد نشده است.",
    "ar": "لم يتم إنشاء فئات بعد.",
    "ru": "Категории еще не созданы.",
    "tr": "Henüz kategori oluşturulmadı.",
    "es": "Aún no se han creado categorías."
  },
  "Allowed Colleague Packages for this server:": {
    "fa": "بسته‌های مجاز همکاران برای این سرور:",
    "ar": "حزم الزملاء المسموح بها لهذا الخادم:",
    "ru": "Разрешенные пакеты коллег для этого сервера:",
    "tr": "Bu sunucu için İzin Verilen Meslektaş Paketleri:",
    "es": "Paquetes de colegas permitidos para este servidor:"
  },
  "Save Server": {
    "fa": "ذخیره سرور",
    "ar": "حفظ الخادم",
    "ru": "Сохранить сервер",
    "tr": "Sunucuyu Kaydet",
    "es": "Guardar servidor"
  },
  "Panel URL": {
    "fa": "آدرس پنل",
    "ar": "عنوان URL للوحة",
    "ru": "URL-адрес панели",
    "tr": "Panel URL'si",
    "es": "URL del panel"
  },
  "Inbounds": {
    "fa": "اینباند",
    "ar": "الداخل",
    "ru": "Входящие",
    "tr": "Gelenler",
    "es": "Entradas"
  },
  "Connection Status": {
    "fa": "وضعیت اتصال",
    "ar": "حالة الاتصال",
    "ru": "Статус подключения",
    "tr": "Bağlantı Durumu",
    "es": "Estado de conexión"
  },
  "Actions": {
    "fa": "عملیات",
    "ar": "الإجراءات",
    "ru": "Действия",
    "tr": "Eylemler",
    "es": "Acciones"
  },
  "Drag to reorder": {
    "fa": "برای جابجایی بکشید",
    "ar": "اسحب لإعادة الترتيب",
    "ru": "Перетащите, чтобы изменить порядок",
    "tr": "Yeniden sıralamak için sürükleyin",
    "es": "Arrastra para reordenar"
  },
  "Connected": {
    "fa": "متصل",
    "ar": "متصل",
    "ru": "Подключено",
    "tr": "Bağlı",
    "es": "Conectado"
  },
  "No servers added yet.": {
    "fa": "هیچ سروری اضافه نشده است.",
    "ar": "لم تتم إضافة أي خوادم حتى الآن.",
    "ru": "Серверы пока не добавлены.",
    "tr": "Henüz sunucu eklenmedi.",
    "es": "Aún no se han agregado servidores."
  },
  "Plan name is required.": {
    "fa": "نام بسته نمی‌تواند خالی باشد.",
    "ar": "اسم الخطة مطلوب.",
    "ru": "Укажите название плана.",
    "tr": "Plan adı gerekli.",
    "es": "El nombre del plan es obligatorio."
  },
  "Invalid pricing value.": {
    "fa": "مبلغ معتبر وارد کنید.",
    "ar": "قيمة التسعير غير صالحة.",
    "ru": "Недопустимое значение цены.",
    "tr": "Geçersiz fiyatlandırma değeri.",
    "es": "Valor de precio no válido."
  },
  "Error writing backend state.": {
    "fa": "خطا در ثبت اطلاعات بسته در پایگاه داده.",
    "ar": "خطأ في كتابة حالة الواجهة الخلفية.",
    "ru": "Ошибка записи состояния серверной части.",
    "tr": "Arka uç durumu yazılırken hata oluştu.",
    "es": "Error al escribir el estado del backend."
  },
  "Communication lost with backend container.": {
    "fa": "خطا در انتقال اطلاعات با سرور.",
    "ar": "تم فقد الاتصال بحاوية الواجهة الخلفية.",
    "ru": "Потеряна связь с серверным контейнером.",
    "tr": "Arka uç kapsayıcıyla iletişim kesildi.",
    "es": "Se perdió la comunicación con el contenedor backend."
  },
  "Category name is required": {
    "fa": "نام دسته‌بندی اجباری است",
    "ar": "اسم الفئة مطلوب",
    "ru": "Укажите название категории.",
    "tr": "Kategori adı gerekli",
    "es": "El nombre de la categoría es obligatorio."
  },
  "Total Active Packages": {
    "fa": "کل بسته‌های خرید تعریف شده",
    "ar": "إجمالي الحزم النشطة",
    "ru": "Всего активных пакетов",
    "tr": "Toplam Aktif Paketler",
    "es": "Paquetes activos totales"
  },
  "Active plans for customer purchase": {
    "fa": "بسته‌های فعال و هوشمند تلگرام",
    "ar": "خطط نشطة لشراء العملاء",
    "ru": "Активные планы покупок клиентов",
    "tr": "Müşteri satın alımına yönelik aktif planlar",
    "es": "Planes activos para compra de clientes"
  },
  "Active Servers": {
    "fa": "تعداد سرورهای فعال",
    "ar": "خوادم نشطة",
    "ru": "Активные серверы",
    "tr": "Aktif Sunucular",
    "es": "Servidores activos"
  },
  "Connected servers for subscriptions": {
    "fa": "سرورهای متصل جهت ارائه اشتراک",
    "ar": "خوادم متصلة للاشتراكات",
    "ru": "Подключенные серверы для подписок",
    "tr": "Abonelikler için bağlı sunucular",
    "es": "Servidores conectados para suscripciones"
  },
  "Plan Categories": {
    "fa": "تعداد دسته‌بندی‌ها",
    "ar": "فئات الخطة",
    "ru": "Категории планов",
    "tr": "Plan Kategorileri",
    "es": "Categorías de planes"
  },
  "Free Test Settings": {
    "fa": "تنظیمات اختصاصی تست رایگان",
    "ar": "إعدادات ا��اختبار المجانية",
    "ru": "Бесплатные тестовые настройки",
    "tr": "Ücretsiz Test Ayarları",
    "es": "Configuración de prueba gratuita"
  },
  "Define the specific server dedicated to handling free test requests. The Telegram bot will automatically create and issue free tests from this selected server.": {
    "fa": "در این بخش می‌توانید سرور مورد نظر خود را برای ساخت و تحویل کانفیگ‌های تست رایگان کاربران انتخاب کنید. ربات تلگرام اکانت‌های تست رایگان را مستقیماً از روی این سرور ایجاد خواهد کرد.",
    "ar": "تحديد الخادم المحدد المخصص للتعامل مع طلبات الاختبار المجانية. سيقوم روبوت Telegram تلقائيًا بإنشاء وإصدار اختبارات مجانية من هذا الخادم المحدد.",
    "ru": "Определите конкретный сервер, предназначенный для обработки запросов на бесплатное тестирование. Бот Telegram автоматически создаст и выдаст бесплатные тесты с этого выбранного сервера.",
    "tr": "Ücretsiz test taleplerini karşılamaya ayrılmış özel sunucuyu tanımlayın. Telegram botu, seçilen bu sunucudan otomatik olarak ücretsiz testler oluşturacak ve yayınlayacaktır.",
    "es": "Defina el servidor específico dedicado a manejar solicitudes de prueba gratuitas. El bot de Telegram creará y emitirá automáticamente pruebas gratuitas desde este servidor seleccionado."
  },
  "Select Free Test Server": {
    "fa": "انتخاب سرور تست رایگان",
    "ar": "حدد خادم اختبار مجاني",
    "ru": "Выберите бесплатный тестовый сервер",
    "tr": "Ücretsiz Test Sunucusunu Seçin",
    "es": "Seleccione un servidor de prueba gratuito"
  },
  "First Active Server (Default)": {
    "fa": "نخستین سرور فعال سیستم (پیش‌فرض)",
    "ar": "أول خادم نشط (افتراضي)",
    "ru": "Первый активный сервер (по умолчанию)",
    "tr": "İlk Aktif Sunucu (Varsayılan)",
    "es": "Primer servidor activo (predeterminado)"
  },
  "Free Test Status": {
    "fa": "وضعیت سرویس تست رایگان",
    "ar": "حالة الاختبار المجاني",
    "ru": "Статус бесплатного тестирования",
    "tr": "Ücretsiz Test Durumu",
    "es": "Estado de prueba gratuito"
  },
  "✅ Enabled": {
    "fa": "✅ فعال",
    "ar": "✅ ممكّن",
    "ru": "✅ Включено",
    "tr": "✅ Etkin",
    "es": "✅ Habilitado"
  },
  "❌ Disabled": {
    "fa": "❌ غیرفعال",
    "ar": "❌ معطل",
    "ru": "❌ Отключено",
    "tr": "❌ Devre Dışı",
    "es": "❌ Deshabilitado"
  },
  "Free Test Disabled Message": {
    "fa": "پیام خطا زمان غیرفعال بودن تست رایگان",
    "ar": "رسالة معطل للاختبار المجاني",
    "ru": "Сообщение об отключении бесплатного теста",
    "tr": "Ücretsiz Test Devre Dışı Mesajı",
    "es": "Mensaje de prueba gratuita deshabilitado"
  },
  "e.g., Free test accounts are temporarily unavailable.": {
    "fa": "مثلا: اکانت تست رایگان فعلا موجود نیست.",
    "ar": "على سبيل المثال، الحسابات التجريبية المجانية غير متاحة مؤقتًا.",
    "ru": "например, бесплатные тестовые учетные записи временно недоступны.",
    "tr": "örneğin, Ücretsiz test hesapları geçici olarak kullanılamıyor.",
    "es": "por ejemplo, las cuentas de prueba gratuitas no están disponibles temporalmente."
  },
  "Free Test Volume (GB - supports decimals)": {
    "fa": "حجم اکانت تست (گیگابایت - پشتیبانی از مگابایت با عدد اعشاری)",
    "ar": "حجم الاختبار المجاني (جيجابايت - يدعم الكسور العشرية)",
    "ru": "Бесплатный тестовый объем (ГБ — поддерживает десятичные дроби)",
    "tr": "Ücretsiz Test Hacmi (GB - ondalık sayıları destekler)",
    "es": "Volumen de prueba gratuito (GB - admite decimales)"
  },
  "Free Test Duration (Days)": {
    "fa": "مدت زمان تست (روز)",
    "ar": "مدة الاختبار المجاني (أيام)",
    "ru": "Продолжительность бесплатного теста (дней)",
    "tr": "Ücretsiz Test Süresi (Gün)",
    "es": "Duración de la prueba gratuita (días)"
  },
  "Free test settings saved successfully!": {
    "fa": "تنظیمات تست رایگان با موفقیت ذخیره شد!",
    "ar": "تم حفظ إعدادات الاختبار المجانية بنجاح!",
    "ru": "Настройки бесплатного теста успешно сохранены!",
    "tr": "Ücretsiz test ayarları başarıyla kaydedildi!",
    "es": "¡La configuración de prueba gratuita se guardó correctamente!"
  },
  "Save Free Test Settings": {
    "fa": "ذخیره تنظیمات تست رایگان",
    "ar": "حفظ إعدادات الاختبار المجانية",
    "ru": "Сохранить настройки бесплатного теста",
    "tr": "Ücretsiz Test Ayarlarını Kaydet",
    "es": "Guardar configuración de prueba gratuita"
  },
  "Custom Volume & Days Pricing Rules": {
    "fa": "تنظیم قیمت حجم و روز دلخواه (محاسبه هوشمند ربات)",
    "ar": "قواعد تسعير الحجم والأيام المخصصة",
    "ru": "Пользовательские правила ценообразования по объему и дням",
    "tr": "Özel Hacim ve Gün Fiyatlandırma Kuralları",
    "es": "Reglas personalizadas de precios de volumen y días"
  },
  "Add New Rule": {
    "fa": "افزودن کادر جدید",
    "ar": "إضافة قاعدة جديدة",
    "ru": "Добавить новое правило",
    "tr": "Yeni Kural Ekle",
    "es": "Agregar nueva regla"
  },
  "Define price per GB and price per Day for different servers. The bot will automatically calculate final prices for custom subscriptions and renewals based on these boxes.": {
    "fa": "در این بخش می‌توانید قیمت هر گیگابایت ترافیک و هر روز اعتبار را به تفکیک سرورها مشخص کنید. ربات تلگرام در بخش خرید با حجم دلخواه و همچنین در فرآیند تمدید، قیمت نهایی را به صورت هوشمند بر اساس قوانین این کادرها محاسبه می‌کند.",
    "ar": "تحديد السعر لكل جيجابايت والسعر اليومي للخوادم المختلفة. سيقوم الروبوت تلقائيًا بحساب الأسعار النهائية للاشتراكات المخصصة والتجديدات بناءً على هذه المربعات.",
    "ru": "Определите цену за ГБ и цену за день для разных серверов. Бот автоматически рассчитает окончательные цены на индивидуальные подписки и продления на основе этих полей.",
    "tr": "Farklı sunucular için GB başına fiyatı ve Gün başına fiyatı tanımlayın. Bot, özel abonelikler ve yenilemeler için nihai fiyatları bu kutulara göre otomatik olarak hesaplayacaktır.",
    "es": "Defina precio por GB y precio por día para diferentes servidores. El bot calculará automáticamente los precios finales de las suscripciones y renovaciones personalizadas en función de estos cuadros."
  },
  "No rules defined. Bot will use default prices: 3,000 per GB and 2,000 per Day.": {
    "fa": "هیچ قانون قیمت‌گذاری تعریف نشده است. (ربات از مقادیر پیش‌فرض استفاده خواهد کرد: هر گیگ ۳,۰۰۰ و هر روز ۲,۰۰۰ تومان)",
    "ar": "لم يتم تحديد أي قواعد. سيستخدم الروبوت الأسعار الافتراضية: 3000 لكل جيجابايت و2000 لكل يوم.",
    "ru": "Правила не определены. Бот будет использовать цены по умолчанию: 3000 за ГБ и 2000 в день.",
    "tr": "Tanımlanmış kural yok. Bot varsayılan fiyatları kullanacaktır: GB başına 3.000 ve Günlük 2.000.",
    "es": "No hay reglas definidas. Bot utilizará precios predeterminados: 3000 por GB y 2000 por día."
  },
  "Applied Servers:": {
    "fa": "سرورهای اعمال‌شده:",
    "ar": "الخوادم المطبقة:",
    "ru": "Прикладные серверы:",
    "tr": "Uygulanan Sunucular:",
    "es": "Servidores aplicados:"
  },
  "No servers selected": {
    "fa": "بدون سرور (اعمال نشده)",
    "ar": "لم يتم تحديد أي خوادم",
    "ru": "Серверы не выбраны",
    "tr": "Hiçbir sunucu seçilmedi",
    "es": "No hay servidores seleccionados"
  },
  "Edit Rule": {
    "fa": "ویرایش و تنظیم",
    "ar": "تحرير القاعدة",
    "ru": "Изменить правило",
    "tr": "Kuralı Düzenle",
    "es": "Editar regla"
  },
  "Delete box": {
    "fa": "حذف کادر",
    "ar": "حذف المربع",
    "ru": "Удалить ящик",
    "tr": "Kutuyu sil",
    "es": "Eliminar cuadro"
  },
  "Minimum GB Limit": {
    "fa": "حداقل حجم ساخت (گیگابایت)",
    "ar": "الحد الأدنى للجيجابايت",
    "ru": "Минимальный лимит ГБ",
    "tr": "Minimum GB Sınırı",
    "es": "Límite mínimo de GB"
  },
  "Minimum Days Limit": {
    "fa": "حداقل روز ساخت (روز)",
    "ar": "الحد الأدنى لعدد الأيام",
    "ru": "Минимальный лимит дней",
    "tr": "Minimum Gün Sınırı",
    "es": "Límite de días mínimos"
  },
  "Select servers for this rule:": {
    "fa": "انتخاب سرورهای تیک‌خورده برای اعمال این قانون:",
    "ar": "حدد خوادم لهذه القاعدة:",
    "ru": "Выберите серверы для этого правила:",
    "tr": "Bu kural için sunucuları seçin:",
    "es": "Seleccione servidores para esta regla:"
  },
  "No servers available.": {
    "fa": "هیچ سروری تعریف نشده است.",
    "ar": "لا توجد خوادم متاحة.",
    "ru": "Нет доступных серверов.",
    "tr": "Sunucu yok.",
    "es": "No hay servidores disponibles."
  },
  "Save and Close Box": {
    "fa": "ذخیره و بستن کادر",
    "ar": "حفظ وإغلاق المربع",
    "ru": "Сохранить и закрыть окно",
    "tr": "Kaydet ve Kapat Kutusu",
    "es": "Guardar y cerrar cuadro"
  },
  "Save Pricing Rules": {
    "fa": "ذخیره تنظیمات قیمت‌گذاری",
    "ar": "حفظ قواعد التسعير",
    "ru": "Сохранить правила ценообразования",
    "tr": "Fiyatlandırma Kurallarını Kaydet",
    "es": "Guardar reglas de precios"
  },
  "Plan Categories Management": {
    "fa": "مدیریت دسته‌بندی پلن‌ها",
    "ar": "إدارة فئات الخطة",
    "ru": "Управление категориями планов",
    "tr": "Kategori Yönetimini Planlayın",
    "es": "Gestión de categorías de planes"
  },
  "Category Name": {
    "fa": "نام دسته",
    "ar": "اسم الفئة",
    "ru": "Название категории",
    "tr": "Kategori Adı",
    "es": "Nombre de categoría"
  },
  "e.g. VIP": {
    "fa": "مثلا: VIP",
    "ar": "على سبيل المثال VIP",
    "ru": "например VIP",
    "tr": "örneğin VIP",
    "es": "por ej. vip"
  },
  "Subscription Packages & Selling Matrix": {
    "fa": "بسته‌های اشتراکی تلگرام و قیمت فروشگاه",
    "ar": "حزم الاشتراك ومصفوفة البيع",
    "ru": "Пакеты подписки и матрица продаж",
    "tr": "Abonelik Paketleri ve Satış Matrisi",
    "es": "Paquetes de suscripción y matriz de ventas"
  },
  "These packages are pulled dynamically by the Telegram bot.": {
    "fa": "این بسته‌ها درون ربات تلگرام با شارژ کیف پول تایید شده اتوماتیک ارائه می‌گردند.",
    "ar": "يتم سحب هذه الحزم ديناميكيًا بواسطة روبوت Telegram.",
    "ru": "Эти пакеты динамически извлекаются ботом Telegram.",
    "tr": "Bu paketler Telegram botu tarafından dinamik olarak çekilir.",
    "es": "Estos paquetes son extraídos dinámicamente por el bot de Telegram."
  },
  "Create New VPN Plan": {
    "fa": "تعریف بسته جدید",
    "ar": "إنشاء خطة VPN جديدة",
    "ru": "Создать новый план VPN",
    "tr": "Yeni VPN Planı Oluşturun",
    "es": "Crear un nuevo plan VPN"
  },
  "✏️ Edit VPN Package specifications": {
    "fa": "✏️ ویرایش مشخصات بسته اشتراکی",
    "ar": "✏️ تعديل مواصفات حزمة VPN",
    "ru": "✏️ Редактировать спецификации VPN-пакета.",
    "tr": "✏️ VPN Paketi özelliklerini düzenleyin",
    "es": "✏️ Editar especificaciones del paquete VPN"
  },
  "➕ Spec out New Subscription Package": {
    "fa": "➕ جزئیات و ساخت بسته جدید اشتراکی",
    "ar": "➕ تحديد حزمة الاشتراك الجديدة",
    "ru": "➕ Ознакомьтесь с новым пакетом подписки",
    "tr": "➕ Yeni Abonelik Paketini Belirtin",
    "es": "➕ Especificaciones del nuevo paquete de suscripción"
  },
  "Display Name": {
    "fa": "نام بسته (برنزی، VIP طلایی، گیمینگ)",
    "ar": "اسم العرض",
    "ru": "Отображаемое имя",
    "tr": "Görünen Ad",
    "es": "Nombre para mostrar"
  },
  "Standard Promo Pack 50GB": {
    "fa": "مثال: استاندارد ۱ ماهه ۵۰ گیگابایت",
    "ar": "الحزمة الترويجية القياسية 50 جيجابايت",
    "ru": "Стандартный промо-пакет 50 ГБ",
    "tr": "Standart Promosyon Paketi 50GB",
    "es": "Paquete promocional estándar de 50 GB"
  },
  "Category / Group Name": {
    "fa": "دسته‌بندی پنل (نام گروه)",
    "ar": "الفئة / اسم المجموعة",
    "ru": "Название категории/группы",
    "tr": "Kategori / Grup Adı",
    "es": "Nombre de categoría/grupo"
  },
  "Select Category...": {
    "fa": "انتخاب دسته‌بندی...",
    "ar": "اختر الفئة...",
    "ru": "Выберите категорию...",
    "tr": "Kategori Seçin...",
    "es": "Seleccione Categoría..."
  },
  "Volume Size (GB)": {
    "fa": "حجم (گیگابایت)",
    "ar": "حجم الحجم (جيجابايت)",
    "ru": "Размер тома (ГБ)",
    "tr": "Birim Boyutu (GB)",
    "es": "Tamaño del volumen (GB)"
  },
  "Duration (Days)": {
    "fa": "مدت زمان (به روز)",
    "ar": "المدة (أيام)",
    "ru": "Продолжительность (дней)",
    "tr": "Süre (Gün)",
    "es": "Duración (Días)"
  },
  "VPN subscription details stored and synchronized!": {
    "fa": "اطلاعات بسته با موفقیت با هسته تلگرام مجیک همگام شد!",
    "ar": "تفاصيل اشتراك VPN مخزنة ومتزامنة!",
    "ru": "Детали VPN-подписки сохраняются и синхронизируются!",
    "tr": "VPN abonelik ayrıntıları saklanır ve senkronize edilir!",
    "es": "¡Detalles de suscripción VPN almacenados y sincronizados!"
  },
  "Generate & Launch Package": {
    "fa": "ایجاد و ذخیره نهایی بسته",
    "ar": "إنشاء وإطلاق الحزمة",
    "ru": "Создать и запустить пакет",
    "tr": "Paket Oluştur ve Başlat",
    "es": "Generar y lanzar paquete"
  },
  "Active Subscription specifications & prices:": {
    "fa": "بسته‌های فعال و مشخصات سابسکریپشن سیستم:",
    "ar": "مواصفات وأسعار الاشتراك النشط:",
    "ru": "Характеристики и цены активной подписки:",
    "tr": "Aktif Abonelik özellikleri ve fiyatları:",
    "es": "Especificaciones y precios de la suscripción activa:"
  },
  "No packages listed inside the sqlite database pool.": {
    "fa": "هیچ بسته‌ای در پایگاه اتصال تعریف نشده است.",
    "ar": "لا توجد حزم مدرجة داخل تجمع قاعدة بيانات SQLite.",
    "ru": "В пуле базы данных sqlite нет пакетов.",
    "tr": "Sqlite veritabanı havuzunda hiçbir paket listelenmiyor.",
    "es": "No hay paquetes listados dentro del grupo de bases de datos sqlite."
  },
  "Define your first VPN plan spec": {
    "fa": "تعریف اولین پلن VPN",
    "ar": "حدد مواصفات خطة VPN الأولى الخاصة بك",
    "ru": "Определите спецификацию своего первого плана VPN",
    "tr": "İlk VPN planı spesifikasyonunuzu tanımlayın",
    "es": "Defina las especificaciones de su primer plan VPN"
  },
  "Days": {
    "fa": "روز",
    "ar": "أيام",
    "ru": "Дни",
    "tr": "Günler",
    "es": "dias"
  },
  "Bot Price:": {
    "fa": "قیمت فروش ربات:",
    "ar": "سعر البوت:",
    "ru": "Цена бота:",
    "tr": "Bot Fiyatı:",
    "es": "Precio del robot:"
  },
  "Confirm delete?": {
    "fa": "حذف کامل بسته؟",
    "ar": "تأكيد الحذف؟",
    "ru": "Подтвердить удаление?",
    "tr": "Silme onaylansın mı?",
    "es": "¿Confirmar eliminación?"
  },
  "Yes": {
    "fa": "بله",
    "ar": "نعم",
    "ru": "Да",
    "tr": "Evet",
    "es": "si"
  },
  "No": {
    "fa": "خیر",
    "ar": "لا",
    "ru": "Нет",
    "tr": "Hayır",
    "es": "No"
  },
  "Edit Plan": {
    "fa": "ویرایش پلن",
    "ar": "تحرير الخطة",
    "ru": "Редактировать план",
    "tr": "Planı Düzenle",
    "es": "Editar plan"
  },
  "Please enter the Gemini API Key first.": {
    "fa": "لطفاً ابتدا کلید API جیمینای را وارد کنید.",
    "ar": "الرجاء إدخال مفتاح Gemini API أولاً.",
    "ru": "Сначала введите ключ API Gemini.",
    "tr": "Lütfen önce Gemini API Anahtarını girin.",
    "es": "Primero ingrese la clave API de Gemini."
  },
  "Please enter the AI API Key first.": {
    "fa": "لطفاً ابتدا کلید API هوش مصنوعی را وارد کنید.",
    "ar": "الرجاء إدخال مفتاح AI API أولاً.",
    "ru": "Сначала введите ключ AI API.",
    "tr": "Lütfen önce AI API Anahtarını girin.",
    "es": "Primero ingrese la clave API AI."
  },
  "📣 Send Telegram Broadcast Message": {
    "fa": "📣 ارسال اطلاعیه همگانی (برادکست)",
    "ar": "📣 أرسل رسالة بث تيليجرام",
    "ru": "📣 Отправьте широковещательное сообщение Telegram",
    "tr": "📣 Telegram Yayın Mesajı Gönder",
    "es": "📣 Enviar mensaje de difusión de Telegram"
  },
  "Compose and dispatch an official announcement, discount code, or network status update to all registered Telegram bot users.": {
    "fa": "متن اطلاعیه، پیام یا بنر تبلیغاتی خود را بنویسید تا مستقیماً به چت تمام اعضای تعامل‌یافته با بازخورد سریع ربات ارسال گردد.",
    "ar": "قم بإنشاء وإرسال إعلان رسمي أو رمز خصم أو تحديث لحالة الشبكة إلى جميع مستخدمي Telegram bot المسجلين.",
    "ru": "Составьте и отправьте официальное объявление, код скидки или обновление статуса сети всем зарегистрированным пользователям бота Telegram.",
    "tr": "Tüm kayıtlı Telegram bot kullanıcılarına resmi bir duyuru, indirim kodu veya ağ durumu güncellemesi oluşturun ve gönderin.",
    "es": "Redacte y envíe un anuncio oficial, un código de descuento o una actualización del estado de la red a todos los usuarios registrados del bot de Telegram."
  },
  "e.g., Server maintenance completed successfully!": {
    "fa": "مثلا: 🚨 به روزرسانی سرورها انجام شد؛ برای دریافت اکانت جدید به پشتیبانی مراجعه فرمایید.",
    "ar": "على سبيل المثال، اكتملت صيانة الخادم بنجا��!",
    "ru": "например, обслуживание сервера успешно завершено!",
    "tr": "örneğin, Sunucu bakımı başarıyla tamamlandı!",
    "es": "por ejemplo, ¡el mantenimiento del servidor se completó correctamente!"
  },
  "Bold Text": {
    "fa": "ضخیم کردن (Bold)",
    "ar": "نص غامق",
    "ru": "Жирный текст",
    "tr": "Kalın Metin",
    "es": "Texto en negrita"
  },
  "Italic Text": {
    "fa": "مورب کردن (Italic)",
    "ar": "نص مائل",
    "ru": "Курсивный текст",
    "tr": "İtalik Metin",
    "es": "Texto en cursiva"
  },
  "Apply Mono Format (One-click copy)": {
    "fa": "مونو کردن (کپی با یک کلیک)",
    "ar": "تطبيق تنسيق أحادي (نسخة بنقرة واحدة)",
    "ru": "Применить моноформат (копирование в один клик)",
    "tr": "Mono Formatı Uygula (Tek tıklamayla kopyalama)",
    "es": "Aplicar formato mono (copia con un clic)"
  },
  "Clear Format": {
    "fa": "پاکسازی استایل",
    "ar": "مسح التنسيق",
    "ru": "Очистить формат",
    "tr": "Formatı Temizle",
    "es": "Borrar formato"
  },
  "Upload Image": {
    "fa": "ارسال تصویر",
    "ar": "تحميل الصورة",
    "ru": "Загрузить изображение",
    "tr": "Resim Yükle",
    "es": "Subir imagen"
  },
  "Upload Video": {
    "fa": "ارسال فیلم/ویدئو",
    "ar": "تحميل الفيديو",
    "ru": "Загрузить видео",
    "tr": "Videoyu Yükle",
    "es": "Subir vídeo"
  },
  "Upload Voice": {
    "fa": "ارسال ویس/صوت",
    "ar": "تحميل صوت",
    "ru": "Загрузить голос",
    "tr": "Sesi Yükle",
    "es": "Subir Voz"
  },
  "Upload File/Doc": {
    "fa": "ارسال فایل/سند",
    "ar": "تحميل الملف/الوثيقة",
    "ru": "Загрузить файл/документ",
    "tr": "Dosya/Belge Yükle",
    "es": "Subir archivo/doc"
  },
  "Ready to broadcast...": {
    "fa": "آماده ارسال...",
    "ar": "جاهز للبث...",
    "ru": "Готов к трансляции...",
    "tr": "Yayına hazır...",
    "es": "Listo para transmitir..."
  },
  "Remove Attachment": {
    "fa": "حذف پیوست",
    "ar": "إزالة المرفق",
    "ru": "Удалить вложение",
    "tr": "Eki Kaldır",
    "es": "Eliminar archivo adjunto"
  },
  "Text position relative to media:": {
    "fa": "موقعیت نمایش متن همراه رسانه:",
    "ar": "موضع النص بالنسبة للوسائط:",
    "ru": "Положение текста относительно носителя:",
    "tr": "Medyaya göre metin konumu:",
    "es": "Posición del texto en relación con los medios:"
  },
  "Below media (default)": {
    "fa": "زیر رسانه (پیش‌فرض)",
    "ar": "أسفل الوسائط (افتراضي)",
    "ru": "Под медиа (по умолчанию)",
    "tr": "Medyanın altında (varsayılan)",
    "es": "Debajo de los medios (predeterminado)"
  },
  "Above media": {
    "fa": "بالای رسانه",
    "ar": "فوق الوسائط",
    "ru": "Над СМИ",
    "tr": "Medyanın üstünde",
    "es": "Por encima de los medios"
  },
  "Broadcasting...": {
    "fa": "در حال ارسال...",
    "ar": "البث...",
    "ru": "Трансляция...",
    "tr": "Yayınlanıyor...",
    "es": "Transmitiendo..."
  },
  "Enable Gemini AI as a 24/7 support assistant. Users can chat with the bot, and it answers based on your prices and connection guides.": {
    "fa": "فعال‌سازی هوش مصنوعی (Gemini) به عنوان پشتیبان ۲۴ ساعته. کاربران می‌توانند سوالات خود را بپرسند و ربات بر اساس تعرفه‌ها و راهنما پاسخ می‌دهد.",
    "ar": "تمكين Gemini AI كمساعد دعم على مدار الساعة طوال أيام الأسبوع. يمكن للمستخدمين الدردشة مع الروبوت، وهو يجيب بناءً على الأسعار وأدلة الاتصال الخاصة بك.",
    "ru": "Включите Gemini AI в качестве круглосуточного помощника по поддержке. Пользователи могут общаться с ботом, и он о��вечает на основе ваших цен и инструкций по подключению.",
    "tr": "Gemini AI'yi 7/24 destek asistanı olarak etkinleştirin. Kullanıcılar botla sohbet edebilir ve bot, fiyatlarınıza ve bağlantı kılavuzlarınıza göre yanıt verir.",
    "es": "Habilite Gemini AI como asistente de soporte 24 horas al día, 7 días a la semana. Los usuarios pueden chatear con el bot y este responde según sus precios y guías de conexión."
  },
  "Button label in Telegram menu:": {
    "fa": "عنوان دکمه در منوی ربات:",
    "ar": "تسمية الزر في قائمة Telegram:",
    "ru": "Надпись кнопки в меню Telegram:",
    "tr": "Telegram menüsündeki düğme etiketi:",
    "es": "Etiqueta del botón en el menú de Telegram:"
  },
  "Gemini API Key:": {
    "fa": "کلید API جیمینای (Gemini API Key):",
    "ar": "مفتاح واجهة برمجة تطبيقات الجوزاء:",
    "ru": "Ключ API Близнецов:",
    "tr": "Gemini API Anahtarı:",
    "es": "Clave API de Géminis:"
  },
  "Gemini API Key is configured.": {
    "fa": "کلید API جیمینای شناسایی شد.",
    "ar": "تم تكوين مفتاح Gemini API.",
    "ru": "Ключ API Gemini настроен.",
    "tr": "Gemini API Anahtarı yapılandırıldı.",
    "es": "La clave API de Gemini está configurada."
  },
  "Missing Gemini API Secret Key.": {
    "fa": "خطا: کلید API ربات (Gemini) ست نشده است.",
    "ar": "المفتاح السري لـ Gemini API مفقود.",
    "ru": "Отсутствует секретный ключ Gemini API.",
    "tr": "Eksik Gemini API Gizli Anahtarı.",
    "es": "Falta la clave secreta de la API de Gemini."
  },
  "🔍 Test Gemini API Key Connection": {
    "fa": "🔍 بررسی و تست اتصال کلید جیمینای",
    "ar": "🔍 اختبار اتصال مفتاح Gemini API",
    "ru": "🔍 Проверка подключения ключа Gemini API",
    "tr": "🔍 Gemini API Anahtar Bağlantısını Test Edin",
    "es": "🔍 Pruebe la conexión de la clave API de Gemini"
  },
  "When active, any user starting the bot must be subscribed to the designated Telegram channel to access features.": {
    "fa": "وقتی این ویژگی فعال باشد، تمامی کاربرانی که وارد ربات تلگرام می‌شوند ابتدا باید در کانال تعیین‌شده عضو شوند تا اجازه استفاده از امکانات ربات را پیدا کنند.",
    "ar": "عندما يكون نشطًا، يجب على أي مستخدم يبدأ الروبوت أن يكون مشتركًا في قناة Telegram المخصصة للوصول إلى الميزات.",
    "ru": "Когда он активен, любой пользователь, запускающий бота, должен быть подписан на назначенный канал Telegram для доступа к функциям.",
    "tr": "Etkin olduğunda, botu başlatan herhangi bir kullanıcının özelliklere erişebilmesi için belirlenen Telegram kanalına abone olması gerekir.",
    "es": "Cuando está activo, cualquier usuario que inicie el bot debe estar suscrito al canal de Telegram designado para acceder a las funciones."
  },
  "Telegram channels for mandatory join (user must join all):": {
    "fa": "کانال‌های تلگرام جهت عضویت اجباری (کاربر باید در تمامی آن‌ها عضو شود):",
    "ar": "قنوات Telegram للانضمام الإلزامي (يجب على المستخدم الانضمام للجميع):",
    "ru": "Каналы Telegram для обязательного присоединения (пользователь должен присоединиться ко всем):",
    "tr": "Zorunlu katılım için Telegram kanalları (kullanıcının tümüne katılması gerekir):",
    "es": "Canales de Telegram para unirse obligatoriamente (el usuario debe unirse a todos):"
  },
  "@example_channel or full invite link": {
    "fa": "@example_channel یا لینک کامل",
    "ar": "@example_channel أو رابط الدعوة الكامل",
    "ru": "@example_channel или полная ссылка для приглашения",
    "tr": "@example_channel veya tam davet bağlantısı",
    "es": "@example_channel o enlace de invitación completo"
  },
  "e.g., Please sub to our channel to unlock the bot's features!": {
    "fa": "مثلا: کاربر گرامی، برای استفاده از ربات لطفا ابتدا در کانال رسمی دالتون عضو شوید.",
    "ar": "على سبيل المثال، يرجى الاشتراك في قناتنا لفتح ميزات الروبوت!",
    "ru": "например, подпишитесь на наш канал, чтобы разблокировать функции бота!",
    "tr": "örneğin, Botun özelliklerinin kilidini açmak için lütfen kanalımıza abone olun!",
    "es": "por ejemplo, suscríbete a nuestro canal para desbloquear las funciones del bot."
  },
  "Auto Database Backup": {
    "fa": "پشتیبان‌گیری خودکار (بکاپ)",
    "ar": "النسخ الاحتياطي التلقائي لقاعدة البيانات",
    "ru": "Автоматическое резервное копирование базы данных",
    "tr": "Otomatik Veritabanı Yedekleme",
    "es": "Copia de seguridad automática de la base de datos"
  },
  "Periodically backup the Daltoon_Bot.db and send it to the system owner's Telegram account.": {
    "fa": "بکاپ‌های دوره‌ای باعث اطمینان خاطر شما از حفظ اطلاعات سیستم می‌شود. فایل بکاپ به تلگرام Owner ارسال می‌گردد.",
    "ar": "قم بعمل نسخة احتياطية بشكل دوري من Daltoon_Bot.db وأرسله إلى حساب Telegram الخاص بمالك النظام.",
    "ru": "Периодически делайте резервную копию файла Daltoon_Bot.db и отправляйте его в учетную запись Telegram владельца системы.",
    "tr": "Daltoon_Bot.db'yi periyodik olarak yedekleyin ve sistem sahibinin Telegram hesabına gönderin.",
    "es": "Haga una copia de seguridad periódica de Daltoon_Bot.db y envíelo a la cuenta de Telegram del propietario del sistema."
  },
  "Backup Interval:": {
    "fa": "دوره زمانی پشتیبان‌گیری:",
    "ar": "الفاصل الزمني للنسخ الاحتياطي:",
    "ru": "Интервал резервного копирования:",
    "tr": "Yedekleme Aralığı:",
    "es": "Intervalo de respaldo:"
  },
  "Hourly": {
    "fa": "ساعتی (Hourly)",
    "ar": "كل ساعة",
    "ru": "Ежечасно",
    "tr": "Saatlik",
    "es": "Por hora"
  },
  "Daily": {
    "fa": "روزانه (Daily)",
    "ar": "يوميا",
    "ru": "Ежедневно",
    "tr": "Günlük",
    "es": "Diariamente"
  },
  "Weekly": {
    "fa": "هفتگی (Weekly)",
    "ar": "أسبوعيا",
    "ru": "Еженедельно",
    "tr": "Haftalık",
    "es": "Semanal"
  },
  "Monthly": {
    "fa": "ماهانه (Monthly)",
    "ar": "شهريا",
    "ru": "Ежемесячно",
    "tr": "Aylık",
    "es": "Mensual"
  },
  "Save Backup Settings": {
    "fa": "ذخیره تنظیمات بکاپ",
    "ar": "حفظ إعدادات النسخ الاحتياطي",
    "ru": "Сохранить настройки резервного копирования",
    "tr": "Yedekleme Ayarlarını Kaydet",
    "es": "Guardar configuración de copia de seguridad"
  },
  "🎨 QR Code Customization & Styling": {
    "fa": "🎨 شخصی‌سازی و زیباسازی کدهای QR",
    "ar": "🎨 تخصيص وتصميم رمز الاستجابة السريعة",
    "ru": "🎨 Настройка и оформление QR-кода",
    "tr": "🎨 QR Kod Özelleştirme ve Şekillendirme",
    "es": "🎨 Personalización y estilo del código QR"
  },
  "Customize your QR Codes with custom branding colors, watermarks/logos, or use custom generation APIs.": {
    "fa": "کدهای QR ربات خود را با رنگ برندینگ خود، درج لوگو/واترمارک اختصاصی در مرکز، یا فرمت‌های سفارشی کاملاً دگرگون کنید.",
    "ar": "قم بتخصيص رموز الاستجابة السريعة الخاصة بك بألوان مخصصة للعلامة التجارية، أو العلامات المائية/الشعارات، أو استخدم واجهات برمجة التطبيقات المخصصة للإنشاء.",
    "ru": "Настройте свои QR-коды с помощью собственных фирменных цветов, водяных знаков/логотипов или используйте API-интерфейсы собственного создания.",
    "tr": "QR Kodlarınızı özel marka renkleri, filigranlar/logolarla özelleştirin veya özel nesil API'leri kullanın.",
    "es": "Personalice sus códigos QR con colores de marca personalizados, marcas de agua/logotipos, o utilice API de generación personalizada."
  },
  "QR Code Color (Hex):": {
    "fa": "رنگ کدهای QR (کد هگز):",
    "ar": "لون رمز الاستجابة السريعة (ست عشري):",
    "ru": "Цвет QR-кода (шестнадцатеричный):",
    "tr": "QR Kod Rengi (Hex):",
    "es": "Color del código QR (hexadecimal):"
  },
  "Type 'none' or leave empty to use the JSON template's original color.": {
    "fa": "برای استفاده از رنگ قالب JSON کلمه none را بنویسید یا کادر را خالی بگذارید.",
    "ar": "اكتب \"لا شيء\" أو اتركه فارغًا لاستخدام اللون الأصلي لقالب JSON.",
    "ru": "Введите «none» или оставьте пустым, чтобы использовать исходный цвет шаблона JSON.",
    "tr": "JSON şablonunun orijinal rengini kullanmak için 'none' yazın veya boş bırakın.",
    "es": "Escriba \"ninguno\" o déjelo vacío para usar el color original de la plantilla JSON."
  },
  "Center Logo/Watermark Image URL:": {
    "fa": "لینک عکس لوگو/واترمارک مرکز:",
    "ar": "عنوان URL لصورة الشعار/العلامة المائية للمركز:",
    "ru": "URL-адрес изображения центрального логотипа/водяного знака:",
    "tr": "Merkez Logo/Filigran Resmi URL'si:",
    "es": "URL del logotipo del centro/imagen de marca de agua:"
  },
  "URL of a transparent PNG icon to be embedded in the center.": {
    "fa": "لینک آیکون یا لوگویی که مایلید در مرکز کد QR حک شود.",
    "ar": "عنوان URL لرمز PNG الشفاف الذي سيتم تضمينه في المركز.",
    "ru": "URL-адрес прозрачного значка PNG, который будет вставлен в центр.",
    "tr": "Ortaya yerleştirilecek şeffaf PNG simgesinin URL'si.",
    "es": "URL de un icono PNG transparente que se incrustará en el centro."
  },
  "Advanced QR Template (JSON Config or Custom API URL):": {
    "fa": "تمپلیت پیشرفته QR (فرمت JSON یا لینک دلخواه):",
    "ar": "قالب QR المتقدم (تكوين JSON أو عنوان URL المخصص لواجهة برمجة التطبيقات):",
    "ru": "Расширенный шаблон QR (конфигурация JSON или URL-адрес пользовательского API):",
    "tr": "Gelişmiş QR Şablonu (JSON Yapılandırması veya Özel API URL'si):",
    "es": "Plantilla QR avanzada (configuración JSON o URL de API personalizada):"
  },
  "Paste QRCode-Monkey JSON config, or use a custom API URL with placeholders {text}, {color}, {logo_url}.": {
    "fa": "می‌توانید کدهای JSON ساخته شده توسط qrcode-monkey.com را اینجا قرار دهید تا کدها با ظاهر کاستوم تولید شوند! (همچنین لینک API ساده هم پشتیبانی می‌شود. متغیرها: {text}، {color} و {logo_url})",
    "ar": "الصق تكوين QRCode-Monkey JSON، أو استخدم عنوان URL مخصصًا لواجهة برمجة التطبيقات مع العناصر النائبة {text}، {color}، {logo_url}.",
    "ru": "Вставьте конфигурацию JSON QRCode-Monkey или используйте собственный URL-адрес API с заполнителями {text}, {color}, {logo_url}.",
    "tr": "QRCode-Monkey JSON yapılandırmasını yapıştırın veya {text}, {color}, {logo_url} yer tutucularıyla özel bir API URL'si kullanın.",
    "es": "Pegue la configuración JSON de QRCode-Monkey o utilice una URL de API personalizada con marcadores de posición {text}, {color}, {logo_url}."
  },
  "Save QR Settings": {
    "fa": "ذخیره تنظیمات QR",
    "ar": "حفظ إعدادات QR",
    "ru": "Сохранить настройки QR",
    "tr": "QR Ayarlarını Kaydet",
    "es": "Guardar configuración QR"
  },
  "Danger Zone & Testing": {
    "fa": "منطقه خطر و تست",
    "ar": "منطقة الخطر والاختبار",
    "ru": "Опасная зона и тестирование",
    "tr": "Tehlikeli Bölge ve Test",
    "es": "Zona de peligro y pruebas"
  },
  "Simulator Mode: If enabled, the bot will generate mock links when panel connection fails.": {
    "fa": "حالت شبیه‌ساز: در صورت فعال بودن، اگر اتصال به پنل سنایی قطع باشد، ربات لینک‌های تستی تولید می‌کند.",
    "ar": "وضع المحاكاة: في حالة تمكينه، سيقوم الروبوت بإنشاء روابط وهمية عند فشل اتصال اللوحة.",
    "ru": "Режим симулятора: если этот параметр включен, бот будет генерировать фиктивные ссылки при сбое подключения к панели.",
    "tr": "Simülatör Modu: Etkinleştirilirse, panel bağlantısı başarısız olduğunda bot sahte bağlantılar oluşturacaktır.",
    "es": "Modo simulador: si está habilitado, el bot generará enlaces simulados cuando falle la conexión del panel."
  },
  "Wipe all users, transactions, plans, and settings. This will re-initialize the system.": {
    "fa": "حذف کامل تمامی اطلاعات کاربران، تراکنش‌ها و تنظیمات. سیستم به حالت اولیه باز می‌گردد.",
    "ar": "مسح جميع المستخدمين والمعاملات والخطط والإعدادات. سيؤدي هذا إلى إعادة تهيئة النظام.",
    "ru": "Сотрите всех пользователей, транзакции, планы и настройки. Это приведет к повторной инициализации системы.",
    "tr": "Tüm kullanıcıları, işlemleri, planları ve ayarları silin. Bu, sistemi yeniden başlatacaktır.",
    "es": "Borre todos los usuarios, transacciones, planes y configuraciones. Esto reinicializará el sistema."
  },
  "Are you sure you want to completely wipe the database? This will delete all users, plans, and settings.": {
    "fa": "آیا از حذف کامل دیتابیس و ریست کردن تمامی اطلاعات اطمینان دارید؟ تمامی تنظیمات، پلن‌ها و کاربران حذف خواهند شد.",
    "ar": "هل أنت متأكد أنك تريد مسح قاعدة البيانات بالكامل؟ سيؤدي هذا إلى حذف جميع المستخدمين والخطط والإعدادات.",
    "ru": "Вы уверены, что хотите полностью удалить базу данных? Это приведет к удалению всех пользователей, планов и настроек.",
    "tr": "Veritabanını tamamen silmek istediğinizden emin misiniz? Bu, tüm kullanıcıları, planları ve ayarları silecektir.",
    "es": "¿Está seguro de que desea borrar completamente la base de datos? Esto eliminará todos los usuarios, planes y configuraciones."
  },
  "Full Database Wipe": {
    "fa": "حذف کامل دیتابیس و تنظیمات",
    "ar": "مسح قاعدة البيانات بالكامل",
    "ru": "Полное удаление базы данных",
    "tr": "Tam Veritabanı Silme",
    "es": "Limpieza completa de la base de datos"
  },
  "Store Name / Bot Nickname": {
    "fa": "نام فروشگاه / ربات (جهت نمایش)",
    "ar": "اسم المتجر / لقب البوت",
    "ru": "Название магазина/ник бота",
    "tr": "Mağaza Adı / Bot Takma Adı",
    "es": "Nombre de la tienda/apodo del bot"
  },
  "e.g. Daltoon Store": {
    "fa": "مثال: دالتون استور",
    "ar": "على سبيل المثال متجر دالتون",
    "ru": "например Магазин Далтун",
    "tr": "örneğin Daltoon Mağazası",
    "es": "por ej. Tienda Daltoon"
  },
  "This name replaces the {nickname} variable in bot messages.": {
    "fa": "این نام در پیام‌های ربات (مثل خوش‌آمدگویی یا خرید) جایگزین متغیر {nickname} می‌شود.",
    "ar": "يحل هذا الاسم محل المتغير {nickname} في رسائل الروبوت.",
    "ru": "Это имя заменяет переменную {nickname} в сообщениях бота.",
    "tr": "Bu ad, bot mesajlarındaki {nickname} değişkeninin yerine geçer.",
    "es": "Este nombre reemplaza la variable {nickname} en los mensajes del bot."
  },
  "System & Bot Currency": {
    "fa": "واحد پول سیستم و ربات (Currency)",
    "ar": "عملة النظام والبوت",
    "ru": "Валюта системы и бота",
    "tr": "Sistem ve Bot Para Birimi",
    "es": "Moneda del sistema y del bot"
  },
  "e.g. Toman, USD, TL": {
    "fa": "مثال: تومان، ریال، USD, TL",
    "ar": "على سبيل المثال تومان، دولار أمريكي، ليرة تركية",
    "ru": "например Томан, доллары США, TL",
    "tr": "örneğin Tümen, ABD Doları, TL",
    "es": "por ej. Tomán, USD, TL"
  },
  "All amounts, invoices, revenue metrics, and bot simulators will use and display this currency.": {
    "fa": "تمام مبالغ، فاکتورها، گزارش‌های درآمد و شبیه‌سازهای ربات با این واحد پول پردازش و نمایش داده می‌شوند.",
    "ar": "ستستخدم جميع المبالغ والفواتير ومقاييس الإيرادات ومحاكيات الروبوتات هذه العملة وتعرضها.",
    "ru": "Все суммы, счета, показатели доходов и симуляторы ботов будут использовать и отображать эту валюту.",
    "tr": "Tüm tutarlar, faturalar, gelir ölçümleri ve bot simülatörleri bu para birimini kullanacak ve görüntüleyecektir.",
    "es": "Todos los importes, facturas, métricas de ingresos y simuladores de bots utilizarán y mostrarán esta moneda."
  },
  "📢 Telegram Channel ID (e.g., @example_channel)": {
    "fa": "📢 آیدی کانال تلگرام (مثال: @example_channel)",
    "ar": "📢 معرف قناة Telegram (على سبيل المثال، @example_channel)",
    "ru": "📢 Идентификатор канала Telegram (например, @example_channel)",
    "tr": "📢 Telegram Kanal Kimliği (ör. @example_channel)",
    "es": "📢 ID de canal de Telegram (por ejemplo, @example_channel)"
  },
  "👤 Technical Support Handle (e.g., @example_owner)": {
    "fa": "👤 آیدی پشتیبان فنی تلگرام (مثال: @example_owner)",
    "ar": "👤 التعامل مع الدعم الفني (على سبيل المثال، @example_owner)",
    "ru": "👤 Адрес технической поддержки (например, @example_owner)",
    "tr": "👤 Teknik Destek Yöneticisi (ör. @example_owner)",
    "es": "👤 Identificador de soporte técnico (p. ej., @example_owner)"
  },
  "Active / Online": {
    "fa": "فعال و آنلاین",
    "ar": "نشط / عبر الإنترنت",
    "ru": "Активный / Онлайн",
    "tr": "Aktif / Çevrimiçi",
    "es": "Activo / En línea"
  },
  "Auto Usage/Time Warning": {
    "fa": "هشدار خودکار اتمام حجم/زمان",
    "ar": "الاستخدام التلقائي/تحذير الوقت",
    "ru": "Автоматическое использование/предупреждение о времени",
    "tr": "Otomatik Kullanım/Zaman Uyarısı",
    "es": "Uso automático/advertencia de tiempo"
  },
  "Bot automatically alerts users when less than 1 GB or 1 Day of their plan remains.": {
    "fa": "ربات به صورت خودکار در صورتی که کمتر از ۱ گیگابایت یا ۱ روز از طرح کاربر باقی مانده باشد، پیامی جهت تمدید ارسال خواهد کرد.",
    "ar": "يقوم Bot بتنبيه المستخدمين تلقائيًا عند بقاء أقل من 1 جيجابايت أو يوم واحد من خطتهم.",
    "ru": "Бот автоматически предупреждает пользователей, когда остается менее 1 ГБ или 1 день их плана.",
    "tr": "Bot, planlarında 1 GB'tan az veya 1 Günlük süre kaldığında kullanıcıları otomatik olarak uyarır.",
    "es": "El bot alerta automáticamente a los usuarios cuando queda menos de 1 GB o 1 día de su plan."
  },
  "No Connection Alert (1 Day)": {
    "fa": "اخطار عدم اتصال پس از ۱ روز",
    "ar": "تنبيه بعدم وجود اتصال (يوم واحد)",
    "ru": "Оповещение об отсутствии соединения (1 день)",
    "tr": "Bağlantı Yok Uyarısı (1 Gün)",
    "es": "Alerta sin conexión (1 día)"
  },
  "Bot will alert the user if they haven't connected 1 day after getting their subscription.": {
    "fa": "در صورتی که روز بعد از خرید، کاربر هنوز حجمی مصرف نکرده باشد، پیگیری ربات فعال می‌شود.",
    "ar": "سوف يقوم الروبوت بتنبيه المستخدم إذا لم يكن متصلاً بعد يوم واحد من الحصول على اشتراكه.",
    "ru": "Бот предупредит пользователя, если он не подключился в течение 1 дня после получения подписки.",
    "tr": "Bot, aboneliğini aldıktan 1 gün sonra bağlanmaması durumunda kullanıcıyı uyaracaktır.",
    "es": "El bot alertará al usuario si no se ha conectado 1 día después de obtener su suscripción."
  },
  "First Connection Alert": {
    "fa": "اطلاع رسانی اولین اتصال",
    "ar": "تنبيه الاتصال الأول",
    "ru": "Оповещение о первом подключении",
    "tr": "İlk Bağlantı Uyarısı",
    "es": "Alerta de primera conexión"
  },
  "When a user connects successfully for the first time, they receive an alert with their sub link.": {
    "fa": "هنگامی که کاربر برای اولین بار با موفقیت به کانفیگ متصل شود، پیام خوش آمدگویی و لینک اشتراک برای او ارسال می شود.",
    "ar": "عندما يتصل المستخدم بنجاح لأول مرة، فإنه يتلقى تنبيهًا باستخدام الرابط الفرعي الخاص به.",
    "ru": "Когда пользователь успешно подключается в первый раз, он получает предупреждение со своей дополнительной ссылкой.",
    "tr": "Bir kullanıcı ilk kez başarılı bir şekilde bağlandığında alt bağlantısıyla birlikte bir uyarı alır.",
    "es": "Cuando un usuario se conecta exitosamente por primera vez, recibe una alerta con su subenlace."
  },
  "Dashboard Security & Admins Control": {
    "fa": "امنیت داشبورد و کنترل ادمین‌ها",
    "ar": "أمان لوحة المعلومات والتحكم الإداري",
    "ru": "Безопасность информационной панели и контроль администратора",
    "tr": "Kontrol Paneli Güvenliği ve Yönetici Kontrolü",
    "es": "Seguridad del panel y control de administradores"
  },
  "Set dashboard login, server listening port, and registered Telegram bot/dashboard sub-admins:": {
    "fa": "نام کاربری، رمز عبور ورود، پورت اجرایی سرور و ادمین‌های مجاز بات دالتون را تنظیم نمایید:",
    "ar": "قم بتعيين تسجيل الدخول إلى لوحة المعلومات، ومنفذ الاستماع للخادم، والمشرفين الفرعيين المسجلين لروبوت/لوحة التحكم في Telegram:",
    "ru": "Установите вход в панель управления, порт прослушивания сервера и зарегистрированных субадминистраторов бота/панели Telegram:",
    "tr": "Kontrol paneli girişini, sunucu dinleme bağlantı noktasını ve kayıtlı Telegram bot/kontrol paneli alt yöneticilerini ayarlayın:",
    "es": "Configure el inicio de sesión en el panel, el puerto de escucha del servidor y los subadministradores registrados del bot/panel de Telegram:"
  },
  "Dashboard Login User": {
    "fa": "نام کاربری ورود داشبورد",
    "ar": "مستخدم تسجيل دخول لوحة التحكم",
    "ru": "Пользователь входа в панель управления",
    "tr": "Kontrol Paneli Giriş Kullanıcısı",
    "es": "Usuario de inicio de sesión en el panel"
  },
  "Dashboard Login Pass": {
    "fa": "رمز عبور ورود داشبورد",
    "ar": "بطاقة تسجيل دخول لوحة التحكم",
    "ru": "Вход в личный кабинет",
    "tr": "Kontrol Paneli Giriş Şifresi",
    "es": "Pase de inicio de sesión en el panel de control"
  },
  "Linux Server Port": {
    "fa": "پورت سرور لینوکس",
    "ar": "منفذ خادم لينكس",
    "ru": "Порт Linux-сервера",
    "tr": "Linux Sunucu Bağlantı Noktası",
    "es": "Puerto del servidor Linux"
  },
  "Requires restart.": {
    "fa": "تغییر پورت پس از اجرای مجدد.",
    "ar": "يتطلب إعادة التشغيل.",
    "ru": "Требует перезагрузки.",
    "tr": "Yeniden başlatma gerektirir.",
    "es": "Requiere reinicio."
  },
  "Auto Refresh (Seconds)": {
    "fa": "رفرش خودکار داشبورد (ثانیه)",
    "ar": "التحديث التلقائي (ثواني)",
    "ru": "Автоматическое обновление (секунды)",
    "tr": "Otomatik Yenileme (Saniye)",
    "es": "Actualización automática (segundos)"
  },
  "0 means disabled": {
    "fa": "صفر یعنی غیرفعال",
    "ar": "0 يعني معطل",
    "ru": "0 означает отключено",
    "tr": "0 devre dışı anlamına gelir",
    "es": "0 significa discapacitado"
  },
  "👥 Manage Bot & Dashboard Admins": {
    "fa": "👥 مدیریت ادمین‌های بات و دالتون بات",
    "ar": "👥 إدارة مسؤولي الروبوت ولوحة المعلومات",
    "ru": "👥 Управление ботами и администраторами панели управления",
    "tr": "👥 Bot ve Kontrol Paneli Yöneticilerini Yönetin",
    "es": "👥 Administrar administradores de bots y paneles"
  },
  "👤 Register New Admin": {
    "fa": "👤 ثبت ادمین جدید",
    "ar": "👤 تسجيل مشرف جديد",
    "ru": "👤 Зарегистрировать нового администратора",
    "tr": "👤 Yeni Yöneticiyi Kaydedin",
    "es": "👤 Registrar nuevo administrador"
  },
  "Admin Username (No @)": {
    "fa": "نام کاربری ادمین (بدون @)",
    "ar": "اسم المستخدم الإداري (لا @)",
    "ru": "Имя пользователя администратора (без @)",
    "tr": "Yönetici Kullanıcı Adı (Hayır @)",
    "es": "Nombre de usuario del administrador (No @)"
  },
  "Telegram User ID": {
    "fa": "شناسه عددی تلگرام ادمین",
    "ar": "معرف مستخدم تيليجرام",
    "ru": "Идентификатор п��льзователя Telegram",
    "tr": "Telegram Kullanıcı Kimliği",
    "es": "ID de usuario de Telegrama"
  },
  "Admin Privilege Role": {
    "fa": "سطح دسترسی",
    "ar": "دور امتياز المشرف",
    "ru": "Роль привилегий администратора",
    "tr": "Yönetici Ayrıcalığı Rolü",
    "es": "Rol de privilegio de administrador"
  },
  "General Admin": {
    "fa": "ادمین معمولی",
    "ar": "المشرف العام",
    "ru": "Генеральный администратор",
    "tr": "Genel Yönetici",
    "es": "administrador general"
  },
  "Super Admin": {
    "fa": "سوپر ادمین",
    "ar": "المشرف الفائق",
    "ru": "Суперадминистратор",
    "tr": "Süper Yönetici",
    "es": "Súper administrador"
  },
  "Add to Admins List": {
    "fa": "افزودن به لیست ادمین‌ها",
    "ar": "أضف إلى قائمة المسؤولين",
    "ru": "Добавить в список администраторов",
    "tr": "Yönetici Listesine Ekle",
    "es": "Agregar a la lista de administradores"
  },
  "Registered Admins List": {
    "fa": "لیست ادمین‌های فعال",
    "ar": "قائمة المشرفين المسجلين",
    "ru": "Список зарегистрированных администраторов",
    "tr": "Kayıtlı Yönetici Listesi",
    "es": "Lista de administradores registrados"
  },
  "Are you sure you want to delete this admin?": {
    "fa": "آیا از حذف این ادمین اطمینان دارید؟",
    "ar": "هل أنت متأكد أنك تريد حذف هذا المشرف؟",
    "ru": "Вы уверены, что хотите удалить этого администратора?",
    "tr": "Bu yöneticiyi silmek istediğinizden emin misiniz?",
    "es": "¿Estás seguro de que deseas eliminar este administrador?"
  },
  "Electronic Gateways & Services": {
    "fa": "درگاه‌های پرداخت الکترونیک و سرویس‌ها",
    "ar": "البوابات والخدمات الإلكترونية",
    "ru": "Электронные шлюзы и услуги",
    "tr": "Elektronik Ağ Geçitleri ve Hizmetler",
    "es": "Portales y servicios electrónicos"
  },
  "Professional management of crypto keys and automation mechanisms.": {
    "fa": "مدیریت حرفه‌ای کلیدهای پرداخت ارزی، کریپتو و تنظیمات اتوماسیون (تمامی کلیدها به صورت امن نگهداری می‌شوند).",
    "ar": "الإدارة الاحترافية لمفاتيح التشفير وآليات الأتمتة.",
    "ru": "Профессиональное управление криптоключами и механизмами автоматизации.",
    "tr": "Kripto anahtarlarının ve otomasyon mekanizmalarının profesyonel yönetimi.",
    "es": "Gestión profesional de claves criptográficas y mecanismos de automatización."
  },
  "Plisio Wallet Base": {
    "fa": "آدرس کیف پول Plisio (تتر TRC20/TON)",
    "ar": "قاعدة محفظة بليسيو",
    "ru": "Основание кошелька Plisio",
    "tr": "Plisio Cüzdan Tabanı",
    "es": "Base Cartera Plisio"
  },
  "NowPayments API Key": {
    "fa": "کد امنیتی NowPayments (API Key)",
    "ar": "مفتاح واجهة برمجة تطبيقات NowPayments",
    "ru": "API-ключ NowPayments",
    "tr": "NowPayments API Anahtarı",
    "es": "Clave API de NowPayments"
  },
  "Cryptomus Key": {
    "fa": "کد امنیتی Cryptomus (API Key)",
    "ar": "مفتاح التشفير",
    "ru": "Ключ Криптома",
    "tr": "Kriptomus Anahtarı",
    "es": "Clave de criptomo"
  },
  "Cryptomus Merchant": {
    "fa": "نشان تجاری Cryptomus (Merchant ID)",
    "ar": "التاجر الكريبتوموس",
    "ru": "Торговец Криптомом",
    "tr": "Kriptomus Tüccarı",
    "es": "Comerciante de criptomus"
  },
  "Heleket Token": {
    "fa": "درگاه پرداخت Heleket (توکن / آدرس)",
    "ar": "رمز هيليكيت",
    "ru": "Жетон Хелекета",
    "tr": "Heleket Jetonu",
    "es": "Token Heleket"
  },
  "Enable Gateway: Telegram Stars": {
    "fa": "پشتیبانی از درگاه Telegram Stars (ستاره‌های تلگرام)",
    "ar": "تمكين البوابة: نجوم Telegram",
    "ru": "Включить шлюз: Telegram Stars",
    "tr": "Ağ Geçidini Etkinleştir: Telegram Yıldızları",
    "es": "Habilitar puerta de enlace: Telegram Stars"
  },
  "Add New Card": {
    "fa": "افزودن کارت جدید",
    "ar": "إضافة بطاقة جديدة",
    "ru": "Добавить новую карту",
    "tr": "Yeni Kart Ekle",
    "es": "Agregar nueva tarjeta"
  },
  "You can register one or multiple bank cards to be displayed in the bot's card-to-card message.": {
    "fa": "می‌توانید یک یا چند کارت بانکی را جهت نمایش در پیام کارت به کارت ربات ثبت نمایید.",
    "ar": "يمكنك تسجيل بطاقة مصرفية واحدة أو عدة بطاقات ليتم عرضها في رسالة الروبوت من بطاقة إلى بطاقة.",
    "ru": "Вы можете зарегистрировать одну или несколько банковских карт для отображения в сообщении бота о переадресации карт.",
    "tr": "Botun karttan karta mesajında görüntülenecek bir veya daha fazla banka kartını kaydedebilirsiniz.",
    "es": "Puede registrar una o varias tarjetas bancarias para que se muestren en el mensaje de tarjeta a tarjeta del bot."
  },
  "Remove Card": {
    "fa": "حذف کارت",
    "ar": "إزالة البطاقة",
    "ru": "Удалить карту",
    "tr": "Kartı Kaldır",
    "es": "Quitar tarjeta"
  },
  "e.g., Melli, Saman": {
    "fa": "مثلا ملی، سامان",
    "ar": "على سبيل المثال، ملي، سامان",
    "ru": "например, Мелли, Саман",
    "tr": "ör. Melli, Saman",
    "es": "por ejemplo, Melli, Samán"
  },
  "Cardholder full name": {
    "fa": "نام و نام خانوادگی صاحب کارت",
    "ar": "الاسم الكامل لحامل البطاقة",
    "ru": "Полное имя владельца карты",
    "tr": "Kart sahibinin tam adı",
    "es": "Nombre completo del titular de la tarjeta"
  },
  "Local Cache DB: SQLite 'Daltoon_Bot.db'": {
    "fa": "دیتابیس درگاه محلی: SQLite 'Daltoon_Bot.db'",
    "ar": "قاعدة بيانات ذاكرة التخزين المؤقت المحلية: SQLite 'Daltoon_Bot.db'",
    "ru": "БД локального кэша: SQLite «Daltoon_Bot.db»",
    "tr": "Yerel Önbellek Veritabanı: SQLite 'Daltoon_Bot.db'",
    "es": "Base de datos de caché local: SQLite 'Daltoon_Bot.db'"
  },
  "Clear Receipts History": {
    "fa": "حذف تاریخچه فیش‌ها",
    "ar": "مسح تاريخ الإيصالات",
    "ru": "Очистить историю квитанций",
    "tr": "Makbuz Geçmişini Temizle",
    "es": "Borrar historial de recibos"
  },
  "Are you sure you want to completely delete all transaction receipts (including approved, rejected, and pending logs) from Daltoon Bot database? This cannot be undone.": {
    "fa": "آیا از حذف کامل کل تاریخچه فیش‌های بارگذاری شده (شامل فیش‌های تایید شده، رد شده و معلق) از پایگاه داده دالتون بات اطمینان دارید؟ این عمل غیرقابل بازگشت است.",
    "ar": "هل أنت متأكد من أنك تريد حذف جميع إيصالات المعاملات بالكامل (بما في ذلك السجلات المعتمدة والمرفوضة والمعلقة) من قاعدة بيانات Daltoon Bot؟ لا يمكن التراجع عن هذا.",
    "ru": "Вы уверены, что хотите полностью удалить все квитанции о транзакциях (включая журналы одобренных, отклоненных и ожидающих выполнения транзакций) из базы данных Daltoon Bot? Это невозможно отменить.",
    "tr": "Tüm işlem makbuzlarını (onaylanan, reddedilen ve bekleyen günlükler dahil) Daltoon Bot veritabanından tamamen silmek istediğinizden emin misiniz? Bu geri alınamaz.",
    "es": "¿Está seguro de que desea eliminar por completo todos los recibos de transacciones (incluidos los registros aprobados, rechazados y pendientes) de la base de datos de Daltoon Bot? Esto no se puede deshacer."
  },
  "Truncate All Slip History Records": {
    "fa": "حذف کل تاریخچه فیش‌ها",
    "ar": "اقتطاع كافة السجلات التاريخ زلة",
    "ru": "Усечь все записи истории ошибок",
    "tr": "Tüm Kayma Geçmişi Kayıtlarını Kes",
    "es": "Truncar todos los registros del historial de deslizamientos"
  },
  "Confirm Delete Slip": {
    "fa": "تایید حذف فیش",
    "ar": "تأكيد حذف القسيمة",
    "ru": "Подтвердить удаление квитанции",
    "tr": "Fişi Silmeyi Onayla",
    "es": "Confirmar eliminar recibo"
  },
  "Zoom Receipt": {
    "fa": "بزرگنمایی فیش",
    "ar": "إيصال التكبير",
    "ru": "Увеличить квитанцию",
    "tr": "Yakınlaştırma Makbuzu",
    "es": "Recibo de zoom"
  },
  "TOMAN": {
    "fa": "تومان",
    "ar": "تومان",
    "ru": "ТОМАН",
    "tr": "TOMAN",
    "es": "TOMÁN"
  },
  "Yes, Delete": {
    "fa": "تایید و حذف",
    "ar": "نعم، احذف",
    "ru": "Да, удалить",
    "tr": "Evet, Sil",
    "es": "Sí, eliminar"
  },
  "Close": {
    "fa": "بستن",
    "ar": "إغلاق",
    "ru": "Закрыть",
    "tr": "Kapat",
    "es": "Cerrar"
  },
  "Renewing subscription...": {
    "fa": "در حال تمدید اشتراک...",
    "ar": "تجديد الاشتراك...",
    "ru": "Продление подписки...",
    "tr": "Abonelik yenileniyor...",
    "es": "Renovando suscripción..."
  },
  "Service renewed successfully! 🎉": {
    "fa": "سرویس با موفقیت تمدید شد! 🎉",
    "ar": "تم تجديد الخدمة بنجاح! 🎉",
    "ru": "Услуга успешно продлена! 🎉",
    "tr": "Hizmet başarıyla yenilendi! 🎉",
    "es": "¡Servicio renovado exitosamente! 🎉"
  },
  "Error renewing service": {
    "fa": "خطا در تمدید سرویس",
    "ar": "حدث خطأ أثناء تجديد الخدمة",
    "ru": "Ошибка продления услуги",
    "tr": "Hizmet yenilenirken hata oluştu",
    "es": "Error al renovar el servicio"
  },
  "Connection error": {
    "fa": "خطا در برقراری ارتباط",
    "ar": "خطأ في الاتصال",
    "ru": "Ошибка подключения",
    "tr": "Bağlantı hatası",
    "es": "Error de conexión"
  },
  "Resetting user link...": {
    "fa": "در حال بازنشانی لینک کاربر...",
    "ar": "إعادة ضبط رابط المستخدم...",
    "ru": "Сброс ссылки пользователя...",
    "tr": "Kullanıcı bağlantısı sıfırlanıyor...",
    "es": "Restableciendo enlace de usuario..."
  },
  "Link & UUID regenerated successfully! 🎉": {
    "fa": "لینک و آیدی با موفقیت تغییر کرد! 🎉",
    "ar": "تم إعادة إنشاء الرابط وUUID بنجاح! 🎉",
    "ru": "Ссылка и UUID успешно восстановлены! 🎉",
    "tr": "Bağlantı ve UUID başarıyla yeniden oluşturuldu! 🎉",
    "es": "¡Enlace y UUID regenerados exitosamente! 🎉"
  },
  "Error resetting link": {
    "fa": "خطا در تغییر لینک",
    "ar": "خطأ في إعادة تعيين الرابط",
    "ru": "Ошибка сброса ссылки.",
    "tr": "Bağlantı sıfırlanırken hata oluştu",
    "es": "Error al restablecer el enlace"
  },
  "Failed to communicate with server": {
    "fa": "خطا در ارتباط با سرور",
    "ar": "فشل الاتصال بالخادم",
    "ru": "Не удалось связаться с сервером",
    "tr": "Sunucuyla iletişim kurulamadı",
    "es": "No se pudo comunicar con el servidor"
  },
  "Server connection failure": {
    "fa": "خطا در ارتباط با سرور",
    "ar": "فشل اتصال الخادم",
    "ru": "Ошибка подключения к серверу",
    "tr": "Sunucu bağlantı hatası",
    "es": "Fallo de conexión al servidor"
  },
  "Direct message sent successfully!": {
    "fa": "پیام خصوصی با موفقیت ارسال شد!",
    "ar": "تم إرسال الرسالة المباشرة بنجاح!",
    "ru": "Сообщение в Директ успешно отправлено!",
    "tr": "Doğrudan mesaj başarıyla gönderildi!",
    "es": "¡Mensaje directo enviado exitosamente!"
  },
  "Error sending message": {
    "fa": "خطا در ارسال پیام",
    "ar": "حدث خطأ أثناء إرسال الرسالة",
    "ru": "Ошибка отправки сообщения",
    "tr": "Mesaj gönderilirken hata oluştu",
    "es": "Error al enviar mensaje"
  },
  "Please enter a valid Telegram User ID.": {
    "fa": "لطفا شناسه عددی تلگرام معتبری وارد کنید.",
    "ar": "الرجاء إدخال معرف مستخدم Telegram صالح.",
    "ru": "Пожалуйста, введите действительный идентификатор пользователя Telegram.",
    "tr": "Lütfen geçerli bir Telegram Kullanıcı Kimliği girin.",
    "es": "Ingrese una identificación de usuario de Telegram válida."
  },
  "Please enter a username.": {
    "fa": "لطفا نام کاربری را وارد کنید.",
    "ar": "الرجاء إدخال اسم المستخدم.",
    "ru": "Пожалуйста, введите имя пользователя.",
    "tr": "Lütfen bir kullanıcı adı girin.",
    "es": "Por favor ingrese un nombre de usuario."
  },
  "Copy Telegram ID": {
    "fa": "کپی شناسه تلگرام",
    "ar": "انسخ معرف التليجرام",
    "ru": "Скопировать идентификатор Telegram",
    "tr": "Telegram kimliğini kopyala",
    "es": "Copiar ID de Telegram"
  },
  "configs": {
    "fa": "کانفیگ",
    "ar": "التكوينات",
    "ru": "конфиги",
    "tr": "yapılandırmalar",
    "es": "configuraciones"
  },
  "Copy connection link": {
    "fa": "کپی لینک کانکشن",
    "ar": "انسخ رابط الاتصال",
    "ru": "Скопировать ссылку для подключения",
    "tr": "Bağlantı bağlantısını kopyala",
    "es": "Copiar enlace de conexión"
  },
  "Suspend": {
    "fa": "تعلیق",
    "ar": "تعليق",
    "ru": "Приостановить",
    "tr": "Askıya al",
    "es": "suspender"
  },
  "Enable": {
    "fa": "فعال کردن",
    "ar": "تمكين",
    "ru": "Включить",
    "tr": "Etkinleştir",
    "es": "Habilitar"
  },
  "Renew Service": {
    "fa": "تمدید سرویس",
    "ar": "تجديد الخدمة",
    "ru": "Продлить услугу",
    "tr": "Hizmeti Yenile",
    "es": "Renovar Servicio"
  },
  "New Link": {
    "fa": "تغییر لینک",
    "ar": "رابط جديد",
    "ru": "Новая ссылка",
    "tr": "Yeni Bağlantı",
    "es": "Nuevo enlace"
  },
  "Confirm Delete Subscription": {
    "fa": "تایید حذف کانفیگ",
    "ar": "تأكيد حذف الاشتراك",
    "ru": "Подтвердить удаление подписки",
    "tr": "Aboneliği Silmeyi Onayla",
    "es": "Confirmar eliminar suscripción"
  },
  "Remove this key": {
    "fa": "حذف این کانفیگ",
    "ar": "قم بإزالة هذا المفتاح",
    "ru": "Удалить этот ключ",
    "tr": "Bu anahtarı kaldır",
    "es": "Quitar esta clave"
  },
  "Add Manual VPN Config": {
    "fa": "افزودن کانفیگ دستی",
    "ar": "إضافة تكوين VPN اليدوي",
    "ru": "Добавить ручную настройку VPN",
    "tr": "Manuel VPN Yapılandırması Ekle",
    "es": "Agregar configuración VPN manual"
  },
  "+ Config": {
    "fa": "➕ کانفیگ",
    "ar": "+ التكوين",
    "ru": "+ Конфигурация",
    "tr": "+ Yapılandırma",
    "es": "+ Configuración"
  },
  "Send direct Telegram message": {
    "fa": "ارسال پیام خصوصی به تلگرام",
    "ar": "إرسال رسالة تيليجرام مباشرة",
    "ru": "Отправить прямое сообщение в Telegram",
    "tr": "Doğrudan Telegram mesajı gönder",
    "es": "Enviar mensaje directo de Telegram"
  },
  "💬 Message PV": {
    "fa": "💬 پیام به PV",
    "ar": "💬 رسالة PV",
    "ru": "💬 Сообщение PV",
    "tr": "💬 PV'ye mesaj gönder",
    "es": "💬 Mensaje PV"
  },
  "Confirm Delete User": {
    "fa": "تایید حذف کاربر",
    "ar": "تأكيد حذف المستخدم",
    "ru": "Подтвердить удаление пользователя",
    "tr": "Kullanıcıyı Silmeyi Onayla",
    "es": "Confirmar eliminar usuario"
  },
  "Delete User Completely": {
    "fa": "حذف کامل کاربر",
    "ar": "حذف المستخدم بالكامل",
    "ru": "Удалить пользователя полностью",
    "tr": "Kullanıcıyı Tamamen Sil",
    "es": "Eliminar usuario por completo"
  },
  "Target User:": {
    "fa": "کاربر هدف:",
    "ar": "المستخدم المستهدف:",
    "ru": "Целевой пользователь:",
    "tr": "Hedef Kullanıcı:",
    "es": "Usuario objetivo:"
  },
  "Panel Auto-Create": {
    "fa": "ساخت خودکار روی پنل",
    "ar": "لوحة الإنشاء التلقائي",
    "ru": "Автоматическое создание панели",
    "tr": "Panel Otomatik Oluşturma",
    "es": "Creación automática de paneles"
  },
  "Manual Link": {
    "fa": "ثبت دستی لینک",
    "ar": "الرابط اليدوي",
    "ru": "Ручная ссылка",
    "tr": "Manuel Bağlantı",
    "es": "Enlace manual"
  },
  "Client Email / Name (English, min 3 chars)": {
    "fa": "نام کاربری کلاینت (به انگلیسی، حداقل ۳ کاراکتر)",
    "ar": "البريد الإلكتروني/الاسم للعميل (باللغة الإنجليزية، 3 أحرف على الأقل)",
    "ru": "Адрес электронной почты/имя клиента (на английском языке, минимум 3 символа)",
    "tr": "Müşteri E-postası / Adı (İngilizce, en az 3 karakter)",
    "es": "Correo electrónico/nombre del cliente (inglés, mínimo 3 caracteres)"
  },
  "Plan Title / Label": {
    "fa": "نام پلن / مدت دوره",
    "ar": "عنوان الخطة / التسمية",
    "ru": "Название плана/метка",
    "tr": "Plan Başlığı / Etiketi",
    "es": "Título/etiqueta del plan"
  },
  "e.g. active-vless": {
    "fa": "مثلا: active-vless",
    "ar": "على سبيل المثال نشط vless",
    "ru": "например активный-без",
    "tr": "örneğin aktif-vless",
    "es": "por ej. activo-sin"
  },
  "e.g. Monthly 50GB, VIP": {
    "fa": "مثلا: ۱ ماهه ۵۰ گیگ یا VIP",
    "ar": "على سبيل المثال 50 جيجا شهريًا لكبار الشخصيات",
    "ru": "например Ежемесячно 50 ГБ, VIP",
    "tr": "örneğin Aylık 50GB, VIP",
    "es": "por ej. Mensual 50 GB, VIP"
  },
  "Connection Link (Vless / Trojan / SS)": {
    "fa": "لینک کانکشن (Vless / Trojan / SS)",
    "ar": "رابط الاتصال (Vless/Trojan/SS)",
    "ru": "Ссылка на подключение (Vless/Trojan/SS)",
    "tr": "Bağlantı Bağlantısı (Vless / Trojan / SS)",
    "es": "Enlace de conexión (Vless / Trojan / SS)"
  },
  "Paste connection link here (if left empty, a mock link is generated)": {
    "fa": "لینک تولید شده در x-ui را اینجا پیست کنید (در صورت خالی بودن، لینک تصادفی ساخته میشود)",
    "ar": "الصق رابط الاتصال هنا (إذا ترك فارغًا، فسيتم إنشاء رابط وهمي)",
    "ru": "Вставьте сюда ссылку для подключения (если оставить пустым, будет создана фиктивная ссылка)",
    "tr": "Bağlantı bağlantısını buraya yapıştırın (boş bırakılırsa bir sahte bağlantı oluşturulur)",
    "es": "Pegue el enlace de conexión aquí (si se deja vacío, se genera un enlace simulado)"
  },
  "How it works: System will define client in all active 3x-ui panel inbounds & dynamically register the unified subscription link automatically.": {
    "fa": "نحوه کارکرد پنل: سیستم به طور هوشمند کاربر تعریف‌شده را روی تمامی اینباندهای فعال چندگانه در هسته 3x-ui تعریف کرده و لینک جامع سابسکریپشن را تولید و در صفحه کاربری او فعال خواهد کرد. نیازی به ورود دستی هیچ کدی نیست!",
    "ar": "كيف يعمل: سيحدد النظام العميل في جميع الواردات النشطة للوحة 3x-ui وسيقوم بتسجيل رابط الاشتراك الموحد ديناميكيًا تلقائيًا.",
    "ru": "Как это работает: Система определит клиента во всех активных входах панели 3x-ui и автоматически зарегис��рирует единую ссылку на подписку.",
    "tr": "Nasıl çalışır: Sistem, tüm aktif 3x-ui panel gelenlerinde istemciyi tanımlayacak ve birleştirilmiş abonelik bağlantısını otomatik olarak dinamik olarak kaydedecektir.",
    "es": "Cómo funciona: el sistema definirá el cliente en todas las entradas activas del panel 3x-ui y registrará dinámicamente el enlace de suscripción unificado automáticamente."
  },
  "Traffic Cap (GB)": {
    "fa": "حجم مجاز (گیگابایت)",
    "ar": "الحد الأقصى لحركة المرور (جيجابايت)",
    "ru": "Ограничение трафика (ГБ)",
    "tr": "Trafik Sınırı (GB)",
    "es": "Límite de tráfico (GB)"
  },
  "Validity (Days)": {
    "fa": "مدت زمان (روز)",
    "ar": "الصلاحية (أيام)",
    "ru": "Срок действия (дней)",
    "tr": "Geçerlilik (Gün)",
    "es": "Validez (Días)"
  },
  "Generating on Panel...": {
    "fa": "در حال ایجاد در پنل...",
    "ar": "جارٍ الإنشاء على اللوحة...",
    "ru": "Генерация на панели...",
    "tr": "Panelde Oluşturuluyor...",
    "es": "Generando en Panel..."
  },
  "Create Subscription": {
    "fa": "ثبت کانفیگ",
    "ar": "إنشاء الاشتراك",
    "ru": "Создать подписку",
    "tr": "Abonelik Oluştur",
    "es": "Crear suscripción"
  },
  "Yes, Permanently Delete": {
    "fa": "تایید و حذف دائم",
    "ar": "نعم، الحذف نهائيًا",
    "ru": "Да, удалить навсегда",
    "tr": "Evet, Kalıcı Olarak Sil",
    "es": "Sí, eliminar permanentemente"
  },
  "Your message will be sent directly from the Telegram bot to the user's private chat. You can use HTML formatting tags like <b>bold</b> or <code>code</code>.": {
    "fa": "پیام شما به صورت مستقیم و خصوصی از طرف ربات تلگرام به پی‌وی کاربر ارسال خواهد شد. می‌توانید از تگ‌های HTML نظیر <b>خط ضخیم</b> یا <code>کد کپی‌شونده</code> استفاده کنید.",
    "ar": "سيتم إرسال رسالتك مباشرة من روبوت Telegram إلى الدردشة الخاصة للمستخدم. يمكنك استخدام علامات تنسيق HTML مثل <b>bold</b> أو <code>code</code>.",
    "ru": "Ваше сообщение будет отправлено напрямую из Telegram-бота в приватный чат пользователя. Вы можете использовать теги формат��рования HTML, например <b>жирный</b> или <code>code</code>.",
    "tr": "Mesajınız doğrudan Telegram botundan kullanıcının özel sohbetine gönderilecektir. <b>kalın</b> veya <code>code</code> gibi HTML biçimlendirme etiketlerini kullanabilirsiniz.",
    "es": "Tu mensaje se enviará directamente desde el bot de Telegram al chat privado del usuario. Puede utilizar etiquetas de formato HTML como <b>bold</b> o <code>code</code>."
  },
  "Message Text:": {
    "fa": "متن پیام:",
    "ar": "نص الرسالة:",
    "ru": "Текст сообщения:",
    "tr": "Mesaj Metni:",
    "es": "Texto del mensaje:"
  },
  "Hello! Your account has been extended...": {
    "fa": "سلام! اکانت شما با موفقیت تمدید شد...",
    "ar": "مرحبا! لقد تم تمديد حسابك...",
    "ru": "Здравствуйте! Ваш аккаунт продлен...",
    "tr": "Merhaba! Hesabınız uzatıldı...",
    "es": "¡Hola! Su cuenta ha sido ampliada..."
  },
  "Sending...": {
    "fa": "در حال ارسال...",
    "ar": "جارٍ الإرسال...",
    "ru": "Отправка...",
    "tr": "Gönderiliyor...",
    "es": "Enviando..."
  },
  "Send Message": {
    "fa": "ارسال پیام",
    "ar": "أرسل رسالة",
    "ru": "Отправить сообщение",
    "tr": "Mesaj Gönder",
    "es": "Enviar mensaje"
  },
  "🖼️ Client Connection QR Code": {
    "fa": "🖼️ بارکد QR اتصال کلاینت",
    "ar": "🖼️ رمز الاستجابة السريعة لاتصال العميل",
    "ru": "🖼️ QR-код подключения клиента",
    "tr": "🖼️ İstemci Bağlantısı QR Kodu",
    "es": "🖼️ Código QR de conexión del cliente"
  },
  "Unified Client Subscription Link:": {
    "fa": "لینک هوشمند سابسکریپشن کلاینت:",
    "ar": "رابط اشتراك العميل الموحد:",
    "ru": "Ссылка на подписку единого клиента:",
    "tr": "Birleşik Müşteri Abonelik Bağlantısı:",
    "es": "Enlace de suscripción de cliente unificado:"
  },
  "Copy Link": {
    "fa": "کپی لینک",
    "ar": "نسخ الرابط",
    "ru": "Копировать ссылку",
    "tr": "Bağlantıyı Kopyala",
    "es": "Copiar enlace"
  },
  "🔄 Renew User Service": {
    "fa": "🔄 تمدید سرویس کاربر",
    "ar": "🔄 تجديد خدمة المستخدم",
    "ru": "🔄 Продлить обслуживание пользователей",
    "tr": "🔄 Kullanıcı Hizmetini Yenile",
    "es": "🔄 Renovar Servicio de Usuario"
  },
  "Additional Traffic Limit (GB):": {
    "fa": "حجم ترافیک اضافی (گیگابایت):",
    "ar": "حد حركة المرور الإضافي (جيجابايت):",
    "ru": "Дополнительный лимит трафика (ГБ):",
    "tr": "Ek Trafik Sınırı (GB):",
    "es": "Límite de tráfico adicional (GB):"
  },
  "Additional Duration (Days):": {
    "fa": "روزهای اعتبار اضافی:",
    "ar": "المدة الإضافية (أيام):",
    "ru": "Дополнительная продолжительность (дни):",
    "tr": "Ek Süre (Gün):",
    "es": "Duración Adicional (Días):"
  },
  "Calculated Renewal Cost": {
    "fa": "هزینه محاسباتی تمدید",
    "ar": "تكلفة التجديد المحسوبة",
    "ru": "Расчетная стоимость продления",
    "tr": "Hesaplanan Yenileme Maliyeti",
    "es": "Costo de renovación calculado"
  },
  "Applying...": {
    "fa": "در حال اعمال...",
    "ar": "جارٍ التقديم...",
    "ru": "Применение...",
    "tr": "Başvuruluyor...",
    "es": "Aplicando..."
  },
  "Confirm & Renew": {
    "fa": "تایید و تمدید",
    "ar": "تأكيد وتجديد",
    "ru": "Подтвердить и продлить",
    "tr": "Onayla ve Yenile",
    "es": "Confirmar y renovar"
  },
  "Are you sure you want to regenerate UUID and link? This will drop current connections.": {
    "fa": "آیا از تغییر لینک و UUID این کانفیگ مطمئن هستید؟ این کار باعث قطع اتصال فعلی کاربر می‌شود.",
    "ar": "هل أنت متأكد أنك تريد إعادة إنشاء UUID والارتباط؟ سيؤدي هذا إلى إسقاط الاتصالات الحالية.",
    "ru": "Вы уверены, что хотите восстановить UUID и ссылку? Это приведет к разрыву текущих соединений.",
    "tr": "UUID'yi ve bağlantıyı yeniden oluşturmak istediğinizden emin misiniz? Bu, mevcut bağlantıları kesecektir.",
    "es": "¿Está seguro de que desea regenerar el UUID y el enlace? Esto eliminará las conexiones actuales."
  },
  "Link regenerated successfully!": {
    "fa": "لینک با موفقیت تغییر کرد!",
    "ar": "تم إعادة إنشاء الرابط بنجاح!",
    "ru": "Ссылка успешно восстановлена!",
    "tr": "Bağlantı başarıyla yeniden oluşturuldu!",
    "es": "¡Enlace regenerado exitosamente!"
  },
  "Subscription renewed successfully!": {
    "fa": "اشتراک با موفقیت تمدید شد!",
    "ar": "تم تجديد الاشتراك بنجاح!",
    "ru": "Подписка успешно продлена!",
    "tr": "Abonelik başarıyla yenilendi!",
    "es": "¡Suscripción renovada con éxito!"
  },
  "Search config or user...": {
    "fa": "جستجو کانفیگ یا کاربر...",
    "ar": "البحث في التكوين أو المستخدم...",
    "ru": "Поиск конфигурации или пользователя...",
    "tr": "Yapılandırmayı veya kullanıcıyı arayın...",
    "es": "Buscar configuración o usuario..."
  },
  "expired": {
    "fa": "منقضی",
    "ar": "انتهت صلاحيتها",
    "ru": "истек",
    "tr": "süresi dolmuş",
    "es": "caducado"
  },
  "Copy subscription link": {
    "fa": "کپی لینک کانفیگ",
    "ar": "انسخ رابط الاشتراك",
    "ru": "Скопировать ссылку на подписку",
    "tr": "Abonelik bağlantısını kopyala",
    "es": "Copiar enlace de suscripción"
  },
  "Copied": {
    "fa": "کپی شد",
    "ar": "منقول",
    "ru": "Скопировано",
    "tr": "Kopyalandı",
    "es": "Copiado"
  },
  "Copy": {
    "fa": "کپی",
    "ar": "نسخ",
    "ru": "Копировать",
    "tr": "Kopyala",
    "es": "Copiar"
  },
  "Show QR Code": {
    "fa": "نمایش بارکد QR",
    "ar": "إظهار رمز الاستجابة السريعة",
    "ru": "Показать QR-код",
    "tr": "QR Kodunu Göster",
    "es": "Mostrar código QR"
  },
  "QR": {
    "fa": "بارکد",
    "ar": "ريال قطري",
    "ru": "QR-код",
    "tr": "QR",
    "es": "QR"
  },
  "Reset SubLink and UUID": {
    "fa": "تغییر لینک و آیدی (UUID/subId)",
    "ar": "إعادة تعيين الارتباط الفرعي وUUID",
    "ru": "��бросить субссылку и UUID",
    "tr": "Alt Bağlantıyı ve UUID'yi Sıfırla",
    "es": "Restablecer SubLink y UUID"
  },
  "Renew Subscription": {
    "fa": "تمدید اشتراک",
    "ar": "تجديد الاشتراك",
    "ru": "Продлить подписку",
    "tr": "Aboneliği Yenile",
    "es": "Renovar suscripción"
  },
  "Renew": {
    "fa": "تمدید",
    "ar": "تجديد",
    "ru": "Продлить",
    "tr": "Yenile",
    "es": "Renovar"
  },
  "Disable": {
    "fa": "غیرفعال کردن",
    "ar": "تعطيل",
    "ru": "Отключить",
    "tr": "Devre dışı bırak",
    "es": "Desactivar"
  },
  "Delete VPN Subscription": {
    "fa": "حذف کانفیگ",
    "ar": "حذف اشتراك VPN",
    "ru": "Удалить VPN-подписку",
    "tr": "VPN Aboneliğini Sil",
    "es": "Eliminar suscripción VPN"
  },
  "Used / Remaining data:": {
    "fa": "حجم مصرفی / باقی‌مانده:",
    "ar": "البيانات المستخدمة/المتبقية:",
    "ru": "Использованные/оставшиеся данные:",
    "tr": "Kullanılan / Kalan veriler:",
    "es": "Datos usados/restantes:"
  },
  "Total:": {
    "fa": "کل:",
    "ar": "المجموع:",
    "ru": "Итого:",
    "tr": "Toplam:",
    "es": "Totales:"
  },
  "No VPN configs found": {
    "fa": "هیچ کانفیگی یافت نشد",
    "ar": "لم يتم العثور على تكوينات VPN",
    "ru": "Конфигурации VPN не найдены",
    "tr": "VPN yapılandırması bulunamadı",
    "es": "No se encontraron configuraciones de VPN"
  },
  "Scan this QR code with your client app to connect.": {
    "fa": "برای اتصال، این بارکد را با اپلیکیشن کلاینت خود اسکن کنید.",
    "ar": "قم بمسح رمز الاستجابة السريعة هذا ضوئيًا باستخدام تطبيق العميل الخاص بك للاتصال.",
    "ru": "Отсканируйте этот QR-код с помощью клиентского приложения, чтобы подключиться.",
    "tr": "Bağlanmak için bu QR kodunu istemci uygulamanızla tarayın.",
    "es": "Escanee este código QR con su aplicación cliente para conectarse."
  },
  "Renew & Recharge Subscription": {
    "fa": "تمدید و شارژ اشتراک",
    "ar": "تجديد وشحن الاشتراك",
    "ru": "Продлить и пополнить подписку",
    "tr": "Aboneliği Yenile ve Yeniden Şarj Et",
    "es": "Renovar y recargar suscripción"
  },
  "User:": {
    "fa": "کاربر:",
    "ar": "المستخدم:",
    "ru": "Пользователь:",
    "tr": "Kullanıcı:",
    "es": "Usuario:"
  },
  "Plan:": {
    "fa": "پلن:",
    "ar": "الخطة:",
    "ru": "План:",
    "tr": "Planı:",
    "es": "Plano:"
  },
  "Add Traffic (GB)": {
    "fa": "اضافه کردن حجم (گیگابایت)",
    "ar": "إضافة حركة المرور (جيجابايت)",
    "ru": "Добавить трафик (ГБ)",
    "tr": "Trafik Ekle (GB)",
    "es": "Agregar tráfico (GB)"
  },
  "Add Time (Days)": {
    "fa": "اضافه کردن زمان (روز)",
    "ar": "إضافة الوقت (أيام)",
    "ru": "Добавить время (дни)",
    "tr": "Zaman Ekle (Gün)",
    "es": "Agregar tiempo (días)"
  },
  "Submit Renewal": {
    "fa": "ثبت تمدید",
    "ar": "تقديم التجديد",
    "ru": "Отправить продление",
    "tr": "Yenilemeyi Gönder",
    "es": "Enviar renovación"
  }
,
  "⚠️ <b>Official Expiry Warning:</b>\\n\\nYour service <b>${k.planName}</b> is about to expire.\\n\\nRemaining: ${remainingGb.toFixed(2)} GB / ${remainingDays} Days.\\n\\nPlease renew to avoid interruption.": {"fa":"⚠️ <b>اخطار رسمی اتمام سرویس:</b>\\n\\nمشترک گرامی، سرویس <b>${k.planName}</b> شما رو به اتمام است.\\n\\nباقیمانده حجم: ${remainingGb.toFixed(2)} گیگابایت\\nباقیمانده زمان: ${remainingDays} روز\\n\\nجهت جلوگیری از قطع شدن دسترسی، لطفاً هرچه سریع‌تر از منوی مدیریت اشتراک‌ها اقدام به تمدید نمایید.","ar":"⚠️ <b>تحذير رسمي لانتهاء الخدمة:</b>\\n\\nخدمتك <b>${k.planName}</b> على وشك الانتهاء.\\n\\nالمتبقي: ${remainingGb.toFixed(2)} غيغابايت / ${remainingDays} يوم.\\n\\nيُرجى التجديد لتجنب الانقطاع.\n--تقسيم--\n👤 اسم المستخدم: <code>${input}</code>\\n\\n🔻 الرجاء إدخال حد حركة المرور بـ <b>جيجابايت</b> (على سبيل المثال <code>30</code>):\n--تقسيم--\n📝 <b>الموضوع:</b> \"${subject}\"\\n\\nالآن وصف لمشكلتك. يرجى كتابة رسالتك التفصيلية هنا:\n--تقسيم--\n✅ <b>تم تقديم التذكرة بنجاح!</b>\\n\\n🎟️ <b>معرف التذكرة:</b> <code>${data.ticket.id}</code>\\n📂 <b>الموضوع:</b> ${data.ticket.subject}\\n\\nسيقوم وكلاء الخدمة لدينا بمراجعة التذكرة والرد عليها بسرعة.\n--تقسيم--\n🎉 <b>اكتمل النقل! (المحاكي التعليمي ✨)</b>\\n\\nتم إهداء هذا الاشتراك بنجاح إلى @${targetUser}.\\n\\n⚠️ <i>وضع الحماية: يظل مستخدمو قاعدة البيانات الحقيقية والمحافظ دون تغيير.</i>\n--تقسيم--\n📄 <b>ملف تعريف حسابي:</b>\\n\\n💰 الرصيد: ${(currentUser.walletBalance || 0).toLocaleString()} T\\n👤 معرف المستخدم: <code>${currentUser.userId}</code>\\n📦 الخدمات النشطة: ${activeUserKeys.length}\\n🗓 تاريخ الانضمام: ${enJoinDate}\\n\\n🔹 إلى قم بإعادة شحن محفظتك، يرجى الرجوع إلى قسم المحفظة في القائمة الرئيسية.\n--تقسيم--\n🗂 <b>لديك ${activeUserKeys.length} اشتراكات نشطة:</b>\\n\\nانقر على اشتراك لإدارة UUID الخاص به أو إعادة تعيينه أو نقل الملكية إلى رفيق:\n--تقسيم--\n⚡️ خطط <b>${catName}</b>\\n\\nيُرجى اختيار إحدى الخطط المميزة التالية:\n--تقسيم--\n🔗 <b>رابط الاشتراك الخاص بك:</b>\\n\\n👇 <b>انقر فوق الكتلة أدناه للنسخ:</b>\\n\\n<code>${link}</code>\\n\\n💡 الصق هذا الرابط في تطبيق العميل الخاص بك (على سبيل المثال، v2rayNG).\n--تقسيم--\n🎉 <b>تم شراء اشتراك مخصص!</b>\\n\\n👤 اسم المستخدم: <code>${username}</code>\\n💬 حركة المرور: <b>${gb} غيغابايت</b>\\n⏳ المدة: <b>${days} Days</b>\\n💰 السعر الإجمالي: ${price.toLocaleString()} تومان\\n💰 الرصيد المحاكى: ${newBal.toLocaleString()} تومان\\n\\n🔑 <b>رابط الاشتراك:</b>\\n<code>${mockSub.subLink}</code>","ru":"⚠️ <b>Официальное предупреждение об истечении срока действия:</b>\\n\\nСрок действия вашей услуги <b>${k.planName</b> скоро истечет.\\n\\nОсталось: ${remainingGb.toFixed(2)} ГБ / ${remainingDays} дней.\\n\\nПожалуйста, продлите подписку, чтобы избежать перерывов.\n--РАЗДЕЛИТЬ--\n👤 Имя пользователя: <code>${input</code>\\n\\n🔻 Введите лимит трафика в <b>ГБ</b> (например, <code>30</code>):\n--РАЗДЕЛИТЬ--\n📝 <b>Тема:</b> \"${subject}\"\\n\\nТеперь опишите вашу проблему. Пожалуйста, введите подробное сообщение здесь:\n--РАЗДЕЛИТЬ--\n✅ <b>Заявка успешно отправлена!</b>\\n\\n🎟️ <b>Идентификатор заявки:</b> <code>${data.ticket.id</code>\\n📂 <b>Тема:</b> ${data.ticket.subject}\\n\\nНаши агенты службы быстро рассмотрят и ответят.\n--РАЗДЕЛИТ��--\n🎉 <b>Перенос завершен! (Образовательный симулятор ✨)</b>\\n\\nЭта подписка была успешно передана @${targetUser}.\\n\\n⚠️ <i>Режим песочницы: реальные пользователи базы данных и кошельки остаются нетронутыми.</i>\n--РАЗДЕЛИТЬ--\n📄 <b>Профиль моей учетной записи:</b>\\n\\n💰 Баланс: ${(currentUser.walletBalance || 0).toLocaleString()} T\\n👤 Идентификатор пользователя: <code>${currentUser.userId</code>\\n📦 Активные службы: ${activeUserKeys.length}\\n🗓 Дата присоединения: ${enJoinDate}\\n\\n🔹 Чтобы пополнить свой кошелек, перейдите в раздел «Кошелек» в главном меню.\n--РАЗДЕЛИТЬ--\n🗂 <b>У вас есть активные подписки ${activeUserKeys.length}:</b>\\n\\nНажмите на подписку, чтобы управлять ею, сбросить ее UUID или передать право владения партнеру:\n--РАЗДЕЛИТЬ--\n⚡️ <b>Планы ${catName}</b>\\n\\nВыберите один из следующих премиальных планов:\n--РАЗДЕЛИТЬ--\n🔗 <b>Ссылка на вашу подписку:</b>\\n\\n👇 <b>Нажмите на блок ниже, чтобы скопировать:</b>\\n\\n<code>${link}</code>\\n\\n💡 Вставьте эту ссылку в свое клиентское приложение (например, v2rayNG).\n--РАЗДЕЛИТЬ--\n🎉 <b>Особая подписка приобретена!</b>\\n\\n👤 Имя пользователя: <code>${username</code>\\n💬 Трафик: <b>${gb} ГБ</b>\\n⏳ Продолжительность: <b>${days} Дней</b>\\n💰 Общая стоимость: ${price.toLocaleString()} Томан\\n💰 Имитируемый баланс: ${newBal.toLocaleString()} Томан\\n\\n🔑 <b>Ссылка на подписку:</b>\\n<code>${mockSub.subLink</code>","tr":"⚠️ <b>Resmi Sona Erme Uyarısı:</b>\\n\\n<b>${k.planName</b> hizmetinizin süresi dolmak üzere.\\n\\nKalan: ${remainingGb.toFixed(2)} GB / ${remainingDays} Gün.\\n\\nKesintiyi önlemek için lütfen yenileyin.\n--BÖL--\n👤 Kullanıcı adı: <code>${input</code>\\n\\n🔻 Lütfen trafik sınırını <b>GB</b> cinsinden girin (ör. <code>30</code>):\n--BÖL--\n📝 <b>Konu:</b> \"${konu}\"\\n\\nŞimdi sorununuzun açıklaması. Lütfen ayrıntılı mesajınızı buraya yazın:\n--BÖL--\n✅ <b>Bilet başarıyla gönderildi!</b>\\n\\n🎟️ <b>Bilet Kimliği:</b> <code>${data.ticket.id</code>\\n📂 <b>Konu:</b> ${data.ticket.subject}\\n\\nHizmet temsilcilerimiz hızlı bir şekilde inceleyip yanıt verecektir.\n--BÖL--\n🎉 <b>Transfer Tamamlandı! (Eğitim Simülatörü ✨)</b>\\n\\nBu abonelik @${targetUser}'a başarıyla hediye edildi.\\n\\n⚠️ <i>Korumalı Alan Modu: Gerçek veritabanı kullanıcılarına ve cüzdanlara dokunulmaz.</i>\n--BÖL--\n📄 <b>Hesap Profilim:</b>\\n\\n💰 Bakiye: ${(currentUser.walletBalance || 0).toLocaleString()} T\\n👤 Kullanıcı Kimliği: <code>${currentUser.userId</code>\\n📦 Aktif Hizmetler: ${activeUserKeys.length}\\n🗓 Katılım Tarihi: ${enJoinDate}\\n\\n🔹 Cüzdanınızı yeniden şarj etmek için lütfen ana menüdeki Cüzdan bölümüne bakın.\n--BÖL--\n🗂 <b>${activeUserKeys.length} aktif aboneliğiniz var:</b>\\n\\nUUID'sini yönetmek, sıfırlamak veya sahipliğini bir arkadaşınıza aktarmak için bir aboneliği tıklayın:\n--BÖL--\n⚡️ <b>${catName} Planları</b>\\n\\nLütfen aşağıdaki premium planlardan birini seçin:\n--BÖL--\n🔗 <b>Abonelik Bağlantınız:</b>\\n\\n👇 <b>Kopyalamak için aşağıdaki bloğa tıklayın:</b>\\n\\n<code>${link</code>\\n\\n💡 Bu bağlantıyı istemci uygulamanıza yapıştırın (ör. v2rayNG).\n--BÖL--\n🎉 <b>Özel abonelik satın alındı!</b>\\n\\n👤 Kullanıcı Adı: <code>${username</code>\\n💬 Trafik: <b>${gb} GB</b>\\n⏳ Süre: <b>${days} Gün</b>\\n💰 Toplam Fiyat: ${price.toLocaleString()} Toman\\n💰 Simüle Edilmiş Bakiye: ${newBal.toLocaleString()} Tümen\\n\\n🔑 <b>Abonelik bağlantısı:</b>\\n<code>${mockSub.subLink</code>","es":"⚠️ <b>Advertencia de vencimiento oficial:</b>\\n\\nSu servicio <b>${k.planName}</b> está a punto de expirar.\\n\\nRemanente: ${remainingGb.toFixed(2)} GB / ${remainingDays} Días.\\n\\nRenueve para evitar interrupciones.\n--DIVIDIR--\n👤 Nombre de usuario: <code>${input}</code>\\n\\n🔻 Ingrese el límite de tráfico en <b>GB</b> (por ejemplo, <code>30</code>):\n--DIVIDIR--\n📝 <b>Asunto:</b> \"${subject}\"\\n\\nAhora descripción de su problema. Por favor escriba su mensaje detallado aquí:\n--DIVIDIR--\n✅ <b>¡Ticket presentado exitosamente!</b>\\n\\n🎟️ <b>ID del ticket:</b> <code>${data.ticket.id}</code>\\n📂 <b>Asunto:</b> ${data.ticket.subject}\\n\\nNuestros agentes de servicio revisarán y responderán rápidamente.\n--DIVIDIR--\n🎉 <b>¡Transferencia completa! (Simulador educativo ✨)</b>\\n\\nEsta suscripción se ha regalado correctamente a @${targetUser}.\\n\\n⚠️ <i>Modo Sandbox: los usuarios y billeteras de bases de datos reales permanecen intactos.</i>\n--DIVIDIR--\n📄 <b>Perfil de mi cuenta:</b>\\n\\n💰 Saldo: ${(currentUser.walletBalance || 0).toLocaleString()} T\\n👤 ID de usuario: <code>${currentUser.userId}</code>\\n📦 Servicios activos: ${activeUserKeys.length}\\n🗓 Fecha de inscripción: ${enJoinDate}\\n\\n🔹 Para recargar su billetera, consulte la sección Billetera en el menú principal.\n--DIVIDIR--\n🗂 <b>Tienes ${activeUserKeys.length} suscripciones activas:</b>\\n\\nHaz clic en una suscripción para administrarla, restablecer su UUID o transferir la propiedad a un compañero:\n--DIVIDIR--\n⚡️ <b>Planes ${catName}</b>\\n\\nSeleccione uno de los siguientes planes premium:\n--DIVIDIR--\n🔗 <b>Su enlace de suscripción:</b>\\n\\n👇 <b>Haga clic en el bloque a continuación para copiar:</b>\\n\\n<code>${link}</code>\\n\\n💡 Pegue este enlace en su aplicación cliente (por ejemplo, v2rayNG).\n--DIVIDIR--\n🎉 <b>¡Suscripción personalizada comprada!</b>\\n\\n👤 Nombre de usuario: <code>${username}</code>\\n💬 Tráfico: <b>${gb} GB</b>\\n⏳ Duración: <b>${days} Días</b>\\n💰 Precio total: ${price.toLocaleString()} Toman\\n💰 Saldo simulado: ${newBal.toLocaleString()} Toman\\n\\n🔑 <b>Enlace de suscripción:</b>\\n<code>${mockSub.subLink}</code>"},
  "👤 Username: <code>${input}</code>\\n\\n🔻 Please enter traffic limit in <b>GB</b> (e.g. <code>30</code>):": {"fa":"👤 نام کاربری: <code>${input}</code>\\n\\n🔻 لطفاً ترافیک مورد نیاز خود را به <b>گیگابایت (GB)</b> وارد کنید:\\n⚠️ عدد ارسال شده باید یک عدد انگلیسی مثبت باشد (مثلاً <code>30</code>)","ar":"👤 Username: <code>${input}</code>\\n\\n🔻 Please enter traffic limit in <b>GB</b> (e.g. <code>30</code>):","ru":"👤 Username: <code>${input}</code>\\n\\n🔻 Please enter traffic limit in <b>GB</b> (e.g. <code>30</code>):","tr":"👤 Username: <code>${input}</code>\\n\\n🔻 Please enter traffic limit in <b>GB</b> (e.g. <code>30</code>):","es":"👤 Username: <code>${input}</code>\\n\\n🔻 Please enter traffic limit in <b>GB</b> (e.g. <code>30</code>):"},
  "📝 <b>Subject:</b> \"${subject}\"\\n\\nNow description of your issue. Please type your detailed message here:": {"fa":"📝 <b>موضوع تیکت شما:</b> \"${subject}\"\\n\\nحالا لطفاً پیام خود را همراه جزئیات شرح دهید تا به واحد فنی ارسال گردد:","ar":"📝 <b>Subject:</b> \"${subject}\"\\n\\nNow description of your issue. Please type your detailed message here:","ru":"📝 <b>Subject:</b> \"${subject}\"\\n\\nNow description of your issue. Please type your detailed message here:","tr":"📝 <b>Subject:</b> \"${subject}\"\\n\\nNow description of your issue. Please type your detailed message here:","es":"📝 <b>Subject:</b> \"${subject}\"\\n\\nNow description of your issue. Please type your detailed message here:"},
  "✅ <b>Ticket filed successfully!</b>\\n\\n🎟️ <b>Ticket ID:</b> <code>${data.ticket.id}</code>\\n📂 <b>Subject:</b> ${data.ticket.subject}\\n\\nOur service agents will review and reply swiftly.": {"fa":"✅ <b>تیکت شما با موفقیت در سامانه پیگیری ثبت گردید!</b>\\n\\n🎟️ <b>شناسه پرونده:</b> <code>${data.ticket.id}</code>\\n📂 <b>موضوع:</b> ${data.ticket.subject}\\n\\nپیام شما برای بخش پشتیبانی دالتون ارسال شد. پاسخ کارشناس به زودی در همین ربات ظاهر خواهد شد.","ar":"✅ <b>Ticket filed successfully!</b>\\n\\n🎟️ <b>Ticket ID:</b> <code>${data.ticket.id}</code>\\n📂 <b>Subject:</b> ${data.ticket.subject}\\n\\nOur service agents will review and reply swiftly.","ru":"✅ <b>Ticket filed successfully!</b>\\n\\n🎟️ <b>Ticket ID:</b> <code>${data.ticket.id}</code>\\n📂 <b>Subject:</b> ${data.ticket.subject}\\n\\nOur service agents will review and reply swiftly.","tr":"✅ <b>Ticket filed successfully!</b>\\n\\n🎟️ <b>Ticket ID:</b> <code>${data.ticket.id}</code>\\n📂 <b>Subject:</b> ${data.ticket.subject}\\n\\nOur service agents will review and reply swiftly.","es":"✅ <b>Ticket filed successfully!</b>\\n\\n🎟️ <b>Ticket ID:</b> <code>${data.ticket.id}</code>\\n📂 <b>Subject:</b> ${data.ticket.subject}\\n\\nOur service agents will review and reply swiftly."},
  "🎉 <b>Transfer Complete! (Educational Simulator ✨)</b>\\n\\nThis subscription has been successfully gifted to @${targetUser}.\\n\\n⚠️ <i>Sandbox Mode: Real database users and wallets remain untouched.</i>": {"fa":"🎉 <b>انتقال با موفقیت انجام شد! (شبیه‌ساز آموزشی ✨)</b>\\n\\nسرویس شما به عنوان هدیه با موفقیت به پنل کاربر <b>@${targetUser}</b> منتقل شد و از حساب شما کسر گردید.\\n\\n⚠️ <i>محیط آزمایشی شبیه‌ساز: اطلاعات دیتابیس بدون تغییر باقی مانده است.</i>","ar":"🎉 <b>Transfer Complete! (Educational Simulator ✨)</b>\\n\\nThis subscription has been successfully gifted to @${targetUser}.\\n\\n⚠️ <i>Sandbox Mode: Real database users and wallets remain untouched.</i>","ru":"🎉 <b>Transfer Complete! (Educational Simulator ✨)</b>\\n\\nThis subscription has been successfully gifted to @${targetUser}.\\n\\n⚠️ <i>Sandbox Mode: Real database users and wallets remain untouched.</i>","tr":"🎉 <b>Transfer Complete! (Educational Simulator ✨)</b>\\n\\nThis subscription has been successfully gifted to @${targetUser}.\\n\\n⚠️ <i>Sandbox Mode: Real database users and wallets remain untouched.</i>","es":"🎉 <b>Transfer Complete! (Educational Simulator ✨)</b>\\n\\nThis subscription has been successfully gifted to @${targetUser}.\\n\\n⚠️ <i>Sandbox Mode: Real database users and wallets remain untouched.</i>"},
  "📄 <b>My Account Profile:</b>\\n\\n💰 Balance: ${(currentUser.walletBalance || 0).toLocaleString()} T\\n👤 User ID: <code>${currentUser.userId}</code>\\n📦 Active Services: ${activeUserKeys.length}\\n🗓 Join Date: ${enJoinDate}\\n\\n🔹 To recharge your wallet, please refer to the Wallet section in the main menu.": {"fa":"📄 <b>اطلاعات حساب کاربری شما:</b>\\n\\n💰 موجودی: ${(currentUser.walletBalance || 0).toLocaleString()} تومان\\n👤 آیدی عددی: <code>${currentUser.userId}</code>\\n📦 تعداد سرویس ها: ${activeUserKeys.length}\\n🗓 تاریخ ورود به بات: ${faJoinDate}\\n\\n🔹 جهت شارژ کیف پول خود، می‌توانید به بخش مربوطه در منوی اصلی ربات مراجعه فرمایید.","ar":"📄 <b>My Account Profile:</b>\\n\\n💰 Balance: ${(currentUser.walletBalance || 0).toLocaleString()} T\\n👤 User ID: <code>${currentUser.userId}</code>\\n📦 Active Services: ${activeUserKeys.length}\\n🗓 Join Date: ${enJoinDate}\\n\\n🔹 To recharge your wallet, please refer to the Wallet section in the main menu.","ru":"📄 <b>My Account Profile:</b>\\n\\n💰 Balance: ${(currentUser.walletBalance || 0).toLocaleString()} T\\n👤 User ID: <code>${currentUser.userId}</code>\\n📦 Active Services: ${activeUserKeys.length}\\n🗓 Join Date: ${enJoinDate}\\n\\n🔹 To recharge your wallet, please refer to the Wallet section in the main menu.","tr":"📄 <b>My Account Profile:</b>\\n\\n💰 Balance: ${(currentUser.walletBalance || 0).toLocaleString()} T\\n👤 User ID: <code>${currentUser.userId}</code>\\n📦 Active Services: ${activeUserKeys.length}\\n🗓 Join Date: ${enJoinDate}\\n\\n🔹 To recharge your wallet, please refer to the Wallet section in the main menu.","es":"📄 <b>My Account Profile:</b>\\n\\n💰 Balance: ${(currentUser.walletBalance || 0).toLocaleString()} T\\n👤 User ID: <code>${currentUser.userId}</code>\\n📦 Active Services: ${activeUserKeys.length}\\n🗓 Join Date: ${enJoinDate}\\n\\n🔹 To recharge your wallet, please refer to the Wallet section in the main menu."},
  "🗂 <b>You have ${activeUserKeys.length} active subscription(s):</b>\\n\\nClick a subscription to manage, reset its UUID, or transfer ownership to a companion:": {"fa":"🗂 <b>تعداد اشتراک‌های فعال شما: ${activeUserKeys.length} سرویس</b>\\n\\nجهت تمدید ساب، ابطال و تغییر کلید خصوصی (Reset UUID)، یا انتقال مالکیت به دوست روی دکمه مدیریت آن ضربه بزنید:","ar":"🗂 <b>You have ${activeUserKeys.length} active subscription(s):</b>\\n\\nClick a subscription to manage, reset its UUID, or transfer ownership to a companion:","ru":"🗂 <b>You have ${activeUserKeys.length} active subscription(s):</b>\\n\\nClick a subscription to manage, reset its UUID, or transfer ownership to a companion:","tr":"🗂 <b>You have ${activeUserKeys.length} active subscription(s):</b>\\n\\nClick a subscription to manage, reset its UUID, or transfer ownership to a companion:","es":"🗂 <b>You have ${activeUserKeys.length} active subscription(s):</b>\\n\\nClick a subscription to manage, reset its UUID, or transfer ownership to a companion:"},
  "⚡️ <b>${catName} Plans</b>\\n\\nPlease select one of the following premium plans:": {"fa":"⚡️ <b>پلن‌های بخش ${catName}</b>\\n\\nلطفاً یکی از تعرفه‌های معتبر زیر را انتخاب کنید تا فرآیند فعال‌سازی فوری آغاز شود:","ar":"⚡️ <b>${catName} Plans</b>\\n\\nPlease select one of the following premium plans:","ru":"⚡️ <b>${catName} Plans</b>\\n\\nPlease select one of the following premium plans:","tr":"⚡️ <b>${catName} Plans</b>\\n\\nPlease select one of the following premium plans:","es":"⚡️ <b>${catName} Plans</b>\\n\\nPlease select one of the following premium plans:"},
  "🔗 <b>Your Subscription Link:</b>\\n\\n👇 <b>Click the block below to copy:</b>\\n\\n<code>${link}</code>\\n\\n💡 Paste this link into your client application (e.g. v2rayNG).": {"fa":"🔗 <b>لینک اتصال و اشتراک اختصاصی شما:</b>\\n\\n👇 <b>جهت کپی کردن، روی باکس زیر کلیک یا لمس کنید:</b>\\n\\n<code>${link}</code>\\n\\n💡 این لینک را کپی کرده و در برنامه مورد نظر خود (مانند v2rayNG) وارد نمایید.","ar":"🔗 <b>Your Subscription Link:</b>\\n\\n👇 <b>Click the block below to copy:</b>\\n\\n<code>${link}</code>\\n\\n💡 Paste this link into your client application (e.g. v2rayNG).","ru":"🔗 <b>Your Subscription Link:</b>\\n\\n👇 <b>Click the block below to copy:</b>\\n\\n<code>${link}</code>\\n\\n💡 Paste this link into your client application (e.g. v2rayNG).","tr":"🔗 <b>Your Subscription Link:</b>\\n\\n👇 <b>Click the block below to copy:</b>\\n\\n<code>${link}</code>\\n\\n💡 Paste this link into your client application (e.g. v2rayNG).","es":"🔗 <b>Your Subscription Link:</b>\\n\\n👇 <b>Click the block below to copy:</b>\\n\\n<code>${link}</code>\\n\\n💡 Paste this link into your client application (e.g. v2rayNG)."},
  "🎉 <b>Custom subscription purchased!</b>\\n\\n👤 Username: <code>${username}</code>\\n💬 Traffic: <b>${gb} GB</b>\\n⏳ Duration: <b>${days} Days</b>\\n💰 Total Price: ${price.toLocaleString()} Toman\\n💰 Simulated Balance: ${newBal.toLocaleString()} Toman\\n\\n🔑 <b>Subscription link:</b>\\n<code>${mockSub.subLink}</code>": {"fa":"🎉 <b>خرید آزمایشی کانفیگ دلخواه با موفقیت انجام شد!</b>\\n\\n👤 نام کاربری: <code>${username}</code>\\n💬 حجم: <b>${gb} گیگابایت</b>\\n⏳ مدت زمان: <b>${days} روز</b>\\n💳 هزینه: ${isUserAdminOrOwner ? \"۰ تومان (ویژه ادمین 👑)\" : price.toLocaleString() + \" تومان\"}\\n💰 موجودی کیف پول: ${newBal.toLocaleString()} تومان\\n\\n🔑 <b>لینک سابسکریپشن:</b>\\n<code>${mockSub.subLink}</code>\\n\\n⚠️ <i>محیط آزمایشی شبیه‌ساز: تراکنش واقعی اعمال نشده است.</i>","ar":"🎉 <b>Custom subscription purchased!</b>\\n\\n👤 Username: <code>${username}</code>\\n💬 Traffic: <b>${gb} GB</b>\\n⏳ Duration: <b>${days} Days</b>\\n💰 Total Price: ${price.toLocaleString()} Toman\\n💰 Simulated Balance: ${newBal.toLocaleString()} Toman\\n\\n🔑 <b>Subscription link:</b>\\n<code>${mockSub.subLink}</code>","ru":"🎉 <b>Custom subscription purchased!</b>\\n\\n👤 Username: <code>${username}</code>\\n💬 Traffic: <b>${gb} GB</b>\\n⏳ Duration: <b>${days} Days</b>\\n💰 Total Price: ${price.toLocaleString()} Toman\\n💰 Simulated Balance: ${newBal.toLocaleString()} Toman\\n\\n🔑 <b>Subscription link:</b>\\n<code>${mockSub.subLink}</code>","tr":"🎉 <b>Custom subscription purchased!</b>\\n\\n👤 Username: <code>${username}</code>\\n💬 Traffic: <b>${gb} GB</b>\\n⏳ Duration: <b>${days} Days</b>\\n💰 Total Price: ${price.toLocaleString()} Toman\\n💰 Simulated Balance: ${newBal.toLocaleString()} Toman\\n\\n🔑 <b>Subscription link:</b>\\n<code>${mockSub.subLink}</code>","es":"🎉 <b>Custom subscription purchased!</b>\\n\\n👤 Username: <code>${username}</code>\\n💬 Traffic: <b>${gb} GB</b>\\n⏳ Duration: <b>${days} Days</b>\\n💰 Total Price: ${price.toLocaleString()} Toman\\n💰 Simulated Balance: ${newBal.toLocaleString()} Toman\\n\\n🔑 <b>Subscription link:</b>\\n<code>${mockSub.subLink}</code>"},
  "Direct Renewal for sub ${subName} (${gb}GB - ${days}days)": {"fa":"تمدید مستقیم ساب ${subName} (${gb}گیگابایت - ${days}روز)","ar":"التجديد المباشر للاشتراك الفرعي ${subName} (${gb}GB - ${days}days)\n--تقسيم--\n🎉 <b>تم تجديد الخدمة بنجاح! ✨</b>\\n\\n💬 حركة المرور المضافة: <b>${gb} غيغابايت</b>\\n⏳ المدة المضافة: <b>${days} أيام</b>\\n💰 السعر: ${price.toLocaleString()} تومان\\n💰 الرصيد المحاكى: ${newBal.toLocaleString()} تومان\n--تقسيم--\n🎉 <b>تم إنشاء مفتاح الاشتراك! (وضع الحماية ✨)</b>\\n\\nعنوان URL الجديد:\\n\\n<code>${nextSubLink}</code>\\n\\n⚠️ <i>ملاحظة: لا يغير وضع الحماية التعليمي هذا بيانات الاعتماد في قاعدة البيانات المستمرة.</i>\n--تقسيم--\n💳 <b>فاتورة تعبئة الرصيد - ${amount.toLocaleString()} تومان</b>\\n\\nيُرجى اختيار بوابة دفع فورية أدناه لتسليم الحساب تلقائيًا في الوقت الفعلي:\n--تقسيم--\n⭐️ <b>بوابة دفع Telegram Stars</b>\\n\\n💵 المبلغ: ${parseInt(amount).toLocaleString()} T\\n💎 التكلفة: <b>${starsCost} Stars (⭐️)</b>\\n\\n👇 أكمل الدفع فورًا عبر النجوم أدناه:\n--تقسيم--\n🌐 <b>${gatewayName} المحطة الفورية</b>\\n\\n💵 السعر: ${parsedAmount.toLocaleString()} T\\n💰 التكلفة: <b>${usdtCost} USDT</b>\\n\\n👇 أكمل عملية الدفع أدناه عبر ${gatewayName}:\n--تقسيم--\n🎉 <b>تمت الموافقة على إعادة شحن Sandbox بنجاح! ✨</b>\\n\\nتتم إضافة <b>${amount.toLocaleString()} Toman</b> إلى رصيدك المحاكى عبر <b>${gatewayName}</b>.\\n\\n💰 الرصيد المحاكى: ${newBal.toLocaleString()} Toman.\\n\\n⚠️ <i>Educational Sandbox ملاحظة: محافظ قواعد البيانات الثابتة الحقيقية تظل نظيفة تمامًا لم تمس.</i>\n--تقسيم--\n❌ الأموال غير كافية!\\n\\nالتكوين المحدد: ${matchedPlan.name}\\nالسعر: ${matchedPlan.price.toLocaleString()} تومان\\nرصيد محفظتك: ${currentUser.walletBalance.toLocaleString()} تومان\\n\\nيُرجى تعبئة محفظتك أولاً لشراء هذه الخطة.\n--تقسيم--\n💸 تم تحميل قسيمة من بطاقة إلى بطاقة\\n💵 السعر: ${amountNum.toLocaleString()} تومان\\n📝 التفاصيل: ${invoiceDesc}\n--تقسيم--\n✅ تم تحميل الإيصال بنجاح!\\n\\nالرمز المرجعي: ${newTx.id}\\nالمبلغ: ${amountNum.toLocaleString()} تومان\\n\\nسيقوم المسؤولون بفحص قسيمتك المصرفية. بمجرد الموافقة عليه، سيتم إضافة رصيدك وسنقوم بإعلامك. شكرًا لك!","ru":"Прямое продление для подписки ${subName} (${gb}ГБ – ${days}дней)\n--РАЗДЕЛИТЬ--\n🎉 <b>Услуга успешно продлена! ✨</b>\\n\\n💬 Добавленный трафик: <b>${gb} ГБ</b>\\n⏳ Добавленная продолжительность: <b>${days} Дней</b>\\n💰 Цена: ${price.toLocaleString()} Томан\\n💰 Имитируемый баланс: ${newBal.toLocaleString()} Томан\n--РАЗДЕЛИТЬ--\n🎉 <b>Ключ подписки создан! (Режим песочницы ✨)</b>\\n\\nНовый URL:\\n\\n<code>${nextSubLink</code>\\n\\n⚠️ <i>Примечание. Эта образовательная песочница не изменяет учетные данные в постоянной базе данных.</i>\n--РАЗДЕЛИТЬ--\n💳 <b>Счет на пополнение – ${amount.toLocaleString()} Toman</b>\\n\\nПожалуйста, выберите ниже способ мгновенной оплаты для автоматической доставки на счет в режиме реального времени:\n--РАЗДЕЛИТЬ--\n⭐️ <b>Платежный шлюз Telegram Stars</b>\\n\\n💵 Сумма: ${parseInt(amount).toLocaleString()} T\\n💎 Стоимость: <b>${starsCost} Stars (⭐️)</b>\\n\\n👇 Завершите оплату мгновенно с помощью звездочек ниже:\n--РАЗДЕЛИТЬ--\n🌐 <b>${gatewayName} Мгновенный терминал</b>\\n\\n💵 Цена: ${parsedAmount.toLocaleString()} T\\n💰 Стоимость: <b>${usdtCost} USDT</b>\\n\\n👇 Завершите оформление заказа ниже через ${gatewayName}:\n--РАЗДЕЛИТЬ--\n🎉 <b>Пополнение песочницы успешно одобрено! ✨</b>\\n\\nНа ваш смоделированный баланс зачисляется <b>${amount.toLocaleString()} Toman</b> через <b>${gatewayName</b>.\\n\\n💰 Имитируемый баланс: ${newBal.toLocaleString()} Toman.\\n\\n⚠️ <i>Образовательная песочница. Примечание. Настоящие кошельки с постоянными базами данных остаются полностью чистыми и нетронутый.</i>\n--РАЗДЕЛИТЬ--\n❌ Недостаточно средств!\\n\\nВыбранная конфигурация: ${matchedPlan.name}\\nЦена: ${matchedPlan.price.toLocaleString()} Томан\\nБаланс вашего кошелька: ${currentUser.walletBalance.toLocaleString()} Томан\\n\\nСначала пополните свой кошелек, чтобы приобрести этот план.\n--РАЗДЕЛИТЬ--\n💸 Квитанция о переводе с карты на карту загружена\\n💵 Цена: ${amountNum.toLocaleString()} Томан\\n📝 Подробности: ${invoiceDesc}\n--РАЗДЕЛИТЬ--\n✅ Квитанция успешно загружена!\\n\\nСправочный код: ${newTx.id}\\nAmount: ${amountNum.toLocaleString()} Томан\\n\\nАдминистраторы проверят вашу банковскую квитанцию. Как только он будет одобрен, ваш баланс будет зачислен, и мы уведомим вас. Спасибо!","tr":"${subName} (${gb}GB - ${days}days) alt kısmı için Doğrudan Yenileme\n--BÖL--\n🎉 <b>Hizmet başarıyla yenilendi! ✨</b>\\n\\n💬 Eklenen Trafik: <b>${gb} GB</b>\\n⏳ Eklenen Süre: <b>${days} Gün</b>\\n💰 Fiyat: ${price.toLocaleString()} Tümen\\n💰 Simüle Edilmiş Bakiye: ${newBal.toLocaleString()} Tümen\n--BÖL--\n🎉 <b>Abonelik Anahtarı Oluşturuldu! (Korumalı Alan Modu ✨)</b>\\n\\nYeni URL:\\n\\n<code>${nextSubLink</code>\\n\\n⚠️ <i>Uyarı: Bu eğitici sanal alan, kalıcı veritabanındaki kimlik bilgilerini değiştirmez.</i>\n--BÖL--\n💳 <b>Yükleme Faturası - ${amount.toLocaleString()} Tüm</b>\\n\\nOtomatik gerçek zamanlı hesap teslimatı için lütfen aşağıdan bir anında ödeme ağ geçidi seçin:\n--BÖL--\n⭐️ <b>Telegram Stars Ödeme Ağ Geçidi</b>\\n\\n💵 Tutar: ${parseInt(amount).toLocaleString()} T\\n💎 Maliyet: <b>${starsCost} Yıldız (⭐️)</b>\\n\\n👇 Aşağıdaki yıldızlarla ödemeyi anında tamamlayın:\n--BÖL--\n🌐 <b>${gatewayName} Anında Terminal</b>\\n\\n💵 Fiyat: ${parsedAmount.toLocaleString()} T\\n💰 Maliyet: <b>${usdtCost} USDT</b>\\n\\n👇 Aşağıdaki ödeme işlemini ${gatewayName} aracılığıyla tamamlayın:\n--BÖL--\n🎉 <b>Sandbox Yeniden Yüklemesi Başarıyla Onaylandı! ✨</b>\\n\\nSimüle edilmiş bakiyenize <b>${gatewayName</b> aracılığıyla <b>${amount.toLocaleString()} Toman</b> aktarılır.\\n\\n💰 Simüle Bakiye: ${newBal.toLocaleString()} Toman.\\n\\n⚠️ <i>Eğitimsel Korumalı Alan Notu: Gerçek kalıcı veritabanı cüzdanları tamamen temiz ve dokunulmaz kalır.</i>\n--BÖL--\n❌ Yetersiz Fon!\\n\\nSeçilen Yapılandırma: ${matchedPlan.name}\\nFiyat: ${matchedPlan.price.toLocaleString()} Toman\\nCüzdan bakiyeniz: ${currentUser.walletBalance.toLocaleString()} Toman\\n\\nBu planı satın almak için lütfen önce cüzdanınıza para yükleyin.\n--BÖL--\n💸 Karttan karta slip yüklendi\\n💵 Fiyat: ${amountNum.toLocaleString()} Tüm\\n📝 Ayrıntı: ${invoiceDesc}\n--BÖL--\n✅ Makbuz başarıyla yüklendi!\\n\\nReferans Kodu: ${newTx.id}\\nAmount: ${amountNum.toLocaleString()} Toman\\n\\nYöneticiler banka dekontunuzu inceleyecek. Onaylanır onaylanmaz bakiyeniz hesabınıza aktarılır ve size bilgi veririz. Teşekkür ederim!","es":"Renovación directa para sub${subName} (${gb}GB - ${days}days)\n--DIVIDIR--\n🎉 <b>¡Servicio renovado exitosamente! ✨</b>\\n\\n💬 Tráfico agregado: <b>${gb} GB</b>\\n⏳ Duración agregada: <b>${days} Días</b>\\n💰 Precio: ${price.toLocaleString()} Toman\\n💰 Saldo simulado: ${newBal.toLocaleString()} Toman\n--DIVIDIR--\n🎉 <b>¡Clave de suscripción generada! (Modo Sandbox ✨)</b>\\n\\nNueva URL:\\n\\n<code>${nextSubLink}</code>\\n\\n⚠️ <i>Aviso: Este sandbox educativo no altera las credenciales en la base de datos persistente.</i>\n--DIVIDIR--\n💳 <b>Factura de recarga - ${amount.toLocaleString()} Toman</b>\\n\\nElija una pasarela de pago instantáneo a continuación para la entrega automática de la cuenta en tiempo real:\n--DIVIDIR--\n⭐️ <b>Pasarela de pago de Telegram Stars</b>\\n\\n💵 Monto: ${parseInt(amount).toLocaleString()} T\\n💎 Costo: <b>${starsCost} Estrellas (⭐️)</b>\\n\\n👇 Complete el pago instantáneamente a través de las siguientes estrellas:\n--DIVIDIR--\n🌐 <b>${gatewayName} Terminal instantánea</b>\\n\\n💵 Precio: ${parsedAmount.toLocaleString()} T\\n💰 Costo: <b>${usdtCost} USDT</b>\\n\\n👇 Complete el pago a continuación a través de ${gatewayName}:\n--DIVIDIR--\n🎉 <b>¡La recarga de Sandbox se aprobó con éxito! ✨</b>\\n\\nSu saldo simulado se acredita con <b>${amount.toLocaleString()} Toman</b> a través de <b>${gatewayName}</b>.\\n\\n💰 Saldo simulado: ${newBal.toLocaleString()} Toman.\\n\\n⚠️ <i>Nota de Sandbox educativo: las carteras de bases de datos persistentes reales permanecen completamente limpias e intactas.</i>\n--DIVIDIR--\n❌ ¡Fondos insuficientes!\\n\\nConfiguración seleccionada: ${matchedPlan.name}\\nPrecio: ${matchedPlan.price.toLocaleString()} Toman\\nSaldo de su billetera: ${currentUser.walletBalance.toLocaleString()} Toman\\n\\nPrimero recargue su billetera para comprar este plan.\n--DIVIDIR--\n💸 Comprobante de tarjeta a tarjeta subido\\n💵 Precio: ${amountNum.toLocaleString()} Toman\\n📝 Detalle: ${invoiceDesc}\n--DIVIDIR--\n✅ ¡Recibo cargado exitosamente!\\n\\nCódigo de referencia: ${newTx.id}\\nCantidad: ${amountNum.toLocaleString()} Toman\\n\\nLos administradores inspeccionarán su comprobante bancario. Tan pronto como se apruebe, se acreditará su saldo y se lo notificaremos. ¡Gracias!"},
  "🎉 <b>Service successfully renewed! ✨</b>\\n\\n💬 Added Traffic: <b>${gb} GB</b>\\n⏳ Added Duration: <b>${days} Days</b>\\n💰 Price: ${price.toLocaleString()} Toman\\n💰 Simulated Balance: ${newBal.toLocaleString()} Toman": {"fa":"🎉 <b>سرویس آزمایشی شما با موفقیت تمدید شد! ✨</b>\\n\\n💬 ترافیک اضافه شده: <b>${gb} گیگابایت</b>\\n⏳ روز اضافه شده: <b>${days} روز</b>\\n💳 هزینه کسر شده: ${isUserAdminOrOwner ? \"۰ تومان (ویژه ادمین 👑)\" : price.toLocaleString() + \" تومان\"}\\n💰 موجودی کیف پول: ${newBal.toLocaleString()} تومان\\n\\nسرویس شما با موفقیت ارتقا و در سرور تمدید شد. کانکشن‌های قبلی همچنان فعال هستند.","ar":"🎉 <b>Service successfully renewed! ✨</b>\\n\\n💬 Added Traffic: <b>${gb} GB</b>\\n⏳ Added Duration: <b>${days} Days</b>\\n💰 Price: ${price.toLocaleString()} Toman\\n💰 Simulated Balance: ${newBal.toLocaleString()} Toman","ru":"🎉 <b>Service successfully renewed! ✨</b>\\n\\n💬 Added Traffic: <b>${gb} GB</b>\\n⏳ Added Duration: <b>${days} Days</b>\\n💰 Price: ${price.toLocaleString()} Toman\\n💰 Simulated Balance: ${newBal.toLocaleString()} Toman","tr":"🎉 <b>Service successfully renewed! ✨</b>\\n\\n💬 Added Traffic: <b>${gb} GB</b>\\n⏳ Added Duration: <b>${days} Days</b>\\n💰 Price: ${price.toLocaleString()} Toman\\n💰 Simulated Balance: ${newBal.toLocaleString()} Toman","es":"🎉 <b>Service successfully renewed! ✨</b>\\n\\n💬 Added Traffic: <b>${gb} GB</b>\\n⏳ Added Duration: <b>${days} Days</b>\\n💰 Price: ${price.toLocaleString()} Toman\\n💰 Simulated Balance: ${newBal.toLocaleString()} Toman"},
  "🎉 <b>Subscription Key Generated! (Sandbox Mode ✨)</b>\\n\\nNew URL:\\n\\n<code>${nextSubLink}</code>\\n\\n⚠️ <i>Notice: This educational sandbox does not alter credentials in the persistent database.</i>": {"fa":"🎉 <b>کلید اتصال شما بازنشانی شد! (شبیه‌ساز آموزشی ✨)</b>\\n\\n🔑 آدرس سابسکریپشن نوین شما:\\n\\n<code>${nextSubLink}</code>\\n\\n⚠️ لینک قبلی دیگر متصل نخواهد شد. لطفاً پیوند بالا را کپی و در نرم‌افزار ایمپورت کنید.\\n\\n⚠️ <i>توجه: کلید جدید تفریحی بوده و تأثیری بر کلید اشتراک دیتابیس واقعی ندارد.</i>","ar":"🎉 <b>Subscription Key Generated! (Sandbox Mode ✨)</b>\\n\\nNew URL:\\n\\n<code>${nextSubLink}</code>\\n\\n⚠️ <i>Notice: This educational sandbox does not alter credentials in the persistent database.</i>","ru":"🎉 <b>Subscription Key Generated! (Sandbox Mode ✨)</b>\\n\\nNew URL:\\n\\n<code>${nextSubLink}</code>\\n\\n⚠️ <i>Notice: This educational sandbox does not alter credentials in the persistent database.</i>","tr":"🎉 <b>Subscription Key Generated! (Sandbox Mode ✨)</b>\\n\\nNew URL:\\n\\n<code>${nextSubLink}</code>\\n\\n⚠️ <i>Notice: This educational sandbox does not alter credentials in the persistent database.</i>","es":"🎉 <b>Subscription Key Generated! (Sandbox Mode ✨)</b>\\n\\nNew URL:\\n\\n<code>${nextSubLink}</code>\\n\\n⚠️ <i>Notice: This educational sandbox does not alter credentials in the persistent database.</i>"},
  "💳 <b>Top-up Invoice - ${amount.toLocaleString()} Toman</b>\\n\\nPlease choose an instant payment gateway below for automatic real-time account delivery:": {"fa":"💳 <b>فاکتور شارژ کیف پول - مبلغ ${amount.toLocaleString()} تومان</b>\\n\\nلطفاً جهت پرداخت آنی و شارژ کاملاً خودکار، یکی از درگاه‌های الکترونیکی یا روش انتقال دستی زیر را انتخاب کنید:","ar":"💳 <b>Top-up Invoice - ${amount.toLocaleString()} Toman</b>\\n\\nPlease choose an instant payment gateway below for automatic real-time account delivery:","ru":"💳 <b>Top-up Invoice - ${amount.toLocaleString()} Toman</b>\\n\\nPlease choose an instant payment gateway below for automatic real-time account delivery:","tr":"💳 <b>Top-up Invoice - ${amount.toLocaleString()} Toman</b>\\n\\nPlease choose an instant payment gateway below for automatic real-time account delivery:","es":"💳 <b>Top-up Invoice - ${amount.toLocaleString()} Toman</b>\\n\\nPlease choose an instant payment gateway below for automatic real-time account delivery:"},
  "⭐️ <b>Telegram Stars Payment Gateway</b>\\n\\n💵 Amount: ${parseInt(amount).toLocaleString()} T\\n💎 Cost: <b>${starsCost} Stars (⭐️)</b>\\n\\n👇 Complete payment instantly via stars below:": {"fa":"⭐️ <b>شارژ آنلاین با ستاره‌های تلگرام (Telegram Stars)</b>\\n\\n💵 مبلغ شارژ: ${parseInt(amount).toLocaleString()} تومان\\n💎 تعرفه: <b>${starsCost} ستاره تلگرام ⭐️</b>\\n\\n👇 جهت پرداخت و افزایش اعتبار آنی حساب خود روی دکمه پرداخت زیر ضربه بزنید:","ar":"⭐️ <b>Telegram Stars Payment Gateway</b>\\n\\n💵 Amount: ${parseInt(amount).toLocaleString()} T\\n💎 Cost: <b>${starsCost} Stars (⭐️)</b>\\n\\n👇 Complete payment instantly via stars below:","ru":"⭐️ <b>Telegram Stars Payment Gateway</b>\\n\\n💵 Amount: ${parseInt(amount).toLocaleString()} T\\n💎 Cost: <b>${starsCost} Stars (⭐️)</b>\\n\\n👇 Complete payment instantly via stars below:","tr":"⭐️ <b>Telegram Stars Payment Gateway</b>\\n\\n💵 Amount: ${parseInt(amount).toLocaleString()} T\\n💎 Cost: <b>${starsCost} Stars (⭐️)</b>\\n\\n👇 Complete payment instantly via stars below:","es":"⭐️ <b>Telegram Stars Payment Gateway</b>\\n\\n💵 Amount: ${parseInt(amount).toLocaleString()} T\\n💎 Cost: <b>${starsCost} Stars (⭐️)</b>\\n\\n👇 Complete payment instantly via stars below:"},
  "🌐 <b>${gatewayName} Instant Terminal</b>\\n\\n💵 Price: ${parsedAmount.toLocaleString()} T\\n💰 Cost: <b>${usdtCost} USDT</b>\\n\\n👇 Complete the checkout below via ${gatewayName}:": {"fa":"🌐 <b>درگاه مستقیم ارزی مدرن (${gatewayName})</b>\\n\\n💵 مبلغ سفارش: ${parsedAmount.toLocaleString()} تومان\\n💰 ارزش تتر: <b>${usdtCost} USDT</b>\\n\\n👇 روی دکمه زیر کلیک کرده تا وارد فاکتور سیستم ${gatewayName} شوید:","ar":"🌐 <b>${gatewayName} Instant Terminal</b>\\n\\n💵 Price: ${parsedAmount.toLocaleString()} T\\n💰 Cost: <b>${usdtCost} USDT</b>\\n\\n👇 Complete the checkout below via ${gatewayName}:","ru":"🌐 <b>${gatewayName} Instant Terminal</b>\\n\\n💵 Price: ${parsedAmount.toLocaleString()} T\\n💰 Cost: <b>${usdtCost} USDT</b>\\n\\n👇 Complete the checkout below via ${gatewayName}:","tr":"🌐 <b>${gatewayName} Instant Terminal</b>\\n\\n💵 Price: ${parsedAmount.toLocaleString()} T\\n💰 Cost: <b>${usdtCost} USDT</b>\\n\\n👇 Complete the checkout below via ${gatewayName}:","es":"🌐 <b>${gatewayName} Instant Terminal</b>\\n\\n💵 Price: ${parsedAmount.toLocaleString()} T\\n💰 Cost: <b>${usdtCost} USDT</b>\\n\\n👇 Complete the checkout below via ${gatewayName}:"},
  "🎉 <b>Sandbox Recharge Approved Successfully! ✨</b>\\n\\nYour simulated balance is credited with <b>${amount.toLocaleString()} Toman</b> via <b>${gatewayName}</b>.\\n\\n💰 Simulated Balance: ${newBal.toLocaleString()} Toman.\\n\\n⚠️ <i>Educational Sandbox Note: Real persistent database wallets remain completely clean and untouched.</i>": {"fa":"🎉 <b>پرداخت آزمایشی شبیه‌ساز با موفقیت تایید شد! ✨</b>\\n\\n💰 اعتبار آزمایشی کیف پول شما به صورت <b>آنی و کاملاً خودکار</b> به مبلغ <b>${amount.toLocaleString()} تومان</b> از طریق <b>${gatewayName}</b> افزایش یافت.\\n\\n💵 موجودی فعلی (محلی): ${newBal.toLocaleString()} تومان\\n\\n⚠️ <i>توجه: کل فرآیند تراکنش صرفاً شبیه‌ساز آموزشی است و تغییری در حساب‌های دیتابیس واقعی ادمین یا کاربر ایجاد نکرده است.</i>","ar":"🎉 <b>Sandbox Recharge Approved Successfully! ✨</b>\\n\\nYour simulated balance is credited with <b>${amount.toLocaleString()} Toman</b> via <b>${gatewayName}</b>.\\n\\n💰 Simulated Balance: ${newBal.toLocaleString()} Toman.\\n\\n⚠️ <i>Educational Sandbox Note: Real persistent database wallets remain completely clean and untouched.</i>","ru":"🎉 <b>Sandbox Recharge Approved Successfully! ✨</b>\\n\\nYour simulated balance is credited with <b>${amount.toLocaleString()} Toman</b> via <b>${gatewayName}</b>.\\n\\n💰 Simulated Balance: ${newBal.toLocaleString()} Toman.\\n\\n⚠️ <i>Educational Sandbox Note: Real persistent database wallets remain completely clean and untouched.</i>","tr":"🎉 <b>Sandbox Recharge Approved Successfully! ✨</b>\\n\\nYour simulated balance is credited with <b>${amount.toLocaleString()} Toman</b> via <b>${gatewayName}</b>.\\n\\n💰 Simulated Balance: ${newBal.toLocaleString()} Toman.\\n\\n⚠️ <i>Educational Sandbox Note: Real persistent database wallets remain completely clean and untouched.</i>","es":"🎉 <b>Sandbox Recharge Approved Successfully! ✨</b>\\n\\nYour simulated balance is credited with <b>${amount.toLocaleString()} Toman</b> via <b>${gatewayName}</b>.\\n\\n💰 Simulated Balance: ${newBal.toLocaleString()} Toman.\\n\\n⚠️ <i>Educational Sandbox Note: Real persistent database wallets remain completely clean and untouched.</i>"},
  "❌ Insufficient Funds!\\n\\nSelected Config: ${matchedPlan.name}\\nPrice: ${matchedPlan.price.toLocaleString()} Toman\\nYour wallet balance: ${currentUser.walletBalance.toLocaleString()} Toman\\n\\nPlease top up your wallet first to purchase this plan.": {"fa":"❌ عدم موجودی کافی!\\n\\nکانفیگ انتخابی: ${matchedPlan.name}\\nقیمت: ${matchedPlan.price.toLocaleString()} تومان\\nموجودی فعلی شما: ${currentUser.walletBalance.toLocaleString()} تومان\\n\\nبرای تکمیل خرید، لطفا ابتدا کیف پول خود را شارژ کنید.","ar":"❌ Insufficient Funds!\\n\\nSelected Config: ${matchedPlan.name}\\nPrice: ${matchedPlan.price.toLocaleString()} Toman\\nYour wallet balance: ${currentUser.walletBalance.toLocaleString()} Toman\\n\\nPlease top up your wallet first to purchase this plan.","ru":"❌ Insufficient Funds!\\n\\nSelected Config: ${matchedPlan.name}\\nPrice: ${matchedPlan.price.toLocaleString()} Toman\\nYour wallet balance: ${currentUser.walletBalance.toLocaleString()} Toman\\n\\nPlease top up your wallet first to purchase this plan.","tr":"❌ Insufficient Funds!\\n\\nSelected Config: ${matchedPlan.name}\\nPrice: ${matchedPlan.price.toLocaleString()} Toman\\nYour wallet balance: ${currentUser.walletBalance.toLocaleString()} Toman\\n\\nPlease top up your wallet first to purchase this plan.","es":"❌ Insufficient Funds!\\n\\nSelected Config: ${matchedPlan.name}\\nPrice: ${matchedPlan.price.toLocaleString()} Toman\\nYour wallet balance: ${currentUser.walletBalance.toLocaleString()} Toman\\n\\nPlease top up your wallet first to purchase this plan."},
  "💸 Card-to-card slip uploaded\\n💵 Price: ${amountNum.toLocaleString()} Toman\\n📝 Detail: ${invoiceDesc}": {"fa":"💸 ارسال فیش واریز کارت به کارت\\n💵 مبلغ: ${amountNum.toLocaleString()} تومان\\n📝 توضیحات: ${invoiceDesc}","ar":"💸 Card-to-card slip uploaded\\n💵 Price: ${amountNum.toLocaleString()} Toman\\n📝 Detail: ${invoiceDesc}","ru":"💸 Card-to-card slip uploaded\\n💵 Price: ${amountNum.toLocaleString()} Toman\\n📝 Detail: ${invoiceDesc}","tr":"💸 Card-to-card slip uploaded\\n💵 Price: ${amountNum.toLocaleString()} Toman\\n📝 Detail: ${invoiceDesc}","es":"💸 Card-to-card slip uploaded\\n💵 Price: ${amountNum.toLocaleString()} Toman\\n📝 Detail: ${invoiceDesc}"},
  "✅ Receipt uploaded successfully!\\n\\nReference Code: ${newTx.id}\\nAmount: ${amountNum.toLocaleString()} Toman\\n\\nAdmins will inspect your bank slip. As soon as it is approved, your balance is credited and we will notify you. Thank you!": {"fa":"✅ فیش شما دریافت شد!\\n\\nکد رهگیری تراکنش: ${newTx.id}\\nمبلغ: ${amountNum.toLocaleString()} تومان\\n\\nپشتیبانی دالتون فیش شما را تایید خواهد کرد. به محض تایید، کیف پول شما شارژ شده و اطلاع‌رسانی می‌شود. سپاس از شکیبایی شما 🙏","ar":"✅ Receipt uploaded successfully!\\n\\nReference Code: ${newTx.id}\\nAmount: ${amountNum.toLocaleString()} Toman\\n\\nAdmins will inspect your bank slip. As soon as it is approved, your balance is credited and we will notify you. Thank you!","ru":"✅ Receipt uploaded successfully!\\n\\nReference Code: ${newTx.id}\\nAmount: ${amountNum.toLocaleString()} Toman\\n\\nAdmins will inspect your bank slip. As soon as it is approved, your balance is credited and we will notify you. Thank you!","tr":"✅ Receipt uploaded successfully!\\n\\nReference Code: ${newTx.id}\\nAmount: ${amountNum.toLocaleString()} Toman\\n\\nAdmins will inspect your bank slip. As soon as it is approved, your balance is credited and we will notify you. Thank you!","es":"✅ Receipt uploaded successfully!\\n\\nReference Code: ${newTx.id}\\nAmount: ${amountNum.toLocaleString()} Toman\\n\\nAdmins will inspect your bank slip. As soon as it is approved, your balance is credited and we will notify you. Thank you!"},
  "✅ ${label} copied!": {"fa":"✅ ${label} کپی شد!","ar":"✅${label} منقول!\n--تقسيم--\nالرتبة: ${index + 1}\n--تقسيم--\nجيجابايت: ${box.pricePerGb?.toLocaleString()}T | اليوم: ${box.pricePerDay?.toLocaleString()}T | الحد الأدنى: ${box.minGb || 1} غيغابايت و${box.minDays || 1} أيام\n--تقسيم--\nهل أ��ت متأكد أنك تريد حذف الإيصال ${tx.id} للمستخدم @${tx.username}؟\n--تقسيم--\nهل أنت متأكد أنك تريد حذف التكوين ${key.planName} (المعرف: ${key.id})؟\n--تقسيم--\nهل أنت متأكد أنك تريد حذف @${user.username} بالكامل وجميع مفاتيح الاشتراك النشطة الخاصة به؟","ru":"✅ ${label} скопировано!\n--РАЗДЕЛИТЬ--\nРанг: ${index + 1}\n--РАЗДЕЛИТЬ--\nГБ: ${box.pricePerGb?.toLocaleString()}T | День: ${box.pricePerDay?.toLocaleString()}T | Мин: ${box.minGb || 1}ГБ и ${box.minDays || 1} дней\n--РАЗДЕЛИТЬ--\nВы увере��ы, что хотите удалить квитанцию ${tx.id} для пользователя @${tx.username}?\n--РАЗДЕЛИТЬ--\nВы уверены, что хотите удалить конфигурацию ${key.planName} (ID: ${key.id})?\n--РАЗДЕЛИТЬ--\nВы уверены, что хотите полностью удалить @${user.username} и все его активные ключи подписки?","tr":"✅ ${label} kopyalandı!\n--BÖL--\nSıralama: ${index + 1}\n--BÖL--\nGB: ${box.pricePerGb?.toLocaleString()}T | Gün: ${box.pricePerDay?.toLocaleString()}T | Min: ${box.minGb || 1}GB & ${box.minDays || 1} Gün\n--BÖL--\n@${tx.username} kullanıcısı için ${tx.id} makbuzunu silmek istediğinizden emin misiniz?\n--BÖL--\n${key.planName} (ID: ${key.id}) yapılandırmasını silmek istediğinizden emin misiniz?\n--BÖL--\n@${user.username} ve onun tüm aktif abonelik anahtarlarını tamamen silmek istediğinizden emin misiniz?","es":"✅ ¡${label} copiado!\n--DIVIDIR--\nClasificación: ${index + 1}\n--DIVIDIR--\nGB: ${box.pricePerGb?.toLocaleString()}T | Día: ${box.pricePerDay?.toLocaleString()}T | Mín: ${box.minGb || 1}GB y ${box.minDays || 1} Días\n--DIVIDIR--\n¿Está seguro de que desea eliminar el recibo ${tx.id} del usuario @${tx.username}?\n--DIVIDIR--\n¿Está seguro de que desea eliminar la configuración ${key.planName} (ID: ${key.id})?\n--DIVIDIR--\n¿Está seguro de que desea eliminar por completo a @${user.username} y todas sus claves de suscripción activas?"},
  "Rank: ${index + 1}": {"fa":"جایگاه: ${index + 1}","ar":"Rank: ${index + 1}","ru":"Rank: ${index + 1}","tr":"Rank: ${index + 1}","es":"Rank: ${index + 1}"},
  "GB: ${box.pricePerGb?.toLocaleString()}T | Day: ${box.pricePerDay?.toLocaleString()}T | Min: ${box.minGb || 1}GB & ${box.minDays || 1} Days": {"fa":"ترافیک: ${box.pricePerGb?.toLocaleString()} تومان | زمان: ${box.pricePerDay?.toLocaleString()} تومان | حداقل: ${box.minGb || 1} گیگ و ${box.minDays || 1} روز","ar":"GB: ${box.pricePerGb?.toLocaleString()}T | Day: ${box.pricePerDay?.toLocaleString()}T | Min: ${box.minGb || 1}GB & ${box.minDays || 1} Days","ru":"GB: ${box.pricePerGb?.toLocaleString()}T | Day: ${box.pricePerDay?.toLocaleString()}T | Min: ${box.minGb || 1}GB & ${box.minDays || 1} Days","tr":"GB: ${box.pricePerGb?.toLocaleString()}T | Day: ${box.pricePerDay?.toLocaleString()}T | Min: ${box.minGb || 1}GB & ${box.minDays || 1} Days","es":"GB: ${box.pricePerGb?.toLocaleString()}T | Day: ${box.pricePerDay?.toLocaleString()}T | Min: ${box.minGb || 1}GB & ${box.minDays || 1} Days"},
  "Are you sure you want to delete receipt ${tx.id} for user @${tx.username}?": {"fa":"آیا از حذف تراکنش کاربر @${tx.username} با شناسه ${tx.id} مطمئن هستید؟","ar":"Are you sure you want to delete receipt ${tx.id} for user @${tx.username}?","ru":"Are you sure you want to delete receipt ${tx.id} for user @${tx.username}?","tr":"Are you sure you want to delete receipt ${tx.id} for user @${tx.username}?","es":"Are you sure you want to delete receipt ${tx.id} for user @${tx.username}?"},
  "Are you sure you want to delete config ${key.planName} (ID: ${key.id})?": {"fa":"آیا از حذف دائم کانفیگ ${key.planName} (شناسه: ${key.id}) اطمینان دارید؟","ar":"Are you sure you want to delete config ${key.planName} (ID: ${key.id})?","ru":"Are you sure you want to delete config ${key.planName} (ID: ${key.id})?","tr":"Are you sure you want to delete config ${key.planName} (ID: ${key.id})?","es":"Are you sure you want to delete config ${key.planName} (ID: ${key.id})?"},
  "Are you sure you want to completely delete @${user.username} and all of their active subscription keys?": {"fa":"آیا از حذف کامل کاربر @${user.username} و تمام سرویس‌ها و اکانت‌های فعال وی از دالتون بات اطمینان دارید؟","ar":"Are you sure you want to completely delete @${user.username} and all of their active subscription keys?","ru":"Are you sure you want to completely delete @${user.username} and all of their active subscription keys?","tr":"Are you sure you want to completely delete @${user.username} and all of their active subscription keys?","es":"Are you sure you want to completely delete @${user.username} and all of their active subscription keys?"}
};
