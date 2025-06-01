// // import { useState, useRef, useEffect } from "react";
// // import { Mic, Activity, VolumeX, Volume2, RefreshCw } from "lucide-react";

// // export default function AIConsultation() {
// //   const [prompt, setPrompt] = useState("");
// //   const [audioUrl, setAudioUrl] = useState(null);
// //   const [isLoading, setIsLoading] = useState(false);
// //   const [isListening, setIsListening] = useState(false);
// //   const [isMuted, setIsMuted] = useState(false);
// //   const [activeTab, setActiveTab] = useState("voice");
// //   const [replyText, setReplyText] = useState("");
// //   const audioRef = useRef(null);
// //   const canvasRef = useRef(null);
// //   const animationRef = useRef(null);
// //   const audioContextRef = useRef(null);
// //   const sourceNodeRef = useRef(null);
// //   const analyserRef = useRef(null);
// //   const api = import.meta.env.VITE_API_BASE_URL;

// //   // Audio visualization setup
// //   useEffect(() => {
// //     // Clean up previous resources
// //     cleanup();

// //     if (!canvasRef.current) return;

// //     // Set up idle animation if no audio URL is available
// //     if (!audioUrl) {
// //       startIdleAnimation();
// //       return;
// //     }

// //     // Create new audio context for visualization
// //     const AudioContext = window.AudioContext || window.webkitAudioContext;
// //     audioContextRef.current = new AudioContext();
// //     analyserRef.current = audioContextRef.current.createAnalyser();
// //     analyserRef.current.fftSize = 512;

// //     const audio = audioRef.current;
// //     if (!audio) return;

// //     const handleCanPlay = () => {
// //       try {
// //         sourceNodeRef.current =
// //           audioContextRef.current.createMediaElementSource(audio);
// //         sourceNodeRef.current.connect(analyserRef.current);
// //         analyserRef.current.connect(audioContextRef.current.destination);
// //         startVisualization();
// //         audio.removeEventListener("canplay", handleCanPlay);
// //       } catch (err) {
// //         console.error("Audio setup error:", err);
// //       }
// //     };

// //     if (audio.readyState >= 2) {
// //       handleCanPlay();
// //     } else {
// //       audio.addEventListener("canplay", handleCanPlay);
// //     }

// //     // Resume the audio context if it was suspended
// //     if (audioContextRef.current.state === "suspended") {
// //       audioContextRef.current.resume();
// //     }

// //     return cleanup;
// //   }, [audioUrl]);

// //   const cleanup = () => {
// //     if (animationRef.current) {
// //       cancelAnimationFrame(animationRef.current);
// //       animationRef.current = null;
// //     }

// //     if (sourceNodeRef.current) {
// //       sourceNodeRef.current.disconnect();
// //       sourceNodeRef.current = null;
// //     }

// //     if (audioContextRef.current) {
// //       audioContextRef.current.close().catch(console.error);
// //       audioContextRef.current = null;
// //     }
// //   };

// //   const startIdleAnimation = () => {
// //     if (!canvasRef.current) return;

// //     const canvas = canvasRef.current;
// //     const ctx = canvas.getContext("2d");

// //     // Set canvas dimensions to match container
// //     canvas.width = canvas.offsetWidth;
// //     canvas.height = canvas.offsetHeight;

// //     const renderIdleFrame = () => {
// //       animationRef.current = requestAnimationFrame(renderIdleFrame);

// //       ctx.clearRect(0, 0, canvas.width, canvas.height);

// //       const time = Date.now() * 0.001;
// //       const centerX = canvas.width / 2;
// //       const centerY = canvas.height / 2;

// //       // Create multiple breathing circles with different phases
// //       for (let i = 0; i < 5; i++) {
// //         const phase = i * (Math.PI / 3);
// //         const size = Math.sin(time + phase) * 20 + 100 - i * 15;
// //         const opacity = 0.06 - i * 0.01;

// //         ctx.beginPath();
// //         ctx.arc(centerX, centerY, size, 0, 2 * Math.PI);
// //         ctx.fillStyle = `rgba(125, 80, 255, ${opacity})`;
// //         ctx.fill();
// //       }

// //       // Animated wave at the bottom
// //       drawWavyLine(ctx, canvas, time);
// //     };

// //     renderIdleFrame();
// //   };

// //   const drawWavyLine = (ctx, canvas, time) => {
// //     const amplitude = 15;
// //     const frequency = 0.02;
// //     const y = canvas.height * 0.8;

// //     ctx.beginPath();
// //     ctx.moveTo(0, y);

// //     for (let x = 0; x < canvas.width; x++) {
// //       const yOffset = Math.sin(x * frequency + time) * amplitude;
// //       ctx.lineTo(x, y + yOffset);
// //     }

// //     ctx.lineTo(canvas.width, canvas.height);
// //     ctx.lineTo(0, canvas.height);
// //     ctx.closePath();

// //     const gradient = ctx.createLinearGradient(0, y, 0, canvas.height);
// //     gradient.addColorStop(0, "rgba(125, 80, 255, 0.2)");
// //     gradient.addColorStop(1, "rgba(125, 80, 255, 0.05)");
// //     ctx.fillStyle = gradient;
// //     ctx.fill();
// //   };

// //   const startVisualization = () => {
// //     if (!canvasRef.current || !analyserRef.current) return;

// //     const canvas = canvasRef.current;
// //     const ctx = canvas.getContext("2d");
// //     const analyser = analyserRef.current;

// //     // Set canvas dimensions to match container
// //     canvas.width = canvas.offsetWidth;
// //     canvas.height = canvas.offsetHeight;

// //     const bufferLength = analyser.frequencyBinCount;
// //     const dataArray = new Uint8Array(bufferLength);

// //     const renderFrame = () => {
// //       animationRef.current = requestAnimationFrame(renderFrame);

// //       analyser.getByteFrequencyData(dataArray);

// //       ctx.clearRect(0, 0, canvas.width, canvas.height);

// //       // Background glow
// //       const time = Date.now() * 0.0005;
// //       const breathSize = Math.sin(time) * 30 + 150;

// //       ctx.beginPath();
// //       ctx.arc(canvas.width / 2, canvas.height / 2, breathSize, 0, 2 * Math.PI);
// //       ctx.fillStyle = "rgba(125, 80, 255, 0.06)";
// //       ctx.fill();

// //       // Main frequency waveform
// //       const barWidth = Math.max(2, (canvas.width / bufferLength) * 2);
// //       const baseY = canvas.height / 2;
// //       let x = 0;

// //       ctx.beginPath();

// //       // Draw mirrored frequency bars for a more aesthetic waveform
// //       for (let i = 0; i < bufferLength; i++) {
// //         const percent = i / bufferLength;
// //         const barHeight = (dataArray[i] / 255) * (canvas.height / 3);

// //         // Apply a fade out effect towards the edges
// //         const edgeFade = 1 - Math.pow(Math.abs(percent - 0.5) * 2, 1.5);
// //         const scaledHeight = barHeight * edgeFade;

