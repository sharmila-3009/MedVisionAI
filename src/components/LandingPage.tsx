import React, { useEffect, useRef } from 'react';
import { Camera, ShieldCheck, Volume2, Users, ArrowRight, Sparkles, AlertCircle, Heart, Clock, CheckCircle2 } from 'lucide-react';
import * as THREE from 'three';

interface LandingPageProps {
  onStartScanning: () => void;
  onExploreReminders: () => void;
  speakText: (text: string) => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({
  onStartScanning,
  onExploreReminders,
  speakText,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Three.js subtle floating pills visual background effect
  useEffect(() => {
    if (!canvasRef.current) return;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, 1, 0.1, 1000);
    camera.position.z = 5;

    const renderer = new THREE.WebGLRenderer({
      canvas: canvasRef.current,
      alpha: true,
      antialias: true,
    });
    renderer.setSize(300, 300);

    // Create 3D pill shapes
    const group = new THREE.Group();

    // Pill 1
    const pillGeo = new THREE.CapsuleGeometry(0.5, 1.2, 16, 32);
    const pillMat1 = new THREE.MeshPhongMaterial({
      color: 0x2563eb,
      shininess: 90,
      transparent: true,
      opacity: 0.85,
    });
    const pill1 = new THREE.Mesh(pillGeo, pillMat1);
    pill1.position.set(-1.2, 0.5, 0);
    pill1.rotation.z = Math.PI / 4;
    group.add(pill1);

    // Pill 2
    const pillMat2 = new THREE.MeshPhongMaterial({
      color: 0x10b981,
      shininess: 90,
      transparent: true,
      opacity: 0.85,
    });
    const pill2 = new THREE.Mesh(pillGeo, pillMat2);
    pill2.position.set(1.2, -0.4, 0);
    pill2.rotation.z = -Math.PI / 3;
    group.add(pill2);

    // Tablet Sphere
    const sphereGeo = new THREE.CylinderGeometry(0.7, 0.7, 0.3, 32);
    const tabletMat = new THREE.MeshPhongMaterial({ color: 0x38bdf8, shininess: 80 });
    const tablet = new THREE.Mesh(sphereGeo, tabletMat);
    tablet.position.set(0, 0, -1);
    tablet.rotation.x = Math.PI / 3;
    group.add(tablet);

    scene.add(group);

    // Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
    scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(0xffffff, 1.2);
    dirLight.position.set(5, 5, 5);
    scene.add(dirLight);

    let animationFrameId: number;
    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      group.rotation.y += 0.008;
      pill1.rotation.x += 0.01;
      pill2.rotation.y += 0.01;
      renderer.render(scene, camera);
    };

    animate();

    return () => {
      cancelAnimationFrame(animationFrameId);
      renderer.dispose();
    };
  }, []);

