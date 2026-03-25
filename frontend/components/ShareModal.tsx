"use client";

import { useState } from "react";
import { Note } from "@/lib/types";
import { apiClient } from "@/lib/api";
import { X, Copy, Mail, Globe, Lock, Check, UserPlus } from "lucide-react";

interface ShareModalProps {
  note: Note;
  isOpen: boolean;
  onClose: () => void;
  onUpdate: (updatedNote: Note) => void;
}

export default function ShareModal({ note, isOpen, onClose, onUpdate }: ShareModalProps) {
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const handleAddCollaborator = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setIsSubmitting(true);
    setMessage(null);

    try {
      const updatedNote = await apiClient.addCollaborator(note.id, email);
      onUpdate(updatedNote);
      setEmail("");
      setMessage({ type: "success", text: `Invited ${email} as editor` });
    } catch (err: any) {
      setMessage({
        type: "error",
        text: err.response?.data?.detail || "Failed to add collaborator. Ensure the user exists.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleTogglePublic = async () => {
    try {
      const updatedNote = await apiClient.updateSharing(note.id, !note.is_public);
      onUpdate(updatedNote);
    } catch (err) {
      console.error("Failed to update sharing:", err);
    }
  };

  const copyToClipboard = () => {
    const url = `${window.location.origin}/share/${note.share_token}`;
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-in fade-in duration-300"
      onClick={onClose}
    >
      <div 
        className="w-full max-w-md bg-white/5 backdrop-blur-2xl border border-white/10 rounded-[32px] overflow-hidden shadow-2xl shadow-indigo-500/10 animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-8 border-b border-white/5 flex items-center justify-between bg-white/[0.02]">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <UserPlus className="w-5 h-5 text-indigo-400" />
            Share Document
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/10 rounded-full transition-colors text-white/60 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-8">
          {/* Public Link Section */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-xl ${note.is_public ? 'bg-emerald-500/20 text-emerald-400' : 'bg-white/5 text-white/40'}`}>
                  {note.is_public ? <Globe className="w-5 h-5" /> : <Lock className="w-5 h-5" />}
                </div>
                <div>
                  <h3 className="text-white font-medium text-sm">Public Link Sharing</h3>
                  <p className="text-white/40 text-xs">Anyone with the link can view</p>
                </div>
              </div>
              <button
                onClick={handleTogglePublic}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${
                    note.is_public ? "bg-indigo-500" : "bg-white/10"
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    note.is_public ? "translate-x-6" : "translate-x-1"
                  }`}
                />
              </button>
            </div>

            {note.is_public && (
              <div className="flex items-center gap-2 p-1 bg-black/20 border border-white/5 rounded-2xl">
                <input
                  readOnly
                  value={`${window.location.origin}/share/${note.share_token}`}
                  className="bg-transparent border-none text-white/60 text-xs flex-1 px-3 focus:outline-none"
                />
                <button
                  onClick={copyToClipboard}
                  className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 text-white text-xs font-medium rounded-xl transition-all"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  {copied ? "Copied" : "Copy"}
                </button>
              </div>
            )}
          </div>

          <div className="h-px bg-white/5" />

          {/* Add Collaborator Section */}
          <div className="space-y-4">
            <h3 className="text-white font-medium text-sm flex items-center gap-2">
              <Mail className="w-4 h-4 text-indigo-400" />
              Invite Collaborators
            </h3>
            <form onSubmit={handleAddCollaborator} className="space-y-3">
              <div className="flex flex-col gap-2">
                <input
                  type="email"
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="bg-white/5 border border-white/10 rounded-2xl px-4 py-3 text-white placeholder:text-white/20 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all text-sm"
                  required
                />
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-bold py-3 rounded-2xl transition-all text-sm shadow-xl shadow-indigo-600/20"
                >
                  {isSubmitting ? "Inviting..." : "Send Invitation"}
                </button>
              </div>
              {message && (
                <p className={`text-xs p-3 rounded-xl ${
                  message.type === "success" ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" : "bg-rose-500/10 text-rose-400 border border-rose-500/20"
                }`}>
                  {message.text}
                </p>
              )}
            </form>
          </div>

          {/* Collaborators List (Simplified) */}
          <div className="space-y-3">
             <p className="text-white/40 text-[10px] uppercase tracking-widest font-bold">Document Access</p>
             <div className="space-y-2">
                {note.collaborators.map((uid) => (
                    <div key={uid} className="flex items-center justify-between p-3 bg-white/5 rounded-2xl border border-white/5">
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-[10px] text-white font-bold">
                                {uid.substring(0, 2).toUpperCase()}
                            </div>
                            <div>
                                <p className="text-white text-xs truncate max-w-[120px]">{uid === note.created_by ? "Owner" : "Collaborator"}</p>
                                <p className="text-white/40 text-[10px]">{uid === note.created_by ? "Can manage all" : "Can edit"}</p>
                            </div>
                        </div>
                        <span className="text-[10px] font-bold text-indigo-400 px-2 py-1 bg-indigo-400/10 rounded-lg">
                            {uid === note.created_by ? "OWNER" : "EDITOR"}
                        </span>
                    </div>
                ))}
             </div>
          </div>
        </div>
      </div>
    </div>
  );
}
