import React, { useState } from 'react';
import { Sprout, Bell, Globe, LogOut, Code, Check } from 'lucide-react';
import { UserProfile, Language, LANGUAGE_OPTIONS, AlertNotification } from '../types';
import { translations } from '../translations';

interface NavbarProps {
  user: UserProfile | null;
  language: Language;
  onLanguageChange: (lang: Language) => void;
  onLogout: () => void;
  onNavigate: (view: string) => void;
  alerts: AlertNotification[];
}

export const Navbar: React.FC<NavbarProps> = ({
  user,
  language,
  onLanguageChange,
  onLogout,
  onNavigate,
  alerts
}) => {
  const [showAlerts, setShowAlerts] = useState(false);
  const [showLangMenu, setShowLangMenu] = useState(false);
  const t = translations[language];

  const unreadAlertsCount = alerts.filter((a) => !a.read).length;

  return (
    <header className="sticky top-0 z-40 bg-emerald-900 text-white shadow-md border-b border-emerald-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* App Title & Logo */}
        <div
          onClick={() => onNavigate('dashboard')}
          className="flex items-center gap-3 cursor-pointer group shrink-0"
        >
          <div className="w-9 h-9 rounded-xl bg-emerald-700 flex items-center justify-center text-emerald-100 group-hover:bg-emerald-600 transition-colors">
            <Sprout className="w-5 h-5" />
          </div>
          <h1 className="font-bold text-base sm:text-lg leading-tight tracking-tight text-white group-hover:text-emerald-200 transition-colors whitespace-nowrap">
            {t.appTitle}
          </h1>
        </div>

        {/* Right Header Actions */}
        <div className="flex items-center gap-2.5 shrink-0">
          {/* Quick VS Code Python Codebase Link */}
          <button
            onClick={() => onNavigate('python-export')}
            className="hidden md:flex items-center gap-2 bg-emerald-800/80 hover:bg-emerald-700/80 text-emerald-100 px-3 py-1.5 rounded-lg text-xs font-medium border border-emerald-700 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            title="View VS Code Python Flask Setup"
          >
            <Code className="w-4 h-4 text-emerald-300" />
            <span>VS Code Codebase</span>
          </button>

          {/* Language Selector Dropdown (All 6 languages) */}
          <div className="relative">
            <button
              onClick={() => setShowLangMenu(!showLangMenu)}
              className="flex items-center gap-1.5 bg-emerald-800/60 hover:bg-emerald-700/80 px-3 py-1.5 rounded-lg text-xs font-medium border border-emerald-700 text-emerald-100 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              <Globe className="w-4 h-4 text-emerald-300" />
              <span className="uppercase tracking-wider font-semibold">{language}</span>
            </button>

            {showLangMenu && (
              <div className="absolute right-0 mt-2 w-52 bg-white rounded-xl shadow-xl border border-emerald-100 py-1.5 text-gray-800 z-50 text-sm">
                <div className="px-3 py-1.5 text-xs font-semibold text-gray-400 border-b border-gray-100 mb-1">
                  Select Language (6)
                </div>
                {LANGUAGE_OPTIONS.map((opt) => (
                  <button
                    key={opt.code}
                    onClick={() => {
                      onLanguageChange(opt.code);
                      setShowLangMenu(false);
                    }}
                    className={`w-full text-left px-3 py-2 flex items-center justify-between hover:bg-emerald-50 cursor-pointer ${
                      language === opt.code ? 'font-semibold text-emerald-800 bg-emerald-50/60' : ''
                    }`}
                  >
                    <span>
                      {opt.nativeLabel} <span className="text-xs text-gray-400">({opt.label})</span>
                    </span>
                    {language === opt.code && <Check className="w-4 h-4 text-emerald-600" />}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Notifications Bell */}
          <div className="relative">
            <button
              onClick={() => setShowAlerts(!showAlerts)}
              className="relative p-2 rounded-lg bg-emerald-800/60 hover:bg-emerald-700/80 text-emerald-100 border border-emerald-700 transition-colors cursor-pointer"
              title="Farmer Alerts"
            >
              <Bell className="w-4 h-4" />
              {unreadAlertsCount > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-amber-500 text-emerald-950 font-bold text-[10px] rounded-full flex items-center justify-center border border-emerald-900 font-mono-tabular">
                  {unreadAlertsCount}
                </span>
              )}
            </button>

            {showAlerts && (
              <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-2xl shadow-2xl border border-emerald-100 p-4 text-gray-800 z-50">
                <div className="flex items-center justify-between pb-3 border-b border-gray-100">
                  <h3 className="font-bold text-gray-900 text-sm flex items-center gap-2">
                    <Bell className="w-4 h-4 text-emerald-600" />
                    Farmer Alerts & Reminders
                  </h3>
                  <span className="text-xs font-mono-tabular text-emerald-800 font-medium">
                    {alerts.length} Total
                  </span>
                </div>

                <div className="mt-3 space-y-2.5 max-h-72 overflow-y-auto pr-1">
                  {alerts.map((alert) => (
                    <div
                      key={alert.id}
                      className={`p-3 rounded-xl border text-xs ${
                        alert.severity === 'warning'
                          ? 'bg-amber-50/80 border-amber-200 text-amber-900'
                          : alert.severity === 'critical'
                          ? 'bg-rose-50/80 border-rose-200 text-rose-900'
                          : 'bg-emerald-50/80 border-emerald-200 text-emerald-900'
                      }`}
                    >
                      <div className="font-semibold text-sm mb-1">{alert.title}</div>
                      <p className="leading-relaxed opacity-90">{alert.message}</p>
                      <span className="inline-block text-[10px] opacity-60 mt-1.5 font-mono-tabular">
                        {alert.timestamp}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* User Profile Avatar / Info */}
          {user && (
            <div
              onClick={() => onNavigate('profile')}
              className="flex items-center gap-2 pl-2 border-l border-emerald-800/80 cursor-pointer hover:opacity-90 shrink-0"
            >
              <div className="w-8 h-8 rounded-full bg-emerald-600 flex items-center justify-center font-bold text-xs text-white">
                {user.name.charAt(0).toUpperCase()}
              </div>
              <div className="hidden md:block text-left">
                <div className="text-xs font-semibold leading-tight text-emerald-50 truncate max-w-[120px]">
                  {user.name}
                </div>
                <div className="text-[10px] text-emerald-300 font-medium truncate max-w-[120px]">
                  {user.village}
                </div>
              </div>
            </div>
          )}

          {/* Logout Button */}
          {user && (
            <button
              onClick={onLogout}
              className="p-2 rounded-lg bg-emerald-950/60 hover:bg-rose-900/60 text-emerald-200 hover:text-rose-200 border border-emerald-800 hover:border-rose-700 transition-colors cursor-pointer"
              title={t.logout}
            >
              <LogOut className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
