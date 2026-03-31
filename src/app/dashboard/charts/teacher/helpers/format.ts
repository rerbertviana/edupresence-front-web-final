export function safeNumber(value: unknown, fallback = 0) {
  const n = Number(value);
  return Number.isFinite(n) ? n : fallback;
}

export function extractSemester(className: string) {
  const match = className?.match(/\d{4}\.\d/);
  return match?.[0] ?? className ?? "—";
}

export function buildDisplayName(
  subjectName: string | null,
  className: string,
) {
  const subject = subjectName ?? "Sem disciplina";
  const semester = extractSemester(className);
  return `${subject} • ${semester}`;
}

export function formatShortDate(date: string) {
  if (!date) return "—";

  const d = new Date(`${date}T00:00:00`);
  if (Number.isNaN(d.getTime())) return date;

  return d.toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
  });
}

export function splitLabelToTwoLines(label: string, maxFirstLine = 18) {
  if (!label) return ["—", ""];

  const parts = label.split("•").map((part) => part.trim());
  const subject = parts[0] ?? label;
  const semester = parts[1] ?? "";

  if (subject.length <= maxFirstLine) {
    return [subject, semester];
  }

  const words = subject.split(" ");
  let firstLine = "";
  let secondLine = "";

  for (const word of words) {
    const next = firstLine ? `${firstLine} ${word}` : word;

    if (next.length <= maxFirstLine) {
      firstLine = next;
    } else {
      secondLine = secondLine ? `${secondLine} ${word}` : word;
    }
  }

  if (!firstLine) firstLine = subject.slice(0, maxFirstLine);

  if (!secondLine && subject.length > maxFirstLine) {
    secondLine = subject.slice(maxFirstLine);
  }

  return [firstLine, semester || secondLine];
}
