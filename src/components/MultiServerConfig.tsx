import { translateText, Language, translations } from "../lang/locales";
import React, { useState } from "react";
import { ServerConfig, PanelSettings, InboundInfo, PlanCategory, ColleaguePackage } from "../types";
import {
  Cpu,
  RefreshCw,
  X,
  Check,
  Activity,
  ChevronDown,
  ChevronUp,
  Save,
  Server,
  Trash2,
  Edit,
} from "lucide-react";

interface MultiServerConfigProps {
  settings: PanelSettings;
  onSaveSettings: (settings: PanelSettings) => void;
  lang: Language;
  planCategories: PlanCategory[];
  colleaguePackages?: ColleaguePackage[];
  serverType?: "standard" | "colleague";
}

export default function MultiServerConfig({
  settings,
  onSaveSettings,
  lang,
  planCategories,
  colleaguePackages = [],
  serverType = "standard",
}: MultiServerConfigProps) {
  const isColleague = serverType === "colleague";
  
  const [servers, setServers] = useState<ServerConfig[]>(() => {
    const sList = isColleague ? settings.colleagueServers : settings.servers;
    return Array.isArray(sList) ? sList : [];
  });
  
  React.useEffect(() => {
    const sList = isColleague ? settings.colleagueServers : settings.servers;
    const currentList = Array.isArray(sList) ? sList : [];
    if (JSON.stringify(servers) !== JSON.stringify(currentList)) {
      setServers(currentList);
    }
  }, [settings.servers, settings.colleagueServers, isColleague]);

  const [showForm, setShowForm] = useState(false);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);

  const updateSettingsWithServers = (newServers: ServerConfig[]) => {
    if (isColleague) {
      onSaveSettings({ ...settings, colleagueServers: newServers });
    } else {
      onSaveSettings({ ...settings, servers: newServers });
    }
  };

  const handleDragStart = (e: React.DragEvent, index: number) => {
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("text/plain", index.toString());
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  };

  const handleDrop = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === index) return;

    const newServers = [...servers];
    const draggedItem = newServers[draggedIndex];
    newServers.splice(draggedIndex, 1);
    newServers.splice(index, 0, draggedItem);

    setServers(newServers);
    updateSettingsWithServers(newServers);
    setDraggedIndex(null);
  };

  // Form State
  const [name, setName] = useState("");
  const [baseUrl, setBaseUrl] = useState("");
  const [subUrl, setSubUrl] = useState("");
  const [panelUsername, setPanelUsername] = useState("");
  const [panelPassword, setPanelPassword] = useState("");
  const [panelToken, setPanelToken] = useState("");
  const [panelType, setPanelType] = useState<"sanaei" | "rebecca" | "pasarguard">("sanaei");

  const [testStatus, setTestStatus] = useState<{
    type: "success" | "error" | "loading" | "idle";
    message: string;
  }>({ type: "idle", message: "" });
  const [inbounds, setInbounds] = useState<InboundInfo[]>([]);
  const [checkedInboundIds, setCheckedInboundIds] = useState<number[]>([]);
  const [checkedPlanCategories, setCheckedPlanCategories] = useState<string[]>([]);
  const [showInbounds, setShowInbounds] = useState(true);

  const startAdd = () => {
    setName("");
    setBaseUrl("");
    setSubUrl("");
    setPanelUsername("");
    setPanelPassword("");
    setPanelToken("");
    setPanelType("sanaei");
    setInbounds([]);
    setCheckedInboundIds([]);
    setCheckedPlanCategories([]);
    setTestStatus({ type: "idle", message: "" });
    setEditingIndex(null);
    setShowForm(true);
  };

  const startEdit = (index: number) => {
    const s = servers[index];
    setName(s.name);
    setBaseUrl(s.panelUrl);
    setSubUrl(s.subUrl || "");
    setPanelUsername(s.panelUsername || "");
    setPanelPassword(s.panelPassword || "");
    setPanelToken(s.panelToken || "");
    setPanelType(s.panelType || "sanaei");
    setCheckedInboundIds(
      Array.isArray(s.activeInboundIds) ? s.activeInboundIds : [],
    );
    setCheckedPlanCategories(Array.isArray(s.planCategories) ? s.planCategories : []);
    setInbounds([]); // We don't have the old list, need to re-test to fetch them or just let them stay as ids.
    setTestStatus({ type: "idle", message: "" });
    setEditingIndex(index);
    setShowForm(true);
  };

  const handleDelete = (index: number) => {
    const newServers = [...servers];
    newServers.splice(index, 1);
    setServers(newServers);
    updateSettingsWithServers(newServers);
  };

  const handleTestConnection = async () => {
    if (!name.trim()) {
      setTestStatus({
        type: "error",
        message:
          translateText("Server name is required.", "نام سرور الزامی است.", lang),
      });
      return;
    }
    setTestStatus({
      type: "loading",
      message: panelType === "rebecca"
        ? translateText("Connecting to Rebecca panel...", "در حال اتصال به پنل ربکا...", lang)
        : translateText("Connecting to 3x-ui panel and fetching inbounds...", "در حال اتصال به پنل ۳x-ui و دریافت لیست اینباندها...", lang),
    });
    try {
      const response = await fetch("/api/xui/test-connection", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ baseUrl, panelUsername, panelPassword, panelType, panelToken }),
      });
      const data = await response.json();
      if (data.success) {
        if (data.panelToken) {
          setPanelToken(data.panelToken);
        }
        setTestStatus({ type: "success", message: data.message });
        if (Array.isArray(data.inbounds)) {
          setInbounds(data.inbounds);
          if (checkedInboundIds.length === 0) {
            setCheckedInboundIds(data.inbounds.map((ib: any) => ib.id));
          } else {
            const fetchedIds = data.inbounds.map((ib: any) => String(ib.id));
            setCheckedInboundIds((prev) =>
              prev.filter((id) => fetchedIds.includes(String(id)))
            );
          }
        }
      } else {
        setTestStatus({ type: "error", message: data.error });
      }
    } catch (err: any) {
      setTestStatus({
        type: "error",
        message: translateText("Connection failed.", "خطا در اتصال به سرور.", lang),
      });
    }
  };

  const handleSave = () => {
    if (!name.trim() || !baseUrl.trim()) return;

    const newServer: ServerConfig = {
      id:
        editingIndex !== null
          ? servers[editingIndex].id
          : "srv_" + Math.random().toString(36).substring(2, 8),
      name,
      panelUrl: baseUrl,
      subUrl,
      panelUsername,
      panelPassword,
      panelToken,
      panelType,
      activeInboundIds: checkedInboundIds,
      planCategories: checkedPlanCategories,
      status: "active",
    };

    let newServers = [...servers];
    if (editingIndex !== null) {
      newServers[editingIndex] = newServer;
    } else {
      newServers.push(newServer);
    }

    setServers(newServers);
    updateSettingsWithServers(newServers);
    setShowForm(false);
  };

  return (
    <div className="bg-gradient-to-br from-[#0c1020] to-[#121c35] border border-indigo-500/20 p-6 rounded-2xl space-y-6 shadow-lg shadow-black/40">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between border-b border-gray-850 pb-4 gap-4">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-indigo-500/10 text-indigo-400 rounded-2xl border border-indigo-500/20">
            <Cpu className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <h3 className="font-display font-bold text-lg text-white">
              {isColleague ? translateText("🔌 Colleague Servers Management", "🔌 مدیریت سرورهای همکاران", lang) : translateText("🔌 X-UI Servers Management", "🔌 مدیریت سرورهای X-UI", lang)}
            </h3>
            <p className="text-xs text-gray-400 mt-0.5">
              {isColleague ? translateText("Manage X-UI panels designated for colleague accounts subscription delivery.", "پنل‌های مخصوص همکاران را برای ساخت خودکار اشتراک‌های همکار اضافه کنید.", lang) : translateText("Manage your X-UI panels for automated subscription delivery.", "پنل‌های خود را برای ساخت خودکار اشتراک‌ها اضافه کنید.", lang)}
            </p>
          </div>
        </div>
        {!showForm && (
          <button
            onClick={startAdd}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-semibold transition active:scale-95"
          >
            {translateText("Add New Server +", "افزودن سرور جدید +", lang)}
          </button>
        )}
      </div>

      {showForm && (
        <div className="space-y-4 animate-fade-in bg-[#13192e]/50 p-4 rounded-xl border border-indigo-500/10">
          <div className="flex justify-between items-center mb-2">
            <h4 className="text-sm font-bold text-white">
              {editingIndex !== null
                ? translateText("Edit Server", "ویرایش سرور", lang)
                : translateText("Add New Connection", "افزودن اتصال جدید", lang)}
            </h4>
            <button
              onClick={() => setShowForm(false)}
              className="text-gray-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="block text-xs uppercase tracking-wider text-gray-300 mb-2">
                {translateText("Panel Type", "نوع پنل", lang)}
              </label>
              <div className="flex gap-4 mb-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="panelType"
                    value="sanaei"
                    checked={panelType === "sanaei"}
                    onChange={() => setPanelType("sanaei")}
                    className="text-indigo-500 bg-[#13192e] border-gray-700 focus:ring-indigo-500"
                  />
                  <span className="text-sm text-gray-300">{translateText("Sanaei", "سنایی (Sanaei)", lang)}</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="panelType"
                    value="rebecca"
                    checked={panelType === "rebecca"}
                    onChange={() => setPanelType("rebecca")}
                    className="text-indigo-500 bg-[#13192e] border-gray-700 focus:ring-indigo-500"
                  />
                  <span className="text-sm text-gray-300">{translateText("Reebeka", "ربکا (Reebeka)", lang)}</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="panelType"
                    value="pasarguard"
                    checked={panelType === "pasarguard"}
                    onChange={() => setPanelType("pasarguard")}
                    className="text-indigo-500 bg-[#13192e] border-gray-700 focus:ring-indigo-500"
                  />
                  <span className="text-sm text-gray-300">{translateText("Pasarguard", "پاسارگارد (Pasarguard)", lang)}</span>
                </label>
              </div>
            </div>
            <div className="md:col-span-2">
              <label className="block text-xs uppercase tracking-wider text-gray-300 mb-1">
                {translateText("Server Name", "نام دلخواه سرور", lang)}
              </label>
              <input
                type="text"
                className="w-full bg-[#13192e] border border-gray-700 rounded-lg p-2.5 text-sm text-indigo-300 focus:ring-1 focus:ring-indigo-500 outline-none"
                placeholder={translateText("e.g. Germany 1", "مثلا: آلمان ۱", lang)}
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-xs uppercase tracking-wider text-gray-300 mb-1">
                {translateText("Panel URL (with port)", "آدرس پنل (با پورت)", lang)}
              </label>
              <input
                type="text"
                className="w-full bg-[#13192e] border border-gray-700 rounded-lg p-2.5 text-sm text-indigo-300 font-mono focus:ring-1 focus:ring-indigo-500 outline-none"
                placeholder="http://ip:port"
                value={baseUrl}
                onChange={(e) => setBaseUrl(e.target.value)}
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-xs uppercase tracking-wider text-gray-300 mb-1">
                {translateText("Subscription URL (Optional)", "لینک سابسکریپشن (اختیاری)", lang)}
              </label>
              <input
                type="text"
                className="w-full bg-[#13192e] border border-gray-700 rounded-lg p-2.5 text-sm text-indigo-300 font-mono focus:ring-1 focus:ring-indigo-500 outline-none"
                placeholder="https://sub.example.com"
                value={subUrl}
                onChange={(e) => setSubUrl(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-xs uppercase tracking-wider text-gray-300 mb-1">
                {translateText("Panel Username", "نام کاربری پنل", lang)}
              </label>
              <input
                type="text"
                className="w-full bg-[#13192e] border border-gray-700 rounded-lg p-2.5 text-sm text-white focus:ring-1 focus:ring-indigo-500 outline-none font-mono"
                value={panelUsername}
                onChange={(e) => setPanelUsername(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-xs uppercase tracking-wider text-gray-300 mb-1">
                {translateText("Panel Password", "رمز عبور پنل", lang)}
              </label>
              <input
                type="password"
                className="w-full bg-[#13192e] border border-gray-700 rounded-lg p-2.5 text-sm text-white focus:ring-1 focus:ring-indigo-500 outline-none font-mono"
                value={panelPassword}
                onChange={(e) => setPanelPassword(e.target.value)}
              />
            </div>
          </div>

          <div className="pt-2">
            <button
              onClick={handleTestConnection}
              className="w-full sm:w-auto px-6 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-lg text-xs transition-all shadow-md flex items-center justify-center gap-2"
            >
              <RefreshCw
                className={`w-3.5 h-3.5 ${testStatus.type === "loading" ? "animate-spin" : ""}`}
              />
              {panelType === "rebecca" ? translateText("Test Reebeka Connection", "تست اتصال به پنل ریبکا", lang) : translateText("Test Connection & Fetch Inbounds", "تست اتصال و دریافت اینباندها", lang)}
            </button>
          </div>

          {testStatus.type !== "idle" && (
            <div
              className={`p-3 rounded-lg text-xs font-medium ${
                testStatus.type === "success"
                  ? "bg-emerald-500/10 text-emerald-400"
                  : testStatus.type === "loading"
                    ? "bg-indigo-500/10 text-indigo-400 animate-pulse"
                    : "bg-rose-500/10 text-rose-400"
              }`}
            >
              {testStatus.message}
            </div>
          )}

          {inbounds.length > 0 && (
            <div className="border border-indigo-500/20 rounded-xl bg-slate-950/40 p-4 mt-4">
              <h4 className="text-xs font-bold text-gray-200 mb-3">
                {panelType === "pasarguard" ? translateText("Allowed Groups:", "گروه‌های مجاز برای این سرور:", lang) : panelType === "rebecca" ? translateText("Allowed Services:", "سرویس‌های مجاز برای این سرور:", lang) : translateText("Allowed Inbounds:", "اینباندهای مجاز برای ساخت اکانت:", lang)}
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 max-h-[200px] overflow-y-auto pr-1">
                {inbounds.map((ib) => (
                  <label
                    key={ib.id}
                    className="flex items-start gap-2 p-2 rounded-lg border border-gray-800 hover:border-indigo-500/50 cursor-pointer bg-[#111827]"
                  >
                    <input
                      type="checkbox"
                      className="mt-1"
                      checked={checkedInboundIds.some((id) => String(id) === String(ib.id))}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setCheckedInboundIds((prev) => {
                            if (prev.some((id) => String(id) === String(ib.id))) return prev;
                            return [...prev, ib.id];
                          });
                        } else {
                          setCheckedInboundIds((prev) =>
                            prev.filter((id) => String(id) !== String(ib.id)),
                          );
                        }
                      }}
                    />
                    <div className="text-xs text-gray-300">
                      <div className="font-bold text-white">{ib.remark}</div>
                      <div>
                        {ib.protocol} | Port: {ib.port}
                      </div>
                    </div>
                  </label>
                ))}
              </div>
            </div>
          )}

          <div className="border border-purple-500/20 rounded-xl bg-slate-950/40 p-4 mt-4">
            {!isColleague ? (
              <>
                <h4 className="text-xs font-bold text-gray-200 mb-3">
                  {translateText("Allowed Plan Categories for this server:", "دسته‌بندی‌های پلن مجاز برای این سرور:", lang)}
                </h4>
                <div className="flex flex-wrap gap-3">
                  {planCategories.map((cat) => (
                    <label
                      key={cat.id}
                      className="flex items-center gap-2 p-2 rounded-lg border border-gray-800 hover:border-purple-500/50 cursor-pointer bg-[#111827]"
                    >
                      <input
                        type="checkbox"
                        checked={checkedPlanCategories.includes(cat.id)}
                        onChange={(e) => {
                          if (e.target.checked)
                            setCheckedPlanCategories((prev) => [...prev, cat.id]);
                          else
                            setCheckedPlanCategories((prev) =>
                              prev.filter((id) => id !== cat.id),
                            );
                        }}
                      />
                      <div className="text-xs text-gray-300 flex items-center gap-1">
                        <span>{cat.emoji}</span>
                        <span className="font-bold text-white">{cat.name}</span>
                      </div>
                    </label>
                  ))}
                  {planCategories.length === 0 && (
                    <span className="text-xs text-gray-500">
                      {translateText("No categories created yet.", "هنوز هیچ دسته‌بندی ایجاد نشده است.", lang)}
                    </span>
                  )}
                </div>
              </>
            ) : (
              colleaguePackages && colleaguePackages.length > 0 && (
                <>
                  <h4 className="text-xs font-bold text-gray-200 mb-3">
                    {translateText("Allowed Colleague Packages for this server:", "بسته‌های مجاز همکاران برای این سرور:", lang)}
                  </h4>
                  <div className="flex flex-wrap gap-3">
                    {colleaguePackages.map((pkg) => (
                      <label
                        key={pkg.id}
                        className="flex items-center gap-2 p-2 rounded-lg border border-gray-800 hover:border-blue-500/50 cursor-pointer bg-[#111827]"
                      >
                        <input
                          type="checkbox"
                          checked={checkedPlanCategories.includes(pkg.id)}
                          onChange={(e) => {
                            if (e.target.checked)
                              setCheckedPlanCategories((prev) => [...prev, pkg.id]);
                            else
                              setCheckedPlanCategories((prev) =>
                                prev.filter((id) => id !== pkg.id),
                              );
                          }}
                        />
                        <div className="text-xs text-gray-300 flex items-center gap-1">
                          <span className="font-bold text-white">{pkg.title}</span>
                        </div>
                      </label>
                    ))}
                  </div>
                </>
              )
            )}
          </div>

          <div className="pt-4 flex justify-end">
            <button
              onClick={handleSave}
              className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-lg text-xs transition flex items-center gap-2"
            >
              <Save className="w-4 h-4" />
              {translateText("Save Server", "ذخیره سرور", lang)}
            </button>
          </div>
        </div>
      )}

      {/* List of Servers */}
      {!showForm && servers.length > 0 && (
        <div className="overflow-x-auto border border-gray-800 rounded-xl">
          <table className="w-full text-sm text-right">
            <thead className="bg-[#13192e] text-gray-300 border-b border-gray-800">
              <tr>
                <th className="py-4 px-6 font-medium whitespace-nowrap">
                  {translateText("Server Name", "نام سرور", lang)}
                </th>
                <th className="py-4 px-6 font-medium whitespace-nowrap">
                  {translateText("Panel URL", "آدرس پنل", lang)}
                </th>
                <th className="py-4 px-6 font-medium whitespace-nowrap">
                  {translateText("Inbounds", "اینباندها", lang)}
                </th>
                <th className="py-4 px-6 font-medium whitespace-nowrap text-center">
                  {translateText("Connection Status", "وضعیت اتصال", lang)}
                </th>
                <th className="py-4 px-6 font-medium whitespace-nowrap text-center">
                  {translateText("Actions", "عملیات", lang)}
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800">
              {servers.map((srv, index) => (
                <tr
                  key={srv.id}
                  className={`bg-[#0c1020] hover:bg-[#13192e] transition-colors ${draggedIndex === index ? "opacity-50 border-2 border-indigo-500" : ""}`}
                  draggable
                  onDragStart={(e) => handleDragStart(e, index)}
                  onDragOver={(e) => handleDragOver(e, index)}
                  onDrop={(e) => handleDrop(e, index)}
                  onDragEnd={() => setDraggedIndex(null)}
                >
                  <td className="py-4 px-6 whitespace-nowrap">
                    <div className="flex items-center gap-3">
                      <div
                        className="w-8 h-8 rounded bg-indigo-500/10 flex items-center justify-center text-indigo-400 cursor-move"
                        title={
                          translateText("Drag to reorder", "برای جابجایی بکشید", lang)
                        }
                      >
                        <Server className="w-4 h-4" />
                      </div>
                      <div className="flex flex-col">
                        <span className="font-bold text-white">{srv.name}</span>
                        <span className="text-[9px] text-gray-500 uppercase tracking-widest">{srv.panelType === "rebecca" ? "Reebeka" : "Sanaei"}</span>
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-6 whitespace-nowrap">
                    <span className="font-mono text-xs text-gray-400">
                      {srv.panelUrl}
                    </span>
                  </td>
                  <td className="py-4 px-6 whitespace-nowrap">
                    <span className="text-gray-300">
                      {srv.activeInboundIds?.length || 0}{" "}
                      {translateText("Inbounds", "اینباند", lang)}
                    </span>
                  </td>
                  <td className="py-4 px-6 whitespace-nowrap text-center">
                    <span className="inline-flex items-center justify-center px-2.5 py-1 text-xs rounded-md bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                      {translateText("Connected", "متصل", lang)}
                    </span>
                  </td>
                  <td className="py-4 px-6 whitespace-nowrap">
                    <div className="flex items-center justify-center gap-2">
                      <button
                        onClick={() => startEdit(index)}
                        className="p-1.5 bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-400 rounded-lg transition"
                        title={translateText("Edit", "ویرایش", lang)}
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(index)}
                        className="p-1.5 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 rounded-lg transition"
                        title={translateText("Delete", "حذف", lang)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      {!showForm && servers.length === 0 && (
        <div className="text-center py-8 border border-dashed border-gray-800 rounded-xl">
          <p className="text-gray-500 text-sm">
            {translateText("No servers added yet.", "هیچ سروری اضافه نشده است.", lang)}
          </p>
        </div>
      )}
    </div>
  );
}
