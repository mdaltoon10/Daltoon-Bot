# Bot configuration loader extracted from bot.py
# Loads real-time configurations from Daltoon_Bot.db with env-var fallbacks
import os
import json
import time
import threading
from urllib.parse import urlparse

_cached_config = None
_cached_config_time = 0.0
_config_lock = threading.Lock()
_CONFIG_CACHE_TTL = 1.0  # 1-second TTL for instantaneous sub-millisecond retrieval

def invalidate_config_cache():
    global _cached_config, _cached_config_time
    _cached_config = None
    _cached_config_time = 0.0

def get_config(force_refresh=False):
    global _cached_config, _cached_config_time
    now = time.time()
    if not force_refresh and _cached_config is not None and (now - _cached_config_time) < _CONFIG_CACHE_TTL:
        return _cached_config

    with _config_lock:
        if not force_refresh and _cached_config is not None and (time.time() - _cached_config_time) < _CONFIG_CACHE_TTL:
            return _cached_config

        from bot_db import read_sqlite_db
        from bot_utils import normalize_xui_url

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
        config["HIDE_ADD_CONFIG"] = bool(panel_cfg.get("hideBtnAddConfig", False))
        config["HIDE_CONFIG_DETAILS"] = bool(panel_cfg.get("hideBtnConfigDetails", False))
        config["HIDE_SEARCH_CONFIG"] = bool(panel_cfg.get("hideBtnSearchConfig", False))
        config["USE_MINI_APP_MODE"] = bool(panel_cfg.get("useMiniAppMode", False))
        config["START_COMMAND_MODE"] = panel_cfg.get("startCommandMode", "miniapp" if panel_cfg.get("useMiniAppMode") else "buttons")
        config["BTN_MINI_APP"] = panel_cfg.get("btnTextMiniApp", "🚀 ورود به برنامه هوشمند")
        config["BTN_DASH_SIMPLE"] = panel_cfg.get("btnTextDashSimple", "📱 داشبورد ساده")
        config["BTN_DASH_PRO"] = panel_cfg.get("btnTextDashPro", panel_cfg.get("btnTextMiniApp", "🚀 داشبورد حرفه‌ای"))
        config["DASH_BUTTONS_LAYOUT"] = panel_cfg.get("dashButtonsLayout", "single")
        config["DASH_BUTTONS_ORDER"] = panel_cfg.get("dashButtonsOrder", "simple_first")
        config["HIDE_DASH_SIMPLE"] = bool(panel_cfg.get("hideBtnDashSimple", False))
        config["HIDE_DASH_PRO"] = bool(panel_cfg.get("hideBtnDashPro", False))
        config["MINI_APP_URL"] = panel_cfg.get("miniAppUrl", "")
        config["HIDE_MINI_APP"] = bool(panel_cfg.get("hideBtnMiniApp", False))
        if "hideBtnAiChat" in panel_cfg: 
            config["HIDE_AI_CHAT"] = bool(panel_cfg["hideBtnAiChat"])
        else:
            config["HIDE_AI_CHAT"] = False
        if "hideBtnTicketSupport" in panel_cfg: config["HIDE_TICKET_SUPPORT"] = bool(panel_cfg["hideBtnTicketSupport"])
        config["HIDE_AI"] = bool(panel_cfg.get("hideBtnAi", True))
        config["HIDE_WALLET"] = panel_cfg.get("hideBtnWallet", False)
        if "hideWallet" in panel_cfg and "hideBtnWallet" not in panel_cfg:
            config["HIDE_WALLET"] = bool(panel_cfg["hideWallet"])

        config["BUTTONS_ORDER"] = panel_cfg.get("mainButtonsOrder", [])
        config["SINGLE_BUTTONS"] = panel_cfg.get("singleButtons", [])

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
        
        config["QR_TEMPLATE"] = panel_cfg.get("qrTemplate", "")
        config["QR_COLOR"] = panel_cfg.get("qrColor", "")
        config["QR_LOGO"] = panel_cfg.get("qrLogo", "")
        
        if "mandatoryJoinActive" in panel_cfg:
            config["MANDATORY_JOIN_ACTIVE"] = bool(panel_cfg["mandatoryJoinActive"])
        if "mandatoryJoinChannel" in panel_cfg:
            config["MANDATORY_JOIN_CHANNEL"] = panel_cfg["mandatoryJoinChannel"]
        if "mandatoryJoinChannels" in panel_cfg:
            config["MANDATORY_JOIN_CHANNELS"] = panel_cfg["mandatoryJoinChannels"]
        if "mandatoryJoinText" in panel_cfg:
            config["MANDATORY_JOIN_TEXT"] = panel_cfg["mandatoryJoinText"]

        if "pinnedMessageActive" in panel_cfg:
            config["PINNED_MESSAGE_ACTIVE"] = bool(panel_cfg["pinnedMessageActive"])
        if "pinnedMessageText" in panel_cfg:
            config["PINNED_MESSAGE_TEXT"] = panel_cfg["pinnedMessageText"]

        if "captchaActive" in panel_cfg:
            config["CAPTCHA_ACTIVE"] = bool(panel_cfg["captchaActive"])
        elif "referralCaptchaActive" in panel_cfg:
            config["CAPTCHA_ACTIVE"] = bool(panel_cfg["referralCaptchaActive"])
        elif "captchaEnabled" in panel_cfg:
            config["CAPTCHA_ACTIVE"] = bool(panel_cfg["captchaEnabled"])
        else:
            config["CAPTCHA_ACTIVE"] = True
        config["CAPTCHA_FOR_REFERRAL"] = bool(panel_cfg.get("captchaForReferral", True))

        for key in ["guideVideoHapp", "guideVideoIos", "guideVideoAndroid", "guideVideoV2rayn", "guideVideoKaring", "guideVideoMac", "guideVideoLinux", "guideVideoUpdate", "guideVideoCrypto"]:
            if key in panel_cfg:
                config[key] = panel_cfg[key]
        
        _cached_config = config
        _cached_config_time = time.time()
    except Exception as e:
        print(f"[get_config error] {e}")

    return config