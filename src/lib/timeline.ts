/**
 * Static timeline of the workshop's history, in Persian calendar years.
 * Kept in the frontend by design: there is no backend, and the content
 * changes only with the studio's own pace.
 */
export interface TimelineEvent {
  readonly year: number;
  readonly title: string;
  readonly description: string;
  readonly highlight?: boolean;
}

export const TIMELINE: readonly TimelineEvent[] = [
  {
    year: 1385,
    title: "نخستین تراش",
    description:
      "یک کارگاه کوچک در حیاط خانه، یک دستگاه خراطی دست‌ساز، و اولین کاسه از چوب توت. تمام چیزی که بود.",
  },
  {
    year: 1387,
    title: "راه‌یافتن به بازار محلی",
    description:
      "کاسه‌ها به بازار میوه و تره‌بار محلی راه یافتند. سفارش‌ها بیشتر از توان یک نفر شد.",
  },
  {
    year: 1389,
    title: "اولین کارگاه مستقل",
    description:
      "اجاره‌ی سوله‌ای در حاشیه‌ی شهر و برپایی کارگاهی که تا امروز پابرجاست.",
  },
  {
    year: 1391,
    title: "تخصص در چوب گردو",
    description:
      "تصمیم گرفتیم فقط روی چوب گردو کار کنیم. رگه‌های تیره‌اش چیزی داشت که با آن ماندیم.",
    highlight: true,
  },
  {
    year: 1393,
    title: "شروع صادرات",
    description:
      "نخستین سفارش‌های بین‌المللی به ترکیه و امارات. بسته‌بندی و حمل، درس تازه‌ای بود.",
  },
  {
    year: 1395,
    title: "ده‌ساله شدن",
    description:
      "ده سال از نخستین تراش گذشته بود. یک کاسه‌ی یادبود از چوب بلوط کهنسال ساختیم.",
  },
  {
    year: 1397,
    title: "ورود نسل دوم",
    description: "فرزند بزرگ‌تر وارد کارگاه شد. ترکیب تجربه‌ی دست و نگاه تازه.",
  },
  {
    year: 1399,
    title: "کارگاه دوم",
    description:
      "گسترش به فضایی بزرگ‌تر با نور شمالی، برای خشک کردن طبیعی چوب در طول سال.",
    highlight: true,
  },
  {
    year: 1401,
    title: "همکاری با معماران",
    description:
      "شروع همکاری با معماران داخلی برای ساخت عناصر سفارشی چوبی در پروژه‌های مسکونی.",
  },
  {
    year: 1403,
    title: "ورکشاپ آموزش",
    description: "برگزاری نخستین دوره‌های آموزش خراطی چوب برای علاقه‌مندان.",
  },
  {
    year: 1405,
    title: "امروز",
    description:
      "همان کارگاه، همان دست‌ها، اما کاسه‌هایی که در خانه‌های بسیاری جا باز کرده‌اند.",
    highlight: true,
  },
] as const;
