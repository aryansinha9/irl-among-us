import React from "react";
import { cn } from "@/lib/utils";
import { GameButton } from "@/components/ui/GameButton";

interface VotingInterfaceProps {
    children: React.ReactNode;
    onSkip: () => void;
    onConfirmVote?: () => void;
    hasVoted: boolean;
    isDead: boolean;
    timeLeft: number;
    phase?: 'discussion' | 'voting';
    selectedVote?: string | null;
}

export function VotingInterface({
    children,
    onSkip,
    onConfirmVote,
    hasVoted,
    isDead,
    timeLeft,
    phase = 'voting',
    selectedVote
}: VotingInterfaceProps) {
    const isDiscussion = phase === 'discussion';

    return (
        <div className="flex flex-col h-full gap-4">
            {/* Timer Bar */}
            <div className={cn(
                "flex items-center justify-between border p-4 rounded-xl transition-colors",
                isDiscussion
                    ? "bg-slate-800/50 border-slate-700"
                    : "bg-red-900/20 border-red-900/50"
            )}>
                <div className="flex flex-col">
                    <span className={cn(
                        "font-mono text-xs uppercase tracking-widest",
                        isDiscussion ? "text-slate-400" : "text-red-400"
                    )}>
                        {isDiscussion ? "Discussion Phase" : "Voting Session"}
                    </span>
                    <span className="text-white font-black text-2xl uppercase italic">
                        {isDiscussion ? "Discuss & Deliberate" : "Who is the Imposter?"}
                    </span>
                </div>
                <div className="text-4xl font-mono font-bold text-white tabular-nums">
                    {timeLeft}s
                </div>
            </div>

            {/* Grid Container */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 flex-1 overflow-y-auto p-1">
                {children}
            </div>

            {/* Footer */}
            <div className="mt-auto pt-2 grid gap-2">
                {isDiscussion ? (
                    <div className="h-16 flex items-center justify-center bg-slate-800/50 rounded-xl border border-slate-700 text-slate-400 font-bold uppercase tracking-widest animate-pulse">
                        Discussion in Progress...
                    </div>
                ) : (
                    hasVoted ? (
                        <div className="h-16 flex items-center justify-center bg-green-900/20 rounded-xl border border-green-900/50 text-green-500 font-bold uppercase tracking-widest">
                            Vote Confirmed
                        </div>
                    ) : (
                        renderVotingControls(isDead, selectedVote, onConfirmVote, onSkip)
                    )
                )}
            </div>
        </div>
    );
}

function renderVotingControls(
    isDead: boolean,
    selectedVote: string | null | undefined,
    onConfirm: (() => void) | undefined,
    onSkip: () => void
) {
    if (isDead) {
        return (
            <div className="h-16 flex items-center justify-center bg-red-900/10 rounded-xl border border-red-900/30 text-red-500 font-bold uppercase tracking-widest opacity-50">
                Spectator Mode
            </div>
        );
    }

    // Default to Skip logic if nothing selected yet? 
    // Wait, if we want "Select -> Confirm", then Skip is also a selection (or a separate action).
    // Let's make "Skip" a selection-like action OR a direct action.
    // User requested "Select something, then confirm".
    // If selectedVote is set (and not 'skip'), show CONFIRM [Player].
    // If selectedVote is 'skip', show CONFIRM SKIP?
    // Actually, let's keep it simple: 
    // Button 1: SKIP (Selects 'skip')
    // Button 2: CONFIRM (Enabled only if selectedVote is non-null)

    const isSkipSelected = selectedVote === 'skip';

    return (
        <div className="flex gap-2 h-16">
            <GameButton
                variant={isSkipSelected ? "warning" : "ghost"}
                className={cn(
                    "flex-1 border-dashed border-slate-600 text-slate-400 hover:text-white hover:bg-slate-800",
                    isSkipSelected && "bg-yellow-600 border-solid border-yellow-500 text-white"
                )}
                onClick={onSkip}
            >
                {isSkipSelected ? "SKIP SELECTED" : "SKIP VOTE"}
            </GameButton>

            <GameButton
                variant="primary"
                className="flex-[2] text-xl font-bold"
                disabled={!selectedVote}
                onClick={onConfirm}
            >
                CONFIRM VOTE
            </GameButton>
        </div>
    );
}
