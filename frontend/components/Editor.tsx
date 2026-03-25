"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";
import Collaboration from "@tiptap/extension-collaboration";
import CollaborationCursor from "@tiptap/extension-collaboration-cursor";
import { useCallback, useEffect, useState, useMemo } from "react";
import { useAuth } from "@/hooks/useAuth";
import * as Y from "yjs";
import { WebsocketProvider } from "y-websocket";
import clsx from "clsx";
import { PresenceAvatars } from "./PresenceAvatars";
import ShareModal from "./ShareModal";
import { Note } from "@/lib/types";
import { UserPlus, Save, Check } from "lucide-react";

interface EditorProps {
  noteId: string;
  initialNote: Note;
  onSave: (content: string) => Promise<void>;
}

/** Deterministic color from a string (for cursor colors per user) */
function stringToColor(str: string) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  const colors = ["#4F46E5", "#7C3AED", "#DB2777", "#DC2626", "#D97706", "#059669", "#2563EB"];
  return colors[Math.abs(hash) % colors.length];
}

export function Editor({ noteId, initialNote, onSave }: EditorProps) {
  const { user } = useAuth();
  const [currentNote, setCurrentNote] = useState<Note>(initialNote);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [awarenessUsers, setAwarenessUsers] = useState<{ name: string; color: string; clientId: number }[]>([]);

  // Initialise Y.Doc and WebsocketProvider correctly for React lifecycle
  const ydoc = useMemo(() => new Y.Doc(), [noteId]);
  const provider = useMemo(() => {
    if (typeof window === "undefined" || !noteId) return null;
    const wsProtocol = window.location.protocol === "https:" ? "wss:" : "ws:";
    const wsUrl = process.env.NEXT_PUBLIC_YJS_WEBSOCKET_URL || `${wsProtocol}//localhost:1234`;
    return new WebsocketProvider(
      wsUrl,
      noteId,
      ydoc,
      { connect: true }
    );
  }, [noteId, ydoc]);

  useEffect(() => {
    if (!provider) return;

    // Set local awareness state
    const userName = user?.displayName || user?.email || "Anonymous Guest";
    const userColor = user ? stringToColor(user.uid) : "#6366f1";
    
    provider.awareness.setLocalStateField("user", {
      name: userName,
      color: userColor,
    });

    // Track connection
    provider.on("status", ({ status }: { status: string }) => {
      setIsConnected(status === "connected");
    });

    // Track presence
    const handleAwarenessChange = () => {
      const states = Array.from(provider.awareness.getStates().entries())
        .filter(([, state]: [number, any]) => state.user)
        .map(([clientId, state]: [number, any]) => ({
          clientId,
          name: state.user.name as string,
          color: state.user.color as string,
        }));
      setAwarenessUsers(states);
    };

    provider.awareness.on("change", handleAwarenessChange);

    return () => {
      provider.awareness.off("change", handleAwarenessChange);
      provider.destroy();
      ydoc.destroy();
    };
  }, [noteId, user, provider, ydoc]);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({ history: false }), // Yjs handles history
      Placeholder.configure({ placeholder: "Start composing your masterpiece..." }),
      Collaboration.configure({ document: ydoc }),
      CollaborationCursor.configure({
        provider: provider as any,
        user: {
          name: user?.displayName || user?.email || "Anonymous",
          color: user ? stringToColor(user.uid) : "#000",
        },
      }),
    ],
    immediatelyRender: false,
  }, [ydoc, provider]);

  const handleSave = useCallback(async () => {
    if (!editor || isSaving) return;
    const content = editor.getHTML();
    setIsSaving(true);
    try {
      await onSave(content);
      setLastSaved(new Date());
    } catch (error) {
      console.error("Save error:", error);
    } finally {
      setIsSaving(false);
    }
  }, [editor, onSave, isSaving]);

  // Auto-save after 5 seconds of inactivity since last update
  useEffect(() => {
    if (!editor) return;
    
    let timer: ReturnType<typeof setTimeout>;
    
    const onUpdate = () => {
      clearTimeout(timer);
      timer = setTimeout(() => {
        handleSave();
      }, 5000);
    };
    
    editor.on("update", onUpdate);
    
    return () => {
      clearTimeout(timer);
      editor.off("update", onUpdate);
    };
  }, [editor, handleSave]);

  if (!editor) return (
    <div className="flex items-center justify-center h-48 text-white/40 font-bold tracking-widest uppercase text-[10px]">
      Initializing collaborative environment...
    </div>
  );

  return (
    <div className="flex flex-col h-[calc(100vh-200px)] glass-card overflow-hidden">
      {/* Toolbar */}
      <div className="border-b border-white/10 bg-white/5 p-4 flex items-center gap-3 flex-wrap">
        {/* Format buttons */}
        <div className="flex items-center gap-2 pr-4 border-r border-white/10">
          {[
            { label: "B", action: () => editor.chain().focus().toggleBold().run(), active: editor.isActive("bold"), cls: "font-bold" },
            { label: "I", action: () => editor.chain().focus().toggleItalic().run(), active: editor.isActive("italic"), cls: "italic font-serif" },
            { label: "</>", action: () => editor.chain().focus().toggleCode().run(), active: editor.isActive("code"), cls: "font-mono text-xs" },
          ].map(({ label, action, active, cls }) => (
            <button 
              key={label} 
              onClick={action}
              className={clsx(
                "w-10 h-10 rounded-xl transition-all duration-200 flex items-center justify-center",
                cls,
                active ? "bg-indigo-600 text-white shadow-lg" : "bg-white/5 text-white hover:bg-white/10"
              )}
            >
              {label}
            </button>
          ))}
        </div>

        {/* Share Button */}
        <button 
          onClick={() => setIsShareModalOpen(true)}
          className="flex items-center gap-2 px-6 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl transition-all duration-200 shadow-xl shadow-indigo-600/20 text-xs"
        >
          <UserPlus className="w-4 h-4" />
          Share Access
        </button>

        <div className="flex-1" />

        {/* Presence Avatars */}
        <PresenceAvatars users={awarenessUsers} />

        {/* Save Button */}
        <button 
          onClick={handleSave}
          disabled={isSaving}
          className={clsx(
            "flex items-center gap-2 px-6 py-2 rounded-xl transition-all duration-200 text-xs font-bold",
            isSaving ? "bg-white/10 text-white/40" : "bg-white text-black hover:bg-white/90"
          )}
        >
          {isSaving ? <span className="animate-spin w-3 h-3 border-2 border-white/50 border-t-white rounded-full" /> : <Save className="w-4 h-4" />}
          {isSaving ? "Saving..." : (lastSaved ? "Saved" : "Save")}
        </button>
      </div>
      
      {/* Scrollable area */}
      <div className="flex-1 overflow-y-auto p-4 md:p-8">
        <EditorContent 
           editor={editor} 
           className="prose prose-invert prose-lg max-w-full focus:outline-none min-h-[500px]"
        />
      </div>

      <div className="border-t border-white/10 p-4 bg-white/5 flex justify-between items-center text-[10px] text-white/40 font-bold uppercase tracking-widest">
         <div className="flex items-center gap-4">
            <span className={clsx("flex items-center gap-2", isConnected ? "text-emerald-400" : "text-rose-400")}>
                <span className={clsx("w-2 h-2 rounded-full", isConnected ? "bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.5)]" : "bg-rose-400")} />
                {isConnected ? "Live Sync Enabled" : "Disconnected"}
            </span>
            {lastSaved && (
                <span className="flex items-center gap-1">
                    <Check className="w-3 h-3" />
                    Last saved {lastSaved.toLocaleTimeString()}
                </span>
            )}
         </div>
         <span>{awarenessUsers.length + 1} User{awarenessUsers.length !== 0 ? "s" : ""} Online</span>
      </div>

      <ShareModal 
        note={currentNote}
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
        onUpdate={setCurrentNote}
      />
    </div>
  );
}