#!/bin/bash

# --- Daltoon Store Auto-Installation Script ---
# Designed for Ubuntu / Debian systems

# Colors for terminal styling
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}=== Daltoon Store Auto-Installer ===${NC}"
echo -e "${YELLOW}Starting installation process... Please wait.${NC}"

# 1. Check if running as root
if [ "$EUID" -ne 0 ]; then
  echo -e "${RED}Error: Please run this script with sudo or as root user!${NC}"
  exit 1
fi

# 2. Update packages
echo -e "${GREEN}[1/6] Updating system packages...${NC}"
apt update && apt upgrade -y
apt install -y curl git build-essential ufw

# 3. Install Node.js v20 LTS
if ! command -v node &> /dev/null; then
    echo -e "${GREEN}[2/6] Node.js is not installed. Installing Node.js LTS...${NC}"
    curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
    apt install -y nodejs
else
    echo -e "${GREEN}[2/6] Node.js is already installed: $(node -v)${NC}"
fi

# 4. Check if we are running inside cloned folder or need to clone
BACKUP_DIR="/tmp/daltoon_db_backup"
mkdir -p "$BACKUP_DIR"

# Backup databases if they exist anywhere to verify persistence
echo -e "${YELLOW}Searching the system for any existing Daltoon databases...${NC}"

# Define candidate directories first (these are fast)
CANDIDATE_DIRS=("/opt/daltoon-store" "$(pwd)" "$HOME" "/root" "/root/daltoon" "/root/DaltoonBot" "/root/daltoon-store" "/root/daltoon-bot" "/root/daltoonbot" "/root/Daltoon_Bot" "/opt/daltoon" "/opt/daltoon-bot" "/home/daltoon" "/var/www/daltoon" "/var/daltoon")

# Collect all files that exist in candidates
FOUND_FILES=()
for dir in "${CANDIDATE_DIRS[@]}"; do
    if [ -d "$dir" ]; then
        for f in "Daltoon_Bot.json" "database.json" "db.json" "bot_database.json" ".env"; do
            if [ -f "$dir/$f" ] && [ -s "$dir/$f" ]; then
                FOUND_FILES+=("$dir/$f")
            fi
        done
    fi
done

# Additionally, do a quick find across common root folders to be absolutely sure we don't miss anything
# Exclude system folders to keep it very fast and avoid hangs
ADDITIONAL_FIND=$(find /root /home /opt /var -maxdepth 4 -type f \( -name "Daltoon_Bot.json" -o -name "database.json" -o -name "db.json" -o -name "bot_database.json" -o -name ".env" \) 2>/dev/null | grep -vE "/proc|/sys|/dev|/var/lib/docker|/snap|/tmp|/run|/node_modules|/\.git")

for p in $ADDITIONAL_FIND; do
    FOUND_FILES+=("$p")
done

# De-duplicate the list of found files
UNIQUE_FILES=$(echo "${FOUND_FILES[@]}" | tr ' ' '\n' | sort -u)

export UNIQUE_FILES
node -e "
const fs = require('fs');
const path = require('path');

const BACKUP_DIR = '$BACKUP_DIR';
const filesStr = process.env.UNIQUE_FILES || '';
const files = filesStr.split('\n').map(f => f.trim()).filter(Boolean);

let bestDbFile = null;
let bestDbScore = -1;

let bestEnvFile = null;
let bestEnvSize = -1;

function getScore(p) {
  try {
    if (!fs.existsSync(p)) return -1;
    const stat = fs.statSync(p);
    const content = fs.readFileSync(p, 'utf8').trim();
    if (!content || content === '{}' || content === '[]') return -1;
    const parsed = JSON.parse(content);
    let score = 1;
    if (Array.isArray(parsed.users)) score += parsed.users.length * 10;
    if (Array.isArray(parsed.transactions)) score += parsed.transactions.length * 10;
    if (parsed.settings) {
      if (parsed.settings.dashboardUsername) score += 20;
      if (parsed.settings.panel_config) {
        const pc = typeof parsed.settings.panel_config === 'string' ? JSON.parse(parsed.settings.panel_config) : parsed.settings.panel_config;
        if (pc.botToken && pc.botToken !== 'DUMMY_TOKEN') score += 100;
        if (pc.dashboardUsername) score += 50;
      }
    }
    return score > 0 ? (score * 1000000) + stat.size : -1;
  } catch(e) { return -1; }
}

for (const p of files) {
  if (!fs.existsSync(p)) continue;
  const baseName = path.basename(p);
  const size = fs.statSync(p).size;
  
  if (baseName === '.env') {
    if (size > bestEnvSize) {
      bestEnvSize = size;
      bestEnvFile = p;
    }
  } else {
    const score = getScore(p);
    if (score > bestDbScore) {
      bestDbScore = score;
      bestDbFile = p;
    }
  }
}

if (bestEnvFile) {
  console.log('\x1b[32m[Installer Backup] Saving best configuration .env from ' + bestEnvFile + ' (' + bestEnvSize + ' bytes)\x1b[0m');
  fs.copyFileSync(bestEnvFile, path.join(BACKUP_DIR, '.env_backup'));
}

if (bestDbFile) {
  console.log('\x1b[32m[Installer Backup] Saving best database from ' + bestDbFile + ' (Score: ' + bestDbScore + ')\x1b[0m');
  fs.copyFileSync(bestDbFile, path.join(BACKUP_DIR, 'Daltoon_Bot.json'));
} else {
  console.log('\x1b[33m[Installer Backup] No existing database detected.\x1b[0m');
}
"

