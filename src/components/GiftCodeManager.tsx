import React, { useState } from 'react';
import { Gift, Trash2, Plus, Users, Edit2, Check, X, Share2, Save, Tag, Calendar, Percent, Clock, RefreshCw } from 'lucide-react';
import { GiftCode, PromoCode, PanelSettings } from '../types';
import { Language } from '../locales';
import ConfirmationModal from "./ConfirmationModal";

interface GiftCodeManagerProps {
  giftCodes: GiftCode[];
  onAddCode: (code: string, amount: number, maxUsage: number, durationDays?: number) => void;
  onDeleteCode: (id: string) => void;
  onEditCode?: (id: string, code: string, amount: number, maxUsage: number, durationDays?: number) => void;
  promoCodes?: PromoCode[];
  onAddPromoCode?: (code: string, type: "percent" | "extend_days" | "fixed_amount", value: number, maxUsage: number, durationDays?: number) => void;
  onDeletePromoCode?: (id: string) => void;
  settings?: PanelSettings;
  onSaveSettings?: (settings: PanelSettings) => void;
  lang?: Language;
}

export default function GiftCodeManager({ 
  giftCodes = [], 
  onAddCode, 
  onDeleteCode, 
  onEditCode,
  promoCodes = [],
  onAddPromoCode,
  onDeletePromoCode,
  settings,
  onSaveSettings,
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
        promoDurationDays ? parseInt(promoDurationDays, 10) : undefined
      );
    }

    setPromoCode("");
    setPromoValue("");
    setPromoMaxUsage("50");
    setPromoDurationDays("30");

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
              {isFa ? '🎟️ مدیریت هوشمند کدهای مالی و معرف' : 'Financial Codes & Referrals Manager'}
            </h2>
            <p className="text-sm text-gray-400">
              {isFa ? 'ساخت و ویرایش کدهای افزایش شارژ مستقیم هدیه، درصدهای تخفیف و سیستم معرف' : 'Edit gift balances, percentage discounts, and reward triggers'}
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
            {isFa ? '🎁 کدهای هدیه (افزایش اعتبار)' : 'Gift Cards'}
          </button>
          <button
            onClick={() => setManagerTab('promo_codes')}
            className={`px-4 py-2 rounded-lg text-xs font-semibold cursor-pointer transition ${
              managerTab === 'promo_codes'
                ? 'bg-indigo-600 text-white shadow'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            {isFa ? '🎟️ کدهای تخفیف (درصدی و تمدید)' : 'Promo Codes'}
          </button>
          <button
            onClick={() => setManagerTab('referrals')}
            className={`px-4 py-2 rounded-lg text-xs font-semibold cursor-pointer transition ${
              managerTab === 'referrals'
                ? 'bg-blue-600 text-white shadow'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            {isFa ? '👥 سیستم زیرمجموعه‌گیری' : 'Referrals'}
          </button>
        </div>
      </div>

      {managerTab === 'gift_codes' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fadeIn">
          {/* Gift Codes Panel */}
          <div className="lg:col-span-1 bg-slate-800/50 backdrop-blur-md rounded-2xl p-6 border border-slate-700/50 space-y-6">
            <div className="flex items-center gap-2 border-b border-gray-700 pb-2">
              <Gift className="w-5 h-5 text-purple-400" />
              <h3 className="text-sm font-semibold text-white">{isFa ? 'افزودن کد هدیه جدید' : 'Add New Gift Code'}</h3>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-300">{isFa ? 'کد هدیه' : 'Gift Code'}</label>
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
                <label className="text-sm font-medium text-gray-300">{isFa ? `مبلغ (${currency})` : `Amount (${currency})`}</label>
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
                <label className="text-sm font-medium text-gray-300">{isFa ? 'تعداد مجاز استفاده' : 'Max Usage'}</label>
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
                  {isFa ? 'مدت اعتبار کد (تعداد روز)' : 'Code Validity (Days)'}
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
                  {isFa ? "مثلاً ۱ روز؛ پس از گذشت ۱ روز از ساخت، کد هدیه منقضی و غیرقابل استفاده می‌شود." : "e.g. 1 day. Expire after 1 day from creation."}
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
                  <span>{editingId ? (isFa ? 'ذخیره تغییرات' : 'Save Changes') : (isFa ? 'ایجاد کد هدیه' : 'Create Code')}</span>
                </button>
              </div>
            </form>
          </div>

          {/* Registered Gift Codes List (Right/2 cols) */}
          <div className="lg:col-span-2 bg-slate-800/50 backdrop-blur-md rounded-2xl p-6 border border-slate-700/50 flex flex-col h-full">
            <div className="flex items-center gap-2 border-b border-gray-700 pb-3 mb-4">
              <Gift className="w-5 h-5 text-purple-400" />
              <h3 className="text-sm font-semibold text-white">{isFa ? 'کدهای هدیه فعال ثبت شده' : 'Registered Gift Codes'}</h3>
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
                        {new Date(gc.createdAt).toLocaleDateString('fa-IR')}
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
                              message: lang === "fa" ? "آیا از حذف این کدهدیه اطمینان دارید؟" : "Are you sure you want to delete this gift code?"
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
              {isFa ? "ثبت کد تخفیف جدید" : "Create New Discount Code"}
            </h3>

            <form onSubmit={handlePromoSubmit} className="space-y-4">
              <div>
                <label className="block text-xs text-gray-400 font-semibold mb-1.5">
                  {isFa ? "🏷️ کد تخفیف" : "🏷️ Promo Code"}
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
                    {isFa ? "⚙️ نوع کد" : "⚙️ Code Type"}
                  </label>
                  <select
                    value={promoType}
                    onChange={(e) => setPromoType(e.target.value as "percent" | "extend_days" | "fixed_amount")}
                    className="w-full bg-[#161c2a] border border-gray-700/50 rounded-xl p-3 text-xs text-white focus:outline-none focus:ring-1 focus:ring-indigo-500 font-medium cursor-pointer"
                  >
                    <option value="percent">{isFa ? "درصدی (%)" : "Percentage (%)"}</option>
                    <option value="fixed_amount">{isFa ? `مبلغی (${currency})` : `Amount (${currency})`}</option>
                    <option value="extend_days">{isFa ? "تمدید (روز)" : "Extension (Days)"}</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs text-gray-400 font-semibold mb-1.5">
                    {promoType === "percent" ? (isFa ? "📈 درصد تخفیف" : "Discount %") : promoType === "fixed_amount" ? (isFa ? "💰 مبلغ تخفیف" : "Discount Amount") : (isFa ? "📅 تعداد روز" : "Extend Days")}
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
                      {isFa ? "🧮 محاسبه‌گر هوشمند ارزش نهایی" : "🧮 Smart Value Calculator"}
                    </label>
                  </div>
                  
                  <div className="bg-[#090d16] border border-gray-800/80 rounded-xl p-3 space-y-3 shadow-inner">
                    <div>
                      <span className="block text-[9px] text-gray-500 mb-1">{isFa ? "مبلغ پایه جهت تست محاسبات (تومان):" : "Test Base Amount (TOM):"}</span>
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
                          <span className="text-[9px] text-amber-500 font-medium uppercase tracking-tighter">{isFa ? "سود مشتری" : "Client Profit"}</span>
                          <span className="text-amber-400 font-extrabold text-sm font-mono mt-0.5">
                            {promoType === "percent" 
                              ? Math.round((Number(calcBasePrice) * Number(promoValue)) / 100).toLocaleString()
                              : Number(promoValue).toLocaleString()
                            }
                          </span>
                        </div>
                        <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-lg p-2 flex flex-col items-center">
                          <span className="text-[9px] text-emerald-500 font-medium uppercase tracking-tighter">{isFa ? "پرداختی نهایی" : "Final Price"}</span>
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
                  {isFa ? "👥 حداکثر استفاده مجاز" : "👥 Limit Users Count"}
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
                  {isFa ? "⏳ مدت اعتبار کد (تعداد روز)" : "⏳ Code Validity (Days)"}
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
                  {isFa ? "مثلاً ۱ روز؛ پس از گذشت ۱ روز از ساخت، کد تخفیف منقضی و غیرقابل استفاده می‌شود." : "e.g. 1 day. Expire after 1 day from creation."}
                </p>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl py-3 text-xs font-bold transition duration-200 cursor-pointer shadow-lg shadow-indigo-600/10 flex items-center justify-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  {isFa ? "ایجاد و ذخیره کد تخفیف" : "Generate Promo Code"}
                </button>
              </div>

              {promoSuccess && (
                <div className="text-center text-xs text-emerald-400 font-bold bg-emerald-500/10 py-2.5 rounded-xl border border-emerald-500/20">
                  {isFa ? "✅ کد تخفیف با موفقیت ثبت شد!" : "✅ Discount code registered!"}
                </div>
              )}
            </form>
          </div>

          {/* List of Registered Promo Codes */}
          <div className="lg:col-span-2 bg-slate-800/50 backdrop-blur-md rounded-2xl p-6 border border-slate-700/50 flex flex-col h-fit">
            <h3 className="text-sm font-semibold text-white mb-4 flex items-center gap-2 border-b border-gray-700 pb-3">
              <Tag className="w-4 h-4 text-indigo-400" />
              {isFa ? "لیست کدهای تخفیف و تمدید فعال" : "Active Promo Codes"}
            </h3>

            {!promoCodes || promoCodes.length === 0 ? (
              <div className="text-center py-12 text-gray-500 text-xs">
                {isFa ? "هیچ کد تخفیف یا تمدیدی در سیستم ثبت نشده است." : "No promo codes active."}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {promoCodes.map((pc) => (
                  <div
                    key={pc.id}
                    className="bg-[#121824] border border-gray-800 rounded-xl p-4 flex flex-col justify-between hover:border-gray-700 transition"
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <span className="inline-block bg-indigo-600/20 text-indigo-300 font-mono font-extrabold text-sm px-2.5 py-1 rounded-lg tracking-wider">
                          {pc.code}
                        </span>
                        <div className="mt-2.5 flex items-center gap-1.5 text-xs text-gray-300">
                          {pc.type === "percent" ? (
                            <>
                              <Percent className="w-3.5 h-3.5 text-amber-500" />
                              <span>{isFa ? `${pc.value}٪ تخفیف` : `${pc.value}% Discount`}</span>
                            </>
                          ) : pc.type === "fixed_amount" ? (
                            <>
                              <Tag className="w-3.5 h-3.5 text-blue-400" />
                              <span>{isFa ? `${pc.value.toLocaleString()} ${currency} تخفیف` : `${pc.value.toLocaleString()} ${currency} Discount`}</span>
                            </>
                          ) : (
                            <>
                              <Clock className="w-3.5 h-3.5 text-emerald-400" />
                              <span>
                                {isFa ? `${pc.value} روز تمدید رایگان` : `${pc.value} days extension`}
                              </span>
                            </>
                          )}
                        </div>
                      </div>

                      <button
                        onClick={() => onDeletePromoCode && setDeleteConfirmConfig({
                          isOpen: true,
                          action: () => onDeletePromoCode(pc.id),
                          message: lang === "fa" ? "آیا از حذف این تخفیف اطمینان دارید؟" : "Are you sure you want to delete this promo code?"
                        })}
                        className="p-1 px-2 rounded-lg bg-red-500/10 hover:bg-red-500 text-red-400 hover:text-white transition duration-150 cursor-pointer border border-red-500/20"
                        title={isFa ? "حذف" : "Delete"}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <div className="mt-4 pt-3 border-t border-gray-800 flex items-center justify-between text-[11px] text-gray-400">
                      <div>
                        {isFa ? "دفعات استفاده:" : "Used:"}{" "}
                        <span className="font-semibold text-white font-mono">
                          {pc.totalUsage}
                        </span>{" "}
                        / <span className="text-gray-400">{pc.maxUsage}</span>
                        <div className="text-[10px] text-amber-500 mt-1">
                          {isFa ? "اعتبار منقضی:" : "Validity:"} {pc.durationDays ? `${pc.durationDays} روز` : 'بدون انقضا'}
                        </div>
                      </div>
                      <div className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5 text-gray-500" />
                        <span className="font-mono text-gray-500">
                          {pc.createdAt.split("T")[0]}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
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
              {isFa ? '👥 تنظیمات اختصاصی سیستم زیرمجموعه‌گیری (سیستم معرف دالتون)' : '👥 Dedicated Referral System'}
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
                <label className="text-sm font-medium text-gray-300">{isFa ? 'آیدی ربات شما (بدون @)' : 'Bot Telegram Username (No @)'}</label>
                <input
                  type="text"
                  value={botTelegramHandle}
                  onChange={(e) => setBotTelegramHandle(e.target.value)}
                  className="w-full bg-slate-900/50 border border-slate-700 rounded-xl px-4 py-2.5 text-white focus:ring-2 focus:ring-indigo-500 transition-all text-left dir-ltr"
                  placeholder="DaltoonVPN_bot"
                />
              </div>
              
              <div className="space-y-4 pt-2 pb-2 lg:col-span-3">
                <label className="text-sm font-medium text-gray-300">{isFa ? 'زمان پاداش‌دهی (تب انتخاب)' : 'Reward Condition'}</label>
                <div className="flex bg-slate-900/50 p-1 rounded-xl border border-slate-700 w-full overflow-hidden">
                  <button
                    onClick={() => setReferralRewardCondition('invite')}
                    className={`flex-1 py-2.5 text-sm font-semibold rounded-lg transition-all ${referralRewardCondition === 'invite' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-400 hover:text-white'}`}
                  >
                    {isFa ? 'فقط هنگام ورود (Invite)' : 'On Invite Only'}
                  </button>
                  <button
                    onClick={() => setReferralRewardCondition('purchase')}
                    className={`flex-1 py-2.5 text-sm font-semibold rounded-lg transition-all ${referralRewardCondition === 'purchase' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-400 hover:text-white'}`}
                  >
                    {isFa ? 'فقط هنگام خرید (Purchase)' : 'On Purchase Only'}
                  </button>
                  <button
                    onClick={() => setReferralRewardCondition('both')}
                    className={`flex-1 py-2.5 text-sm font-semibold rounded-lg transition-all ${referralRewardCondition === 'both' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-400 hover:text-white'}`}
                  >
                    {isFa ? 'هر دو (هم ورود هم خرید)' : 'Both'}
                  </button>
                </div>
              </div>

              <div className="space-y-4">
                {(referralRewardCondition === 'invite' || referralRewardCondition === 'both') && (
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-300">{isFa ? 'درصد پاداش به ازای دعوت (%)' : 'Reward Percentage per Invite'}</label>
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
                    <label className="text-sm font-medium text-indigo-300">{isFa ? 'درصد پاداش به ازای خرید زیرمجموعه (%)' : 'Reward Percentage per Purchase'}</label>
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
                <label className="text-sm font-medium text-amber-300">{isFa ? 'درصد پاداش لایه دوم (تیم)' : 'Level 2 Reward Percentage'}</label>
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
                <label className="text-sm font-medium text-blue-300">{isFa ? 'درصد پاداش لایه سوم (تیم)' : 'Level 3 Reward Percentage'}</label>
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
                <label className="text-sm font-medium text-purple-300">{isFa ? 'درصد پاداش لایه چهارم (تیم)' : 'Level 4 Reward Percentage'}</label>
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
                <label className="text-sm font-medium text-gray-300">{isFa ? 'مبلغ پایه محاسبه (تومان)' : 'Base Calculation Amount'}</label>
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
                  {isFa ? 'محاسبه پاداش مشتری به ازای هر دعوت جدید:' : 'Reward per Invite:'}
                </p>
                <p className="text-xs text-emerald-400 font-semibold flex items-center gap-1.5">
                  <span className="bg-emerald-500/10 px-2 py-1 rounded text-emerald-300 font-mono text-xs">
                    {Math.max(0, Math.round(((calculationAmount || 0) as number * ((referralRewardPercent || 0) as number)) / 100)).toLocaleString()} 
                  </span>
                  <span>{isFa ? `${currency} پاداش` : `${currency}`}</span>
                </p>
              </div>
              <div className="text-xs text-gray-400 bg-slate-800 px-3 py-1.5 rounded-lg border border-slate-700/60 font-mono">
                {Number(calculationAmount || 0).toLocaleString()} × {Number(referralRewardPercent || 0)}%
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-gray-300">{isFa ? 'متن پیام مجموعه گیری اختصاصی کاربر' : 'Referral Message Content'}</label>
                <span className="text-[10px] text-gray-400 bg-slate-950 px-2.5 py-1 rounded-lg border border-slate-800">
                  {isFa ? 'متغیرها: {uid}, {link}, {amount}, {percent}, {purchase_percent}, {reward}' : 'Vars: {uid}, {link}, {amount}, {percent}, {purchase_percent}, {reward}'}
                </span>
              </div>
              <textarea
                value={referralMessage}
                onChange={(e) => setReferralMessage(e.target.value)}
                className="w-full bg-slate-900/50 border border-slate-700 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-indigo-500 transition-all text-sm leading-relaxed text-right font-sans"
                rows={8}
                placeholder={isFa ? 'متن خود را اینجا وارد کنید...' : 'Enter your text here...'}
                dir="rtl"
              />
            </div>

            <div className="pt-2 flex items-center justify-between">
              <div className="text-xs text-emerald-400 font-semibold h-4 font-sans">
                {savedSettings && (isFa ? '✅ تغییرات سیستم معرف با موفقیت ذخیره شد!' : '✅ Referral settings saved!')}
              </div>
              <button
                type="button"
                onClick={handleSaveReferralSettings}
                className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl px-6 py-3 text-xs font-bold flex items-center gap-2 transition-all cursor-pointer shadow-lg shadow-indigo-600/20"
              >
                <Save className="w-4 h-4" />
                {isFa ? 'ذخیره تنظیمات معرف دالتون' : 'Save Referral Settings'}
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
