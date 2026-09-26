"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Header } from "@/components/Header";
import { HelpModal } from "@/components/HelpModal";
import { useAuth } from "@/context/AuthContext";
import { apiRequest } from "@/lib/api";

export default function SubmitProblemPage() {
  const { user, lang } = useAuth();
  const router = useRouter();

  const [isHelpOpen, setIsHelpOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [district, setDistrict] = useState("Palamu");
  const [locationDetail, setLocationDetail] = useState("");
  const [mediaPaths, setMediaPaths] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const jharkhandDistricts = [
    "Palamu", "Ranchi", "Hazaribagh", "Dhanbad", "Bokaro", "Deoghar",
    "East Singhbhum", "West Singhbhum", "Giridih", "Dumka", "Chatra",
    "Garhwa", "Godda", "Gumla", "Jamtara", "Khunti", "Koderma", "Latehar",
    "Lohardaga", "Pakur", "Ramgarh", "Sahebganj", "Seraikela Kharsawan", "Simdega"
  ];

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploading(true);
    setError(null);

    try {
      const file = files[0];
      const formData = new FormData();
      formData.append("file", file);

      const token = localStorage.getItem("sih_access_token");
      const res = await fetch("/api/tickets/upload-media", {
        method: "POST",
        headers: {
          Authorization: token ? `Bearer ${token}` : "",
        },
        body: formData,
      });

      if (!res.ok) {
        throw new Error("Failed to upload file");
      }

      const data = await res.json();
      setMediaPaths((prev) => [...prev, data.file_path]);
    } catch (err: any) {
      setError(err.message || "File upload failed");
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      router.push("/login");
      return;
    }

    setError(null);
    setSubmitting(true);

    try {
      const ticket = await apiRequest<any>("/tickets", {
        method: "POST",
        body: JSON.stringify({
          title,
          description,
          location_district: district,
          location_detail: locationDetail || undefined,
          media_paths: mediaPaths,
        }),
      });

      router.push(`/tickets/${ticket.ticket_id}`);
    } catch (err: any) {
      setError(err.message || "Failed to submit problem");
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header onOpenHelp={() => setIsHelpOpen(true)} />
      <HelpModal isOpen={isHelpOpen} onClose={() => setIsHelpOpen(false)} />

      <main className="flex-1 max-w-3xl w-full mx-auto px-4 py-8 sm:py-12">
        <div className="bg-card rounded-2xl border border-border p-6 sm:p-10 shadow-xs">
          <div className="mb-8">
            <span className="inline-block px-3 py-1 rounded-full bg-primary text-foreground text-xs font-bold mb-3">
              {lang === "hi" ? "सरल नागरिक फॉर्म" : "Citizen Intake Form"}
            </span>
            <h1 className="text-2xl sm:text-3xl font-bold text-foreground">
              {lang === "hi" ? "नई सामाजिक समस्या दर्ज करें" : "Report a Societal Problem"}
            </h1>
            <p className="text-sm text-muted mt-2">
              {lang === "hi"
                ? "कृपया समस्या का स्पष्ट विवरण एवं स्थान दर्ज करें। एआई प्रणाली स्वचालित रूप से वर्गीकरण कर उपयुक्त टीम को काम सौंपेगी।"
                : "Enter clear problem facts. AI will classify domain, severity, and route to solvers."}
            </p>
          </div>

          {error && (
            <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-200 text-destructive text-sm font-medium">
              Notice: {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label
                htmlFor="title"
                className="block text-base font-bold text-foreground mb-2"
              >
                {lang === "hi" ? "समस्या का शीर्षक (Problem Title)" : "Problem Title"} *
              </label>
              <input
                id="title"
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder={
                  lang === "hi"
                    ? "उदा: ग्राम मनातू में पेयजल संकट एवं हैंडपंप मरम्मत"
                    : "e.g. Drinking water scarcity in Manatu Ward 4"
                }
                className="w-full px-4 py-3.5 rounded-xl border border-border bg-white text-foreground focus:ring-2 focus:ring-foreground min-h-[50px] text-base font-medium"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label
                  htmlFor="district"
                  className="block text-sm font-bold text-foreground mb-2"
                >
                  {lang === "hi" ? "जिला (District)" : "District"} *
                </label>
                <select
                  id="district"
                  value={district}
                  onChange={(e) => setDistrict(e.target.value)}
                  className="w-full px-4 py-3.5 rounded-xl border border-border bg-white text-foreground focus:ring-2 focus:ring-foreground min-h-[50px] text-base"
                >
                  {jharkhandDistricts.map((d) => (
                    <option key={d} value={d}>
                      {d}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label
                  htmlFor="locationDetail"
                  className="block text-sm font-bold text-foreground mb-2"
                >
                  {lang === "hi" ? "विशिष्ट स्थान / लैंडमार्क" : "Village / Ward / Landmark"}
                </label>
                <input
                  id="locationDetail"
                  type="text"
                  value={locationDetail}
                  onChange={(e) => setLocationDetail(e.target.value)}
                  placeholder={
                    lang === "hi" ? "पंचायत, वार्ड नं, निकटतम मील का पत्थर" : "Panchayat, Ward No, Landmark"
                  }
                  className="w-full px-4 py-3.5 rounded-xl border border-border bg-white text-foreground focus:ring-2 focus:ring-foreground min-h-[50px] text-base"
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="description"
                className="block text-base font-bold text-foreground mb-2"
              >
                {lang === "hi" ? "समस्या का पूरा विवरण (Problem Details)" : "Problem Description"} *
              </label>
              <textarea
                id="description"
                required
                rows={5}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder={
                  lang === "hi"
                    ? "समस्या कब से है? कितने लोग प्रभावित हैं? क्या तत्काल सहायता चाहिए?"
                    : "Describe the issue, affected population, duration, and specific help required..."
                }
                className="w-full px-4 py-3.5 rounded-xl border border-border bg-white text-foreground focus:ring-2 focus:ring-foreground text-base leading-relaxed"
              />
            </div>

            {/* Media Upload Box */}
            <div className="p-5 rounded-2xl bg-background border border-border">
              <label className="block text-sm font-bold text-foreground mb-2">
                {lang === "hi" ? "फोटो या दस्तावेज़ संलग्न करें (Optional Media/PDF)" : "Attach Photo or Document"}
              </label>
              <input
                type="file"
                onChange={handleFileUpload}
                accept="image/*,.pdf,.doc,.docx"
                disabled={uploading}
                className="block w-full text-xs text-muted file:mr-4 file:py-2.5 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-primary file:text-foreground hover:file:opacity-90"
              />
              {uploading && <p className="text-xs text-muted mt-2">Uploading...</p>}
              {mediaPaths.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-2">
                  {mediaPaths.map((p, idx) => (
                    <span
                      key={idx}
                      className="inline-flex items-center px-3 py-1 rounded-lg bg-white border border-border text-xs font-semibold text-foreground"
                    >
                      File {idx + 1}
                    </span>
                  ))}
                </div>
              )}
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-4 px-6 rounded-xl font-bold bg-primary text-foreground hover:opacity-90 transition-opacity min-h-[52px] text-lg shadow-sm disabled:opacity-50"
            >
              {submitting
                ? lang === "hi"
                  ? "एआई विश्लेषण एवं टिकट जनरेट हो रहा है..."
                  : "AI Triaging & Creating Ticket..."
                : lang === "hi"
                ? "समस्या जमा करें एवं टिकट बनाएं ->"
                : "Submit Problem & Generate Ticket ->"}
            </button>
          </form>
        </div>
      </main>
    </div>
  );
}
