"use client";

import React from 'react';
import { useAuth } from "@/lib/auth-context";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Cpu, FileText, User as UserIcon, LogOut, Plus } from "lucide-react";
import { createClient } from "@/lib/supabase";
import Link from 'next/link';

export default function DashboardPage() {
  const { user, userData, loading } = useAuth();
  const router = useRouter();
  const supabase = createClient();

  if (loading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  if (!user) {
    router.push('/login');
    return null;
  }

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/');
  };

  return (
    <div className="min-h-screen bg-background">
      <nav className="h-16 border-b border-border bg-background/50 backdrop-blur-md flex items-center justify-between px-6 sticky top-0 z-50">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
            <Cpu className="w-5 h-5 text-white" />
          </div>
          <span className="text-xl font-headline font-bold tracking-tight">PrdEngine</span>
        </Link>
        <div className="flex items-center gap-4">
          <span className="text-sm font-medium text-muted-foreground">{userData?.name || user.email}</span>
          <Button variant="ghost" size="icon" onClick={handleLogout}>
            <LogOut className="w-4 h-4" />
          </Button>
        </div>
      </nav>

      <main className="p-8 max-w-7xl mx-auto space-y-8">
        <header className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-headline font-bold">User Dashboard</h1>
            <p className="text-muted-foreground">Manage your documents and account settings</p>
          </div>
          <Link href="/">
            <Button className="rounded-xl gap-2">
              <Plus className="w-4 h-4" /> New PRD
            </Button>
          </Link>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="bg-card/50 border-border">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Documents</CardTitle>
              <FileText className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">0</div>
              <p className="text-xs text-muted-foreground">Generated AI documents</p>
            </CardContent>
          </Card>
          
          <Card className="bg-card/50 border-border">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Account Status</CardTitle>
              <UserIcon className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold uppercase">{userData?.role || 'User'}</div>
              <p className="text-xs text-muted-foreground">Free Tier</p>
            </CardContent>
          </Card>
        </div>

        <section className="space-y-4">
          <h2 className="text-xl font-headline font-bold">Recent Documents</h2>
          <Card className="bg-card/50 border-border p-12 text-center">
            <FileText className="w-12 h-12 text-muted-foreground/20 mx-auto mb-4" />
            <h3 className="font-semibold mb-1">No documents yet</h3>
            <p className="text-sm text-muted-foreground mb-6">Create your first AI-powered PRD to see it here.</p>
            <Link href="/">
               <Button variant="outline" className="rounded-xl">Start Creating</Button>
            </Link>
          </Card>
        </section>
      </main>
    </div>
  );
}
