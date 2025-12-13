import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { GameButton } from "@/components/ui/GameButton";
import { Input } from "@/components/ui/input";
import { createLobby, joinLobby, getLobbyPublicInfo, HOST_SKINS, PLAYER_SKINS } from "@/lib/game";
import { Loader2, ArrowLeft, Check, Lock, User } from "lucide-react";
import { cn } from "@/lib/utils";

export function JoinGameForm() {
    const router = useRouter();
    const { user } = useAuth();
    const [name, setName] = useState(user?.displayName || "");
    const [code, setCode] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");

    // Mode: 'initial' | 'host-setup' | 'player-setup'
    const [mode, setMode] = useState<'initial' | 'host-setup' | 'player-setup'>('initial');
    const [selectedSkin, setSelectedSkin] = useState<string | null>(null);
    const [takenSkins, setTakenSkins] = useState<string[]>([]);

    // Sync state if user loads late
    useEffect(() => {
        if (user?.displayName) {
            setName(user.displayName);
        }
    }, [user]);

    const handleCreateClick = () => {
        if (!name) return setError("Please enter your name");
        setError("");
        setMode('host-setup');
        setSelectedSkin(null);
    };

    const handleJoinClick = async () => {
        if (!name) return setError("Please enter your name");
        if (!code) return setError("Please enter a game code");
        setIsLoading(true);
        setError("");

        try {
            const info = await getLobbyPublicInfo(code);
            if (info) {
                setTakenSkins(info.takenSkins);
                setMode('player-setup');
                setSelectedSkin(null);
            }
        } catch (e: any) {
            setError(e.message || "Lobby not found");
        } finally {
            setIsLoading(false);
        }
    };

    const handleConfirmCreate = async () => {
        if (!selectedSkin) return setError("Select a skin");
        setIsLoading(true);
        try {
            const { lobbyId, playerId } = await createLobby(name, selectedSkin);
            localStorage.setItem("irl-among-us-player", JSON.stringify({ playerId, name, lobbyId }));
            router.push(`/game/${lobbyId}`);
        } catch (e) {
            console.error(e);
            setError("Failed to create lobby");
            setIsLoading(false);
        }
    };

    const handleConfirmJoin = async () => {
        if (!selectedSkin) return setError("Select a skin");
        setIsLoading(true);
        try {
            const { playerId } = await joinLobby(code, name, selectedSkin);
            localStorage.setItem("irl-among-us-player", JSON.stringify({ playerId, name, lobbyId: code }));
            router.push(`/game/${code.toUpperCase()}`);
        } catch (e: any) {
            console.error(e);
            setError(e.message || "Failed to join lobby");
            // If failed (e.g. skin taken), maybe refresh public info?
            setIsLoading(false);
        }
    };

    const renderSkinGrid = (skins: string[]) => (
        <div className="grid grid-cols-5 gap-2 max-h-60 overflow-y-auto p-2 bg-black/40 rounded-lg border border-slate-700">
            {skins.map(skin => {
                const isTaken = takenSkins.includes(skin);
                const isSelected = selectedSkin === skin;
                return (
                    <button
                        key={skin}
                        disabled={isTaken}
                        onClick={() => setSelectedSkin(skin)}
                        className={cn(
                            "relative aspect-square rounded-md border-2 overflow-hidden transition-all",
                            isSelected ? "border-green-500 scale-105 shadow-[0_0_15px_rgba(34,197,94,0.5)]" : "border-slate-600 hover:border-slate-400",
                            isTaken && "opacity-30 grayscale cursor-not-allowed border-red-900 bg-red-900/20"
                        )}
                        style={{
                            backgroundImage: `url(/characters/${skin}.png)`,
                            backgroundSize: 'cover',
                            backgroundPosition: 'center'
                        }}
                    >
                        {isTaken && <Lock className="absolute inset-0 m-auto w-6 h-6 text-red-500" />}
                        {isSelected && !isTaken && (
                            <div className="absolute inset-0 bg-green-500/20 flex items-center justify-center">
                                <Check className="w-6 h-6 text-green-400 drop-shadow-md" />
                            </div>
                        )}
                    </button>
                )
            })}
        </div>
    );

    if (mode === 'initial') {
        return (
            <div className="flex flex-col gap-4 w-full max-w-sm mx-auto p-6 bg-space-blue/80 backdrop-blur-md rounded-2xl border-2 border-slate-700 shadow-2xl relative overflow-hidden">
                <div className="flex flex-col gap-2">
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                        <User className="w-3 h-3" /> Identity
                    </label>
                    <Input
                        placeholder="ENTER NAME"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="h-12 text-lg font-bold tracking-wide text-center uppercase bg-space-black border-slate-600 text-slate-100 placeholder:text-slate-600 focus-visible:ring-role-crewmate"
                        maxLength={12}
                    />
                </div>

                <div className="flex flex-col gap-2 mt-2">
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Join Mission</label>
                    <div className="flex gap-2">
                        <Input
                            placeholder="CODE"
                            value={code}
                            onChange={(e) => setCode(e.target.value.toUpperCase())}
                            className="h-14 w-1/3 text-center font-mono font-bold uppercase tracking-widest text-xl bg-space-black border-slate-600 text-slate-100 placeholder:text-slate-600 focus-visible:ring-role-crewmate"
                            maxLength={4}
                        />
                        <GameButton
                            className="flex-1"
                            variant="primary"
                            onClick={handleJoinClick}
                            disabled={isLoading}
                        >
                            {isLoading ? <Loader2 className="animate-spin" /> : "ENTER CODE"}
                        </GameButton>
                    </div>
                </div>

                <div className="relative my-4">
                    <div className="absolute inset-0 flex items-center">
                        <span className="w-full border-t border-slate-700" />
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                        <span className="bg-space-blue px-2 text-slate-500 font-bold">Or</span>
                    </div>
                </div>

                <GameButton
                    variant="ghost"
                    className="w-full border-dashed"
                    onClick={handleCreateClick}
                    disabled={isLoading}
                >
                    HOST NEW GAME
                </GameButton>

                {error && (
                    <p className="text-role-imposter text-sm text-center font-black uppercase tracking-wide animate-pulse">{error}</p>
                )}
            </div>
        );
    }

    // Host or Player Setup View
    return (
        <div className="flex flex-col gap-4 w-full max-w-md mx-auto p-6 bg-space-blue/90 backdrop-blur-xl rounded-2xl border-2 border-slate-700 shadow-2xl relative">
            <div className="flex items-center gap-4 mb-2">
                <button onClick={() => setMode('initial')} className="p-2 hover:bg-white/10 rounded-full transition-colors">
                    <ArrowLeft className="w-5 h-5 text-slate-300" />
                </button>
                <h2 className="text-xl font-black uppercase tracking-widest text-white">
                    {mode === 'host-setup' ? "Select Host Skin" : "Select Crew Skin"}
                </h2>
            </div>

            {error && (
                <div className="bg-red-900/50 border border-red-500/50 p-2 rounded text-red-200 text-xs font-bold text-center uppercase tracking-wide">
                    {error}
                </div>
            )}

            {renderSkinGrid(mode === 'host-setup' ? HOST_SKINS : PLAYER_SKINS)}

            <div className="mt-4">
                <GameButton
                    variant={mode === 'host-setup' ? 'ghost' : 'primary'}
                    className="w-full h-16 text-xl"
                    onClick={mode === 'host-setup' ? handleConfirmCreate : handleConfirmJoin}
                    disabled={!selectedSkin || isLoading}
                >
                    {isLoading ? (
                        <Loader2 className="animate-spin" />
                    ) : (
                        mode === 'host-setup' ? "CREATE LOBBY" : "JOIN MISSION"
                    )}
                </GameButton>
            </div>
        </div>
    );
}
