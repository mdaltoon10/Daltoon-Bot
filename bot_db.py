# Shared database utilities extracted from bot.py
import os, json, time, sqlite3, threading
from datetime import datetime

# DB_SQLITE_FILE must be set before using these functions
DB_SQLITE_FILE = None
_db_lock = threading.Lock()

# High-performance in-memory cache for fast read access
_cached_db_data = None
_cached_db_time = 0.0
_DB_CACHE_TTL = 1.0  # 1 second TTL for instantaneous response times

def invalidate_db_cache():
    global _cached_db_data, _cached_db_time
    _cached_db_data = None
    _cached_db_time = 0.0

def set_db_path(path):
    global DB_SQLITE_FILE
    DB_SQLITE_FILE = path
    invalidate_db_cache()

def get_sqlite_conn():
    if not DB_SQLITE_FILE:
        raise RuntimeError("DB_SQLITE_FILE not set. Call set_db_path() first.")
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

def read_sqlite_db(force_refresh=False):
    """Read core database structure from shared SQLite database with high-performance caching"""
    global _cached_db_data, _cached_db_time
    now = time.time()
    
    if not force_refresh and _cached_db_data is not None and (now - _cached_db_time) < _DB_CACHE_TTL:
        return _cached_db_data
        
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
        "verified_users": [],
        "pending_purchases": {},
        "pending_charges": {},
        "user_pending_configs": {},
        "settings": {"panel_config": "{}"},
        "isNewInstall": False,
        "logs": []
    }
    
    with _db_lock:
        if not force_refresh and _cached_db_data is not None and (time.time() - _cached_db_time) < _DB_CACHE_TTL:
            return _cached_db_data
            
        try:
            conn = get_sqlite_conn()
            cursor = conn.cursor()
            cursor.execute("SELECT key, value FROM kv")
            rows = cursor.fetchall()
            conn.close()
            
            if not rows:
                _cached_db_data = default_db
                _cached_db_time = time.time()
                return default_db
                
            data = {}
            for row in rows:
                try:
                    data[row[0]] = json.loads(row[1])
                except Exception as pe:
                    print(f"[SQLite Parse Error] for key {row[0]}: {pe}")
                    
            for key, val in default_db.items():
                if key not in data:
                    data[key] = val

            # Deduplicate subscription_keys
            sub_keys = data.get("subscription_keys", [])
            if sub_keys and isinstance(sub_keys, list):
                seen_ids = set()
                db_changed = False
                import random as _random
                for k in sub_keys:
                    if not isinstance(k, dict):
                        continue
                    k_id = str(k.get("id", "")).strip()
                    if not k_id or k_id in seen_ids:
                        new_id = f"SUB-{int(time.time() * 1000)}-{_random.randint(10000, 99999)}"
                        k["id"] = new_id
                        seen_ids.add(new_id)
                        db_changed = True
                    else:
                        seen_ids.add(k_id)
                if db_changed:
                    conn = get_sqlite_conn()
                    cursor = conn.cursor()
                    cursor.execute("BEGIN TRANSACTION;")
                    for key, val in data.items():
                        cursor.execute("INSERT OR REPLACE INTO kv (key, value) VALUES (?, ?)", (key, json.dumps(val, ensure_ascii=False)))
                    conn.commit()
                    conn.close()

            # Calculate referral counts
            users_list = data.get("users", [])
            if isinstance(users_list, list):
                ref_counts = {}
                for u in users_list:
                    if isinstance(u, dict):
                        r_by = u.get("referredBy")
                        if r_by is not None:
                            str_r = str(r_by).strip()
                            if str_r and str_r not in ["", "undefined", "null", "None"]:
                                ref_counts[str_r] = ref_counts.get(str_r, 0) + 1
                for u in users_list:
                    if isinstance(u, dict):
                        uid = u.get("userId") or u.get("user_id") or u.get("telegram_id") or u.get("id")
                        if uid is not None:
                            u["referralCount"] = ref_counts.get(str(uid).strip(), 0)
                        bals = [u.get("walletBalance"), u.get("wallet_balance"), u.get("balance"), u.get("credit")]
                        valid_bals = [float(b) for b in bals if b is not None and str(b).strip() != "" and str(b).replace('.', '', 1).replace('-', '', 1).isdigit()]
                        best_bal = max(valid_bals) if valid_bals else 0.0
                        u["walletBalance"] = best_bal
                        u["wallet_balance"] = best_bal
                        u["balance"] = best_bal
                        u["credit"] = best_bal

            _cached_db_data = data
            _cached_db_time = time.time()
            return data
        except Exception as e:
            print(f"[SQLite Database Read Error] {e}")
            return default_db

