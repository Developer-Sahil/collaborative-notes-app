"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
} from "firebase/auth";
import { auth } from "@/lib/firebase";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSignUp, setIsSignUp] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      if (isSignUp) {
        await createUserWithEmailAndPassword(auth, email, password);
      } else {
        await signInWithEmailAndPassword(auth, email, password);
      }
      router.push("/dashboard");
    } catch (err: any) {
      setError(
        err.message || `Failed to ${isSignUp ? "sign up" : "sign in"}`
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 relative overflow-hidden">
      {/* Decorative Blur Elements */}
      <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-black/5 rounded-full blur-3xl -z-10 animate-pulse"></div>
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-gray-200/50 rounded-full blur-3xl -z-10"></div>
      
      <div className="glass-card p-12 w-full max-w-[480px] shadow-2xl relative">
        <div className="flex items-center gap-3 mb-10">
          <div className="w-12 h-12 bg-black rounded-2xl flex items-center justify-center text-white font-bold text-2xl shadow-xl">
            N
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">
            Collab Notes
          </h1>
        </div>

        <div className="mb-10">
          <h2 className="text-2xl font-bold tracking-tight mb-2">
            {isSignUp ? "Join the craft." : "Welcome back."}
          </h2>
          <p className="text-gray-400 font-medium">
            {isSignUp ? "Create your workspace in seconds." : "Continue where you left off."}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label className="text-[10px] uppercase tracking-widest font-bold text-gray-400 ml-1">
              Email Address
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-black transition-all text-lg font-medium"
              placeholder="name@example.com"
            />
          </div>

          <div className="space-y-2">
             <label className="text-[10px] uppercase tracking-widest font-bold text-gray-400 ml-1">
              Secret Key
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-black transition-all text-lg font-medium"
              placeholder="••••••••"
            />
          </div>

          {error && (
            <div className="bg-red-50 text-red-500 p-4 rounded-xl text-xs font-bold animate-in slide-in-from-top-2">
              ⚠️ {error}
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full btn-primary py-4 text-lg font-bold shadow-xl shadow-black/10 mt-2"
          >
            {isLoading
              ? "Authenticating..."
              : isSignUp
                ? "Create Account"
                : "Sign In"}
          </button>
        </form>

        <div className="mt-10 pt-8 border-t border-gray-100 flex items-center flex-col">
          <p className="text-gray-400 font-medium text-sm mb-4">
            {isSignUp ? "Already a member?" : "New here?"}
          </p>
          <button
            onClick={() => setIsSignUp(!isSignUp)}
            className="btn-secondary w-full py-3 text-sm font-bold"
          >
            {isSignUp ? "Sign in to account" : "Join the workspace"}
          </button>
        </div>
      </div>
    </div>
  );
}