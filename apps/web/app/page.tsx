"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Header } from "@/components/Header";
import { HelpModal } from "@/components/HelpModal";
import { EmptyState, ErrorBanner, LoadingSpinner } from "@/components/UIState";
import { useAuth } from "@/context/AuthContext";
import { apiRequest } from "@/lib/api";
import { DOMAIN_LABELS, Domain, Role, STATUS_LABELS, TicketStatus, UIDensity } from "@/lib/enums";

export default function HomePage() {
  const { user, loading: authLoading, login, signupCitizen, signupSolver, lang } = useAuth();
  const router = useRouter();

  const [isHelpOpen, setIsHelpOpen] = useState(false);

  // Active Main Navigation Tab: "problems" vs "dashboard"
  const [activeMainTab, setActiveMainTab] = useState<"problems" | "dashboard">("problems");

  // Unauthenticated Auth Sub-tab: "login" | "signup_citizen" | "signup_solver"
  const [authSubTab, setAuthSubTab] = useState<"login" | "signup_citizen" | "signup_solver">("login");

  // Auth Form States
  const [authEmail, setAuthEmail] = useState("");
  const [authPassword, setAuthPassword] = useState("");
  const [authFullName, setAuthFullName] = useState("");
  const [authPhone, setAuthPhone] = useState("");
  const [authRole, setAuthRole] = useState<Role>(Role.CITIZEN);
  const [authOrg, setAuthOrg] = useState("");
  const [authDesignation, setAuthDesignation] = useState("");
  const [authDistrict, setAuthDistrict] = useState("Ranchi");
  const [authError, setAuthError] = useState<string | null>(null);
  const [authSubmitting, setAuthSubmitting] = useState(false);

  // Data States
  const [tickets, setTickets] = useState<any[]>([]);
  const [dataLoading, setDataLoading] = useState(false);
  const [dataError, setDataError] = useState<string | null>(null);

  // Filters for Problems Tab
  const [selectedDomain, setSelectedDomain] = useState<string>("all");
  const [selectedDistrictFilter, setSelectedDistrictFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const jharkhandDistricts = [
    "Bokaro", "Chatra", "Deoghar", "Dhanbad", "Dumka", "East Singhbhum",
    "Garhwa", "Giridih", "Godda", "Gumla", "Hazaribagh", "Jamtara",
    "Khunti", "Koderma", "Latehar", "Lohardaga", "Pakur", "Palamu",
    "Ramgarh", "Ranchi", "Sahebganj", "Seraikela Kharsawan", "Simdega", "West Singhbhum"
  ];

  const fetchTickets = async () => {
    setDataLoading(true);
    setDataError(null);
    try {
      const data = await apiRequest<any[]>("/tickets");
      setTickets(data);
    } catch (err: any) {
      setDataError(err.message || "Failed to load tickets");
    } finally {
      setDataLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchTickets();
    }
  }, [user]);

  // Trigger onboarding tour on first login
  useEffect(() => {
    if (user && user.first_login) {
      setIsHelpOpen(true);
    }
  }, [user]);

  // Handle Login / Signup submit directly from the main view
  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);
    setAuthSubmitting(true);

    try {
      if (authSubTab === "login") {
        await login(authEmail, authPassword);
      } else if (authSubTab === "signup_citizen") {
        await signupCitizen({
          full_name: authFullName,
          email: authEmail,
          phone: authPhone || undefined,
          password: authPassword,
          role: authRole,
        });
      } else if (authSubTab === "signup_solver") {
        await signupSolver({
          full_name: authFullName,
          email: authEmail,
          phone: authPhone || undefined,
          password: authPassword,
          role: authRole,
          organization: authOrg,
          designation: authDesignation || undefined,
          district: authDistrict,
        });
      }
    } catch (err: any) {
      setAuthError(err.message || "Authentication failed");
    } finally {
      setAuthSubmitting(false);
    }
  };

  const handleQuickLogin = async (demoEmail: string) => {
    setAuthError(null);
    setAuthSubmitting(true);
    try {
      await login(demoEmail, "demo1234");
    } catch (err: any) {
      setAuthError(err.message || "Quick login failed");
    } finally {
      setAuthSubmitting(false);
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Header />
        <LoadingSpinner label="Loading application..." />
      </div>
    );
  }

  // ---------------------------------------------------------------------------
  // 1. UNAUTHENTICATED INITIAL VIEW (Direct Login / Signup Auth)
  // ---------------------------------------------------------------------------
  if (!user) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Header onOpenHelp={() => setIsHelpOpen(true)} />
        <HelpModal isOpen={isHelpOpen} onClose={() => setIsHelpOpen(false)} />

        <main className="flex-1 max-w-4xl w-full mx-auto px-4 py-8 sm:py-12 flex flex-col items-center justify-center">
          {/* Welcome Banner */}
          <div className="text-center mb-8">
            <span className="inline-block px-3.5 py-1.5 rounded-full bg-primary text-foreground text-xs font-bold mb-3">
              {lang === "hi" ? "झारखंड समाज नवोन्मेष पोर्टल" : "Jharkhand Societal Innovation Portal"}
            </span>
            <h1 className="text-2xl sm:text-4xl font-extrabold text-foreground tracking-tight">
              {lang === "hi"
                ? "पोर्टल में प्रवेश करें (Sign in to Access)"
                : "Sign in to Access Portal"}
            </h1>
            <p className="text-sm text-muted mt-2 max-w-lg mx-auto">
              {lang === "hi"
                ? "समस्या दर्ज करने या समाधान देखने के लिए कृपया लॉगिन करें या पंजीकरण करें।"
                : "Please login or create an account to submit problems or view solved dashboards."}
            </p>
          </div>

          {/* Integrated Auth Card with Sub-tabs */}
          <div className="w-full max-w-md bg-card rounded-2xl border border-border p-6 sm:p-8 shadow-xs">
            {/* Auth Sub-tabs */}
            <div className="flex rounded-xl bg-background p-1 border border-border mb-6">
              <button
                type="button"
                onClick={() => setAuthSubTab("login")}
                className={`flex-1 py-2 text-xs font-bold rounded-lg transition-colors ${
                  authSubTab === "login"
                    ? "bg-primary text-foreground shadow-xs"
                    : "text-muted hover:text-foreground"
                }`}
              >
                {lang === "hi" ? "लॉगिन (Login)" : "Sign In"}
              </button>
              <button
                type="button"
                onClick={() => {
                  setAuthSubTab("signup_citizen");
                  setAuthRole(Role.CITIZEN);
                }}
                className={`flex-1 py-2 text-xs font-bold rounded-lg transition-colors ${
                  authSubTab === "signup_citizen"
                    ? "bg-primary text-foreground shadow-xs"
                    : "text-muted hover:text-foreground"
                }`}
              >
                {lang === "hi" ? "नागरिक (Citizen)" : "Citizen Signup"}
              </button>
              <button
                type="button"
                onClick={() => {
                  setAuthSubTab("signup_solver");
                  setAuthRole(Role.UNIVERSITY);
                }}
                className={`flex-1 py-2 text-xs font-bold rounded-lg transition-colors ${
                  authSubTab === "signup_solver"
                    ? "bg-primary text-foreground shadow-xs"
                    : "text-muted hover:text-foreground"
                }`}
              >
                {lang === "hi" ? "संस्था (Institution)" : "Solver Signup"}
              </button>
            </div>

            {authError && (
              <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-200 text-destructive text-sm font-medium">
                Notice: {authError}
              </div>
            )}

            <form onSubmit={handleAuthSubmit} className="space-y-4">
              {(authSubTab === "signup_citizen" || authSubTab === "signup_solver") && (
                <div>
                  <label className="block text-xs font-bold text-foreground mb-1">
                    {lang === "hi" ? "पूरा नाम (Full Name)" : "Full Name"} *
                  </label>
                  <input
                    type="text"
                    required
                    value={authFullName}
                    onChange={(e) => setAuthFullName(e.target.value)}
                    placeholder="Ramesh Kumar / Dr. Ananya"
                    className="w-full px-4 py-3 rounded-xl border border-border bg-white text-foreground text-sm"
                  />
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-foreground mb-1">
                  {lang === "hi" ? "ईमेल (Email Address)" : "Email Address"} *
                </label>
                <input
                  type="email"
                  required
                  value={authEmail}
                  onChange={(e) => setAuthEmail(e.target.value)}
                  placeholder="user@example.com"
                  className="w-full px-4 py-3 rounded-xl border border-border bg-white text-foreground text-sm"
                />
              </div>

              {authSubTab === "signup_solver" && (
                <>
                  <div>
                    <label className="block text-xs font-bold text-foreground mb-1">
                      {lang === "hi" ? "संस्थान / कंपनी का नाम" : "Organization Name"} *
                    </label>
                    <input
                      type="text"
                      required
                      value={authOrg}
                      onChange={(e) => setAuthOrg(e.target.value)}
                      placeholder="BIT Mesra / Tata CSR"
                      className="w-full px-4 py-3 rounded-xl border border-border bg-white text-foreground text-sm"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-foreground mb-1">
                        {lang === "hi" ? "प्रकार (Type)" : "Type"}
                      </label>
                      <select
                        value={authRole}
                        onChange={(e) => setAuthRole(e.target.value as Role)}
                        className="w-full px-3 py-3 rounded-xl border border-border bg-white text-xs font-medium"
                      >
                        <option value={Role.UNIVERSITY}>University</option>
                        <option value={Role.INDUSTRY}>Industry</option>
                        <option value={Role.GOVT}>Govt Dept</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-foreground mb-1">
                        {lang === "hi" ? "जिला (District)" : "District"}
                      </label>
                      <select
                        value={authDistrict}
                        onChange={(e) => setAuthDistrict(e.target.value)}
                        className="w-full px-3 py-3 rounded-xl border border-border bg-white text-xs font-medium"
                      >
                        {jharkhandDistricts.map((d) => (
                          <option key={d} value={d}>
                            {d}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </>
              )}

              <div>
                <label className="block text-xs font-bold text-foreground mb-1">
                  {lang === "hi" ? "पासवर्ड (Password)" : "Password"} *
                </label>
                <input
                  type="password"
                  required
                  value={authPassword}
                  onChange={(e) => setAuthPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-4 py-3 rounded-xl border border-border bg-white text-foreground text-sm"
                />
              </div>

              <button
                type="submit"
                disabled={authSubmitting}
                className="w-full py-3.5 px-6 rounded-xl font-bold bg-primary text-foreground hover:opacity-90 transition-opacity min-h-[48px] text-base shadow-xs disabled:opacity-50 mt-2"
              >
                {authSubmitting
                  ? "Processing..."
                  : authSubTab === "login"
                  ? lang === "hi" ? "लॉगिन करें" : "Sign In"
                  : lang === "hi" ? "खाता बनाएं" : "Create Account"}
              </button>
            </form>
          </div>

          {/* Quick Demo Accounts Bar */}
          <div className="w-full max-w-2xl mt-8 p-6 bg-white rounded-2xl border border-border shadow-xs">
            <h2 className="text-xs font-bold uppercase tracking-wider text-muted mb-4 text-center">
              {lang === "hi" ? "त्वरित परीक्षण हेतु डेमो खाते (Quick Demo Login)" : "Quick Demo Accounts for Evaluation"}
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              <button
                onClick={() => handleQuickLogin("citizen@demo.com")}
                className="p-3 text-left rounded-xl border border-border hover:bg-background transition-colors"
              >
                <span className="block font-bold text-xs text-foreground">Citizen</span>
                <span className="block text-[11px] text-muted truncate">citizen@demo.com</span>
              </button>
              <button
                onClick={() => handleQuickLogin("pri@demo.com")}
                className="p-3 text-left rounded-xl border border-border hover:bg-background transition-colors"
              >
                <span className="block font-bold text-xs text-foreground">PRI / Mukhiya</span>
                <span className="block text-[11px] text-muted truncate">pri@demo.com</span>
              </button>
              <button
                onClick={() => handleQuickLogin("uni@demo.com")}
                className="p-3 text-left rounded-xl border border-border hover:bg-background transition-colors"
              >
                <span className="block font-bold text-xs text-foreground">University</span>
                <span className="block text-[11px] text-muted truncate">uni@demo.com</span>
              </button>
              <button
                onClick={() => handleQuickLogin("industry@demo.com")}
                className="p-3 text-left rounded-xl border border-border hover:bg-background transition-colors"
              >
                <span className="block font-bold text-xs text-foreground">Industry / CSR</span>
                <span className="block text-[11px] text-muted truncate">industry@demo.com</span>
              </button>
              <button
                onClick={() => handleQuickLogin("govt@demo.com")}
                className="p-3 text-left rounded-xl border border-border hover:bg-background transition-colors"
              >
                <span className="block font-bold text-xs text-foreground">Govt Officer</span>
                <span className="block text-[11px] text-muted truncate">govt@demo.com</span>
              </button>
            </div>
          </div>
        </main>
      </div>
    );
  }

  // ---------------------------------------------------------------------------
  // 2. AUTHENTICATED MAIN APPLICATION WITH TWO MAIN TABS
  // ---------------------------------------------------------------------------
  const isSimple = user.ui_density === UIDensity.SIMPLE;

  // Compute District Heatmap Data
  const districtCounts: Record<string, { total: number; solved: number; pending: number }> = {};
  jharkhandDistricts.forEach((d) => {
    districtCounts[d] = { total: 0, solved: 0, pending: 0 };
  });

  tickets.forEach((t) => {
    const dist = t.location_district || "Ranchi";
    if (!districtCounts[dist]) {
      districtCounts[dist] = { total: 0, solved: 0, pending: 0 };
    }
    districtCounts[dist].total += 1;
    if (t.status === TicketStatus.CLOSED) {
      districtCounts[dist].solved += 1;
    } else {
      districtCounts[dist].pending += 1;
    }
  });

  const solvedTickets = tickets.filter((t) => t.status === TicketStatus.CLOSED);
  const pendingTickets = tickets.filter((t) => t.status !== TicketStatus.CLOSED);

  const filteredProblems = tickets.filter((t) => {
    if (selectedDomain !== "all" && t.domain !== selectedDomain) return false;
    if (selectedDistrictFilter !== "all" && t.location_district !== selectedDistrictFilter) return false;
    if (statusFilter === "pending" && t.status === TicketStatus.CLOSED) return false;
    if (statusFilter === "solved" && t.status !== TicketStatus.CLOSED) return false;
    return true;
  });

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header onOpenHelp={() => setIsHelpOpen(true)} />
      <HelpModal isOpen={isHelpOpen} onClose={() => setIsHelpOpen(false)} />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* User Identity Welcome Banner */}
        <div className="bg-card rounded-2xl border border-border p-5 sm:p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6 shadow-xs">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-muted block mb-1">
              {user.role} mode ({user.ui_density} density)
            </span>
            <h1 className="text-xl sm:text-2xl font-extrabold text-foreground">
              {lang === "hi" ? `नमस्ते, ${user.full_name}` : `Welcome, ${user.full_name}`}
            </h1>
            <p className="text-xs text-muted mt-0.5">
              {user.organization ? `${user.organization} | ` : ""}District: {user.district || "Jharkhand"}
            </p>
          </div>

          <Link
            href="/submit"
            className="w-full sm:w-auto px-5 py-3 rounded-xl bg-primary text-foreground font-bold text-sm shadow-xs hover:opacity-90 transition-opacity flex items-center justify-center gap-2 min-h-[44px]"
          >
            <span>+</span>
            <span>{lang === "hi" ? "नई समस्या दर्ज करें" : "Submit New Problem"}</span>
          </Link>
        </div>

        {/* ------------------------------------------------------------------- */}
        {/* TWO MAIN NAVIGATION TABS                                            */}
        {/* ------------------------------------------------------------------- */}
        <div className="flex border-b border-border mb-6 space-x-2">
          <button
            onClick={() => setActiveMainTab("problems")}
            className={`py-3 px-6 font-bold text-sm sm:text-base border-b-2 transition-all flex items-center gap-2 min-h-[48px] ${
              activeMainTab === "problems"
                ? "border-foreground text-foreground bg-white rounded-t-xl"
                : "border-transparent text-muted hover:text-foreground"
            }`}
          >
            <span>{lang === "hi" ? "समस्याएं (Problems List)" : "Problems & Queue"}</span>
            <span className="ml-1 px-2 py-0.5 rounded-full bg-primary text-foreground text-xs">
              {tickets.length}
            </span>
          </button>

          <button
            onClick={() => setActiveMainTab("dashboard")}
            className={`py-3 px-6 font-bold text-sm sm:text-base border-b-2 transition-all flex items-center gap-2 min-h-[48px] ${
              activeMainTab === "dashboard"
                ? "border-foreground text-foreground bg-white rounded-t-xl"
                : "border-transparent text-muted hover:text-foreground"
            }`}
          >
            <span>{lang === "hi" ? "डैशबोर्ड एवं हीटमैप (Dashboard & Heatmap)" : "Dashboard & Solved Heatmap"}</span>
            <span className="ml-1 px-2 py-0.5 rounded-full bg-green-100 text-green-800 text-xs">
              {solvedTickets.length} Solved
            </span>
          </button>
        </div>

        {/* ------------------------------------------------------------------- */}
        {/* TAB 1: PROBLEMS LIST & INTAKE                                        */}
        {/* ------------------------------------------------------------------- */}
        {activeMainTab === "problems" && (
          <div className="space-y-6">
            {/* Filter Bar */}
            <div className="bg-card p-4 rounded-2xl border border-border flex flex-wrap items-center justify-between gap-4 shadow-xs">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setStatusFilter("all")}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-colors ${
                    statusFilter === "all" ? "bg-primary text-foreground" : "bg-background text-muted"
                  }`}
                >
                  All ({tickets.length})
                </button>
                <button
                  onClick={() => setStatusFilter("pending")}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-colors ${
                    statusFilter === "pending" ? "bg-primary text-foreground" : "bg-background text-muted"
                  }`}
                >
                  Pending ({pendingTickets.length})
                </button>
                <button
                  onClick={() => setStatusFilter("solved")}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-colors ${
                    statusFilter === "solved" ? "bg-primary text-foreground" : "bg-background text-muted"
                  }`}
                >
                  Solved ({solvedTickets.length})
                </button>
              </div>

              <div className="flex items-center gap-3">
                <select
                  value={selectedDomain}
                  onChange={(e) => setSelectedDomain(e.target.value)}
                  className="px-3 py-2 rounded-xl border border-border bg-white text-xs font-semibold"
                >
                  <option value="all">All Domains</option>
                  {Object.values(Domain).map((d) => (
                    <option key={d} value={d}>
                      {d}
                    </option>
                  ))}
                </select>

                <select
                  value={selectedDistrictFilter}
                  onChange={(e) => setSelectedDistrictFilter(e.target.value)}
                  className="px-3 py-2 rounded-xl border border-border bg-white text-xs font-semibold"
                >
                  <option value="all">All Districts</option>
                  {jharkhandDistricts.map((dist) => (
                    <option key={dist} value={dist}>
                      {dist}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* List / Cards */}
            {dataLoading ? (
              <LoadingSpinner label="Loading problems..." />
            ) : dataError ? (
              <ErrorBanner message={dataError} onRetry={fetchTickets} />
            ) : filteredProblems.length === 0 ? (
              <EmptyState
                title={lang === "hi" ? "कोई समस्या नहीं मिली" : "No Matching Problems"}
                description={lang === "hi" ? "कृपया फ़िल्टर बदलें या नई समस्या दर्ज करें।" : "Adjust filters or report a new problem."}
                actionLabel={lang === "hi" ? "समस्या दर्ज करें" : "Submit Problem"}
                onAction={() => router.push("/submit")}
              />
            ) : isSimple ? (
              /* Citizen Card Grid Layout */
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredProblems.map((t) => (
                  <Link
                    key={t.id}
                    href={`/tickets/${t.ticket_id}`}
                    className="block bg-card rounded-2xl border border-border p-5 hover:border-gray-400 transition-all shadow-xs group"
                  >
                    <div className="flex items-center justify-between gap-2 mb-3">
                      <span className="px-3 py-1 rounded-full bg-foreground text-background font-mono font-bold text-xs">
                        {t.ticket_id}
                      </span>
                      <span className="px-3 py-1 rounded-full bg-amber-100 text-amber-900 font-bold text-xs capitalize">
                        {t.status}
                      </span>
                    </div>
                    <h3 className="font-bold text-base text-foreground group-hover:text-black line-clamp-2 mb-2">
                      {t.title}
                    </h3>
                    <p className="text-xs text-muted line-clamp-2 mb-4">
                      {t.description}
                    </p>
                    <div className="flex items-center justify-between text-xs text-muted pt-3 border-t border-border">
                      <span>District: {t.location_district || "Jharkhand"}</span>
                      <span className="font-bold text-foreground">विवरण देखें -&gt;</span>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              /* Solver / Govt Denser Data Table */
              <div className="bg-white rounded-2xl border border-border shadow-xs overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="bg-background border-b border-border text-muted uppercase tracking-wider font-bold">
                        <th className="py-3.5 px-4">Ticket ID</th>
                        <th className="py-3.5 px-4">Title & Location</th>
                        <th className="py-3.5 px-4">Domain</th>
                        <th className="py-3.5 px-4">Severity & Score</th>
                        <th className="py-3.5 px-4">Status</th>
                        <th className="py-3.5 px-4 text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border font-medium">
                      {filteredProblems.map((t) => (
                        <tr key={t.id} className="hover:bg-background/50 transition-colors">
                          <td className="py-4 px-4 font-mono font-bold text-foreground">{t.ticket_id}</td>
                          <td className="py-4 px-4 max-w-xs">
                            <span className="font-bold text-foreground block truncate">{t.title}</span>
                            <span className="text-[11px] text-muted block">District: {t.location_district || "N/A"}</span>
                          </td>
                          <td className="py-4 px-4">
                            <span className="px-2.5 py-1 rounded-lg bg-primary/40 text-foreground font-semibold uppercase text-[10px]">
                              {t.domain || "general"}
                            </span>
                          </td>
                          <td className="py-4 px-4">
                            <span className="font-bold text-red-700 uppercase block">{t.severity || "MEDIUM"}</span>
                            <span className="text-[11px] text-muted">Score: {t.queue_score || "0.50"}</span>
                          </td>
                          <td className="py-4 px-4">
                            <span className="px-2.5 py-1 rounded-lg bg-amber-100 text-amber-900 font-bold uppercase text-[10px]">
                              {t.status}
                            </span>
                          </td>
                          <td className="py-4 px-4 text-right">
                            <Link
                              href={`/tickets/${t.ticket_id}`}
                              className="px-3 py-1.5 rounded-lg border border-border bg-white text-xs font-bold text-foreground hover:bg-background transition-colors inline-block"
                            >
                              Inspect -&gt;
                            </Link>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ------------------------------------------------------------------- */}
        {/* TAB 2: DASHBOARD, HEATMAP & SOLVED METRICS                           */}
        {/* ------------------------------------------------------------------- */}
        {activeMainTab === "dashboard" && (
          <div className="space-y-8">
            {/* Top Metric Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
              <div className="bg-card p-5 rounded-2xl border border-border shadow-xs">
                <span className="text-xs font-bold text-muted uppercase">TOTAL PROBLEMS</span>
                <span className="block text-3xl font-extrabold text-foreground mt-1">{tickets.length}</span>
              </div>
              <div className="bg-card p-5 rounded-2xl border border-border shadow-xs">
                <span className="text-xs font-bold text-muted uppercase">PENDING TRIAGE / WORK</span>
                <span className="block text-3xl font-extrabold text-amber-700 mt-1">{pendingTickets.length}</span>
              </div>
              <div className="bg-card p-5 rounded-2xl border border-border shadow-xs">
                <span className="text-xs font-bold text-muted uppercase">SOLVED & CLOSED</span>
                <span className="block text-3xl font-extrabold text-green-700 mt-1">{solvedTickets.length}</span>
              </div>
              <div className="bg-card p-5 rounded-2xl border border-border shadow-xs">
                <span className="text-xs font-bold text-muted uppercase">RESOLUTION RATE</span>
                <span className="block text-3xl font-extrabold text-foreground mt-1">
                  {tickets.length > 0 ? `${Math.round((solvedTickets.length / tickets.length) * 100)}%` : "0%"}
                </span>
              </div>
            </div>

            {/* JHARKHAND DISTRICTS INTERACTIVE HEATMAP */}
            <div className="bg-white rounded-2xl border border-border p-6 shadow-xs">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
                <div>
                  <h3 className="text-lg font-bold text-foreground">
                    {lang === "hi" ? "झारखंड जिला-वार समस्या एवं समाधान हीटमैप" : "Jharkhand Districts Problem & Heatmap"}
                  </h3>
                  <p className="text-xs text-muted mt-1">
                    Intensity of societal challenges and resolution status across all 24 districts of Jharkhand.
                  </p>
                </div>

                <div className="flex items-center gap-3 text-xs font-semibold">
                  <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded bg-red-200 border border-red-400"></span> High Volume</span>
                  <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded bg-amber-100 border border-amber-300"></span> Active Work</span>
                  <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded bg-green-100 border border-green-300"></span> Solved</span>
                </div>
              </div>

              {/* District Heatmap Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-3">
                {jharkhandDistricts.map((dist) => {
                  const stat = districtCounts[dist] || { total: 0, solved: 0, pending: 0 };
                  let bgClass = "bg-background border-border text-foreground";
                  if (stat.pending > 1) bgClass = "bg-red-50 border-red-200 text-red-950 font-bold";
                  else if (stat.pending === 1) bgClass = "bg-amber-50 border-amber-200 text-amber-950 font-bold";
                  else if (stat.solved > 0) bgClass = "bg-green-50 border-green-200 text-green-950 font-bold";

                  return (
                    <button
                      key={dist}
                      onClick={() => {
                        setSelectedDistrictFilter(dist);
                        setActiveMainTab("problems");
                      }}
                      className={`p-3 rounded-xl border text-left transition-all hover:scale-102 ${bgClass}`}
                    >
                      <span className="block text-xs font-bold truncate">{dist}</span>
                      <div className="flex items-center justify-between text-[11px] mt-2 pt-1 border-t border-black/5">
                        <span className="text-muted">Issues:</span>
                        <span className="font-extrabold">{stat.total}</span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Solved Problems Portfolio */}
            <div className="bg-card rounded-2xl border border-border p-6 shadow-xs">
              <h3 className="text-lg font-bold text-foreground mb-4">
                {lang === "hi" ? "समाधानित समस्याएं एवं फीडबैक रिकॉर्ड" : "Closed & Solved Problems Log"}
              </h3>

              {solvedTickets.length === 0 ? (
                <EmptyState
                  title="No Closed Problems Yet"
                  description="Problems close after solver implementation and citizen feedback confirmation."
                />
              ) : (
                <div className="space-y-3">
                  {solvedTickets.map((t) => (
                    <div key={t.id} className="p-4 bg-white rounded-xl border border-border flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div>
                        <span className="font-mono text-xs font-bold text-muted">{t.ticket_id}</span>
                        <h4 className="font-bold text-sm text-foreground">{t.title}</h4>
                        <span className="text-xs text-muted">District: {t.location_district} | Solver: {t.assignee?.full_name || "HEI Team"}</span>
                      </div>
                      <div className="text-right">
                        <span className="px-3 py-1 rounded-full bg-green-100 text-green-800 text-xs font-bold inline-block">
                          Rated {t.feedback_quality || 5}/5 Stars
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
