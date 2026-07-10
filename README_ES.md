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

**Daltoon Bot** es una solución avanzada en tiempo real para gestionar servicios VPN a través de Telegram. Ofrece una interfaz limpia y automatizada para desplegar, configurar y monitorear una amplia variedad de protocolos VPN en múltiples paneles.

Diseñado como un sistema integral "todo en uno", Daltoon Bot añade un soporte de paneles más amplio, estabilidad mejorada y una experiencia moderna de administración basada en la web.

> [!IMPORTANT]
> Este proyecto está destinado únicamente para uso personal. No lo utilice para fines ilegales o en entornos de producción comercial.

## 🚀 Características

- **Soporte Multi-Panel** — Integración y sincronización perfectas con los paneles **Sanaei (3x-ui)**, **Reebeka** y **Pasarguard**.
- **Sistema de Billetera** — Monedero de usuario integrado que permite recargar saldo y comprar suscripciones al instante.
- **Monitoreo en Tiempo Real** — Seguimiento automático del tráfico consumido, cuotas de uso por cliente y estado de conexiones en vivo.
- **Panel de Administración** — Una moderna interfaz full-stack en React para gestionar usuarios, servidores y configuraciones del sistema.
- **Gestión Multi-Nodo** — Controle y escale múltiples servidores VPN desde un único bot centralizado.
- **Instalación Automatizada** — Script de inicio rápido que gestiona todas las dependencias necesarias, incluyendo Python, Node.js y PM2.
- **Seguridad** — Base de datos SQLite centralizada con manejo seguro de APIs y configuraciones cifradas.
- **Gestión de Procesos** — Administrado completamente por PM2 para alta disponibilidad y recuperación automática de servicios.

## 🌐 Idiomas Soportados

Daltoon Bot y su panel de administración están completamente internacionalizados. Actualmente se admiten los siguientes idiomas:

- 🇺🇸 **Inglés** (English - Por defecto)
- 🇮🇷 **Persa** (فارسی)
- 🇸🇦 **Árabe** (العربية)
- 🇷🇺 **Ruso** (Русский)
- 🇹🇷 **Turco** (Türkçe)
- 🇪🇸 **Español** (Español)

Los usuarios y administradores pueden cambiar de idioma fácilmente desde la configuración de la aplicación, adaptando la interfaz, botones y mensajes del bot al instante.

## ⚡ Inicio Rápido

Para instalar Daltoon Bot al instante en su servidor Linux, ejecute el siguiente comando:

```bash
bash <(curl -Ls https://raw.githubusercontent.com/mdaltoon10/Daltoon-Bot/main/install.sh)
```

## 🛠 Herramienta de Gestión (`daltoon-dashboard`)

Después de la instalación, puede administrar sus servicios mediante el comando `daltoon-dashboard`. Esta es una herramienta CLI interactiva que simplifica todas las tareas administrativas.

### 📋 Tabla de Comandos

| Opción | Descripción del Comando | Funcionalidad |
| :--- | :--- | :--- |
| **[1] Update** | `🔄 Update Project` | Descarga las últimas actualizaciones desde GitHub y recompila el proyecto. |
| **[2] Uninstall** | `🗑️ Uninstall` | Elimina por completo el proyecto y todos los servicios en segundo plano. |
| **[3] Status** | `📊 View Status` | Muestra el uso de CPU/RAM y el estado de la interfaz de administración y el bot. |
| **[4] Start** | `🚀 Start Services` | Inicia el panel de administración y el bot a través de PM2. |
| **[5] Stop** | `🛑 Stop Services` | Detiene todos los servicios de Daltoon activos en PM2. |
| **[6] Restart** | `♻️ Restart Services` | Reinicia todos los servicios (panel de administración y bot). |
| **[7] Credentials** | `🔑 Change Login` | Actualiza el usuario y la contraseña del panel de administración. |
| **[8] Port** | `🔌 Change Port` | Modifica el puerto web del panel de administración. |
| **[9] Exit** | `🚪 Exit` | Cierra la interfaz de línea de comandos de gestión. |

## 🛠 Instalación Manual

Siga estos pasos para configurar y ejecutar su bot de forma manual:

1. **Clonar el repositorio**:
   ```bash
   git clone https://github.com/mdaltoon10/Daltoon-Bot.git
   ```

2. **Ejecutar el instalador**:
   ```bash
   cd Daltoon-Bot
   chmod +x install.sh
   ./install.sh
   ```

## 🛠 Tecnologías Utilizadas

- **Bot**: Python (Telebot)
- **Panel de control**: React, Vite, Tailwind CSS
- **Backend**: Node.js, Express, TypeScript
- **Base de datos**: SQLite
- **Gestor de procesos**: PM2

## 🛡 Licencia

Licencia MIT.

## 💖 Apóyenos

Si este proyecto le resulta útil y desea apoyar su desarrollo continuo, puede realizar una donación a las siguientes direcciones de criptomonedas:

**Bep20:**
```text
0x7316A874F562FBCe67Cd0540E6b0EA6001FA09c8
```

**Trx:**
```text
TEZtgumuwyRn8brLSbks5HQSsnJKnZc6cr
```

---
**Mantenido por [mDaltoon](https://t.me/mDaltoon)**
