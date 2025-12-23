"use client";

import { useState } from "react";
import { Lobby, Player } from "@/types/game";
import { RoleReveal } from "@/components/game/RoleReveal";
import { GameButton } from "@/components/ui/GameButton";
import { TaskItem } from "@/components/ui/TaskItem";
import { Button } from "@/components/ui/button"; // Keep Button for AdminConsole icon button only
import { reportBody, callEmergency, eliminatePlayer, completeTask, triggerSabotage } from "@/lib/game";
import { AlertCircle, Skull, Siren, ShieldAlert, Eye, EyeOff, Zap } from "lucide-react";
import { cn } from "@/lib/utils";
import { AdminConsole } from "@/components/admin/admin-console";
import { WinnerView } from "@/components/winner-view";
import { IDCardScanner } from "@/components/game/IDCardScanner";

interface GameViewProps {
    lobby: Lobby;
    me: Player;
}

export function GameView({ lobby, me }: GameViewProps) {
    const [showReveal, setShowReveal] = useState(true);
    const [showAdmin, setShowAdmin] = useState(false);
    const [isRoleVisible, setIsRoleVisible] = useState(false);
    const [scannerTaskId, setScannerTaskId] = useState<number | null>(null);

    // HOST VIEW: Immediately show Admin Console / Dashboard (unless playing game as normal player?)
    // User requested distinct interface.
    if (me.isHost && lobby.status !== 'ended') {
        return <AdminConsole lobby={lobby} onClose={() => { }} />;
    }

    // ... existing code ...

    return (
        <div className="flex flex-col h-screen bg-space-black text-white p-4">
            {showAdmin && <AdminConsole lobby={lobby} onClose={() => setShowAdmin(false)} />}

            {scannerTaskId !== null && (
                <IDCardScanner
                    onComplete={() => {
                        completeTask(lobby.id, me.id, scannerTaskId);
                        setScannerTaskId(null);
                    }}
                    onCancel={() => setScannerTaskId(null)}
                />
            )}

            {/* Header ... */}

            {/* Task List */}
            <div className="flex-1 overflow-y-auto mb-4 space-y-2">
                <div className="space-y-2">
                    <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-2">Current Tasks</h3>
                    {(me.tasks || []).map((task: any, i: number) => (
                        <TaskItem
                            key={i}
                            description={task.description}
                            details={task.details}
                            completed={task.completed}
                            className={cn(
                                me.status === 'alive' && me.role !== 'imposter' && "cursor-pointer hover:bg-slate-800/80 active:scale-[0.99]"
                            )}
                            onClick={() => {
                                // Default click action (toggle complete) handled only if NOT a special task or if we want to allow bypass?
                                // User request implies scan is needed. Let's disable default click if it's a scan task, or maybe just allow both?
                                // "Eligible to be marked as complete" - suggests manual tick after. 
                                // But better UX is auto-complete or enable button.
                                // Let's keep default behavior for standard tasks, but maybe disable for scan?
                                // Actually, allow manual toggle for debugging/fallback is often good, but user wants "Scan" to be the way.
                                // I will block default click if it's an id-scan task that isn't done, forcing use of the button.
                                if (me.status === 'alive' && me.role !== 'imposter' && task.type !== 'id-scan') {
                                    completeTask(lobby.id, me.id, i);
                                }
                            }}
                            actionLabel={task.type === 'id-scan' ? "Scan Card" : undefined}
                            onAction={() => setScannerTaskId(i)}
                            isActionEnabled={me.status === 'alive'}
                        />
                    ))}
                    {(!me.tasks || me.tasks.length === 0) && (
                        <p className="text-slate-600 text-sm italic">No active tasks assigned.</p>
                    )}
                </div>
            </div>



            {/* Actions */}
            <div className="grid grid-cols-2 gap-4 mt-auto">
                {me.status === 'alive' ? (
                    <>
                        <GameButton
                            variant="danger"
                            className="h-24 text-xl flex flex-col gap-2"
                            onClick={() => reportBody(lobby.id, me.id)}
                        >
                            <AlertCircle className="w-8 h-8" />
                            Report Body
                        </GameButton>

                        <GameButton
                            variant="warning"
                            className="h-24 text-xl flex flex-col gap-2"
                            onClick={() => callEmergency(lobby.id, me.id)}
                        >
                            <Siren className="w-8 h-8" />
                            Emergency
                        </GameButton>

                        {/* Imposter Actions */}
                        {me.role === 'imposter' && (
                            <GameButton
                                variant="action" // Special variant for sabotage? Or just Primary/Ghost?
                                // Let's use a distinct look. reusing 'secondary' or creating new style.
                                // Actually, 'action' variant in GameButton was defined but looked specific.
                                // Let's use a standard look with a Zap icon.
                                className="col-span-2 h-16 border-yellow-500/50 text-yellow-500 bg-yellow-900/20 hover:bg-yellow-900/40"
                                onClick={() => triggerSabotage(lobby.id)}
                            >
                                <Zap className="w-5 h-5 mr-2" />
                                SABOTAGE
                            </GameButton>
                        )}

                        {me.role !== 'imposter' && (
                            <GameButton
                                variant="ghost"
                                className="col-span-2 h-16 border-red-900/30 text-red-500 hover:bg-red-900/20"
                                onClick={() => eliminatePlayer(lobby.id, me.id)}
                            >
                                <Skull className="w-5 h-5 mr-2" />
                                I HAVE BEEN KILLED
                            </GameButton>
                        )}
                    </>
                ) : (
                    // ... dead view ...
                    <div className="col-span-2 p-6 bg-red-900/10 border-2 border-red-900/50 rounded-xl text-center flex flex-col items-center gap-2 animate-pulse">
                        <Skull className="w-12 h-12 text-red-600" />
                        <span className="text-red-500 font-black text-2xl uppercase tracking-widest">You are Dead</span>
                        <p className="text-red-400/60 text-sm font-mono">Complete tasks to help your crew.</p>
                    </div>
                )}
            </div>
        </div>
    );
}
