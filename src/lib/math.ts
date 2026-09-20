/*
  توابع ریاضی خالص و تست‌پذیر.
  هیچ وابستگی به Three.js یا React ندارند.
  همه‌ی توابع در برابر ورودی‌های خارج از بازه مقاوم‌اند.
*/

export function clamp(value: number, min: number, max: number): number {
  if (min > max) {
    throw new Error(`clamp: min (${min}) must not exceed max (${max})`);
  }
  if (value < min) return min;
  if (value > max) return max;
  return value;
}

/*
  نگاشت خطی مقدار از بازه‌ی [inMin, inMax] به [outMin, outMax].
  اگر مقدار خارج از بازه باشد، بر اساس clamp خروجی محدود می‌شود.
*/
export function remap(
  value: number,
  inMin: number,
  inMax: number,
  outMin: number,
  outMax: number,
): number {
  if (inMax === inMin) {
    throw new Error("remap: input range has zero width");
  }
  const t = (value - inMin) / (inMax - inMin);
  return outMin + t * (outMax - outMin);
}

/*
  نسخه‌ی محدودشده‌ی remap که خروجی را در [outMin, outMax] نگه می‌دارد.
  برای progress فصل‌ها استفاده می‌شود.
*/
export function remapClamped(
  value: number,
  inMin: number,
  inMax: number,
  outMin: number,
  outMax: number,
): number {
  const t = clamp((value - inMin) / (inMax - inMin || 1), 0, 1);
  return outMin + t * (outMax - outMin);
}

export function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

/*
  هموارسازی خطی (smoothstep) بدون نیاز به Math.pow.
  فرمول استاندارد Hermite: 3t^2 - 2t^3
*/
export function smoothstep(t: number): number {
  const x = clamp(t, 0, 1);
  return x * x * (3 - 2 * x);
}

/*
  easing سینمایی برای انتقال‌های نرم‌تر.
  فرمول easeInOutQuint: t < 0.5 ? 16t^5 : 1 - (-2t + 2)^5 / 2
*/
export function easeInOutQuint(t: number): number {
  const x = clamp(t, 0, 1);
  if (x < 0.5) return 16 * x * x * x * x * x;
  const f = -2 * x + 2;
  return 1 - (f * f * f * f * f) / 2;
}

/*
  درون‌یابی بین دو مقدار بر اساس یک eased t.
  برای مقادیر دوربین و پارامترهای شیدر استفاده می‌شود.
*/
export function mixEased(
  a: number,
  b: number,
  t: number,
  ease = smoothstep,
): number {
  return a + (b - a) * ease(t);
}

/*
  تبدیل نقطه‌ی سه‌بعدی ساده (بدون وابستگی به Three).
  در تست‌ها و محاسبات قبل از ساخت Vector3 استفاده می‌شود.
*/
export type Vec3 = readonly [number, number, number];

export function lerpVec3(a: Vec3, b: Vec3, t: number): Vec3 {
  return [
    lerp(a[0], b[0], t),
    lerp(a[1], b[1], t),
    lerp(a[2], b[2], t),
  ] as const;
}
