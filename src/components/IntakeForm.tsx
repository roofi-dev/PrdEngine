"use client";

import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Sparkles, ArrowRight, Loader2, Wand2, Globe, HelpCircle, CheckCircle2, ArrowLeft } from "lucide-react";
import { formatPrdToMarkdown } from "@/lib/prd-utils";
import { useToast } from "@/hooks/use-toast";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface ClarifyingQuestion {
  id: number;
  question: string;
  options: { label: string; text: string }[];
}

interface IntakeFormProps {
  onGenerated: (markdown: string, language: 'Indonesian' | 'English') => void;
}

export function IntakeForm({ onGenerated }: IntakeFormProps) {
  const [concept, setConcept] = useState('');
  const [language, setLanguage] = useState<'Indonesian' | 'English'>('English');
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingQuestions, setIsLoadingQuestions] = useState(false);
  const [questions, setQuestions] = useState<ClarifyingQuestion[]>([]);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [step, setStep] = useState<'concept' | 'clarify'>('concept');
  const { toast } = useToast();

  const handleGetQuestions = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!concept.trim()) return;

    setIsLoadingQuestions(true);
    try {
      const response = await fetch('/api/clarify-prd', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ appConcept: concept, language }),
      });

      if (!response.ok) {
        let errorMessage = 'Failed to generate clarifying questions';
        try {
          const errorData = await response.json();
          errorMessage = errorData.error || errorMessage;
        } catch {
          errorMessage = `Server Error: ${response.status} ${response.statusText}`;
        }
        throw new Error(errorMessage);
      }

      const data = await response.json();
      setQuestions(data.questions || []);
      setAnswers({});
      setStep('clarify');
    } catch (error: any) {
      console.error(error);
      toast({
        variant: "destructive",
        title: language === 'Indonesian' ? "Gagal Memuat Pertanyaan" : "Failed to Load Questions",
        description: error.message || (language === 'Indonesian' ? "Terjadi kesalahan. Silakan coba lagi." : "An error occurred. Please try again."),
      });
    } finally {
      setIsLoadingQuestions(false);
    }
  };

  const handleGeneratePrd = async () => {
    setIsLoading(true);
    try {
      const clarifyingAnswers = questions
        .map(q => {
          const selected = answers[q.id];
          if (!selected) return null;
          const option = q.options.find(o => o.label === selected);
          return option ? `Q: ${q.question}\nA: ${option.text}` : null;
        })
        .filter(Boolean)
        .join('\n\n');

      const response = await fetch('/api/generate-prd', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          appConcept: concept,
          language,
          clarifyingAnswers: clarifyingAnswers || undefined,
        }),
      });

      if (!response.ok) {
        let errorMessage = 'Failed to generate PRD';
        try {
          const errorData = await response.json();
          errorMessage = errorData.error || errorMessage;
        } catch {
          errorMessage = `Server Error: ${response.status} ${response.statusText}`;
        }
        throw new Error(errorMessage);
      }

      const result = await response.json();
      const md = formatPrdToMarkdown(result);
      onGenerated(md, language);
      toast({
        title: language === 'Indonesian' ? "PRD Berhasil Dibuat" : "PRD Generated Successfully",
        description: language === 'Indonesian' ? "Arsitektur Anda siap ditinjau." : "Your architecture is ready for review.",
      });
    } catch (error: any) {
      console.error(error);
      toast({
        variant: "destructive",
        title: language === 'Indonesian' ? "Gagal Membuat" : "Generation Failed",
        description: error.message || (language === 'Indonesian' ? "Terjadi kesalahan pada arsitek. Silakan coba lagi." : "The architect encountered an error. Please try again."),
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSkipQuestions = () => {
    setQuestions([]);
    setAnswers({});
    handleGeneratePrd();
  };

  const handleBackToConcept = () => {
    setStep('concept');
    setQuestions([]);
    setAnswers({});
  };

  const allQuestionsAnswered = questions.length > 0 && questions.every(q => answers[q.id]);

  return (
    <div className="w-full max-w-3xl mx-auto mt-20 px-6 animate-typing">
      <div className="text-center mb-12">
        <div className="inline-flex items-center justify-center p-3 mb-6 rounded-2xl bg-primary/10 text-primary border border-primary/20">
          <Sparkles className="w-8 h-8" />
        </div>
        <h1 className="text-5xl font-headline font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-primary to-accent">
          {language === 'Indonesian' ? "Rancang Visi Anda" : "Architect Your Vision"}
        </h1>
        <p className="text-xl text-muted-foreground font-body max-w-xl mx-auto leading-relaxed">
          {language === 'Indonesian' 
            ? "Ubah konsep sederhana menjadi roadmap produk profesional dalam hitungan detik."
            : "Transform a simple concept into a professional product roadmap in seconds."}
        </p>
      </div>

      <div className="flex justify-center mb-8">
        <Tabs defaultValue="English" value={language} onValueChange={(v) => setLanguage(v as any)} className="w-auto">
          <TabsList className="bg-card/50 border-2 border-border p-1 rounded-xl">
            <TabsTrigger value="English" className="rounded-lg px-6 gap-2 data-[state=active]:bg-primary data-[state=active]:text-white">
              <Globe className="w-4 h-4" /> English
            </TabsTrigger>
            <TabsTrigger value="Indonesian" className="rounded-lg px-6 gap-2 data-[state=active]:bg-primary data-[state=active]:text-white">
              <Globe className="w-4 h-4" /> Indonesia
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* Step 1: Concept Input */}
      {step === 'concept' && (
        <form onSubmit={handleGetQuestions} className="space-y-6">
          <div className="relative group">
            <Textarea
              value={concept}
              onChange={(e) => setConcept(e.target.value)}
              placeholder={language === 'Indonesian' 
                ? "Jelaskan konsep aplikasi Anda... misal, 'Marketplace terdesentralisasi untuk keyboard vintage dengan pembayaran escrow.'"
                : "Describe your app concept... e.g., 'A decentralized marketplace for vintage keyboards with escrow payments.'"}
              className="min-h-[180px] p-6 text-lg bg-card/50 border-2 border-border focus:border-primary transition-all rounded-2xl shadow-xl backdrop-blur-sm"
              disabled={isLoadingQuestions}
            />
            <div className="absolute bottom-4 right-4 text-xs text-muted-foreground font-mono">
              Prompt Architect v2.0
            </div>
          </div>

          <Button 
            type="submit" 
            disabled={isLoadingQuestions || !concept.trim()}
            className="w-full h-16 text-lg font-headline font-bold rounded-2xl bg-primary hover:bg-primary/90 shadow-lg shadow-primary/20 group overflow-hidden relative"
          >
            {isLoadingQuestions ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                {language === 'Indonesian' ? "Menganalisis Konsep..." : "Analyzing Concept..."}
              </>
            ) : (
              <>
                <HelpCircle className="mr-2 h-5 w-5 transition-transform group-hover:scale-110" />
                {language === 'Indonesian' ? "Analisis & Tanya Klarifikasi" : "Analyze & Ask Clarifications"}
                <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
              </>
            )}
            
            {isLoadingQuestions && (
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent translate-x-[-100%] animate-[shimmer_2s_infinite]" />
            )}
          </Button>
        </form>
      )}

      {/* Step 2: Clarifying Questions */}
      {step === 'clarify' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleBackToConcept}
              className="text-muted-foreground hover:text-foreground gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              {language === 'Indonesian' ? "Ubah Konsep" : "Edit Concept"}
            </Button>
            <span className="text-xs text-muted-foreground font-medium">
              {language === 'Indonesian' ? "Langkah 2 dari 2" : "Step 2 of 2"}
            </span>
          </div>

          <div className="bg-card/50 border-2 border-border rounded-2xl p-4 shadow-xl backdrop-blur-sm">
            <p className="text-sm text-muted-foreground mb-2">
              {language === 'Indonesian' ? "Konsep Anda:" : "Your concept:"}
            </p>
            <p className="text-sm text-foreground line-clamp-3">{concept}</p>
          </div>

          <div className="bg-primary/5 border border-primary/20 rounded-2xl p-6 space-y-6">
            <div className="flex items-center gap-2 text-primary font-headline font-semibold">
              <HelpCircle className="w-5 h-5" />
              <h3 className="text-lg">
                {language === 'Indonesian' 
                  ? "Pertanyaan Klarifikasi" 
                  : "Clarifying Questions"}
              </h3>
            </div>
            <p className="text-sm text-muted-foreground">
              {language === 'Indonesian'
                ? "Jawab pertanyaan berikut agar PRD yang dihasilkan lebih spesifik dan tidak ambigu."
                : "Answer the following questions so the generated PRD is more specific and unambiguous."}
            </p>

            {questions.map((q, qIdx) => (
              <div key={q.id} className="space-y-3">
                <p className="font-medium text-foreground">
                  {qIdx + 1}. {q.question}
                </p>
                <div className="grid grid-cols-1 gap-2">
                  {q.options.map((opt) => (
                    <button
                      key={opt.label}
                      type="button"
                      onClick={() => setAnswers(prev => ({ ...prev, [q.id]: opt.label }))}
                      className={`flex items-start gap-3 p-3 rounded-xl border-2 text-left transition-all ${
                        answers[q.id] === opt.label
                          ? 'border-primary bg-primary/10 text-foreground'
                          : 'border-border hover:border-primary/40 hover:bg-primary/5 text-muted-foreground'
                      }`}
                    >
                      <span className={`flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                        answers[q.id] === opt.label
                          ? 'bg-primary text-white'
                          : 'bg-muted text-muted-foreground'
                      }`}>
                        {opt.label}
                      </span>
                      <span className="text-sm leading-relaxed">{opt.text}</span>
                      {answers[q.id] === opt.label && (
                        <CheckCircle2 className="ml-auto w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
                      )}
                    </button>
                  ))}
                </div>
              </div>
            ))}

            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <Button
                onClick={handleGeneratePrd}
                disabled={isLoading}
                className="flex-1 h-14 text-base font-headline font-bold rounded-2xl bg-primary hover:bg-primary/90 shadow-lg shadow-primary/20 gap-2"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    {language === 'Indonesian' ? "Menyusun Dokumentasi..." : "Synthesizing Documentation..."}
                  </>
                ) : (
                  <>
                    <Wand2 className="w-5 h-5" />
                    {language === 'Indonesian' ? "Bangun PRD" : "Generate PRD"}
                    <ArrowRight className="w-5 h-5" />
                  </>
                )}
              </Button>
              <Button
                onClick={handleSkipQuestions}
                disabled={isLoading}
                variant="outline"
                className="h-14 rounded-2xl border-border text-muted-foreground hover:text-foreground"
              >
                {language === 'Indonesian' ? "Lewati & Generate" : "Skip & Generate"}
              </Button>
            </div>
          </div>
        </div>
      )}

      <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6 opacity-60">
        {[
          { title: language === 'Indonesian' ? "Ikhtisar Cerdas" : "Smart Overview", desc: language === 'Indonesian' ? "Visi berpusat pada pengguna" : "User-centric vision" },
          { title: language === 'Indonesian' ? "Pemetaan Teknologi" : "Tech Mapping", desc: language === 'Indonesian' ? "Pemilihan stack modern" : "Modern stack selection" },
          { title: language === 'Indonesian' ? "Pertumbuhan Bertahap" : "Phased Growth", desc: language === 'Indonesian' ? "Skala dari MVP ke Pro" : "Scale from MVP to Pro" }
        ].map((item, i) => (
          <div key={i} className="flex flex-col items-center text-center p-4 border border-dashed rounded-xl">
            <span className="text-primary font-headline font-bold mb-1">{item.title}</span>
            <span className="text-xs text-muted-foreground">{item.desc}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
