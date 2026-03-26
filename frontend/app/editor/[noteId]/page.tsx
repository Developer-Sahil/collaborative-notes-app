"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Editor } from "@/components/Editor";
import { apiClient } from "@/lib/api";
import { Note } from "@/lib/types";
import { useAuth } from "@/hooks/useAuth";
import Link from "next/link";

export default function EditorPage() {
  const { noteId } = useParams();
  const { user, loading: authLoading } = useAuth();
  const [note, setNote] = useState<Note | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!noteId || !user) return;

    const loadNote = async () => {
      try {
        setLoading(true);
        const data = await apiClient.getNote(noteId as string);
        setNote(data);
      } catch (err) {
        setError("Note access restricted or invalid link.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    loadNote();
  }, [noteId, user]);

  const handleSave = async (content: string) => {
    if (!noteId) return;
    try {
      await apiClient.updateNote(noteId as string, { content });
    } catch (err) {
      console.error("Auto-save failed:", err);
    }
  };

  if (loading || authLoading) {
    return (
      <div className="h-screen flex items-center justify-center p-8">
        <div className="glass-card p-12 text-center animate-pulse">
          <div className="w-12 h-12 border-4 border-black/10 border-t-black rounded-full animate-spin mx-auto mb-6" />
          <p className="text-gray-400 font-bold tracking-widest uppercase text-xs">Initializing Secure Editor...</p>
        </div>
      </div>
    );
  }

  if (error || !note) {
    return (
      <div className="h-screen flex items-center justify-center p-8">
        <div className="glass-card p-12 text-center max-w-md shadow-2xl">
          <div className="text-5xl mb-6">🚫</div>
          <h2 className="text-2xl font-bold mb-2">Access Denied</h2>
          <p className="text-gray-500 mb-8 font-medium">{error || "This document doesn't exist or you lack viewing permissions."}</p>
          <Link
            href="/dashboard"
            className="btn-primary block w-full py-4"
          >
            Return to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col p-4 md:p-8 gap-6 overflow-hidden">
      {/* Premium Header */}
      <header className="flex items-center justify-between gap-4 shrink-0 px-2">
        <div className="flex items-center gap-6">
          <Link
            href="/dashboard"
            className="w-12 h-12 bg-black/5 border border-black/10 flex items-center justify-center group hover:bg-black hover:text-white transition-all duration-300 rounded-2xl"
            title="Dashboard"
          >
            <span className="text-xl group-hover:scale-110 transition-transform text-black group-hover:text-white">←</span>
          </Link>
          <div className="flex flex-col">
            <h1 className="text-4xl font-black tracking-tighter text-black leading-none mb-1 uppercase">
              {note.title}
            </h1>
            <div className="flex items-center gap-2">
               <span className="text-[10px] font-bold tracking-widest text-black/40 uppercase">Document ID:</span>
               <code className="text-[10px] bg-black/5 px-2 py-0.5 rounded font-mono text-black/60 uppercase">{noteId?.toString().substring(0, 12)}...</code>
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full border border-black/10 flex items-center justify-center font-bold text-xs ring-2 ring-indigo-500/10 overflow-hidden shadow-2xl">
            <img src={`https://ui-avatars.com/api/?name=${user?.email}&background=6366f1&color=fff`} alt="User" />
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 overflow-hidden relative">
        <div className="h-full max-w-6xl mx-auto w-full flex flex-col gap-6">
          <Editor 
            noteId={noteId as string} 
            initialNote={note} 
            onSave={handleSave} 
          />
        </div>
      </main>
    </div>
  );
}