if [ -d ".git" ]; then
    echo -e "${GREEN}[3/6] Git repository detected in current directory. Updating securely...${NC}"
    DEFAULT_REPO="https://github.com/mdaltoon10/Daltoon-Bot"
    REPO_URL=${1:-$DEFAULT_REPO}
    git remote set-url origin "$REPO_URL" &> /dev/null
    if ! git fetch --all --tags --force || ! (git reset --hard origin/main || git reset --hard origin/master); then
        echo -e "${YELLOW}Git update failed. Using tarball fallback...${NC}"
        rm -rf .git
        curl -sL https://github.com/mdaltoon10/Daltoon-Bot/archive/refs/heads/main.tar.gz | tar -xz --overwrite --strip-components=1
    fi
elif [ -d "/opt/daltoon-store/.git" ]; then
    echo -e "${GREEN}[3/6] Git repository detected at /opt/daltoon-store. Updating securely...${NC}"
    DEFAULT_REPO="https://github.com/mdaltoon10/Daltoon-Bot"
    REPO_URL=${1:-$DEFAULT_REPO}
    cd /opt/daltoon-store || exit
    
    # Fix dubious ownership error when running as root
    git config --global --add safe.directory /opt/daltoon-store
    
    git remote set-url origin "$REPO_URL" &> /dev/null
    
    echo -e "${YELLOW}Fetching latest changes...${NC}"
    if ! git fetch --all --tags --force || ! (git reset --hard origin/main || git reset --hard origin/master); then
        echo -e "${YELLOW}Git update failed (possibly due to index corruption). Using tarball fallback...${NC}"
        rm -rf .git
        curl -sL https://github.com/mdaltoon10/Daltoon-Bot/archive/refs/heads/main.tar.gz | tar -xz --overwrite --strip-components=1
    fi
    
    # Clean old dist folder to ensure fresh build
    rm -rf /opt/daltoon-store/dist

elif [ ! -f "package.json" ]; then
    echo -e "${YELLOW}No package.json detected in the current directory.${NC}"
    DEFAULT_REPO="https://github.com/mdaltoon10/Daltoon-Bot"
    REPO_URL=${1:-$DEFAULT_REPO}
    echo -e "${GREEN}[3/6] Cloning repository from $REPO_URL...${NC}"
    if [ -d "/opt/daltoon-store" ]; then
        echo -e "${YELLOW}Removing existing directory at /opt/daltoon-store...${NC}"
        rm -rf /opt/daltoon-store
    fi
    git clone "$REPO_URL" /opt/daltoon-store
    cd /opt/daltoon-store || exit
else
    echo -e "${YELLOW}[3/6] package.json detected but no Git repository found. Running build/install in place...${NC}"
fi

# Restore databases if backups exist to both current dir & opt-store targets
if [ -f "$BACKUP_DIR/.env_backup" ]; then
    echo -e "${GREEN}Restoring .env configuration from backup...${NC}"
    cp "$BACKUP_DIR/.env_backup" ".env" 2>/dev/null
    cp "$BACKUP_DIR/.env_backup" "/opt/daltoon-store/.env" 2>/dev/null
fi

node -e "
const fs = require('fs');
const path = require('path');

const backupDir = '$BACKUP_DIR';
const installDir = path.resolve(process.cwd());
const optDir = '/opt/daltoon-store';

const targetBackupFile = path.join(backupDir, 'Daltoon_Bot.json');
const legacyFiles = ['database.json', 'db.json', 'bot_database.json'];

function getScore(p) {
  try {
    if (!fs.existsSync(p)) return -1;
    const stat = fs.statSync(p);
    const content = fs.readFileSync(p, 'utf8').trim();
    if (!content || content === '{}' || content === '[]') return -1;
    const parsed = JSON.parse(content);
    let score = 1;
    if (Array.isArray(parsed.users) && parsed.users.length > 0) score += parsed.users.length * 10;
    if (Array.isArray(parsed.transactions) && parsed.transactions.length > 0) score += parsed.transactions.length * 10;
    if (parsed.settings) {
      if (parsed.settings.dashboardUsername) score += 20;
      if (parsed.settings.panel_config) {
        const pc = typeof parsed.settings.panel_config === 'string' ? JSON.parse(parsed.settings.panel_config) : parsed.settings.panel_config;
        if (pc.botToken && pc.botToken !== 'DUMMY_TOKEN') score += 100;
        if (pc.dashboardUsername) score += 50;
      }
    }
    return score > 0 ? (score * 1000000) + stat.size : -1;
  } catch(e) { return -1; }
}

// 1. Check if we have Daltoon_Bot.json in backup
let targetData = null;
if (getScore(targetBackupFile) > 0) {
  try {
    targetData = JSON.parse(fs.readFileSync(targetBackupFile, 'utf8'));
  } catch(e) {}
}

// 2. If no valid Daltoon_Bot.json found in backup, try to find the best legacy backup file
if (!targetData) {
  let bestFile = null;
  let bestScore = -1;
  for (const f of legacyFiles) {
    const p = path.join(backupDir, f);
    const score = getScore(p);
    if (score > bestScore) {
      bestScore = score;
      bestFile = p;
    }
  }
  if (bestFile) {
    try {
      console.log('[Installer Migration] Migrating legacy backup ' + bestFile + ' to unified Daltoon_Bot.json...');
      targetData = JSON.parse(fs.readFileSync(bestFile, 'utf8'));
    } catch(e) {}
  }
}

