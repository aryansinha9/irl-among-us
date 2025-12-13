"use client";

import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Chrome, Ghost } from "lucide-react"; // Simulating icons with Lucide (Chrome for Google, Ghost for Anon)
// Note: Lucide might not have exact Google icon, usually we use an SVG or FaGoogle. 
// I'll genericize the icon or use a text label if specific icon isn't available in standard Lucide import.
// Checking imports later. For now, using text/generic icons.

export function LoginForm() {
    const { signInWithGoogle, signInAnonymously } = useAuth();
    const [isLoading, setIsLoading] = useState<"google" | "anon" | null>(null);

    const [error, setError] = useState<string | null>(null);

    const handleGoogleLogin = async () => {
        setIsLoading("google");
        setError(null);
        try {
            await signInWithGoogle();
        } catch (err: any) {
            console.error(err);
            setError(err.message || "Failed to sign in with Google.");
        } finally {
            setIsLoading(null);
        }
    };

    const handleAnonLogin = async () => {
        setIsLoading("anon");
        setError(null);
        try {
            await signInAnonymously();
        } catch (err: any) {
            console.error(err);
            setError(err.message || "Failed to sign in anonymously.");
        } finally {
            setIsLoading(null);
        }
    };

    return (
        <div className="flex flex-col gap-4 w-full max-w-sm mx-auto p-6 bg-slate-900/50 backdrop-blur-md rounded-xl border border-white/10 shadow-2xl">
            <div className="text-center mb-6">
                <h1 className="text-3xl font-bold text-white mb-2 tracking-widest uppercase">Identity Verification</h1>
                <p className="text-slate-400 text-sm">Scan credentials to enter the ship</p>
            </div>

            <Button
                variant="outline"
                size="lg"
                onClick={handleGoogleLogin}
                disabled={!!isLoading}
                className="w-full relative overflow-hidden group hover:border-cyan-400/50 hover:text-cyan-400 transition-all duration-300"
            >
                {isLoading === "google" ? (
                    <span className="animate-pulse">Connecting...</span>
                ) : (
                    <>
                        <span className="absolute inset-0 bg-cyan-400/10 translate-x-[-100%] group-hover:translate-x-0 transition-transform duration-300" />
                        <span className="relative z-10 flex items-center gap-2">
                            Access with Google
                        </span>
                    </>
                )}
            </Button>

            <div className="relative">
                <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t border-white/10" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-slate-900/50 px-2 text-slate-500">Or bypass security</span>
                </div>
            </div>

            <Button
                variant="ghost"
                size="lg"
                onClick={handleAnonLogin}
                disabled={!!isLoading}
                className="w-full hover:bg-white/5 hover:text-white"
            >
                {isLoading === "anon" ? "Bypassing..." : "Play as Guest"}
            </Button>

            {error && (
                <div className="mt-4 p-3 bg-red-500/10 border border-red-500/20 rounded text-red-400 text-xs font-mono text-center break-words">
                    {error}
                </div>
            )}
        </div>
    );
}