// //         // Draw top wave
// //         const xPos = x + barWidth / 2;

// //         if (i === 0) {
// //           ctx.moveTo(xPos, baseY - scaledHeight);
// //         } else {
// //           ctx.lineTo(xPos, baseY - scaledHeight);
// //         }

// //         x += barWidth;
// //       }

// //       // Reset x position for bottom side of the wave
// //       x = canvas.width;

// //       // Draw bottom wave (in reverse to create a closed path)
// //       for (let i = bufferLength - 1; i >= 0; i--) {
// //         const percent = i / bufferLength;
// //         const barHeight = (dataArray[i] / 255) * (canvas.height / 3);

// //         // Apply a fade out effect towards the edges
// //         const edgeFade = 1 - Math.pow(Math.abs(percent - 0.5) * 2, 1.5);
// //         const scaledHeight = barHeight * edgeFade;

// //         x -= barWidth;
// //         const xPos = x + barWidth / 2;
// //         ctx.lineTo(xPos, baseY + scaledHeight);
// //       }

// //       ctx.closePath();

// //       // Create gradient fill
// //       const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
// //       gradient.addColorStop(0, "rgba(138, 43, 226, 0.8)");
// //       gradient.addColorStop(0.5, "rgba(125, 80, 255, 0.4)");
// //       gradient.addColorStop(1, "rgba(147, 112, 219, 0.8)");

// //       ctx.fillStyle = gradient;
// //       ctx.fill();

// //       // Add subtle glow effect
// //       ctx.shadowBlur = 15;
// //       ctx.shadowColor = "rgba(125, 80, 255, 0.5)";
// //       ctx.stroke();
// //       ctx.shadowBlur = 0;

// //       // Additional wave at the bottom for aesthetics
// //       drawWavyLine(ctx, canvas, time);
// //     };

// //     renderFrame();
// //   };

// //   const sendQuery = async () => {
// //     if (!prompt) return;

// //     setIsLoading(true);
// //     try {
// //       const res = await fetch(`${api}/api/AiConsultation/consult`, {
// //         method: "POST",
// //         headers: { "Content-Type": "application/json" },
// //         body: JSON.stringify({ prompt }),
// //       });

// //       // Clean up previous audio URL if it exists

// //       const { replyText, audioBase64 } = await res.json();
// //       setReplyText(replyText);

// //       // build a real audio URL from Base64
// //       const url = `data:audio/mpeg;base64,${audioBase64}`;
// //       if (audioUrl) URL.revokeObjectURL(audioUrl);
// //       setAudioUrl(url);

// //       //   const blob = await res.blob();
// //       //   const url = URL.createObjectURL(blob);
// //       //   setAudioUrl(url);
// //     } catch (error) {
// //       console.error("Error fetching response:", error);
// //     } finally {
// //       setIsLoading(false);
// //     }
// //   };

// //   // Voice input handling
// //   const startListening = () => {
// //     if ("webkitSpeechRecognition" in window || "SpeechRecognition" in window) {
// //       const SpeechRecognition =
// //         window.SpeechRecognition || window.webkitSpeechRecognition;
// //       const recognition = new SpeechRecognition();

// //       recognition.lang = "en-US";
// //       recognition.continuous = false;

// //       recognition.onstart = () => {
// //         setIsListening(true);
// //       };

// //       recognition.onresult = (event) => {
// //         const transcript = event.results[0][0].transcript;
// //         setPrompt(transcript);
// //       };

// //       recognition.onend = () => {
// //         setIsListening(false);
// //       };

// //       recognition.start();
// //     } else {
// //       alert("Speech recognition not supported in your browser");
// //     }
// //   };

// //   // Toggle audio mute state
// //   const toggleMute = () => {
// //     if (audioRef.current) {
// //       audioRef.current.muted = !audioRef.current.muted;
// //       setIsMuted(!isMuted);
// //     }
// //   };

// //   // Clean up when component unmounts
// //   useEffect(() => {
// //     return () => {
// //       if (audioUrl) {
// //         URL.revokeObjectURL(audioUrl);
// //       }
// //       cleanup();
// //     };
// //   }, []);

// //   // Effect to resize canvas when window size changes
// //   useEffect(() => {
// //     const handleResize = () => {
// //       if (canvasRef.current) {
// //         canvasRef.current.width = canvasRef.current.offsetWidth;
// //         canvasRef.current.height = canvasRef.current.offsetHeight;
// //       }
// //     };

// //     window.addEventListener("resize", handleResize);
// //     return () => window.removeEventListener("resize", handleResize);
// //   }, []);

// //   return (
// //     <div className="mt-12 flex h-screen w-full flex-col bg-gradient-to-b from-gray-900 via-purple-900 to-gray-900 text-white">
// //       {/* Header */}
// //       <header className="flex items-center justify-between border-b border-purple-700/30 px-8 py-6">
// //         <div className="flex items-center gap-3">
// //           <div className="flex h-10 w-10 items-center justify-center rounded-full bg-purple-500/20">
// //             <Activity className="text-purple-300" size={20} />
// //           </div>
// //           <h1 className="text-2xl font-bold tracking-tight text-white">
// //             AI Health Consultant
// //           </h1>
// //         </div>
// //         <div className="flex items-center gap-4">
// //           <div className="h-2 w-2 animate-pulse rounded-full bg-green-400"></div>
// //           <span className="text-sm text-gray-300">System Online</span>
// //         </div>
// //       </header>

// //       {/* Main content */}
// //       <main className="flex flex-1 flex-col p-6 lg:p-8">
// //         <div className="grid flex-1 grid-cols-1 gap-6 lg:grid-cols-3">
// //           {/* Visualization panel */}
// //           <div className="relative col-span-2 overflow-hidden rounded-xl bg-gray-900/50 shadow-lg backdrop-blur-sm">
// //             <canvas
// //               ref={canvasRef}
// //               className="absolute inset-0 h-full w-full"
// //             />
// //             <div className="absolute bottom-4 right-4 flex gap-3">
// //               {audioUrl && (
// //                 <button
// //                   onClick={toggleMute}
// //                   className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-800/50 text-white hover:bg-gray-700/50"
// //                 >
// //                   {isMuted ? <VolumeX size={18} /> : <Volume2 size={18} />}
// //                 </button>
// //               )}
// //               <button
// //                 onClick={() => setAudioUrl(null)}
// //                 className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-800/50 text-white hover:bg-gray-700/50"
// //               >
// //                 <RefreshCw size={18} />
// //               </button>
// //             </div>

// //             {isLoading && (
// //               <div className="absolute inset-0 flex items-center justify-center bg-black/30 backdrop-blur-sm">
// //                 <div className="flex flex-col items-center gap-4">
// //                   <div className="h-16 w-16 animate-spin rounded-full border-4 border-purple-500/20 border-t-purple-500"></div>
// //                   <p className="text-lg font-medium text-purple-200">
// //                     Processing your request...
// //                   </p>
// //                 </div>
// //               </div>
// //             )}
// //           </div>

