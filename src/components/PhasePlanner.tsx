import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CalendarDays, CheckCircle2, Circle, Layout, Rocket } from "lucide-react";

interface PhasePlannerProps {
  phasesText: string;
  language?: 'Indonesian' | 'English';
}

export function PhasePlanner({ phasesText, language = 'English' }: PhasePlannerProps) {
  // Simple heuristic parsing of phases
  const phaseItems = phasesText
    .split(/\n/)
    .filter(line => line.toLowerCase().includes('phase') || line.toLowerCase().includes('tahap') || line.match(/^\d\./))
    .slice(0, 4);

  const icons = [
    <Layout key="1" className="w-5 h-5 text-primary" />,
    <Circle key="2" className="w-5 h-5 text-accent" />,
    <CheckCircle2 key="3" className="w-5 h-5 text-green-500" />,
    <Rocket key="4" className="w-5 h-5 text-orange-500" />
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-8">
      {phaseItems.map((phase, idx) => (
        <Card key={idx} className="bg-secondary/30 border-none relative overflow-hidden group">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary to-accent opacity-50 group-hover:opacity-100 transition-opacity" />
          <CardContent className="p-4 pt-6">
            <div className="flex items-center gap-2 mb-3">
              {icons[idx] || <CalendarDays className="w-5 h-5 text-primary" />}
              <Badge variant="outline" className="text-xs uppercase tracking-wider font-headline">
                {language === 'Indonesian' ? "Tahap" : "Stage"} {idx + 1}
              </Badge>
            </div>
            <p className="text-sm text-foreground/80 leading-snug line-clamp-3 font-medium">
              {phase.replace(/^[-\d.\s]*/, '').trim()}
            </p>
          </CardContent>
        </Card>
      ))}
      {phaseItems.length === 0 && (
        <div className="col-span-full py-12 text-center text-muted-foreground border-2 border-dashed rounded-xl">
          {language === 'Indonesian' 
            ? "Ringkasan fase visual akan muncul di sini setelah dibuat." 
            : "Visual phase summary will appear here once generated."}
        </div>
      )}
    </div>
  );
}
