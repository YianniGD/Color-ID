import React, { useState, useRef, useEffect, useCallback } from 'react';
import chroma from 'chroma-js';
import { colord, extend } from 'colord';
import namesPlugin from 'colord/plugins/names';

// Extend colord with the names plugin
extend([namesPlugin]);

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
                {/* NEW CAMERA OFF ICON */}
                <svg id="Layer_2" data-name="Layer 2" xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" viewBox="0 0 42.58 39.31">
                  <defs>
                    <style dangerouslySetInnerHTML={{ __html: `
                      .cls-1 {
                        fill: #f2f2f2;
                        isolation: isolate;
                      }
                    ` }} />
                  </defs>
                  <g id="Layer_1-2" data-name="Layer 1">
                    <g id="ui_buttonCircle_light">
                      <path class="cls-1" d="M21.29,10.06c5.23.06,9.43,4.35,9.37,9.59,0,0,0,0,0,0,0,1.11-.19,2.21-.56,3.25l5.08,5.08c2.85-2.07,5.35-4.58,7.41-7.44,0,0-8.09-13.99-21.19-13.99-2.21.01-4.39.41-6.46,1.18l2.98,2.98c1.08-.43,2.22-.65,3.38-.66ZM21.29,29.25c-5.23-.06-9.43-4.35-9.37-9.59,0,0,0,0,0,0,0-1.11.19-2.21.56-3.25l-4.62-4.61c-3.07,2.48-5.72,5.43-7.86,8.74,0,0,8.29,12.22,21.39,12.22,2.18,0,4.35-.35,6.43-1.02l-3.14-3.14c-1.08.43-2.22.65-3.38.66ZM26.33,18.01c0-.96-.78-1.73-1.74-1.74-.3,0-.6.1-.85.27l2.33,2.33c.16-.26.25-.56.26-.86ZM1.88,1.4L3.04.24c.32-.32.84-.32,1.16,0l36.51,36.51c.32.32.32.84,0,1.16l-1.16,1.16c-.32.32-.84.32-1.16,0L1.88,2.56c-.32-.32-.32-.84,0-1.16Z"/>
                    </g>
                  </g>
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
        let colorName: string | undefined = '';

        try {
            // Attempt to get the color name using colord
            colorName = colord(hex).toName();
        } catch (e) {
            // if colord fails or doesn't find a name, it might throw or return undefined
            // console.warn("Could not find color name with colord:", e);
            colorName = undefined; // Ensure it's undefined if an error occurs
        }

        // If colord didn't find a name, try with chroma-js as a fallback
        if (!colorName) {
            try {
                colorName = chroma(hex).name();
            } catch (e) {
                // This is expected if chroma-js also doesn't find a close color name.
                // We'll leave colorName undefined/empty and use the hex code as a fallback.
                // console.warn("Chroma.js also couldn't find a name for:", hex);
            }
        }

        // Capitalize each word in the name (e.g., "light blue" becomes "Light Blue").
        // If no name was found by either library, use the hex value as the primary display name.
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
                         {/* NEW CAMERA ON ICON */}
                         <svg id="Layer_2" data-name="Layer 2" xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 42.58 26.2">
                           <defs>
                             <style dangerouslySetInnerHTML={{ __html: `
                               .cls-1 {
                                 fill: #f2f2f2;
                                 fill-rule: evenodd;
                                 isolation: isolate;
                               }
                             ` }} />
                           </defs>
                           <g id="Layer_1-2" data-name="Layer 1">
                             <g id="ui_buttonCircle_light">
                               <path class="cls-1" d="M22.89,11.46c0-.95.75-1.73,1.7-1.74,0,0,0,0,0,0,.96,0,1.73.78,1.74,1.74,0,.95-.76,1.73-1.72,1.74,0,0-.01,0-.02,0-.94,0-1.7-.75-1.7-1.69,0-.01,0-.03,0-.04ZM0,13.99s8.29,12.22,21.39,12.22,21.19-12.22,21.19-12.22c0,0-8.09-13.99-21.19-13.99S0,13.99,0,13.99ZM11.92,13.1c.12-5.17,4.42-9.27,9.59-9.14s9.27,4.42,9.14,9.59c-.12,5.09-4.28,9.14-9.37,9.14-5.23-.06-9.43-4.35-9.37-9.59,0,0,0,0,0,0Z"/>
                             </g>
                           </g>
                         </svg>
                         Start Camera
                     </button>
                </div>
            )}
        </div>
    );
};