// //           {/* Control panel */}
// //           <div className="flex flex-col rounded-xl bg-gray-900/50 p-6 shadow-lg backdrop-blur-sm">
// //             <div className="mb-6 flex gap-2 rounded-lg bg-gray-800/50 p-1">
// //               <button
// //                 onClick={() => setActiveTab("voice")}
// //                 className={`flex-1 rounded-md py-2.5 text-sm font-medium transition-all ${
// //                   activeTab === "voice"
// //                     ? "bg-purple-600 text-white"
// //                     : "text-gray-300 hover:bg-gray-700/50"
// //                 }`}
// //               >
// //                 Voice Consultation
// //               </button>
// //               <button
// //                 onClick={() => setActiveTab("history")}
// //                 className={`flex-1 rounded-md py-2.5 text-sm font-medium transition-all ${
// //                   activeTab === "history"
// //                     ? "bg-purple-600 text-white"
// //                     : "text-gray-300 hover:bg-gray-700/50"
// //                 }`}
// //               >
// //                 History
// //               </button>
// //             </div>

// //             {activeTab === "voice" && (
// //               <>
// //                 <h2 className="mb-3 text-lg font-semibold text-white">
// //                   Describe Your Symptoms
// //                 </h2>
// //                 <div className="relative mb-4">
// //                   <textarea
// //                     className="h-32 w-full resize-none rounded-lg border border-purple-700/30 bg-gray-800/30 p-4 text-white placeholder-gray-400 backdrop-blur-sm focus:border-purple-500 focus:outline-none focus:ring focus:ring-purple-500/20"
// //                     value={prompt}
// //                     onChange={(e) => setPrompt(e.target.value)}
// //                     placeholder="Describe your symptoms or ask a health question..."
// //                   />
// //                   <button
// //                     className={`absolute bottom-3 right-3 rounded-full p-2.5 transition-all ${
// //                       isListening
// //                         ? "animate-pulse bg-red-500 text-white"
// //                         : "bg-gray-700 text-gray-300 hover:bg-gray-600"
// //                     }`}
// //                     onClick={startListening}
// //                   >
// //                     <Mic size={20} />
// //                   </button>
// //                 </div>

// //                 <button
// //                   className={`mt-2 rounded-lg py-3.5 font-medium transition-all ${
// //                     !prompt
// //                       ? "cursor-not-allowed bg-gray-700 text-gray-400"
// //                       : "bg-gradient-to-r from-purple-600 to-blue-500 text-white shadow-lg hover:from-purple-700 hover:to-blue-600"
// //                   }`}
// //                   onClick={sendQuery}
// //                   disabled={isLoading || !prompt}
// //                 >
// //                   {isLoading ? "Processing..." : "Get Consultation"}
// //                 </button>
// //               </>
// //             )}

// //             {activeTab === "history" && (
// //               <div className="flex-1 rounded-lg">
// //                 <h2 className="mb-3 text-lg font-semibold text-white">
// //                   Recent Consultations
// //                 </h2>
// //                 <div className="flex h-64 flex-col gap-2 overflow-y-auto rounded-lg bg-gray-800/20 p-4">
// //                   <div className="flex items-center justify-center text-gray-400">
// //                     <p>No recent consultations</p>
// //                   </div>
// //                 </div>
// //               </div>
// //             )}

// //             <div className="mt-6 flex flex-col">
// //               <div className="flex items-center gap-2 text-xs text-purple-300">
// //                 <div className="h-1.5 w-1.5 rounded-full bg-purple-400"></div>
// //                 <p>
// //                   AI systems are not a substitute for professional medical
// //                   advice
// //                 </p>
// //               </div>
// //             </div>
// //           </div>
// //         </div>
// //       </main>

// //       {/* Hidden audio element */}
// //       {audioUrl && (
// //         <audio
// //           ref={audioRef}
// //           className="hidden"
// //           src={audioUrl}
// //           controls
// //           autoPlay
// //           muted={isMuted}
// //         />
// //       )}
// //     </div>
// //   );
// // }
// import { useState, useRef, useEffect } from "react";
// import { Mic, Activity, VolumeX, Volume2, RefreshCw } from "lucide-react";

// export default function AIConsultation() {
//   const [prompt, setPrompt] = useState("");
//   const [audioUrl, setAudioUrl] = useState(null);
//   const [isLoading, setIsLoading] = useState(false);
//   const [isListening, setIsListening] = useState(false);
//   const [isMuted, setIsMuted] = useState(false);
//   const [activeTab, setActiveTab] = useState("voice");
//   const [replyText, setReplyText] = useState("");
//   const audioRef = useRef(null);
//   const canvasRef = useRef(null);
//   const animationRef = useRef(null);
//   const audioContextRef = useRef(null);
//   const sourceNodeRef = useRef(null);
//   const analyserRef = useRef(null);
//   const api = import.meta.env.VITE_API_BASE_URL;

//   // Audio visualization setup
//   useEffect(() => {
//     // Clean up previous resources
//     cleanup();

//     if (!canvasRef.current) return;

//     // Set up idle animation if no audio URL is available
//     if (!audioUrl) {
//       startIdleAnimation();
//       return;
//     }

//     // Create new audio context for visualization
//     const AudioContext = window.AudioContext || window.webkitAudioContext;
//     audioContextRef.current = new AudioContext();
//     analyserRef.current = audioContextRef.current.createAnalyser();
//     analyserRef.current.fftSize = 512;

//     const audio = audioRef.current;
//     if (!audio) return;

//     const handleCanPlay = () => {
//       try {
//         sourceNodeRef.current =
//           audioContextRef.current.createMediaElementSource(audio);
//         sourceNodeRef.current.connect(analyserRef.current);
//         analyserRef.current.connect(audioContextRef.current.destination);
//         startVisualization();
//         audio.removeEventListener("canplay", handleCanPlay);
//       } catch (err) {
//         console.error("Audio setup error:", err);
//       }
//     };

//     if (audio.readyState >= 2) {
//       handleCanPlay();
//     } else {
//       audio.addEventListener("canplay", handleCanPlay);
//     }

//     // Resume the audio context if it was suspended
//     if (audioContextRef.current.state === "suspended") {
//       audioContextRef.current.resume();
//     }

//     return cleanup;
//   }, [audioUrl]);

//   const cleanup = () => {
//     if (animationRef.current) {
//       cancelAnimationFrame(animationRef.current);
//       animationRef.current = null;
//     }

//     if (sourceNodeRef.current) {
//       sourceNodeRef.current.disconnect();
//       sourceNodeRef.current = null;
//     }

//     if (audioContextRef.current) {
//       audioContextRef.current.close().catch(console.error);
//       audioContextRef.current = null;
//     }
//   };

//   const startIdleAnimation = () => {
//     if (!canvasRef.current) return;

//     const canvas = canvasRef.current;
//     const ctx = canvas.getContext("2d");

