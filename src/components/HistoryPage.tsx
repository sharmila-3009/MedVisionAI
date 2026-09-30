import React, { useState } from 'react';
import { Search, Filter, Trash2, Calendar, ShieldAlert, Sparkles, BarChart2, CheckCircle2, Clock } from 'lucide-react';
import { MedicineScan } from '../types';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';

interface HistoryPageProps {
  history: MedicineScan[];
  onDeleteScan: (id: string) => void;
  accessibilityMode: boolean;
  speakText: (text: string) => void;
}

export const HistoryPage: React.FC<HistoryPageProps> = ({
  history,
  onDeleteScan,
  accessibilityMode,
  speakText,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'All' | 'Valid' | 'Expiring Soon' | 'Expired'>('All');

  const filteredHistory = history.filter((item) => {
    const matchesSearch =
      item.medicine_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.generic_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.uses.toLowerCase().includes(searchTerm.toLowerCase());

    if (filterStatus === 'All') return matchesSearch;
    return matchesSearch && item.expiry_status === filterStatus;
  });

  // Chart data for Recharts
  const chartData = [
    { name: 'Pain/Fever', count: history.filter(h => h.uses.toLowerCase().includes('fever') || h.uses.toLowerCase().includes('pain')).length || 2, color: '#2563eb' },
    { name: 'Blood Pressure', count: history.filter(h => h.uses.toLowerCase().includes('blood pressure') || h.medicine_name.toLowerCase().includes('lisinopril')).length || 1, color: '#10b981' },
    { name: 'Diabetes', count: history.filter(h => h.uses.toLowerCase().includes('diabetes') || h.medicine_name.toLowerCase().includes('metformin')).length || 1, color: '#f59e0b' },
    { name: 'Antibiotic', count: history.filter(h => h.uses.toLowerCase().includes('antibiotic') || h.medicine_name.toLowerCase().includes('amoxicillin')).length || 1, color: '#ef4444' },
  ];

  return (
    <div className={`max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 ${accessibilityMode ? 'text-lg' : 'text-base'}`}>
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 font-heading">
            Medicine Scan History
          </h1>
          <p className="text-slate-600 mt-1">
            Review all previously scanned tablet strips, expiry status, and prescription details.
          </p>
        </div>

        <div className="flex items-center gap-2 px-4 py-2 bg-blue-50 border border-blue-200 text-blue-800 rounded-2xl font-bold text-sm shrink-0">
          <Clock className="w-4 h-4 text-blue-600" />
          <span>Total Logged: {history.length} Medicines</span>
        </div>
      </div>

      {/* Analytics Dashboard Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Recharts Analytics Chart */}
        <div className="lg:col-span-8 bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-extrabold text-slate-900 text-lg font-heading flex items-center gap-2">
              <BarChart2 className="w-5 h-5 text-blue-600" />
              <span>Scanned Medicines Category Breakdown</span>
            </h3>
            <span className="text-xs text-slate-500 font-medium">Updated Live</span>
          </div>

          <div className="h-48 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <XAxis dataKey="name" tick={{ fontSize: 12, fill: '#64748b' }} />
                <YAxis allowDecimals={false} tick={{ fontSize: 12, fill: '#64748b' }} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderRadius: '12px', border: 'none', color: '#fff' }}
                />
                <Bar dataKey="count" radius={[8, 8, 0, 0]}>
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Quick Health Summary Card */}
        <div className="lg:col-span-4 bg-gradient-to-br from-blue-900 to-slate-900 text-white p-6 rounded-3xl shadow-lg flex flex-col justify-between space-y-4">
          <div className="space-y-2">
            <span className="px-3 py-1 bg-blue-500/30 text-blue-300 text-xs font-bold rounded-full border border-blue-400/30">
              Elderly Safety Audit
            </span>
            <h3 className="text-xl font-extrabold font-heading">
              Medication Log Status
            </h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              All scans are stored locally and synced with caregiver family monitoring alerts.
            </p>
          </div>

          <div className="space-y-2 pt-2 border-t border-slate-700/60">
            <div className="flex justify-between text-xs">
              <span className="text-slate-300">Valid Unexpired:</span>
              <span className="font-bold text-emerald-400">
                {history.filter(h => h.expiry_status === 'Valid').length}
              </span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-slate-300">Expiring Soon:</span>
              <span className="font-bold text-amber-400">
                {history.filter(h => h.expiry_status === 'Expiring Soon').length}
              </span>
            </div>
          </div>
        </div>

      </div>

      {/* Search & Filter Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
        
        {/* Search Input */}
        <div className="relative w-full sm:w-80">
          <Search className="w-5 h-5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search medicine name, generic, or use..."
            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 rounded-xl border border-slate-200 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Filter Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto">
          {(['All', 'Valid', 'Expiring Soon', 'Expired'] as const).map((status) => (
            <button
              key={status}
              onClick={() => {
                setFilterStatus(status);
                speakText(`Filtering scans by ${status}`);
              }}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                filterStatus === status
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {status}
            </button>
          ))}
        </div>

      </div>

      {/* Scan History Cards Grid */}
      {filteredHistory.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 space-y-3">
          <Clock className="w-12 h-12 text-slate-400 mx-auto" />
          <h3 className="text-lg font-bold text-slate-800 font-heading">No Scanned Records Found</h3>
          <p className="text-sm text-slate-500 max-w-sm mx-auto">
            Try adjusting your search terms or scan your first medicine strip from the AI Scanner page.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredHistory.map((item) => (
            <div
              key={item.id}
              className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm hover:shadow-md transition-shadow space-y-4 relative flex flex-col justify-between"
            >
              <div className="space-y-3">
                
                {/* Header Image & Status */}
                <div className="flex items-start justify-between gap-2">
                  <div className="w-14 h-14 rounded-2xl bg-blue-50 overflow-hidden border border-slate-200 shrink-0">
                    <img
                      src={item.image_url || 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=300&auto=format&fit=crop&q=80'}
                      alt={item.medicine_name}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  <span
                    className={`px-3 py-1 rounded-full text-xs font-extrabold border ${
                      item.expiry_status === 'Valid'
                        ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                        : item.expiry_status === 'Expiring Soon'
                        ? 'bg-amber-100 text-amber-800 border-amber-300'
                        : 'bg-red-100 text-red-800 border-red-300'
                    }`}
                  >
                    {item.expiry_status}
                  </span>
                </div>

                {/* Title & Generic */}
                <div>
                  <h3 className="text-lg font-extrabold text-slate-900 font-heading leading-tight">
                    {item.medicine_name}
                  </h3>
                  <p className="text-xs font-semibold text-slate-500 mt-0.5">
                    {item.generic_name}
                  </p>
                </div>

                {/* Dosage & Timing */}
                <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100 space-y-1.5 text-xs">
                  <div className="flex justify-between">
                    <span className="text-slate-500 font-medium">Dosage:</span>
                    <span className="font-extrabold text-slate-800">{item.dosage}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500 font-medium">Expiry:</span>
                    <span className="font-bold text-slate-800">{item.expiry}</span>
                  </div>
                </div>

                {/* Uses */}
                <p className="text-xs text-slate-600 font-medium line-clamp-2">
                  {item.uses}
                </p>

              </div>

              {/* Card Footer: Timestamp & Delete */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                <span className="text-slate-400 font-medium">
                  {new Date(item.scan_time).toLocaleDateString()}
                </span>

                <button
                  onClick={() => {
                    onDeleteScan(item.id);
                    speakText(`Deleted ${item.medicine_name} from scan history`);
                  }}
                  className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors"
                  title="Delete record"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

            </div>
          ))}
        </div>
      )}

    </div>
  );
};
