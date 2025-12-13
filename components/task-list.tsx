"use client";

import { useState } from "react";
import { Task } from "@/types/game";
import { CheckCircle2, Circle, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { doc, updateDoc, arrayUnion, arrayRemove } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { checkWinCondition } from "@/lib/game";

export async function toggleTask(lobbyId: string, playerId: string, task: Task) {
    const lobbyRef = doc(db, "lobbies", lobbyId);
    const playerTaskPath = `players.${playerId}.tasks`;

    // We need to match the specific task in the array. 
    // Firestore array update is tricky for objects. simpler to read-modify-write for tasks
    // OR we assume complete replacement.

    // For now, let's assume we pass the FULL updated task list from client (easier)
    // BUT here we only get one task.
    // Let's rely on client to send updated list? No, unsafe.
    // Let's read, toggle, write.

    // Actually, let's just use the client-side logic approach for now to save complexity
    // ... wait, we need checkWinCondition which is server-side logic (or simulate it).

    // To properly do this, we should read, update, THEN check win.

    // For MVP efficiency: Client sends 'toggle' intent.
    // We can't easily do it without reading.
}

// Re-implementing a simpler task completion that accepts the NEW list
export async function updatePlayerTasks(lobbyId: string, playerId: string, tasks: Task[]) {
    const lobbyRef = doc(db, "lobbies", lobbyId);
    await updateDoc(lobbyRef, {
        [`players.${playerId}.tasks`]: tasks
    });

    // Check for win!
    await checkWinCondition(lobbyId);
}

interface TaskListProps {
    tasks: Task[];
    lobbyId: string;
    playerId: string;
    role: string;
}

export function TaskList({ tasks, lobbyId, playerId, role }: TaskListProps) {
    const [loadingId, setLoadingId] = useState<string | null>(null);

    const handleToggle = async (task: Task) => {
        if (role === 'imposter' || role === 'spectator') return; // Only crewmates do tasks
        if (loadingId) return;

        setLoadingId(task.id);

        // Simulate interaction time? Maybe not for IRL, they just check it off.
        // Let's optimize for speed.

        // Note: To update a specific item in an array in Firestore is hard without reading it.
        // A better schema for large scale is a subcollection for tasks.
        // For this prototype, we'll read tasks from props (which come from snapshot), 
        // update the local array, and write the whole array back.

        const newTasks = tasks.map(t =>
            t.id === task.id ? { ...t, completed: !t.completed } : t
        );

        try {
            // Update local state is handled by parent subscription basically, 
            // but we want optimistic update? simpler to just wait.
            await updatePlayerTasks(lobbyId, playerId, newTasks);
        } catch (e) {
            console.error("Failed to toggle task", e);
        } finally {
            setLoadingId(null);
        }
    };

    return (
        <div className="bg-zinc-900/80 rounded-xl p-4 border border-white/10 shadow-xl backdrop-blur-md">
            <h3 className="text-gray-400 font-mono text-xs uppercase tracking-widest mb-4 border-b border-white/10 pb-2">
                Task List
            </h3>
            <div className="space-y-3">
                {tasks.map((task) => (
                    <button
                        key={task.id}
                        onClick={() => handleToggle(task)}
                        disabled={role === 'imposter'}
                        className={cn(
                            "flex items-center w-full gap-3 p-3 rounded-lg border transition-all text-left",
                            task.completed
                                ? "bg-green-900/20 border-green-500/30 text-green-400"
                                : "bg-black/40 border-white/5 hover:bg-white/5 text-gray-300",
                            role === 'imposter' && "opacity-50 cursor-not-allowed"
                        )}
                    >
                        {loadingId === task.id ? (
                            <Loader2 className="w-5 h-5 animate-spin" />
                        ) : task.completed ? (
                            <CheckCircle2 className="w-5 h-5 text-green-500" />
                        ) : (
                            <Circle className="w-5 h-5 text-gray-500" />
                        )}

                        <div className="flex flex-col">
                            <span className={cn("font-bold text-sm", task.completed && "line-through opacity-70")}>
                                {task.description}
                            </span>
                            <span className="text-[10px] uppercase font-mono text-gray-500">
                                {task.roomId}
                            </span>
                        </div>
                    </button>
                ))}
            </div>
            {role === 'imposter' && (
                <div className="mt-4 p-2 bg-red-900/20 border border-red-500/20 rounded text-red-500 text-xs text-center font-mono">
                    FAKE TASKS - DO NOT ACTUALLY COMPLETE
                </div>
            )}
        </div>
    );
}
