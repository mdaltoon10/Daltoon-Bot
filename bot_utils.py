# Utility functions extracted from bot.py
# normalize_xui_url, build_subscription_url, get_card_payment_info,
# extract_inbound_list, get_local_server_port, call_local_api

import re
import os
import json
import requests
from urllib.parse import urlparse

def normalize_xui_url(url):
    if not url:
        return ""
    cleaned = str(url).strip().strip("'\"\"").strip()
    for marker in ["/sub/", "/client/", "/share/"]:
        if marker in cleaned:
            cleaned = cleaned.split(marker)[0]
    
    if re.match(r'^https?://', cleaned, re.IGNORECASE):
        proto_match = re.match(r'^(https?://)', cleaned, re.IGNORECASE)
        proto = proto_match.group(1).lower()
        rest = re.sub(r'^[\s./]+', '', cleaned[len(proto):])
        cleaned = proto + rest
    else:
        cleaned = re.sub(r'^[\s./]+', '', cleaned)
        if re.search(r':(8443|2096|2083|2087|2053|443)($|/|\?)', cleaned) or re.search(r'ssl|https', cleaned, re.IGNORECASE):
            cleaned = "https://" + cleaned
        else:
            cleaned = "http://" + cleaned

    cleaned = re.sub(r'(https?://)/+', r'\1', cleaned, flags=re.IGNORECASE)
    cleaned = re.sub(r'([^:]/)/+', r'\1', cleaned)
    cleaned = re.sub(r'/+$', '', cleaned)
    cleaned = re.sub(r'/(dashboard|panel)$', '', cleaned, flags=re.IGNORECASE)
    cleaned = re.sub(r'/+$', '', cleaned)
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
    
    parsed = urlparse(cleaned_sub)
    path = parsed.path
    
    if not path or path == "/":
        domain_part = f"{parsed.scheme}://{parsed.netloc}"
        return f"{domain_part}/sub/{token}"
    else:
        if cleaned_sub.endswith("/"):
            return f"{cleaned_sub}{token}"
        else:
            return f"{cleaned_sub}/{token}"

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

def extract_inbound_list(rj):
    if not rj:
        return None
    if isinstance(rj, list):
        return rj
    if isinstance(rj, dict):
        keys = ["obj", "inbounds", "data", "result", "services", "groups", "list", "items", "body", "response", "value", "rows"]
        for key in keys:
            val = rj.get(key)
            if isinstance(val, list):
                return val
            if isinstance(val, dict):
                for k2 in keys:
                    v2 = val.get(k2)
                    if isinstance(v2, list):
                        return v2
        for k, v in rj.items():
            if isinstance(v, list) and len(v) > 0 and isinstance(v[0], dict):
                if any(x in v[0] for x in ["id", "remark", "port", "protocol", "name", "title", "tag"]):
                    return v
            elif isinstance(v, dict):
                for k2, v2 in v.items():
                    if isinstance(v2, list) and len(v2) > 0 and isinstance(v2[0], dict):
                        return v2
    return None

def get_local_server_port():
    if os.environ.get("PORT") and os.environ.get("PORT").isdigit():
        return int(os.environ["PORT"])
    return 3000

def call_local_api(endpoint_path, method="POST", json_payload=None, timeout=30):
    port = get_local_server_port()
    url = f"http://localhost:{port}{endpoint_path}"
    try:
        if method.upper() == "POST":
            resp = requests.post(url, json=json_payload, timeout=timeout)
        else:
            resp = requests.get(url, timeout=timeout)
        if resp.status_code == 200:
            try:
                return resp.json()
            except Exception:
                return {"success": False, "error": "Invalid JSON response"}
        return {"success": False, "error": f"HTTP {resp.status_code}"}
    except Exception as e:
        return {"success": False, "error": str(e)}