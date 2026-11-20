import React from 'react';
import {
  Sprout,
  CloudSun,
  TrendingUp,
  Tractor,
  ArrowRight,
  Sun,
  ShieldAlert,
  AlertTriangle,
  History,
  Mic
} from 'lucide-react';
import {
  UserProfile,
  Language,
  WeatherData,
  AlertNotification,
  FarmRecord,
  CropAdvisoryHistoryRecord,
  AdvisoryLogRecord
} from '../types';
import { translations } from '../translations';

interface DashboardViewProps {
  user: UserProfile | null;
  language: Language;
  weather: WeatherData | null;
  alerts: AlertNotification[];
  farms: FarmRecord[];
  cropHistory: CropAdvisoryHistoryRecord[];
  advisoryLogs: AdvisoryLogRecord[];
  onNavigate: (view: string) => void;
  onOpenVoiceAi: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  user,
  language,
  weather,
  alerts,
  farms,
  cropHistory,
  advisoryLogs,
  onNavigate,
  onOpenVoiceAi
}) => {
  const t = translations[language];
  const totalAcres = farms.reduce((acc, f) => acc + (Number(f.landArea) || 0), 0);
  const latestCrop = cropHistory[0];

  return (
    <div className="space-y-6 animate-in fade-in duration-200 pb-10">
      {/* Welcome Hero Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-emerald-950 text-white p-6 sm:p-8 border border-emerald-800/80">
        <div className="relative z-10 max-w-2xl">
          <div className="text-emerald-300 text-xs font-semibold mb-2">
            {t.farmerPortal} · {user?.village || 'Karnataka'}
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            {t.welcome}, {user ? user.name : 'Farmer'}!
          </h2>
          <p className="mt-2 text-emerald-200 text-sm leading-relaxed">
            Your saved farm ledger, past soil NPK tests, live APMC market prices, and multilingual Voice AI assistant are synced to your account.
          </p>

          <div className="mt-6 flex flex-wrap gap-3">
            <button
              onClick={() => onNavigate('crop-suggestion')}
              className="bg-emerald-500 hover:bg-emerald-400 text-emerald-950 font-bold px-5 py-2.5 rounded-xl text-xs sm:text-sm flex items-center gap-2 transition-colors cursor-pointer"
            >
              <Sprout className="w-4 h-4" />
              <span>{t.getRecommendationBtn}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
            <button
              onClick={onOpenVoiceAi}
              className="bg-emerald-800/90 hover:bg-emerald-700 text-white font-semibold px-4 py-2.5 rounded-xl text-xs sm:text-sm border border-emerald-700 flex items-center gap-2 transition-colors cursor-pointer"
            >
              <Mic className="w-4 h-4 text-emerald-300" />
              <span>{t.voiceListenBtn}</span>
            </button>
            <button
              onClick={() => onNavigate('weather')}
              className="bg-emerald-900/80 hover:bg-emerald-800 text-emerald-100 font-medium px-4 py-2.5 rounded-xl text-xs sm:text-sm border border-emerald-800 flex items-center gap-2 transition-colors cursor-pointer"
            >
              <CloudSun className="w-4 h-4 text-emerald-300" />
              <span>{t.forecast7Days}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Primary Key Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div
          onClick={() => onNavigate('weather')}
          className="bg-white rounded-2xl p-4 border border-emerald-100 hover:border-emerald-300 transition-colors cursor-pointer group"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-gray-500">{t.currentTemp}</span>
            <div className="p-2 rounded-xl bg-amber-50 text-amber-600">
              <Sun className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-gray-900 font-mono-tabular">
            {weather ? `${weather.temp}°C` : '28°C'}
          </div>
          <p className="text-xs text-gray-500 mt-1 truncate">
            {weather ? weather.condition : 'Partly Cloudy'}
          </p>
          <div className="mt-3 pt-2 border-t border-gray-100 flex justify-between text-[11px] text-gray-500 font-mono-tabular">
            <span>Humidity: {weather ? `${weather.humidity}%` : '65%'}</span>
            <span>Wind: {weather ? `${weather.windSpeed} km/h` : '14 km/h'}</span>
          </div>
        </div>

        <div
          onClick={() => onNavigate('crop-suggestion')}
          className="bg-white rounded-2xl p-4 border border-emerald-100 hover:border-emerald-300 transition-colors cursor-pointer"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-emerald-800">{t.recommendedCrop}</span>
            <div className="p-2 rounded-xl bg-emerald-50 text-emerald-700">
              <Sprout className="w-4 h-4" />
            </div>
          </div>
          <div className="text-lg font-bold text-gray-900 truncate">
            {latestCrop ? latestCrop.bestCropName : 'Finger Millet (Ragi)'}
          </div>
          <div className="mt-1 text-xs font-mono-tabular text-emerald-800 font-semibold">
            {latestCrop ? `${latestCrop.suitabilityScore}% Match` : '94% Match Suitability'}
          </div>
          <div className="mt-3 pt-2 border-t border-gray-100 text-[11px] text-gray-500 truncate">
            {latestCrop
              ? `Saved ${latestCrop.season} test (${latestCrop.location})`
              : 'Run soil test to save evaluation'}
          </div>
        </div>

        <div
          onClick={() => onNavigate('my-farm')}
          className="bg-white rounded-2xl p-4 border border-emerald-100 hover:border-emerald-300 transition-colors cursor-pointer"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-cyan-800">{t.myFarm}</span>
            <div className="p-2 rounded-xl bg-cyan-50 text-cyan-700">
              <Tractor className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-gray-900 font-mono-tabular">
            {farms.length} Plots
          </div>
          <p className="text-xs text-emerald-800 font-semibold mt-1 font-mono-tabular">
            {totalAcres.toFixed(1)} Total Acres
          </p>
          <div className="mt-3 pt-2 border-t border-gray-100 text-[11px] text-gray-500 truncate">
            {farms[0] ? `Active: ${farms[0].cropsPlanted}` : 'Add your first plot'}
          </div>
        </div>

        <div
          onClick={() => onNavigate('market')}
          className="bg-white rounded-2xl p-4 border border-emerald-100 hover:border-emerald-300 transition-colors cursor-pointer"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-indigo-800">{t.marketSummary}</span>
            <div className="p-2 rounded-xl bg-indigo-50 text-indigo-700">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-gray-900 font-mono-tabular">₹3,450 / Qtl</div>
          <div className="mt-1 text-xs text-emerald-700 font-semibold font-mono-tabular">
            +7.8% · Mandya APMC
          </div>
          <div className="mt-3 pt-2 border-t border-gray-100 text-[11px] text-gray-500">
            Top Demand: Tomato & Ragi
          </div>
        </div>
      </div>

      {/* Bottom 2-Column Section: Alerts & Stored Farmer History Preview */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl p-5 border border-emerald-100/80">
          <div className="flex items-center justify-between mb-4 pb-2 border-b border-gray-100">
            <h3 className="font-bold text-gray-900 text-base flex items-center gap-2">
              <ShieldAlert className="w-5 h-5 text-amber-600" />
              Farmer Alerts & Reminders
            </h3>
            <span className="text-xs text-emerald-800 font-semibold">Mandya Zone</span>
          </div>

          <div className="space-y-3">
            {alerts.slice(0, 3).map((alert) => (
              <div
                key={alert.id}
                className="p-3.5 rounded-xl bg-amber-50/60 border border-amber-200/80 flex items-start gap-3"
              >
                <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                <div className="text-xs text-amber-950">
                  <div className="font-bold text-sm text-gray-900 mb-0.5">{alert.title}</div>
                  <p className="leading-relaxed opacity-90">{alert.message}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-emerald-100/80 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4 pb-2 border-b border-gray-100">
              <h3 className="font-bold text-gray-900 text-base flex items-center gap-2">
                <History className="w-5 h-5 text-emerald-700" />
                {t.farmerHistory}
              </h3>
              <button
                type="button"
                onClick={() => onNavigate('history')}
                className="text-xs font-semibold text-emerald-800 hover:underline cursor-pointer"
              >
                View All ({advisoryLogs.length})
              </button>
            </div>

            {advisoryLogs.length === 0 ? (
              <div className="py-8 text-center text-xs text-gray-500">
                Your saved crop suggestions, disease checks, irrigation plans, and Voice AI consultations will appear here automatically.
              </div>
            ) : (
              <div className="divide-y divide-gray-100">
                {advisoryLogs.slice(0, 4).map((log) => (
                  <div key={log.id} className="py-2.5 flex items-start justify-between gap-3 text-xs">
                    <div className="min-w-0">
                      <div className="font-semibold text-gray-900 truncate">{log.title}</div>
                      <p className="text-gray-500 truncate mt-0.5">{log.summary}</p>
                    </div>
                    {log.metricLabel && (
                      <span className="font-mono-tabular font-semibold text-emerald-800 shrink-0">
                        {log.metricLabel}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="mt-4 pt-3 border-t border-gray-100 grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => onNavigate('disease')}
              className="p-3 rounded-xl bg-stone-50 hover:bg-emerald-50 border border-stone-200 text-left transition-colors cursor-pointer"
            >
              <div className="font-bold text-xs text-gray-900">{t.diseaseDetection}</div>
              <div className="text-[11px] text-gray-500 mt-0.5">Upload leaf photo</div>
            </button>
            <button
              type="button"
              onClick={() => onNavigate('fertilizer')}
              className="p-3 rounded-xl bg-stone-50 hover:bg-emerald-50 border border-stone-200 text-left transition-colors cursor-pointer"
            >
              <div className="font-bold text-xs text-gray-900">{t.fertilizerGuide}</div>
              <div className="text-[11px] text-gray-500 mt-0.5">NPK dosage plan</div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
