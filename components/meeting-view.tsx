"use client";

import { useState, useEffect } from "react";
import { Lobby, Player } from "@/types/game";
import { VotingInterface } from "@/components/game/VotingInterface";
import { PlayerCard } from "@/components/ui/PlayerCard";
import { GameButton } from "@/components/ui/GameButton";
import { doc, updateDoc, increment } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { cn } from "@/lib/utils";
import { Megaphone, Skull, Check, Play, Gavel } from "lucide-react";
import { motion } from "framer-motion";
import { endMeeting, resumeGame, castVote, skipDiscussion } from "@/lib/game";


interface MeetingViewProps {
    lobby: Lobby;
    me: Player;
}

export function MeetingView({ lobby, me }: MeetingViewProps) {
    const [timeLeft, setTimeLeft] = useState(0);
    const [phase, setPhase] = useState<'discussion' | 'voting'>('discussion');
    const [selectedVote, setSelectedVote] = useState<string | null>(null); // Local selection

    const meeting = lobby.meeting;

    useEffect(() => {
        if (!meeting) return;

        const interval = setInterval(() => {
            const now = Date.now();
            // Fallback for old meetings without new fields
            // Default discussion time: 30 seconds from start
            const discussionEnd = meeting.discussionEndAt || (meeting.startedAt + 30000);
            // Default voting time: 60 seconds after discussion ends
            const votingEnd = meeting.votingEndAt || (discussionEnd + 60000);

            if (now < discussionEnd) {
                setPhase('discussion');
                setTimeLeft(Math.ceil((discussionEnd - now) / 1000));
            } else if (now < votingEnd) {
                setPhase('voting');
                setTimeLeft(Math.max(0, Math.ceil((votingEnd - now) / 1000)));
            } else {
                // If both phases are over, ensure phase is voting and time is 0
                setPhase('voting');
                setTimeLeft(0);
            }
        }, 1000);

        return () => clearInterval(interval);
    }, [meeting]);

    const hasVoted = me.hasVoted;
    const isDead = me.status === 'dead';

    // Handle clicking a player card (Local Selection)
    const handleSelect = (targetId: string | null) => {
        if (hasVoted || isDead || phase === 'discussion') return;
        setSelectedVote(targetId);
    };

    // Confirm Vote (Send to DB)
    const handleConfirmVote = async () => {
        if (hasVoted || isDead || phase === 'discussion') return;
        if (selectedVote === null) return; // Must select something (or 'skip')

        try {
            await castVote(lobby.id, me.id, selectedVote);
            setSelectedVote(null); // Clear local selection after casting vote
        } catch (e) {
            console.error("Error casting vote:", e);
        }
    };


    const players = Object.values(lobby.players);
    const result = meeting?.result;

    // -- HOST DASHBOARD VIEW --
    if (me.isHost && !result && meeting?.reason) { // Ensure this only shows during active voting
        // Aggregate votes for display
        // Aggregate votes for display
        const voteMap: Record<string, string[]> = {};
        players.forEach(p => {
            if (p.hasVoted && p.votedFor && p.votedFor !== 'skip') {
                if (!voteMap[p.votedFor]) voteMap[p.votedFor] = [];
                voteMap[p.votedFor].push(p.id); // Store Voter ID, not color
            }
        });

        // We can use VotingInterface for host too, but with extra info?
        // Actually, let's keep the Host Dashboard distinct but using new UI
        return (
            <div className="flex flex-col h-screen bg-space-black text-white p-6 overflow-hidden relative">
                <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 pointer-events-none" />

                <div className="z-10 flex flex-col items-center gap-4 mb-8">
                    <h1 className="text-4xl font-black uppercase tracking-widest text-[#d6d6d6]">
                        Mission Control
                    </h1>
                    <div className="flex items-center gap-4 bg-zinc-900/80 px-4 py-2 rounded-full border border-white/10">
                        <span className="font-mono text-slate-400 text-sm">STATUS:</span>
                        <span className="text-green-500 font-bold animate-pulse text-sm">MONITORING VOTES</span>
                    </div>
                </div>

                <div className="z-10 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 w-full max-w-6xl mx-auto overflow-y-auto pb-20">
                    {players.filter(p => p.status === 'alive').map(p => (
                        <div
                            key={p.id}
                            className="relative bg-space-blue/60 rounded-xl p-4 flex flex-col items-center border border-slate-700/50 backdrop-blur-sm"
                        >
                            <div
                                className="w-16 h-16 rounded-full mb-3 shadow-lg border-2 border-white/20 bg-cover bg-center"
                                style={{
                                    backgroundImage: p.characterImage ? `url(${p.characterImage})` : undefined,
                                    backgroundColor: !p.characterImage ? p.color : undefined
                                }}
                            />
                            <h2 className="text-xl font-bold uppercase mb-2 truncate max-w-full">{p.name}</h2>

                            {/* Vote Dots */}
                            <div className="flex flex-wrap justify-center gap-1 min-h-[1.5rem] w-full bg-black/20 rounded p-1">
                                {voteMap[p.id]?.map((voterId, idx) => {
                                    const voter = lobby.players[voterId];
                                    if (!voter) return null;
                                    return (
                                        <motion.div
                                            key={idx}
                                            initial={{ scale: 0 }}
                                            animate={{ scale: 1 }}
                                            className="w-6 h-6 rounded-full border border-white/20 shadow-sm bg-cover bg-center"
                                            style={{
                                                backgroundImage: voter.characterImage ? `url(${voter.characterImage})` : undefined,
                                                backgroundColor: !voter.characterImage ? voter.color : undefined
                                            }}
                                            title={voter.name}
                                        />
                                    );
                                })}
                            </div>
                        </div>
                    ))}
                </div>

                <div className="z-10 absolute bottom-6 right-6">
                    <GameButton
                        variant="danger"
                        onClick={() => endMeeting(lobby.id, lobby)}
                        className="font-bold uppercase shadow-lg"
                    >
                        <Gavel className="w-4 h-4 mr-2" /> Force End
                    </GameButton>
                </div>
            </div>
        );
    }

    if (result) {
        return (
            <div className="flex flex-col h-screen bg-space-black items-center justify-center p-6 text-center relative overflow-hidden">
                <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 pointer-events-none" />
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="space-y-8 z-10 p-8 bg-space-blue/50 rounded-2xl border border-slate-700 backdrop-blur-md max-w-2xl w-full"
                >
                    <h1 className="text-4xl font-black uppercase text-slate-200 mb-8 tracking-widest">Voting Results</h1>

                    {result.ejectedId ? (
                        <div className="space-y-6">
                            <div className="flex flex-col items-center gap-4">
                                <div
                                    className="w-32 h-32 rounded-full border-4 border-white/20 shadow-[0_0_30px_rgba(0,0,0,0.5)] bg-cover bg-center"
                                    style={{
                                        backgroundImage: lobby.players[result.ejectedId].characterImage ? `url(${lobby.players[result.ejectedId].characterImage})` : undefined,
                                        backgroundColor: !lobby.players[result.ejectedId].characterImage ? lobby.players[result.ejectedId].color : undefined
                                    }}
                                />
                                <div className="text-5xl font-black text-white uppercase tracking-wider">
                                    {lobby.players[result.ejectedId].name}
                                </div>
                            </div>

                            <p className="text-2xl text-slate-400 font-mono">was ejected.</p>

                            <div className={cn("text-3xl font-black uppercase tracking-widest py-4",
                                lobby.players[result.ejectedId].role === 'imposter' ? "text-role-imposter" : "text-role-crewmate"
                            )}>
                                Role: {lobby.players[result.ejectedId].role}
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            <div className="text-4xl font-black text-slate-400 uppercase tracking-wider">
                                {result.method === 'tie' ? "It was a Tie" : "Skipped Voting"}
                            </div>
                            <span className="text-xl text-slate-500 font-mono block">No one was ejected.</span>
                        </div>
                    )}

                    {me.isHost && (
                        <GameButton
                            onClick={() => resumeGame(lobby.id)}
                            className="w-full mt-8 h-16 text-xl bg-green-600 hover:bg-green-500 text-white border-green-400"
                        >
                            <Play className="mr-2 fill-current" /> Resume Mission
                        </GameButton>
                    )}
                </motion.div>
            </div>
        );
    }

    return (
        <div className="flex flex-col h-screen bg-space-black text-white p-4 relative overflow-hidden">
            <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 pointer-events-none" />

            <div className="relative z-10 h-full">
                <VotingInterface
                    timeLeft={timeLeft}
                    hasVoted={me.hasVoted || false}
                    isDead={me.isDead || false}
                    phase={phase}
                    selectedVote={selectedVote}
                    onSkip={() => handleSelect('skip')}
                    onConfirmVote={handleConfirmVote}
                >
                    {players.map((p) => {
                        // Logic for interactivity
                        const isInteractable = !hasVoted && !isDead && !p.status?.includes('dead') && p.status !== 'dead' && phase === 'voting';
                        const isSelected = selectedVote === p.id;

                        return (
                            <PlayerCard
                                key={p.id}
                                name={p.name}
                                color={p.color}
                                characterImage={p.characterImage}
                                isDead={p.status === 'dead' || p.isDead}
                                hasVoted={p.hasVoted}
                                isMe={p.id === me.id}
                                onClick={() => isInteractable ? handleSelect(p.id) : undefined}
                                className={cn(
                                    isInteractable && "cursor-pointer hover:border-slate-400 active:scale-95",
                                    isSelected && "border-4 border-green-500 ring-4 ring-green-500/50"
                                )}
                            />
                        );
                    })}
                </VotingInterface>

                {me.isHost && (
                    <div className="absolute top-0 right-0 p-2 flex gap-2">
                        {phase === 'discussion' ? (
                            <GameButton
                                variant="warning"
                                size="sm"
                                onClick={() => skipDiscussion(lobby.id)}
                                className="text-xs uppercase font-bold border border-yellow-500/50"
                            >
                                <Play className="w-3 h-3 mr-1" /> End Discussion Phase
                            </GameButton>
                        ) : (
                            <GameButton
                                variant="danger"
                                size="sm"
                                onClick={() => endMeeting(lobby.id, lobby)}
                                className="text-xs uppercase font-bold border border-red-500/50"
                            >
                                <Gavel className="w-3 h-3 mr-1" /> End Voting Phase
                            </GameButton>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