// 3. Write unified data to both current directory and opt directory
if (targetData) {
  const content = JSON.stringify(targetData, null, 2);
  fs.writeFileSync(path.join(installDir, 'Daltoon_Bot.json'), content, 'utf8');
  if (fs.existsSync(optDir)) {
    try {
      fs.writeFileSync(path.join(optDir, 'Daltoon_Bot.json'), content, 'utf8');
    } catch(e) {}
  }
  console.log('[Installer] Restored unified Daltoon_Bot.json database successfully.');
}

// 4. Delete all legacy database files from backup directory, current directory, and opt directory
for (const f of legacyFiles) {
  for (const dir of [backupDir, installDir, optDir]) {
    const p = path.join(dir, f);
    if (fs.existsSync(p)) {
      try {
        fs.unlinkSync(p);
      } catch(e) {}
    }
    const bak = p + '.bak';
    if (fs.existsSync(bak)) {
      try {
        fs.unlinkSync(bak);
      } catch(e) {}
    }
  }
}
"

# 5. Install Node-modules and Build project
echo -e "${GREEN}[4/6] Installing dependencies...${NC}"
npm install

echo -e "${GREEN}[5/6] Building frontend & server targets...${NC}"
npm run build

# Ensure Python 3 dependencies are completely satisfied
echo -e "${GREEN}Installing Python 3 dependencies...${NC}"
if ! command -v pip3 &> /dev/null; then
    export DEBIAN_FRONTEND=noninteractive
    apt-get update -y || true
    apt-get install -yq python3-pip python3-setuptools || true
fi
pip3 install -U pyTelegramBotAPI python-dotenv requests deep_translator --break-system-packages 2>/dev/null || pip3 install -U pyTelegramBotAPI python-dotenv requests deep_translator 2>/dev/null || pip install -U pyTelegramBotAPI python-dotenv requests deep_translator 2>/dev/null || true

# 5.5 Configure Dashboard Credentials
echo -e "${YELLOW}=== Configure Dashboard Settings ===${NC}"

INSTALL_DIR=$(pwd)
if [ -d "/opt/daltoon-store" ]; then
    INSTALL_DIR="/opt/daltoon-store"
fi

