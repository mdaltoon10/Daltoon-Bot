export const themeOptions = [
  { id: "default", name: "پیش‌فرض", icon: "✨", color: "text-purple-400" },
  { id: "ocean", name: "اقیانوس", icon: "🌊", color: "text-blue-400" },
  { id: "forest", name: "جنگل", icon: "🌲", color: "text-emerald-400" },
  { id: "sunset", name: "غروب", icon: "🌅", color: "text-orange-400" },
  { id: "cyberpunk", name: "نئون", icon: "🚀", color: "text-pink-400" }
];

export function getThemeStyles(dashboardTheme: string) {
  let styles = '';
  const mapColors = (primary: string, secondary: string) => {
    if (primary === 'purple' && secondary === 'indigo') return '';
    return `
    --color-purple-50: var(--color-${primary}-50);
    --color-purple-100: var(--color-${primary}-100);
    --color-purple-200: var(--color-${primary}-200);
    --color-purple-300: var(--color-${primary}-300);
    --color-purple-400: var(--color-${primary}-400);
    --color-purple-500: var(--color-${primary}-500);
    --color-purple-600: var(--color-${primary}-600);
    --color-purple-700: var(--color-${primary}-700);
    --color-purple-800: var(--color-${primary}-800);
    --color-purple-900: var(--color-${primary}-900);
    --color-purple-950: var(--color-${primary}-950);
    
    --color-indigo-50: var(--color-${secondary}-50);
    --color-indigo-100: var(--color-${secondary}-100);
    --color-indigo-200: var(--color-${secondary}-200);
    --color-indigo-300: var(--color-${secondary}-300);
    --color-indigo-400: var(--color-${secondary}-400);
    --color-indigo-500: var(--color-${secondary}-500);
    --color-indigo-600: var(--color-${secondary}-600);
    --color-indigo-700: var(--color-${secondary}-700);
    --color-indigo-800: var(--color-${secondary}-800);
    --color-indigo-900: var(--color-${secondary}-900);
    --color-indigo-950: var(--color-${secondary}-950);
  `;
  };

  let bgDark = '#030305';
  let bgLight = '#f8fafc';
  let panelDark = '#0f1424';
  let panelDark2 = '#1c1c1e';

  switch (dashboardTheme) {
    case 'ocean':
      styles += `:root { ${mapColors('sky', 'cyan')} }`;
      bgDark = '#041f33'; // Deep ocean blue
      bgLight = '#e0f2fe'; // sky-100
      panelDark = '#0c4a6e'; // sky-950
      panelDark2 = '#075985'; // sky-800
      break;
    case 'forest':
      styles += `:root { ${mapColors('emerald', 'teal')} }`;
      bgDark = '#022c22'; // emerald-950
      bgLight = '#d1fae5'; // emerald-100
      panelDark = '#064e3b'; // emerald-900
      panelDark2 = '#065f46'; // emerald-800
      break;
    case 'sunset':
      styles += `:root { ${mapColors('orange', 'rose')} }`;
      bgDark = '#431407'; // orange-950
      bgLight = '#ffedd5'; // orange-100
      panelDark = '#7c2d12'; // orange-900
      panelDark2 = '#9a3412'; // orange-800
      break;
    case 'cyberpunk':
      styles += `:root { ${mapColors('pink', 'fuchsia')} }`;
      bgDark = '#3b0764'; // purple-950
      bgLight = '#fae8ff'; // fuchsia-100
      panelDark = '#4a044e'; // fuchsia-950
      panelDark2 = '#701a75'; // fuchsia-900
      break;
    default:
      styles += `:root { ${mapColors('purple', 'indigo')} }`;
      bgDark = '#030305';
      bgLight = '#f8fafc';
      panelDark = '#0f1424';
      panelDark2 = '#1c1c1e';
      break;
  }

  return `
    ${styles}
    
    /* Dark Mode Global Backgrounds */
    body:not(.light) {
      background-color: ${bgDark} !important;
    }
    body:not(.light) .min-h-screen.bg-\\[\\#030305\\],
    body:not(.light) .min-h-screen.bg-slate-950 {
      background-color: ${bgDark} !important;
    }
    body:not(.light) .bg-\\[\\#0f1424\\],
    body:not(.light) .bg-slate-900 {
      background-color: ${panelDark} !important;
    }
    body:not(.light) .bg-\\[\\#1c1c1e\\],
    body:not(.light) .bg-slate-800 {
      background-color: ${panelDark2} !important;
    }
    body:not(.light) header {
      background-color: ${panelDark} !important;
    }
    body:not(.light) .dashboard-title {
      background: none !important;
      background-image: none !important;
      color: #ffffff !important;
      -webkit-text-fill-color: #ffffff !important;
      text-shadow: 0 2px 4px rgba(0, 0, 0, 0.4) !important;
    }
    body.light .dashboard-title {
      background-image: linear-gradient(to right, #4338ca, #6d28d9) !important;
      color: transparent !important;
      -webkit-background-clip: text !important;
      background-clip: text !important;
      -webkit-text-fill-color: transparent !important;
      text-shadow: none !important;
    }
    body:not(.light) .sidebar-panel {
      background-color: ${panelDark}f2 !important;
      backdrop-filter: blur(24px) !important;
    }
    body.light .sidebar-panel {
      background-color: #ffffff !important;
      box-shadow: 0 10px 30px rgba(0, 0, 0, 0.08) !important;
    }
    
    /* Tint the glass panels slightly in dark mode */
    body:not(.light) .glass-panel {
      background: rgba(255,255,255,0.02) !important;
      backdrop-filter: blur(16px) !important;
    }
    body:not(.light) .glass-panel-hover:hover {
      background: rgba(255,255,255,0.05) !important;
    }
    body:not(.light) .bg-black\\/40,
    body:not(.light) .bg-black\\/30,
    body:not(.light) .bg-black\\/50,
    body:not(.light) .bg-black\\/60,
    body:not(.light) .bg-black\\/80,
    body:not(.light) .bg-slate-800\\/80 {
      background-color: rgba(0,0,0,0.2) !important;
      backdrop-filter: blur(12px) !important;
    }

    /* Light Mode Global Backgrounds */
    body.light {
      background-color: ${bgLight} !important;
    }
    body.light .min-h-screen.bg-\\[\\#030305\\],
    body.light .min-h-screen.bg-slate-950 {
      background-color: ${bgLight} !important;
    }
    body.light aside,
    body.light header,
    body.light .bg-\\[\\#0f1424\\] {
      background-color: #ffffff !important;
    }
  `;
}
