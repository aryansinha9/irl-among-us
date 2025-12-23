import { useState } from "react";
import { IDCardScanner } from "@/components/game/IDCardScanner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { X, CheckCircle2, AlertCircle, Activity } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface MedbayTaskViewProps {
    onComplete: () => void;
    onCancel: () => void;
    playerColor: string;
}

// Map file names (char_x) to color names used in validation
// TODO: Update this map to match your specific character assets
const SKIN_TO_COLOR_MAP: Record<string, string> = {
    // Host Skins (char_1-9, 15, 22, 23) but user gave specific mapping for colours.
    // I will map what the user provided, and map others to default or infer.
    // User Provided:
    "char_11": "red",
    "char_16": "pink",
    "char_17": "orange",
    "char_18": "yellow",
    "char_13": "green",
    "char_19": "black",
    "char_12": "blue",
    "char_20": "grey",
    "char_14": "santa",
    "char_21": "purple",
    // Fallback for others if they are used as colors:
    // (We should probably have covered all PLAYER skins except 10)
    // PLAYER SKINS: 10, 11, 12, 13, 14, 16, 17, 18, 19, 20, 21, 23
    // User missed char_10 -> 'brown'? char_23 -> 'santa' was moved to player so maybe char_23 is old santa?
    // Wait, user said "Santa (char_14)". In previous turns I moved char_23 to player as Santa.
    // Now user says char_14 is Santa. I should trust this new mapping.
    // char_10? Let's just map it to 'brown' or 'default'.
    "char_10": "brown"
};

const VALIDATION_DATA: Record<string, { heartRate: string, crewId: string }> = {
    "default": { heartRate: "80", crewId: "1234" },
    "red": { crewId: "49276-RED", heartRate: "72" },
    "pink": { crewId: "95271-PINK", heartRate: "75" },
    "orange": { crewId: "30586-ORANGE", heartRate: "70" },
    "yellow": { crewId: "29863-YELLOW", heartRate: "80" },
    "green": { crewId: "57692-GREEN", heartRate: "74" },
    "black": { crewId: "70519-BLACK", heartRate: "62" },
    "blue": { crewId: "18435-BLUE", heartRate: "68" },
    "grey": { crewId: "62957-GREY", heartRate: "65" },
    // "white": { crewId: "62957-GREY", heartRate: "65" }, // Removed alias if not needed, Grey covers it
    "santa": { crewId: "62957-SANTA", heartRate: "78" },
    "purple": { crewId: "11148-PURPLE", heartRate: "66" },
    "brown": { crewId: "00000-BROWN", heartRate: "70" } // Fallback for char_10
};

export function MedbayTaskView({ onComplete, onCancel, playerColor }: MedbayTaskViewProps) {
    const [step, setStep] = useState<"scan" | "input" | "success">("scan");
    const [heartRate, setHeartRate] = useState("");
    const [crewId, setCrewId] = useState("");
    const [error, setError] = useState<string | null>(null);

    const handleScanComplete = () => {
        setStep("input");
    };

    const validateAndSubmit = () => {
        const rawColor = playerColor.toLowerCase();
        // Try mapped color, then raw color (e.g. if 'red' is passed directly)
        const colorKey = SKIN_TO_COLOR_MAP[rawColor] || rawColor;
        const targetData = VALIDATION_DATA[colorKey] || VALIDATION_DATA["default"];

        // Check if input matches
        if (heartRate.trim() === targetData.heartRate && crewId.trim() === targetData.crewId) {
            setStep("success");
            setTimeout(onComplete, 1500);
        } else {
            setError("Invalid data.");
        }
    };

    if (step === "scan") {
        return <IDCardScanner onComplete={handleScanComplete} onCancel={onCancel} />;
    }

    return (
        <div className="fixed inset-0 z-50 bg-black/95 flex flex-col items-center justify-center p-4">
            <div className="w-full max-w-md bg-slate-900 border-2 border-slate-700 rounded-xl p-6 relative shadow-2xl">
                {/* Close Button */}
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={onCancel}
                    className="absolute top-2 right-2 text-slate-400 hover:text-white"
                >
                    <X className="w-6 h-6" />
                </Button>

                <AnimatePresence mode="wait">
                    {step === "input" ? (
                        <motion.div
                            key="input-form"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            className="space-y-6"
                        >
                            <div className="text-center space-y-2">
                                <Activity className="w-12 h-12 text-blue-500 mx-auto animate-pulse" />
                                <h2 className="text-2xl font-bold text-white tracking-wider uppercase">Submit Scan</h2>
                                <p className="text-slate-400 text-sm">Enter patient data from the medical report.</p>
                            </div>

                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="heartRate" className="text-slate-300">Heart Rate (BPM)</Label>
                                    <Input
                                        id="heartRate"
                                        type="number"
                                        placeholder="e.g. 80"
                                        value={heartRate}
                                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                                            setHeartRate(e.target.value);
                                            setError(null);
                                        }}
                                        className="bg-slate-950 border-slate-700 text-white placeholder:text-slate-600 font-mono text-lg"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="crewId" className="text-slate-300">Crew ID</Label>
                                    <Input
                                        id="crewId"
                                        type="text"
                                        placeholder="e.g. 12345-COLOR"
                                        value={crewId}
                                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                                            setCrewId(e.target.value.toUpperCase()); // Auto upcase
                                            setError(null);
                                        }}
                                        className="bg-slate-950 border-slate-700 text-white placeholder:text-slate-600 font-mono text-lg uppercase"
                                    />
                                </div>
                            </div>

                            {error && (
                                <div className="p-3 bg-red-900/30 border border-red-500/50 rounded flex items-center gap-2 text-red-400 text-sm">
                                    <AlertCircle className="w-5 h-5 flex-shrink-0" />
                                    <span>{error}</span>
                                </div>
                            )}

                            <Button
                                onClick={validateAndSubmit}
                                className="w-full h-12 bg-green-600 hover:bg-green-500 text-white font-bold uppercase tracking-wider text-lg"
                            >
                                Submit Data
                            </Button>
                        </motion.div>
                    ) : (
                        <motion.div
                            key="success"
                            initial={{ scale: 0.8, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            className="flex flex-col items-center justify-center py-10 space-y-4"
                        >
                            <CheckCircle2 className="w-24 h-24 text-green-500" />
                            <h2 className="text-3xl font-black text-white uppercase tracking-widest">Complete</h2>
                            <p className="text-green-400 font-mono">Data Verified</p>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}
