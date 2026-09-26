"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Header } from "@/components/Header";
import { useAuth } from "@/context/AuthContext";
import { Role } from "@/lib/enums";

export default function CitizenSignupPage() {
  const { signupCitizen, lang } = useAuth();
  const router = useRouter();

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<Role>(Role.CITIZEN);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      await signupCitizen({
        full_name: fullName,
        email,
        phone: phone || undefined,
        password,
        role,
      });
      router.push("/");
    } catch (err: any) {
      setError(err.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />

      <main className="flex-1 max-w-xl w-full mx-auto px-4 py-8 sm:py-12">
        <div className="bg-card rounded-2xl border border-border p-6 sm:p-8 shadow-xs">
          <div className="text-center mb-8">
            <h1 className="text-2xl sm:text-3xl font-bold text-foreground">
              {lang === "hi" ? "नागरिक पंजीकरण" : "Citizen Registration"}
            </h1>
            <p className="text-sm text-muted mt-2">
              {lang === "hi"
                ? "सरल एवं सुगम रूप से अपनी समस्याएं दर्ज करने के लिए खाता बनाएं"
                : "Create a simple account to report local societal challenges"}
            </p>
          </div>

          {error && (
            <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-200 text-destructive text-sm font-medium">
              Notice: {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label
                htmlFor="fullName"
                className="block text-sm font-semibold text-foreground mb-2"
              >
                {lang === "hi" ? "पूरा नाम (Full Name)" : "Full Name"} *
              </label>
              <input
                id="fullName"
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Ramesh Kumar"
                className="w-full px-4 py-3 rounded-xl border border-border bg-white text-foreground focus:ring-2 focus:ring-foreground min-h-[48px] text-base"
              />
            </div>

            <div>
              <label
                htmlFor="email"
                className="block text-sm font-semibold text-foreground mb-2"
              >
                {lang === "hi" ? "ईमेल (Email Address)" : "Email Address"} *
              </label>
              <input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="citizen@example.com"
                className="w-full px-4 py-3 rounded-xl border border-border bg-white text-foreground focus:ring-2 focus:ring-foreground min-h-[48px] text-base"
              />
            </div>

            <div>
              <label
                htmlFor="phone"
                className="block text-sm font-semibold text-foreground mb-2"
              >
                {lang === "hi" ? "मोबाइल नंबर (Mobile Number - ऐच्छिक)" : "Phone Number (Optional)"}
              </label>
              <input
                id="phone"
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+91 9876543210"
                className="w-full px-4 py-3 rounded-xl border border-border bg-white text-foreground focus:ring-2 focus:ring-foreground min-h-[48px] text-base"
              />
            </div>

            <div>
              <label
                htmlFor="role"
                className="block text-sm font-semibold text-foreground mb-2"
              >
                {lang === "hi" ? "श्रेणी (Category)" : "Category"}
              </label>
              <select
                id="role"
                value={role}
                onChange={(e) => setRole(e.target.value as Role)}
                className="w-full px-4 py-3 rounded-xl border border-border bg-white text-foreground focus:ring-2 focus:ring-foreground min-h-[48px] text-base"
              >
                <option value={Role.CITIZEN}>
                  {lang === "hi" ? "आम नागरिक (Citizen)" : "Individual Citizen"}
                </option>
                <option value={Role.COMMUNITY_ORG}>
                  {lang === "hi" ? "समुदाय / स्वयं सहायता समूह (Community / SHG)" : "Community Group / SHG"}
                </option>
                <option value={Role.PRI}>
                  {lang === "hi" ? "ग्राम पंचायत / मुखिया (PRI / Mukhiya)" : "Panchayati Raj (PRI)"}
                </option>
                <option value={Role.ULB}>
                  {lang === "hi" ? "नगर निकाय (ULB)" : "Urban Local Body (ULB)"}
                </option>
              </select>
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-sm font-semibold text-foreground mb-2"
              >
                {lang === "hi" ? "पासवर्ड (Password)" : "Password"} *
              </label>
              <input
                id="password"
                type="password"
                required
                minLength={6}
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
                  ? "पंजीकरण हो रहा है..."
                  : "Creating account..."
                : lang === "hi"
                ? "खाता बनाएं"
                : "Register Account"}
            </button>
          </form>

          <div className="mt-6 pt-6 border-t border-border text-center text-sm text-muted">
            <p>
              {lang === "hi" ? "पहले से खाता है?" : "Already registered?"}{" "}
              <Link
                href="/login"
                className="font-semibold text-foreground underline hover:text-black"
              >
                {lang === "hi" ? "लॉगिन करें" : "Log in here"}
              </Link>
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
