import { sparklineGeometry } from "@/lib/analytics";

export default function Sparkline({
  values,
  className = "h-12 w-full",
  width = 300,
  height = 48,
}: {
  values: number[];
  className?: string;
  width?: number;
  height?: number;
}) {
  const { line, area } = sparklineGeometry(values, width, height);

  if (values.length === 0) {
    return <div className={`${className} flex items-center justify-center text-xs text-gray-400`}>No data</div>;
  }

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      className={className}
      preserveAspectRatio="none"
      role="img"
      aria-label="Trend chart"
    >
      <polygon points={area} fill="rgba(20, 83, 45, 0.14)" />
      <polyline points={line} fill="none" stroke="#14532d" strokeWidth="2" />
    </svg>
  );
}
