"use client";

import React, { useState, useEffect } from 'react';
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Download, Edit3, Eye, LayoutDashboard, Share2 } from "lucide-react";
import { downloadMarkdown } from "@/lib/prd-utils";
import { PhasePlanner } from "./PhasePlanner";
import { GeneratePrdFromConceptOutput } from "@/ai/flows/generate-prd-from-concept";
import { parseMarkdownToSections } from "@/lib/prd-utils";

interface PRDEditorProps {
  initialContent: string;
}

export function PRDEditor({ initialContent }: PRDEditorProps) {
  const [markdown, setMarkdown] = useState(initialContent);
  const [sections, setSections] = useState<Partial<GeneratePrdFromConceptOutput>>({});

  useEffect(() => {
    setSections(parseMarkdownToSections(markdown));
  }, [markdown]);

  const handleExport = () => {
    downloadMarkdown(markdown);
  };

  return (
    <div className="w-full max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h2 className="text-3xl font-headline font-bold text-foreground">Document Architect</h2>
          <p className="text-muted-foreground">Refine your project requirements and development plan.</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" size="sm" className="gap-2" onClick={() => {}}>
            <Share2 className="w-4 h-4" /> Share
          </Button>
          <Button variant="default" size="sm" className="gap-2 bg-primary hover:bg-primary/90" onClick={handleExport}>
            <Download className="w-4 h-4" /> Export .md
          </Button>
        </div>
      </div>

      <PhasePlanner phasesText={sections.phases || ""} />

      <div className="mt-12 grid grid-cols-1 lg:grid-cols-2 gap-8 min-h-[600px]">
        {/* Editor Pane */}
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-2 text-primary font-headline font-semibold">
            <Edit3 className="w-5 h-5" /> Markdown Source
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
            <Eye className="w-5 h-5" /> Live Preview
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