//     // Set canvas dimensions to match container
//     canvas.width = canvas.offsetWidth;
//     canvas.height = canvas.offsetHeight;

//     const renderIdleFrame = () => {
//       animationRef.current = requestAnimationFrame(renderIdleFrame);

//       ctx.clearRect(0, 0, canvas.width, canvas.height);

//       const time = Date.now() * 0.001;
//       const centerX = canvas.width / 2;
//       const centerY = canvas.height / 2;

//       // Create multiple breathing circles with different phases
//       for (let i = 0; i < 5; i++) {
//         const phase = i * (Math.PI / 3);
//         const size = Math.sin(time + phase) * 20 + 100 - i * 15;
//         const opacity = 0.06 - i * 0.01;

//         ctx.beginPath();
//         ctx.arc(centerX, centerY, size, 0, 2 * Math.PI);
//         ctx.fillStyle = `rgba(79, 70, 229, ${opacity})`; // Changed to indigo color
//         ctx.fill();
//       }

//       // Animated wave at the bottom
//       drawWavyLine(ctx, canvas, time);
//     };

//     renderIdleFrame();
//   };

//   const drawWavyLine = (ctx, canvas, time) => {
//     const amplitude = 15;
//     const frequency = 0.02;
//     const y = canvas.height * 0.8;

//     ctx.beginPath();
//     ctx.moveTo(0, y);

//     for (let x = 0; x < canvas.width; x++) {
//       const yOffset = Math.sin(x * frequency + time) * amplitude;
//       ctx.lineTo(x, y + yOffset);
//     }

//     ctx.lineTo(canvas.width, canvas.height);
//     ctx.lineTo(0, canvas.height);
//     ctx.closePath();

//     const gradient = ctx.createLinearGradient(0, y, 0, canvas.height);
//     gradient.addColorStop(0, "rgba(79, 70, 229, 0.2)"); // Changed to indigo color
//     gradient.addColorStop(1, "rgba(79, 70, 229, 0.05)");
//     ctx.fillStyle = gradient;
//     ctx.fill();
//   };

//   const startVisualization = () => {
//     if (!canvasRef.current || !analyserRef.current) return;

//     const canvas = canvasRef.current;
//     const ctx = canvas.getContext("2d");
//     const analyser = analyserRef.current;

//     // Set canvas dimensions to match container
//     canvas.width = canvas.offsetWidth;
//     canvas.height = canvas.offsetHeight;

//     const bufferLength = analyser.frequencyBinCount;
//     const dataArray = new Uint8Array(bufferLength);

//     const renderFrame = () => {
//       animationRef.current = requestAnimationFrame(renderFrame);

//       analyser.getByteFrequencyData(dataArray);

//       ctx.clearRect(0, 0, canvas.width, canvas.height);

//       // Background glow
//       const time = Date.now() * 0.0005;
//       const breathSize = Math.sin(time) * 30 + 150;

//       ctx.beginPath();
//       ctx.arc(canvas.width / 2, canvas.height / 2, breathSize, 0, 2 * Math.PI);
//       ctx.fillStyle = "rgba(79, 70, 229, 0.06)"; // Changed to indigo color
//       ctx.fill();

//       // Main frequency waveform
//       const barWidth = Math.max(2, (canvas.width / bufferLength) * 2);
//       const baseY = canvas.height / 2;
//       let x = 0;

//       ctx.beginPath();

//       // Draw mirrored frequency bars for a more aesthetic waveform
//       for (let i = 0; i < bufferLength; i++) {
//         const percent = i / bufferLength;
//         const barHeight = (dataArray[i] / 255) * (canvas.height / 3);

//         // Apply a fade out effect towards the edges
//         const edgeFade = 1 - Math.pow(Math.abs(percent - 0.5) * 2, 1.5);
//         const scaledHeight = barHeight * edgeFade;

//         // Draw top wave
//         const xPos = x + barWidth / 2;

//         if (i === 0) {
//           ctx.moveTo(xPos, baseY - scaledHeight);
//         } else {
//           ctx.lineTo(xPos, baseY - scaledHeight);
//         }

//         x += barWidth;
//       }

//       // Reset x position for bottom side of the wave
//       x = canvas.width;

//       // Draw bottom wave (in reverse to create a closed path)
//       for (let i = bufferLength - 1; i >= 0; i--) {
//         const percent = i / bufferLength;
//         const barHeight = (dataArray[i] / 255) * (canvas.height / 3);

//         // Apply a fade out effect towards the edges
//         const edgeFade = 1 - Math.pow(Math.abs(percent - 0.5) * 2, 1.5);
//         const scaledHeight = barHeight * edgeFade;

//         x -= barWidth;
//         const xPos = x + barWidth / 2;
//         ctx.lineTo(xPos, baseY + scaledHeight);
//       }

//       ctx.closePath();

//       // Create gradient fill
//       const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
//       gradient.addColorStop(0, "rgba(79, 70, 229, 0.8)"); // Changed to indigo color
//       gradient.addColorStop(0.5, "rgba(79, 70, 229, 0.4)");
//       gradient.addColorStop(1, "rgba(79, 70, 229, 0.8)");

//       ctx.fillStyle = gradient;
//       ctx.fill();

//       // Add subtle glow effect
//       ctx.shadowBlur = 15;
//       ctx.shadowColor = "rgba(79, 70, 229, 0.5)"; // Changed to indigo color
//       ctx.stroke();
//       ctx.shadowBlur = 0;

//       // Additional wave at the bottom for aesthetics
//       drawWavyLine(ctx, canvas, time);
//     };

//     renderFrame();
//   };

//   const sendQuery = async () => {
//     if (!prompt) return;

//     setIsLoading(true);
//     try {
//       const res = await fetch(`${api}/api/AiConsultation/consult`, {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({ prompt }),
//       });

//       // Clean up previous audio URL if it exists

//       const { replyText, audioBase64 } = await res.json();
//       setReplyText(replyText);

//       // build a real audio URL from Base64
//       const url = `data:audio/mpeg;base64,${audioBase64}`;
//       if (audioUrl) URL.revokeObjectURL(audioUrl);
//       setAudioUrl(url);

//       //   const blob = await res.blob();
//       //   const url = URL.createObjectURL(blob);
//       //   setAudioUrl(url);
//     } catch (error) {
//       console.error("Error fetching response:", error);
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   // Voice input handling
//   const startListening = () => {
//     if ("webkitSpeechRecognition" in window || "SpeechRecognition" in window) {
//       const SpeechRecognition =
//         window.SpeechRecognition || window.webkitSpeechRecognition;
//       const recognition = new SpeechRecognition();

//       recognition.lang = "en-US";
//       recognition.continuous = false;

//       recognition.onstart = () => {
//         setIsListening(true);
//       };

//       recognition.onresult = (event) => {
//         const transcript = event.results[0][0].transcript;
//         setPrompt(transcript);
//       };

//       recognition.onend = () => {
//         setIsListening(false);
//       };

//       recognition.start();
//     } else {
//       alert("Speech recognition not supported in your browser");
//     }
//   };

