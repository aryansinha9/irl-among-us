"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { JoinGameForm } from "@/components/join-game-form";
import { Loader2 } from "lucide-react";

export default function Home() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
    }
  }, [user, loading, router]);

  if (loading || !user) {
    return (
      <div className="min-h-screen bg-space-black flex items-center justify-center">
        <Loader2 className="animate-spin text-role-crewmate w-12 h-12" />
      </div>
    );
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-4 relative overflow-hidden bg-space-black">
      {/* Background Ambience */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--color-space-blue)_0%,_var(--color-space-black)_100%)] opacity-80 z-0" />

      <div className="z-10 w-full max-w-md flex flex-col items-center gap-8">
        <div className="text-center space-y-4">
          <img
            src="/logo.png"
            alt="SAYG Logo"
            className="w-32 h-auto mx-auto drop-shadow-[0_0_15px_rgba(255,255,255,0.3)] animate-pulse"
          />
          <div>
            <h1 className="text-5xl md:text-7xl font-black tracking-widest text-transparent bg-clip-text bg-gradient-to-br from-white via-slate-200 to-slate-500 drop-shadow-[0_4px_0_rgba(0,0,0,0.5)]">
              IRL AMONG US
            </h1>
            <p className="text-role-crewmate font-bold tracking-widest uppercase opacity-90 text-sm md:text-base mt-2">
              Real-Life Social Deduction
            </p>
          </div>
        </div>

        <JoinGameForm />

        <footer className="text-slate-600 font-mono text-xs mt-12 tracking-wider">
          SYSTEM_VERSION: 1.0.0 // STATUS: READY
        </footer>
      </div>
    </main>
  );
}
