import React, { useState, useRef, useEffect, useCallback } from 'react';
import chroma from 'chroma-js';

// --- Helper Functions ---
const componentToHex = (c: number): string => {
  const hex = c.toString(16);
  return hex.length === 1 ? "0" + hex : hex;
};

const rgbToHex = (r: number, g: number, b: number): string => {
  return `#${componentToHex(r)}${componentToHex(g)}${componentToHex(b)}`;
};

// --- Types ---
interface AppColorData {
    hex: string;
    rgb: string;
    name: string;
    r: number;
    g: number;
    b: number;
}

// --- UI Components ---

interface CrosshairProps {
    position: { x: number; y: number };
    isFrozen: boolean;
}

const Crosshair: React.FC<CrosshairProps> = ({ position, isFrozen }) => (
    <div 
        className="absolute -translate-x-1/2 -translate-y-1/2 pointer-events-none z-20 transition-transform duration-200 ease-in-out" 
        style={{ left: `${position.x * 100}%`, top: `${position.y * 100}%` }}
        aria-hidden="true"
    >
        <div className={`w-10 h-10 rounded-full border-2 bg-transparent shadow-lg flex items-center justify-center ${isFrozen ? 'border-cyan-400' : 'border-white/75'}`}>
            <div className={`w-1.5 h-1.5 rounded-full ${isFrozen ? 'bg-cyan-400' : 'bg-white/75'}`}></div>
        </div>
    </div>
);

interface ColorInfoPanelProps {
    colorData: AppColorData | null;
}

const ColorInfoPanel: React.FC<ColorInfoPanelProps> = ({ colorData }) => {
    const defaultColor: AppColorData = { 
        name: 'Aim at a color', 
        hex: '#2d3748', 
        rgb: 'rgb(45, 55, 72)', 
        r: 45, g: 55, b: 72 
    };
    
    const displayData = colorData || defaultColor;
    const transitionClasses = "transition-colors duration-500 ease-in-out";

    return (
        <div 
            className="absolute bottom-0 left-0 right-0 p-4 bg-gray-900/80 backdrop-blur-md rounded-t-2xl shadow-2xl z-30"
            role="status"
            aria-live="polite"
            aria-atomic="true"
        >
            <div className="flex flex-col sm:flex-row items-center gap-5">
                <div 
                    style={{ backgroundColor: displayData.hex }} 
                    className={`w-24 h-24 rounded-2xl border-4 border-white/50 shrink-0 ${transitionClasses}`}
                    aria-label={`Color swatch for ${displayData.name}`}
                />
                <div className="flex flex-col justify-center min-w-0 text-center sm:text-left w-full">
                    <h1 className="text-3xl lg:text-4xl font-bold tracking-tight text-white truncate" aria-label={`Color name: ${displayData.name}`}>
                        {displayData.name}
                    </h1>
                    <p className="text-base text-gray-300 mt-1.5 font-mono">
                        {displayData.rgb} &bull; {displayData.hex.toUpperCase()}
                    </p>
                </div>
            </div>
        </div>
    );
};


interface CameraControlsProps {
    isCameraOn: boolean;
    isFrozen: boolean;
    onToggleCamera: () => void;
    onToggleFreeze: () => void;
}

const CameraControls: React.FC<CameraControlsProps> = ({ isCameraOn, isFrozen, onToggleCamera, onToggleFreeze }) => {
    return (
        <div className="absolute bottom-48 sm:bottom-44 left-1/2 -translate-x-1/2 flex items-center gap-4 z-30 bg-black/40 p-3 rounded-full backdrop-blur-sm pointer-events-auto">
            <button 
                onClick={onToggleCamera} 
                className={`w-14 h-14 rounded-full flex items-center justify-center transition-colors ${isCameraOn ? 'bg-red-600 hover:bg-red-700' : 'bg-green-600 hover:bg-green-700'} text-white`}
                aria-label={isCameraOn ? 'Turn camera off' : 'Turn camera on'}
            >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zM4 10a1 1 0 01-1-1H2a1 1 0 110-2h1a1 1 0 011 1zM16 10a1 1 0 01-1-1h-1a1 1 0 110-2h1a1 1 0 011 1zM9 16a1 1 0 112 0v1a1 1 0 11-2 0v-1zM4.226 5.636a1 1 0 011.414-1.414l.707.707a1 1 0 01-1.414 1.414l-.707-.707zM14.364 15.774a1 1 0 01-1.414 1.414l-.707-.707a1 1 0 011.414-1.414l.707.707zM15.774 4.226a1 1 0 011.414 1.414l-.707.707a1 1 0 01-1.414-1.414l.707-.707zM5.636 14.364a1 1 0 011.414-1.414l.707.707a1 1 0 01-1.414 1.414l-.707-.707zM10 6a4 4 0 100 8 4 4 0 000-8z" />
                </svg>
            </button>
            {isCameraOn && (
                <button 
                    onClick={onToggleFreeze} 
                    className="w-14 h-14 rounded-full flex items-center justify-center bg-sky-500 hover:bg-sky-600 text-white transition-colors"
                    aria-label={isFrozen ? 'Resume live view' : 'Freeze frame'}
                >
                    {isFrozen ? (
                         <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" viewBox="0 0 20 20" fill="currentColor">
                           <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                         </svg>
                    ) : (
                         <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" viewBox="0 0 20 20" fill="currentColor">
                           <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8 7a1 1 0 00-1 1v4a1 1 0 001 1h4a1 1 0 001-1V8a1 1 0 00-1-1H8z" clipRule="evenodd" />
                         </svg>
                    )}
                </button>
            )}
        </div>
    );
};


