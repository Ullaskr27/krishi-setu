import React, { useState, useEffect } from 'react';
import { User as FirebaseUser } from 'firebase/auth';
import {
  UserProfile,
  Language,
  WeatherData,
  AlertNotification,
  FarmRecord,
  CropAdvisoryHistoryRecord,
  AdvisoryLogRecord
} from './types';
import { Navbar } from './components/Navbar';
import { Sidebar } from './components/Sidebar';
import { FloatingChatbot } from './components/FloatingChatbot';
import { DashboardView } from './components/DashboardView';
import { CropSuggestionView } from './components/CropSuggestionView';
import { WeatherView } from './components/WeatherView';
import { DiseaseDetectionView } from './components/DiseaseDetectionView';
import { IrrigationView } from './components/IrrigationView';
import { FertilizerView } from './components/FertilizerView';
import { MarketPricesView } from './components/MarketPricesView';
import { MyFarmView } from './components/MyFarmView';
import { FarmerHistoryView } from './components/FarmerHistoryView';
import { PythonExportView } from './components/PythonExportView';
import { ProfileView } from './components/ProfileView';
import { LoginRegisterView } from './components/LoginRegisterView';
import {
  subscribeAuth,
  subscribeFarmerProfile,
  subscribeFarms,
  subscribeCropHistory,
  subscribeAdvisoryLogs,
  updateFarmerProfile,
  logoutFarmer
} from './firebase';
import { Menu, Sprout } from 'lucide-react';