def write_sqlite_db(data):
    """Persist data to shared SQLite database with strict safeguards"""
    if not data:
        return False
        
    has_users = isinstance(data.get("users"), list) and len(data.get("users", [])) > 0
    has_transactions = isinstance(data.get("transactions"), list) and len(data.get("transactions", [])) > 0
    has_plans = isinstance(data.get("vpn_plans"), list) and len(data.get("vpn_plans", [])) > 0
    
    settings = data.get("settings", {})
    panel_cfg = settings.get("panel_config", "{}")
    if isinstance(panel_cfg, str):
        try:
            panel_cfg = json.loads(panel_cfg)
        except:
            panel_cfg = {}
    has_token = bool(panel_cfg.get("botToken") or settings.get("botToken") or settings.get("BOT_TOKEN"))
    
    with _db_lock:
        try:
            conn = get_sqlite_conn()
            cursor = conn.cursor()
            cursor.execute("SELECT COUNT(*) FROM kv")
            count = cursor.fetchone()[0]
            
            if count > 0:
                if not has_users and not has_transactions and not has_plans and not has_token:
                    print("[SQLite Database Write CRITICAL] Refusing to overwrite populated database with empty/reset data structure.")
                    conn.close()
                    return False
                    
            cursor.execute("BEGIN TRANSACTION;")
            for key, val in data.items():
                cursor.execute("INSERT OR REPLACE INTO kv (key, value) VALUES (?, ?)", (key, json.dumps(val, ensure_ascii=False)))
            conn.commit()
            conn.close()
            invalidate_db_cache()
            return True
        except Exception as e:
            print(f"[SQLite Database Write Error] {e}")
            try:
                conn.rollback()
                conn.close()
            except:
                pass
            return False

def is_client_matching_colleague(c_name, acc):
    if not c_name or not acc:
        return False
    val = str(c_name).strip().lower()
    prefix = str(acc.get("prefix", "")).strip().lower()
    username = str(acc.get("username", "")).strip().lower()
    if prefix and len(prefix) > 0:
        if val == prefix or val.startswith(prefix) or f"{prefix}-" in val or f"{prefix}_" in val or f"{prefix}." in val or prefix in val:
            return True
    if username and len(username) > 0:
        if val == username or val.startswith(username) or f"{username}-" in val or f"{username}_" in val or f"{username}." in val or username in val:
            return True
    return False

def is_sub_active(k):
    if not k or not isinstance(k, dict):
        return False
    st = str(k.get("status", "active")).lower().strip()
    if st in ("disabled", "suspended", "expired", "inactive"):
        return False
    limit_gb = float(k.get("trafficLimitGb", 0) or 0)
    used_gb = float(k.get("trafficUsedGb", 0) or 0)
    if limit_gb > 0 and used_gb >= limit_gb:
        return False
    exp_ts = float(k.get("expireTimestamp", 0) or 0)
    if exp_ts > 0 and time.time() > exp_ts:
        return False
    exp_date = str(k.get("expireDate", "")).strip()
    if exp_date and exp_date != "نامشخص":
        try:
            clean_date = exp_date.split("T")[0].split(" ")[0].strip()
            exp_dt = datetime.strptime(clean_date, "%Y-%m-%d")
            if time.time() > exp_dt.timestamp() + 86399:
                return False
        except Exception:
            pass
    return True

def get_sub_status_emoji(k):
    return "🟢" if is_sub_active(k) else "🔴"

def is_colleague_key(k, acc):
    if not k or not acc:
        return False
    acc_id = str(acc.get("id", "")).strip()
    k_col_id = str(k.get("colleagueAccountId", "")).strip() if k.get("colleagueAccountId") is not None else ""
    if acc_id and k_col_id and acc_id == k_col_id:
        return True
    acc_user = str(acc.get("username", "")).strip().lower()
    k_col_user = str(k.get("colleagueUsername", "")).strip().lower() if k.get("colleagueUsername") else ""
    if acc_user and k_col_user and acc_user == k_col_user:
        return True
    acc_tg_id = str(acc.get("userId", "")).strip()
    k_tg_id = str(k.get("userId", "")).strip()
    if acc_tg_id and k_tg_id and acc_tg_id != "" and acc_tg_id == k_tg_id:
        return True
    for field in ["clientName", "planName", "email", "remark"]:
        val = k.get(field)
        if val and is_client_matching_colleague(val, acc):
            return True
    return False