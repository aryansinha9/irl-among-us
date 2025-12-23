import { db } from "./firebase";
import {
    collection,
    doc,
    setDoc,
    getDoc,
    updateDoc,
    arrayUnion,
    serverTimestamp,
    addDoc,
    increment,
    onSnapshot
} from "firebase/firestore";
import { Lobby, Player, Meeting } from "@/types/game";
import { assignTasks } from "./tasks";


// Cosmetic Colors Palette (Safe colors that don't imply role)
const COSMETIC_COLORS = [
    "#dc2626", // Red
    "#2563eb", // Blue
    "#16a34a", // Green
    "#d946ef", // Pink
    "#f97316", // Orange
    "#eab308", // Yellow
    "#7c3aed", // Violet
    "#db2777", // Magenta
    "#0891b2", // Cyan
    "#84cc16", // Lime
    "#78716c", // Stone
    "#f43f5e", // Rose
];

// Defined Skin Pools
export const HOST_SKINS = [
    "char_1", "char_2", "char_3", "char_4", "char_5", "char_6", "char_7", "char_8",
    "char_14", "char_15", "char_20", "char_22", "char_23"
];

export const PLAYER_SKINS = [
    "char_9", "char_10", "char_11", "char_12", "char_13",
    "char_16", "char_17", "char_18", "char_19", "char_21"
];

export const ALLOWED_HOSTS = [
    "aryansinha575@gmail.com",
    "aryansinha8424@gmail.com",
    "systemsananta@gmail.com",
    "antonygaballah@gmail.com"
];

const CHARACTER_IMAGES = [...HOST_SKINS, ...PLAYER_SKINS].map(id => `/characters/${id}.png`);

