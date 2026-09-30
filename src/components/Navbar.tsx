import React, { useState } from 'react';
import { Camera, ShieldAlert, History, Bell, Users, User, Heart, PhoneCall, Volume2 } from 'lucide-react';

interface NavbarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  accessibilityMode: boolean;
  setAccessibilityMode: (val: boolean | ((prev: boolean) => boolean)) => void;
  speakText: (text: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  accessibilityMode,
  setAccessibilityMode,
  speakText,
}) => {
  const [showSosModal, setShowSosModal] = useState(false);

  const navItems = [
    { id: 'landing', label: 'Home', icon: Heart },
    { id: 'scanner', label: 'AI Scanner', icon: Camera, badge: 'Live' },
    { id: 'history', label: 'Medicine Log', icon: History },
    { id: 'reminders', label: 'Daily Schedule', icon: Bell },
    { id: 'family', label: 'Family Portal', icon: Users },
    { id: 'profile', label: 'Health Profile', icon: User },
  ];

  const handleTabClick = (id: string, label: string) => {
    setActiveTab(id);
    speakText(`Switched to ${label} page`);
  };

  return (
    <>
      <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-slate-200 shadow-sm transition-all">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            
            {/* Logo */}
            <button
              onClick={() => handleTabClick('landing', 'Home')}
              className="flex items-center gap-3 text-left group focus:outline-none"
            >
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-blue-600 to-emerald-500 flex items-center justify-center text-white shadow-md shadow-blue-500/20 group-hover:scale-105 transition-transform">
                <Camera className="w-6 h-6 animate-pulse" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="text-xl sm:text-2xl font-extrabold font-heading text-slate-900 tracking-tight">
                    Med<span className="text-blue-600">Vision</span> AI
                  </span>
                  <span className="px-2 py-0.5 text-xs font-semibold bg-emerald-100 text-emerald-800 rounded-full border border-emerald-200">
                    ElderCare
                  </span>
                </div>
                <p className="text-xs text-slate-500 hidden sm:block">Smart Medicine Recognition Assistant</p>
              </div>
            </button>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center gap-1.5 bg-slate-100/80 p-1.5 rounded-2xl border border-slate-200/80">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => handleTabClick(item.id, item.label)}
                    className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-semibold transition-all text-sm sm:text-base ${
                      isActive
                        ? 'bg-white text-blue-700 shadow-sm border border-slate-200/60 font-bold'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
                    }`}
                  >
                    <Icon className={`w-4 h-4 ${isActive ? 'text-blue-600' : 'text-slate-500'}`} />
                    <span>{item.label}</span>
                    {item.badge && (
                      <span className="px-1.5 py-0.5 text-[10px] uppercase font-extrabold bg-blue-600 text-white rounded-md">
                        {item.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </nav>

            {/* Controls Right */}
            <div className="flex items-center gap-2 sm:gap-3">
              {/* Senior Font / High Contrast Accessibility Toggle */}
              <button
                onClick={() => {
                  setAccessibilityMode((prev) => !prev);
                  speakText(accessibilityMode ? 'Standard text size' : 'Elderly Large Text Mode activated');
                }}
                title="Toggle Large Elder Font Mode"
                className={`p-2.5 rounded-xl border flex items-center gap-1.5 text-xs font-bold transition-all ${
                  accessibilityMode
                    ? 'bg-amber-100 text-amber-900 border-amber-300 ring-2 ring-amber-400'
                    : 'bg-slate-100 text-slate-700 border-slate-200 hover:bg-slate-200'
                }`}
              >
                <Volume2 className="w-4 h-4 text-amber-600" />
                <span className="hidden sm:inline">
                  {accessibilityMode ? 'Large Text: ON' : 'Large Text'}
                </span>
              </button>

              {/* Emergency SOS Button */}
              <button
                onClick={() => setShowSosModal(true)}
                className="flex items-center gap-2 px-3.5 py-2.5 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl shadow-md shadow-red-500/20 active:scale-95 transition-all text-xs sm:text-sm"
              >
                <PhoneCall className="w-4 h-4 animate-bounce" />
                <span>Emergency SOS</span>
              </button>
            </div>
          </div>

          {/* Mobile Bottom Navigation Bar */}
          <div className="lg:hidden flex items-center justify-around py-2 border-t border-slate-200 overflow-x-auto gap-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleTabClick(item.id, item.label)}
                  className={`flex flex-col items-center justify-center p-2 rounded-xl min-w-[60px] text-xs font-medium transition-all ${
                    isActive
                      ? 'text-blue-700 font-bold bg-blue-50'
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  <Icon className={`w-5 h-5 mb-0.5 ${isActive ? 'text-blue-600' : 'text-slate-500'}`} />
                  <span className="truncate max-w-[68px]">{item.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </header>

      {/* Emergency SOS Modal */}
      {showSosModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-red-100 animate-in fade-in zoom-in duration-200">
            <div className="w-16 h-16 rounded-full bg-red-100 text-red-600 flex items-center justify-center mx-auto mb-4">
              <ShieldAlert className="w-9 h-9" />
            </div>
            <h3 className="text-2xl font-bold text-center text-slate-900 font-heading">
              Emergency Assistance
            </h3>
            <p className="text-slate-600 text-center text-sm mt-2">
              If you feel unwell or suspect a dangerous medication error, reach out immediately.
            </p>

            <div className="mt-6 space-y-3">
              <a
                href="tel:911"
                className="w-full py-4 bg-red-600 hover:bg-red-700 text-white rounded-2xl font-bold flex items-center justify-center gap-3 text-lg shadow-lg shadow-red-600/30"
              >
                <PhoneCall className="w-6 h-6" />
                Call Emergency Dispatch (911)
              </a>

              <a
                href="tel:18002221222"
                className="w-full py-3.5 bg-amber-500 hover:bg-amber-600 text-white rounded-2xl font-bold flex items-center justify-center gap-3 text-base shadow-md"
              >
                <PhoneCall className="w-5 h-5" />
                Poison Control Center (1-800-222-1222)
              </a>

              <div className="p-4 bg-slate-100 rounded-2xl border border-slate-200">
                <p className="text-xs text-slate-500 uppercase font-extrabold tracking-wider">Primary Family Contact</p>
                <p className="text-base font-bold text-slate-800 mt-1">Sarah Jenkins (Daughter)</p>
                <p className="text-sm text-blue-600 font-semibold">(555) 019-2834</p>
              </div>
            </div>

            <button
              onClick={() => setShowSosModal(false)}
              className="w-full mt-5 py-3 bg-slate-200 hover:bg-slate-300 text-slate-800 rounded-xl font-bold transition-all text-sm"
            >
              Close Window
            </button>
          </div>
        </div>
      )}
    </>
  );
};
