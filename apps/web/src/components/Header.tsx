"use client";

import React from "react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { UIDensity } from "@/lib/enums";

export function Header({ onOpenHelp }: { onOpenHelp?: () => void }) {
  const { user, logout, lang, setLang } = useAuth();

  return (
    <header className="w-full bg-white border-b border-border shadow-xs sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Logo & Portal Title */}
        <Link href="/" className="flex items-center gap-3 group focus:outline-none">
          <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center font-bold text-foreground text-lg shadow-xs group-hover:scale-105 transition-transform">
            JH
          </div>
          <div>
            <span className="font-bold text-base sm:text-lg block leading-tight text-foreground">
              {lang === "hi" ? "झारखंड नवोन्मेष पोर्टल" : "Jharkhand Innovation Portal"}
            </span>
            <span className="text-xs text-muted block leading-none">
              {lang === "hi"
                ? "सामाजिक समस्याओं का साझा समाधान"
                : "Societal Problem Collaboration"}
            </span>
          </div>
        </Link>

        {/* Navigation / Actions */}
        <div className="flex items-center gap-2 sm:gap-4">

          {/* Language Toggle */}
          <div className="inline-flex rounded-lg p-1 bg-background border border-border">
            <button
              onClick={() => setLang("hi")}
              className={`px-3 py-1.5 rounded-md text-xs sm:text-sm font-medium transition-colors ${
                lang === "hi"
                  ? "bg-primary text-foreground shadow-xs font-semibold"
                  : "text-muted hover:text-foreground"
              }`}
            >
              हिंदी
            </button>
            <button
              onClick={() => setLang("en")}
              className={`px-3 py-1.5 rounded-md text-xs sm:text-sm font-medium transition-colors ${
                lang === "en"
                  ? "bg-primary text-foreground shadow-xs font-semibold"
                  : "text-muted hover:text-foreground"
              }`}
            >
              English
            </button>
          </div>

          {/* Help Button */}
          {onOpenHelp && (
            <button
              onClick={onOpenHelp}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border bg-white text-xs sm:text-sm font-medium text-foreground hover:bg-background transition-colors focus:ring-2 focus:ring-foreground min-h-[44px]"
              title={lang === "hi" ? "मदद और ट्यूटोरियल" : "Help & Tutorial"}
            >
              <span className="w-5 h-5 rounded-full bg-primary flex items-center justify-center text-xs font-bold">
                ?
              </span>
              <span>{lang === "hi" ? "मदद" : "Help"}</span>
            </button>
          )}

          {/* User Profile / Auth State */}
          {user ? (
            <div className="flex items-center gap-3">
              <div className="hidden md:block text-right">
                <span className="block text-xs font-semibold text-foreground">
                  {user.full_name}
                </span>
                <span className="block text-[10px] text-muted capitalize">
                  {user.role} {user.organization ? `(${user.organization})` : ""}
                </span>
              </div>
              <button
                onClick={logout}
                className="px-3 py-1.5 text-xs sm:text-sm text-destructive hover:bg-red-50 rounded-lg transition-colors border border-red-200 min-h-[44px]"
              >
                {lang === "hi" ? "लॉग आउट" : "Logout"}
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link
                href="/login"
                className="px-4 py-2 rounded-xl text-xs sm:text-sm font-medium bg-primary text-foreground hover:opacity-90 transition-opacity min-h-[44px] flex items-center justify-center shadow-xs"
              >
                {lang === "hi" ? "लॉगिन" : "Login"}
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
