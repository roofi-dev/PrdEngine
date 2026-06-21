"use client";

export const dynamic = 'force-dynamic';

import React, { useState } from 'react';
import { IntakeForm } from "@/components/IntakeForm";
import { PRDEditor } from "@/components/PRDEditor";
import { Cpu, Terminal, FileText, Settings, LogOut, Search, User, LayoutDashboard, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth-context";
import { createClient } from "@/lib/supabase";
import Link from 'next/link';

export default function Home() {
  const [generatedMd, setGeneratedMd] = useState<string | null>(null);
  const [activeLanguage, setActiveLanguage] = useState<'Indonesian' | 'English'>('English');
  const { user, isAdmin, loading } = useAuth();
  const supabase = createClient();

  const handleGenerated = (md: string, lang: 'Indonesian' | 'English') => {
    setGeneratedMd(md);
    setActiveLanguage(lang);
  };

  const reset = () => setGeneratedMd(null);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.reload();
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      {/* Navbar */}
      <nav className="h-16 border-b border-border bg-background/50 backdrop-blur-md flex items-center justify-between px-6 sticky top-0 z-50">
        <div className="flex items-center gap-2 cursor-pointer" onClick={reset}>
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
            <Cpu className="w-5 h-5 text-white" />
          </div>
          <span className="text-xl font-headline font-bold tracking-tight">PrdEngine</span>
        </div>
        
        <div className="hidden md:flex items-center gap-6 text-sm font-medium text-muted-foreground">
          <a href="#" className="hover:text-primary transition-colors">Library</a>
          <a href="#" className="hover:text-primary transition-colors">Templates</a>
          <a href="#" className="hover:text-primary transition-colors">Pricing</a>
        </div>

        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" className="hidden sm:flex">
            <Search className="w-4 h-4" />
          </Button>

          {loading ? (
            <div className="w-20 h-8 animate-pulse bg-muted rounded-xl" />
          ) : user ? (
            <div className="flex items-center gap-2">
              {isAdmin && (
                <Link href="/admin">
                  <Button variant="outline" size="sm" className="hidden sm:flex rounded-xl font-headline font-semibold gap-2 border-primary/50 text-primary">
                    <ShieldCheck className="w-4 h-4" /> Admin
                  </Button>
                </Link>
              )}
              <Link href="/dashboard">
                <Button variant="outline" size="sm" className="hidden sm:flex rounded-xl font-headline font-semibold gap-2">
                  <LayoutDashboard className="w-4 h-4" /> Dashboard
                </Button>
              </Link>
              <Button variant="ghost" size="icon" onClick={handleLogout} className="text-muted-foreground hover:text-destructive">
                <LogOut className="w-4 h-4" />
              </Button>
            </div>
          ) : (
            <>
              <Link href="/login">
                <Button variant="outline" className="hidden sm:flex rounded-xl font-headline font-semibold">
                  Sign In
                </Button>
              </Link>
              <Link href="/register">
                <Button className="bg-primary hover:bg-primary/90 rounded-xl font-headline font-bold">
                  Get Pro
                </Button>
              </Link>
            </>
          )}
        </div>
      </nav>

      {/* Main Content */}
      <main className="flex-grow flex flex-col items-center relative">
        {/* Background Gradients */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-4xl h-96 bg-primary/5 blur-[120px] rounded-full -z-10" />
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-accent/5 blur-[100px] rounded-full -z-10" />

        {!generatedMd ? (
          <IntakeForm onGenerated={handleGenerated} />
        ) : (
          <div className="w-full">
             <div className="w-full bg-secondary/10 border-b py-2 px-6 flex items-center justify-between">
               <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground" onClick={reset}>
                 {activeLanguage === 'Indonesian' ? "← Dokumen Baru" : "← New Document"}
               </Button>
               <div className="flex gap-2">
                 <span className="text-[10px] uppercase tracking-widest font-headline font-bold text-primary px-2 py-0.5 bg-primary/10 rounded">
                   {activeLanguage === 'Indonesian' ? "Tersimpan Otomatis" : "Auto-Saved"}
                 </span>
               </div>
             </div>
             <PRDEditor initialContent={generatedMd} language={activeLanguage} />
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="py-8 border-t border-border mt-auto">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-muted-foreground font-medium">
          <div className="flex items-center gap-4">
            <span>© 2025 PrdEngine AI</span>
            <a href="#" className="hover:text-foreground">Terms</a>
            <a href="#" className="hover:text-foreground">Privacy</a>
          </div>
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1">
              <div className="w-2 h-2 rounded-full bg-green-500" />
              All Systems Operational
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
}
