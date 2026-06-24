import Link from 'next/link';
import { ArrowRight, ShieldCheck, Users, BarChart3, Heart, Wallet, Info } from 'lucide-react';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-50 font-sans selection:bg-primary selection:text-primary-foreground overflow-hidden">
      {/* Background Ambient Orbs */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-primary/20 rounded-full blur-[128px] animate-pulse duration-10000" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-emerald-500/10 rounded-full blur-[128px]" />
      </div>

      <div className="relative z-10 flex flex-col min-h-screen">
        {/* Navbar */}
        <header className="container mx-auto px-6 py-6 flex items-center justify-between animate-in fade-in slide-in-from-top-4 duration-700">
          <div className="flex items-center gap-2">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-primary to-emerald-600 flex items-center justify-center shadow-lg shadow-primary/20">
              <span className="text-white font-bold text-xl">N</span>
            </div>
            <span className="text-xl font-bold tracking-tight">Neondra</span>
          </div>
          <nav className="flex items-center gap-4">
            <Link href="/auth/login" className="text-sm font-medium hover:text-primary transition-colors">
              Log in
            </Link>
            <Link href="/auth/register" className="text-sm font-medium px-5 py-2.5 rounded-full bg-slate-900 text-white dark:bg-white dark:text-slate-900 hover:scale-105 hover:shadow-lg transition-all duration-300">
              Get Started
            </Link>
          </nav>
        </header>

        {/* Hero Section */}
        <main className="flex-1 flex flex-col items-center justify-center container mx-auto px-6 text-center pt-20 pb-32 animate-in fade-in slide-in-from-bottom-8 duration-1000">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary mb-8 border border-primary/20 hover:bg-primary/20 transition-colors cursor-default">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
            </span>
            <span className="text-xs font-semibold tracking-wide uppercase">Introducing Neondra System</span>
          </div>

          <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight max-w-4xl leading-[1.1] mb-6 text-transparent bg-clip-text bg-gradient-to-br from-slate-900 to-slate-500 dark:from-white dark:to-slate-400">
            Manage Family Finances with <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-emerald-500">Elegance.</span>
          </h1>

          <p className="text-lg md:text-xl text-slate-600 dark:text-slate-400 max-w-2xl mb-10 leading-relaxed">
            The ultimate platform to track Neondra, gifts, and transactions across all your family events. Collaborate, analyze, and keep perfect records seamlessly.
          </p>

          <div className="flex flex-col sm:flex-row items-center gap-4">
            <Link href="/dashboard" className="group flex items-center justify-center gap-2 px-8 py-4 text-base font-medium rounded-full bg-primary text-primary-foreground hover:bg-primary/90 hover:scale-105 hover:shadow-[0_0_40px_8px_rgba(var(--primary),0.3)] transition-all duration-300 w-full sm:w-auto">
              Enter Dashboard
              <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link href="/guide" className="flex items-center justify-center gap-2 px-8 py-4 text-base font-medium rounded-full bg-emerald-500 text-white hover:bg-emerald-600 hover:scale-105 hover:shadow-[0_0_40px_8px_rgba(16,185,129,0.3)] transition-all duration-300 w-full sm:w-auto">
              <Info className="h-5 w-5" />
              How it works
            </Link>
            <Link href="/auth/register" className="flex items-center justify-center gap-2 px-8 py-4 text-base font-medium rounded-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 hover:scale-105 transition-all duration-300 w-full sm:w-auto">
              Create an Account
            </Link>
          </div>
        </main>

        {/* Features Grid */}
        <section className="container mx-auto px-6 py-24 border-t border-slate-200 dark:border-slate-800/50 relative">
          <div className="text-center mb-16 animate-in fade-in duration-1000 delay-300">
            <h2 className="text-3xl font-bold mb-4">Everything you need.</h2>
            <p className="text-slate-500 max-w-xl mx-auto">Built from the ground up for modern families to perfectly organize their events and financial exchanges.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <FeatureCard 
              icon={<Heart className="h-6 w-6 text-rose-500" />}
              title="Event Tracking"
              desc="Easily create weddings and events like Mehndi or Valima. Track every detail with beautiful progress indicators."
              delay="delay-100"
            />
            <FeatureCard 
              icon={<Wallet className="h-6 w-6 text-emerald-500" />}
              title="Neondra Records"
              desc="Log money given and received. Never lose track of who gave what with our robust ledger system."
              delay="delay-200"
            />
            <FeatureCard 
              icon={<BarChart3 className="h-6 w-6 text-blue-500" />}
              title="Global Analytics"
              desc="Instantly view your net balance across all your families. Beautiful charts help you understand your cash flow."
              delay="delay-300"
            />
            <FeatureCard 
              icon={<Users className="h-6 w-6 text-indigo-500" />}
              title="Family Collaboration"
              desc="Invite family members to join your workspace. Assign roles to keep data secure and organized."
              delay="delay-400"
            />
            <FeatureCard 
              icon={<ShieldCheck className="h-6 w-6 text-amber-500" />}
              title="Secure Data"
              desc="Your data is protected with enterprise-grade security. Only authorized family members can view your ledger."
              delay="delay-500"
            />
            <FeatureCard 
              icon={<ArrowRight className="h-6 w-6 text-primary" />}
              title="Lightning Fast"
              desc="Built on modern architecture, ensuring every interaction feels instant and completely frictionless."
              delay="delay-600"
            />
          </div>
        </section>

        {/* Footer */}
        <footer className="border-t border-slate-200 dark:border-slate-800 py-10 text-center text-sm text-slate-500">
          <p>© {new Date().getFullYear()} Neondra System. Built with elegance.</p>
        </footer>
      </div>
    </div>
  );
}

function FeatureCard({ icon, title, desc, delay }: { icon: React.ReactNode, title: string, desc: string, delay: string }) {
  return (
    <div className={`p-6 rounded-3xl bg-white/50 dark:bg-slate-900/50 backdrop-blur-md border border-slate-200 dark:border-slate-800 hover:border-primary/50 dark:hover:border-primary/50 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 animate-in fade-in slide-in-from-bottom-8 ${delay} fill-mode-both`}>
      <div className="h-12 w-12 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center mb-6">
        {icon}
      </div>
      <h3 className="text-xl font-bold mb-2">{title}</h3>
      <p className="text-slate-600 dark:text-slate-400 leading-relaxed">{desc}</p>
    </div>
  );
}