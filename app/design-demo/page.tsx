"use client";

import React, { useState } from "react";
import { GameButton } from "@/components/ui/GameButton";
import { RoleReveal } from "@/components/game/RoleReveal";
import { PlayerCard } from "@/components/ui/PlayerCard";
import { TaskItem } from "@/components/ui/TaskItem";
import { VotingInterface } from "@/components/game/VotingInterface";
import { Skull, Siren } from "lucide-react";

export default function DesignDemoPage() {
    const [activeRole, setActiveRole] = useState<"imposter" | "crewmate" | "jester" | "sheriff" | "custom" | null>(null);

    const colors = [
        { name: "Space Black", var: "bg-space-black", hex: "#0b0d17" },
        { name: "Space Blue", var: "bg-space-blue", hex: "#1a1d2d" },
        { name: "Imposter Red", var: "bg-role-imposter", hex: "#c51111" },
        { name: "Crewmate Cyan", var: "bg-role-crewmate", hex: "#38bdf8" },
        { name: "Jester Pink", var: "bg-role-jester", hex: "#e879f9" },
        { name: "Sheriff Gold", var: "bg-role-sheriff", hex: "#fcc01e" },
    ];

    return (
        <div className="min-h-screen bg-space-black p-8 space-y-12 text-slate-200">

            {/* Header */}
            <header className="border-b border-slate-800 pb-6">
                <h1 className="text-4xl font-black uppercase tracking-widest text-[#d6d6d6]">
                    Design System Demo
                </h1>
                <p className="mt-2 text-slate-400">Verifying custom UI integration based on reference images.</p>
            </header>

            {/* Colors Section */}
            <section className="space-y-4">
                <h2 className="text-2xl font-bold uppercase tracking-wide">Color Palette</h2>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                    {colors.map((color) => (
                        <div key={color.name} className="space-y-2">
                            <div className={`h-24 w-full rounded-xl border-2 border-slate-700 shadow-lg ${color.var}`}></div>
                            <div>
                                <p className="font-bold text-sm">{color.name}</p>
                                <p className="text-xs text-slate-500 font-mono">{color.hex}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            {/* Buttons Section */}
            <section className="space-y-4">
                <h2 className="text-2xl font-bold uppercase tracking-wide">Buttons Component</h2>
                <div className="flex flex-wrap gap-8 items-start bg-space-blue p-8 rounded-2xl border border-slate-800">

                    <div className="space-y-2 flex flex-col items-center">
                        <span className="text-xs text-slate-400 uppercase">Primary</span>
                        <GameButton>Confirm Vote</GameButton>
                    </div>

                    <div className="space-y-2 flex flex-col items-center">
                        <span className="text-xs text-slate-400 uppercase">Danger</span>
                        <GameButton variant="danger">
                            <Skull className="mr-2 h-5 w-5" />
                            Kill
                        </GameButton>
                    </div>

                    <div className="space-y-2 flex flex-col items-center">
                        <span className="text-xs text-slate-400 uppercase">Warning</span>
                        <GameButton variant="warning">
                            <Siren className="mr-2 h-5 w-5" />
                            Emergency
                        </GameButton>
                    </div>

                    <div className="space-y-2 flex flex-col items-center">
                        <span className="text-xs text-slate-400 uppercase">Ghost</span>
                        <GameButton variant="ghost">Skip Vote</GameButton>
                    </div>

                    <div className="space-y-2 flex flex-col items-center">
                        <span className="text-xs text-slate-400 uppercase">Sizes</span>
                        <div className="flex items-end gap-2">
                            <GameButton size="sm">Small</GameButton>
                            <GameButton size="default">Default</GameButton>
                            <GameButton size="lg">Large</GameButton>
                        </div>
                    </div>
                </div>
            </section>

            {/* Player Cards Section */}
            <section className="space-y-4">
                <h2 className="text-2xl font-bold uppercase tracking-wide">Player Cards</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-space-blue p-8 rounded-2xl border border-slate-800">
                    <PlayerCard name="Captain Dave" color="#2563eb" isHost isMe />
                    <PlayerCard name="Sus Imposter" color="#dc2626" hasVoted />
                    <PlayerCard name="Red Shirt" color="#16a34a" isDead />
                </div>
            </section>

            {/* Task List Section */}
            <section className="space-y-4">
                <h2 className="text-2xl font-bold uppercase tracking-wide">Task List</h2>
                <div className="flex flex-col gap-2 bg-space-blue p-8 rounded-2xl border border-slate-800 max-w-md">
                    <TaskItem description="Fix Wiring in Electrical" completed={false} />
                    <TaskItem description="Swipe Card in Admin" completed={true} />
                    <TaskItem description="Clean O2 Filter" completed={false} />
                </div>
            </section>

            {/* Voting Interface Mockup */}
            <section className="space-y-4">
                <h2 className="text-2xl font-bold uppercase tracking-wide">Voting Interface Mockup</h2>
                <div className="h-[500px] bg-space-blue p-4 rounded-2xl border border-slate-800 relative overflow-hidden">
                    <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 pointer-events-none" />
                    <VotingInterface onSkip={() => { }} hasVoted={false} isDead={false} timeLeft={45}>
                        <PlayerCard name="Player 1" color="#f97316" hasVoted />
                        <PlayerCard name="Player 2" color="#eab308" />
                        <PlayerCard name="Player 3" color="#7c3aed" isDead />
                        <PlayerCard name="Me (You)" color="#db2777" isMe />
                        <PlayerCard name="Player 5" color="#0891b2" />
                        <PlayerCard name="Player 6" color="#84cc16" hasVoted />
                    </VotingInterface>
                </div>
            </section>

            {/* Role Reveal Section */}
            <section className="space-y-4">
                <h2 className="text-2xl font-bold uppercase tracking-wide">Role Reveal Animation</h2>
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    <GameButton
                        className="w-full bg-role-imposter border-red-900 hover:bg-red-500 text-white"
                        onClick={() => setActiveRole("imposter")}
                    >
                        Reveal Imposter
                    </GameButton>
                    <GameButton
                        className="w-full bg-role-crewmate border-sky-600 hover:bg-sky-400 text-black"
                        onClick={() => setActiveRole("crewmate")}
                    >
                        Reveal Crewmate
                    </GameButton>
                    <GameButton
                        className="w-full bg-role-jester border-fuchsia-800 hover:bg-fuchsia-400 text-white"
                        onClick={() => setActiveRole("jester")}
                    >
                        Reveal Jester
                    </GameButton>
                    <GameButton
                        className="w-full bg-role-sheriff border-yellow-700 hover:bg-yellow-400 text-black"
                        onClick={() => setActiveRole("sheriff")}
                    >
                        Reveal Sheriff
                    </GameButton>
                    <GameButton
                        className="w-full bg-slate-700 border-slate-900 hover:bg-slate-600 text-white"
                        onClick={() => setActiveRole("custom")}
                    >
                        Custom Image
                    </GameButton>
                </div>
            </section>

            {/* Role Reveal Overlays */}
            <RoleReveal role="imposter" isOpen={activeRole === "imposter"} onComplete={() => setActiveRole(null)} />
            <RoleReveal role="crewmate" isOpen={activeRole === "crewmate"} onComplete={() => setActiveRole(null)} />
            <RoleReveal role="jester" isOpen={activeRole === "jester"} onComplete={() => setActiveRole(null)} />
            <RoleReveal role="sheriff" isOpen={activeRole === "sheriff"} onComplete={() => setActiveRole(null)} />

            {/* Custom Image Example */}
            <RoleReveal
                role="crewmate"
                isOpen={activeRole === "custom"}
                onComplete={() => setActiveRole(null)}
                customImage={
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-40 h-40 text-green-400">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
                    </svg>
                }
            />

        </div>
    );
}
