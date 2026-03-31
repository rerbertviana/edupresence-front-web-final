export function safeNumber(value: unknown, fallback = 0) {
  const n = Number(value);
  return Number.isFinite(n) ? n : fallback;
}

export function parseBackendMessage(err: any): string {
  return (
    err?.response?.data?.message ||
    err?.response?.data?.error ||
    err?.message ||
    "Erro inesperado."
  );
}

export function splitLabelToTwoLines(label: string, maxFirstLine = 18) {
  if (!label) return ["—", ""];

  const parts = label.split("•").map((part) => part.trim());
  const first = parts[0] ?? label;
  const second = parts[1] ?? "";

  if (first.length <= maxFirstLine) {
    return [first, second];
  }

  const words = first.split(" ");
  let line1 = "";
  let line2 = "";

  for (const word of words) {
    const next = line1 ? `${line1} ${word}` : word;

    if (next.length <= maxFirstLine) {
      line1 = next;
    } else {
      line2 = line2 ? `${line2} ${word}` : word;
    }
  }

  if (!line1) line1 = first.slice(0, maxFirstLine);

  if (!line2 && first.length > maxFirstLine) {
    line2 = first.slice(maxFirstLine);
  }

  return [line1, second || line2];
}
