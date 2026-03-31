"use client";

type YAxisTickProps = {
  x?: number;
  y?: number;
  payload?: {
    value?: string;
  };
};

export function CustomWorstClassTick({
  x = 0,
  y = 0,
  payload,
}: YAxisTickProps) {
  const raw = String(payload?.value ?? "");
  const parts = raw.split("•").map((part) => part.trim());

  const line1 = parts[0] ?? "—";
  const line2 = parts[1] ?? "";
  const line3 = parts[2] ?? "";

  return (
    <g transform={`translate(${x},${y})`}>
      <text
        x={-8}
        y={-12}
        textAnchor="end"
        fill="#334155"
        fontSize={12}
        fontWeight={600}
      >
        {line1}
      </text>
      <text
        x={-8}
        y={2}
        textAnchor="end"
        fill="#64748b"
        fontSize={11}
        fontWeight={500}
      >
        {line2}
      </text>
      <text
        x={-8}
        y={16}
        textAnchor="end"
        fill="#94a3b8"
        fontSize={10}
        fontWeight={500}
      >
        {line3}
      </text>
    </g>
  );
}
