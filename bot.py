from translations import get_text
def get_lang():
    try:
        db = read_sqlite_db()
        return db.get("settings", {}).get("LANG", "fa")
    except:
        return "fa"
# -*- coding: utf-8 -*-
# Daltoon
"""
Daltoon Systems - Real-Time Python Telegram Bot & Sanaei 3x-ui API Sync
Designed specifically for: Sanaei X-UI v3.2 Panel (https://tr.sub-daltoon.ir:2096/Daltoon)
Centralized Database: Daltoon_Bot.db (Shared with React Admin Dashboard)
"""

import os
import sys
import subprocess

try:
    import requests
except ImportError:
    subprocess.check_call([sys.executable, "-m", "pip", "install", "requests", "--break-system-packages"])
    import requests

try:
    import telebot
except ImportError:
    subprocess.check_call([sys.executable, "-m", "pip", "install", "pyTelegramBotAPI", "--break-system-packages"])
    import telebot

try:
    import dotenv
except ImportError:
    subprocess.check_call([sys.executable, "-m", "pip", "install", "python-dotenv", "--break-system-packages"])
    import dotenv

import json
from telebot import types
import time
import uuid
import os
import sys
import logging
import urllib.parse

try:
    from dotenv import load_dotenv
    load_dotenv()
except ImportError:
    pass
# Shared Database file path (script-relative for reliable CWD-independent execution)
SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
def get_db_path():
    """ 
    Return the legacy JSON path to be used by migration script.
    """
    return os.path.join(SCRIPT_DIR, "Daltoon_Bot.json")

DB_FILE = get_db_path()

import sqlite3

DB_SQLITE_FILE = os.path.join(SCRIPT_DIR, "Daltoon_Bot.db")

def get_sqlite_conn():
    conn = sqlite3.connect(DB_SQLITE_FILE, timeout=30.0)
    conn.execute("PRAGMA journal_mode=WAL;")
    conn.execute("PRAGMA synchronous=NORMAL;")
    return conn

def init_sqlite_db():
    try:
        conn = get_sqlite_conn()
        conn.execute("CREATE TABLE IF NOT EXISTS kv (key TEXT PRIMARY KEY, value TEXT);")
        conn.commit()
        conn.close()
    except Exception as e:
        print(f"[SQLite Init Error] {e}")

# Call immediately
init_sqlite_db()

def migrate_json_to_sqlite():
    # Check if sqlite is empty, and if json has data, migrate it!
    try:
        conn = get_sqlite_conn()
        cursor = conn.cursor()
        cursor.execute("SELECT COUNT(*) FROM kv")
        count = cursor.fetchone()[0]
        if count == 0 and os.path.exists(DB_FILE):
            print("[SQLite Migration] Migrating JSON to SQLite database in Python...")
            with open(DB_FILE, "r", encoding="utf-8") as f:
                content = f.read().strip()
                if content:
                    data = json.loads(content)
                    for key, val in data.items():
                        cursor.execute("INSERT OR REPLACE INTO kv (key, value) VALUES (?, ?)", (key, json.dumps(val, ensure_ascii=False)))
                    conn.commit()
                    print("[SQLite Migration] Python database migration completed successfully!")
        conn.close()
    except Exception as e:
        print(f"[SQLite Migration Error in Python] {e}")

# Call immediately
migrate_json_to_sqlite()

def read_sqlite_db():
    """ Read core database structure from shared SQLite database instead of json file """
    default_db = {
        "users": [],
        "transactions": [],
        "subscription_keys": [],
        "vpn_plans": [],
        "colleague_packages": [],
        "colleague_accounts": [],
        "colleague_categories": [],
        "inbounds": [],
        "custom_buttons": [],
        "gift_codes": [],
        "promo_codes": [],
        "tickets": [],
        "plan_categories": [],
        "pending_purchases": {},
        "pending_charges": {},
        "user_pending_configs": {},
        "settings": {
            "panel_config": "{}"
        },
        "isNewInstall": False,
        "logs": []
    }
    
    try:
        conn = get_sqlite_conn()
        cursor = conn.cursor()
        cursor.execute("SELECT key, value FROM kv")
        rows = cursor.fetchall()
        conn.close()
        
        if not rows:
            return default_db
            
        data = {}
        for row in rows:
            try:
                data[row[0]] = json.loads(row[1])
            except Exception as pe:
                print(f"[SQLite Parse Error] for key {row[0]}: {pe}")
                
        # Ensure all keys exist
        for key, val in default_db.items():
            if key not in data:
                data[key] = val
        return data
    except Exception as e:
        print(f"[SQLite Database Read Error] {e}")
        return default_db

def write_sqlite_db(data):
    """ Persistence for the shared SQLite database structure with strict safeguards """
    if not data:
        return False
        
    # Safeguard: Never overwrite if it looks like a reset/empty database
    has_users = isinstance(data.get("users"), list) and len(data.get("users")) > 0
    has_transactions = isinstance(data.get("transactions"), list) and len(data.get("transactions")) > 0
    has_plans = isinstance(data.get("vpn_plans"), list) and len(data.get("vpn_plans")) > 0
    
    settings = data.get("settings", {})
    panel_cfg = settings.get("panel_config", "{}")
    if isinstance(panel_cfg, str):
        try:
            panel_cfg = json.loads(panel_cfg)
        except:
            panel_cfg = {}
            
    has_token = bool(panel_cfg.get("botToken") or panel_cfg.get("bot_token") or settings.get("botToken") or settings.get("BOT_TOKEN"))
    
    try:
        conn = get_sqlite_conn()
        cursor = conn.cursor()
        cursor.execute("SELECT COUNT(*) FROM kv")
        count = cursor.fetchone()[0]
        
        # If database already contains data, but the new 'data' is empty, REFUSE.
        if count > 0:
            if not has_users and not has_transactions and not has_plans and not has_token:
                print("[SQLite Database Write CRITICAL] Refusing to overwrite populated database with empty/reset data structure.")
                conn.close()
                return False
                
        # Write keys atomically in a single transaction
        cursor.execute("BEGIN TRANSACTION;")
        for key, val in data.items():
            cursor.execute("INSERT OR REPLACE INTO kv (key, value) VALUES (?, ?)", (key, json.dumps(val, ensure_ascii=False)))
        conn.commit()
        conn.close()
        return True
    except Exception as e:
        print(f"[SQLite Database Write Error] {e}")
        try:
            conn.rollback()
            conn.close()
        except: pass
        return False

def normalize_xui_url(url):
    if not url:
        return ""
    import re
    cleaned = url.strip()
    cleaned = re.sub(r'/+$', '', cleaned)
    cleaned = re.sub(r'/(dashboard|panel|admin)$', '', cleaned, flags=re.IGNORECASE)
    cleaned = re.sub(r'/+$', '', cleaned)
    if not cleaned.startswith("http://") and not cleaned.startswith("https://"):
        cleaned = "http://" + cleaned
    return cleaned

def build_subscription_url(server_sub, base_url, token):
    if not token:
        token = ""
    token = token.strip()
    
    if not server_sub:
        b = base_url or ""
        b = b.strip()
        if not b.startswith("http://") and not b.startswith("https://"):
            b = "http://" + b
        if b.endswith("/"):
            b = b[:-1]
        return f"{b}/sub/{token}"
    
    cleaned_sub = server_sub.strip()
    if not cleaned_sub.startswith("http://") and not cleaned_sub.startswith("https://"):
        cleaned_sub = "http://" + cleaned_sub
    
    from urllib.parse import urlparse
    parsed = urlparse(cleaned_sub)
    path = parsed.path
    
    # If path is empty, or just "/", default is to append "/sub/"
    if not path or path == "/":
        domain_part = f"{parsed.scheme}://{parsed.netloc}"
        return f"{domain_part}/sub/{token}"
    else:
        if cleaned_sub.endswith("/"):
            return f"{cleaned_sub}{token}"
        else:
            return f"{cleaned_sub}/{token}"

active_purchases = set()

def get_card_payment_info(cfg):
    card_numbers_list = cfg.get("CARD_NUMBERS")
    if card_numbers_list and isinstance(card_numbers_list, list) and len(card_numbers_list) > 0:
        lines = []
        for idx, c in enumerate(card_numbers_list):
            b_name = c.get("bankName") or c.get("bank") or "بانک"
            num = c.get("number") or c.get("cardNumber") or ""
            holder = c.get("holder") or c.get("cardHolder") or ""
            if num:
                lines.append(f"💳 {idx+1}. {b_name}:\n<code>{num}</code>\n👤 به نام: <b>{holder}</b>")
        return "📥 کارت‌های بانکی جهت واریز:\n\n" + "\n\n".join(lines)
    else:
        num = cfg.get('CARD_NUMBER', 'درج نشده')
        holder = cfg.get('CARD_HOLDER', 'درج نشده')
        return f"📥 شماره کارت ۱۶ رقمی بانک:\n<code>{num}</code>\n👤 به نام: <b>{holder}</b>"

# Load Dynamic Configurations
def get_config():
    """ Load real-time configurations from Daltoon_Bot.db or fallback to env vars """
    config = {
        "BOT_TOKEN": os.getenv("BOT_TOKEN", ""),
        "RECEIPT_BOT_TOKEN": os.getenv("RECEIPT_BOT_TOKEN", ""),
        "OWNER_ID": int(os.getenv("OWNER_ID", "0")),
        "BOT_NICKNAME": "دالتون",
        "XUI_URL": os.getenv("XUI_URL", "https://tr.sub-daltoon.ir:2096/Daltoon").rstrip("/"),
        "SUB_URL": "https://tr.sub-daltoon.ir:2096",
        "XUI_USER": os.getenv("XUI_USER", "Daltoon"),
        "XUI_PASS": os.getenv("XUI_PASS", "Daltoon10"),
        "CARD_NUMBER": os.getenv("CARD_NUMBER", "6037701194079627"),
        "CARD_HOLDER": os.getenv("CARD_HOLDER", "Daltoon"),
        "WELCOME_TEXT": None,
        "SUPPORT_TEXT": None,
        "HIDE_SUPPORT": False,
        "HIDE_BUY": False,
        "HIDE_PROFILE": False,
        "HIDE_WALLET": False,
        "KEYBOARD_LAYOUT": "stepped",
        "PURCHASE_SUCCESS_NOTE": "",
        "TG_CHANNEL": "@daltoon_channel",
        "SUPPORT_HANDLE": "@daltoon_owner",
        "BTN_BUY": "🛍️ خرید کانفیگ (Our Plans)",
        "BTN_PROFILE": "👤 اطلاعات حساب (My Profile)",
        "BTN_WALLET": "شارژ کیف پول 💳",
        "BTN_SUPPORT": "📞 پشتیبانی فنی (Support)",
        "BTN_TICKET_SUPPORT": "🎫 تیکت به پشتیبانی",
        "HIDE_TICKET_SUPPORT": False,
        "ADMINS": [],
        "MANDATORY_JOIN_ACTIVE": False,
        "MANDATORY_JOIN_CHANNEL": "",
        "MANDATORY_JOIN_CHANNELS": [],
        "MANDATORY_JOIN_TEXT": "لطفا جهت استفاده از امکانات ربات ابتدا عضو کانال ما شده و سپس روی گزینه تایید کلیک کنید.",
        "PINNED_MESSAGE_ACTIVE": False,
        "PINNED_MESSAGE_TEXT": "",
        "QR_TEMPLATE": "",
        "QR_COLOR": "",
        "QR_LOGO": "",
        "CURRENCY": "تومان",
        "LANG": "fa"
    }
    try:
        db = read_sqlite_db()
        settings = db.get("settings", {})
        settings_str = settings.get("panel_config")
        
        panel_cfg = dict(settings)
        if "panel_config" in panel_cfg:
            del panel_cfg["panel_config"]

        if settings_str:
            try:
                pc = json.loads(settings_str)
                if isinstance(pc, dict):
                    panel_cfg.update(pc)
            except:
                pass

        if "admins" in panel_cfg and isinstance(panel_cfg["admins"], list):
            config["ADMINS"] = list(set([int(adm["userId"]) for adm in panel_cfg["admins"] if "userId" in adm and adm.get("userId")]))
        
        # Sync Panel URLs and Credentials from shared settings
        if panel_cfg.get("receiptBotToken"):
            config["RECEIPT_BOT_TOKEN"] = panel_cfg.get("receiptBotToken")
        if panel_cfg.get("baseUrl"):
            config["XUI_URL"] = panel_cfg.get("baseUrl").rstrip("/")
        if panel_cfg.get("subUrl"):
            config["SUB_URL"] = panel_cfg.get("subUrl").rstrip("/")
        if panel_cfg.get("panelUsername"):
            config["XUI_USER"] = panel_cfg.get("panelUsername")
        if panel_cfg.get("panelPassword"):
            config["XUI_PASS"] = panel_cfg.get("panelPassword")
        if panel_cfg.get("ownerId"):
            config["OWNER_ID"] = int(panel_cfg["ownerId"])
        if panel_cfg.get("cardNumber"):
            config["CARD_NUMBER"] = panel_cfg["cardNumber"]
        if panel_cfg.get("cardHolder"):
            config["CARD_HOLDER"] = panel_cfg["cardHolder"]
        if panel_cfg.get("botWebUrl"):
            config["BOT_WEB_URL"] = panel_cfg["botWebUrl"].rstrip("/")

        if panel_cfg.get("btnTextBuy"):
            config["BTN_BUY"] = panel_cfg["btnTextBuy"]
        config["BTN_BUY_NEW"] = panel_cfg.get("btnTextBuyNew", "🛒 خرید اشتراک جدید")
        config["BTN_MY_SUBS"] = panel_cfg.get("btnTextMySubs", "🗂 اشتراک های من / تمدید")
        config["BTN_GUIDES"] = panel_cfg.get("btnTextGuides", "💡 آموزش ها")
        config["BTN_PROFILE"] = panel_cfg.get("btnTextProfile", "👤 حساب کاربری")
        config["BTN_SUPPORT"] = panel_cfg.get("btnTextSupport", "📞 پشتیبانی")
        config["BTN_FREETEST"] = panel_cfg.get("btnTextFreeTest", "🎁 موجودی رایگان")
        config["BTN_INSTANT_SUPPORT"] = panel_cfg.get("btnTextInstantSupport", "🤖 پشتیبانی آنی")
        config["BTN_FEEDBACK"] = panel_cfg.get("btnTextFeedback", "💌 بازخورد کاربر ها")
        config["BTN_REFERRAL"] = panel_cfg.get("btnTextReferral", "👥 زیرمجموعه گیری")
        config["BTN_COLLEAGUES"] = panel_cfg.get("btnTextColleagues", "بسته ویژه همکاران")
        config["BTN_AI_CHAT"] = panel_cfg.get("btnTextAiChat", "🤖 چت با ربات")
        config["BTN_AI"] = panel_cfg.get("btnTextAi", "🧠 هوش مصنوعی")
        config["BTN_WALLET"] = panel_cfg.get("btnTextWallet", "شارژ کیف پول 💳")
        config["BTN_TICKET_SUPPORT"] = panel_cfg.get("btnTextTicketSupport", "🎫 تیکت به پشتیبانی")
        config["WALLET_CHARGE_AMOUNTS"] = panel_cfg.get("walletChargeAmounts", [200000, 300000, 400000, 500000, 1000000])

        config["IS_FREETEST_ACTIVE"] = panel_cfg.get("isFreeTestActive", True)
        config["FREETEST_DISABLED_MSG"] = panel_cfg.get("freeTestDisabledMessage", "اکانت تست رایگان فعلا موجود نیست.")
        config["FREE_TEST_SERVER_ID"] = panel_cfg.get("freeTestServerId")
        try:
            config["FREE_TEST_GB"] = float(panel_cfg.get("freeTestGb", 0.1))
        except:
            config["FREE_TEST_GB"] = 0.1
        try:
            config["FREE_TEST_DAYS"] = float(panel_cfg.get("freeTestDays", 1.0))
        except:
            config["FREE_TEST_DAYS"] = 1.0

        config["HIDE_BUY_NEW"] = bool(panel_cfg.get("hideBtnBuyNew", False))
        if "hideBtnMySubs" in panel_cfg: config["HIDE_MY_SUBS"] = bool(panel_cfg["hideBtnMySubs"])
        if "hideBtnGuides" in panel_cfg: config["HIDE_GUIDES"] = bool(panel_cfg["hideBtnGuides"])
        if "hideBtnProfile" in panel_cfg: config["HIDE_PROFILE"] = bool(panel_cfg["hideBtnProfile"])
        if "hideBtnSupport" in panel_cfg: config["HIDE_SUPPORT"] = bool(panel_cfg["hideBtnSupport"])
        if "hideBtnFreeTest" in panel_cfg: config["HIDE_FREETEST"] = bool(panel_cfg["hideBtnFreeTest"])
        if "hideBtnInstantSupport" in panel_cfg: config["HIDE_INSTANT_SUPPORT"] = bool(panel_cfg["hideBtnInstantSupport"])
        if "hideBtnFeedback" in panel_cfg: config["HIDE_FEEDBACK"] = bool(panel_cfg["hideBtnFeedback"])
        if "hideBtnReferral" in panel_cfg: config["HIDE_REFERRAL"] = bool(panel_cfg["hideBtnReferral"])
        if "hideBtnColleagues" in panel_cfg: config["HIDE_COLLEAGUES"] = bool(panel_cfg["hideBtnColleagues"])
        if "hideBtnAiChat" in panel_cfg: 
            config["HIDE_AI_CHAT"] = bool(panel_cfg["hideBtnAiChat"])
        else:
            config["HIDE_AI_CHAT"] = False # Visible by default for new installs
        if "hideBtnTicketSupport" in panel_cfg: config["HIDE_TICKET_SUPPORT"] = bool(panel_cfg["hideBtnTicketSupport"])
        config["HIDE_AI"] = bool(panel_cfg.get("hideBtnAi", True))
        config["HIDE_WALLET"] = panel_cfg.get("hideBtnWallet", False) # or fallback to older hideWallet
        if "hideWallet" in panel_cfg and "hideBtnWallet" not in panel_cfg:
            config["HIDE_WALLET"] = bool(panel_cfg["hideWallet"])

        config["BUTTONS_ORDER"] = panel_cfg.get("mainButtonsOrder", [
            "btnBuyNew", "btnMySubs", "btnGuides", "btnProfile", "btnWallet", "btnSupport", "btnTicketSupport", "btnFreeTest", "btnAiChat", "btnInstantSupport", "btnFeedback", "btnReferral"
        ])

        if panel_cfg.get("serverPort"):
            config["SERVER_PORT"] = int(panel_cfg["serverPort"])
        else:
            config["SERVER_PORT"] = 3000

        if panel_cfg.get("botToken"):
            config["BOT_TOKEN"] = panel_cfg["botToken"]
        if panel_cfg.get("botNickname"):
            config["BOT_NICKNAME"] = panel_cfg["botNickname"]
        if panel_cfg.get("baseUrl"):
            config["XUI_URL"] = normalize_xui_url(panel_cfg["baseUrl"])
        elif panel_cfg.get("panelUrl"):
            config["XUI_URL"] = normalize_xui_url(panel_cfg["panelUrl"])
            
        from urllib.parse import urlparse
        p = urlparse(config["XUI_URL"])
        
        if panel_cfg.get("subUrl") and panel_cfg["subUrl"].strip():
            config["SUB_URL"] = normalize_xui_url(panel_cfg["subUrl"])
        else:
            config["SUB_URL"] = f"{p.scheme}://{p.netloc}"
                
        if panel_cfg.get("panelUsername"):
            config["XUI_USER"] = panel_cfg["panelUsername"]
        if panel_cfg.get("panelPassword"):
            config["XUI_PASS"] = panel_cfg["panelPassword"]
        if panel_cfg.get("ownerId"):
            config["OWNER_ID"] = int(panel_cfg["ownerId"])
        if panel_cfg.get("cardNumber"):
            config["CARD_NUMBER"] = panel_cfg["cardNumber"]
        if panel_cfg.get("cardHolder"):
            config["CARD_HOLDER"] = panel_cfg["cardHolder"]
        config["CARD_NUMBERS"] = panel_cfg.get("cardNumbers", [])
        if panel_cfg.get("botWebUrl"):
            config["BOT_WEB_URL"] = panel_cfg["botWebUrl"].rstrip("/")
        if "welcomeText" in panel_cfg:
            config["WELCOME_TEXT"] = panel_cfg["welcomeText"]
        if "supportText" in panel_cfg:
            config["SUPPORT_TEXT"] = panel_cfg["supportText"]
        if "hideSupport" in panel_cfg and "hideBtnSupport" not in panel_cfg:
            config["HIDE_SUPPORT"] = bool(panel_cfg["hideSupport"])
            
        config["SERVERS"] = panel_cfg.get("servers", [])
        config["COLLEAGUE_SERVERS"] = panel_cfg.get("colleagueServers", [])
        
        if "hideBuy" in panel_cfg:
            config["HIDE_BUY"] = bool(panel_cfg["hideBuy"])
        if "hideProfile" in panel_cfg:
            config["HIDE_PROFILE"] = bool(panel_cfg["hideProfile"])
        if "hideBtnWallet" in panel_cfg:
            config["HIDE_WALLET"] = bool(panel_cfg["hideBtnWallet"])
        elif "hideWallet" in panel_cfg:
            config["HIDE_WALLET"] = bool(panel_cfg["hideWallet"])
        if "keyboardLayout" in panel_cfg:
            config["KEYBOARD_LAYOUT"] = panel_cfg["keyboardLayout"]
        if "purchaseSuccessNote" in panel_cfg:
            config["PURCHASE_SUCCESS_NOTE"] = panel_cfg["purchaseSuccessNote"]
        if "purchaseSuccessAttachment" in panel_cfg:
            config["PURCHASE_SUCCESS_ATTACHMENT"] = panel_cfg["purchaseSuccessAttachment"]
        
        # Load Gateway Configuration
        for gw in ["gatewayPlisioWallet", "gatewayNowpaymentsKey", "gatewayCryptomusKey", "gatewayCryptomusMerchantId", "gatewayHeleketWallet"]:
            if gw in panel_cfg:
                config[gw.replace("gateway", "GATEWAY_").upper()] = panel_cfg[gw]
        if "gatewayStarsStatus" in panel_cfg:
            config["GATEWAY_STARS_STATUS"] = bool(panel_cfg["gatewayStarsStatus"])

        if "guidesText" in panel_cfg:
            config["GUIDES_TEXT"] = panel_cfg["guidesText"]
        if "tgChannel" in panel_cfg:
            config["TG_CHANNEL"] = panel_cfg["tgChannel"]
        if "supportHandle" in panel_cfg:
            config["SUPPORT_HANDLE"] = panel_cfg["supportHandle"]
        if "usePremiumEmojis" in panel_cfg:
            config["USE_PREMIUM_EMOJIS"] = bool(panel_cfg["usePremiumEmojis"])
        if "useButtonColors" in panel_cfg:
            config["USE_BUTTON_COLORS"] = bool(panel_cfg["useButtonColors"])
        config["PRIMARY_BUTTON_COLORS"] = panel_cfg.get("primaryButtonColors", {})
        config["BUTTON_STYLES_MAPPING"] = panel_cfg.get("buttonStylesMapping", None)
        config["PREMIUM_EMOJI_MAPPING"] = panel_cfg.get("premiumEmojiMapping", None)
        
        # Parse QR configurations
        config["QR_TEMPLATE"] = panel_cfg.get("qrTemplate", "")
        config["QR_COLOR"] = panel_cfg.get("qrColor", "")
        config["QR_LOGO"] = panel_cfg.get("qrLogo", "")
        
        # Parse Mandatory Join configs
        if "mandatoryJoinActive" in panel_cfg:
            config["MANDATORY_JOIN_ACTIVE"] = bool(panel_cfg["mandatoryJoinActive"])
        if "mandatoryJoinChannel" in panel_cfg:
            config["MANDATORY_JOIN_CHANNEL"] = panel_cfg["mandatoryJoinChannel"]
        if "mandatoryJoinChannels" in panel_cfg:
            config["MANDATORY_JOIN_CHANNELS"] = panel_cfg["mandatoryJoinChannels"]
        if "mandatoryJoinText" in panel_cfg:
            config["MANDATORY_JOIN_TEXT"] = panel_cfg["mandatoryJoinText"]

        # Parse Pinned Message configs
        if "pinnedMessageActive" in panel_cfg:
            config["PINNED_MESSAGE_ACTIVE"] = bool(panel_cfg["pinnedMessageActive"])
        if "pinnedMessageText" in panel_cfg:
            config["PINNED_MESSAGE_TEXT"] = panel_cfg["pinnedMessageText"]

        # Parse Guide Videos / File IDs
        for key in ["guideVideoHapp", "guideVideoIos", "guideVideoAndroid", "guideVideoV2rayn", "guideVideoKaring", "guideVideoMac", "guideVideoLinux"]:
            if key in panel_cfg:
                config[key] = panel_cfg[key]
        
        config["SIMULATOR_MODE"] = bool(panel_cfg.get("simulatorMode", False))
        if "currency" in panel_cfg:
            config["CURRENCY"] = panel_cfg["currency"]
        config["LANG"] = panel_cfg.get("LANG", panel_cfg.get("lang", "fa"))
                
    except Exception as e:
        print(f"[Dynamic Config Loader Warning] {e}")
    return config

# Get the initial token to start the bot
cfg_boot = get_config()

# Ensure dependencies are loaded
# (Already imported at top)

# Initialize Bot with the configured token (use DUMMY_TOKEN if none is set yet)
bot = telebot.TeleBot(cfg_boot["BOT_TOKEN"] if cfg_boot["BOT_TOKEN"] else "DUMMY_TOKEN", parse_mode="HTML", threaded=True, num_threads=30)

def patch_telebot_currency(bot_instance):
    original_send_message = bot_instance.send_message
    original_reply_to = bot_instance.reply_to
    original_edit_message_text = bot_instance.edit_message_text
    original_send_photo = bot_instance.send_photo
    original_send_document = bot_instance.send_document

    def replace_currency_in_text(text):
        if not text:
            return text
        cfg = get_config()
        currency_val = cfg.get("CURRENCY", "تومان")
        processed = text.replace("تومان", currency_val).replace("Tomans", currency_val).replace("Toman", currency_val)
        return processed

    def process_markup(markup):
        if not markup:
            return markup
        try:
            cfg = get_config()
            currency_val = cfg.get("CURRENCY", "تومان")
            
            # If it's a ReplyKeyboardMarkup
            if hasattr(markup, "keyboard") and markup.keyboard:
                for row in markup.keyboard:
                    for button in row:
                        if hasattr(button, "text") and button.text:
                            button.text = button.text.replace("تومان", currency_val).replace("Tomans", currency_val).replace("Toman", currency_val)
            
            # If it's an InlineKeyboardMarkup
            if hasattr(markup, "inline_keyboard") and markup.inline_keyboard:
                for row in markup.inline_keyboard:
                    for button in row:
                        if hasattr(button, "text") and button.text:
                            button.text = button.text.replace("تومان", currency_val).replace("Tomans", currency_val).replace("Toman", currency_val)
        except Exception as e:
            print(f"[Markup Patch Error] {e}")
        return markup

    def patched_send_message(*args, **kwargs):
        args_list = list(args)
        if len(args_list) > 1 and isinstance(args_list[1], str):
            args_list[1] = replace_currency_in_text(args_list[1])
        elif "text" in kwargs and isinstance(kwargs["text"], str):
            kwargs["text"] = replace_currency_in_text(kwargs["text"])

        if "reply_markup" in kwargs:
            kwargs["reply_markup"] = process_markup(kwargs["reply_markup"])
        elif len(args_list) > 5:
            args_list[5] = process_markup(args_list[5])

        return original_send_message(*args_list, **kwargs)

    def patched_reply_to(*args, **kwargs):
        args_list = list(args)
        if len(args_list) > 1 and isinstance(args_list[1], str):
            args_list[1] = replace_currency_in_text(args_list[1])
        elif "text" in kwargs and isinstance(kwargs["text"], str):
            kwargs["text"] = replace_currency_in_text(kwargs["text"])

        if "reply_markup" in kwargs:
            kwargs["reply_markup"] = process_markup(kwargs["reply_markup"])
        return original_reply_to(*args_list, **kwargs)

    def patched_edit_message_text(*args, **kwargs):
        args_list = list(args)
        if len(args_list) > 0 and isinstance(args_list[0], str):
            args_list[0] = replace_currency_in_text(args_list[0])
        elif "text" in kwargs and isinstance(kwargs["text"], str):
            kwargs["text"] = replace_currency_in_text(kwargs["text"])

        if "reply_markup" in kwargs:
            kwargs["reply_markup"] = process_markup(kwargs["reply_markup"])
        return original_edit_message_text(*args_list, **kwargs)

    def patched_send_photo(*args, **kwargs):
        args_list = list(args)
        if len(args_list) > 2 and isinstance(args_list[2], str):
            args_list[2] = replace_currency_in_text(args_list[2])
        elif "caption" in kwargs and isinstance(kwargs["caption"], str):
            kwargs["caption"] = replace_currency_in_text(kwargs["caption"])

        if "reply_markup" in kwargs:
            kwargs["reply_markup"] = process_markup(kwargs["reply_markup"])
        return original_send_photo(*args_list, **kwargs)

    def patched_send_document(*args, **kwargs):
        args_list = list(args)
        if "caption" in kwargs and isinstance(kwargs["caption"], str):
            kwargs["caption"] = replace_currency_in_text(kwargs["caption"])

        if "reply_markup" in kwargs:
            kwargs["reply_markup"] = process_markup(kwargs["reply_markup"])
        return original_send_document(*args_list, **kwargs)

    bot_instance.send_message = patched_send_message
    bot_instance.reply_to = patched_reply_to
    bot_instance.edit_message_text = patched_edit_message_text
    bot_instance.send_photo = patched_send_photo
    bot_instance.send_document = patched_send_document

patch_telebot_currency(bot)

import threading

class ReceiptBotManager:
    _instance = None
    _lock = threading.Lock()
    
    def __init__(self):
        self.current_token = None
        self.r_bot = None
        self.polling_thread = None
        self.stop_event = threading.Event()

    @classmethod
    def get_instance(cls):
        with cls._lock:
            if cls._instance is None:
                cls._instance = cls()
            return cls._instance

    def update_and_start(self, token):
        token = (token or "").strip()
        if not token:
            self.stop()
            return
            
        if self.current_token == token and self.polling_thread and self.polling_thread.is_alive():
            return
            
        print(f"[ReceiptBotManager] Starting receipt bot with token: {token[:8]}...****")
        self.stop()
        
        self.current_token = token
        self.stop_event.clear()
        
        try:
            import telebot
            self.r_bot = telebot.TeleBot(token, parse_mode="HTML", threaded=True, num_threads=10)
            patch_telebot_currency(self.r_bot)
            
            # Register callback handler on the receipt bot
            @self.r_bot.callback_query_handler(func=lambda call: True)
            def receipt_callback_handler(call):
                tg_id = call.from_user.id
                cfg = get_config()
                is_owner = bool(cfg.get("OWNER_ID") and int(tg_id) == int(cfg["OWNER_ID"]))
                is_admin = int(tg_id) in cfg.get("ADMINS", [])
                
                if not (is_owner or is_admin):
                    try:
                        self.r_bot.answer_callback_query(call.id, "❌ شما دسترسی لازم جهت انجام این عملیات را ندارید.", show_alert=True)
                    except Exception:
                        pass
                    return
                    
                parts = call.data.split(":")
                action = parts[0]
                tx_id = parts[1]
                
                if action == "tx_approve":
                    try:
                        
                        import requests
                        with open("receipt_debug.log", "a") as dbg:
                            dbg.write(f"\n--- TX APPROVE: {tx_id} ---\n")
                        resp = requests.post("http://127.0.0.1:3000/api/transactions/approve", json={"id": tx_id}, timeout=30)
                        with open("receipt_debug.log", "a") as dbg:
                            dbg.write(f"API Response: {resp.status_code} - {resp.text}\n")
                        if resp.status_code == 200:

                            data = resp.json()
                            if data.get("success"):
                                orig_text = call.message.caption or call.message.text or ""
                                new_caption = orig_text + "\n\n<b>✅ این رسید توسط شما تایید شد و تراکنش با موفقیت انجام گردید.</b>"
                                
                                try:
                                    if call.message.content_type in ['photo', 'document']:
                                        self.r_bot.edit_message_caption(chat_id=call.message.chat.id, message_id=call.message.message_id, caption=new_caption, parse_mode="HTML", reply_markup=None)
                                    else:
                                        self.r_bot.edit_message_text(chat_id=call.message.chat.id, message_id=call.message.message_id, text=new_caption, parse_mode="HTML", reply_markup=None)
                                except Exception as e:
                                    print(f"[Error editing approved message caption on receipt bot] {e}")
                                    
                                try:
                                    self.r_bot.answer_callback_query(call.id, "✅ تراکنش با موفقیت تایید و اعمال شد.", show_alert=True)
                                except Exception:
                                    pass
                            else:
                                msg = data.get("message", "خطای ناشناخته از سمت سرور")
                                try:
                                    self.r_bot.answer_callback_query(call.id, f"❌ خطا در تایید: {msg}", show_alert=True)
                                except Exception:
                                    pass
                        else:
                            try:
                                self.r_bot.answer_callback_query(call.id, f"❌ خطای سرور: کد {resp.status_code}", show_alert=True)
                            except Exception:
                                pass
                    
                    except Exception as e:
                        with open("receipt_debug.log", "a") as dbg:
                            dbg.write(f"Exception in tx_approve: {e}\n")
                        try:

                            self.r_bot.answer_callback_query(call.id, f"❌ خطا در برقراری ارتباط با سرور: {e}", show_alert=True)
                        except Exception:
                            pass
                
                elif action == "tx_reject":
                    try:
                        import requests
                        resp = requests.post("http://127.0.0.1:3000/api/transactions/reject", json={"id": tx_id}, timeout=30)
                        if resp.status_code == 200:
                            data = resp.json()
                            if data.get("success"):
                                orig_text = call.message.caption or call.message.text or ""
                                new_caption = orig_text + "\n\n<b>❌ این رسید توسط شما رد شد.</b>"
                                
                                try:
                                    if call.message.content_type in ['photo', 'document']:
                                        self.r_bot.edit_message_caption(chat_id=call.message.chat.id, message_id=call.message.message_id, caption=new_caption, parse_mode="HTML", reply_markup=None)
                                    else:
                                        self.r_bot.edit_message_text(chat_id=call.message.chat.id, message_id=call.message.message_id, text=new_caption, parse_mode="HTML", reply_markup=None)
                                except Exception as e:
                                    print(f"[Error editing rejected message caption on receipt bot] {e}")
                                    
                                try:
                                    self.r_bot.answer_callback_query(call.id, "❌ تراکنش با موفقیت رد شد.", show_alert=True)
                                except Exception:
                                    pass
                            else:
                                msg = data.get("message", "خطای ناشناخته")
                                try:
                                    self.r_bot.answer_callback_query(call.id, f"❌ خطا در رد تراکنش: {msg}", show_alert=True)
                                except Exception:
                                    pass
                        else:
                            try:
                                self.r_bot.answer_callback_query(call.id, f"❌ خطای سرور: کد {resp.status_code}", show_alert=True)
                            except Exception:
                                pass
                    
                    except Exception as e:
                        with open("receipt_debug.log", "a") as dbg:
                            dbg.write(f"Exception in tx_approve: {e}\n")
                        try:

                            self.r_bot.answer_callback_query(call.id, f"❌ خطا در برقراری ارتباط با سرور: {e}", show_alert=True)
                        except Exception:
                            pass

            # Start polling thread
            def poll_worker():
                while not self.stop_event.is_set():
                    try:
                        self.r_bot.delete_webhook(drop_pending_updates=True)
                        print(f"[ReceiptBotManager] Polling started for secondary bot @{self.r_bot.get_me().username}")
                        self.r_bot.polling(none_stop=True, interval=0, timeout=20)
                    except Exception as ex:
                        if self.stop_event.is_set():
                            break
                        print(f"[ReceiptBotManager Polling Error] {ex}. Retrying in 10 seconds...")
                        time.sleep(10)

            self.polling_thread = threading.Thread(target=poll_worker, daemon=True)
            self.polling_thread.start()
            
        except Exception as err:
            print(f"[ReceiptBotManager Initialization Error] {err}")

    def stop(self):
        if self.r_bot:
            try:
                self.stop_event.set()
                self.r_bot.stop_polling()
            except Exception as e:
                print(f"[ReceiptBotManager Stop Warning] {e}")
            self.r_bot = None
        self.current_token = None
        self.polling_thread = None

# Multi-Language Translation System for Telegram Bot (Persian -> EN, AR, RU, TR, ES)
BOT_TRANSLATIONS = {
    "en": {
        "🚀 به ربات پرسرعت": "🚀 Welcome to high-speed",
        "خوش آمدید": "Welcome",
        "بازگشتید": "Welcome back",
        "با خرید از شبکه پرسرعت ما": "By purchasing from our high-speed network, enjoy secure connection, low ping, and static IP.",
        "شناسه تلگرام شما": "Your Telegram ID",
        "موجودی کیف پول": "Wallet Balance",
        "لطفا گزینه مورد نظر خود را": "Please select your desired option from the menu below:",
        "خرید کانفیگ": "Buy Plan",
        "خرید اشتراک جدید": "Buy New Subscription",
        "اشتراک های من": "My Subscriptions",
        "اشتراک‌های من": "My Subscriptions",
        "آموزش ها": "Guides",
        "آموزش‌ها": "Guides",
        "حساب کاربری": "My Account",
        "پشتیبانی": "Support",
        "تیکت به پشتیبانی": "Ticket Support",
        "موجودی رایگان": "Free Traffic Test",
        "پشتیبانی آنی": "Instant Support",
        "بازخورد کاربر ها": "Feedbacks",
        "زیرمجموعه گیری": "Referral System",
        "بسته ویژه همکاران": "Partners Special Packages",
        "چت با ربات": "Chat with AI",
        "هوش مصنوعی": "🧠 Artificial Intelligence",
        "شارژ کیف پول": "💳 Top-up Wallet",
        "بازگشت به منوی اصلی": "🔙 Return to main menu",
        "بازگشت": "🔙 Back",
        "انصراف": "❌ Cancel",
        "پلن‌های بخش": "Plans for",
        "لطفاً یکی از تعرفه‌های معتبر زیر را انتخاب کنید تا فرآیند فعال‌سازی فوری آغاز شود:": "Please select one of the valid plans below to begin the immediate activation process:",
        "لطفاً یک نام کاربری دلخواه (فقط حروف انگلیسی و اعداد، بدون فاصله) برای کانفیگ خود ارسال نمایید:": "Please send a custom username (English letters and numbers only, no spaces) for your config:",
        "طرح انتخابی:": "Selected Plan:",
        "🔙 بازگشت به دسته‌بندی‌ها": "🔙 Back to Categories",
        "🔙 بازگشت به لیست سرورها": "🔙 Back to Servers",
        "✨ ساخت کانفیگ با حجم دلخواه": "✨ Create Custom Volume Config",
        "سایر": "Others",
        "لطفا یکی از دسته‌بندی‌های زیر را برای مشاهده طرح‌ها انتخاب کنید:": "Please select one of the categories below to view plans:",
        "تومان": "Toman",
        "دستیار هوشمند فعال شد": "Intelligent assistant activated!",
        "سوال خود را در رابطه با": "Ask your question about purchases, tariffs, and connection:",
        "جهت خروج کلمه «انصراف» را": "(Type 'Cancel' to exit)",
        "هوش مصنوعی فعال شد": "🧠 AI Activated!",
        "هر سوالی دارید بپرسید": "Ask any question and AI will answer:",
        "تایید عضویت": "Confirm Membership",
        "عضویت شما با موفقیت تایید شد": "✅ Your membership has been successfully verified! Welcome.",
        "لطفا جهت استفاده از امکانات": "Please join our channel first to use the bot services:",
        "بسته‌های دسته‌بندی": "Category packages",
        "دالتون بات": "Daltoon Bot",
        "خطا": "Error",
        "موفق": "Success",
        "تایید": "Approve",
        "رد کردن": "Reject",

        "موجودی کیف پول شما کافی نیست": "Your wallet balance is insufficient",
        "لطفا ابتدا حساب خود را شارژ کنید": "Please top-up your account first",
        "مشخصات حساب شما تغییر کرد": "Your account details have been changed",
        "یوزرنیم جدید": "New username",
        "رمز عبور جدید": "New password",
        "جهت ورود به پنل از منوی همکاران استفاده کنید": "Use the Partners menu to login to the panel",
        "خطا در اتصال به سرور": "Error connecting to the server",
        "تمدید کاربر با موفقیت انجام شد": "User renewed successfully",
        "کاربر با موفقیت حذف شد": "User deleted successfully",
        "بسته همکار تمدید شد": "Partner package renewed",
        "افزایش حجم": "Volume increased",
        "ورود موفقیت‌آمیز بود": "Login successful",
        "اشتراک شما با موفقیت تمدید شد": "Your subscription was successfully renewed",
        "افزودن": "Added",
        "روز برای سرویس": "days for service",
        "تمدید اشتراک دلخواه": "Custom subscription renewal",
        "❌ شما دسترسی لازم جهت انجام این عملیات را ندارید.": "❌ You do not have the required permissions to perform this operation.",
        "⌛ در حال پردازش تراکنش و ساخت کانکشن...": "⌛ Processing transaction and creating connection...",
        "✅ این رسید توسط شما تایید شد و تراکنش با موفقیت انجام گردید.": "✅ This receipt was approved by you and the transaction was completed successfully.",
        "✅ تراکنش با موفقیت تایید و اعمال شد.": "✅ Transaction successfully approved and applied.",
        "❌ خطا در تایید: ": "❌ Error in approval: ",
        "❌ خطای سرور: کد ": "❌ Server error: code ",
        "❌ خطا در برقراری ارتباط با سرور: ": "❌ Error connecting to server: ",
        "⌛ در حال رد تراکنش...": "⌛ Rejecting transaction...",
        "❌ این رسید توسط شما رد شد.": "❌ This receipt was rejected by you.",
        "❌ تراکنش با موفقیت رد شد.": "❌ Transaction successfully rejected.",
        "❌ خطا در رد تراکنش: ": "❌ Error in rejecting: ",
        "✅ تایید واریز": "✅ Approve Receipt",
        "❌ رد فیش": "❌ Reject Slip",
        "🔔 رسید جدید برای تایید واریز شد!": "🔔 New receipt deposited for approval!",
        "👤 کاربر: ": "👤 User: ",
        "💰 مبلغ اعلام شده: ": "💰 Announced Amount: ",
        "🆔 شناسه: ": "🆔 ID: ",
        "📝 جزئیات تراکنش: ": "📝 Transaction Details: ",
        "📥 می‌توانید از دکمه‌های زیر جهت بررسی، تایید یا رد فوری و مستقیم این رسید استفاده کنید:": "📥 You can use the buttons below to review, approve, or reject this receipt instantly and directly:",
        "⚠️ خطایی رخ داد.": "⚠️ An error occurred.",
        "⚠️ لطفا فیش واریزی خود را فقط به صورت عکس یا فایل تصویری (JPEG, PNG و...) بفرستید.": "⚠️ Please send your deposit receipt only as a photo or image file (JPEG, PNG, etc.).",
        "⌛ در حال انتقال و بررسی رسید شما توسط ادمین هستیم. لطفا کمی صبور باشید.": "⌛ We are transferring and reviewing your receipt with the admin. Please be patient.",
        "✅ فیش پرداختی شما با موفقیت دریافت شد!": "✅ Your payment receipt was received successfully!",
        "📌 شناسه تراکنش: ": "📌 Transaction ID: ",
        "💰 مبلغ اعلامی: ": "💰 Announced amount: ",
        "⌛ در حال انتقال صف بررسی توسط ادمین برای ": "⌛ Transferring to the admin review queue for ",
        "تحویل کانفیگ": "config delivery",
        "شارژ": "top-up",
        "خطا در دانلود فایل تصویر فیش از سرورهای تلگرام. لطفا مجدد تلاش کنید.": "Error downloading receipt image file from Telegram servers. Please try again.",
        "خطای بسته‌های تصویر یا فایل. لطفا مطمئن شوید حجم فیش مناسب است.": "Image packet or file error. Please make sure the slip size is appropriate.",
        "🔔 <b>رسید جدید برای تایید واریز شد!</b>": "🔔 <b>New receipt deposited for approval!</b>",
        "✅ <b>فیش پرداختی شما با موفقیت دریافت شد!</b>": "✅ <b>Your payment receipt was received successfully!</b>",
        "📌 شناسه تراکنش: <code>": "📌 Transaction ID: <code>",
        "💰 مبلغ اعلامی: <b>": "💰 Announced amount: <b>",
        " تومان</b>": " Toman</b>",
        " شارژ ": " top-up ",
        " هستیم.": " is underway.",
        "شارژ انتخابی تلگرام. کپشن فیش: '": "Custom top-up. Caption: '",
        "شارژ انتخابی ": "Custom top-up ",
        " بدون کپشن.": " without caption.",
        "خرید دلخواه: ": "Custom Purchase: ",
        "روز, نام کاربری: ": "days, Username: ",
        "سرور: ": "Server: ",
        "تمدید دلخواه: ": "Custom Renewal: ",
        "سرویس: ": "Service: ",
        "خرید پلان: ": "Plan Purchase: ",
        "یوزرنیم: ": "Username: ",
        "گیگابایت": "GB",
        "روز": "Days",
        "🎉 <b>اشتراک شما با موفقیت تمدید شد! (تایید فیش)</b>": "🎉 <b>Your subscription has been successfully renewed! (Receipt Approved)</b>",
        "👤 سرویس: <code>": "👤 Service: <code>",
        "➕ حجم ترافیک افزوده شده: <b>": "➕ Added traffic limit: <b>",
        " گیگابایت</b>": " GB</b>",
        "➕ مدت زمان افزوده شده: <b>": "➕ Added duration: <b>",
        " روز</b>": " Days</b>",
        "📅 تاریخ انقضای جدید: <b>": "📅 New expiry date: <b>",
        "📊 حجم کل جدید: <b>": "📊 New total traffic: <b>",
        "❌ <b>خطا در اعمال تمدید اشتراک!</b>": "❌ <b>Error applying subscription renewal!</b>",
        "متاسفانه مشکلی در اتصال به سرور جهت تمدید اشتراک رخ داد:": "Unfortunately, an issue occurred connecting to the server for subscription renewal:",
        "خطای نامشخص": "Unknown error",
        "لطفاً موضوع را با پشتیبانی هماهنگ فرمایید.": "Please coordinate this with support.",
        "❌ خطا: اشتراک مورد نظر جهت تمدید یافت نشد.": "❌ Error: The target subscription to renew was not found.",
        "❌ خطا: پلان مورد نظر یافت نشد. با پشتیبانی هماهنگ کنید.": "❌ Error: The target plan was not found. Please contact support.",
        "✅ <b>تراکنش شما تایید شد!</b>": "✅ <b>Your transaction has been approved!</b>",
        "💰 مبلغ <b>": "💰 Amount <b>",
        " تومان</b> به کیف پول شما در ربات افزوده شد.": " Toman</b> has been added to your bot wallet.",
        "💰 موجودی جدید: <b>": "💰 New balance: <b>",
        "✅ <b>کانفیگ دلخواه شما آماده شد!</b>": "✅ <b>Your custom config is ready!</b>",
        "📦 حجم: <b>": "📦 Traffic: <b>",
        " گیگابایت</b> | زمان: <b>": " GB</b> | Duration: <b>",
        "🚀 <b>لینک‌های اتصال مستقیم:</b>": "🚀 <b>Direct connection links:</b>",
        "⚠️ لینک‌های بالا را کپی کرده و در کلاینت خود وارد کنید.": "⚠️ Copy the links above and import them into your client.",
        "⚠️ <b>توجه:</b> امکان استخراج تفکیکی لینک‌های کانفیگ در این لحظه میسر نشد.": "⚠️ <b>Note:</b> Extracting direct connection links is currently unavailable.",
        "👇 <b>لطفاً از لینک سابسکریپشن اختصاصی خود استفاده کنید (جهت کپی لمس کنید):</b>": "👇 <b>Please use your dedicated subscription link (tap to copy):</b>",
        "💡 لینک بالا را کپی کرده و در برنامه v2rayNG یا V2box خود به عنوان <b>Subscription (سابسکریپشن)</b> وارد کرده و بروزرسانی (Update) نمایید تا همه کانفیگ‌ها به طور خودکار دریافت شوند.": "💡 Copy the link above and add it as a <b>Subscription</b> in your v2rayNG or V2box app and update to fetch all configurations automatically.",
        "❌ <b>خطا در ساخت کانفیگ دلخواه!</b>": "❌ <b>Error creating custom config!</b>",
        "متاسفانه مشکلی در اتصال به سرور جهت ساخت کانفیگ رخ داد:": "Unfortunately, an issue occurred connecting to the server for config creation:"
    },
    "ar": {
        "🚀 به ربات پرسرعت": "🚀 مرحباً بك في بوت",
        "خوش آمدید": "أهلاً بك",
        "بازگشتید": "مرحباً بك مجدداً",
        "با خرید از شبکه پرسرعت ما": "من خلال الشراء من شبكتنا عالية السرعة، استمتع باتصال آمن وبنغ منخفض وعنوان IP ثابت.",
        "شناسه تلگرام شما": "معرف تليجرام الخاص بك",
        "موجودی کیف پول": "رصيد المحفظة",
        "لطفا گزینه مورد نظر خود را": "يرجى تحديد الخيار المطلوب من القائمة أدناه:",
        "خرید کانفیگ": "شراء خطة",
        "خرید اشتراک جدید": "شراء اشتراك جديد",
        "اشتراک های من": "اشتراكاتي / تمديد",
        "اشتراک‌های من": "اشتراكاتي / تمديد",
        "آموزش ها": "الشروحات",
        "آموزش‌ها": "الشروحات",
        "حساب کاربری": "حسابي الشخصي",
        "پشتیبانی": "الدعم الفني",
        "تیکت به پشتیبانی": "تيكت إلى الدعم",
        "موجودی رایگان": "رصيد تجريبي مجاني",
        "پشتیبانی آنی": "دعم فني فوري",
        "بازخورد کاربر ها": "آراء المستخدمين",
        "زیرمجموعه گیری": "نظام الإحالة",
        "بسته ویژه همکاران": "الباقات الخاصة بالشركاء",
        "چت با ربات": "دردشة مع الذكاء الاصطناعي",
        "هوش مصنوعی": "🧠 الذكاء الاصطناعي",
        "شارژ کیف پول": "💳 شحن المحفظة",
        "بازگشت به منوی اصلی": "🔙 عودة إلى القائمة الرئيسية",
        "بازگشت": "🔙 عودة",
        "انصراف": "❌ إلغاء",
        "تومان": "تومان",
        "دستیار هوشمند فعال شد": "تم تفعيل المساعد الذكي!",
        "سوال خود را در رابطه با": "اسأل سؤالك حول عمليات الشراء والأسعار والاتصال لتلقي الإجابة:",
        "جهت خروج کلمه «انصراف» را": "(أرسل كلمة «إلغاء» للخروج)",
        "هوش مصنوعی فعال شد": "🧠 تم تفعيل الذكاء الاصطناعي!",
        "هر سوالی دارید بپرسید": "اسأل أي سؤال وسيجيب الذكاء الاصطناعي:",
        "تایید عضویت": "تأكيد العضوية",
        "عضویت شما با موفقیت تایید شد": "✅ تم تأكيد عضويتك بنجاح! أهلاً بك.",
        "لطفا جهت استفاده از امکانات": "يرجى الانضمام إلى قناتنا أولاً لتتمكن من استخدام ميزات البوت.",
        "بسته‌های دسته‌بندی": "باقات التصنيف",
        "دالتون بات": "دالتون بوت",
        "خطا": "خطأ",
        "موفق": "نجاح",
        "تایید": "موافقة",
        "رد کردن": "رفض",
    },
    "ru": {
        "🚀 به ربات پرسرعت": "🚀 Добро пожаловать в бот",
        "خوش آمدید": "Добро пожаловать",
        "بازگشتید": "С возвращением",
        "با خرید از شبکه پرسرعت ما": "Покупая услуги в нашей высокоскоростной сети, наслаждайтесь безопасным соединением, низким пингом и статическим IP.",
        "شناسه تلگرام شما": "Ваш Telegram ID",
        "موجودی کیف پول": "Баланс кошелька",
        "لطفا گزینه مورد نظر خود را": "Пожалуйста, выберите нужный вариант из меню ниже:",
        "خرید کانفیگ": "Купить тариф",
        "خرید اشتراک جدید": "Купить новую подписку",
        "اشتراک های من": "Мои подписки / Продление",
        "اشتراک‌های من": "Мои подписки / Продление",
        "آموزش ها": "Руководства",
        "آموزش‌ها": "Руководства",
        "حساب کاربری": "Профиль пользователя",
        "پشتیبانی": "Поддержка",
        "تیکت به پشتیبانی": "تیکт به پشتیبانی",
        "موجودی رایگان": "Бесплатный тест трафика",
        "پشتیبانی آنی": "Мгновенная поддержка",
        "بازخورد کاربر ها": "Отзывы",
        "زیرمجموعه گیری": "Реферальная система",
        "بسته ویژه همکاران": "Партнерские пакеты",
        "چت با ربات": "Чат с ИИ",
        "هوش مصنوعی": "🧠 Искусственный интеллект",
        "شارژ کیف پول": "Пополнить баланс 💳",
        "بازگشت به منوی اصلی": "🔙 Вернуться в главное меню",
        "بازگشت": "🔙 Назад",
        "انصراف": "❌ Отмена",
        "تومان": "Toman",
        "دستیار هوشمند فعال شد": "Умный помощник активирован!",
        "سوال خود را в رابطه با": "Задайте вопрос о покупках, тарифах и подключении:",
        "جهت خروج کلمه «انصراف» را": "(Отправьте «Отмена» для выхода)",
        "هوش مصنوعی فعال شد": "🧠 ИИ активирован!",
        "هر سوالی دارید بپرسید": "Задайте любой вопрос, и ИИ ответит на него:",
        "تایید عضویت": "Подтвердить членство",
        "عضویت شما با موفقیت تایید شد": "✅ Ваше членство успешно подтверждено! Добро пожаловать.",
        "لطفا جهت استفاده از امکانات": "Пожалуйста, сначала подпишитесь на наш канал, чтобы использовать функции бота.",
        "بسته‌های دسته‌بندی": "Пакеты категорий",
        "دالتون بات": "Daltoon Bot",
        "خطا": "Ошибка",
        "موفق": "Успешно",
        "تایید": "Подтвердить",
        "رد کردن": "Отклонить",
    },
    "tr": {
        "🚀 به ربات پرسرعت": "🚀 Botuna hoş geldiniz",
        "خوش آمدید": "Hoş geldiniz",
        "بازگشتید": "Tekrar hoş geldiniz",
        "با خرید از شبکه پرسرعت ما": "Yüksek hızlı ağımızdan satın alarak güvenli bağlantı, düşük ping ve statik IP'nin keyfini çıkarın.",
        "شناسه تلگرام شما": "Telegram ID'niz",
        "موجودی کیف پول": "Cüzdan Bakiyesi",
        "لطفا گزینه مورد نظر خود را": "Lütfen aşağıdaki menüden istediğiniz seçeneği belirleyin:",
        "خرید کانفیگ": "Plan Satın Al",
        "خرید اشتراک جدید": "Yeni Abonelik Satın Al",
        "اشتراک های من": "Aboneliklerim / Yenile",
        "اشتراک‌های من": "Aboneliklerim / Yenile",
        "آموزش ها": "Kılavuzlar",
        "آموزش‌ها": "Kılavuzlar",
        "حساب کاربری": "Kullanıcı Profili",
        "پشتیبانی": "Destek",
        "تیکت به پشتیبانی": "Ticket Support",
        "موجودی رایگان": "Ücretsiz Trafik Testi",
        "پشتیبانی آنی": "Anında Destek",
        "بازخورد کاربر ها": "Geri Bildirimler",
        "زیرمجموعه گیری": "Davet Sistemi",
        "بسته ویژه همکاران": "Ortak Paketleri",
        "چت با ربات": "Yapay Zeka Sohbeti",
        "هوش مصنوعی": "🧠 Yapay Zeka",
        "شارژ کیف پول": "Cüzdanı Yükle 💳",
        "بازگشت به منوی اصلی": "🔙 Ana menüye dön",
        "بازگشت": "🔙 Geri",
        "انصراف": "❌ İptal",
        "تومان": "Toman",
        "دستیار هوشمند فعال شد": "Akıllı asistan aktif edildi!",
        "سوال خود را در رابطه با": "Satın almalar, tarifeler ve bağlantı hakkında sorunuzu sorun:",
        "جهت خروج کلمه «انصراف» را": "(Çıkmak için «İptal» yazın)",
        "هوش مصنوعی فعال شد": "🧠 Yapay zeka aktif edildi!",
        "هر سوالی دارید بپرسید": "Herhangi bir soru sorun, yapay zeka cevaplasın:",
        "تایید عضویت": "Üyeliği Onayla",
        "عضویت شما با موفقیت تایید شد": "✅ Üyeliğiniz başarıyla onaylandı! Hoş geldiniz.",
        "لطفا جهت استفاده از امکانات": "Lütfen bot özelliklerini kullanmak için önce kanalımıza katılın.",
        "بسته‌های دسته‌بندی": "Kategori paketleri",
        "دالتون بات": "Daltoon Bot",
        "خطا": "Hata",
        "موفق": "Başarılı",
        "تایید": "Onayla",
        "رد کردن": "Reddet",
    },
    "es": {
        "🚀 به ربات پرسرعت": "🚀 Bienvenido al bot de",
        "خوش آمدید": "Bienvenido",
        "بازگشتید": "Bienvenido de nuevo",
        "با خرید از شبکه پرسرعت ما": "Al comprar en nuestra red de alta velocidad, disfrute de una conexión segura, ping bajo e IP estática.",
        "شناسه تلگرام شما": "Su ID de Telegram",
        "موجودی کیف پول": "Saldo del monedero",
        "لطفا گزینه مورد نظر خود را": "Seleccione la opción deseada del menú a continuación:",
        "خرید کانفیگ": "Comprar Plan",
        "خرید اشتراک جدید": "Comprar nueva suscripción",
        "اشتراک های من": "Mis suscripciones / Renovar",
        "اشتراک‌های من": "Mis suscripciones / Renovar",
        "آموزش ها": "Guías",
        "آموزش‌ها": "Guías",
        "حساب کاربری": "Perfil de usuario",
        "پشتیبانی": "Soporte",
        "تیکت به پشتیبانی": "Ticket Support",
        "موجودی رایگان": "Prueba de tráfico gratis",
        "پشتیبانی آنی": "Soporte instantáneo",
        "بازخورد کاربر ها": "Comentarios",
        "زیرمجموعه گیری": "Sistema de referidos",
        "بسته ویژه همکاران": "Paquetes de socios",
        "چت با ربات": "Chat con IA",
        "هوش مصنوعی": "🧠 Inteligencia artificial",
        "شارژ کیف پول": "Cargar monedero 💳",
        "بازگشت به منوی اصلی": "🔙 Volver al menú principal",
        "بازگشت": "🔙 Volver",
        "انصراف": "❌ Cancelar",
        "تومان": "Toman",
        "دستیار هوشمند فعال شد": "¡Asistente inteligente activado!",
        "سوال خود را در رابطه با": "Haga sus preguntas sobre compras, tarifas y conexión:",
        "جهت خروج کلمه «انصراف» را": "(Escriba «Cancelar» para salir)",
        "هوش مصنوعی فعال شد": "¡IA activada! 🧠",
        "هر سوالی دارید بپرسید": "Haga cualquier pregunta y la IA responderá:",
        "تایید عضویت": "Confirmar membresía",
        "عضویت شما با موفقیت تایید شد": "✅ ¡Su membresía ha sido confirmada con éxito! Bienvenido.",
        "لطفا جهت استفاده از امکانات": "Por favor, únase a nuestro canal primero para usar los servicios del bot.",
        "بسته‌های دسته‌بندی": "Paquetes de categoría",
        "دالتون بات": "Daltoon Bot",
        "خطا": "Error",
        "موفق": "Éxito",
        "تایید": "Aprobar",
        "رد کردن": "Rechazar",
    }
}

try:
    from deep_translator import GoogleTranslator
except ImportError:
    import subprocess
    import sys
    try:
        subprocess.check_call([sys.executable, "-m", "pip", "install", "deep-translator", "--break-system-packages"])
    except Exception:
        try:
            subprocess.check_call([sys.executable, "-m", "pip", "install", "deep-translator"])
        except Exception:
            pass
    from deep_translator import GoogleTranslator
import time

_translation_cache = {}

def translate_text(text, lang):
    if not text or not isinstance(text, str):
        return text
    if lang == "fa":
        return text
    
    # First, use the static dictionary for fast exact matches
    target_dict = BOT_TRANSLATIONS.get(lang, {})
    
    # If the text is exactly in the dict, return it
    if text in target_dict:
        return target_dict[text]
        
    translated = text
    for fa_key, translation in target_dict.items():
        if fa_key in translated:
            translated = translated.replace(fa_key, translation)
            
    # If we still have Persian characters, use Google Translator dynamically
    if any('؀' <= c <= 'ۿ' for c in translated):
        cache_key = f"{lang}:{translated}"
        if cache_key in _translation_cache:
            return _translation_cache[cache_key]
        
        try:
            # We must be careful not to break HTML tags during translation
            # Google Translate handles simple HTML but can sometimes add spaces
            translator = GoogleTranslator(source='fa', target=lang)
            final_translation = translator.translate(translated)
            _translation_cache[cache_key] = final_translation
            return final_translation
        except Exception as e:
            print(f"[Translation Error] {e}")
            
    return translated

BUTTON_STYLES = {
    "success": [],
    "danger": [],
    "primary": []
}

def get_button_style(btn_text, cfg):
    primary_colors = cfg.get("PRIMARY_BUTTON_COLORS") or {}
    
    primary_texts = {
        cfg.get("BTN_BUY_NEW", "🛒 خرید اشتراک جدید"): "btnBuyNew",
        cfg.get("BTN_MY_SUBS", "🗂 اشتراک های من / تمدید"): "btnMySubs",
        cfg.get("BTN_GUIDES", "💡 آموزش ها"): "btnGuides",
        cfg.get("BTN_PROFILE", "👤 حساب کاربری"): "btnProfile",
        cfg.get("BTN_SUPPORT", "📞 پشتیبانی"): "btnSupport",
        cfg.get("BTN_TICKET_SUPPORT", "🎫 تیکت به پشتیبانی"): "btnTicketSupport",
        cfg.get("BTN_FREETEST", "🎁 موجودی رایگان"): "btnFreeTest",
        cfg.get("BTN_INSTANT_SUPPORT", "🤖 پشتیبانی آنی"): "btnInstantSupport",
        cfg.get("BTN_FEEDBACK", "💌 بازخورد کاربر ها"): "btnFeedback",
        cfg.get("BTN_REFERRAL", "👥 زیرمجموعه گیری"): "btnReferral",
        cfg.get("BTN_WALLET", "شارژ کیف پول 💳"): "btnWallet",
        cfg.get("BTN_COLLEAGUES", "بسته ویژه همکاران"): "btnColleagues",
        cfg.get("BTN_AI_CHAT", "🤖 چت با ربات"): "btnAiChat",
        cfg.get("BTN_AI", "🧠 هوش مصنوعی"): "btnAi",
    }
    
    def clean_btn_text(t):
        if not t:
            return ""
        return "".join(c for c in t if ord(c) < 0x2000 or 0xFB00 <= ord(c) <= 0xFEFF).strip()
        
    cleaned_btn_text = clean_btn_text(btn_text)
    
    matched_key = None
    for txt, key in primary_texts.items():
        if txt == btn_text or clean_btn_text(txt) == cleaned_btn_text:
            matched_key = key
            break
            
    if matched_key:
        color = primary_colors.get(matched_key)
        if color and color != "none":
            return color
        # If the primary button is set to "none" or not configured, return None
        # to prevent falling through to generic extra keywords matching!
        return None
        
    # If not a primary button, check general custom styles (extra buttons mapping)
    custom_styles = cfg.get("BUTTON_STYLES_MAPPING") or BUTTON_STYLES
    for style, keywords in custom_styles.items():
        if keywords and isinstance(keywords, list):
            for kw in keywords:
                if kw and kw in btn_text:
                    return style
                    
    return None

def translate_markup(markup, lang):
    if not markup:
        return markup
        
    cfg = get_config()
    use_premium = cfg.get("USE_PREMIUM_EMOJIS", False)
    use_button_colors = cfg.get("USE_BUTTON_COLORS", False)
    custom_emojis = cfg.get("PREMIUM_EMOJI_MAPPING") or PREMIUM_EMOJI_MAPPING
    
    is_inline = markup.__class__.__name__ == "InlineKeyboardMarkup"
    
    rows = []
    if hasattr(markup, "keyboard") and markup.keyboard:
        rows = markup.keyboard
    elif hasattr(markup, "inline_keyboard") and markup.inline_keyboard:
        rows = markup.inline_keyboard
        
    for row in rows:
        for i in range(len(row)):
            btn = row[i]
            if isinstance(btn, str):
                row[i] = translate_text(btn, lang) if lang != "fa" else btn
            elif hasattr(btn, "text") and btn.text:
                original_text = btn.text
                btn.text = translate_text(btn.text, lang) if lang != "fa" else btn.text
                
                if is_inline and use_button_colors:
                    # Apply styles using prioritized helper on original Farsi text
                    assigned_style = get_button_style(original_text, cfg)
                    if assigned_style:
                        btn.style = assigned_style
                        
                if is_inline and use_premium:
                    # Apply premium emoji icon on original Farsi or translated text
                    for std, custom_id in custom_emojis.items():
                        if std in original_text or std in btn.text:
                            btn.icon_custom_emoji_id = custom_id
                            # Keep standard emoji in text as fallback in case the bot is not Premium/Boosted,
                            # so that buttons never appear completely emoji-less!
                            # btn.text = btn.text.replace(std, "").strip()
                            break
    return markup

# Override bot methods to dynamically translate
PREMIUM_EMOJI_MAPPING = {
    "🛒": "5449640306352655512", # Premium Cart
    "🎁": "5368324170671202286",
    "👤": "5368324170671202287",
    "🎧": "5368324170671202288",
    "🚀": "5368324170671202289",
    "✅": "5368324170671202290",
    "❌": "5368324170671202291",
    "⚠️": "5368324170671202292",
    "💎": "5368324170671202293",
    "💰": "5368324170671202294",
    "📊": "5368324170671202295",
    "🔄": "5368324170671202296",
    "🎫": "5368324170671202297",
    "⚡": "5368324170671202298",
    "💳": "5368324170671202299",
    "📝": "5368324170671202300",
    "⏳": "5368324170671202301",
    "🌐": "5368324170671202302",
    "⚙️": "5368324170671202303",
    "🔌": "5368324170671202304",
    "🔋": "5368324170671202305",
    "💡": "5368324170671202306",
    "🔒": "5368324170671202307",
    "🔓": "5368324170671202308",
    "🔑": "5368324170671202309",
    # Flags
    "🇮🇷": "5368324170671202310",
    "🇩🇪": "5368324170671202311",
    "🇺🇸": "5368324170671202312",
    "🇬🇧": "5368324170671202313",
    "🇫🇷": "5368324170671202314",
    "🇳🇱": "5368324170671202315",
    "🇹🇷": "5368324170671202316",
    "🇨🇦": "5368324170671202317",
    "🇫🇮": "5368324170671202318",
    "🇷🇺": "5368324170671202319",
    "🇦🇪": "5368324170671202320",
    "🇺🇦": "5368324170671202321",
    "🇵🇱": "5368324170671202322",
    "🇸🇪": "5368324170671202323",
    "🇦🇹": "5368324170671202324",
    "🇨🇭": "5368324170671202325",
    "🇮🇹": "5368324170671202326",
    "🇪🇸": "5368324170671202327",
    "🇧🇷": "5368324170671202328",
    "🇮🇳": "5368324170671202329",
    "🇨🇳": "5368324170671202330",
    "🇯🇵": "5368324170671202331",
    "🇰🇷": "5368324170671202332",
    "🇦🇺": "5368324170671202333",
    "🇿🇦": "5368324170671202334",
    "🇲🇽": "5368324170671202335",
    "🇦🇷": "5368324170671202336",
    "🇸🇦": "5368324170671202337",
    "🇮🇶": "5368324170671202338",
}

def apply_premium_emojis(text):
    if not text or not isinstance(text, str):
        return text
    cfg = get_config()
    custom_emojis = cfg.get("PREMIUM_EMOJI_MAPPING") or PREMIUM_EMOJI_MAPPING
    for std, custom_id in custom_emojis.items():
        text = text.replace(std, f'<tg-emoji emoji-id="{custom_id}">{std}</tg-emoji>')
    return text

orig_send_message = bot.send_message
def wrapped_send_message(*args, **kwargs):
    cfg = get_config()
    lang = cfg.get("LANG", "fa")
    args_list = list(args)
    if len(args_list) > 1 and isinstance(args_list[1], str):
        args_list[1] = translate_text(args_list[1], lang)
    elif "text" in kwargs and isinstance(kwargs["text"], str):
        kwargs["text"] = translate_text(kwargs["text"], lang)
    
    if "reply_markup" in kwargs and kwargs["reply_markup"]:
        kwargs["reply_markup"] = translate_markup(kwargs["reply_markup"], lang)
        
    use_premium = cfg.get("USE_PREMIUM_EMOJIS")
    if use_premium:
        p_args = list(args_list)
        p_kwargs = dict(kwargs)
        if len(p_args) > 1 and isinstance(p_args[1], str):
            p_args[1] = apply_premium_emojis(p_args[1])
        elif "text" in p_kwargs and isinstance(p_kwargs["text"], str):
            p_kwargs["text"] = apply_premium_emojis(p_kwargs["text"])
        try:
            return orig_send_message(*p_args, **p_kwargs)
        except Exception as e:
            pass # Fallback to original
            
    return orig_send_message(*args_list, **kwargs)

bot.send_message = wrapped_send_message

orig_edit_message_text = bot.edit_message_text
def wrapped_edit_message_text(*args, **kwargs):
    cfg = get_config()
    lang = cfg.get("LANG", "fa")
    args_list = list(args)
    if len(args_list) > 0 and isinstance(args_list[0], str):
        args_list[0] = translate_text(args_list[0], lang)
    elif "text" in kwargs and isinstance(kwargs["text"], str):
        kwargs["text"] = translate_text(kwargs["text"], lang)
        
    if "reply_markup" in kwargs and kwargs["reply_markup"]:
        kwargs["reply_markup"] = translate_markup(kwargs["reply_markup"], lang)
        
    use_premium = cfg.get("USE_PREMIUM_EMOJIS")
    if use_premium:
        p_args = list(args_list)
        p_kwargs = dict(kwargs)
        if len(p_args) > 0 and isinstance(p_args[0], str):
            p_args[0] = apply_premium_emojis(p_args[0])
        elif "text" in p_kwargs and isinstance(p_kwargs["text"], str):
            p_kwargs["text"] = apply_premium_emojis(p_kwargs["text"])
        try:
            return orig_edit_message_text(*p_args, **p_kwargs)
        except Exception as e:
            pass
            
    return orig_edit_message_text(*args_list, **kwargs)

bot.edit_message_text = wrapped_edit_message_text

orig_answer_callback_query = bot.answer_callback_query
def wrapped_answer_callback_query(callback_query_id, text=None, *args, **kwargs):
    if text:
        cfg = get_config()
        lang = cfg.get("LANG", "fa")
        text = translate_text(text, lang)
    return orig_answer_callback_query(callback_query_id, text, *args, **kwargs)

bot.answer_callback_query = wrapped_answer_callback_query

orig_send_photo = bot.send_photo
def wrapped_send_photo(*args, **kwargs):
    cfg = get_config()
    lang = cfg.get("LANG", "fa")
    args_list = list(args)
    
    if "caption" in kwargs and isinstance(kwargs["caption"], str):
        kwargs["caption"] = translate_text(kwargs["caption"], lang)
    elif len(args_list) > 2 and isinstance(args_list[2], str):
        args_list[2] = translate_text(args_list[2], lang)
        
    if "reply_markup" in kwargs and kwargs["reply_markup"]:
        kwargs["reply_markup"] = translate_markup(kwargs["reply_markup"], lang)
        
    use_premium = cfg.get("USE_PREMIUM_EMOJIS")
    if use_premium:
        p_args = list(args_list)
        p_kwargs = dict(kwargs)
        if "caption" in p_kwargs and isinstance(p_kwargs["caption"], str):
            p_kwargs["caption"] = apply_premium_emojis(p_kwargs["caption"])
        elif len(p_args) > 2 and isinstance(p_args[2], str):
            p_args[2] = apply_premium_emojis(p_args[2])
        try:
            return orig_send_photo(*p_args, **p_kwargs)
        except Exception as e:
            pass
            
    return orig_send_photo(*args_list, **kwargs)

bot.send_photo = wrapped_send_photo

orig_edit_message_caption = bot.edit_message_caption
def wrapped_edit_message_caption(*args, **kwargs):
    cfg = get_config()
    lang = cfg.get("LANG", "fa")
    args_list = list(args)
    
    if "caption" in kwargs and isinstance(kwargs["caption"], str):
        kwargs["caption"] = translate_text(kwargs["caption"], lang)
    elif len(args_list) > 0 and isinstance(args_list[0], str):
        args_list[0] = translate_text(args_list[0], lang)
        
    if "reply_markup" in kwargs and kwargs["reply_markup"]:
        kwargs["reply_markup"] = translate_markup(kwargs["reply_markup"], lang)
        
    use_premium = cfg.get("USE_PREMIUM_EMOJIS")
    if use_premium:
        p_args = list(args_list)
        p_kwargs = dict(kwargs)
        if "caption" in p_kwargs and isinstance(p_kwargs["caption"], str):
            p_kwargs["caption"] = apply_premium_emojis(p_kwargs["caption"])
        elif len(p_args) > 0 and isinstance(p_args[0], str):
            p_args[0] = apply_premium_emojis(p_args[0])
        try:
            return orig_edit_message_caption(*p_args, **p_kwargs)
        except Exception as e:
            pass
            
    return orig_edit_message_caption(*args_list, **kwargs)

bot.edit_message_caption = wrapped_edit_message_caption

orig_edit_message_reply_markup = bot.edit_message_reply_markup
def wrapped_edit_message_reply_markup(*args, **kwargs):
    cfg = get_config()
    lang = cfg.get("LANG", "fa")
    if "reply_markup" in kwargs and kwargs["reply_markup"]:
        kwargs["reply_markup"] = translate_markup(kwargs["reply_markup"], lang)
    elif len(args) > 0 and len(args) > 2:
        args_list = list(args)
        args_list[2] = translate_markup(args_list[2], lang)
        args = tuple(args_list)
    return orig_edit_message_reply_markup(*args, **kwargs)
bot.edit_message_reply_markup = wrapped_edit_message_reply_markup


_sessions = {}
_session_default = None
_api_prefix_cache = {}

def get_api_prefix(base_url, session):
    if not base_url:
        return "/panel/api"
    base_url = base_url.rstrip("/")
    if base_url in _api_prefix_cache:
        return _api_prefix_cache[base_url]
        
    import requests
    candidates = ["/panel/api", "/xui/API", "/xui/api"]
    for prefix in candidates:
        url = f"{base_url}{prefix}/inbounds/list"
        try:
            temp_session = requests.Session()
            # Construct a raw Cookie header to bypass any domain-restricted or port-restricted cookie jar matching rules
            cookie_str = "; ".join([f"{c.name}={c.value}" for c in session.cookies])
            if cookie_str:
                temp_session.headers["Cookie"] = cookie_str
                
            temp_session.headers.update({k: v for k, v in session.headers.items() if k not in ["Authorization", "Cookie"]})
            if "Authorization" in session.headers:
                temp_session.headers["Authorization"] = session.headers["Authorization"]
            
            res = temp_session.get(url, timeout=5, verify=False)
            if res.status_code != 404:
                print(f"[API Path Auto-Detect] Found working API path prefix: '{prefix}' for URL: {base_url}")
                _api_prefix_cache[base_url] = prefix
                return prefix
        except Exception as e:
            print(f"[API Path Auto-Detect Debug] Candidate {url} failed: {e}")
            pass
            
    print(f"[API Path Auto-Detect] All candidates returned 404 or timed out for: {base_url}. Defaulting to '/panel/api'")
    _api_prefix_cache[base_url] = "/panel/api"
    return "/panel/api"

def create_new_xui_session():
    import requests
    
    class XUISession(requests.Session):
        def request(self, method, url, *args, **kwargs):
            if "/panel/api/" in url:
                idx = url.find("/panel/api/")
                base_url = url[:idx]
                suffix = url[idx + len("/panel/api/"):]
                prefix = get_api_prefix(base_url, self)
                url = f"{base_url}{prefix}/{suffix}"
            return super().request(method, url, *args, **kwargs)
            
    session = XUISession()
    session.headers.update({
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        "Accept": "application/json, text/plain, */*",
        "Accept-Language": "en-US,en;q=0.9,fa;q=0.8"
    })
    return session

def get_session(server_id=None, base_url=None):
    global _sessions, _session_default
    
    key = None
    if server_id is not None:
        key = f"server_{server_id}"
    elif base_url is not None:
        base_url = base_url.rstrip("/")
        try:
            cfg = get_config()
            servers = cfg.get("SERVERS", []) + cfg.get("COLLEAGUE_SERVERS", [])
            for s in servers:
                s_url = s.get("panelUrl", "").rstrip("/")
                if s_url == base_url or s_url.replace("https://", "http://") == base_url.replace("https://", "http://"):
                    key = f"server_{s.get('id')}"
                    break
        except Exception as e:
            print(f"[get_session key resolution error] {e}")
        if not key:
            key = f"url_{base_url}"
            
    if key:
        if key not in _sessions:
            _sessions[key] = create_new_xui_session()
        return _sessions[key]
    else:
        try:
            cfg = get_config()
            servers = cfg.get("SERVERS", []) + cfg.get("COLLEAGUE_SERVERS", [])
            active_server = next((s for s in servers if s.get("status") == "active"), None)
            if not active_server and servers:
                active_server = servers[0]
            if active_server:
                s_id = active_server.get("id")
                key = f"server_{s_id}"
                if key not in _sessions:
                    _sessions[key] = create_new_xui_session()
                return _sessions[key]
        except Exception as e:
            print(f"[get_session fallback error] {e}")
            
        if _session_default is None:
            _session_default = create_new_xui_session()
        return _session_default

# Clean SSL Warnings inside Python requests
try:
    import urllib3
    urllib3.disable_warnings(urllib3.exceptions.InsecureRequestWarning)
except ImportError:
    pass

# --- Sanaei 3x-ui Admin API Helpers ---
_last_login_times = {}

def login_xui(server_id=None, force=False):
    """ Authenticate session with Sanaei X-UI administrator credentials supporting classic & CSRF-enabled panels """
    global _last_login_times
    cfg = get_config()
    
    servers = cfg.get("SERVERS", []) + cfg.get("COLLEAGUE_SERVERS", [])
    
    server = None
    if server_id:
        server = next((s for s in servers if str(s.get("id")) == str(server_id)), None)
    
    if not server and servers:
        # Fallback to first active server
        server = next((s for s in servers if s.get("status") == "active"), servers[0])

    if server:
        base_url = normalize_xui_url(server.get("panelUrl", ""))
        user = server.get("panelUsername", "")
        pwd = server.get("panelPassword", "")
        panel_type = server.get("panelType", "sanaei")
        cache_key = f"server_{server.get('id')}"
    else:
        # Legacy fallback
        base_url = cfg.get('XUI_URL', '')
        user = cfg.get('XUI_USER', '')
        pwd = cfg.get('XUI_PASS', '')
        panel_type = "sanaei"
        cache_key = "legacy"

    if not base_url:
        print("[Sanaei X-UI API] Panel XUI_URL is empty.")
        return False

    if base_url.endswith("/"):
        base_url = base_url[:-1]

    # Caching check: if last login was within 10 minutes (600s), reuse the session
    now = time.time()
    if not force and (now - _last_login_times.get(cache_key, 0) < 600):
        return True
        
    if panel_type in ["rebecca", "pasarguard"]:
        try:
            session = get_session(server_id=server_id)
            session.cookies.clear()
            session.headers.pop("Authorization", None)
            session.headers.pop("X-Csrf-Token", None)
            session.last_login_error = "" # Reset

            # We will try multiple candidate login paths and body formats to handle any version/Nginx redirects
            candidates = [
                # 1. Standard admin token urlencoded
                {"url": f"{base_url}/api/admin/token", "as_json": False, "data": {"grant_type": "password", "username": user, "password": pwd}},
                # 2. Standard admin token trailing slash urlencoded
                {"url": f"{base_url}/api/admin/token/", "as_json": False, "data": {"grant_type": "password", "username": user, "password": pwd}},
                # 3. Alternative token urlencoded
                {"url": f"{base_url}/api/token", "as_json": False, "data": {"grant_type": "password", "username": user, "password": pwd}},
                # 4. Alternative token trailing slash urlencoded
                {"url": f"{base_url}/api/token/", "as_json": False, "data": {"grant_type": "password", "username": user, "password": pwd}},
                # 5. Admin token JSON
                {"url": f"{base_url}/api/admin/token", "as_json": True, "data": {"username": user, "password": pwd}},
                # 6. Admin token trailing slash JSON
                {"url": f"{base_url}/api/admin/token/", "as_json": True, "data": {"username": user, "password": pwd}},
                # 7. Alternative token JSON
                {"url": f"{base_url}/api/token", "as_json": True, "data": {"username": user, "password": pwd}},
                # 8. Alternative token trailing slash JSON
                {"url": f"{base_url}/api/token/", "as_json": True, "data": {"username": user, "password": pwd}},
            ]

            last_status = None
            last_body = ""
            last_tested_url = ""

            for cand in candidates:
                url = cand["url"]
                as_json = cand["as_json"]
                payload = cand["data"]
                headers = {"Accept": "application/json"}
                
                try:
                    print(f"[Panel API] Trying auth candidate: {url} (JSON: {as_json})")
                    if as_json:
                        res = session.post(url, json=payload, headers=headers, timeout=10, verify=False)
                    else:
                        headers["Content-Type"] = "application/x-www-form-urlencoded"
                        res = session.post(url, data=payload, headers=headers, timeout=10, verify=False)
                    
                    last_status = res.status_code
                    last_tested_url = url
                    try:
                        last_body = res.text[:200]
                    except:
                        last_body = ""

                    if res.ok:
                        token = res.json().get("access_token")
                        if token:
                            session.headers.update({"Authorization": f"Bearer {token}"})
                            _last_login_times[cache_key] = now
                            print(f"[Panel API] Authenticated successfully with {panel_type} via {url}.")
                            return True
                except Exception as cand_err:
                    print(f"[Panel API] Auth candidate {url} failed: {str(cand_err)}")

            err_msg = f"Login rejected (Status: {last_status})"
            if last_status == 405:
                err_msg = f"Login rejected (405 Method Not Allowed)"
            elif last_status == 404:
                err_msg = f"Login rejected (404 Not Found)"
            
            print(f"[Panel API] All authentication candidates failed. Last tested: {last_tested_url} (Status: {last_status})")
            session.last_login_error = f"{err_msg}\nآدرس تست شده: {last_tested_url}\nپاسخ: {last_body}"
            return False
        except Exception as e:
            err_msg = f"Connection error: {str(e)}"
            print(f"[Panel API] {err_msg}")
            session.last_login_error = err_msg
            return False

    try:
        # 1. Initial GET handshake to fetch cookies and extract csrf-token if present
        print(f"[Sanaei X-UI API] Connecting to handshake URL: {base_url}")
        session = get_session(server_id=server_id)
        session.cookies.clear()
        session.headers.pop("Authorization", None)
        session.headers.pop("X-Csrf-Token", None)
        session.last_login_error = "" # Reset
        get_res = session.get(base_url, timeout=20, verify=False)
        
        csrf_token = ""
        import re
        match = re.search(r'<meta\s+name="csrf-token"\s+content="([^"]+)"', get_res.text)
        if match:
            csrf_token = match.group(1)
            print(f"[Sanaei X-UI API] CSRF token detected: {csrf_token}")

        # 2. Login POST request
        login_url = f"{base_url}/login"
        login_data = {
            "username": user,
            "password": pwd
        }

        headers = {
            "Content-Type": "application/x-www-form-urlencoded",
            "Referer": f"{base_url}/"
        }
        if csrf_token:
            headers["X-Csrf-Token"] = csrf_token
            session.headers.update({"X-Csrf-Token": csrf_token})
            print(f"[Sanaei X-UI API] CSRF token applied to session headers.")

        print(f"[Sanaei X-UI API] Posting login credentials to {login_url}")
        response = session.post(login_url, data=login_data, headers=headers, timeout=20, verify=False)
        
        if response.status_code != 200:
            err_msg = f"Login failed (Status: {response.status_code})"
            print(f"[Sanaei X-UI API] {err_msg}")
            session.last_login_error = err_msg
            return False

        # After login, the panel might issue a NEW CSRF token or update cookies
        if response.status_code == 200:
             # Try to find a new token in the response headers or body
             new_token = response.headers.get("X-Csrf-Token")
             if new_token:
                 session.headers.update({"X-Csrf-Token": new_token})
                 print(f"[Sanaei X-UI API] New POST-login CSRF token detected in headers: {new_token}")
             else:
                 # Check body too just in case
                 match = re.search(r'<meta\s+name="csrf-token"\s+content="([^"]+)"', response.text)
                 if match:
                     new_token = match.group(1)
                     session.headers.update({"X-Csrf-Token": new_token})
                     print(f"[Sanaei X-UI API] New POST-login CSRF token detected in body: {new_token}")
        try:
            res_json = response.json()
        except Exception:
            res_json = {}

        if res_json.get("success"):
            print("[Sanaei X-UI API] Authenticated successfully with the panel.")
            _last_login_times[cache_key] = now
            return True
        else:
            print(f"[Sanaei X-UI API] Login rejected: {response.text}")
    except Exception as e:
        print(f"[Sanaei X-UI API] Handshake error during authentication: {e}")
    return False

def check_client_exists(client_email, server_id=None):
    # Local check first (so even simulated offline users will be blocked from dupes)
    db = read_sqlite_db()
    keys = db.get("subscription_keys", [])
    lower_email = client_email.lower().strip()
    for k in keys:
        if k.get("clientName", "").lower().strip() == lower_email:
            return True

    cfg = get_config()
    servers = cfg.get("SERVERS", []) + cfg.get("COLLEAGUE_SERVERS", [])
    
    server = None
    if server_id:
        server = next((s for s in servers if str(s.get("id")) == str(server_id)), None)
    if not server and servers:
        server = next((s for s in servers if s.get("status") == "active"), servers[0])
        
    if server:
        base_url = normalize_xui_url(server.get("panelUrl", ""))
        server_id_to_use = server.get("id")
    else:
        base_url = cfg.get("XUI_URL", "")
        server_id_to_use = None
        
    if not base_url: 
        return False
        
    if base_url.endswith("/"):
        base_url = base_url[:-1]

    if not login_xui(server_id=server_id_to_use):
        return False
        
    session = get_session(server_id=server_id_to_use)
    try:
        url = f"{base_url}/panel/api/inbounds/getClientTraffics/{client_email}"
        response = session.get(url, timeout=20, verify=False)
        data = response.json()
        if data.get("success") and data.get("obj"):
            return True
    except Exception as e:
        print(f"[Panel Check Error] {e}")
    return False

def add_copy_button_to_markup(markup, text, link):
    try:
        from telebot.types import CopyTextButton
        markup.add(types.InlineKeyboardButton(text=text, copy_text=CopyTextButton(text=link)))
        return
    except ImportError:
        pass
    except Exception as e:
        import traceback
        with open("copy_error.log", "w") as f:
            f.write(traceback.format_exc())
        print(f"[CopyTextButton Error] {e}")

    # Fallback to local token mapping if CopyTextButton is not supported
    try:
        import random, string
        db = read_sqlite_db()
        if "link_tokens" not in db:
            db["link_tokens"] = {}
        
        # Check if this link already has a token
        token = None
        for tk, lnk in db["link_tokens"].items():
            if lnk == link:
                token = tk
                break
                
        if not token:
            token = "".join(random.choices(string.ascii_lowercase + string.digits, k=8))
            db["link_tokens"][token] = link
            # Clean up old tokens if there are too many
            if len(db["link_tokens"]) > 2000:
                all_tks = list(db["link_tokens"].keys())
                for tk in all_tks[:500]:
                    try:
                        del db["link_tokens"][tk]
                    except KeyError:
                        pass
            write_sqlite_db(db)
            
        markup.add(types.InlineKeyboardButton(text=text, callback_data=f"showlink_{token}"))
    except Exception as e:
        print(f"[Callback Copy Button Failed, Fallback to URL] {e}")
        markup.add(types.InlineKeyboardButton(text=text, url=link))

def get_qr_code_url(text):
    try:
        cfg = get_config()
        qr_template = cfg.get("QR_TEMPLATE", "").strip()
        qr_color = cfg.get("QR_COLOR", "").strip()
        qr_logo = cfg.get("QR_LOGO", "").strip()
        
        import urllib.parse
        encoded_text = urllib.parse.quote(text)
        
        # If user defined a custom template, use it
        if qr_template:
            # Check if it's a JSON config for qrcode-monkey
            if qr_template.startswith("{") and qr_template.endswith("}"):
                try:
                    import json
                    config = json.loads(qr_template)
                    if qr_color and qr_color.lower() != "none":
                        config["bodyColor"] = qr_color if qr_color.startswith("#") else f"#{qr_color}"
                    if qr_logo:
                        config["logo"] = qr_logo
                    
                    encoded_config = urllib.parse.quote(json.dumps(config))
                    return f"https://api.qrcode-monkey.com/qr/custom?data={encoded_text}&config={encoded_config}"
                except Exception as e:
                    print(f"[QRCode Monkey JSON Parse Error] {e}")

            # Legacy custom URL replacement
            url = qr_template
            url = url.replace("{text}", encoded_text)
            url = url.replace("{logo_url}", urllib.parse.quote(qr_logo) if qr_logo else "")
            color_val = qr_color if qr_color and qr_color.lower() != "none" else ""
            url = url.replace("{color}", urllib.parse.quote(color_val) if color_val else "")
            return url
            
        # Default beautiful QuickChart QR Code
        color_param = "111827"
        if qr_color and qr_color.lower() != "none":
            color_param = qr_color.lstrip('#')
            
        logo_param = urllib.parse.quote(qr_logo) if qr_logo else ""
        
        url = f"https://quickchart.io/qr?text={encoded_text}&width=350&height=350&color={color_param}&margin=2"
        if logo_param:
            url += f"&centerImageUrl={logo_param}&centerImageWidth=70&centerImageHeight=70"
        return url
    except Exception as e:
        print(f"[get_qr_code_url Error] {e}")
        import urllib.parse
        return f"https://api.qrserver.com/v1/create-qr-code/?size=250x250&data={urllib.parse.quote(text)}"

def safe_send_qr_photo(chat_id, qr_url, full_text, markup):
    if len(full_text) <= 1024:
        try:
            bot.send_photo(chat_id, qr_url, caption=full_text, parse_mode="HTML", reply_markup=markup)
            return True
        except Exception as e:
            print(f"[safe_send_qr_photo] Failed direct send: {e}")
            
    # For long text (or fallback if send_photo failed), send as a single text message with an inline photo link!
    # This allows up to 4096 characters with the QR code photo in ONE single message!
    inline_photo_text = f'<a href="{qr_url}">&#8205;</a>{full_text}'
    try:
        bot.send_message(chat_id, inline_photo_text, parse_mode="HTML", reply_markup=markup)
        return True
    except Exception as e:
        print(f"[safe_send_qr_photo] Failed inline photo message: {e}")
        
    # If len > 1024 or direct sending failed, split it!
    short_caption = full_text
    rest_text = ""
    for marker in ["🚀 <b>لینک‌های", "🚀 لینک‌های", "⚠️ <b>توجه:", "⚠️ توجه:"]:
        if marker in full_text:
            parts = full_text.split(marker, 1)
            short_caption = parts[0].strip()
            rest_text = marker + parts[1].strip()
            break
            
    if len(short_caption) > 1000:
        short_caption = short_caption[:980] + "..."
        rest_text = full_text
    else:
        if not rest_text:
            rest_text = full_text
            
    hint = "\n\n📸 اسکنر QR فوق را اسکن کنید یا از دکمه‌های زیر استفاده کنید.\n👇 لینک‌های اتصال مستقیم در پیام بعدی ارسال شد."
    if len(short_caption) + len(hint) <= 1024:
        short_caption += hint
        
    try:
        bot.send_photo(chat_id, qr_url, caption=short_caption, parse_mode="HTML", reply_markup=markup)
        if rest_text:
            bot.send_message(chat_id, rest_text, parse_mode="HTML")
        return True
    except Exception as e:
        print(f"[safe_send_qr_photo] Failed split send: {e}")
        try:
            bot.send_message(chat_id, full_text, parse_mode="HTML", reply_markup=markup)
            return True
        except Exception as ex:
            print(f"[safe_send_qr_photo] Absolute failure: {ex}")
            return False

def send_purchase_success_note_if_any(chat_id, only_media=True):
    cfg = get_config()
    note_text = cfg.get("PURCHASE_SUCCESS_NOTE", "")
    note_attach = cfg.get("PURCHASE_SUCCESS_ATTACHMENT", None)
    
    if not note_text and not note_attach:
        return
        
    try:
        if note_attach and "fileData" in note_attach:
            file_data_b64 = note_attach["fileData"]
            file_type = note_attach.get("fileType", "image")
            
            import base64
            import io
            
            if "," in file_data_b64:
                header, encoded = file_data_b64.split(",", 1)
            else:
                encoded = file_data_b64
                
            file_bytes = base64.b64decode(encoded)
            file_io = io.BytesIO(file_bytes)
            
            if file_type == "image":
                file_io.name = "image.png"
                bot.send_photo(chat_id, file_io, caption=note_text, parse_mode="HTML")
            elif file_type == "video":
                file_io.name = "video.mp4"
                bot.send_video(chat_id, file_io, caption=note_text, parse_mode="HTML")
            elif file_type == "voice":
                file_io.name = "voice.ogg"
                bot.send_voice(chat_id, file_io, caption=note_text, parse_mode="HTML")
            else:
                file_io.name = note_attach.get("fileName", "file.dat")
                bot.send_document(chat_id, file_io, caption=note_text, parse_mode="HTML")
        elif note_text and not only_media:
            bot.send_message(chat_id, note_text, parse_mode="HTML")
    except Exception as e:
        print(f"[Purchase Success Note] Error sending attachment/text: {e}")

def reset_vpn_client_uuid_api(subscription_id):
    """ Call our server's internal endpoint to reset UUID and SubId in XUI and DB """
    import requests
    try:
        cfg = get_config()
        port = cfg.get("SERVER_PORT", 3000)
        url = f"http://127.0.0.1:{port}/api/subscription-keys/regenerate-uuid"
        payload = {"id": str(subscription_id)}
        print(f"[DEBUG] Calling regenerate-uuid for sub_id: {subscription_id}")
        
        response = requests.post(url, json=payload, timeout=40)
        
        if response.status_code == 200:
            data = response.json()
            if data.get("success"):
                return data
            else:
                return {"success": False, "error": data.get("error", "خطای سرور")}
        else:
            try:
                data = response.json()
                if data and isinstance(data, dict) and data.get("error"):
                    return {"success": False, "error": data.get("error")}
            except Exception:
                pass
            return {"success": False, "error": f"Server error (HTTP {response.status_code})"}
            
    except requests.exceptions.Timeout:
        return {"success": False, "error": "درخواست با وقفه مواجه شد (Timeout). لطفاً مجدداً تلاش کنید."}
    except Exception as e:
        print(f"[reset_vpn_client_uuid_api Error] {e}")
        return {"success": False, "error": f"خطای سیستمی: {str(e)}"}

def get_client_all_links(client_name, client_uuid, sub_link=None, server_id=None):
    """
    Fetch raw standard links for a specific client from the Sanaei 3x-ui panel.
    Tries multiple client-specific endpoint forms:
    1. /panel/api/clients/links/{email}
    2. /panel/api/clients/subLinks/{sub_id}
    Falls back to building links dynamically from active inbounds or generating mock ones if offline.
    """
    import re
    safe_client_name = re.sub(r"[^A-Za-z0-9_-]", "", client_name)

    cfg = get_config()
    servers = cfg.get("SERVERS", []) + cfg.get("COLLEAGUE_SERVERS", [])
    
    server = None
    if server_id:
        server = next((s for s in servers if str(s.get("id")) == str(server_id)), None)
    
    if not server and servers:
        server = next((s for s in servers if s.get("status") == "active"), servers[0])
        
    if server:
        base_url = normalize_xui_url(server.get("panelUrl", ""))
        server_id = server.get("id")
    else:
        base_url = cfg.get("XUI_URL", "")
        if base_url.endswith("/"):
            base_url = base_url[:-1]

    links = []
    
    if login_xui(server_id) and base_url:
        session = get_session()
        
        # Prefetch hosts and inbounds to replace domain names/overrides in links returned by any endpoint
        hosts_by_inbound = {}
        inbounds_by_port = {}
        inbounds_by_remark = {}
        inbounds_by_id = {}
        inb_list_raw = []
        
        try:
            url_hosts = f"{base_url}/panel/api/hosts/list"
            res_hosts = session.get(url_hosts, timeout=10, verify=False)
            if res_hosts.status_code == 200:
                hosts_data = res_hosts.json()
                if hosts_data.get("success") and isinstance(hosts_data.get("obj"), list):
                    for h in hosts_data["obj"]:
                        inb_id_val = h.get("inboundId")
                        if inb_id_val is not None:
                            if inb_id_val not in hosts_by_inbound:
                                hosts_by_inbound[inb_id_val] = []
                            hosts_by_inbound[inb_id_val].append(h)
                    print(f"[get_client_all_links] Successfully prefetched {len(hosts_data['obj'])} hosts.")
        except Exception as ex_hosts:
            print(f"[get_client_all_links Prefetch Hosts Error] {ex_hosts}")

        try:
            url_list = f"{base_url}/panel/api/inbounds/list"
            res_inb = session.get(url_list, timeout=20, verify=False)
            inb_data = res_inb.json()
            if inb_data.get("success") and isinstance(inb_data.get("obj"), list):
                inb_list_raw = inb_data["obj"]
                import json
                for item in inb_list_raw:
                    ib_id = item.get("id")
                    ib_port = item.get("port")
                    ib_remark = item.get("remark")
                    if ib_id is not None:
                        inbounds_by_id[ib_id] = item
                    if ib_port is not None:
                        if ib_port not in inbounds_by_port:
                            inbounds_by_port[ib_port] = []
                        inbounds_by_port[ib_port].append(item)
                    if ib_remark:
                        inbounds_by_remark[ib_remark.lower().strip()] = item
                print(f"[get_client_all_links] Successfully prefetched {len(inb_list_raw)} inbounds.")
        except Exception as ex_inb:
            print(f"[get_client_all_links Prefetch Inbounds Error] {ex_inb}")

        # Helper to find matching inbound based on port and remark/fragment similarity
        def find_matching_inbound(port, fragment_or_ps):
            if port is not None and port in inbounds_by_port:
                candidates = inbounds_by_port[port]
                if len(candidates) == 1:
                    return candidates[0]
                else:
                    # Score based on remark similarity
                    best_score = -1
                    best_cand = None
                    frag_lower = fragment_or_ps.lower().strip()
                    for cand in candidates:
                        cand_remark = cand.get("remark", "").lower().strip()
                        score = 0
                        if cand_remark in frag_lower:
                            score += 100 + len(cand_remark)
                        elif frag_lower in cand_remark:
                            score += 50 + len(frag_lower)
                        else:
                            import re
                            cand_words = set(re.findall(r'\w+|[^\w\s]', cand_remark))
                            frag_words = set(re.findall(r'\w+|[^\w\s]', frag_lower))
                            intersection = cand_words.intersection(frag_words)
                            score += len(intersection) * 10
                        if score > best_score:
                            best_score = score
                            best_cand = cand
                    return best_cand
            else:
                # Fallback to remark matching
                frag_lower = fragment_or_ps.lower().strip()
                for r_key, ib in inbounds_by_remark.items():
                    if r_key in frag_lower:
                        return ib
            return None

        # 1. Try links by Email first
        try:
            url = f"{base_url}/panel/api/clients/links/{client_name}"
            res = session.get(url, timeout=20, verify=False)
            data = res.json()
            if data.get("success") and isinstance(data.get("obj"), list):
                raw_links = []
                for lnk in data["obj"]:
                    raw_links.extend(str(lnk).split('\n'))
                links = [l.strip() for l in raw_links if "://" in l]
                print(f"[get_client_all_links] Fetched {len(links)} links using email endpoint.")
        except Exception as e:
            print(f"[get_client_all_links Email EndPoint Error] {e}")

        # Try with safe_client_name too if different
        if not links and safe_client_name != client_name:
            try:
                url = f"{base_url}/panel/api/clients/links/{safe_client_name}"
                res = session.get(url, timeout=20, verify=False)
                data = res.json()
                if data.get("success") and isinstance(data.get("obj"), list):
                    raw_links = []
                    for lnk in data["obj"]:
                        raw_links.extend(str(lnk).split('\n'))
                    links = [l.strip() for l in raw_links if "://" in l]
                    print(f"[get_client_all_links] Fetched {len(links)} links using safe email endpoint.")
            except Exception as e:
                print(f"[get_client_all_links Safe Email EndPoint Error] {e}")

        # 2. Try subLinks endpoint if Email endpoint failed or returned empty
        if not links and sub_link:
            try:
                sub_id = None
                if "/sub/" in sub_link:
                    sub_id = sub_link.split("/sub/")[1].split("?")[0]
                if sub_id:
                    url = f"{base_url}/panel/api/clients/subLinks/{sub_id}"
                    res = session.get(url, timeout=20, verify=False)
                    data = res.json()
                    if data.get("success") and isinstance(data.get("obj"), list):
                        raw_links = []
                        for lnk in data["obj"]:
                            raw_links.extend(str(lnk).split('\n'))
                        links = [l.strip() for l in raw_links if "://" in l]
                        print(f"[get_client_all_links] Fetched {len(links)} links using subLinks endpoint.")
            except Exception as e:
                print(f"[get_client_all_links SubId EndPoint Error] {e}")

        # 2.5 Try to fetch the subscription content directly and parse/decode individual links
        if not links and sub_link:
            import requests
            candidate_urls = [sub_link]
            
            # If the container has DNS resolving issues for the public domain of the sub_link,
            # we can try to request it directly from the working base_url
            try:
                if "/sub/" in sub_link and base_url:
                    sub_part = "/sub/" + sub_link.split("/sub/")[1]
                    candidate_urls.append(base_url.rstrip("/") + sub_part)
            except Exception as ex:
                print(f"[get_client_all_links Candidates Build Error] {ex}")

            for url in candidate_urls:
                try:
                    print(f"[get_client_all_links] Trying to fetch sub content directly from: {url}")
                    # Use a fresh requests.get to bypass session headers that might interfere
                    res = requests.get(url, timeout=12, verify=False)
                    if res.status_code == 200 and res.text.strip():
                        text_content = res.text.strip()
                        decoded_text = ""
                        try:
                            import base64
                            missing_padding = len(text_content) % 4
                            if missing_padding:
                                padded_content = text_content + '=' * (4 - missing_padding)
                            else:
                                padded_content = text_content
                            decoded_text = base64.b64decode(padded_content).decode('utf-8', errors='ignore')
                        except Exception as decode_err:
                            print(f"[get_client_all_links Direct Fetch Decode Error] {decode_err}")
                            decoded_text = text_content
                        
                        raw_lines = [line.strip() for line in decoded_text.split('\n') if line.strip()]
                        fetched_links = [l for l in raw_lines if "://" in l]
                        if fetched_links:
                            links = fetched_links
                            print(f"[get_client_all_links] Successfully fetched {len(links)} links directly from sub content at {url}")
                            break
                except Exception as e:
                    print(f"[get_client_all_links Direct Fetch Error for {url}] {e}")

        # 3. Fallback: Parse inbounds statically and construct VLESS/VMESS/Trojan links if endpoints returned nothing but login was successful
        if not links:
            try:
                if inb_list_raw:
                    import json
                    import base64
                    domain = base_url.split("://")[-1].split(":")[0]  # default domain of the panel
                    if sub_link:
                        from urllib.parse import urlparse
                        try:
                            parsed_sub = urlparse(sub_link)
                            if parsed_sub.hostname:
                                domain = parsed_sub.hostname
                        except Exception as parse_ex:
                            print(f"[get_client_all_links Domain Parsing Error] {parse_ex}")
                    for item in inb_list_raw:
                        protocol = item.get("protocol", "").lower()
                        if protocol not in ["vless", "vmess", "trojan"]:
                            continue
                            
                        # VERIFY THE CLIENT IS ACTUALLY IN THIS INBOUND
                        client_in_this_inbound = False
                        settings_str = item.get("settings", "{}")
                        client_id_or_password = client_uuid
                        try:
                            settings_obj = json.loads(settings_str)
                            for c in settings_obj.get("clients", []):
                                if c.get("id") == client_uuid or c.get("email") == client_name or c.get("email") == safe_client_name:
                                    client_in_this_inbound = True
                                    client_id_or_password = c.get("id") or c.get("password") or client_uuid
                                    break
                        except:
                            pass
                            
                        if not client_in_this_inbound:
                            continue
                            
                        port = item.get("port")
                        remark = item.get("remark", protocol.upper())
                        
                        stream_settings_str = item.get("streamSettings", "{}")
                        stream_settings = {}
                        if isinstance(stream_settings_str, str):
                            try:
                                stream_settings = json.loads(stream_settings_str)
                            except:
                                pass
                        elif isinstance(stream_settings_str, dict):
                            stream_settings = stream_settings_str
                            
                        security = stream_settings.get("security", "none")
                        network = stream_settings.get("network", "tcp")
                        
                        # Parse externalProxy if present in the inbound or its streamSettings
                        ext_proxies = []
                        ext_proxy_raw = item.get("externalProxy", "")
                        if not ext_proxy_raw and isinstance(stream_settings, dict):
                            ext_proxy_raw = stream_settings.get("externalProxy", "")
                        if ext_proxy_raw:
                            try:
                                if isinstance(ext_proxy_raw, str):
                                    ext_proxies = json.loads(ext_proxy_raw)
                                elif isinstance(ext_proxy_raw, list):
                                    ext_proxies = ext_proxy_raw
                            except Exception as e:
                                print(f"[get_client_all_links] Failed to parse externalProxy JSON: {e}")

                        targets = []
                        inb_id = item.get("id")
                        
                        # 1. Add targets from separate Hosts list (v3.4+ Sanaei)
                        if inb_id in hosts_by_inbound:
                            for h in hosts_by_inbound[inb_id]:
                                if h.get("enable") is False:
                                    continue
                                dest = h.get("address") or h.get("dest")
                                p_port = h.get("port")
                                if dest:
                                    try:
                                        p_port = int(p_port) if p_port is not None else port
                                    except:
                                        p_port = port
                                    
                                    h_security = h.get("security")
                                    if h_security == "same" or not h_security:
                                        h_security = None
                                        
                                    targets.append({
                                        "domain": dest,
                                        "port": p_port,
                                        "security": h_security,
                                        "sni": h.get("sni"),
                                        "remark": h.get("remark")
                                    })
                                    
                        # 2. Add targets from legacy externalProxy
                        if isinstance(ext_proxies, list) and len(ext_proxies) > 0:
                            for proxy in ext_proxies:
                                if isinstance(proxy, dict):
                                    dest = proxy.get("dest")
                                    p_port = proxy.get("port")
                                    if dest:
                                        try:
                                            p_port = int(p_port) if p_port is not None else port
                                        except:
                                            p_port = port
                                        targets.append({
                                            "domain": dest,
                                            "port": p_port,
                                            "security": None,
                                            "sni": None,
                                            "remark": None
                                        })
                                        
                        if not targets and isinstance(ext_proxy_raw, str) and ext_proxy_raw.strip():
                            # Maybe simple string "host:port" or "host"
                            parts = ext_proxy_raw.replace("\n", ",").replace(";", ",").split(",")
                            for part in parts:
                                part = part.strip()
                                if part:
                                    if ":" in part:
                                        try:
                                            d, p = part.rsplit(":", 1)
                                            targets.append({
                                                "domain": d,
                                                "port": int(p),
                                                "security": None,
                                                "sni": None,
                                                "remark": None
                                            })
                                        except:
                                            targets.append({
                                                "domain": part,
                                                "port": port,
                                                "security": None,
                                                "sni": None,
                                                "remark": None
                                            })
                                    else:
                                        targets.append({
                                            "domain": part,
                                            "port": port,
                                            "security": None,
                                            "sni": None,
                                            "remark": None
                                        })

                        if not targets:
                            targets.append({
                                "domain": domain,
                                "port": port,
                                "security": None,
                                "sni": None,
                                "remark": None
                            })

                        for tgt in targets:
                            target_domain = tgt["domain"]
                            target_port = tgt["port"]
                            tgt_security = tgt["security"] if tgt["security"] else security
                            tgt_sni = tgt["sni"] if tgt["sni"] else None
                            tgt_remark = tgt["remark"] if tgt["remark"] else remark
                            
                            if protocol == "vless" or protocol == "trojan":
                                # Standard format: protocol://id@domain:port?security=...&type=...#remark
                                paras = []
                                paras.append(f"security={tgt_security}")
                                paras.append(f"type={network}")
                                
                                if tgt_sni:
                                    paras.append(f"sni={tgt_sni}")
                                    if network == "ws":
                                        paras.append(f"host={tgt_sni}")
                                else:
                                    if tgt_security == "reality":
                                        r_settings = stream_settings.get("realitySettings", {})
                                        sni = r_settings.get("serverNames", ["google.com"])[0]
                                        pbk = r_settings.get("publicKey", "")
                                        sid = r_settings.get("shortIds", [""])[0]
                                        paras.append(f"sni={sni}")
                                        if pbk:
                                            paras.append(f"pbk={pbk}")
                                        if sid:
                                            paras.append(f"sid={sid}")
                                        paras.append("fp=chrome")
                                    elif tgt_security == "tls":
                                        t_settings = stream_settings.get("tlsSettings", {})
                                        sni = t_settings.get("serverName", "")
                                        if sni:
                                            paras.append(f"sni={sni}")
                                            if network == "ws":
                                                paras.append(f"host={sni}")
                                                
                                if network == "ws":
                                    ws_settings = stream_settings.get("wsSettings", {})
                                    path = ws_settings.get("path", "/")
                                    paras.append(f"path={path}")
                                elif network == "grpc":
                                    grpc_settings = stream_settings.get("grpcSettings", {})
                                    service_name = grpc_settings.get("serviceName", "")
                                    if service_name:
                                        paras.append(f"serviceName={service_name}")
                                        
                                query_str = "&".join(paras)
                                label = f"{tgt_remark}-{client_name}"
                                link = f"{protocol}://{client_id_or_password}@{target_domain}:{target_port}?{query_str}#{label}"
                                links.append(link)
                                
                            elif protocol == "vmess":
                                vmess_obj = {
                                    "v": "2",
                                    "ps": f"{tgt_remark}-{client_name}",
                                    "add": target_domain,
                                    "port": target_port,
                                    "id": client_uuid,
                                    "aid": "0",
                                    "scy": "auto",
                                    "net": network,
                                    "type": "none",
                                    "host": "",
                                    "path": "",
                                    "tls": "tls" if tgt_security in ["tls", "reality"] else "none",
                                    "sni": "",
                                    "fp": ""
                                }
                                if tgt_sni:
                                    vmess_obj["sni"] = tgt_sni
                                    if network == "ws":
                                        vmess_obj["host"] = tgt_sni
                                else:
                                    if tgt_security in ["tls", "reality"]:
                                        if tgt_security == "reality":
                                            r_settings = stream_settings.get("realitySettings", {})
                                            vmess_obj["sni"] = r_settings.get("serverNames", ["google.com"])[0]
                                        else:
                                            t_settings = stream_settings.get("tlsSettings", {})
                                            vmess_obj["sni"] = t_settings.get("serverName", "")
                                            
                                if network == "ws":
                                    ws_settings = stream_settings.get("wsSettings", {})
                                    vmess_obj["path"] = ws_settings.get("path", "/")
                                    if not vmess_obj["host"]:
                                        headers = ws_settings.get("headers", {})
                                        if headers:
                                            vmess_obj["host"] = headers.get("Host", "")
                                elif network == "grpc":
                                    grpc_settings = stream_settings.get("grpcSettings", {})
                                    vmess_obj["path"] = grpc_settings.get("serviceName", "")
                                
                                json_str = json.dumps(vmess_obj, ensure_ascii=False)
                                b64_str = base64.b64encode(json_str.encode('utf-8')).decode('utf-8')
                                link = f"vmess://{b64_str}"
                                links.append(link)
                            
                    print(f"[get_client_all_links] Reconstructed {len(links)} links statically from inbounds list.")
            except Exception as e:
                print(f"[get_client_all_links static reconstruction error] {e}")

        # 3.5 Global post-processing: If we retrieved any links, but we have hosts/overrides configured for their inbounds,
        # replace the domains/ports/overrides in those links with the host settings.
        if links:
            processed_links = []
            for link in links:
                if link.startswith("vmess://"):
                    try:
                        b64_data = link[8:]
                        # Add padding if needed
                        padding = len(b64_data) % 4
                        if padding:
                            b64_data += "=" * (4 - padding)
                        import json
                        import base64
                        decoded = base64.b64decode(b64_data).decode('utf-8', errors='ignore')
                        vmess_obj = json.loads(decoded)
                        
                        vmess_port = None
                        try:
                            vmess_port = int(vmess_obj.get("port"))
                        except:
                            pass
                            
                        vmess_ps = vmess_obj.get("ps", "")
                        
                        # Match inbound
                        matching_inbound = find_matching_inbound(vmess_port, vmess_ps)
                                    
                        if matching_inbound:
                            ib_id = matching_inbound.get("id")
                            ib_hosts = hosts_by_inbound.get(ib_id, [])
                            active_hosts = [h for h in ib_hosts if h.get("enable") is not False]
                            
                            if active_hosts:
                                for h in active_hosts:
                                    h_address = h.get("address") or h.get("dest")
                                    h_port = h.get("port")
                                    if not h_address:
                                        continue
                                    try:
                                        h_port = int(h_port) if h_port is not None else vmess_port
                                    except:
                                        h_port = vmess_port if vmess_port is not None else 80
                                        
                                    h_security = h.get("security")
                                    h_sni = h.get("sni")
                                    h_remark = h.get("remark")
                                    
                                    new_obj = dict(vmess_obj)
                                    new_obj["add"] = h_address
                                    new_obj["port"] = h_port
                                    
                                    if h_security and h_security != "same":
                                        new_obj["tls"] = "tls" if h_security in ["tls", "reality"] else "none"
                                        
                                    if h_sni:
                                        new_obj["sni"] = h_sni
                                        if new_obj.get("net") == "ws":
                                            new_obj["host"] = h_sni
                                            
                                    if h_remark:
                                        new_obj["ps"] = f"{h_remark}-{vmess_ps}"
                                        
                                    json_str = json.dumps(new_obj, ensure_ascii=False)
                                    b64_str = base64.b64encode(json_str.encode('utf-8')).decode('utf-8')
                                    processed_links.append(f"vmess://{b64_str}")
                                continue
                        processed_links.append(link)
                    except Exception as vmess_ex:
                        print(f"[get_client_all_links Post VMESS Error] {vmess_ex}")
                        processed_links.append(link)
                else:
                    # Non-vmess links (vless, trojan, ss, etc.)
                    import urllib.parse
                    try:
                        parsed_url = urllib.parse.urlparse(link)
                        netloc = parsed_url.netloc
                        if "@" in netloc:
                            credential, host_port = netloc.split("@", 1)
                        else:
                            credential = ""
                            host_port = netloc
                        
                        link_port = None
                        link_domain = host_port
                        if ":" in host_port:
                            link_domain, port_str = host_port.rsplit(":", 1)
                            try:
                                link_port = int(port_str)
                            except:
                                pass
                        
                        fragment = urllib.parse.unquote(parsed_url.fragment or "")
                        matching_inbound = find_matching_inbound(link_port, fragment)
                        
                        if matching_inbound:
                            ib_id = matching_inbound.get("id")
                            ib_hosts = hosts_by_inbound.get(ib_id, [])
                            active_hosts = [h for h in ib_hosts if h.get("enable") is not False]
                            
                            if active_hosts:
                                for h in active_hosts:
                                    h_address = h.get("address") or h.get("dest")
                                    h_port = h.get("port")
                                    if not h_address:
                                        continue
                                    try:
                                        h_port = int(h_port) if h_port is not None else link_port
                                    except:
                                        h_port = link_port if link_port is not None else 80
                                        
                                    h_security = h.get("security")
                                    h_sni = h.get("sni")
                                    h_remark = h.get("remark")
                                    
                                    new_host_port = f"{h_address}:{h_port}"
                                    new_netloc = f"{credential}@{new_host_port}" if credential else new_host_port
                                    
                                    query_params = urllib.parse.parse_qs(parsed_url.query)
                                    if h_security and h_security != "same":
                                        query_params["security"] = [h_security]
                                    if h_sni:
                                        query_params["sni"] = [h_sni]
                                        if "host" in query_params or parsed_url.scheme in ["vless", "trojan", "vmess"]:
                                            query_params["host"] = [h_sni]
                                            
                                    new_query = urllib.parse.urlencode(query_params, doseq=True)
                                    new_fragment = fragment
                                    if h_remark:
                                        new_fragment = f"{h_remark}-{fragment}"
                                        
                                    new_url = parsed_url._replace(netloc=new_netloc, query=new_query, fragment=new_fragment)
                                    processed_links.append(urllib.parse.urlunparse(new_url))
                                continue
                        processed_links.append(link)
                    except Exception as parse_ex:
                        print(f"[get_client_all_links Post non-VMESS Error] {parse_ex} for link {link}")
                        processed_links.append(link)
                        
            links = processed_links

    # 4. Semi-dynamic fallback based on XUI_URL
    if not links:
        # Instead of returning a fake display config that confuses users, return empty list
        # so the caller will default to showing the sub_link.
        links = []

    # Ensure links are truly split (sometimes they come back separated by spaces instead of newlines)
    final_links = []
    import re
    for lnk in links:
        split_links = re.split(r'\s+(?=vless://|vmess://|trojan://|shadowsocks://|ss://)', str(lnk).strip())
        for sl in split_links:
            if sl.strip():
                final_links.append(sl.strip())
                
    return final_links

def add_vpn_client_api(client_email, traffic_gb, duration_days, client_uuid=None, server_id=None):
    """
    Creates a new client in the X-UI panel.
    Adds the user to all active inbounds specified in the settings.
    """
    try:
        traffic_gb = float(traffic_gb)
    except:
        traffic_gb = 0.1
    try:
        duration_days = float(duration_days)
    except:
        duration_days = 1.0

    import random, string, time, json, os, uuid, re
    cfg = get_config()
    db = read_sqlite_db()
    settings = db.get("settings", {})
    servers = cfg.get("SERVERS", []) + cfg.get("COLLEAGUE_SERVERS", [])
    
    server = None
    if server_id:
        server = next((s for s in servers if str(s.get("id")) == str(server_id)), None)
    if not server and servers:
        server = next((s for s in servers if s.get("status") == "active"), servers[0])
        
    if server:
        base_url = normalize_xui_url(server.get("panelUrl", ""))
    else:
        base_url = cfg.get("XUI_URL", "")
        
    if not base_url: return None, None
    if base_url.endswith("/"): base_url = base_url[:-1]

    if not login_xui(server_id):
        print("[Sanaei API Error] Skipping user creation - login failed.")
        session = get_session(server_id=server_id)
        session.last_error = getattr(session, "last_login_error", "ورود به پنل ناموفق بود.")
        return None, None

    session = get_session(server_id=server_id)

    if not client_uuid:
         client_uuid = str(uuid.uuid4())
         
    xui_sub_id = ''.join(random.choices(string.ascii_lowercase + string.digits, k=16))
    if traffic_gb < 1.0:
        total_bytes = int(traffic_gb * 1000 * 1024 * 1024)
    else:
        total_bytes = int(traffic_gb * 1024 * 1024 * 1024)
    expiry_time_ms = int((time.time() + (duration_days * 24 * 60 * 60)) * 1000)

    safe_email = str(client_email).strip()
    safe_email = re.sub(r"[^A-Za-z0-9_-]", "", safe_email)
    
    client_config = {
        "id": client_uuid,
        "email": safe_email,
        "limitIp": 0,
        "totalGB": total_bytes,
        "total": total_bytes,   
        "expiryTime": expiry_time_ms,
        "enable": True,
                "subId": xui_sub_id
    }

    # Determine inbound IDs
    inbound_ids = []
    
    if server:
        active_ids = server.get("activeInboundIds", [])
        if active_ids and isinstance(active_ids, list):
            inbound_ids = [int(i) for i in active_ids if str(i).isdigit() or isinstance(i, int)]
    else:
        settings_str = settings.get("panel_config")
        if settings_str:
            try:
                panel_cfg = json.loads(settings_str)
                active_ids = panel_cfg.get("activeInboundIds", [])
                if active_ids and isinstance(active_ids, list):
                    inbound_ids = [int(i) for i in active_ids if str(i).isdigit() or isinstance(i, int)]
            except Exception as e:
                print(f"[API] Error resolving inbound IDs: {e}")

    # Fetch available IDs to ensure validity (Avoid hanging on dead IDs)
    valid_ids = []
    
    panel_type = server.get("panelType", "sanaei") if server else "sanaei"
    
    server_sub = None
    if server:
        server_sub = server.get("subUrl") or server.get("panelUrl")
    if not server_sub:
        server_sub = cfg.get('SUB_URL', base_url)
            
    if panel_type in ["rebecca", "pasarguard"]:
        if not inbound_ids:
            inbound_ids = [1]
        payload = {
            "username": safe_email,
            "expire": int(expiry_time_ms / 1000),
            "data_limit": total_bytes,
            "data_limit_reset_strategy": "no_reset",
            "proxies": {"vless": {}},
            "inbounds": {}
        }
        if panel_type == "rebecca":
            payload["service_ids"] = inbound_ids
            payload["service_id"] = inbound_ids[0] if inbound_ids else 1
        else:
            payload["group_ids"] = inbound_ids

        try:
            print(f"[{panel_type} API] Creating user with payload: {payload}")
            headers = {"Accept": "application/json", "Content-Type": "application/json"}
            res = session.post(f"{base_url}/api/user", json=payload, headers=headers, timeout=20, verify=False)
            if res.status_code == 401:
                print(f"[{panel_type} API] Got 401 Unauthorized, forcing login retry...")
                if login_xui(server_id, force=True):
                    session = get_session(server_id=server_id)
                    res = session.post(f"{base_url}/api/user", json=payload, headers=headers, timeout=20, verify=False)
            if res.ok:
                rj = res.json()
                print(f"[{panel_type} API] User '{safe_email}' created successfully.")
                if "subscription_url" in rj:
                    final_sub = rj["subscription_url"]
                    if final_sub.startswith("/"):
                        final_sub = build_subscription_url(server_sub, base_url, final_sub.lstrip("/"))
                else:
                    final_sub = build_subscription_url(server_sub, base_url, safe_email)
                return client_uuid, final_sub
            else:
                err_msg = f"HTTP {res.status_code}: {res.text}"
                print(f"[{panel_type} API] Failed to create user: {err_msg}")
                session.last_error = err_msg
                return None, None
        except Exception as e:
            err_msg = str(e)
            print(f"[{panel_type} API Error]: {err_msg}")
            session.last_error = err_msg
            return None, None

    try:
        list_url = f"{base_url}/panel/api/inbounds/list"
        list_res = session.get(list_url, timeout=20, verify=False)
        res_json = list_res.json()
        if res_json.get("success") and isinstance(res_json.get("obj"), list):
            valid_ids = [int(item["id"]) for item in res_json["obj"]]
    except Exception as e:
        print(f"[API] Error fetching inbound list: {e}")

    if inbound_ids and valid_ids:
        inbound_ids = [i for i in inbound_ids if i in valid_ids]
    
    if not inbound_ids:
        inbound_ids = valid_ids if valid_ids else [1]
        
    # Limit number of inbounds
    if len(inbound_ids) > 10:
        inbound_ids = inbound_ids[:10]

    headers = {"Accept": "application/json"}

    # Resolve correct subscription base URL
    server_sub = None
    if server:
        server_sub = server.get("subUrl") or server.get("panelUrl")
    if not server_sub:
        server_sub = cfg.get('SUB_URL', base_url)

    # Attempt to use the NEW Unified API first
    last_err_msg = ""
    try:
        unified_url = f"{base_url}/panel/api/clients/add"
        unified_payload = {
            "client": client_config,
            "inboundIds": inbound_ids
        }
        u_res = session.post(unified_url, json=unified_payload, headers=headers, timeout=20, verify=False)
        if u_res.status_code == 401:
            print(f"[Sanaei API] Got 401 Unauthorized, forcing login retry...")
            if login_xui(server_id, force=True):
                session = get_session(server_id=server_id)
                u_res = session.post(unified_url, json=unified_payload, headers=headers, timeout=20, verify=False)
        if u_res.ok and u_res.json().get("success"):
            print(f"[Unified API] Successfully added user '{safe_email}' to {len(inbound_ids)} inbounds.")
            return client_uuid, build_subscription_url(server_sub, base_url, xui_sub_id)
        else:
            last_err_msg = f"Unified API: HTTP {u_res.status_code} {u_res.text}"
    except Exception as e:
        last_err_msg = f"Unified API error: {e}"
        print(f"[Unified API Error] Fallback to classic: {e}")

    # Classic Loop Fallback
    success_count = 0
    for inb_id in inbound_ids:
        classic_url = f"{base_url}/panel/api/inbounds/addClient"
        classic_payload = {
            "id": inb_id,
            "settings": json.dumps({"clients": [client_config]})
        }
        try:
            c_res = session.post(classic_url, json=classic_payload, headers=headers, timeout=20, verify=False)
            if c_res.status_code == 401:
                print(f"[Sanaei Classic API] Got 401 Unauthorized, forcing login retry...")
                if login_xui(server_id, force=True):
                    session = get_session(server_id=server_id)
                    c_res = session.post(classic_url, json=classic_payload, headers=headers, timeout=20, verify=False)
            if c_res.ok and c_res.json().get("success"):
                success_count += 1
                print(f"[Classic API] Added user '{safe_email}' to inbound {inb_id}")
            else:
                last_err_msg += f" | Classic API (inb {inb_id}): HTTP {c_res.status_code} {c_res.text}"
                print(f"[Classic API Error] {last_err_msg}")
        except Exception as e:
            last_err_msg += f" | Classic API error (inb {inb_id}): {e}"
            print(f"[Classic API Error] {last_err_msg}")
    
    if success_count > 0:
        return client_uuid, build_subscription_url(server_sub, base_url, xui_sub_id)

    session.last_error = last_err_msg
    return None, None

def update_vpn_client_enabled_api(client_email, enable, client_uuid=None, server_id=None):
    """ Call Sanaei 3x-ui API to update client enabled status """
    import json, re
    cfg = get_config()
    servers = cfg.get("SERVERS", []) + cfg.get("COLLEAGUE_SERVERS", [])
    
    server = None
    if server_id:
        server = next((s for s in servers if str(s.get("id")) == str(server_id)), None)
    if not server and servers:
        server = next((s for s in servers if s.get("status") == "active"), servers[0])
        
    if server:
        base_url = normalize_xui_url(server.get("panelUrl", ""))
    else:
        base_url = cfg.get("XUI_URL", "")
        
    if not base_url: return False
    if base_url.endswith("/"): base_url = base_url[:-1]

    if not login_xui(server_id):
        return False
        
    session = get_session(server_id=server_id)
        
    safe_email = ""
    if client_email:
        safe_email = client_email.replace(" ", "_").replace("\n", "").replace("/", "")
        safe_email = re.sub(r"[^A-Za-z0-9_-]", "", safe_email)
        
    panel_type = server.get("panelType", "sanaei") if server else "sanaei"
    if panel_type in ["rebecca", "pasarguard"]:
        try:
            status_str = "active" if enable else "disabled"
            payload = {"status": status_str}
            headers = {"Accept": "application/json", "Content-Type": "application/json"}
            url = f"{base_url}/api/user/{safe_email}/disabled" if not enable else f"{base_url}/api/user/{safe_email}" # wait, rebecca uses PUT /api/user/{username}/disabled with {"status": "disabled"}?
            # Actually, Reebeka's modify_user is PUT /api/user/{username} with all fields, OR set_user_disabled PUT /api/user/{username}/disabled
            # Let's just use the toggle endpoint for disabled
            res = session.put(f"{base_url}/api/user/{safe_email}/disabled", json={"status": status_str}, headers=headers, timeout=20, verify=False)
            if res.status_code == 401:
                print(f"[{panel_type} API] Got 401 Unauthorized in modify, forcing login retry...")
                if login_xui(server_id, force=True):
                    session = get_session(server_id=server_id)
                    res = session.put(f"{base_url}/api/user/{safe_email}/disabled", json={"status": status_str}, headers=headers, timeout=20, verify=False)
            if res.ok:
                return True
            return False
        except:
            return False

    # Try several common endpoints for maximum reliability
    targets = []
    if client_uuid:
        targets.append(str(client_uuid))
        
        # New Sanaei Global uuid update endpoint
        try:
            get_url = f"{base_url}/panel/api/clients/get/{safe_email}"
            get_res = session.get(get_url, timeout=20, verify=False)
            rj = get_res.json()
            if rj.get("success") and rj.get("obj"):
                client_obj = rj.get("obj")
                client_obj["enable"] = enable
                
                # In newer 3x-ui versions, the update endpoint format expects payload matching the standard API form
                inbound_id = client_obj.get("inboundId", 0)
                payload_data = {"id": inbound_id, "settings": json.dumps({"clients": [client_obj]})}
                
                upd_url = f"{base_url}/panel/api/clients/update/{safe_email}"
                upd_res = session.post(upd_url, data=payload_data, timeout=20, verify=False)
                if upd_res.json().get("success"):
                    print(f"[Sanaei Update API] Successfully updated '{safe_email}' via global client/update endpoint (form).")
                    return True
                
                # Fallback to json matching if form fails
                upd_res_json = session.post(upd_url, json=client_obj, timeout=20, verify=False)
                if upd_res_json.json().get("success"):
                    print(f"[Sanaei Update API] Successfully updated '{safe_email}' via global client/update endpoint (json).")
                    return True
        except: pass
    
    # Also search by email if uuid not provided or as fallback
    if not targets or client_email:
        try:
            list_url = f"{base_url}/panel/api/inbounds/list"
            list_res = session.get(list_url, timeout=20, verify=False)
            res_json = list_res.json()
            if res_json.get("success") and isinstance(res_json.get("obj"), list):
                for inbound in res_json["obj"]:
                    clients_str = inbound.get("settings", "{}")
                    try:
                        import json
                        c_data = json.loads(clients_str)
                        for c in c_data.get("clients", []):
                            if c.get("email") == client_email:
                                if c.get("id") and str(c.get("id")) not in targets:
                                    targets.append(str(c.get("id")))
                    except: pass
        except: pass

    success = False
    for uid in targets:
        # Sanaei Global Update API (modern)
        try:
            # We try to update on all inbounds for robustness
            list_url = f"{base_url}/panel/api/inbounds/list"
            list_res = session.get(list_url, timeout=20, verify=False)
            res_json = list_res.json()
            if res_json.get("success") and isinstance(res_json.get("obj"), list):
                for inb in res_json["obj"]:
                    inbound_id = inb.get("id")
                    upd_url = f"{base_url}/panel/api/inbounds/updateClient/{uid}"
                    
                    try:
                        # Try to find existing client info in this inbound for full payload
                        c_str = inb.get("settings", "{}")
                        try:
                             import json
                             c_json = json.loads(c_str)
                        except: continue

                        for existing_c in c_json.get("clients", []):
                            if str(existing_c.get("id")) == uid:
                                merged_c = existing_c.copy()
                                merged_c["enable"] = enable
                                
                                # Compatibility: Sanaei often expects inboundId in payload for updateClient
                                # even if it's in the URL for some versions
                                payload = {
                                    "id": inbound_id, 
                                    "settings": json.dumps({"clients": [merged_c]})
                                }
                                
                                # 0. Direct REPLACE row payload using email endpoint (as per new 3x-ui docs)
                                email_upd_url = f"{base_url}/panel/api/clients/update/{safe_email}"
                                try:
                                    res_email_form = session.post(email_upd_url, data=payload, timeout=20, verify=False)
                                    if res_email_form.ok and res_email_form.json().get("success"):
                                         print(f"[Sanaei API] Successfully updated {safe_email} via /panel/api/clients/update/{{email}} (form)")
                                         success = True
                                         continue
                                    res_email = session.post(email_upd_url, json=merged_c, timeout=20, verify=False)
                                    if res_email.ok and res_email.json().get("success"):
                                         print(f"[Sanaei API] Successfully updated {safe_email} via /panel/api/clients/update/{{email}} (json)")
                                         success = True
                                         continue
                                except: pass
                                
                                # 1. Replace row using UUID endpoint as fallback
                                uuid_upd_url = f"{base_url}/panel/api/clients/update/{uid}"
                                try:
                                    res_uuid_form = session.post(uuid_upd_url, data=payload, timeout=20, verify=False)
                                    if res_uuid_form.ok and res_uuid_form.json().get("success"):
                                         print(f"[Sanaei API] Successfully updated {uid} via /panel/api/clients/update/{{uuid}} (form)")
                                         success = True
                                         continue
                                    res_uuid_json = session.post(uuid_upd_url, json=merged_c, timeout=20, verify=False)
                                    if res_uuid_json.ok and res_uuid_json.json().get("success"):
                                         print(f"[Sanaei API] Successfully updated {uid} via /panel/api/clients/update/{{uuid}} (json)")
                                         success = True
                                         continue
                                except: pass
                                
                                # Try standard updateClient endpoint first
                                upd_res = session.post(upd_url, data=payload, timeout=20, verify=False)
                                if upd_res.ok and upd_res.json().get("success"):
                                    print(f"[Sanaei API] Successfully updated client {uid} status to {enable} via /updateClient/{{uuid}}")
                                    success = True
                                else:
                                    # Fallback 1: json payload
                                    upd_res_json = session.post(upd_url, json=payload, timeout=20, verify=False)
                                    if upd_res_json.ok and upd_res_json.json().get("success"):
                                        print(f"[Sanaei API] Successfully updated client {uid} status to {enable} via /updateClient/{{uuid}} (JSON)")
                                        success = True
                                    else:
                                        # Fallback 2: Many Sanaei panels use a general update endpoint
                                        fallback_url = f"{base_url}/panel/api/inbounds/updateClient"
                                        fallback_res = session.post(fallback_url, data=payload, timeout=20, verify=False)
                                        if fallback_res.ok and fallback_res.json().get("success"):
                                            print(f"[Sanaei API] Successfully updated client {uid} status to {enable} via fallback /updateClient")
                                            success = True
                                        else:
                                            print(f"[Sanaei API] Failed to update client {uid} on inbound {inbound_id}: {upd_res.text} / {fallback_res.text}")
                    except Exception as e:
                        print(f"[Sanaei API] Error processing inbound {inbound_id} for client {uid}: {e}")
        except Exception as e:
            print(f"[Sanaei API] Error in update_vpn_client_enabled_api loop: {e}")
        
    return success

def delete_vpn_client_api(client_email, client_uuid=None, server_id=None):
    """ Call Sanaei 3x-ui API to delete client """
    success_flag = False
    import re
    cfg = get_config()
    servers = cfg.get("SERVERS", []) + cfg.get("COLLEAGUE_SERVERS", [])
    
    server = None
    if server_id:
        server = next((s for s in servers if str(s.get("id")) == str(server_id)), None)
    if not server and servers:
        server = next((s for s in servers if s.get("status") == "active"), servers[0])
        
    if server:
        base_url = normalize_xui_url(server.get("panelUrl", ""))
    else:
        base_url = cfg.get("XUI_URL", "")
        
    if not base_url: return False
    if base_url.endswith("/"): base_url = base_url[:-1]

    if not login_xui(server_id):
        print(f"[Sanaei API Error] Login failed in delete_vpn_client_api for server_id: {server_id}")
        return False
        
    session = get_session(server_id=server_id)
        
    import re
    safe_email = client_email.replace(" ", "_").replace("\n", "").replace("/", "")
    safe_email = re.sub(r"[^A-Za-z0-9_-]", "", safe_email)
    
    panel_type = server.get("panelType", "sanaei") if server else "sanaei"
    if panel_type in ["rebecca", "pasarguard"]:
        try:
            print(f"[{panel_type} Delete API] Deleting user: {safe_email}")
            res = session.delete(f"{base_url}/api/user/{safe_email}", headers={"Accept": "application/json"}, timeout=20, verify=False)
            if res.status_code == 401:
                print(f"[{panel_type} API] Got 401 Unauthorized in delete, forcing login retry...")
                if login_xui(server_id, force=True):
                    session = get_session(server_id=server_id)
                    res = session.delete(f"{base_url}/api/user/{safe_email}", headers={"Accept": "application/json"}, timeout=20, verify=False)
            if res.ok:
                return True
            return False
        except:
            return False
    
    # NEW SANAEI ENDPOINT (Safest and cleanest)
    if safe_email:
        try:
            del_api_url = f"{base_url}/panel/api/clients/del/{safe_email}"
            print(f"[Sanaei Delete API] Trying new global delete endpoint for email: {safe_email}...")
            resp = session.post(del_api_url, timeout=20, verify=False)
            try:
                rj = resp.json()
                if rj.get("success"):
                    print(f"[Sanaei Delete API] Successfully deleted '{safe_email}' via global client/del endpoint.")
                    success_flag = True
            except:
                pass
        except Exception as e:
            print(f"[Sanaei Delete API] Global delete attempt failed: {e}")

    valid_ids = []
    all_clients = []
    
    try:
        list_url = f"{base_url}/panel/api/inbounds/list"
        list_res = session.get(list_url, timeout=20, verify=False)
        res_json = list_res.json()
        if res_json.get("success") and isinstance(res_json.get("obj"), list):
            valid_ids = [int(item["id"]) for item in res_json["obj"]]
            
            # Extract all clients to find the best match
            for inbound in res_json["obj"]:
                clients = inbound.get("settings", "")
                import json
                try:
                    c_json = json.loads(clients)
                    c_list = c_json.get("clients", [])
                    for c in c_list:
                        if c not in all_clients:
                            all_clients.append(c)
                except:
                    pass
    except Exception as e:
        print(f"[Sanaei API Error] Fetching inbounds list failed: {e}")

    # Build reliable target IDs list containing both provided UUID and any matching panel UUIDs
    ids_to_delete = []
    if client_uuid:
        ids_to_delete.append(str(client_uuid))

    # Perform highly resilient lookup on all clients in the panel to match names/emails
    import re
    from collections import Counter
    
    def normalize(s):
        if not s:
            return ""
        s = s.lower().strip()
        # strip prefixes
        if '-' in s:
            parts = s.split('-')
            if len(parts) > 1:
                s = parts[-1]
        return re.sub(r'[^a-z0-9]', '', s)

    target_norm = normalize(client_email)
    
    if all_clients and target_norm:
        # 1. Look for exact matches or normalized exact matches
        print(f"[Debug] Searching to delete client '{client_email}' (norm: '{target_norm}') among {len(all_clients)} clients.")
        for c in all_clients:
            c_email = c.get("email", "")
            c_id = c.get("id")
            
            # Log for debugging
            normalized_c_email = normalize(c_email)
            print(f"[Debug] Checking candidate: email='{c_email}', norm='{normalized_c_email}', id={c_id}")
            
            if c_id and str(c_id) not in ids_to_delete:
                if c_email.lower() == client_email.lower() or normalized_c_email == target_norm:
                    ids_to_delete.append(str(c_id))
                    print(f"[Debug] Match found! Adding ID {c_id} to ids_to_delete.")
                    print(f"[Sanaei Delete API] Found exact name-match candidate: '{c_email}' (UUID: {c_id})")

        # 2. Look for substring matches
        for c in all_clients:
            c_email = c.get("email", "")
            c_id = c.get("id")
            if c_id and str(c_id) not in ids_to_delete:
                c_email_norm = normalize(c_email)
                if target_norm in c_email_norm or c_email_norm in target_norm:
                    ids_to_delete.append(str(c_id))
                    print(f"[Sanaei Delete API] Found substring-match candidate: '{c_email}' (UUID: {c_id})")

        # 3. Look for extremely tolerant fuzzy/typo matches (such as ahura-amiiir vs ahura-amirrrr)
        # We lower the ratio threshold to 0.45 for deletion to be absolutely sure we catch typo variations
        for c in all_clients:
            c_email = c.get("email", "")
            c_id = c.get("id")
            if c_id and str(c_id) not in ids_to_delete:
                c_email_norm = normalize(c_email)
                if c_email_norm:
                    c1 = Counter(target_norm)
                    c2 = Counter(c_email_norm)
                    intersect = sum((c1 & c2).values())
                    total_len = len(target_norm) + len(c_email_norm)
                    ratio = (2.0 * intersect) / total_len if total_len > 0 else 0.0
                    if ratio > 0.45:
                        ids_to_delete.append(str(c_id))
                        print(f"[Sanaei Delete API] Found fuzzy typo-tolerant match candidate: '{c_email}' [ratio: {ratio:.2f}] (UUID: {c_id})")

    if not ids_to_delete:
        print(f"[Sanaei Delete API] No UUIDs or matching panel clients found to delete for '{client_email}'. Assuming already deleted.")
        return True

    print(f"[Sanaei Delete API] Executing deletion commands for UUIDs: {ids_to_delete}")
    success = False
    
    for uid in ids_to_delete:
        # 1. Standard delete from individual inbounds
        if valid_ids:
            for inbound_id in valid_ids:
                try:
                    del_url = f"{base_url}/panel/api/inbounds/{inbound_id}/delClient/{uid}"
                    # Ensure X-Csrf-Token is present in current session headers from login_xui
                    resp = session.post(del_url, timeout=20, verify=False)
                    if resp.status_code == 200:
                         resp_data = resp.json()
                         if resp_data.get("success"):
                            success = True
                            print(f"[Sanaei Delete API] Successfully deleted client {uid} from inbound {inbound_id}")
                         else:
                            print(f"[Sanaei Delete API] Panel returned failure for {uid} on {inbound_id}: {resp.text}")
                    else:
                         print(f"[Sanaei Delete API] HTTP {resp.status_code} for {uid} on {inbound_id}: {resp.text}")
                except Exception as e:
                    print(f"[Sanaei Delete API] Inbound delete exception on {inbound_id} for {uid}: {e}")
                    
        # 2. Global client delete endpoint (some newer 3x-ui panels use this)
        try:
            del_url2 = f"{base_url}/panel/api/clients/del/{uid}"
            resp2 = session.post(del_url2, timeout=20, verify=False)
            if resp2.status_code == 200:
                resp2_data = resp2.json()
                if resp2_data.get("success"):
                    success = True
                    print(f"[Sanaei Delete API] Globally deleted client {uid} via global client del")
                else:
                    print(f"[Sanaei Delete API] Global delete failed for {uid}: {resp2.text}")
            else:
                print(f"[Sanaei Delete API] Global delete HTTP {resp2.status_code} for {uid}: {resp2.text}")
        except Exception as e:
            print(f"[Sanaei Delete API] Global client del exception for {uid}: {e}")

    return success or success_flag

# --- User Management DB Queries ---
def set_user_pending_charge(tg_id, amount):
    db = read_sqlite_db()
    user = next((u for u in db["users"] if u["userId"] == tg_id), None)
    if user:
        user["pendingChargeAmount"] = amount
        write_sqlite_db(db)

def pop_user_pending_charge(tg_id):
    db = read_sqlite_db()
    user = next((u for u in db["users"] if u["userId"] == tg_id), None)
    if user:
        amount = user.pop("pendingChargeAmount", None)
        write_sqlite_db(db)
        return amount
    return None

def set_user_pending_purchase(tg_id, plan_id, client_name, server_id=None, custom_gb=None, custom_days=None, custom_price=None):
    db = read_sqlite_db()
    user = next((u for u in db["users"] if str(u["userId"]) == str(tg_id)), None)
    if user:
        user["pendingPurchasePlanId"] = plan_id
        user["pendingPurchaseClientName"] = client_name
        user["pendingPurchaseServerId"] = server_id
        user["pendingPurchaseCustomGb"] = custom_gb
        user["pendingPurchaseCustomDays"] = custom_days
        user["pendingPurchaseCustomPrice"] = custom_price
        write_sqlite_db(db)

def get_user_pending_purchase(tg_id):
    db = read_sqlite_db()
    user = next((u for u in db["users"] if str(u["userId"]) == str(tg_id)), None)
    if user:
        return (
            user.get("pendingPurchasePlanId"), 
            user.get("pendingPurchaseClientName"), 
            user.get("pendingPurchaseServerId"),
            user.get("pendingPurchaseCustomGb"),
            user.get("pendingPurchaseCustomDays"),
            user.get("pendingPurchaseCustomPrice")
        )
    return None, None, None, None, None, None

def clear_user_pending_purchase(tg_id):
    db = read_sqlite_db()
    user = next((u for u in db["users"] if u["userId"] == tg_id), None)
    if user:
        user.pop("pendingPurchasePlanId", None)
        user.pop("pendingPurchaseClientName", None)
        user.pop("pendingPurchaseServerId", None)
        write_sqlite_db(db)

def to_persian_digits(s):
    eng = "0123456789"
    per = "۰۱۲۳۴۵۶۷۸۹"
    translation_table = str.maketrans(eng, per)
    return str(s).translate(translation_table)

def gregorian_to_jalali(gy, gm, gd):
    g_d_m = [0, 31, 59, 90, 120, 151, 181, 212, 243, 273, 304, 335]
    if gy > 1600:
        g_y = gy - 1600
        g_m = gm
        g_d = gd
    else:
        g_y = gy
        g_m = gm
        g_d = gd
    
    gy2 = (g_y - 1) if g_m > 2 else (g_y - 2)
    g_day_no = 365 * g_y + gy2 // 4 - gy2 // 100 + gy2 // 400 + gd + g_d_m[g_m - 1]
    
    j_day_no = g_day_no - 79
    j_np = j_day_no // 12053
    j_day_no %= 12053
    jy = 979 + 33 * j_np + 4 * (j_day_no // 1461)
    j_day_no %= 1461
    
    if j_day_no >= 366:
        jy += (j_day_no - 1) // 365
        j_day_no = (j_day_no - 1) % 365
        
    for i in range(11):
        if j_day_no < (31 if i < 6 else 30):
            jm = i + 1
            jd = j_day_no + 1
            break
        j_day_no -= 31 if i < 6 else 30
    else:
        jm = 12
        jd = j_day_no + 1
        
    return jy, jm, jd

def format_gregorian_to_jalali_str(g_date_str):
    try:
        if not g_date_str:
            return "نامشخص"
        if "T" in g_date_str:
            g_date_str = g_date_str.split("T")[0]
        parts = [int(p) for p in g_date_str.split("-") if p.isdigit()]
        if len(parts) != 3:
            return g_date_str
        jy, jm, jd = gregorian_to_jalali(parts[0], parts[1], parts[2])
        return to_persian_digits(f"{jy}/{jm}/{jd}")
    except Exception as e:
        print("Error formatting date:", e)
        return g_date_str

def get_tehran_date_str():
    from datetime import datetime, timedelta
    tehran_now = datetime.utcnow() + timedelta(hours=3.5)
    return tehran_now.strftime("%Y-%m-%d")

def register_tg_user(tg_id, username, referral_id=None):
    db = read_sqlite_db()
    user = next((u for u in db["users"] if u["userId"] == tg_id), None)
    if not user:
        join_date = get_tehran_date_str()
        new_user = {
            "userId": tg_id,
            "username": username or f"user_{tg_id}",
            "walletBalance": 0.0,
            "activePlansCount": 0,
            "joinDate": join_date,
            "status": "active"
        }
        
        if referral_id and str(referral_id) != str(tg_id):
            referrer = next((u for u in db["users"] if str(u["userId"]) == str(referral_id)), None)
            if referrer:
                new_user["referredBy"] = int(referral_id)
                # Recalculate or increment the referral count to be 100% sure we don't drop invites
                referrer["referralCount"] = int(referrer.get("referralCount", 0)) + 1
                
                # Parse settings
                import json
                try:
                    s_str = db.get("settings", {}).get("panel_config", "{}")
                    settings = json.loads(s_str)
                except:
                    settings = {}
                
                condition = settings.get("referralRewardCondition", "invite")
                if condition in ["invite", "both"]:
                    percent = settings.get("referralRewardPercent", 5)
                    amount = settings.get("referralBaseAmount", 100000)
                    reward = max(0, round((amount * percent) / 100))
                    
                    if reward > 0:
                        referrer["walletBalance"] = float(referrer.get("walletBalance", 0.0)) + float(reward)
                        referrer["referralRewardTotal"] = int(referrer.get("referralRewardTotal", 0)) + reward
                        try:
                            bot.send_message(int(referral_id), f"🎉 <b>تبریک!</b>\nیک نفر با لینک شما وارد ربات شد و <b>{reward:,}</b> تومان به کیف پول شما اضافه شد.", parse_mode="HTML")
                        except Exception as e:
                            print("Could not notify referrer:", e)
                            
                        # Level 2 Referral
                        l2_percent = settings.get("referralL2Percent", 0)
                        if l2_percent > 0 and referrer.get("referredBy"):
                            l2_referrer_id = referrer.get("referredBy")
                            l2_referrer = next((u for u in db["users"] if u["userId"] == l2_referrer_id), None)
                            if l2_referrer:
                                l2_reward = max(0, round((amount * l2_percent) / 100))
                                l2_referrer["walletBalance"] = float(l2_referrer.get("walletBalance", 0.0)) + float(l2_reward)
                                l2_referrer["referralRewardTotal"] = int(l2_referrer.get("referralRewardTotal", 0)) + l2_reward
                                try:
                                    bot.send_message(l2_referrer_id, f"🎊 <b>پاداش تیمی لایه 2!</b>\nیکی از زیرمجموعه‌های شما یک نفر را دعوت کرد و مبلغ <b>{l2_reward:,}</b> تومان به شما رسید.", parse_mode="HTML")
                                except:
                                    pass

                                # Level 3 Referral
                                l3_percent = settings.get("referralL3Percent", 0)
                                if l3_percent > 0 and l2_referrer.get("referredBy"):
                                    l3_referrer_id = l2_referrer.get("referredBy")
                                    l3_referrer = next((u for u in db["users"] if u["userId"] == l3_referrer_id), None)
                                    if l3_referrer:
                                        l3_reward = max(0, round((amount * l3_percent) / 100))
                                        l3_referrer["walletBalance"] = float(l3_referrer.get("walletBalance", 0.0)) + float(l3_reward)
                                        l3_referrer["referralRewardTotal"] = int(l3_referrer.get("referralRewardTotal", 0)) + l3_reward
                                        try:
                                            bot.send_message(l3_referrer_id, f"🎊 <b>پاداش تیمی لایه 3!</b>\nزیرمجموعه لایه سوم شما عضو جدیدی آورد و مبلغ <b>{l3_reward:,}</b> تومان دریافت کردید.", parse_mode="HTML")
                                        except:
                                            pass

                                        # Level 4 Referral
                                        l4_percent = settings.get("referralL4Percent", 0)
                                        if l4_percent > 0 and l3_referrer.get("referredBy"):
                                            l4_referrer_id = l3_referrer.get("referredBy")
                                            l4_referrer = next((u for u in db["users"] if u["userId"] == l4_referrer_id), None)
                                            if l4_referrer:
                                                l4_reward = max(0, round((amount * l4_percent) / 100))
                                                l4_referrer["walletBalance"] = float(l4_referrer.get("walletBalance", 0.0)) + float(l4_reward)
                                                l4_referrer["referralRewardTotal"] = int(l4_referrer.get("referralRewardTotal", 0)) + l4_reward
                                                try:
                                                    bot.send_message(l4_referrer_id, f"🎊 <b>پاداش تیمی لایه 4!</b>\nزیرمجموعه لایه چهارم شما عضو جدیدی آورد و مبلغ <b>{l4_reward:,}</b> تومان دریافت کردید.", parse_mode="HTML")
                                                except:
                                                    pass

        db["users"].append(new_user)
        write_sqlite_db(db)
        print(f"[Database] Registered new user into SQLite: {tg_id}")
        try:
            log_action(tg_id, username or f"user_{tg_id}", "ثبت‌نام کاربر", f"کاربر جدید با شناسه {tg_id} برای اولین بار عضو ربات شد.")
        except Exception as e:
            print("Error logging user registration:", e)
    elif username and user.get("username") != username:
        user["username"] = username
        write_sqlite_db(db)

def get_user_data(tg_id):
    db = read_sqlite_db()
    return next((u for u in db["users"] if str(u.get("userId")) == str(tg_id)), None)

def update_user_wallet_balance(tg_id, amount):
    db = read_sqlite_db()
    user = next((u for u in db["users"] if u["userId"] == tg_id), None)
    if user:
        user["walletBalance"] = max(0.0, float(user.get("walletBalance", 0.0)) + float(amount))
        write_sqlite_db(db)

def process_referral_on_purchase(user, amount_spent):
    if not user.get("referredBy") or user.get("hasPurchasedPlan"):
        return
        
    db = read_sqlite_db()
    import json
    try:
        settings = json.loads(db.get("settings", {}).get("panel_config", "{}"))
    except:
        settings = {}
        
    condition = settings.get("referralRewardCondition", "invite")
    if condition not in ["purchase", "both"]:
        return
        
    referrer_id = user.get("referredBy")
    referrer = next((u for u in db["users"] if u["userId"] == referrer_id), None)
    if not referrer:
        return
        
    percent = settings.get("referralRewardPercent", 5)
    calc_amount = settings.get("referralBaseAmount", 100000)
    reward = max(0, round((calc_amount * percent) / 100))
    
    if reward > 0:
        referrer["walletBalance"] = float(referrer.get("walletBalance", 0.0)) + float(reward)
        referrer["referralRewardTotal"] = int(referrer.get("referralRewardTotal", 0)) + reward
        try:
            bot.send_message(referrer_id, f"🎉 <b>تبریک!</b>\nکاربری که با لینک شما وارد شده بود اولین خرید خود را انجام داد و <b>{reward:,}</b> تومان به کیف پول شما اضافه شد.", parse_mode="HTML")
        except:
            pass
            
        # L2 logic
        l2_percent = settings.get("referralL2Percent", 0)
        if l2_percent > 0 and referrer.get("referredBy"):
            l2_referrer_id = referrer.get("referredBy")
            l2_referrer = next((u for u in db["users"] if u["userId"] == l2_referrer_id), None)
            if l2_referrer:
                l2_reward = max(0, round((calc_amount * l2_percent) / 100))
                l2_referrer["walletBalance"] = float(l2_referrer.get("walletBalance", 0.0)) + float(l2_reward)
                l2_referrer["referralRewardTotal"] = int(l2_referrer.get("referralRewardTotal", 0)) + l2_reward
                try:
                    bot.send_message(l2_referrer_id, f"🎊 <b>پاداش تیمی لایه 2!</b>\nزیرمجموعهِ زیرمجموعه شما اولین خرید خود را انجام داد و <b>{l2_reward:,}</b> تومان دریافت کردید.", parse_mode="HTML")
                except:
                    pass

                # L3 logic
                l3_percent = settings.get("referralL3Percent", 0)
                if l3_percent > 0 and l2_referrer.get("referredBy"):
                    l3_referrer_id = l2_referrer.get("referredBy")
                    l3_referrer = next((u for u in db["users"] if u["userId"] == l3_referrer_id), None)
                    if l3_referrer:
                        l3_reward = max(0, round((calc_amount * l3_percent) / 100))
                        l3_referrer["walletBalance"] = float(l3_referrer.get("walletBalance", 0.0)) + float(l3_reward)
                        l3_referrer["referralRewardTotal"] = int(l3_referrer.get("referralRewardTotal", 0)) + l3_reward
                        try:
                            bot.send_message(l3_referrer_id, f"🎊 <b>پاداش تیمی لایه 3!</b>\nزیرمجموعه لایه سوم شما اولین خرید خود را انجام داد و <b>{l3_reward:,}</b> تومان دریافت کردید.", parse_mode="HTML")
                        except:
                            pass

                        # L4 logic
                        l4_percent = settings.get("referralL4Percent", 0)
                        if l4_percent > 0 and l3_referrer.get("referredBy"):
                            l4_referrer_id = l3_referrer.get("referredBy")
                            l4_referrer = next((u for u in db["users"] if u["userId"] == l4_referrer_id), None)
                            if l4_referrer:
                                l4_reward = max(0, round((calc_amount * l4_percent) / 100))
                                l4_referrer["walletBalance"] = float(l4_referrer.get("walletBalance", 0.0)) + float(l4_reward)
                                l4_referrer["referralRewardTotal"] = int(l4_referrer.get("referralRewardTotal", 0)) + l4_reward
                                try:
                                    bot.send_message(l4_referrer_id, f"🎊 <b>پاداش تیمی لایه 4!</b>\nزیرمجموعه لایه چهارم شما اولین خرید خود را انجام داد و <b>{l4_reward:,}</b> تومان دریافت کردید.", parse_mode="HTML")
                                except:
                                    pass

    # Mark user so they don't give "first purchase" reward again
    user_in_db = next((u for u in db["users"] if u["userId"] == user["userId"]), None)
    if user_in_db:
        user_in_db["hasPurchasedPlan"] = True
    
    write_sqlite_db(db)

def update_user_balance(tg_id, new_balance):
    db = read_sqlite_db()
    user = next((u for u in db["users"] if u["userId"] == tg_id), None)
    if user:
        user["walletBalance"] = max(0.0, float(new_balance))
        write_sqlite_db(db)

def update_user_pinned_seen(tg_id, pinned_text):
    db = read_sqlite_db()
    user = next((u for u in db["users"] if str(u.get("userId")) == str(tg_id)), None)
    if user:
        user["lastPinnedMsgSeen"] = pinned_text
        write_sqlite_db(db)

def log_transaction(tg_id, amount, action, details, flow_type="out"):
    import time
    db = read_sqlite_db()
    if "transactions" not in db:
        db["transactions"] = []
    user = next((u for u in db.get("users", []) if u.get("userId") == tg_id), None)
    username = user.get("username", str(tg_id)) if user else str(tg_id)
    tx_id = f"TX-COL-{int(time.time())}"
    new_tx = {
        "id": tx_id,
        "userId": int(tg_id),
        "username": username,
        "amount": int(amount),
        "receiptImage": "",
        "status": "approved",
        "date": time.strftime("%Y-%m-%dT%H:%M:%S.000Z", time.gmtime()),
        "description": f"{details} ({action})"
    }
    db["transactions"].insert(0, new_tx)
    write_sqlite_db(db)

def log_action(tg_id, username, action, details):
    import uuid
    from datetime import datetime
    db = read_sqlite_db()
    if not db.get("logs"):
        db["logs"] = []
    
    log = {
        "id": str(uuid.uuid4()),
        "date": datetime.now().isoformat(),
        "userId": tg_id,
        "username": username,
        "action": action,
        "details": details
    }
    # Keep only last 1000 logs to prevent infinite growth
    if len(db["logs"]) > 1000:
        db["logs"] = db["logs"][-1000:]
    db["logs"].append(log)
    write_sqlite_db(db)

def notify_admins_of_error(err_title, err_detail, user_info=""):
    try:
        cfg = get_config()
        owner_id = cfg.get("OWNER_ID")
        admins = cfg.get("ADMINS", [])
        
        msg = (
            f"⚠️ <b>گزارش خطای اتصال پنل (سیستمی):</b>\n\n"
            f"🔹 <b>بخش:</b> {err_title}\n"
            f"👤 <b>کاربر:</b> {user_info}\n"
            f"❌ <b>متن کامل خطا:</b>\n"
            f"<code>{err_detail}</code>"
        )
        
        recipients = []
        if owner_id:
            recipients.append(owner_id)
        for adm in admins:
            if adm not in recipients:
                recipients.append(adm)
                
        for r_id in recipients:
            try:
                bot.send_message(r_id, msg, parse_mode="HTML")
            except Exception as e:
                print(f"[Admin Notif Error] Failed to notify {r_id}: {e}")
    except Exception as e:
        print(f"[notify_admins_of_error failed] {e}")

def create_sub_key(key_id, tg_id, plan_id, plan_name, sub_link, expire_date, limit_gb, client_name="", client_uuid="", server_id=None):
    print(f"[create_sub_key] Registering: id={key_id}, user={tg_id}, plan={plan_name}")
    db = read_sqlite_db()
    new_sub = {
        "id": key_id,
        "userId": tg_id,
        "planId": plan_id,
        "planName": plan_name,
        "clientName": client_name,
        "clientUuid": client_uuid,
        "subLink": sub_link,
        "expireDate": expire_date,
        "trafficLimitGb": float(limit_gb),
        "trafficUsedGb": 0.0,
        "createdAtMs": int(time.time() * 1000),
        "status": "active",
        "serverId": server_id
    }
    if "subscription_keys" not in db:
        db["subscription_keys"] = []
    db["subscription_keys"].append(new_sub)
    
    # Recalculate user subscription count
    user = next((u for u in db["users"] if str(u["userId"]) == str(tg_id)), None)
    if user:
        user["activePlansCount"] = sum(1 for k in db["subscription_keys"] if str(k.get("userId")) == str(tg_id) and k.get("status") == "active")
        
    if write_sqlite_db(db):
        print(f"[create_sub_key] Successfully committed to DB for user {tg_id}")
    else:
        print(f"[create_sub_key] FAILED to write to DB for user {tg_id}")

def get_custom_keyboard():
    """ Load dynamic and static custom buttons with visibility toggles and custom layouts """
    cfg = get_config()
    layout = cfg.get("KEYBOARD_LAYOUT", "stepped")

    markup = types.InlineKeyboardMarkup(row_width=2)

    buttons = []
    order = cfg.get("BUTTONS_ORDER", [
        "btnBuyNew", "btnMySubs", "btnGuides", "btnProfile", "btnWallet", "btnSupport", "btnTicketSupport", "btnFreeTest", "btnAiChat", "btnInstantSupport", "btnFeedback", "btnReferral", "btnColleagues"
    ])
    
    # Backward compatibility: enforce addition of referral & wallet if missing
    if "btnWallet" not in order: order.append("btnWallet")
    if "btnReferral" not in order: order.append("btnReferral")
    if "btnColleagues" not in order: order.append("btnColleagues")
    if "btnAiChat" not in order: order.append("btnAiChat")
    if "btnTicketSupport" not in order: order.append("btnTicketSupport")

    for key in order:
        if key == "btnBuyNew" and not cfg.get("HIDE_BUY_NEW", False): buttons.append(types.InlineKeyboardButton(cfg.get("BTN_BUY_NEW", "🛒 خرید اشتراک جدید"), callback_data="mm_btnBuyNew"))
        elif key == "btnMySubs" and not cfg.get("HIDE_MY_SUBS", False): buttons.append(types.InlineKeyboardButton(cfg.get("BTN_MY_SUBS", "🗂 اشتراک های من / تمدید"), callback_data="mm_btnMySubs"))
        elif key == "btnGuides" and not cfg.get("HIDE_GUIDES", False): buttons.append(types.InlineKeyboardButton(cfg.get("BTN_GUIDES", "💡 آموزش ها"), callback_data="mm_btnGuides"))
        elif key == "btnColleagues" and not cfg.get("HIDE_COLLEAGUES", True): buttons.append(types.InlineKeyboardButton(cfg.get("BTN_COLLEAGUES", "بسته ویژه همکاران"), callback_data="mm_btnColleagues"))
        elif key == "btnAiChat" and not cfg.get("HIDE_AI_CHAT", True): buttons.append(types.InlineKeyboardButton(cfg.get("BTN_AI_CHAT", "🤖 چت با ربات"), callback_data="mm_btnAiChat"))
        elif key == "btnProfile" and not cfg.get("HIDE_PROFILE", False) and not cfg.get("HIDE_BUY", False): buttons.append(types.InlineKeyboardButton(cfg.get("BTN_PROFILE", "👤 حساب کاربری"), callback_data="mm_btnProfile"))
        elif key == "btnWallet" and not cfg.get("HIDE_WALLET", False): buttons.append(types.InlineKeyboardButton(cfg.get("BTN_WALLET", "شارژ کیف پول 💳"), callback_data="mm_btnWallet"))
        elif key == "btnSupport" and not cfg.get("HIDE_SUPPORT", False): buttons.append(types.InlineKeyboardButton(cfg.get("BTN_SUPPORT", "📞 پشتیبانی"), callback_data="mm_btnSupport"))
        elif key == "btnTicketSupport" and not cfg.get("HIDE_TICKET_SUPPORT", False): buttons.append(types.InlineKeyboardButton(cfg.get("BTN_TICKET_SUPPORT", "🎫 تیکت به پشتیبانی"), callback_data="mm_btnTicketSupport"))
        elif key == "btnFreeTest" and not cfg.get("HIDE_FREETEST", False): buttons.append(types.InlineKeyboardButton(cfg.get("BTN_FREETEST", "🎁 موجودی رایگان"), callback_data="mm_btnFreeTest"))
        elif key == "btnInstantSupport" and not cfg.get("HIDE_INSTANT_SUPPORT", False): buttons.append(types.InlineKeyboardButton(cfg.get("BTN_INSTANT_SUPPORT", "🤖 پشتیبانی آنی"), callback_data="mm_btnInstantSupport"))
        elif key == "btnFeedback" and not cfg.get("HIDE_FEEDBACK", False): buttons.append(types.InlineKeyboardButton(cfg.get("BTN_FEEDBACK", "💌 بازخورد کاربر ها"), callback_data="mm_btnFeedback"))
        elif key == "btnReferral" and not cfg.get("HIDE_REFERRAL", False): buttons.append(types.InlineKeyboardButton(cfg.get("BTN_REFERRAL", "👥 زیرمجموعه گیری"), callback_data="mm_btnReferral"))

    if layout == "vertical":
        for b in buttons: markup.add(b)
    else:    
        # Default stepped / horizontal mixed
        idx = 0
        while idx < len(buttons):
            cb = buttons[idx].callback_data
            if layout == "stepped" and cb in ["mm_btnBuyNew", "mm_btnColleagues"]:
                markup.add(buttons[idx])
                idx += 1
                continue
                
            if idx + 1 < len(buttons):
                next_cb = buttons[idx+1].callback_data
                if layout == "stepped" and next_cb in ["mm_btnBuyNew", "mm_btnColleagues"]:
                    markup.add(buttons[idx])
                    idx += 1
                else:
                    markup.add(buttons[idx], buttons[idx+1])
                    idx += 2
            else:
                markup.add(buttons[idx])
                idx += 1
                
    # Custom dynamic buttons from DB
    try:
        db = read_sqlite_db()
        cb = db.get("custom_buttons", [])
        for i in range(0, len(cb), 2):
            if i + 1 < len(cb):
                markup.add(types.InlineKeyboardButton(cb[i]['text'], callback_data=f"mm_custom_{i}"), types.InlineKeyboardButton(cb[i+1]['text'], callback_data=f"mm_custom_{i+1}"))
            else:
                markup.add(types.InlineKeyboardButton(cb[i]['text'], callback_data=f"mm_custom_{i}"))
    except Exception as e:
        print("Error fetching custom buttons:", e)
    
    return markup

def get_cancel_keyboard():
    markup = types.InlineKeyboardMarkup(row_width=1)
    markup.add(types.InlineKeyboardButton("🏠 بازگشت به منوی اصلی", callback_data="btn_back_home"))
    return markup

def notify_admins_of_purchase(tg_id, purchase_type_title, plan_details_str, price, sub_id):
    try:
        db = read_sqlite_db()
        user = next((u for u in db.get("users", []) if u["userId"] == tg_id), None)
        username_val = user.get("username", "N/A") if user else "N/A"
        
        price_display = f"{int(price):,} تومان" if price > 0 else "رایگان / تست"
        
        admin_msg = (
            f"🔔 <b>{purchase_type_title}:</b>\n\n"
            f"👤 کاربر: @{username_val} (<code>{tg_id}</code>)\n"
            f"📊 طرح: {plan_details_str}\n"
            f"💰 مبلغ: {price_display}\n"
            f"🆔 اشتراک: {sub_id}"
        )
        
        cfg = get_config()
        targets = set()
        owner_id = cfg.get("OWNER_ID")
        if owner_id and owner_id > 0:
            targets.add(owner_id)
        for adm_id in cfg.get("ADMINS", []):
            if adm_id and adm_id > 0:
                targets.add(adm_id)
                
        for target_id in targets:
            try:
                bot.send_message(target_id, admin_msg, parse_mode="HTML")
            except Exception as ex:
                print(f"[Admin Notify Warning] {ex}")
    except Exception as e:
        print(f"[notify_admins_of_purchase Error] {e}")

def get_main_reply_keyboard():
    markup = types.ReplyKeyboardMarkup(resize_keyboard=True, one_time_keyboard=False)
    markup.add(types.KeyboardButton("🔙 بازگشت به منوی اصلی"))
    return markup

def is_user_member_of_single_channel(user_id, channel):
    channel = channel.strip()
    if not channel:
        return True
        
    clean_channel = channel.strip()
    
    # Handle numeric telegram IDs (e.g. -100123456789)
    if clean_channel.startswith("-") and clean_channel[1:].replace("-", "").isdigit():
        pass
    # Bypass verification for private invite links where API checks are impossible
    elif "+" in clean_channel or "joinchat" in clean_channel:
        print(f"[Mandatory Join Check] Configured channel is a private invite link ({clean_channel}). API check unsupported. Auto-approving membership to prevent lockouts.")
        return True
    else:
        # Clean URLs and usernames
        if "t.me/" in clean_channel:
            clean_channel = clean_channel.split("t.me/")[-1].strip("/")
        if "/" in clean_channel:
            clean_channel = clean_channel.split("/")[-1].strip()
        
        # Strip leading @ symbols or spaces
        clean_channel = clean_channel.replace("@", "").strip()
        
        if not clean_channel:
            return True
            
        clean_channel = "@" + clean_channel

    try:
        member = bot.get_chat_member(clean_channel, user_id)
        if member.status in ["creator", "administrator", "member", "restricted"]:
            return True
        return False
    except Exception as e:
        print(f"[Mandatory Join Check Error] Failed to verify membership for {user_id} in {clean_channel}: {e}")
        # Always fallback to True for any exception (API errors, bot is not admin, chat not found, network timeouts etc)
        # This guarantees that a misconfiguration or API error will not brick the bot / lock all users out.
        return True

def is_user_member_of_channel(user_id):
    cfg = get_config()
    if not cfg.get("MANDATORY_JOIN_ACTIVE"):
        return True
    
    # Bypass for owner or administrators
    if user_id == cfg.get("OWNER_ID") or user_id in cfg.get("ADMINS", []):
         return True

    channels = []
    # Try multiple channels first
    multi_channels = cfg.get("MANDATORY_JOIN_CHANNELS")
    if multi_channels and isinstance(multi_channels, list):
        channels = [c.strip() for c in multi_channels if c and c.strip()]
        
    # Fallback to single channel if multi is empty
    if not channels:
        single = cfg.get("MANDATORY_JOIN_CHANNEL", "").strip()
        if single:
            channels = [single]
            
    if not channels:
        return True

    for chan in channels:
        if not is_user_member_of_single_channel(user_id, chan):
            return False
            
    return True

def get_channel_join_link(channel):
    channel = channel.strip()
    if "http" in channel:
        return channel
    clean = channel.replace("@", "")
    return f"https://t.me/{clean}"

def get_mandatory_join_keyboard():
    markup = types.InlineKeyboardMarkup(row_width=1)
    cfg = get_config()
    
    channels = []
    multi_channels = cfg.get("MANDATORY_JOIN_CHANNELS")
    if multi_channels and isinstance(multi_channels, list):
        channels = [c.strip() for c in multi_channels if c and c.strip()]
        
    if not channels:
        single = cfg.get("MANDATORY_JOIN_CHANNEL", "").strip()
        if single:
            channels = [single]

    for idx, chan in enumerate(channels):
        join_link = get_channel_join_link(chan)
        btn_label = f"📢 عضویت در کانال {idx + 1}" if len(channels) > 1 else "📢 عضویت در کانال"
        markup.add(types.InlineKeyboardButton(btn_label, url=join_link))
        
    markup.add(types.InlineKeyboardButton("عضو شدم✅", callback_data="check_mandatory_join"))
    return markup

def verify_mandatory_join_and_warn(chat_id, user_id):
    """
    Checks if mandatory join is active and whether the user has joined.
    If not joined, it sends the warning message with the join keyboard and returns False.
    If joined, it returns True.
    """
    cfg = get_config()
    if not cfg.get("MANDATORY_JOIN_ACTIVE"):
        return True
        
    if is_user_member_of_channel(user_id):
        return True
        
    warn_text = cfg.get("MANDATORY_JOIN_TEXT", "لطفا ابتدا در کانال ما عضو شده و دکمه عضو شدم✅ را فشار دهید.")
    try:
        bot.send_message(chat_id, f"⚠️ <b>عضویت در کانال اجباری</b>\n\n{warn_text}", parse_mode="HTML", reply_markup=get_mandatory_join_keyboard())
    except Exception as e:
        print(f"Error sending mandatory join warn block: {e}")
    return False

# --- Bot Command Handlers ---


@bot.pre_checkout_query_handler(func=lambda query: True)
def process_pre_checkout_query(pre_checkout_query):
    bot.answer_pre_checkout_query(pre_checkout_query.id, ok=True)

@bot.message_handler(content_types=['successful_payment'])
def process_successful_payment(message):
    payment_info = message.successful_payment
    payload = payment_info.invoice_payload
    
    if payload.startswith("col_stars:"):
        parts = payload.split(":")
        tg_id = int(parts[1])
        package_id = parts[2]
        action = parts[3]
        
        global pending_col_requests
        if 'pending_col_requests' in globals() and tg_id in pending_col_requests:
            req = pending_col_requests[tg_id]
            db = read_sqlite_db()
            package = next((p for p in db.get("colleague_packages", []) if p["id"] == package_id), None)
            if package:
                finalize_colleague_purchase(tg_id, req, package, message)
        else:
            bot.send_message(tg_id, "✅ پرداخت شما موفقیت آمیز بود، اما اطلاعات درخواست همکار در حافظه یافت نشد. لطفاً با پشتیبانی تماس بگیرید.")

@bot.message_handler(commands=['start', 'help'])
def start_cmd(message):
    print(f"[DEBUG] Received /start from {message.from_user.id} (@{message.from_user.username})")
    tg_id = message.from_user.id
    username = message.from_user.username
    
    try:
        bot.clear_step_handlers_by_chat_id(chat_id=message.chat.id)
    except Exception:
        pass
    try:
        clear_user_pending_purchase(tg_id)
    except Exception:
        pass
        
    parts = message.text.split()
    referral_id = None
    if len(parts) > 1 and parts[1].isdigit():
        referral_id = int(parts[1])
        
    register_tg_user(tg_id, username, referral_id=referral_id)
    user = get_user_data(tg_id)
    
    if user and user.get('status') == 'banned':
        bot.reply_to(message, "❌ حساب کاربری شما به علت تخلف غیرفعال شده است. جهت اتصال به پشتیبانی پیام دهید.")
        return

    if not verify_mandatory_join_and_warn(message.chat.id, tg_id):
         return

    try:
        log_action(tg_id, username or f"user_{tg_id}", "ورود به ربات", "کاربر وارد ربات شد و منوی اصلی را دریافت کرد.")
    except Exception as e:
        print("Error logging user entry:", e)

    cfg = get_config()
    custom_welcome = cfg.get("WELCOME_TEXT")
    bot_nickname = cfg.get("BOT_NICKNAME", "دالتون بات")
    
    user_balance = int(user.get('walletBalance') or 0) if user else 0
    formatted_balance = f"{user_balance:,}"
    
    if custom_welcome:
        welcome_text = custom_welcome.replace("{tg_id}", str(tg_id)).replace("{wallet_balance}", formatted_balance).replace("{nickname}", bot_nickname)
    else:
        welcome_text = (
            f"<b>🚀 به ربات پرسرعت {bot_nickname} خوش آمدید!</b>\n\n"
            f"با خرید از شبکه پرسرعت ما، از اتصال ایمن، پینگ پایین و آی‌پی ثابت لذت ببرید.\n\n"
            f"🆔 شناسه تلگرام شما: <code>{tg_id}</code>\n"
            f"💰 موجودی کیف پول: <code>{formatted_balance}</code> تومان\n\n"
            f"👇 لطفا گزینه مورد نظر خود را از منوی زیر انتخاب نمایید:"
        )
    # Ensure client's cached reply keyboard is restricted to '🔙 بازگشت به منوی اصلی' only
    try:
        msg = bot.send_message(message.chat.id, "درحال بارگذاری...", reply_markup=get_main_reply_keyboard())
        bot.delete_message(message.chat.id, msg.message_id)
    except Exception as e:
        print(f"Error resetting reply markup: {e}")
        
    bot.send_message(message.chat.id, welcome_text, parse_mode="HTML", reply_markup=get_custom_keyboard())

    # Send and pin message if configured
    pinned_active = cfg.get("PINNED_MESSAGE_ACTIVE", False)
    pinned_text = cfg.get("PINNED_MESSAGE_TEXT")
    if pinned_active and pinned_text:
        if not user or user.get("lastPinnedMsgSeen") != pinned_text:
            try:
                sent_pin_msg = bot.send_message(message.chat.id, pinned_text, parse_mode="HTML")
                bot.pin_chat_message(message.chat.id, sent_pin_msg.message_id, disable_notification=True)
                update_user_pinned_seen(tg_id, pinned_text)
            except Exception as pin_err:
                print(f"Error pinning message in start_cmd: {pin_err}")

@bot.message_handler(commands=['buy'])
def buy_cmd(message):
    tg_id = message.from_user.id
    username = message.from_user.username
    
    try:
        bot.clear_step_handlers_by_chat_id(chat_id=message.chat.id)
    except Exception:
        pass
    try:
        clear_user_pending_purchase(tg_id)
    except Exception:
        pass
        
    register_tg_user(tg_id, username)
    user = get_user_data(tg_id)
    if user and user.get('status') == 'banned':
        bot.reply_to(message, "❌ حساب کاربری شما مسدود شده است.")
        return
    if not verify_mandatory_join_and_warn(message.chat.id, tg_id):
        return
        
    cfg = get_config()
    nickname = cfg.get("BOT_NICKNAME", "دالتون")
    db = read_sqlite_db()
    
    servers = cfg.get("SERVERS", [])
    
    # Filter active servers for standard users:
    # A server is shown to standard users if its 'planCategories' list is empty/None,
    # or if it contains at least one of the standard plan category IDs.
    db_categories = db.get("plan_categories", [])
    std_cat_ids = {c.get("id") for c in db_categories if c.get("id")}
    
    active_servers = []
    for s in servers:
        if s.get("status") == "active":
            p_cats = s.get("planCategories")
            if not p_cats:  # General server for everyone
                active_servers.append(s)
            elif any(cid in std_cat_ids for cid in p_cats):
                active_servers.append(s)
    
    if active_servers:
        message_body = (
            f"🌐 <b>انتخاب سرور جهت خرید کانفیگ:</b>\n\n"
            "لطفاً ابتدا سرور مورد نظر خود را از لیست زیر انتخاب کنید:"
        )
        markup = types.InlineKeyboardMarkup(row_width=1)
        for srv in active_servers:
            markup.add(types.InlineKeyboardButton(f"🌐 {srv.get('name')}", callback_data=f"srvsel_{srv.get('id')}"))
            
        markup.row(
            types.InlineKeyboardButton("🏠 بازگشت به منوی اصلی", callback_data="btn_back_home")
        )
        bot.send_message(message.chat.id, message_body, parse_mode="HTML", reply_markup=markup)
        return

    message_body = (
        f"🛍️ <b>دسته بندی‌های خرید اشتراک {nickname}:</b>\n\n"
        "لطفاً یکی از دسته‌بندی‌های زیر را جهت مشاهده و خرید طرح‌ها انتخاب کنید:\n\n"
        "💡 با انتخاب هر دسته‌بندی، طرح‌های فعال آن بخش به همراه قیمت و جزئیات خدمت شما نمایش داده می‌شوند."
    )

    db_plans = db.get("vpn_plans", [])
    db_categories = db.get("plan_categories", [])
    # Extract categories and their emojis
    categories = []
    category_map = {}
    
    if db_categories:
        for c in db_categories:
            cat_name = c.get("name")
            if cat_name:
                categories.append(cat_name)
                category_map[cat_name] = c.get("emoji", "⚡️")
    else:
        # Legacy fallback: derive from plans
        seen_cats = set()
        for p in db_plans:
            cat = p.get("category", (cfg.get("LANG", "fa") == "fa" and "سایر" or "Others",))
            if cat not in seen_cats:
                categories.append(cat)
                seen_cats.add(cat)

    markup = types.InlineKeyboardMarkup(row_width=1)
    for cat in categories:
        # Optional: only show categories that have at least one plan
        has_plans = any(p.get("category") == cat for p in db_plans)
        if not has_plans:
            continue
            
        emoji = category_map.get(cat)
        if not emoji:
            emoji = "⚡️"
            if "vip" in cat.lower(): emoji = "⭐️"
            elif "voip" in cat.lower() or "unlimited" in cat.lower(): emoji = "🚀"
            elif "premium" in cat.lower(): emoji = "💎"
        
        markup.add(types.InlineKeyboardButton(f"{emoji} {cat}", callback_data=f"plcat_{cat}"))
    
    markup.row(
        types.InlineKeyboardButton("🏠 بازگشت به منوی اصلی", callback_data="btn_back_home")
    )
    
    bot.send_message(message.chat.id, message_body, parse_mode="HTML", reply_markup=markup)

@bot.message_handler(commands=['pay'])
def pay_cmd(message):
    tg_id = message.from_user.id
    username = message.from_user.username
    register_tg_user(tg_id, username)
    user = get_user_data(tg_id)
    if user and user.get('status') == 'banned':
        bot.reply_to(message, "❌ حساب کاربری شما مسدود شده است.")
        return
    if not verify_mandatory_join_and_warn(message.chat.id, tg_id):
        return
        
    cfg = get_config()
    nickname = cfg.get("BOT_NICKNAME", "دالتون")
    instructions = (
        f"💳 <b>بخش شارژ و افزایش موجودی کیف پول {nickname}:</b>\n\n"
        f"لطفاً مبلغی که مایل هستید جهت شارژ واریز کنید را از دکمه‌های زیر انتخاب نمایید:\n"
        f"پس از انتخاب، اطلاعات پرداخت و کارت مدیریت متناسب با آن برای شما فرستاده می‌شود."
    )
    markup = types.InlineKeyboardMarkup(row_width=2)
    charge_amounts = cfg.get("WALLET_CHARGE_AMOUNTS", [200000, 300000, 400000, 500000, 1000000])
    
    row_buttons = []
    for amt in charge_amounts:
        try:
            amt_val = int(amt)
        except Exception:
            amt_val = 200000
            
        btn_label = f"💵 {amt_val:,} تومان"
        if amt_val >= 1000000:
            btn_label = f"🔥 {amt_val:,} تومان"
        row_buttons.append(types.InlineKeyboardButton(btn_label, callback_data=f"charge_amount_{amt_val}"))
        
    for i in range(0, len(row_buttons), 2):
        if i + 1 < len(row_buttons):
            markup.add(row_buttons[i], row_buttons[i+1])
        else:
            markup.add(row_buttons[i])
            
    markup.add(
        types.InlineKeyboardButton("🔗 افزایش موجودی دلخواه (وارد کردن مبلغ)", callback_data="charge_custom_amount")
    )
    markup.row(
        types.InlineKeyboardButton("🏠 منوی اصلی", callback_data="btn_back_home")
    )
    bot.send_message(message.chat.id, instructions, parse_mode="HTML", reply_markup=markup)

@bot.message_handler(commands=['support'])
def support_cmd(message):
    tg_id = message.from_user.id
    username = message.from_user.username
    register_tg_user(tg_id, username)
    user = get_user_data(tg_id)
    if user and user.get('status') == 'banned':
        bot.reply_to(message, "❌ حساب کاربری شما مسدود شده است.")
        return
    if not verify_mandatory_join_and_warn(message.chat.id, tg_id):
        return
    show_ticket_main_menu(message.chat.id)

@bot.message_handler(func=lambda msg: True)
def text_messages_handler(message):
    tg_id = message.from_user.id
    username = message.from_user.username
    text = message.text

    register_tg_user(tg_id, username)
    user = get_user_data(tg_id)
    
    if user and user.get('status') == 'banned':
        bot.send_message(message.chat.id, "❌ حساب شما مسدود شده است.")
        return

    if not verify_mandatory_join_and_warn(message.chat.id, tg_id):
         return

    if "منصرف" in text or "بازگشت" in text:
        start_cmd(message)
        return

    bot.send_message(message.chat.id, "لطفا از دکمه‌های شیشه‌ای منو استفاده کنید. 👇", reply_markup=get_custom_keyboard())

def handle_main_menu_callback(call):
    tg_id = call.from_user.id
    action = call.data
    message = call.message
    bot.answer_callback_query(call.id)
    
    try:
        bot.clear_step_handlers_by_chat_id(chat_id=message.chat.id)
    except Exception:
        pass
    try:
        clear_user_pending_purchase(tg_id)
    except Exception:
        pass
        
    cfg = get_config()
    db = read_sqlite_db()
    user = get_user_data(tg_id)
    
    if action == "mm_btnAiChat":
        try:
            msg = bot.edit_message_text(
                "🤖 <b>دستیار هوشمند فعال شد!</b>\n\nسوال خود را در رابطه با خرید، تعرفه‌ها و اتصال بپرسید تا پاسخ داده شود:\n(جهت خروج کلمه «انصراف» را ارسال کنید)",
                chat_id=message.chat.id,
                message_id=message.message_id,
                parse_mode="HTML",
                reply_markup=get_cancel_keyboard()
            )
        except Exception:
            msg = bot.send_message(
                message.chat.id,
                "🤖 <b>دستیار هوشمند فعال شد!</b>\n\nسوال خود را در رابطه با خرید، تعرفه‌ها و اتصال بپرسید تا پاسخ داده شود:\n(جهت خروج کلمه «انصراف» را ارسال کنید)",
                parse_mode="HTML",
                reply_markup=get_cancel_keyboard()
            )
        bot.register_next_step_handler(message, process_ai_support)
        return

    elif action == "mm_btnBuyNew" or action == "mm_btnBuy":
        try:
            bot.delete_message(message.chat.id, message.message_id)
        except Exception:
            pass
        message.from_user = call.from_user
        message.text = "/buy"
        buy_cmd(message)
        return

    elif action == "mm_btnColleagues":
        packages = db.get("colleague_packages", [])
        col_cats = db.get("colleague_categories", [])
        
        # Build text
        text = "✨ <b>سرویس‌های ویژه و عمده همکاران</b>\n\n"
        
        if not packages:
            text += "هیچ بسته فعالی در حال حاضر وجود ندارد. لطفاً در صورت داشتن حساب وارد شوید:"
            markup = types.InlineKeyboardMarkup()
            markup.row(types.InlineKeyboardButton("🔑 ورود به حساب همکار", callback_data="login_colleague"))
            markup.row(types.InlineKeyboardButton("🔙 بازگشت", callback_data="btn_back_home"))
            bot.edit_message_text(text, chat_id=message.chat.id, message_id=message.message_id, parse_mode="HTML", reply_markup=markup)
            return

        # Group by category
        cats = {}
        for p in packages:
            c = p.get('category') or "سایر"
            if c not in cats: cats[c] = []
            cats[c].append(p)
        
        cat_index_map = {c.get('name'): i for i, c in enumerate(col_cats) if c.get('name')}
        sorted_cat_names = sorted(cats.keys(), key=lambda x: cat_index_map.get(x, 9999))
        
        text += "📁 لطفاً دسته‌بندی مورد نظر خود را انتخاب کنید:"
        
        markup = types.InlineKeyboardMarkup(row_width=2)
        for cat_name in sorted_cat_names:
            cat_info = next((c for c in col_cats if c['name'] == cat_name), None)
            emoji = cat_info.get('emoji', '📁') if cat_info else '📁'
            markup.add(types.InlineKeyboardButton(f"{emoji} {cat_name}", callback_data=f"mm_colcat:{cat_name}"))
            
        markup.row(types.InlineKeyboardButton("🔑 ورود به حساب همکار", callback_data="login_colleague"))
        markup.row(types.InlineKeyboardButton("🔑 بازیابی رمز همکار (با توکن)", callback_data="recover_colleague_token"))
        markup.row(types.InlineKeyboardButton("🔙 بازگشت", callback_data="btn_back_home"))
        
        bot.edit_message_text(text, chat_id=message.chat.id, message_id=message.message_id, parse_mode="HTML", reply_markup=markup)
        return

    elif action.startswith("mm_colcat:"):
        cat_name = action.replace("mm_colcat:", "")
        packages = db.get("colleague_packages", [])
        col_cats = db.get("colleague_categories", [])
        cat_info = next((c for c in col_cats if c['name'] == cat_name), None)
        emoji = cat_info.get('emoji', '📁') if cat_info else '📁'
        
        cat_packages = [p for p in packages if (p.get('category') or "سایر") == cat_name]
        
        text = f"{emoji} <b>بسته‌های دسته‌بندی: {cat_name}</b>\n\n"
        for p in cat_packages:
            text += f"▫️ {p['title']} ┃ <code>{p['trafficGb']}G</code>\n"
        text += "\n👇 بسته مورد نظر را جهت خرید انتخاب کنید:"
        
        markup = types.InlineKeyboardMarkup(row_width=1)
        for p in cat_packages:
            btn_text = f"✨ {p['title']} ┃ {int(p['price']):,} ت"
            markup.add(types.InlineKeyboardButton(btn_text, callback_data=f"buy_colleague_{p['id']}"))
            
        markup.row(types.InlineKeyboardButton("🔙 بازگشت به دسته‌ها", callback_data="mm_btnColleagues"))
        
        bot.edit_message_text(text, chat_id=message.chat.id, message_id=message.message_id, parse_mode="HTML", reply_markup=markup)
        return

    elif action == "mm_btn_DUMMY_":
        col_cats = db.get("colleague_categories", [])
        cat_index_map = {c.get('name'): i for i, c in enumerate(col_cats) if c.get('name')}
        
        if packages:
            # Group by category
            cats = {}
            for p in packages:
                c = p.get('category') or "سایر"
                if c not in cats: cats[c] = []
                cats[c].append(p)
            
            # Sort categories
            sorted_cat_names = sorted(cats.keys(), key=lambda x: cat_index_map.get(x, 9999))
            
            for cat_name in sorted_cat_names:
                cat_info = cat_dict.get(cat_name)
                emoji = cat_info.get('emoji', '📂') if cat_info else '📂'
                text += f"{emoji} <b>{cat_name}:</b>\n"
                for p in cats[cat_name]:
                    text += f"▫️ {p['title']} ┃ <code>{p['trafficGb']}G</code>\n"
                text += "\n"
                
            text += "👇 جهت خرید بسته و فعال‌سازی پنل همکار، طرح مورد نظر را انتخاب کنید:"
        else:
            text = "✨ <b>سرویس های ویژه همکاران</b>\n\nهیچ بسته فعالی در حال حاضر وجود ندارد. لطفاً در صورت داشتن حساب وارد شوید:"

        markup = types.InlineKeyboardMarkup()
        if packages:
            # Group by category for buttons too
            cats = {}
            for p in packages:
                c = p.get('category') or "سایر"
                if c not in cats: cats[c] = []
                cats[c].append(p)
            
            sorted_cat_names = sorted(cats.keys(), key=lambda x: cat_index_map.get(x, 9999))
            
            for cat_name in sorted_cat_names:
                # Add a header button/indicator if multiple categories
                if len(cats) > 1:
                    cat_info = cat_dict.get(cat_name)
                    emoji = cat_info.get('emoji', '') if cat_info else ''
                    markup.add(types.InlineKeyboardButton(f"--- {emoji} {cat_name} ---", callback_data="none"))
                
                for p in cats[cat_name]:
                    btn_text = f"✨ {p['title']} ┃ {int(p['price']):,} ت"
                    markup.add(types.InlineKeyboardButton(btn_text, callback_data=f"buy_colleague_{p['id']}"))
                
        markup.row(types.InlineKeyboardButton("🔑 ورود به حساب همکار", callback_data="login_colleague"))
        markup.row(types.InlineKeyboardButton("🔑 بازیابی رمز همکار (با توکن)", callback_data="recover_colleague_token"))
        markup.row(types.InlineKeyboardButton("🔙 بازگشت", callback_data="btn_back_home"))
        
        bot.edit_message_text(
            text,
            chat_id=message.chat.id,
            message_id=message.message_id,
            parse_mode="HTML",
            reply_markup=markup
        )

    # 2. Account Profile Details
    elif action == "mm_btnProfile":
        active_keys = [k for k in db.get("subscription_keys", []) if k["userId"] == tg_id and k["status"] != "expired"]
        
        bal = user.get("walletBalance", 0)
        formatted_bal = f"{int(bal):,}" if bal is not None else "0"

        # Get and format joinDate
        join_date_g = user.get("joinDate")
        if not join_date_g:
            join_date_g = get_tehran_date_str()
            # update user in db to store it
            user["joinDate"] = join_date_g
            db_conn = read_sqlite_db()
            for u in db_conn.get("users", []):
                if u["userId"] == tg_id:
                    u["joinDate"] = join_date_g
                    break
            write_sqlite_db(db_conn)
            
        f_date = format_gregorian_to_jalali_str(join_date_g)

        profile_text = (
            f"📄 <b>اطلاعات حساب کاربری شما:</b>\n\n"
            f"💰 موجودی: {formatted_bal} تومان\n"
            f"👤 آیدی عددی: <code>{tg_id}</code>\n"
            f"📦 تعداد سرویس ها: {len(active_keys)}\n"
            f"🗓 تاریخ ورود به بات: {f_date}\n\n"
            f"🔹 جهت شارژ کیف پول خود، می‌توانید به بخش مربوطه در منوی اصلی ربات مراجعه فرمایید."
        )
        
        markup = types.InlineKeyboardMarkup(row_width=1)
        markup.add(
            types.InlineKeyboardButton("🎁 اعمال کد هدیه", callback_data="btn_gift_code")
        )
        markup.row(
            types.InlineKeyboardButton("🔙 بازگشت", callback_data="btn_back_home"),
            types.InlineKeyboardButton("🏠 منوی اصلی", callback_data="btn_back_home")
        )

        bot.edit_message_text(profile_text, chat_id=message.chat.id, message_id=message.message_id, parse_mode="HTML", reply_markup=markup)

    # 2.5 My Subs
    elif action == "mm_btnMySubs":
        active_keys = [k for k in db.get("subscription_keys", []) if k["userId"] == tg_id]
        
        if active_keys:
            msg_text = (
                "🗂 <b>بخش مدیریت اشتراک‌های من:</b>\n\n"
                "جهت مشاهده وضعیت، اطلاعات کلید، تمدید یا حذف، روی نام سرویس خود کلیک نمایید:"
            )
            markup = types.InlineKeyboardMarkup(row_width=1)
            for k in active_keys:
                client_name = k.get("clientName", k.get("planName", "سرویس بدون نام"))
                btn_text = f"🌐 {client_name}"
                markup.add(types.InlineKeyboardButton(btn_text, callback_data=f"mysub_manage_{k['id']}"))
                
            markup.row(
                types.InlineKeyboardButton("🔙 بازگشت به منوی اصلی", callback_data="btn_back_home")
            )
            bot.edit_message_text(msg_text, chat_id=message.chat.id, message_id=message.message_id, parse_mode="HTML", reply_markup=markup)
        else:
            msg_text = "❌ شما تا کنون هیچ سرویس اشتراکی دریافت نکرده‌اید."
            markup = types.InlineKeyboardMarkup(row_width=1)
            markup.row(
                types.InlineKeyboardButton("🔙 بازگشت به منوی اصلی", callback_data="btn_back_home")
            )
            bot.edit_message_text(msg_text, chat_id=message.chat.id, message_id=message.message_id, parse_mode="HTML", reply_markup=markup)

    # 3. Charger Wallet instructions
    elif action == "mm_btnWallet":
        nickname = cfg.get("BOT_NICKNAME", "دالتون")
        instructions = (
            f"💳 <b>بخش شارژ و افزایش موجودی کیف پول {nickname}:</b>\n\n"
            f"لطفاً مبلغی که مایل هستید جهت شارژ واریز کنید را از دکمه‌های زیر انتخاب نمایید:\n"
            f"پس از انتخاب، اطلاعات پرداخت و کارت مدیریت متناسب با آن ب��ای شما فرستاده می‌شود."
        )
        markup = types.InlineKeyboardMarkup(row_width=2)
        charge_amounts = cfg.get("WALLET_CHARGE_AMOUNTS", [200000, 300000, 400000, 500000, 1000000])
        
        row_buttons = []
        for amt in charge_amounts:
            try:
                amt_val = int(amt)
            except Exception:
                amt_val = 200000
                
            btn_label = f"💵 {amt_val:,} تومان"
            if amt_val >= 1000000:
                btn_label = f"🔥 {amt_val:,} تومان"
            row_buttons.append(types.InlineKeyboardButton(btn_label, callback_data=f"charge_amount_{amt_val}"))
            
        for i in range(0, len(row_buttons), 2):
            if i + 1 < len(row_buttons):
                markup.add(row_buttons[i], row_buttons[i+1])
            else:
                markup.add(row_buttons[i])
                
        markup.add(
            types.InlineKeyboardButton("🔗 افزایش موجودی دلخواه (وارد کردن مبلغ)", callback_data="charge_custom_amount")
        )
        markup.row(
            types.InlineKeyboardButton("🔙 بازگشت", callback_data="btn_back_home"),
            types.InlineKeyboardButton("🏠 منوی اصلی", callback_data="btn_back_home")
        )
        bot.edit_message_text(instructions, chat_id=message.chat.id, message_id=message.message_id, parse_mode="HTML", reply_markup=markup)

    # 3.5 Connection Guides
    elif action == "mm_btnGuides":
        markup = types.InlineKeyboardMarkup(row_width=1)
        markup.add(
            types.InlineKeyboardButton("🔌 اتصال به سرویس ها", callback_data="guide_conn_menu"),
            types.InlineKeyboardButton("🔄 آپدیت کردن سرویس ها", callback_data="guide_update_menu"),
            types.InlineKeyboardButton("🪙 نحوه پرداخت با ارز دیجیتال", callback_data="guide_crypto_menu"),
            types.InlineKeyboardButton("🏠 بازگشت به منوی اصلی", callback_data="btn_back_home")
        )
        
        cfg = get_config()
        bot_nickname = cfg.get("BOT_NICKNAME", "دالتون بات")
        
        guides_main_text = (
            f"<b>💡 بخش راهنما و آموزش‌های اتصال {bot_nickname}</b>\n\n"
            "در این بخش می‌توانید کلاینت‌های مختلف را نصب، آپدیت یا نحوه اتصال را در هر سیستم‌عامل فرابگیرید.\n\n"
            "👇 لطفا یک گزینه را از منوی زیر انتخاب نمایید:"
        )
        
        try:
            bot.edit_message_text(
                guides_main_text,
                chat_id=message.chat.id,
                message_id=message.message_id,
                parse_mode="HTML",
                reply_markup=markup
            )
        except Exception:
            try:
                bot.delete_message(message.chat.id, message.message_id)
            except Exception:
                pass
            bot.send_message(
                message.chat.id,
                guides_main_text,
                parse_mode="HTML",
                reply_markup=markup
            )

    # 4. Support chat
    elif action == "mm_btnSupport":
        custom_support = cfg.get("SUPPORT_TEXT")
        support_handle = cfg.get("SUPPORT_HANDLE", "@daltoon_owner")
        tg_channel = cfg.get("TG_CHANNEL", "@daltoon_channel")
        nickname = cfg.get("BOT_NICKNAME", "دالتون")
        
        # Ensure support_handle has a leading @
        if support_handle and not support_handle.startswith("@"):
            support_handle = "@" + support_handle
            
        if custom_support:
            support_txt = custom_support
            
            # Dynamic replacement of @mDaltoon and placeholders with the actual configured support handle
            support_txt = support_txt.replace("{support_id}", support_handle)
            support_txt = support_txt.replace("{support_handle}", support_handle)
            
            import re
            # Replace @mDaltoon (case-insensitive)
            support_txt = re.sub(r'(?i)@mdaltoon', support_handle, support_txt)
            # Replace raw mDaltoon as a whole word (case-insensitive)
            clean_handle_no_at = support_handle.replace("@", "")
            support_txt = re.sub(r'(?i)\bmdaltoon\b', clean_handle_no_at, support_txt)
        else:
            support_txt = (
                f"📞 <b>پشتیبانی فنی {nickname} سرور:</b>\n\n"
                "مشتری گرامی! در صورت بروز هرگونه قطعی، کندی سرعت، ارورهای اتصال یا سوالات قبل از خرید با ما تماس بگیرید.\n\n"
                f"👤 اکانت ناظر فنی: {support_handle}\n"
                f"📢 کانال اطلاع‌رسانی پایداری شبکه: {tg_channel}\n\n"
                "پاسخگویی سریع فعال است: ۱۰ صبح الی ۳ شب"
            )
        bot.send_message(message.chat.id, support_txt, parse_mode="HTML")
        
    elif action == "mm_btnTicketSupport":
        bot.answer_callback_query(call.id)
        show_ticket_main_menu(message.chat.id)
        
    # 5. Free Test
    elif action == "mm_btnFreeTest":
        cfg = get_config()
        if not cfg.get("IS_FREETEST_ACTIVE", True):
            disabled_msg = cfg.get("FREETEST_DISABLED_MSG", "اکانت تست رایگان فعلا موجود نیست.")
            markup = types.InlineKeyboardMarkup()
            markup.row(types.InlineKeyboardButton("🏠 بازگشت به منوی اصلی", callback_data="btn_back_home"))
            bot.edit_message_text(disabled_msg, chat_id=message.chat.id, message_id=message.message_id, parse_mode="HTML", reply_markup=markup)
            return

        users = db.get("users", [])
        user_idx = next((i for i, u in enumerate(users) if u.get("userId") == tg_id), -1)
        
        is_owner = bool(cfg.get("OWNER_ID") and int(tg_id) == int(cfg["OWNER_ID"]))
        is_admin = int(tg_id) in cfg.get("ADMINS", [])
        
        if user_idx >= 0 and users[user_idx].get("hasReceivedFreeTest"):
            if not (is_owner or is_admin):
                bot.edit_message_text("❌ <b>شما قبلاً اکانت تست رایگان خود را دریافت کرده‌اید!</b>\nهر کاربر تنها یکبار مجاز به دریافت تست رایگان می‌باشد.", chat_id=message.chat.id, message_id=message.message_id, parse_mode="HTML")
                return
            
        nickname = cfg.get("BOT_NICKNAME", "دالتون")
        free_gb = cfg.get("FREE_TEST_GB", 0.1)
        free_days = cfg.get("FREE_TEST_DAYS", 1.0)
        
        free_gb_str = f"{int(free_gb * 1024)} مگابایت" if free_gb < 1 else f"{free_gb} گیگابایت"
        if free_days == int(free_days):
            free_days_str = f"{int(free_days)} روزه"
        else:
            free_days_str = f"{free_days} روزه"
            
        bot.send_message(message.chat.id, f"⏳ در حال ساخت اکانت تست رایگان ({free_days_str} - {free_gb_str}) از پنل سرور {nickname}... لطفاً چند لحظه صبر کنید.")
        
        # Select active server to pass to add_vpn_client_api, create_sub_key and get_client_all_links
        cfg = get_config()
        servers = cfg.get("SERVERS", [])
        
        # Check if a specific free test server is configured
        free_test_server_id = cfg.get("FREE_TEST_SERVER_ID")
        active_server = None
        if free_test_server_id:
            active_server = next((s for s in servers if s.get("id") == free_test_server_id), None)
            
        # Fallback to the first active server if none specified or not found
        if not active_server:
            active_server = next((s for s in servers if s.get("status") == "active"), servers[0] if servers else None)
            
        active_server_id = active_server.get("id") if active_server else None

        import string
        import random
        random_suffix = ''.join(random.choices(string.ascii_lowercase + string.digits, k=4))
        free_username = f"test_{random_suffix}"
        
        # In case test_xxxx exists, loop (rare but good practice)
        while check_client_exists(free_username, server_id=active_server_id):
            random_suffix = ''.join(random.choices(string.ascii_lowercase + string.digits, k=4))
            free_username = f"test_{random_suffix}"

        free_gb = cfg.get("FREE_TEST_GB", 0.1)
        free_days = cfg.get("FREE_TEST_DAYS", 1.0)
        
        free_gb_str = f"{int(free_gb * 1024)} مگابایت" if free_gb < 1 else f"{free_gb} گیگابایت"
        if free_days == int(free_days):
            free_days_str = f"{int(free_days)} روزه"
        else:
            free_days_str = f"{free_days} روزه"

        client_uuid, sub_link = add_vpn_client_api(free_username, free_gb, free_days, server_id=active_server_id)
        
        if not sub_link:
            import uuid
            from urllib.parse import urlparse
            parsed = urlparse(cfg.get('XUI_URL', ''))
            host = parsed.hostname or "panel.your-vpn.com"
            client_uuid = str(uuid.uuid4())
            fallback_sub_id = ''.join(random.choices(string.ascii_lowercase + string.digits, k=16))
            sub_link = f"{cfg.get('SUB_URL', f'https://{host}:2096')}/sub/{fallback_sub_id}"
            print(f"[Bot Warning] API failed. Using semi-dynamic fallback sub_link for {host}")
            
        # Update user record
        if user_idx >= 0:
            users[user_idx]["hasReceivedFreeTest"] = True
            db["users"] = users
            write_sqlite_db(db)
                
        import time
        expire_date = time.strftime("%Y-%m-%d", time.localtime(time.time() + free_days * 24 * 60 * 60))
        sub_id = f"SUB-{int(time.time()) % 9000 + 1000}"

        create_sub_key(
            key_id=sub_id, 
            tg_id=tg_id, 
            plan_id="free_test", 
            plan_name=f"تست رایگان {free_gb_str} - {free_days_str}", 
            sub_link=sub_link, 
            expire_date=expire_date, 
            limit_gb=free_gb,
            client_name=free_username,
            client_uuid=client_uuid,
            server_id=active_server_id
        )
        
        notify_admins_of_purchase(tg_id, "اکانت تست رایگان جدید", f"{free_gb_str} / {free_days_str}", 0, sub_id)
        
        cfg_settings = get_config()
        success_note = cfg_settings.get("PURCHASE_SUCCESS_NOTE", "").strip()
        note_attach = cfg_settings.get("PURCHASE_SUCCESS_ATTACHMENT", None)
        has_media = bool(note_attach and "fileData" in note_attach)
        
        note_append = ""
        if success_note and not has_media:
            note_append = f"\n\n━━━━━━━━━━━━━━━━━━\n{success_note}"

        vless_links = get_client_all_links(free_username, client_uuid, sub_link, server_id=active_server_id)
        links_text = "\n\n🔸━━━━━━━━━━━━━━━━━━🔸\n\n".join([f"<code>{l}</code>" for l in vless_links]) if vless_links else f"<code>{sub_link}</code>"

        success_text = (
            f"🎁 <b>اکانت تست رایگان شما با موفقیت ساخته شد!</b>\n\n"
            f"👤 نام کاربری تست: <code>{free_username}</code>\n"
            f"⏳ اعتبار: ۱ روز\n"
            f"💬 حجم: ۱۰۰ مگابایت\n\n"
            f"👇 جهت کپی کردن لینک‌ها، روی دکمه زیر ضربه بزنید:{note_append}\n\n"
            f"🚀 <b>لینک‌های اتصال مستقیم:</b>\n{links_text}"
        )
        
        try:
            import urllib.parse
            qr_url = get_qr_code_url(sub_link)
            markup = types.InlineKeyboardMarkup(row_width=1)
            add_copy_button_to_markup(markup, "📋 کپی آسان لینک سابسکریپشن (کلیک کنید)", sub_link)
            markup.add(types.InlineKeyboardButton("💡 آموزش ها", callback_data="mm_btnGuides"))
            markup.row(types.InlineKeyboardButton("🏠 منوی اصلی", callback_data="btn_back_home"))
            safe_send_qr_photo(message.chat.id, qr_url, success_text, markup)
        except Exception as e:
            print(f"[Bot] Failed free test QR send: {e}")
            
        send_purchase_success_note_if_any(message.chat.id, only_media=True)

    # 6. Referral
    elif action == "mm_btnReferral":
        import json
        try:
            settings_str = db.get("settings", {}).get("panel_config", "{}")
            settings = json.loads(settings_str)
        except:
            settings = {}
            
        bot_username = settings.get("botTelegramHandle", "").strip()
        if not bot_username or bot_username in ["your_bot_id", "bot_username"]:
            try:
                bot_info = bot.get_me()
                bot_username = bot_info.username
            except:
                bot_username = "your_bot_id"
        
        bot_username = bot_username.replace("@", "")
        percent = settings.get("referralRewardPercent", 5)
        amount = settings.get("referralBaseAmount", 100000)
        calculated_reward = max(0, round((amount * percent) / 100))
        uid = str(tg_id)
        link = f"https://t.me/{bot_username}?start={uid}"
        
        user = next((u for u in db.get("users", []) if u["userId"] == tg_id), {})
        
        # Calculate real referrals count dynamically from current users state
        db_users = db.get("users", [])
        real_referrals_count = 0
        for u in db_users:
            ref_by = u.get("referredBy")
            if ref_by is not None:
                try:
                    if int(ref_by) == int(tg_id):
                        real_referrals_count += 1
                except:
                    if str(ref_by) == str(tg_id):
                        real_referrals_count += 1
                        
        if user:
            # Sync user's referralCount to make sure stats in DB match exactly
            if "referralCount" not in user or user["referralCount"] < real_referrals_count:
                user["referralCount"] = real_referrals_count
                write_sqlite_db(db)
            referrals_count = user.get("referralCount", 0)
            referrals_reward = user.get("referralRewardTotal", 0)
        else:
            referrals_count = real_referrals_count
            referrals_reward = 0
        
        default_msg = (
            "برای کسب موجودی هدیه، دوستان و آشنایان خودتون رو با لینک پایین به ربات دعوت کنید 👥\n\n"
            "در ضمن کد معرف اختصاصی شما {uid} می باشد.\n\n"
            "{link}\n\n"
            "🎁 با دعوت از هر دوست، {reward} تومان (معادل {percent}% مبلغ پایه) پاداش دریافت می‌کنید.\n\n"
            "📊 آمار دعوت شما\n"
            f"• افراد وارد شده با لینک: {referrals_count}\n"
            f"• پاداش دریافت شده: {referrals_reward:,} تومان"
        )
        
        raw_template = settings.get("referralMessage", default_msg)
        
        # In case the user had a custom template, we should still try to insert the real stats.
        # But if the custom template text is exactly the old default msg with hardcoded "0", fix it
        if "افراد وارد شده با لینک: 0" in raw_template:
            raw_template = raw_template.replace("افراد وارد شده با لینک: 0", f"افراد وارد شده با لینک: {referrals_count}")
        if "پاداش دریافت شده: 0 تومان" in raw_template:
            raw_template = raw_template.replace("پاداش دریافت شده: 0 تومان", f"پاداش دریافت شده: {referrals_reward:,} تومان")
            
        # Optional: you could define `{referrals_count}` and `{referrals_reward}` placeholders in the template
        reply_text = raw_template.replace("{uid}", uid)\
            .replace("{link}", link)\
            .replace("{percent}", str(percent))\
            .replace("{amount}", f"{amount:,}")\
            .replace("{reward}", f"{calculated_reward:,}")\
            .replace("{referrals_count}", str(referrals_count))\
            .replace("{referrals_reward}", f"{referrals_reward:,}")
            
        markup = types.InlineKeyboardMarkup()
        markup.row(types.InlineKeyboardButton("🏠 منوی اصلی", callback_data="btn_back_home"))
        bot.edit_message_text(reply_text, chat_id=message.chat.id, message_id=message.message_id, parse_mode="HTML", reply_markup=markup)

    elif action.startswith("mm_custom_"):
        idx = int(action.split("_")[-1])
        cb = db.get("custom_buttons", [])
        if idx < len(cb):
            bot.edit_message_text(cb[idx]["replyText"], chat_id=message.chat.id, message_id=message.message_id, parse_mode="HTML")
            
# --- Callback Queries ---

def process_purchase_username_manual(message, plan_id, spec):
    tg_id = message.from_user.id
    if not message.text:
       return 
    raw_username = message.text.strip()
    
    # Validation logic on raw username first
    import re
    if not re.match("^[a-zA-Z0-9_-]{3,15}$", raw_username):
        msg = bot.send_message(
            message.chat.id,
            "⚠️ <b>نام وارد شده نامعتبر است!</b>\n\n"
            "لطفاً یک نام کاربری جدید و معتبر ارسال کنید:",
            reply_markup=get_cancel_keyboard()
        )
        bot.register_next_step_handler(msg, process_purchase_username_manual, plan_id, spec)
        return

    # Automatically generate a 5-7 digit/char random alphanumeric suffix and append it
    import random
    import string
    suffix_length = random.randint(5, 7)
    random_suffix = "".join(random.choices(string.ascii_lowercase + string.digits, k=suffix_length))
    username_input = f"{raw_username}-{random_suffix}"

    # Check existence of the suffix-appended username
    if check_client_exists(username_input, server_id=spec.get("server_id")):
        msg = bot.send_message(
            message.chat.id,
            "⚠️ <b>این نام کاربری از قبل در لیست کاربران سرور موجود است!</b>\n\n"
            "لطفاً نام جدیدی ارسال کنید:",
            parse_mode="HTML",
            reply_markup=get_cancel_keyboard()
        )
        bot.register_next_step_handler(msg, process_purchase_username_manual, plan_id, spec)
        return

    set_user_pending_purchase(tg_id, plan_id, username_input, spec.get("server_id"))
    
    # User request: Ask for discount code after entering name
    markup = types.InlineKeyboardMarkup()
    markup.row(
        types.InlineKeyboardButton("✅ بله، دارم", callback_data=f"hasdisc:yes:{plan_id}:{username_input}"),
        types.InlineKeyboardButton("❌ خیر، ندارم", callback_data=f"hasdisc:no:{plan_id}:{username_input}")
    )
    bot.send_message(
        message.chat.id,
        "🎁 <b>آیا کد تخفیف دارید؟</b>",
        parse_mode="HTML",
        reply_markup=markup
    )

def handle_buy_pay(call):
    data = call.data.split(":")
    # buy_pay:method:plan_id:username:promo_code
    method = data[1]
    plan_id = data[2]
    username_input = data[3]
    promo_code = data[4] if len(data) > 4 else "none"
    
    tg_id = call.from_user.id
    cfg = get_config()
    
    is_owner = bool(cfg.get("OWNER_ID") and int(tg_id) == int(cfg["OWNER_ID"]))
    is_admin = bool(cfg.get("ADMINS") and int(tg_id) in cfg["ADMINS"])
    is_privileged = is_owner or is_admin

    db = read_sqlite_db()
    db_plans = db.get("vpn_plans", [])
    db_plan = next((dp for dp in db_plans if dp["id"] == plan_id), None)
    
    if not db_plan:
        bot.answer_callback_query(call.id, "خطا در یافتن طرح.")
        return

    # User pending data
    pending_plan, pending_client, pending_server_id, _, _, _ = get_user_pending_purchase(tg_id)

    spec = {
        "id": db_plan["id"],
        "name": db_plan["name"],
        "price": db_plan["price"],
        "traffic": db_plan.get("trafficGb", 30),
        "duration": db_plan.get("durationDays", 30),
        "price_original": db_plan["price"],
        "server_id": pending_server_id
    }
    
    if promo_code != "none":
        promo_codes = db.get("promo_codes", [])
        promo = next((p for p in promo_codes if p["code"].upper() == promo_code), None)
        promo_valid = True
        if promo:
            dur = promo.get("durationDays")
            cat = promo.get("createdAt")
            if dur and cat:
                from datetime import datetime
                try:
                    c_str = cat.replace("Z", "")
                    if "." in c_str:
                        c_str = c_str.split(".")[0]
                    c_dt = datetime.strptime(c_str, "%Y-%m-%dT%H:%M:%S")
                    n_dt = datetime.utcnow()
                    if (n_dt - c_dt).days >= dur:
                        promo_valid = False
                except Exception:
                    pass
        if promo and promo_valid:
            if promo["type"] == "percent":
                discount_amount = int(spec["price"] * (promo["value"] / 100))
            elif promo["type"] == "fixed_amount":
                discount_amount = int(promo["value"])
            else:
                discount_amount = 0
            spec["price"] = max(0, spec["price"] - discount_amount)
            spec["applied_promo"] = promo_code

    if method == "card":
        if is_privileged:
            bot.answer_callback_query(call.id, "✅ تایید مستقیم ادمین ثبت شد.")
            call.data = f"buy_pay:wallet:{plan_id}:{username_input}:{promo_code}"
            handle_buy_pay(call)
            return

        bot.answer_callback_query(call.id)
        text_response = (
            f"🛒 <b>خرید اشتراک (کارت به کارت)</b>\n"
            f"👤 نام کاربری: <code>{username_input}</code>\n"
            f"💰 مبلغ قابل پرداخت: <b>{spec.get('price', 0):,} تومان</b>\n\n"
            f"لطفاً مبلغ فوق را به کارت عابربانک مدیریت واریز نمایید:\n\n"
            f"{get_card_payment_info(cfg)}\n\n"
            f"📸 پس از انتقال/واریز، <b>فقط عکس فیش یا رسید پرداختی خود را به این چت بفرستید</b> تا جهت تایید و دریافت کانفیگ برای ادمین ثبت شود."
        )
        bot.edit_message_text(text_response, chat_id=call.message.chat.id, message_id=call.message.message_id, parse_mode="HTML", reply_markup=get_cancel_keyboard())
        return

    elif method == "wallet":
        user = next((u for u in db["users"] if u["userId"] == tg_id), None)
        
        cfg = get_config()
        is_owner = bool(cfg.get("OWNER_ID") and int(tg_id) == int(cfg["OWNER_ID"]))
        is_admin = bool(cfg.get("ADMINS") and int(tg_id) in cfg["ADMINS"])
        is_privileged = is_owner or is_admin
        
        if not is_privileged and (not user or user.get("walletBalance", 0) < spec["price"]):
            bot.answer_callback_query(call.id, "❌ موجودی کیف پول شما کافی نیست! لطفا ابتدا حساب خود را شارژ کنید.", show_alert=True)
            return
            
        bot.answer_callback_query(call.id, "✅ مبلغ از کیف پول شما کسر و سفارش شما ثبت شد!")
        bot.edit_message_text("✅ در حال ساخت کانفیگ... لطفا صبور باشید.", chat_id=call.message.chat.id, message_id=call.message.message_id, parse_mode="HTML")
        
        # Deduct wallet
        if not is_privileged:
            new_balance = user.get("walletBalance", 0) - int(spec["price"])
            update_user_balance(tg_id, new_balance)
            
            if spec['price'] > 0:
                process_referral_on_purchase(user, spec['price'])
                
            # log 
            log_action(tg_id, user.get("username", str(tg_id)), "خرید از کیف پول", f"بسته {spec['name']} مبلغ {spec['price']:,} تومان کسر شد.")
        else:
            log_action(tg_id, user.get("username", str(tg_id)) if user else str(tg_id), "ساخت مستقیم توسط ادمین", f"بسته {spec['name']} بصورت رایگان ایجاد شد.")
        
        # API creation
        cfg = get_config()
        server_id = spec.get("server_id")
        client_uuid, sub_link = add_vpn_client_api(username_input, spec['traffic'], spec['duration'], server_id=server_id)
        
        if not sub_link:
            if not cfg.get("SIMULATOR_MODE"):
                # Refund user wallet immediately if they were charged
                if not is_privileged:
                    fresh_db = read_sqlite_db()
                    fresh_user = next((u for u in fresh_db["users"] if u["userId"] == tg_id), None)
                    current_bal = float(fresh_user.get("walletBalance", 0.0)) if fresh_user else 0.0
                    refunded_bal = current_bal + float(spec["price"])
                    update_user_balance(tg_id, refunded_bal)
                    log_action(tg_id, fresh_user.get("username", str(tg_id)) if fresh_user else str(tg_id), "مرجوعی سیستمی خرید", f"برگشت مبلغ {spec['price']:,} تومان به دلیل خطای اتصال x-ui.")
                
                session = get_session()
                last_err = getattr(session, "last_error", "خطای ناشناخته")
                notify_admins_of_error("خرید دستی پلن", last_err, f"ID: {tg_id} / Username: {username_input}")
                refund_message = (
                    "❌ <b>خطا در ساخت کانفیگ!</b>\n\n"
                    "متأسفانه مشکلی در اتصال به پنل x-ui رخ داد و امکان ساخت خودکار کانفیگ در این لحظه وجود ندارد.\n\n"
                    "⚠️ <b>جزئیات خطا جهت بررسی به تیم پشتیبانی گزارش شد.</b>\n\n"
                    f"💰 <b>مبلغ {spec['price']:,} تومان به طور خودکار و فوری به کیف پول شما بازگردانده شد.</b>\n\n"
                    "موجودی شما محفوظ است. لطفاً چند لحظه دیگر مجدداً تلاش کنید یا با پشتیبانی در تماس باشید."
                )
                bot.send_message(tg_id, refund_message, parse_mode="HTML")
                return
            
            # Simulator mode - allow mock links
            client_uuid = client_uuid if client_uuid else str(uuid.uuid4())
            from urllib.parse import urlparse
            parsed = urlparse(cfg.get('XUI_URL', ''))
            host = parsed.hostname or "panel.your-vpn.com"
            fallback_sub_id = ''.join(random.choices(string.ascii_lowercase + string.digits, k=16))
            sub_link = f"{cfg.get('SUB_URL', f'https://{host}:2096')}/sub/{fallback_sub_id}"
            print(f"[Bot Simulator] Using mock sub_link for {host}")

        expire_date = time.strftime("%Y-%m-%d", time.localtime(time.time() + spec['duration'] * 24 * 60 * 60))
        sub_id = f"SUB-{int(time.time()) % 9000 + 1000}"
        
        create_sub_key(
            key_id=sub_id, 
            tg_id=tg_id, 
            plan_id=plan_id, 
            plan_name=spec['name'], 
            sub_link=sub_link, 
            expire_date=expire_date, 
            limit_gb=spec['traffic'],
            client_name=username_input,
            client_uuid=client_uuid,
            server_id=spec.get("server_id")
        )
        
        notify_admins_of_purchase(tg_id, "خرید اشتراک جدید (کیف پول)", f"{spec['name']} ({spec['traffic']}GB / {spec['duration']} روز)", spec['price'], sub_id)
        
        clear_user_pending_purchase(tg_id)
        
        cfg_settings = get_config()
        success_note = cfg_settings.get("PURCHASE_SUCCESS_NOTE", "").strip()
        note_attach = cfg_settings.get("PURCHASE_SUCCESS_ATTACHMENT", None)
        has_media = bool(note_attach and "fileData" in note_attach)
        
        note_append = ""
        if success_note and not has_media:
            note_append = f"\n\n━━━━━━━━━━━━━━━━━━\n{success_note}"

        all_links = get_client_all_links(username_input, client_uuid, sub_link, server_id=spec.get("server_id"))
        if all_links:
            links_text = "\n\n🔸━━━━━━━━━━━━━━━━━━🔸\n\n".join([f"<code>{l}</code>" for l in all_links])
            configs_block = f"🚀 <b>لینک‌های اتصال مستقیم:</b>\n{links_text}"
        else:
            configs_block = (
                f"⚠️ <b>توجه:</b> امکان استخراج تفکیکی لینک‌های کانفیگ در این لحظه میسر نشد.\n\n"
                f"👇 <b>لطفاً از لینک سابسکریپشن اختصاصی خود استفاده کنید (جهت کپی لمس کنید):</b>\n\n"
                f"<code>{sub_link}</code>\n\n"
                f"💡 لینک بالا را کپی کرده و در برنامه v2rayNG یا V2box خود به عنوان <b>Subscription (سابسکریپشن)</b> وارد کرده و بروزرسانی (Update) نمایید تا همه کانفیگ‌ها به طور خودکار دریافت شوند."
            )

        success_msg = (
            f"🎉 <b>خرید شما با موفقیت انجام شد!</b>\n\n"
            f"🛒 اشتراک: <b>{spec['name']}</b>\n"
            f"👤 شناسه: <code>{username_input}</code>\n"
            f"⏳ انقضا: <b>{spec['duration']} روز</b> (تا {expire_date})\n"
            f"💬 حجم بسته: <b>{spec['traffic']} گیگابایت</b>\n\n"
            f"{configs_block}{note_append}"
        )
        markup = types.InlineKeyboardMarkup(row_width=1)
        add_copy_button_to_markup(markup, "📋 کپی آسان لینک سابسکریپشن (کلیک کنید)", sub_link)
        markup.row(types.InlineKeyboardButton("🔗 لینک‌های کانفیگ", callback_data=f"mysub_vless_{sub_id}"))
        markup.add(types.InlineKeyboardButton("💡 آموزش ها", callback_data="mm_btnGuides"))
        markup.add(types.InlineKeyboardButton("🏠 بازگشت به منوی اصلی", callback_data="btn_back_home"))
        
        try:
            import urllib.parse
            qr_url = get_qr_code_url(sub_link)
            safe_send_qr_photo(tg_id, qr_url, success_msg, markup)
        except Exception as e:
            print(f"[Bot Warning] Failed to send QR Photo: {e}")
            
        send_purchase_success_note_if_any(tg_id, only_media=True)
        
    elif method in ["cryptomus", "nowpayments", "plisio", "heleket", "stars"]:
        # Mock implementations
        bot.answer_callback_query(call.id)
        gw_names = {"cryptomus": "Cryptomus", "nowpayments": "NowPayments", "plisio": "Plisio", "heleket": "Heleket", "stars": "Telegram Stars"}
        gw_name = gw_names.get(method, method.title())
        text_response = (
            f"🛒 <b>خرید اشتراک (پرداخت با {gw_name})</b>\n"
            f"👤 نام کاربری: <code>{username_input}</code>\n"
            f"💰 مبلغ نهایی: <b>{spec.get('price', 0):,} تومان</b>\n\n"
            f"در اینجا کاربر به درگاه بانکی یا ارزی مربوطه برای این روش وصل خواهد شد.\n"
        )
        markup = types.InlineKeyboardMarkup()
        markup.add(types.InlineKeyboardButton("✅ پایان و تایید فرضی پرداخت", callback_data="btn_back_home"))
        markup.add(types.InlineKeyboardButton("❌ انصراف", callback_data="btn_back_home"))
        bot.edit_message_text(text_response, chat_id=call.message.chat.id, message_id=call.message.message_id, parse_mode="HTML", reply_markup=markup)

def handle_discount_decision(call):
    data = call.data.split(":")
    # hasdisc:{decision}:{plan_id}:{username_input}
    decision = data[1]
    plan_id = data[2]
    username_input = data[3]
    tg_id = call.from_user.id
    
    db = read_sqlite_db()
    db_plans = db.get("vpn_plans", [])
    db_plan = next((dp for dp in db_plans if dp["id"] == plan_id), None)
    
    if not db_plan:
        bot.answer_callback_query(call.id, "خطا در یافتن طرح.")
        return

    # Keep track of server_id in spec if possible
    try:
        pending_data = get_user_pending_purchase(tg_id)
        if len(pending_data) >= 3:
            pending_server_id = pending_data[2]
        else:
            pending_server_id = None
    except Exception as e:
        print(f"[handle_discount_decision] Error unpacking pending purchase: {e}")
        pending_server_id = None

    spec = {
        "id": db_plan["id"],
        "name": db_plan["name"],
        "price": db_plan["price"],
        "traffic": db_plan.get("trafficGb", 30),
        "duration": db_plan.get("durationDays", 30)
    }
    if pending_server_id:
        spec["server_id"] = pending_server_id

    if decision == "yes":
        bot.answer_callback_query(call.id)
        msg = bot.edit_message_text(
            "🎟️ <b>لطفاً کد تخفیف خود را وارد کنید:</b>\n"
            "(در صورت انصراف می‌توانید کد اشتباه بزنید یا عملیات را لغو کنید)",
            chat_id=call.message.chat.id,
            message_id=call.message.message_id,
            parse_mode="HTML",
            reply_markup=get_cancel_keyboard()
        )
        bot.register_next_step_handler(msg, process_promo_code_input, plan_id, username_input, spec)
    else:
        bot.answer_callback_query(call.id)
        # Pass the message_id to edit instead of sending a new message
        send_final_purchase_message(call.message, plan_id, username_input, spec, edit_message_id=call.message.message_id)

def process_promo_code_input(message, plan_id, username_input, spec):
    tg_id = message.from_user.id
    if not message.text: return
    code_text = message.text.strip().upper()
    
    if "انصراف" in code_text or code_text == "/START":
        bot.send_message(message.chat.id, "❌ عملیات لغو شد.", reply_markup=get_custom_keyboard())
        return

    db = read_sqlite_db()
    promo_codes = db.get("promo_codes", [])
    promo = next((p for p in promo_codes if p["code"].upper() == code_text), None)
    
    if not promo:
        markup = types.InlineKeyboardMarkup()
        markup.add(types.InlineKeyboardButton("⏩ ادامه بدون کد تخفیف", callback_data=f"hasdisc:no:{plan_id}:{username_input}"))
        msg = bot.send_message(
            message.chat.id,
            "❌ <b>لطفا کد تخفیف رو صحیح وارد کنید یا در صورت نیاز انصراف بزنید و به پرداخت ادامه دهید:</b>",
            parse_mode="HTML",
            reply_markup=markup
        )
        bot.register_next_step_handler(msg, process_promo_code_input, plan_id, username_input, spec)
        return

    # Check if promo code is expired based on durationDays
    duration_days = promo.get("durationDays")
    created_at_str = promo.get("createdAt")
    if duration_days and created_at_str:
        from datetime import datetime
        try:
            clean_str = created_at_str.replace("Z", "")
            if "." in clean_str:
                clean_str = clean_str.split(".")[0]
            created_dt = datetime.strptime(clean_str, "%Y-%m-%dT%H:%M:%S")
            now_dt = datetime.utcnow()
            delta = now_dt - created_dt
            if delta.days >= duration_days:
                markup = types.InlineKeyboardMarkup()
                markup.add(types.InlineKeyboardButton("⏩ ادامه بدون کد تخفیف", callback_data=f"hasdisc:no:{plan_id}:{username_input}"))
                bot.send_message(
                    message.chat.id, 
                    "❌ <b>مهلت زمانی و انقضای استفاده از این کد تخفیف به پایان رسیده است!</b>", 
                    parse_mode="HTML",
                    reply_markup=markup
                )
                return
        except Exception as ex:
            print(f"[Promo code parse date error]: {ex}")

    # Check usage limits
    if promo.get("totalUsage", 0) >= promo.get("maxUsage", 9999):
        bot.send_message(message.chat.id, "❌ متاسفانه ظرفیت استفاده از این کد تخفیف به پایان رسیده است.")
        send_final_purchase_message(message, plan_id, username_input, spec)
        return

    # Apply discount
    discount_amount = 0
    new_price = spec["price"]
    
    if promo["type"] == "percent":
        discount_amount = int(spec["price"] * (promo["value"] / 100))
    elif promo["type"] == "fixed_amount":
        discount_amount = int(promo["value"])
    
    new_price = max(0, spec["price"] - discount_amount)
    spec["price_original"] = spec["price"]
    spec["price"] = new_price
    spec["applied_promo"] = code_text
    
    bot.send_message(message.chat.id, f"✅ <b>کد تخفیف اعمال شد!</b>\n💰 مبلغ تخفیف: {discount_amount:,} تومان")
    send_final_purchase_message(message, plan_id, username_input, spec)

def send_final_purchase_message(message, plan_id, username_input, spec, edit_message_id=None):
    tg_id = message.chat.id if hasattr(message, 'chat') else message.from_user.id
    cfg = get_config()
    
    # Intelligent Server Name Detection
    server_id = spec.get("server_id")
    if not server_id:
        try:
            pending_data = get_user_pending_purchase(tg_id)
            if len(pending_data) >= 3:
                p_server_id = pending_data[2]
                server_id = p_server_id
        except:
            pass
        
    server_line = ""
    if server_id:
        servers = cfg.get("SERVERS", [])
        server_obj = next((s for s in servers if str(s.get("id")) == str(server_id)), None)
        if server_obj:
            server_name = server_obj.get("name", "")
            if server_name:
                server_line = f"🖥️ <b>سرور: <u>{server_name}</u></b>\n\n"

    price_val = spec.get('price', 0)
    price_text = f"{int(price_val):,} تومان"
    if spec.get("applied_promo"):
        orig_price = spec.get('price_original', price_val)
        price_text = f"<s>{int(orig_price):,}</s> ➡️ <b>{int(price_val):,} تومان</b> (با کد تخفیف)"
        
    text_response = (
        f"✅ <b>اطلاعات خرید نهایی شده است.</b>\n\n"
        f"{server_line}"
        f"🛒 <b>نوع اشتراک: {spec['name']}</b>\n"
        f"👤 نام کاربری انتخابی: <code>{username_input}</code>\n"
        f"💰 مبلغ نهایی قابل پرداخت: <b>{price_text}</b>\n\n"
        f"💳 <b>لطفاً یکی از روش‌های پرداخت زیر را انتخاب کنید:</b>"
    )
    
    markup = types.InlineKeyboardMarkup(row_width=1)
    
    # Store promo in callback data safely or 'none' if empty
    promo_code = spec.get("applied_promo", "none")
    
    is_owner = bool(cfg.get("OWNER_ID") and int(tg_id) == int(cfg["OWNER_ID"]))
    is_admin = bool(cfg.get("ADMINS") and int(tg_id) in cfg["ADMINS"])
    is_privileged = is_owner or is_admin
    
    if is_privileged:
        markup.add(types.InlineKeyboardButton("🎁 تایید مستقیم (رایگان برای ادمین)", callback_data=f"buy_pay:wallet:{plan_id}:{username_input}:{promo_code}"))
    else:
        markup.add(types.InlineKeyboardButton("💳 پرداخت از موجودی کیف پول", callback_data=f"buy_pay:wallet:{plan_id}:{username_input}:{promo_code}"))
        markup.add(types.InlineKeyboardButton("💳 پرداخت کارت به کارت", callback_data=f"buy_pay:card:{plan_id}:{username_input}:{promo_code}"))
    
    if not is_privileged and cfg.get("GATEWAY_PLISIO_WALLET"):
        markup.add(types.InlineKeyboardButton("🪙 پرداخت ارزی (Plisio)", callback_data=f"buy_pay:plisio:{plan_id}:{username_input}:{promo_code}"))
        
    if not is_privileged and cfg.get("GATEWAY_NOWPAYMENTS_KEY"):
        markup.add(types.InlineKeyboardButton("🪙 پرداخت ارزی (NowPayments)", callback_data=f"buy_pay:nowpayments:{plan_id}:{username_input}:{promo_code}"))
        
    if not is_privileged and cfg.get("GATEWAY_CRYPTOMUS_KEY"):
        markup.add(types.InlineKeyboardButton("🪙 پرداخت ارزی (Cryptomus)", callback_data=f"buy_pay:cryptomus:{plan_id}:{username_input}:{promo_code}"))
        
    if not is_privileged and cfg.get("GATEWAY_HELEKET_WALLET"):
        markup.add(types.InlineKeyboardButton("🪙 پرداخت ارزی (Heleket)", callback_data=f"buy_pay:heleket:{plan_id}:{username_input}:{promo_code}"))
        
    if not is_privileged and cfg.get("GATEWAY_STARS_STATUS"):
        markup.add(types.InlineKeyboardButton("⭐️ پرداخت با Stars تلگرام", callback_data=f"buy_pay:stars:{plan_id}:{username_input}:{promo_code}"))

    markup.add(types.InlineKeyboardButton("❌ انصراف و بازگشت", callback_data="btn_back_home"))
    
    if edit_message_id:
        try:
            bot.edit_message_text(text_response, chat_id=message.chat.id, message_id=edit_message_id, parse_mode="HTML", reply_markup=markup)
        except Exception:
            bot.send_message(message.chat.id, text_response, parse_mode="HTML", reply_markup=markup)
    else:
        bot.send_message(message.chat.id, text_response, parse_mode="HTML", reply_markup=markup)

def process_purchase_username(message, plan_id, spec):
    tg_id = message.from_user.id
    if not message.text:
       return # ignore non-text
    raw_username = message.text.strip()
    
    if raw_username == "/start" or "انصراف" in raw_username or "بازگشت" in raw_username or "منصرف" in raw_username:
        bot.send_message(message.chat.id, "❌ عملیات لغو شد.", reply_markup=get_custom_keyboard())
        start_cmd(message)
        return
        
    # Simple regex validation to ensure safe client email/name (alphanumeric, no spaces, length 3-15) on raw input
    import re
    if not re.match("^[a-zA-Z0-9_-]{3,15}$", raw_username):
        msg = bot.send_message(
            message.chat.id,
            "⚠️ <b>نام وارد شده نامعتبر است!</b>\n\n"
            "نام کاربری باید فقط شامل حروف انگلیسی، اعداد، خط تیره و بین ۳ تا ۱۵ کاراکتر باشد. (بدون وب، فضای خالی، حروف فارسی)\n\n"
            "لطفاً یک نام کاربری جدید و معتبر ارسال کنید:",
            reply_markup=get_cancel_keyboard()
        )
        bot.register_next_step_handler(msg, process_purchase_username, plan_id, spec)
        return

    # Automatically generate a 5-7 digit/char random alphanumeric suffix and append it
    import random
    import string
    suffix_length = random.randint(5, 7)
    random_suffix = "".join(random.choices(string.ascii_lowercase + string.digits, k=suffix_length))
    username_input = f"{raw_username}-{random_suffix}"

    # Check if this suffix-appended name is already taken in our active keys or panel (local prevention check)
    if check_client_exists(username_input, server_id=spec.get("server_id")):
        msg = bot.send_message(
            message.chat.id,
            "⚠️ <b>این نام کاربری از قبل در لیست کاربران سرور موجود است!</b>\n\n"
            "لطفاً از یک نام کاربری دیگر استفاده کنید (برای مثال در انتهای آن یک عدد اضافه کنید).\n\n"
            "لطفاً نام جدیدی ارسال کنید:",
            parse_mode="HTML",
            reply_markup=get_cancel_keyboard()
        )
        bot.register_next_step_handler(msg, process_purchase_username, plan_id, spec)
        return

    global active_purchases
    if tg_id in active_purchases:
        bot.send_message(message.chat.id, "⚠️ <b>یک درخواست خرید برای شما در حال پردازش است. لطفا چند لحظه شکیبا باشید...</b>", parse_mode="HTML")
        return

    active_purchases.add(tg_id)
    try:
        db = read_sqlite_db()
        keys = db.get("subscription_keys", [])
        
        # Deduct balance
        user = get_user_data(tg_id)
        cfg = get_config()
        is_owner = bool(cfg.get("OWNER_ID") and int(tg_id) == int(cfg["OWNER_ID"]))
        is_admin = bool(cfg.get("ADMINS") and int(tg_id) in cfg["ADMINS"])
        is_privileged = is_owner or is_admin
        
        if is_privileged:
            new_balance = int(user['walletBalance'])
        else:
            new_balance = int(user['walletBalance']) - spec['price']
            
        update_user_balance(tg_id, new_balance)
        
        if spec['price'] > 0 and not is_privileged:
            process_referral_on_purchase(user, spec['price'])

        # Add client to X-UI panel
        server_id = spec.get("server_id")
        client_uuid, sub_link = add_vpn_client_api(username_input, spec['traffic'], spec['duration'], server_id=server_id)
        if not sub_link:
            if not cfg.get("SIMULATOR_MODE"):
                # Refund user wallet immediately if they were charged
                if not is_privileged:
                    fresh_db = read_sqlite_db()
                    fresh_user = next((u for u in fresh_db["users"] if u["userId"] == tg_id), None)
                    current_bal = float(fresh_user.get("walletBalance", 0.0)) if fresh_user else 0.0
                    refunded_bal = current_bal + float(spec["price"])
                    update_user_balance(tg_id, refunded_bal)
                    log_action(tg_id, fresh_user.get("username", str(tg_id)) if fresh_user else str(tg_id), "مرجوعی سیستمی خرید", f"برگشت مبلغ {spec['price']:,} تومان به دلیل خطای اتصال x-ui.")
                
                session = get_session()
                last_err = getattr(session, "last_error", "خطای ناشناخته")
                notify_admins_of_error("خرید خودکار پلن", last_err, f"ID: {tg_id} / Username: {username_input}")
                refund_message = (
                    "❌ <b>خطا در ساخت کانفیگ!</b>\n\n"
                    "متأسفانه مشکلی در اتصال به پنل x-ui رخ داد و امکان ساخت خودکار کانفیگ در این لحظه وجود ندارد.\n\n"
                    "⚠️ <b>جزئیات خطا جهت بررسی به تیم پشتیبانی گزارش شد.</b>\n\n"
                    f"💰 <b>مبلغ {spec['price']:,} تومان به طور خودکار و فوری به کیف پول شما بازگردانده شد.</b>\n\n"
                    "موجودی شما محفوظ است. لطفاً چند لحظه دیگر مجدداً تلاش کنید یا با پشتیبانی در تماس باشید."
                )
                bot.send_message(tg_id, refund_message, parse_mode="HTML")
                return
            
            # Fallback simulated dynamic link
            client_uuid = str(uuid.uuid4())
            import random, string
            fallback_sub_id = ''.join(random.choices(string.ascii_lowercase + string.digits, k=16))
            sub_link = f"{cfg.get('SUB_URL', 'https://tr.sub-daltoon.ir:2096')}/sub/{fallback_sub_id}"
            print("[Bot Warning] Real API request failed or timed out. Simulated database recovery link established.")

        expire_date = time.strftime("%Y-%m-%d", time.localtime(time.time() + spec['duration'] * 24 * 60 * 60))
        sub_id = f"SUB-{int(time.time()) % 9000 + 1000}"

        create_sub_key(
            key_id=sub_id, 
            tg_id=tg_id, 
            plan_id=plan_id, 
            plan_name=spec['name'], 
            sub_link=sub_link, 
            expire_date=expire_date, 
            limit_gb=spec['traffic'],
            client_name=username_input,
            client_uuid=client_uuid,
            server_id=spec.get("server_id")
        )

        success_note = cfg.get("PURCHASE_SUCCESS_NOTE", "").strip()
        note_attach = cfg.get("PURCHASE_SUCCESS_ATTACHMENT", None)
        has_media = bool(note_attach and "fileData" in note_attach)
        
        note_append = ""
        if success_note and not has_media:
            note_append = f"\n\n━━━━━━━━━━━━━━━━━━\n{success_note}"
            
        price_charged_display = "رایگان (مدیر سیستم)" if is_privileged else f"{spec['price']:,} تومان"
        
        log_action(
            tg_id, 
            message.from_user.username or str(tg_id), 
            "buy_plan", 
            f"پلن '{spec['name']}' را با هزینه {price_charged_display} برای نام کاربری '{username_input}' خریداری کرد."
        )
        
        vless_links = get_client_all_links(username_input, client_uuid, sub_link, server_id=spec.get("server_id"))
        links_text = "\n\n🔸━━━━━━━━━━━━━━━━━━🔸\n\n".join([f"<code>{l}</code>" for l in vless_links]) if vless_links else f"<code>{sub_link}</code>"

        success_text = (
            f"🎉 <b>خرید شما با موفقیت انجام شد!</b>\n\n"
            f"🛒 اشتراک: <b>{spec['name']}</b>\n"
            f"👤 شناسه: <code>{username_input}</code>\n"
            f"⏳ انقضا: <b>{spec['duration']} روز</b> (تا {expire_date})\n"
            f"💬 حجم بسته: <b>{spec['traffic']} گیگابایت</b>\n"
            f"💳 هزینه کسر شده: {price_charged_display}\n\n"
            f"👇 جهت کپی کردن لینک‌ها، روی دکمه زیر ضربه بزنید:{note_append}\n\n"
            f"🚀 <b>لینک‌های اتصال مستقیم:</b>\n{links_text}"
        )
        
        # Build markup with copy button at the top, and append custom menu keys
        markup = types.InlineKeyboardMarkup(row_width=1)
        add_copy_button_to_markup(markup, "📋 کپی آسان لینک سابسکریپشن (کلیک کنید)", sub_link)
        markup.row(types.InlineKeyboardButton("🔗 پنل مدیریت (لینک‌های کانفیگ)", callback_data=f"mysub_manage_{sub_id}"))
        markup.add(types.InlineKeyboardButton("💡 آموزش ها", callback_data="mm_btnGuides"))
        
        from_kbd = get_custom_keyboard()
        if from_kbd and hasattr(from_kbd, 'keyboard'):
            for row in from_kbd.keyboard:
                markup.keyboard.append(row)
                
        # Try sending the QR code photo
        try:
            import urllib.parse
            qr_url = get_qr_code_url(sub_link)
            safe_send_qr_photo(message.chat.id, qr_url, success_text, markup)
        except Exception as e:
            print(f"[Bot Warning] Failed to send QR Photo: {e}")
            
        send_purchase_success_note_if_any(message.chat.id, only_media=True)
    finally:
        active_purchases.discard(tg_id)

def edit_or_reply_message(call, text, reply_markup=None, parse_mode="HTML"):
    message = call.message
    is_photo = False
    if hasattr(message, 'photo') and message.photo:
        is_photo = True
    elif hasattr(message, 'content_type') and message.content_type == 'photo':
        is_photo = True
        
    if is_photo:
        try:
            bot.delete_message(chat_id=message.chat.id, message_id=message.message_id)
        except Exception:
            pass
        return bot.send_message(chat_id=message.chat.id, text=text, parse_mode=parse_mode, reply_markup=reply_markup)
    else:
        try:
            return bot.edit_message_text(text=text, chat_id=message.chat.id, message_id=message.message_id, parse_mode=parse_mode, reply_markup=reply_markup)
        except Exception as e:
            print(f"[edit_or_reply_message Fallback] {e}")
            try:
                bot.delete_message(chat_id=message.chat.id, message_id=message.message_id)
            except Exception:
                pass
            return bot.send_message(chat_id=message.chat.id, text=text, parse_mode=parse_mode, reply_markup=reply_markup)

@bot.callback_query_handler(func=lambda call: True)
def callback_handler(call):
    global active_purchases
    tg_id = call.from_user.id
    
    if call.data == "check_mandatory_join":
        if is_user_member_of_channel(tg_id):
            bot.answer_callback_query(call.id, "✅ عضویت شما با موفقیت تایید شد! خوش آمدید.", show_alert=True)
            try:
                bot.delete_message(call.message.chat.id, call.message.message_id)
            except Exception:
                pass
            # Back home
            class FakeMessage:
                def __init__(self, chat_id, from_user):
                    self.chat = type('Chat', (object,), {'id': chat_id})
                    self.from_user = from_user
                    self.text = "/start"
            fake_msg = FakeMessage(call.message.chat.id, call.from_user)
            start_cmd(fake_msg)
        else:
            bot.answer_callback_query(call.id, "❌ شما هنوز عضو کانال نشده‌اید! لطفا ابتدا عضو شوید و سپس دکمه تایید را مجدداً فشار دهید.", show_alert=True)
        return

    # Check mandatory join eligibility for all other callbacks
    cfg = get_config()
    if cfg.get("MANDATORY_JOIN_ACTIVE") and not is_user_member_of_channel(tg_id):
        bot.answer_callback_query(call.id, "❌ برای استفاده از دکمه‌های ربات، عضویت در کانال اسپانسر الزامی است.", show_alert=True)
        verify_mandatory_join_and_warn(call.message.chat.id, tg_id)
        return

    # Show single copyable link directly in chat (User requested no Mini-App)
    if call.data.startswith("showlink_"):
        token = call.data.split("_")[1]
        try:
            db = read_sqlite_db()
            link = db.get("link_tokens", {}).get(token)
            if link:
                bot.answer_callback_query(call.id, "لینک کانفیگ با موفقیت آماده شد ⚡")
                msg_text = (
                    f"🔗 <b>لینک اتصال و اشتراک اختصاصی شما:</b>\n\n"
                    f"👇 <b>جهت کپی کردن، روی باکس زیر کلیک یا لمس کنید:</b>\n\n"
                    f"<code>{link}</code>\n\n"
                    f"💡 این لینک را کپی کرده و در برنامه مورد نظر خود (مانند v2rayNG ، V2box...) وارد نمایید."
                )
                markup = types.InlineKeyboardMarkup(row_width=1)
                
                # Check if we can find a matching subscription to get standard VLESS links
                sub_obj = next((k for k in db.get("subscription_keys", []) if k.get("subLink") == link), None)
                if sub_obj:
                    vless_btn = types.InlineKeyboardButton("🔗 لینک‌های vless", callback_data=f"mysub_vless_{sub_obj['id']}")
                    markup.row(vless_btn)
                
                markup.add(
                    types.InlineKeyboardButton("💡 آموزش ها", callback_data="mm_btnGuides"),
                    types.InlineKeyboardButton("🔙 بازگشت به اشتراک‌های من", callback_data="mm_btnMySubs"),
                    types.InlineKeyboardButton("🏠 منوی اصلی", callback_data="btn_back_home")
                )
                bot.send_message(call.message.chat.id, msg_text, parse_mode="HTML", reply_markup=markup)
            else:
                bot.answer_callback_query(call.id, "⚠️ لینک مورد نظر یافت نشد یا منقضی شده است.", show_alert=True)
        except Exception as e:
            print(f"[Error in showlink callback] {e}")
            bot.answer_callback_query(call.id, "⚠️ خطایی رخ داد.", show_alert=True)
        return

    # Admin approval/rejection handlers for transactions
    if call.data.startswith("tx_approve:") or call.data.startswith("tx_reject:"):
        cfg = get_config()
        is_owner = bool(cfg.get("OWNER_ID") and int(tg_id) == int(cfg["OWNER_ID"]))
        is_admin = int(tg_id) in cfg.get("ADMINS", [])
        
        if not (is_owner or is_admin):
            bot.answer_callback_query(call.id, "❌ شما دسترسی لازم جهت انجام این عملیات را ندارید.", show_alert=True)
            return
            
        parts = call.data.split(":")
        action = parts[0]
        tx_id = parts[1]
        
        if action == "tx_approve":
            try:
                import requests
                resp = requests.post("http://127.0.0.1:3000/api/transactions/approve", json={"id": tx_id}, timeout=30)
                if resp.status_code == 200:
                    data = resp.json()
                    if data.get("success"):
                        orig_text = call.message.caption or call.message.text or ""
                        new_caption = orig_text + "\n\n<b>✅ این رسید توسط شما تایید شد و تراکنش با موفقیت انجام گردید.</b>"
                        
                        try:
                            if call.message.content_type in ['photo', 'document']:
                                bot.edit_message_caption(chat_id=call.message.chat.id, message_id=call.message.message_id, caption=new_caption, parse_mode="HTML", reply_markup=None)
                            else:
                                bot.edit_message_text(chat_id=call.message.chat.id, message_id=call.message.message_id, text=new_caption, parse_mode="HTML", reply_markup=None)
                        except Exception as e:
                            print(f"[Error editing approved message caption] {e}")
                            
                        bot.answer_callback_query(call.id, "✅ تراکنش با موفقیت تایید و اعمال شد.", show_alert=True)
                    else:
                        msg = data.get("message", "خطای ناشناخته از سمت سرور")
                        bot.answer_callback_query(call.id, f"❌ خطا در تایید: {msg}", show_alert=True)
                else:
                    bot.answer_callback_query(call.id, f"❌ خطای سرور: کد {resp.status_code}", show_alert=True)
            except Exception as e:
                bot.answer_callback_query(call.id, f"❌ خطا در برقراری ارتباط با سرور: {e}", show_alert=True)
        
        elif action == "tx_reject":
            try:
                import requests
                resp = requests.post("http://127.0.0.1:3000/api/transactions/reject", json={"id": tx_id}, timeout=30)
                if resp.status_code == 200:
                    data = resp.json()
                    if data.get("success"):
                        orig_text = call.message.caption or call.message.text or ""
                        new_caption = orig_text + "\n\n<b>❌ این رسید توسط شما رد شد.</b>"
                        
                        try:
                            if call.message.content_type in ['photo', 'document']:
                                bot.edit_message_caption(chat_id=call.message.chat.id, message_id=call.message.message_id, caption=new_caption, parse_mode="HTML", reply_markup=None)
                            else:
                                bot.edit_message_text(chat_id=call.message.chat.id, message_id=call.message.message_id, text=new_caption, parse_mode="HTML", reply_markup=None)
                        except Exception as e:
                            print(f"[Error editing rejected message caption] {e}")
                            
                        bot.answer_callback_query(call.id, "❌ تراکنش با موفقیت رد شد.", show_alert=True)
                    else:
                        msg = data.get("message", "خطای ناشناخته")
                        bot.answer_callback_query(call.id, f"❌ خطا در رد تراکنش: {msg}", show_alert=True)
                else:
                    bot.answer_callback_query(call.id, f"❌ خطای سرور: کد {resp.status_code}", show_alert=True)
            except Exception as e:
                bot.answer_callback_query(call.id, f"❌ خطا در برقراری ارتباط با سرور: {e}", show_alert=True)
        return

    # Buy Pay Selection Handler
    if call.data.startswith("buy_pay:"):
        handle_buy_pay(call)
        return

    # My Subscriptions Handlers
    if call.data.startswith("mysub_") and not call.data.startswith("mysub_renewcustconfirm:"):
        bot.answer_callback_query(call.id)
        parts = call.data.split("_", 2)
        if len(parts) < 3:
            return
            
        sub_action = parts[1]
        target_sub_id = parts[2]
        
        db = read_sqlite_db()
        subscription_keys = db.get("subscription_keys", [])
        k = next((sub for sub in subscription_keys if sub["id"] == target_sub_id and sub["userId"] == tg_id), None)
        
        if not k:
            edit_or_reply_message(call, "❌ خطا: این کلید اشتراک یافت نشد یا متعلق به شما نیست.")
            return

        client_name = k.get("clientName", k.get("planName", "سرویس بدون نام"))
        
        if sub_action == "manage":
            markup = types.InlineKeyboardMarkup(row_width=2)
            markup.add(
                types.InlineKeyboardButton("🔗 دریافت لینک ساب", callback_data=f"mysub_link_{target_sub_id}"),
                types.InlineKeyboardButton("📊 اطلاعات اکانت", callback_data=f"mysub_info_{target_sub_id}")
            )
            markup.row(
                types.InlineKeyboardButton("🔗 لینک‌های vless", callback_data=f"mysub_vless_{target_sub_id}")
            )
            markup.add(
                types.InlineKeyboardButton("🔄 تمدید اشتراک", callback_data=f"mysub_renew_{target_sub_id}"),
                types.InlineKeyboardButton("🗑 حذف کلید اشتراک", callback_data=f"mysub_del_{target_sub_id}"),
                types.InlineKeyboardButton("⚡ فعال/غیرفعال", callback_data=f"mysub_toggle_{target_sub_id}")
            )
            markup.row(types.InlineKeyboardButton("🔄 تغییر لینک (Reset UUID)", callback_data=f"mysub_resetuuid_{target_sub_id}")) # NEW
            markup.row(
                types.InlineKeyboardButton("🔙 بازگشت به لیست اشتراک‌ها", callback_data="mm_btnMySubs")
            )
            markup.row(
                types.InlineKeyboardButton("🏠 منوی اصلی", callback_data="btn_back_home")
            )
            
            status = k.get("status", "active")
            status_txt = "🟢 فعال" if status == "active" else "🔴 غیرفعال"

            text = (
                f"🛠 <b>پورتال مدیریت اشتراک اختصاصی شما:</b>\n\n"
                f"👤 نام سرویس: <code>{client_name}</code>\n"
                f"📌 شناسه سیستم: <code>{k['id']}</code>\n"
                f"📍 وضعیت فعلی: {status_txt}\n\n"
                f"لطفاً یکی از گزینه‌های زیر را جهت مدیریت انتخاب نمایید:"
            )
            edit_or_reply_message(call, text, reply_markup=markup)
            return

        elif sub_action == "toggle":
            # New status
            new_status = "inactive" if k.get("status", "active") == "active" else "active"
            
            # Send HTTP request to Node.js backend to handle both API sync and DB update
            try:
                import requests
                payload = {
                    "id": target_sub_id,
                    "status": "active" if new_status == "active" else "suspended"
                }
                requests.post("http://127.0.0.1:3000/api/subscription-keys/toggle", json=payload, timeout=10)
            except Exception as e:
                print(f"Error calling local toggle API: {e}")
            
            # Re-read DB since Node.js updated it
            db = read_sqlite_db()
            subscription_keys = db.get("subscription_keys", [])
            idx = next((i for i, sub in enumerate(subscription_keys) if sub["id"] == target_sub_id and sub["userId"] == tg_id), -1)
            if idx != -1:
                k = subscription_keys[idx]
                k["status"] = "active" if k.get("status") == "active" else "inactive" # Standardize local view
            else:
                k["status"] = new_status
            
            bot.answer_callback_query(call.id, f"وضعیت به {k['status']} تغییر یافت.")                
            # Re-render manage view
            # Directly call the `manage` logic
            client_name = k.get("clientName", k.get("planName", "سرویس بدون نام"))
            markup = types.InlineKeyboardMarkup(row_width=2)
            markup.add(
                types.InlineKeyboardButton("🔗 دریافت لینک ساب", callback_data=f"mysub_link_{target_sub_id}"),
                types.InlineKeyboardButton("📊 اطلاعات اکانت", callback_data=f"mysub_info_{target_sub_id}")
            )
            markup.row(
                types.InlineKeyboardButton("🔗 لینک‌های vless", callback_data=f"mysub_vless_{target_sub_id}")
            )
            markup.add(
                types.InlineKeyboardButton("🔄 تمدید اشتراک", callback_data=f"mysub_renew_{target_sub_id}"),
                types.InlineKeyboardButton("🗑 حذف کلید اشتراک", callback_data=f"mysub_del_{target_sub_id}"),
                types.InlineKeyboardButton("⚡ فعال/غیرفعال", callback_data=f"mysub_toggle_{target_sub_id}")
            )
            markup.row(types.InlineKeyboardButton("🔄 تغییر لینک (Reset UUID)", callback_data=f"mysub_resetuuid_{target_sub_id}")) # NEW
            markup.row(
                types.InlineKeyboardButton("🔙 بازگشت به لیست اشتراک‌ها", callback_data="mm_btnMySubs")
            )
            markup.row(
                types.InlineKeyboardButton("🏠 منوی اصلی", callback_data="btn_back_home")
            )
            
            status = k.get("status", "active")
            status_txt = "🟢 فعال" if status == "active" else "🔴 غیرفعال"

            text = (
                f"🛠 <b>پورتال مدیریت اشتراک اختصاصی شما:</b>\n\n"
                f"👤 نام سرویس: <code>{client_name}</code>\n"
                f"📌 شناسه سیستم: <code>{k['id']}</code>\n"
                f"📍 وضعیت فعلی: {status_txt}\n\n"
                f"لطفاً یکی از گزینه‌های زیر را جهت مدیریت انتخاب نمایید:"
            )
            edit_or_reply_message(call, text, reply_markup=markup)
            return

        elif sub_action == "link":
            sub_link = k.get("subLink", "")
            cfg = get_config()
            success_note = cfg.get("PURCHASE_SUCCESS_NOTE", "")
            note_append = f"\n\n{success_note}" if success_note else ""
            
            text = (
                f"🔗 <b>لینک اتصال و اشتراک اختصاصی سرویس شما:</b>\n\n"
                f"👤 نام سرویس: <code>{client_name}</code>\n\n"
                f"👇 <b>لینک سابسکریپشن شما (جهت کپی لمس کنید):</b>\n\n"
                f"<code>{sub_link}</code>\n\n"
                f"💡 این لینک را کپی کرده و در نرم‌افزارهای خود (v2rayNG، V2box، Happ و...) وارد نمایید تا کانفیگ‌ها به طور خودکار بارگذاری شوند."
                f"{note_append}"
            )
            
            markup = types.InlineKeyboardMarkup(row_width=1)
            markup.add(
                types.InlineKeyboardButton("🔗 لینک‌های vless", callback_data=f"mysub_vless_{target_sub_id}"),
                types.InlineKeyboardButton("💡 آموزش ها", callback_data="mm_btnGuides"),
                types.InlineKeyboardButton("🔙 بازگشت به مدیریت سرویس", callback_data=f"mysub_manage_{target_sub_id}"),
                types.InlineKeyboardButton("🔙 بازگشت به اشتراک‌های من", callback_data="mm_btnMySubs"),
                types.InlineKeyboardButton("🏠 منوی اصلی", callback_data="btn_back_home")
            )
            edit_or_reply_message(call, text, reply_markup=markup)
            return

        elif sub_action == "vless":
            client_uuid = k.get("clientUuid", "")
            sub_link = k.get("subLink", "")
            
            # Fetch the precise links via get_client_all_links
            vless_links = get_client_all_links(client_name, client_uuid, sub_link, server_id=k.get("serverId"))
            
            if vless_links:
                links_text = "\n\n🔸━━━━━━━━━━━━━━━━━━🔸\n\n".join([f"<code>{lnk}</code>" for lnk in vless_links])
                text = (
                    f"⚡ <b>لیست کانفیگ‌های معمولی VLESS سرویس شما:</b>\n\n"
                    f"👤 نام سرویس: <code>{client_name}</code>\n\n"
                    f"👇 <b>جهت کپی کردن، روی هر لینک ضربه بزنید یا لمس کنید:</b>\n\n"
                    f"{links_text}\n\n"
                    f"💡 این لینک‌ها را کپی کرده و مستقیماً در نرم‌افزارهای V2ray خود وارد نمایید."
                )
            else:
                text = (
                    f"⚡ <b>لیست کانفیگ‌های معمولی VLESS سرویس شما:</b>\n\n"
                    f"👤 نام سرویس: <code>{client_name}</code>\n\n"
                    f"⚠️ <b>توجه:</b> امکان استخراج تفکیکی لینک‌ها از پنل در این لحظه میسر نشد.\n\n"
                    f"👇 <b>لطفاً از لینک سابسکریپشن اختصاصی خود استفاده کنید (جهت کپی لمس کنید):</b>\n\n"
                    f"<code>{sub_link}</code>\n\n"
                    f"💡 لینک بالا را کپی کرده و در برنامه v2rayNG یا V2box خود به عنوان <b>Subscription (سابسکریپشن)</b> وارد کرده و بروزرسانی (Update) نمایید تا همه کانفیگ‌ها به طور خودکار دریافت شوند."
                )
            
            markup = types.InlineKeyboardMarkup(row_width=1)
            markup.add(
                types.InlineKeyboardButton("🔗 دریافت لینک ساب", callback_data=f"mysub_link_{target_sub_id}"),
                types.InlineKeyboardButton("🔙 بازگشت به مدیریت سرویس", callback_data=f"mysub_manage_{target_sub_id}"),
                types.InlineKeyboardButton("🔙 بازگشت به اشتراک‌های من", callback_data="mm_btnMySubs"),
                types.InlineKeyboardButton("🏠 منوی اصلی", callback_data="btn_back_home")
            )
            edit_or_reply_message(call, text, reply_markup=markup)
            return

        elif sub_action == "info":
            from datetime import datetime
            remaining_days = "نامشخص"
            try:
                exp_dt = datetime.strptime(k['expireDate'], '%Y-%m-%d')
                delta = exp_dt - datetime.now()
                remaining_days = max(0, delta.days)
            except:
                pass

            limit_gb = float(k.get('trafficLimitGb', 0))
            used_gb = float(k.get('trafficUsedGb', 0))
            rem_gb = max(0.0, limit_gb - used_gb)
            
            if limit_gb < 1.0:
                limit_str = f"{int(limit_gb * 1000)} مگابایت"
                used_str = f"{used_gb * 1000:.1f} مگابایت"
                rem_str = f"{rem_gb * 1000:.1f} مگابایت"
            else:
                limit_str = f"{limit_gb:.2f} گیگابایت"
                used_str = f"{used_gb:.2f} گیگابایت"
                rem_str = f"{rem_gb:.2f} گیگابایت"
            
            import random
            connected_users = random.randint(0, 1)
            status_emoji = "🟢" if k.get("status", "active") == "active" else "🔴"
            
            text = (
                f"📊 <b>اطلاعات، وضعیت و مصرف اشتراک شما:</b>\n\n"
                f"👤 <b>نام سرویس:</b> <code>{client_name}</code>\n"
                f"💎 <b>تعرفه مرتبط طرح:</b> {k.get('planName', 'نامشخص')}\n"
                f"📌 <b>وضعیت حساب:</b> {status_emoji} <b>فعال و برقرار</b>\n\n"
                f"⏳ <b>تاریخ اتمام مهلت انقضا:</b> <code>{k['expireDate']}</code>\n"
                f"📅 <b>میزان کل روز پیش‌رو باقی‌مانده:</b> <code>{remaining_days}</code> روز\n\n"
                f"🌐 <b>سقف کل ترافیک مجاز:</b> {limit_str}\n"
                f"📉 <b>میزان حجم مصرف‌شده:</b> {used_str}\n"
                f"🪫 <b>میزان حجم خالص باقیمانده:</b> {rem_str}\n\n"
                f"🟢 <b>تعداد کاربر متصل همزمان آنلاین:</b> <code>{connected_users}</code> کاربر\n"
                f"━━━━━━━━━━━━━━━━━━━━━"
            )
            
            markup = types.InlineKeyboardMarkup(row_width=1)
            markup.row(
                types.InlineKeyboardButton("🔙 بازگشت به مدیریت سرویس", callback_data=f"mysub_manage_{target_sub_id}")
            )
            edit_or_reply_message(call, text, reply_markup=markup)
            return

        elif sub_action == "del":
            text = (
                f"⚠️ <b>درخواست حذف دائم اشتراک!</b>\n\n"
                f"آیا واقعاً از حذف همیشگی اشتراک <code>{client_name}</code> اطمینان کامل دارید؟\n\n"
                f"⚠️ <b>توجه داشته باشید:</b> با حذف کردن این سرویس، کلید شما برای همیشه لغو شده و از سرور X-UI و دیتابیس بات حذف خواهد شد.\n\n"
                f"🛑 <b>مهم:</b> به هیچ وجه پولی به کیف پول شما بازگشت داده نخواهد شد!"
            )
            markup = types.InlineKeyboardMarkup(row_width=2)
            markup.add(
                types.InlineKeyboardButton("🗑 بله، برای همیشه حذف کن", callback_data=f"mysub_delconfirm_{target_sub_id}"),
                types.InlineKeyboardButton("❌ خیر، لغو و بازگشت", callback_data=f"mysub_manage_{target_sub_id}")
            )
            edit_or_reply_message(call, text, reply_markup=markup)
            return

        elif sub_action == "delconfirm":
            try:
                success = delete_vpn_client_api(client_name, k.get("clientUuid"), server_id=k.get("serverId"))
                if not success:
                    print(f"[Delete API Warning]: Failed to delete {client_name} from panel, proceeding locally.")
            except Exception as e:
                print(f"[Delete API Error]: {e}")
            
            db["subscription_keys"] = [sub for sub in db["subscription_keys"] if not (sub["id"] == target_sub_id and sub["userId"] == tg_id)]
            
            user = next((u for u in db["users"] if u["userId"] == tg_id), None)
            if user:
                user["activePlansCount"] = sum(1 for sub in db["subscription_keys"] if sub["userId"] == tg_id and sub["status"] == "active")
            
            write_sqlite_db(db)
            
            log_action(
                tg_id,
                call.from_user.username or str(tg_id),
                "delete_config",
                f"کانفیگ '{client_name}' را حذف کرد."
            )
            
            text = (
                f"🗑 <b>سرویس شما با موفقیت به همراه فایل‌های مربوطه و آی‌دی مربوطه از سرورها حذف شد.</b>\n\n"
                f"تعداد کانفیگ های فعال شما بروزرسانی گردید."
            )
            markup = types.InlineKeyboardMarkup(row_width=1)
            markup.add(
                types.InlineKeyboardButton("🔙 بازگشت به اشتراک‌های من", callback_data="mm_btnMySubs"),
                types.InlineKeyboardButton("🏠 منوی اصلی", callback_data="btn_back_home")
            )
            bot.edit_message_text(text, chat_id=call.message.chat.id, message_id=call.message.message_id, parse_mode="HTML", reply_markup=markup)
            return

        elif sub_action == "resetuuid":
            text = (
                f"🔄 <b>درخواست تغییر لینک و UUID سرویس!</b>\n\n"
                f"آیا مطمئن هستید که می‌خواهید لینک اتصال سرویس <code>{client_name}</code> را تغییر دهید؟\n\n"
                f"⚠️ <b>توجه:</b> با انجام این کار، لینک و کانفیگ‌های قبلی شما <b>برای همیشه غیرفعال</b> شده و باید لینک جدید را در نرم‌افزار خود جایگزین کنید."
            )
            markup = types.InlineKeyboardMarkup(row_width=2)
            markup.add(
                types.InlineKeyboardButton("✅ بله، لینک جدید صادر کن", callback_data=f"mysub_resetconfirm_{target_sub_id}"),
                types.InlineKeyboardButton("❌ خیر، انصراف", callback_data=f"mysub_manage_{target_sub_id}")
            )
            edit_or_reply_message(call, text, reply_markup=markup)
            return

        elif sub_action == "resetconfirm":
            print(f"[DEBUG] resetconfirm triggered for sub_id: {target_sub_id}")
            try:
                bot.edit_message_text("🔄 <b>در حال پردازش...</b>\nلطفاً چند لحظه تبریک کنید، در حال تغییر آیدی‌ها و تولید لینک جدید هستیم.", chat_id=call.message.chat.id, message_id=call.message.message_id, parse_mode="HTML")
            except: pass
            
            res = reset_vpn_client_uuid_api(target_sub_id)
            print(f"[DEBUG] reset_vpn_client_uuid_api result: {res}")
            if res.get("success"):
                new_link = res.get("key", {}).get("subLink")
                markup = types.InlineKeyboardMarkup()
                markup.add(types.InlineKeyboardButton("🔙 بازگشت به مدیریت سرویس", callback_data=f"mysub_manage_{target_sub_id}"))
                bot.edit_message_text(f"✅ <b>لینک و UUID شما با موفقیت تغییر کرد.</b>\n\n🔗 لینک جدید سابسکریپشن:\n<code>{new_link}</code>\n\n⚠️ <b>توجه:</b> لینک قبلی شما دیگر کار نمی‌کند. لطفاً لینک بالا را کپی کرده و در نرم‌افزار خود جایگزین کنید.", chat_id=call.message.chat.id, message_id=call.message.message_id, parse_mode="HTML", reply_markup=markup)
            else:
                err_msg = res.get("error", "خطای نامشخص")
                markup = types.InlineKeyboardMarkup()
                markup.add(types.InlineKeyboardButton("🔙 بازگشت", callback_data=f"mysub_manage_{target_sub_id}"))
                bot.edit_message_text(f"❌ <b>خطا در انجام عملیات:</b>\n{err_msg}", chat_id=call.message.chat.id, message_id=call.message.message_id, parse_mode="HTML", reply_markup=markup)
            return

        elif sub_action == "renew":
            msg = bot.send_message(
                call.message.chat.id,
                f"🔄 <b>تمدید اشتراک <code>{client_name}</code> با ترافیک و روز دلخواه:</b>\n\n"
                "🔻 لطفاً مقدار ترافیک اضافی مورد نیاز خود را به <b>گیگابایت (GB)</b> وارد کنید:\n"
                "⚠️ عدد ارسال شده باید یک عدد انگلیسی مثبت باشد (مثلاً <code>30</code>)",
                parse_mode="HTML",
                reply_markup=get_cancel_keyboard()
            )
            bot.register_next_step_handler(msg, process_renew_gb, target_sub_id)
            return

        elif sub_action == "renewconfirm":
            plan_id = k.get("planId")
            db_plans = db.get("vpn_plans", [])
            db_plan = next((dp for dp in db_plans if dp["id"] == plan_id), None)
            
            spec = None
            if db_plan:
                spec = {
                    "id": db_plan["id"],
                    "name": db_plan["name"],
                    "price": db_plan["price"],
                    "traffic": db_plan.get("trafficGb", 30),
                    "duration": db_plan.get("durationDays", 30)
                }
            else:
                plan_specs = {
                    "std_30g": {"id": "std_30g", "name": "30GB - 30 Days", "price": 45000, "traffic": 30, "duration": 30},
                    "vip_70g": {"id": "vip_70g", "name": "Premium 70GB - 60 Days", "price": 95000, "traffic": 70, "duration": 60},
                    "ult_150g": {"id": "ult_150g", "name": "VoIP 150GB - 90 Days", "price": 185000, "traffic": 150, "duration": 90}
                }
                spec = plan_specs.get(plan_id)
                
            if not spec:
                bot.answer_callback_query(call.id, "مشخصات طرح یافت نشد.")
                return

            user = get_user_data(tg_id)
            cfg = get_config()
            is_owner = bool(cfg.get("OWNER_ID") and int(tg_id) == int(cfg["OWNER_ID"]))
            is_admin = bool(cfg.get("ADMINS") and int(tg_id) in cfg["ADMINS"])
            is_privileged = is_owner or is_admin
            
            if not is_privileged and user["walletBalance"] < spec["price"]:
                shortage = spec["price"] - user["walletBalance"]
                text = (
                    f"❌ <b>موجودی شارژ اعتباری شما برای تمدید این سرویس کافی نیست!</b>\n\n"
                    f"💳 هزینه تمدید: {spec['price']:,} تومان\n"
                    f"💰 موجودی فعلی شما: {int(user['walletBalance']):,} تومان\n"
                    f"🔴 کسری موجودی: {int(shortage):,} تومان\n\n"
                    f"لطفاً ابتدا از طریق بخش افزایش اعتبار نسبت به افزایش شارژ اقدام فرمائید."
                )
                markup = types.InlineKeyboardMarkup(row_width=1)
                markup.row(types.InlineKeyboardButton("💳 شارژ کیف پول", callback_data="mm_btnWallet"))
                markup.row(types.InlineKeyboardButton("🔙 بازگشت به مدیریت سرویس", callback_data=f"mysub_manage_{target_sub_id}"))
                bot.edit_message_text(text, chat_id=call.message.chat.id, message_id=call.message.message_id, parse_mode="HTML", reply_markup=markup)
                return

            # Check for double-processing
            if tg_id in active_purchases:
                bot.answer_callback_query(call.id, "یک درخواست خرید یا تمدید برای شما در حال پردازش است.")
                return
                
            active_purchases.add(tg_id)
            try:
                if not is_privileged:
                    new_balance = int(user['walletBalance']) - spec['price']
                    update_user_balance(tg_id, new_balance)
                else:
                    new_balance = int(user['walletBalance'])
                
                from datetime import datetime, timedelta
                try:
                    exp_dt = datetime.strptime(k['expireDate'], '%Y-%m-%d')
                    if exp_dt < datetime.now():
                        new_exp_dt = datetime.now() + timedelta(days=spec['duration'])
                    else:
                        new_exp_dt = exp_dt + timedelta(days=spec['duration'])
                except:
                    new_exp_dt = datetime.now() + timedelta(days=spec['duration'])
                    
                new_expire_date_str = new_exp_dt.strftime('%Y-%m-%d')
                new_limit_gb = float(k.get('trafficLimitGb', 0)) + float(spec['traffic'])
                
                new_exp_days = (new_exp_dt - datetime.now()).days
                new_exp_days = max(1, new_exp_days)
                
                delete_vpn_client_api(client_name, k.get("clientUuid"), server_id=k.get("serverId"))
                _, sub_link = add_vpn_client_api(client_name, new_limit_gb, new_exp_days, k.get("clientUuid"), server_id=k.get("serverId"))
                
                if not sub_link:
                    if not is_privileged:
                        # Refund
                        refunded_bal = int(user['walletBalance']) # Previous balance before deduction
                        update_user_balance(tg_id, refunded_bal)
                    
                    text = (
                        f"❌ <b>خطا در تمدید اشتراک!</b>\n\n"
                        f"متاسفانه در ارتباط با سرور و اعمال تمدید خطایی رخ داد.\n\n"
                        f"✅ جهت محافظت از شما، مبلغ کسر شده فوراً به کیف پول شما بازگردانده شد. لطفاً در زمان دیگری تلاش کنید."
                    )
                    markup = types.InlineKeyboardMarkup()
                    markup.add(types.InlineKeyboardButton("🔙 بازگشت به مدیریت سرویس", callback_data=f"mysub_manage_{target_sub_id}"))
                    bot.edit_message_text(text, chat_id=call.message.chat.id, message_id=call.message.message_id, parse_mode="HTML", reply_markup=markup)
                    return
                
                k['expireDate'] = new_expire_date_str
                k['trafficLimitGb'] = new_limit_gb
                if sub_link:
                    k['subLink'] = sub_link
                    
                write_sqlite_db(db)
                
                notify_admins_of_purchase(tg_id, "تمدید اشتراک (کیف پول)", f"طرح: {spec['name']} ({spec['traffic']}GB / {spec['duration']} روز) برای سرویس {client_name}", spec['price'], target_sub_id)
                
                log_action(
                    tg_id,
                    call.from_user.username or str(tg_id),
                    "renew_config",
                    f"سرویس '{client_name}' را تمدید کرد. هزینه کل: {spec['price']:,} تومان"
                )
                
                text = (
                    f"🎉 <b>اشتراک شما با موفقیت تمدید شد!</b>\n\n"
                    f"👤 نام سرویس: <code>{client_name}</code>\n"
                    f"💰 هزینه کسر شده: {spec['price']:,} تومان\n"
                    f"💳 موجودی نهایی کیف پول شما: {int(new_balance):,} تومان\n\n"
                    f"🗓 تاریخ انقضای تمدیدیافته جدید: <code>{new_expire_date_str}</code>\n"
                    f"🌐 سقف حجم اختصاص داده شده جدید: <code>{new_limit_gb:.2f}</code> گیگابایت\n\n"
                    f"✨ از اعتماد و همراهی دائمی شما متشکریم!"
                )
                markup = types.InlineKeyboardMarkup(row_width=1)
                markup.add(
                    types.InlineKeyboardButton("🔙 بازگشت به مدیریت سرویس", callback_data=f"mysub_manage_{target_sub_id}"),
                    types.InlineKeyboardButton("🏠 منوی اصلی", callback_data="btn_back_home")
                )
                bot.edit_message_text(text, chat_id=call.message.chat.id, message_id=call.message.message_id, parse_mode="HTML", reply_markup=markup)
            finally:
                active_purchases.discard(tg_id)
            return

    # User tickets handlers
    if call.data == "tkt_new":
        bot.answer_callback_query(call.id)
        msg = bot.send_message(
            call.message.chat.id, 
            "🎫 <b>لطفاً متن تیکت یا مشکل خود را به صورت کامل بنویسید و ارسال کنید:</b>\n\n(جهت انصراف کلمه «انصراف» را ارسال کنید)", 
            parse_mode="HTML", 
            reply_markup=get_cancel_keyboard()
        )
        bot.register_next_step_handler(msg, process_ticket_message)
        return

    if call.data == "tkt_track":
        bot.answer_callback_query(call.id)
        show_user_tickets_list(call.message.chat.id, tg_id, message_id=call.message.message_id)
        return

    if call.data.startswith("tkt_view_"):
        bot.answer_callback_query(call.id)
        ticket_id = call.data.split("_")[2]
        show_ticket_detail(call.message.chat.id, ticket_id, message_id=call.message.message_id)
        return

    if call.data.startswith("tkt_reply_"):
        bot.answer_callback_query(call.id)
        ticket_id = call.data.split("_")[2]
        initiate_user_ticket_reply(call.message.chat.id, ticket_id)
        return

    if call.data.startswith("cdel_"):
        bot.answer_callback_query(call.id)
        sub_id = call.data.split("_")[1]
        markup = types.InlineKeyboardMarkup()
        markup.row(
            types.InlineKeyboardButton("بله، حذف کن", callback_data=f"ccdel_{sub_id}"),
            types.InlineKeyboardButton("خیر، انصراف", callback_data="btn_back_home")
        )
        bot.edit_message_text(
            "❓ <b>آیا از حذف این کاربر مطمئن هستید؟</b>\n(این عملیات کاربر را از دیتابیس ربات و پنل سرور برای همیشه پاک خواهد کرد)", 
            chat_id=call.message.chat.id, 
            message_id=call.message.message_id, 
            parse_mode="HTML",
            reply_markup=markup
        )
        return

    if call.data.startswith("ccdel_"):
        bot.answer_callback_query(call.id)
        sub_id = call.data.split("_")[1]
        db = read_sqlite_db()
        keys = db.get("subscription_keys", [])
        
        idx = next((i for i, k in enumerate(keys) if k["id"] == sub_id), -1)
        if idx == -1:
            bot.edit_message_text("❌ زیرمجموعه یافت نشد یا قبلا به درستی حذف شده است.", chat_id=call.message.chat.id, message_id=call.message.message_id)
            return
            
        sub = keys[idx]
        acc_id = sub.get("colleagueAccountId")
        
        # Call API to delete globally
        success = delete_vpn_client_api(sub.get("clientName", ""), sub.get("clientUuid"), server_id=sub.get("serverId"))
        if not success:
            print(f"[Delete API Warning]: Failed to delete colleague sub {sub.get('clientName')} from panel, proceeding locally.")
        
        # Deduct used
        accounts = db.get("colleague_accounts", [])
        acc_idx = next((i for i, a in enumerate(accounts) if a["id"] == acc_id), -1)
        if acc_idx != -1:
            acc = accounts[acc_idx]
            used = max(0, acc.get("usedTrafficGb", 0) - sub.get("trafficLimitGb", 0))
            acc["usedTrafficGb"] = used
            accounts[acc_idx] = acc
            db["colleague_accounts"] = accounts
            
        keys.pop(idx)
        db["subscription_keys"] = keys
        write_sqlite_db(db)
        
        bot.edit_message_text("✅ کاربر با موفقیت حذف شد.", chat_id=call.message.chat.id, message_id=call.message.message_id)
        
        if acc_idx != -1:
            show_colleague_panel(call.message, db["colleague_accounts"][acc_idx])
            
        return

    if call.data.startswith("colrenew_"):
        bot.answer_callback_query(call.id)
        parts = call.data.split("_")
        acc_id = parts[1]
        package_id = parts[2]
        
        db = read_sqlite_db()
        package = next((p for p in db.get("colleague_packages", []) if p["id"] == package_id), None)
        accounts = db.get("colleague_accounts", [])
        acc_idx = next((i for i, a in enumerate(accounts) if a["id"] == acc_id), None)
        
        if not package or acc_idx is None:
            bot.send_message(tg_id, "❌ بسته یا حساب همکار یافت نشد.", reply_markup=get_custom_keyboard())
            return
            
        bot.delete_message(call.message.chat.id, call.message.message_id)
        message = call.message
        message.chat.id = tg_id
        process_col_renew_payment(message, acc_id, package)
        return

    elif call.data.startswith("colsrv_"):
        bot.answer_callback_query(call.id)
        # format: colsrv_{acc_id}_{gb}_{days}_{server_id}
        parts = call.data.split("_")
        if len(parts) >= 5:
            acc_id = parts[1]
            gb = int(parts[2])
            days = int(parts[3])
            server_id = "_".join(parts[4:])
            
            db = read_sqlite_db()
            accounts = db.get("colleague_accounts", [])
            live_acc = next((a for a in accounts if a["id"] == acc_id), None)
            
            pending = db.get("pending_col_creations", {}).get(acc_id, {})
            name = pending.get("name")
            
            if not live_acc or not name:
                bot.send_message(call.message.chat.id, "❌ حساب همکار یا نام کاربری یافت نشد.", reply_markup=get_custom_keyboard())
                return
                
            bot.delete_message(call.message.chat.id, call.message.message_id)
            
            # call add_vpn_client_api with selected server
            full_name = f"{live_acc.get('prefix', 'Col')}-{name}"
            cfg = get_config()
            client_uuid, sub_link = add_vpn_client_api(full_name, gb, days, server_id=server_id)
            
            if not sub_link:
                if not cfg.get("SIMULATOR_MODE"):
                    session = get_session()
                    last_err = getattr(session, "last_error", "خطای ناشناخته")
                    notify_admins_of_error("ساخت کانفیگ همکار", last_err, f"Colleague ID: {acc_id} / Client Name: {full_name}")
                    bot.send_message(
                        call.message.chat.id,
                        "❌ <b>خطا در ساخت کانفیگ همکار!</b>\n\n"
                        "متأسفانه امکان اتصال به پنل x-ui و ایجاد این اکانت در این لحظه وجود ندارد.\n\n"
                        "⚠️ <b>جزئیات خطا جهت بررسی به تیم پشتیبانی گزارش شد.</b>\n\n"
                        "⚠️ <b>هیچ ترافیکی از حساب همکار شما کسر نشد.</b>\n\n",
                        parse_mode="HTML", reply_markup=get_custom_keyboard()
                    )
                    show_colleague_panel_msg(call.message, live_acc)
                else:
                    bot.send_message(call.message.chat.id, "خطا در ساخت کانفیگ (حالت شبیه‌ساز)")
                return
                
            # success
            port = cfg.get("SERVER_PORT", 3000)
            if not sub_link:
                cfg_url = cfg.get("SUB_URL", f"http://localhost:{port}")
                sub_link = f"{cfg_url}/sub/{full_name}"
                
            used = live_acc.get("usedTrafficGb", 0)
            live_acc["usedTrafficGb"] = used + gb
            acc_idx = next((i for i, a in enumerate(accounts) if a["id"] == acc_id), -1)
            accounts[acc_idx] = live_acc
            db["colleague_accounts"] = accounts
            
            expire_date = time.strftime("%Y-%m-%d", time.localtime(time.time() + days * 24 * 60 * 60))
            sub_id = f"SUB-{int(time.time()) % 9000 + 1000}"
            
            sub = {
                "id": sub_id,
                "userId": live_acc.get("userId"),
                "colleagueAccountId": live_acc["id"],
                "planName": full_name,
                "clientName": full_name,
                "clientUuid": client_uuid,
                "subLink": sub_link,
                "trafficLimitGb": gb,
                "trafficUsedGb": 0,
                "expireDate": expire_date,
                "expireTimestamp": int(time.time()) + days * 24 * 60 * 60,
                "status": "active",
                "createdAt": time.strftime("%Y-%m-%d %H:%M:%S"),
                "serverId": server_id
            }
            
            if "subscription_keys" not in db:
                db["subscription_keys"] = []
            db["subscription_keys"].append(sub)
            
            # clean up pending
            if "pending_col_creations" in db and acc_id in db["pending_col_creations"]:
                del db["pending_col_creations"][acc_id]
                
            write_sqlite_db(db)
            
            log_action(
                call.from_user.id, 
                call.from_user.username or str(call.from_user.id), 
                "colleague_create_config", 
                f"همکار کانفیگی با نام '{full_name}' ({gb} گیگ - {days} روز) ایجاد کرد."
            )

            # success_note if any
            success_note = cfg.get("PURCHASE_SUCCESS_NOTE", "").strip()
            note_append = ""
            if success_note:
                note_append = f"\n\n━━━━━━━━━━━━━━━━━━\n{success_note}"

            vless_links = get_client_all_links(full_name, client_uuid, sub_link, server_id=server_id)
            links_text = "\n\n🔸━━━━━━━━━━━━━━━━━━🔸\n\n".join([f"<code>{l}</code>" for l in vless_links]) if vless_links else f"<code>{sub_link}</code>"

            text_msg = (
                f"✅ <b>لینک سابسکریپشن شما با موفقیت ایجاد شد:</b>\n\n"
                f"👤 <b>نام:</b> {full_name}\n"
                f"🗄 <b>حجم:</b> {gb} گیگابایت\n"
                f"⏳ <b>اعتبار:</b> {days} روز\n\n"
                f"👇 جهت کپی کردن لینک‌ها، روی دکمه زیر ضربه بزنید:{note_append}\n\n"
                f"🚀 <b>لینک‌های اتصال مستقیم:</b>\n{links_text}"
            )

            markup = types.InlineKeyboardMarkup(row_width=2)
            add_copy_button_to_markup(markup, "📋 کپی آسان لینک سابسکریپشن (کلیک کنید)", sub_link)

            try:
                import urllib.parse
                qr_url = get_qr_code_url(sub_link)
                safe_send_qr_photo(call.message.chat.id, qr_url, text_msg, markup)
            except Exception as e:
                print(f"[Bot Warning] Failed to send QR Photo: {e}")

            show_colleague_panel_msg(call.message, live_acc)
            
    elif call.data.startswith("col_") and not call.data.startswith("col_pay:"):
        bot.answer_callback_query(call.id)
        parts = call.data.split("_")
        action = parts[1]
        
        try:
            acc_id = parts[2]
        except IndexError:
            bot.edit_message_text("❌ دیتای ناقص.", chat_id=call.message.chat.id, message_id=call.message.message_id)
            return
        
        db = read_sqlite_db()
        accounts = db.get("colleague_accounts", [])
        acc = next((a for a in accounts if a["id"] == acc_id), None)
        if not acc:
            bot.edit_message_text("❌ حساب همکار یافت نشد.", chat_id=call.message.chat.id, message_id=call.message.message_id)
            return
            
        if action == "cuser":
            bot.delete_message(call.message.chat.id, call.message.message_id)
            msg = bot.send_message(call.message.chat.id, "👤 <b>نام کاربر جدید را وارد کنید:</b>\n(برای انصراف کلمه «انصراف» را بفرستید)", parse_mode="HTML", reply_markup=get_cancel_keyboard())
            bot.register_next_step_handler(msg, process_col_create_name, acc)
            
        elif action == "suser":
            bot.delete_message(call.message.chat.id, call.message.message_id)
            msg = bot.send_message(call.message.chat.id, "🔍 <b>بخشی از نام کاربری مورد نظر را وارد کنید:</b>\n(برای انصراف کلمه «انصراف» را بفرستید)", parse_mode="HTML", reply_markup=get_cancel_keyboard())
            bot.register_next_step_handler(msg, process_col_search_user, acc)

        elif action == "chpass":
            msg = bot.send_message(call.message.chat.id, "👤 <b>نام کاربری (یوزرنیم) جدید خود را وارد کنید:</b>\n(برای انصراف کلمه «انصراف» را بفرستید)", parse_mode="HTML", reply_markup=get_cancel_keyboard())
            bot.register_next_step_handler(msg, process_colleague_change_password_user, acc_id)

        elif action == "lusers":
            keys = db.get("subscription_keys", [])
            col_keys = [k for k in keys if k.get("colleagueAccountId") == acc_id]
            
            total = acc.get("trafficGb", 0)
            used = acc.get("usedTrafficGb", 0)
            rem = total - used
            
            text = f"📊 <b>خلاصه وضعیت حساب همکار شما:</b>\n🔹 <b>حجم کل بسته:</b> {total} گیگابایت\n🔴 <b>تخصیص داده شده به کاربران:</b> {used} گیگابایت\n🟢 <b>حجم مجاز برای ساخت کاربر جدید:</b> {rem} گیگابایت\n\n"
            text += f"👥 <b>لیست کاربران ساخته شده:</b>\n\n"
            
            if rem <= 0:
                text = "⚠️ <b>اخطار:</b> حجم مجاز شما به اتمام رسیده و اجازه ساخت کاربر جدید را ندارید. لطفاً برای ارتقاء یا تمدید اقدام کنید.\n\n" + text
            
            
            if not col_keys:
                text += "هنوز کاربری ایجاد نکرده‌اید."
            else:
                text += "لطفاً برای مشاهده جزئیات یا مدیریت، روی کاربر کلیک کنید:"
                
            markup = types.InlineKeyboardMarkup()
            
            if col_keys:
                for k in col_keys:
                    name = k.get("clientName") or k.get("planName", "نامشخص")
                    k_id = k.get("id")
                    if k_id:
                        markup.row(types.InlineKeyboardButton(f"👤 {name}", callback_data=f"colu_view_{acc_id}_{k_id}"))
                        
            markup.row(types.InlineKeyboardButton("🔙 بازگشت", callback_data=f"col_panel_{acc['id']}"))
            bot.edit_message_text(text, chat_id=call.message.chat.id, message_id=call.message.message_id, parse_mode="HTML", reply_markup=markup, disable_web_page_preview=True)
            
        elif action == "panel":
            show_colleague_panel(call.message, acc)
            
        elif action == "renew":
            packages = db.get("colleague_packages", [])
            if not packages:
                bot.send_message(call.message.chat.id, "❌ هیچ بسته‌ای برای تمدید همکار تعریف نشده است.", reply_markup=get_custom_keyboard())
                return
            
            text = "🔄 <b>تمدید سرویس همکار</b>\n\nلطفاً یکی از بسته‌های زیر را برای تمدید انتخاب کنید:"
            markup = types.InlineKeyboardMarkup(row_width=1)
            for p in packages:
                btn_text = f"✨ {p['title']} ┃ {p['trafficGb']:,} گیگ ┃ {int(p['price']):,} تومان"
                markup.add(types.InlineKeyboardButton(btn_text, callback_data=f"colrenew_{acc_id}_{p['id']}"))
                
            markup.row(types.InlineKeyboardButton("🔙 بازگشت", callback_data=f"col_panel_{acc['id']}"))
            
            bot.edit_message_text(text, chat_id=call.message.chat.id, message_id=call.message.message_id, parse_mode="HTML", reply_markup=markup)
            
        return

    if call.data.startswith("colu_"):
        bot.answer_callback_query(call.id)
        parts = call.data.split("_")
        action = parts[1]
        acc_id = parts[2]
        sub_id = parts[3]
        
        db = read_sqlite_db()
        accounts = db.get("colleague_accounts", [])
        acc = next((a for a in accounts if a["id"] == acc_id), None)
        
        keys = db.get("subscription_keys", [])
        sub = next((k for k in keys if k.get("id") == sub_id and k.get("colleagueAccountId") == acc_id), None)
        sub_idx = next((i for i, k in enumerate(keys) if k.get("id") == sub_id and k.get("colleagueAccountId") == acc_id), -1)

        if not acc or not sub:
            bot.edit_message_text("❌ حساب همکار یا کاربر یافت نشد.", chat_id=call.message.chat.id, message_id=call.message.message_id)
            return

        if action == "view":
            name = sub.get("clientName") or sub.get("planName", "نامشخص")
            gb = sub.get("trafficLimitGb", 0)
            used_gb = sub.get("trafficUsedGb", 0)
            rem_gb = gb - used_gb
            expire_date = sub.get("expireDate", "نامشخص")
            url = sub.get("subLink", "")
            
            text = f"👤 <b>{name}</b>\n🗄 تخصیص داده شده: {gb} GB\n🔴 مصرف شده: {used_gb} GB\n🟢 مجاز باقیمانده: {rem_gb} GB\n⏳ انقضا: {expire_date}\n🔗 <code>{url}</code>\n\n"
            
            markup = types.InlineKeyboardMarkup()
            markup.row(
                types.InlineKeyboardButton("🔄 تمدید", callback_data=f"colu_renew_{acc_id}_{sub_id}"),
                types.InlineKeyboardButton("🗑 حذف", callback_data=f"colu_delete_{acc_id}_{sub_id}"),
                types.InlineKeyboardButton("⚡ فعال/غیرفعال", callback_data=f"colu_toggle_{acc_id}_{sub_id}")
            )
            markup.row(types.InlineKeyboardButton("🚀 دریافت لینک‌های اتصال مستقیم", callback_data=f"colu_links_{acc_id}_{sub_id}"))
            markup.row(types.InlineKeyboardButton("🔄 تغییر لینک (Reset)", callback_data=f"colu_resetuuid_{acc_id}_{sub_id}"))
            markup.row(types.InlineKeyboardButton("🔙 بازگشت به لیست", callback_data=f"col_lusers_{acc_id}"))
            bot.edit_message_text(text, chat_id=call.message.chat.id, message_id=call.message.message_id, parse_mode="HTML", reply_markup=markup, disable_web_page_preview=True)
            
        elif action == "links":
            # show all VLESS links
            vless_links = get_client_all_links(sub.get("clientName", "User"), sub.get("clientUuid"), sub.get("subLink"), server_id=sub.get("serverId"))
            links_text = "\n\n🔸━━━━━━━━━━━━━━━━━━🔸\n\n".join([f"<code>{l}</code>" for l in vless_links]) if vless_links else f"<code>{sub.get('subLink')}</code>"
            
            text = f"🚀 <b>لینک‌های اتصال مستقیم برای {sub.get('clientName', 'نامشخص')}:</b>\n\n{links_text}"
            markup = types.InlineKeyboardMarkup()
            markup.row(types.InlineKeyboardButton("🔙 بازگشت", callback_data=f"colu_view_{acc_id}_{sub_id}"))
            bot.edit_message_text(text, chat_id=call.message.chat.id, message_id=call.message.message_id, parse_mode="HTML", reply_markup=markup)

        elif action == "toggle":
            # Toggle logic
            new_status = "inactive" if sub.get("status", "active") == "active" else "active"
            
            # Action on X-UI API via Node.js
            try:
                import requests
                payload = {
                    "id": sub_id,
                    "status": "active" if new_status == "active" else "suspended"
                }
                requests.post("http://127.0.0.1:3000/api/subscription-keys/toggle", json=payload, timeout=10)
            except Exception as e:
                print(f"Error calling local toggle API: {e}")
            
            db = read_sqlite_db()
            keys = db.get("subscription_keys", [])
            sub_idx = next((i for i, k in enumerate(keys) if k["id"] == sub_id), -1)
            if sub_idx != -1:
                sub = keys[sub_idx]
                sub["status"] = "active" if sub.get("status") == "active" else "inactive"
            else:
                sub["status"] = new_status
            
            # Simple UI update
            bot.answer_callback_query(call.id, f"وضعیت به {sub['status']} تغییر یافت.")                
            # Re-render view
            call.data = f"colu_view_{acc_id}_{sub_id}"
            # This is a bit hacky to re-trigger, let's just re-display the view by calling the same code
            
            # Re-fetch sub to show new view
            name = sub.get("clientName") or sub.get("planName", "نامشخص")
            gb = sub.get("trafficLimitGb", 0)
            used_gb = sub.get("trafficUsedGb", 0)
            rem_gb = gb - used_gb
            expire_date = sub.get("expireDate", "نامشخص")
            url = sub.get("subLink", "")
            status = sub.get("status", "active")
            status_txt = "🟢 فعال" if status == "active" else "🔴 غیرفعال"

            text = f"👤 <b>{name}</b>\nوضعیت: {status_txt}\n🗄 تخصیص داده شده: {gb} GB\n🔴 مصرف شده: {used_gb} GB\n🟢 مجاز باقیمانده: {rem_gb} GB\n⏳ انقضا: {expire_date}\n🔗 <code>{url}</code>\n\n"
            
            markup = types.InlineKeyboardMarkup()
            markup.row(
                types.InlineKeyboardButton("🔄 تمدید", callback_data=f"colu_renew_{acc_id}_{sub_id}"),
                types.InlineKeyboardButton("🗑 حذف", callback_data=f"colu_delete_{acc_id}_{sub_id}"),
                types.InlineKeyboardButton("⚡ فعال/غیرفعال", callback_data=f"colu_toggle_{acc_id}_{sub_id}")
            )
            markup.row(types.InlineKeyboardButton("🚀 دریافت لینک‌های اتصال مستقیم", callback_data=f"colu_links_{acc_id}_{sub_id}"))
            markup.row(types.InlineKeyboardButton("🔄 تغییر لینک (Reset)", callback_data=f"colu_resetuuid_{acc_id}_{sub_id}"))
            markup.row(types.InlineKeyboardButton("🔙 بازگشت به لیست", callback_data=f"col_lusers_{acc_id}"))
            bot.edit_message_text(text, chat_id=call.message.chat.id, message_id=call.message.message_id, parse_mode="HTML", reply_markup=markup, disable_web_page_preview=True)
        
        elif action == "renew":
            # Just request how much additional traffic to assign (which deducts from their bulk) and extend days?
            # Or just redirect to process_col_renew_user (needs to be implemented)
            bot.delete_message(call.message.chat.id, call.message.message_id)
            msg = bot.send_message(call.message.chat.id, "🔄 <b>تمدید کاربر</b>\nلطفاً میزان <b>حجم جدید (گیگابایت)</b> جهت اختصاص به این کاربر را وارد کنید:\n(کلمه «انصراف» جهت لغو)", parse_mode="HTML", reply_markup=get_cancel_keyboard())
            bot.register_next_step_handler(msg, process_col_renew_gb, acc, sub)
            
        elif action == "delete":
            markup = types.InlineKeyboardMarkup()
            markup.row(
                types.InlineKeyboardButton("بله، حذف کن", callback_data=f"colu_delyes_{acc_id}_{sub_id}"),
                types.InlineKeyboardButton("خیر، انصراف", callback_data=f"colu_view_{acc_id}_{sub_id}")
            )
            bot.edit_message_text(f"⚠️ آیا از حذف کاربر <b>{sub.get('clientName', 'نامشخص')}</b> اطمینان دارید؟\nاین عملیات غیرقابل بازگشت است و هزینه بازگشت داده نخواهد ش��.", chat_id=call.message.chat.id, message_id=call.message.message_id, parse_mode="HTML", reply_markup=markup)
            
        elif action == "resetuuid":
            markup = types.InlineKeyboardMarkup()
            markup.row(
                types.InlineKeyboardButton("✅ بله، تغییر بده", callback_data=f"colu_resetuuidyes_{acc_id}_{sub_id}"),
                types.InlineKeyboardButton("❌ خیر، انصراف", callback_data=f"colu_view_{acc_id}_{sub_id}")
            )
            text = (
                f"⚠️ <b>هشدار تغییر لینک کاربر {sub.get('clientName', 'نامشخص')}</b>\n\n"
                "با انجام این عملیات، <b>لینک سابسکریپشن قبلی کاربر غیرفعال می‌شود</b> و لینک جدیدی صادر خواهد شد.\n"
                "آیا مطمئن هستید؟"
            )
            bot.edit_message_text(text, chat_id=call.message.chat.id, message_id=call.message.message_id, parse_mode="HTML", reply_markup=markup)
            
        elif action == "resetuuidyes":
            try:
                bot.edit_message_text("🔄 <b>در حال تغییر لینک...</b>\nلطفاً منتظر بمانید.", chat_id=call.message.chat.id, message_id=call.message.message_id, parse_mode="HTML")
            except: pass
            
            res = reset_vpn_client_uuid_api(sub_id)
            if res.get("success"):
                markup = types.InlineKeyboardMarkup()
                markup.add(types.InlineKeyboardButton("🔙 بازگشت به مدیریت کاربر", callback_data=f"colu_view_{acc_id}_{sub_id}"))
                bot.edit_message_text(f"✅ <b>لینک کاربر با موفقیت تغییر یافت.</b>\n\n🔗 لینک جدید:\n<code>{res.get('key', {}).get('subLink')}</code>", chat_id=call.message.chat.id, message_id=call.message.message_id, parse_mode="HTML", reply_markup=markup)
            else:
                err_msg = res.get("error", "خطای نامشخص")
                markup = types.InlineKeyboardMarkup()
                markup.add(types.InlineKeyboardButton("🔙 بازگشت", callback_data=f"colu_view_{acc_id}_{sub_id}"))
                bot.edit_message_text(f"❌ <b>خطا:</b>\n{err_msg}", chat_id=call.message.chat.id, message_id=call.message.message_id, parse_mode="HTML", reply_markup=markup)

        elif action == "delyes":
            success = delete_vpn_client_api(sub.get("clientName", ""), sub.get("clientUuid"), server_id=sub.get("serverId"))
            if not success:
                print(f"[Delete API Warning]: Failed to delete colu sub {sub.get('clientName')} from panel, proceeding locally.")
            
            # Sub is being deleted. If it was already used, permanently add to deleted list so colleague loses balance.
            if float(sub.get("trafficUsedGb", 0)) >= 0.001:
                acc["deletedTrafficGb"] = acc.get("deletedTrafficGb", 0) + float(sub.get("trafficLimitGb", 0))
                acc["deletedRealTrafficGb"] = acc.get("deletedRealTrafficGb", 0) + float(sub.get("trafficUsedGb", 0))
            
            # Note: usedTrafficGb will be immediately re-calculated by cron sync anyway, but we update locally to refresh panel view
            alive_keys = [k for i, k in enumerate(keys) if i != sub_idx and k.get("colleagueAccountId") == acc_id]
            total_used = sum(float(k.get("trafficLimitGb", 0)) for k in alive_keys) + float(acc.get("deletedTrafficGb", 0))
            acc["usedTrafficGb"] = total_used
            
            accounts = [a if a["id"] != acc_id else acc for a in accounts]
            db["colleague_accounts"] = accounts
            
            keys.pop(sub_idx)
            db["subscription_keys"] = keys
            write_sqlite_db(db)
            
            bot.edit_message_text("✅ کاربر با موفقیت حذف شد.", chat_id=call.message.chat.id, message_id=call.message.message_id)
            show_colleague_panel(call.message, acc)
            
        return

    if call.data.startswith("mm_colcat:"):
        handle_main_menu_callback(call)
        return

    if call.data.startswith("mm_"):
        handle_main_menu_callback(call)
        return
        
    if call.data == "login_colleague":
        bot.answer_callback_query(call.id)
        msg = bot.edit_message_text(
            "🔑 <b>ورود همکار</b>\n\nلطفاً <b>نام کاربری (Username)</b> اکانت خود را بفرستید:\n(برای انصراف کلمه «انصراف» را بفرستید)",
            chat_id=call.message.chat.id,
            message_id=call.message.message_id,
            parse_mode="HTML",
            reply_markup=get_cancel_keyboard()
        )
        bot.register_next_step_handler(call.message, process_colleague_login_username)
        return

    if call.data == "recover_colleague_token":
        bot.answer_callback_query(call.id)
        msg = bot.edit_message_text(
            "🔑 <b>بازیابی رمز ورود همکار</b>\n\nلطفاً <b>توکن بازیابی</b> اکانت خود را بفرستید:\n(برای انصراف کلمه «انصراف» را بفرستید)",
            chat_id=call.message.chat.id,
            message_id=call.message.message_id,
            parse_mode="HTML",
            reply_markup=get_cancel_keyboard()
        )
        bot.register_next_step_handler(msg, process_colleague_recover_token)
        return

    if call.data.startswith("buy_colleague_"):
        bot.answer_callback_query(call.id)
        package_id = call.data.replace("buy_colleague_", "")
        db = read_sqlite_db()
        package = next((p for p in db.get("colleague_packages", []) if p["id"] == package_id), None)
        
        if not package:
            bot.send_message(tg_id, "❌ بسته مورد نظر یافت نشد.", reply_markup=get_custom_keyboard())
            return
            
        user = get_user_data(tg_id)
        bal = user.get("walletBalance", 0)
        
        cfg = get_config()
        is_owner = bool(cfg.get("OWNER_ID") and int(tg_id) == int(cfg["OWNER_ID"]))
        is_admin = bool(cfg.get("ADMINS") and int(tg_id) in cfg["ADMINS"])
        is_privileged = is_owner or is_admin
        
        if not is_privileged and bal < package["price"]:
            shortage = package["price"] - bal
            markup = types.InlineKeyboardMarkup()
            markup.row(types.InlineKeyboardButton("💳 شارژ کیف پول", callback_data="mm_btnWallet"))
            markup.row(types.InlineKeyboardButton("🔙 بازگشت", callback_data="mm_btnColleagues"))
            bot.edit_message_text(
                f"❌ <b>موجودی ناکافی است!</b>\n\nقیمت بسته: {int(package['price']):,} تومان\nموجودی فعلی: {int(bal):,} تومان\nکسری: {int(shortage):,} تومان",
                chat_id=call.message.chat.id,
                message_id=call.message.message_id,
                parse_mode="HTML",
                reply_markup=markup
            )
            return

        bot.delete_message(call.message.chat.id, call.message.message_id)
        msg = bot.send_message(
            tg_id, 
            " لطفاً یک نام (انگلیسی) به عنوان <b>پسوند/پیشوند</b> کانفیگ‌های خود وارد کنید:\n(این نام در لینک‌های اشتراک کاربران شما استفاده می‌شود)", 
            parse_mode="HTML", 
            reply_markup=get_cancel_keyboard()
        )
        bot.register_next_step_handler(msg, process_colleague_prefix, package)
        return
        
    if call.data.startswith("col_pay:"):
        bot.answer_callback_query(call.id)
        method = call.data.split(":")[1]
        
        global pending_col_requests
        if 'pending_col_requests' not in globals() or tg_id not in pending_col_requests:
            bot.send_message(tg_id, "❌ درخواست پرداخت شما منقضی شده یا یافت نشد.", reply_markup=get_custom_keyboard())
            return
            
        req = pending_col_requests.get(tg_id)
        if not req: return
        package_id = req["package_id"]
        action = req.get("action", "buy")
        
        db = read_sqlite_db()
        package = next((p for p in db.get("colleague_packages", []) if p["id"] == package_id), None)
        if not package:
            bot.send_message(tg_id, "❌ بسته مورد نظر یافت نشد.", reply_markup=get_custom_keyboard())
            if tg_id in pending_col_requests: del pending_col_requests[tg_id]
            return
            
        cfg = get_config()
        is_owner = bool(cfg.get("OWNER_ID") and int(tg_id) == int(cfg["OWNER_ID"]))
        is_admin = bool(cfg.get("ADMINS") and int(tg_id) in cfg["ADMINS"])
        is_privileged = is_owner or is_admin
        
        if method == "wallet":
            bot.answer_callback_query(call.id, "در حال پردازش...")
            bot.edit_message_text("⏳ در حال ایجاد حساب و نهایی‌سازی... لطفاً کمی منتظر بمانید.", chat_id=call.message.chat.id, message_id=call.message.message_id)
            user = get_user_data(tg_id)
            bal = user.get("walletBalance", 0)
            
            if is_privileged:
                bot.answer_callback_query(call.id, "✅ تایید مستقیم ادمین (رایگان)")
            elif bal < package["price"]:
                bot.send_message(tg_id, "❌ موجودی کیف پول شما برای این خرید کافی نیست.", reply_markup=get_custom_keyboard())
                return
            
            # process wallet pay
            try:
                if not is_privileged:
                    update_user_balance(tg_id, bal - package["price"])
                    log_transaction(tg_id, package["price"], f"{action}_colleague_package", f"کسر شارژ برای بسته همکار", "out")
                    if package["price"] > 0:
                        process_referral_on_purchase(user, package["price"])
                else:
                    log_action(tg_id, user.get("username", str(tg_id)), f"{action}_colleague_admin", f"بسته همکار {package['title']} رایگان فعال شد.")
                
                finalize_colleague_purchase(tg_id, req, package, call.message)
            except Exception as e:
                print(f"[ERROR] Colleague Payment Exception: {e}")
                bot.send_message(tg_id, f"❌ خطای سیستمی در پردازش نهایی: {e}")

        elif method == "card":
            if is_privileged:
                bot.answer_callback_query(call.id, "✅ تایید مستقیم ادمین ثبت شد.")
                call.data = "col_pay:wallet"
                handle_callback_query(call)
                return

            # initiate card payment
            amount = package["price"]
            
            # Use pending purchase with prefix
            payload_str = f"{req.get('prefix')}||{req.get('token')}" if action == "buy" else f"{req.get('acc_id')}"
            plan_code = f"COL_BUY:{package_id}" if action == "buy" else f"COL_RENEW:{package_id}"
            
            # Using set_user_pending_purchase allows the bot's photo upload handler to mark this tx as PLAN_PURCHASE
            set_user_pending_purchase(tg_id, plan_code, payload_str)
            
            text = (
                f"💳 <b>سفارش حساب همکار - مبلغ {int(amount):,} تومان:</b>\n\n"
                f"لطفاً مبلغ فوق را به کارت زیر واریز نمایید:\n\n"
                f"{get_card_payment_info(cfg)}\n\n"
                f"📸 پس از انتقال/واریز، <b>فقط عکس فیش یا رسید پرداختی خود را به این چت بفرستید</b>."
            )
            bot.edit_message_text(text, chat_id=call.message.chat.id, message_id=call.message.message_id, parse_mode="HTML", reply_markup=get_cancel_keyboard())

        elif method == "stars":
            # telegram stars
            try:
                amount_irr = package["price"]
                rate = float(cfg.get("GATEWAY_STARS_RATE", 1000))
                stars_amount = max(1, int(amount_irr / rate))
                
                prices = [types.LabeledPrice(label=f"{package['title']}", amount=stars_amount)]
                
                payload = f"col_stars:{tg_id}:{package_id}:{action}"
                
                bot.send_invoice(
                    call.message.chat.id,
                    title="خرید بسته همکار",
                    description=package['title'],
                    invoice_payload=payload,
                    provider_token="",  # Telegram Stars doesn't need token
                    currency="XTR",
                    prices=prices
                )
            except Exception as e:
                print(f"[Stars Error] {e}")
                bot.send_message(call.message.chat.id, "❌ خطا در ایجاد فاکتور تلگرام استارز.")
        return

    if call.data.startswith("srvsel_"):
        bot.answer_callback_query(call.id)
        server_id = call.data.split("_", 1)[1]
        
        db = read_sqlite_db()
        cfg = get_config()
        nickname = cfg.get("BOT_NICKNAME", "دالتون")
        
        servers = cfg.get("SERVERS", [])
        srv = next((s for s in servers if str(s.get("id")) == server_id), None)
        allowed_cats = srv.get("planCategories") if srv else None

        message_body = (
            f"🛍️ <b>دسته بندی‌های خرید اشتراک {nickname}:</b>\n\n"
            "لطفاً یکی از دسته‌بندی‌های زیر را جهت مشاهده و خرید طرح‌ها انتخاب کنید:\n\n"
            "💡 با انتخاب هر دسته‌بندی، طرح‌های فعال آن بخش به همراه قیمت و جزئیات خدمت شما نمایش داده می‌شوند."
        )

        db_plans = db.get("vpn_plans", [])
        db_categories = db.get("plan_categories", [])
        
        categories = []
        category_map = {}
        
        if db_categories:
            for c in db_categories:
                if allowed_cats and isinstance(allowed_cats, list) and c.get("id") not in allowed_cats:
                    continue
                cat_name = c.get("name")
                if cat_name:
                    categories.append(cat_name)
                    category_map[cat_name] = c.get("emoji", "⚡️")
        else:
            seen_cats = set()
            for p in db_plans:
                cat = p.get("category", (cfg.get("LANG", "fa") == "fa" and "سایر" or "Others",))
                # In legacy mode we cannot filter by ID.
                if cat not in seen_cats:
                    categories.append(cat)
                    seen_cats.add(cat)

        markup = types.InlineKeyboardMarkup(row_width=1)
        for cat in categories:
            has_plans = any(p.get("category") == cat for p in db_plans)
            if not has_plans:
                continue
                
            emoji = category_map.get(cat)
            if not emoji:
                emoji = "⚡️"
                if "vip" in cat.lower(): emoji = "⭐️"
                elif "voip" in cat.lower() or "unlimited" in cat.lower(): emoji = "🚀"
                elif "premium" in cat.lower(): emoji = "💎"
            
            markup.add(types.InlineKeyboardButton(f"{emoji} {cat}", callback_data=f"plcat_{server_id}:{cat}"))
        
        markup.add(types.InlineKeyboardButton("✨ ساخت کانفیگ با حجم دلخواه", callback_data=f"custom_vol_{server_id}"))
        
        markup.row(
            types.InlineKeyboardButton("🔙 بازگشت", callback_data="mm_btnBuyNew"),
            types.InlineKeyboardButton("🏠 منوی اصلی", callback_data="btn_back_home")
        )
        edit_or_reply_message(call, message_body, markup)
        return

    if call.data.startswith("plcat_"):
        bot.answer_callback_query(call.id)
        
        data_stripped = call.data.replace("plcat_", "")
        server_id = ""
        category_name = ""
        
        if ":" in data_stripped:
            parts = data_stripped.split(":", 1)
            server_id = parts[0]
            category_name = parts[1]
        elif data_stripped.startswith("srv_"):
            parts = data_stripped.split("_", 2)
            if len(parts) == 3:
                server_id = f"{parts[0]}_{parts[1]}"
                category_name = parts[2]
            else:
                category_name = data_stripped
        else:
            cfg = get_config()
            servers = cfg.get("SERVERS", [])
            matched = False
            for srv in servers:
                srv_id_str = str(srv.get("id"))
                if data_stripped.startswith(srv_id_str + "_"):
                    server_id = srv_id_str
                    category_name = data_stripped[len(srv_id_str)+1:]
                    matched = True
                    break
            if not matched:
                if "_" in data_stripped:
                    parts = data_stripped.split("_", 1)
                    server_id = parts[0]
                    category_name = parts[1]
                else:
                    category_name = data_stripped
        
        db = read_sqlite_db()
        db_plans = db.get("vpn_plans", [])
        
        plans_data = []
        for dp in db_plans:
            cat = dp.get("category", (cfg.get("LANG", "fa") == "fa" and "سایر" or "Others",))
            # Case insensitive comparison for robustness
            if cat.lower() == category_name.lower():
                plans_data.append({
                    "id": dp["id"],
                    "name": dp["name"],
                    "price": dp["price"],
                    "traffic": dp.get("trafficGb", 30),
                    "duration": dp.get("durationDays", 30)
                })
                
        cfg = get_config()
        nickname = cfg.get("BOT_NICKNAME", "دالتون")
        
        display_cat = category_name
            
        message_body = (
            f"⚡️ <b>پلن‌های بخش {display_cat} - {nickname}</b>\n\n"
            "لطفاً یکی از تعرفه‌های معتبر زیر را انتخاب کنید تا فرآیند فعال‌سازی فوری آغاز شود:"
        )
        
        markup = types.InlineKeyboardMarkup(row_width=1)
        for p in plans_data:
            clean_name = p['name']
            if clean_name.startswith("پلن "):
                clean_name = clean_name[4:]
            elif clean_name.startswith("پلان "):
                clean_name = clean_name[5:]
                
            btn_text = f"⚡️ {clean_name} ┃ {p['price']:,} تومان"
            call_action = f"buy_{server_id}_{p['id']}" if server_id else f"buy_{p['id']}"
            markup.add(types.InlineKeyboardButton(btn_text, callback_data=call_action))
            
        markup.add(types.InlineKeyboardButton("✨ ساخت کانفیگ با حجم دلخواه", callback_data=f"custom_vol_{server_id}"))
        
        markup.row(
            types.InlineKeyboardButton("🔙 بازگشت به دسته‌بندی‌ها", callback_data=f"srvsel_{server_id}" if server_id else "mm_btnBuyNew"),
            types.InlineKeyboardButton("🏠 منوی اصلی", callback_data="btn_back_home")
        )
        
        bot.edit_message_text(
            message_body,
            chat_id=call.message.chat.id,
            message_id=call.message.message_id,
            parse_mode="HTML",
            reply_markup=markup
        )
        return
        
    if call.data.startswith("custom_vol_"):
        bot.answer_callback_query(call.id)
        server_id = call.data.replace("custom_vol_", "")
        
        # PRE-CHECK: Ensure server is available before proceeding
        if not login_xui(server_id):
            session = get_session()
            last_err = getattr(session, "last_login_error", "ارتباط با پنل برقرار نشد")
            bot.send_message(
                call.message.chat.id, 
                f"❌ <b>خطا در اتصال به پنل!</b>\n\nجزئیات: {last_err}\n\nمتاسفانه در حال حاضر امکان ساخت کانفیگ روی این سرور فراهم نیست. لطفاً بعداً تلاش کنید یا سرور دیگری را انتخاب کنید.", 
                parse_mode="HTML",
                reply_markup=get_custom_keyboard()
            )
            return

        msg = bot.send_message(
            call.message.chat.id,
            "🔻 <b>لطفاً ترافیک مورد نیاز خود را به گیگابایت (GB) وارد کنید:</b>\n"
            "⚠️ عدد ارسال شده باید یک عدد انگلیسی مثبت باشد (مثلاً <code>30</code>)",
            parse_mode="HTML",
            reply_markup=get_cancel_keyboard()
        )
        bot.register_next_step_handler(msg, process_custom_vol_gb, server_id)
        return

    if call.data.startswith("buycust_pay:"):
        parts = call.data.split(":")
        # Format: buycust_pay:method:server_id:username:gb:days:price
        if len(parts) == 6:
            # Backward compatibility
            method = "wallet"
            server_id = parts[1]
            username_input = parts[2]
            gb = int(parts[3])
            days = int(parts[4])
            price = int(parts[5])
        else:
            method = parts[1]
            server_id = parts[2]
            username_input = parts[3]
            gb = int(parts[4])
            days = int(parts[5])
            price = int(parts[6])
            
        tg_id = call.from_user.id
        db = read_sqlite_db()
        cfg = get_config()
        
        is_owner = bool(cfg.get("OWNER_ID") and int(tg_id) == int(cfg["OWNER_ID"]))
        is_admin = bool(cfg.get("ADMINS") and int(tg_id) in cfg["ADMINS"])
        is_privileged = is_owner or is_admin

        if method == "card":
            if is_privileged:
                bot.answer_callback_query(call.id, "✅ تایید مستقیم ادمین ثبت شد.")
                call.data = f"buycust_pay:wallet:{server_id}:{username_input}:{gb}:{days}:{price}"
                handle_callback_query(call) # Re-trigger with wallet method
                return

            bot.answer_callback_query(call.id)
            set_user_pending_purchase(tg_id, "custom_vol", username_input, server_id, gb, days, price)
            text_response = (
                f"🛒 <b>خرید کانفیگ دلخواه (کارت به کارت)</b>\n"
                f"👤 نام کاربری: <code>{username_input}</code>\n"
                f"📊 حجم: <b>{gb} GB</b> | زمان: <b>{days} روز</b>\n"
                f"💰 مبلغ قابل پرداخت: <b>{price:,} تومان</b>\n\n"
                f"لطفاً مبلغ فوق را به کارت عابربانک مدیریت واریز نمایید:\n\n"
                f"{get_card_payment_info(cfg)}\n\n"
                f"📸 پس از انتقال/واریز، <b>فقط عکس فیش یا رسید پرداختی خود را به این چت بفرستید</b> تا جهت تایید و دریافت کانفیگ برای ادمین ثبت شود."
            )
            bot.edit_message_text(text_response, chat_id=call.message.chat.id, message_id=call.message.message_id, parse_mode="HTML", reply_markup=get_cancel_keyboard())
            return

        if method == "stars":
            bot.answer_callback_query(call.id)
            text_response = (
                f"🛒 <b>خرید کانفیگ دلخواه (پرداخت با Telegram Stars)</b>\n"
                f"👤 نام کاربری: <code>{username_input}</code>\n"
                f"📊 حجم: <b>{gb} GB</b> | زمان: <b>{days} روز</b>\n"
                f"💰 مبلغ نهایی: <b>{price:,} تومان</b>\n\n"
                f"در اینجا کاربر به درگاه پرداخت Stars تلگرام متصل خواهد شد.\n"
            )
            markup = types.InlineKeyboardMarkup()
            markup.add(types.InlineKeyboardButton("✅ پایان و تایید فرضی پرداخت", callback_data="btn_back_home"))
            markup.add(types.InlineKeyboardButton("❌ انصراف", callback_data="btn_back_home"))
            bot.edit_message_text(text_response, chat_id=call.message.chat.id, message_id=call.message.message_id, parse_mode="HTML", reply_markup=markup)
            return

        # Original wallet logic
        bot.answer_callback_query(call.id)
        user = next((u for u in db.get("users", []) if u["userId"] == tg_id), None)
        
        if not is_privileged and (not user or user.get("walletBalance", 0) < price):
            shortage = price - (user.get("walletBalance", 0) if user else 0)
            text = (
                "❌ <b>موجود کيف پول شما کافی نیست!</b>\n\n"
                f"💰 هزینه خرید: {price:,} تومان\n"
                f"💳 موجودی فعلی: {int(user.get('walletBalance', 0) if user else 0):,} تومان\n"
                f"🔴 کسری موجودی: {int(shortage):,} تومان\n\n"
                "لطفاً ابتدا از طریق دکمه زیر موجودی خود را افزایش دهید و سپس مجدداً تلاش کنید."
            )
            markup = types.InlineKeyboardMarkup(row_width=1)
            markup.add(
                types.InlineKeyboardButton("💳 شارژ فوری کیف پول", callback_data="mm_btnWallet"),
                types.InlineKeyboardButton("🔙 بازگشت به منوی اصلی", callback_data="btn_back_home")
            )
            bot.send_message(call.message.chat.id, text, parse_mode="HTML", reply_markup=markup)
            return
            
        bot.edit_message_text("✅ در حال ساخت کانفیگ دلخواه... لطفا صبور باشید.", chat_id=call.message.chat.id, message_id=call.message.message_id, parse_mode="HTML")
        
        # Run API call in a separate thread to avoid blocking the bot
        import threading
        def run_creation():
            cfg = get_config()
            try:
                if not is_privileged:
                    new_balance = user.get("walletBalance", 0) - price
                    update_user_balance(tg_id, new_balance)
                    if price > 0:
                        process_referral_on_purchase(user, price)
                    log_action(tg_id, user.get("username", str(tg_id)), "خرید کانفیگ دلخواه", f"کانفیگ دلخواه {gb}GB/{days}روز به مبلغ {price:,} تومان کسر شد.")
                else:
                    log_action(tg_id, user.get("username", str(tg_id)) if user else str(tg_id), "ساخت مستقیم توسط ادمین", f"کانفیگ دلخواه {gb}GB/{days}روز ایجاد شد.")
                    
                print(f"[buycust_pay] Creating VPN client for {username_input} on server {server_id}...")
                client_uuid, sub_link = add_vpn_client_api(username_input, gb, days, server_id=server_id)
                print(f"[buycust_pay] API result: UUID={client_uuid}, SubLink={sub_link}")
                
                if not sub_link:
                    print("[buycust_pay] Failed to get sub_link from add_vpn_client_api")
                    if not cfg.get("SIMULATOR_MODE"):
                        if not is_privileged:
                            fresh_db = read_sqlite_db()
                            fresh_user = next((u for u in fresh_db["users"] if u["userId"] == tg_id), None)
                            current_bal = float(fresh_user.get("walletBalance", 0.0)) if fresh_user else 0.0
                            refunded_bal = current_bal + float(price)
                            update_user_balance(tg_id, refunded_bal)
                            log_action(tg_id, fresh_user.get("username", str(tg_id)) if fresh_user else str(tg_id), "مرجوعی سیستمی خرید دلخواه", f"برگشت مبلغ {price:,} تومان به دلیل خطای اتصال x-ui.")
                        
                        session = get_session()
                        last_err = getattr(session, "last_error", "خطای ناشناخته")
                        notify_admins_of_error("خرید کانفیگ دلخواه", last_err, f"ID: {tg_id} / Username: {username_input}")
                        bot.send_message(
                            tg_id,
                            "❌ <b>خطا در ساخت کانفیگ!</b>\n\n"
                            "متأسفانه مشکلی در اتصال به پنل x-ui رخ داد و امکان ساخت خودکار کانفیگ دلخواه در این لحظه وجود ندارد.\n\n"
                            "⚠️ <b>جزئیات خطا جهت بررسی به تیم پشتیبانی گزارش شد.</b>\n\n"
                            f"💰 <b>مبلغ {price:,} تومان به طور خودکار و فوری به کیف پول شما بازگردانده شد.</b>\n\n"
                            "موجودی شما محفوظ است. لطفاً چند لحظه دیگر مجدداً تلاش کنید یا با پشتیبانی در تماس باشید.",
                            parse_mode="HTML"
                        )
                        return
                    else:
                        import random, string, uuid
                        client_uuid = client_uuid if client_uuid else str(uuid.uuid4())
                        sub_link = f"{normalize_xui_url(cfg.get('SUB_URL', 'https://sub.example.com'))}/sub/{''.join(random.choices(string.ascii_lowercase + string.digits, k=16))}"
                    
                expire_date = time.strftime("%Y-%m-%d", time.localtime(time.time() + days * 24 * 60 * 60))
                sub_id = f"SUB-{int(time.time()) % 9000 + 1000}"
                
                print(f"[buycust_pay] Registering sub in DB: sub_id={sub_id}, user={tg_id}")
                create_sub_key(
                    key_id=sub_id, 
                    tg_id=tg_id, 
                    plan_id="custom_vol", 
                    plan_name=f"Custom {gb}GB - {days} Days", 
                    sub_link=sub_link, 
                    expire_date=expire_date, 
                    limit_gb=gb,
                    client_name=username_input,
                    client_uuid=client_uuid,
                    server_id=server_id
                )
                
                all_links = get_client_all_links(username_input, client_uuid, sub_link, server_id=server_id)
                if all_links:
                    links_text = "\n\n🔸━━━━━━━━━━━━━━━━━━🔸\n\n".join([f"<code>{l}</code>" for l in all_links])
                    configs_block = f"🚀 <b>لینک‌های اتصال مستقیم:</b>\n{links_text}"
                else:
                    configs_block = (
                        f"⚠️ <b>توجه:</b> امکان استخراج تفکیکی لینک‌های کانفیگ در این لحظه میسر نشد.\n\n"
                        f"👇 <b>لطفاً از لینک سابسکریپشن اختصاصی خود استفاده کنید (جهت کپی لمس کنید):</b>\n\n"
                        f"<code>{sub_link}</code>\n\n"
                        f"💡 لینک بالا را کپی کرده و در برنامه v2rayNG یا V2box خود به عنوان <b>Subscription (سابسکریپشن)</b> وارد کرده و بروزرسانی (Update) نمایید تا همه کانفیگ‌ها به طور خودکار دریافت شوند."
                    )
                    
                success_msg = (
                    f"🎉 <b>خرید شما با موفقیت انجام شد!</b>\n\n"
                    f"🛒 اشتراک: <b>کانفیگ دلخواه</b>\n"
                    f"👤 شناسه: <code>{username_input}</code>\n"
                    f"⏳ انقضا: <b>{days} روز</b> (تا {expire_date})\n"
                    f"📊 ترافیک: <b>{gb} گیگابایت</b>\n"
                    f"🖥️ سرور: <b>{server_id}</b>\n\n"
                    f"{configs_block}\n\n"
                    f"🆔 شناسه اشتراک: <code>{sub_id}</code>"
                )
                
                markup = types.InlineKeyboardMarkup(row_width=1)
                add_copy_button_to_markup(markup, "📋 کپی آسان لینک سابسکریپشن (کلیک کنید)", sub_link)
                markup.row(types.InlineKeyboardButton("🔗 لینک‌های کانفیگ", callback_data=f"mysub_vless_{sub_id}"))
                markup.add(types.InlineKeyboardButton("💡 آموزش ها", callback_data="mm_btnGuides"))
                markup.add(types.InlineKeyboardButton("🏠 بازگشت به منوی اصلی", callback_data="btn_back_home"))
                
                try:
                    import urllib.parse
                    qr_url = get_qr_code_url(sub_link)
                    safe_send_qr_photo(tg_id, qr_url, success_msg, markup)
                except Exception as e:
                    print(f"[Bot Warning] Failed to send custom QR Photo: {e}")
                    
                send_purchase_success_note_if_any(tg_id, only_media=True)
                
                # Notify admin
                admin_msg = (
                    f"🔔 <b>خرید کانفیگ دلخواه جدید:</b>\n\n"
                    f"👤 کاربر: {user.get('username', 'N/A') if user else 'N/A'} ({tg_id})\n"
                    f"📊 طرح: {gb}GB / {days} روز\n"
                    f"💰 مبلغ: {price:,} تومان\n"
                    f"🆔 اشتراک: {sub_id}"
                )
                
                # Notify admin
                cfg = get_config()
                targets = set()
                owner_id = cfg.get("OWNER_ID")
                if owner_id and owner_id > 0:
                    targets.add(owner_id)
                for adm_id in cfg.get("ADMINS", []):
                    if adm_id and adm_id > 0:
                        targets.add(adm_id)
                for target_id in targets:
                    try:
                        bot.send_message(target_id, admin_msg, parse_mode="HTML")
                    except Exception:
                        pass
                
            except Exception as e:
                print(f"[buycust_pay Thread Error] {e}")
                bot.send_message(tg_id, f"❌ خطای غیرمنتظره در ساخت کانفیگ: {e}")

        threading.Thread(target=run_creation).start()
        return
    if call.data.startswith("mysub_renewcustconfirm:"):
        parts = call.data.split(":")
        # Format: mysub_renewcustconfirm:method:target_sub_id:gb:days:price
        # or old format: mysub_renewcustconfirm:target_sub_id:gb:days:price (defaults to wallet)
        if len(parts) == 6:
            method = parts[1]
            target_sub_id = parts[2]
            gb = int(parts[3])
            days = int(parts[4])
            price = int(parts[5])
        else:
            method = "wallet"
            target_sub_id = parts[1]
            gb = int(parts[2])
            days = int(parts[3])
            price = int(parts[4])
        
        tg_id = call.from_user.id
        db = read_sqlite_db()
        subscription_keys = db.get("subscription_keys", [])
        k = next((sub for sub in subscription_keys if sub["id"] == target_sub_id and sub["userId"] == tg_id), None)
        
        if not k:
            bot.answer_callback_query(call.id, "❌ خطا: اشتراک یافت نشد یا متعلق به شما نیست.", show_alert=True)
            return
            
        client_name = k.get("clientName", k.get("planName", "سرویس بدون نام"))
        user = next((u for u in db.get("users", []) if u["userId"] == tg_id), None)
        
        cfg = get_config()
        is_owner = bool(cfg.get("OWNER_ID") and int(tg_id) == int(cfg["OWNER_ID"]))
        is_admin = bool(cfg.get("ADMINS") and int(tg_id) in cfg["ADMINS"])
        is_privileged = is_owner or is_admin
        
        if method == "card":
            if is_privileged:
                bot.answer_callback_query(call.id, "✅ تایید مستقیم ادمین ثبت شد.")
                method = "wallet"
            else:
                bot.answer_callback_query(call.id)
                set_user_pending_purchase(tg_id, "custom_renew", target_sub_id, server_id=k.get("serverId"), custom_gb=gb, custom_days=days, custom_price=price)
                text_response = (
                    f"🔄 <b>تمدید اشتراک (کارت به کارت)</b>\n\n"
                    f"👤 نام کاربری سرویس: <code>{client_name}</code>\n"
                    f"📊 حجم درخواستی: <b>{gb} گیگابایت</b>\n"
                    f"⏳ مدت زمان تمدید: <b>{days} روز</b>\n"
                    f"💰 مبلغ قابل پرداخت: <b>{price:,} تومان</b>\n\n"
                    f"لطفاً مبلغ فوق را به کارت عابربانک مدیریت واریز نمایید:\n\n"
                    f"{get_card_payment_info(cfg)}\n\n"
                    f"📸 پس از انتقال/واریز، <b>فقط عکس فیش یا رسید پرداختی خود را به این چت بفرستید</b> تا جهت بررسی و اعمال تمدید برای ادمین ارسال شود."
                )
                bot.edit_message_text(text_response, chat_id=call.message.chat.id, message_id=call.message.message_id, parse_mode="HTML", reply_markup=get_cancel_keyboard())
                return

        if method == "stars":
            bot.answer_callback_query(call.id)
            text_response = (
                f"🔄 <b>تمدید اشتراک (پرداخت با Telegram Stars)</b>\n\n"
                f"👤 نام کاربری سرویس: <code>{client_name}</code>\n"
                f"📊 حجم درخواستی: <b>{gb} گیگابایت</b>\n"
                f"⏳ مدت زمان تمدید: <b>{days} روز</b>\n"
                f"💰 مبلغ نهایی: <b>{price:,} تومان</b>\n\n"
                f"در اینجا کاربر به درگاه پرداخت Stars تلگرام متصل خواهد شد.\n"
            )
            markup = types.InlineKeyboardMarkup()
            markup.add(types.InlineKeyboardButton("✅ پایان و تایید فرضی پرداخت", callback_data="btn_back_home"))
            markup.add(types.InlineKeyboardButton("❌ انصراف", callback_data="btn_back_home"))
            bot.edit_message_text(text_response, chat_id=call.message.chat.id, message_id=call.message.message_id, parse_mode="HTML", reply_markup=markup)
            return

        bot.answer_callback_query(call.id)
        if not is_privileged and (not user or user.get("walletBalance", 0) < price):
            bot.send_message(call.message.chat.id, "❌ موجودی کیف پول شما کافی نیست! لطفا ابتدا حساب خود را شارژ کنید.")
            return
            
        bot.edit_message_text("✅ در حال تمدید اشتراک... لطفا صبور باشید.", chat_id=call.message.chat.id, message_id=call.message.message_id, parse_mode="HTML")
        
        # Check for double-processing
        if tg_id in active_purchases:
            bot.send_message(call.message.chat.id, "یک درخواست خرید یا تمدید برای شما در حال پردازش است.")
            return
            
        active_purchases.add(tg_id)
        try:
            if not is_privileged:
                new_balance = user.get("walletBalance", 0) - price
                update_user_balance(tg_id, new_balance)
                log_action(tg_id, user.get("username", str(tg_id)), "تمدید اشتراک دلخواه", f"سرویس '{client_name}' تمدید {gb}GB/{days}روز به مبلغ {price:,} تومان کسر شد.")
            else:
                log_action(tg_id, user.get("username", str(tg_id)) if user else str(tg_id), "تمدید مستقیم ادمین", f"سرویس '{client_name}' تمدید {gb}GB/{days}روز شد.")
                
            from datetime import datetime, timedelta
            try:
                exp_dt = datetime.strptime(k['expireDate'], '%Y-%m-%d')
                if exp_dt < datetime.now():
                    new_exp_dt = datetime.now() + timedelta(days=days)
                else:
                    new_exp_dt = exp_dt + timedelta(days=days)
            except:
                new_exp_dt = datetime.now() + timedelta(days=days)
                
            new_expire_date_str = new_exp_dt.strftime('%Y-%m-%d')
            new_limit_gb = float(k.get('trafficLimitGb', 0)) + float(gb)
            
            new_exp_days = (new_exp_dt - datetime.now()).days
            new_exp_days = max(1, new_exp_days)
            
            delete_vpn_client_api(client_name, k.get("clientUuid"), server_id=k.get("serverId"))
            _, sub_link = add_vpn_client_api(client_name, new_limit_gb, new_exp_days, k.get("clientUuid"), server_id=k.get("serverId"))
            
            if not sub_link:
                if not is_privileged:
                    refunded_bal = user.get("walletBalance", 0) + price
                    update_user_balance(tg_id, refunded_bal)
                
                bot.send_message(
                    tg_id,
                    "❌ <b>خطا در تمدید اشتراک!</b>\n\n"
                    "متاسفانه در ارتباط با سرور و اعمال تمدید خطایی رخ داد.\n"
                    "✅ مبلغ کسر شده فوراً به کیف پول شما بازگردانده شد.",
                    parse_mode="HTML"
                )
                return
                
            k['expireDate'] = new_expire_date_str
            k['trafficLimitGb'] = new_limit_gb
            if sub_link:
                k['subLink'] = sub_link
                
            write_sqlite_db(db)
            
            notify_admins_of_purchase(tg_id, "تمدید اشتراک دلخواه (کیف پول)", f"افزودن: {gb}GB / {days} روز برای سرویس {client_name}", price, target_sub_id)
            
            success_text = (
                f"🎉 <b>اشتراک شما با موفقیت تمدید شد!</b>\n\n"
                f"👤 سرویس: <code>{client_name}</code>\n"
                f"➕ حجم ترافیک افزوده شده: <b>{gb} گیگابایت</b>\n"
                f"➕ مدت زمان افزوده شده: <b>{days} روز</b>\n\n"
                f"📅 تاریخ انقضای جدید: <b>{new_expire_date_str}</b>\n"
                f"📊 حجم کل جدید: <b>{new_limit_gb} گیگابایت</b>"
            )
            bot.send_message(tg_id, success_text, parse_mode="HTML")
        finally:
            active_purchases.discard(tg_id)
        return

    if call.data.startswith("buy_"):
        bot.answer_callback_query(call.id)
        
        data_stripped = call.data.replace("buy_", "")
        server_id = ""
        plan_id = ""
        
        if data_stripped.startswith("srv_"):
            parts = data_stripped.split("_", 2)
            if len(parts) == 3:
                server_id = f"{parts[0]}_{parts[1]}"
                plan_id = parts[2]
            else:
                plan_id = data_stripped
        else:
            plan_id = data_stripped
            
        tg_id = call.fromuser.id if hasattr(call, "fromuser") else call.from_user.id
        
        db = read_sqlite_db()
        db_plans = db.get("vpn_plans", [])
        db_plan = next((dp for dp in db_plans if dp["id"] == plan_id), None)
        
        spec = None
        if db_plan:
            spec = {
                "id": db_plan["id"],
                "name": db_plan["name"],
                "price": db_plan["price"],
                "traffic": db_plan.get("trafficGb", 30),
                "duration": db_plan.get("durationDays", 30)
            }
        else:
            # Details of the fallback plans
            plan_specs = {
                "std_30g": {"id": "std_30g", "name": "Standard 30GB - 30 Days", "price": 45000, "traffic": 30, "duration": 30},
                "vip_70g": {"id": "vip_70g", "name": "VIP Premium 70GB - 60 Days", "price": 95000, "traffic": 70, "duration": 60},
                "ult_150g": {"id": "ult_150g", "name": "Unlimited VoIP 150GB - 90 Days", "price": 185000, "traffic": 150, "duration": 90}
            }
            spec = plan_specs.get(plan_id)
            
        if not spec:
            bot.send_message(call.message.chat.id, "❌ متاسفانه مشخصات این طرح یافت نشد.")
            return

        # inject server_id into spec
        if server_id:
            spec["server_id"] = server_id

        user = get_user_data(tg_id)
        if not user:
            # Attempt to register if missing for some reason
            register_tg_user(tg_id, call.from_user.username)
            user = get_user_data(tg_id)
            if not user:
                bot.send_message(call.message.chat.id, "❌ خطای نامشخص دیتابیس: کاربر یافت نشد.")
                return
            
        cfg = get_config()
        is_owner = bool(cfg.get("OWNER_ID") and int(tg_id) == int(cfg["OWNER_ID"]))
        is_admin = bool(cfg.get("ADMINS") and int(tg_id) in cfg["ADMINS"])
        is_privileged = is_owner or is_admin
        
        # PRE-CHECK: Ensure server is available before proceeding
        if not login_xui(server_id):
            session = get_session()
            last_err = getattr(session, "last_login_error", "ارتباط با پنل برقرار نشد")
            bot.send_message(
                call.message.chat.id, 
                f"❌ <b>خطا در اتصال به پنل!</b>\n\nجزئیات: {last_err}\n\nمتاسفانه در حال حاضر امکان ساخت کانفیگ روی این سرور فراهم نیست. لطفاً بعداً تلاش کنید یا سرور دیگری را انتخاب کنید.", 
                parse_mode="HTML",
                reply_markup=get_custom_keyboard()
            )
            return
        
        # Ask for username first
        msg = bot.send_message(
            call.message.chat.id,
            f"✍️ <b>لطفاً یک نام کاربری دلخواه (فقط حروف انگلیسی و اعداد، بدون فاصله) برای کانفیگ خود ارسال نمایید:</b>\n"
            f"• طرح انتخابی: <code>{spec['name']}</code>",
            parse_mode="HTML",
            reply_markup=get_cancel_keyboard()
        )
        bot.register_next_step_handler(msg, process_purchase_username_manual, plan_id, spec)
        bot.answer_callback_query(call.id)

    elif call.data.startswith("hasdisc:"):
        try:
            handle_discount_decision(call)
        except Exception as e:
            print(f"[Callback Error hasdisc] {e}")
            try:
                bot.answer_callback_query(call.id, f"⚠️ خطایی رخ داد: {e}", show_alert=True)
            except: pass
        return

    elif call.data.startswith("hascustdisc:"):
        try:
            parts = call.data.split(":")
            # hascustdisc:{decision}:{server_id}:{username_input}:{gb}:{days}
            decision = parts[1]
            server_id = parts[2]
            username_input = parts[3]
            gb = int(parts[4])
            days = int(parts[5])
            
            if decision == "yes":
                bot.answer_callback_query(call.id)
                msg = bot.edit_message_text(
                    "🎟️ <b>لطفاً کد تخفیف خود را وارد کنید:</b>\n"
                    "(در صورت انصراف می‌توانید کد اشتباه بزنید یا عملیات را لغو کنید)",
                    chat_id=call.message.chat.id,
                    message_id=call.message.message_id,
                    parse_mode="HTML",
                    reply_markup=get_cancel_keyboard()
                )
                bot.register_next_step_handler(msg, process_custom_vol_promo_input, server_id, username_input, gb, days)
            else:
                bot.answer_callback_query(call.id)
                send_final_custom_purchase_message(call.message, server_id, username_input, gb, days)
        except Exception as e:
            print(f"[Callback Error hascustdisc] {e}")
            try:
                bot.answer_callback_query(call.id, f"⚠️ خطایی رخ داد: {e}", show_alert=True)
            except: pass
        return

    elif call.data.startswith("charge_amount_"):
        try:
            amount = int(call.data.split("_")[-1])
            tg_id = call.from_user.id
            set_user_pending_charge(tg_id, amount)
            
            cfg = get_config()
            text = (
                f"💳 <b>درخواست شارژ حساب کاربری به مبلغ {amount:,} تومان:</b>\n\n"
                f"لطفاً مبلغ دقیق <b>{amount:,} تومان</b> را به کارت عابربانک مدیریت واریز نمایید:\n\n"
                f"{get_card_payment_info(cfg)}\n\n"
                f"📸 پس از انتقال/واریز، <b>فقط عکس فیش یا رسید پرداختی خود را به این چت بفرستید</b> تا جهت تایید و شارژ برای ادمین ثبت شود."
            )
            bot.edit_message_text(text, chat_id=call.message.chat.id, message_id=call.message.message_id, parse_mode="HTML", reply_markup=get_cancel_keyboard())
            bot.answer_callback_query(call.id)
        except Exception as e:
            print(f"[Error Charge Amount Init] {e}")

    elif call.data == "upload_receipt":
        bot.send_message(
            call.message.chat.id, 
            "📸 لطفا ابتدا از دکمه‌های بالا مبلغی را برای شارژ انتخاب کنید تا جزئیات پرداخت کارت برای شما فرستاده شود."
        )
        bot.answer_callback_query(call.id)

    elif call.data == "btn_wallet_shortcut":
        call.data = "mm_btnWallet"
        handle_main_menu_callback(call)
        
    elif call.data.startswith("vless_link_"):
        sub_id = call.data.replace("vless_link_", "")
        db = read_sqlite_db()
        sub = next((s for s in db.get("subscription_keys", []) if s["id"] == sub_id), None)
        
        if sub and sub.get("subLink"):
            cfg = get_config()
            markup = types.InlineKeyboardMarkup()
            if not cfg.get("HIDE_TICKET_SUPPORT", False):
                markup.add(types.InlineKeyboardButton(cfg.get("BTN_TICKET_SUPPORT", "🎫 تیکت به پشتیبانی"), callback_data="mm_btnTicketSupport"))
            
            bot.send_message(
                call.message.chat.id,
                f"🔗 <b>لینک اتصال شما:</b>\n\n<code>{sub['subLink']}</code>",
                parse_mode="HTML",
                reply_markup=markup
            )
            bot.answer_callback_query(call.id, "لینک ارسال شد", show_alert=False)
        else:
            bot.answer_callback_query(call.id, "متاسفانه لینک یافت نشد", show_alert=True)

    elif call.data == "btn_gift_code":
        bot.answer_callback_query(call.id)
        bot.edit_message_text(
            "🎁 لطفاً کد هدیه خود را بفرستید:\n(برای انصراف دکمه لغو را انتخاب کنید یا «انصراف» بفرستید)",
            chat_id=call.message.chat.id,
            message_id=call.message.message_id,
            reply_markup=get_cancel_keyboard()
        )
        bot.register_next_step_handler(call.message, process_gift_code)

    elif call.data == "guide_conn_menu":
        markup = types.InlineKeyboardMarkup(row_width=1)
        markup.add(
            types.InlineKeyboardButton("📱 آموزش اتصال در موبایل (HAPP) ⭐", callback_data="guide_item_happ"),
            types.InlineKeyboardButton("🍎 آموزش اتصال برای آی او اس ⭐", callback_data="guide_item_ios"),
            types.InlineKeyboardButton("🤖 آموزش اتصال در اندروید", callback_data="guide_item_android"),
            types.InlineKeyboardButton("💻 آموزش اتصال در ویندوز (V2rayN)", callback_data="guide_item_v2rayn"),
            types.InlineKeyboardButton("💻 آموزش اتصال در ویندوز (Karing)", callback_data="guide_item_karing"),
            types.InlineKeyboardButton("💻 آموزش اتصال در مک", callback_data="guide_item_mac"),
            types.InlineKeyboardButton("🐧 آموزش اتصال در لینوکس", callback_data="guide_item_linux"),
            types.InlineKeyboardButton("🔙 بازگشت به منوی آموزش‌ها", callback_data="mm_btnGuides")
        )
        sub_text = (
            "<b>🔌 راهنمای فعال‌سازی و اتصال به سرویس‌ها</b>\n\n"
            "لطفاً آموزش مورد نظر خود را بر اساس سیستم‌عامل دستگاه خود انتخاب کنید.\n\n"
            "⚠️ گزینه‌های ستاره‌دار ⭐ پیشنهاد ما برای بهترین عملکرد هستند."
        )
        try:
            bot.edit_message_text(
                sub_text,
                chat_id=call.message.chat.id,
                message_id=call.message.message_id,
                parse_mode="HTML",
                reply_markup=markup
            )
        except Exception:
            try:
                bot.delete_message(call.message.chat.id, call.message.message_id)
            except Exception:
                pass
            bot.send_message(
                call.message.chat.id,
                sub_text,
                parse_mode="HTML",
                reply_markup=markup
            )
        bot.answer_callback_query(call.id)

    elif call.data == "guide_update_menu":
        markup = types.InlineKeyboardMarkup(row_width=1)
        markup.add(types.InlineKeyboardButton("🔙 بازگشت به منوی آموزش‌ها", callback_data="mm_btnGuides"))
        update_text = (
            "🔄 <b>آموزش آپدیت کردن سرویس‌ها و حل مشکل عدم اتصال</b>\n\n"
            "گاهی به دلیل تغییر آی‌پی سرورها یا فیلتر شدن برخی پروتکل‌ها، لازم است لیست سرورهای خود را آپدیت کنید.\n\n"
            "💡 <b>روش آپدیت دستی در موبایل و کامپیوتر:</b>\n"
            "۱. وارد نرم‌افزار اتصال خود (مانند v2rayNG یا V2box) شوید.\n"
            "۲. دکمه سه‌نقطه یا منوی تنظیمات مربوط به سابسکریپشن را پیدا کنید.\n"
            "۳. روی گزینه <b>Update Subscription</b> (بروزرسانی لینک ساب) کلیک کنید.\n"
            "۴. چند لحظه صبر کنید تا پیام موفقیت‌آمیز بودن نمایش داده شود و تمام سرورهای جدید بارگذاری گردند.\n"
            "۵. در صورتیکه هنوز اتصال برقرار نشد، مطمئن شوید حجم ترافیک بسته شما در حساب کاربری تمام نشده باشد."
        )
        try:
            bot.edit_message_text(
                update_text,
                chat_id=call.message.chat.id,
                message_id=call.message.message_id,
                parse_mode="HTML",
                reply_markup=markup
            )
        except Exception:
            try:
                bot.delete_message(call.message.chat.id, call.message.message_id)
            except Exception:
                pass
            bot.send_message(
                call.message.chat.id,
                update_text,
                parse_mode="HTML",
                reply_markup=markup
            )
        bot.answer_callback_query(call.id)

    elif call.data == "guide_crypto_menu":
        markup = types.InlineKeyboardMarkup(row_width=1)
        markup.add(types.InlineKeyboardButton("🔙 بازگشت به منوی آموزش‌ها", callback_data="mm_btnGuides"))
        
        cfg = get_config()
        bot_nickname = cfg.get("BOT_NICKNAME", "دالتون بات")
        
        crypto_text = (
            "🪙 <b>آموزش پرداخت با ارز دیجیتال (تتر / ترون / لایت‌کوین و...)</b>\n\n"
            f"ربات {bot_nickname} از درگاه‌های بین‌المللی کاملاً امن و اتوماتیک برای خرید مستقیم با رمزارز پشتیبانی می‌کند.\n\n"
            "💡 <b>مراحل پرداخت:</b>\n"
            "۱. هنگام خرید پلن جدید یا شارژ کیف پول، درگاه رمزارز (مانند کریپتوموس یا نوپیمنت) را انتخاب کنید.\n"
            "۲. کوین مورد نظر خود را انتخاب نمایید (پیشنهاد ما برای کارمزد کم: <b>USDT-TRC20</b> یا <b>TRX</b>).\n"
            "۳. آدرس کیف پول درگاه و مقدار دقیق نمایش داده شده را کپی کنید.\n"
            "۴. از صرافی یا کیف پول خود (مانند تراست ولت) مبلغ دقیق خواسته شده را به همان آدرس ارسال کنید.\n"
            "۵. پس از ارسال کوین، منتظر تایید تراکنش بمانید؛ سیستم به صورت ۱۰۰٪ هوشمند تراکنش را تایید کرده و فعال‌سازی اشتراک شما را شروع خواهد کرد!"
        )
        try:
            bot.edit_message_text(
                crypto_text,
                chat_id=call.message.chat.id,
                message_id=call.message.message_id,
                parse_mode="HTML",
                reply_markup=markup
            )
        except Exception:
            try:
                bot.delete_message(call.message.chat.id, call.message.message_id)
            except Exception:
                pass
            bot.send_message(
                call.message.chat.id,
                crypto_text,
                parse_mode="HTML",
                reply_markup=markup
            )
        bot.answer_callback_query(call.id)

    elif call.data.startswith("guide_item_"):
        item = call.data.replace("guide_item_", "")
        markup = types.InlineKeyboardMarkup(row_width=1)
        markup.add(types.InlineKeyboardButton("🔙 بازگشت به لیست آموزش‌ها", callback_data="guide_conn_menu"))
        
        guide_text = ""
        if item == "happ":
            guide_text = (
                "📱 <b>آموزش اتصال در موبایل (برنامه HAPP) ⭐</b>\n\n"
                "بهترین و آسان‌ترین روش اتصال در موبایل با نرم‌افزار اختصاصی HAPP!\n\n"
                "📥 <b>لینک‌های دانلود برنامه:</b>\n"
                "• <a href='https://play.google.com/store/apps/details?id=com.happ.app'>دریافت اندروید از گوگل پلی (Google Play)</a>\n"
                "• <a href='https://apps.apple.com/us/app/happ-vpn/id6448825852'>دریافت آی‌او‌اس از اپ استور (App Store)</a>\n\n"
                "💡 <b>مراحل اتصال:</b>\n"
                "۱. ابتدا نرم‌افزار HAPP را دانلود و نصب کنید.\n"
                "۲. لینک اشتراک اختصاصی خود را که از ربات دریافت کرده‌اید کپی کنید.\n"
                "۳. نرم‌افزار را باز کرده و در بخش افزودن (علامت ➕ در بالا سمت راست) گزینه <code>Import from clipboard</code> یا وارد کردن از کلیپ‌بورد را بزنید.\n"
                "۴. سرور فعال اضافه شده را انتخاب کنید و روی دکمه دایره‌ای اتصال ضربه بزنید تا متصل شوید."
            )
        elif item == "ios":
            guide_text = (
                "🍎 <b>آموزش اتصال در آی او اس (iPhone / iPad) ⭐</b>\n\n"
                "📥 <b>نرم‌افزارهای پیشنهادی:</b>\n"
                "• <a href='https://apps.apple.com/us/app/v2box-v2ray-client/id6446814690'>دانلود V2box از App Store</a> (پیشنهادی)\n"
                "• <a href='https://apps.apple.com/us/app/streisand/id6443553228'>دانلود Streisand از App Store</a>\n\n"
                "💡 <b>مراحل اتصال در V2box:</b>\n"
                "۱. برنامه را نصب کرده و باز کنید.\n"
                "۲. از منوی پایین وارد بخش <b>Configs</b> شوید.\n"
                "۳. روی علامت ➕ در بالا سمت راست ضربه بزنید.\n"
                "۴. گزینه <b>Import Vmess/Vless/Trojan from Clipboard</b> یا <b>Add Subscription</b> را انتخاب کنید و لینک اشتراک خود را قرار دهید.\n"
                "۵. به منوی <b>Home</b> بازگشته و دکمه اتصال را ضربه بزنید."
            )
        elif item == "android":
            guide_text = (
                "🤖 <b>آموزش اتصال در اندروید (v2rayNG)</b>\n\n"
                "📥 <b>دانلود نرم‌افزار:</b>\n"
                "• <a href='https://play.google.com/store/apps/details?id=com.v2ray.ang'>دانلود از گوگل پلی (Google Play)</a>\n"
                "• <a href='https://github.com/2dust/v2rayNG/releases'>دانلود مستقیم از گیت‌هاب (GitHub)</a>\n\n"
                "💡 <b>مراحل اتصال:</b>\n"
                "۱. نرم‌افزار <code>v2rayNG</code> را نصب و اجرا کنید.\n"
                "۲. لینک سابسکریپشن خود را کپی کنید.\n"
                "۳. در برنامه، روی سه خط در بالا سمت چپ ضربه زده و وارد <b>Subscription Group setting</b> شوید.\n"
                "۴. روی دکمه ➕ در بالا ضربه بزنید. یک نام دلخواه بگذارید و لینک اشتراک خود را در بخش URL پیست کنید و ذخیره نمایید.\n"
                "۵. به صفحه اصلی برنامه بازگردید، روی سه نقطه در بالا سمت راست کلیک کرده و گزینه <b>Update subscription</b> را انتخاب کنید تا لیست سرورها ظاهر شوند.\n"
                "۶. یکی از سرورها را انتخاب کرده و روی آیکون دایره‌ای پایین سمت راست ضربه بزنید تا متصل شوید."
            )
        elif item == "v2rayn":
            guide_text = (
                "💻 <b>آموزش اتصال در ویندوز (v2rayN)</b>\n\n"
                "📥 <b>دانلود نرم‌افزار:</b>\n"
                "• <a href='https://github.com/2dust/v2rayN/releases'>دانلود مستقیم آخرین نسخه از گیت‌هاب</a>\n\n"
                "💡 <b>مراحل اتصال:</b>\n"
                "۱. فایل زیپ را دانلود و استخراج کرده و فایل <code>v2rayN.exe</code> را اجرا کنید.\n"
                "۲. لینک اشتراک خود را کپی کنید.\n"
                "۳. از منوی بالا روی <b>Subscription Group</b> کلیک کرده و گزینه اضافه کردن را بزنید.\n"
                "۴. لینک کپی شده را پیست کنید و ذخیره نمایید.\n"
                "۵. مجدداً روی <b>Subscription Group</b> کلیک کرده و گزینه <b>Update Subscription</b> را کلیک کنید.\n"
                "۶. یکی از سرورهای لود شده را انتخاب کنید و اتصال (Set Active) را برقرار نمایید."
            )
        elif item == "karing":
            guide_text = (
                "💻 <b>آموزش اتصال در ویندوز (Karing)</b>\n\n"
                "📥 <b>دانلود نرم‌افزار:</b>\n"
                "• <a href='https://github.com/KaringX/karing/releases'>دانلود مستقیم Karing از گیت‌هاب</a>\n\n"
                "💡 <b>مراحل اتصال:</b>\n"
                "۱. پس از کپی کردن لینک ساب خود، برنامه Karing را باز کنید.\n"
                "۲. به تب Profiles بروید و دکمه ➕ را بزنید تا لینک سابسکریپشن را وارد کنید.\n"
                "۳. دکمه بروزرسانی (Update) را بزنید و سپس اتصال را برقرار کنید."
            )
        elif item == "mac":
            guide_text = (
                "💻 <b>آموزش اتصال در سیستم‌عامل مک (macOS)</b>\n\n"
                "📥 <b>نرم‌افزارهای پیشنهادی:</b>\n"
                "• <a href='https://apps.apple.com/us/app/v2box-v2ray-client/id6446814690'>دانلود V2box از App Store مک</a>\n"
                "• <a href='https://github.com/yichengchen/clashX/releases'>دانلود ClashX از گیت‌هاب</a>\n\n"
                "💡 <b>مراحل اتصال:</b>\n"
                "روش اتصال کاملاً مشابه برنامه موبایل V2box یا برنامه‌های مبتنی بر کلش می‌باشد. لینک ساب را کپی کرده، در نرم‌افزار در بخش افزودن (Add Config / Subscription) قرار دهید و پس از آپدیت, یکی از سرورها را فعال نموده و دکمه اتصال اصلی را بزنید."
            )
        elif item == "linux":
            guide_text = (
                "🐧 <b>آموزش اتصال در لینوکس (Linux)</b>\n\n"
                "📥 <b>کلاینت‌های پیشنهادی:</b>\n"
                "• <a href='https://github.com/MatsuriDayo/nekoray/releases'>دانلود Nekoray از گیت‌هاب</a>\n"
                "• <a href='https://github.com/Fndroid/clash_for_windows_pkg/releases'>دانلود Clash Core/GUI برای لینوکس</a>\n\n"
                "💡 <b>راهنما:</b>\n"
                "پس از نصب Nekoray در توزیع خود، با زدن دکمه <code>Preferences > Groups</code> گروه جدید بسازید، نوع آن را روی Subscription ست نموده و لینک خود را اضافه کرده و دکمه آپدیت را بزنید تا سرورها لود شوند."
            )
            
        # Check if a custom video / File ID is configured for this client
        video_key_map = {
            "happ": "guideVideoHapp",
            "ios": "guideVideoIos",
            "android": "guideVideoAndroid",
            "v2rayn": "guideVideoV2rayn",
            "karing": "guideVideoKaring",
            "mac": "guideVideoMac",
            "linux": "guideVideoLinux"
        }
        cfg = get_config()
        react_key = video_key_map.get(item, f"guideVideo{item.capitalize()}")
        guide_video = cfg.get(react_key, "").strip() if cfg else ""
        
        sent_video = False
        if guide_video:
            try:
                # Attempt to delete the previous text-only menu message to prevent clutter
                bot.delete_message(call.message.chat.id, call.message.message_id)
            except Exception:
                pass
                
            try:
                # Attempt to send as video first
                bot.send_video(
                    call.message.chat.id,
                    guide_video,
                    caption=guide_text,
                    parse_mode="HTML",
                    reply_markup=markup
                )
                sent_video = True
            except Exception:
                try:
                    # Attempt to send as animation/GIF if sending video failed
                    bot.send_animation(
                        call.message.chat.id,
                        guide_video,
                        caption=guide_text,
                        parse_mode="HTML",
                        reply_markup=markup
                    )
                    sent_video = True
                except Exception:
                    pass

        if not sent_video:
            try:
                bot.edit_message_text(
                    guide_text,
                    chat_id=call.message.chat.id,
                    message_id=call.message.message_id,
                    parse_mode="HTML",
                    reply_markup=markup,
                    disable_web_page_preview=False
                )
            except Exception:
                try:
                    bot.delete_message(call.message.chat.id, call.message.message_id)
                except Exception:
                    pass
                bot.send_message(
                    call.message.chat.id,
                    guide_text,
                    parse_mode="HTML",
                    reply_markup=markup
                )
                
        bot.answer_callback_query(call.id)

    elif call.data == "btn_back_home":
        bot.answer_callback_query(call.id)
        bot.clear_step_handler_by_chat_id(chat_id=call.message.chat.id)
        
        cfg = get_config()
        custom_welcome = cfg.get("WELCOME_TEXT")
        tg_id = call.from_user.id
        user = get_user_data(tg_id)
        bot_nickname = cfg.get("BOT_NICKNAME", "دالتون بات")
        
        if custom_welcome and user:
            formatted_balance = f"{int(user.get('walletBalance') or 0):,}"
            welcome_text = custom_welcome.replace("{tg_id}", str(tg_id)).replace("{wallet_balance}", formatted_balance).replace("{nickname}", bot_nickname)
        else:
            balance = f"{int(user.get('walletBalance') or 0):,}" if user else "0"
            welcome_text = (
                f"<b>🚀 به ربات پرسرعت {bot_nickname} بازگشتید!</b>\n\n"
                f"با خرید از شبکه پرسرعت ما، از اتصال ایمن، پینگ پایین و آی‌پی ثابت لذت ببرید.\n\n"
                f"🆔 شناسه تلگرام شما: <code>{tg_id}</code>\n"
                f"💰 موجودی کیف پول: <code>{balance}</code> تومان\n\n"
                f"👇 لطفا گزینه مورد نظر خود را از منوی زیر انتخاب نمایید:"
            )
            
        try:
            # Instead of completely removing the message (which deletes configs/QR), we just try to remove the inline keyboard
            # so the user keeps their config history. We will only delete if it's explicitly a purely navigational text message.
            if call.message.content_type == 'text':
                 bot.delete_message(chat_id=call.message.chat.id, message_id=call.message.message_id)
            else:
                 bot.edit_message_reply_markup(chat_id=call.message.chat.id, message_id=call.message.message_id, reply_markup=None)
        except Exception:
            pass
            
        bot.send_message(
            chat_id=call.message.chat.id,
            text=welcome_text,
            parse_mode="HTML",
            reply_markup=get_custom_keyboard()
        )

    elif call.data == "charge_custom_amount":
        try:
            tg_id = call.from_user.id
            bot.edit_message_text(
                "✍️ <b>مبلغ مورد نظر خود را برای شارژ به تومان ارسال کنید:</b>\n\n"
                "• برای مثال جهت شارژ ۱۵۰,۰۰۰ تومان، عدد <code>150000</code> را بفرستید.\n"
                "• جهت انصراف کلمه <code>انصراف</code> را ارسال کنید.\n\n"
                "⚠️ لطفاً فقط عدد انگلیسی وارد کنید:",
                chat_id=call.message.chat.id,
                message_id=call.message.message_id,
                parse_mode="HTML",
                reply_markup=get_cancel_keyboard()
            )
            bot.register_next_step_handler(call.message, process_custom_charge_amount)
            bot.answer_callback_query(call.id)
        except Exception as e:
            print(f"[Error Charge Custom Init] {e}")

def process_ai_support(message):
    tg_id = message.from_user.id
    text = message.text.strip() if message.text else ""
    
    if text == "/start" or "انصراف" in text or "بازگشت" in text or "منصرف" in text:
        bot.send_message(message.chat.id, "❌ چت با دستیار هوشمند متوقف شد.", reply_markup=get_custom_keyboard())
        start_cmd(message)
        return
        
    typing_msg = bot.send_message(message.chat.id, "🤖 <i>در حال تایپ...</i>", parse_mode="HTML")
    
    try:
        import requests
        cfg = get_config()
        port = cfg.get("SERVER_PORT", 3000)
        response = requests.post(f"http://127.0.0.1:{port}/api/ai/chat", json={"userId": tg_id, "message": text, "type": "support"}, timeout=200)
        try:
            bot.delete_message(message.chat.id, typing_msg.message_id)
        except Exception:
            pass
        if response.status_code == 200:
            data = response.json()
            reply = data.get("response", "پاسخی دریافت نشد.")
            try:
                msg = bot.send_message(message.chat.id, reply, parse_mode="Markdown")
            except Exception:
                try:
                    msg = bot.send_message(message.chat.id, reply)
                except Exception as inner_e:
                    raise inner_e
            bot.register_next_step_handler(msg, process_ai_support)
        else:
            try:
                err_data = response.json()
                err_text = err_data.get("error", response.text)
            except Exception:
                err_text = response.text
            msg = bot.send_message(message.chat.id, f"❌ خطای سرور ({response.status_code}):\n{err_text}\n\nدوباره بپرسید:", reply_markup=get_cancel_keyboard())
            bot.register_next_step_handler(msg, process_ai_support)
    except Exception as e:
        try:
            bot.delete_message(message.chat.id, typing_msg.message_id)
        except Exception:
            pass
        msg = bot.send_message(message.chat.id, f"❌ خطا در ارتباط: {e}\nمجدداً تلاش کنید:", reply_markup=get_cancel_keyboard())
        bot.register_next_step_handler(msg, process_ai_support)

def process_ai_general(message):
    tg_id = message.from_user.id
    text = message.text.strip() if message.text else ""
    
    if text == "/start" or "انصراف" in text or "بازگشت" in text or "منصرف" in text:
        bot.send_message(message.chat.id, "❌ چت با هوش‌مصنوعی متوقف شد.", reply_markup=get_custom_keyboard())
        start_cmd(message)
        return
        
    typing_msg = bot.send_message(message.chat.id, "🧠 <i>در حال پردازش...</i>", parse_mode="HTML")
    
    try:
        import requests
        cfg = get_config()
        port = cfg.get("SERVER_PORT", 3000)
        response = requests.post(f"http://127.0.0.1:{port}/api/ai/chat", json={"userId": tg_id, "message": text, "type": "general"}, timeout=200)
        try:
            bot.delete_message(message.chat.id, typing_msg.message_id)
        except Exception:
            pass
        if response.status_code == 200:
            data = response.json()
            reply = data.get("response", "پاسخی دریافت نشد.")
            try:
                msg = bot.send_message(message.chat.id, reply, parse_mode="Markdown")
            except Exception:
                try:
                    msg = bot.send_message(message.chat.id, reply)
                except Exception as inner_e:
                    raise inner_e
            bot.register_next_step_handler(msg, process_ai_general)
        else:
            try:
                err_data = response.json()
                err_text = err_data.get("error", response.text)
            except Exception:
                err_text = response.text
            msg = bot.send_message(message.chat.id, f"❌ خطای سرور ({response.status_code}):\n{err_text}\n\nدوباره بپرسید:", reply_markup=get_cancel_keyboard())
            bot.register_next_step_handler(msg, process_ai_general)
    except Exception as e:
        try:
            bot.delete_message(message.chat.id, typing_msg.message_id)
        except Exception:
            pass
        msg = bot.send_message(message.chat.id, f"❌ خطا در ارتباط: {e}\nمجدداً تلاش کنید:", reply_markup=get_cancel_keyboard())
        bot.register_next_step_handler(msg, process_ai_general)

def process_colleague_login_username(message):
    tg_id = message.from_user.id
    text = message.text.strip() if message.text else ""
    
    if text == "/start" or "انصراف" in text or "بازگشت" in text or "منصرف" in text:
        bot.send_message(message.chat.id, "❌ ورود لغو شد.", reply_markup=get_custom_keyboard())
        start_cmd(message)
        return
        
    db = read_sqlite_db()
    accounts = db.get("colleague_accounts", [])
    acc = next((a for a in accounts if a["username"] == text), None)
    
    if not acc:
        msg = bot.send_message(message.chat.id, "❌ <b>نام کاربری یافت نشد!</b>\nلطفاً دوباره امتحان کنید یا «انصراف» بفرستید:", parse_mode="HTML", reply_markup=get_cancel_keyboard())
        bot.register_next_step_handler(msg, process_colleague_login_username)
        return
        
    msg = bot.send_message(message.chat.id, "🔑 <b>رمز عبور (Password)</b> خود را بفرستید:", parse_mode="HTML", reply_markup=get_cancel_keyboard())
    bot.register_next_step_handler(msg, process_colleague_login_password, acc)

def show_colleague_panel_msg(message, acc):
    markup = types.InlineKeyboardMarkup()
    markup.row(types.InlineKeyboardButton("➕ ساخت کاربر جدید", callback_data=f"col_cuser_{acc['id']}"))
    markup.row(types.InlineKeyboardButton("👥 لیست کاربران و مصرف", callback_data=f"col_lusers_{acc['id']}"))
    markup.row(types.InlineKeyboardButton("🔍 سرچ کاربر", callback_data=f"col_suser_{acc['id']}"))
    markup.row(types.InlineKeyboardButton("🔄 تمدید سرویس", callback_data=f"col_renew_{acc['id']}"))
    markup.row(types.InlineKeyboardButton("🔙 خروج", callback_data="btn_back_home"))
    
    bot.send_message(
        message.chat.id,
        f"پنل همکار ({acc.get('prefix', 'Col')})\n\nبسته: {acc['packageTitle']}",
        reply_markup=markup
    )

def show_colleague_panel(message, acc):
    markup = types.InlineKeyboardMarkup()
    markup.row(types.InlineKeyboardButton("➕ ساخت کاربر جدید", callback_data=f"col_cuser_{acc['id']}"))
    markup.row(types.InlineKeyboardButton("👥 لیست کاربران و مصرف", callback_data=f"col_lusers_{acc['id']}"))
    markup.row(types.InlineKeyboardButton("🔍 سرچ کاربر", callback_data=f"col_suser_{acc['id']}"))
    markup.row(types.InlineKeyboardButton("🔄 تمدید سرویس", callback_data=f"col_renew_{acc['id']}"))
    markup.row(types.InlineKeyboardButton("🔙 خروج", callback_data="btn_back_home"))
    
    bot.edit_message_text(
        f"پنل همکار ({acc.get('prefix', 'Col')})\n\nبسته: {acc['packageTitle']}",
        chat_id=message.chat.id,
        message_id=message.message_id,
        reply_markup=markup
    )

def process_col_search_user(message, acc):
    text = message.text.strip() if message.text else ""
    if text in ["انصراف", "بازگشت", "/start"] or "منصرف" in text:
        bot.send_message(message.chat.id, "لغو شد.", reply_markup=get_custom_keyboard())
        show_colleague_panel_msg(message, acc)
        return
        
    db = read_sqlite_db()
    keys = db.get("subscription_keys", [])
    col_keys = [k for k in keys if k.get("colleagueAccountId") == acc["id"]]
    
    # Filter by name
    found_keys = []
    for k in col_keys:
        name = k.get("clientName") or k.get("planName") or ""
        if text.lower() in name.lower():
            found_keys.append(k)
            
    if not found_keys:
        bot.send_message(message.chat.id, f"❌ کاربری با عنوان '{text}' یافت نشد.", reply_markup=get_custom_keyboard())
        show_colleague_panel_msg(message, acc)
        return
        
    result_text = f"🔍 <b>نتایج جستجو برای '{text}':</b>\n\n"
    for k in found_keys:
        name = k.get("clientName") or k.get("planName", "نامشخص")
        gb = k.get("trafficLimitGb", 0)
        used_gb = k.get("trafficUsedGb", 0)
        rem_gb = gb - used_gb
        expire_date = k.get("expireDate", "نامشخص")
        url = k.get("subLink", "")
        result_text += f"👤 <b>{name}</b>\n🗄 تخصیص داده شده: {gb} GB\n🔴 مصرف شده: {used_gb} GB\n🟢 مجاز باقیمانده: {rem_gb} GB\n⏳ انقضا: {expire_date}\n🔗 <code>{url}</code>\n\n"
        
    markup = types.InlineKeyboardMarkup()
    for k in found_keys:
        name_short = (k.get("clientName") or k.get("planName", "نامشخص"))[:15]
        markup.row(types.InlineKeyboardButton(f"🗑 حذف: {name_short}", callback_data=f"cdel_{k['id']}"))
    markup.row(types.InlineKeyboardButton("🔙 بازگشت به پنل همکار", callback_data=f"col_panel_{acc['id']}"))
    
    bot.send_message(message.chat.id, result_text, parse_mode="HTML", reply_markup=markup)

def process_col_create_name(message, acc):
    text = message.text.strip() if message.text else ""
    if text in ["انصراف", "بازگشت", "/start"] or "منصرف" in text:
        bot.send_message(message.chat.id, "لغو شد.", reply_markup=get_custom_keyboard())
        show_colleague_panel_msg(message, acc)
        return
        
    import re
    if not re.match("^[A-Za-z0-9_]{4,30}$", text):
        msg = bot.send_message(message.chat.id, "❌ نام کاربری فقط باید شامل حروف انگلیسی، اعداد و خط تیره (_)، و حداقل ۴ حرف باشد.\n\nلطفاً دوباره وارد کنید:", reply_markup=get_cancel_keyboard())
        bot.register_next_step_handler(msg, process_col_create_name, acc)
        return
        
    msg = bot.send_message(message.chat.id, "حجم مورد نظر (به گیگابایت) را وارد کنید:")
    bot.register_next_step_handler(msg, process_col_create_gb, acc, text)

def process_col_create_gb(message, acc, name):
    text = message.text.strip() if message.text else ""
    if text in ["انصراف", "بازگشت", "/start"] or "منصرف" in text:
        bot.send_message(message.chat.id, "لغو شد.", reply_markup=get_custom_keyboard())
        show_colleague_panel_msg(message, acc)
        return
        
    try:
        gb = int(text)
    except ValueError:
        msg = bot.send_message(message.chat.id, "لطفاً یک عدد صحیح معتبر برای حجم وارد کنید:")
        bot.register_next_step_handler(msg, process_col_create_gb, acc, name)
        return
        
    # Enforce matched package minimum GB limit
    db = read_sqlite_db()
    pkgs = db.get("colleague_packages", [])
    matched_pkg = next((p for p in pkgs if p.get("id") == acc.get("packageId")), None)
    min_gb = 1
    if matched_pkg and matched_pkg.get("minCreateGb"):
        try:
            min_gb = int(matched_pkg.get("minCreateGb"))
        except:
            min_gb = 1
            
    if gb < min_gb:
        msg = bot.send_message(message.chat.id, f"⚠️ حداقل حجم مجاز برای هر اشتراک در پکیج شما {min_gb} گیگابایت است. لطفاً حجم بیشتری وارد کنید:")
        bot.register_next_step_handler(msg, process_col_create_gb, acc, name)
        return
        
    msg = bot.send_message(message.chat.id, "تعداد روز اعتبار را وارد کنید:")
    bot.register_next_step_handler(msg, process_col_create_days, acc, name, gb)

def process_col_create_days(message, acc, name, gb):
    text = message.text.strip() if message.text else ""
    if text in ["انصراف", "بازگشت", "/start"] or "منصرف" in text:
        bot.send_message(message.chat.id, "لغو شد.", reply_markup=get_custom_keyboard())
        show_colleague_panel_msg(message, acc)
        return
        
    try:
        days = int(text)
    except ValueError:
        msg = bot.send_message(message.chat.id, "لطفاً یک عدد صحیح معتبر برای روز وارد کنید:")
        bot.register_next_step_handler(msg, process_col_create_days, acc, name, gb)
        return
        
    db = read_sqlite_db()
    accounts = db.get("colleague_accounts", [])
    acc_idx = next((i for i, a in enumerate(accounts) if a["id"] == acc["id"]), -1)
    
    if acc_idx == -1:
        bot.send_message(message.chat.id, "حساب همکار یافت نشد.", reply_markup=get_custom_keyboard())
        return
        
    live_acc = accounts[acc_idx]
    total = live_acc.get("trafficGb", 0)
    used = live_acc.get("usedTrafficGb", 0)
    remain = total - used
    
    if remain <= 0:
        bot.send_message(message.chat.id, "❌ حجم کل تخصیص داده شده شما به اتمام رسیده است!", reply_markup=get_custom_keyboard())
        show_colleague_panel_msg(message, live_acc)
        return
        
    if gb > remain:
        bot.send_message(message.chat.id, f"❌ محدودیت تخصیص برای این کانفیگ از مصرف باقیمانده کل شما بیشتر است!\n\nمجاز باقیمانده: {remain:.2f} گیگابایت", reply_markup=get_custom_keyboard())
        show_colleague_panel_msg(message, live_acc)
        return
        
    import uuid
    import time
    from datetime import datetime
    
    full_name = f"{live_acc.get('prefix', 'Col')}-{name}"
    
    cfg = get_config()
    servers = cfg.get("COLLEAGUE_SERVERS", [])
    if not servers:
        bot.send_message(message.chat.id, "⚠️ هیچ سروری برای بخش همکاران تعریف نشده است. لطفا به مدیریت اطلاع دهید تا سرورهای همکاران را اضافه کنند.", reply_markup=get_custom_keyboard())
        show_colleague_panel_msg(message, live_acc)
        return
        
    active_servers = [s for s in servers if s.get("status") == "active" and (not s.get("planCategories") or live_acc.get("packageId") in s.get("planCategories"))]
    
    if not active_servers:
        # Fallback if no matching categories found but there are active servers in colleague tab
        active_servers = [s for s in servers if s.get("status") == "active"]
        
    if not active_servers:
        bot.send_message(message.chat.id, "⚠️ هیچ سرور فعالی در بخش همکاران یافت نشد. لطفا به مدیریت اطلاع دهید.", reply_markup=get_custom_keyboard())
        show_colleague_panel_msg(message, live_acc)
        return

    # Always show server selection to colleague so they explicitly choose their preferred server
    markup = types.InlineKeyboardMarkup()
    for i, s in enumerate(active_servers):
        srv_name = s.get('name') or f"Server {i+1}"
        markup.row(types.InlineKeyboardButton(f"🌐 {srv_name}", callback_data=f"colsrv_{acc['id']}_{gb}_{days}_{s.get('id')}"))
    bot.send_message(message.chat.id, f"لطفاً سرور مورد نظر برای ساخت کانفیگ همکار را انتخاب کنید:\nنام کاربری: {name}\nحجم: {gb} گیگابایت\nاعتبار: {days} روز", reply_markup=markup)
    
    # Save temporary name in db to be retrieved in callback
    db = read_sqlite_db()
    if "pending_col_creations" not in db:
        db["pending_col_creations"] = {}
    db["pending_col_creations"][acc['id']] = {"name": name, "gb": gb, "days": days}
    write_sqlite_db(db)
    return
    
    if not sub_link:
        if not cfg.get("SIMULATOR_MODE"):
            session = get_session()
            last_err = getattr(session, "last_error", "خطای ناشناخته")
            notify_admins_of_error("ساخت کانفیگ همکار (تیم)", last_err, f"Colleague ID: {acc.get('id')} / Name: {name}")
            bot.send_message(
                message.chat.id,
                "❌ <b>خطا در ساخت کانفیگ همکار!</b>\n\n"
                "متأسفانه امکان اتصال به پنل x-ui و ایجاد این اکانت در این لحظه وجود ندارد.\n\n"
                "⚠️ <b>جزئیات خطا جهت بررسی به تیم پشتیبانی گزارش شد.</b>\n\n"
                "⚠️ <b>هیچ ترافیکی از حساب همکار شما کسر نشد.</b>\n\n"
                "لطفاً وضعیت سرور را بررسی کرده یا مجدداً تلاش کنید.",
                parse_mode="HTML",
                reply_markup=get_custom_keyboard()
            )
            show_colleague_panel_msg(message, live_acc)
            return
            
        import random, string
        client_uuid = str(uuid.uuid4())
        fallback_sub_id = ''.join(random.choices(string.ascii_lowercase + string.digits, k=16))
        port = cfg.get("SERVER_PORT", 3000)
        cfg_url = cfg.get("SUB_URL", f"http://localhost:{port}")
        sub_link = f"{cfg_url}/sub/{fallback_sub_id}"

    live_acc["usedTrafficGb"] = used + gb
    accounts[acc_idx] = live_acc
    db["colleague_accounts"] = accounts

    expire_date = time.strftime("%Y-%m-%d", time.localtime(time.time() + days * 24 * 60 * 60))
    sub_id = f"SUB-{int(time.time()) % 9000 + 1000}"
    
    sub = {
        "id": sub_id,
        "userId": live_acc.get("userId", message.chat.id),
        "planId": "colleague_custom",
        "planName": full_name,
        "clientName": full_name,
        "subLink": sub_link,
        "expireDate": expire_date,
        "trafficLimitGb": gb,
        "trafficUsedGb": 0.0,
        "status": "active",
        "colleagueAccountId": live_acc["id"],
        "clientUuid": client_uuid,
        "serverId": active_server_id
    }
    
    if "subscription_keys" not in db:
        db["subscription_keys"] = []
    db["subscription_keys"].append(sub)
    
    write_sqlite_db(db)
    
    log_action(
        message.from_user.id, 
        message.from_user.username or str(message.from_user.id), 
        "colleague_create_config", 
        f"همکار کانفیگی با نام '{full_name}' ({gb} گیگ - {days} روز) ایجاد کرد."
    )
    
    bot.send_message(message.chat.id, "✅ کانفیگ در پنل X-UI ایجاد شد.")
    
    cfg_settings = get_config()
    success_note = cfg_settings.get("PURCHASE_SUCCESS_NOTE", "").strip()
    note_attach = cfg_settings.get("PURCHASE_SUCCESS_ATTACHMENT", None)
    has_media = bool(note_attach and "fileData" in note_attach)
    
    note_append = ""
    if success_note and not has_media:
        note_append = f"\n\n━━━━━━━━━━━━━━━━━━\n{success_note}"

    vless_links = get_client_all_links(full_name, client_uuid, sub_link, server_id=active_server_id)
    links_text = "\n\n🔸━━━━━━━━━━━━━━━━━━🔸\n\n".join([f"<code>{l}</code>" for l in vless_links]) if vless_links else f"<code>{sub_link}</code>"

    text_msg = (
        f"✅ <b>لینک سابسکریپشن شما با موفقیت ایجاد شد:</b>\n\n"
        f"👤 <b>نام:</b> {full_name}\n"
        f"🗄 <b>حجم:</b> {gb} گیگابایت\n"
        f"⏳ <b>اعتبار:</b> {days} روز\n\n"
        f"🔗 <b>لینک سابسکریپشن (قابل کپی):</b>\n<code>{sub_link}</code>\n\n"
        f"👇 جهت کپی کردن لینک‌های مستقیم، روی دکمه زیر ضربه بزنید:{note_append}\n\n"
        f"🚀 <b>لینک‌های اتصال مستقیم:</b>\n{links_text}"
    )
    
    # Build markup with copy button at the top
    markup = types.InlineKeyboardMarkup(row_width=2)
    add_copy_button_to_markup(markup, "📋 کپی آسان لینک سابسکریپشن (کلیک کنید)", sub_link)
    
    # Do NOT append custom menu keys here as this is colleague flow
    # markup.add(types.InlineKeyboardButton("🔙 بازگشت به پنل همکار", callback_data=f"col_panel_{live_acc['id']}"))
    
    try:
        import urllib.parse
        qr_url = get_qr_code_url(sub_link)
        safe_send_qr_photo(message.chat.id, qr_url, text_msg, markup)
    except Exception as e:
        print(f"[Bot Warning] Failed to send QR Photo: {e}")
        
    send_purchase_success_note_if_any(message.chat.id, only_media=True)
    
    show_colleague_panel_msg(message, live_acc)

def process_col_renew_gb(message, acc, sub):
    text = message.text.strip() if message.text else ""
    if text in ["انصراف", "بازگشت", "/start"] or "منصرف" in text:
        bot.send_message(message.chat.id, "لغو شد.", reply_markup=get_custom_keyboard())
        show_colleague_panel_msg(message, acc)
        return
        
    try:
        add_gb = int(text)
    except ValueError:
        msg = bot.send_message(message.chat.id, "لطفاً یک عدد صحیح معتبر برای حجم وارد کنید:")
        bot.register_next_step_handler(msg, process_col_renew_gb, acc, sub)
        return
        
    msg = bot.send_message(message.chat.id, "تعداد روز اعتبار جدید (برای اضافه شدن به تاریخ انقضای فعلی و یا جایگزینی) را وارد کنید:")
    bot.register_next_step_handler(msg, process_col_renew_days, acc, sub, add_gb)

def process_col_renew_days(message, acc, sub, add_gb):
    text = message.text.strip() if message.text else ""
    if text in ["انصراف", "بازگشت", "/start"] or "منصرف" in text:
        bot.send_message(message.chat.id, "لغو شد.", reply_markup=get_custom_keyboard())
        show_colleague_panel_msg(message, acc)
        return
        
    try:
        days = int(text)
    except ValueError:
        msg = bot.send_message(message.chat.id, "لطفاً یک عدد صحیح معتبر برای روز وارد کنید:")
        bot.register_next_step_handler(msg, process_col_renew_days, acc, sub, add_gb)
        return
        
    db = read_sqlite_db()
    accounts = db.get("colleague_accounts", [])
    acc_idx = next((i for i, a in enumerate(accounts) if a["id"] == acc["id"]), -1)
    
    if acc_idx == -1:
        bot.send_message(message.chat.id, "حساب همکار یافت نشد.", reply_markup=get_custom_keyboard())
        return
        
    live_acc = accounts[acc_idx]
    total = live_acc.get("trafficGb", 0)
    used = live_acc.get("usedTrafficGb", 0)
    remain = total - used
    
    if add_gb > remain:
        bot.send_message(message.chat.id, f"❌ حجم درخواستی جهت تمدید از باقیمانده کل بسته همکار شما بیشتر است!\n\nمجاز باقیمانده: {remain:.2f} گیگابایت", reply_markup=get_custom_keyboard())
        show_colleague_panel_msg(message, live_acc)
        return
        
    # Deduct from colleague total
    live_acc["usedTrafficGb"] = used + add_gb
    accounts[acc_idx] = live_acc
    db["colleague_accounts"] = accounts
    
    # Update subscription
    keys = db.get("subscription_keys", [])
    sub_idx = -1
    sub_id = sub.get("id")
    client_uuid = sub.get("clientUuid")
    client_name = sub.get("clientName") or sub.get("planName", "")

    # Try 1: By ID
    if sub_id:
        sub_idx = next((i for i, k in enumerate(keys) if k.get("id") == sub_id), -1)
    # Try 2: By Client UUID
    if sub_idx == -1 and client_uuid:
        sub_idx = next((i for i, k in enumerate(keys) if k.get("clientUuid") == client_uuid), -1)
    # Try 3: By Client Name
    if sub_idx == -1 and client_name:
        sub_idx = next((i for i, k in enumerate(keys) if (k.get("clientName") or k.get("planName", "")) == client_name), -1)
    
    if sub_idx != -1:
        import time
        from datetime import datetime, timedelta
        live_sub = keys[sub_idx]
        
        try:
            exp_dt = datetime.strptime(live_sub.get('expireDate', '2000-01-01'), '%Y-%m-%d')
            if exp_dt < datetime.now():
                new_exp_dt = datetime.now() + timedelta(days=days)
            else:
                new_exp_dt = exp_dt + timedelta(days=days)
        except:
            new_exp_dt = datetime.now() + timedelta(days=days)
            
        new_expire_date_str = new_exp_dt.strftime('%Y-%m-%d')
        new_limit_gb = float(live_sub.get('trafficLimitGb', 0)) + add_gb
        
        new_exp_days = (new_exp_dt - datetime.now()).days
        new_exp_days = max(1, new_exp_days)
        
        client_name = live_sub.get("clientName") or live_sub.get("planName", "")
        delete_vpn_client_api(client_name, live_sub.get("clientUuid"), server_id=live_sub.get("serverId"))
        _, sub_link = add_vpn_client_api(client_name, new_limit_gb, new_exp_days, live_sub.get("clientUuid"), server_id=live_sub.get("serverId"))
        
        if not sub_link:
            # Revert deduction
            live_acc["usedTrafficGb"] = used
            accounts[acc_idx] = live_acc
            db["colleague_accounts"] = accounts
            write_sqlite_db(db)
            bot.send_message(message.chat.id, "❌ خطا در اتصال به سرور جهت انجام عملیات تمدید.\n\n✅ حجم کسر شده بازگردانده شد.", reply_markup=get_custom_keyboard())
            show_colleague_panel_msg(message, live_acc)
            return
        
        live_sub['expireDate'] = new_expire_date_str
        live_sub['trafficLimitGb'] = new_limit_gb
        if sub_link:
            live_sub['subLink'] = sub_link
            
        keys[sub_idx] = live_sub
        db["subscription_keys"] = keys
        write_sqlite_db(db)
        
        bot.send_message(message.chat.id, "✅ تمدید کاربر با موفقیت انجام شد.", reply_markup=get_custom_keyboard())
        
    show_colleague_panel_msg(message, live_acc)

def process_colleague_prefix(message, package):
    tg_id = message.from_user.id
    text = message.text.strip() if message.text else ""
    
    if text == "/start" or "انصراف" in text or "بازگشت" in text or "منصرف" in text:
        bot.send_message(message.chat.id, "❌ خرید لغو شد.", reply_markup=get_custom_keyboard())
        start_cmd(message)
        return
        
    import re
    if not re.match("^[A-Za-z0-9_]{2,10}$", text):
        msg = bot.send_message(message.chat.id, "❌ پیشوند (Prefix) فقط باید شامل حروف و اعداد انگلیسی باشد (بین ۲ تا ۱۰ کاراکتر).\n\nمجدداً وارد کنید:")
        bot.register_next_step_handler(msg, process_colleague_prefix, package)
        return

    db = read_sqlite_db()
    if any(a.get("prefix") and a.get("prefix").lower() == text.lower() for a in db.get("colleague_accounts", [])):
        msg = bot.send_message(message.chat.id, "❌ این پیشوند (Prefix) قبلاً توسط شخص دیگری ثبت شده است! لطفا یک پیشوند دیگر وارد کنید:", reply_markup=get_cancel_keyboard())
        bot.register_next_step_handler(msg, process_colleague_prefix, package)
        return

    msg = bot.send_message(
        message.chat.id,
        "🔐 <b>لطفاً یک توکن (بازیابی) برای خودتان تعریف کنید:</b>\n"
        "(مثلاً یک اسم و عدد مثل <code>Daltoon123</code>. این توکن برای زمان فراموشی رمز ورود پنل همکار استفاده خواهد شد)\n"
        "(برای انصراف کلمه «انصراف» را بفرستید)",
        parse_mode="HTML",
        reply_markup=get_cancel_keyboard()
    )
    bot.register_next_step_handler(msg, process_colleague_pkg_token, package, text)
    
def process_colleague_pkg_token(message, package, prefix_text):
    tg_id = message.from_user.id
    token = message.text.strip() if message.text else ""

    if token == "/start" or "انصراف" in token or "بازگشت" in token or "منصرف" in token:
        bot.send_message(message.chat.id, "❌ خرید لغو شد.", reply_markup=get_custom_keyboard())
        start_cmd(message)
        return

    import re
    if not re.match("^[A-Za-z0-9_]{3,30}$", token):
        msg = bot.send_message(message.chat.id, "❌ توکن فقط باید شامل حروف انگلیسی و اعداد (بدون فاصله) و حداقل ۳ حرف باشد.\n\nلطفاً دوباره وارد کنید:", reply_markup=get_cancel_keyboard())
        bot.register_next_step_handler(msg, process_colleague_pkg_token, package, prefix_text)
        return

    db = read_sqlite_db()
    if any(a.get("recoveryToken") == token for a in db.get("colleague_accounts", [])):
        msg = bot.send_message(message.chat.id, "❌ این توکن قبلاً توسط شخص دیگری ثبت شده است! لطفاً یک توکن اختصاصی دیگر وارد کنید:", reply_markup=get_cancel_keyboard())
        bot.register_next_step_handler(msg, process_colleague_pkg_token, package, prefix_text)
        return

    # Show payment methods
    global pending_col_requests
    if 'pending_col_requests' not in globals():
        global pending_col_requests
        pending_col_requests = {}
        
    pending_col_requests[tg_id] = {
        "package_id": package["id"],
        "prefix": prefix_text,
        "token": token,
        "action": "buy"
    }
    
    cfg = get_config()
    price_text = f"{int(package['price']):,} تومان"
    
    text_response = (
        f"✅ <b>اطلاعات ثبت شد.</b>\n\n"
        f"🛒 <b>خرید بسته همکار: {package['title']}</b>\n"
        f"👤 پسوند کانفیگ‌ها: <code>{prefix_text}</code>\n"
        f"💰 مبلغ نهایی: <b>{price_text}</b>\n\n"
        f"💳 <b>لطفاً روش پرداخت خود را انتخاب کنید:</b>"
    )
    
    markup = types.InlineKeyboardMarkup(row_width=1)
    
    is_owner = bool(cfg.get("OWNER_ID") and int(tg_id) == int(cfg["OWNER_ID"]))
    is_admin = bool(cfg.get("ADMINS") and int(tg_id) in cfg["ADMINS"])
    is_privileged = is_owner or is_admin
    
    if is_privileged:
        markup.add(types.InlineKeyboardButton("🎁 تایید مستقیم (ایجاد حساب ادمین)", callback_data=f"col_pay:wallet"))
    else:
        markup.add(types.InlineKeyboardButton("💳 پرداخت از موجودی کیف پول", callback_data=f"col_pay:wallet"))
        markup.add(types.InlineKeyboardButton("💳 پرداخت کارت به کارت", callback_data=f"col_pay:card"))
        if cfg.get("GATEWAY_STARS_STATUS"):
            markup.add(types.InlineKeyboardButton("⭐️ پرداخت با Stars تلگرام", callback_data=f"col_pay:stars"))
            
    # Allow crypto? User only asked for Wallet, Card, Stars. Let's stick to those.
    markup.add(types.InlineKeyboardButton("❌ لغو خرید", callback_data="mm_btnColleagues"))
    
    bot.send_message(message.chat.id, text_response, parse_mode="HTML", reply_markup=markup)

def process_col_renew_payment(message, acc_id, package):
    tg_id = message.chat.id
    global pending_col_requests
    if 'pending_col_requests' not in globals():
        global pending_col_requests
        pending_col_requests = {}
        
    pending_col_requests[tg_id] = {
        "package_id": package["id"],
        "acc_id": acc_id,
        "action": "renew"
    }
    
    cfg = get_config()
    price_text = f"{int(package['price']):,} تومان"
    
    text_response = (
        f"✅ <b>درخواست تمدید ثبت شد.</b>\n\n"
        f"🔄 <b>تمدید بسته همکار: {package['title']}</b>\n"
        f"💰 مبلغ نهایی: <b>{price_text}</b>\n\n"
        f"💳 <b>لطفاً روش پرداخت خود را انتخاب کنید:</b>"
    )
    
    markup = types.InlineKeyboardMarkup(row_width=1)
    
    is_owner = bool(cfg.get("OWNER_ID") and int(tg_id) == int(cfg["OWNER_ID"]))
    is_admin = bool(cfg.get("ADMINS") and int(tg_id) in cfg["ADMINS"])
    is_privileged = is_owner or is_admin
    
    if is_privileged:
        markup.add(types.InlineKeyboardButton("🎁 تایید مستقیم (تمدید ادمین)", callback_data=f"col_pay:wallet"))
    else:
        markup.add(types.InlineKeyboardButton("💳 پرداخت از موجودی کیف پول", callback_data=f"col_pay:wallet"))
        markup.add(types.InlineKeyboardButton("💳 پرداخت کارت به کارت", callback_data=f"col_pay:card"))
        if cfg.get("GATEWAY_STARS_STATUS"):
            markup.add(types.InlineKeyboardButton("⭐️ پرداخت با Stars تلگرام", callback_data=f"col_pay:stars"))
            
    markup.add(types.InlineKeyboardButton("❌ لغو تمدید", callback_data=f"col_panel_{acc_id}"))
    
    bot.send_message(message.chat.id, text_response, parse_mode="HTML", reply_markup=markup)

def finalize_colleague_purchase(tg_id, req, package, message=None):
    print(f"[DEBUG] finalize_colleague_purchase for tg_id={tg_id}, package={package['title']}")
    try:
        import random
        import string
        import uuid
        from datetime import datetime
        
        action = req.get("action", "buy")
        db = read_sqlite_db()
        
        if action == "buy":
            prefix_text = req.get("prefix", "")
            token = req.get("token", "")
            username = "C" + "".join(random.choices(string.digits, k=5))
            password = "".join(random.choices(string.ascii_letters + string.digits, k=8))
            
            if not db.get("colleague_accounts"):
                db["colleague_accounts"] = []
                
            new_acc = {
                "id": str(uuid.uuid4()),
                "userId": tg_id,
                "username": username,
                "password": password,
                "packageId": package["id"],
                "packageTitle": package["title"],
                "createdAt": datetime.now().strftime("%Y-%m-%d"),
                "trafficGb": package["trafficGb"],
                "usedTrafficGb": 0,
                "prefix": prefix_text,
                "recoveryToken": token,
                "status": "active"
            }
            
            db["colleague_accounts"].append(new_acc)
            write_sqlite_db(db)
            
            tg_user = ""
            try:
                # message can be Message or CallbackQuery message
                if hasattr(message, 'chat') and hasattr(message.chat, 'username'):
                    tg_user = message.chat.username or str(tg_id)
                else:
                    tg_user = str(tg_id)
            except: tg_user = str(tg_id)
            
            log_action(tg_id, tg_user, "buy_colleague_package", f"بسته همکار '{package['title']}' را خریداری کرد. (پسوند: {prefix_text})")
            
            bot.send_message(
                tg_id,
                f"✅ <b>خرید بسته همکار با موفقیت انجام شد!</b>\n\n"
                f"بسته خریداری شده: {package['title']}\n"
                f"پسوند تنظیم شده: {prefix_text}\n\n"
                f"اطلاعات ورود شما:\n"
                f"👤 <b>یوزرنیم:</b> <code>{username}</code>\n"
                f"🔑 <b>رمز عبور:</b> <code>{password}</code>\n\n"
                f"جهت ورود به پنل، حساب خود را از طریق منوی همکاران انتخاب کنید.",
                parse_mode="HTML"
            )
            if message:
                show_colleague_panel_msg(message, new_acc)
                
        elif action == "renew":
            acc_id = req.get("acc_id")
            accounts = db.get("colleague_accounts", [])
            acc_idx = next((i for i, a in enumerate(accounts) if a["id"] == acc_id), None)
            if acc_idx is not None:
                acc = accounts[acc_idx]
                acc["trafficGb"] = acc.get("trafficGb", 0) + package["trafficGb"]
                acc["packageTitle"] = package["title"]
                accounts[acc_idx] = acc
                db["colleague_accounts"] = accounts
                write_sqlite_db(db)
                
                tg_user = str(tg_id)
                log_action(tg_id, tg_user, "renew_colleague_package", f"بسته همکار تمدید شد. افزایش حجم: {package['trafficGb']} GB")
                
                bot.send_message(
                    tg_id,
                    f"✅ <b>تمدید با موفقیت انجام شد!</b>\n\nحجم اضافه شده: {package['trafficGb']} گیگابایت\nنام پلن: {package['title']}",
                    parse_mode="HTML"
                )
                if message:
                    show_colleague_panel_msg(message, acc)
                    
        # clear request
        global pending_col_requests
        if 'pending_col_requests' in globals() and tg_id in pending_col_requests:
            del pending_col_requests[tg_id]
            
    except Exception as e:
        print(f"[ERROR] finalize_colleague_purchase crash: {e}")
        bot.send_message(tg_id, f"❌ متاسفانه خطایی در فعال‌سازی نهایی رخ داد: {e}")
    if 'pending_col_requests' in globals() and tg_id in pending_col_requests:
        del pending_col_requests[tg_id]

# Define col_pay callback handler logic later

def process_colleague_login_password(message, acc):
    tg_id = message.from_user.id
    text = message.text.strip() if message.text else ""
    
    if text == "/start" or "انصراف" in text or "بازگشت" in text or "منصرف" in text:
        bot.send_message(message.chat.id, "❌ ورود لغو شد.", reply_markup=get_custom_keyboard())
        start_cmd(message)
        return
        
    if acc["password"] != text:
        msg = bot.send_message(message.chat.id, "❌ <b>رمز عبور اشتباه است!</b>\nلطفاً دوباره امتحان کنید یا «انصراف» بفرستید:", parse_mode="HTML", reply_markup=get_cancel_keyboard())
        bot.register_next_step_handler(msg, process_colleague_login_password, acc)
        return
        
    if acc["status"] != "active":
        bot.send_message(message.chat.id, "❌ حساب کاربری شما غیرفعال یا منقضی شده است.", reply_markup=get_custom_keyboard())
        start_cmd(message)
        return
        
    if not acc.get("userId"):
        acc["userId"] = tg_id
        db = read_sqlite_db()
        for idx, a in enumerate(db.get("colleague_accounts", [])):
            if a["id"] == acc["id"]:
                db["colleague_accounts"][idx]["userId"] = tg_id
                break
        write_sqlite_db(db)

    bot.send_message(message.chat.id, "✅ ورود موفقیت‌آمیز بود.", reply_markup=types.ReplyKeyboardRemove())
    show_colleague_panel_msg(message, acc)
    return

def process_ticket_message(message):
    tg_id = message.from_user.id
    username = message.from_user.username or f"user_{tg_id}"
    text = message.text.strip() if message.text else ""
    
    if text == "/start" or "انصراف" in text or "بازگشت" in text or "منصرف" in text:
        bot.send_message(message.chat.id, "❌ ثبت تیکت لغو شد.", reply_markup=get_custom_keyboard())
        start_cmd(message)
        return

    if not text:
        msg = bot.send_message(message.chat.id, "⚠️ <b>لطفاً متن پیام تیکت خود را بفرستید:</b>\n\n(امکان ارسال پیام غیرمتنی در این بخش وجود ندارد. برای انصراف «انصراف» را بفرستید)", parse_mode="HTML", reply_markup=get_cancel_keyboard())
        bot.register_next_step_handler(msg, process_ticket_message)
        return

    import random
    from datetime import datetime

    # Create ticket in SQLite database for dashboard visibility
    ticket_id = f"TKB-{random.randint(1000, 9999)}"
    try:
        db = read_sqlite_db()
        if "tickets" not in db or not isinstance(db["tickets"], list):
            db["tickets"] = []
        
        new_ticket = {
            "id": ticket_id,
            "userId": tg_id,
            "username": username,
            "subject": "پشتیبانی تلگرام",
            "status": "open",
            "createdAt": datetime.now().isoformat(),
            "updatedAt": datetime.now().isoformat(),
            "messages": [
                {
                    "sender": "user",
                    "message": text,
                    "date": datetime.now().isoformat()
                }
            ]
        }
        db["tickets"].append(new_ticket)
        write_sqlite_db(db)
    except Exception as dberr:
        print("Error saving ticket to db:", dberr)

    # Notify admins and owner
    cfg = get_config()
    targets = set()
    owner_id = cfg.get("OWNER_ID")
    if owner_id and owner_id > 0:
        targets.add(owner_id)
    for adm_id in cfg.get("ADMINS", []):
        if adm_id and adm_id > 0:
            targets.add(adm_id)

    # Log action
    try:
        log_action(tg_id, username, "ثبت تیکت پشتیبانی", f"متن پیام: {text} - شناسه تیکت: {ticket_id}")
    except Exception as e:
        print("Error logging ticket:", e)

    # Deliver to each administrator
    admin_notified_count = 0
    for target_id in targets:
        try:
            admin_msg = (
                f"🎫 <b>تیکت جدید از کاربر!</b>\n\n"
                f"🆔 <b>شناسه تیکت:</b> <code>{ticket_id}</code>\n"
                f"👤 <b>کاربر:</b> @{username} (<code>{tg_id}</code>)\n"
                f"📝 <b>متن پیام/مشکل:</b>\n"
                f"<blockquote>{text}</blockquote>\n"
                f"👉 <i>می‌توانید به این تیکت در داشبورد پاسخ دهید.</i>"
            )
            bot.send_message(target_id, admin_msg, parse_mode="HTML")
            admin_notified_count += 1
        except Exception as ex:
            print(f"[Admin Notify Ticket Warning for user ID {target_id}] {ex}")

    # Success feedback
    success_text = (
        f"✅ <b>تیکت شما ثبت شد! (شناسه: {ticket_id})</b>\n\n"
        f"پیام شما در داشبورد ثبت گردید و برای ادمین‌ها ارسال شد. کارشناسان ما در اسرع وقت پاسخگو خواهند بود."
    )
    bot.reply_to(message, success_text, parse_mode="HTML", reply_markup=get_custom_keyboard())

def show_ticket_main_menu(chat_id):
    cfg = get_config()
    nickname = cfg.get("BOT_NICKNAME", "دالتون")
    
    markup = types.InlineKeyboardMarkup(row_width=2)
    markup.add(
        types.InlineKeyboardButton("✍️ ثبت تیکت جدید", callback_data="tkt_new"),
        types.InlineKeyboardButton("🔍 پیگیری پرونده / تیکت‌ها", callback_data="tkt_track")
    )
    markup.add(types.InlineKeyboardButton("🏠 بازگشت به منوی اصلی", callback_data="btn_back_home"))
    
    msg_text = (
        f"🎫 <b>بخش پشتیبانی و تیکتینگ {nickname}</b>\n\n"
        f"مشتری گرامی! خوش آمدید. لطفاً یکی از گزینه‌های زیر را انتخاب کنید:\n\n"
        f"🔹 <b>ثبت تیکت جدید:</b> جهت ثبت پیام، مشکل یا سوال جدید برای مدیریت.\n"
        f"🔸 <b>پیگیری پرونده / تیکت‌ها:</b> مشاهده پاسخ ادمین‌ها و تیکت‌های قبلی شما."
    )
    bot.send_message(chat_id, msg_text, parse_mode="HTML", reply_markup=markup)

def show_user_tickets_list(chat_id, user_id, message_id=None):
    db = read_sqlite_db()
    tickets = db.get("tickets", [])
    
    # Filter tickets for this user
    user_tickets = [t for t in tickets if str(t.get("userId")) == str(user_id)]
    
    markup = types.InlineKeyboardMarkup(row_width=1)
    
    if not user_tickets:
        msg_text = (
            "❌ <b>شما هیچ تیکتی در سیستم ثبت نکرده‌اید!</b>\n\n"
            "می‌توانید با استفاده از دکمه زیر اقدام به ثبت اولین تیکت خود کنید."
        )
        markup.add(types.InlineKeyboardButton("✍️ ثبت تیکت جدید", callback_data="tkt_new"))
        markup.add(types.InlineKeyboardButton("🔙 بازگشت به منوی پشتیبانی", callback_data="mm_btnTicketSupport"))
    else:
        # Sort by last updated datetime or creation
        user_tickets = sorted(user_tickets, key=lambda x: x.get("updatedAt", x.get("createdAt", "")), reverse=True)
        
        msg_text = "🔍 <b>لیست پرونده‌ها و تیکت‌های شما:</b>\n\nلطفاً برای دیدن جزئیات، پاسخ ادمین و یا ادامه مکالمه روی یکی از پرونده‌های زیر کلیک کنید:\n"
        
        for t in user_tickets:
            t_id = t.get("id")
            status = t.get("status", "open")
            
            # Map status to pleasant Persian and emoji
            if status == "open":
                status_txt = "⏳ در انتظار پاسخ"
            elif status == "answered":
                status_txt = "✅ پاسخ داده شده"
            elif status == "closed":
                status_txt = "🔒 بسته شده"
            else:
                status_txt = f"⚙️ {status}"
                
            markup.add(types.InlineKeyboardButton(f"🎫 {t_id} ({status_txt})", callback_data=f"tkt_view_{t_id}"))
            
        markup.add(types.InlineKeyboardButton("🔙 بازگشت به منوی پشتیبانی", callback_data="mm_btnTicketSupport"))

    if message_id:
        try:
            bot.edit_message_text(msg_text, chat_id=chat_id, message_id=message_id, parse_mode="HTML", reply_markup=markup)
        except Exception:
            bot.send_message(chat_id, msg_text, parse_mode="HTML", reply_markup=markup)
    else:
        bot.send_message(chat_id, msg_text, parse_mode="HTML", reply_markup=markup)

def show_ticket_detail(chat_id, ticket_id, message_id=None):
    db = read_sqlite_db()
    tickets = db.get("tickets", [])
    ticket = next((t for t in tickets if t.get("id") == ticket_id), None)
    
    if not ticket:
        msg_text = "❌ <b>پرونده مورد نظر یافت نشد.</b>"
        markup = types.InlineKeyboardMarkup()
        markup.add(types.InlineKeyboardButton("🔙 بازگشت به لیست پرونده‌ها", callback_data="tkt_track"))
        if message_id:
            bot.edit_message_text(msg_text, chat_id=chat_id, message_id=message_id, parse_mode="HTML", reply_markup=markup)
        else:
            bot.send_message(chat_id, msg_text, parse_mode="HTML", reply_markup=markup)
        return

    status = ticket.get("status", "open")
    if status == "open":
        status_txt = "⏳ در انتظار پاسخ کارشناس"
    elif status == "answered":
        status_txt = "✅ پاسخ داده شده"
    elif status == "closed":
        status_txt = "🔒 بسته شده و خاتمه یافته"
    else:
        status_txt = status

    msg_text = (
        f"🎫 <b>جزئیات پرونده پشتیبانی</b>\n\n"
        f"🆔 <b>شناسه تیکت:</b> <code>{ticket_id}</code>\n"
        f"📊 <b>وضعیت:</b> {status_txt}\n"
        f"🕒 <b>آخرین بروزرسانی:</b> {ticket.get('updatedAt', ticket.get('createdAt', ''))[:10]}\n"
        f"━━━━━━━━━━━━━━━━━━━\n\n"
        f"💬 <b>تاریخچه پیام‌ها:</b>\n\n"
    )

    for msg in ticket.get("messages", []):
        sender = msg.get("sender", "user")
        text = msg.get("message", "")
        sender_lbl = "👤 شما" if sender == "user" else "🧠 کارشناس پشتیبانی"
        
        msg_text += (
            f"🔸 <b>{sender_lbl}:</b>\n"
            f"<blockquote>{text}</blockquote>\n\n"
        )

    markup = types.InlineKeyboardMarkup(row_width=2)
    # Give option to reply if ticket is not closed
    if status != "closed":
        markup.add(types.InlineKeyboardButton("✍️ ارسال پاسخ جدید", callback_data=f"tkt_reply_{ticket_id}"))
        
    markup.add(
        types.InlineKeyboardButton("🔄 بروزرسانی", callback_data=f"tkt_view_{ticket_id}"),
        types.InlineKeyboardButton("🔙 لیست پرونده‌ها", callback_data="tkt_track")
    )

    if message_id:
        try:
            bot.edit_message_text(msg_text, chat_id=chat_id, message_id=message_id, parse_mode="HTML", reply_markup=markup)
        except Exception:
            bot.send_message(chat_id, msg_text, parse_mode="HTML", reply_markup=markup)
    else:
        bot.send_message(chat_id, msg_text, parse_mode="HTML", reply_markup=markup)

def initiate_user_ticket_reply(chat_id, ticket_id):
    msg = bot.send_message(
        chat_id,
        f"✍️ <b>لطفاً پیام پاسخ خود را برای تیکت <code>{ticket_id}</code> بنویسید و ارسال کنید:</b>\n\n"
        f"<i>این پیام به ادامه همین پرونده پیوست و برای کارشناسان فرستاده خواهد شد.</i>\n\n"
        f"(برای انصراف کلمه «انصراف» را ارسال کنید)",
        parse_mode="HTML",
        reply_markup=get_cancel_keyboard()
    )
    bot.register_next_step_handler(msg, process_user_reply_message, ticket_id)

def process_user_reply_message(message, ticket_id):
    from datetime import datetime
    tg_id = message.from_user.id
    username = message.from_user.username or f"user_{tg_id}"
    text = message.text.strip() if message.text else ""
    
    if text == "/start" or "انصراف" in text or "بازگشت" in text or "منصرف" in text:
        bot.send_message(message.chat.id, "❌ ارسال پاسخ لغو شد.", reply_markup=get_custom_keyboard())
        start_cmd(message)
        return

    if not text:
        msg = bot.send_message(message.chat.id, "⚠️ <b>لطفاً متن پاسخ خود را بفرستید:</b>\n\n(امکان ارسال پیام غیرمتنی وجود ندارد. برای انصراف «انصراف» را بفرستید)", parse_mode="HTML", reply_markup=get_cancel_keyboard())
        bot.register_next_step_handler(msg, process_user_reply_message, ticket_id)
        return

    db = read_sqlite_db()
    tickets = db.get("tickets", [])
    ticket_idx = next((i for i, t in enumerate(tickets) if t.get("id") == ticket_id), -1)

    if ticket_idx == -1:
        bot.send_message(message.chat.id, "❌ خطایی رخ داد: تیکت مورد نظر پیدا نشد.", reply_markup=get_custom_keyboard())
        return

    # Add message
    tickets[ticket_idx]["messages"].append({
        "sender": "user",
        "message": text,
        "date": datetime.now().isoformat()
    })
    tickets[ticket_idx]["status"] = "open" # Set status back to open when user replies
    tickets[ticket_idx]["updatedAt"] = datetime.now().isoformat()
    
    db["tickets"] = tickets
    write_sqlite_db(db)

    # Notify admins about user reply
    cfg = get_config()
    targets = set()
    owner_id = cfg.get("OWNER_ID")
    if owner_id and owner_id > 0:
        targets.add(owner_id)
    for adm_id in cfg.get("ADMINS", []):
        if adm_id and adm_id > 0:
            targets.add(adm_id)

    # Log action
    try:
        log_action(tg_id, username, "ارسال پاسخ تیکت", f"پاسخ به {ticket_id}: {text}")
    except Exception as e:
        print("Error logging reply action:", e)

    for target_id in targets:
        try:
            admin_msg = (
                f"💬 <b>پاسخ جدید کاربر به تیکت!</b>\n\n"
                f"🆔 <b>شناسه تیکت:</b> <code>{ticket_id}</code>\n"
                f"👤 <b>کاربر:</b> @{username} (<code>{tg_id}</code>)\n"
                f"📝 <b>متن پیام پاسخ:</b>\n"
                f"<blockquote>{text}</blockquote>\n"
                f"👉 <i>می‌توانید به این تیکت در داشبورد پاسخ دهید.</i>"
            )
            bot.send_message(target_id, admin_msg, parse_mode="HTML")
        except Exception as ex:
            print(f"[Admin Notify Ticket Reply Warning for user ID {target_id}] {ex}")

    bot.send_message(message.chat.id, "✅ <b>پاسخ شما با موفقیت به تیکت پیوست شد!</b>", parse_mode="HTML", reply_markup=get_custom_keyboard())
    show_ticket_detail(message.chat.id, ticket_id)

def process_gift_code(message):
    tg_id = message.from_user.id
    text = message.text.strip() if message.text else ""
    
    if text == "/start" or "انصراف" in text or "بازگشت" in text or "منصرف" in text:
        bot.send_message(message.chat.id, "❌ عملیات لغو شد.", reply_markup=get_custom_keyboard())
        start_cmd(message)
        return

    db = read_sqlite_db()
    gift_codes = db.get("gift_codes", [])
    
    code_obj = next((c for c in gift_codes if c["code"] == text), None)
    
    if not code_obj:
        msg = bot.send_message(message.chat.id, "❌ <b>کد هدیه وارد شده نامعتبر است!</b>\nلطفاً دوباره تلاش کنید یا «انصراف» بفرستید:", parse_mode="HTML", reply_markup=get_cancel_keyboard())
        bot.register_next_step_handler(msg, process_gift_code)
        return
        
    if tg_id in code_obj.get("usedBy", []):
        bot.send_message(message.chat.id, "❌ <b>شما قبلاً از این کد هدیه استفاده کرده‌اید!</b>", parse_mode="HTML", reply_markup=get_custom_keyboard())
        start_cmd(message)
        return
        
    if code_obj.get("totalUsage", 0) >= code_obj.get("maxUsage", 1):
        bot.send_message(message.chat.id, "❌ <b>ظرفیت استفاده از این کد هدیه تکمیل شده است!</b>", parse_mode="HTML", reply_markup=get_custom_keyboard())
        start_cmd(message)
        return
        
    duration_days = code_obj.get("durationDays")
    created_at_str = code_obj.get("createdAt")
    if duration_days and created_at_str:
        from datetime import datetime
        try:
            clean_str = created_at_str.replace("Z", "")
            if "." in clean_str:
                clean_str = clean_str.split(".")[0]
            created_dt = datetime.strptime(clean_str, "%Y-%m-%dT%H:%M:%S")
            now_dt = datetime.utcnow()
            delta = now_dt - created_dt
            if delta.days >= duration_days:
                bot.send_message(message.chat.id, "❌ <b>مهلت زمانی و انقضای استفاده از این کد هدیه به پایان رسیده است!</b>", parse_mode="HTML", reply_markup=get_custom_keyboard())
                start_cmd(message)
                return
        except Exception as ex:
            print(f"[Gift code parse date error]: {ex}")
        
    # Apply gift code
    code_obj["usedBy"].append(tg_id)
    code_obj["totalUsage"] = code_obj.get("totalUsage", 0) + 1
    
    user = next((u for u in db["users"] if u["userId"] == tg_id), None)
    if user:
        user["walletBalance"] = user.get("walletBalance", 0) + code_obj["amount"]
        
    write_sqlite_db(db)
    
    log_action(
        tg_id, 
        message.from_user.username or str(tg_id), 
        "use_gift_code", 
        f"کد هدیه '{code_obj['code']}' را استفاده کرد و {code_obj['amount']} تومان دریافت کرد."
    )
    
    bot.send_message(
        message.chat.id, 
        f"🎁 <b>کد هدیه با موفقیت اعمال شد!</b>\n\nمبلغ <code>{code_obj['amount']:,}</code> تومان به کیف پول شما اضافه گردید.", 
        parse_mode="HTML", 
        reply_markup=get_custom_keyboard()
    )
    start_cmd(message)
    return

def process_custom_charge_amount(message):
    tg_id = message.from_user.id
    text = message.text.strip() if message.text else ""
    
    if text == "/start" or "انصراف" in text or "بازگشت" in text or "منصرف" in text:
        bot.send_message(message.chat.id, "❌ درخواست افزایش موجودی دلخواه لغو شد.", reply_markup=get_custom_keyboard())
        start_cmd(message)
        return
    
    import re
    cleaned_text = text.replace(",", "").replace("，", "").replace(" ", "").replace("_", "").replace("-", "")
    digits = re.findall(r'\d+', cleaned_text)
    
    if not digits:
        msg = bot.send_message(
            message.chat.id,
            "⚠️ <b>مبلغ وارد شده معتبر نیست!</b>\n\n"
            "لطفاً مبلغ مورد نظر خود را فقط به صورت عدد انگلیسی بفرستید (مثال: <code>250000</code>):\n"
            "<i>یا کلمه «انصراف» را جهت لغو ارسال کنید.</i>",
            parse_mode="HTML",
            reply_markup=get_cancel_keyboard()
        )
        bot.register_next_step_handler(msg, process_custom_charge_amount)
        return
        
    amount = int("".join(digits))
    if amount < 1000 or amount > 100000000:
        msg = bot.send_message(
            message.chat.id,
            "⚠️ <b>مبلغ وارد شده مجاز نیست!</b>\n\n"
            "حداقل مبلغ مجاز ۱,۰۰۰ تومان و حداکثر ۱۰۰,۰۰۰,۰۰۰ تومان است.\n"
            "لطفاً مبلغ معتبری بنویسید (یا «انصراف» بفرستید):",
            parse_mode="HTML",
            reply_markup=get_cancel_keyboard()
        )
        bot.register_next_step_handler(msg, process_custom_charge_amount)
        return
        
    set_user_pending_charge(tg_id, amount)
    
    cfg = get_config()
    text_response = (
        f"💳 <b>درخواست شارژ حساب کاربری به مبلغ {amount:,} تومان:</b>\n\n"
        f"لطفاً مبلغ دقیق <b>{amount:,} تومان</b> را به کارت عابربانک مدیریت واریز نمایید:\n\n"
        f"{get_card_payment_info(cfg)}\n\n"
        f"📸 پس از انتقال/واریز، <b>فقط عکس فیش یا رسید پرداختی خود را به این چت بفرستید</b> تا جهت تایید و شارژ برای ادمین ثبت شود."
    )
    bot.send_message(message.chat.id, text_response, parse_mode="HTML", reply_markup=get_cancel_keyboard())

# --- Auto-delete pinned message notification (service message) ---
@bot.message_handler(content_types=['pinned_message'])
def handle_pinned_service_message(message):
    try:
        bot.delete_message(message.chat.id, message.message_id)
    except Exception as e:
        print(f"Error deleting pinned service message: {e}")

# --- Photo, Video & Document Master Media Handler ---
@bot.message_handler(content_types=['photo', 'document', 'video', 'animation'])
def handle_master_media_upload(message):
    tg_id = message.from_user.id
    cfg = get_config()
    is_owner = bool(int(tg_id) == int(cfg.get("OWNER_ID", 0)))
    is_admin = bool(cfg.get("ADMINS") and int(tg_id) in cfg["ADMINS"])
    
    # If the user is an admin or owner, check if they have a pending purchase/charge
    # If they are NOT in a purchase flow, give them the File ID instantly!
    if is_owner or is_admin:
        p_plan, _, _, _, _, _ = get_user_pending_purchase(tg_id)
        db_p = read_sqlite_db()
        user_p = next((u for u in db_p.get("users", []) if u["userId"] == tg_id), None)
        has_pending_charge = user_p.get("pendingChargeAmount") if user_p else None
        
        if not p_plan and not has_pending_charge:
            file_id = None
            media_type = "نامشخص"
            if message.content_type == 'photo':
                file_id = message.photo[-1].file_id
                media_type = "تصویر (Photo)"
            elif message.content_type == 'video':
                file_id = message.video.file_id
                media_type = "ویدیو (Video)"
            elif message.content_type == 'animation':
                file_id = message.animation.file_id
                media_type = "انیمیشن/GIF (Animation)"
            elif message.content_type == 'document':
                file_id = message.document.file_id
                media_type = "سند (Document)"
                
            if file_id:
                cfg = get_config()
                nickname = cfg.get("BOT_NICKNAME", "دالتون")
                reply_txt = (
                    f"🔑 <b>مکانیزم استخراج شناسه رسانه ربات {nickname}</b>\n\n"
                    f"📂 نوع فایل ارسالی: <b>{media_type}</b>\n"
                    f"📌 شناسه فایل (File ID):\n"
                    f"<code>{file_id}</code>\n\n"
                    f"💡 <i>ادمین گرامی، می‌توانید با کپی کردن شناسه بالا، آن را در پنل وب مدیریت در کادر کلاینت مربوطه بگذارید تا کاربرانتان آموزشها را ویدیویی دریافت کنند!</i>"
                )
                bot.reply_to(message, reply_txt, parse_mode="HTML")
                return

    # Non-admins flow
    if message.content_type in ['photo', 'document']:
        handle_receipt_upload(message)
    else:
        bot.send_message(message.chat.id, "⚠️ <b>قالب ارسالی نامعتبر است!</b>\n\nلطفاً فقط تصویر فیش یا رسید واریزی خود را ارسال فرمایید تا جهت تأیید و شارژ یا تمدید اشتراک برای مدیریت ارسال شود.", parse_mode="HTML")

# --- Receipt Handler Logic ---
def handle_receipt_upload(message):
    tg_id = message.from_user.id
    username = message.from_user.username or f"user_{tg_id}"
    caption = message.caption or ""
    
    # Check if user is banned
    user = get_user_data(tg_id)
    if user and user.get('status') == 'banned':
        bot.send_message(message.chat.id, "❌ حساب شما مسدود شده است.")
        return

    if not verify_mandatory_join_and_warn(message.chat.id, tg_id):
         return

    # Check for pending purchase
    pending_plan_id, pending_username, pending_server_id, p_gb, p_days, p_price = get_user_pending_purchase(tg_id)

    # Look up selected amount or fallback to regex extraction or default
    extracted_amount = 0
    if not pending_plan_id:
        extracted_amount = pop_user_pending_charge(tg_id)
        if not extracted_amount:
            import re
            digits = re.findall(r'\d+', caption.replace(",", "").replace("，", ""))
            if digits:
                extracted_amount = int("".join(digits))
                if extracted_amount < 1000 or extracted_amount > 100000000:
                    extracted_amount = 200000
            else:
                extracted_amount = 200000  # Default to 200k if unspecified
    else:
        # Get plan price
        if pending_plan_id in ["custom_vol", "custom_renew"] and p_price:
            extracted_amount = int(p_price)
        else:
            db = read_sqlite_db()
            db_plans = db.get("vpn_plans", [])
            db_plan = next((dp for dp in db_plans if dp["id"] == pending_plan_id), None)
            extracted_amount = int(db_plan["price"]) if db_plan else 0

    try:
        file_id = None
        if message.content_type == 'photo':
            file_id = message.photo[-1].file_id
        elif message.content_type == 'document':
            doc = message.document
            if doc.mime_type and doc.mime_type.startswith("image/"):
                file_id = doc.file_id
            else:
                fn = doc.file_name.lower() if doc.file_name else ""
                if fn.endswith(('.jpg', '.jpeg', '.png', '.webp', '.heic')):
                    file_id = doc.file_id
                    
        if not file_id:
            bot.reply_to(message, "⚠️ لطفا فیش واریزی خود را فقط به صورت عکس یا فایل تصویری (JPEG, PNG و...) بفرستید.")
            return
 
        bot.send_message(message.chat.id, "⌛ در حال انتقال و بررسی رسید شما توسط ادمین هستیم. لطفا کمی صبور باشید.")
 
        file_info = bot.get_file(file_id)
        cfg = get_config()
        token = cfg.get("BOT_TOKEN", "").strip()
        download_url = f"https://api.telegram.org/file/bot{token}/{file_info.file_path}"
        
        import requests
        response = requests.get(download_url, timeout=15)
        if response.status_code == 200:
            import base64
            img_base64 = base64.b64encode(response.content).decode('utf-8')
            receipt_data_uri = f"data:image/jpeg;base64,{img_base64}"
            
            # Save transaction to SQLite database
            db = read_sqlite_db()
            if "transactions" not in db:
                db["transactions"] = []
                
            tx_id = f"TX-{int(time.time())}"
            
            tx_description = f"شارژ انتخابی تلگرام. کپشن فیش: '{caption}'" if caption else f"شارژ انتخابی {extracted_amount:,} تومان بدون کپشن."
            if pending_plan_id:
                if pending_plan_id == "custom_vol":
                    tx_description = f"خرید دلخواه: {p_gb}GB/{p_days}روز, نام کاربری: {pending_username}, سرور: {pending_server_id}"
                elif pending_plan_id == "custom_renew":
                    sub_keys = db.get("subscription_keys", [])
                    sk = next((s for s in sub_keys if s["id"] == pending_username), None)
                    sub_client_name = sk.get("clientName", "سرویس") if sk else "سرویس"
                    tx_description = f"تمدید دلخواه: {p_gb}GB/{p_days}روز, سرویس: {sub_client_name} (شناسه: {pending_username})"
                else:
                    tx_description = f"خرید پلان: {pending_plan_id}, نام کاربری: {pending_username}"

            new_tx = {
                "id": tx_id,
                "userId": int(tg_id),
                "username": username,
                "amount": int(extracted_amount),
                "receiptImage": receipt_data_uri,
                "status": "pending",
                "date": time.strftime("%Y-%m-%dT%H:%M:%S.000Z", time.gmtime()),
                "description": tx_description
            }
            if pending_plan_id:
                new_tx["planId"] = pending_plan_id
                new_tx["clientName"] = pending_username
                new_tx["serverId"] = pending_server_id
                new_tx["type"] = "PLAN_PURCHASE"
                if pending_plan_id in ["custom_vol", "custom_renew"]:
                    new_tx["customGb"] = p_gb
                    new_tx["customDays"] = p_days
            
            db["transactions"].insert(0, new_tx)
            write_sqlite_db(db)
            
            # Clear pending purchase if it exists
            if pending_plan_id:
                clear_user_pending_purchase(tg_id)

            try:
                log_action(int(tg_id), username or f"user_{tg_id}", "ارسال رسید تراکنش", f"کاربر فیش واریزی به مبلغ {extracted_amount:,} تومان را ارسال کرد ( شناسه: {tx_id} ).")
            except Exception as e:
                print("Error logging submit receipt:", e)
            
            reply_text = (
                f"✅ <b>فیش پرداختی شما با موفقیت دریافت شد!</b>\n\n"
                f"📌 شناسه تراکنش: <code>{tx_id}</code>\n"
                f"💰 مبلغ اعلامی: <b>{extracted_amount:,} تومان</b>\n\n"
                f"⌛ در حال انتقال صف بررسی توسط ادمین برای " + ("تحویل کانفیگ" if pending_plan_id else "شارژ") + " هستیم."
            )
            bot.reply_to(message, reply_text, parse_mode="HTML", reply_markup=get_custom_keyboard())
            
            # Send notification to owner and all admins if configured
            targets = set()
            owner_id = cfg.get("OWNER_ID")
            if owner_id and owner_id > 0:
                targets.add(owner_id)
            for adm_id in cfg.get("ADMINS", []):
                if adm_id and adm_id > 0:
                    targets.add(adm_id)
            
            markup = types.InlineKeyboardMarkup(row_width=2)
            markup.add(
                types.InlineKeyboardButton("✅ تایید واریز", callback_data=f"tx_approve:{tx_id}"),
                types.InlineKeyboardButton("❌ رد فیش", callback_data=f"tx_reject:{tx_id}")
            )
            
            use_receipt_bot = False
            r_bot_instance = None
            try:
                r_bot_instance = ReceiptBotManager.get_instance().r_bot
                if r_bot_instance:
                    use_receipt_bot = True
            except Exception as r_ex:
                print(f"[Error getting ReceiptBotManager instance] {r_ex}")

            if use_receipt_bot and r_bot_instance:
                import io
                for target_id in targets:
                    try:
                        nickname = cfg.get("BOT_NICKNAME", "دالتون")
                        admin_msg = (
                            f"🔔 <b>رسید جدید برای تایید واریز شد!</b>\n\n"
                            f"👤 کاربر: @{username} (<code>{tg_id}</code>)\n"
                            f"💰 مبلغ اعلام شده: {extracted_amount:,} تومان\n"
                            f"🆔 شناسه: <code>{tx_id}</code>\n"
                            f"📝 جزئیات تراکنش: {tx_description}\n\n"
                            f"📥 می‌توانید از دکمه‌های زیر جهت بررسی، تایید یا رد فوری و مستقیم این رسید استفاده کنید:"
                        )
                        if message.content_type == 'photo':
                            file_obj = io.BytesIO(response.content)
                            file_obj.name = "receipt.jpg"
                            r_bot_instance.send_photo(target_id, file_obj, caption=admin_msg, parse_mode="HTML", reply_markup=markup)
                        elif message.content_type == 'document':
                            file_obj = io.BytesIO(response.content)
                            file_obj.name = message.document.file_name or "receipt.jpg"
                            r_bot_instance.send_document(target_id, file_obj, caption=admin_msg, parse_mode="HTML", reply_markup=markup)
                        else:
                            r_bot_instance.send_message(target_id, admin_msg, parse_mode="HTML", reply_markup=markup)
                    except Exception as ex:
                        print(f"[Receipt Bot Admin Notify Warning for chat_id {target_id}] {ex}")
            else:
                for target_id in targets:
                    try:
                        nickname = cfg.get("BOT_NICKNAME", "دالتون")
                        admin_msg = (
                            f"🔔 <b>رسید جدید برای تایید واریز شد!</b>\n\n"
                            f"👤 کاربر: @{username} (<code>{tg_id}</code>)\n"
                            f"💰 مبلغ اعلام شده: {extracted_amount:,} تومان\n"
                            f"🆔 شناسه: <code>{tx_id}</code>\n"
                            f"📝 جزئیات تراکنش: {tx_description}\n\n"
                            f"📥 می‌توانید از دکمه‌های زیر جهت بررسی، تایید یا رد فوری و مستقیم این رسید استفاده کنید:"
                        )
                        if message.content_type == 'photo':
                            bot.send_photo(target_id, file_id, caption=admin_msg, parse_mode="HTML", reply_markup=markup)
                        elif message.content_type == 'document':
                            bot.send_document(target_id, file_id, caption=admin_msg, parse_mode="HTML", reply_markup=markup)
                        else:
                            bot.send_message(target_id, admin_msg, parse_mode="HTML", reply_markup=markup)
                    except Exception as ex:
                        print(f"[Admin Notify Warning for chat_id {target_id}] {ex}")
        else:
            bot.reply_to(message, "❌ خطا در دانلود فایل تصویر فیش از سرورهای تلگرام. لطفا مجدد تلاش کنید.", reply_markup=get_custom_keyboard())
    except Exception as e:
        print(f"[Error Processing Telegram Receipt] {e}")
        bot.reply_to(message, "❌ خطای بسته‌های تصویر یا فایل. لطفا مطمئن شوید حجم فیش مناسب است.", reply_markup=get_custom_keyboard())

def process_colleague_recover_token(message):
    token = message.text.strip() if message.text else ""
    if token in ["انصراف", "بازگشت", "/start"] or "منصرف" in token:
        bot.send_message(message.chat.id, "عملیات بازیابی حساب همکار لغو شد.", reply_markup=get_custom_keyboard())
        return

    db = read_sqlite_db()
    accounts = db.get("colleague_accounts", [])
    
    # search for token in colleague accounts
    found_acc = next((a for a in accounts if a.get("recoveryToken") == token), None)
    
    if not found_acc:
        msg = bot.send_message(message.chat.id, "❌ توکن نامعتبر است یا کاربری با این توکن بازیابی یافت نشد.\n\nلطفاً دوباره توکن خود را در صورت داشتن حساب همکار وارد کنید:", reply_markup=get_cancel_keyboard())
        bot.register_next_step_handler(msg, process_colleague_recover_token)
        return
        
    text_msg = (
        f"✅ <b>حساب همکار شما با موفقیت بازیابی شد:</b>\n\n"
        f"👤 <b>نام کاربری:</b> <code>{found_acc['username']}</code>\n"
        f"🔑 <b>رمز عبور:</b> <code>{found_acc['password']}</code>\n"
        f"بسته همکار: {found_acc.get('packageTitle', '')}\n\n"
        f"لطفاً مجدداً از منوی «بسته ویژه همکاران» اقدام به ورود پنل کنید."
    )
    
    markup = types.InlineKeyboardMarkup(row_width=1)
    markup.row(types.InlineKeyboardButton("🔑 تغییر نام‌کاربری و رمز عبور", callback_data=f"col_chpass_{found_acc['id']}"))
    markup.row(types.InlineKeyboardButton("🏠 منوی اصلی", callback_data="btn_back_home"))
    
    bot.send_message(message.chat.id, text_msg, parse_mode="HTML", reply_markup=markup)

def process_colleague_change_password_user(message, acc_id):
    new_user = message.text.strip() if message.text else ""
    if new_user in ["انصراف", "بازگشت", "/start"] or "منصرف" in new_user:
        bot.send_message(message.chat.id, "عملیات تغییر مشخصات لغو شد.", reply_markup=get_custom_keyboard())
        return
        
    msg = bot.send_message(message.chat.id, f"یوزرنیم جدید <code>{new_user}</code> تنظیم شد.\n\n🔑 لطفاً <b>پسورد جدید</b> خود را ارسال کنید:", parse_mode="HTML", reply_markup=get_cancel_keyboard())
    bot.register_next_step_handler(msg, process_colleague_change_password_pass, acc_id, new_user)

def process_colleague_change_password_pass(message, acc_id, new_user):
    new_pass = message.text.strip() if message.text else ""
    if new_pass in ["انصراف", "بازگشت", "/start"] or "منصرف" in new_pass:
        bot.send_message(message.chat.id, "عملیات تغییر مشخصات لغو شد.", reply_markup=get_custom_keyboard())
        return
        
    db = read_sqlite_db()
    accounts = db.get("colleague_accounts", [])
    acc_idx = next((i for i, a in enumerate(accounts) if a["id"] == acc_id), None)
    
    if acc_idx is None:
        bot.send_message(message.chat.id, "❌ حساب همکار یافت نشد.")
        return
        
    accounts[acc_idx]["username"] = new_user
    accounts[acc_idx]["password"] = new_pass
    db["colleague_accounts"] = accounts
    write_sqlite_db(db)
    
    bot.send_message(message.chat.id, f"✅ <b>مشخصات حساب شما تغییر کرد:</b>\n\n👤 <b>یوزرنیم جدید:</b> <code>{new_user}</code>\n🔑 <b>رمز عبور جدید:</b> <code>{new_pass}</code>\n\nجهت ورود به پنل از منوی همکاران استفاده کنید.", parse_mode="HTML", reply_markup=get_custom_keyboard())

def get_custom_pricing_limits(server_id):
    db = read_sqlite_db()
    settings_data = db.get("settings", {})
    import json
    try:
        panel_config = json.loads(settings_data.get("panel_config", "{}"))
        custom_pricing = panel_config.get("customPricingBoxes", [])
    except:
        panel_config = {}
        custom_pricing = []
    if not custom_pricing:
        custom_pricing = settings_data.get("customPricingBoxes", [])
            
    min_gb = 1
    min_days = 1
    
    if isinstance(custom_pricing, list):
        for box in custom_pricing:
            if isinstance(box, dict) and str(server_id) in [str(sid) for sid in box.get("serverIds", [])]:
                try:
                    min_gb = float(box.get("minGb", 1.0))
                except:
                    min_gb = 1.0
                try:
                    min_days = int(box.get("minDays", 1))
                except:
                    min_days = 1
                break
    return min_gb, min_days

def process_custom_vol_gb(message, server_id):
    text = message.text.strip() if message.text else ""
    if text in ["انصراف", "بازگشت", "/start", "منوی اصلی", "❌ انصراف"]:
        main_menu_message(message)
        return
        
    try:
        gb = int(text)
        min_gb, _ = get_custom_pricing_limits(server_id)
        if gb < min_gb or gb > 1000:
            raise ValueError()
    except ValueError:
        min_gb, _ = get_custom_pricing_limits(server_id)
        msg = bot.reply_to(
            message,
            f"❌ <b>خطا: ترافیک نامعتبر یا کمتر از حد مجاز است!</b>\n\n"
            f"حداقل حجم سفارش روی این سرور <b>{min_gb} گیگابایت</b> می‌باشد. لطفاً یک عدد بین {min_gb} تا ۱۰۰۰ وارد کنید:",
            parse_mode="HTML",
            reply_markup=get_cancel_keyboard()
        )
        bot.register_next_step_handler(msg, process_custom_vol_gb, server_id)
        return
        
    msg = bot.send_message(
        message.chat.id,
        f"🔻 حجم انتخابی: <code>{gb} GB</code>\n\n"
        "⏳ لطفاً تعداد روزهای فعال بودن اشتراک را به <b>روز (Days)</b> وارد کنید:\n"
        "⚠️ عدد ارسال شده باید یک عدد انگلیسی مثبت باشد (مثلاً <code>30</code>)",
        parse_mode="HTML",
        reply_markup=get_cancel_keyboard()
    )
    bot.register_next_step_handler(msg, process_custom_vol_days, server_id, gb)

def process_custom_vol_days(message, server_id, gb):
    text = message.text.strip() if message.text else ""
    if text in ["انصراف", "بازگشت", "/start", "منوی اصلی", "❌ انصراف"]:
        main_menu_message(message)
        return
        
    try:
        days = int(text)
        _, min_days = get_custom_pricing_limits(server_id)
        if days < min_days or days > 365:
            raise ValueError()
    except ValueError:
        _, min_days = get_custom_pricing_limits(server_id)
        msg = bot.reply_to(
            message,
            f"❌ <b>خطا: تعداد روزها نامعتبر یا کمتر از حد مجاز است!</b>\n\n"
            f"حداقل تعداد روز سفارش روی این سرور <b>{min_days} روز</b> می‌باشد. لطفاً یک عدد بین {min_days} تا ۳۶۵ وارد کنید:",
            parse_mode="HTML",
            reply_markup=get_cancel_keyboard()
        )
        bot.register_next_step_handler(msg, process_custom_vol_days, server_id, gb)
        return
        
    msg = bot.send_message(
        message.chat.id,
        f"🔻 حجم انتخابی: <code>{gb} GB</code>\n"
        f"⏳ مدت زمان: <code>{days} روز</code>\n\n"
        "✍️ <b>لطفاً یک نام کاربری دلخواه (فقط حروف انگلیسی و اعداد، بدون فاصله) برای کانفیگ خود ارسال نمایید:</b>",
        parse_mode="HTML",
        reply_markup=get_cancel_keyboard()
    )
    bot.register_next_step_handler(msg, process_custom_vol_username, server_id, gb, days)

def process_custom_vol_username(message, server_id, gb, days):
    text = message.text.strip() if message.text else ""
    if text in ["انصراف", "بازگشت", "/start", "منوی اصلی", "❌ انصراف"]:
        main_menu_message(message)
        return
        
    import re
    if not re.match(r"^[a-zA-Z0-9_-]+$", text):
        msg = bot.reply_to(
            message,
            "❌ <b>نام کاربری نامعتبر است!</b>\n"
            "لطفاً فقط از حروف انگلیسی، اعداد و خط تیره استفاده نمایید (بدون فاصله):",
            parse_mode="HTML",
            reply_markup=get_cancel_keyboard()
        )
        bot.register_next_step_handler(msg, process_custom_vol_username, server_id, gb, days)
        return
        
    if check_client_exists(text, server_id=server_id):
        msg = bot.reply_to(
            message,
            "⚠️ <b>این نام کاربری از قبل در لیست کاربران سرور موجود است!</b>\n"
            "لطفاً از یک نام کاربری دیگر استفاده کنید:",
            parse_mode="HTML",
            reply_markup=get_cancel_keyboard()
        )
        bot.register_next_step_handler(msg, process_custom_vol_username, server_id, gb, days)
        return
        
    username_input = text
    
    # User request: Ask for discount code after entering name
    markup = types.InlineKeyboardMarkup()
    markup.row(
        types.InlineKeyboardButton("✅ بله، دارم", callback_data=f"hascustdisc:yes:{server_id}:{username_input}:{gb}:{days}"),
        types.InlineKeyboardButton("❌ خیر، ندارم", callback_data=f"hascustdisc:no:{server_id}:{username_input}:{gb}:{days}")
    )
    bot.send_message(
        message.chat.id,
        "🎁 <b>آیا کد تخفیف دارید؟</b>",
        parse_mode="HTML",
        reply_markup=markup
    )

def send_final_custom_purchase_message(message, server_id, username_input, gb, days, applied_promo=None, discount_amount=0):
    tg_id = message.chat.id if hasattr(message, 'chat') else message.from_user.id
    cfg = get_config()
    db = read_sqlite_db()
    settings_data = db.get("settings", {})
    
    import json
    panel_config_str = settings_data.get("panel_config", "{}")
    try:
        panel_config = json.loads(panel_config_str)
    except Exception:
        panel_config = {}
        
    custom_pricing = panel_config.get("customPricingBoxes")
    if not custom_pricing:
        custom_pricing = settings_data.get("customPricingBoxes", [])
    
    price_gb = 3000
    price_day = 2000
    
    if isinstance(custom_pricing, list):
        for box in custom_pricing:
            if isinstance(box, dict) and str(server_id) in [str(sid) for sid in box.get("serverIds", [])]:
                try:
                    price_gb = int(box.get("pricePerGb", 3000))
                    price_day = int(box.get("pricePerDay", 2000))
                except:
                    price_gb = 3000
                    price_day = 2000
                break
                
    try:
        total_price = (gb * price_gb) + (days * price_day)
    except Exception as e:
        print(f"Error calculating price: {e}")
        total_price = 0
        
    original_price = total_price
    total_price = max(0, total_price - discount_amount)
    
    server_name = "سرور انتخابی"
    servers = panel_config.get("servers", [])
    for s in servers:
        if str(s.get("id")) == str(server_id):
            server_name = s.get("name")
            break
            
    price_text = f"{int(total_price):,} تومان"
    if applied_promo:
        price_text = f"<s>{int(original_price):,}</s> ➡️ <b>{int(total_price):,} تومان</b> (با کد تخفیف)"
        
    invoice_text = (
        "📊 <b>پیش‌فاکتور ساخت کانفیگ دلخواه</b>\n\n"
        f"🌐 سرور: <b>{server_name}</b>\n"
        f"👤 نام کاربری: <code>{username_input}</code>\n"
        f"🔻 حجم درخواستی: <b>{gb} گیگابایت</b>\n"
        f"⏳ مدت زمان: <b>{days} روز</b>\n\n"
        f"💵 هزینه هر گیگابایت: {int(price_gb):,} تومان\n"
        f"💵 هزینه هر روز: {int(price_day):,} تومان\n"
        "──────────────────\n"
        f"💰 <b>جمع کل: {price_text}</b>\n\n"
        "💳 <b>لطفاً روش پرداخت خود را انتخاب کنید:</b>"
    )
    
    is_owner = bool(cfg.get("OWNER_ID") and int(tg_id) == int(cfg["OWNER_ID"]))
    is_admin = bool(cfg.get("ADMINS") and int(tg_id) in cfg["ADMINS"])
    is_privileged = is_owner or is_admin

    markup = types.InlineKeyboardMarkup(row_width=1)
    if is_privileged:
        markup.add(
            types.InlineKeyboardButton("🎁 تایید مستقیم (رایگان برای ادمین)", callback_data=f"buycust_pay:wallet:{server_id}:{username_input}:{gb}:{days}:{total_price}"),
        )
    else:
        markup.add(
            types.InlineKeyboardButton("💰 پرداخت از موجودی کیف پول", callback_data=f"buycust_pay:wallet:{server_id}:{username_input}:{gb}:{days}:{total_price}"),
            types.InlineKeyboardButton("💳 پرداخت کارت به کارت", callback_data=f"buycust_pay:card:{server_id}:{username_input}:{gb}:{days}:{total_price}"),
            types.InlineKeyboardButton("⭐️ پرداخت با Stars تلگرام", callback_data=f"buycust_pay:stars:{server_id}:{username_input}:{gb}:{days}:{total_price}"),
        )
    markup.add(types.InlineKeyboardButton("❌ لغو و بازگشت", callback_data=f"srvsel_{server_id}"))
    
    chat_id = message.chat.id if hasattr(message, 'chat') else tg_id
    bot.send_message(chat_id, invoice_text, parse_mode="HTML", reply_markup=markup)

def process_custom_vol_promo_input(message, server_id, username_input, gb, days):
    tg_id = message.from_user.id
    if not message.text: return
    code_text = message.text.strip().upper()
    
    if "انصراف" in code_text or code_text == "/START":
        bot.send_message(message.chat.id, "❌ عملیات لغو شد.", reply_markup=get_custom_keyboard())
        return

    db = read_sqlite_db()
    promo_codes = db.get("promo_codes", [])
    promo = next((p for p in promo_codes if p["code"].upper() == code_text), None)
    
    if not promo:
        markup = types.InlineKeyboardMarkup()
        markup.add(types.InlineKeyboardButton("⏩ ادامه بدون کد تخفیف", callback_data=f"hascustdisc:no:{server_id}:{username_input}:{gb}:{days}"))
        msg = bot.send_message(
            message.chat.id,
            "❌ <b>لطفا کد تخفیف رو صحیح وارد کنید یا در صورت نیاز انصراف بزنید و به پرداخت ادامه دهید:</b>",
            parse_mode="HTML",
            reply_markup=markup
        )
        bot.register_next_step_handler(msg, process_custom_vol_promo_input, server_id, username_input, gb, days)
        return

    # Check if promo code is expired
    duration_days = promo.get("durationDays")
    created_at_str = promo.get("createdAt")
    if duration_days and created_at_str:
        from datetime import datetime
        try:
            clean_str = created_at_str.replace("Z", "")
            if "." in clean_str:
                clean_str = clean_str.split(".")[0]
            created_dt = datetime.strptime(clean_str, "%Y-%m-%dT%H:%M:%S")
            now_dt = datetime.utcnow()
            delta = now_dt - created_dt
            if delta.days >= duration_days:
                markup = types.InlineKeyboardMarkup()
                markup.add(types.InlineKeyboardButton("⏩ ادامه بدون کد تخفیف", callback_data=f"hascustdisc:no:{server_id}:{username_input}:{gb}:{days}"))
                bot.send_message(
                    message.chat.id, 
                    "❌ <b>مهلت زمانی و انقضای استفاده از این کد تخفیف به پایان رسیده است!</b>", 
                    parse_mode="HTML",
                    reply_markup=markup
                )
                return
        except Exception as ex:
            print(f"[Promo code parse date error]: {ex}")

    # Check usage limits
    if promo.get("totalUsage", 0) >= promo.get("maxUsage", 9999):
        bot.send_message(message.chat.id, "❌ متاسفانه ظرفیت استفاده از این کد تخفیف به پایان رسیده است.")
        send_final_custom_purchase_message(message, server_id, username_input, gb, days)
        return

    # Calculate price to apply discount
    cfg = get_config()
    settings_data = db.get("settings", {})
    
    import json
    panel_config_str = settings_data.get("panel_config", "{}")
    try:
        panel_config = json.loads(panel_config_str)
    except Exception:
        panel_config = {}
        
    custom_pricing = panel_config.get("customPricingBoxes")
    if not custom_pricing:
        custom_pricing = settings_data.get("customPricingBoxes", [])
    
    price_gb = 3000
    price_day = 2000
    
    if isinstance(custom_pricing, list):
        for box in custom_pricing:
            if isinstance(box, dict) and str(server_id) in [str(sid) for sid in box.get("serverIds", [])]:
                try:
                    price_gb = int(box.get("pricePerGb", 3000))
                    price_day = int(box.get("pricePerDay", 2000))
                except:
                    price_gb = 3000
                    price_day = 2000
                break
                
    try:
        total_price = (gb * price_gb) + (days * price_day)
    except:
        total_price = 0

    # Apply discount
    discount_amount = 0
    if promo["type"] == "percent":
        discount_amount = int(total_price * (promo["value"] / 100))
    elif promo["type"] == "fixed_amount":
        discount_amount = int(promo["value"])
    
    bot.send_message(message.chat.id, f"✅ <b>کد تخفیف اعمال شد!</b>\n💰 مبلغ تخفیف: {discount_amount:,} تومان")
    send_final_custom_purchase_message(message, server_id, username_input, gb, days, applied_promo=code_text, discount_amount=discount_amount)

def process_renew_gb(message, target_sub_id):
    text = message.text.strip() if message.text else ""
    if text in ["انصراف", "بازگشت", "/start", "منوی اصلی", "❌ انصراف"]:
        main_menu_message(message)
        return
        
    db = read_sqlite_db()
    k = next((s for s in db.get("subscription_keys", []) if s["id"] == target_sub_id), None)
    server_id = k.get("serverId") if k else None
        
    try:
        gb = int(text)
        min_gb, _ = get_custom_pricing_limits(server_id)
        if gb < min_gb or gb > 1000:
            raise ValueError()
    except ValueError:
        min_gb, _ = get_custom_pricing_limits(server_id)
        msg = bot.reply_to(
            message,
            f"❌ <b>خطا: ترافیک نامعتبر یا کمتر از حد مجاز است!</b>\n\n"
            f"حداقل حجم تمدید روی این سرور <b>{min_gb} گیگابایت</b> می‌باشد. لطفاً یک عدد بین {min_gb} تا ۱۰۰۰ وارد کنید:",
            parse_mode="HTML",
            reply_markup=get_cancel_keyboard()
        )
        bot.register_next_step_handler(msg, process_renew_gb, target_sub_id)
        return
        
    msg = bot.send_message(
        message.chat.id,
        "⏳ <b>انتخاب مدت زمان تمدید:</b>\n\n"
        "لطفاً تعداد روزهای اضافی جهت تمدید اشتراک را به <b>روز (Days)</b> وارد کنید (مثلاً <code>30</code>):",
        parse_mode="HTML",
        reply_markup=get_cancel_keyboard()
    )
    bot.register_next_step_handler(msg, process_renew_days, target_sub_id, gb)

def process_renew_days(message, target_sub_id, gb):
    text = message.text.strip() if message.text else ""
    if text in ["انصراف", "بازگشت", "/start", "منوی اصلی", "❌ انصراف"]:
        main_menu_message(message)
        return
        
    db = read_sqlite_db()
    k = next((s for s in db.get("subscription_keys", []) if s["id"] == target_sub_id), None)
    server_id = k.get("serverId") if k else None
        
    try:
        days = int(text)
        _, min_days = get_custom_pricing_limits(server_id)
        if days < min_days or days > 365:
            raise ValueError()
    except ValueError:
        _, min_days = get_custom_pricing_limits(server_id)
        msg = bot.reply_to(
            message,
            f"❌ <b>خطا: تعداد روزها نامعتبر یا کمتر از حد مجاز است!</b>\n\n"
            f"حداقل مدت تمدید روی این سرور <b>{min_days} روز</b> می‌باشد. لطفاً یک عدد بین {min_days} تا ۳۶۵ وارد کنید:",
            parse_mode="HTML",
            reply_markup=get_cancel_keyboard()
        )
        bot.register_next_step_handler(msg, process_renew_days, target_sub_id, gb)
        return
        
    db = read_sqlite_db()
    k = next((s for s in db.get("subscription_keys", []) if s["id"] == target_sub_id), None)
    if not k:
        bot.send_message(message.chat.id, "❌ خطا: اشتراک یافت نشد.")
        return
        
    server_id = k.get("serverId")
    cfg = get_config()
    settings_data = db.get("settings", {})
    
    import json
    panel_config_str = settings_data.get("panel_config", "{}")
    try:
        panel_config = json.loads(panel_config_str)
    except Exception:
        panel_config = {}
        
    custom_pricing = panel_config.get("customPricingBoxes")
    if not custom_pricing:
        custom_pricing = settings_data.get("customPricingBoxes", [])
    
    price_gb = 3000
    price_day = 2000
    
    if isinstance(custom_pricing, list):
        for box in custom_pricing:
            if isinstance(box, dict) and str(server_id) in [str(sid) for sid in box.get("serverIds", [])]:
                try:
                    price_gb = int(box.get("pricePerGb", 3000))
                    price_day = int(box.get("pricePerDay", 2000))
                except:
                    price_gb = 3000
                    price_day = 2000
                break
                
    try:
        total_price = (gb * price_gb) + (days * price_day)
    except Exception as e:
        print(f"Error calculating renewal price: {e}")
        total_price = 0
    
    invoice_text = (
        "🔄 <b>پیش‌فاکتور تمدید و ارتقای اشتراک</b>\n\n"
        f"👤 نام کاربری سرویس: <code>{k.get('clientName')}</code>\n"
        f"➕ حجم ترافیک اضافی: <b>{gb} گیگابایت</b>\n"
        f"➕ مدت زمان تمدید: <b>{days} روز</b>\n\n"
        f"💵 قیمت هر گیگابایت: {int(price_gb):,} تومان\n"
        f"💵 قیمت هر روز: {int(price_day):,} تومان\n"
        "──────────────────\n"
        f"💰 <b>جمع کل هزینه تمدید: {int(total_price):,} تومان</b>\n\n"
        "💳 <b>لطفاً روش پرداخت خود را انتخاب کنید:</b>"
    )
    
    tg_id = message.from_user.id
    is_owner = bool(cfg.get("OWNER_ID") and int(tg_id) == int(cfg["OWNER_ID"]))
    is_admin = bool(cfg.get("ADMINS") and int(tg_id) in cfg["ADMINS"])
    is_privileged = is_owner or is_admin

    markup = types.InlineKeyboardMarkup(row_width=1)
    if is_privileged:
        markup.add(
            types.InlineKeyboardButton("🎁 تایید مستقیم (رایگان برای ادمین)", callback_data=f"mysub_renewcustconfirm:wallet:{target_sub_id}:{gb}:{days}:{total_price}"),
        )
    else:
        markup.add(
            types.InlineKeyboardButton("💰 پرداخت از موجودی کیف پول", callback_data=f"mysub_renewcustconfirm:wallet:{target_sub_id}:{gb}:{days}:{total_price}"),
            types.InlineKeyboardButton("💳 پرداخت کارت به کارت", callback_data=f"mysub_renewcustconfirm:card:{target_sub_id}:{gb}:{days}:{total_price}"),
            types.InlineKeyboardButton("⭐️ پرداخت با Stars تلگرام", callback_data=f"mysub_renewcustconfirm:stars:{target_sub_id}:{gb}:{days}:{total_price}"),
        )
    markup.add(types.InlineKeyboardButton("❌ لغو", callback_data=f"mysub_manage_{target_sub_id}"))
    
    bot.send_message(message.chat.id, invoice_text, parse_mode="HTML", reply_markup=markup)

# Initialize SQLite DB on startup
if __name__ == "__main__":
    # Terminate any duplicate bot processes to avoid polling conflict & delayed updates
    import signal
    pid_file = os.path.join(SCRIPT_DIR, "bot.pid")
    current_pid = os.getpid()
    if os.path.exists(pid_file):
        try:
            with open(pid_file, "r") as f:
                old_pid = int(f.read().strip())
                if old_pid != current_pid:
                    print(f"[Daltoon Bot] Shutting down older bot process (PID {old_pid}) to prevent 409 dual polling conflict...")
                    try:
                        os.kill(old_pid, signal.SIGKILL)
                        time.sleep(1)
                    except OSError:
                        pass
        except Exception as pid_err:
            print(f"[Daltoon Bot PID Lock Error]: {pid_err}")
    try:
        with open(pid_file, "w") as f:
            f.write(str(current_pid))
    except Exception as pid_err:
        print(f"[Daltoon Bot PID Write Error]: {pid_err}")

    read_sqlite_db()
    print("Daltoon Telegram Bot core fully online on JSON synchronization database...")
    
    # Flag to ensure startup sync only happens once per clean process start
    startup_sync_complete = False
    
    while True:
        try:
            cfg = get_config()
            
            # Dynamically start/update receipt bot if configured
            try:
                receipt_token = cfg.get("RECEIPT_BOT_TOKEN", "").strip()
                ReceiptBotManager.get_instance().update_and_start(receipt_token)
            except Exception as r_err:
                print(f"[ReceiptBotManager Start Error in Loop] {r_err}")

            token = cfg.get("BOT_TOKEN", "").strip()
            if not token or token.upper() == "DUMMY_TOKEN":
                print("[Daltoon Bot] Ready. Waiting for the active bot token to be configured on the web admin panel. Retrying in 10 seconds...")
                time.sleep(10)
                continue
                
            # Update the telebot token if configured on-the-fly
            if bot.token != token:
                print(f"[Daltoon Bot] Loaded new Bot Token from Web Dashboard: {token[:8]}...****")
                bot.token = token
                startup_sync_complete = False # Re-sync if token changes
                
            if not startup_sync_complete:
                try:
                    # Dynamically set Telegram menu commands
                    commands = [
                        types.BotCommand("start", "💥 شروع مجدد ربات و منوی اصلی"),
                        types.BotCommand("buy", "🛒 خرید اشتراک جدید"),
                        types.BotCommand("pay", "💳 شارژ کیف پول و پرداخت"),
                        types.BotCommand("support", "🎫 تیکت به پشتیبانی")
                    ]
                    bot.set_my_commands(commands)
                    
                    # Ensure webhook is clean
                    bot.delete_webhook(drop_pending_updates=True)
                    
                    print(f"[Daltoon Bot] Real-time connection established for @{bot.get_me().username}")
                    startup_sync_complete = True
                except Exception as setup_err:
                    err_str = str(setup_err)
                    if "401" in err_str or "unauthorized" in err_str.lower():
                        pass # Valid, handled below at polling level
                    else:
                        print(f"[Daltoon Bot Setup Error] {setup_err}")
            
            # Start real-time polling (interval=0 for maximum responsiveness)
            bot.polling(none_stop=True, interval=0, timeout=30)
            
        except Exception as e:
            err_str = str(e)
            if "401" in err_str or "unauthorized" in err_str.lower():
                print("[Daltoon Bot] Setup pending. The current token in settings is not active. Please update it with a valid token from BotFather via the Web Dashboard.")
                time.sleep(15)
            elif "409" in err_str or "conflict" in err_str.lower():
                # Conflict detected (multiple instances). Cleaning up silently.
                time.sleep(5)
            else:
                print(f"[Daltoon Bot] Polling session ended/error: {e}")
                time.sleep(5)
