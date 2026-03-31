"use client";

type EmptyChartStateProps = {
  message: string;
  className?: string;
};

export function EmptyChartState({
  message,
  className = "h-[220px]",
}: EmptyChartStateProps) {
  return (
    <div
      className={`${className} rounded-2xl bg-slate-50 flex items-center justify-center text-sm text-slate-500`}
    >
      {message}
    </div>
  );
}
