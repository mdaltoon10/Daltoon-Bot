[English](README.md) | [فارسی](README_FA.md)

<div align="center">
  <img src="https://raw.githubusercontent.com/mdaltoon10/Daltoon-Bot/main/banner.png" alt="Daltoon Bot" width="800">
</div>

<p align="center">
  <img src="https://img.shields.io/github/v/release/mdaltoon10/Daltoon-Bot?color=blue&label=release" alt="release">
  <img src="https://img.shields.io/badge/build-passing-brightgreen" alt="build">
  <img src="https://img.shields.io/github/downloads/mdaltoon10/Daltoon-Bot/total?color=orange&label=downloads" alt="downloads">
  <img src="https://img.shields.io/github/license/mdaltoon10/Daltoon-Bot?color=blue" alt="license">
</p>

**Daltoon Bot** is an advanced, real-time solution for managing VPN services through Telegram. It provides a clean, automated interface for deploying, configuring, and monitoring a wide range of VPN protocols across multiple panels.

Built as an all-in-one system, Daltoon Bot adds broader panel support, improved stability, and a modern web-based management experience.

> [!IMPORTANT]
> This project is intended for personal use only. Please do not use it for illegal purposes or in a production environment.

## 🚀 Features

- **Multi-Panel Support** — Seamless integration and synchronization with **Sanaei (3x-ui)**, **Reebeka**, and **Pasarguard** panels.
- **Wallet System** — Integrated user wallet allowing users to charge accounts and purchase subscriptions instantly.
- **Real-time Monitoring** — Automated traffic tracking, per-client usage quotas, and live connection status.
- **Admin Dashboard** — A modern, full-stack React interface for managing users, servers, and system settings.
- **Multi-Node Management** — Control and scale across multiple VPN servers from a single centralized bot.
- **Automated Installation** — Quick-start script that handles all dependencies, including Python, Node.js, and PM2.
- **Security** — Centralized SQLite database with secure API handling and encrypted configuration.
- **Process Management** — Fully managed by PM2 for high availability and automated service recovery.

## 📈 Project Statistics

- **Total Installations**: ![Downloads](https://img.shields.io/github/downloads/mdaltoon10/Daltoon-Bot/total?style=flat-square&color=orange)
- **Active Version**: ![Release](https://img.shields.io/github/v/release/mdaltoon10/Daltoon-Bot?style=flat-square)
- **License**: ![License](https://img.shields.io/github/license/mdaltoon10/Daltoon-Bot?style=flat-square)

## 📥 Downloads

You can download the project manually or check the latest releases on our [GitHub Releases Page](https://github.com/mdaltoon10/Daltoon-Bot/releases).

## ⚡ Quick Start

To install Daltoon Bot instantly on your Linux server, run:

```bash
bash <(curl -Ls https://raw.githubusercontent.com/mdaltoon10/Daltoon-Bot/main/install.sh)
```

## 🛠 Management CLI (`daltoon-dashboard`)

After installation, you can manage your services using the `daltoon-dashboard` command. This is an interactive CLI tool that simplifies all administrative tasks.

### 📋 Command Table

| Command Item | Description | Functionality |
| :--- | :--- | :--- |
| **[1] Update** | `🔄 Update Project` | Fetches latest updates from GitHub and rebuilds the project. |
| **[2] Uninstall** | `🗑️ Uninstall` | Completely removes the project and background services. |
| **[3] Status** | `📊 View Status` | Shows CPU/RAM usage and status for Dashboard and Bot. |
| **[4] Start** | `🚀 Start Services` | Launches the Dashboard and Bot using PM2. |
| **[5] Stop** | `🛑 Stop Services` | Stops all running Daltoon services via PM2. |
| **[6] Restart** | `♻️ Restart Services` | Restarts all services (Dashboard and Bot). |
| **[7] Credentials** | `🔑 Change Login` | Update the username and password for the Admin Dashboard. |
| **[8] Port** | `🔌 Change Port` | Change the web port for the Admin Dashboard. |
| **[9] Exit** | `🚪 Exit` | Closes the management CLI. |

## 🛠 Manual Installation

Follow these steps to get your bot up and running manually:

1. **Clone the Repository**:
   ```bash
   git clone https://github.com/mdaltoon10/Daltoon-Bot.git
   ```

2. **Run the Installer**:
   ```bash
   cd Daltoon-Bot
   chmod +x install.sh
   ./install.sh
   ```

## 🛠 Tech Stack

- **Bot**: Python (Telebot)
- **Dashboard**: React, Vite, Tailwind CSS
- **Backend**: Node.js, Express, TypeScript
- **Database**: SQLite
- **Process Manager**: PM2

## 🛡 License

MIT License.

## 💖 Support Us
If you find this project useful and would like to support its development, you can donate via the following crypto addresses:

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
