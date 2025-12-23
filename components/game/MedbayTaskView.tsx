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

// TODO: Replace with actual user-provided mapping
const VALIDATION_DATA: Record<string, { heartRate: string, crewId: string }> = {
    // Default fallback if color not found or for testing
    "default": { heartRate: "80", crewId: "1234" },
    "red": { heartRate: "80", crewId: "1234" },
    "blue": { heartRate: "75", crewId: "5678" }
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
        const normalizedColor = playerColor.toLowerCase();
        const targetData = VALIDATION_DATA[normalizedColor] || VALIDATION_DATA["default"];

        if (heartRate.trim() === targetData.heartRate && crewId.trim() === targetData.crewId) {
            setStep("success");
            setTimeout(onComplete, 1500);
        } else {
            setError("Incorrect data. Please check crew records.");
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
                                        type="number"
                                        placeholder="e.g. 1234"
                                        value={crewId}
                                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                                            setCrewId(e.target.value);
                                            setError(null);
                                        }}
                                        className="bg-slate-950 border-slate-700 text-white placeholder:text-slate-600 font-mono text-lg"
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
