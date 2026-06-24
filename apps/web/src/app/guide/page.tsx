'use client';

import { useRouter } from 'next/navigation';
import { ArrowLeft, Users, UserPlus, Heart, Calendar, Wallet, CheckCircle2, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function WorkflowGuidePage() {
  const router = useRouter();
  const steps = [
    {
      number: 1,
      title: 'Create a Family',
      description: 'Start by creating a workspace for your family.',
      icon: <Users className="h-10 w-10 text-primary" />,
      color: 'bg-primary/10 border-primary/20 text-primary',
    },
    {
      number: 2,
      title: 'Add Members',
      description: 'Define relations and invite others to collaborate.',
      icon: <UserPlus className="h-10 w-10 text-blue-500" />,
      color: 'bg-blue-500/10 border-blue-500/20 text-blue-500',
    },
    {
      number: 3,
      title: 'Create Wedding',
      description: 'Set up your first major occasion or wedding.',
      icon: <Heart className="h-10 w-10 text-rose-500" />,
      color: 'bg-rose-500/10 border-rose-500/20 text-rose-500',
    },
    {
      number: 4,
      title: 'Add Events',
      description: 'Break it down into events like Mehndi or Valima.',
      icon: <Calendar className="h-10 w-10 text-amber-500" />,
      color: 'bg-amber-500/10 border-amber-500/20 text-amber-500',
    },
    {
      number: 5,
      title: 'Log Neondra',
      description: 'Record all the money given and received!',
      icon: <Wallet className="h-10 w-10 text-emerald-500" />,
      color: 'bg-emerald-500/10 border-emerald-500/20 text-emerald-500',
    },
  ];

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-16">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold">Workflow Guide</h1>
          <p className="text-muted-foreground">How to effectively use the Neondra System</p>
        </div>
      </div>

      <div className="bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm border rounded-3xl p-8 md:p-12 shadow-sm relative overflow-hidden">
        {/* Background blobs for aesthetics */}
        <div className="absolute top-[-20%] left-[-10%] w-96 h-96 bg-primary/5 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-[-20%] right-[-10%] w-96 h-96 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />
        
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-16 text-slate-800 dark:text-slate-100 relative z-10">
          The 5 Stages of Neondra Tracking
        </h2>

        <div className="relative z-10">
          {/* Desktop Horizontal Workflow */}
          <div className="hidden lg:flex items-start justify-between relative">
            
            {/* Connecting dotted line */}
            <div className="absolute top-24 left-[10%] right-[10%] h-0.5 border-t-2 border-dashed border-slate-200 dark:border-slate-700 -z-10" />

            {steps.map((step, index) => (
              <div key={step.number} className="flex flex-col items-center text-center w-48 relative group">
                
                {/* Number Badge */}
                <div className="h-10 w-10 rounded-full bg-slate-500 dark:bg-slate-700 text-white flex items-center justify-center font-bold text-lg mb-8 shadow-md transition-transform group-hover:scale-110">
                  {step.number}
                </div>

                {/* Arrow head for the dotted line (not on the last element) */}
                {index < steps.length - 1 && (
                  <div className="absolute top-[92px] right-[-30px] text-slate-300 dark:text-slate-600">
                    <ChevronRight className="h-6 w-6" />
                  </div>
                )}

                {/* Icon Container */}
                <div className={`h-24 w-24 rounded-2xl ${step.color} border bg-white dark:bg-slate-800 flex items-center justify-center mb-6 shadow-sm transition-all duration-300 group-hover:-translate-y-2 group-hover:shadow-lg`}>
                  {step.icon}
                </div>

                {/* Text */}
                <h3 className="font-bold text-base mb-2">{step.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {step.description}
                </p>
              </div>
            ))}
          </div>

          {/* Mobile/Tablet Vertical Workflow */}
          <div className="lg:hidden flex flex-col gap-8 relative">
            {/* Vertical dotted line */}
            <div className="absolute top-10 bottom-10 left-[39px] w-0.5 border-l-2 border-dashed border-slate-200 dark:border-slate-700 -z-10" />

            {steps.map((step) => (
              <div key={step.number} className="flex items-start gap-6 group">
                
                <div className="flex flex-col items-center">
                  <div className="h-10 w-10 rounded-full bg-slate-500 dark:bg-slate-700 text-white flex items-center justify-center font-bold text-lg shadow-md z-10 group-hover:scale-110 transition-transform">
                    {step.number}
                  </div>
                </div>

                <div className="flex-1 bg-white dark:bg-slate-800 p-5 rounded-2xl border shadow-sm group-hover:shadow-md transition-all group-hover:-translate-y-1">
                  <div className={`h-12 w-12 rounded-xl ${step.color} border flex items-center justify-center mb-4`}>
                    {/* Scale down the icon slightly for mobile */}
                    <div className="scale-75">
                      {step.icon}
                    </div>
                  </div>
                  <h3 className="font-bold text-lg mb-1">{step.title}</h3>
                  <p className="text-sm text-muted-foreground">
                    {step.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-16 text-center relative z-10">
          <Button size="lg" className="rounded-full px-8 hover:scale-105 transition-transform shadow-md" onClick={() => router.back()}>
            <CheckCircle2 className="mr-2 h-5 w-5" />
            I'm ready to start
          </Button>
        </div>
      </div>
    </div>
  );
}