// Generate a random 4-letter code
function generateLobbyCode(): string {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    let result = "";
    for (let i = 0; i < 4; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
}

function getRandomColor(takenColors: string[] = []): string {
    const available = COSMETIC_COLORS.filter(c => !takenColors.includes(c));
    if (available.length === 0) return COSMETIC_COLORS[Math.floor(Math.random() * COSMETIC_COLORS.length)];
    return available[Math.floor(Math.random() * available.length)];
}

export async function getLobbyPublicInfo(lobbyId: string) {
    const lobbyRef = doc(db, "lobbies", lobbyId.toUpperCase());
    const snap = await getDoc(lobbyRef);
    if (!snap.exists()) throw new Error("Lobby not found");

    const data = snap.data() as Lobby;
    const players = Object.values(data.players);

    return {
        takenSkins: players.map(p => p.characterImage?.split('/').pop()?.replace('.png', '') || ""),
        takenColors: players.map(p => p.color),
        playerCount: players.length,
        status: data.status
    };
}

export async function createLobby(hostName: string, skinId: string): Promise<{ lobbyId: string; playerId: string }> {
    const lobbyId = generateLobbyCode();
    const lobbyRef = doc(db, "lobbies", lobbyId);
    const playerId = crypto.randomUUID();

    // Create Host Player
    const hostPlayer: Player = {
        id: playerId,
        name: hostName,
        color: getRandomColor(),
        characterImage: `/characters/${skinId}.png`,
        role: "spectator", // Assigned later
        status: "alive",
        isDead: false,
        tasks: [],
        isHost: true,
        hasVoted: false,
        votedFor: null
    };

    const newLobby: Lobby = {
        id: lobbyId,
        hostId: playerId,
        status: "waiting",
        createdAt: Date.now(),
        settings: {
            numImposters: 1, // Default
            roles: {
                jester: false,
                sheriff: false
            },
            discussionTime: 30,
            votingTime: 120
        },
        meeting: null,
        sabotage: null,
        players: {
            [playerId]: hostPlayer
        }
    };


    // Add timeout race
    const timeout = new Promise((_, reject) =>
        setTimeout(() => reject(new Error("Connection timed out. Check your internet or Firebase rules.")), 5000)
    );

    await Promise.race([
        setDoc(lobbyRef, newLobby),
        timeout
    ]);

    return { lobbyId, playerId };
}

export async function joinLobby(lobbyId: string, playerName: string, skinId: string): Promise<{ playerId: string }> {
    const lobbyRef = doc(db, "lobbies", lobbyId.toUpperCase());

    const timeout = new Promise((_, reject) =>
        setTimeout(() => reject(new Error("Connection timed out. Check your internet or Firebase rules.")), 5000)
    );

    const lobbySnap = await Promise.race([
        getDoc(lobbyRef),
        timeout
    ]) as any; // Type casting for the race result

    if (!lobbySnap.exists()) {
        throw new Error("Lobby not found");
    }

    const currentPlayers = lobbySnap.data().players || {};
    const takenColors = Object.values(currentPlayers).map((p: any) => p.color);

    // Check if skin is taken (double check)
    const takenSkins = Object.values(currentPlayers).map((p: any) => p.characterImage);
    if (takenSkins.includes(`/characters/${skinId}.png`)) {
        throw new Error("Skin already taken");
    }

    const playerId = crypto.randomUUID();
    const newPlayer: Player = {
        id: playerId,
        name: playerName,
        color: getRandomColor(takenColors),
        characterImage: `/characters/${skinId}.png`,
        role: "spectator",
        status: "alive",
        isDead: false,
        tasks: [],
        isHost: false,
        hasVoted: false,
        votedFor: null
    };

    await updateDoc(lobbyRef, {
        [`players.${playerId}`]: newPlayer
    });

    return { playerId };
}

export async function kickPlayer(lobbyId: string, playerId: string) {
    const lobbyRef = doc(db, "lobbies", lobbyId.toUpperCase());
    // We use deleteField() to remove the key from the map
    // Import deleteField from firestore if not present?
    // Actually we can just read, delete, update or use the FieldValue.delete() sentinel.
    // Let's assume we can use updateDoc with dotted notation and deleteField().
    // But wait, deleteField needs import. I'll add it to imports later if needed, 
    // or just read-modify-write for safety/simplicity in this codebase context.
    // Read-Modify-Write is safer without ensuring deleteField import.

    const snap = await getDoc(lobbyRef);
    if (!snap.exists()) return;
    const data = snap.data();
    const players = { ...data.players };
    delete players[playerId];

    await updateDoc(lobbyRef, {
        players: players
    });
}

export async function triggerIntro(lobbyId: string) {
    const lobbyRef = doc(db, "lobbies", lobbyId.toUpperCase());
    await updateDoc(lobbyRef, {
        showIntro: true
    });
}

export async function startGame(lobbyId: string, settings?: Lobby['settings']) {
    const lobbyRef = doc(db, "lobbies", lobbyId.toUpperCase());
    const lobbySnap = await getDoc(lobbyRef);

    if (!lobbySnap.exists()) throw new Error("Lobby not found");

    const lobby = lobbySnap.data() as Lobby;
    // Update settings if provided
    const matchSettings = settings || lobby.settings;

    const allPlayerIds = Object.keys(lobby.players);
    // Exclude Host
    const playableIds = allPlayerIds.filter(id => id !== lobby.hostId);

    // Fisher-Yates Shuffle
    for (let i = playableIds.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [playableIds[i], playableIds[j]] = [playableIds[j], playableIds[i]];
    }

    const updates: Record<string, any> = {
        status: 'playing',
        startedAt: serverTimestamp(),
        settings: matchSettings // Save final settings
    };

    // Keep Host as Spectator/Admin
    updates[`players.${lobby.hostId}.role`] = 'spectator';
    updates[`players.${lobby.hostId}.status`] = 'alive'; // Techncially they are just "there"

    let currentIndex = 0;

    // Assign Imposters
    // Relaxed cap: Allow exact number requested, capped effectively by total players (minus host)
    const imposterCount = Math.min(matchSettings.numImposters, playableIds.length);
    for (let i = 0; i < imposterCount; i++) {
        if (currentIndex >= playableIds.length) break;
        const pid = playableIds[currentIndex++];
        updates[`players.${pid}.role`] = 'imposter';
        updates[`players.${pid}.tasks`] = assignTasks(5);
    }

    // Assign Jester
    if (matchSettings.roles.jester && currentIndex < playableIds.length) {
        const pid = playableIds[currentIndex++];
        updates[`players.${pid}.role`] = 'jester';
        updates[`players.${pid}.tasks`] = assignTasks(5);
    }

    // Assign Sheriff
    if (matchSettings.roles.sheriff && currentIndex < playableIds.length) {
        const pid = playableIds[currentIndex++];
        updates[`players.${pid}.role`] = 'sheriff';
        updates[`players.${pid}.tasks`] = assignTasks(5);
    }

    // Assign Crewmates
    while (currentIndex < playableIds.length) {
        const pid = playableIds[currentIndex++];
        updates[`players.${pid}.role`] = 'crewmate';
        updates[`players.${pid}.tasks`] = assignTasks(5);
    }

    await updateDoc(lobbyRef, updates);
}

export async function resetLobby(lobbyId: string) {
    const lobbyRef = doc(db, "lobbies", lobbyId.toUpperCase());
    const lobbySnap = await getDoc(lobbyRef);
    if (!lobbySnap.exists()) return;

    const lobby = lobbySnap.data() as Lobby;

    // Reset to waiting state
    const updates: Record<string, any> = {
        status: 'waiting',
        startedAt: null,
        meeting: null,
        winner: null,
        winReason: null,
        sabotage: null,
        showIntro: false // Reset intro flag so it doesn't play again
    };

    // Reset ALL player states based on current players
    Object.keys(lobby.players).forEach(pid => {
        updates[`players.${pid}.role`] = 'spectator';
        updates[`players.${pid}.status`] = 'alive';
        updates[`players.${pid}.isDead`] = false;
        updates[`players.${pid}.tasks`] = [];
        updates[`players.${pid}.hasVoted`] = false;
        updates[`players.${pid}.votedFor`] = null;
    });

    await updateDoc(lobbyRef, updates);
}

export async function reportBody(lobbyId: string, reporterId: string) {
    const lobbyRef = doc(db, "lobbies", lobbyId.toUpperCase());
    const lobbySnap = await getDoc(lobbyRef);
    if (!lobbySnap.exists()) return;
    const lobby = lobbySnap.data() as Lobby;

    const discussionEnd = Date.now() + (lobby.settings.discussionTime * 1000);
    const votingEnd = discussionEnd + (lobby.settings.votingTime * 1000);

    await updateDoc(lobbyRef, {
        status: 'meeting',
        meeting: {
            callerId: reporterId,
            reason: 'body',
            startedAt: Date.now(),
            discussionEndAt: discussionEnd,
            votingEndAt: votingEnd,
            votes: {}
        }
    });
}

export async function callEmergency(lobbyId: string, callerId: string) {
    const lobbyRef = doc(db, "lobbies", lobbyId);
    const lobby = (await getDoc(lobbyRef)).data() as Lobby;

    // Use customized discussion/voting times
    const discussionEnd = Date.now() + (lobby.settings.discussionTime * 1000);
    const votingEnd = discussionEnd + (lobby.settings.votingTime * 1000);

    const meeting: Meeting = {
        callerId,
        reason: "emergency",
        startedAt: Date.now(),
        discussionEndAt: discussionEnd,
        votingEndAt: votingEnd,
        votes: {}
    };

    // TODO: Check if caller has used their emergency
    await updateDoc(lobbyRef, {
        status: 'meeting',
        meeting: meeting
    });
}

export async function completeTask(lobbyId: string, playerId: string, taskIndex: number) {
    const lobbyRef = doc(db, "lobbies", lobbyId.toUpperCase());
    const lobbySnap = await getDoc(lobbyRef);
    if (!lobbySnap.exists()) return;

    // We can't update array item directly by index easily in Firestore without fetching 
    // or using arrayRemove/Union which requires the exact object.
    // So we fetch, modify, and update the whole tasks array.
    const player = lobbySnap.data().players[playerId];
    if (!player || !player.tasks) return;

    const newTasks = [...player.tasks];
    if (newTasks[taskIndex]) {
        newTasks[taskIndex].completed = !newTasks[taskIndex].completed;
    }

    await updateDoc(lobbyRef, {
        [`players.${playerId}.tasks`]: newTasks
    });

    await checkWinCondition(lobbyId, undefined, 'task');
}

// --- Win Conditions ---

// type: 'all' | 'task'
export async function checkWinCondition(lobbyId: string, lobbyOriginal?: Lobby, type: 'all' | 'task' = 'all') {
    const lobbyRef = doc(db, "lobbies", lobbyId.toUpperCase());

    // Fetch fresh if needed, or use provided
    let lobby = lobbyOriginal;
    if (!lobby) {
        const snap = await getDoc(lobbyRef);
        if (!snap.exists()) return;
        lobby = snap.data() as Lobby;
    }

    const players = Object.values(lobby.players);
    const totalPlayers = players.filter(p => p.role !== 'spectator');
    const activePlayers = totalPlayers.filter(p => !p.isDead); // Alive players

    const activeImposters = activePlayers.filter(p => p.role === 'imposter');
    const activeCrewmates = activePlayers.filter(p => p.role !== 'imposter' && p.role !== 'jester');

    // Check total imposters (including dead) to see if any existed at start
    const totalImposters = totalPlayers.filter(p => p.role === 'imposter').length;

    // Check Crewmate Task Win
    // Remaining tasks across all VALID crewmates (alive or dead, but not spectator/imposter)
    // Note: If a crewmate dies, their tasks still count? Usually in Among Us yes, ghosts do tasks.
    // Our logic below filters tasks from "players.filter...". 
    // We should include ALL non-imposter non-spectator players.

    const crewTasksRemaining = players
        .filter(p => p.role !== 'imposter' && p.role !== 'spectator' && p.role !== 'jester')
        .flatMap(p => p.tasks || [])
        .filter(t => !t.completed).length;

    let winner: 'crewmate' | 'imposter' | 'jester' | null = null;
    let reason = "";

    // 1. Crewmate Win: No Imposters Left (MUST have had imposters to begin with)
    if (type === 'all' && activeImposters.length === 0 && totalImposters > 0) {
        winner = 'crewmate';
        reason = "All Imposters Eliminated";
    }
    // 2. Crewmate Win: Tasks Done
    else if (crewTasksRemaining === 0 && totalPlayers.some(p => p.role === 'crewmate')) { // Ensure there are crewmates
        winner = 'crewmate';
        reason = "Tasks Completed";
    }
    // 3. Imposter Win: Majority (Skip on 'task' check to allow small test lobbies to run)
    // Only possible if there ARE imposters
    else if (type === 'all' && activeImposters.length > 0 && activeImposters.length >= activeCrewmates.length) {
        winner = 'imposter';
        reason = "Imposter Majority";
    }

    if (winner) {
        await updateDoc(lobbyRef, {
            status: 'ended',
            winner,
            winReason: reason
        });
    }
}

// Update actions to trigger check
export async function eliminatePlayer(lobbyId: string, playerId: string) {
    const lobbyRef = doc(db, "lobbies", lobbyId);

    await updateDoc(lobbyRef, {
        [`players.${playerId}.status`]: 'dead',
        [`players.${playerId}.isDead`]: true
    });

    // Check win after death
    await checkWinCondition(lobbyId);
}

export async function castVote(lobbyId: string, playerId: string, targetId: string | null) {
    const lobbyRef = doc(db, "lobbies", lobbyId.toUpperCase());
    await updateDoc(lobbyRef, {
        [`players.${playerId}.hasVoted`]: true,
        [`players.${playerId}.votedFor`]: targetId,
    });
}

// Used for admin to bypass discussion
export async function skipDiscussion(lobbyId: string) {
    const lobbyRef = doc(db, "lobbies", lobbyId.toUpperCase());
    await updateDoc(lobbyRef, {
        "meeting.discussionEndAt": Date.now()
    });
}

export async function endMeeting(lobbyId: string, lobby: Lobby) {
    const lobbyRef = doc(db, "lobbies", lobbyId.toUpperCase());
    const players = Object.values(lobby.players);

    // Tally votes - ONLY submitted votes count
    const votes: Record<string, number> = {};
    let skips = 0;
    let totalVotes = 0;

    players.forEach(p => {
        if (p.status !== 'dead' && p.hasVoted) {
            totalVotes++;
            if (p.votedFor === 'skip') {
                skips++;
            } else if (p.votedFor) {
                votes[p.votedFor] = (votes[p.votedFor] || 0) + 1;
            }
        }
    });

    // If no votes at all, default to skip (nobody ejected)
    if (totalVotes === 0) {
        await updateDoc(lobbyRef, {
            'meeting.result': {
                ejectedId: null,
                method: 'skip'
            }
        });
        return;
    }

    let maxVotes = 0;
    let ejectedId: string | null = null;
    let isTie = false;

    // Compare Candidate Votes
    Object.entries(votes).forEach(([pid, count]) => {
        if (count > maxVotes) {
            maxVotes = count;
            ejectedId = pid;
            isTie = false;
        } else if (count === maxVotes) {
            isTie = true;
        }
    });

    // Valid Vote Logic:
    // If skips > maxVotes -> Skip
    // If Tie (and maxVotes > skips) -> Tie (Skip)
    // Else -> Eject

    // Note: The user said "Only votes submitted count". We did that. 
    // "Any players who did not submit a vote are simply treated as having voted for nobody." (Ignored).

    if (skips >= maxVotes) {
        ejectedId = null; // Skip wins or ties with max
    } else if (isTie) {
        ejectedId = null; // Tie between candidates
    }

    // Update Game State
    const updates: Record<string, any> = {
        'meeting.result': {
            ejectedId,
            method: ejectedId ? 'vote' : (isTie ? 'tie' : 'skip')
        },
    };

    if (ejectedId) {
        updates[`players.${ejectedId}.status`] = 'dead';
        updates[`players.${ejectedId}.isDead`] = true;

        // Jester Win Check
        if (players.find(p => p.id === ejectedId)?.role === 'jester') {
            updates.status = 'ended';
            updates.winner = 'jester';
            updates.winReason = "Jester Ejected";
        }
    }

    await updateDoc(lobbyRef, updates);

    // If not already ended by Jester, check standard conditions (ALL conditions)
    if (!updates.winner) {
        await checkWinCondition(lobbyRef.id);
    }
}

export async function resumeGame(lobbyId: string) {
    const lobbyRef = doc(db, "lobbies", lobbyId.toUpperCase());
    const lobbySnap = await getDoc(lobbyRef);
    if (!lobbySnap.exists()) return;

    const lobby = lobbySnap.data() as Lobby;
    const updates: Record<string, any> = {
        status: 'playing',
        meeting: null
    };

    // Reset player voting states
    Object.keys(lobby.players).forEach(pid => {
        updates[`players.${pid}.hasVoted`] = false;
        updates[`players.${pid}.votedFor`] = null;
    });

    await updateDoc(lobbyRef, updates);
}

export async function triggerSabotage(lobbyId: string) {
    const lobbyRef = doc(db, "lobbies", lobbyId.toUpperCase());
    // We merge to keep existing lights state
    await updateDoc(lobbyRef, {
        "sabotage.lightsFlash": true
    });
}

export async function resolveSabotage(lobbyId: string) {
    const lobbyRef = doc(db, "lobbies", lobbyId.toUpperCase());
    await updateDoc(lobbyRef, {
        "sabotage.lightsFlash": false
    });
}