//   // Toggle audio mute state
//   const toggleMute = () => {
//     if (audioRef.current) {
//       audioRef.current.muted = !audioRef.current.muted;
//       setIsMuted(!isMuted);
//     }
//   };

//   // Clean up when component unmounts
//   useEffect(() => {
//     return () => {
//       if (audioUrl) {
//         URL.revokeObjectURL(audioUrl);
//       }
//       cleanup();
//     };
//   }, []);

//   // Effect to resize canvas when window size changes
//   useEffect(() => {
//     const handleResize = () => {
//       if (canvasRef.current) {
//         canvasRef.current.width = canvasRef.current.offsetWidth;
//         canvasRef.current.height = canvasRef.current.offsetHeight;
//       }
//     };

//     window.addEventListener("resize", handleResize);
//     return () => window.removeEventListener("resize", handleResize);
//   }, []);

//   return (
//     <div className="mt-6 flex w-full flex-col rounded-lg bg-white text-gray-800 shadow-md">
//       {/* Header */}
//       <header className="flex items-center justify-between border-b border-gray-200 px-6 py-4">
//         <div className="flex items-center gap-3">
//           <div className="flex h-10 w-10 items-center justify-center rounded-full bg-indigo-100">
//             <Activity className="text-indigo-600" size={20} />
//           </div>
//           <h1 className="text-xl font-bold tracking-tight text-gray-800">
//             AI Health Consultant
//           </h1>
//         </div>
//         <div className="flex items-center gap-4">
//           <div className="h-2 w-2 animate-pulse rounded-full bg-green-500"></div>
//           <span className="text-sm text-gray-600">System Online</span>
//         </div>
//       </header>

//       {/* Main content */}
//       <main className="flex flex-1 flex-col p-6">
//         <div className="grid flex-1 grid-cols-1 gap-6 lg:grid-cols-3">
//           {/* Visualization panel */}
//           <div className="relative col-span-2 h-64 overflow-hidden rounded-lg border border-gray-200 bg-gray-50 shadow lg:h-auto">
//             <canvas
//               ref={canvasRef}
//               className="absolute inset-0 h-full w-full"
//             />
//             <div className="absolute bottom-4 right-4 flex gap-3">
//               {audioUrl && (
//                 <button
//                   onClick={toggleMute}
//                   className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-indigo-600 shadow hover:bg-gray-50"
//                 >
//                   {isMuted ? <VolumeX size={18} /> : <Volume2 size={18} />}
//                 </button>
//               )}
//               <button
//                 onClick={() => setAudioUrl(null)}
//                 className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-indigo-600 shadow hover:bg-gray-50"
//               >
//                 <RefreshCw size={18} />
//               </button>
//             </div>

//             {isLoading && (
//               <div className="absolute inset-0 flex items-center justify-center bg-white/80 backdrop-blur-sm">
//                 <div className="flex flex-col items-center gap-4">
//                   <div className="h-12 w-12 animate-spin rounded-full border-4 border-indigo-100 border-t-indigo-600"></div>
//                   <p className="text-lg font-medium text-indigo-700">
//                     Processing your request...
//                   </p>
//                 </div>
//               </div>
//             )}
//           </div>

//           {/* Control panel */}
//           <div className="flex flex-col rounded-lg border border-gray-200 bg-white p-5 shadow">
//             <div className="mb-5 flex gap-2 rounded-lg bg-gray-100 p-1">
//               <button
//                 onClick={() => setActiveTab("voice")}
//                 className={`flex-1 rounded-md py-2 text-sm font-medium transition-all ${
//                   activeTab === "voice"
//                     ? "bg-indigo-600 text-white"
//                     : "text-gray-600 hover:bg-gray-200"
//                 }`}
//               >
//                 Voice Consultation
//               </button>
//               <button
//                 onClick={() => setActiveTab("history")}
//                 className={`flex-1 rounded-md py-2 text-sm font-medium transition-all ${
//                   activeTab === "history"
//                     ? "bg-indigo-600 text-white"
//                     : "text-gray-600 hover:bg-gray-200"
//                 }`}
//               >
//                 History
//               </button>
//             </div>

//             {activeTab === "voice" && (
//               <>
//                 <h2 className="mb-3 text-lg font-semibold text-gray-800">
//                   Describe Your Symptoms
//                 </h2>
//                 <div className="relative mb-4">
//                   <textarea
//                     className="h-32 w-full resize-none rounded-lg border border-gray-300 bg-white p-3 text-gray-700 placeholder-gray-400 focus:border-indigo-500 focus:outline-none focus:ring focus:ring-indigo-200"
//                     value={prompt}
//                     onChange={(e) => setPrompt(e.target.value)}
//                     placeholder="Describe your symptoms or ask a health question..."
//                   />
//                   <button
//                     className={`absolute bottom-3 right-3 rounded-full p-2 transition-all ${
//                       isListening
//                         ? "animate-pulse bg-red-500 text-white"
//                         : "bg-gray-200 text-gray-600 hover:bg-gray-300"
//                     }`}
//                     onClick={startListening}
//                   >
//                     <Mic size={18} />
//                   </button>
//                 </div>

//                 <button
//                   className={`mt-2 rounded-lg py-3 font-medium transition-all ${
//                     !prompt
//                       ? "cursor-not-allowed bg-gray-200 text-gray-400"
//                       : "bg-indigo-600 text-white shadow hover:bg-indigo-700"
//                   }`}
//                   onClick={sendQuery}
//                   disabled={isLoading || !prompt}
//                 >
//                   {isLoading ? "Processing..." : "Get Consultation"}
//                 </button>
//               </>
//             )}

//             {activeTab === "history" && (
//               <div className="flex-1 rounded-lg">
//                 <h2 className="mb-3 text-lg font-semibold text-gray-800">
//                   Recent Consultations
//                 </h2>
//                 <div className="flex h-48 flex-col gap-2 overflow-y-auto rounded-lg border border-gray-200 bg-gray-50 p-4">
//                   <div className="flex items-center justify-center text-gray-500">
//                     <p>No recent consultations</p>
//                   </div>
//                 </div>
//               </div>
//             )}

//             <div className="mt-6 flex flex-col">
//               <div className="flex items-center gap-2 text-xs text-gray-500">
//                 <div className="h-1.5 w-1.5 rounded-full bg-indigo-500"></div>
//                 <p>
//                   AI systems are not a substitute for professional medical
//                   advice
//                 </p>
//               </div>
//             </div>
//           </div>
//         </div>
//       </main>

//       {/* Hidden audio element */}
//       {audioUrl && (
//         <audio
//           ref={audioRef}
//           className="hidden"
//           src={audioUrl}
//           controls
//           autoPlay
//           muted={isMuted}
//         />
//       )}
//     </div>
//   );
// }
import { useState, useRef, useEffect } from "react";
import {
  Mic,
  Activity,
  VolumeX,
  Volume2,
  RefreshCw,
  Info,
  Clock,
  UserPlus,
} from "lucide-react";

