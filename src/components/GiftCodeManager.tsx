import { translateText, Language, translations } from "../lang/locales";
import React, { useState } from 'react';
import { Gift, Trash2, Plus, Users, Edit2, Check, X, Share2, Save, Tag, Calendar, Percent, Clock, RefreshCw } from 'lucide-react';
import { GiftCode, PromoCode, PanelSettings } from '../types';
import { formatDateTime } from "../utils/dateTimeUtils";
import ConfirmationModal from "./ConfirmationModal";

interface GiftCodeManagerProps {
  giftCodes: GiftCode[];
  onAddCode: (code: string, amount: number, maxUsage: number, durationDays?: number) => void;
  onDeleteCode: (id: string) => void;
  onEditCode?: (id: string, code: string, amount: number, maxUsage: number, durationDays?: number) => void;
  promoCodes?: PromoCode[];
  onAddPromoCode?: (code: string, type: "percent" | "extend_days" | "fixed_amount", value: number, maxUsage: number, durationDays?: number, allowedServerIds?: string[], isActive?: boolean) => void;
  onEditPromoCode?: (id: string, code: string, type: "percent" | "extend_days" | "fixed_amount", value: number, maxUsage: number, durationDays?: number, allowedServerIds?: string[], isActive?: boolean) => void;
  onDeletePromoCode?: (id: string) => void;
  settings?: PanelSettings;
  onSaveSettings?: (settings: PanelSettings) => void;
  servers?: any[];
  lang?: Language;
}

