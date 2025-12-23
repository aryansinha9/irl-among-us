"use client";

import React, { useRef, useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Check, X, Camera, ScanLine } from "lucide-react";
import { cn } from "@/lib/utils";

interface IDCardScannerProps {
    onComplete: () => void;
    onCancel: () => void;
}

export function IDCardScanner({ onComplete, onCancel }: IDCardScannerProps) {
    const videoRef = useRef<HTMLVideoElement>(null);
    const [stream, setStream] = useState<MediaStream | null>(null);
    const [scanning, setScanning] = useState(false);
    const [progress, setProgress] = useState(0);
    const [capturedImage, setCapturedImage] = useState<string | null>(null);
    const [isComplete, setIsComplete] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        startCamera();
        return () => stopCamera();
    }, []);

    const startCamera = async () => {
        try {
            const mediaStream = await navigator.mediaDevices.getUserMedia({
                video: { facingMode: "user" }
            });
            setStream(mediaStream);
            if (videoRef.current) {
                videoRef.current.srcObject = mediaStream;
            }
        } catch (err) {
            console.error("Error accessing camera:", err);
            setError("Camera access denied or unavailable.");
        }
    };

    const stopCamera = () => {
        if (stream) {
            stream.getTracks().forEach(track => track.stop());
            setStream(null);
        }
    };

    const handleScan = () => {
        if (videoRef.current) {
            // Capture frame simulation (just freeze essentially)
            const canvas = document.createElement("canvas");
            canvas.width = videoRef.current.videoWidth;
            canvas.height = videoRef.current.videoHeight;
            const ctx = canvas.getContext("2d");
            ctx?.drawImage(videoRef.current, 0, 0);
            setCapturedImage(canvas.toDataURL("image/png"));

            stopCamera(); // Stop live feed
            setScanning(true);
        }
    };

    useEffect(() => {
        let interval: NodeJS.Timeout;
        if (scanning && progress < 100) {
            const duration = 20000; // 20 seconds
            const step = 100 / (duration / 100); // Update every 100ms

            interval = setInterval(() => {
                setProgress(prev => {
                    if (prev >= 100) {
                        clearInterval(interval);
                        setIsComplete(true);
                        setTimeout(onComplete, 1500); // Wait a bit after completion before closing
                        return 100;
                    }
                    return prev + step;
                });
            }, 100);
        }
        return () => clearInterval(interval);
    }, [scanning]);

    return (
        <div className="fixed inset-0 z-50 bg-black flex flex-col items-center justify-center p-4">
            <div className="relative w-full max-w-md aspect-[3/4] bg-neutral-900 rounded-3xl overflow-hidden border-4 border-neutral-800 shadow-2xl">

                {/* Camera View / Captured Image */}
                {capturedImage ? (
                    <img src={capturedImage} alt="Captured ID" className="w-full h-full object-cover opacity-50" />
                ) : (
                    <video
                        ref={videoRef}
                        autoPlay
                        playsInline
                        muted
                        className="w-full h-full object-cover"
                    />
                )}

                {/* Overlays */}
                <div className="absolute inset-0 flexflex-col justify-between p-6 pointer-events-none">

                    {/* Header */}
                    <div className="flex justify-between items-start pointer-events-auto">
                        <h2 className="text-white font-bold tracking-wider drop-shadow-md">SCAN ID CARD</h2>
                        <Button variant="ghost" size="icon" onClick={onCancel} className="text-white hover:bg-white/20">
                            <X className="w-6 h-6" />
                        </Button>
                    </div>

                    {/* Scanning Animation */}
                    {scanning && !isComplete && (
                        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                            <motion.div
                                animate={{ top: ["10%", "90%", "10%"] }}
                                transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                                className="absolute w-full h-1 bg-green-500/80 shadow-[0_0_15px_rgba(34,197,94,0.8)]"
                            />
                            <div className="bg-black/60 backdrop-blur-md px-6 py-3 rounded-full border border-green-500/30">
                                <span className="text-green-400 font-mono animate-pulse">ANALYSING... {Math.floor(progress)}%</span>
                            </div>
                        </div>
                    )}

                    {/* Success State */}
                    {isComplete && (
                        <div className="absolute inset-0 bg-green-500/20 backdrop-blur-sm flex items-center justify-center animate-in fade-in duration-300">
                            <motion.div
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                transition={{ type: "spring" }}
                                className="bg-white rounded-full p-4 shadow-xl"
                            >
                                <Check className="w-12 h-12 text-green-600" />
                            </motion.div>
                        </div>
                    )}

                    {/* Controls */}
                    {!scanning && (
                        <div className="absolute bottom-8 left-0 right-0 flex justify-center pointer-events-auto">
                            {error ? (
                                <div className="bg-red-500/80 px-4 py-2 rounded text-white text-sm text-center mx-4">
                                    {error}
                                </div>
                            ) : (
                                <Button
                                    size="lg"
                                    className="h-16 w-16 rounded-full border-4 border-white bg-transparent hover:bg-white/20 transition-all active:scale-95"
                                    onClick={handleScan}
                                >
                                    <div className="w-12 h-12 bg-white rounded-full" />
                                </Button>
                            )}
                        </div>
                    )}
                </div>

                {/* Guide Frame */}
                {!scanning && !capturedImage && (
                    <div className="absolute inset-0 border-[3px] border-white/30 m-8 rounded-xl pointer-events-none flex items-center justify-center">
                        <p className="text-white/50 text-sm font-medium tracking-widest uppercase mb-32">Align Card Here</p>
                    </div>
                )}
            </div>
        </div>
    );
}
