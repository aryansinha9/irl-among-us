import { useState, useEffect } from "react";
import { doc, onSnapshot } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Lobby, Player } from "@/types/game";
import { useRouter } from "next/navigation";

export function useGame(lobbyId: string) {
    const [lobby, setLobby] = useState<Lobby | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const router = useRouter();

    // Get current player from local storage
    const [me, setMe] = useState<Player | null>(null);

    useEffect(() => {
        if (!lobbyId) return;

        // Load local player data
        try {
            const stored = localStorage.getItem("irl-among-us-player");
            if (stored) {
                const { playerId, lobbyId: storedLobbyId } = JSON.parse(stored);
                if (storedLobbyId !== lobbyId) {
                    // Trying to join a different lobby? 
                    // For now, assume if they hit this URL they want this lobby.
                    // We'll see if they exist in the lobby snapshot.
                }
            }
        } catch (e) {
            console.error("Error parsing local player", e);
        }

        const unsub = onSnapshot(doc(db, "lobbies", lobbyId.toUpperCase()),
            (doc) => {
                if (doc.exists()) {
                    const lobbyData = doc.data() as Lobby;
                    setLobby(lobbyData);

                    // Verify we are in the lobby
                    const stored = localStorage.getItem("irl-among-us-player");
                    if (stored) {
                        const { playerId } = JSON.parse(stored);
                        const player = lobbyData.players[playerId];
                        if (player) {
                            setMe(player);
                        } else {
                            // We aren't in the player list? Maybe kicked?
                            setError("You are not in this lobby.");
                        }
                    } else {
                        setError("No session found. Please join from home.");
                    }
                } else {
                    setError("Lobby not found");
                }
                setLoading(false);
            },
            (err) => {
                console.error(err);
                setError("Failed to connect to game.");
                setLoading(false);
            }
        );

        return () => unsub();
    }, [lobbyId]);

    return { lobby, me, loading, error };
}
