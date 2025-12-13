"use client";

import { use, useEffect } from "react";
import { useGame } from "@/hooks/use-game";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { LobbyView } from "@/components/lobby-view";
import { GameView } from "@/components/game-view";
import { MeetingView } from "@/components/meeting-view";


// Fix for Next.js 15+ async params handling if needed, but standard 13/14 way:
export default function GamePage({ params }: { params: Promise<{ code: string }> }) {
    const { code } = use(params);
    const { lobby, me, loading, error } = useGame(code);
    const router = useRouter();

    useEffect(() => {
        if (error) {
            // Small delay to read error? Nah, just redirect for now or show error UI
        }
    }, [error]);

    if (loading) {
        return <div className="flex h-screen w-full items-center justify-center bg-black text-white">
            <Loader2 className="animate-spin h-10 w-10 text-cyan-500" />
        </div>;
    }

    if (error || !lobby || !me) {
        return (
            <div className="flex h-screen w-full flex-col items-center justify-center bg-black text-white gap-4">
                <h1 className="text-red-500 font-bold text-2xl">ERROR</h1>
                <p>{error || "Game not found"}</p>
                <button onClick={() => router.push("/")} className="text-blue-400 underline">
                    Return to Base
                </button>
            </div>
        );
    }

    if (lobby.status === "waiting") {
        return <LobbyView lobby={lobby} me={me} />;
    }

    if (lobby.status === "meeting") {
        return <MeetingView lobby={lobby} me={me} />;
    }

    // Game Loop
    return <GameView lobby={lobby} me={me} />;
}
