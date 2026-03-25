"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { NoteList } from "@/components/NoteList";
import { apiClient } from "@/lib/api";
import { signOut } from "firebase/auth";
import { auth } from "@/lib/firebase";
import clsx from "clsx";

export default function DashboardPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [title, setTitle] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const [activeTab, setActiveTab] = useState("documents");

  const handleCreateNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    setIsCreating(true);
    try {
      const note = await apiClient.createNote(title);
      router.push(`/editor/${note.id}`);
    } catch (error) {
      console.error("Failed to create note:", error);
      alert("Failed to create note");
    } finally {
      setIsCreating(false);
      setShowCreateModal(false);
      setTitle("");
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      router.push("/login");
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  const navItems = [
    { id: "dashboard", label: "Dashboard", icon: "⌂" },
    { id: "documents", label: "Documents", icon: "📁" },
  ];

  return (
    <div className="flex min-h-screen p-4 md:p-8 gap-8 overflow-hidden">
      {/* Sidebar Sidebar */}
      <aside className="w-64 glass-card p-6 flex flex-col hidden lg:flex">
        <div className="flex items-center gap-3 mb-10 px-2">
          <div className="w-10 h-10 bg-black rounded-xl flex items-center justify-center text-white font-bold text-xl">
            N
          </div>
          <span className="text-2xl font-bold tracking-tight">Collab</span>
        </div>

        <nav className="flex-1 space-y-2">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={clsx(
                "w-full flex items-center gap-4 px-4 py-3 rounded-2xl transition-all duration-300",
                activeTab === item.id
                  ? "bg-black text-white shadow-xl translate-x-1"
                  : "text-gray-500 hover:bg-gray-100 hover:text-black"
              )}
            >
              <span className="text-xl">{item.icon}</span>
              <span className="font-medium">{item.label}</span>
            </button>
          ))}
        </nav>

        <div className="mt-auto space-y-4 pt-6 border-t border-gray-100">
          <div className="flex items-center gap-3 px-2">
            <div className="w-8 h-8 rounded-full bg-gray-200 overflow-hidden">
              <img src={`https://ui-avatars.com/api/?name=${user?.email}&background=random`} alt="Avatar" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold truncate">{user?.email?.split('@')[0]}</p>
              <p className="text-xs text-gray-400 truncate">{user?.email}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full text-left px-4 py-2 text-sm text-red-500 font-medium hover:bg-red-50 rounded-xl transition-colors"
          >
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col gap-8 max-w-6xl mx-auto w-full">
        {/* Header */}
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-4xl font-bold tracking-tight mb-1">Hi, {user?.email?.split('@')[0]}!</h1>
            <p className="text-gray-500 font-medium">Welcome back to your workspace.</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="relative">
              <input 
                type="text" 
                placeholder="Search notes..." 
                className="glass-card py-3 pl-10 pr-4 w-64 text-sm focus:outline-none focus:ring-2 focus:ring-black/5 transition-all"
              />
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">🔍</span>
            </div>
            <button
              onClick={() => setShowCreateModal(true)}
              className="btn-primary"
            >
              + Create
            </button>
          </div>
        </header>

        {/* Dynamic Content */}
        <div className="flex-1 flex flex-col gap-8">
          <div className="glass-card p-8 h-full flex-1">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-2xl font-bold tracking-tight">Recent Notes</h2>
            </div>
            <NoteList />
          </div>
        </div>
      </main>

      {/* Create Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 backdrop-blur-sm bg-black/20 flex items-center justify-center z-50 animate-in fade-in duration-300">
          <div className="glass-card p-8 w-[400px] shadow-2xl animate-in zoom-in-95 duration-300">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-2xl font-bold tracking-tight">New Note</h3>
              <button 
                onClick={() => setShowCreateModal(false)}
                className="text-gray-400 hover:text-black transition-colors text-2xl"
              >
                ×
              </button>
            </div>
            <form onSubmit={handleCreateNote} className="space-y-6">
              <div>
                <label className="text-xs uppercase tracking-widest font-bold text-gray-400 mb-2 block">
                  Title
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Weekly Strategy"
                  className="w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-black transition-all text-lg font-medium"
                  autoFocus
                />
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="btn-secondary flex-1"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isCreating || !title.trim()}
                  className="btn-primary flex-1"
                >
                  {isCreating ? "Creating..." : "Create Note"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}