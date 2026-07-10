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

**Daltoon Bot**, Telegram üzerinden VPN hizmetlerini yönetmek için geliştirilmiş gelişmiş ve gerçek zamanlı bir çözümdür. Birden fazla panelde çok çeşitli VPN protokollerini kurmak, yapılandırmak ve izlemek için temiz ve otomatikleştirilmiş bir arayüz sunar.

Hepsi bir arada bir sistem olarak tasarlanan Daltoon Bot, daha geniş panel desteği, gelişmiş kararlılık ve modern web tabanlı yönetim deneyimi sunar.

> [!IMPORTANT]
> Bu proje yalnızca kişisel kullanım için tasarlanmıştır. Lütfen yasa dışı amaçlar için veya üretim ortamlarında kullanmayın.

## 🚀 Özellikler

- **Çoklu Panel Desteği** — **Sanaei (3x-ui)**, **Reebeka** ve **Pasarguard** panelleri ile sorunsuz entegrasyon ve senkronizasyon.
- **Cüzdan Sistemi** — Kullanıcıların anında hesaplarına bakiye yükleyip abonelik satın alabilmelerini sağlayan entegre cüzdan.
- **Gerçek Zamanlı İzleme** — Otomatik trafik takibi, müşteri başına kullanım kotaları ve canlı bağlantı durumu.
- **Yönetici Paneli** — Kullanıcıları, sunucuları ve sistem ayarlarını yönetmek için modern, full-stack bir React arayüzü.
- **Çoklu Sunucu Yönetimi** — Tek bir merkezi bottan birden fazla VPN sunucusunu kontrol edin ve ölçeklendirin.
- **Otomatik Kurulum** — Python, Node.js ve PM2 dahil tüm bağımlılıkları yöneten hızlı kurulum betiği.
- **Güvenlik** — Güvenli API yönetimi ve şifrelenmiş yapılandırmaya sahip merkezi SQLite veritabanı.
- **Süreç Yönetimi** — Yüksek kullanılabilirlik ve otomatik hizmet kurtarma için PM2 tarafından tamamen yönetilir.

## 🌐 Desteklenen Diller

Daltoon Bot ve Yönetici Paneli tamamen çok dilli bir yapıya sahiptir. Şu anda aşağıdaki diller desteklenmektedir:

- 🇺🇸 **İngilizce** (English - Varsayılan)
- 🇮🇷 **Farsça** (فارسی)
- 🇸🇦 **Arapça** (العربية)
- 🇷🇺 **Rusça** (Русский)
- 🇹🇷 **Türkçe** (Türkçe)
- 🇪🇸 **İspanyolca** (Español)

Kullanıcılar ve yöneticiler, uygulama ayarlarından bu diller arasında kolayca geçiş yapabilir; tüm arayüz, butonlar ve mesaj çıktıları anında güncellenir.

## ⚡ Hızlı Kurulum

Daltoon Bot'u Linux sunucunuza anında kurmak için şu komutu çalıştırın:

```bash
bash <(curl -Ls https://raw.githubusercontent.com/mdaltoon10/Daltoon-Bot/main/install.sh)
```

## 🛠 Yönetim Aracı (`daltoon-dashboard`)

Kurulumdan sonra hizmetlerinizi `daltoon-dashboard` komutunu kullanarak yönetebilirsiniz. Bu, tüm yönetim görevlerini basitleştiren etkileşimli bir CLI aracıdır.

### 📋 Komut Tablosu

| Seçenek | Komut Açıklaması | İşlevsellik |
| :--- | :--- | :--- |
| **[1] Update** | `🔄 Update Project` | GitHub'dan en son güncellemeleri çeker ve projeyi yeniden derler. |
| **[2] Uninstall** | `🗑️ Uninstall` | Projeyi ve arka plan hizmetlerini tamamen sunucudan kaldırır. |
| **[3] Status** | `📊 View Status` | Panel ve Bot için CPU/RAM kullanımını ve durumunu gösterir. |
| **[4] Start** | `🚀 Start Services` | Yönetim panelini ve botu PM2 aracılığıyla arka planda başlatır. |
| **[5] Stop** | `🛑 Stop Services` | Çalışan tüm Daltoon hizmetlerini PM2 üzerinden durdurur. |
| **[6] Restart** | `♻️ Restart Services` | Tüm hizmetleri (Panel ve Bot) yeniden başlatır. |
| **[7] Credentials** | `🔑 Change Login` | Yönetici paneli giriş kullanıcı adı ve şifresini günceller. |
| **[8] Port** | `🔌 Change Port` | Yönetici paneli için web bağlantı noktasını (Port) değiştirir. |
| **[9] Exit** | `🚪 Exit` | Yönetim CLI aracından çıkar. |

## 🛠 Manuel Kurulum

Botunuzu manuel olarak kurup çalıştırmak için aşağıdaki adımları izleyin:

1. **Depoyu Klonlayın**:
   ```bash
   git clone https://github.com/mdaltoon10/Daltoon-Bot.git
   ```

2. **Kurulum Betiğini Çalıştırın**:
   ```bash
   cd Daltoon-Bot
   chmod +x install.sh
   ./install.sh
   ```

## 🛠 Kullanılan Teknolojiler

- **Bot**: Python (Telebot)
- **Yönetici Paneli**: React, Vite, Tailwind CSS
- **Arka Plan**: Node.js, Express, TypeScript
- **Veritabanı**: SQLite
- **Süreç Yöneticisi**: PM2

## 🛡 Lisans

MIT Lisansı.

## 💖 Bize Destek Olun

Bu projeyi yararlı buluyorsanız ve gelişimine katkıda bulunmak isterseniz, aşağıdaki kripto adresleri üzerinden bağış yapabilirsiniz:

**Bep20:**
```text
0x7316A874F562FBCe67Cd0540E6b0EA6001FA09c8
```

**Trx:**
```text
TEZtgumuwyRn8brLSbks5HQSsnJKnZc6cr
```

---
**Destekleyen ve Geliştiren [mDaltoon](https://t.me/mDaltoon)**
