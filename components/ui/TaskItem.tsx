import React from "react";
import { cn } from "@/lib/utils";
import { CheckCircle2, Circle } from "lucide-react";

interface TaskItemProps {
    description: string;
    completed: boolean;
    className?: string;
    onClick?: () => void;
}

export function TaskItem({
    description,
    completed,
    className,
    onClick
}: TaskItemProps) {
    return (
        <div
            onClick={onClick}
            className={cn(
                "flex items-center gap-4 p-4 rounded-lg bg-black/40 border-l-4 transition-all w-full",
                completed
                    ? "border-green-500 bg-green-900/10"
                    : "border-slate-500 hover:bg-slate-800/50 cursor-pointer",
                className
            )}
        >
            <div className={cn("flex-shrink-0 transition-colors", completed ? "text-green-500" : "text-slate-500")}>
                {completed ? <CheckCircle2 className="w-6 h-6" /> : <Circle className="w-6 h-6" />}
            </div>

            <span className={cn(
                "font-bold uppercase tracking-wider text-sm md:text-base transition-all",
                completed ? "text-green-400 line-through decoration-green-500/50" : "text-slate-200"
            )}>
                {description}
            </span>
        </div>
    );
}