export default function AIConsultation() {
  const [prompt, setPrompt] = useState("");
  const [audioUrl, setAudioUrl] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [activeTab, setActiveTab] = useState("voice");
  const [replyText, setReplyText] = useState("");
  const audioRef = useRef(null);
  const canvasRef = useRef(null);
  const animationRef = useRef(null);
  const audioContextRef = useRef(null);
  const sourceNodeRef = useRef(null);
  const analyserRef = useRef(null);
  const api = import.meta.env.VITE_API_BASE_URL || "https://api.example.com";

  // Audio visualization setup
  useEffect(() => {
    cleanup();

    if (!canvasRef.current) return;

    if (!audioUrl) {
      startIdleAnimation();
      return;
    }

    const AudioContext = window.AudioContext || window.webkitAudioContext;
    audioContextRef.current = new AudioContext();
    analyserRef.current = audioContextRef.current.createAnalyser();
    analyserRef.current.fftSize = 512;

    const audio = audioRef.current;
    if (!audio) return;

    const handleCanPlay = () => {
      try {
        sourceNodeRef.current =
          audioContextRef.current.createMediaElementSource(audio);
        sourceNodeRef.current.connect(analyserRef.current);
        analyserRef.current.connect(audioContextRef.current.destination);
        startVisualization();
        audio.removeEventListener("canplay", handleCanPlay);
      } catch (err) {
        console.error("Audio setup error:", err);
      }
    };

    if (audio.readyState >= 2) {
      handleCanPlay();
    } else {
      audio.addEventListener("canplay", handleCanPlay);
    }

    if (audioContextRef.current.state === "suspended") {
      audioContextRef.current.resume();
    }

    return cleanup;
  }, [audioUrl]);

  const cleanup = () => {
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
      animationRef.current = null;
    }

    if (sourceNodeRef.current) {
      sourceNodeRef.current.disconnect();
      sourceNodeRef.current = null;
    }

    if (audioContextRef.current) {
      audioContextRef.current.close().catch(console.error);
      audioContextRef.current = null;
    }
  };

  const startIdleAnimation = () => {
    if (!canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");

    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;

    const renderIdleFrame = () => {
      animationRef.current = requestAnimationFrame(renderIdleFrame);

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const time = Date.now() * 0.001;
      const centerX = canvas.width / 2;
      const centerY = canvas.height / 2;

      // Create pulsating circles with different phases
      for (let i = 0; i < 8; i++) {
        const phase = i * (Math.PI / 4);
        const size = Math.max(5, Math.sin(time + phase) * 25 + 110 - i * 12);
        const opacity = 0.08 - i * 0.01;

        ctx.beginPath();
        ctx.arc(centerX, centerY, size, 0, 2 * Math.PI);
        ctx.fillStyle = `rgba(79, 70, 229, ${Math.max(0.01, opacity)})`;
        ctx.fill();
      }

      // Add particles floating around
      drawParticles(ctx, canvas, time);

      // Animated wave at the bottom
      drawWavyLine(ctx, canvas, time);
    };

    renderIdleFrame();
  };

  const drawParticles = (ctx, canvas, time) => {
    const numParticles = 20;

    for (let i = 0; i < numParticles; i++) {
      // Use deterministic "random" positions based on particle index
      const x =
        canvas.width * (0.1 + 0.8 * ((Math.sin(i * 3.7 + time * 0.3) + 1) / 2));
      const y =
        canvas.height *
        (0.1 + 0.8 * ((Math.cos(i * 2.3 + time * 0.2) + 1) / 2));
      const size = 2 + Math.sin(time + i) * 1.5;

      const opacity = 0.3 + 0.2 * Math.sin(time * 0.5 + i * 0.7);

      ctx.beginPath();
      ctx.arc(x, y, size, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(79, 70, 229, ${opacity})`;
      ctx.fill();

      // Add glow effect
      ctx.shadowBlur = 5;
      ctx.shadowColor = "rgba(79, 70, 229, 0.5)";
      ctx.fill();
      ctx.shadowBlur = 0;
    }
  };

  const drawWavyLine = (ctx, canvas, time) => {
    const amplitude = 15;
    const frequency = 0.02;
    const y = canvas.height * 0.8;

    ctx.beginPath();
    ctx.moveTo(0, y);

    for (let x = 0; x < canvas.width; x++) {
      const yOffset = Math.sin(x * frequency + time) * amplitude;
      ctx.lineTo(x, y + yOffset);
    }

    ctx.lineTo(canvas.width, canvas.height);
    ctx.lineTo(0, canvas.height);
    ctx.closePath();

    const gradient = ctx.createLinearGradient(0, y, 0, canvas.height);
    gradient.addColorStop(0, "rgba(79, 70, 229, 0.3)");
    gradient.addColorStop(1, "rgba(79, 70, 229, 0.05)");
    ctx.fillStyle = gradient;
    ctx.fill();
  };

  const startVisualization = () => {
    if (!canvasRef.current || !analyserRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    const analyser = analyserRef.current;

    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;

    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    const renderFrame = () => {
      animationRef.current = requestAnimationFrame(renderFrame);

      analyser.getByteFrequencyData(dataArray);

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Background pulsating glow
      const time = Date.now() * 0.0005;
      const breathSize = Math.max(5, Math.sin(time) * 40 + 170);

      // Add multiple breathing circles
      for (let i = 0; i < 5; i++) {
        const phase = i * 0.5;
        const size = breathSize - i * 15;
        const opacity = 0.06 - i * 0.01;

        ctx.beginPath();
        ctx.arc(canvas.width / 2, canvas.height / 2, size, 0, 2 * Math.PI);
        ctx.fillStyle = `rgba(79, 70, 229, ${Math.max(0.01, opacity)})`;
        ctx.fill();
      }

      // Add floating particles
      drawParticles(ctx, canvas, time);

      // Main frequency waveform
      const barWidth = Math.max(2, (canvas.width / bufferLength) * 2);
      const baseY = canvas.height / 2;
      let x = 0;

      ctx.beginPath();

      // Draw mirrored frequency bars with improved aesthetic
      for (let i = 0; i < bufferLength; i++) {
        const percent = i / bufferLength;
        let barHeight = (dataArray[i] / 255) * (canvas.height / 3);

        // Apply smoothing function for more natural movement
        barHeight *= Math.pow(Math.sin(percent * Math.PI), 0.5);

        // Apply a fade out effect towards the edges
        const edgeFade = 1 - Math.pow(Math.abs(percent - 0.5) * 2, 1.5);
        const scaledHeight = barHeight * edgeFade;

        const xPos = x + barWidth / 2;

        if (i === 0) {
          ctx.moveTo(xPos, baseY - scaledHeight);
        } else {
          ctx.lineTo(xPos, baseY - scaledHeight);
        }

        x += barWidth;
      }

      // Reset x position for bottom side of the wave
      x = canvas.width;

      // Draw bottom wave (in reverse to create a closed path)
      for (let i = bufferLength - 1; i >= 0; i--) {
        const percent = i / bufferLength;
        let barHeight = (dataArray[i] / 255) * (canvas.height / 3);

        // Apply smoothing function
        barHeight *= Math.pow(Math.sin(percent * Math.PI), 0.5);

        const edgeFade = 1 - Math.pow(Math.abs(percent - 0.5) * 2, 1.5);
        const scaledHeight = barHeight * edgeFade;

        x -= barWidth;
        const xPos = x + barWidth / 2;
        ctx.lineTo(xPos, baseY + scaledHeight);
      }

      ctx.closePath();

      // Enhanced gradient fill with more color stops
      const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
      gradient.addColorStop(0, "rgba(99, 102, 241, 0.8)");
      gradient.addColorStop(0.3, "rgba(79, 70, 229, 0.7)");
      gradient.addColorStop(0.5, "rgba(79, 70, 229, 0.4)");
      gradient.addColorStop(0.7, "rgba(79, 70, 229, 0.7)");
      gradient.addColorStop(1, "rgba(99, 102, 241, 0.8)");

      ctx.fillStyle = gradient;
      ctx.fill();

      // Add enhanced glow effect
      ctx.shadowBlur = 20;
      ctx.shadowColor = "rgba(79, 70, 229, 0.6)";
      ctx.strokeStyle = "rgba(129, 140, 248, 0.4)";
      ctx.lineWidth = 1;
      ctx.stroke();
      ctx.shadowBlur = 0;

      // Wave at the bottom
      drawWavyLine(ctx, canvas, time);
    };

    renderFrame();
  };

  // Function to handle audio playback end
  const handleAudioEnded = () => {
    setReplyText(""); // Clear the reply text

    // Revoke URL object to clean up memory
    if (audioUrl && audioUrl.startsWith("data:")) {
      // For data URLs, we don't need to revoke
      setAudioUrl(null);
    } else if (audioUrl) {
      URL.revokeObjectURL(audioUrl);
      setAudioUrl(null);
    }
  };

  const sendQuery = async () => {
    if (!prompt) return;

    setIsLoading(true);
    try {
      // Simulate API call if real API is not available
      if (api === "https://api.example.com") {
        await new Promise((resolve) => setTimeout(resolve, 2000));
        setReplyText(
          "Based on your symptoms, I would recommend drinking plenty of fluids and getting adequate rest. If symptoms persist for more than 3 days, please consult with a healthcare professional.",
        );
        // Create a blank audio file
        setAudioUrl(
          "data:audio/mpeg;base64,SUQzAwAAAAAAMlRJVDIAAAAMAAAAQnVpbHQtaW4gV0FWRUVOQwAAABUAAABMYXZmNTkuMTYuMTAwIENvcmVz",
        );
      } else {
        const res = await fetch(`${api}/api/AiConsultation/consult`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ prompt }),
        });

        const { replyText, audioBase64 } = await res.json();
        setReplyText(replyText);
        const url = `data:audio/mpeg;base64,${audioBase64}`;
        if (audioUrl) URL.revokeObjectURL(audioUrl);
        setAudioUrl(url);
      }
    } catch (error) {
      console.error("Error fetching response:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Voice input handling
  const startListening = () => {
    if ("webkitSpeechRecognition" in window || "SpeechRecognition" in window) {
      const SpeechRecognition =
        window.SpeechRecognition || window.webkitSpeechRecognition;
      const recognition = new SpeechRecognition();

      recognition.lang = "en-US";
      recognition.continuous = false;

      recognition.onstart = () => {
        setIsListening(true);
      };

      recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        setPrompt(transcript);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognition.start();
    } else {
      alert("Speech recognition not supported in your browser");
    }
  };

  // Toggle audio mute state
  const toggleMute = () => {
    if (audioRef.current) {
      audioRef.current.muted = !audioRef.current.muted;
      setIsMuted(!isMuted);
    }
  };

  // Clean up when component unmounts
  useEffect(() => {
    return () => {
      if (audioUrl) {
        URL.revokeObjectURL(audioUrl);
      }
      cleanup();
    };
  }, []);

  // Effect to resize canvas when window size changes
  useEffect(() => {
    const handleResize = () => {
      if (canvasRef.current) {
        canvasRef.current.width = canvasRef.current.offsetWidth;
        canvasRef.current.height = canvasRef.current.offsetHeight;
      }
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <div className="flex min-h-screen flex-col bg-gray-50 p-12">
      <div className="flex h-full w-full flex-col overflow-hidden rounded-xl border border-gray-200 bg-white shadow-lg">
        {/* Header */}
        <header className="flex items-center justify-between border-b border-gray-200 bg-white p-4 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-indigo-100">
              <Activity className="text-indigo-600" size={20} />
            </div>
            <h1 className="text-xl font-bold tracking-tight text-gray-800 sm:text-2xl">
              AI Health Consultant
            </h1>
          </div>
          <div className="flex items-center gap-3">
            <div className="h-2 w-2 animate-pulse rounded-full bg-green-500"></div>
            <span className="text-sm text-gray-600">System Online</span>
          </div>
        </header>

        {/* Main content area */}
        <main className="flex flex-1 overflow-hidden">
          <div className="flex h-full w-full flex-col md:flex-row">
            {/* Visualization panel */}
            <div className="relative flex flex-1 flex-col overflow-hidden bg-gray-50">
              {/* Waveform visualization */}
              <div className="relative h-full min-h-80 w-full flex-1">
                <canvas
                  ref={canvasRef}
                  className="absolute inset-0 h-full w-full"
                />

                {/* Controls overlay */}
                <div className="absolute bottom-4 right-4 flex gap-3">
                  {audioUrl && (
                    <button
                      onClick={toggleMute}
                      className="flex h-12 w-12 items-center justify-center rounded-full bg-white text-indigo-600 shadow-md transition-all hover:bg-indigo-50"
                    >
                      {isMuted ? <VolumeX size={20} /> : <Volume2 size={20} />}
                    </button>
                  )}
                  <button
                    onClick={() => {
                      if (audioUrl) URL.revokeObjectURL(audioUrl);
                      setAudioUrl(null);
                      setReplyText("");
                    }}
                    className="flex h-12 w-12 items-center justify-center rounded-full bg-white text-indigo-600 shadow-md transition-all hover:bg-indigo-50"
                  >
                    <RefreshCw size={20} />
                  </button>
                </div>

                {/* Loading overlay */}
                {isLoading && (
                  <div className="absolute inset-0 flex items-center justify-center bg-white/70 backdrop-blur-sm">
                    <div className="flex flex-col items-center gap-4">
                      <div className="h-16 w-16 animate-spin rounded-full border-4 border-indigo-100 border-t-indigo-600"></div>
                      <p className="text-lg font-medium text-indigo-700">
                        Processing your request...
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* Reply text subtitle section */}
              <div
                className={`w-full bg-indigo-600 px-6 py-4 text-center text-white transition-all duration-300 ${
                  replyText ? "opacity-100" : "opacity-0"
                }`}
              >
                <p className="text-lg font-medium">{replyText}</p>
              </div>
            </div>

            {/* Control panel - adjusts width responsively */}
            <div className="flex h-full w-full flex-col border-l border-gray-200 bg-white p-4 shadow-sm md:w-96">
              <div className="mb-4 flex overflow-x-auto rounded-lg bg-gray-100 p-1">
                <button
                  onClick={() => setActiveTab("voice")}
                  className={`flex flex-1 items-center justify-center gap-1 whitespace-nowrap rounded-md py-2 text-sm font-medium transition-all ${
                    activeTab === "voice"
                      ? "bg-indigo-600 text-white"
                      : "text-gray-600 hover:bg-gray-200"
                  }`}
                >
                  <Mic size={16} />
                  <span>Consultation</span>
                </button>
                <button
                  onClick={() => setActiveTab("history")}
                  className={`flex flex-1 items-center justify-center gap-1 whitespace-nowrap rounded-md py-2 text-sm font-medium transition-all ${
                    activeTab === "history"
                      ? "bg-indigo-600 text-white"
                      : "text-gray-600 hover:bg-gray-200"
                  }`}
                >
                  <Clock size={16} />
                  <span>History</span>
                </button>
                <button
                  onClick={() => setActiveTab("profile")}
                  className={`flex flex-1 items-center justify-center gap-1 whitespace-nowrap rounded-md py-2 text-sm font-medium transition-all ${
                    activeTab === "profile"
                      ? "bg-indigo-600 text-white"
                      : "text-gray-600 hover:bg-gray-200"
                  }`}
                >
                  <UserPlus size={16} />
                  <span>Profile</span>
                </button>
              </div>

              <div className="flex-1 overflow-y-auto">
                {activeTab === "voice" && (
                  <>
                    <h2 className="mb-4 text-lg font-semibold text-gray-800">
                      Describe Your Symptoms
                    </h2>
                    <div className="relative mb-4">
                      <textarea
                        className="h-40 w-full resize-none rounded-lg border border-gray-300 bg-white p-4 text-gray-700 placeholder-gray-400 focus:border-indigo-500 focus:outline-none focus:ring focus:ring-indigo-200"
                        value={prompt}
                        onChange={(e) => setPrompt(e.target.value)}
                        placeholder="Describe your symptoms or ask a health question..."
                      />
                      <button
                        className={`absolute bottom-4 right-4 rounded-full p-2 transition-all ${
                          isListening
                            ? "animate-pulse bg-red-500 text-white shadow-md"
                            : "bg-gray-200 text-gray-600 hover:bg-gray-300"
                        }`}
                        onClick={startListening}
                      >
                        <Mic size={20} />
                      </button>
                    </div>

                    <button
                      className={`mt-2 w-full rounded-lg px-4 py-3 font-medium transition-all ${
                        !prompt
                          ? "cursor-not-allowed bg-gray-200 text-gray-400"
                          : "bg-indigo-600 text-white shadow hover:bg-indigo-700"
                      }`}
                      onClick={sendQuery}
                      disabled={isLoading || !prompt}
                    >
                      {isLoading ? "Processing..." : "Get Consultation"}
                    </button>
                  </>
                )}

                {activeTab === "history" && (
                  <div className="flex-1">
                    <h2 className="mb-4 text-lg font-semibold text-gray-800">
                      Recent Consultations
                    </h2>
                    <div className="flex flex-1 flex-col gap-3 overflow-y-auto rounded-lg border border-gray-200 bg-gray-50 p-4">
                      {[1, 2, 3].map((index) => (
                        <div
                          key={index}
                          className="flex cursor-pointer flex-col rounded-lg border border-gray-200 bg-white p-4 shadow-sm transition-all hover:border-indigo-200 hover:bg-indigo-50"
                        >
                          <div className="flex items-center justify-between">
                            <h4 className="font-medium text-gray-800">
                              Consultation #{index}
                            </h4>
                            <span className="text-xs text-gray-500">
                              {index === 1
                                ? "Today"
                                : index === 2
                                  ? "Yesterday"
                                  : "3 days ago"}
                            </span>
                          </div>
                          <p className="mt-2 line-clamp-2 text-sm text-gray-600">
                            {index === 1
                              ? "Headache and mild fever symptoms"
                              : index === 2
                                ? "Back pain after exercise"
                                : "Questions about seasonal allergies"}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {activeTab === "profile" && (
                  <div className="flex-1">
                    <h2 className="mb-4 text-lg font-semibold text-gray-800">
                      Health Profile
                    </h2>
                    <div className="flex flex-1 flex-col gap-4 overflow-y-auto rounded-lg border border-gray-200 bg-gray-50 p-4">
                      <div className="flex flex-col gap-2 rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
                        <div className="flex items-center justify-between">
                          <h4 className="font-medium text-gray-700">
                            Basic Information
                          </h4>
                          <button className="text-sm text-indigo-600">
                            Edit
                          </button>
                        </div>
                        <div className="grid grid-cols-2 gap-2 text-sm">
                          <span className="text-gray-500">Age:</span>
                          <span className="text-gray-800">35</span>
                          <span className="text-gray-500">Gender:</span>
                          <span className="text-gray-800">Not specified</span>
                          <span className="text-gray-500">Weight:</span>
                          <span className="text-gray-800">Not specified</span>
                        </div>
                      </div>

                      <div className="flex flex-col gap-2 rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
                        <div className="flex items-center justify-between">
                          <h4 className="font-medium text-gray-700">
                            Medical History
                          </h4>
                          <button className="text-sm text-indigo-600">
                            Add
                          </button>
                        </div>
                        <p className="text-sm text-gray-500">
                          No medical history provided
                        </p>
                      </div>

                      <div className="flex flex-col gap-2 rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
                        <div className="flex items-center justify-between">
                          <h4 className="font-medium text-gray-700">
                            Medications
                          </h4>
                          <button className="text-sm text-indigo-600">
                            Add
                          </button>
                        </div>
                        <p className="text-sm text-gray-500">
                          No medications listed
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div className="mt-4 flex flex-col rounded-lg bg-indigo-50 p-4">
                <div className="flex items-start gap-2">
                  <Info
                    size={18}
                    className="mt-0.5 flex-shrink-0 text-indigo-600"
                  />
                  <p className="text-sm text-gray-600">
                    AI systems provide general information only and are not a
                    substitute for professional medical advice. Always consult a
                    qualified healthcare provider for medical concerns.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </main>

        {/* Footer */}
        <footer className="border-t border-gray-200 bg-white p-3 text-center text-sm text-gray-500">
          <p>© 2025 AI Health Consultant | For informational purposes only</p>
        </footer>

        {/* Audio element with onEnded event handler */}
        {audioUrl && (
          <audio
            ref={audioRef}
            className="hidden"
            src={audioUrl}
            controls
            autoPlay
            muted={isMuted}
            onEnded={handleAudioEnded}
          />
        )}
      </div>
    </div>
  );
}

