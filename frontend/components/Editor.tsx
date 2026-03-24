"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";
import { useCallback, useEffect, useState } from "react";
import { useWebSocket } from "@/hooks/useWebSocket";
import { WebSocketMessage } from "@/lib/types";
import clsx from "clsx";

interface EditorProps {
  noteId: string;
  initialContent?: string;
  onSave?: (content: string) => Promise<void>;
}

export function Editor({ noteId, initialContent = "", onSave }: EditorProps) {
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const editor = useEditor({
    extensions: [
      StarterKit,
      Placeholder.configure({
        placeholder: "Start composing your masterpiece...",
      }),
    ],
    content: initialContent,
    onUpdate: () => {
      // Auto-save debouncing handled by parent
    },
  });

  const handleMessage = useCallback((message: WebSocketMessage) => {
    if (message.type === "update") {
      // Handle remote updates
      console.log("Received update from collaborator:", message.user_id);
    }
  }, []);

  const { isConnected, sendMessage } = useWebSocket({
    noteId,
    onMessage: handleMessage,
  });

  const handleSave = useCallback(async () => {
    if (!editor || !onSave) return;

    const content = editor.getHTML();
    setIsSaving(true);

    try {
      await onSave(content);
      setLastSaved(new Date());

      // Broadcast sync
      sendMessage({
        type: "sync",
        data: { content },
      });
    } catch (error) {
      console.error("Save error:", error);
    } finally {
      setIsSaving(false);
    }
  }, [editor, onSave, sendMessage]);

  useEffect(() => {
    // Auto-save after 3 seconds of inactivity
    const timer = setTimeout(() => {
      handleSave();
    }, 3000);

    return () => clearTimeout(timer);
  }, [editor?.getHTML(), handleSave]);

  if (!editor) return null;

  return (
    <div className="flex flex-col h-[calc(100vh-200px)] glass-card overflow-hidden">
      {/* Toolbar */}
      <div className="border-b border-gray-100 bg-white/50 backdrop-blur-md p-4 flex items-center gap-3">
        <div className="flex items-center gap-2 pr-4 border-r border-gray-100">
          <button
            onClick={() => editor.chain().focus().toggleBold().run()}
            className={clsx(
              "w-10 h-10 rounded-xl font-bold transition-all duration-200",
              editor.isActive("bold")
                ? "bg-black text-white shadow-lg scale-105"
                : "bg-white/50 text-gray-600 hover:bg-gray-100"
            )}
          >
            B
          </button>
          <button
            onClick={() => editor.chain().focus().toggleItalic().run()}
            className={clsx(
              "w-10 h-10 rounded-xl font-serif italic transition-all duration-200",
              editor.isActive("italic")
                ? "bg-black text-white shadow-lg scale-105"
                : "bg-white/50 text-gray-600 hover:bg-gray-100"
            )}
          >
            I
          </button>
           <button
            onClick={() => editor.chain().focus().toggleCode().run()}
            className={clsx(
              "w-10 h-10 rounded-xl font-mono transition-all duration-200",
              editor.isActive("code")
                ? "bg-black text-white shadow-lg scale-105"
                : "bg-white/50 text-gray-600 hover:bg-gray-100"
            )}
          >
            &lt;/&gt;
          </button>
        </div>
        
        <div className="flex-1" />
        
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/50 border border-gray-100">
            <span className={clsx(
              "w-2 h-2 rounded-full",
              isConnected ? "bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)]" : "bg-gray-400"
            )} />
            <span className="text-xs font-bold uppercase tracking-wider text-gray-500">
              {isConnected ? "Live" : "Offline"}
            </span>
          </div>
          
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="btn-primary py-2 px-5 text-sm"
          >
            {isSaving ? "Syncing..." : "Save"}
          </button>
        </div>
      </div>

      {/* Editor Content */}
      <div className="flex-1 overflow-auto bg-white/30 backdrop-blur-sm p-8 md:p-12">
        <div className="max-w-4xl mx-auto">
          <EditorContent editor={editor} />
        </div>
      </div>

      {/* Footer Status */}
      <footer className="px-6 py-3 border-t border-gray-100 bg-gray-50/50 flex justify-between items-center">
        <div className="text-[10px] font-bold uppercase tracking-widest text-gray-400">
          Last updated: {lastSaved ? lastSaved.toLocaleTimeString() : 'Never'}
        </div>
        <div className="flex gap-2 text-xs">
          <span className="text-gray-400">Collaborators:</span>
          <div className="flex -space-x-2">
            <div className="w-6 h-6 rounded-full border-2 border-white bg-black flex items-center justify-center text-[10px] text-white font-bold">U1</div>
            <div className="w-6 h-6 rounded-full border-2 border-white bg-gray-300 flex items-center justify-center text-[10px] text-white font-bold">+1</div>
          </div>
        </div>
      </footer>
    </div>
  );
}