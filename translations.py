# -*- coding: utf-8 -*-

TRANSLATIONS = {
    'en': {
        'welcome': "Hello dear user, welcome to Daltoon Bot! 🤖\n\nYou can buy high-speed subscriptions or top-up your wallet right now.",
        'buy_plan': "🛍️ Buy Plan",
        'my_account': "👤 My Account",
        'top_up': "💳 Top-up Wallet",
        'support': "📞 Support",
        'error_invalid_days': "❌ <b>Error: Invalid number of days or below limit!</b>\n\nMinimum renewal on this server is <b>{} days</b>. Please enter a number between {} and 365:",
        'error_sub_not_found': "❌ Error: Subscription not found.",
        'invoice_title': "🔄 <b>Renewal & Upgrade Pre-invoice</b>",
        'client_name': "👤 Service Username",
        'extra_traffic': "➕ Extra Traffic",
        'extra_days': "➕ Renewal Duration",
        'price_per_gb': "💵 Price per GB",
        'price_per_day': "💵 Price per Day",
        'total_cost': "💰 <b>Total Renewal Cost</b>",
        'select_payment': "💳 <b>Please select your payment method:</b>",
        'pay_wallet': "💰 Pay from Wallet Balance",
        'pay_card': "💳 Card-to-Card Payment",
        'pay_stars': "⭐️ Pay with Telegram Stars",
        'cancel': "❌ Cancel",
        'admin_confirm': "🎁 Direct Approval (Free for Admin)",
        'gb_unit': "GB",
        'days_unit': "Days",
        'toman_unit': "Toman",
    },
    'fa': {
        'welcome': "سلام کاربر گرامی، به ربات دالتون خوش آمدید! 🤖\n\nمی‌توانید هم‌اکنون اشتراک پرسرعت تهیه کنید یا کیف پول خود را شارژ کنید.",
        'buy_plan': "🛍️ خرید سرویس",
        'my_account': "👤 حساب من",
        'top_up': "💳 شارژ کیف پول",
        'support': "📞 پشتیبانی",
        'error_invalid_days': "❌ <b>خطا: تعداد روزها نامعتبر یا کمتر از حد مجاز است!</b>\n\nحداقل مدت تمدید روی این سرور <b>{} روز</b> می‌باشد. لطفاً یک عدد بین {} تا ۳۶۵ وارد کنید:",
        'error_sub_not_found': "❌ خطا: اشتراک یافت نشد.",
        'invoice_title': "🔄 <b>پیش‌فاکتور تمدید و ارتقای اشتراک</b>",
        'client_name': "👤 نام کاربری سرویس",
        'extra_traffic': "➕ حجم ترافیک اضافی",
        'extra_days': "➕ مدت زمان تمدید",
        'price_per_gb': "💵 قیمت هر گیگابایت",
        'price_per_day': "💵 قیمت هر روز",
        'total_cost': "💰 <b>جمع کل هزینه تمدید</b>",
        'select_payment': "💳 <b>لطفاً روش پرداخت خود را انتخاب کنید:</b>",
        'pay_wallet': "💰 پرداخت از موجودی کیف پول",
        'pay_card': "💳 پرداخت کارت به کارت",
        'pay_stars': "⭐️ پرداخت با Stars تلگرام",
        'cancel': "❌ لغو",
        'admin_confirm': "🎁 تایید مستقیم (رایگان برای ادمین)",
        'gb_unit': "گیگابایت",
        'days_unit': "روز",
        'toman_unit': "تومان",
    },
    'ar': {
        'welcome': "أهلاً بك يا عزيزي في بوت دالتون! 🤖\n\nيمكنك شراء اشتراكات عالية السرعة أو شحن محفظتك الآن.",
        'buy_plan': "🛍️ شراء اشتراك",
        'my_account': "👤 حسابي",
        'top_up': "💳 شحن المحفظة",
        'support': "📞 الدعم الفني",
        'error_invalid_days': "❌ <b>خطأ: عدد الأيام غير صالح أو أقل من الحد المسموح به!</b>\n\nالحد الأدنى للتجديد على هذا السيرفر هو <b>{} أيام</b>. يرجى إدخال رقم بين {} و 365:",
        'error_sub_not_found': "❌ خطأ: الاشتراك غیر موجود.",
        'invoice_title': "🔄 <b>فاتورة التجديد والترقية</b>",
        'client_name': "👤 اسم مستخدم الخدمة",
        'extra_traffic': "➕ الترافيك الإضافي",
        'extra_days': "➕ مدة التجديد",
        'price_per_gb': "💵 سعر الجيجابايت",
        'price_per_day': "💵 السعر لليوم",
        'total_cost': "💰 <b>إجمالي تكلفة التجديد</b>",
        'select_payment': "💳 <b>يرجى اختيار طريقة الدفع:</b>",
        'pay_wallet': "💰 الدفع من رصيد المحفظة",
        'pay_card': "💳 الدفع من بطاقة لبطاقة",
        'pay_stars': "⭐️ الدفع بـ نجوم تلغرام",
        'cancel': "❌ إلغاء",
        'admin_confirm': "🎁 موافقة مباشرة (مجاني للمسؤول)",
        'gb_unit': "جيجابايت",
        'days_unit': "يوم",
        'toman_unit': "تومان",
    }
}

def get_text(key, lang='fa', *args):
    lang_dict = TRANSLATIONS.get(lang, TRANSLATIONS['en'])
    text = lang_dict.get(key, TRANSLATIONS['en'].get(key, key))
    if args:
        try:
            return text.format(*args)
        except:
            return text
    return text
