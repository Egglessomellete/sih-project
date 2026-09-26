"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Header } from "@/components/Header";
import { HelpModal } from "@/components/HelpModal";
import { EmptyState, ErrorBanner, LoadingSpinner } from "@/components/UIState";
import { useAuth } from "@/context/AuthContext";
import { apiRequest } from "@/lib/api";
import { DOMAIN_LABELS, STATUS_LABELS, TicketStatus, UIDensity } from "@/lib/enums";

export default function TicketDetailPage() {
  const { ticket_id } = useParams<{ ticket_id: string }>();
  const { user, lang } = useAuth();
  const router = useRouter();

  const [ticket, setTicket] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isHelpOpen, setIsHelpOpen] = useState(false);

  // Feedback form state
  const [rating, setRating] = useState(5);
  const [resolved, setResolved] = useState(true);
  const [comment, setComment] = useState("");
  const [submittingFeedback, setSubmittingFeedback] = useState(false);

  // Escalation packet state
  const [escalating, setEscalating] = useState(false);

  const fetchTicket = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await apiRequest<any>(`/tickets/${ticket_id}`);
      setTicket(data);
    } catch (err: any) {
      setError(err.message || "Failed to load ticket");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (ticket_id) {
      fetchTicket();
    }
  }, [ticket_id]);

  const handleStatusChange = async (newStatus: TicketStatus) => {
    try {
      const updated = await apiRequest<any>(`/tickets/${ticket_id}/status`, {
        method: "PUT",
        body: JSON.stringify({
          status: newStatus,
          assignee_id: user?.id,
        }),
      });
      setTicket(updated);
    } catch (err: any) {
      alert(err.message || "Status update failed");
    }
  };

  const handleFeedbackSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmittingFeedback(true);
    try {
      const updated = await apiRequest<any>(`/tickets/${ticket_id}/feedback`, {
        method: "POST",
        body: JSON.stringify({
          resolved,
          quality: rating,
          comment,
        }),
      });
      setTicket(updated);
    } catch (err: any) {
      alert(err.message || "Feedback submission failed");
    } finally {
      setSubmittingFeedback(false);
    }
  };

  const handleEscalate = async () => {
    setEscalating(true);
    try {
      const updated = await apiRequest<any>(`/tickets/${ticket_id}/escalate`);
      setTicket(updated);
    } catch (err: any) {
      alert(err.message || "Escalation failed");
    } finally {
      setEscalating(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Header />
        <LoadingSpinner label="Loading ticket details..." />
      </div>
    );
  }

  if (error || !ticket) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Header />
        <div className="max-w-xl mx-auto px-4 py-12">
          <ErrorBanner message={error || "Ticket not found"} onRetry={fetchTicket} />
        </div>
      </div>
    );
  }

  const isSimple = !user || user.ui_density === UIDensity.SIMPLE;
  const isReporter = user?.id === ticket.reporter_id;
  const isSolver = user && [ "university", "industry", "govt" ].includes(user.role);

  const statusInfo = STATUS_LABELS[ticket.status as TicketStatus] || {
    en: ticket.status,
    hi: ticket.status,
  };
  const domainInfo = ticket.domain
    ? DOMAIN_LABELS[ticket.domain as keyof typeof DOMAIN_LABELS]
    : { en: "General", hi: "सामान्य" };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header onOpenHelp={() => setIsHelpOpen(true)} />
      <HelpModal isOpen={isHelpOpen} onClose={() => setIsHelpOpen(false)} />

      <main className="flex-1 max-w-5xl w-full mx-auto px-4 py-8">
        {/* Header Ticket Banner */}
        <div className="bg-card rounded-2xl border border-border p-6 sm:p-8 shadow-xs mb-6">
          <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
            <div className="flex items-center gap-3">
              <span className="px-3 py-1 rounded-full bg-foreground text-background font-mono font-bold text-sm">
                {ticket.ticket_id}
              </span>
              <span className="px-3 py-1 rounded-full bg-primary text-foreground text-xs font-bold uppercase">
                {lang === "hi" ? domainInfo.hi : domainInfo.en}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-muted">
                {lang === "hi" ? "स्थिति:" : "Status:"}
              </span>
              <span className="px-3 py-1.5 rounded-xl bg-amber-100 text-amber-900 font-bold text-xs border border-amber-300">
                {lang === "hi" ? statusInfo.hi : statusInfo.en}
              </span>
            </div>
          </div>

          <h1 className="text-xl sm:text-2xl font-bold text-foreground mb-3">
            {ticket.title}
          </h1>

          <p className="text-sm sm:text-base text-foreground/90 leading-relaxed whitespace-pre-wrap mb-6">
            {ticket.description}
          </p>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs bg-background p-4 rounded-xl border border-border">
            <div>
              <span className="block text-muted font-semibold">District</span>
              <span className="font-bold text-foreground">{ticket.location_district || "N/A"}</span>
            </div>
            <div>
              <span className="block text-muted font-semibold">Date</span>
              <span className="font-bold text-foreground">
                {new Date(ticket.created_at).toLocaleDateString()}
              </span>
            </div>
            <div>
              <span className="block text-muted font-semibold">Reporter</span>
              <span className="font-bold text-foreground">
                {ticket.reporter?.full_name || "Citizen"}
              </span>
            </div>
            <div>
              <span className="block text-muted font-semibold">Assignee</span>
              <span className="font-bold text-foreground">
                {ticket.assignee?.full_name || "Unassigned"}
              </span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Work Area */}
          <div className="lg:col-span-2 space-y-6">
            {/* AI Analysis Insight Box */}
            {ticket.analysis_json && (
              <div className="bg-white rounded-2xl border border-border p-6 shadow-xs">
                <h3 className="text-sm font-bold uppercase tracking-wider text-muted mb-4 flex items-center gap-2">
                  {lang === "hi" ? "एआई वर्गीकरण एवं विश्लेषण" : "AI Triage Insights"}
                </h3>

                <div className="grid grid-cols-3 gap-3 mb-4 text-center">
                  <div className="p-3 bg-background rounded-xl border border-border">
                    <span className="block text-[10px] text-muted font-bold">SEVERITY</span>
                    <span className="font-bold text-xs uppercase text-red-700">
                      {ticket.severity || "Medium"}
                    </span>
                  </div>
                  <div className="p-3 bg-background rounded-xl border border-border">
                    <span className="block text-[10px] text-muted font-bold">PRIORITY</span>
                    <span className="font-bold text-xs uppercase text-amber-700">
                      {ticket.priority || "Medium"}
                    </span>
                  </div>
                  <div className="p-3 bg-background rounded-xl border border-border">
                    <span className="block text-[10px] text-muted font-bold">QUEUE SCORE</span>
                    <span className="font-bold text-xs text-foreground">
                      {ticket.queue_score || "0.50"} / 1.0
                    </span>
                  </div>
                </div>

                <p className="text-xs text-muted leading-relaxed bg-background p-3 rounded-xl border border-border">
                  {ticket.analysis_json.explanation}
                </p>
              </div>
            )}

            {/* Closed Feedback Loop Section */}
            {(isReporter || isSimple) && (
              <div className="bg-card rounded-2xl border border-border p-6 shadow-xs">
                <h3 className="text-base font-bold text-foreground mb-2 flex items-center gap-2">
                  {lang === "hi" ? "समाधान सत्यापन एवं प्रतिक्रिया" : "Closed Feedback Loop"}
                </h3>
                <p className="text-xs text-muted mb-4">
                  {lang === "hi"
                    ? "महत्वपूर्ण नियम: समस्या केवल आपकी पुष्टि के बाद ही बंद होगी।"
                    : "Rule: Tickets remain open until citizen confirms the solution."}
                </p>

                <form onSubmit={handleFeedbackSubmit} className="space-y-4 bg-background p-4 rounded-xl border border-border">
                  <div>
                    <label className="block text-xs font-bold text-foreground mb-2">
                      {lang === "hi" ? "क्या समस्या हल हो गई है?" : "Has the problem been solved?"}
                    </label>
                    <div className="flex gap-4">
                      <label className="flex items-center gap-2 text-sm font-semibold cursor-pointer">
                        <input
                          type="radio"
                          name="resolved"
                          checked={resolved === true}
                          onChange={() => setResolved(true)}
                        />
                        {lang === "hi" ? "हां, समाधान हो गया है" : "Yes, Resolved"}
                      </label>
                      <label className="flex items-center gap-2 text-sm font-semibold cursor-pointer">
                        <input
                          type="radio"
                          name="resolved"
                          checked={resolved === false}
                          onChange={() => setResolved(false)}
                        />
                        {lang === "hi" ? "नहीं, समस्या अभी भी बनी है" : "No, Not Resolved"}
                      </label>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-foreground mb-1">
                      {lang === "hi" ? "कार्य की गुणवत्ता दर (1-5)" : "Solution Quality (1-5 Stars)"}
                    </label>
                    <select
                      value={rating}
                      onChange={(e) => setRating(Number(e.target.value))}
                      className="w-full p-2.5 rounded-xl border border-border bg-white text-xs font-bold"
                    >
                      <option value={5}>5/5 Excellent</option>
                      <option value={4}>4/5 Good</option>
                      <option value={3}>3/5 Average</option>
                      <option value={2}>2/5 Poor</option>
                      <option value={1}>1/5 Unsatisfactory</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-foreground mb-1">
                      {lang === "hi" ? "टिप्पणी / प्रतिक्रिया" : "Comment"}
                    </label>
                    <input
                      type="text"
                      value={comment}
                      onChange={(e) => setComment(e.target.value)}
                      placeholder={lang === "hi" ? "अपनी राय लिखें..." : "Enter your feedback..."}
                      className="w-full p-2.5 rounded-xl border border-border bg-white text-xs"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={submittingFeedback}
                    className="w-full py-3 rounded-xl bg-primary text-foreground font-bold text-xs hover:opacity-90 transition-opacity min-h-[44px]"
                  >
                    {submittingFeedback
                      ? "Submitting..."
                      : lang === "hi"
                      ? "प्रतिक्रिया जमा करें एवं टिकट बंद करें"
                      : "Submit Feedback & Confirm Closure"}
                  </button>
                </form>
              </div>
            )}
          </div>

          {/* Sidebar Actions & Escalation */}
          <div className="space-y-6">
            {/* Solver Actions */}
            {isSolver && (
              <div className="bg-white rounded-2xl border border-border p-6 shadow-xs space-y-3">
                <h3 className="text-xs font-bold uppercase tracking-wider text-muted mb-2">
                  {lang === "hi" ? "संस्थात्मक कार्रवाई" : "Solver Actions"}
                </h3>

                {ticket.status === TicketStatus.UNDER_REVIEW && (
                  <button
                    onClick={() => handleStatusChange(TicketStatus.ACCEPTED)}
                    className="w-full py-3 rounded-xl bg-primary text-foreground font-bold text-xs hover:opacity-90 transition-opacity min-h-[44px]"
                  >
                    {lang === "hi" ? "समस्या स्वीकार करें (Accept Challenge)" : "Accept Challenge"}
                  </button>
                )}

                {ticket.status === TicketStatus.ACCEPTED && (
                  <button
                    onClick={() => handleStatusChange(TicketStatus.IN_PROGRESS)}
                    className="w-full py-3 rounded-xl bg-primary text-foreground font-bold text-xs hover:opacity-90 transition-opacity min-h-[44px]"
                  >
                    {lang === "hi" ? "कार्य प्रारंभ करें (Start Work)" : "Start Implementation"}
                  </button>
                )}

                {ticket.status === TicketStatus.IN_PROGRESS && (
                  <button
                    onClick={() => handleStatusChange(TicketStatus.PENDING_FEEDBACK)}
                    className="w-full py-3 rounded-xl bg-amber-200 text-foreground font-bold text-xs hover:opacity-90 transition-opacity min-h-[44px]"
                  >
                    {lang === "hi" ? "समाधान का दावा करें (Mark Fix Claimed)" : "Mark Fix Claimed"}
                  </button>
                )}
              </div>
            )}

            {/* Official Portal Escalation Box */}
            <div className="bg-white rounded-2xl border border-border p-6 shadow-xs">
              <h3 className="text-xs font-bold uppercase tracking-wider text-muted mb-2">
                {lang === "hi" ? "शासकीय पोर्टल पर प्रेषण" : "Official Portal Escalation"}
              </h3>
              <p className="text-xs text-muted mb-4 leading-relaxed">
                {lang === "hi"
                  ? "यदि यह एक प्रशासनिक शिकायत है, तो आधिकारिक राज्य/केंद्रीय ग्रीवेंस पोर्टल का पैकेट जनरेट करें।"
                  : "Prepare an official escalation packet for SPGRMS / CPGRAMS."}
              </p>

              {ticket.escalation_json ? (
                <div className="p-3 bg-background rounded-xl border border-border text-xs space-y-2">
                  <span className="block font-bold text-green-700">Status: Escalation Packet Ready</span>
                  <p className="text-[11px] font-mono whitespace-pre-wrap bg-white p-2 rounded border border-border">
                    {ticket.escalation_json.copy_ready_summary}
                  </p>
                  <div className="pt-2 space-y-1">
                    {ticket.escalation_json.official_portals?.map((p: any, idx: number) => (
                      <a
                        key={idx}
                        href={p.url}
                        target="_blank"
                        rel="noreferrer"
                        className="block text-[11px] font-bold text-blue-600 underline hover:text-blue-800"
                      >
                        -&gt; {p.name}
                      </a>
                    ))}
                  </div>
                </div>
              ) : (
                <button
                  onClick={handleEscalate}
                  disabled={escalating}
                  className="w-full py-2.5 rounded-xl border border-border bg-background text-foreground font-semibold text-xs hover:bg-white transition-colors min-h-[44px]"
                >
                  {escalating
                    ? "Generating..."
                    : lang === "hi"
                    ? "पैकेट जनरेट करें (Generate Escalation Packet)"
                    : "Generate Escalation Packet"}
                </button>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
