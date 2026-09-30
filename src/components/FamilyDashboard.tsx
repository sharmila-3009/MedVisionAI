import React, { useState } from 'react';
import { Users, CheckCircle2, AlertTriangle, Phone, Send, ShieldCheck, Heart, TrendingUp, BellRing, Clock } from 'lucide-react';
import { FamilyMonitoringData } from '../types';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip } from 'recharts';

interface FamilyDashboardProps {
  monitoringData: FamilyMonitoringData;
  accessibilityMode: boolean;
  speakText: (text: string) => void;
}

export const FamilyDashboard: React.FC<FamilyDashboardProps> = ({
  monitoringData,
  accessibilityMode,
  speakText,
}) => {
  const [nudgeSent, setNudgeSent] = useState(false);

  const handleSendNudge = () => {
    setNudgeSent(true);
    speakText(`Sent polite medication reminder notification to ${monitoringData.elderly_name}`);
    setTimeout(() => setNudgeSent(false), 4000);
  };

  return (
    <div className={`max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 ${accessibilityMode ? 'text-lg' : 'text-base'}`}>
      
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-emerald-600 font-bold text-xs uppercase tracking-wider">
            <Heart className="w-4 h-4 fill-emerald-600" />
            <span>Caregiver Portal</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 font-heading mt-1">
            Elderly Family Monitoring
          </h1>
          <p className="text-slate-600 mt-1">
            Real-time compliance tracking and safety oversight for <strong className="text-slate-900">{monitoringData.elderly_name}</strong>.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-3">
          <button
            onClick={handleSendNudge}
            disabled={nudgeSent}
            className="px-5 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-2xl shadow-md flex items-center gap-2 transition-all active:scale-95 text-xs sm:text-sm"
          >
            <BellRing className="w-4 h-4" />
            <span>{nudgeSent ? '✓ Nudge Sent!' : 'Send Caregiver Nudge'}</span>
          </button>

          <a
            href="tel:5550192834"
            className="px-5 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-2xl shadow-md flex items-center gap-2 transition-all text-xs sm:text-sm"
          >
            <Phone className="w-4 h-4" />
            <span>Call Relative</span>
          </a>
        </div>
      </div>

      {/* Top Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Compliance Dial Card */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex items-center gap-5">
          <div className="w-20 h-20 rounded-2xl bg-emerald-100 text-emerald-700 flex flex-col items-center justify-center shrink-0 border border-emerald-200 shadow-inner">
            <span className="text-2xl font-black font-heading leading-none">
              {monitoringData.compliance_rate}%
            </span>
            <span className="text-[10px] font-extrabold uppercase tracking-wider mt-1">Adherence</span>
          </div>
          <div>
            <h3 className="font-extrabold text-slate-900 text-lg font-heading">7-Day Compliance</h3>
            <p className="text-xs text-slate-500 mt-1">Excellent adherence rate. Morning doses taken consistently on time.</p>
          </div>
        </div>

        {/* Safety Status Card */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex items-center gap-5">
          <div className="w-20 h-20 rounded-2xl bg-blue-100 text-blue-700 flex items-center justify-center shrink-0 border border-blue-200">
            <ShieldCheck className="w-10 h-10" />
          </div>
          <div>
            <h3 className="font-extrabold text-slate-900 text-lg font-heading">Allergy Guard</h3>
            <p className="text-xs text-slate-500 mt-1">1 Scan Flagged (Amoxicillin blocked due to Penicillin allergy registry).</p>
          </div>
        </div>

        {/* Connected Caregiver Card */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex items-center gap-5">
          <div className="w-20 h-20 rounded-2xl bg-indigo-100 text-indigo-700 flex items-center justify-center shrink-0 border border-indigo-200">
            <Users className="w-10 h-10" />
          </div>
          <div>
            <h3 className="font-extrabold text-slate-900 text-lg font-heading">Active Caregiver</h3>
            <p className="text-xs font-semibold text-slate-800 mt-0.5">Sarah Jenkins (Daughter)</p>
            <p className="text-[11px] text-slate-500">sarah.jenkins@family.care</p>
          </div>
        </div>

      </div>

      {/* Main Grid: Schedule Status vs Adherence Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left: Today's Medication Taken Status */}
        <div className="lg:col-span-7 bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-extrabold text-slate-900 font-heading flex items-center gap-2">
              <Clock className="w-5 h-5 text-blue-600" />
              <span>Today's Dosage Status</span>
            </h2>
            <span className="text-xs font-bold text-slate-500 bg-slate-100 px-3 py-1 rounded-full">
              Live Tracker
            </span>
          </div>

          <div className="space-y-3">
            {monitoringData.todays_schedule.map((item, idx) => {
              const isCompleted = item.status === 'Completed';
              return (
                <div
                  key={idx}
                  className={`p-4 rounded-2xl border flex items-center justify-between gap-4 transition-all ${
                    isCompleted ? 'bg-emerald-50/70 border-emerald-200' : 'bg-slate-50 border-slate-200'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                      isCompleted ? 'bg-emerald-500 text-white' : 'bg-slate-200 text-slate-600'
                    }`}>
                      {isCompleted ? <CheckCircle2 className="w-6 h-6" /> : <Clock className="w-5 h-5" />}
                    </div>

                    <div>
                      <h4 className="font-extrabold text-slate-900 text-base">{item.medicine}</h4>
                      <p className="text-xs text-slate-500 font-medium">Scheduled: {item.time}</p>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className={`px-3 py-1 rounded-full text-xs font-extrabold ${
                      isCompleted
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-amber-100 text-amber-800'
                    }`}>
                      {isCompleted ? 'Completed ✓' : 'Pending ⏳'}
                    </span>
                    {item.time_taken && (
                      <p className="text-[11px] text-slate-400 mt-1 font-medium">
                        Taken at {item.time_taken}
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right: Weekly Adherence Trend Chart */}
        <div className="lg:col-span-5 bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-6">
          <h2 className="text-xl font-extrabold text-slate-900 font-heading flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-emerald-600" />
            <span>Weekly Adherence Trend</span>
          </h2>

          <div className="h-56 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={monitoringData.weekly_adherence} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorTaken" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="day" tick={{ fontSize: 12, fill: '#64748b' }} />
                <YAxis allowDecimals={false} tick={{ fontSize: 12, fill: '#64748b' }} />
                <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderRadius: '12px', color: '#fff' }} />
                <Area type="monotone" dataKey="taken" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#colorTaken)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          <p className="text-xs text-slate-500 leading-relaxed bg-slate-50 p-3 rounded-xl border border-slate-200">
            📊 <strong>Caregiver Insight:</strong> Mary has maintained a 92% adherence rate over the past 30 days. Consistent medication timing reduces health risk events significantly.
          </p>
        </div>

      </div>

      {/* Recent Caregiver Alerts Feed */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-4">
        <h2 className="text-xl font-extrabold text-slate-900 font-heading flex items-center gap-2">
          <AlertTriangle className="w-5 h-5 text-amber-500" />
          <span>Caregiver Activity & Safety Log</span>
        </h2>

        <div className="space-y-3">
          {monitoringData.recent_alerts.map((alert) => (
            <div
              key={alert.id}
              className={`p-4 rounded-2xl border flex items-start gap-3.5 ${
                alert.level === 'warning'
                  ? 'bg-amber-50 border-amber-200 text-amber-900'
                  : 'bg-blue-50 border-blue-200 text-blue-900'
              }`}
            >
              <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm font-bold">{alert.message}</p>
                <p className="text-xs text-slate-500 mt-1 font-medium">{alert.timestamp}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
};