  return (
    <div className="min-h-[calc(100vh-80px)] bg-gradient-to-b from-blue-50/70 via-white to-slate-50 relative overflow-hidden">
      
      {/* Background Glowing Lights */}
      <div className="absolute top-10 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-gradient-to-r from-blue-400/20 to-emerald-400/20 blur-3xl pointer-events-none rounded-full" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16 relative z-10">
        
        {/* Hero Container */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          {/* Left Text Column */}
          <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
            
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-100/80 text-blue-800 border border-blue-200/80 font-bold text-xs sm:text-sm shadow-sm">
              <Sparkles className="w-4 h-4 text-blue-600 animate-spin" />
              <span>Next-Gen AI Healthcare Assistant for Seniors</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-slate-900 tracking-tight font-heading leading-tight">
              Med<span className="text-blue-600">Vision</span> AI
            </h1>

            <p className="text-xl sm:text-2xl font-bold text-slate-700 max-w-2xl">
              Your Smart Medicine Companion for Safer Healthcare
            </p>

            <p className="text-base sm:text-lg text-slate-600 max-w-xl leading-relaxed">
              Never worry about misreading small pill bottles or dosages again. Simply hold up any tablet or medicine strip to your camera — MedVision instantly detects the medicine name, dosage, timing, and safety warnings in simple spoken audio.
            </p>

            {/* Quick Feature Badges */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-2 text-left">
              <div className="flex items-center gap-2.5 p-3 rounded-2xl bg-white border border-slate-200 shadow-sm">
                <Camera className="w-5 h-5 text-blue-600 shrink-0" />
                <span className="text-xs sm:text-sm font-bold text-slate-800">No Typing Needed</span>
              </div>
              <div className="flex items-center gap-2.5 p-3 rounded-2xl bg-white border border-slate-200 shadow-sm">
                <Volume2 className="w-5 h-5 text-emerald-600 shrink-0" />
                <span className="text-xs sm:text-sm font-bold text-slate-800">Spoken Voice Guide</span>
              </div>
              <div className="flex items-center gap-2.5 p-3 rounded-2xl bg-white border border-slate-200 shadow-sm col-span-2 sm:col-span-1">
                <ShieldCheck className="w-5 h-5 text-amber-600 shrink-0" />
                <span className="text-xs sm:text-sm font-bold text-slate-800">Allergy Safety Guard</span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row items-center gap-4 pt-4 justify-center lg:justify-start">
              <button
                onClick={() => {
                  onStartScanning();
                  speakText('Opening Live AI Medicine Scanner');
                }}
                className="w-full sm:w-auto px-8 py-4 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-extrabold text-lg rounded-2xl shadow-xl shadow-blue-600/30 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-3"
              >
                <Camera className="w-6 h-6 animate-pulse" />
                <span>Start Scanning Now</span>
                <ArrowRight className="w-5 h-5" />
              </button>

              <button
                onClick={() => {
                  onExploreReminders();
                  speakText('Opening Daily Medication Schedule');
                }}
                className="w-full sm:w-auto px-6 py-4 bg-white hover:bg-slate-100 text-slate-800 font-bold text-base rounded-2xl border border-slate-300 shadow-sm hover:scale-[1.02] transition-all flex items-center justify-center gap-2"
              >
                <Clock className="w-5 h-5 text-slate-600" />
                <span>View Daily Reminders</span>
              </button>
            </div>
          </div>

          {/* Right Scanner Graphic / Three.js Visual */}
          <div className="lg:col-span-5 flex justify-center relative">
            
            {/* Visual Glass Box */}
            <div className="relative w-full max-w-md bg-white/80 backdrop-blur-xl rounded-3xl p-6 border border-slate-200/80 shadow-2xl space-y-6">
              
              {/* Animated Floating Canvas */}
              <div className="relative aspect-square w-full rounded-2xl bg-gradient-to-tr from-slate-900 via-slate-800 to-blue-950 flex flex-col items-center justify-center overflow-hidden border border-slate-700/60 shadow-inner">
                
                {/* 3D Canvas element */}
                <canvas ref={canvasRef} className="absolute inset-0 w-full h-full pointer-events-none" />

                {/* Radar Overlay Grid */}
                <div className="absolute inset-0 bg-[radial-gradient(#38bdf8_1px,transparent_1px)] [background-size:16px_16px] opacity-20 pointer-events-none" />
                
                {/* Circular Radar Sweep */}
                <div className="w-48 h-48 rounded-full border-2 border-dashed border-blue-400/60 animate-spin-slow flex items-center justify-center relative z-10 pointer-events-none">
                  <div className="w-36 h-36 rounded-full border border-emerald-400/40 animate-pulse flex items-center justify-center">
                    <Camera className="w-10 h-10 text-white drop-shadow-lg" />
                  </div>
                </div>

                {/* Simulated Scanner Line */}
                <div className="absolute w-full h-1 bg-gradient-to-r from-transparent via-emerald-400 to-transparent animate-scan-line shadow-[0_0_15px_#10b981]" />

                <div className="absolute bottom-3 px-3 py-1 bg-slate-900/90 text-emerald-400 text-xs font-bold rounded-full border border-emerald-500/40 flex items-center gap-1.5 shadow-md">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                  AI Vision Engine Active
                </div>
              </div>

              {/* Sample Live Result Card Preview */}
              <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 flex items-center justify-between shadow-sm">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-500 text-white flex items-center justify-center shrink-0">
                    <CheckCircle2 className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-900">Paracetamol 500mg</h4>
                    <p className="text-xs text-emerald-800 font-medium">Verified Valid • Exp: 08/2027</p>
                  </div>
                </div>
                <span className="px-2.5 py-1 text-xs font-extrabold bg-emerald-200 text-emerald-900 rounded-lg">
                  1 Tablet
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* 3 Step Simple Process */}
        <div className="mt-20 pt-12 border-t border-slate-200">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-heading">
              Designed Specially for Senior Ease of Use
            </h2>
            <p className="text-slate-600 mt-2 font-medium">
              3 simple steps with zero complicated passwords or typing
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm relative hover:shadow-md transition-shadow">
              <div className="w-12 h-12 rounded-2xl bg-blue-100 text-blue-700 font-black text-xl flex items-center justify-center mb-4">
                1
              </div>
              <h3 className="text-lg font-bold text-slate-900 font-heading">Show Medicine Strip</h3>
              <p className="text-sm text-slate-600 mt-2 leading-relaxed">
                Open camera and hold any pill strip or bottle in front of your screen. No manual photo upload required.
              </p>
            </div>

            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm relative hover:shadow-md transition-shadow">
              <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-700 font-black text-xl flex items-center justify-center mb-4">
                2
              </div>
              <h3 className="text-lg font-bold text-slate-900 font-heading">Instant AI Extraction</h3>
              <p className="text-sm text-slate-600 mt-2 leading-relaxed">
                Gemini AI reads the small text, identifies dosage, timing, and cross-checks with your allergy registry.
              </p>
            </div>

            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm relative hover:shadow-md transition-shadow">
              <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-700 font-black text-xl flex items-center justify-center mb-4">
                3
              </div>
              <h3 className="text-lg font-bold text-slate-900 font-heading">Voice Guidance & Sync</h3>
              <p className="text-sm text-slate-600 mt-2 leading-relaxed">
                Listen to spoken instructions out loud, sync reminders to your daily schedule, and keep caregivers updated.
              </p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};
