"use client";

import { splitLabelToTwoLines } from "../../helpers/format";

type YAxisTickProps = {
  x?: number;
  y?: number;
  payload?: {
    value?: string;
  };
};

export function CustomCourseTick({ x = 0, y = 0, payload }: YAxisTickProps) {
  const raw = String(payload?.value ?? "");
  const [line1, line2] = splitLabelToTwoLines(raw, 18);

  return (
    <g transform={`translate(${x},${y})`}>
      <text
        x={-8}
        y={-6}
        textAnchor="end"
        fill="#334155"
        fontSize={12}
        fontWeight={500}
      >
        {line1}
      </text>
      <text
        x={-8}
        y={10}
        textAnchor="end"
        fill="#64748b"
        fontSize={11}
        fontWeight={500}
      >
        {line2}
      </text>
    </g>
  );
}
