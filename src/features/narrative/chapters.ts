import { CHAPTER_BOUNDS, CHAPTER_ORDER, type ChapterId } from "@/lib/constants";
import { clamp } from "@/lib/math";

export interface Chapter {
  readonly id: ChapterId;
  readonly index: number;
  readonly kicker: string;
  readonly title: string;
  readonly body: string;
  readonly start: number;
  readonly end: number;
}

export const CHAPTERS: readonly Chapter[] = [
  {
    id: "tree",
    index: 0,
    kicker: "01",
    title: "از دل طبیعت تا یک اثر ماندگار",
    body:
      "هر کاسه چوبی داستانی از طبیعیت ، هنر و دقت است" +
      "در اینجا می توانید مراحل تبدیل یک کنده درخت به یک کاسه دست ساز و منحصر به فرد را ببینید.",
    start: CHAPTER_BOUNDS.tree.start,
    end: CHAPTER_BOUNDS.tree.end,
  },
  {
    id: "cut",
    index: 1,
    kicker: "02",
    title: "برش اولیه",
    body:
      "ابتدا کنده درخت به اندازه های مناسب برش داده می شود" +
      "این مرحله باعث می شود چوب آماده مراحل بعدی و شکل دهی دقیق تر شود",
    start: CHAPTER_BOUNDS.cut.start,
    end: CHAPTER_BOUNDS.cut.end,
  },
  {
    id: "prepare",
    index: 2,
    kicker: "03",
    title: "حفره کاری و پرداخت جزئیات",
    body:
      "پس از شکل دهی سطح داخلی و خارجی با ابزار های دستی و دستگاه های مختلف صاف و یکدست می شود" +
      "در این مرحله جزئیات نهایی و ظرافت کار شکل می گیرد",
    start: CHAPTER_BOUNDS.prepare.start,
    end: CHAPTER_BOUNDS.prepare.end,
  },
  {
    id: "lathe",
    index: 3,
    kicker: "04",
    title: "صیقل کاری و پرداخت نهایی",
    body:
      "در این مرحله سطح کاسه با سنباده های مختلف صیقل داده می شود تا بافت چوب بهتر نمایان شود" +
      "و سطحی نرم و لطیف به دست آید",
    start: CHAPTER_BOUNDS.lathe.start,
    end: CHAPTER_BOUNDS.lathe.end,
  },
  {
    id: "bowl",
    index: 4,
    kicker: "05",
    title: "نتیجه نهایی",
    body:
      "در پایان کاسه زیبا ، مقاوم و منحصر به فرد آماده استفاده خواهد بود" +
      "یک اثر هنری طبیعی با ارزش و ماندگار",
    start: CHAPTER_BOUNDS.bowl.start,
    end: CHAPTER_BOUNDS.bowl.end,
  },
] as const;

export function chapterAt(progress: number): Chapter {
  const p = clamp(progress, 0, 1);
  for (const chapter of CHAPTERS) {
    if (p >= chapter.start && p < chapter.end) {
      return chapter;
    }
  }
  const last = CHAPTERS[CHAPTERS.length - 1];
  if (!last) {
    throw new Error("CHAPTERS is empty");
  }
  return last;
}

export function chapterProgress(
  progress: number,
  chapterId: ChapterId,
): number {
  const bounds = CHAPTER_BOUNDS[chapterId];
  const span = bounds.end - bounds.start;
  if (span <= 0) {
    throw new Error(`Chapter ${chapterId} has non-positive span`);
  }
  return clamp((progress - bounds.start) / span, 0, 1);
}

export function assertChaptersAreContinuous(
  chapters: readonly Chapter[] = CHAPTERS,
): void {
  if (chapters.length === 0) {
    throw new Error("No chapters defined");
  }
  const sorted = [...chapters].sort((a, b) => a.start - b.start);
  const first = sorted[0];
  if (!first || first.start !== 0) {
    throw new Error("Chapters must start at 0");
  }
  const last = sorted[sorted.length - 1];
  if (!last || last.end !== 1) {
    throw new Error("Chapters must end at 1");
  }
  for (let i = 0; i < sorted.length - 1; i += 1) {
    const current = sorted[i];
    const next = sorted[i + 1];
    if (!current || !next) continue;
    if (Math.abs(current.end - next.start) > 1e-9) {
      throw new Error(
        `Gap or overlap between chapter ${current.id} (end ${current.end}) and ${next.id} (start ${next.start})`,
      );
    }
  }
}

if (process.env.NODE_ENV !== "production") {
  assertChaptersAreContinuous();
}

export const TOTAL_CHAPTERS = CHAPTERS.length;
export { CHAPTER_ORDER };
