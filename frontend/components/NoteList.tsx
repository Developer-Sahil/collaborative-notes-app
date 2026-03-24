"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { apiClient } from "@/lib/api";
import { Note } from "@/lib/types";

import { useAuth } from "@/hooks/useAuth";

export function NoteList() {
  const { user, loading: authLoading } = useAuth();
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      loadNotes();
    }
  }, [user]);

  const loadNotes = async () => {
    try {
      setLoading(true);
      const fetchedNotes = await apiClient.getNotes();
      setNotes(fetchedNotes);
    } catch (err) {
      setError("Failed to load notes");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (noteId: string) => {
    if (!confirm("Are you sure you want to delete this note?")) return;

    try {
      await apiClient.deleteNote(noteId);
      setNotes(notes.filter((n) => n.id !== noteId));
    } catch (err) {
      setError("Failed to delete note");
      console.error(err);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col gap-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="glass-card p-6 h-28 animate-pulse bg-white/30" />
        ))}
      </div>
    );
  }

  if (error) {
    return <div className="p-8 text-center glass-card border-red-100 text-red-500 font-medium">{error}</div>;
  }

  if (notes.length === 0) {
    return (
      <div className="p-12 text-center glass-card bg-white/40">
        <div className="text-4xl mb-4">✍️</div>
        <p className="text-gray-500 font-medium">No notes yet. Start your first masterpiece!</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-4">
      {notes.map((note) => (
        <div
          key={note.id}
          className="glass-card group hover:translate-x-1 hover:bg-white/90 transition-all duration-300 relative overflow-hidden"
        >
          <div className="p-6">
            <div className="flex items-start justify-between">
              <Link href={`/editor/${note.id}`} className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <span className="w-2 h-2 rounded-full bg-black"></span>
                  <h3 className="text-lg font-bold tracking-tight text-gray-900 group-hover:text-black transition">
                    {note.title}
                  </h3>
                </div>
                <p className="text-sm text-gray-400 line-clamp-1 font-medium italic">
                   Last edited {new Date(note.updated_at).toLocaleDateString()}
                </p>
                <div className="mt-4 text-gray-600 text-sm line-clamp-2 leading-relaxed opacity-70 group-hover:opacity-100 transition-opacity">
                   {note.content ? note.content.replace(/<[^>]*>/g, '').substring(0, 120) : "No description available..."}
                </div>
              </Link>
              <div className="flex flex-col gap-2">
                <button
                  onClick={() => handleDelete(note.id)}
                  className="w-10 h-10 flex items-center justify-center text-red-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all opacity-0 group-hover:opacity-100"
                  title="Delete note"
                >
                  🗑️
                </button>
                <Link 
                  href={`/editor/${note.id}`}
                  className="w-10 h-10 flex items-center justify-center text-gray-400 hover:text-black hover:bg-gray-100 rounded-xl transition-all opacity-0 group-hover:opacity-100"
                >
                  ↗
                </Link>
              </div>
            </div>
          </div>
          {/* Subtle accent bar */}
          <div className="absolute left-0 top-0 bottom-0 w-1 bg-black opacity-0 group-hover:opacity-100 transition-opacity"></div>
        </div>
      ))}
    </div>
  );
}