"use client";

export function DashboardContentSkeleton() {
  return (
    <div className="w-full min-h-full p-4 md:p-10 space-y-4 bg-white rounded-xl shadow-xl">
      <div className="animate-pulse space-y-6">
        <div className="flex items-center justify-between gap-4">
          <div className="space-y-2">
            <div className="h-6 w-56 rounded-md bg-slate-200" />
            <div className="h-4 w-72 rounded-md bg-slate-100" />
          </div>

          <div className="flex items-center gap-2">
            <div className="h-9 w-24 rounded-md bg-slate-200" />
            <div className="h-9 w-28 rounded-md bg-slate-200" />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="h-24 rounded-xl bg-slate-100 border border-slate-200" />
          <div className="h-24 rounded-xl bg-slate-100 border border-slate-200" />
          <div className="h-24 rounded-xl bg-slate-100 border border-slate-200" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          <div className="h-10 rounded-md bg-slate-100 border border-slate-200" />
          <div className="h-10 rounded-md bg-slate-100 border border-slate-200" />
          <div className="h-10 rounded-md bg-slate-100 border border-slate-200" />
          <div className="h-10 rounded-md bg-slate-100 border border-slate-200" />
        </div>

        <div className="rounded-xl border border-slate-200 overflow-hidden">
          <div className="h-10 bg-slate-100 border-b border-slate-200" />
          {Array.from({ length: 7 }).map((_, i) => (
            <div
              key={i}
              className="h-12 bg-white border-b border-slate-200 flex items-center px-4"
            >
              <div className="h-4 w-40 rounded bg-slate-200" />
              <div className="ml-auto h-4 w-24 rounded bg-slate-100" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