export const App: React.FC = () => {
    const videoRef = useRef<HTMLVideoElement>(null);
    const freezeFrameCanvasRef = useRef<HTMLCanvasElement>(null);
    const samplingCanvasRef = useRef<HTMLCanvasElement>(null);
    
    const [colorData, setColorData] = useState<AppColorData | null>(null);
    const [isCameraOn, setIsCameraOn] = useState(false);
    const [isFrozen, setIsFrozen] = useState(false);
    const [crosshairPosition, setCrosshairPosition] = useState({ x: 0.5, y: 0.5 });
    const [isStartingCamera, setIsStartingCamera] = useState(false);
    const streamRef = useRef<MediaStream | null>(null);

    const stopCamera = useCallback(() => {
        if (streamRef.current) {
            streamRef.current.getTracks().forEach(track => track.stop());
            streamRef.current = null;
        }
        if (videoRef.current) {
            videoRef.current.srcObject = null;
        }
        setIsCameraOn(false);
        setIsFrozen(false);
    }, []);

    const startCamera = useCallback(async () => {
        if (isCameraOn) return;
        setIsStartingCamera(true);
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ 
                video: { 
                    facingMode: 'environment',
                    width: { ideal: 1920 },
                    height: { ideal: 1080 }
                } 
            });
            streamRef.current = stream;
            if (videoRef.current) {
                videoRef.current.srcObject = stream;
                videoRef.current.onloadedmetadata = () => {
                    videoRef.current?.play();
                    setIsCameraOn(true);
                    setIsStartingCamera(false);
                };
            }
        } catch (err) {
            console.error("Error accessing camera:", err);
            setIsStartingCamera(false);
        }
    }, [isCameraOn]);
    
    const handleToggleCamera = useCallback(() => {
      if (isCameraOn) {
        stopCamera();
      } else {
        startCamera();
      }
    }, [isCameraOn, startCamera, stopCamera]);

    const captureColor = useCallback(() => {
        let source: CanvasImageSource | null = null;
        let sourceWidth = 0;
        let sourceHeight = 0;

        if (isFrozen && freezeFrameCanvasRef.current) {
            source = freezeFrameCanvasRef.current;
            sourceWidth = source.width;
            sourceHeight = source.height;
        } else if (!isFrozen && videoRef.current && videoRef.current.readyState >= 2) {
            source = videoRef.current;
            sourceWidth = source.videoWidth;
            sourceHeight = source.videoHeight;
        }

        if (!source || sourceWidth === 0 || sourceHeight === 0 || !samplingCanvasRef.current) {
            return;
        }

        const samplingContext = samplingCanvasRef.current.getContext('2d', { willReadFrequently: true });
        if (!samplingContext) return;

        const sampleSize = 5;
        const halfSampleSize = Math.floor(sampleSize / 2);
        const centerX = isFrozen ? crosshairPosition.x * sourceWidth : sourceWidth / 2;
        const centerY = isFrozen ? crosshairPosition.y * sourceHeight : sourceHeight / 2;
        const sx = Math.round(Math.max(0, Math.min(centerX - halfSampleSize, sourceWidth - sampleSize)));
        const sy = Math.round(Math.max(0, Math.min(centerY - halfSampleSize, sourceHeight - sampleSize)));
        samplingCanvasRef.current.width = sampleSize;
        samplingCanvasRef.current.height = sampleSize;
        samplingContext.drawImage(source, sx, sy, sampleSize, sampleSize, 0, 0, sampleSize, sampleSize);
        const pixelData = samplingContext.getImageData(0, 0, sampleSize, sampleSize).data;

        let totalR = 0, totalG = 0, totalB = 0;
        const pixelCount = sampleSize * sampleSize;

        for (let i = 0; i < pixelData.length; i += 4) {
            totalR += pixelData[i];
            totalG += pixelData[i + 1];
            totalB += pixelData[i + 2];
        }

        const r = Math.round(totalR / pixelCount);
        const g = Math.round(totalG / pixelCount);
        const b = Math.round(totalB / pixelCount);

        if (isNaN(r) || isNaN(g) || isNaN(b)) return;

        const hex = rgbToHex(r, g, b);
        let colorName = '';
        
        try {
            colorName = chroma(hex).name();
        } catch (e) {
            // This is expected. Chroma.js throws an error if no close color name is found.
            // We'll leave colorName empty and use the hex code as a fallback.
        }

        // Capitalize each word in the name (e.g., "light blue" becomes "Light Blue").
        // If no name was found, use the hex value as the primary display name.
        const displayName = colorName
            ? colorName.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')
            : hex.toUpperCase();

        setColorData({
            hex,
            rgb: `rgb(${r}, ${g}, ${b})`,
            name: displayName,
            r, g, b,
        });
    }, [isFrozen, crosshairPosition]);

    const handleToggleFreeze = useCallback(() => {
        const video = videoRef.current;
        const canvas = freezeFrameCanvasRef.current;
        if (!video || !canvas) return;

        setIsFrozen(prev => {
            const nextIsFrozen = !prev;
            if (nextIsFrozen) {
                video.pause();
                canvas.width = video.videoWidth;
                canvas.height = video.videoHeight;
                const context = canvas.getContext('2d');
                context?.drawImage(video, 0, 0, canvas.width, canvas.height);
                setCrosshairPosition({ x: 0.5, y: 0.5 });
                setTimeout(captureColor, 0); 
            } else {
                video.play();
            }
            return nextIsFrozen;
        });
    }, [captureColor]);

    const handleCanvasClick = useCallback((event: React.MouseEvent<HTMLCanvasElement>) => {
        if (!isFrozen) return;
        const canvas = event.currentTarget;
        const rect = canvas.getBoundingClientRect();
        const x = (event.clientX - rect.left) / rect.width;
        const y = (event.clientY - rect.top) / rect.height;
        setCrosshairPosition({ x, y });
    }, [isFrozen]);

    useEffect(() => {
        if (isCameraOn && !isFrozen) {
            const intervalId = setInterval(captureColor, 100);
            return () => clearInterval(intervalId);
        }
    }, [isCameraOn, isFrozen, captureColor]);

    useEffect(() => {
        if (isFrozen) {
            captureColor();
        }
    }, [crosshairPosition, isFrozen, captureColor]);

    return (
        <div className="relative w-screen h-screen overflow-hidden bg-black select-none">
            <video
                ref={videoRef}
                playsInline
                className={`w-full h-full object-cover transition-opacity duration-300 ${isCameraOn ? 'opacity-100' : 'opacity-0'}`}
                aria-label="Live camera feed"
            ></video>
            
            <canvas 
                ref={freezeFrameCanvasRef} 
                className={`w-full h-full object-contain absolute inset-0 transition-opacity duration-200 ${isFrozen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
                onClick={handleCanvasClick}
            ></canvas>
            
            <canvas ref={samplingCanvasRef} width="1" height="1" className="hidden"></canvas>
            
            {isCameraOn && <Crosshair position={crosshairPosition} isFrozen={isFrozen} />}
            
            <div className="absolute inset-0 z-30 pointer-events-none">
              <div className="relative w-full h-full">
                <ColorInfoPanel colorData={colorData} />
                {isCameraOn && <CameraControls isCameraOn={isCameraOn} isFrozen={isFrozen} onToggleCamera={handleToggleCamera} onToggleFreeze={handleToggleFreeze} />}
              </div>
            </div>
            
            {isStartingCamera && (
                <div className="absolute inset-0 bg-gray-900/80 flex flex-col items-center justify-center text-white z-40">
                    <svg className="animate-spin h-8 w-8 text-white mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <p className="text-lg">Starting camera...</p>
                </div>
            )}
             {!isCameraOn && !isStartingCamera && (
                <div className="absolute inset-0 bg-gray-900 flex flex-col items-center justify-center text-white z-20">
                     <button onClick={handleToggleCamera} className="bg-green-600 hover:bg-green-700 text-white font-bold py-4 px-6 rounded-full flex items-center gap-3 text-lg transition-transform hover:scale-105">
                         <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                           <path strokeLinecap="round" strokeLinejoin="round" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                         </svg>
                         Start Camera
                     </button>
                </div>
            )}
        </div>
    );
};
