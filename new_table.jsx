<table className="w-full text-left text-sm text-gray-300">
            <thead className="text-xs text-gray-400 uppercase bg-slate-900 border-b border-[#1f2937] sticky top-0 z-10">
              <tr>
                <th className="px-5 py-3 w-1/2">{translateText("User Info", "مشخصات کاربر", lang)}</th>
                <th className="px-5 py-3 w-1/2 text-right">{translateText("Details", "جزئیات", lang)}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1f2937]">
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={2} className="px-5 py-10 text-center text-gray-500">
                    {t.noUsersMatch}
                  </td>
                </tr>
              ) : (
                filteredUsers.map((user) => {
                  const userKeys = keys.filter(k => k.userId === user.userId && !k.planName.includes("تست رایگان"));
                  const isExpanded = expandedUserId === user.userId;
                  return (
                    <React.Fragment key={user.userId}>
                    <tr className={`transition ${isExpanded ? 'bg-slate-900/60' : 'hover:bg-slate-900/40'}`}>
                      <td className="px-5 py-4">
                        <div className="flex flex-col gap-2">
                          <div className="flex items-center gap-1.5 font-mono text-xs">
                            <span className="text-gray-500">ID:</span>
                            <span>{user.userId}</span>
                            <button
                              onClick={() => {
                                copyTextToClipboard(String(user.userId));
                                setCopiedKeyId("uid_" + user.userId);
                                setTimeout(() => setCopiedKeyId(null), 1500);
                              }}
                              className="text-gray-500 hover:text-indigo-400 p-0.5 rounded transition cursor-pointer"
                              title={translateText("Copy Telegram ID", "کپی شناسه تلگرام", lang)}
                            >
                              {copiedKeyId === "uid_" + user.userId ? (
                                <Check className="w-3 h-3 text-emerald-400" />
                              ) : (
                                <Copy className="w-3 h-3" />
                              )}
                            </button>
                          </div>
                          <div className="flex items-center gap-1 font-medium text-white">
                            <span className="text-indigo-400">@</span>
                            <span>{user.username}</span>
                            <button
                              onClick={() => {
                                copyTextToClipboard(user.username);
                                setCopiedKeyId("uname_" + user.userId);
                                setTimeout(() => setCopiedKeyId(null), 1500);
                              }}
                              className="text-gray-500 hover:text-indigo-400 p-0.5 rounded transition cursor-pointer ml-1"
                              title={translateText("Copy Username", "کپی نام کاربری", lang)}
                            >
                              {copiedKeyId === "uname_" + user.userId ? (
                                <Check className="w-3 h-3 text-emerald-400" />
                              ) : (
                                <Copy className="w-3 h-3" />
                              )}
                            </button>
                          </div>
                        </div>
                      </td>
                      
                      <td className="px-5 py-4 text-right">
                         <button
                           onClick={() => setExpandedUserId(isExpanded ? null : user.userId)}
                           className="p-2 bg-slate-800 hover:bg-slate-700 text-gray-300 rounded-lg transition inline-flex items-center justify-center cursor-pointer"
                         >
                           {isExpanded ? <ChevronUp className="w-5 h-5" /> : <Info className="w-5 h-5 text-indigo-400" />}
                         </button>
                      </td>
                    </tr>
                    {isExpanded && (
                       <tr className="bg-slate-900/30 border-b border-[#1f2937]">
                         <td colSpan={2} className="p-0">
                           <div className="p-4 sm:p-5 flex flex-col gap-6">
                              {/* Quick Stats Grid */}
                              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                                 <div className="bg-[#111827] border border-slate-800 p-3 rounded-lg flex flex-col gap-1">
                                    <span className="text-gray-500 text-[11px] uppercase tracking-wider">{t.tableColWallet}</span>
                                    <div className="flex items-center gap-1.5 font-display text-emerald-400 font-semibold text-sm">
                                      <Wallet className="w-4 h-4" />
                                      {user.walletBalance.toLocaleString()} {currency}
                                    </div>
                                 </div>
                                 <div className="bg-[#111827] border border-slate-800 p-3 rounded-lg flex flex-col gap-1">
                                    <span className="text-gray-500 text-[11px] uppercase tracking-wider">{translateText("Referrals", "زیرمجموعه‌ها", lang)}</span>
                                    <div className="flex flex-col gap-0.5 text-xs">
                                      <div className="flex justify-between items-center text-gray-300">
                                        <span>{translateText("Invites:", "دعوت:", lang)}</span> <span className="font-mono">{user.referralCount || 0}</span>
                                      </div>
                                      <div className="flex justify-between items-center text-emerald-400 font-medium">
                                        <span>{translateText("Earned:", "درآمد:", lang)}</span> <span className="font-mono">{(user.referralRewardTotal || 0).toLocaleString()}</span>
                                      </div>
                                    </div>
                                 </div>
                                 <div className="bg-[#111827] border border-slate-800 p-3 rounded-lg flex flex-col gap-1 justify-between">
                                    <span className="text-gray-500 text-[11px] uppercase tracking-wider">{t.tableColRegDate}</span>
                                    <span className="font-mono text-xs text-gray-400">{user.joinDate}</span>
                                 </div>
                                 <div className="bg-[#111827] border border-slate-800 p-3 rounded-lg flex flex-col gap-1 justify-between items-start">
                                    <span className="text-gray-500 text-[11px] uppercase tracking-wider">{t.tableColCompliance}</span>
                                    <span className={`px-2 py-0.5 rounded text-[10px] font-semibold uppercase ${
                                      user.status === "active" 
                                        ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                                        : "bg-rose-500/10 text-rose-400 border border-rose-500/20"
                                    }`}>
                                      {user.status === "active" ? (translateText("active", "فعال", lang)) : (translateText("banned", "مسدود", lang))}
                                    </span>
                                 </div>
                              </div>
                              
                              {/* Subscriptions section */}
                              <div className="flex flex-col gap-2">
                                <div className="flex items-center justify-between">
                                  <span className="text-gray-400 text-xs uppercase tracking-wider font-semibold">{t.tableColSubs}</span>
                                  <span className={`px-2 py-0.5 rounded-full text-[11px] font-mono font-semibold text-center ${
                                    userKeys.length > 0 ? "bg-indigo-500/10 text-indigo-300 border border-indigo-500/20" : "bg-slate-800/60 text-gray-500"
                                  }`}>
                                    {userKeys.length} {translateText("configs", "کانفیگ", lang)}
                                  </span>
                                </div>
                                {userKeys.length > 0 ? (
                                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 max-h-[250px] overflow-y-auto no-scrollbar pb-1">
                                    {userKeys.map((key) => (
                                      <div key={key.id} className="flex flex-col gap-2 bg-[#111827] border border-slate-800 p-2.5 rounded-lg text-xs transition hover:border-slate-700">
                                        <div className="flex items-center justify-between gap-1">
                                          <span className="truncate text-indigo-300 font-medium font-sans" title={`${key.planName} (${key.clientName || 'N/A'})`}>
                                            {key.planName}
                                          </span>
                                          <div className="flex items-center gap-1 shrink-0 bg-slate-900 p-1 rounded-md">
                                            <button
                                              onClick={() => {
                                                copyTextToClipboard(key.subLink);
                                                setCopiedKeyId(key.id);
                                                setTimeout(() => setCopiedKeyId(null), 1500);
                                              }}
                                              className="text-gray-400 hover:text-indigo-400 hover:bg-indigo-500/10 p-1 rounded transition cursor-pointer"
                                              title={translateText("Copy connection link", "کپی لینک کانکشن", lang)}
                                            >
                                              {copiedKeyId === key.id ? (
                                                <Check className="w-3.5 h-3.5 text-emerald-400" />
                                              ) : (
                                                <Copy className="w-3.5 h-3.5" />
                                              )}
                                            </button>
                                            
                                            <button
                                              onClick={() => toggleSubscriptionKey(key.id)}
                                              className={`p-1 rounded transition cursor-pointer ${
                                                key.status === "active"
                                                  ? "text-amber-500 hover:bg-amber-500/10"
                                                  : "text-emerald-400 hover:bg-emerald-500/10"
                                              }`}
                                              title={key.status === "active" ? (translateText("Suspend", "تعلیق", lang)) : (translateText("Enable", "فعال کردن", lang))}
                                            >
                                              <Ban className="w-3.5 h-3.5" />
                                            </button>
                                            <button
                                              type="button"
                                              onClick={() => {
                                                setRenewingKey(key);
                                                setRenewGb("30");
                                                setRenewDays("30");
                                              }}
                                              className="text-emerald-400 hover:bg-emerald-500/10 p-1 rounded transition cursor-pointer"
                                              title={translateText("Renew Service", "تمدید سرویس", lang)}
                                            >
                                              <RefreshCw className="w-3.5 h-3.5" />
                                            </button>
                                            <button
                                              type="button"
                                              onClick={() => handleRegenerateUuid(key.id)}
                                              disabled={regeneratingKeyId === key.id}
                                              className="text-rose-400 hover:bg-rose-500/10 p-1 rounded transition cursor-pointer disabled:opacity-50"
                                              title={translateText("New Link", "تغییر لینک", lang)}
                                            >
                                              <RotateCcw className={`w-3.5 h-3.5 ${regeneratingKeyId === key.id ? 'animate-spin' : ''}`} />
                                            </button>
                                            <button
                                              onClick={() => setDeleteConfirm({
                                                id: key.id,
                                                type: "key",
                                                title: translateText("Confirm Delete Subscription", "تایید حذف کانفیگ", lang),
                                                message: translateText(`Are you sure you want to delete config ${key.planName} (ID: ${key.id})?`, `آیا از حذف دائم کانفیگ ${key.planName} (شناسه: ${key.id}) اطمینان دارید؟`, lang)
                                              })}
                                              className="text-gray-500 hover:text-rose-400 hover:bg-rose-500/10 p-1 rounded transition shrink-0 cursor-pointer"
                                              title={translateText("Remove this key", "حذف این کانفیگ", lang)}
                                            >
                                              <Trash2 className="w-3.5 h-3.5" />
                                            </button>
                                          </div>
                                        </div>
                                        
                                        <div className="flex items-center gap-1 bg-slate-900 border border-slate-800 px-2 py-1.5 rounded select-all mt-1">
                                          <span className="font-mono text-[10px] text-gray-500 truncate grow" title={key.subLink}>
                                            {key.subLink}
                                          </span>
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                ) : (
                                  <div className="text-center p-4 bg-[#111827] border border-slate-800 rounded-lg text-gray-500 text-xs">
                                     {translateText("No active configs found for this user.", "کانفیگ فعالی برای این کاربر یافت نشد.", lang)}
                                  </div>
                                )}
                              </div>
                              
                              {/* Actions */}
                              <div className="flex flex-col gap-2 pt-2 border-t border-slate-800/50">
                                <span className="text-gray-400 text-xs uppercase tracking-wider font-semibold">{t.tableColActions}</span>
                                <div className="flex flex-wrap items-center gap-2 font-sans">
                                  <button
                                    onClick={() => {
                                      setAdjustingUser(user);
                                      setAdjustType("add");
                                    }}
                                    className="p-1.5 px-3 bg-slate-800 hover:bg-slate-700 hover:text-white text-gray-300 rounded flex-1 sm:flex-none text-[11px] transition inline-flex justify-center items-center gap-1 cursor-pointer"
                                    title="Adjust Balance"
                                  >
                                    <Plus className="w-3.5 h-3.5 text-emerald-400" />
                                    {t.fundsAction}
                                  </button>
                                  <button
                                    onClick={() => setAddingConfigForUser(user)}
                                    className="p-1.5 px-3 bg-emerald-950/40 hover:bg-emerald-900 border border-emerald-500/10 text-emerald-300 rounded flex-1 sm:flex-none text-[11px] transition inline-flex justify-center items-center gap-1 cursor-pointer"
                                    title={translateText("Add Manual VPN Config", "افزودن کانفیگ دستی", lang)}
                                  >
                                    <Key className="w-3.5 h-3.5 text-emerald-400" />
                                    {translateText("+ Config", "➕ کانفیگ", lang)}
                                  </button>
                                  <button
                                    onClick={() => openSimulatedChat(user.userId)}
                                    className="p-1.5 px-3 bg-indigo-900/50 hover:bg-indigo-900 text-indigo-300 rounded flex-1 sm:flex-none text-[11px] transition inline-flex justify-center items-center gap-1 cursor-pointer"
                                    title="Simulate Bot Chat"
                                  >
                                    <MessageSquare className="w-3.5 h-3.5" />
                                    {t.chatAction}
                                  </button>
                                  <button
                                    onClick={() => setSendingMsgUser(user)}
                                    className="p-1.5 px-3 bg-fuchsia-950/40 hover:bg-fuchsia-900 border border-fuchsia-500/20 text-fuchsia-300 rounded flex-1 sm:flex-none text-[11px] transition inline-flex justify-center items-center gap-1 cursor-pointer"
                                    title={translateText("Send direct Telegram message", "ارسال پیام خصوصی به تلگرام", lang)}
                                  >
                                    <MessageSquare className="w-3.5 h-3.5 text-fuchsia-400" />
                                    {translateText("💬 Message PV", "💬 پیام به PV", lang)}
                                  </button>
                                  <button
                                    onClick={() => toggleUserBan(user.userId)}
                                    className={`p-1.5 px-3 rounded flex-1 sm:flex-none text-[11px] transition cursor-pointer inline-flex justify-center items-center gap-1 ${
                                      user.status === "active"
                                        ? "bg-rose-500/10 text-rose-400 hover:bg-rose-500/20"
                                        : "bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20"
                                    }`}
                                  >
                                    <Ban className="w-3.5 h-3.5" />
                                    {user.status === "active" ? t.banAction : t.unbanAction}
                                  </button>
                                  <button
                                    onClick={() => setDeleteConfirm({
                                      id: user.userId,
                                      type: "user",
                                      title: translateText("Confirm Delete User", "تایید حذف کاربر", lang),
                                      message: translateText(`Are you sure you want to completely delete @${user.username} and all of their active subscription keys?`, `آیا از حذف کامل کاربر @${user.username} و تمام سرویس‌ها و اکانت‌های فعال وی از دالتون بات اطمینان دارید؟`, lang)
                                    })}
                                    className="p-1.5 px-3 bg-rose-950/40 hover:bg-rose-900 border border-rose-500/30 text-rose-400 hover:text-white rounded flex-1 sm:flex-none text-[11px] transition inline-flex justify-center items-center gap-1 cursor-pointer"
                                    title={translateText("Delete User Completely", "حذف کامل کاربر", lang)}
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                    {translateText("Delete", "حذف", lang)}
                                  </button>
                                </div>
                              </div>
                           </div>
                         </td>
                       </tr>
                    )}
                    </React.Fragment>
                  );
                })
              )}
            </tbody>
          </table>
