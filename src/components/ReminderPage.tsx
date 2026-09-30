import React, { useState } from 'react';
import { Bell, Plus, CheckCircle2, Clock, Calendar, Sunrise, Sun, Moon, Trash2, Volume2, Check } from 'lucide-react';
import { ReminderItem } from '../types';

interface ReminderPageProps {
  reminders: ReminderItem[];
  onAddReminder: (newRem: Omit<ReminderItem, 'id' | 'status' | 'date'>) => void;
  onToggleStatus: (id: string) => void;
  onDeleteReminder: (id: string) => void;
  accessibilityMode: boolean;
  speakText: (text: string) => void;
}

export const ReminderPage: React.FC<ReminderPageProps> = ({
  reminders,
  onAddReminder,
  onToggleStatus,
  onDeleteReminder,
  accessibilityMode,
  speakText,
}) => {
  const [showAddModal, setShowAddModal] = useState(false);
  const [activeSlotFilter, setActiveSlotFilter] = useState<'All' | 'Morning' | 'Afternoon' | 'Night'>('All');

  // Form states
  const [medName, setMedName] = useState('');
  const [dosage, setDosage] = useState('1 Tablet');
  const [timeSlot, setTimeSlot] = useState<'Morning' | 'Afternoon' | 'Night'>('Morning');
  const [exactTime, setExactTime] = useState('08:00 AM');
  const [notes, setNotes] = useState('Take with full glass of water');

  const filteredReminders = reminders.filter((rem) => {
    if (activeSlotFilter === 'All') return true;
    return rem.time_slot === activeSlotFilter;
  });

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!medName) return;

    onAddReminder({
      medicine_name: medName,
      dosage,
      time_slot: timeSlot,
      time_exact: exactTime,
      notes,
    });

    setShowAddModal(false);
    setMedName('');
    speakText(`Scheduled new reminder for ${medName} in the ${timeSlot}`);
  };

  const completedCount = reminders.filter(r => r.status === 'Completed').length;
  const totalCount = reminders.length;
  const progressPercent = totalCount ? Math.round((completedCount / totalCount) * 100) : 0;

  return (
    <div className={`max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 ${accessibilityMode ? 'text-lg' : 'text-base'}`}>
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 font-heading">
            Daily Medicine Schedule
          </h1>
          <p className="text-slate-600 mt-1">
            Simple daily checklist for morning, afternoon, and evening medications.
          </p>
        </div>

        <button
          onClick={() => {
            setShowAddModal(true);
            speakText('Opening Add Medicine Reminder modal');
          }}
          className="px-6 py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-extrabold rounded-2xl shadow-lg shadow-blue-600/20 flex items-center justify-center gap-2 transition-all active:scale-95 shrink-0"
        >
          <Plus className="w-5 h-5" />
          <span>Add New Medicine</span>
        </button>
      </div>

      {/* Progress & Calendar Widget */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
        
        {/* Left Today's Date Banner */}
        <div className="md:col-span-4 flex items-center gap-4 bg-slate-50 p-4 rounded-2xl border border-slate-200">
          <div className="w-14 h-14 rounded-2xl bg-blue-600 text-white flex flex-col items-center justify-center shrink-0 shadow-md">
            <span className="text-xs uppercase font-extrabold tracking-widest">TODAY</span>
            <span className="text-xl font-black font-heading leading-none">28</span>
          </div>
          <div>
            <h3 className="text-base font-extrabold text-slate-900 font-heading">Tuesday, July 2026</h3>
            <p className="text-xs font-semibold text-emerald-600">{completedCount} of {totalCount} Doses Completed</p>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="md:col-span-8 space-y-2">
          <div className="flex justify-between items-center text-sm font-bold">
            <span className="text-slate-700">Daily Compliance Rate</span>
            <span className="text-blue-600">{progressPercent}%</span>
          </div>

          <div className="w-full h-4 bg-slate-100 rounded-full overflow-hidden p-0.5 border border-slate-200">
            <div
              className="h-full bg-gradient-to-r from-blue-600 to-emerald-500 rounded-full transition-all duration-500"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>

      </div>

      {/* Time Slot Filters */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-slate-200">
        {(['All', 'Morning', 'Afternoon', 'Night'] as const).map((slot) => {
          const isActive = activeSlotFilter === slot;
          return (
            <button
              key={slot}
              onClick={() => {
                setActiveSlotFilter(slot);
                speakText(`Showing ${slot} schedule`);
              }}
              className={`px-5 py-2.5 rounded-2xl font-bold text-sm flex items-center gap-2 transition-all whitespace-nowrap ${
                isActive
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              {slot === 'Morning' && <Sunrise className="w-4 h-4 text-amber-400" />}
              {slot === 'Afternoon' && <Sun className="w-4 h-4 text-amber-500" />}
              {slot === 'Night' && <Moon className="w-4 h-4 text-indigo-400" />}
              <span>{slot}</span>
            </button>
          );
        })}
      </div>

      {/* Reminder Checklist Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredReminders.map((rem) => {
          const isDone = rem.status === 'Completed';
          return (
            <div
              key={rem.id}
              className={`p-6 rounded-3xl border transition-all flex items-start justify-between gap-4 shadow-sm ${
                isDone
                  ? 'bg-emerald-50/60 border-emerald-200'
                  : 'bg-white border-slate-200 hover:border-blue-300'
              }`}
            >
              <div className="space-y-3 flex-1">
                
                {/* Time Badge */}
                <div className="flex items-center gap-2">
                  <span className={`px-3 py-1 rounded-full text-xs font-extrabold flex items-center gap-1.5 ${
                    rem.time_slot === 'Morning'
                      ? 'bg-amber-100 text-amber-900'
                      : rem.time_slot === 'Afternoon'
                      ? 'bg-blue-100 text-blue-900'
                      : 'bg-indigo-100 text-indigo-900'
                  }`}>
                    <Clock className="w-3.5 h-3.5" />
                    <span>{rem.time_exact} ({rem.time_slot})</span>
                  </span>

                  {isDone && (
                    <span className="px-2.5 py-0.5 text-xs font-bold bg-emerald-100 text-emerald-800 rounded-md">
                      Completed ✓
                    </span>
                  )}
                </div>

                {/* Medicine Title */}
                <div>
                  <h3 className={`text-xl font-extrabold font-heading ${isDone ? 'line-through text-slate-500' : 'text-slate-900'}`}>
                    {rem.medicine_name}
                  </h3>
                  <p className="text-sm font-semibold text-slate-600 mt-0.5">
                    Dosage: <span className="text-slate-800">{rem.dosage}</span>
                  </p>
                </div>

                {rem.notes && (
                  <p className="text-xs text-slate-500 bg-slate-100/80 p-2.5 rounded-xl border border-slate-200">
                    💡 {rem.notes}
                  </p>
                )}

              </div>

              {/* Complete Toggle & Delete Buttons */}
              <div className="flex flex-col items-end gap-2 shrink-0">
                <button
                  onClick={() => {
                    onToggleStatus(rem.id);
                    speakText(isDone ? `Marked ${rem.medicine_name} as pending` : `Marked ${rem.medicine_name} as completed`);
                  }}
                  className={`p-3.5 rounded-2xl font-bold flex items-center justify-center transition-all shadow-md active:scale-95 ${
                    isDone
                      ? 'bg-emerald-600 text-white'
                      : 'bg-blue-50 text-blue-700 hover:bg-blue-600 hover:text-white border border-blue-200'
                  }`}
                  title={isDone ? 'Mark as Pending' : 'Mark as Completed'}
                >
                  <Check className="w-6 h-6 stroke-[3]" />
                </button>

                <button
                  onClick={() => onDeleteReminder(rem.id)}
                  className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors"
                  title="Remove reminder"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

            </div>
          );
        })}
      </div>

      {/* Modal Dialog: Add New Medicine Reminder */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-slate-200 animate-in fade-in zoom-in duration-200">
            <h3 className="text-2xl font-extrabold text-slate-900 font-heading mb-4">
              Add Medicine Reminder
            </h3>

            <form onSubmit={handleFormSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-extrabold text-slate-700 uppercase tracking-wider mb-1">
                  Medicine Name & Strength
                </label>
                <input
                  type="text"
                  required
                  value={medName}
                  onChange={(e) => setMedName(e.target.value)}
                  placeholder="e.g., Paracetamol 500mg"
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-extrabold text-slate-700 uppercase tracking-wider mb-1">
                    Dosage
                  </label>
                  <input
                    type="text"
                    required
                    value={dosage}
                    onChange={(e) => setDosage(e.target.value)}
                    placeholder="e.g. 1 Tablet"
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-extrabold text-slate-700 uppercase tracking-wider mb-1">
                    Time Slot
                  </label>
                  <select
                    value={timeSlot}
                    onChange={(e: any) => setTimeSlot(e.target.value)}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="Morning">Morning 🌅</option>
                    <option value="Afternoon">Afternoon ☀️</option>
                    <option value="Night">Night 🌙</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-extrabold text-slate-700 uppercase tracking-wider mb-1">
                    Exact Alarm Time
                  </label>
                  <input
                    type="text"
                    required
                    value={exactTime}
                    onChange={(e) => setExactTime(e.target.value)}
                    placeholder="e.g. 08:30 AM"
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-extrabold text-slate-700 uppercase tracking-wider mb-1">
                    Special Notes
                  </label>
                  <input
                    type="text"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Take with food"
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="pt-4 flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 py-3.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl font-bold transition-all"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="flex-1 py-3.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-extrabold shadow-md transition-all"
                >
                  Save Schedule
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
