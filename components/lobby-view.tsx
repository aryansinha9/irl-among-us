"use client";

import { useState } from "react";
import { Lobby, Player } from "@/types/game";
import { GameButton } from "@/components/ui/GameButton";
import { PlayerCard } from "@/components/ui/PlayerCard";
import { startGame, kickPlayer, triggerIntro } from "@/lib/game";
import { IntroOverlay } from "./intro-overlay";
import { motion, AnimatePresence } from "framer-motion";
import { Users, Crown, Copy, Loader2, AlertTriangle, Settings2, Minus, Plus, Play } from "lucide-react";
import { Input } from "@/components/ui/input";

interface LobbyViewProps {
    lobby: Lobby;
    me: Player;
}

export function LobbyView({ lobby, me }: LobbyViewProps) {
    const [loading, setLoading] = useState(false);
    const players = Object.values(lobby.players);
    const isHost = me.isHost;

    // Settings State (Local to Host)
    const [numImposters, setNumImposters] = useState(1);
    const [jester, setJester] = useState(false);
    const [sheriff, setSheriff] = useState(false);
    const [discussionTime, setDiscussionTime] = useState(30);
    const [votingTime, setVotingTime] = useState(120);

    // Intro Video State
    const [hideIntro, setHideIntro] = useState(false);
    const showIntroOverlay = lobby.showIntro && !hideIntro;

    const handleStart = async () => {
        setLoading(true);
        try {
            await startGame(lobby.id, {
                numImposters,
                roles: { jester, sheriff },
                discussionTime,
                votingTime
            });
        } catch (e) {
            console.error(e);
            setLoading(false);
        }
    };

    const copyCode = () => {
        navigator.clipboard.writeText(lobby.id);
    };

    return (
        <div className="flex flex-col h-[100dvh] bg-black text-white p-6 relative overflow-hidden">
            {showIntroOverlay && (
                <IntroOverlay
                    src="/intro.mp4"
                    onComplete={() => setHideIntro(true)}
                />
            )}

            {/* Background Grid */}
            <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 pointer-events-none" />
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none" />

            {/* Header */}
            <div className="relative z-10 flex flex-col items-center gap-4 mt-8">
                <h2 className="text-gray-400 font-mono text-sm uppercase tracking-widest">Mission Code</h2>
                <button
                    onClick={copyCode}
                    className="text-6xl font-black bg-clip-text text-transparent bg-gradient-to-b from-cyan-300 to-cyan-600 tracking-wider flex items-center gap-4 hover:scale-105 transition-transform"
                >
                    {lobby.id}
                    <Copy className="w-6 h-6 text-gray-500 opacity-50" />
                </button>
            </div>

            <div className="relative z-10 flex-1 mt-12 overflow-y-auto w-full max-w-2xl mx-auto">
                {/* Host Settings Panel (Visible to Host) */}
                {isHost && (
                    <div className="mb-8 p-4 bg-zinc-900/80 rounded-xl border border-white/10 space-y-4">
                        <div className="flex items-center gap-2 text-cyan-400 font-bold uppercase tracking-widest text-xs mb-2">
                            <Settings2 className="w-4 h-4" /> Mission Parameters
                        </div>

                        <div className="flex items-center justify-between">
                            <span className="text-sm font-bold text-gray-300">Imposters</span>
                            <div className="flex items-center gap-4">
                                <GameButton
                                    variant="ghost"
                                    className="h-8 w-8 p-0 border border-white/20"
                                    onClick={() => setNumImposters(Math.max(1, numImposters - 1))}
                                >
                                    <Minus className="w-4 h-4" />
                                </GameButton>
                                <span className="text-xl font-mono font-bold w-4 text-center">{numImposters}</span>
                                <GameButton
                                    variant="ghost"
                                    className="h-8 w-8 p-0 border border-white/20"
                                    onClick={() => setNumImposters(Math.min(3, numImposters + 1))}
                                >
                                    <Plus className="w-4 h-4" />
                                </GameButton>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-2">
                            <button
                                onClick={() => setJester(!jester)}
                                className={`p-3 rounded-lg border text-sm font-bold transition-all ${jester ? 'bg-purple-900/50 border-purple-500 text-purple-300' : 'bg-black/20 border-white/10 text-gray-500'}`}
                            >
                                Jester Role
                            </button>
                            <button
                                onClick={() => setSheriff(!sheriff)}
                                className={`p-3 rounded-lg border text-sm font-bold transition-all ${sheriff ? 'bg-yellow-900/50 border-yellow-500 text-yellow-300' : 'bg-black/20 border-white/10 text-gray-500'}`}
                            >
                                Sheriff Role
                            </button>
                        </div>

                        <div className="grid grid-cols-2 gap-4 pt-2 border-t border-white/10">
                            <div className="space-y-1">
                                <span className="text-xs font-bold text-gray-400 uppercase">Discussion (s)</span>
                                <Input
                                    type="number"
                                    value={discussionTime}
                                    onChange={(e) => setDiscussionTime(Number(e.target.value))}
                                    className="bg-black/40 border-white/10 h-10 text-center font-mono"
                                />
                            </div>
                            <div className="space-y-1">
                                <span className="text-xs font-bold text-gray-400 uppercase">Voting (s)</span>
                                <Input
                                    type="number"
                                    value={votingTime}
                                    onChange={(e) => setVotingTime(Number(e.target.value))}
                                    className="bg-black/40 border-white/10 h-10 text-center font-mono"
                                />
                            </div>
                        </div>
                    </div>
                )}

                <div className="flex justify-between items-center mb-4 px-2">
                    <h2 className="text-xl font-bold uppercase tracking-widest text-slate-400">Crew Manifest</h2>
                    <div className="bg-space-blue/50 px-3 py-1 rounded-full border border-slate-600 text-xs font-mono font-bold">
                        {players.length} / 11 OPERATIVES
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 pb-20">
                    <AnimatePresence>
                        {players.map((p) => (
                            <motion.div key={p.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                                <PlayerCard
                                    name={p.name}
                                    color={p.color}
                                    characterImage={p.characterImage}
                                    isHost={p.isHost}
                                    isMe={p.id === me.id}
                                    isDead={p.isDead}
                                    onAction={isHost && p.id !== me.id ? () => {
                                        if (confirm(`Kick ${p.name}?`)) kickPlayer(lobby.id, p.id);
                                    } : undefined}
                                    actionIcon="kick"
                                />
                            </motion.div>
                        ))}
                    </AnimatePresence>
                </div>
            </div>

            {/* Footer Actions */}
            <div className="relative z-20 mt-auto pt-4 border-t border-slate-800 bg-space-black/80 backdrop-blur-sm">
                {isHost ? (
                    <div className="flex gap-4">
                        <GameButton
                            variant="secondary"
                            className="flex-1 h-16 text-lg border-blue-500/50"
                            onClick={() => triggerIntro(lobby.id)}
                            disabled={loading}
                        >
                            <Play className="w-5 h-5 mr-2" /> PLAY INTRO
                        </GameButton>
                        <GameButton
                            variant="primary"
                            className="flex-[2] h-16 text-xl shadow-[0_0_20px_rgba(34,197,94,0.4)]"
                            onClick={handleStart}
                            disabled={loading}
                        >
                            {loading ? <Loader2 className="animate-spin mr-2" /> : "START MISSION"}
                        </GameButton>
                    </div>
                ) : (
                    <div className="flex flex-col items-center gap-2 text-center">
                        <Loader2 className="animate-spin text-role-crewmate w-6 h-6" />
                        <p className="text-slate-400 text-sm font-mono animate-pulse">Waiting for Host...</p>
                    </div>
                )}

                {players.length < 4 && isHost && (
                    <div className="flex items-center justify-center gap-2 text-yellow-500 text-xs mt-2 font-mono">
                        <AlertTriangle className="w-3 h-3" />
                        <span>Recommended: 4+ Players</span>
                    </div>
                )}
            </div>
        </div>
    );
}
