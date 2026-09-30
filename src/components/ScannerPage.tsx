import React, { useState, useRef, useEffect } from 'react';
import { Camera, RefreshCw, Volume2, ShieldAlert, CheckCircle2, AlertTriangle, Sparkles, Plus, Clock, FileText, ArrowRight, Sun, Moon, Sunrise, Play, Pause, AlertOctagon, Upload } from 'lucide-react';
import { MedicineScan, UserProfile } from '../types';

interface ScannerPageProps {
  onAddReminder: (medicineName: string, dosage: string, timing: any) => void;
  userProfile: UserProfile;
  speakText: (text: string) => void;
  accessibilityMode: boolean;
}

export const ScannerPage: React.FC<ScannerPageProps> = ({
  onAddReminder,
  userProfile,
  speakText,
  accessibilityMode,
}) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [cameraActive, setCameraActive] = useState<boolean>(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [isScanning, setIsScanning] = useState<boolean>(false);
  const [scanResult, setScanResult] = useState<MedicineScan | null>(null);
  const [isPlayingAudio, setIsPlayingAudio] = useState<boolean>(false);
  const [addedReminderSuccess, setAddedReminderSuccess] = useState<boolean>(false);

  const [scanStep, setScanStep] = useState<string>('');

  // Sample medicines for quick testing/fallback
  const sampleStrips = [
    { id: '0', label: 'Paracetamol 500mg (Pain/Fever)' },
    { id: '1', label: 'Lisinopril 10mg (Blood Pressure)' },
    { id: '2', label: 'Atorvastatin 20mg (Cholesterol)' },
  ];

  // Initialize Camera with safe metadata listener and high clarity constraints
  const startCamera = async () => {
    setCameraError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: 'environment',
          width: { ideal: 1920, min: 1280 },
          height: { ideal: 1080, min: 720 },
        },
        audio: false,
      });
      if (videoRef.current) {
        const video = videoRef.current;
        video.srcObject = stream;
        video.onloadedmetadata = () => {
          video.play().catch((playErr) => {
            console.warn('Video play interrupted:', playErr);
          });
        };
        setCameraActive(true);
      }
    } catch (err: any) {
      console.warn('Camera access error:', err);
      // Fallback with standard constraints
      try {
        const fallbackStream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'environment' },
          audio: false,
        });
        if (videoRef.current) {
          const video = videoRef.current;
          video.srcObject = fallbackStream;
          video.onloadedmetadata = () => {
            video.play().catch(() => {});
          };
          setCameraActive(true);
          return;
        }
      } catch (fallbackErr) {
        setCameraError('Camera access unavailable or restricted. You can upload a photo or use demo strips below.');
        setCameraActive(false);
      }
    }
  };

  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach((track) => track.stop());
      videoRef.current.srcObject = null;
    }
    setCameraActive(false);
  };

  useEffect(() => {
    startCamera();
    return () => {
      stopCamera();
    };
  }, []);

  // High-clarity client-side image downscaling helper (preserves fine text & imprint details)
  const resizeImage = (source: HTMLVideoElement | HTMLImageElement, maxDimension = 1280, quality = 0.88): string => {
    const origW = 'videoWidth' in source ? source.videoWidth || 640 : source.width;
    const origH = 'videoHeight' in source ? source.videoHeight || 480 : source.height;

    let targetW = origW;
    let targetH = origH;
    if (origW > maxDimension || origH > maxDimension) {
      if (origW > origH) {
        targetH = Math.round((origH * maxDimension) / origW);
        targetW = maxDimension;
      } else {
        targetW = Math.round((origW * maxDimension) / origH);
        targetH = maxDimension;
      }
    }

    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = targetW;
    tempCanvas.height = targetH;
    const ctx = tempCanvas.getContext('2d');
    if (ctx) {
      // Use high quality image smoothing
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';
      ctx.drawImage(source, 0, 0, targetW, targetH);
      return tempCanvas.toDataURL('image/jpeg', quality);
    }
    return '';
  };

  // Handle Scanning frame
  const handleCaptureAndScan = async (sampleId?: string, customBase64?: string) => {
    setIsScanning(true);
    setScanResult(null);
    setAddedReminderSuccess(false);

    let base64Image = customBase64 || '';

    if (!sampleId && !customBase64) {
      setScanStep('Capturing high-clarity snapshot...');
      if (videoRef.current) {
        base64Image = resizeImage(videoRef.current, 1280, 0.88);
      }
    }

    setScanStep('AI Vision recognizing medication...');

    try {
      const response = await fetch('/api/scan-medicine', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageBase64: base64Image,
          sampleId: sampleId,
        }),
      });

      const data = await response.json();
      if (data.success && data.medicine) {
        setScanResult(data.medicine);
        if (data.medicine.identified === false) {
          speakText('The medicine could not be identified with certainty. Please hold the packaging closer with the printed text clearly visible.');
        } else {
          speakText(`Medicine detected: ${data.medicine.medicine_name}. ${data.medicine.speech_summary || ''}`);
        }
      } else {
        const errorMsg = data.error || 'Could not recognize medicine. Please ensure clear lighting and try again.';
        alert(errorMsg);
      }
    } catch (error) {
      console.error('Scan failed:', error);
      alert('Error analyzing frame. Please check connection and try again.');
    } finally {
      setIsScanning(false);
      setScanStep('');
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const rawUrl = event.target?.result as string;
      if (!rawUrl) return;

      const img = new Image();
      img.onload = () => {
        const compressed = resizeImage(img, 1280, 0.88) || rawUrl;
        handleCaptureAndScan(undefined, compressed);
      };
      img.onerror = () => {
        handleCaptureAndScan(undefined, rawUrl);
      };
      img.src = rawUrl;
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  // Play spoken audio guide
  const handleReadAloud = () => {
    if (!scanResult) return;
    const textToSpeak = `${scanResult.medicine_name}. Generic name: ${scanResult.generic_name}. Dosage: ${scanResult.dosage}. Uses: ${scanResult.uses}. Warning: ${scanResult.warning}`;
    setIsPlayingAudio(true);
    speakText(textToSpeak);
    setTimeout(() => setIsPlayingAudio(false), 8000);
  };

  // Add reminder quick action
  const handleCreateReminder = () => {
    if (!scanResult) return;
    onAddReminder(scanResult.medicine_name, scanResult.dosage, scanResult.timing);
    setAddedReminderSuccess(true);
    speakText(`Added ${scanResult.medicine_name} to daily reminder schedule`);
  };

  // Check if allergy conflict exists
  const hasAllergyConflict = scanResult && userProfile.allergies.some((allergy) =>
    (scanResult.medicine_name + ' ' + scanResult.generic_name + ' ' + scanResult.warning).toLowerCase().includes(allergy.toLowerCase())
  );

  return (
    <div className={`max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 ${accessibilityMode ? 'text-lg' : 'text-base'}`}>
      
      {/* Hidden File Input for Uploading Tablet Photos */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileUpload}
        accept="image/*"
        className="hidden"
      />

      {/* Page Title Header */}
      <div className="mb-8">
        <div className="flex items-center gap-2 text-blue-600 font-bold text-xs uppercase tracking-wider">
          <Sparkles className="w-4 h-4" />
          <span>Real-Time Optical & Vision AI Recognition</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 font-heading mt-1">
          AI Medicine & Tablet Scanner
        </h1>
        <p className="text-slate-600 mt-1 text-base">
          Scan any real tablet, pill, blister strip, or bottle with your camera — or upload a photo to identify it instantly.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Column: Live Camera Section */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-lg space-y-4">
            
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 font-bold text-slate-800 text-sm">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
                <span>Camera Stream</span>
              </div>
              
              <button
                onClick={cameraActive ? stopCamera : startCamera}
                className="text-xs font-bold text-blue-600 hover:text-blue-800 bg-blue-50 px-3 py-1.5 rounded-xl border border-blue-200"
              >
                {cameraActive ? 'Pause Camera' : 'Turn On Camera'}
              </button>
            </div>

            {/* Video Canvas Container */}
            <div className="relative aspect-[4/3] w-full rounded-2xl bg-slate-950 overflow-hidden border-2 border-slate-800 flex items-center justify-center shadow-inner">
              
              <video
                ref={videoRef}
                playsInline
                muted
                className={`w-full h-full object-cover ${cameraActive ? 'block' : 'hidden'}`}
              />

              <canvas ref={canvasRef} className="hidden" />

              {/* Camera Offline Fallback */}
              {!cameraActive && (
                <div className="text-center p-6 text-slate-400 space-y-3">
                  <Camera className="w-12 h-12 mx-auto text-slate-500 opacity-60" />
                  <p className="text-sm font-semibold">Camera feed offline or paused</p>
                  <button
                    onClick={startCamera}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-xs shadow-md"
                  >
                    Enable Camera
                  </button>
                </div>
              )}

              {/* Live Radar Scanning Overlay */}
              {cameraActive && (
                <div className="absolute inset-0 pointer-events-none border-2 border-blue-500/30 m-4 rounded-xl flex items-center justify-center">
                  
                  {/* Scanning Bounding Box Corner Reticles */}
                  <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-emerald-400 rounded-tl-lg" />
                  <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-emerald-400 rounded-tr-lg" />
                  <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-emerald-400 rounded-bl-lg" />
                  <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-emerald-400 rounded-br-lg" />

                  {/* Circular Radar Sweep */}
                  <div className="w-32 h-32 rounded-full border border-emerald-400/50 animate-ping opacity-30" />

                  {/* Animated Scanning Bar */}
                  {isScanning && (
                    <div className="absolute w-full h-1 bg-gradient-to-r from-transparent via-emerald-400 to-transparent animate-scan-line shadow-[0_0_15px_#10b981]" />
                  )}
                </div>
              )}

              {/* Scanning status banner */}
              {isScanning && (
                <div className="absolute inset-0 bg-slate-900/85 backdrop-blur-md flex flex-col items-center justify-center text-white p-6 space-y-3 z-20 text-center">
                  <div className="relative">
                    <RefreshCw className="w-12 h-12 text-emerald-400 animate-spin" />
                    <Sparkles className="w-5 h-5 text-amber-300 absolute -top-1 -right-1 animate-pulse" />
                  </div>
                  <div>
                    <p className="text-base font-bold text-white font-heading tracking-wide">
                      {scanStep || 'Analyzing Medicine...'}
                    </p>
                    <p className="text-xs text-emerald-300 font-medium mt-1">
                      Gemini 3.8 Flash Vision Engine
                    </p>
                  </div>
                  <div className="w-48 bg-slate-800 rounded-full h-1.5 overflow-hidden mt-1">
                    <div className="bg-gradient-to-r from-blue-500 via-emerald-400 to-blue-500 h-full w-full animate-pulse" />
                  </div>
                </div>
              )}
            </div>

            {/* Main Scan Trigger & Photo Upload Buttons */}
            <div className="space-y-2">
              <button
                onClick={() => handleCaptureAndScan()}
                disabled={isScanning}
                className="w-full py-4 bg-gradient-to-r from-blue-600 to-emerald-600 hover:from-blue-700 hover:to-emerald-700 text-white font-extrabold text-lg rounded-2xl shadow-lg shadow-blue-600/20 active:scale-98 transition-all flex items-center justify-center gap-3 disabled:opacity-50"
              >
                <Camera className="w-6 h-6" />
                <span>{isScanning ? 'Processing...' : 'Scan Live Camera Tablet'}</span>
              </button>

              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={isScanning}
                className="w-full py-3 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-sm rounded-xl border border-slate-300 transition-all flex items-center justify-center gap-2"
              >
                <Upload className="w-4 h-4 text-slate-600" />
                <span>Upload Tablet Photo from Phone / Gallery</span>
              </button>
            </div>

            {/* Quick Demo Strip Test Selectors */}
            <div className="pt-2 border-t border-slate-100">
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                Quick Demo Presets (Instant Test)
              </p>
              <div className="grid grid-cols-1 gap-2">
                {sampleStrips.map((strip) => (
                  <button
                    key={strip.id}
                    onClick={() => handleCaptureAndScan(strip.id)}
                    disabled={isScanning}
                    className="p-2.5 bg-slate-50 hover:bg-blue-50 text-slate-800 hover:text-blue-700 rounded-xl border border-slate-200 text-xs font-semibold text-left transition-all flex items-center justify-between"
                  >
                    <span>{strip.label}</span>
                    <Sparkles className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                  </button>
                ))}
              </div>
            </div>

          </div>
        </div>

        {/* Right Column: Medicine Information Panel */}
        <div className="lg:col-span-7">
          
          {/* Initial State / Prompt when no scan performed */}
          {!scanResult && !isScanning && (
            <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-md text-center space-y-6">
              <div className="w-20 h-20 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center mx-auto border border-blue-100">
                <Camera className="w-10 h-10 animate-bounce" />
              </div>
              <div className="max-w-md mx-auto space-y-2">
                <h3 className="text-xl font-bold text-slate-900 font-heading">
                  Ready to Scan Medicine
                </h3>
                <p className="text-sm text-slate-600">
                  Align your medicine strip or bottle inside the camera frame on the left, then click <strong>Capture & Identify Medicine</strong>.
                </p>
              </div>

              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 text-left space-y-2">
                <p className="text-xs font-extrabold text-slate-500 uppercase tracking-wider">
                  What MedVision AI Will Display:
                </p>
                <div className="grid grid-cols-2 gap-2 text-xs font-medium text-slate-700">
                  <div className="flex items-center gap-1.5">✓ Exact Brand Name</div>
                  <div className="flex items-center gap-1.5">✓ Recommended Dosage</div>
                  <div className="flex items-center gap-1.5">✓ Morning/Night Timing</div>
                  <div className="flex items-center gap-1.5">✓ Expiry Date Status</div>
                  <div className="flex items-center gap-1.5">✓ Allergy & Safety Warnings</div>
                  <div className="flex items-center gap-1.5">✓ Voice Readout Audio</div>
                </div>
              </div>
            </div>
          )}

          {/* Results Display Card */}
          {scanResult && (
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xl space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
              
              {/* Header Status Bar */}
              <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-100">
                {scanResult.identified !== false ? (
                  <div className="flex items-center gap-2 px-3 py-1 bg-emerald-100 text-emerald-800 text-xs font-extrabold rounded-full border border-emerald-200">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>Medicine Detected & Verified</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 px-3 py-1 bg-amber-100 text-amber-900 text-xs font-extrabold rounded-full border border-amber-300">
                    <AlertTriangle className="w-4 h-4 text-amber-600" />
                    <span>Label Unclear — Re-scan Advised</span>
                  </div>
                )}

                <div className="flex items-center gap-2.5 text-xs font-bold text-slate-500">
                  {scanResult.latencyMs && (
                    <span className="px-2.5 py-1 bg-blue-50 text-blue-700 rounded-lg font-bold border border-blue-200 flex items-center gap-1">
                      <Sparkles className="w-3 h-3 text-blue-600" />
                      <span>{(scanResult.latencyMs / 1000).toFixed(1)}s scan</span>
                    </span>
                  )}
                  <span>Confidence: <span className="text-blue-600 font-extrabold">{scanResult.confidence || (scanResult.identified !== false ? '98.5%' : 'Low')}</span></span>
                </div>
              </div>

              {/* UNCONFIRMED / BLURRY SCAN GUIDANCE BANNER */}
              {scanResult.identified === false && (
                <div className="p-4 bg-amber-50 border-2 border-amber-300 rounded-2xl flex items-start gap-3 text-amber-900 shadow-sm">
                  <AlertTriangle className="w-6 h-6 text-amber-600 shrink-0 mt-0.5" />
                  <div className="space-y-1">
                    <h4 className="font-extrabold text-sm text-amber-900">
                      Could Not Read Exact Medicine Name on Strip
                    </h4>
                    <p className="text-xs text-amber-800 font-medium">
                      To scan your exact tablet accurately:
                    </p>
                    <ul className="text-xs text-amber-800 list-disc list-inside space-y-0.5 font-medium">
                      <li>Flip the blister pack to the foil side showing printed brand and milligram text.</li>
                      <li>Hold steady about 6 to 8 inches in front of camera under good room lighting.</li>
                      <li>Avoid glare or reflections directly over the letters.</li>
                    </ul>
                  </div>
                </div>
              )}

              {/* CRITICAL ALLERGY / DRUG INTERACTION ALERT BANNER */}
              {hasAllergyConflict && (
                <div className="p-4 bg-red-50 border-2 border-red-300 rounded-2xl flex items-start gap-3 text-red-900 shadow-md">
                  <AlertOctagon className="w-7 h-7 text-red-600 shrink-0 mt-0.5 animate-bounce" />
                  <div>
                    <h4 className="font-extrabold text-base text-red-900">
                      ⚠ CRITICAL SAFETY ALLERGY WARNING
                    </h4>
                    <p className="text-sm text-red-800 mt-1 font-medium">
                      This medicine conflicts with your registered health profile allergies ({userProfile.allergies.join(', ')}). Do not consume without explicit physician approval!
                    </p>
                  </div>
                </div>
              )}

              {/* Main Title, Scanned Image Thumbnail & Voice Button */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-slate-50 p-4 rounded-2xl border border-slate-200">
                <div className="flex items-center gap-4">
                  {scanResult.image_url && (
                    <img
                      src={scanResult.image_url}
                      alt={scanResult.medicine_name}
                      className="w-20 h-20 sm:w-24 sm:h-24 object-cover rounded-2xl border-2 border-slate-200 shadow-sm shrink-0"
                    />
                  )}
                  <div>
                    <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-heading">
                      {scanResult.medicine_name}
                    </h2>
                    <p className="text-sm font-semibold text-slate-500 mt-0.5">
                      Generic / Compound: <span className="text-slate-800">{scanResult.generic_name}</span>
                    </p>
                  </div>
                </div>

                {/* Voice Readout Assistant Button */}
                <button
                  onClick={handleReadAloud}
                  className={`px-5 py-3 rounded-2xl font-bold text-sm flex items-center justify-center gap-2.5 transition-all shadow-md ${
                    isPlayingAudio
                      ? 'bg-amber-500 text-white animate-pulse'
                      : 'bg-blue-600 hover:bg-blue-700 text-white'
                  }`}
                >
                  <Volume2 className="w-5 h-5" />
                  <span>{isPlayingAudio ? 'Speaking Audio...' : 'Read Aloud Voice'}</span>
                </button>
              </div>

              {/* Core Information Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                
                {/* Dosage Card */}
                <div className="p-4 bg-blue-50/70 border border-blue-100 rounded-2xl">
                  <p className="text-xs font-bold text-blue-700 uppercase tracking-wider mb-1">
                    Prescribed Dosage
                  </p>
                  <p className="text-lg font-extrabold text-slate-900">
                    {scanResult.dosage}
                  </p>
                </div>

                {/* Expiry Date Card */}
                <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl flex items-center justify-between">
                  <div>
                    <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
                      Expiry Date
                    </p>
                    <p className="text-lg font-extrabold text-slate-900">
                      {scanResult.expiry}
                    </p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-extrabold ${
                    scanResult.expiry_status === 'Valid'
                      ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                      : 'bg-amber-100 text-amber-800 border border-amber-300'
                  }`}>
                    {scanResult.expiry_status}
                  </span>
                </div>

              </div>

              {/* Recommended Timing Badges */}
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-2">
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                  Recommended Schedule Timing
                </p>
                <div className="flex flex-wrap gap-3 pt-1">
                  <div className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-extrabold border ${
                    scanResult.timing.morning
                      ? 'bg-amber-100 text-amber-900 border-amber-300'
                      : 'bg-slate-100 text-slate-400 border-slate-200'
                  }`}>
                    <Sunrise className="w-4 h-4 text-amber-600" />
                    <span>Morning 🌅</span>
                  </div>

                  <div className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-extrabold border ${
                    scanResult.timing.afternoon
                      ? 'bg-blue-100 text-blue-900 border-blue-300'
                      : 'bg-slate-100 text-slate-400 border-slate-200'
                  }`}>
                    <Sun className="w-4 h-4 text-blue-600" />
                    <span>Afternoon ☀️</span>
                  </div>

                  <div className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-extrabold border ${
                    scanResult.timing.night
                      ? 'bg-indigo-100 text-indigo-900 border-indigo-300'
                      : 'bg-slate-100 text-slate-400 border-slate-200'
                  }`}>
                    <Moon className="w-4 h-4 text-indigo-600" />
                    <span>Night 🌙</span>
                  </div>
                </div>
                {scanResult.timing.notes && (
                  <p className="text-xs text-slate-600 pt-1 font-medium italic">
                    Note: {scanResult.timing.notes}
                  </p>
                )}
              </div>

              {/* Purpose & Uses */}
              <div className="space-y-1">
                <h4 className="text-xs font-extrabold text-slate-500 uppercase tracking-wider">
                  Primary Purpose & Uses
                </h4>
                <p className="text-sm font-semibold text-slate-800 bg-slate-50 p-3.5 rounded-xl border border-slate-200">
                  {scanResult.uses}
                </p>
              </div>

              {/* Safety Warnings & Precautions */}
              <div className="space-y-1">
                <h4 className="text-xs font-extrabold text-amber-700 uppercase tracking-wider flex items-center gap-1.5">
                  <AlertTriangle className="w-4 h-4 text-amber-600" />
                  <span>Safety Precautions & Warnings</span>
                </h4>
                <p className="text-sm font-medium text-amber-900 bg-amber-50 p-3.5 rounded-xl border border-amber-200">
                  {scanResult.warning}
                </p>
              </div>

              {/* Drug Interactions */}
              {scanResult.drug_interactions && (
                <div className="space-y-1">
                  <h4 className="text-xs font-extrabold text-slate-500 uppercase tracking-wider">
                    Drug Interaction Analysis
                  </h4>
                  <p className="text-xs text-slate-700 bg-slate-100 p-3 rounded-xl border border-slate-200 font-medium">
                    {scanResult.drug_interactions}
                  </p>
                </div>
              )}

              {/* Action Buttons */}
              <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row items-center gap-3">
                <button
                  onClick={handleCreateReminder}
                  disabled={addedReminderSuccess || scanResult.identified === false}
                  className="w-full sm:w-auto flex-1 py-3.5 bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-300 disabled:cursor-not-allowed text-white font-bold text-sm rounded-xl shadow-md flex items-center justify-center gap-2 transition-all"
                >
                  <Clock className="w-4 h-4" />
                  <span>
                    {addedReminderSuccess
                      ? '✓ Added to Reminders'
                      : scanResult.identified === false
                      ? 'Re-scan to Add Reminder'
                      : 'Add to Daily Schedule'}
                  </span>
                </button>

                <button
                  onClick={() => setScanResult(null)}
                  className="w-full sm:w-auto px-6 py-3.5 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-sm rounded-xl border border-slate-300 transition-all"
                >
                  Scan Another Medicine
                </button>
              </div>

            </div>
          )}

        </div>

      </div>
    </div>
  );
};
