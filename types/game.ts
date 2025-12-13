export type Role = 'crewmate' | 'imposter' | 'jester' | 'sheriff' | 'spectator';

export type PlayerStatus = 'alive' | 'dead' | 'disconnected';

export interface Task {
  id: string;
  description: string;
  roomId: string; // e.g., 'Kitchen', 'Admin'
  completed: boolean;
}

export interface Player {
  id: string;
  name: string;
  color: string; // Deprecated but kept for fallback or unique ID purposes? Or effectively replaced by image.
  characterImage: string; // URL path
  role: 'imposter' | 'crewmate' | 'spectator' | 'jester' | 'sheriff';
  isHost: boolean;
  status: 'alive' | 'dead';
  isDead: boolean; // Computed helper
  tasks: Task[];
  hasVoted?: boolean;
  votedFor?: string | null; // playerId or 'skip'
}

export interface Lobby {
  id: string; // 4-6 character code
  hostId: string;
  status: 'waiting' | 'playing' | 'meeting' | 'ended';
  createdAt: number; // Timestamp
  settings: {
    numImposters: number;
    roles: {
      jester: boolean;
      sheriff: boolean;
    };
    discussionTime: number; // Seconds
    votingTime: number; // Seconds
  };
  players: Record<string, Player>; // Map of playerId -> Player

  // Game State
  meeting: Meeting | null;
  sabotage: {
    lights: boolean; // true = lights on, false = lights off/sabotaged
  } | null;
  winner?: 'crewmate' | 'imposter' | 'jester';
  winReason?: string;
  showIntro?: boolean;
}

export interface Meeting {
  callerId: string;
  reason: 'body' | 'emergency';
  startedAt: number;
  discussionEndAt: number;
  votingEndAt: number;
  votes: Record<string, string | 'skip'>; // [voterId]: candidateId
  result?: {
    ejectedId: string | null;
    method: 'vote' | 'tie' | 'skip';
  };
}