export default function App() {
  const [authReady, setAuthReady] = useState(false);
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [profileLoading, setProfileLoading] = useState(false);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);

  const [farms, setFarms] = useState<FarmRecord[]>([]);
  const [loadingFarms, setLoadingFarms] = useState(false);
  const [cropHistory, setCropHistory] = useState<CropAdvisoryHistoryRecord[]>([]);
  const [advisoryLogs, setAdvisoryLogs] = useState<AdvisoryLogRecord[]>([]);
  const [loadingLogs, setLoadingLogs] = useState(false);

  const [language, setLanguage] = useState<Language>('en');
  const [currentView, setCurrentView] = useState('dashboard');
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [voiceChatOpen, setVoiceChatOpen] = useState(false);
  const [weather, setWeather] = useState<WeatherData | null>(null);

  const [alerts] = useState<AlertNotification[]>([
    {
      id: 'alt-1',
      title: 'Rainfall Advisory Mandya Zone',
      message:
        'Light to moderate rainfall expected tomorrow evening. Postpone chemical spray application on Finger Millet.',
      severity: 'warning',
      timestamp: 'Today, 08:30 AM',
      read: false
    },
    {
      id: 'alt-2',
      title: 'Mandya APMC Rate Increase',
      message: 'Tomato rates surged +7.8% to ₹3,450 / Qtl. Recommended selling window active.',
      severity: 'info',
      timestamp: 'Today, 07:15 AM',
      read: false
    },
    {
      id: 'alt-3',
      title: 'Soil Moisture Low Alert',
      message: 'Plot 1 Tomato soil moisture dropped to 38%. Schedule 16,000 L drip irrigation cycle.',
      severity: 'warning',
      timestamp: 'Yesterday, 05:45 PM',
      read: true
    }
  ]);

  // Listen to Firebase Auth state
  useEffect(() => {
    const unsub = subscribeAuth((fbUser) => {
      setFirebaseUser(fbUser);
      setAuthReady(true);
      if (!fbUser) {
        setUserProfile(null);
        setFarms([]);
        setCropHistory([]);
        setAdvisoryLogs([]);
      }
    });
    return () => unsub();
  }, []);

  // Subscribe to Firestore farmer profile when authenticated
  useEffect(() => {
    if (!firebaseUser) {
      setProfileLoading(false);
      return;
    }

    setProfileLoading(true);
    const unsub = subscribeFarmerProfile(
      firebaseUser.uid,
      (profile) => {
        setUserProfile(profile);
        if (profile?.preferredLanguage) {
          setLanguage(profile.preferredLanguage);
        }
        setProfileLoading(false);
      },
      () => setProfileLoading(false)
    );

    return () => unsub();
  }, [firebaseUser]);

  // Subscribe to farmer's persisted plots, crop history, and advisory logs once profile exists
  useEffect(() => {
    if (!firebaseUser || !userProfile) return;

    setLoadingFarms(true);
    setLoadingLogs(true);

    const unsubFarms = subscribeFarms(firebaseUser.uid, (list) => {
      setFarms(list);
      setLoadingFarms(false);
    });

    const unsubCropHistory = subscribeCropHistory(firebaseUser.uid, (items) => {
      setCropHistory(items);
    });

    const unsubAdvisoryLogs = subscribeAdvisoryLogs(firebaseUser.uid, (logs) => {
      setAdvisoryLogs(logs);
      setLoadingLogs(false);
    });

    return () => {
      unsubFarms();
      unsubCropHistory();
      unsubAdvisoryLogs();
    };
  }, [firebaseUser, userProfile]);

  // Fetch initial weather based on farmer's district
  useEffect(() => {
    const city = userProfile?.district || 'Mandya';
    fetch(`/api/weather?city=${encodeURIComponent(city)}`)
      .then((res) => res.json())
      .then((data) => setWeather(data))
      .catch((err) => console.error('Weather load error:', err));
  }, [userProfile?.district]);

  const handleLanguageChange = async (newLang: Language) => {
    setLanguage(newLang);
    if (firebaseUser && userProfile) {
      try {
        await updateFarmerProfile(firebaseUser.uid, { preferredLanguage: newLang });
      } catch (err) {
        console.error('Failed to sync preferred language:', err);
      }
    }
  };

  const handleLogout = async () => {
    await logoutFarmer();
    setCurrentView('dashboard');
  };

  if (!authReady || (firebaseUser && profileLoading)) {
    return (
      <div className="min-h-screen bg-stone-50 flex flex-col items-center justify-center gap-3 text-emerald-900">
        <div className="w-12 h-12 rounded-2xl bg-emerald-800 text-white flex items-center justify-center">
          <Sprout className="w-6 h-6 text-emerald-200" />
        </div>
        <div className="text-sm font-semibold">Loading your Farmer Portal...</div>
      </div>
    );
  }

  if (!firebaseUser || !userProfile) {
    return (
      <LoginRegisterView
        firebaseUser={firebaseUser}
        language={language}
        onLanguageChange={setLanguage}
        onProfileCreated={() => setCurrentView('dashboard')}
      />
    );
  }

  const defaultLocation = [userProfile.village, userProfile.district].filter(Boolean).join(', ');

  return (
    <div className="min-h-screen bg-slate-100/90 font-sans text-gray-900 flex flex-col selection:bg-emerald-200">
      <Navbar
        user={userProfile}
        language={language}
        onLanguageChange={handleLanguageChange}
        onLogout={handleLogout}
        onNavigate={setCurrentView}
        alerts={alerts}
      />

      <div className="flex-1 flex max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-4 gap-6 relative">
        <div className="lg:hidden fixed bottom-5 left-5 z-40">
          <button
            onClick={() => setMobileSidebarOpen(true)}
            className="bg-emerald-900 text-white p-3.5 rounded-full shadow-2xl border border-emerald-700 flex items-center justify-center"
            title="Toggle Menu"
          >
            <Menu className="w-5 h-5" />
          </button>
        </div>

        <Sidebar
          currentView={currentView}
          onNavigate={setCurrentView}
          language={language}
          mobileOpen={mobileSidebarOpen}
          onCloseMobile={() => setMobileSidebarOpen(false)}
          onOpenVoiceAi={() => setVoiceChatOpen(true)}
        />

        <main className="flex-1 min-w-0">
          {currentView === 'dashboard' && (
            <DashboardView
              user={userProfile}
              language={language}
              weather={weather}
              alerts={alerts}
              farms={farms}
              cropHistory={cropHistory}
              advisoryLogs={advisoryLogs}
              onNavigate={setCurrentView}
              onOpenVoiceAi={() => setVoiceChatOpen(true)}
            />
          )}

          {currentView === 'crop-suggestion' && (
            <CropSuggestionView
              userId={firebaseUser.uid}
              language={language}
              defaultLocation={defaultLocation || 'Mandya, Karnataka'}
              cropHistory={cropHistory}
            />
          )}

          {currentView === 'weather' && <WeatherView language={language} />}

          {currentView === 'disease' && (
            <DiseaseDetectionView userId={firebaseUser.uid} language={language} />
          )}

          {currentView === 'irrigation' && (
            <IrrigationView userId={firebaseUser.uid} language={language} />
          )}

          {currentView === 'fertilizer' && (
            <FertilizerView userId={firebaseUser.uid} language={language} />
          )}

          {currentView === 'market' && <MarketPricesView language={language} />}

          {currentView === 'my-farm' && (
            <MyFarmView
              userId={firebaseUser.uid}
              farms={farms}
              loadingFarms={loadingFarms}
              language={language}
              defaultLocation={defaultLocation || 'Mandya, Karnataka'}
            />
          )}

          {currentView === 'history' && (
            <FarmerHistoryView
              userId={firebaseUser.uid}
              advisoryLogs={advisoryLogs}
              cropHistory={cropHistory}
              loading={loadingLogs}
              language={language}
            />
          )}

          {currentView === 'python-export' && <PythonExportView language={language} />}

          {currentView === 'profile' && (
            <ProfileView
              user={userProfile}
              language={language}
              onLanguageChange={handleLanguageChange}
            />
          )}
        </main>
      </div>

      <FloatingChatbot
        userId={firebaseUser.uid}
        language={language}
        onLanguageChange={handleLanguageChange}
        isOpen={voiceChatOpen}
        onToggleOpen={setVoiceChatOpen}
      />
    </div>
  );
}
