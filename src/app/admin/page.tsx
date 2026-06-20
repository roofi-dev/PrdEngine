"use client";

import React from 'react';
import { useAuth } from "@/lib/auth-context";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Cpu, Users, BarChart3, ShieldCheck, LogOut, ArrowLeft } from "lucide-react";
import { createClient } from "@/lib/supabase";
import Link from 'next/link';

export default function AdminPage() {
  const { user, userData, loading, isAdmin } = useAuth();
  const router = useRouter();
  const supabase = createClient();

  if (loading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  if (!user || !isAdmin) {
    router.push('/');
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
          <span className="text-xl font-headline font-bold tracking-tight">PrdEngine Admin</span>
        </Link>
        <div className="flex items-center gap-4">
          <span className="text-sm font-medium text-muted-foreground">Admin: {userData?.name || user.email}</span>
          <Button variant="ghost" size="icon" onClick={handleLogout}>
            <LogOut className="w-4 h-4" />
          </Button>
        </div>
      </nav>

      <main className="p-8 max-w-7xl mx-auto space-y-8">
        <header className="flex justify-between items-center">
          <div>
            <div className="flex items-center gap-2 text-primary mb-1">
              <ShieldCheck className="w-4 h-4" />
              <span className="text-xs uppercase font-bold tracking-widest">Admin Control Panel</span>
            </div>
            <h1 className="text-3xl font-headline font-bold">System Overview</h1>
          </div>
          <Link href="/dashboard">
            <Button variant="outline" className="rounded-xl gap-2">
              <ArrowLeft className="w-4 h-4" /> User View
            </Button>
          </Link>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="bg-card/50 border-border border-l-4 border-l-primary">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Users</CardTitle>
              <Users className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">1</div>
              <p className="text-xs text-muted-foreground">Registered accounts</p>
            </CardContent>
          </Card>
          
          <Card className="bg-card/50 border-border border-l-4 border-l-primary">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
              <BarChart3 className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">$0.00</div>
              <p className="text-xs text-muted-foreground">From subscriptions</p>
            </CardContent>
          </Card>

          <Card className="bg-card/50 border-border border-l-4 border-l-primary">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">AI Requests</CardTitle>
              <Cpu className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">12</div>
              <p className="text-xs text-muted-foreground">Genkit flow executions</p>
            </CardContent>
          </Card>
        </div>

        <section className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <Card className="bg-card/50 border-border">
            <CardHeader>
              <CardTitle className="text-lg font-headline">Recent Users</CardTitle>
            </CardHeader>
            <CardContent>
               <div className="text-sm text-muted-foreground italic">
                 User management features will appear here.
               </div>
            </CardContent>
          </Card>

          <Card className="bg-card/50 border-border">
            <CardHeader>
              <CardTitle className="text-lg font-headline">System Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
               <div className="flex items-center justify-between p-3 bg-background/50 rounded-lg border">
                 <span className="text-sm font-medium">AI Model (Gemini)</span>
                 <span className="text-xs text-green-500 font-bold uppercase tracking-widest">Active</span>
               </div>
               <div className="flex items-center justify-between p-3 bg-background/50 rounded-lg border">
                 <span className="text-sm font-medium">Payment Gateway</span>
                 <span className="text-xs text-orange-500 font-bold uppercase tracking-widest">Setup Required</span>
               </div>
            </CardContent>
          </Card>
        </section>
      </main>
    </div>
  );
}
