import { FESTIVAL_DATES } from "./festival-dates.generated.js";

function utc(year, month, day = 1) {
  const date = new Date(0);
  date.setUTCFullYear(year, month, day);
  return date;
}

const weekdayIndex = (date) => (date.getUTCDay() + 6) % 7;
export const WEEKDAYS = ["一", "二", "三", "四", "五", "六", "日"];

function preset(name, scene) {
  return { id: "preset:" + name, name, scene };
}

const fixedFestivals = {
  "01-01": preset("元旦", "clock"),
  "02-14": preset("情人节", "hearts"),
  "05-01": preset("劳动节", "sparks"),
  "06-01": preset("儿童节", "kites"),
  "10-01": preset("国庆节", "silk"),
  "12-25": preset("圣诞节", "snow"),
  "12-31": preset("跨年夜", "fireworks"),
};

const mothersDay = preset("母亲节", "petals");
const fathersDay = preset("父亲节", "starlight");

const traditionalFestivals = {
  eve: preset("除夕", "crackers"),
  spring: preset("春节", "lanterns"),
  lantern: preset("元宵节", "riddles"),
  qingming: preset("清明节", "rain"),
  dragonBoat: preset("端午节", "ripples"),
  qixi: preset("七夕", "magpies"),
  midAutumn: preset("中秋节", "moon"),
  doubleNinth: preset("重阳节", "chrysanthemums"),
  winterSolstice: preset("冬至", "frost"),
};

const festivalsByDate = new Map();
for (const [id, dates] of Object.entries(FESTIVAL_DATES)) {
  for (const date of dates) {
    const festivals = festivalsByDate.get(date) ?? [];
    festivalsByDate.set(date, [...festivals, traditionalFestivals[id]]);
  }
}

export const KEYFRAMES = [
  { year: 2027, month: 1, day: 6 },
  { year: 2027, month: 1, day: 14 },
  { year: 2027, month: 1, day: 20 },
  { year: 2027, month: 3, day: 5 },
  { year: 2027, month: 4, day: 1 },
  { year: 2027, month: 4, day: 9 },
  { year: 2027, month: 5, day: 1 },
  { year: 2027, month: 5, day: 9 },
  { year: 2027, month: 5, day: 20 },
  { year: 2027, month: 7, day: 8 },
  { year: 2027, month: 8, day: 15 },
  { year: 2027, month: 9, day: 1 },
  { year: 2027, month: 9, day: 8 },
  { year: 2027, month: 11, day: 22 },
  { year: 2027, month: 11, day: 25 },
  { year: 2027, month: 11, day: 31, hold: 5550 },
  { year: 2028, month: 0, day: 1 },
  { year: 2028, month: 0, day: 25 },
];

export function asKey({ year, month, day }) {
  return utc(year, month, day).toISOString().split("T")[0];
}

export function dateFromKey(value) {
  if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return null;
  const [year, month, day] = value.split("-").map(Number);
  const date = { year, month: month - 1, day };
  return year > 0 && asKey(date) === value ? date : null;
}

function fromDate(date) {
  return { year: date.getUTCFullYear(), month: date.getUTCMonth(), day: date.getUTCDate() };
}

function monthLabel({ year, month }) {
  return year + "年" + (month + 1) + "月";
}

function dateLabel(date) {
  return monthLabel(date) + date.day + "日";
}

export function presetFestivalsOn(date, key = asKey(date)) {
  const events = [...(festivalsByDate.get(key) ?? [])];
  const fixed = fixedFestivals[key.slice(-5)];
  if (fixed) events.push(fixed);
  const { year, month, day } = date;
  if (month === 4 && day >= 8 && day <= 14 && utc(year, month, day).getUTCDay() === 0) {
    events.push(mothersDay);
  }
  if (month === 5 && day >= 15 && day <= 21 && utc(year, month, day).getUTCDay() === 0) {
    events.push(fathersDay);
  }
  return events;
}

export function stepDate(date, days) {
  return fromDate(utc(date.year, date.month, date.day + days));
}

export function stepMonth({ year, month }, delta) {
  const next = fromDate(utc(year, month + delta));
  return { ...next, day: null };
}

export function calendarGrid({ year, month }, personalFestivals = []) {
  const offset = weekdayIndex(utc(year, month));
  const lastDay = utc(year, month + 1, 0).getUTCDate();
  const rows = Math.max(5, Math.ceil((offset + lastDay) / 7));
  return Array.from({ length: rows * 7 }, (_, index) => {
    const date = utc(year, month, index - offset + 1);
    const key = date.toISOString().split("T")[0];
    const item = fromDate(date);
    const label = dateLabel(item) + "星期" + WEEKDAYS[weekdayIndex(date)];
    const personal = personalFestivals.filter((event) => event.repeat ? event.date.slice(-5) === key.slice(-5) : event.date === key);
    return { ...item, key, label, events: [...personal, ...presetFestivalsOn(item, key)], inMonth: item.month === month };
  });
}

export function displayLabels(date, event) {
  const { year, month, day } = date;
  const monthName = monthLabel(date);
  const caption = day === null ? "节日日历" : dateLabel(date) + " · 周" + WEEKDAYS[weekdayIndex(utc(year, month, day))];
  return { title: event?.name ?? monthName, date: caption, month: monthName, scene: event?.scene ?? "idle" };
}
