"use client";

import React, { useState, useEffect } from 'react';
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Download, Edit3, Eye, Share2, Sparkles, Loader2 } from "lucide-react";
import { downloadMarkdown, formatPrdToMarkdown, parseMarkdownToSections } from "@/lib/prd-utils";
import { PhasePlanner } from "./PhasePlanner";
import { GeneratePrdFromConceptOutput } from "@/ai/flows/generate-prd-from-concept";
import { revisePrd } from "@/ai/flows/revise-prd-flow";
import { useToast } from "@/hooks/use-toast";

interface PRDEditorProps {
  initialContent: string;
  language?: 'Indonesian' | 'English';
}

export function PRDEditor({ initialContent, language = 'English' }: PRDEditorProps) {
  const [markdown, setMarkdown] = useState(initialContent);
  const [sections, setSections] = useState<Partial<GeneratePrdFromConceptOutput>>({});
  const [revisionPrompt, setRevisionPrompt] = useState('');
  const [isRevising, setIsRevising] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    setSections(parseMarkdownToSections(markdown));
  }, [markdown]);

  const handleExport = () => {
    downloadMarkdown(markdown);
  };

  const handleRevise = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!revisionPrompt.trim() || isRevising) return;

    setIsRevising(true);
    try {
      const result = await revisePrd({
        currentPrdMarkdown: markdown,
        revisionInstructions: revisionPrompt,
        language: language
      });
      const newMarkdown = formatPrdToMarkdown(result);
      setMarkdown(newMarkdown);
      setRevisionPrompt('');
      toast({
        title: language === 'Indonesian' ? "PRD Direvisi" : "PRD Revised",
        description: language === 'Indonesian' 
          ? "Dokumen Anda telah diperbarui berdasarkan instruksi." 
          : "Your document has been updated based on your instructions.",
      });
    } catch (error) {
      console.error(error);
      toast({
        variant: "destructive",
        title: language === 'Indonesian' ? "Revisi Gagal" : "Revision Failed",
        description: language === 'Indonesian' 
          ? "Tidak dapat menerapkan revisi. Silakan coba lagi." 
          : "Could not apply revisions. Please try again.",
      });
    } finally {
      setIsRevising(false);
    }
  };

  return (
    <div className="w-full max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h2 className="text-3xl font-headline font-bold text-foreground">
            {language === 'Indonesian' ? "Arsitek Dokumen" : "Document Architect"}
          </h2>
          <p className="text-muted-foreground">
            {language === 'Indonesian' 
              ? "Sempurnakan persyaratan proyek dan rencana pengembangan Anda." 
              : "Refine your project requirements and development plan."}
          </p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" size="sm" className="gap-2" onClick={() => {}}>
            <Share2 className="w-4 h-4" /> {language === 'Indonesian' ? "Bagikan" : "Share"}
          </Button>
          <Button variant="default" size="sm" className="gap-2 bg-primary hover:bg-primary/90" onClick={handleExport}>
            <Download className="w-4 h-4" /> {language === 'Indonesian' ? "Ekspor .md" : "Export .md"}
          </Button>
        </div>
      </div>

      {/* AI Revision Tool */}
      <div className="mb-8 p-4 bg-primary/5 border border-primary/20 rounded-2xl">
        <form onSubmit={handleRevise} className="flex gap-3">
          <div className="relative flex-grow">
            <Sparkles className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-primary" />
            <Input 
              placeholder={language === 'Indonesian' 
                ? "Minta AI merevisi... misal, 'Tambahkan bagian risiko keamanan'" 
                : "Ask AI to revise... e.g., 'Add a section for security risks'"}
              value={revisionPrompt}
              onChange={(e) => setRevisionPrompt(e.target.value)}
              className="pl-10 bg-background border-primary/20 focus:border-primary rounded-xl"
              disabled={isRevising}
            />
          </div>
          <Button 
            type="submit" 
            disabled={isRevising || !revisionPrompt.trim()}
            className="bg-primary hover:bg-primary/90 rounded-xl gap-2 min-w-[120px]"
          >
            {isRevising ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                {language === 'Indonesian' ? "Merevisi..." : "Revising..."}
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                {language === 'Indonesian' ? "Revisi" : "Revise"}
              </>
            )}
          </Button>
        </form>
      </div>

      <PhasePlanner phasesText={sections.phases || ""} language={language} />

      <div className="mt-12 grid grid-cols-1 lg:grid-cols-2 gap-8 min-h-[600px]">
        {/* Editor Pane */}
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-2 text-primary font-headline font-semibold">
            <Edit3 className="w-5 h-5" /> {language === 'Indonesian' ? "Sumber Markdown" : "Markdown Source"}
          </div>
          <Textarea
            value={markdown}
            onChange={(e) => setMarkdown(e.target.value)}
            className="flex-grow font-code text-sm leading-relaxed p-6 bg-card border-border shadow-inner focus:ring-primary h-[600px] resize-none"
            placeholder="# Enter your markdown here..."
          />
        </div>

        {/* Preview Pane */}
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-2 text-accent font-headline font-semibold">
            <Eye className="w-5 h-5" /> {language === 'Indonesian' ? "Pratinjau Langsung" : "Live Preview"}
          </div>
          <div className="flex-grow p-8 bg-card border border-border rounded-lg shadow-sm overflow-y-auto max-h-[600px] markdown-preview">
            <div dangerouslySetInnerHTML={{ __html: simpleMarkdownParser(markdown) }} />
          </div>
        </div>
      </div>
    </div>
  );
}

// A very simple markdown parser for the live preview
function simpleMarkdownParser(md: string) {
  return md
    .replace(/^# (.*$)/gim, '<h1>$1</h1>')
    .replace(/^## (.*$)/gim, '<h2>$1</h2>')
    .replace(/^### (.*$)/gim, '<h3>$1</h3>')
    .replace(/^\* (.*$)/gim, '<ul><li>$1</li></ul>')
    .replace(/^\- (.*$)/gim, '<ul><li>$1</li></ul>')
    .replace(/<\/ul>\n<ul>/gim, '')
    .replace(/\*\*(.*)\*\*/gim, '<strong>$1</strong>')
    .replace(/\*(.*)\*/gim, '<em>$1</em>')
    .replace(/`(.*)`/gim, '<code>$1</code>')
    .replace(/\n$/gim, '<br />')
    .replace(/\n/gim, '<p></p>');
}
