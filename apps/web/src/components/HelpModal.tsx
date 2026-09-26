"use client";

import React, { useState } from "react";
import { useAuth } from "@/context/AuthContext";

export function HelpModal({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  const { lang, completeTour } = useAuth();
  const [step, setStep] = useState(0);

  if (!isOpen) return null;

  const steps = [
    {
      titleHi: "1. पोर्टल का मुख्य उद्देश्य (Portal Overview)",
      titleEn: "1. Portal Overview",
      descHi:
        "यह पोर्टल झारखंड के नागरिकों, पंचायतों और शिक्षण संस्थानों/उद्योगों को एक साथ लाता है ताकि आपकी स्थानीय समस्याओं का स्थायी समाधान हो सके।",
      descEn:
        "This portal connects citizens, PRIs, universities, and industry partners to identify and solve local societal challenges.",
    },
    {
      titleHi: "2. समस्या दर्ज करना (Submit a Problem)",
      titleEn: "2. Reporting a Problem",
      descHi:
        "आप पानी, सड़क, स्वास्थ्य या शिक्षा से जुड़ी समस्या का फोटो, विवरण और लोकेशन के साथ नया टिकट दर्ज कर सकते हैं।",
      descEn:
        "Submit challenges with details, photos, documents, and district location. Citizen mode keeps this flow simple.",
    },
    {
      titleHi: "3. एआई विश्लेषण एवं स्वचालित आवंटन (AI Triage & Routing)",
      titleEn: "3. AI Processing & University Routing",
      descHi:
        "हमारी एआई प्रणाली समस्या को स्वचालित रूप से वर्गीकृत करती है और संबंधित विश्वविद्यालय या विशेषज्ञ टीम को काम सौंपती है।",
      descEn:
        "AI categorizes domain, severity, checks near-duplicates, and routes the ticket to matching university/industry experts.",
    },
    {
      titleHi: "4. बंद फीडबैक चक्र (Closed Feedback Loop)",
      titleEn: "4. Citizen Feedback & Verification",
      descHi:
        "महत्वपूर्ण नियम: समस्या तब तक बंद नहीं होगी जब तक आप (नागरिक) समाधान की पुष्टि न करें। यदि समाधान नहीं हुआ तो आप पुनः समीक्षा की मांग कर सकते हैं।",
      descEn:
        "Rule: Tickets are NEVER silently closed. Solvers mark 'Fix Claimed', and closure requires your rating & confirmation.",
    },
  ];

  const currentStep = steps[step];

  const handleNext = () => {
    if (step < steps.length - 1) {
      setStep(step + 1);
    } else {
      completeTour();
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-fade-in">
      <div className="bg-card rounded-2xl border border-border max-w-lg w-full p-6 sm:p-8 shadow-xl relative">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-muted hover:text-foreground text-xl font-bold w-8 h-8 flex items-center justify-center rounded-full bg-background"
        >
          ✕
        </button>

        {/* Modal Header */}
        <div className="text-center mb-6">
          <h2 className="text-lg sm:text-xl font-bold text-foreground">
            {lang === "hi" ? currentStep.titleHi : currentStep.titleEn}
          </h2>
        </div>

        {/* Modal Content */}
        <p className="text-sm sm:text-base text-foreground leading-relaxed text-center mb-8 bg-background p-4 rounded-xl border border-border">
          {lang === "hi" ? currentStep.descHi : currentStep.descEn}
        </p>

        {/* Step Indicator dots */}
        <div className="flex justify-center items-center gap-2 mb-6">
          {steps.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setStep(idx)}
              className={`w-3 h-3 rounded-full transition-colors ${
                idx === step ? "bg-foreground w-6" : "bg-border"
              }`}
            />
          ))}
        </div>

        {/* Navigation Buttons */}
        <div className="flex items-center justify-between gap-4">
          <button
            onClick={() => setStep(Math.max(0, step - 1))}
            disabled={step === 0}
            className="px-4 py-2.5 rounded-xl border border-border text-sm font-semibold text-foreground disabled:opacity-30 min-h-[44px]"
          >
            {lang === "hi" ? "पीछे" : "Previous"}
          </button>

          <button
            onClick={handleNext}
            className="px-6 py-2.5 rounded-xl bg-primary text-foreground font-bold text-sm hover:opacity-90 transition-opacity shadow-xs min-h-[44px]"
          >
            {step === steps.length - 1
              ? lang === "hi"
                ? "समझ गया / शुरुआत करें"
                : "Got it / Get Started"
              : lang === "hi"
              ? "आगे बढ़ें ->"
              : "Next ->"}
          </button>
        </div>
      </div>
    </div>
  );
}
