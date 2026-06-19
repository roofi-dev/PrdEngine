"use client";

import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Sparkles, ArrowRight, Loader2, Wand2 } from "lucide-react";
import { generatePrdFromConcept } from "@/ai/flows/generate-prd-from-concept";
import { formatPrdToMarkdown } from "@/lib/prd-utils";
import { useToast } from "@/hooks/use-toast";

interface IntakeFormProps {
  onGenerated: (markdown: string) => void;
}

export function IntakeForm({ onGenerated }: IntakeFormProps) {
  const [concept, setConcept] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!concept.trim()) return;

    setIsLoading(true);
    try {
      const result = await generatePrdFromConcept({ appConcept: concept });
      const md = formatPrdToMarkdown(result);
      onGenerated(md);
      toast({
        title: "PRD Generated Successfully",
        description: "Your architecture is ready for review.",
      });
    } catch (error) {
      console.error(error);
      toast({
        variant: "destructive",
        title: "Generation Failed",
        description: "The architect encountered an error. Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-3xl mx-auto mt-20 px-6 animate-typing">
      <div className="text-center mb-12">
        <div className="inline-flex items-center justify-center p-3 mb-6 rounded-2xl bg-primary/10 text-primary border border-primary/20">
          <Sparkles className="w-8 h-8" />
        </div>
        <h1 className="text-5xl font-headline font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-primary to-accent">
          Architect Your Vision
        </h1>
        <p className="text-xl text-muted-foreground font-body max-w-xl mx-auto leading-relaxed">
          Transform a simple concept into a professional product roadmap in seconds.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="relative group">
          <Textarea
            value={concept}
            onChange={(e) => setConcept(e.target.value)}
            placeholder="Describe your app concept... e.g., 'A decentralized marketplace for vintage keyboards with escrow payments and verified seller badges.'"
            className="min-h-[180px] p-6 text-lg bg-card/50 border-2 border-border focus:border-primary transition-all rounded-2xl shadow-xl backdrop-blur-sm"
            disabled={isLoading}
          />
          <div className="absolute bottom-4 right-4 text-xs text-muted-foreground font-mono">
            Prompt Architect v1.0
          </div>
        </div>

        <Button 
          type="submit" 
          disabled={isLoading || !concept.trim()}
          className="w-full h-16 text-lg font-headline font-bold rounded-2xl bg-primary hover:bg-primary/90 shadow-lg shadow-primary/20 group overflow-hidden relative"
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              Synthesizing Documentation...
            </>
          ) : (
            <>
              <Wand2 className="mr-2 h-5 w-5 transition-transform group-hover:rotate-12" />
              Build Requirements
              <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
            </>
          )}
          
          {isLoading && (
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent translate-x-[-100%] animate-[shimmer_2s_infinite]" />
          )}
        </Button>
      </form>

      <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6 opacity-60">
        {[
          { title: "Smart Overview", desc: "User-centric vision" },
          { title: "Tech Mapping", desc: "Modern stack selection" },
          { title: "Phased Growth", desc: "Scale from MVP to Pro" }
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
