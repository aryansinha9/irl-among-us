import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const gameButtonVariants = cva(
    "inline-flex items-center justify-center whitespace-nowrap rounded-xl text-lg font-bold uppercase tracking-wider ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 active:translate-y-[4px] active:shadow-none border-b-[6px] active:border-b-0",
    {
        variants: {
            variant: {
                primary: "bg-slate-100 text-slate-900 border-slate-300 hover:bg-white shadow-sm",
                danger: "bg-red-600 text-white border-red-800 hover:bg-red-500",
                warning: "bg-yellow-500 text-slate-900 border-yellow-700 hover:bg-yellow-400",
                ghost: "bg-transparent border-2 border-slate-700 text-slate-200 hover:bg-slate-800 hover:text-white border-b-2 active:translate-y-[2px]",
                action: "bg-transparent border-4 border-slate-400 text-slate-100 hover:bg-slate-800/50 rounded-full h-24 w-24 p-0 flex-col gap-1 text-[10px] leading-tight", // For Kill/Sabotage grid buttons
            },
            size: {
                default: "h-14 px-8 py-2",
                sm: "h-10 rounded-lg px-4 text-sm border-b-[4px]",
                lg: "h-16 rounded-2xl px-10 text-xl border-b-[8px]",
                icon: "h-14 w-14",
            },
        },
        defaultVariants: {
            variant: "primary",
            size: "default",
        },
    }
)

export interface GameButtonProps
    extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof gameButtonVariants> {
    asChild?: boolean
}

const GameButton = React.forwardRef<HTMLButtonElement, GameButtonProps>(
    ({ className, variant, size, asChild = false, ...props }, ref) => {
        return (
            <button
                className={cn(gameButtonVariants({ variant, size, className }))}
                ref={ref}
                {...props}
            />
        )
    }
)
GameButton.displayName = "GameButton"

export { GameButton, gameButtonVariants }
