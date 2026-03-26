"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Editor } from "@/components/Editor";
import { apiClient } from "@/lib/api";
import { Note } from "@/lib/types";
import Link from "next/link";

export default function EditorPage() {
  const { noteId } = useParams();
  const [note, setNote] = useState<Note | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!noteId) return;

    const loadNote = async () => {
      try {
        setLoading(true);
        const data = await apiClient.getNote(noteId as string);
        setNote(data);
      } catch (err) {
        setError("Failed to load note or access denied");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    loadNote();
  }, [noteId]);

  const handleSave = async (content: string) => {
    if (!noteId) return;
    try {
      await apiClient.updateNote(noteId as string, { content });
    } catch (err) {
      console.error("Auto-save failed:", err);
    }
  };

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center font-medium text-gray-500">Loading editor...</div>
      </div>
    );
  }

  if (error || !note) {
    return (
      <div className="h-screen flex items-center justify-center bg-gray-50 p-6 text-center">
        <div>
          <p className="text-red-500 font-medium mb-4">{error || "Note not found"}</p>
          <Link
            href="/dashboard"
            className="text-blue-600 hover:underline font-medium"
          >
            Back to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-white">
      {/* Navbar */}
      <nav className="h-16 border-b border-gray-200 bg-white flex items-center justify-between px-6 shrink-0">
        <div className="flex items-center gap-4">
          <Link
            href="/dashboard"
            className="p-2 hover:bg-gray-100 rounded-lg transition text-gray-600"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M10 19l-7-7m0 0l7-7m-7 7h18"
              />
            </svg>
          </Link>
          <div className="flex flex-col">
            <h1 className="text-lg font-bold text-gray-900 leading-tight">
              {note.title}
            </h1>
            <span className="text-xs text-gray-400">
              Created by {note.created_by.substring(0, 8)}...
            </span>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              const email = prompt("Enter collaborator's UID (Firebase UID):");
              if (email && noteId) {
                apiClient.addCollaborator(noteId as string, email);
              }
            }}
            className="px-3 py-1.5 text-sm bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium"
          >
            Share
          </button>
        </div>
      </nav>

      <div className="flex-1 overflow-hidden">
        <Editor 
          noteId={noteId as string} 
          initialNote={note} 
          onSave={handleSave} 
        />
      </div>
    </div>
  );
}
