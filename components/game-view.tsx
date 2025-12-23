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
import { MedbayTaskView } from "@/components/game/MedbayTaskView";

interface GameViewProps {
    lobby: Lobby;
    me: Player;
}

export function GameView({ lobby, me }: GameViewProps) {
    const [showReveal, setShowReveal] = useState(true);
    const [showAdmin, setShowAdmin] = useState(false);
    const [isRoleVisible, setIsRoleVisible] = useState(false);
    const [scannerTaskId, setScannerTaskId] = useState<number | null>(null);
    const [medbayTaskId, setMedbayTaskId] = useState<number | null>(null);



    if (lobby.status === 'ended') {
        return <WinnerView lobby={lobby} me={me} />;
    }

    // PLAYER VIEW: Logic for Reveal, then Game
    if (showReveal && me.role !== 'spectator') {
        const teammates = me.role === 'imposter'
            ? Object.values(lobby.players)
                .filter(p => p.role === 'imposter' && p.id !== me.id)
                .map(p => ({
                    name: p.name,
                    characterImage: p.characterImage || "" // Guard against missing image
                }))
            : [];

        return <RoleReveal
            role={me.role as "crewmate" | "imposter" | "jester" | "sheriff"}
            isOpen={showReveal}
            onComplete={() => setShowReveal(false)}
            teammates={teammates}
        />;
    }

    // HOST VIEW: Show Admin Console / Dashboard if not ended and reveal is done (or skipped)
    if (me.isHost) {
        return <AdminConsole lobby={lobby} onClose={() => { }} />;
    }

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

            {medbayTaskId !== null && (
                <MedbayTaskView
                    playerColor={me.characterImage ? me.characterImage.split('/').pop()?.split('.')[0] || "default" : "default"} // Fallback color derivation or use simulated color property if exists. 
                    // Actually, looking at types, Player has characterImage which is a path. 
                    // I will use "red" as default for validation testing if I can't derive it easily, 
                    // or better yet, I'll check the Player type in the next step to be sure.
                    // For now, I'll assume valid 'playerColor' need to be passed.
                    // Let's use a safe fallback.
                    onComplete={() => {
                        completeTask(lobby.id, me.id, medbayTaskId);
                        setMedbayTaskId(null);
                    }}
                    onCancel={() => setMedbayTaskId(null)}
                />
            )}

            {/* Header */}
            <div className="flex justify-between items-center mb-6">
                <div className="flex flex-col">
                    <span className="text-xs text-slate-500 font-mono tracking-widest uppercase mb-1">Identity</span>
                    <div className="flex items-center gap-2">
                        <span className={cn(
                            "font-black text-2xl uppercase tracking-wider transition-all",
                            !isRoleVisible ? "text-slate-600 blur-sm" :
                                me.role === 'imposter' ? 'text-role-imposter' :
                                    me.role === 'sheriff' ? 'text-role-sheriff' :
                                        me.role === 'jester' ? 'text-role-jester' : 'text-role-crewmate'
                        )}>
                            {isRoleVisible ? me.role : "HIDDEN"}
                        </span>
                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-slate-400 hover:text-white"
                            onClick={() => setIsRoleVisible(!isRoleVisible)}
                        >
                            {isRoleVisible ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </Button>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    {me.isHost && (
                        <GameButton size="icon" variant="ghost" className="text-red-500" onClick={() => setShowAdmin(true)}>
                            <ShieldAlert className="w-6 h-6" />
                        </GameButton>
                    )}
                    <div className="flex flex-col items-end">
                        <span className="text-xs text-slate-500 font-mono tracking-widest uppercase">Status</span>
                        <span className={cn(
                            "font-bold uppercase tracking-wider",
                            me.status === 'alive' ? "text-green-500" : "text-red-500"
                        )}>
                            {me.status}
                        </span>
                    </div>
                </div>
            </div>

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
                                // Default click action handling
                                if (me.status === 'alive' && me.role !== 'imposter' && task.type !== 'id-scan' && task.type !== 'medbay-scan') {
                                    completeTask(lobby.id, me.id, i);
                                }
                            }}
                            actionLabel={
                                task.type === 'id-scan' ? "Scan Card" :
                                    task.type === 'medbay-scan' ? "Submit Scan" : undefined
                            }
                            onAction={() => {
                                if (task.type === 'id-scan') setScannerTaskId(i);
                                if (task.type === 'medbay-scan') setMedbayTaskId(i);
                            }}
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
