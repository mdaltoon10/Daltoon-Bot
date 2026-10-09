with open("bot.py", "r") as f:
    text = f.read()

import re
text = re.sub(r"_working_base_cache\s*=\s*\{.*?\}", "", text, flags=re.DOTALL)
text = re.sub(r"def get_resolved_base_url\(.*?\n\s+return base_url", "", text, flags=re.DOTALL)

# Also remove any lines starting with indented session = get_session if remaining
lines = text.splitlines()
cleaned_lines = []
skip = False
for line in lines:
    if "session = get_session(server_id=server_id, base_url=base_url)" in line:
        skip = True
    if skip:
        if "return base_url" in line:
            skip = False
        continue
    cleaned_lines.append(line)

text = "\n".join(cleaned_lines)

new_resolver = """
_working_base_cache = {}

def get_resolved_base_url(server_id=None, base_url=None):
    if not base_url and server_id:
        cfg = get_config()
        servers = cfg.get("SERVERS", []) + cfg.get("COLLEAGUE_SERVERS", [])
        server = next((s for s in servers if str(s.get("id")) == str(server_id)), None)
        if server:
            base_url = normalize_xui_url(server.get("panelUrl", ""))
    if not base_url:
        return ""
    if base_url.endswith("/"):
        base_url = base_url[:-1]
    
    cache_key = base_url
    if cache_key in _working_base_cache:
        return _working_base_cache[cache_key]

    login_xui(server_id=server_id)
    session = get_session(server_id=server_id)

    from urllib.parse import urlparse
    parsed = urlparse(base_url)
    origin = f"{parsed.scheme}://{parsed.netloc}"
    pathname = parsed.path.rstrip("/")
    segments = [s for s in pathname.split("/") if s]
    
    candidate_bases = []
    curr = origin
    candidate_bases.append(curr)
    for seg in segments:
        curr = f"{curr}/{seg}"
        candidate_bases.append(curr)
    
    if base_url not in candidate_bases:
        candidate_bases.append(base_url)

    endpoints = [
        "/panel/api/inbounds/list",
        "/xui/API/inbounds/list",
        "/xui/api/inbounds/list",
        "/panel/inbound/list",
        "/panel/api/inbound/list",
        "/api/inbounds/list",
        "/api/inbounds"
    ]

    for cb in reversed(candidate_bases):
        cb = cb.rstrip("/")
        if not cb:
            continue
        for ep in endpoints:
            test_url = f"{cb}{ep}"
            try:
                res = session.get(test_url, timeout=4, verify=False)
                if res.ok:
                    try:
                        rj = res.json()
                        if (isinstance(rj, dict) and rj.get("success") and isinstance(rj.get("obj"), list)) or isinstance(rj.get("inbounds"), list) or isinstance(rj.get("obj"), list):
                            _working_base_cache[cache_key] = cb
                            print(f"[API Resolver] Successfully resolved base_url {base_url} -> {cb} via {test_url}")
                            return cb
                    except Exception:
                        pass
            except Exception:
                pass

    _working_base_cache[cache_key] = base_url
    return base_url
"""

idx = text.find("import requests")
if idx == -1:
    idx = 0

text = text[:idx] + new_resolver + "\n\n" + text[idx:]

with open("bot.py", "w") as f:
    f.write(text)

print("Bot cleaned and compiled successfully!")
