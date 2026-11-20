import React, { useState } from 'react';
import {
  History,
  Sprout,
  ShieldAlert,
  Droplets,
  TestTube2,
  Mic,
  Trash2,
  Search
} from 'lucide-react';
import {
  AdvisoryLogRecord,
  AdvisoryCategory,
  CropAdvisoryHistoryRecord,
  Language,
  LANGUAGE_OPTIONS
} from '../types';
import { translations } from '../translations';
import { deleteAdvisoryLog, deleteCropHistory } from '../firebase';

interface FarmerHistoryViewProps {
  userId: string;
  advisoryLogs: AdvisoryLogRecord[];
  cropHistory: CropAdvisoryHistoryRecord[];
  loading: boolean;
  language: Language;
}

export const FarmerHistoryView: React.FC<FarmerHistoryViewProps> = ({
  userId,
  advisoryLogs,
  cropHistory,
  loading,
  language
}) => {
  const t = translations[language];
  const [filterCategory, setFilterCategory] = useState<'all' | AdvisoryCategory>('all');
  const [searchTerm, setSearchTerm] = useState('');

  const formatTimestamp = (ts: unknown): string => {
    if (!ts) return 'Just now';
    const seconds = (ts as { seconds?: number })?.seconds;
    if (typeof seconds === 'number') {
      return new Date(seconds * 1000).toLocaleString(undefined, {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    }
    return 'Saved';
  };

  const getLangName = (code: Language) =>
    LANGUAGE_OPTIONS.find((l) => l.code === code)?.nativeLabel || code.toUpperCase();

  const categoryIcon = (cat: AdvisoryCategory) => {
    switch (cat) {
      case 'crop':
        return <Sprout className="w-4 h-4 text-emerald-700" />;
      case 'disease':
        return <ShieldAlert className="w-4 h-4 text-amber-600" />;
      case 'irrigation':
        return <Droplets className="w-4 h-4 text-cyan-700" />;
      case 'fertilizer':
        return <TestTube2 className="w-4 h-4 text-emerald-700" />;
      case 'voice':
        return <Mic className="w-4 h-4 text-indigo-700" />;
    }
  };

  const categoryLabel = (cat: AdvisoryCategory) => {
    switch (cat) {
      case 'crop':
        return 'Crop Advisory';
      case 'disease':
        return 'Disease Scan';
      case 'irrigation':
        return 'Irrigation';
      case 'fertilizer':
        return 'Fertilizer';
      case 'voice':
        return 'Voice AI';
    }
  };

  const filteredLogs = advisoryLogs.filter((log) => {
    const matchesCat = filterCategory === 'all' || log.category === filterCategory;
    const q = searchTerm.trim().toLowerCase();
    const matchesQuery =
      !q ||
      log.title.toLowerCase().includes(q) ||
      log.summary.toLowerCase().includes(q) ||
      log.cropName.toLowerCase().includes(q);
    return matchesCat && matchesQuery;
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-200 pb-12">
      {/* Header */}
      <div className="bg-white rounded-2xl p-6 border border-emerald-100/80 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-emerald-800 text-white flex items-center justify-center shrink-0">
            <History className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900">{t.farmerHistory}</h2>
            <p className="text-xs text-gray-500 mt-0.5">
              Complete chronological ledger of your soil NPK tests, disease checks, irrigation plans, fertilizer guides, and Voice AI consultations.
            </p>
          </div>
        </div>
        <div className="text-xs font-mono-tabular text-emerald-900 font-semibold shrink-0">
          {advisoryLogs.length} Saved Records
        </div>
      </div>

      {/* Filters & Search */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search crop, disease, or advice..."
            className="w-full bg-white border border-emerald-100 rounded-xl pl-9 pr-3 py-2 text-xs text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-700"
          />
        </div>

        <div className="flex items-center gap-1 p-1 bg-white border border-emerald-100 rounded-xl overflow-x-auto">
          {(
            [
              { id: 'all', label: 'All' },
              { id: 'crop', label: 'Crop' },
              { id: 'disease', label: 'Disease' },
              { id: 'irrigation', label: 'Irrigation' },
              { id: 'fertilizer', label: 'Fertilizer' },
              { id: 'voice', label: 'Voice AI' }
            ] as const
          ).map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setFilterCategory(tab.id)}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                filterCategory === tab.id
                  ? 'bg-emerald-800 text-white'
                  : 'text-gray-600 hover:bg-emerald-50'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Advisory Timeline List */}
      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-24 rounded-2xl bg-white border border-emerald-100 animate-pulse" />
          ))}
        </div>
      ) : filteredLogs.length === 0 ? (
        <div className="bg-white rounded-2xl p-10 text-center border border-emerald-100 space-y-2">
          <History className="w-10 h-10 text-emerald-700 mx-auto" />
          <h3 className="font-bold text-gray-900 text-base">No Saved History Entries Yet</h3>
          <p className="text-xs text-gray-500 max-w-md mx-auto">
            Run a Crop Suggestion, Disease Check, Irrigation calculation, Fertilizer plan, or ask Voice AI a question — every consultation is automatically stored here.
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-emerald-100 divide-y divide-gray-100">
          {filteredLogs.map((log) => (
            <div
              key={log.id}
              className="p-4 sm:p-5 flex items-start justify-between gap-4 hover:bg-stone-50/60 transition-colors"
            >
              <div className="flex items-start gap-3.5 min-w-0">
                <div className="w-9 h-9 rounded-xl bg-stone-100 border border-stone-200 flex items-center justify-center shrink-0 mt-0.5">
                  {categoryIcon(log.category)}
                </div>
                <div className="min-w-0 space-y-1">
                  <div className="flex flex-wrap items-center gap-2 text-xs text-gray-500">
                    <span className="font-semibold text-emerald-800">{categoryLabel(log.category)}</span>
                    {log.cropName && (
                      <>
                        <span aria-hidden="true">·</span>
                        <span>{log.cropName}</span>
                      </>
                    )}
                    <span aria-hidden="true">·</span>
                    <span>{getLangName(log.language)}</span>
                    <span aria-hidden="true">·</span>
                    <span className="font-mono-tabular">{formatTimestamp(log.createdAt)}</span>
                  </div>
                  <h4 className="font-bold text-sm text-gray-900">{log.title}</h4>
                  <p className="text-xs text-gray-600 leading-relaxed">{log.summary}</p>
                </div>
              </div>

              <div className="flex items-center gap-3 shrink-0">
                {log.metricLabel && (
                  <span className="text-xs font-mono-tabular font-semibold text-emerald-800">
                    {log.metricLabel}
                  </span>
                )}
                <button
                  type="button"
                  onClick={() => deleteAdvisoryLog(userId, log.id)}
                  className="p-1.5 text-gray-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-colors cursor-pointer"
                  title="Delete history entry"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Soil NPK Tests Table */}
      {cropHistory.length > 0 && (
        <div className="bg-white rounded-2xl border border-emerald-100 overflow-hidden">
          <div className="p-5 border-b border-gray-100 flex items-center justify-between">
            <div>
              <h3 className="font-bold text-sm text-gray-900">Saved Soil NPK & Crop Evaluations</h3>
              <p className="text-xs text-gray-500 mt-0.5">
                Historical soil nutrient tests recorded from Crop Suggestion
              </p>
            </div>
            <span className="text-xs font-mono-tabular text-gray-500">{cropHistory.length} Tests</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-stone-50 text-gray-500 border-b border-gray-100">
                <tr>
                  <th className="py-2.5 px-4 font-semibold">Recommended Crop</th>
                  <th className="py-2.5 px-4 font-semibold">Location & Season</th>
                  <th className="py-2.5 px-4 font-semibold text-right">N-P-K</th>
                  <th className="py-2.5 px-4 font-semibold text-right">pH</th>
                  <th className="py-2.5 px-4 font-semibold text-right">Match</th>
                  <th className="py-2.5 px-4 font-semibold text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {cropHistory.map((item) => (
                  <tr key={item.id} className="hover:bg-stone-50/70">
                    <td className="py-3 px-4 font-semibold text-gray-900">{item.bestCropName}</td>
                    <td className="py-3 px-4 text-gray-600">
                      {item.location} · {item.season}
                    </td>
                    <td className="py-3 px-4 text-right font-mono-tabular text-gray-800">
                      {item.nitrogen}-{item.phosphorus}-{item.potassium}
                    </td>
                    <td className="py-3 px-4 text-right font-mono-tabular text-gray-800">
                      {item.ph}
                    </td>
                    <td className="py-3 px-4 text-right font-mono-tabular font-semibold text-emerald-800">
                      {item.suitabilityScore}%
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button
                        type="button"
                        onClick={() => deleteCropHistory(userId, item.id)}
                        className="p-1 text-gray-400 hover:text-rose-600 rounded"
                        title="Delete test record"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
