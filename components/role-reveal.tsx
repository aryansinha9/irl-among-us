"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Role } from "@/types/game";
import { cn } from "@/lib/utils";

interface RoleRevealProps {
    role: Role;
    onComplete: () => void;
}

export function RoleReveal({ role, onComplete }: RoleRevealProps) {
    const [showRole, setShowRole] = useState(false);

    useEffect(() => {
        // Sequence: 
        // 0s: Black screen / shhh
        // 1s: Reveal Role
        // 4s: End
        const timer1 = setTimeout(() => setShowRole(true), 1000);
        const timer2 = setTimeout(() => onComplete(), 5000); // 4 seconds of glory

        return () => {
            clearTimeout(timer1);
            clearTimeout(timer2);
        };
    }, [onComplete]);

    const isImposter = role === "imposter";
    const color = isImposter ? "text-red-500" : role === "crewmate" ? "text-cyan-400" : "text-purple-400";
    const bgGradient = isImposter
        ? "from-red-900/50 to-black"
        : role === "crewmate"
            ? "from-cyan-900/50 to-black"
            : "from-purple-900/50 to-black";

    return (
        <div className={cn("fixed inset-0 z-50 flex flex-col items-center justify-center bg-black transition-colors duration-1000", showRole && `bg-gradient-to-br ${bgGradient}`)}>
            <motion.div
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{ scale: showRole ? 1 : 0.5, opacity: showRole ? 1 : 0 }}
                transition={{ duration: 0.5, type: "spring", bounce: 0.5 }}
                className="flex flex-col items-center text-center gap-4"
            >
                <h1 className="text-gray-400 font-mono text-xl tracking-[0.5em] uppercase">Role Assigned</h1>
                <div className={cn("text-5xl md:text-8xl font-black uppercase tracking-tighter drop-shadow-[0_0_30px_rgba(0,0,0,0.8)]", color)}>
                    {role}
                </div>

                {isImposter ? (
                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 1.5 }}
                        className="text-red-300 font-bold mt-8 text-xl"
                    >
                        Kill everyone. Do not get caught.
                    </motion.p>
                ) : (
                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 1.5 }}
                        className="text-cyan-200 font-bold mt-8 text-xl"
                    >
                        Complete tasks. Find the Imposter.
                    </motion.p>
                )}
            </motion.div>
        </div>
    );
}
