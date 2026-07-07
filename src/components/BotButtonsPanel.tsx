import React, { useState } from "react";
import { PanelSettings, CustomButton } from "../types";
import { Language, translations } from "../locales";
import ConfirmationModal from "./ConfirmationModal";
import {
  Command,
  Sparkles,
  PlusCircle,
  Check,
  Edit,
  Pencil,
  Trash2,
  Plus,
  Save,
  Database,
  Columns,
  Power,
  ChevronUp,
  ChevronDown,
  Activity,
  Coins,
  Settings,
  ImageIcon,
  Film,
  Mic,
  Paperclip,
} from "lucide-react";

interface BotButtonsPanelProps {
  settings: PanelSettings;
  onSaveSettings: (settings: PanelSettings) => void;
  lang: Language;
  customButtons: CustomButton[];
  setCustomButtons: React.Dispatch<React.SetStateAction<CustomButton[]>>;
}

export default function BotButtonsPanel({
  settings,
  onSaveSettings,
  lang,
  customButtons,
  setCustomButtons,
}: BotButtonsPanelProps) {
  const t = translations[lang];

  const [deleteConfirmConfig, setDeleteConfirmConfig] = useState<{
    isOpen: boolean;
    action: (() => void) | null;
    message: string;
  }>({ isOpen: false, action: null, message: "" });

  // Primary buttons text & visibility states
  const [btnTextBuyNew, setBtnTextBuyNew] = useState(
    settings.btnTextBuyNew || "🛒 خرید اشتراک جدید",
  );
  const [hideBtnBuyNew, setHideBtnBuyNew] = useState(!!settings.hideBtnBuyNew);

  const [btnTextMySubs, setBtnTextMySubs] = useState(
    settings.btnTextMySubs || "🗂 اشتراک های من / تمدید",
  );
  const [hideBtnMySubs, setHideBtnMySubs] = useState(!!settings.hideBtnMySubs);

  const [btnTextGuides, setBtnTextGuides] = useState(
    settings.btnTextGuides || "💡 آموزش ها",
  );
  const [hideBtnGuides, setHideBtnGuides] = useState(!!settings.hideBtnGuides);

  const [btnTextProfile, setBtnTextProfile] = useState(
    settings.btnTextProfile || "👤 حساب کاربری",
  );
  const [hideBtnProfile, setHideBtnProfile] = useState(
    !!settings.hideBtnProfile,
  );

  const [btnTextSupport, setBtnTextSupport] = useState(
    settings.btnTextSupport || "📞 پشتیبانی",
  );
  const [hideBtnSupport, setHideBtnSupport] = useState(
    !!settings.hideBtnSupport,
  );

  const [btnTextTicketSupport, setBtnTextTicketSupport] = useState(
    settings.btnTextTicketSupport || "🎫 تیکت به پشتیبانی",
  );
  const [hideBtnTicketSupport, setHideBtnTicketSupport] = useState(
    !!settings.hideBtnTicketSupport,
  );

  const [btnTextFreeTest, setBtnTextFreeTest] = useState(
    settings.btnTextFreeTest || "🎁 موجودی رایگان",
  );
  const [hideBtnFreeTest, setHideBtnFreeTest] = useState(
    !!settings.hideBtnFreeTest,
  );

  const [btnTextInstantSupport, setBtnTextInstantSupport] = useState(
    settings.btnTextInstantSupport || "🤖 پشتیبانی آنی",
  );
  const [hideBtnInstantSupport, setHideBtnInstantSupport] = useState(
    !!settings.hideBtnInstantSupport,
  );

  const [btnTextFeedback, setBtnTextFeedback] = useState(
    settings.btnTextFeedback || "💌 بازخورد کاربر ها",
  );
  const [hideBtnFeedback, setHideBtnFeedback] = useState(
    !!settings.hideBtnFeedback,
  );

  const [btnTextWallet, setBtnTextWallet] = useState(
    settings.btnTextWallet || "شارژ کیف پول 💳",
  );
  const [hideBtnWallet, setHideBtnWallet] = useState(!!settings.hideBtnWallet);

  const [btnTextReferral, setBtnTextReferral] = useState(
    settings.btnTextReferral || "👥 زیرمجموعه گیری",
  );
  const [hideBtnReferral, setHideBtnReferral] = useState(
    !!settings.hideBtnReferral,
  );

  const [btnTextColleagues, setBtnTextColleagues] = useState(
    settings.btnTextColleagues || "بسته ویژه همکاران",
  );
  const [hideBtnColleagues, setHideBtnColleagues] = useState(
    settings.hideBtnColleagues !== undefined
      ? settings.hideBtnColleagues
      : true,
  ); // default hidden

  const [btnTextAiChat, setBtnTextAiChat] = useState(
    settings.btnTextAiChat || "🤖 چت با ربات",
  );
  const [hideBtnAiChat, setHideBtnAiChat] = useState(
    settings.hideBtnAiChat !== undefined ? settings.hideBtnAiChat : true,
  ); // default hidden

  const [btnTextAi, setBtnTextAi] = useState(
    settings.btnTextAi || "🧠 هوش مصنوعی",
  );
  const [hideBtnAi, setHideBtnAi] = useState(
    settings.hideBtnAi !== undefined ? settings.hideBtnAi : true,
  );

  const [keyboardLayout, setKeyboardLayout] = useState<
    "horizontal" | "vertical" | "stepped"
  >(settings.keyboardLayout || "stepped");
  const [guidesText, setGuidesText] = useState(settings.guidesText || "");
  const [showGuidesModal, setShowGuidesModal] = useState(false);
  const [tempGuidesText, setTempGuidesText] = useState("");

  // States for Guide Video URLs / File IDs
  const [guideVideoHapp, setGuideVideoHapp] = useState(
    settings.guideVideoHapp || "",
  );
  const [guideVideoIos, setGuideVideoIos] = useState(
    settings.guideVideoIos || "",
  );
  const [guideVideoAndroid, setGuideVideoAndroid] = useState(
    settings.guideVideoAndroid || "",
  );
  const [guideVideoV2rayn, setGuideVideoV2rayn] = useState(
    settings.guideVideoV2rayn || "",
  );
  const [guideVideoKaring, setGuideVideoKaring] = useState(
    settings.guideVideoKaring || "",
  );
  const [guideVideoMac, setGuideVideoMac] = useState(
    settings.guideVideoMac || "",
  );
  const [guideVideoLinux, setGuideVideoLinux] = useState(
    settings.guideVideoLinux || "",
  );

  const [walletChargeAmounts, setWalletChargeAmounts] = useState<number[]>(
    () => {
      return settings.walletChargeAmounts &&
        Array.isArray(settings.walletChargeAmounts)
        ? settings.walletChargeAmounts
        : [200000, 300000, 400000, 500000, 1000000];
    },
  );
  const [showWalletAmountsModal, setShowWalletAmountsModal] = useState(false);
  const [tempChargeAmounts, setTempChargeAmounts] = useState<number[]>([]);

  const defaultOrder = [
    "btnBuyNew",
    "btnWallet",
    "btnMySubs",
    "btnGuides",
    "btnColleagues",
    "btnProfile",
    "btnSupport",
    "btnTicketSupport",
    "btnFreeTest",
    "btnAiChat",
    "btnAi",
    "btnInstantSupport",
    "btnFeedback",
    "btnReferral",
  ];

  const [mainButtonsOrder, setMainButtonsOrder] = useState<string[]>(() => {
    if (settings.mainButtonsOrder && settings.mainButtonsOrder.length > 0) {
      const saved = [...settings.mainButtonsOrder];
      defaultOrder.forEach((key) => {
        if (!saved.includes(key)) {
          saved.push(key);
        }
      });
      return saved;
    }
    return defaultOrder;
  });

  // Custom reply buttons states
  const [btnText, setBtnText] = useState("");
  const [btnReplyText, setBtnReplyText] = useState("");
  const [buttonError, setButtonError] = useState("");
  const [buttonSuccess, setButtonSuccess] = useState(false);
  const [editingButtonId, setEditingButtonId] = useState<string | null>(null);

  const [saved, setSaved] = useState(false);

  const [tgChannel, setTgChannel] = useState(settings.tgChannel || "");
  const [supportHandle, setSupportHandle] = useState(
    settings.supportHandle || "",
  );
  const [welcomeText, setWelcomeText] = useState(settings.welcomeText || "");
  const [supportText, setSupportText] = useState(settings.supportText || "");
  const [pinnedMessageText, setPinnedMessageText] = useState(settings.pinnedMessageText || "");
  const [pinnedMessageActive, setPinnedMessageActive] = useState(!!settings.pinnedMessageActive);
  const [purchaseSuccessNote, setPurchaseSuccessNote] = useState(
    settings.purchaseSuccessNote || "",
  );
  const [activePurchaseAttachment, setActivePurchaseAttachment] = useState<{
    fileData: string;
    fileName: string;
    fileType: "image" | "video" | "voice" | "file";
  } | null>(settings.purchaseSuccessAttachment || null);
  const [activePurchaseUploadType, setActivePurchaseUploadType] = useState<
    "image" | "video" | "voice" | "file"
  >("image");
  const purchaseAttachmentInputRef = React.useRef<HTMLInputElement>(null);

  const triggerPurchaseUpload = (
    type: "image" | "video" | "voice" | "file",
  ) => {
    setActivePurchaseUploadType(type);
    setTimeout(() => {
      if (purchaseAttachmentInputRef.current) {
        if (type === "image")
          purchaseAttachmentInputRef.current.accept = "image/*";
        else if (type === "video")
          purchaseAttachmentInputRef.current.accept = "video/*";
        else if (type === "voice")
          purchaseAttachmentInputRef.current.accept = "audio/*";
        else purchaseAttachmentInputRef.current.accept = "*/*";
        purchaseAttachmentInputRef.current.click();
      }
    }, 10);
  };

  // Add/Edit Button Handler
  const handleAddButton = async (e: React.MouseEvent) => {
    e.preventDefault();
    setButtonError("");
    setButtonSuccess(false);

    if (!btnText.trim()) {
      setButtonError(
        lang === "fa"
          ? "عنوان دکمه نمی‌تواند خالی باشد."
          : "Button text cannot be empty.",
      );
      return;
    }
    if (!btnReplyText.trim()) {
      setButtonError(
        lang === "fa"
          ? "پاسخ ربات نمی‌تواند خالی باشد."
          : "Bot reply response text cannot be empty.",
      );
      return;
    }

    // Check duplicates but exclude current editing button
    if (
      customButtons.some(
        (b) => b.text === btnText.trim() && b.id !== editingButtonId,
      )
    ) {
      setButtonError(
        lang === "fa"
          ? "این دکمه قبلاً ایجاد شده است."
          : "A button with this exact label already exists.",
      );
      return;
    }

    const buttonIdToUse =
      editingButtonId || Math.random().toString(36).substring(2, 9);
    const targetBtn: CustomButton = {
      id: buttonIdToUse,
      text: btnText.trim(),
      replyText: btnReplyText.trim(),
    };

    try {
      const response = await fetch("/api/custom-buttons", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(targetBtn),
      });
      if (response.ok) {
        if (editingButtonId) {
          setCustomButtons((prev) =>
            prev.map((b) => (b.id === editingButtonId ? targetBtn : b)),
          );
          setEditingButtonId(null);
        } else {
          setCustomButtons((prev) => [...prev, targetBtn]);
        }
        setBtnText("");
        setBtnReplyText("");
        setButtonSuccess(true);
        setTimeout(() => setButtonSuccess(false), 3000);
      } else {
        setButtonError(
          lang === "fa"
            ? "خطا در برقراری ارتباط با دیتابیس."
            : "Failed to sync with the database.",
        );
      }
    } catch (err) {
      setButtonError(
        lang === "fa"
          ? "خطا در برقراری ارتباط با سرور."
          : "Network connection failed.",
      );
    }
  };

  // Delete Button Handler
  const handleDeleteButton = async (id: string) => {
    try {
      const response = await fetch("/api/custom-buttons/delete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      if (response.ok) {
        setCustomButtons((prev) => prev.filter((b) => b.id !== id));
      }
    } catch (err) {
      console.error("Failed to delete button:", err);
    }
  };

  // Move button up or down
  const moveButton = (index: number, direction: "up" | "down") => {
    const newButtons = [...customButtons];
    if (direction === "up" && index > 0) {
      [newButtons[index], newButtons[index - 1]] = [
        newButtons[index - 1],
        newButtons[index],
      ];
    } else if (direction === "down" && index < newButtons.length - 1) {
      [newButtons[index], newButtons[index + 1]] = [
        newButtons[index + 1],
        newButtons[index],
      ];
    }
    setCustomButtons(newButtons);
  };

  const moveMainButton = (index: number, direction: "up" | "down") => {
    const newOrder = [...mainButtonsOrder];
    if (direction === "up" && index > 0) {
      [newOrder[index], newOrder[index - 1]] = [
        newOrder[index - 1],
        newOrder[index],
      ];
    } else if (direction === "down" && index < newOrder.length - 1) {
      [newOrder[index], newOrder[index + 1]] = [
        newOrder[index + 1],
        newOrder[index],
      ];
    }
    setMainButtonsOrder(newOrder);
  };

  // Main Form Submit Handler (Saves primary button labels and layout)
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveSettings({
      ...settings,
      btnTextBuyNew,
      btnTextMySubs,
      btnTextGuides,
      guidesText,
      btnTextProfile,
      btnTextSupport,
      btnTextTicketSupport,
      btnTextFreeTest,
      btnTextInstantSupport,
      btnTextFeedback,
      btnTextReferral,
      btnTextWallet,
      btnTextColleagues,
      btnTextAiChat,
      btnTextAi,
      hideBtnBuyNew,
      hideBtnMySubs,
      hideBtnGuides,
      hideBtnProfile,
      hideBtnSupport,
      hideBtnTicketSupport,
      hideBtnFreeTest,
      hideBtnInstantSupport,
      hideBtnFeedback,
      hideBtnReferral,
      hideBtnWallet,
      hideBtnColleagues,
      hideBtnAiChat,
      hideBtnAi,
      keyboardLayout,
      mainButtonsOrder,
      walletChargeAmounts,
      guideVideoHapp,
      guideVideoIos,
      guideVideoAndroid,
      guideVideoV2rayn,
      guideVideoKaring,
      guideVideoMac,
      guideVideoLinux,
      tgChannel,
      supportHandle,
      welcomeText,
      supportText,
      pinnedMessageText,
      pinnedMessageActive,
      purchaseSuccessNote,
      purchaseSuccessAttachment: activePurchaseAttachment,
    });
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div
      id="bot-buttons-tab"
      className="max-w-4xl mx-auto space-y-6 animate-fade-in"
    >
      {/* Header Info */}
      <div className="bg-[#111827] border border-[#1f2937] p-5 rounded-xl space-y-4 shadow-sm">
        <h3 className="font-display font-medium text-lg text-white flex items-center gap-2">
          <Command className="w-5 h-5 text-indigo-400" />
          {lang === "fa"
            ? "مدیریت دکمه‌ها و منوهای ربات تلگرام"
            : "Telegram Bot Menu & Buttons Management"}
        </h3>
        <p className="text-xs text-gray-400 leading-relaxed">
          {lang === "fa"
            ? "در این پنجره می‌توانید ترتیب، چیدمان و نام تمام دکمه‌های کیبورد ربات تلگرام را ویرایش کنید. همچنین امکان ساخت دکمه‌های پاسخ خودکار جدید برای ارائه‌ی خدماتی نظیر اکانت تست یا برگه قوانین وجود دارد."
            : "In this interface, you can manage the layout, hierarchy, and labels of the Telegram bot's main keyboard menus. You can also define automated-reply custom buttons to offer features such as free test accounts, guides, or rules."}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Layout & Primary Labels section */}
        <div className="bg-[#111827] border border-[#1f2937] p-5 rounded-xl space-y-6">
          <div className="flex items-center gap-3 border-b border-gray-800 pb-3">
            <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-400">
              <Columns className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-display font-medium text-base text-white">
                {lang === "fa"
                  ? "چیدمان و عناوین کیبورد اصلی"
                  : "Primary Keyboard Layout & Labels"}
              </h4>
              <p className="text-xs text-gray-400">
                {lang === "fa"
                  ? "پیکربندی چیدمان ظاهری دکمه‌ها و ویرایش برچسب‌های متنی منوی اصلی."
                  : "Configure keyboard spacing structures and edit text labels."}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Keyboard Layout pattern Selector */}
            <div className="space-y-2 bg-[#090d16] p-4 border border-gray-800/60 rounded-xl flex flex-col justify-between">
              <div>
                <label className="block text-xs uppercase tracking-wider text-gray-400 font-semibold mb-1">
                  {lang === "fa"
                    ? "📐 چیدمان دکمه‌های اصلی کیبورد"
                    : "📐 Main Keyboard Layout Type"}
                </label>
                <p className="text-[11px] text-gray-500 mb-4">
                  {lang === "fa"
                    ? "نحوه‌ی نمایش و قرارگیری دکمه‌های اصلی در تلگرام را تعیین کنید."
                    : "Determines how the primary bot buttons stack on Telegram messenger."}
                </p>
              </div>

              <div className="grid grid-cols-3 gap-2.5">
                {(["stepped", "horizontal", "vertical"] as const).map(
                  (style) => (
                    <button
                      key={style}
                      type="button"
                      onClick={() => setKeyboardLayout(style)}
                      className={`p-3 rounded-lg border text-center transition cursor-pointer text-xs font-semibold capitalize ${
                        keyboardLayout === style
                          ? "bg-indigo-600/15 border-indigo-500 text-indigo-300"
                          : "bg-gray-900 border-gray-800 text-gray-400 hover:text-white hover:border-gray-700"
                      }`}
                    >
                      {style === "stepped" &&
                        (lang === "fa" ? "پله‌ای" : "Stepped")}
                      {style === "horizontal" &&
                        (lang === "fa" ? "افقی" : "Horizontal")}
                      {style === "vertical" &&
                        (lang === "fa" ? "عمودی" : "Vertical")}
                    </button>
                  ),
                )}
              </div>
            </div>

            {/* Hidden toggle options or quick notes */}
            <div className="bg-[#090d16] p-4 border border-gray-800/60 rounded-xl space-y-3 justify-center flex flex-col">
              <span className="block text-xs uppercase tracking-wider text-gray-400 font-semibold mb-1">
                {lang === "fa" ? "ℹ️ راهنمای چیدمان" : "ℹ️ Layout Guidelines"}
              </span>
              <p className="text-[11px] text-gray-400 leading-relaxed">
                {lang === "fa"
                  ? "• چیدمان پله‌ای: دکمه اول بزرگتر در ردیف بالا قرار می‌گیرد و سایر دکمه‌ها منظم در کنار هم قرار می‌گیرند (پیش‌فرض).\n• چیدمان افقی: دکمه‌ها دو به دو روبروی هم چیده می‌شوند.\n• چیدمان عمودی: هر دکمه در یک ردیف جداگانه و بزرگ نمایش داده می‌شود."
                  : "• Stepped: The first key takes standard full width, other keys follow grouped in pairs (default).\n• Horizontal: Arranges all action inputs side-by-side in columns.\n• Vertical: Extends all keys across full width on separate lines."}
              </p>
            </div>
          </div>

          {/* Part A: Default Primary keyboard button labels */}
          <div className="space-y-3">
            <label className="block text-xs uppercase tracking-wider text-gray-400 font-semibold">
              {lang === "fa"
                ? "✍️ برچسب متنی دکمه‌های اصلی کیبورد"
                : "✍️ Custom Primary Keyboard Button Labels"}
            </label>
            <div className="grid grid-cols-1 gap-4 bg-[#0a0e17] p-4 border border-gray-800/60 rounded-xl">
              {(() => {
                const primaryButtonsDefinition: Record<
                  string,
                  {
                    label: string;
                    value: string;
                    setter: (val: string) => void;
                    disabled: boolean;
                    toggleDisabled: () => void;
                  }
                > = {
                  btnBuyNew: {
                    label:
                      lang === "fa"
                        ? "عنوان دکمه خرید اشتراک"
                        : "Buy Sub Button Label",
                    value: btnTextBuyNew,
                    setter: setBtnTextBuyNew,
                    disabled: hideBtnBuyNew,
                    toggleDisabled: () => setHideBtnBuyNew(!hideBtnBuyNew),
                  },
                  btnMySubs: {
                    label:
                      lang === "fa"
                        ? "عنوان دکمه اشتراک‌ها"
                        : "My Subs Button Label",
                    value: btnTextMySubs,
                    setter: setBtnTextMySubs,
                    disabled: hideBtnMySubs,
                    toggleDisabled: () => setHideBtnMySubs(!hideBtnMySubs),
                  },
                  btnGuides: {
                    label:
                      lang === "fa"
                        ? "عنوان دکمه راهنمای اتصال"
                        : "Connection Guide Button Label",
                    value: btnTextGuides,
                    setter: setBtnTextGuides,
                    disabled: hideBtnGuides,
                    toggleDisabled: () => setHideBtnGuides(!hideBtnGuides),
                  },
                  btnProfile: {
                    label:
                      lang === "fa"
                        ? "عنوان دکمه حساب کاربری"
                        : "Profile Button Label",
                    value: btnTextProfile,
                    setter: setBtnTextProfile,
                    disabled: hideBtnProfile,
                    toggleDisabled: () => setHideBtnProfile(!hideBtnProfile),
                  },
                  btnSupport: {
                    label:
                      lang === "fa"
                        ? "عنوان دکمه پشتیبانی"
                        : "Support Button Label",
                    value: btnTextSupport,
                    setter: setBtnTextSupport,
                    disabled: hideBtnSupport,
                    toggleDisabled: () => setHideBtnSupport(!hideBtnSupport),
                  },
                  btnTicketSupport: {
                    label:
                      lang === "fa"
                        ? "عنوان دکمه تیکت به پشتیبانی"
                        : "Ticket Support Button Label",
                    value: btnTextTicketSupport,
                    setter: setBtnTextTicketSupport,
                    disabled: hideBtnTicketSupport,
                    toggleDisabled: () =>
                      setHideBtnTicketSupport(!hideBtnTicketSupport),
                  },
                  btnFreeTest: {
                    label:
                      lang === "fa"
                        ? "عنوان دکمه موجوده رایگان/تست"
                        : "Free Test Button Label",
                    value: btnTextFreeTest,
                    setter: setBtnTextFreeTest,
                    disabled: hideBtnFreeTest,
                    toggleDisabled: () => setHideBtnFreeTest(!hideBtnFreeTest),
                  },
                  btnAiChat: {
                    label:
                      lang === "fa"
                        ? "عنوان دکمه چت با ربات"
                        : "AI Chat Button Label",
                    value: btnTextAiChat,
                    setter: setBtnTextAiChat,
                    disabled: hideBtnAiChat,
                    toggleDisabled: () => setHideBtnAiChat(!hideBtnAiChat),
                  },
                  btnAi: {
                    label:
                      lang === "fa"
                        ? "عنوان دکمه هوش مصنوعی"
                        : "AI Button Label",
                    value: btnTextAi,
                    setter: setBtnTextAi,
                    disabled: hideBtnAi,
                    toggleDisabled: () => setHideBtnAi(!hideBtnAi),
                  },
                  btnColleagues: {
                    label:
                      lang === "fa"
                        ? "عنوان دکمه همکاران"
                        : "Colleagues Button Label",
                    value: btnTextColleagues,
                    setter: setBtnTextColleagues,
                    disabled: hideBtnColleagues,
                    toggleDisabled: () =>
                      setHideBtnColleagues(!hideBtnColleagues),
                  },
                  btnInstantSupport: {
                    label:
                      lang === "fa"
                        ? "عنوان دکمه پشتیبانی آنی"
                        : "Instant Support Button Label",
                    value: btnTextInstantSupport,
                    setter: setBtnTextInstantSupport,
                    disabled: hideBtnInstantSupport,
                    toggleDisabled: () =>
                      setHideBtnInstantSupport(!hideBtnInstantSupport),
                  },
                  btnFeedback: {
                    label:
                      lang === "fa"
                        ? "عنوان دکمه بازخورد"
                        : "Feedback Button Label",
                    value: btnTextFeedback,
                    setter: setBtnTextFeedback,
                    disabled: hideBtnFeedback,
                    toggleDisabled: () => setHideBtnFeedback(!hideBtnFeedback),
                  },
                  btnReferral: {
                    label:
                      lang === "fa"
                        ? "عنوان دکمه مجموعه‌گیری"
                        : "Referral Button Label",
                    value: btnTextReferral,
                    setter: setBtnTextReferral,
                    disabled: hideBtnReferral,
                    toggleDisabled: () => setHideBtnReferral(!hideBtnReferral),
                  },
                  btnWallet: {
                    label:
                      lang === "fa"
                        ? "عنوان دکمه کیف پول و شارژ"
                        : "Wallet Button Label",
                    value: btnTextWallet,
                    setter: setBtnTextWallet,
                    disabled: hideBtnWallet,
                    toggleDisabled: () => setHideBtnWallet(!hideBtnWallet),
                  },
                };

                return mainButtonsOrder.map((key, idx) => {
                  const btn = primaryButtonsDefinition[key];
                  if (!btn) return null; // Fallback for invalid keys

                  return (
                    <div key={key}>
                      <label className="block text-[11px] text-gray-400 mb-1 flex items-center justify-between">
                        <span>{btn.label}</span>
                        <div className="flex gap-1 items-center">
                          <button
                            type="button"
                            onClick={() => moveMainButton(idx, "up")}
                            className="text-gray-500 hover:text-white p-0.5"
                            title="Move Up"
                          >
                            <ChevronUp className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => moveMainButton(idx, "down")}
                            className="text-gray-500 hover:text-white p-0.5"
                            title="Move Down"
                          >
                            <ChevronDown className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </label>
                      <div className="relative">
                        <input
                          type="text"
                          disabled={btn.disabled}
                          className={`w-full bg-[#1b2230] border border-gray-700/80 rounded-lg p-2.5 ${key === "btnWallet" ? "pl-24" : key === "btnFreeTest" ? "pl-[120px]" : "pl-12"} text-xs text-white focus:ring-1 focus:ring-indigo-500 font-medium transition ${btn.disabled ? "opacity-50" : ""}`}
                          value={btn.value}
                          onChange={(e) => btn.setter(e.target.value)}
                        />
                        <button
                          type="button"
                          onClick={btn.toggleDisabled}
                          title={
                            lang === "fa"
                              ? "فعال/غیرفعال کردن این دکمه در ربات"
                              : "Toggle visibility"
                          }
                          className={`absolute left-1 top-1/2 -translate-y-1/2 p-2 rounded-lg transition-all cursor-pointer z-10 ${
                            !btn.disabled
                              ? "bg-emerald-500/20 text-emerald-400 shadow-[0_0_10px_rgba(52,211,153,0.3)] hover:bg-emerald-500/30"
                              : "bg-gray-800 text-gray-500 hover:bg-gray-700 hover:text-red-400"
                          }`}
                        >
                          <Power className="w-4 h-4" />
                        </button>

                        {key === "btnWallet" && (
                          <button
                            type="button"
                            onClick={() => {
                              setTempChargeAmounts([...walletChargeAmounts]);
                              setShowWalletAmountsModal(true);
                            }}
                            title={
                              lang === "fa"
                                ? "ویرایش مبالغ شارژ کیف پول"
                                : "Edit Wallet Charge Amounts"
                            }
                            className="absolute left-[44px] top-1/2 -translate-y-1/2 p-2 rounded-lg bg-amber-500/20 hover:bg-amber-500 text-amber-400 hover:text-white transition-all cursor-pointer border border-amber-500/20 z-10"
                          >
                            <Pencil className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </div>
                  );
                });
              })()}
            </div>
          </div>
        </div>

        {/* Client Video Tutorials Section */}
        <div className="bg-[#111827] border border-[#1f2937] p-5 rounded-xl space-y-6">
          <div className="flex items-center gap-3 border-b border-gray-800 pb-3">
            <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-400">
              <Activity className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <h4 className="font-display font-medium text-base text-white">
                {lang === "fa"
                  ? "🎥 ویدیوها و فایل‌های آموزش اتصال کلاینت‌ها"
                  : "🎥 Client Setup Video Tutorials"}
              </h4>
              <p className="text-xs text-gray-400">
                {lang === "fa"
                  ? "لینک مستقیم ویدیو/GIF یا شناسه فایل تلگرامی (File ID) را قرار دهید تا آموزش کلاینت مربوطه تصویری ارسال شود."
                  : "Associate a Direct Video URL, Playable GIF link, or Telegram File ID for each connection client guide."}
              </p>
            </div>
          </div>

          <div className="bg-indigo-650/10 border border-indigo-500/20 p-4 rounded-xl text-xs text-gray-300 space-y-2 leading-relaxed">
            <p className="font-semibold text-indigo-300">
              💡{" "}
              {lang === "fa"
                ? "چگونه یک منبع تصویری یا ویدیو اضافه کنیم؟"
                : "How to specify an educational media file?"}
            </p>
            <p>
              {lang === "fa"
                ? "۱. شناسه فایل تلگرام (File ID): برای ارسال سریع و پرسرعت مستقیم در تلگرام، ویدیو یا GIF مورد نظرتان را به ربات بفرستید؛ شناسه آن در لاگ‌های کنسول به شما نشان داده می‌شود. کپی کرده و در کادرهای زیر بگذارید."
                : "1. Telegram File ID (Recommended): Best for high-speed delivery. Send any tutorial video/GIF file to your bot, note the generated file ID in terminal/logs, and paste it below."}
            </p>
            <p>
              {lang === "fa"
                ? "۲. لینک مستقیم (URL): می‌توانید لینک مستقیم فایل ویدیویی خود (مثلاً https://example.com/guide.mp4) را قرار دهید تا ربات از آن جهت نمایش ویدیو استفاده کند."
                : "2. Direct Web Link: Provide a direct cloud hosted URL (e.g., https://yourdomain.com/setup.mp4) for users to interact or play natively."}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-[11px] text-gray-400 mb-1 font-semibold">
                {lang === "fa"
                  ? "📱 کلاینت HAPP (موبایل)"
                  : "📱 HAPP Client Video / File ID"}
              </label>
              <input
                type="text"
                placeholder={
                  lang === "fa"
                    ? "شناسه فایل یا آدرس ویدیو"
                    : "e.g., AgACAgIAAx..."
                }
                className="w-full bg-[#1b2230] border border-gray-700/80 rounded-lg p-2.5 text-xs text-white focus:ring-1 focus:ring-indigo-500 font-sans"
                value={guideVideoHapp}
                onChange={(e) => setGuideVideoHapp(e.target.value)}
              />
            </div>

            <div>
              <label className="block text-[11px] text-gray-400 mb-1 font-semibold">
                {lang === "fa"
                  ? "🍎 کلاینت‌های آیفون / iOS"
                  : "🍎 iOS Clients Video / File ID"}
              </label>
              <input
                type="text"
                placeholder={
                  lang === "fa"
                    ? "شناسه فایل یا آدرس ویدیو"
                    : "e.g., AgACAgIAAx..."
                }
                className="w-full bg-[#1b2230] border border-gray-700/80 rounded-lg p-2.5 text-xs text-white focus:ring-1 focus:ring-indigo-500 font-sans"
                value={guideVideoIos}
                onChange={(e) => setGuideVideoIos(e.target.value)}
              />
            </div>

            <div>
              <label className="block text-[11px] text-gray-400 mb-1 font-semibold">
                {lang === "fa"
                  ? "🤖 کلاینت اندروید (v2rayNG)"
                  : "🤖 Android v2rayNG Video / File ID"}
              </label>
              <input
                type="text"
                placeholder={
                  lang === "fa"
                    ? "شناسه فایل یا آدرس ویدیو"
                    : "e.g., AgACAgIAAx..."
                }
                className="w-full bg-[#1b2230] border border-gray-700/80 rounded-lg p-2.5 text-xs text-white focus:ring-1 focus:ring-indigo-500 font-sans"
                value={guideVideoAndroid}
                onChange={(e) => setGuideVideoAndroid(e.target.value)}
              />
            </div>

            <div>
              <label className="block text-[11px] text-gray-400 mb-1 font-semibold">
                {lang === "fa"
                  ? "💻 کلاینت ویندوز (v2rayN)"
                  : "💻 Windows v2rayN Video / File ID"}
              </label>
              <input
                type="text"
                placeholder={
                  lang === "fa"
                    ? "شناسه فایل یا آدرس ویدیو"
                    : "e.g., AgACAgIAAx..."
                }
                className="w-full bg-[#1b2230] border border-gray-700/80 rounded-lg p-2.5 text-xs text-white focus:ring-1 focus:ring-indigo-500 font-sans"
                value={guideVideoV2rayn}
                onChange={(e) => setGuideVideoV2rayn(e.target.value)}
              />
            </div>

            <div>
              <label className="block text-[11px] text-gray-400 mb-1 font-semibold">
                {lang === "fa"
                  ? "💻 کلاینت ویندوز (Karing)"
                  : "💻 Windows Karing Video / File ID"}
              </label>
              <input
                type="text"
                placeholder={
                  lang === "fa"
                    ? "شناسه فایل یا آدرس ویدیو"
                    : "e.g., AgACAgIAAx..."
                }
                className="w-full bg-[#1b2230] border border-gray-700/80 rounded-lg p-2.5 text-xs text-white focus:ring-1 focus:ring-indigo-500 font-sans"
                value={guideVideoKaring}
                onChange={(e) => setGuideVideoKaring(e.target.value)}
              />
            </div>

            <div>
              <label className="block text-[11px] text-gray-400 mb-1 font-semibold">
                {lang === "fa"
                  ? "💻 کلاینت مک (macOS)"
                  : "💻 macOS Client Video / File ID"}
              </label>
              <input
                type="text"
                placeholder={
                  lang === "fa"
                    ? "شناسه فایل یا آدرس ویدیو"
                    : "e.g., AgACAgIAAx..."
                }
                className="w-full bg-[#1b2230] border border-gray-700/80 rounded-lg p-2.5 text-xs text-white focus:ring-1 focus:ring-indigo-500 font-sans"
                value={guideVideoMac}
                onChange={(e) => setGuideVideoMac(e.target.value)}
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-[11px] text-gray-400 mb-1 font-semibold">
                {lang === "fa"
                  ? "🐧 کلاینت لینوکس (Linux)"
                  : "🐧 Linux Client Video / File ID"}
              </label>
              <input
                type="text"
                placeholder={
                  lang === "fa"
                    ? "شناسه فایل یا آدرس ویدیو"
                    : "e.g., AgACAgIAAx..."
                }
                className="w-full bg-[#1b2230] border border-gray-700/80 rounded-lg p-2.5 text-xs text-white focus:ring-1 focus:ring-indigo-500 font-sans"
                value={guideVideoLinux}
                onChange={(e) => setGuideVideoLinux(e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* Part B: Custom Dynamic reply buttons */}
        <div className="bg-[#111827] border border-[#1f2937] p-5 rounded-xl space-y-6">
          <div className="flex items-center gap-3 border-b border-gray-800 pb-3">
            <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-400">
              <Command className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-display font-medium text-base text-white">
                {lang === "fa"
                  ? "دکمه‌های سفارشی پاسخ خودکار (Custom Submenus)"
                  : "Custom Auto-Reply Buttons"}
              </h4>
              <p className="text-xs text-gray-400">
                {lang === "fa"
                  ? "دکمه‌های فرعی ایجاد کنید که با کلیک روی آنها، ربات بلافاصله پاسخ متنی تنظیم شده را به کاربر بفرستد."
                  : "Add custom reply options that trigger instant preset responses (like free test links, guides)."}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Input Action Form */}
            <div className="space-y-4 bg-[#0a0e17] p-4 border border-gray-800/60 rounded-xl flex flex-col justify-between">
              <div className="space-y-4">
                <div>
                  <label className="block text-[11px] text-gray-400 mb-1.5 flex items-center gap-1 font-medium">
                    <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                    {lang === "fa"
                      ? "عنوان دکمه (مثال: 🎁 تست رایگان)"
                      : "Button Keyboard Display Label"}
                  </label>
                  <input
                    type="text"
                    placeholder={
                      lang === "fa"
                        ? "مثلا: 🎁 تست رایگان ۲ ساعته"
                        : "e.g., 🎁 Get Free Test"
                    }
                    className="w-full bg-[#1f2937] border border-gray-700 rounded-lg p-2.5 text-xs text-white focus:ring-1 focus:ring-indigo-500 focus:outline-none font-sans"
                    value={btnText}
                    onChange={(e) => setBtnText(e.target.value)}
                  />
                </div>

                <div>
                  <label className="block text-[11px] text-gray-400 mb-1.5 font-medium">
                    {lang === "fa"
                      ? "متن پاسخ ربات (پشتیبانی از تگ‌های HTML تلگرام)"
                      : "Auto Reply Text (Telegram HTML allowed)"}
                  </label>
                  <textarea
                    rows={5}
                    placeholder={
                      lang === "fa"
                        ? "سلام! جهت دریافت سرویس تست دکمه فعال شد:\nvless://test-configs-daltoon..."
                        : "Hello! Here is your quick configuration..."
                    }
                    className="w-full bg-[#1f2937] border border-gray-700 rounded-lg p-2.5 text-xs text-gray-200 focus:ring-1 focus:ring-indigo-500 focus:outline-none leading-relaxed font-sans"
                    value={btnReplyText}
                    onChange={(e) => setBtnReplyText(e.target.value)}
                  />
                </div>

                {buttonError && (
                  <p className="text-xs text-rose-400 flex items-center gap-1 font-semibold">
                    <span className="h-1.5 w-1.5 bg-rose-500 rounded-full"></span>
                    {buttonError}
                  </p>
                )}

                {buttonSuccess && (
                  <p className="text-xs text-emerald-400 flex items-center gap-1 font-semibold">
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    {lang === "fa"
                      ? "✅ تغییرات دکمه با موفقیت همگام شد!"
                      : "✅ Button state synchronized!"}
                  </p>
                )}
              </div>

              <div className="flex gap-3 pt-3">
                <button
                  type="button"
                  onClick={handleAddButton}
                  className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white font-bold rounded-lg transition text-xs shadow-md shadow-emerald-600/15 flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <PlusCircle className="w-4 h-4" />
                  {editingButtonId
                    ? lang === "fa"
                      ? "ذخیره تغییرات دکمه"
                      : "Save Modified Button"
                    : lang === "fa"
                      ? "ذخیره و افزودن دکمه جدید"
                      : "Create & Add Button"}
                </button>
                {editingButtonId && (
                  <button
                    type="button"
                    onClick={() => {
                      setEditingButtonId(null);
                      setBtnText("");
                      setBtnReplyText("");
                    }}
                    className="px-4 py-2.5 bg-gray-700 hover:bg-gray-600 text-gray-300 rounded-lg text-xs cursor-pointer"
                  >
                    {lang === "fa" ? "انصراف" : "Cancel"}
                  </button>
                )}
              </div>
            </div>

            {/* List and Actions rendering section */}
            <div className="bg-[#0b0f19] border border-gray-800 rounded-xl p-4 flex flex-col justify-between max-h-[380px] overflow-y-auto">
              <div>
                <h4 className="text-xs uppercase font-mono border-b border-gray-800 pb-2 mb-3 text-gray-400 font-semibold tracking-wider flex justify-between items-center">
                  <span>
                    {lang === "fa"
                      ? "دکمه‌های سفارشی فعال شده در ربات:"
                      : "Live Custom Reply Buttons:"}
                  </span>
                  <span className="bg-[#1f2937] text-indigo-400 px-2 py-0.5 rounded text-[10px] font-mono">
                    {customButtons.length}
                  </span>
                </h4>

                {customButtons.length === 0 ? (
                  <div className="py-16 text-center flex flex-col items-center justify-center">
                    <p className="text-xs text-gray-400 font-medium">
                      {lang === "fa"
                        ? "هیچ دکمه‌ی سفارشی ثبت نشده است. از فرم سمت چپ یکی اضافه کنید."
                        : "No custom buttons created yet. Create one on the left."}
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3 max-h-[290px] overflow-y-auto no-scrollbar pr-1">
                    {customButtons.map((btn) => (
                      <div
                        key={btn.id}
                        className="bg-[#111827] border border-gray-800/80 p-3 rounded-lg flex items-start justify-between gap-3 shadow-sm hover:border-gray-700 transition"
                      >
                        <div className="space-y-1 flex-1 min-w-0">
                          <span className="inline-block px-1.5 py-0.5 rounded text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/15 truncate max-w-full">
                            {btn.text}
                          </span>
                          <p className="text-[10px] text-gray-400 leading-normal font-sans line-clamp-3">
                            {btn.replyText}
                          </p>
                        </div>

                        <div className="flex gap-1 shrink-0">
                          <button
                            type="button"
                            onClick={() =>
                              moveButton(customButtons.indexOf(btn), "up")
                            }
                            className="text-gray-400 hover:text-white hover:bg-gray-700/50 p-1 rounded transition cursor-pointer"
                            title="Move up"
                          >
                            <ChevronUp className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() =>
                              moveButton(customButtons.indexOf(btn), "down")
                            }
                            className="text-gray-400 hover:text-white hover:bg-gray-700/50 p-1 rounded transition cursor-pointer"
                            title="Move down"
                          >
                            <ChevronDown className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setEditingButtonId(btn.id);
                              setBtnText(btn.text);
                              setBtnReplyText(btn.replyText);
                            }}
                            className="text-indigo-400 hover:text-white hover:bg-indigo-500/15 p-1 rounded transition cursor-pointer"
                            title="Edit button"
                          >
                            <Edit className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() =>
                              setDeleteConfirmConfig({
                                isOpen: true,
                                action: () => handleDeleteButton(btn.id),
                                message:
                                  lang === "fa"
                                    ? "آیا از حذف این دکمه اختصاصی اطمینان دارید؟"
                                    : "Are you sure you want to delete this custom button?",
                              })
                            }
                            className="text-rose-400 hover:text-white hover:bg-rose-500/15 p-1 rounded transition cursor-pointer"
                            title="Remove button"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Telegram Bot Message & Layout Customization */}
        <div className="bg-[#111827] border border-[#1f2937] p-5 rounded-xl space-y-4">
          <h3 className="font-display font-medium text-lg text-white flex items-center gap-2">
            <Settings className="w-5 h-5 text-indigo-400" />
            {lang === "fa"
              ? "سفارشی‌سازی متن‌ها و دکمه‌های ربات تلگرام"
              : "Telegram Bot Message & Button Customization"}
          </h3>
          <p className="text-xs text-gray-400">
            {lang === "fa"
              ? "بدون نیاز به ویرایش فایل‌های پایتون در سرور لینوکس، متن‌های اصلی و دکمه‌های فعال ربات را سفارشی کنید."
              : "Customize primary bot responses and visibility of buttons without editing Python files directly."}
          </p>

          <div className="space-y-4 pt-2">
            {/* Welcome text */}
            <div>
              <label className="block text-xs uppercase tracking-wider text-gray-400 mb-1">
                {lang === "fa"
                  ? "متن خوش‌آمدگویی استارت ربات (/start)"
                  : "Welcome Message Text (/start)"}
              </label>
              <textarea
                rows={4}
                className="w-full bg-[#1f2937] border border-gray-700 rounded-lg p-2.5 text-sm text-yellow-100 focus:ring-1 focus:ring-indigo-500 font-mono"
                value={welcomeText}
                onChange={(e) => setWelcomeText(e.target.value)}
              />
              <span className="text-[10px] text-gray-500 mt-1 block">
                {lang === "fa"
                  ? "نکته: می‌توانید از کدهای {tg_id} برای نمایش آیدی کاربری و {wallet_balance} برای نمایش مانده اعتبار استفاده کنید. قالب‌بندی HTML مجاز است."
                  : "Tip: Use {tg_id} for user's ID and {wallet_balance} for wallet credit. HTML tags are supported."}
              </span>
            </div>

            {/* Support text */}
            <div>
              <label className="block text-xs uppercase tracking-wider text-gray-400 mb-1">
                {lang === "fa"
                  ? "متن دکمه پشتیبانی فنی"
                  : "Support Button Content"}
              </label>
              <textarea
                rows={4}
                className="w-full bg-[#1f2937] border border-gray-700 rounded-lg p-2.5 text-sm text-indigo-200 focus:ring-1 focus:ring-indigo-500 font-mono"
                value={supportText}
                onChange={(e) => setSupportText(e.target.value)}
              />
              <span className="text-[10px] text-gray-500 mt-1 block">
                {lang === "fa"
                  ? "نکته: قالب‌بندی HTML مجاز است."
                  : "Tip: HTML tags are supported."}
              </span>
            </div>

            {/* Pinned Message Section */}
            <div className="border border-indigo-500/20 bg-indigo-950/10 p-4 rounded-xl space-y-3.5">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <label className="text-sm font-semibold text-white flex items-center gap-1.5">
                    📌 {lang === "fa" ? "فعالسازی پین خودکار پیام" : "Enable Auto-Pinned Message"}
                  </label>
                  <p className="text-[11px] text-gray-400">
                    {lang === "fa"
                      ? "با فعالسازی این گزینه، پیام مشخص شده به محض ورود کاربر به ربات (/start) در چت خصوصی او فرستاده و پین می‌شود."
                      : "If enabled, this message will be sent and pinned in the user's private chat when they /start the bot."}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setPinnedMessageActive(!pinnedMessageActive)}
                  className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                    pinnedMessageActive ? "bg-indigo-600" : "bg-gray-800"
                  }`}
                >
                  <span
                    className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                      pinnedMessageActive ? (lang === "fa" ? "-translate-x-5" : "translate-x-5") : "translate-x-0"
                    }`}
                  />
                </button>
              </div>

              {pinnedMessageActive && (
                <div className="space-y-1.5 animate-fadeIn">
                  <label className="block text-xs uppercase tracking-wider text-gray-400 mb-1">
                    {lang === "fa" ? "متن پیام پین‌شونده" : "Pinned Message Text"}
                  </label>
                  <textarea
                    rows={3}
                    className="w-full bg-[#1f2937] border border-gray-700 rounded-lg p-2.5 text-sm text-indigo-200 focus:ring-1 focus:ring-indigo-500 font-mono"
                    placeholder={
                      lang === "fa"
                        ? "مثال: 📢 آدرس جدید کانال ما را حتما دنبال کنید: @Daltoon_Store"
                        : "e.g. 📢 Follow our new channel: @Daltoon_Store"
                    }
                    value={pinnedMessageText}
                    onChange={(e) => setPinnedMessageText(e.target.value)}
                  />
                  <span className="text-[10px] text-gray-500 mt-1 block">
                    {lang === "fa"
                      ? "نکته: قالب‌بندی HTML در پیام پین شده مجاز است."
                      : "Tip: HTML tags are supported in the pinned message."}
                  </span>
                </div>
              )}
            </div>

            {/* Purchase success note text */}
            <div>
              <label className="block text-xs uppercase tracking-wider text-gray-400 mb-1">
                {lang === "fa"
                  ? "📝 توضیحات پیوست پس از تحویل اکانت به مشتری"
                  : "📝 Config Delivery Success Note"}
              </label>
              <textarea
                rows={3}
                placeholder={
                  lang === "fa"
                    ? "مثلا: کانال آموزش کلاینت‌ها: @example_setup"
                    : "e.g., Client Tutorial Channel: @example_setup"
                }
                className="w-full bg-[#1f2937] border border-gray-700 rounded-lg p-2.5 text-sm text-emerald-200 focus:ring-1 focus:ring-indigo-500 font-mono"
                value={purchaseSuccessNote}
                onChange={(e) => setPurchaseSuccessNote(e.target.value)}
              />

              {/* Media Attachment Actions for Purchase Note */}
              <div className="flex flex-wrap items-center gap-3 pt-2">
                <span className="text-[11px] text-gray-500">
                  {lang === "fa" ? "افزودن رسانه:" : "Attach media:"}
                </span>
                <button
                  type="button"
                  onClick={() => triggerPurchaseUpload("image")}
                  className="px-2 py-1 rounded bg-[#111827] border border-gray-700 hover:border-indigo-500 text-gray-400 hover:text-indigo-400 text-[10px] transition flex items-center gap-1"
                >
                  <ImageIcon className="w-3 h-3 text-purple-400" />
                  {lang === "fa" ? "تصویر" : "Image"}
                </button>
                <button
                  type="button"
                  onClick={() => triggerPurchaseUpload("video")}
                  className="px-2 py-1 rounded bg-[#111827] border border-gray-700 hover:border-indigo-500 text-gray-400 hover:text-indigo-400 text-[10px] transition flex items-center gap-1"
                >
                  <Film className="w-3 h-3 text-blue-400" />
                  {lang === "fa" ? "ویدئو" : "Video"}
                </button>
                <button
                  type="button"
                  onClick={() => triggerPurchaseUpload("voice")}
                  className="px-2 py-1 rounded bg-[#111827] border border-gray-700 hover:border-indigo-500 text-gray-400 hover:text-indigo-400 text-[10px] transition flex items-center gap-1"
                >
                  <Mic className="w-3 h-3 text-emerald-400" />
                  {lang === "fa" ? "صوت" : "Voice"}
                </button>
                <button
                  type="button"
                  onClick={() => triggerPurchaseUpload("file")}
                  className="px-2 py-1 rounded bg-[#111827] border border-gray-700 hover:border-indigo-500 text-gray-400 hover:text-indigo-400 text-[10px] transition flex items-center gap-1"
                >
                  <Paperclip className="w-3 h-3 text-amber-400" />
                  {lang === "fa" ? "فایل" : "File"}
                </button>
                {activePurchaseAttachment && (
                  <button
                    type="button"
                    onClick={() => setActivePurchaseAttachment(null)}
                    className="px-2 py-1 rounded bg-rose-500/10 border border-rose-500/20 text-rose-400 hover:bg-rose-500/20 text-[10px] transition flex items-center gap-1 ml-auto"
                  >
                    <Trash2 className="w-3 h-3" />
                    {lang === "fa" ? "حذف رسانه" : "Remove"}
                  </button>
                )}
              </div>
              <input
                type="file"
                ref={purchaseAttachmentInputRef}
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (!file) return;
                  const reader = new FileReader();
                  reader.onload = () => {
                    setActivePurchaseAttachment({
                      fileData: reader.result as string,
                      fileName: file.name,
                      fileType: activePurchaseUploadType,
                    });
                  };
                  reader.readAsDataURL(file);
                  e.target.value = "";
                }}
              />
              {activePurchaseAttachment && (
                <div className="flex items-center gap-3 p-2 mt-2 rounded bg-gray-900 border border-indigo-500/20">
                  {activePurchaseAttachment.fileType === "image" && (
                    <img
                      src={activePurchaseAttachment.fileData}
                      alt="Preview"
                      className="w-8 h-8 rounded object-cover"
                    />
                  )}
                  {activePurchaseAttachment.fileType === "video" && (
                    <Film className="w-5 h-5 text-indigo-400" />
                  )}
                  {activePurchaseAttachment.fileType === "voice" && (
                    <Mic className="w-5 h-5 text-emerald-400" />
                  )}
                  {activePurchaseAttachment.fileType === "file" && (
                    <Paperclip className="w-5 h-5 text-amber-400" />
                  )}
                  <div className="text-[10px] text-gray-300 truncate max-w-[200px]">
                    {activePurchaseAttachment.fileName}
                  </div>
                </div>
              )}

              <span className="text-[10px] text-gray-500 mt-2 block">
                {lang === "fa"
                  ? "نکته: این متن به عنوان راهنما، بلافاصله در زیر کانفیگ صادر شده به مشتری تحویل داده می‌شود."
                  : "Tip: This text will be appended automatically beneath the premium config link upon successful customer checkout."}
              </span>
            </div>
          </div>
        </div>

        {/* Actions Save footer */}
        <div className="flex items-center justify-between pt-4 border-t border-[#1f2937]">
          <div className="flex items-center gap-2">
            <Database className="w-4 h-4 text-gray-500" />
            <span className="text-[10px] uppercase font-mono text-gray-500">
              {lang === "fa"
                ? "ذخیره‌سازی آنی در دیتابیس ربات (Daltoon_Bot.json)"
                : "Saves straight to JSON Daltoon_Bot.json"}
            </span>
          </div>

          <div className="flex items-center gap-3">
            {saved && (
              <span className="text-emerald-400 text-sm font-semibold flex items-center gap-1">
                <Check className="w-4 h-4" /> {t.parametersFlushed}
              </span>
            )}
            <button
              type="submit"
              className="inline-flex items-center gap-2 px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white rounded-lg text-sm font-semibold cursor-pointer transition shadow-lg shadow-indigo-600/10"
            >
              <Save className="w-4 h-4" />
              {lang === "fa"
                ? "ذخیره تغییرات دکمه‌ها و چیدمان"
                : "Save Button Layout & Labels"}
            </button>
          </div>
        </div>
      </form>

      {showGuidesModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-xl bg-[#0d121f] border border-gray-800 rounded-2xl shadow-2xl flex flex-col overflow-hidden max-h-[90vh]">
            <div className="p-5 border-b border-gray-800/60 flex items-center justify-between">
              <span className="text-sm font-semibold text-white flex items-center gap-2">
                <Pencil className="w-4 h-4 text-amber-400" />
                {lang === "fa"
                  ? "ویرایش توضیحات راهنمای اتصال"
                  : "Edit Connection Guide Text"}
              </span>
              <button
                type="button"
                onClick={() => setShowGuidesModal(false)}
                className="text-gray-400 hover:text-white transition duration-150 text-xl font-bold p-1 cursor-pointer"
              >
                &times;
              </button>
            </div>

            <div className="p-5 flex-1 overflow-auto space-y-3">
              <label className="block text-xs uppercase tracking-wider text-gray-400 font-semibold mb-1">
                {lang === "fa"
                  ? "📝 توضیحات برای دکمه راهنمای اتصال"
                  : "📝 Description for Connection Guide button"}
              </label>
              <textarea
                value={tempGuidesText}
                onChange={(e) => setTempGuidesText(e.target.value)}
                rows={10}
                className="w-full bg-[#161c2a] border border-gray-700/80 rounded-xl p-3.5 text-xs text-white focus:ring-1 focus:ring-indigo-500 font-medium transition resize-y leading-relaxed text-right"
                dir="rtl"
                placeholder={
                  lang === "fa"
                    ? "توضیحات دکمه آموزش را اینجا بنویسید..."
                    : "Write connection guide content here..."
                }
              />
              <p
                className="text-[10px] text-gray-400 leading-relaxed text-right"
                dir="rtl"
              >
                {lang === "fa"
                  ? "• می‌توانید از کدهای HTML مانند <b>برای ضخیم کردن متن</b> و یا <code>برای کپی سریع کلمات</code> استفاده فرمایید."
                  : "• You can use HTML codes like <b>bold</b> and <code>monospace</code> for rich formatting."}
              </p>
            </div>

            <div className="p-4 bg-[#0a0e17] border-t border-gray-800/60 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setShowGuidesModal(false)}
                className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-lg text-xs font-semibold cursor-pointer transition border border-gray-700/60"
              >
                {lang === "fa" ? "انصراف" : "Cancel"}
              </button>
              <button
                type="button"
                onClick={() => {
                  setGuidesText(tempGuidesText);
                  onSaveSettings({
                    ...settings,
                    btnTextBuyNew,
                    btnTextMySubs,
                    btnTextGuides,
                    guidesText: tempGuidesText,
                    btnTextProfile,
                    btnTextSupport,
                    btnTextTicketSupport,
                    btnTextFreeTest,
                    btnTextInstantSupport,
                    btnTextFeedback,
                    btnTextReferral,
                    btnTextWallet,
                    btnTextColleagues,
                    btnTextAiChat,
                    btnTextAi,
                    hideBtnBuyNew,
                    hideBtnMySubs,
                    hideBtnGuides,
                    hideBtnProfile,
                    hideBtnSupport,
                    hideBtnTicketSupport,
                    hideBtnFreeTest,
                    hideBtnInstantSupport,
                    hideBtnFeedback,
                    hideBtnReferral,
                    hideBtnWallet,
                    hideBtnColleagues,
                    hideBtnAiChat,
                    hideBtnAi,
                    keyboardLayout,
                    mainButtonsOrder,
                    walletChargeAmounts,
                    guideVideoHapp,
                    guideVideoIos,
                    guideVideoAndroid,
                    guideVideoV2rayn,
                    guideVideoKaring,
                    guideVideoMac,
                    guideVideoLinux,
                  });
                  setShowGuidesModal(false);
                }}
                className="px-5 py-2 bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 text-white rounded-lg text-xs font-semibold cursor-pointer transition shadow-lg shadow-emerald-600/10 flex items-center gap-1.5"
              >
                <Check className="w-3.5 h-3.5" />
                {lang === "fa" ? "ذخیره نهایی و بستن" : "Save Changes & Close"}
              </button>
            </div>
          </div>
        </div>
      )}



      {/* Wallet Charge Amounts Modal */}
      {showWalletAmountsModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center p-4 z-50 animate-fade-in font-sans">
          <div className="bg-[#111827] border border-slate-700/60 p-6 rounded-2xl w-full max-w-lg shadow-[0_0_40px_rgba(0,0,0,0.5)] max-h-[85vh] overflow-y-auto">
            <h3 className="text-lg font-bold text-white mb-2 flex items-center gap-2">
              <Coins className="w-5 h-5 text-amber-400" />
              {lang === "fa"
                ? "تنظیم مبالغ شارژ کیف پول"
                : "Wallet Charge Amounts"}
            </h3>
            <p className="text-xs text-gray-400 mb-5 leading-relaxed">
              {lang === "fa"
                ? "مبالغی که جهت دکمه‌های شارژ سریع در ربات برای افزایش موجودی نمایش داده می‌شود را مشخص کنید (به تومان). کاربران با انتخاب هرکدام، لینک پرداخت کارت‌به‌کارت دریافت می‌کنند."
                : "Set preset charge amounts (in Tomans) for quick recharging buttons in the bot. Users will be shown these ready options."}
            </p>

            <div className="space-y-3">
              {tempChargeAmounts.map((amt, idx) => (
                <div
                  key={idx}
                  className="flex gap-2 items-center bg-[#0a0e17] p-2.5 rounded-xl border border-slate-800"
                >
                  <div className="text-gray-500 font-mono text-xs w-6 text-center">
                    #{idx + 1}
                  </div>
                  <input
                    type="number"
                    className="flex-1 bg-[#1b2230] border border-gray-700/80 rounded-lg p-2 text-xs text-white focus:ring-1 focus:ring-indigo-500 font-medium font-mono"
                    value={amt || ""}
                    onChange={(e) => {
                      const val = e.target.value === "" ? 0 : parseInt(e.target.value) || 0;
                      const copy = [...tempChargeAmounts];
                      copy[idx] = val;
                      setTempChargeAmounts(copy);
                    }}
                    placeholder="مبلغ به تومان"
                  />
                  <div className="text-[10px] text-gray-400 font-mono font-bold w-28 text-left">
                    {amt > 0 ? `${amt.toLocaleString()} تومان` : "۰"}
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setTempChargeAmounts(
                        tempChargeAmounts.filter((_, i) => i !== idx),
                      );
                    }}
                    className="p-1 px-2 text-red-400 hover:bg-red-500/10 rounded-lg border border-red-500/10 transition cursor-pointer"
                    title={lang === "fa" ? "حذف" : "Remove"}
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}

              {tempChargeAmounts.length === 0 && (
                <p className="text-xs text-center text-gray-500 py-4">
                  {lang === "fa"
                    ? "هیچ مبلغی تعریف نشده است."
                    : "No amounts defined."}
                </p>
              )}
            </div>

            <button
              type="button"
              onClick={() => {
                setTempChargeAmounts([...tempChargeAmounts, 100000]);
              }}
              className="mt-4 w-full py-2 border border-dashed border-gray-700 hover:border-gray-500 text-indigo-400 text-xs flex items-center justify-center gap-1.5 rounded-xl transition cursor-pointer hover:bg-indigo-500/5 font-semibold"
            >
              <Plus className="w-4 h-4" />
              {lang === "fa" ? "افزودن مبلغ جدید" : "Add New Preset Amount"}
            </button>

            <div className="flex justify-end gap-3 mt-6 border-t border-gray-800/60 pt-4">
              <button
                type="button"
                onClick={() => {
                  setShowWalletAmountsModal(false);
                }}
                className="px-4 py-2 bg-[#1f2937] hover:bg-slate-700 text-gray-300 rounded-lg text-xs font-semibold cursor-pointer transition border border-slate-700/50 hover:border-slate-600"
              >
                {lang === "fa" ? "انصراف" : "Cancel"}
              </button>
              <button
                type="button"
                onClick={() => {
                  setWalletChargeAmounts(tempChargeAmounts);
                  onSaveSettings({
                    ...settings,
                    btnTextBuyNew,
                    btnTextMySubs,
                    btnTextGuides,
                    guidesText,
                    btnTextProfile,
                    btnTextSupport,
                    btnTextTicketSupport,
                    btnTextFreeTest,
                    btnTextInstantSupport,
                    btnTextFeedback,
                    btnTextReferral,
                    btnTextWallet,
                    btnTextColleagues,
                    btnTextAiChat,
                    btnTextAi,
                    hideBtnBuyNew,
                    hideBtnMySubs,
                    hideBtnGuides,
                    hideBtnProfile,
                    hideBtnSupport,
                    hideBtnTicketSupport,
                    hideBtnFreeTest,
                    hideBtnInstantSupport,
                    hideBtnFeedback,
                    hideBtnReferral,
                    hideBtnWallet,
                    hideBtnColleagues,
                    hideBtnAiChat,
                    hideBtnAi,
                    keyboardLayout,
                    mainButtonsOrder,
                    walletChargeAmounts: tempChargeAmounts,
                  });
                  setShowWalletAmountsModal(false);
                }}
                className="px-5 py-2 bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 text-white rounded-lg text-xs font-semibold cursor-pointer transition shadow-lg shadow-emerald-600/10 flex items-center gap-1.5"
              >
                <Check className="w-3.5 h-3.5" />
                {lang === "fa" ? "ذخیره و تایید" : "Save Changes"}
              </button>
            </div>
          </div>
        </div>
      )}

      <ConfirmationModal
        isOpen={deleteConfirmConfig.isOpen}
        message={deleteConfirmConfig.message}
        lang={lang}
        isDangerous={true}
        onCancel={() =>
          setDeleteConfirmConfig({ isOpen: false, action: null, message: "" })
        }
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
