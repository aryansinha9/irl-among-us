"use client";

import { useState } from "react";
import { Lobby, Player } from "@/types/game";
import { Button } from "@/components/ui/button";
import { X, ShieldAlert, RefreshCw, PowerOff, Zap, UserX } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { updateDoc, doc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { cn } from "@/lib/utils";
import { resetLobby, skipDiscussion, endMeeting, resolveSabotage } from "@/lib/game";
import { FastForward, Gavel } from "lucide-react";

interface AdminConsoleProps {
    lobby: Lobby;
    onClose?: () => void;
}

export function AdminConsole({ lobby, onClose }: AdminConsoleProps) {
    const players = Object.values(lobby.players);

    // Calculate total progress (just count completed tasks vs total tasks)
    const totalTasks = players.reduce((acc, p) => acc + (p.tasks?.length || 0), 0);
    const completedTasks = players.reduce((acc, p) => acc + (p.tasks?.filter(t => t.completed).length || 0), 0);
    const progressPercent = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;

    const handleResetGame = async () => {
        if (!confirm("RESET GAME? This will return everyone to lobby.")) return;
        await resetLobby(lobby.id);
        onClose?.();
    };

    const isFlashing = lobby.sabotage?.lightsFlash;

    const toggleLights = async () => {
        if (isFlashing) {
            // Acknowledge the alert
            await resolveSabotage(lobby.id);
            return;
        }

        // Basic sabotage impl
        const newLightState = !(lobby.sabotage?.lights ?? true);
        const lobbyRef = doc(db, "lobbies", lobby.id);
        await updateDoc(lobbyRef, {
            'sabotage.lights': newLightState
        });
    };

    // ...

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md p-4">
            <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className={cn(
                    "w-full max-w-2xl bg-zinc-900 border rounded-xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh] transition-colors duration-500",
                    isFlashing ? "border-red-500 shadow-[0_0_50px_rgba(239,68,68,0.5)] animate-pulse" : "border-white/20"
                )}
            >
                <div className={cn(
                    "flex items-center justify-between p-4 border-b bg-zinc-950 transition-colors duration-500",
                    isFlashing ? "border-red-500 bg-red-950/50" : "border-white/10"
                )}>
                    <div className="flex items-center gap-2 text-red-500 font-bold uppercase tracking-widest">
                        <ShieldAlert className={cn("w-6 h-6", isFlashing && "animate-bounce")} />
                        Admin Console {isFlashing && "- SABOTAGE ALERT"}
                    </div>
                // ...
                </div>

// ... (stats code unchanged) ...

                {/* Controls */}
                <div className="space-y-2">
                    <h3 className="text-xs text-gray-500 uppercase font-mono">Override Controls</h3>
                    <div className="grid grid-cols-2 gap-4">
                        {/* ... reset button ... */}

                        <Button
                            variant="secondary"
                            onClick={toggleLights}
                            className={cn("h-16 flex flex-col gap-1 border transition-all duration-300",
                                isFlashing
                                    ? "bg-red-600 text-white border-red-400 animate-pulse shadow-[0_0_20px_rgba(220,38,38,0.8)] scale-105"
                                    : !(lobby.sabotage?.lights ?? true)
                                        ? "bg-red-900/50 border-red-500 text-red-500"
                                        : "bg-yellow-900/20 border-yellow-500/50 text-yellow-500"
                            )}
                        >
                            {isFlashing ? <ShieldAlert className="w-6 h-6 animate-spin" /> : (!(lobby.sabotage?.lights ?? true) ? <PowerOff className="w-5 h-5" /> : <Zap className="w-5 h-5" />)}
                            <span className={cn("text-xs font-bold", isFlashing && "text-sm")}>
                                {isFlashing ? "ACKNOWLEDGE ALERT" : (!(lobby.sabotage?.lights ?? true) ? "Fix Lights" : "Sabotage Lights")}
                            </span>
                        </Button>
// ...
                        {onClose && (
                            <Button variant="ghost" size="icon" onClick={onClose}>
                                <X className="w-6 h-6" />
                            </Button>
                        )}
                    </div>

                    <div className="flex-1 overflow-y-auto p-4 space-y-6">
                        {/* Global Stats */}
                        <div className="space-y-2">
                            <h3 className="text-xs text-gray-500 uppercase font-mono">Mission Progress</h3>
                            <div className="h-4 bg-zinc-800 rounded-full overflow-hidden">
                                <div
                                    className="h-full bg-green-500 transition-all duration-500"
                                    style={{ width: `${progressPercent}%` }}
                                />
                            </div>
                            <div className="flex justify-between text-xs font-mono text-gray-400">
                                <span>{completedTasks} / {totalTasks} Tasks Completed</span>
                                <span>{Math.round(progressPercent)}%</span>
                            </div>
                        </div>

                        {/* Player Monitor */}
                        <div className="space-y-2">
                            <h3 className="text-xs text-gray-500 uppercase font-mono">Crew Monitor</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                                {players.map(p => (
                                    <div key={p.id} className="flex items-center justify-between p-2 bg-black/40 rounded border border-white/5">
                                        <div className="flex items-center gap-2">
                                            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: p.color }} />
                                            <span className={cn("font-bold text-sm", p.status === 'dead' && "text-red-500 line-through")}>
                                                {p.name}
                                            </span>
                                            <span className="text-[10px] bg-zinc-800 px-1 rounded text-gray-400 uppercase">
                                                {p.role}
                                            </span>
                                        </div>
                                        <div className="text-xs font-mono text-gray-500">
                                            {p.tasks?.filter(t => t.completed).length}/{p.tasks?.length}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Controls */}
                        <div className="space-y-2">
                            <h3 className="text-xs text-gray-500 uppercase font-mono">Override Controls</h3>
                            <div className="grid grid-cols-2 gap-4">
                                <Button
                                    variant="destructive"
                                    onClick={handleResetGame}
                                    className="h-16 flex flex-col gap-1 border border-red-500/50"
                                >
                                    <RefreshCw className="w-5 h-5" />
                                    <span className="text-xs">Emergency Reset</span>
                                </Button>

                                <Button
                                    variant="secondary"
                                    onClick={toggleLights}
                                    className={cn("h-16 flex flex-col gap-1 border transition-all duration-300",
                                        isFlashing
                                            ? "bg-red-600 text-white border-red-400 animate-pulse shadow-[0_0_20px_rgba(220,38,38,0.8)] scale-105"
                                            : !(lobby.sabotage?.lights ?? true)
                                                ? "bg-red-900/50 border-red-500 text-red-500"
                                                : "bg-yellow-900/20 border-yellow-500/50 text-yellow-500"
                                    )}
                                >
                                    {isFlashing ? <ShieldAlert className="w-6 h-6 animate-spin" /> : (!(lobby.sabotage?.lights ?? true) ? <PowerOff className="w-5 h-5" /> : <Zap className="w-5 h-5" />)}
                                    <span className={cn("text-xs font-bold", isFlashing && "text-sm")}>
                                        {isFlashing ? "ACKNOWLEDGE ALERT" : (!(lobby.sabotage?.lights ?? true) ? "Fix Lights" : "Sabotage Lights")}
                                    </span>
                                </Button>

                                {isDiscussion && (
                                    <Button
                                        variant="outline"
                                        onClick={handleSkipDiscussion}
                                        className="h-16 flex flex-col gap-1 border-blue-500/50 text-blue-400 bg-blue-950/30 hover:bg-blue-900/50 hover:text-blue-300"
                                    >
                                        <FastForward className="w-5 h-5" />
                                        <span className="text-xs">Skip Discussion</span>
                                    </Button>
                                )}

                                {isVoting && (
                                    <Button
                                        variant="outline"
                                        onClick={handleEndVoting}
                                        className="h-16 flex flex-col gap-1 border-purple-500/50 text-purple-400 bg-purple-950/30 hover:bg-purple-900/50 hover:text-purple-300"
                                    >
                                        <Gavel className="w-5 h-5" />
                                        <span className="text-xs">End Voting</span>
                                    </Button>
                                )}
                            </div>
                        </div>
                    </div>
            </motion.div>
        </div>
    );
}
