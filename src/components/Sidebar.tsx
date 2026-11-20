import React from 'react';
import {
  LayoutDashboard,
  Sprout,
  CloudSun,
  ShieldAlert,
  Droplets,
  TestTube2,
  TrendingUp,
  Tractor,
  History,
  Mic,
  Code,
  User,
  X
} from 'lucide-react';
import { Language } from '../types';
import { translations } from '../translations';

interface SidebarProps {
  currentView: string;
  onNavigate: (view: string) => void;
  language: Language;
  mobileOpen: boolean;
  onCloseMobile: () => void;
  onOpenVoiceAi: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentView,
  onNavigate,
  language,
  mobileOpen,
  onCloseMobile,
  onOpenVoiceAi
}) => {
  const t = translations[language];

  const menuItems = [
    { id: 'dashboard', label: t.dashboard, icon: LayoutDashboard },
    { id: 'crop-suggestion', label: t.cropSuggestion, icon: Sprout },
    { id: 'weather', label: t.weather, icon: CloudSun },
    { id: 'disease', label: t.diseaseDetection, icon: ShieldAlert },
    { id: 'irrigation', label: t.irrigation, icon: Droplets },
    { id: 'fertilizer', label: t.fertilizerGuide, icon: TestTube2 },
    { id: 'market', label: t.marketPrices, icon: TrendingUp },
    { id: 'my-farm', label: t.myFarm, icon: Tractor },
    { id: 'history', label: t.farmerHistory, icon: History },
    { id: 'python-export', label: t.pythonExport, icon: Code },
    { id: 'profile', label: t.profile, icon: User }
  ];

  const handleSelect = (id: string) => {
    onNavigate(id);
    onCloseMobile();
  };

  return (
    <>
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-gray-900/50 backdrop-blur-sm z-40 lg:hidden"
          onClick={onCloseMobile}
        />
      )}

      <aside
        className={`fixed lg:sticky top-0 lg:top-16 left-0 h-screen lg:h-[calc(100vh-4rem)] w-64 bg-white border-r border-emerald-100/80 shadow-sm z-50 flex flex-col justify-between transition-transform duration-200 ease-in-out ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        {/* Mobile Header Close */}
        <div className="flex items-center justify-between p-4 lg:hidden border-b border-gray-100">
          <div className="font-bold text-emerald-900 text-sm flex items-center gap-2">
            <Sprout className="w-5 h-5 text-emerald-600" />
            <span className="truncate">{t.appTitle}</span>
          </div>
          <button
            onClick={onCloseMobile}
            className="p-1 rounded-lg text-gray-500 hover:bg-gray-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Menu Items */}
        <nav className="p-3 space-y-1 overflow-y-auto flex-1">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentView === item.id;

            return (
              <button
                key={item.id}
                onClick={() => handleSelect(item.id)}
                className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl font-medium text-sm transition-colors text-left cursor-pointer ${
                  isActive
                    ? 'bg-emerald-800 text-white font-semibold'
                    : 'text-gray-700 hover:bg-emerald-50 hover:text-emerald-900'
                }`}
              >
                <Icon
                  className={`w-4 h-4 shrink-0 ${
                    isActive ? 'text-emerald-200' : 'text-emerald-700'
                  }`}
                />
                <span className="truncate">{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Voice AI Quick Trigger inside Sidebar */}
        <div className="p-3 m-3 rounded-2xl bg-emerald-950 text-white">
          <div className="flex items-center gap-2 mb-1.5">
            <div className="w-7 h-7 rounded-lg bg-emerald-700 flex items-center justify-center text-emerald-100 shrink-0">
              <Mic className="w-4 h-4" />
            </div>
            <span className="font-bold text-xs text-emerald-50 truncate">{t.chatTitle}</span>
          </div>
          <p className="text-[11px] text-emerald-200/90 leading-snug mb-2.5">
            Speak or type in English, ಕನ್ನಡ, हिंदी, தமிழ், తెలుగు, or मराठी.
          </p>
          <button
            type="button"
            onClick={() => {
              onOpenVoiceAi();
              onCloseMobile();
            }}
            className="w-full bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold py-2 px-3 rounded-lg transition-colors cursor-pointer whitespace-nowrap"
          >
            {t.voiceListenBtn}
          </button>
        </div>
      </aside>
    </>
  );
};
