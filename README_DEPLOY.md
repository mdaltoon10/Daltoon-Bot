# راهنمای نصب و راه‌اندازی آسان داشبورد دالتون استور روی سرور مجازی (VPS)

این پروژه یک برنامه فول‌استک (React + Node.js Express) است. شما می‌توانید فایل‌های آن را به گیت‌هاب شخصی خود منتقل کرده و با استفاده از تک‌خط اسکریپت زیر، آن را روی هر سروری (با سیستم‌عامل Ubuntu/Debian) نصب و اجرا کنید.

---

## 🚀 روش اول: نصب سریع با اسکریپت آماده (پیشنهادی)

کافیست وارد سرور مجازی خود شوید و دستور زیر را اجرا کنید (جایگاه لینک گیت‌هاب خود را تغییر دهید):

```bash
curl -sSL https://raw.githubusercontent.com/username/your-repo-name/main/install.sh | bash
```

*توجه: برای این کار ابتدا فایل آماده `install.sh` موجود در ریشه همین پروژه را به همراه بقیه فایل‌ها روی گیت‌هاب خود آپلود کنید.*

---

## 🛠️ روش دوم: نصب دستی مرحله به مرحله

اگر تمایل دارید مراحل را به صورت دستی روی سرور پیش ببرید، مراحل زیر را دنبال کنید:

### ۱. بروزرسانی سرور و نصب ابزارهای مورد نیاز
```bash
sudo apt update && sudo apt upgrade -y
sudo apt install -y curl git ufw
```

### ۲. نصب Node.js (نسخه ۲۰ به بالا)
```bash
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs
```

### ۳. شبیه‌سازی (Clone) پروژه‌ از گیت‌هاب
```bash
git clone https://github.com/your-username/your-repo-name.git /opt/daltoon-store
cd /opt/daltoon-store
```

### ۴. نصب وابستگی‌ها و بیلد پروژه
```bash
# نصب پکیج‌ها
npm install

# ساخت نسخه پروداکشن
npm run build
```

### ۵. مدیریت فرآیند با PM2 (برای روشن ماندن همیشگی برنامه)
برای اینکه پس از بستن ترمینال، برنامه همچنان در پس‌زمینه سرور شما در حال اجرا بماند:
```bash
sudo npm install -g pm2
pm2 start dist/server.cjs --name "daltoon-dashboard"
pm2 save
pm2 startup
```

---

## 🐳 روش سوم: اجرا با داکر (Docker)

پروژه به همراه فایل‌های `Dockerfile` و `docker-compose.yml` آماده شده است. برای اجرای سریع بدون نیاز به نصب فیزیکی Node.js:

```bash
# نصب داکر و داکر کامپوز
sudo apt install -y docker.io docker-compose

# اجرای پروژه در بک‌گرا��د
docker-compose up -d --build
```
داشبورد روی پورت `3000` سرور مجازی شما در دسترس خواهد بود.

---

## ⚙️ اتصال به ربات تلگرام

پس از بالا آمدن داشبورد روی آی‌پی سرور شما (مثال: `http://YOUR_SERVER_IP:3000`):
1. وارد بخش **تنظیمات (Settings)** شوید.
2. توکن ربات تلگرام (`botToken`) و اطلاعات اتصال را وارد کنید تا ربات به هسته پنل متصل شده و تراکنش‌ها و تحویل کانفیگ‌ها فعال گردد.
