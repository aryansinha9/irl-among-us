"use client";

import React, { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

type RoleType = "imposter" | "crewmate" | "jester" | "sheriff";

interface RoleRevealProps {
    role: RoleType;
    isOpen: boolean;
    onComplete?: () => void;
    customImage?: React.ReactNode;
}

import Image from "next/image";

// ... imports

const roleConfig = {
    imposter: {
        color: "text-role-imposter",
        bg: "bg-black/95",
        title: "IMPOSTOR",
        subtitle: "Eliminate the crewmates.",
        image: "/images/imposter.png"
    },
    crewmate: {
        color: "text-role-crewmate",
        bg: "bg-black/95",
        title: "CREWMATE",
        subtitle: "Complete tasks or find the imposter.",
        image: "/images/crewmate.png"
    },
    jester: {
        color: "text-role-jester",
        bg: "bg-black/95",
        title: "JESTER",
        subtitle: "Get voted out to win.",
        image: "/images/jester.png"
    },
    sheriff: {
        color: "text-role-sheriff",
        bg: "bg-black/95",
        title: "SHERIFF",
        subtitle: "Shoot the imposter.",
        image: "/images/sheriff.png"
    }
};

export function RoleReveal({ role, isOpen, onComplete, customImage }: RoleRevealProps) {
    const config = roleConfig[role];

    useEffect(() => {
        if (isOpen) {
            const timer = setTimeout(() => {
                onComplete?.();
            }, 4000); // 4 seconds reveal
            return () => clearTimeout(timer);
        }
    }, [isOpen, onComplete]);

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className={cn(
                        "fixed inset-0 z-50 flex flex-col items-center justify-center",
                        config.bg
                    )}
                >
                    <motion.div
                        initial={{ scale: 0.5, y: 50, opacity: 0 }}
                        animate={{ scale: 1, y: 0, opacity: 1 }}
                        transition={{ type: "spring", stiffness: 200, damping: 20, delay: 0.2 }}
                        className="text-center space-y-4"
                    >
                        <h2 className="text-3xl font-bold text-slate-200 tracking-widest uppercase">
                            Your Role
                        </h2>

                        <motion.h1
                            initial={{ scale: 1.5, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            transition={{ duration: 0.5, delay: 0.8 }}
                            className={cn("text-7xl font-black tracking-widest outline-text", config.color)}
                            style={{ padding: '0.2em' }} // Prevent clipping of large text
                        >
                            {config.title}
                        </motion.h1>

                        <motion.div
                            initial={{ x: -100, opacity: 0 }}
                            animate={{ x: 0, opacity: 1 }}
                            transition={{ delay: 1.2 }}
                            className="py-12 relative flex justify-center"
                        >
                            {customImage ? (
                                <div className="w-48 h-48 mx-auto flex items-center justify-center">
                                    {customImage}
                                </div>
                            ) : (
                                <div className="relative w-64 h-64">
                                    <Image
                                        src={config.image}
                                        alt={config.title}
                                        fill
                                        className="object-contain drop-shadow-[0_0_15px_rgba(255,255,255,0.2)]"
                                        priority
                                    />
                                </div>
                            )}
                        </motion.div>

                        <motion.p
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 1.8 }}
                            className={cn("text-2xl font-bold tracking-wide", config.color)}
                        >
                            {config.subtitle}
                        </motion.p>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
