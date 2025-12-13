import React from "react";
import { cn } from "@/lib/utils";
import { Crown, Skull } from "lucide-react";

interface PlayerCardProps {
    name: string;
    color: string;
    characterImage?: string;
    isHost?: boolean;
    isDead?: boolean;
    hasVoted?: boolean;
    isMe?: boolean;
    className?: string;
    onClick?: () => void;
    onAction?: () => void; // New prop for generic actions (Kick)
    actionIcon?: "kick" | "other"; // Extensible
}

export function PlayerCard({
    name,
    color,
    characterImage,
    isHost,
    isDead,
    hasVoted,
    isMe,
    className,
    onClick,
    onAction,
    actionIcon
}: PlayerCardProps) {
    return (
        <div
            onClick={onClick}
            className={cn(
                "relative flex items-center gap-3 p-3 rounded-xl border-2 transition-all select-none backdrop-blur-md group",
                // Default State
                "bg-space-blue/60 border-slate-700/50 hover:border-slate-500",
                // Dead State
                isDead && "border-red-900/50 bg-red-900/10 opacity-70 grayscale",
                // Me State
                isMe && !isDead && "border-role-crewmate/50 bg-role-crewmate/10",
                // Interactive
                onClick && !isDead && "cursor-pointer active:scale-[0.98]",
                className
            )}
        >
            {/* Avatar */}
            <div
                className={cn(
                    "w-12 h-12 rounded-full border-2 border-white/20 shadow-[0_0_10px_rgba(0,0,0,0.5)] flex-shrink-0 bg-cover bg-center overflow-hidden",
                    // Fallback background color if image fails or loading
                    isDead && "border-red-500/50 grayscale brightness-75",
                    !characterImage && "bg-slate-700"
                )}
                style={{
                    backgroundImage: characterImage ? `url(${characterImage})` : undefined,
                    backgroundColor: !characterImage ? color : undefined
                }}
            />

            {/* Info */}
            <div className="flex flex-col min-w-0 flex-1">
                <div className="flex items-center gap-2">
                    <span className={cn("font-bold text-sm truncate uppercase tracking-wide", isDead ? "text-red-400 line-through decoration-2 decoration-red-500" : "text-slate-100")}>
                        {name}
                    </span>
                    {isHost && <Crown className="w-3 h-3 text-role-sheriff" />}
                </div>

                {isMe && (
                    <span className="text-[10px] font-black uppercase text-role-crewmate tracking-widest">
                        YOU
                    </span>
                )}
            </div>

            {/* Status Indicators */}
            {isDead && (
                <Skull className="w-5 h-5 text-red-600 animate-pulse" />
            )}

            {hasVoted && !isDead && (
                <div className="bg-green-500 text-black text-[10px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider shadow-[0_0_10px_rgba(34,197,94,0.4)]">
                    Voted
                </div>
            )}

            {/* Action Button (e.g. Kick) */}
            {onAction && (
                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        onAction();
                    }}
                    className="p-2 -mr-1 rounded-lg hover:bg-black/20 text-slate-400 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"
                    title="Remove Player"
                >
                    <Skull className="w-4 h-4" />
                </button>
            )}
        </div>
    );
}
