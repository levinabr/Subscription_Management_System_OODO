import React from "react";
import { Loader2 } from "lucide-react";

export function LoadingState({ message = "Loading data..." }: { message?: string }) {
  return (
    <div className="flex flex-col items-center justify-center p-12 space-y-3 min-h-[220px]">
      <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
      <p className="text-sm font-medium text-slate-500 animate-pulse">{message}</p>
    </div>
  );
}

export function SkeletonRow({ cols = 5 }: { cols?: number }) {
  return (
    <div className="flex items-center space-x-4 py-3 border-b border-slate-100 animate-pulse">
      {Array.from({ length: cols }).map((_, i) => (
        <div
          key={i}
          className="h-4 bg-slate-200 rounded-md flex-1"
          style={{ width: `${Math.floor(100 / cols)}%` }}
        />
      ))}
    </div>
  );
}
