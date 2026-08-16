const MS_PER_DAY = 24 * 60 * 60 * 1000;

export function bucketByDay(dates: Date[], days: number, now: Date = new Date()): number[] {
  const buckets = new Array(Math.max(0, days)).fill(0);
  if (days <= 0) return buckets;

  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  for (const d of dates) {
    const day = new Date(d.getFullYear(), d.getMonth(), d.getDate());
    const diffDays = Math.floor((startOfToday.getTime() - day.getTime()) / MS_PER_DAY);
    const idx = days - 1 - diffDays;
    if (idx >= 0 && idx < days) buckets[idx]++;
  }
  return buckets;
}

export interface SparklineGeometry {
  line: string;
  area: string;
  max: number;
}

export function sparklineGeometry(
  values: number[],
  width: number,
  height: number,
  pad = 3,
): SparklineGeometry {
  const max = Math.max(1, ...values);
  const n = values.length;
  if (n === 0) return { line: "", area: "", max: 0 };

  const innerW = Math.max(0, width - pad * 2);
  const innerH = Math.max(0, height - pad * 2);
  const stepX = n > 1 ? innerW / (n - 1) : 0;

  const pts = values.map((v, i) => {
    const x = pad + i * stepX;
    const y = height - pad - (v / max) * innerH;
    return `${x.toFixed(1)},${y.toFixed(1)}`;
  });

  const line = pts.join(" ");
  const firstX = pad;
  const lastX = pad + (n - 1) * stepX;
  const area = `M ${pts.join(" L ")} L ${lastX.toFixed(1)},${height - pad} L ${firstX.toFixed(
    1,
  )},${height - pad} Z`;

  return { line, area, max };
}
