import re

with open('bot.py', 'r', encoding='utf-8') as f:
    text = f.read()

pattern = r'def is_user_member_of_single_channel\(user_id, channel\):.*?(?=def is_user_member_of_channel)'

cache_code = '''_member_cache = {}
_member_cache_lock = threading.Lock()

def is_user_member_of_single_channel(user_id, channel):
    global _member_cache
    channel = channel.strip()
    if not channel:
        return True
        
    cache_key = f"{user_id}:{channel}"
    now = time.time()
    with _member_cache_lock:
        if cache_key in _member_cache:
            res, ts = _member_cache[cache_key]
            if now - ts < 120.0:  # Cache member checks for 2 minutes
                return res
        
    clean_channel = channel.strip()
    # Handle numeric telegram IDs (e.g. -100123456789)
    if clean_channel.startswith("-") and clean_channel[1:].replace("-", "").isdigit():
        pass
    # Bypass verification for private invite links where API checks are impossible
    elif "+" in clean_channel or "joinchat" in clean_channel:
        print(f"[Mandatory Join Check] Configured channel is a private invite link ({clean_channel}). API check unsupported. Auto-approving membership to prevent lockouts.")
        with _member_cache_lock:
            _member_cache[cache_key] = (True, now)
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
        is_member = member.status in ["creator", "administrator", "member", "restricted"]
        with _member_cache_lock:
            _member_cache[cache_key] = (is_member, now)
        return is_member
    except Exception as e:
        print(f"[Mandatory Join Check Error] Failed to verify membership for {user_id} in {clean_channel}: {e}")
        # Always fallback to True for any exception (API errors, bot is not admin, chat not found, network timeouts etc)
        # This guarantees that a misconfiguration or API error will not brick the bot / lock all users out.
        with _member_cache_lock:
            _member_cache[cache_key] = (True, now)
        return True
'''

new_text = re.sub(pattern, cache_code, text, flags=re.DOTALL)
with open('bot.py', 'w', encoding='utf-8') as f:
    f.write(new_text)

print('Updated is_user_member_of_single_channel successfully!')
