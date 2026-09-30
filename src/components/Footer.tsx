import React from 'react';
import { Camera, ShieldCheck, Heart, PhoneCall } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-slate-900 text-slate-300 pt-12 pb-8 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
          
          {/* Brand Info */}
          <div className="md:col-span-5 space-y-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-blue-600 to-emerald-500 flex items-center justify-center text-white font-bold">
                <Camera className="w-4 h-4" />
              </div>
              <span className="text-xl font-extrabold text-white font-heading">
                Med<span className="text-blue-400">Vision</span> AI
              </span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed max-w-sm">
              Smart Medicine Recognition Assistant for Elderly Healthcare. Empowering seniors with computer vision, voice guidance, and family monitoring.
            </p>
          </div>

          {/* Quick Helplines */}
          <div className="md:col-span-4 space-y-2 bg-slate-800/60 p-4 rounded-2xl border border-slate-700/60">
            <h4 className="text-xs font-extrabold text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
              <PhoneCall className="w-3.5 h-3.5 text-red-400" />
              <span>Emergency Healthcare Contacts</span>
            </h4>
            <p className="text-xs text-slate-300">
              National Emergency: <strong className="text-white">911</strong>
            </p>
            <p className="text-xs text-slate-300">
              Poison Control Helpline: <strong className="text-white">1-800-222-1222</strong>
            </p>
          </div>

          {/* Security & Compliance */}
          <div className="md:col-span-3 space-y-2">
            <h4 className="text-xs font-extrabold text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>Clinical Safety Guard</span>
            </h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Gemini Vision Multimodal OCR & Allergy Cross-Reference Engine.
            </p>
          </div>

        </div>

        {/* Disclaimer & Copyright */}
        <div className="pt-6 border-t border-slate-800/80 text-center space-y-2">
          <p className="text-[11px] text-slate-500 max-w-3xl mx-auto leading-relaxed">
            <strong>Disclaimer:</strong> MedVision AI is designed as a smart decision support tool to assist elderly individuals in reading medicine packaging. It does not replace professional medical advice, diagnosis, or treatment. Always consult a certified pharmacist or medical doctor regarding prescriptions.
          </p>
          <p className="text-xs text-slate-500 font-medium">
            © 2026 MedVision AI Healthcare • Empowered by AI Studio & Gemini Vision
          </p>
        </div>

      </div>
    </footer>
  );
};
