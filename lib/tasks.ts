import { Task } from "@/types/game";

export const TASK_TEMPLATES = [
    {
        id: "t1",
        description: "Card Swipe",
        details: "Locate your ID card, proceed to Admin, and correctly enter your ID details on the console.",
        roomId: "Admin",
        type: 'id-scan'
    },
    {
        id: "t8",
        description: "Submit Scan",
        details: "Proceed to Medbay, scan the medical report, and enter the patient data to complete the diagnosis.",
        roomId: "Medbay",
        type: 'medbay-scan'
    },
    {
        id: "t2",
        description: "Download Data",
        details: "Download the data in the starting room and deliver it to the designated location to upload.",
        roomId: "Admin"
    },
    {
        id: "t3",
        description: "Stabilise Reactor",
        details: "Complete the reactor stabilisation puzzle accurately.",
        roomId: "Reactor"
    },

    {
        id: "t5",
        description: "Fix Wiring",
        details: "Match and connect the corresponding coloured wires correctly.",
        roomId: "Electrical"
    },
    {
        id: "t6",
        description: "Secure the Ship",
        details: "Use the navigation map to locate the vault, crack the passcode, retrieve the key, restore power, and gain access to the cockpit.",
        roomId: "Navigation"
    },
];

export function assignTasks(count: number = 4): Task[] {
    // Randomly select tasks
    const shuffled = [...TASK_TEMPLATES].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, count).map(t => {
        const task: Task = {
            ...t,
            // Ensure we don't pass undefined 'type' to Firestore
            ...((t as any).type ? { type: (t as any).type } : {}),
            completed: false
        };
        return task;
    });
}
