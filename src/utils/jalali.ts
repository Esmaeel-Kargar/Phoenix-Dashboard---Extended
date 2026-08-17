/**
 * Solar Hijri (Jalali / Shamsi) & Gregorian calendar calculations
 * Pure, reliable, zero-dependency implementation
 */

export interface JalaliDate {
  jy: number; // Jalali year (e.g. 1405)
  jm: number; // Jalali month (1 - 12)
  jd: number; // Jalali day (1 - 31)
}

export interface GregorianDate {
  gy: number;
  gm: number;
  gd: number;
}

export const PERSIAN_MONTHS = [
  'فروردین',
  'اردیبهشت',
  'خرداد',
  'تیر',
  'مرداد',
  'شهریور',
  'مهر',
  'آبان',
  'آذر',
  'دی',
  'بهمن',
  'اسفند',
];

export const GREGORIAN_MONTHS_EN = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
];

export const PERSIAN_WEEKDAYS = [
  'شنبه',
  'یکشنبه',
  'دوشنبه',
  'سه‌شنبه',
  'چهارشنبه',
  'پنج‌شنبه',
  'جمعه',
];

export const ENGLISH_WEEKDAYS = [
  'Saturday',
  'Sunday',
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
];

// Gregorian to Jalali conversion algorithm
export function gregorianToJalali(gy: number, gm: number, gd: number): JalaliDate {
  const g_d_m = [0, 31, 59, 90, 120, 151, 181, 212, 243, 273, 304, 334];
  let gy2 = gm > 2 ? gy + 1 : gy;
  let days =
    355666 +
    (365 * gy) +
    Math.floor((gy2 + 3) / 4) -
    Math.floor((gy2 + 99) / 100) +
    Math.floor((gy2 + 399) / 400) +
    gd +
    g_d_m[gm - 1];
  let jy = -1595 + (33 * Math.floor(days / 12053));
  days %= 12053;
  jy += 4 * Math.floor(days / 1461);
  days %= 1461;
  if (days > 365) {
    jy += Math.floor((days - 1) / 365);
    days = (days - 1) % 365;
  }
  let jm: number;
  let jd: number;
  if (days < 186) {
    jm = 1 + Math.floor(days / 31);
    jd = 1 + (days % 31);
  } else {
    jm = 7 + Math.floor((days - 186) / 30);
    jd = 1 + ((days - 186) % 30);
  }
  return { jy, jm, jd };
}