export default function GiftCodeManager({ 
  giftCodes = [], 
  onAddCode, 
  onDeleteCode, 
  onEditCode,
  promoCodes = [],
  onAddPromoCode,
  onEditPromoCode,
  onDeletePromoCode,
  settings,
  onSaveSettings,
  servers = [],
  lang = 'fa'
}: GiftCodeManagerProps) {
  const currency = settings?.currency || (lang === 'fa' ? 'تومان' : 'Toman');
  // Navigation tab within the merged screen
  const [managerTab, setManagerTab] = useState<'gift_codes' | 'promo_codes' | 'referrals'>('gift_codes');

  // Gift Code States
  const [code, setCode] = useState('');
  const [amount, setAmount] = useState('');
  const [maxUsage, setMaxUsage] = useState('1');
  const [durationDays, setDurationDays] = useState('30');
  const [editingId, setEditingId] = useState<string | null>(null);

  const [deleteConfirmConfig, setDeleteConfirmConfig] = useState<{isOpen: boolean, action: (() => void) | null, message: string}>({ isOpen: false, action: null, message: "" });

  // Referral Settings States
  const [botTelegramHandle, setBotTelegramHandle] = useState(settings?.botTelegramHandle || "");
  const [referralRewardAmount, setReferralRewardAmount] = useState<number | ''>(settings?.referralRewardAmount ?? 0);
  const [referralRewardPercent, setReferralRewardPercent] = useState<number | ''>(settings?.referralRewardPercent ?? 5);
  const [referralPurchasePercent, setReferralPurchasePercent] = useState<number | ''>(settings?.referralPurchasePercent ?? 5);
  const [referralL2Percent, setReferralL2Percent] = useState<number | ''>(settings?.referralL2Percent ?? 0);
  const [referralL3Percent, setReferralL3Percent] = useState<number | ''>(settings?.referralL3Percent ?? 0);
  const [referralL4Percent, setReferralL4Percent] = useState<number | ''>(settings?.referralL4Percent ?? 0);
  const [referralRewardCondition, setReferralRewardCondition] = useState<'invite' | 'purchase' | 'both'>(settings?.referralRewardCondition || 'invite');
  const [calculationAmount, setCalculationAmount] = useState<number | ''>(settings?.referralBaseAmount ?? 100000);
  const [deductReferralOnLeave, setDeductReferralOnLeave] = useState<boolean>(settings?.deductReferralOnLeave !== false);
  const [referralMessage, setReferralMessage] = useState(settings?.referralMessage || 
    "برای کسب موجودی هدیه، دوستان و آشنایان خودتون رو با لینک پایین به ربات دعوت کنید 👥\n\n" + 
    "در ضمن کد معرف اختصاصی شما {uid} می باشد.\n\n" + 
    "{link}\n\n" +
    "🎁 با دعوت از هر دوست، {reward} تومان (معادل {percent}% مبلغ پایه) پاداش دریافت می‌کنید.\n\n" + 
    "📊 آمار دعوت شما\n" + 
    "• افراد وارد شده با لینک: 0\n" + 
    "• پاداش دریافت شده: 0 تومان"
  );
  const [savedSettings, setSavedSettings] = useState(false);

  // Promo Code Form States
  const [promoCode, setPromoCode] = useState("");
  const [promoType, setPromoType] = useState<"percent" | "extend_days" | "fixed_amount">("percent");
  const [promoValue, setPromoValue] = useState("");
  const [promoMaxUsage, setPromoMaxUsage] = useState("50");
  const [promoDurationDays, setPromoDurationDays] = useState("30");
  const [promoAllowedServerIds, setPromoAllowedServerIds] = useState<string[]>([]);
  const [promoIsActive, setPromoIsActive] = useState(true);
  const [promoSuccess, setPromoSuccess] = useState(false);
  const [calcBasePrice, setCalcBasePrice] = useState<string>("100,000".replace(/,/g, ""));

  const isFa = lang === 'fa';

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (code && amount && maxUsage) {
      if (editingId && onEditCode) {
        onEditCode(editingId, code, parseInt(amount, 10), parseInt(maxUsage, 10), durationDays ? parseInt(durationDays, 10) : undefined);
        setEditingId(null);
      } else {
        onAddCode(code, parseInt(amount, 10), parseInt(maxUsage, 10), durationDays ? parseInt(durationDays, 10) : undefined);
      }
      setCode('');
      setAmount('');
      setMaxUsage('1');
      setDurationDays('30');
    }
  };

  const handleEdit = (gc: GiftCode) => {
    setEditingId(gc.id);
    setCode(gc.code);
    setAmount(gc.amount.toString());
    setMaxUsage(gc.maxUsage.toString());
    setDurationDays(gc.durationDays ? gc.durationDays.toString() : '30');
  };

  const cancelEdit = () => {
    setEditingId(null);
    setCode('');
    setAmount('');
    setMaxUsage('1');
    setDurationDays('30');
  };

  const handleSaveReferralSettings = () => {
    if (settings && onSaveSettings) {
      onSaveSettings({
        ...settings,
        botTelegramHandle,
        referralRewardAmount: referralRewardAmount === '' ? 0 : referralRewardAmount,
        referralRewardPercent: referralRewardPercent === '' ? 0 : referralRewardPercent,
        referralPurchasePercent: referralPurchasePercent === '' ? 0 : referralPurchasePercent,
        referralL2Percent: referralL2Percent === '' ? 0 : referralL2Percent,
        referralL3Percent: referralL3Percent === '' ? 0 : referralL3Percent,
        referralL4Percent: referralL4Percent === '' ? 0 : referralL4Percent,
        referralRewardCondition,
        referralBaseAmount: calculationAmount === '' ? 0 : calculationAmount,
        deductReferralOnLeave,
        referralMessage
      });
      setSavedSettings(true);
      setTimeout(() => setSavedSettings(false), 3000);
    }
  };

  const handlePromoSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!promoCode || !promoValue || !promoMaxUsage) return;

    if (onAddPromoCode) {
      onAddPromoCode(
        promoCode.toUpperCase().trim(),
        promoType,
        parseFloat(promoValue),
        parseInt(promoMaxUsage, 10),
        promoDurationDays ? parseInt(promoDurationDays, 10) : undefined,
        promoAllowedServerIds.length > 0 ? promoAllowedServerIds : undefined,
        promoIsActive
      );
    }

    setPromoCode("");
    setPromoValue("");
    setPromoMaxUsage("50");
    setPromoDurationDays("30");
    setPromoAllowedServerIds([]);
    setPromoIsActive(true);

    setPromoSuccess(true);
    setTimeout(() => setPromoSuccess(false), 3000);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4 mb-6">
        <div className="flex items-center space-x-3 space-x-reverse">
          <div className="p-3 bg-purple-500/10 rounded-xl">
            <Gift className="w-6 h-6 text-purple-400" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">
              {translateText('Financial Codes & Referrals Manager', '🎟️ مدیریت هوشمند کدهای مالی و معرف', lang)}
            </h2>
            <p className="text-sm text-gray-400">
              {translateText('Edit gift balances, percentage discounts, and reward triggers', 'ساخت و ویرایش کدهای افزایش شارژ مستقیم هدیه، درصدهای تخفیف و سیستم معرف', lang)}
            </p>
          </div>
        </div>

        {/* Dynamic Nav Sub-tabs */}
        <div className="flex bg-[#111827] border border-[#1f2937] p-1 rounded-xl">
          <button
            onClick={() => setManagerTab('gift_codes')}
            className={`px-4 py-2 rounded-lg text-xs font-semibold cursor-pointer transition ${
              managerTab === 'gift_codes'
                ? 'bg-purple-600 text-white shadow'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            {translateText('Gift Cards', '🎁 کدهای هدیه (افزایش اعتبار)', lang)}
          </button>
          <button
            onClick={() => setManagerTab('promo_codes')}
            className={`px-4 py-2 rounded-lg text-xs font-semibold cursor-pointer transition ${
              managerTab === 'promo_codes'
                ? 'bg-indigo-600 text-white shadow'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            {translateText('Promo Codes', '🎟️ کدهای تخفیف (درصدی و تمدید)', lang)}
          </button>
          <button
            onClick={() => setManagerTab('referrals')}
            className={`px-4 py-2 rounded-lg text-xs font-semibold cursor-pointer transition ${
              managerTab === 'referrals'
                ? 'bg-blue-600 text-white shadow'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            {translateText('Referrals', '👥 سیستم زیرمجموعه‌گیری', lang)}
          </button>
        </div>
      </div>

      {managerTab === 'gift_codes' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fadeIn">
          {/* Gift Codes Panel */}
          <div className="lg:col-span-1 bg-slate-800/50 backdrop-blur-md rounded-2xl p-6 border border-slate-700/50 space-y-6">
            <div className="flex items-center gap-2 border-b border-gray-700 pb-2">
              <Gift className="w-5 h-5 text-purple-400" />
              <h3 className="text-sm font-semibold text-white">{translateText('Add New Gift Code', 'افزودن کد هدیه جدید', lang)}</h3>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-300">{translateText('Gift Code', 'کد هدیه', lang)}</label>
                <input
                  type="text"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  className="w-full bg-slate-900/50 border border-slate-700 rounded-xl px-4 py-2.5 text-white focus:ring-2 focus:ring-purple-500 transition-all text-left dir-ltr font-bold uppercase"
                  placeholder="e.g. VIP2024"
                  required
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-300">{translateText(`Amount (${currency})`, `مبلغ (${currency})`, lang)}</label>
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-full bg-slate-900/50 border border-slate-700 rounded-xl px-4 py-2.5 text-white focus:ring-2 focus:ring-purple-500 transition-all text-left dir-ltr"
                  placeholder="50000"
                  required
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-300">{translateText('Max Usage', 'تعداد مجاز استفاده', lang)}</label>
                <input
                  type="number"
                  value={maxUsage}
                  onChange={(e) => setMaxUsage(e.target.value)}
                  className="w-full bg-slate-900/50 border border-slate-700 rounded-xl px-4 py-2.5 text-white focus:ring-2 focus:ring-purple-500 transition-all text-left dir-ltr"
                  min="1"
                  required
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-300">
                  {translateText('Code Validity (Days)', 'مدت اعتبار کد (تعداد روز)', lang)}
                </label>
                <input
                  type="number"
                  value={durationDays}
                  onChange={(e) => setDurationDays(e.target.value)}
                  className="w-full bg-slate-900/50 border border-slate-700 rounded-xl px-4 py-2.5 text-white focus:ring-2 focus:ring-purple-500 transition-all text-left dir-ltr"
                  placeholder="30"
                  min="1"
                  required
                />
                <p className="text-[10px] text-gray-400">
                  {translateText("e.g. 1 day. Expire after 1 day from creation.", "مثلاً ۱ روز؛ پس از گذشت ۱ روز از ساخت، کد هدیه منقضی و غیرقابل استفاده می‌شود.", lang)}
                </p>
              </div>
              <div className="flex gap-2 pt-2">
                {editingId && (
                  <button
                    type="button"
                    onClick={cancelEdit}
                    className="w-14 items-center justify-center flex bg-slate-700 hover:bg-slate-600 text-white rounded-xl px-2 py-2.5 transition-all"
                    title="لغو ویرایش"
                  >
                    <X className="w-5 h-5" />
                  </button>
                )}
                <button
                  type="submit"
                  className={`flex-1 ${editingId ? 'bg-emerald-500 hover:bg-emerald-600' : 'bg-purple-500 hover:bg-purple-600'} text-white rounded-xl px-4 py-2.5 font-medium transition-all flex items-center justify-center space-x-2 space-x-reverse cursor-pointer`}
                >
                  {editingId ? <Check className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
                  <span>{editingId ? (translateText('Save Changes', 'ذخیره تغییرات', lang)) : (translateText('Create Code', 'ایجاد کد هدیه', lang))}</span>
                </button>
              </div>
            </form>
          </div>

          {/* Registered Gift Codes List (Right/2 cols) */}
          <div className="lg:col-span-2 bg-slate-800/50 backdrop-blur-md rounded-2xl p-6 border border-slate-700/50 flex flex-col h-full">
            <div className="flex items-center gap-2 border-b border-gray-700 pb-3 mb-4">
              <Gift className="w-5 h-5 text-purple-400" />
              <h3 className="text-sm font-semibold text-white">{translateText('Registered Gift Codes', 'کدهای هدیه فعال ثبت شده', lang)}</h3>
            </div>
            <div className="overflow-x-auto overflow-y-auto max-h-[440px] custom-scrollbar">
              <table className="w-full text-right text-slate-300">
                <thead className="bg-slate-900/50 text-slate-400 text-sm">
                  <tr>
                    <th className="px-6 py-4 font-medium">کد هدیه</th>
                    <th className="px-6 py-4 font-medium">مبلغ شارژ</th>
                    <th className="px-6 py-4 font-medium">وضعیت استفاده</th>
                    <th className="px-6 py-4 font-medium">مدت اعتبار</th>
                    <th className="px-6 py-4 font-medium">تاریخ ایجاد</th>
                    <th className="px-6 py-4 font-medium text-center">عملیات</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-700/50">
                  {giftCodes && giftCodes.map((gc) => (
                    <tr key={gc.id} className="hover:bg-slate-700/20 transition-colors">
                      <td className="px-6 py-4">
                        <span className="font-mono text-purple-400 bg-purple-400/10 px-2 py-1 rounded-lg">
                          {gc.code}
                        </span>
                      </td>
                      <td className="px-6 py-4 font-medium text-emerald-400">
                        {gc.amount.toLocaleString()} تومان
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-2 space-x-reverse">
                          <Users className="w-4 h-4 text-slate-500" />
                          <span className="text-sm">
                            {gc.totalUsage} / {gc.maxUsage}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-amber-400">
                        {gc.durationDays ? `${gc.durationDays} روز` : 'بدون انقضا'}
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-400">
                        {formatDateTime(gc.createdAt, { timeZone: settings?.timeZone, calendarSystem: settings?.calendarSystem, includeTime: false })}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex justify-center items-center space-x-2 space-x-reverse">
                          <button
                            onClick={() => handleEdit(gc)}
                            className="p-2 bg-blue-500/10 text-blue-400 hover:bg-blue-500 hover:text-white rounded-lg transition-all"
                            title="ویرایش کد"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => setDeleteConfirmConfig({
                              isOpen: true,
                              action: () => onDeleteCode(gc.id),
                              message: translateText("Are you sure you want to delete this gift code?", "آیا از حذف این کدهدیه اطمینان دارید؟", lang)
                            })}
                            className="p-2 bg-rose-500/10 text-rose-400 hover:bg-rose-500 hover:text-white rounded-lg transition-all"
                            title="حذف کد"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {(!giftCodes || giftCodes.length === 0) && (
                    <tr>
                      <td colSpan={5} className="px-6 py-12 text-center text-slate-500">
                        هیچ کد هدیه‌ای ایجاد نشده است
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {managerTab === 'promo_codes' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fadeIn">
          {/* Create Code Form */}
          <div className="bg-slate-800/50 backdrop-blur-md rounded-2xl p-6 border border-slate-700/50 h-fit space-y-4">
            <h3 className="text-sm font-semibold text-white mb-2 flex items-center gap-2 border-b border-gray-700 pb-2">
              <Plus className="w-4 h-4 text-indigo-400" />
              {translateText("Create New Discount Code", "ثبت کد تخفیف جدید", lang)}
            </h3>

            <form onSubmit={handlePromoSubmit} className="space-y-4">
              <div>
                <label className="block text-xs text-gray-400 font-semibold mb-1.5">
                  {translateText("🏷️ Promo Code", "🏷️ کد تخفیف", lang)}
                </label>
                <input
                  type="text"
                  required
                  value={promoCode}
                  onChange={(e) => setPromoCode(e.target.value)}
                  placeholder="DALTOON20"
                  className="w-full bg-[#161c2a] border border-gray-700/80 rounded-xl p-3 text-xs text-white focus:outline-none focus:ring-1 focus:ring-indigo-500 font-bold tracking-wider text-center text-left dir-ltr uppercase"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-gray-400 font-semibold mb-1.5">
                    {translateText("⚙️ Code Type", "⚙️ نوع کد", lang)}
                  </label>
                  <select
                    value={promoType}
                    onChange={(e) => setPromoType(e.target.value as "percent" | "extend_days" | "fixed_amount")}
                    className="w-full bg-[#161c2a] border border-gray-700/50 rounded-xl p-3 text-xs text-white focus:outline-none focus:ring-1 focus:ring-indigo-500 font-medium cursor-pointer"
                  >
                    <option value="percent">{translateText("Percentage (%)", "درصدی (%)", lang)}</option>
                    <option value="fixed_amount">{translateText(`Amount (${currency})`, `مبلغی (${currency})`, lang)}</option>
                    <option value="extend_days">{translateText("Extension (Days)", "تمدید (روز)", lang)}</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs text-gray-400 font-semibold mb-1.5">
                    {promoType === "percent" ? (translateText("Discount %", "📈 درصد تخفیف", lang)) : promoType === "fixed_amount" ? (translateText("Discount Amount", "💰 مبلغ تخفیف", lang)) : (translateText("Extend Days", "📅 تعداد روز", lang))}
                  </label>
                  <input
                    type="number"
                    required
                    min={1}
                    max={promoType === "percent" ? 100 : 10000000}
                    value={promoValue}
                    onChange={(e) => setPromoValue(e.target.value)}
                    placeholder={promoType === "percent" ? "20" : promoType === "fixed_amount" ? "50000" : "5"}
                    className="w-full bg-[#161c2a] border border-gray-700/50 rounded-xl p-3 text-xs text-white focus:outline-none focus:ring-1 focus:ring-indigo-500 text-center font-bold"
                  />
                </div>
              </div>

              {promoType !== "extend_days" && (
                <div className="pt-2 border-t border-gray-800/30">
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-[10px] text-indigo-400 font-bold uppercase tracking-wider flex items-center gap-1">
                      <RefreshCw className="w-3 h-3 animate-spin-slow" />
                      {translateText("🧮 Smart Value Calculator", "🧮 محاسبه‌گر هوشمند ارزش نهایی", lang)}
                    </label>
                  </div>
                  
                  <div className="bg-[#090d16] border border-gray-800/80 rounded-xl p-3 space-y-3 shadow-inner">
                    <div>
                      <span className="block text-[9px] text-gray-500 mb-1">{translateText("Test Base Amount (TOM):", "مبلغ پایه جهت تست محاسبات (تومان):", lang)}</span>
                      <input
                        type="text"
                        placeholder="100,000"
                        value={Number(calcBasePrice || 0).toLocaleString()}
                        onChange={(e) => {
                          const val = e.target.value.replace(/,/g, "");
                          if (!isNaN(Number(val))) setCalcBasePrice(val);
                        }}
                        className="w-full bg-[#111827] border border-gray-700/50 rounded-lg p-2 text-sm text-indigo-300 focus:outline-none focus:ring-1 focus:ring-indigo-500 font-mono text-center font-bold"
                      />
                    </div>

                    {calcBasePrice && promoValue && (
                      <div className="grid grid-cols-2 gap-2 pt-1">
                        <div className="bg-amber-500/5 border border-amber-500/20 rounded-lg p-2 flex flex-col items-center">
                          <span className="text-[9px] text-amber-500 font-medium uppercase tracking-tighter">{translateText("Client Profit", "سود مشتری", lang)}</span>
                          <span className="text-amber-400 font-extrabold text-sm font-mono mt-0.5">
                            {promoType === "percent" 
                              ? Math.round((Number(calcBasePrice) * Number(promoValue)) / 100).toLocaleString()
                              : Number(promoValue).toLocaleString()
                            }
                          </span>
                        </div>
                        <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-lg p-2 flex flex-col items-center">
                          <span className="text-[9px] text-emerald-500 font-medium uppercase tracking-tighter">{translateText("Final Price", "پرداختی نهایی", lang)}</span>
                          <span className="text-emerald-400 font-extrabold text-sm font-mono mt-0.5">
                            {promoType === "percent"
                              ? (Number(calcBasePrice) - Math.round((Number(calcBasePrice) * Number(promoValue)) / 100)).toLocaleString()
                              : (Number(calcBasePrice) - Number(promoValue)).toLocaleString()
                            }
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              <div>
                <label className="block text-xs text-gray-400 font-semibold mb-1.5">
                  {translateText("👥 Limit Users Count", "👥 حداکثر استفاده مجاز", lang)}
                </label>
                <input
                  type="number"
                  required
                  min={1}
                  value={promoMaxUsage}
                  onChange={(e) => setPromoMaxUsage(e.target.value)}
                  placeholder="50"
                  className="w-full bg-[#161c2a] border border-gray-700/50 rounded-xl p-3 text-xs text-white focus:outline-none focus:ring-1 focus:ring-indigo-500 text-center font-semibold"
                />
              </div>

              <div>
                <label className="block text-xs text-gray-400 font-semibold mb-1.5">
                  {translateText("⏳ Code Validity (Days)", "⏳ مدت اعتبار کد (تعداد روز)", lang)}
                </label>
                <input
                  type="number"
                  required
                  min={1}
                  value={promoDurationDays}
                  onChange={(e) => setPromoDurationDays(e.target.value)}
                  placeholder="30"
                  className="w-full bg-[#161c2a] border border-gray-700/50 rounded-xl p-3 text-xs text-white focus:outline-none focus:ring-1 focus:ring-indigo-500 text-center font-semibold"
                />
                <p className="text-[10px] text-gray-500 mt-1">
                  {translateText("e.g. 1 day. Automatically expires exactly 24 hours after creation.", "مثلاً ۱ روز؛ دقیقاً ۲۴ ساعت پس از ساخت، کد به صورت خودکار منقضی و غیرقابل استفاده می‌شود.", lang)}
                </p>
              </div>

              {/* Server Selection Section */}
              <div className="space-y-2 pt-1 border-t border-gray-800/50">
                <div className="flex items-center justify-between">
                  <label className="block text-xs text-gray-300 font-semibold flex items-center gap-1.5">
                    <span>🖥️</span>
                    <span>{translateText("Allowed Servers", "سرورهای مجاز کد تخفیف", lang)}</span>
                  </label>
                  {servers && servers.length > 0 && (
                    <button
                      type="button"
                      onClick={() => {
                        if (promoAllowedServerIds.length === servers.length) {
                          setPromoAllowedServerIds([]);
                        } else {
                          setPromoAllowedServerIds(servers.map((s) => String(s.id)));
                        }
                      }}
                      className="text-[10px] text-indigo-400 hover:text-indigo-300 transition cursor-pointer font-semibold"
                    >
                      {promoAllowedServerIds.length === servers.length
                        ? translateText("Deselect All", "عدم انتخاب همه", lang)
                        : translateText("Select All", "انتخاب همه", lang)}
                    </button>
                  )}
                </div>

                {(!servers || servers.length === 0) ? (
                  <div className="text-[11px] text-gray-500 bg-[#161c2a] p-2.5 rounded-xl border border-gray-800 text-center">
                    {translateText("No servers found. Promo code will apply to all servers.", "سروری یافت نشد؛ تخفیف روی تمامی سرورها اعمال می‌شود.", lang)}
                  </div>
                ) : (
                  <div className="bg-[#121824] border border-gray-800 rounded-xl p-3 space-y-2 max-h-48 overflow-y-auto">
                    <p className="text-[10px] text-gray-400 mb-1">
                      {promoAllowedServerIds.length === 0
                        ? translateText("⚡ No server checked = Applicable on ALL servers", "⚡ هیچ سروری تیک نخورده = اعمال روی تمامی سرورها", lang)
                        : translateText(`Selected ${promoAllowedServerIds.length} server(s)`, `تعداد ${promoAllowedServerIds.length} سرور انتخاب شد (کد فقط روی این سرورها فعال است)`, lang)}
                    </p>
                    <div className="grid grid-cols-1 gap-1.5">
                      {servers.map((srv) => {
                        const srvIdStr = String(srv.id);
                        const isChecked = promoAllowedServerIds.includes(srvIdStr);
                        const srvName = srv.name || srv.remark || srv.title || `سرور ${srv.id}`;
                        return (
                          <label
                            key={srv.id}
                            className={`flex items-center justify-between p-2 rounded-lg cursor-pointer transition text-xs ${
                              isChecked
                                ? "bg-indigo-600/25 border border-indigo-500/50 text-indigo-200 font-semibold"
                                : "bg-[#161c2a] border border-gray-800 text-gray-400 hover:text-gray-200"
                            }`}
                          >
                            <div className="flex items-center gap-2 overflow-hidden">
                              <input
                                type="checkbox"
                                checked={isChecked}
                                onChange={(e) => {
                                  if (e.target.checked) {
                                    setPromoAllowedServerIds((prev) => [...prev, srvIdStr]);
                                  } else {
                                    setPromoAllowedServerIds((prev) => prev.filter((id) => id !== srvIdStr));
                                  }
                                }}
                                className="rounded border-gray-700 text-indigo-600 focus:ring-indigo-500 w-3.5 h-3.5 cursor-pointer"
                              />
                              <span className="truncate">{srvName}</span>
                            </div>
                            <span className="text-[9px] text-gray-500 dir-ltr font-mono">{srv.type || "v2ray"}</span>
                          </label>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>

              {/* Active / Inactive Status Switch */}
              <div className="bg-[#121824] border border-gray-800 rounded-xl p-3 flex items-center justify-between">
                <div>
                  <span className="text-xs text-gray-300 font-semibold block">
                    {translateText("Initial Status", "وضعیت اولیه کد تخفیف", lang)}
                  </span>
                  <span className="text-[10px] text-gray-500 block mt-0.5">
                    {promoIsActive 
                      ? translateText("Code is active and ready to use", "کد فعال و آماده استفاده در ربات و مینی‌اپ است", lang)
                      : translateText("Code is disabled upon creation", "کد به صورت غیرفعال ساخته می‌شود", lang)}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setPromoIsActive(!promoIsActive)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none cursor-pointer ${
                    promoIsActive ? 'bg-emerald-600' : 'bg-gray-700'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      promoIsActive ? (isFa ? '-translate-x-6' : 'translate-x-6') : (isFa ? '-translate-x-1' : 'translate-x-1')
                    }`}
                  />
                </button>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl py-3 text-xs font-bold transition duration-200 cursor-pointer shadow-lg shadow-indigo-600/10 flex items-center justify-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  {translateText("Generate Promo Code", "ایجاد و ذخیره کد تخفیف", lang)}
                </button>
              </div>

              {promoSuccess && (
                <div className="text-center text-xs text-emerald-400 font-bold bg-emerald-500/10 py-2.5 rounded-xl border border-emerald-500/20">
                  {translateText("✅ Discount code registered!", "✅ کد تخفیف با موفقیت ثبت شد!", lang)}
                </div>
              )}
            </form>
          </div>

          {/* List of Registered Promo Codes */}
          <div className="lg:col-span-2 bg-slate-800/50 backdrop-blur-md rounded-2xl p-6 border border-slate-700/50 flex flex-col h-fit">
            <h3 className="text-sm font-semibold text-white mb-4 flex items-center gap-2 border-b border-gray-700 pb-3">
              <Tag className="w-4 h-4 text-indigo-400" />
              {translateText("Active Promo Codes", "لیست کدهای تخفیف و تمدید", lang)}
            </h3>

            {!promoCodes || promoCodes.length === 0 ? (
              <div className="text-center py-12 text-gray-500 text-xs">
                {translateText("No promo codes registered.", "هیچ کد تخفیف یا تمدیدی در سیستم ثبت نشده است.", lang)}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {promoCodes.map((pc) => {
                  const createdTime = pc.createdAt ? new Date(pc.createdAt).getTime() : NaN;
                  const isDurationExpired = !isNaN(createdTime) && pc.durationDays && pc.durationDays > 0 
                    ? (Date.now() > createdTime + pc.durationDays * 86400000) 
                    : false;
                  const isDateExpired = pc.expireDate ? new Date(pc.expireDate).getTime() < Date.now() : false;
                  const isExpired = isDurationExpired || isDateExpired;
                  const isActive = pc.isActive !== false;
                  const isCapacityFull = pc.totalUsage >= pc.maxUsage;

                  let timeRemainingText = "";
                  if (pc.durationDays && pc.durationDays > 0 && !isNaN(createdTime)) {
                    const expireAtMs = createdTime + pc.durationDays * 86400000;
                    const diffMs = expireAtMs - Date.now();
                    if (diffMs <= 0) {
                      timeRemainingText = translateText("Expired", "منقضی شده", lang);
                    } else {
                      const hours = Math.floor(diffMs / 3600000);
                      const days = Math.floor(hours / 24);
                      if (days >= 1) {
                        timeRemainingText = `${days} ` + translateText("days left", "روز مانده", lang);
                      } else if (hours >= 1) {
                        timeRemainingText = `${hours} ` + translateText("hours left", "ساعت مانده", lang);
                      } else {
                        const mins = Math.max(1, Math.floor(diffMs / 60000));
                        timeRemainingText = `${mins} ` + translateText("mins left", "دقیقه مانده", lang);
                      }
                    }
                  } else {
                    timeRemainingText = translateText("No Expiry", "بدون انقضا", lang);
                  }

                  return (
                    <div
                      key={pc.id}
                      className={`bg-[#121824] border rounded-xl p-4 flex flex-col justify-between transition ${
                        !isActive 
                          ? 'border-red-900/40 opacity-75' 
                          : isExpired 
                            ? 'border-amber-900/40 opacity-80' 
                            : 'border-gray-800 hover:border-gray-700'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="inline-block bg-indigo-600/20 text-indigo-300 font-mono font-extrabold text-sm px-2.5 py-1 rounded-lg tracking-wider">
                              {pc.code}
                            </span>
                            
                            {/* Status Badge */}
                            {!isActive ? (
                              <span className="text-[10px] bg-rose-500/15 text-rose-400 border border-rose-500/30 px-2 py-0.5 rounded-full font-bold flex items-center gap-1">
                                <span className="w-1.5 h-1.5 rounded-full bg-rose-500"></span>
                                {translateText("Inactive", "غیرفعال", lang)}
                              </span>
                            ) : isExpired ? (
                              <span className="text-[10px] bg-amber-500/15 text-amber-400 border border-amber-500/30 px-2 py-0.5 rounded-full font-bold flex items-center gap-1">
                                <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
                                {translateText("Expired", "منقضی شده", lang)}
                              </span>
                            ) : isCapacityFull ? (
                              <span className="text-[10px] bg-orange-500/15 text-orange-400 border border-orange-500/30 px-2 py-0.5 rounded-full font-bold flex items-center gap-1">
                                <span className="w-1.5 h-1.5 rounded-full bg-orange-500"></span>
                                {translateText("Capacity Full", "تکمیل ظرفیت", lang)}
                              </span>
                            ) : (
                              <span className="text-[10px] bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 px-2 py-0.5 rounded-full font-bold flex items-center gap-1">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                                {translateText("Active", "فعال", lang)}
                              </span>
                            )}
                          </div>

                          <div className="mt-2.5 flex items-center gap-1.5 text-xs text-gray-300">
                            {pc.type === "percent" ? (
                              <>
                                <Percent className="w-3.5 h-3.5 text-amber-500" />
                                <span>{`${pc.value}` + translateText("% Discount", "٪ تخفیف", lang)}</span>
                              </>
                            ) : pc.type === "fixed_amount" ? (
                              <>
                                <Tag className="w-3.5 h-3.5 text-blue-400" />
                                <span>{`${pc.value.toLocaleString()} ${currency} ` + translateText("Discount", "تخفیف", lang)}</span>
                              </>
                            ) : (
                              <>
                                <Clock className="w-3.5 h-3.5 text-emerald-400" />
                                <span>
                                  {`${pc.value} ` + translateText("days extension", "روز تمدید رایگان", lang)}
                                </span>
                              </>
                            )}
                          </div>
                        </div>

                        {/* Actions: Toggle Active Switch & Delete */}
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            title={isActive ? translateText("Deactivate Promo Code", "غیرفعال کردن کد", lang) : translateText("Activate Promo Code", "فعال کردن کد", lang)}
                            onClick={() => {
                              if (onEditPromoCode) {
                                onEditPromoCode(
                                  pc.id,
                                  pc.code,
                                  pc.type,
                                  pc.value,
                                  pc.maxUsage,
                                  pc.durationDays,
                                  pc.allowedServerIds,
                                  !isActive
                                );
                              }
                            }}
                            className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors focus:outline-none cursor-pointer ${
                              isActive ? 'bg-emerald-600' : 'bg-gray-700'
                            }`}
                          >
                            <span
                              className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform ${
                                isActive ? (isFa ? '-translate-x-4' : 'translate-x-4') : (isFa ? '-translate-x-1' : 'translate-x-1')
                              }`}
                            />
                          </button>

                          <button
                            onClick={() => onDeletePromoCode && setDeleteConfirmConfig({
                              isOpen: true,
                              action: () => onDeletePromoCode(pc.id),
                              message: translateText("Are you sure you want to delete this promo code?", "آیا از حذف این تخفیف اطمینان دارید؟", lang)
                            })}
                            className="p-1 px-2 rounded-lg bg-red-500/10 hover:bg-red-500 text-red-400 hover:text-white transition duration-150 cursor-pointer border border-red-500/20"
                            title={translateText("Delete", "حذف", lang)}
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      <div className="mt-4 pt-3 border-t border-gray-800 flex items-center justify-between text-[11px] text-gray-400">
                        <div>
                          {translateText("Used:", "دفعات استفاده:", lang)}{" "}
                          <span className="font-semibold text-white font-mono">
                            {pc.totalUsage}
                          </span>{" "}
                          / <span className="text-gray-400">{pc.maxUsage}</span>
                          <div className={`text-[10px] mt-1 font-medium ${isExpired ? 'text-rose-400 font-bold' : 'text-amber-400'}`}>
                            {translateText("Validity:", "اعتبار:", lang)} {pc.durationDays ? `${pc.durationDays} روز (${timeRemainingText})` : translateText("Unlimited", "نامحدود", lang)}
                          </div>
                          <div className="mt-2 text-[10px] text-gray-400 flex items-center gap-1 flex-wrap">
                            <span className="text-gray-500 font-medium">{translateText("Servers:", "سرورهای مجاز:", lang)}</span>
                            {(!pc.allowedServerIds || pc.allowedServerIds.length === 0) ? (
                              <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-1.5 py-0.5 rounded font-semibold">
                                {translateText("All Servers", "همه سرورها", lang)}
                              </span>
                            ) : (
                              pc.allowedServerIds.map((sId: string) => {
                                const matchedSrv = (servers || []).find((srv: any) => String(srv.id) === String(sId));
                                const name = matchedSrv ? (matchedSrv.name || matchedSrv.remark || matchedSrv.id) : `سرور ${sId}`;
                                return (
                                  <span key={sId} className="bg-indigo-500/15 text-indigo-300 border border-indigo-500/30 px-1.5 py-0.5 rounded font-semibold">
                                    {name}
                                  </span>
                                );
                              })
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-1 text-right">
                          <Calendar className="w-3.5 h-3.5 text-gray-500" />
                          <span className="font-mono text-gray-500 text-[10px]">
                            {formatDateTime(pc.createdAt, { timeZone: settings?.timeZone, calendarSystem: settings?.calendarSystem, includeTime: false })}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {managerTab === 'referrals' && (
        <div className="bg-slate-800/40 backdrop-blur-md rounded-2xl border border-slate-700/50 overflow-hidden transition-all duration-300 p-6 animate-fadeIn space-y-6">
          <div className="border-b border-slate-700/50 pb-4">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Users className="w-5 h-5 text-indigo-400" />
              {isFa ? `👥 تنظیمات اختصاصی سیستم زیرمجموعه‌گیری (سیستم معرف ${settings?.botNickname || 'دالتون'})` : '👥 Dedicated Referral System'}
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              {isFa 
                ? 'در این بخش می‌توانید درصد پاداش زیرمجموعه‌گیری، مبلغ پایه، آیدی ربات متصل و متن پیام معرفی را تنظیم کنید.'
                : 'Configure your referral reward percentage, base amount calculation, and real-time custom message templates.'}
            </p>
          </div>

          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-300">{translateText('Bot Telegram Username (No @)', 'آیدی ربات شما (بدون @)', lang)}</label>
                <input
                  type="text"
                  value={botTelegramHandle}
                  onChange={(e) => setBotTelegramHandle(e.target.value)}
                  className="w-full bg-slate-900/50 border border-slate-700 rounded-xl px-4 py-2.5 text-white focus:ring-2 focus:ring-indigo-500 transition-all text-left dir-ltr"
                  placeholder="DaltoonVPN_bot"
                />
              </div>
              
              <div className="space-y-4 pt-2 pb-2 lg:col-span-3">
                <label className="text-sm font-medium text-gray-300">{translateText('Reward Condition', 'زمان پاداش‌دهی (تب انتخاب)', lang)}</label>
                <div className="flex bg-slate-900/50 p-1 rounded-xl border border-slate-700 w-full overflow-hidden">
                  <button
                    onClick={() => setReferralRewardCondition('invite')}
                    className={`flex-1 py-2.5 text-sm font-semibold rounded-lg transition-all ${referralRewardCondition === 'invite' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-400 hover:text-white'}`}
                  >
                    {translateText('On Invite Only', 'فقط هنگام ورود (Invite)', lang)}
                  </button>
                  <button
                    onClick={() => setReferralRewardCondition('purchase')}
                    className={`flex-1 py-2.5 text-sm font-semibold rounded-lg transition-all ${referralRewardCondition === 'purchase' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-400 hover:text-white'}`}
                  >
                    {translateText('On Purchase Only', 'فقط هنگام خرید (Purchase)', lang)}
                  </button>
                  <button
                    onClick={() => setReferralRewardCondition('both')}
                    className={`flex-1 py-2.5 text-sm font-semibold rounded-lg transition-all ${referralRewardCondition === 'both' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-400 hover:text-white'}`}
                  >
                    {translateText('Both', 'هر دو (هم ورود هم خرید)', lang)}
                  </button>
                </div>
              </div>

              <div className="space-y-4">
                {(referralRewardCondition === 'invite' || referralRewardCondition === 'both') && (
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-300">{translateText('Reward Percentage per Invite', 'درصد پاداش به ازای دعوت (%)', lang)}</label>
                    <div className="relative">
                      <input
                        type="number"
                        value={referralRewardPercent}
                        onChange={(e) => setReferralRewardPercent(e.target.value === '' ? '' : Number(e.target.value))}
                        className="w-full bg-slate-900/50 border border-slate-700 rounded-xl px-4 py-2.5 text-white focus:ring-2 focus:ring-indigo-505 transition-all text-left dir-ltr pr-8"
                        placeholder="3"
                        min="0"
                        max="100"
                      />
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 select-none">%</span>
                    </div>
                  </div>
                )}
                
                {(referralRewardCondition === 'purchase' || referralRewardCondition === 'both') && (
                  <div className="space-y-2 bg-indigo-950/20 p-4 rounded-xl border border-indigo-500/20">
                    <label className="text-sm font-medium text-indigo-300">{translateText('Reward Percentage per Purchase', 'درصد پاداش به ازای خرید زیرمجموعه (%)', lang)}</label>
                    <div className="relative">
                      <input
                        type="number"
                        value={referralPurchasePercent}
                        onChange={(e) => setReferralPurchasePercent(e.target.value === '' ? '' : Number(e.target.value))}
                        className="w-full bg-slate-900/50 border border-indigo-700 rounded-xl px-4 py-2.5 text-white focus:ring-2 focus:ring-indigo-505 transition-all text-left dir-ltr pr-8"
                        placeholder="5"
                        min="0"
                        max="100"
                      />
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 select-none">%</span>
                    </div>
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-amber-300">{translateText('Level 2 Reward Percentage', 'درصد پاداش لایه دوم (تیم)', lang)}</label>
                <div className="relative">
                  <input
                    type="number"
                    value={referralL2Percent}
                    onChange={(e) => setReferralL2Percent(e.target.value === '' ? '' : Number(e.target.value))}
                    className="w-full bg-slate-900/50 border border-slate-700 rounded-xl px-4 py-2.5 text-amber-300 focus:ring-2 focus:ring-indigo-505 transition-all text-left dir-ltr pr-8"
                    placeholder="2"
                    min="0"
                    max="100"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-amber-400/50 select-none">%</span>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-blue-300">{translateText('Level 3 Reward Percentage', 'درصد پاداش لایه سوم (تیم)', lang)}</label>
                <div className="relative">
                  <input
                    type="number"
                    value={referralL3Percent}
                    onChange={(e) => setReferralL3Percent(e.target.value === '' ? '' : Number(e.target.value))}
                    className="w-full bg-slate-900/50 border border-slate-700 rounded-xl px-4 py-2.5 text-blue-300 focus:ring-2 focus:ring-indigo-505 transition-all text-left dir-ltr pr-8"
                    placeholder="1"
                    min="0"
                    max="100"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-blue-400/50 select-none">%</span>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-purple-300">{translateText('Level 4 Reward Percentage', 'درصد پاداش لایه چهارم (تیم)', lang)}</label>
                <div className="relative">
                  <input
                    type="number"
                    value={referralL4Percent}
                    onChange={(e) => setReferralL4Percent(e.target.value === '' ? '' : Number(e.target.value))}
                    className="w-full bg-slate-900/50 border border-slate-700 rounded-xl px-4 py-2.5 text-purple-300 focus:ring-2 focus:ring-indigo-505 transition-all text-left dir-ltr pr-8"
                    placeholder="0.5"
                    min="0"
                    max="100"
                    step="0.5"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-purple-400/50 select-none">%</span>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-300">{translateText('Base Calculation Amount', 'مبلغ پایه محاسبه (تومان)', lang)}</label>
                <div className="relative">
                  <input
                    type="number"
                    value={calculationAmount}
                    onChange={(e) => setCalculationAmount(e.target.value === '' ? '' : Number(e.target.value))}
                    className="w-full bg-slate-900/50 border border-slate-700 rounded-xl px-4 py-2.5 text-white focus:ring-2 focus:ring-indigo-506 transition-all text-left dir-ltr"
                    placeholder="100000"
                    min="0"
                  />
                </div>
              </div>
            </div>

            {/* Reward Calculation Preview */}
            <div className="bg-slate-900 border border-slate-700/50 rounded-xl p-4 flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-400 mb-1">
                  {translateText('Reward per Invite:', 'محاسبه پاداش مشتری به ازای هر دعوت جدید:', lang)}
                </p>
                <p className="text-xs text-emerald-400 font-semibold flex items-center gap-1.5">
                  <span className="bg-emerald-500/10 px-2 py-1 rounded text-emerald-300 font-mono text-xs">
                    {Math.max(0, Math.round(((calculationAmount || 0) as number * ((referralRewardPercent || 0) as number)) / 100)).toLocaleString()} 
                  </span>
                  <span>{translateText(`${currency}`, `${currency} پاداش`, lang)}</span>
                </p>
              </div>
              <div className="text-xs text-gray-400 bg-slate-800 px-3 py-1.5 rounded-lg border border-slate-700/60 font-mono">
                {Number(calculationAmount || 0).toLocaleString()} × {Number(referralRewardPercent || 0)}%
              </div>
            </div>

            {/* Deduct Referral Bonus On Bot Leave / Block */}
            <div className="bg-slate-900/60 border border-slate-700/70 rounded-xl p-4 flex items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold text-white">
                    {translateText('Deduct Reward on Bot Leave/Block', 'کسر پاداش در صورت لفت یا بلاک کردن ربات توسط زیرمجموعه', lang)}
                  </span>
                  <span className="text-[10px] bg-rose-500/10 text-rose-400 border border-rose-500/20 px-2 py-0.5 rounded-full font-medium">
                    {translateText('Anti-Abuse', 'ضد تقلب', lang)}
                  </span>
                </div>
                <p className="text-xs text-gray-400 leading-relaxed">
                  {translateText(
                    'If a referred user stops or blocks the bot, the referral invite reward will be automatically deducted from the referrer\'s wallet and a notification will be sent.',
                    'اگر کاربری که از طریق لینک زیرمجموعه‌گیری وارد شده ربات را متوقف یا بلاک کند، مبلغ پاداش دعوت به صورت خودکار از کیف پول معرف کسر شده و پیام اطلاع‌رسانی برای وی ارسال می‌گردد.',
                    lang
                  )}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setDeductReferralOnLeave(!deductReferralOnLeave)}
                className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                  deductReferralOnLeave ? 'bg-indigo-600' : 'bg-slate-700'
                }`}
              >
                <span
                  className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
                    deductReferralOnLeave ? (isFa ? '-translate-x-5' : 'translate-x-5') : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-gray-300">{translateText('Referral Message Content', 'متن پیام مجموعه گیری اختصاصی کاربر', lang)}</label>
                <span className="text-[10px] text-gray-400 bg-slate-950 px-2.5 py-1 rounded-lg border border-slate-800">
                  {translateText('Vars: {uid}, {link}, {amount}, {percent}, {purchase_percent}, {reward}, {invited}, {total_earned}', 'متغیرها: {uid}, {link}, {amount}, {percent}, {purchase_percent}, {reward}, {invited}, {total_earned}', lang)}
                </span>
              </div>
              <textarea
                value={referralMessage}
                onChange={(e) => setReferralMessage(e.target.value)}
                className="w-full bg-slate-900/50 border border-slate-700 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-indigo-500 transition-all text-sm leading-relaxed text-right font-sans"
                rows={8}
                placeholder={translateText('Enter your text here...', 'متن خود را اینجا وارد کنید...', lang)}
                dir="rtl"
              />
            </div>

            <div className="pt-2 flex items-center justify-between">
              <div className="text-xs text-emerald-400 font-semibold h-4 font-sans">
                {savedSettings && (translateText('✅ Referral settings saved!', '✅ تغییرات سیستم معرف با موفقیت ذخیره شد!', lang))}
              </div>
              <button
                type="button"
                onClick={handleSaveReferralSettings}
                className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl px-6 py-3 text-xs font-bold flex items-center gap-2 transition-all cursor-pointer shadow-lg shadow-indigo-600/20"
              >
                <Save className="w-4 h-4" />
                {isFa ? `ذخیره تنظیمات معرف ${settings?.botNickname || 'دالتون'}` : 'Save Referral Settings'}
              </button>
            </div>
          </div>
        </div>
      )}
      
      <ConfirmationModal
        isOpen={deleteConfirmConfig.isOpen}
        message={deleteConfirmConfig.message}
        lang={lang || 'fa'}
        isDangerous={true}
        onCancel={() => setDeleteConfirmConfig({ isOpen: false, action: null, message: "" })}
        onConfirm={() => {
          if (deleteConfirmConfig.action) {
            deleteConfirmConfig.action();
          }
          setDeleteConfirmConfig({ isOpen: false, action: null, message: "" });
        }}
      />
    </div>
  );
}
