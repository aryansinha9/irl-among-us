import { LoginForm } from "@/components/auth/login-form";

export default function LoginPage() {
    return (
        <div className="min-h-screen flex items-center justify-center bg-[#09090b] relative overflow-hidden">
            {/* Background Stars Effect - simple CSS implementation or we could use a canvas later */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute w-1 h-1 bg-white rounded-full top-1/4 left-1/4 animate-pulse shadow-[0_0_10px_white]"></div>
                <div className="absolute w-1 h-1 bg-blue-300 rounded-full top-3/4 left-1/3 animate-pulse delay-75"></div>
                <div className="absolute w-0.5 h-0.5 bg-white rounded-full top-1/2 left-1/2 animate-pulse delay-150"></div>
                <div className="absolute w-1 h-1 bg-red-400 rounded-full top-1/3 left-2/3 animate-pulse delay-300"></div>
                <div className="absolute w-0.5 h-0.5 bg-white rounded-full top-2/3 left-3/4 animate-pulse delay-500"></div>
            </div>

            <div className="relative z-10 w-full px-4">
                <div className="mb-12 text-center animate-in fade-in zoom-in duration-1000">
                    {/* Placeholder for Logo */}
                    <div className="text-6xl font-black text-transparent bg-clip-text bg-gradient-to-br from-red-500 to-red-800 drop-shadow-[0_0_15px_rgba(239,68,68,0.5)] tracking-tighter mb-4">
                        AMONG US
                    </div>
                    <div className="text-xl text-slate-400 tracking-[0.5em] uppercase font-light">
                        In Real Life
                    </div>
                </div>

                <LoginForm />
            </div>
        </div>
    );
}
