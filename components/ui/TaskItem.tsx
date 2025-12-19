import React from "react";
import { cn } from "@/lib/utils";
import { CheckCircle2, Circle, ChevronDown } from "lucide-react";

interface TaskItemProps {
    description: string;
    details?: string;
    completed: boolean;
    className?: string;
    onClick?: () => void;
}

export function TaskItem({
    description,
    details,
    completed,
    className,
    onClick
}: TaskItemProps) {
    const [isExpanded, setIsExpanded] = React.useState(false);

    return (
        <div className="flex flex-col w-full">
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

                <div className="flex flex-col flex-1">
                    <span className={cn(
                        "font-bold uppercase tracking-wider text-sm md:text-base transition-all",
                        completed ? "text-green-400 line-through decoration-green-500/50" : "text-slate-200"
                    )}>
                        {description}
                    </span>
                </div>

                {!completed && details && (
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            setIsExpanded(!isExpanded);
                        }}
                        className="p-1 hover:bg-white/10 rounded-full transition-colors"
                    >
                        <ChevronDown className={cn(
                            "w-5 h-5 text-slate-400 transition-transform duration-200",
                            isExpanded && "rotate-180"
                        )} />
                    </button>
                )}
            </div>

            {/* Expanded Details Panel */}
            {isExpanded && !completed && details && (
                <div className="ml-4 mr-4 p-3 bg-slate-900/80 border-l-2 border-slate-700 text-slate-300 text-sm animate-in slide-in-from-top-2">
                    {details}
                </div>
            )}
        </div>
    );
}
