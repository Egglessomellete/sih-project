"use client";

import React from "react";

export function LoadingSpinner({
  label = "Loading...",
}: {
  label?: string;
}) {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-4 space-y-4">
      <div className="w-10 h-10 border-4 border-primary border-t-foreground rounded-full animate-spin" />
      <p className="text-sm font-medium text-muted">{label}</p>
    </div>
  );
}

export function EmptyState({
  title,
  description,
  actionLabel,
  onAction,
}: {
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
}) {
  return (
    <div className="bg-card rounded-2xl border border-border p-8 sm:p-12 text-center max-w-lg mx-auto shadow-xs my-6">
      <h3 className="text-lg sm:text-xl font-bold text-foreground mb-2">
        {title}
      </h3>
      <p className="text-sm text-muted mb-6 leading-relaxed">
        {description}
      </p>
      {actionLabel && onAction && (
        <button
          onClick={onAction}
          className="px-6 py-3 rounded-xl font-bold bg-primary text-foreground hover:opacity-90 transition-opacity min-h-[44px] text-sm shadow-xs"
        >
          {actionLabel}
        </button>
      )}
    </div>
  );
}

export function ErrorBanner({
  message,
  onRetry,
}: {
  message: string;
  onRetry?: () => void;
}) {
  return (
    <div className="p-4 sm:p-5 rounded-2xl bg-red-50 border border-red-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 my-4">
      <div className="flex items-center gap-3">
        <span className="font-bold text-red-700">Notice:</span>
        <p className="text-sm font-medium text-destructive">{message}</p>
      </div>
      {onRetry && (
        <button
          onClick={onRetry}
          className="px-4 py-2 rounded-lg bg-white border border-red-300 text-xs font-semibold text-destructive hover:bg-red-100 transition-colors min-h-[36px]"
        >
          पुनः प्रयास करें / Retry
        </button>
      )}
    </div>
  );
}
