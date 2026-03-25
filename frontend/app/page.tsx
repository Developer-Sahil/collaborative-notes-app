"use client";

import Link from "next/link";
import { 
  Zap, 
  Shield, 
  Users, 
  ArrowRight, 
  Globe, 
  Star, 
  Share2
} from "lucide-react";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-black text-white selection:bg-indigo-500/30">
      {/* Decorative Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-600/20 rounded-full blur-[120px] animate-pulse" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-600/20 rounded-full blur-[120px] animate-pulse delay-700" />
      </div>

      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 border-b border-white/5 bg-black/50 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3 group cursor-pointer">
            <div className="w-10 h-10 bg-white text-black rounded-xl flex items-center justify-center font-black text-xl group-hover:scale-110 transition-transform duration-300">
              N
            </div>
            <span className="text-xl font-bold tracking-tight">Collab Notes</span>
          </div>

          <div className="hidden md:flex items-center gap-8 text-sm font-medium text-white/60">
            <a href="#features" className="hover:text-white transition-colors">Features</a>
            <a href="#collaboration" className="hover:text-white transition-colors">Collaboration</a>
          </div>

          <div className="flex items-center gap-4">
            <Link 
              href="/login" 
              className="px-6 py-2.5 rounded-full text-sm font-bold hover:bg-white/5 transition-all"
            >
              Sign In
            </Link>
            <Link 
              href="/login" 
              className="px-6 py-2.5 bg-white text-black rounded-full text-sm font-black hover:bg-white/90 transition-all shadow-xl shadow-white/5"
            >
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      <main className="relative pt-32">
        {/* Hero Section */}
        <section className="max-w-7xl mx-auto px-6 pt-20 pb-40 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-[10px] font-bold uppercase tracking-[0.2em] text-indigo-400 mb-8 animate-in fade-in slide-in-from-bottom-4 duration-1000">
            <Star className="w-3 h-3" />
            Empowering Modern Teams
          </div>
          
          <h1 className="text-6xl md:text-8xl font-black tracking-tighter mb-8 leading-[0.9] animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-200">
            CRAFT NOTES<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-tr from-indigo-500 via-purple-500 to-pink-500">
              WITH VELOCITY
            </span>
          </h1>

          <p className="max-w-2xl mx-auto text-lg md:text-xl text-white/40 font-medium mb-12 animate-in fade-in slide-in-from-bottom-12 duration-1000 delay-300">
            Experience the future of real-time collaboration. Build documents, share ideas, and iterate faster with our high-end, glassmorphism workspace.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-6 animate-in fade-in slide-in-from-bottom-16 duration-1000 delay-500">
            <Link 
              href="/login" 
              className="group flex items-center gap-3 px-10 py-5 bg-white text-black rounded-2xl font-black text-lg hover:scale-105 transition-all shadow-2xl shadow-white/10"
            >
              Start Writing Now
              <ArrowRight className="w-5 h-5 group-hover:translate-x-2 transition-transform" />
            </Link>
            <a 
              href="https://github.com/Developer-Sahil/collaborative-notes-app" 
              target="_blank"
              className="flex items-center gap-3 px-10 py-5 bg-white/5 border border-white/10 rounded-2xl font-bold text-lg hover:bg-white/10 transition-all"
            >
              <Globe className="w-6 h-6" />
              Source Code
            </a>
          </div>


        </section>

        {/* Features Grid */}
        <section id="features" className="max-w-7xl mx-auto px-6 py-40 border-t border-white/5">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            {[
              {
                icon: <Zap className="w-10 h-10 text-yellow-400" />,
                title: "Real-Time Sync",
                desc: "Powered by Yjs CRDTs for conflict-free, sub-100ms synchronization across all devices."
              },
              {
                icon: <Shield className="w-10 h-10 text-emerald-400" />,
                title: "Granular Controls",
                desc: "Owner, Editor, and Viewer permissions. Share securely with public tokens or invite-only access."
              },
              {
                icon: <Users className="w-10 h-10 text-indigo-400" />,
                title: "Presence Awareness",
                desc: "See who's editing in real-time with collaborative cursors and live user avatars."
              }
            ].map((feature, i) => (
              <div key={i} className="group p-8 rounded-[40px] bg-white/[0.02] border border-white/5 hover:bg-white/[0.05] transition-all duration-500">
                <div className="mb-8 p-4 inline-flex bg-white/5 rounded-3xl group-hover:scale-110 transition-transform duration-500">
                  {feature.icon}
                </div>
                <h3 className="text-2xl font-bold mb-4">{feature.title}</h3>
                <p className="text-white/40 leading-relaxed font-medium">
                  {feature.desc}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* Share Section */}
        <section id="collaboration" className="max-w-7xl mx-auto px-6 py-40 flex flex-col items-center text-center">
            <div className="p-4 bg-indigo-500/10 rounded-3xl mb-8">
                <Share2 className="w-10 h-10 text-indigo-400" />
            </div>
            <h2 className="text-4xl md:text-6xl font-black mb-6">Seamless Sharing</h2>
            <p className="max-w-2xl text-white/40 text-lg mb-12">
                Generate secure public links or invite contributors via email. 
                Everything stays in sync, always.
            </p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 w-full max-w-4xl">
                {['Google Docs Style', 'Public Tokens', 'Live Sync', 'Permissions'].map((tag) => (
                    <div key={tag} className="py-4 bg-white/5 border border-white/10 rounded-2xl text-[10px] font-bold uppercase tracking-widest text-white/60">
                        {tag}
                    </div>
                ))}
            </div>
        </section>
      </main>

      <footer className="border-t border-white/5 py-20">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-10">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-white/10 text-white rounded-lg flex items-center justify-center font-black text-sm">
              N
            </div>
            <span className="font-bold tracking-tight opacity-60">Collab Notes</span>
          </div>
          <p className="text-white/20 text-xs font-bold tracking-widest uppercase">
            © 2026 Developer Sahil. Engineered for teams.
          </p>
        </div>
      </footer>
    </div>
  );
}
