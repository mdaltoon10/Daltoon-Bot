import os

def fix_settings():
    path = 'src/components/SettingsPanel.tsx'
    if not os.path.exists(path):
        print(f"File not found: {path}")
        return
    with open(path, 'r') as f:
        lines = f.readlines()
    
    start_idx = -1
    end_idx = -1
    for i, line in enumerate(lines):
        if '{/* Dedicated AI Configuration Card */}' in line:
            start_idx = i
        if start_idx != -1 and '🔍 Test AI API Key Connection' in line:
            for j in range(i, len(lines)):
                if '</div>' in lines[j] and (j+1 >= len(lines) or 'bg-[#111827]' in lines[j+1]):
                    end_idx = j + 1
                    break
            break
    
    if start_idx != -1 and end_idx != -1:
        print(f"Removing AI settings card lines {start_idx} to {end_idx}")
        del lines[start_idx:end_idx]
        with open(path, 'w') as f:
            f.writelines(lines)
    else:
        print("AI settings card not found or end not detected")

def fix_buttons():
    path = 'src/components/BotButtonsPanel.tsx'
    if not os.path.exists(path):
        print(f"File not found: {path}")
        return
    with open(path, 'r') as f:
        lines = f.readlines()
    
    start_idx = -1
    end_idx = -1
    for i, line in enumerate(lines):
        if 'btnAi: {' in line:
            start_idx = i
            for j in range(i, len(lines)):
                if '},' in lines[j] and (j+1 >= len(lines) or 'btnColleagues' in lines[j+1] or '},' in lines[j+1]):
                    end_idx = j + 1
                    break
            break
    
    if start_idx != -1 and end_idx != -1:
        print(f"Removing AI button lines {start_idx} to {end_idx}")
        del lines[start_idx:end_idx]
        with open(path, 'w') as f:
            f.writelines(lines)
    else:
        print("AI button not found in BotButtonsPanel.tsx")

def fix_bot():
    path = 'bot.py'
    if not os.path.exists(path):
        print(f"File not found: {path}")
        return
    with open(path, 'r') as f:
        lines = f.readlines()
    
    new_lines = []
    skip = False
    for line in lines:
        if 'elif action == "mm_btnAi":' in line:
            skip = True
        
        if not skip:
            if 'elif key == "btnAi"' in line:
                continue
            if 'if "btnAi" not in order: order.append("btnAi")' in line:
                continue
            new_lines.append(line.replace(', "btnAi"', ''))
        
        if skip and ('elif action == "mm_btnBuyNew"' in line or 'elif action == "mm_btnBuy"' in line):
            skip = False
            new_lines.append(line)
    
    with open(path, 'w') as f:
        f.writelines(new_lines)
    print("Cleaned up bot.py")

if __name__ == "__main__":
    fix_settings()
    fix_buttons()
    fix_bot()
