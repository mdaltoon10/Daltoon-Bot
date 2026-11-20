// Date & Time Utility with Timezone & Calendar support (Shamsi / Jalali, Gregorian)

export type CalendarType = "jalali" | "gregorian";
export type CalendarSystem = CalendarType;

export const DEFAULT_TIMEZONE = "Asia/Tehran";
export const DEFAULT_CALENDAR: CalendarType = "jalali";

export const TIMEZONE_OPTIONS = [
  { value: "Asia/Tehran", label: "ایران - تهران (Asia/Tehran - UTC+03:30)", offset: "+03:30" },
  { value: "UTC", label: "ساعت هماهنگ جهانی (UTC - GMT)", offset: "+00:00" },
  { value: "Asia/Dubai", label: "امارات - دبی (Asia/Dubai - UTC+04:00)", offset: "+04:00" },
  { value: "Europe/Istanbul", label: "ترکیه - استانبول (Europe/Istanbul - UTC+03:00)", offset: "+03:00" },
  { value: "Asia/Kabul", label: "افغانستان - کابل (Asia/Kabul - UTC+04:30)", offset: "+04:30" },
  { value: "Asia/Riyadh", label: "عربستان - ریاض (Asia/Riyadh - UTC+03:00)", offset: "+03:00" },
  { value: "Asia/Baku", label: "آذربایجان - باکو (Asia/Baku - UTC+04:00)", offset: "+04:00" },
  { value: "Europe/London", label: "بریتانیا - لندن (Europe/London - UTC+00:00)", offset: "+00:00" },
  { value: "Europe/Berlin", label: "آلمان - برلین (Europe/Berlin - UTC+01:00)", offset: "+01:00" },
  { value: "Europe/Paris", label: "فرانسه - پاریس (Europe/Paris - UTC+01:00)", offset: "+01:00" },
  { value: "America/New_York", label: "آمریکا - نیویورک (America/New_York - UTC-05:00)", offset: "-05:00" },
  { value: "America/Los_Angeles", label: "آمریکا - لس‌آنجلس (America/Los_Angeles - UTC-08:00)", offset: "-08:00" },
  { value: "Asia/Tokyo", label: "ژاپن - توکیو (Asia/Tokyo - UTC+09:00)", offset: "+09:00" },
  { value: "Asia/Bangkok", label: "تایلند - بانکوک (Asia/Bangkok - UTC+07:00)", offset: "+07:00" },
  { value: "Australia/Sydney", label: "استرالیا - سیدنی (Australia/Sydney - UTC+10:00)", offset: "+10:00" },
];

export const COMMON_TIMEZONES = TIMEZONE_OPTIONS;

/**
 * Format a Date object, ISO string, or timestamp according to the selected timezone and calendar type.
 */
export function formatFormattedDateTime(
  dateInput: string | number | Date | null | undefined,
  timeZone: string = DEFAULT_TIMEZONE,
  calendarType: CalendarType = DEFAULT_CALENDAR,
  includeTime: boolean = true
): string {
  if (!dateInput) return "نامشخص";

  try {
    let dateObj: Date;
    if (typeof dateInput === "number") {
      // If timestamp in seconds vs milliseconds
      dateObj = new Date(dateInput > 1e11 ? dateInput : dateInput * 1000);
    } else if (typeof dateInput === "string") {
      let str = dateInput.trim();
      // If string looks like ISO timestamp without timezone offset, append 'Z' to treat as UTC
      if (/^\d{4}-\d{2}-\d{2}[T ]\d{2}:\d{2}:\d{2}(\.\d+)?$/.test(str)) {
        str = str.replace(" ", "T") + "Z";
      }
      const parsedMs = Date.parse(str);
      if (!isNaN(parsedMs)) {
        dateObj = new Date(parsedMs);
      } else if (!isNaN(Number(str))) {
        const num = Number(str);
        dateObj = new Date(num > 1e11 ? num : num * 1000);
      } else {
        dateObj = new Date(str);
      }
    } else {
      dateObj = dateInput;
    }

    if (isNaN(dateObj.getTime())) return String(dateInput);

    const tz = timeZone || DEFAULT_TIMEZONE;

    // Determine target locale/calendar tag for Intl
    let calendarTag = "persian";
    if (calendarType === "gregorian") calendarTag = "gregory";

    const localeStr = `fa-IR-u-ca-${calendarTag}`;

    const options: Intl.DateTimeFormatOptions = {
      timeZone: tz,
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    };

    if (includeTime) {
      options.hour = "2-digit";
      options.minute = "2-digit";
      options.second = "2-digit";
      options.hour12 = false;
    }

    const formatter = new Intl.DateTimeFormat(localeStr, options);
    return formatter.format(dateObj);
  } catch (e) {
    console.warn("Error formatting date:", e);
    return String(dateInput);
  }
}

export function formatDateTime(
  dateInput: string | number | Date | null | undefined,
  options?: { timeZone?: string; calendarSystem?: CalendarSystem; includeTime?: boolean }
): string {
  const tz = options?.timeZone || DEFAULT_TIMEZONE;
  const cal = options?.calendarSystem || DEFAULT_CALENDAR;
  const incTime = options?.includeTime !== false;
  return formatFormattedDateTime(dateInput, tz, cal, incTime);
}
