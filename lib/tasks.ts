import { Task } from "@/types/game";

export const TASK_TEMPLATES = [
    { id: "t1", description: "Swipe Card", roomId: "Admin" },
    { id: "t2", description: "Download Data", roomId: "Cafeteria" },
    { id: "t3", description: "Fix Wiring", roomId: "Electrical" },
    { id: "t4", description: "Empty Garbage", roomId: "Storage" },
    { id: "t5", description: "Fuel Engines", roomId: "Lower Engine" },
    { id: "t6", description: "Align Engine Output", roomId: "Upper Engine" },
    { id: "t7", description: "Inspect Sample", roomId: "MedBay" },
    { id: "t8", description: "Submit Scan", roomId: "MedBay" },
    { id: "t9", description: "Unlock Manifolds", roomId: "Reactor" },
    { id: "t10", description: "Start Reactor", roomId: "Reactor" },
];

export function assignTasks(count: number = 4): Task[] {
    // Randomly select tasks
    const shuffled = [...TASK_TEMPLATES].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, count).map(t => ({
        ...t,
        completed: false
    }));
}
