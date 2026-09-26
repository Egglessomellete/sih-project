"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Header } from "@/components/Header";
import { useAuth } from "@/context/AuthContext";

export default function LoginPage() {
  const { login, lang } = useAuth();
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      await login(email, password);
      router.push("/");
    } catch (err: any) {
      setError(err.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  const handleQuickLogin = async (demoEmail: string) => {
    setError(null);
    setLoading(true);
    try {
      await login(demoEmail, "demo1234");
      router.push("/");
    } catch (err: any) {
      setError(err.message || "Quick login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />

      <main className="flex-1 max-w-4xl w-full mx-auto px-4 py-8 sm:py-12 flex flex-col items-center justify-center">
        <div className="w-full max-w-md bg-card rounded-2xl border border-border p-6 sm:p-8 shadow-xs">
          <div className="text-center mb-8">
            <h1 className="text-2xl sm:text-3xl font-bold text-foreground">
              {lang === "hi" ? "पोर्टल में लॉगिन करें" : "Login to Portal"}
            </h1>
            <p className="text-sm text-muted mt-2">
              {lang === "hi"
                ? "अपनी समस्याओं का विवरण दर्ज करने और प्रगति देखने के लिए प्रवेश करें"
                : "Sign in to submit problems or manage assigned challenges"}
            </p>
          </div>

          {error && (
            <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-200 text-destructive text-sm font-medium">
              ⚠️ {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-semibold text-foreground mb-2"
              >
                {lang === "hi" ? "ईमेल आईडी (Email ID)" : "Email Address"}
              </label>
              <input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="example@domain.com"
                className="w-full px-4 py-3 rounded-xl border border-border bg-white text-foreground focus:ring-2 focus:ring-foreground min-h-[48px] text-base"
              />
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-sm font-semibold text-foreground mb-2"
              >
                {lang === "hi" ? "पासवर्ड (Password)" : "Password"}
              </label>
              <input
                id="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-4 py-3 rounded-xl border border-border bg-white text-foreground focus:ring-2 focus:ring-foreground min-h-[48px] text-base"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 px-6 rounded-xl font-bold bg-primary text-foreground hover:opacity-90 transition-opacity min-h-[48px] text-base shadow-xs disabled:opacity-50"
            >
              {loading
                ? lang === "hi"
                  ? "सत्यापित हो रहा है..."
                  : "Logging in..."
                : lang === "hi"
                ? "लॉगिन करें"
                : "Sign In"}
            </button>
          </form>

          <div className="mt-6 pt-6 border-t border-border text-center space-y-2 text-sm text-muted">
            <p>
              {lang === "hi" ? "नया खाता बनाएं:" : "Need an account?"}{" "}
              <Link
                href="/signup/citizen"
                className="font-semibold text-foreground underline hover:text-black"
              >
                {lang === "hi" ? "नागरिक पंजीकरण" : "Citizen Signup"}
              </Link>
              {" | "}
              <Link
                href="/signup/solver"
                className="font-semibold text-foreground underline hover:text-black"
              >
                {lang === "hi" ? "संस्था / विशेषज्ञ" : "Institution Signup"}
              </Link>
            </p>
          </div>
        </div>

        {/* Demo Quick-Login Bar */}
        <div className="w-full max-w-2xl mt-10 p-6 bg-white rounded-2xl border border-border shadow-xs">
          <h2 className="text-xs font-bold uppercase tracking-wider text-muted mb-4 text-center">
            ⚡ {lang === "hi" ? "त्वरित परीक्षण हेतु डेमो खाते (Quick Demo Login)" : "Quick Demo Accounts for Evaluation"}
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            <button
              onClick={() => handleQuickLogin("citizen@demo.com")}
              className="p-3 text-left rounded-xl border border-border hover:bg-background transition-colors"
            >
              <span className="block font-bold text-xs text-foreground">👨‍🌾 Citizen</span>
              <span className="block text-[11px] text-muted truncate">citizen@demo.com</span>
            </button>
            <button
              onClick={() => handleQuickLogin("pri@demo.com")}
              className="p-3 text-left rounded-xl border border-border hover:bg-background transition-colors"
            >
              <span className="block font-bold text-xs text-foreground">🏛️ PRI / Mukhiya</span>
              <span className="block text-[11px] text-muted truncate">pri@demo.com</span>
            </button>
            <button
              onClick={() => handleQuickLogin("uni@demo.com")}
              className="p-3 text-left rounded-xl border border-border hover:bg-background transition-colors"
            >
              <span className="block font-bold text-xs text-foreground">🎓 University (BIT)</span>
              <span className="block text-[11px] text-muted truncate">uni@demo.com</span>
            </button>
            <button
              onClick={() => handleQuickLogin("industry@demo.com")}
              className="p-3 text-left rounded-xl border border-border hover:bg-background transition-colors"
            >
              <span className="block font-bold text-xs text-foreground">🏬 Industry / CSR</span>
              <span className="block text-[11px] text-muted truncate">industry@demo.com</span>
            </button>
            <button
              onClick={() => handleQuickLogin("govt@demo.com")}
              className="p-3 text-left rounded-xl border border-border hover:bg-background transition-colors"
            >
              <span className="block font-bold text-xs text-foreground">🏢 Govt Officer</span>
              <span className="block text-[11px] text-muted truncate">govt@demo.com</span>
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
