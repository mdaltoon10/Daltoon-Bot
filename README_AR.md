[English](README.md) | [فارسی](README_FA.md) | [العربية](README_AR.md) | [Русский](README_RU.md) | [Türkçe](README_TR.md) | [Español](README_ES.md)

<div align="center">
  <img src="https://i.ibb.co/zhrG6Ljn/Banner.png" alt="Daltoon Bot" width="800">
</div>

<p align="center">
  <img src="https://img.shields.io/github/v/release/mdaltoon10/Daltoon-Bot?color=blue&label=release" alt="release">
  <img src="https://img.shields.io/badge/build-passing-brightgreen" alt="build">
  <img src="https://img.shields.io/badge/dynamic/json?url=https://raw.githubusercontent.com/mdaltoon10/Daltoon-Bot/main/downloads.json&query=$.downloads&color=orange&label=downloads" alt="downloads">
  <img src="https://img.shields.io/github/license/mdaltoon10/Daltoon-Bot?color=blue" alt="license">
</p>

**بوت دالتون (Daltoon Bot)** هو حل متقدم وفوري لإدارة خدمات الـ VPN عبر تليجرام. يوفر واجهة برمجية نظيفة وتلقائية لتثبيت وتكوين ومراقبة مجموعة واسعة من بروتوكولات الـ VPN عبر خوادم متعددة.

تم تصميمه كمنظومة متكاملة تمنح دعمًا أوسع للوحات التحكم، مع استقرار أفضل وتجربة إدارة حديثة عبر الويب.

> [!IMPORTANT]
> هذا المشروع مخصص للاستخدام الشخصي فقط. يرجى عدم استخدامه لأغراض غير قانونية أو في بيئات العمل الفعلية.

## 🚀 الميزات

- **دعم لوحات متعددة** — مزامنة واتصال ذكي مع لوحات **Sanaei (3x-ui)**، و**Reebeka**، و**Pasarguard**.
- **نظام المحفظة** — محفظة داخلية لشحن الحساب وشراء الاشتراكات فورياً للمستخدمين.
- **مراقبة فورية** — تتبع تلقائي للاستهلاك، وتحديد حصص الاستخدام لكل عميل، وحالة الاتصال المباشرة.
- **لوحة تحكم المدير** — واجهة مستخدم حديثة مبنية على React لإدارة المستخدمين، الخوادم، وإعدادات النظام بالكامل.
- **إدارة خوادم متعددة** — التحكم وتوسيع نطاق خوادم VPN متعددة من خلال بوت مركزي واحد.
- **تثبيت تلقائي** — سكربت تثبيت سريع يتعامل مع جميع المتطلبات البرمجية بما في ذلك Python و Node.js و PM2.
- **الأمان** — قاعدة بيانات SQLite مركزية مع معالجة آمنة للـ API وتكوينات مشفرة.
- **إدارة العمليات** — مدارة بالكامل بواسطة PM2 لضمان التشغيل المستمر واستعادة الخدمات تلقائياً.

## 🌐 اللغات المدعومة

بوت دالتون ولوحة التحكم يدعمان تعدد اللغات بالكامل. اللغات التالية مدعومة حالياً:

- 🇺🇸 **الإنجليزية** (English - الافتراضية)
- 🇮🇷 **الفارسية** (فارسی)
- 🇸🇦 **العربية** (العربية)
- 🇷🇺 **الروسية** (Русский)
- 🇹🇷 **التركية** (Türkçe)
- 🇪🇸 **الإسبانية** (Español)

يمكن للمستخدمين والمديرين تبديل اللغة بسهولة عبر إعدادات التطبيق لتحديث واجهة المستخدم والرسائل والأزرار فورياً.

## ⚡ التثبيت السريع

لتثبيت بوت دالتون فورياً على خادم لينكس الخاص بك، قم بتشغيل الأمر التالي:

```bash
bash <(curl -Ls https://raw.githubusercontent.com/mdaltoon10/Daltoon-Bot/main/install.sh)
```

## 🛠 أداة الإدارة (`daltoon-dashboard`)

بعد التثبيت، يمكنك إدارة خدماتك عبر الأمر `daltoon-dashboard`. هذه الأداة عبارة عن واجهة نصية تفاعلية (CLI) تسهل كافة المهام الإدارية.

### 📋 جدول الأوامر

| الخيار | وصف الأمر | الوظيفة |
| :--- | :--- | :--- |
| **[1] Update** | `🔄 Update Project` | جلب آخر التحديثات من GitHub وإعادة بناء المشروع. |
| **[2] Uninstall** | `🗑️ Uninstall` | إزالة المشروع بالكامل مع جميع خدمات الخلفية. |
| **[3] Status** | `📊 View Status` | عرض حالة استهلاك المعالج والذاكرة للوحة التحكم والبوت. |
| **[4] Start** | `🚀 Start Services` | تشغيل لوحة التحكم والبوت عبر PM2. |
| **[5] Stop** | `🛑 Stop Services` | إيقاف جميع خدمات دالتون الجارية. |
| **[6] Restart** | `♻️ Restart Services` | إعادة تشغيل جميع الخدمات (لوحة التحكم والبوت). |
| **[7] Credentials** | `🔑 Change Login` | تغيير اسم المستخدم وكلمة المرور للوحة تحكم المدير. |
| **[8] Port** | `🔌 Change Port` | تغيير منفذ الويب (Port) للوحة التحكم. |
| **[9] Exit** | `🚪 Exit` | الخروج من قائمة الإدارة. |

## 🛠 التثبيت اليدوي

اتبع الخطوات التالية لتثبيت البوت وتفعيله يدوياً:

1. **استنساخ المستودع (Clone)**:
   ```bash
   git clone https://github.com/mdaltoon10/Daltoon-Bot.git
   ```

2. **تشغيل برنامج التثبيت**:
   ```bash
   cd Daltoon-Bot
   chmod +x install.sh
   ./install.sh
   ```

## 🛠 التقنيات المستخدمة

- **البوت**: بايثون (Telebot)
- **لوحة التحكم**: React، Vite، Tailwind CSS
- **الخلفية**: Node.js، Express، TypeScript
- **قاعدة البيانات**: SQLite
- **إدارة العمليات**: PM2

## 🛡 الترخيص

رخصة MIT.

## 💖 ادعمنا

إذا وجدت هذا المشروع مفيداً وترغب في دعم تطويره المستمر، يمكنك التبرع عبر عناوين العملات الرقمية التالية:

**Bep20:**
```text
0x7316A874F562FBCe67Cd0540E6b0EA6001FA09c8
```

**Trx:**
```text
TEZtgumuwyRn8brLSbks5HQSsnJKnZc6cr
```

---
**تطوير وصيانة [mDaltoon](https://t.me/mDaltoon)**
