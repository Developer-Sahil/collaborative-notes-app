"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Editor } from "@/components/Editor";
import { apiClient } from "@/lib/api";
import { Note } from "@/lib/types";
import Link from "next/link";
import { Globe, ShieldAlert } from "lucide-react";

export default function PublicSharePage() {
  const { token } = useParams();
  const [note, setNote] = useState<Note | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!token) return;

    const loadPublicNote = async () => {
      try {
        setLoading(true);
        const data = await apiClient.getPublicNote(token as string);
        setNote(data);
      } catch (err) {
        setError("This public link is invalid or has expired.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    loadPublicNote();
  }, [token]);

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center p-8 bg-black">
        <div className="glass-card p-12 text-center animate-pulse border border-white/10">
          <div className="w-12 h-12 border-4 border-indigo-500/10 border-t-indigo-500 rounded-full animate-spin mx-auto mb-6" />
          <p className="text-white/40 font-bold tracking-widest uppercase text-[10px]">Retrieving Public Document...</p>
        </div>
      </div>
    );
  }

  if (error || !note) {
    return (
      <div className="h-screen flex items-center justify-center p-8 bg-black text-white">
        <div className="glass-card p-12 text-center max-w-md shadow-2xl border border-white/10">
          <div className="inline-flex p-4 bg-rose-500/10 rounded-3xl mb-6">
            <ShieldAlert className="w-12 h-12 text-rose-500" />
          </div>
          <h2 className="text-2xl font-bold mb-2">Access Denied</h2>
          <p className="text-white/40 mb-8 font-medium">{error || "This document is no longer public."}</p>
          <Link
            href="/"
            className="block w-full py-4 bg-white text-black font-bold rounded-2xl hover:bg-white/90 transition-all"
          >
            Go Home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col p-4 md:p-8 gap-6 overflow-hidden bg-black text-white">
      {/* Public Header */}
      <header className="flex items-center justify-between gap-4 shrink-0 px-2">
        <div className="flex items-center gap-6">
          <div className="flex flex-col">
            <div className="flex items-center gap-2 mb-1">
                <div className="p-1 bg-emerald-500/20 text-emerald-400 rounded-lg">
                    <Globe className="w-4 h-4" />
                </div>
                <span className="text-[10px] font-bold tracking-widest text-emerald-400 uppercase">Public View</span>
            </div>
            <h1 className="text-4xl font-black tracking-tighter text-white leading-none uppercase">
              {note.title}
            </h1>
          </div>
        </div>
        
        <div className="flex items-center gap-4">
             <Link 
                href="/login"
                className="text-xs font-bold text-white/40 hover:text-white transition-colors"
             >
                Sign In to Edit
             </Link>
             <div className="w-px h-8 bg-white/10" />
             <div className="flex -space-x-2">
                <div className="w-10 h-10 rounded-full border border-white/20 bg-indigo-600 flex items-center justify-center text-[10px] font-bold shadow-xl">
                    OB
                </div>
             </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 overflow-hidden relative">
        <div className="h-full max-w-6xl mx-auto w-full flex flex-col gap-6">
          <Editor 
            noteId={note.id} 
            initialNote={note} 
            onSave={async () => {}} // Read-only for public links? 
            // Actually, we could allow editing if we want, but usually it's read-only.
            // Let's pass a dummy save for now.
          />
        </div>
      </main>
      
      <div className="fixed bottom-8 left-1/2 -translate-x-1/2 px-6 py-3 bg-white/5 backdrop-blur-xl border border-white/10 rounded-full text-[10px] font-bold text-white/40 uppercase tracking-widest flex items-center gap-4 shadow-2xl">
         <span>Public link enabled by owner</span>
         <div className="w-1 h-1 bg-white/20 rounded-full" />
         <span>{new Date(note.updated_at).toLocaleDateString()}</span>
      </div>
    </div>
  );
}