// Jalali to Gregorian conversion algorithm
export function jalaliToGregorian(jy: number, jm: number, jd: number): GregorianDate {
  jy += 1595;
  let days =
    -355668 +
    (365 * jy) +
    (Math.floor(jy / 33) * 8) +
    Math.floor(((jy % 33) + 3) / 4) +
    jd +
    (jm < 7 ? (jm - 1) * 31 : ((jm - 7) * 30) + 186);
  let gy = 400 * Math.floor(days / 146097);
  days %= 146097;
  if (days > 36524) {
    gy += 100 * Math.floor(--days / 36524);
    days %= 36524;
    if (days >= 365) days++;
  }
  gy += 4 * Math.floor(days / 1461);
  days %= 1461;
  if (days > 365) {
    gy += Math.floor((days - 1) / 365);
    days = (days - 1) % 365;
  }
  const sal_a = [0, 31, ((gy % 4 === 0 && gy % 100 !== 0) || gy % 400 === 0) ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
  let gm = 0;
  while (gm < 13 && days >= sal_a[gm]) {
    days -= sal_a[gm];
    gm++;
  }
  let gd = days + 1;
  return { gy, gm, gd };
}

export function toPersianDigits(num: number | string): string {
  const farsiDigits = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'];
  return String(num).replace(/[0-9]/g, (w) => farsiDigits[+w]);
}

export function formatCurrency(amount: number, currency: string = 'TMN', isPersian: boolean = true): string {
  const formatted = new Intl.NumberFormat('en-US', {
    maximumFractionDigits: currency === 'BTC' || currency === 'ETH' ? 6 : 2,
  }).format(amount);
  if (isPersian) {
    const persianNum = toPersianDigits(formatted);
    switch (currency) {
      case 'TMN': return `${persianNum} تومان`;
      case 'IRR': return `${persianNum} ریال`;
      case 'USD': return `${persianNum} دلار ($)`;
      case 'EUR': return `${persianNum} یورو (€)`;
      case 'USDT': return `${persianNum} تتر (USDT)`;
      case 'BTC': return `${persianNum} بیت‌کوین (BTC)`;
      case 'ETH': return `${persianNum} اتریوم (ETH)`;
      case 'TON': return `${persianNum} تون (TON)`;
      case 'SOL': return `${persianNum} سولانا (SOL)`;
      case 'CRYPTO': return `${persianNum} کریپتو`;
      default: return `${persianNum} ${currency}`;
    }
  }
  return `${currency} ${formatted}`;
}

export function getPersianWeekdayIndex(date: Date): number {
  // JavaScript getDay(): 0 = Sun, 1 = Mon, 2 = Tue, 3 = Wed, 4 = Thu, 5 = Fri, 6 = Sat
  // Persian Week: 0 = Shanbeh (Sat), 1 = Yekshanbeh (Sun), 2 = Doshanbeh (Mon), ... 6 = Jomeh (Fri)
  const day = date.getDay();
  return (day + 1) % 7;
}

export function getFormattedDateInfo(date: Date) {
  const gy = date.getFullYear();
  const gm = date.getMonth() + 1;
  const gd = date.getDate();
  const jalali = gregorianToJalali(gy, gm, gd);

  const weekdayIdx = getPersianWeekdayIndex(date);
  const persianWeekday = PERSIAN_WEEKDAYS[weekdayIdx];
  const englishWeekday = ENGLISH_WEEKDAYS[weekdayIdx];
  const persianMonth = PERSIAN_MONTHS[jalali.jm - 1];
  const englishMonth = GREGORIAN_MONTHS_EN[gm - 1];

  const dateKey = `${gy}-${String(gm).padStart(2, '0')}-${String(gd).padStart(2, '0')}`;
  const jalaliKey = `${jalali.jy}/${String(jalali.jm).padStart(2, '0')}/${String(jalali.jd).padStart(2, '0')}`;

  // Season in Persian calendar
  let seasonFa = 'بهار';
  let seasonEn = 'Spring';
  if (jalali.jm >= 4 && jalali.jm <= 6) {
    seasonFa = 'تابستان';
    seasonEn = 'Summer';
  } else if (jalali.jm >= 7 && jalali.jm <= 9) {
    seasonFa = 'پاییز';
    seasonEn = 'Autumn';
  } else if (jalali.jm >= 10 && jalali.jm <= 12) {
    seasonFa = 'زمستان';
    seasonEn = 'Winter';
  }

  return {
    gy,
    gm,
    gd,
    jy: jalali.jy,
    jm: jalali.jm,
    jd: jalali.jd,
    persianWeekday,
    englishWeekday,
    persianMonth,
    englishMonth,
    dateKey,
    jalaliKey,
    seasonFa: `${seasonFa} ${jalali.jy}`,
    seasonEn: `${seasonEn} ${gy}`,
  };
}

// Persian and Gregorian Occasions / Holidays sample database
export const OCCASIONS_DATABASE: Record<string, { fa: string; en: string; holiday: boolean }[]> = {
  // Mordad (Month 5)
  '5-23': [
    { fa: 'روز جهانی چپ‌دست‌ها (گرامی‌داشت تنوع مهارت‌ها)', en: 'International Left-Handers Day', holiday: false },
    { fa: 'پیک کاری میانه تابستان و ارزیابی فصلی', en: 'Mid-Summer Sprint Review', holiday: false },
  ],
  '5-24': [
    { fa: 'روز مقاومت اسلامی', en: 'Islamic Resistance Day', holiday: false },
  ],
  '5-28': [
    { fa: 'سالروز کودتای ۲۸ مرداد / روز جهانی عکاسی', en: 'World Photography Day', holiday: false },
  ],
  '5-30': [
    { fa: 'روز بزرگداشت علامه مجلسی', en: 'Commemoration of Allameh Majlesi', holiday: false },
  ],
  '6-01': [
    { fa: 'روز پزشک و بزرگداشت ابوعلی سینا', en: 'Doctors Day (Avicenna Commemoration)', holiday: false },
  ],
  '6-05': [
    { fa: 'روز داروسازی و بزرگداشت زکریای رازی', en: 'Pharmacist Day (Razi Commemoration)', holiday: false },
  ],
  '1-01': [{ fa: 'جشن نوروز / آغاز سال نو خورشیدی', en: 'Nowruz (Persian New Year)', holiday: true }],
  '1-02': [{ fa: 'عید نوروز', en: 'Nowruz Holiday', holiday: true }],
  '1-03': [{ fa: 'عید نوروز', en: 'Nowruz Holiday', holiday: true }],
  '1-04': [{ fa: 'عید نوروز', en: 'Nowruz Holiday', holiday: true }],
  '1-12': [{ fa: 'روز جمهوری اسلامی', en: 'Islamic Republic Day', holiday: true }],
  '1-13': [{ fa: 'روز طبیعت (سیزده‌بدر)', en: 'Nature Day (Sizdah Bedar)', holiday: true }],
};

export function getOccasionsForDate(jm: number, jd: number, gm: number, gd: number) {
  const shamsiKey = `${jm}-${String(jd).padStart(2, '0')}`;
  const occasions = OCCASIONS_DATABASE[shamsiKey] || [];
  
  if (occasions.length === 0) {
    // Default fallback occasion for days with no specific national holiday
    return [
      { fa: 'روز کاری فعال - برنامه‌ریزی و پیگیری اهداف فصلی', en: 'Productive Workday - Season Milestone Focus', holiday: false },
      { fa: 'رویداد تقویم: پیگیری تعهدات مالی و کانال‌ها', en: 'Calendar Check: Financials & Task Review', holiday: false },
    ];
  }
  return occasions;
}
