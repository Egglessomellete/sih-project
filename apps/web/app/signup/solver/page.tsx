"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Header } from "@/components/Header";
import { useAuth } from "@/context/AuthContext";
import { Domain, Role } from "@/lib/enums";

export default function SolverSignupPage() {
  const { signupSolver, lang } = useAuth();
  const router = useRouter();

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<Role>(Role.UNIVERSITY);
  const [organization, setOrganization] = useState("");
  const [designation, setDesignation] = useState("");
  const [selectedDomains, setSelectedDomains] = useState<string[]>([]);
  const [district, setDistrict] = useState("Ranchi");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const jharkhandDistricts = [
    "Bokaro", "Chatra", "Deoghar", "Dhanbad", "Dumka", "East Singhbhum",
    "Garhwa", "Giridih", "Godda", "Gumla", "Hazaribagh", "Jamtara",
    "Khunti", "Koderma", "Latehar", "Lohardaga", "Pakur", "Palamu",
    "Ramgarh", "Ranchi", "Sahebganj", "Seraikela Kharsawan", "Simdega", "West Singhbhum"
  ];

  const handleDomainToggle = (domainValue: string) => {
    if (selectedDomains.includes(domainValue)) {
      setSelectedDomains(selectedDomains.filter((d) => d !== domainValue));
    } else {
      setSelectedDomains([...selectedDomains, domainValue]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      await signupSolver({
        full_name: fullName,
        email,
        phone: phone || undefined,
        password,
        role,
        organization,
        designation: designation || undefined,
        expertise_tags: selectedDomains.join(","),
        district,
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

      <main className="flex-1 max-w-2xl w-full mx-auto px-4 py-8 sm:py-12">
        <div className="bg-card rounded-2xl border border-border p-6 sm:p-8 shadow-xs">
          <div className="text-center mb-8">
            <h1 className="text-2xl sm:text-3xl font-bold text-foreground">
              {lang === "hi"
                ? "संस्था एवं समाधानकर्ता पंजीकरण"
                : "Institution & Solver Registration"}
            </h1>
            <p className="text-sm text-muted mt-2">
              {lang === "hi"
                ? "विश्वविद्यालयों, उद्योगों, स्टार्टअप्स एवं विभागों के लिए विशेषज्ञता आधारित खाता"
                : "Detailed profile for Universities, Industry/CSR, and Govt agencies"}
            </p>
          </div>

          {error && (
            <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-200 text-destructive text-sm font-medium">
              Notice: {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label
                  htmlFor="fullName"
                  className="block text-sm font-semibold text-foreground mb-2"
                >
                  {lang === "hi" ? "प्रतिनिधि का नाम" : "Contact Person Name"} *
                </label>
                <input
                  id="fullName"
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Dr. Ananya Roy"
                  className="w-full px-4 py-3 rounded-xl border border-border bg-white text-foreground focus:ring-2 focus:ring-foreground min-h-[48px] text-base"
                />
              </div>

              <div>
                <label
                  htmlFor="role"
                  className="block text-sm font-semibold text-foreground mb-2"
                >
                  {lang === "hi" ? "संस्था का प्रकार" : "Institution Type"} *
                </label>
                <select
                  id="role"
                  value={role}
                  onChange={(e) => setRole(e.target.value as Role)}
                  className="w-full px-4 py-3 rounded-xl border border-border bg-white text-foreground focus:ring-2 focus:ring-foreground min-h-[48px] text-base"
                >
                  <option value={Role.UNIVERSITY}>
                    University / HEI / Lab
                  </option>
                  <option value={Role.INDUSTRY}>
                    Industry / CSR / MSME / Startup
                  </option>
                  <option value={Role.GOVT}>
                    Government Agency / Dept
                  </option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label
                  htmlFor="organization"
                  className="block text-sm font-semibold text-foreground mb-2"
                >
                  {lang === "hi" ? "संस्थान/कंपनी का नाम" : "Organization Name"} *
                </label>
                <input
                  id="organization"
                  type="text"
                  required
                  value={organization}
                  onChange={(e) => setOrganization(e.target.value)}
                  placeholder="BIT Mesra / Tata Steel CSR"
                  className="w-full px-4 py-3 rounded-xl border border-border bg-white text-foreground focus:ring-2 focus:ring-foreground min-h-[48px] text-base"
                />
              </div>

              <div>
                <label
                  htmlFor="designation"
                  className="block text-sm font-semibold text-foreground mb-2"
                >
                  {lang === "hi" ? "पद / Designation" : "Designation / Role"}
                </label>
                <input
                  id="designation"
                  type="text"
                  value={designation}
                  onChange={(e) => setDesignation(e.target.value)}
                  placeholder="Professor / CSR Lead"
                  className="w-full px-4 py-3 rounded-xl border border-border bg-white text-foreground focus:ring-2 focus:ring-foreground min-h-[48px] text-base"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-semibold text-foreground mb-2"
                >
                  {lang === "hi" ? "आधिकारिक ईमेल" : "Official Email"} *
                </label>
                <input
                  id="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@institution.edu.in"
                  className="w-full px-4 py-3 rounded-xl border border-border bg-white text-foreground focus:ring-2 focus:ring-foreground min-h-[48px] text-base"
                />
              </div>

              <div>
                <label
                  htmlFor="district"
                  className="block text-sm font-semibold text-foreground mb-2"
                >
                  {lang === "hi" ? "प्राथमिक जिला" : "Base District"} *
                </label>
                <select
                  id="district"
                  value={district}
                  onChange={(e) => setDistrict(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-border bg-white text-foreground focus:ring-2 focus:ring-foreground min-h-[48px] text-base"
                >
                  {jharkhandDistricts.map((d) => (
                    <option key={d} value={d}>
                      {d}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-foreground mb-2">
                {lang === "hi"
                  ? "विशेषज्ञता क्षेत्र (इन्हें समस्याएं प्रेषित की जाएंगी)"
                  : "Expertise Domains (for automated AI problem routing)"}
              </label>
              <div className="flex flex-wrap gap-2 pt-1">
                {Object.values(Domain).map((dom) => {
                  const active = selectedDomains.includes(dom);
                  return (
                    <button
                      type="button"
                      key={dom}
                      onClick={() => handleDomainToggle(dom)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
                        active
                          ? "bg-primary border-primary text-foreground shadow-xs"
                          : "bg-white border-border text-muted hover:border-gray-400"
                      }`}
                    >
                      {active ? "[x] " : "[ ] "}
                      {dom}
                    </button>
                  );
                })}
              </div>
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
                  : "Creating profile..."
                : lang === "hi"
                ? "संस्था का पंजीकरण करें"
                : "Register Institution"}
            </button>
          </form>

          <div className="mt-6 pt-6 border-t border-border text-center text-sm text-muted">
            <p>
              {lang === "hi" ? "पहले से पंजीकृत हैं?" : "Already registered?"}{" "}
              <Link
                href="/login"
                className="font-semibold text-foreground underline hover:text-black"
              >
                {lang === "hi" ? "लॉगिन करें" : "Sign in here"}
              </Link>
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
