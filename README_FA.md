[English](README.md) | [فارسی](README_FA.md)

<div align="center">
  <img src="banner.png" alt="Daltoon Bot" width="800">
</div>

<p align="center">
  <img src="https://img.shields.io/github/v/release/mdaltoon10/Daltoon-Bot?color=blue&label=release" alt="release">
  <img src="https://img.shields.io/badge/build-passing-brightgreen" alt="build">
  <img src="https://img.shields.io/github/downloads/mdaltoon10/Daltoon-Bot/total?color=orange&label=downloads" alt="downloads">
  <img src="https://img.shields.io/github/license/mdaltoon10/Daltoon-Bot?color=blue" alt="license">
</p>

**ربات دالتون** یک راهکار پیشرفته و آنی برای مدیریت سرویس‌های VPN از طریق تلگرام است. این پروژه یک رابط کاربری خودکار و تمیز برای نصب، پیکربندی و نظارت بر طیف گسترده‌ای از پروتکل‌های VPN در چندین پنل مختلف ارائه می‌دهد.

این سیستم به عنوان یک راهکار جامع، پشتیبانی از پنل‌های بیشتر، پایداری بهبود یافته و تجربه مدیریت مدرن تحت وب را به ارمغان می‌آورد.

> [!IMPORTANT]
> این پروژه صرفاً برای استفاده شخصی در نظر گرفته شده است. لطفاً از آن برای مقاصد غیرقانونی یا در محیط‌های عملیاتی استفاده نکنید.

## 🚀 قابلیت‌ها

- **پشتیبانی از چندین پنل** — همگام‌سازی و اتصال هوشمند به پنل‌های **Sanaei (3x-ui)**، **Reebeka** و **Pasarguard**.
- **سیستم کیف پول** — کیف پول داخلی برای شارژ حساب و خرید آنی اشتراک توسط کاربران.
- **نظارت آنی** — ردیابی خودکار ترافیک، سهمیه مصرفی هر کاربر و وضعیت اتصال‌های فعال.
- **داشبورد مدیریت** — رابط کاربری مدرن با React برای مدیریت کامل کاربران، سرورها و تنظیمات سیستم.
- **مدیریت چندین سرور** — کنترل و گسترش چندین سرور VPN از طریق یک ربات مرکزی.
- **نصب خودکار** — اسکریپت نصب سریع که تمام پیش‌نیازها از جمله پایتون، Node.js و PM2 را مدیریت می‌کند.
- **امنیت** — دیتابیس متمرکز SQLite با مدیریت امن API و پیکربندی‌های رمزنگاری شده.
- **مدیریت فرآیند** — مدیریت کامل توسط PM2 برای پایداری بالا و بازنشانی خودکار سرویس‌ها.

## ⚡ نصب سریع

برای نصب آنی ربات دالتون روی سرور لینوکس خود، دستور زیر را اجرا کنید:

```bash
bash <(curl -Ls https://raw.githubusercontent.com/mdaltoon10/Daltoon-Bot/main/install.sh)
```

## 🛠 ابزار مدیریت (`daltoon-dashboard`)

پس از نصب، می‌توانید با دستور `daltoon-dashboard` خدمات خود را مدیریت کنید. این ابزار یک رابط متنی (CLI) تعاملی است که تمام کارهای مدیریتی را آسان می‌کند.

### 📋 جدول دستورات

| گزینه | شرح دستور | عملکرد |
| :--- | :--- | :--- |
| **[1] Update** | `🔄 Update Project` | دریافت آخرین تغییرات از گیت‌هاب و بازسازی پروژه. |
| **[2] Uninstall** | `🗑️ Uninstall` | حذف کامل پروژه و سرویس‌های پس‌زمینه. |
| **[3] Status** | `📊 View Status` | مشاهده وضعیت و میزان مصرف CPU/RAM داشبورد و ربات. |
| **[4] Start** | `🚀 Start Services` | اجرای داشبورد و ربات از طریق PM2. |
| **[5] Stop** | `🛑 Stop Services` | متوقف کردن تمام سرویس‌های دالتون. |
| **[6] Restart** | `♻️ Restart Services` | بازنشانی (Restart) تمام سرویس‌ها. |
| **[7] Credentials** | `🔑 Change Login` | تغییر نام کاربری و رمز عبور ورود به داشبورد مدیریت. |
| **[8] Port** | `🔌 Change Port` | تغییر پورت وب داشبورد مدیریت. |
| **[9] Exit** | `🚪 Exit` | خروج از منوی مدیریت. |

## 🛠 نصب دستی

برای نصب مرحله‌به‌مرحله ربات، طبق دستورات زیر عمل کنید:

۱. **دریافت پروژه**:
   ```bash
   git clone https://github.com/mdaltoon10/Daltoon-Bot.git
   ```

۲. **اجرای نصب‌کننده**:
   ```bash
   cd Daltoon-Bot
   chmod +x install.sh
   ./install.sh
   ```

## 🛠 تکنولوژی‌های مورد استفاده

- **ربات**: پایتون (Telebot)
- **داشبورد**: React, Vite, Tailwind CSS
- **بک‌اند**: Node.js, Express, TypeScript
- **دیتابیس**: SQLite
- **مدیریت فرآیند**: PM2

## 🛡 لایسنس

MIT License.

## 💖 حمایت از ما
اگر این پروژه برای شما مفید بود و مایل به حمایت از توسعه آن هستید، می‌توانید از طریق آدرس‌های زیر از ما حمایت کنید:

**Bep20:**
```text
0x7316A874F562FBCe67Cd0540E6b0EA6001FA09c8
```

**Trx:**
```text
TEZtgumuwyRn8brLSbks5HQSsnJKnZc6cr
```


---
**Maintained by [mDaltoon](https://t.me/mDaltoon)**
