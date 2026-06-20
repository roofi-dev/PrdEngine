"use client";

import React from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Check, Cpu, ArrowLeft } from "lucide-react";
import Link from 'next/link';

const plans = [
  {
    name: "Free",
    price: "$0",
    description: "Perfect for testing the AI capabilities",
    features: ["5 PRDs per month", "Standard AI model", "Community support"],
    buttonText: "Current Plan",
    active: false,
  },
  {
    name: "Pro",
    price: "$19",
    description: "For professional Product Managers",
    features: ["Unlimited PRDs", "Advanced AI (Gemini Pro)", "Priority support", "Custom templates", "Export to PDF/Docx"],
    buttonText: "Upgrade to Pro",
    active: true,
  },
  {
    name: "Enterprise",
    price: "Custom",
    description: "For teams and organizations",
    features: ["Everything in Pro", "SSO Authentication", "Dedicated account manager", "Custom AI training", "API Access"],
    buttonText: "Contact Sales",
    active: false,
  }
];

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-background p-8 flex flex-col items-center">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-4xl h-96 bg-primary/5 blur-[120px] rounded-full -z-10" />
      
      <div className="w-full max-w-7xl flex justify-between items-center mb-16">
        <Link href="/">
          <Button variant="ghost" size="sm" className="gap-2">
            <ArrowLeft className="w-4 h-4" /> Back
          </Button>
        </Link>
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
            <Cpu className="w-5 h-5 text-white" />
          </div>
          <span className="text-xl font-headline font-bold tracking-tight">PrdEngine</span>
        </div>
        <div className="w-20" /> {/* Spacer */}
      </div>

      <div className="text-center mb-16 space-y-4">
        <h1 className="text-4xl md:text-5xl font-headline font-bold">Simple, Transparent Pricing</h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          Choose the plan that fits your workflow. Scale as your product grows.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full max-w-6xl">
        {plans.map((plan) => (
          <Card key={plan.name} className={`relative border-border bg-card/50 backdrop-blur-xl flex flex-col ${plan.active ? 'border-primary shadow-2xl shadow-primary/10' : ''}`}>
            {plan.active && (
              <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-primary text-white text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-full">
                Most Popular
              </div>
            )}
            <CardHeader>
              <CardTitle className="text-2xl font-headline font-bold">{plan.name}</CardTitle>
              <CardDescription>{plan.description}</CardDescription>
            </CardHeader>
            <CardContent className="flex-grow space-y-6">
              <div className="flex items-baseline gap-1">
                <span className="text-4xl font-bold">{plan.price}</span>
                {plan.price !== "Custom" && <span className="text-muted-foreground">/month</span>}
              </div>
              <ul className="space-y-3">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-center gap-2 text-sm">
                    <Check className="w-4 h-4 text-primary shrink-0" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
            <CardFooter>
              <Button 
                className={`w-full rounded-xl font-headline font-bold ${plan.active ? 'bg-primary' : 'variant-outline'}`}
                variant={plan.active ? 'default' : 'outline'}
              >
                {plan.buttonText}
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
}
