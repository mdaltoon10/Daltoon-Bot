const fs = require('fs');
let code = fs.readFileSync('src/components/DashboardOverview.tsx', 'utf8');

const oldCard = `      {/* Daltoon Bot Card - Standalone Horizontal on Desktop */}
      <div className="bg-[#111827] border border-[#1f2937] p-5 rounded-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-lg bg-indigo-500/10 text-indigo-400">
            <Zap className="w-5 h-5" />
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="font-bold text-gray-200">Daltoon Bot</h3>
              <div className="flex items-center gap-1.5">
                <span className="px-2 py-0.5 text-[10px] font-bold text-emerald-400 rounded-md bg-emerald-500/10 border border-emerald-500/20">
                  v{appVersion}
                </span>
                {updateAvailable && (
                  <span className="px-2 py-0.5 text-[10px] font-bold text-amber-400 rounded-md bg-amber-500/10 border border-amber-500/20 animate-pulse whitespace-nowrap">
                    {dt.newUpdate}
                  </span>
                )}
              </div>
            </div>
            <p className="text-xs text-gray-400 mt-1">
              {dt.manageBot}
            </p>
          </div>
        </div>

        <div className="flex gap-3 w-full md:w-auto">
          <button 
            onClick={onOpenUpdatePanel}
            className={\`flex-1 md:flex-initial flex items-center justify-center gap-2 px-6 py-2.5 rounded-lg transition-all text-xs font-bold border \${
              updateAvailable 
                ? "bg-purple-500/10 hover:bg-purple-500/20 text-purple-400 border-purple-500/30 animate-pulse" 
                : "bg-white/5 hover:bg-white/10 text-gray-400 border-white/5"
            }\`}
          >
            <Cloud className="w-3.5 h-3.5" />
            {dt.update}
          </button>
          <a 
            href="https://t.me/mDaltoon" 
            target="_blank" 
            rel="noopener noreferrer"
            className="flex-1 md:flex-initial flex items-center justify-center gap-2 px-6 py-2.5 rounded-lg bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition-all text-xs font-medium border border-white/5"
          >
            <Send className="w-3.5 h-3.5 text-sky-400" />
            Telegram
          </a>
        </div>
      </div>`;

const newCard = `      {/* Daltoon Bot Card - Standalone Horizontal on Desktop */}
      <div className="bg-[#111827] border border-[#1f2937] p-5 rounded-xl flex flex-col gap-4">
        {/* Top Header - Info & Server Controls */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-lg bg-indigo-500/10 text-indigo-400 relative">
              <Zap className="w-5 h-5" />
              <div className={\`absolute -top-1 -right-1 w-3 h-3 rounded-full border-2 border-[#111827] \${isBotRunning ? 'bg-emerald-500' : 'bg-red-500'}\`} />
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="font-bold text-gray-200">Daltoon Bot</h3>
                <div className="flex items-center gap-1.5">
                  <span className="px-2 py-0.5 text-[10px] font-bold text-emerald-400 rounded-md bg-emerald-500/10 border border-emerald-500/20">
                    v{appVersion}
                  </span>
                  {updateAvailable && (
                    <span className="px-2 py-0.5 text-[10px] font-bold text-amber-400 rounded-md bg-amber-500/10 border border-amber-500/20 animate-pulse whitespace-nowrap">
                      {dt.newUpdate}
                    </span>
                  )}
                </div>
              </div>
              <p className="text-xs text-gray-400 mt-1">
                {dt.manageBot}
              </p>
            </div>
          </div>

          {/* PM2 Server Controls */}
          <div className="flex items-center justify-center gap-2 border border-[#1f2937] rounded-lg p-1 bg-[#0b101d] w-full md:w-auto">
            <button
              onClick={() => handleBotAction(isBotRunning ? 'stop' : 'start')}
              disabled={botActionLoading || isBotStatusLoading}
              title={isBotRunning ? "Stop Bot" : "Start Bot"}
              className={\`p-2.5 rounded-md transition-all \${isBotRunning ? 'text-red-400 hover:bg-red-500/10' : 'text-emerald-400 hover:bg-emerald-500/10'} \${botActionLoading ? 'opacity-50 cursor-not-allowed' : ''}\`}
            >
              <Power className="w-5 h-5 md:w-4 md:h-4" />
            </button>
            <div className="w-px h-6 bg-[#1f2937]"></div>
            <button
              onClick={() => handleBotAction('restart')}
              disabled={botActionLoading || isBotStatusLoading}
              title="Restart Bot"
              className={\`p-2.5 rounded-md text-sky-400 hover:bg-sky-500/10 transition-all \${botActionLoading ? 'opacity-50 cursor-not-allowed' : ''}\`}
            >
              <RotateCw className={\`w-5 h-5 md:w-4 md:h-4 \${botActionLoading ? 'animate-spin' : ''}\`} />
            </button>
          </div>
        </div>

        <div className="w-full h-px bg-[#1f2937] my-1 hidden md:block" />

        <div className="flex gap-3 w-full md:justify-end">
          <button 
            onClick={onOpenUpdatePanel}
            className={\`flex-1 md:flex-initial flex items-center justify-center gap-2 px-6 py-2.5 rounded-lg transition-all text-xs font-bold border \${
              updateAvailable 
                ? "bg-purple-500/10 hover:bg-purple-500/20 text-purple-400 border-purple-500/30 animate-pulse" 
                : "bg-white/5 hover:bg-white/10 text-gray-400 border-white/5"
            }\`}
          >
            <Cloud className="w-3.5 h-3.5" />
            {dt.update}
          </button>
          <a 
            href="https://t.me/mDaltoon" 
            target="_blank" 
            rel="noopener noreferrer"
            className="flex-1 md:flex-initial flex items-center justify-center gap-2 px-6 py-2.5 rounded-lg bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition-all text-xs font-medium border border-white/5"
          >
            <Send className="w-3.5 h-3.5 text-sky-400" />
            Telegram
          </a>
        </div>
      </div>`;

if (code.includes(oldCard)) {
  code = code.replace(oldCard, newCard);
  fs.writeFileSync('src/components/DashboardOverview.tsx', code);
  console.log("Successfully replaced Daltoon Bot Card");
} else {
  console.log("oldCard not found! Looking for a loose match...");
  const oldCardLoose = code.substring(code.indexOf('{/* Daltoon Bot Card - Standalone Horizontal on Desktop */}'), code.indexOf('      {/* Cool Advanced Live Income Dashboard */}'));
  if (oldCardLoose) {
    code = code.replace(oldCardLoose, newCard + '\n');
    fs.writeFileSync('src/components/DashboardOverview.tsx', code);
    console.log("Successfully replaced Daltoon Bot Card via loose match");
  } else {
    console.log("Still not found!");
  }
}