# Load current credentials from existing configuration if any
CONFIG_DATA=$(node -e "
const fs = require('fs');
let user = 'Daltoon';
let pass = 'Daltoon';
let port = '8100';

const dbPaths = [
  './Daltoon_Bot.json', 
  '$INSTALL_DIR/Daltoon_Bot.json', 
  '/tmp/daltoon_db_backup/Daltoon_Bot.json',
  './database.json', 
  '$INSTALL_DIR/database.json', 
  '/tmp/daltoon_db_backup/database.json',
  './db.json', 
  '$INSTALL_DIR/db.json', 
  '/tmp/daltoon_db_backup/db.json',
  './bot_database.json', 
  '$INSTALL_DIR/bot_database.json',
  '/tmp/daltoon_db_backup/bot_database.json'
];

let sslDomain = '';
let sslPubKey = '';
let sslPrivKey = '';

function getScore(p) {
  try {
    if (!fs.existsSync(p)) return -1;
    const stat = fs.statSync(p);
    const content = fs.readFileSync(p, 'utf8').trim();
    if (!content || content === '{}' || content === '[]') return -1;
    const parsed = JSON.parse(content);
    let score = 1; // Base score for a valid JSON file
    if (Array.isArray(parsed.users) && parsed.users.length > 0) score += parsed.users.length * 10;
    if (Array.isArray(parsed.transactions) && parsed.transactions.length > 0) score += parsed.transactions.length * 10;
    if (parsed.settings) {
      if (parsed.settings.dashboardUsername) score += 20;
      if (parsed.settings.panel_config) {
        const pc = typeof parsed.settings.panel_config === 'string' ? JSON.parse(parsed.settings.panel_config) : parsed.settings.panel_config;
        if (pc.botToken && pc.botToken !== 'DUMMY_TOKEN') score += 100;
        if (pc.dashboardUsername) score += 50;
      }
    }
    return score > 0 ? (score * 1000000) + stat.size : -1;
  } catch(e) { return -1; }
}

let bestFile = null;
let bestScore = -1;
for (const p of dbPaths) {
  const score = getScore(p);
  if (score > bestScore) { bestScore = score; bestFile = p; }
}

if (bestFile) {
  try {
    const parsed = JSON.parse(fs.readFileSync(bestFile, 'utf8'));
    if (parsed.settings) {
      if (parsed.settings.dashboardUsername) user = parsed.settings.dashboardUsername;
      if (parsed.settings.dashboardPassword) pass = parsed.settings.dashboardPassword;
      if (parsed.settings.serverPort) port = parsed.settings.serverPort.toString();
      if (parsed.settings.domainName || parsed.settings.sslDomain) sslDomain = parsed.settings.domainName || parsed.settings.sslDomain;
      if (parsed.settings.sslPublicKeyPath) sslPubKey = parsed.settings.sslPublicKeyPath;
      if (parsed.settings.sslPrivateKeyPath) sslPrivKey = parsed.settings.sslPrivateKeyPath;
      
      if (parsed.settings.panel_config) {
        const pc = typeof parsed.settings.panel_config === 'string' ? JSON.parse(parsed.settings.panel_config) : parsed.settings.panel_config;
        if (pc) {
          if (pc.dashboardUsername) user = pc.dashboardUsername;
          if (pc.dashboardPassword) pass = pc.dashboardPassword;
          if (pc.serverPort) port = pc.serverPort.toString();
          if (pc.domainName || pc.sslDomain) sslDomain = pc.domainName || pc.sslDomain;
          if (pc.sslPublicKeyPath) sslPubKey = pc.sslPublicKeyPath;
          if (pc.sslPrivateKeyPath) sslPrivKey = pc.sslPrivateKeyPath;
        }
      }
    }
  } catch(e){}
}

// Auto check if cert files exist on disk if sslDomain is present
if (sslDomain) {
  const homeDir = process.env.HOME || '/root';
  const possiblePubs = [
    sslPubKey,
    '/root/cert/' + sslDomain + '/fullchain.pem',
    homeDir + '/.acme.sh/' + sslDomain + '_ecc/fullchain.cer',
    homeDir + '/.acme.sh/' + sslDomain + '/fullchain.cer',
    '/etc/letsencrypt/live/' + sslDomain + '/fullchain.pem'
  ];
  const possiblePrivs = [
    sslPrivKey,
    '/root/cert/' + sslDomain + '/privkey.pem',
    homeDir + '/.acme.sh/' + sslDomain + '_ecc/' + sslDomain + '.key',
    homeDir + '/.acme.sh/' + sslDomain + '/' + sslDomain + '.key',
    '/etc/letsencrypt/live/' + sslDomain + '/privkey.pem'
  ];
  for (let i = 0; i < possiblePubs.length; i++) {
    if (possiblePubs[i] && fs.existsSync(possiblePubs[i]) && possiblePrivs[i] && fs.existsSync(possiblePrivs[i])) {
      sslPubKey = possiblePubs[i];
      sslPrivKey = possiblePrivs[i];
      break;
    }
  }
}

let is_update = bestScore > 0 ? '1' : '0';
let has_ssl = (sslDomain && sslPubKey && fs.existsSync(sslPubKey)) ? '1' : '0';
console.log(user + '|' + pass + '|' + port + '|' + is_update + '|' + sslDomain + '|' + sslPubKey + '|' + sslPrivKey + '|' + has_ssl);
" | tr -d '\n')

IFS='|' read -r CURRENT_USER CURRENT_PASS CURRENT_PORT IS_UPDATE CURRENT_SSL_DOMAIN CURRENT_SSL_PUB CURRENT_SSL_PRIV HAS_SSL <<< "$CONFIG_DATA"

if [ "$IS_UPDATE" == "1" ]; then
    echo -e "${GREEN}Existing configuration found. Skipping credential setup...${NC}"
    echo -e "${YELLOW}(Tip: Use 'daltoon-dashboard' command to change credentials later)${NC}"
    DASH_USER=$CURRENT_USER
    DASH_PASS=$CURRENT_PASS
    DASH_PORT=$CURRENT_PORT
else
    if [ -t 0 ]; then
        read -p "Enter Admin Username [$CURRENT_USER]: " DASH_USER
        read -s -p "Enter Admin Password [$CURRENT_PASS]: " DASH_PASS
        echo ""
        read -p "Enter Server Port [$CURRENT_PORT]: " DASH_PORT
    elif [ -c /dev/tty ]; then
        read -p "Enter Admin Username [$CURRENT_USER]: " DASH_USER < /dev/tty
        read -s -p "Enter Admin Password [$CURRENT_PASS]: " DASH_PASS < /dev/tty
        echo ""
        read -p "Enter Server Port [$CURRENT_PORT]: " DASH_PORT < /dev/tty
    else
        echo -e "${YELLOW}Non-interactive terminal detected. Using current defaults.${NC}"
    fi
fi

DASH_USER=${DASH_USER:-$CURRENT_USER}
DASH_PASS=${DASH_PASS:-$CURRENT_PASS}
DASH_PORT=${DASH_PORT:-$CURRENT_PORT}

SSL_DOMAIN=""
SSL_PUB_KEY=""
SSL_PRIV_KEY=""

if [ "$HAS_SSL" == "1" ]; then
    echo -e "\n${BLUE}====================================================${NC}"
    echo -e "${BLUE}              SSL Certificate Setup                 ${NC}"
    echo -e "${BLUE}====================================================${NC}"
    echo -e "${GREEN}✓ Existing SSL certificate detected for domain '$CURRENT_SSL_DOMAIN'. Keeping SSL setup.${NC}"
    SSL_DOMAIN=$CURRENT_SSL_DOMAIN
    SSL_PUB_KEY=$CURRENT_SSL_PUB
    SSL_PRIV_KEY=$CURRENT_SSL_PRIV
    CERT_OPT="1"
else
    echo -e "\n${BLUE}====================================================${NC}"
    echo -e "${CYAN}              🔐 SSL Certificate Setup               ${NC}"
    echo -e "${BLUE}====================================================${NC}"
    echo -e "  ${GREEN}1.${NC} Continue with IP Address (HTTP - Recommended for quick setup)"
    echo -e "  ${GREEN}2.${NC} Issue Free SSL Certificate with Domain (HTTPS - Secure)"
    echo -e "Select an option [default 1]:"

    if [ -t 0 ]; then
        read -p "Select option [1]: " CERT_OPT
    elif [ -c /dev/tty ]; then
        read -p "Select option [1]: " CERT_OPT < /dev/tty
    else
        CERT_OPT="1"
    fi

    CERT_OPT=${CERT_OPT:-1}
fi

if [ "$CERT_OPT" == "2" ]; then
    echo -e "${YELLOW}Installing dependencies (socat, curl, openssl, dnsutils, psmisc, lsof, certbot)...${NC}"
    apt-get update -y > /dev/null 2>&1 || true
    apt-get install -y socat curl openssl dnsutils bind9-host psmisc lsof certbot > /dev/null 2>&1 || true

    if [ -t 0 ]; then
        read -p "Enter Domain Name: " SSL_DOMAIN
    elif [ -c /dev/tty ]; then
        read -p "Enter Domain Name: " SSL_DOMAIN < /dev/tty
    fi
    SSL_DOMAIN=$(echo "$SSL_DOMAIN" | tr -d ' ' | tr '[:upper:]' '[:lower:]')

    if [ -n "$SSL_DOMAIN" ]; then
        echo -e "${YELLOW}Verifying DNS resolution for $SSL_DOMAIN...${NC}"
        SERVER_IP=$(curl -s4 -m 5 https://api.ipify.org || curl -s4 -m 5 https://ifconfig.me || curl -s4 -m 5 https://icanhazip.com || true)
        SERVER_IP=$(echo "$SERVER_IP" | tr -d ' 

')

        DOMAIN_IP=$(dig +short +time=3 +tries=2 A "$SSL_DOMAIN" 2>/dev/null | grep -E '^[0-9]+\.[0-9]+\.[0-9]+\.[0-9]+$' | tail -n1)
        if [[ -z "$DOMAIN_IP" ]]; then
            DOMAIN_IP=$(getent ahosts "$SSL_DOMAIN" 2>/dev/null | awk '{print $1}' | grep -E '^[0-9]+\.[0-9]+\.[0-9]+\.[0-9]+$' | head -n1)
        fi

        if [[ -z "$DOMAIN_IP" ]]; then
            echo -e "${RED}⚠️ Error: Domain '$SSL_DOMAIN' does not resolve to any IP address!${NC}"
            echo -e "${RED}Please add an A-Record for '$SSL_DOMAIN' pointing to your server IP (${SERVER_IP:-Unknown}) in your DNS provider.${NC}"
        elif [[ -n "$SERVER_IP" && "$DOMAIN_IP" != "$SERVER_IP" ]]; then
            echo -e "${YELLOW}⚠️ Warning: Domain DNS IP ($DOMAIN_IP) does not match server IP ($SERVER_IP)!${NC}"
            echo -e "${YELLOW}Note: If using Cloudflare, turn OFF proxy mode (set DNS to DNS-Only / Grey Cloud).${NC}"
        else
            echo -e "${GREEN}✓ DNS verified: $SSL_DOMAIN points to server IP (${SERVER_IP}).${NC}"
        fi

        if ! command -v ~/.acme.sh/acme.sh &> /dev/null; then
            curl -s https://get.acme.sh | sh
        fi

        if ~/.acme.sh/acme.sh --list 2> /dev/null | awk '{print $1}' | grep -Fxq "$SSL_DOMAIN"; then
            echo -e "${YELLOW}Cleaning up existing acme.sh state for $SSL_DOMAIN...${NC}"
            rm -rf ~/.acme.sh/${SSL_DOMAIN} ~/.acme.sh/${SSL_DOMAIN}_ecc 2>/dev/null || true
        fi

        ~/.acme.sh/acme.sh --set-default-ca --server letsencrypt --force
        ssl_issued=false

        echo -e "${YELLOW}Attempting acme.sh Standalone mode...${NC}"

        if [ -t 0 ]; then
            read -p "Enter Port for ACME Standalone [80]: " acme_port
        elif [ -c /dev/tty ]; then
            read -p "Enter Port for ACME Standalone [80]: " acme_port < /dev/tty
        else
            acme_port="80"
        fi
        acme_port=${acme_port:-80}

        echo -e "${YELLOW}Stopping web services to free port ${acme_port}...${NC}"

        # Dynamic container detection to free port 80/acme_port
        stopped_containers=""
        if command -v docker >/dev/null 2>&1; then
            # 1. Stop any container with nginx, x-ui, xui, marzban, 3x-ui in name
            nginx_conts=$(docker ps --format '{{.Names}}' | grep -E -i 'nginx|x-ui|xui|marzban|3x-ui' || true)
            for c in $nginx_conts; do
                echo -e "${YELLOW}Stopping Docker container: $c...${NC}"
                docker stop "$c" 2>/dev/null || true
                stopped_containers="$stopped_containers $c"
            done

            # 2. Stop any other container binding to the selected acme_port
            port_conts=$(docker ps --filter "publish=${acme_port}" --format '{{.Names}}' || true)
            for c in $port_conts; do
                if [[ ! " $stopped_containers " =~ " $c " ]]; then
                    echo -e "${YELLOW}Stopping Docker container $c binding on port ${acme_port}...${NC}"
                    docker stop "$c" 2>/dev/null || true
                    stopped_containers="$stopped_containers $c"
                fi
            done
        fi

        # Build dynamic trap command to restore all stopped containers and services
        trap_cmd="systemctl start nginx 2>/dev/null || true; pm2 start daltoon-store 2>/dev/null || true; docker start smite-nginx 2>/dev/null || true"
        for c in $stopped_containers; do
            trap_cmd="$trap_cmd; docker start $c 2>/dev/null || true"
        done
        trap "$trap_cmd" EXIT

        docker stop smite-nginx 2>/dev/null || true
        pm2 stop daltoon-store 2>/dev/null || true
        systemctl stop nginx nginx.socket apache2 apache2.socket 2>/dev/null || true
        pkill -9 -f nginx 2>/dev/null || true
        fuser -k -9 "${acme_port}/tcp" 2>/dev/null || true
        sleep 2

        acme_listen_flag=""
        if ! ip -4 addr show scope global 2> /dev/null | grep -q "inet "; then
            acme_listen_flag="--listen-v6"
        fi
        
        acme_port_flag=""
        if [ "${acme_port}" != "80" ]; then
            acme_port_flag="--httpport ${acme_port}"
        fi

        echo -e "${YELLOW}Requesting SSL Certificate (EC-256) on port ${acme_port}...${NC}"
        ~/.acme.sh/acme.sh --register-account -m "admin@$SSL_DOMAIN" --server letsencrypt 2>/dev/null || true
        ~/.acme.sh/acme.sh --set-default-ca --server letsencrypt 2>/dev/null || true
        if ~/.acme.sh/acme.sh --issue -d "$SSL_DOMAIN" $acme_listen_flag $acme_port_flag --standalone --server letsencrypt -k ec-256 --force; then
            ssl_issued=true
            echo -e "${GREEN}✓ SSL Certificate issued successfully via Let's Encrypt.${NC}"
        else
            echo -e "${YELLOW}⚠️ Let's Encrypt failed. Retrying with Buypass CA...${NC}"
            ~/.acme.sh/acme.sh --register-account -m "admin@$SSL_DOMAIN" --server buypass 2>/dev/null || true
            if ~/.acme.sh/acme.sh --issue -d "$SSL_DOMAIN" $acme_listen_flag $acme_port_flag --standalone --server buypass -k ec-256 --force; then
                ssl_issued=true
                echo -e "${GREEN}✓ SSL Certificate issued successfully via Buypass.${NC}"
            else
                echo -e "${YELLOW}⚠️ Buypass failed. Retrying with ZeroSSL...${NC}"
                ~/.acme.sh/acme.sh --register-account -m "admin@$SSL_DOMAIN" --server zerossl 2>/dev/null || true
                if ~/.acme.sh/acme.sh --issue -d "$SSL_DOMAIN" $acme_listen_flag $acme_port_flag --standalone --server zerossl -k ec-256 --force; then
                    ssl_issued=true
                    echo -e "${GREEN}✓ SSL Certificate issued successfully via ZeroSSL.${NC}"
                else
                    echo -e "${YELLOW}⚠️ ZeroSSL failed. Retrying with Certbot...${NC}"
                    if certbot certonly --standalone -d "$SSL_DOMAIN" --non-interactive --agree-tos -m "admin@$SSL_DOMAIN" --http-01-port ${acme_port} --force-renewal; then
                        mkdir -p "/root/cert/$SSL_DOMAIN"
                        cp -f "/etc/letsencrypt/live/$SSL_DOMAIN/fullchain.pem" "/root/cert/$SSL_DOMAIN/fullchain.pem" 2>/dev/null || true
                        cp -f "/etc/letsencrypt/live/$SSL_DOMAIN/privkey.pem" "/root/cert/$SSL_DOMAIN/privkey.pem" 2>/dev/null || true
                        if [[ -f "/root/cert/$SSL_DOMAIN/fullchain.pem" ]]; then
                            ssl_issued=true
                            echo -e "${GREEN}✓ SSL Certificate issued successfully via Certbot.${NC}"
                        fi
                    fi

                    if [ "$ssl_issued" != "true" ]; then
                        echo -e "${YELLOW}⚠️ Online CAs failed (Cloudflare Proxy / Port 80 blocked). Generating self-signed SSL fallback for $SSL_DOMAIN...${NC}"
                        echo -e "${YELLOW}📌 Note: If using Cloudflare, please set DNS Proxy to 'DNS-Only' (Grey Cloud ⚪) and retry SSL issuance!${NC}"
                        mkdir -p "/root/cert/$SSL_DOMAIN"
                        openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
                            -keyout "/root/cert/$SSL_DOMAIN/privkey.pem" \
                            -out "/root/cert/$SSL_DOMAIN/fullchain.pem" \
                            -subj "/CN=$SSL_DOMAIN" \
                            -addext "subjectAltName=DNS:$SSL_DOMAIN" 2>/dev/null || true
                        if [[ -f "/root/cert/$SSL_DOMAIN/fullchain.pem" ]]; then
                            ssl_issued=true
                            echo -e "${GREEN}✓ Self-signed SSL Certificate created at /root/cert/$SSL_DOMAIN/${NC}"
                        fi
                    fi
                fi
            fi
        fi

        trap - EXIT

        echo -e "${YELLOW}Restarting Nginx container (smite-nginx) and web services...${NC}"
        systemctl start nginx 2>/dev/null || true
        docker start smite-nginx 2>/dev/null || true
        for c in $stopped_containers; do
            docker start "$c" 2>/dev/null || true
        done

        if [ "$ssl_issued" = "true" ]; then
            mkdir -p "/root/cert/$SSL_DOMAIN"
            if [ -f "$HOME/.acme.sh/${SSL_DOMAIN}_ecc/fullchain.cer" ] || [ -f "$HOME/.acme.sh/${SSL_DOMAIN}/fullchain.cer" ]; then
                reload_conts=""
                for c in $stopped_containers; do
                    if [[ "$c" =~ "nginx" ]]; then
                        reload_conts="$reload_conts; docker exec $c nginx -s reload 2>/dev/null || true"
                    fi
                done
                local ecc_flag=""
                if [ -f "$HOME/.acme.sh/${SSL_DOMAIN}_ecc/fullchain.cer" ]; then
                    ecc_flag="--ecc"
                fi
                ~/.acme.sh/acme.sh --installcert --force -d "$SSL_DOMAIN" $ecc_flag \
                    --key-file "/root/cert/$SSL_DOMAIN/privkey.pem" \
                    --fullchain-file "/root/cert/$SSL_DOMAIN/fullchain.pem" \
                    --reloadcmd "docker exec smite-nginx nginx -s reload 2>/dev/null || true$reload_conts; pm2 restart daltoon-store || pm2 start daltoon-store" 2>/dev/null || true
            fi
            ~/.acme.sh/acme.sh --upgrade --auto-upgrade > /dev/null 2>&1 || true
            if [ -f "/root/cert/$SSL_DOMAIN/fullchain.pem" ] && [ -f "/root/cert/$SSL_DOMAIN/privkey.pem" ]; then
                SSL_PUB_KEY="/root/cert/$SSL_DOMAIN/fullchain.pem"
                SSL_PRIV_KEY="/root/cert/$SSL_DOMAIN/privkey.pem"
                echo -e "${GREEN}✓ SSL Certificate configured successfully.${NC}"
            else
                echo -e "${RED}Failed to install SSL certificate.${NC}"
            fi
        else
            echo -e "${RED}Failed to issue SSL certificate for $SSL_DOMAIN.${NC}"
            rm -rf ~/.acme.sh/${SSL_DOMAIN} ~/.acme.sh/${SSL_DOMAIN}_ecc 2>/dev/null || true
        fi
    else
        echo -e "${RED}Domain name cannot be empty!${NC}"
    fi
fi

echo -e "${YELLOW}Saving configuration to database...${NC}"
node -e "
const fs = require('fs');
const path = require('path');

const installDir = '$INSTALL_DIR';
const dbPath = path.resolve(installDir, 'Daltoon_Bot.json');

const filesToSearch = [
  'Daltoon_Bot.json',
  'database.json',
  'db.json',
  'bot_database.json'
];

const searchDirs = [
  '.',
  installDir,
  '/tmp/daltoon_db_backup'
];

function getScore(p) {
  try {
    if (!fs.existsSync(p)) return -1;
    const stat = fs.statSync(p);
    const content = fs.readFileSync(p, 'utf8').trim();
    if (!content || content === '{}' || content === '[]') return -1;
    const parsed = JSON.parse(content);
    let score = 1; // Base score for valid JSON
    if (Array.isArray(parsed.users) && parsed.users.length > 0) score += parsed.users.length * 10;
    if (Array.isArray(parsed.transactions) && parsed.transactions.length > 0) score += parsed.transactions.length * 10;
    if (parsed.settings) {
      if (parsed.settings.dashboardUsername) score += 20;
      if (parsed.settings.panel_config) {
        const pc = typeof parsed.settings.panel_config === 'string' ? JSON.parse(parsed.settings.panel_config) : parsed.settings.panel_config;
        if (pc.botToken && pc.botToken !== 'DUMMY_TOKEN') score += 100;
        if (pc.dashboardUsername) score += 50;
      }
    }
    return score > 0 ? (score * 1000000) + stat.size : -1;
  } catch(e) { return -1; }
}

let bestFile = null;
let bestScore = -1;

for (const dir of searchDirs) {
  for (const file of filesToSearch) {
    const fullPath = path.resolve(dir, file);
    const score = getScore(fullPath);
    if (score > bestScore) {
      bestScore = score;
      bestFile = fullPath;
    }
  }
}

let db = {};
if (bestFile) {
  try {
    console.log('Using database source from: ' + bestFile + ' (Score: ' + bestScore + ')');
    db = JSON.parse(fs.readFileSync(bestFile, 'utf8')) || {};
  } catch(e) {
    console.error('CRITICAL: Failed to parse best database JSON. Aborting configuration write to prevent data loss!');
    process.exit(1);
  }
}

// Ensure standard keys are preserved/created to avoid any data loss or blank UI
if (!db.users) db.users = [];
if (!db.transactions) db.transactions = [];
if (!db.subscription_keys) db.subscription_keys = [];
if (!db.vpn_plans) db.vpn_plans = [];
if (!db.colleague_packages) db.colleague_packages = [];
if (!db.colleague_accounts) db.colleague_accounts = [];
if (!db.colleague_categories) db.colleague_categories = [];
if (!db.inbounds) db.inbounds = [];
if (!db.custom_buttons) db.custom_buttons = [];
if (!db.gift_codes) db.gift_codes = [];
if (!db.promo_codes) db.promo_codes = [];
if (!db.tickets) db.tickets = [];
if (!db.plan_categories) db.plan_categories = [];
if (!db.settings) db.settings = {};

// Merge existing config if present
let ps = {};
if (db.settings.panel_config) {
  try {
    ps = typeof db.settings.panel_config === 'string' ? JSON.parse(db.settings.panel_config) : db.settings.panel_config;
  } catch(e) {}
}

// Preserve old credentials if they are missing from prompt but in DB
const finalUser = '$DASH_USER' || ps.dashboardUsername || db.settings.dashboardUsername || 'Daltoon';
const finalPass = '$DASH_PASS' || ps.dashboardPassword || db.settings.dashboardPassword || 'Daltoon10';
const parsedPort = parseInt('$DASH_PORT');
const finalPort = (!isNaN(parsedPort) && parsedPort > 0) ? parsedPort : (ps.serverPort || db.settings.serverPort || 8100);

const newConfig = {
  ...ps,
  dashboardUsername: finalUser,
  dashboardPassword: finalPass,
  serverPort: finalPort,
  domainName: '$SSL_DOMAIN' || ps.domainName || '',
  sslPublicKeyPath: '$SSL_PUB_KEY' || ps.sslPublicKeyPath || '',
  sslPrivateKeyPath: '$SSL_PRIV_KEY' || ps.sslPrivateKeyPath || '',
  sslAutoRenewal: true,
  sslCertificateStatus: ('$SSL_PUB_KEY' && '$SSL_PRIV_KEY') ? 'active' : (ps.sslCertificateStatus || 'not_configured')
};

db.settings.dashboardUsername = finalUser;
db.settings.dashboardPassword = finalPass;
db.settings.serverPort = finalPort;
db.settings.domainName = newConfig.domainName;
db.settings.sslPublicKeyPath = newConfig.sslPublicKeyPath;
db.settings.sslPrivateKeyPath = newConfig.sslPrivateKeyPath;
db.settings.panel_config = JSON.stringify(newConfig);

fs.writeFileSync(dbPath, JSON.stringify(db, null, 2), 'utf8');
console.log('Successfully saved unified database to: ' + dbPath);

// Cleanup other legacy files in the install directory to prevent scoring/sync conflicts in the future!
for (const file of filesToSearch) {
  if (file !== 'Daltoon_Bot.json') {
    const legacyPath = path.resolve(installDir, file);
    if (fs.existsSync(legacyPath)) {
      try {
        fs.unlinkSync(legacyPath);
        console.log('Legacy database ' + file + ' completely deleted to avoid conflicts.');
      } catch(e) {}
    }
  }
}
"

# Allow custom port through firewall
echo -e "${YELLOW}Configuring firewall for port $DASH_PORT...${NC}"
ufw allow $DASH_PORT/tcp > /dev/null 2>&1 || true
iptables -I INPUT -p tcp --dport $DASH_PORT -j ACCEPT > /dev/null 2>&1 || true

# 6. Install PM2 and Start Server
echo -e "${GREEN}[6/6] Setting up process manager PM2...${NC}"
npm install -g pm2

# Clear previous pm2 instances if any exist
pm2 delete daltoon-store &> /dev/null
pm2 delete daltoon-bot &> /dev/null

# Start production server and python telegram bot
INSTALL_DIR=$(pwd)
if [ -d "/opt/daltoon-store" ]; then
    INSTALL_DIR="/opt/daltoon-store"
fi

pm2 start "$INSTALL_DIR/dist/server.cjs" --name "daltoon-store" --cwd "$INSTALL_DIR"
pm2 start "$INSTALL_DIR/bot.py" --name "daltoon-bot" --interpreter python3 --cwd "$INSTALL_DIR"
pm2 save
pm2 startup

# 7. Configure simple Firewall rules if wanted
echo -e "${YELLOW}Configuring firewall (opening port ${DASH_PORT})...${NC}"
ufw allow ${DASH_PORT}/tcp

# 8. Setup daltoon-dashboard system CLI globally
echo -e "${YELLOW}Setting up global CLI command (daltoon-dashboard)...${NC}"
if [ -f "/opt/daltoon-store/daltoon-dashboard" ]; then
    chmod +x /opt/daltoon-store/daltoon-dashboard
    ln -sf /opt/daltoon-store/daltoon-dashboard /usr/local/bin/daltoon-dashboard
elif [ -f "daltoon-dashboard" ]; then
    chmod +x daltoon-dashboard
    ln -sf "$(pwd)/daltoon-dashboard" /usr/local/bin/daltoon-dashboard
fi

echo -e "${GREEN}====================================================${NC}"
echo -e "${GREEN}🎉 Daltoon Store Dashboard Installed Successfully!${NC}"
echo -e "${GREEN}====================================================${NC}"
echo -e "You can now access your web panel at:"
# Detect any configured domain name from database if not set in current install session
DB_DOMAIN=$(node -e "
try {
  const fs = require('fs');
  const path = require('path');
  const dbPath = path.resolve('$INSTALL_DIR', 'Daltoon_Bot.json');
  if (fs.existsSync(dbPath)) {
    const db = JSON.parse(fs.readFileSync(dbPath, 'utf8'));
    console.log(db.settings.domainName || '');
  }
} catch(e) {}
" 2>/dev/null)

FINAL_DOMAIN="${SSL_DOMAIN:-$DB_DOMAIN}"

if [ -n "$FINAL_DOMAIN" ]; then
    if [ "$DASH_PORT" = "443" ]; then
        echo -e "${BLUE}👉 Domain Access URL: https://${FINAL_DOMAIN}${NC}"
    else
        echo -e "${BLUE}👉 Domain Access URL: https://${FINAL_DOMAIN}:${DASH_PORT}${NC}"
    fi
    echo -e "${BLUE}👉 Server IP Access URL: http://$(curl -s4 -m 3 https://api.ipify.org || echo "SERVER_IP"):${DASH_PORT}${NC}"
else
    echo -e "${BLUE}👉 Access URL: http://$(curl -s4 -m 3 https://api.ipify.org || echo "SERVER_IP"):${DASH_PORT}${NC}"
fi
echo -e ""
echo -e "To manage credentials, admins or ports, type: ${YELLOW}daltoon-dashboard${NC}"
echo -e "To view logs, type: ${YELLOW}pm2 logs daltoon-store${NC}"
echo -e "To restart application, type: ${YELLOW}pm2 restart daltoon-store${NC}"
echo -e "===================================================="
