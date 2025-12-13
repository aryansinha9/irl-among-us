import { useEffect, useRef, useState } from "react";
import { X } from "lucide-react";

interface IntroOverlayProps {
    src: string;
    onComplete: () => void;
}

export function IntroOverlay({ src, onComplete }: IntroOverlayProps) {
    const videoRef = useRef<HTMLVideoElement>(null);
    const [hasInteracted, setHasInteracted] = useState(false);

    useEffect(() => {
        if (videoRef.current) {
            // Attempt autoplay
            videoRef.current.play().catch(err => {
                console.log("Autoplay blocked, waiting for interaction", err);
            });
        }
    }, []);

    return (
        <div className="fixed inset-0 z-[100] bg-black flex items-center justify-center">
            <video
                ref={videoRef}
                src={src}
                className="w-full h-full object-contain"
                playsInline
                autoPlay
                onEnded={onComplete}
                onClick={(e) => {
                    // Ensure play on click if restricted
                    const v = e.currentTarget;
                    if (v.paused) v.play();
                }}
            />

            <button
                onClick={onComplete}
                className="absolute top-4 right-4 text-white/50 hover:text-white p-2"
            >
                <X className="w-8 h-8" />
            </button>
        </div>
    );
}
