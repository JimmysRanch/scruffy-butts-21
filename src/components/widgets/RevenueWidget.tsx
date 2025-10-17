import React, { useMemo, useId } from "react";

type Point = { label: string; value: number };

export type RevenueWidgetProps = {
  title?: string;
  data: Point[];
  total: number;
  currency?: string;
  decimals?: number;
  max?: number;
  color?: "cyan" | "blue" | "emerald" | "violet";
};

const colorMap = {
  cyan: {
    ring: "ring-cyan-400/30",
    glow: "shadow-[0_0_40px_rgba(34,211,238,0.35)]",
    text: "text-cyan-300",
    bar: { from: "#22d3ee", to: "#06b6d4" },
  },
  blue: {
    ring: "ring-sky-400/30",
    glow: "shadow-[0_0_40px_rgba(56,189,248,0.35)]",
    text: "text-sky-300",
    bar: { from: "#38bdf8", to: "#0ea5e9" },
  },
  emerald: {
    ring: "ring-emerald-400/30",
    glow: "shadow-[0_0_40px_rgba(52,211,153,0.35)]",
    text: "text-emerald-300",
    bar: { from: "#34d399", to: "#10b981" },
  },
  violet: {
    ring: "ring-violet-400/30",
    glow: "shadow-[0_0_40px_rgba(167,139,250,0.35)]",
    text: "text-violet-300",
    bar: { from: "#a78bfa", to: "#8b5cf6" },
  },
} as const;

function niceMax(n: number): number {
  if (n <= 0) return 1;
  const pow10 = Math.pow(10, Math.floor(Math.log10(n)));
  const d = n / pow10;
  const step = d <= 1 ? 1 : d <= 2 ? 2 : d <= 5 ? 5 : 10;
  return step * pow10;
}

function useCurrencyFormatter(currency: string, decimals: number) {
  return useMemo(
    () =>
      new Intl.NumberFormat(undefined, {
        style: "currency",
        currency,
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals,
      }),
    [currency, decimals]
  );
}

export default function RevenueWidget({
  title = "REVENUE",
  data,
  total,
  currency = "USD",
  decimals = 2,
  max,
  color = "cyan",
}: RevenueWidgetProps) {
  const palette = colorMap[color];
  const gradientId = useId().replace(/:/g, "-");

  const values = data.map((d) => d.value);
  const computedMax = Math.max(...values, 0);
  const yMax = max ?? niceMax(computedMax);
  const rows = 5;

  const width = 640;
  const height = 300;
  const pad = { top: 18, right: 16, bottom: 54, left: 44 };
  const chartW = width - pad.left - pad.right;
  const chartH = height - pad.top - pad.bottom;

  const barCount = Math.max(data.length, 1);
  const barW = chartW / (barCount * 1.6);
  const gap = barW * 0.6;

  const currencyFmt = useCurrencyFormatter(currency, decimals);

  return (
    <div
      className={[
        "rounded-3xl bg-slate-900/80 backdrop-blur",
        "p-6 sm:p-7 ring-1",
        palette.ring,
        palette.glow,
        "text-slate-200"
      ].join(" ")}
    >
      <div className="flex items-baseline justify-between">
        <h2 className="text-2xl sm:text-3xl font-extrabold tracking-wide">
          {title}
        </h2>
      </div>

      <div className="mt-4">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="w-full h-auto"
          role="img"
          aria-label={`${title} bar chart`}
        >
          <defs>
            <linearGradient id={`g-${gradientId}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={palette.bar.from} />
              <stop offset="100%" stopColor={palette.bar.to} />
            </linearGradient>
          </defs>

          <g transform={`translate(${pad.left},${pad.top})`}> 
            <rect
              x={0}
              y={0}
              width={chartW}
              height={chartH}
              rx={12}
              className="fill-slate-800/50"
            />

            {[...Array(rows + 1)].map((_, i) => {
              const y = (chartH / rows) * i;
              const v = Math.round(yMax - (yMax / rows) * i);
              return (
                <g key={i}>
                  <line
                    x1={0}
                    x2={chartW}
                    y1={y}
                    y2={y}
                    className="stroke-slate-600/40"
                    strokeWidth={1}
                  />
                  <text
                    x={-10}
                    y={y + 4}
                    textAnchor="end"
                    className="fill-slate-400 text-[10px]"
                  >
                    {v}
                  </text>
                </g>
              );
            })}

            {data.map((d, i) => {
              const x = i * (barW + gap) + gap * 0.5;
              const h = yMax === 0 ? 0 : (d.value / yMax) * chartH;
              const y = chartH - h;
              return (
                <g key={i}>
                  <rect
                    x={x}
                    y={y}
                    width={barW}
                    height={h}
                    rx={6}
                    fill={`url(#g-${gradientId})`}
                    className="opacity-90"
                  />
                  <text
                    x={x + barW / 2}
                    y={chartH + 18}
                    textAnchor="middle"
                    className="fill-slate-300 text-[11px] tracking-wide"
                  >
                    {d.label}
                  </text>
                </g>
              );
            })}
          </g>
        </svg>
      </div>

      <div className="mt-3 sm:mt-4 text-center">
        <div className="uppercase tracking-widest text-xs sm:text-sm text-slate-400">
          Total
        </div>
        <div
          className={[
            "mt-1 font-extrabold",
            "text-3xl sm:text-4xl md:text-5xl",
            palette.text,
          ].join(" ")}
          aria-label={`Total ${currencyFmt.format(total)}`}
        >
          {currencyFmt.format(total)}
        </div>
      </div>
    </div>
  );
}