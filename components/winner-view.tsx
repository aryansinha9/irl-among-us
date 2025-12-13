"use client";

import { useState } from "react";
import { Lobby, Player } from "@/types/game";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { doc, updateDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Trophy, Skull, Crown, RotateCcw } from "lucide-react";
import { cn } from "@/lib/utils";

interface WinnerViewProps {
    lobby: Lobby;
    me: Player;
}

export function WinnerView({ lobby, me }: WinnerViewProps) {
    const winner = lobby.winner;
    const reason = lobby.winReason || "Game Over";

    const isWinner =
        (winner === 'crewmate' && me.role === 'crewmate') ||
        (winner === 'imposter' && me.role === 'imposter') ||
        (winner === 'jester' && me.role === 'jester') ||
        (winner === 'crewmate' && me.role === 'sheriff'); // Sheriff wins with crew

    // Spectators/Host just see the result
    const isSpectator = me.role === 'spectator';

    const imposterPlayers = Object.values(lobby.players).filter(p => p.role === 'imposter');

    const handlePlayAgain = async () => {
        // Reset lobby to waiting
        const lobbyRef = doc(db, "lobbies", lobby.id);

        // Reset all players to alive, spectator, no tasks
        const updates: Record<string, any> = {
            status: 'waiting',
            winner: null,
            winReason: null,
            meeting: null,
            startedAt: null,
        };

        // Reset player states
        Object.keys(lobby.players).forEach(pid => {
            updates[`players.${pid}.role`] = 'spectator';
            updates[`players.${pid}.status`] = 'alive';
            updates[`players.${pid}.isDead`] = false;
            updates[`players.${pid}.tasks`] = [];
            updates[`players.${pid}.hasVoted`] = false;
            updates[`players.${pid}.votedFor`] = null;
        });

        await updateDoc(lobbyRef, updates);
    };

    return (
        <div className={cn("flex flex-col h-screen items-center justify-center p-6 text-center overflow-hidden",
            winner === 'imposter' ? "bg-red-950" : (winner === 'jester' ? "bg-purple-950" : "bg-cyan-950")
        )}>
            <motion.div
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="space-y-8 max-w-lg w-full"
            >
                <div className="flex justify-center mb-8">
                    {winner === 'imposter' ? (
                        <img src="/impostors_win.png" alt="Impostors Win" className="w-64 h-auto drop-shadow-[0_0_30px_rgba(239,68,68,0.5)]" />
                    ) : winner === 'jester' ? (
                        <Crown className="w-32 h-32 text-purple-400 animate-bounce" />
                    ) : (
                        <img src="/crewmates_win.png" alt="Crewmates Win" className="w-64 h-auto drop-shadow-[0_0_30px_rgba(34,211,238,0.5)]" />
                    )}
                </div>

                <div>
                    <h1 className={cn("text-5xl font-black uppercase tracking-widest mb-2",
                        winner === 'imposter' ? "text-red-500" : (winner === 'jester' ? "text-purple-400" : "text-cyan-400")
                    )}>
                        {winner === 'imposter' ? "Impostors Win" : (winner === 'jester' ? "Jester Wins" : "Victory")}
                    </h1>
                    <p className="text-xl text-white/70 font-mono uppercase">{reason}</p>
                </div>

                <div className="bg-black/30 p-6 rounded-xl border border-white/10 backdrop-blur-sm">
                    <h3 className="text-sm font-bold text-gray-400 uppercase mb-4">The Imposters Were</h3>
                    <div className="flex justify-center gap-4">
                        {imposterPlayers.map(p => (
                            <div key={p.id} className="flex flex-col items-center">
                                <div
                                    className="w-12 h-12 rounded-full mb-2 bg-cover bg-center border-2 border-white/20"
                                    style={{
                                        backgroundImage: p.characterImage ? `url(${p.characterImage})` : undefined,
                                        backgroundColor: !p.characterImage ? p.color : undefined
                                    }}
                                />
                                <span className="font-bold text-red-500">{p.name}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {me.isHost && (
                    <div className="pt-8">
                        <Button
                            onClick={handlePlayAgain}
                            className="w-full h-16 text-xl font-bold uppercase bg-white text-black hover:bg-gray-200"
                        >
                            <RotateCcw className="mr-2" /> Play Again
                        </Button>
                    </div>
                )}
            </motion.div>
        </div>
    );
}
