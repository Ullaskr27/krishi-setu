import React, { useEffect, useRef, useState } from 'react';
import { User as FirebaseUser, ConfirmationResult, RecaptchaVerifier } from 'firebase/auth';
import {
  Sprout, ArrowRight, MapPin, Phone, CheckCircle2, LogOut, ShieldCheck,
  Database, Mail, LockKeyhole, Chrome, UserRound, Eye, EyeOff, Loader2
} from 'lucide-react';
import { Language, LANGUAGE_OPTIONS } from '../types';
import { translations } from '../translations';
import {
  signInWithGoogle, logoutFarmer, createFarmerProfile, addFarmPlot,
  signInWithEmail, registerWithEmail, signInAsGuest, createPhoneRecaptcha,
  requestPhoneOtp, resendVerificationEmail, refreshCurrentUser
} from '../firebase';

interface LoginRegisterViewProps {
  firebaseUser: FirebaseUser | null;
  language: Language;
  onLanguageChange: (lang: Language) => void;
  onProfileCreated: () => void;
}

type LoginMethod = 'email' | 'phone';

const friendlyAuthError = (error: unknown): string => {
  const code = (error as { code?: string })?.code || '';
  const messages: Record<string, string> = {
    'auth/email-already-in-use': 'An account already exists with this email. Please sign in instead.',
    'auth/invalid-email': 'Please enter a valid email address.',
    'auth/weak-password': 'Choose a password with at least 6 characters.',
    'auth/invalid-credential': 'Email or password is incorrect.',
    'auth/user-disabled': 'This account has been disabled. Contact support.',
    'auth/too-many-requests': 'Too many attempts. Please wait a while and try again.',
    'auth/popup-closed-by-user': 'The Google sign-in window was closed. Please try again.',
    'auth/popup-blocked': 'Your browser blocked the sign-in popup. Allow popups and retry.',
    'auth/invalid-phone-number': 'Enter a valid phone number with country code, for example +919876543210.',
    'auth/missing-phone-number': 'Enter your mobile number first.',
    'auth/invalid-verification-code': 'The OTP is incorrect. Check it and try again.',
    'auth/code-expired': 'The OTP has expired. Request a new OTP.',
    'auth/captcha-check-failed': 'Phone verification could not be completed. Refresh and try again.',
    'auth/operation-not-allowed': 'This login method is not enabled in Firebase Authentication.',
    'auth/network-request-failed': 'Network error. Check your internet connection and retry.',
  };
  return messages[code] || (error instanceof Error ? error.message : 'Something went wrong. Please try again.');
};

export const LoginRegisterView: React.FC<LoginRegisterViewProps> = ({
  firebaseUser, language, onLanguageChange, onProfileCreated
}) => {
  const t = translations[language];
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [notice, setNotice] = useState('');
  const [imgError, setImgError] = useState(false);
  const [seedSamplePlots, setSeedSamplePlots] = useState(false);
  const [method, setMethod] = useState<LoginMethod>('email');
  const [isRegister, setIsRegister] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [confirmation, setConfirmation] = useState<ConfirmationResult | null>(null);
  const recaptchaRef = useRef<RecaptchaVerifier | null>(null);

  const [profileForm, setProfileForm] = useState({
    name: firebaseUser?.displayName || '',
    mobile: firebaseUser?.phoneNumber || '',
    village: '', district: '', state: 'Karnataka', landArea: 1,
    preferredLanguage: language
  });

  useEffect(() => {
    if (firebaseUser?.displayName && !profileForm.name) {
      setProfileForm((prev) => ({ ...prev, name: firebaseUser.displayName || '' }));
    }
    if (firebaseUser?.phoneNumber && !profileForm.mobile) {
      setProfileForm((prev) => ({ ...prev, mobile: firebaseUser.phoneNumber || '' }));
    }
  }, [firebaseUser, profileForm.name, profileForm.mobile]);

  useEffect(() => () => {
    recaptchaRef.current?.clear();
    recaptchaRef.current = null;
  }, []);

  const runAuth = async (action: () => Promise<unknown>) => {
    setLoading(true); setErrorMsg(''); setNotice('');
    try { await action(); }
    catch (error) { setErrorMsg(friendlyAuthError(error)); }
    finally { setLoading(false); }
  };

  const handleEmailSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    if (isRegister) {
      void runAuth(async () => {
        await registerWithEmail(email, password);
        setNotice('Account created. Check your inbox and verify your email before saving your farmer profile.');
      });
    } else {
      void runAuth(async () => { await signInWithEmail(email, password); });
    }
  };

  const handleGoogle = () => runAuth(async () => { await signInWithGoogle(); });
  const handleGuest = () => runAuth(async () => { await signInAsGuest(); });

  const handleRequestOtp = () => runAuth(async () => {
    const digits = phone.replace(/[\s()-]/g, '');
    const fullPhone = digits.startsWith('+') ? digits : `+91${digits}`;
    if (!/^\+[1-9]\d{7,14}$/.test(fullPhone)) throw new Error('Enter a valid mobile number, such as 9876543210.');
    if (!recaptchaRef.current) recaptchaRef.current = createPhoneRecaptcha('phone-recaptcha');
    const result = await requestPhoneOtp(fullPhone, recaptchaRef.current);
    setConfirmation(result);
    setNotice(`Verification code sent to ${fullPhone}.`);
  });

  const handleVerifyOtp = (event: React.FormEvent) => {
    event.preventDefault();
    if (!confirmation) return;
    void runAuth(async () => {
      await confirmation.confirm(otp.trim());
      setConfirmation(null); setOtp('');
    });
  };

  const handleCompleteProfile = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!firebaseUser) return;
    if (firebaseUser.email && !firebaseUser.emailVerified) {
      setErrorMsg('Please verify your email first. After verifying, click “I have verified my email”.');
      return;
    }
    setLoading(true); setErrorMsg(''); setNotice('');
    try {
      await createFarmerProfile(firebaseUser.uid, {
        name: profileForm.name || firebaseUser.displayName || 'Farmer',
        email: firebaseUser.email || 'guest@krishisetu.local',
        mobile: profileForm.mobile || firebaseUser.phoneNumber || '',
        village: profileForm.village, district: profileForm.district,
        state: profileForm.state, landArea: Number(profileForm.landArea) || 1,
        preferredLanguage: profileForm.preferredLanguage
      });
      if (seedSamplePlots) {
        await Promise.all([
          addFarmPlot(firebaseUser.uid, {
            farmName: 'My First Farm Plot', location: `${profileForm.village}, ${profileForm.district}`,
            landArea: Number(profileForm.landArea) || 1, soilType: 'Not specified',
            cropsPlanted: 'Not specified', plantingDate: new Date().toISOString().slice(0, 10),
            expectedHarvestDate: new Date(Date.now() + 120 * 86400000).toISOString().slice(0, 10), status: 'Growing'
          })
        ]);
      }
      onLanguageChange(profileForm.preferredLanguage);
      onProfileCreated();
    } catch (error) {
      setErrorMsg(error instanceof Error ? error.message : 'Could not save your farmer profile.');
    } finally { setLoading(false); }
  };

  const handleRefreshVerification = () => runAuth(async () => {
    const refreshed = await refreshCurrentUser(firebaseUser!);
    if (refreshed.emailVerified) setNotice('Email verified successfully. You can now save your farmer profile.');
    else setErrorMsg('Email is not verified yet. Open the verification link in your inbox, then retry.');
  });

  const handleSwitchAccount = () => runAuth(async () => { await logoutFarmer(); });

  const headlineText = language === 'kn' ? 'ನಿಮ್ಮ ಜಮೀನಿನ ಹಿಂದಿನ ದಾಖಲೆಗಳೊಂದಿಗೆ ಚುರುಕಾದ ಬಿತ್ತನೆ ನಿರ್ಧಾರಗಳು.'
    : language === 'hi' ? 'आपके खेत के पुराने रिकॉर्ड के साथ स्मार्ट बुवाई निर्णय।'
    : 'Smarter farming decisions, backed by your saved field history.';
  const subText = language === 'kn' ? 'ನಿಮ್ಮ ಮಣ್ಣಿನ ಪರೀಕ್ಷೆಗಳು, ಜಮೀನಿನ ವಿವರಗಳು ಮತ್ತು ಕೃಷಿ ಸಲಹೆಗಳನ್ನು ಸುರಕ್ಷಿತವಾಗಿ ಉಳಿಸಿ.'
    : language === 'hi' ? 'मिट्टी की जांच, खेत का विवरण और कृषि सलाह सुरक्षित रखें।'
    : 'Keep your soil evaluations, farm plots, and multilingual AI consultations synced to your account.';

  return (
    <div className="min-h-screen bg-[#f5f7f2] text-slate-900">
      <header className="border-b border-stone-200/80 bg-white/90 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-5 lg:px-8">
          <div className="flex items-center gap-2.5"><div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-800 text-white"><Sprout className="h-5 w-5" /></div><span className="font-display text-lg font-bold">{t.appTitle}</span></div>
          <div className="flex max-w-[60vw] gap-1 overflow-x-auto rounded-xl border border-stone-200 bg-stone-100 p-1" aria-label="Select language">
            {LANGUAGE_OPTIONS.map((opt) => <button key={opt.code} type="button" onClick={() => onLanguageChange(opt.code)} className={`shrink-0 rounded-lg px-2.5 py-1.5 text-xs font-semibold ${language === opt.code ? 'bg-white text-emerald-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'}`}>{opt.nativeLabel}</button>)}
          </div>
        </div>
      </header>

      <main className="mx-auto grid max-w-7xl items-center gap-10 px-5 py-8 lg:grid-cols-2 lg:px-8 lg:py-12">
        <section className="space-y-7">
          <div className="space-y-4"><div className="inline-flex items-center gap-2 rounded-full bg-emerald-100 px-3 py-1.5 text-xs font-semibold text-emerald-900"><MapPin className="h-3.5 w-3.5" /> Farmer-first digital agriculture</div><h1 className="max-w-2xl font-display text-4xl font-bold leading-tight tracking-tight sm:text-5xl">{headlineText}</h1><p className="max-w-xl text-base leading-7 text-slate-600">{subText}</p></div>
          <div className="relative aspect-[16/10] overflow-hidden rounded-3xl border border-emerald-900/10 bg-emerald-950 shadow-xl shadow-emerald-950/10">
            {!imgError ? <img src="/src/assets/images/login_farm_sunrise_1795184503294.jpg" alt="Green farmland at sunrise" onError={() => setImgError(true)} className="h-full w-full object-cover" /> : <div className="flex h-full flex-col items-center justify-center bg-gradient-to-br from-emerald-900 to-emerald-700 text-emerald-50"><Sprout className="mb-3 h-12 w-12" /><span className="text-xl font-bold">Smart Crop Suggestion System</span></div>}
            <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-transparent to-transparent"/><div className="absolute bottom-5 left-5 right-5 flex flex-wrap items-center justify-between gap-2 text-xs text-white"><span>Soil insights · Weather · Crop guidance</span><span className="rounded-full bg-white/15 px-3 py-1 backdrop-blur">Built for Indian farmers</span></div>
          </div>
          <div className="grid gap-4 sm:grid-cols-3">{[['01','Farm records','Keep plots and crop history together.'],['02','Smart advisories','Explore crop and soil recommendations.'],['03','Local language','Choose your preferred language.']].map(([n,title,desc]) => <div key={n} className="border-t border-stone-300 pt-3"><div className="text-xs font-bold text-emerald-800">{n} · {title}</div><p className="mt-1 text-xs leading-5 text-slate-600">{desc}</p></div>)}</div>
        </section>

        <section className="mx-auto w-full max-w-xl">
          <div className="rounded-3xl border border-stone-200 bg-white p-6 shadow-xl shadow-slate-900/5 sm:p-8">
            {!firebaseUser ? <>
              <div className="mb-6"><p className="text-sm font-semibold text-emerald-800">Welcome to Krishi Setu</p><h2 className="mt-1 text-2xl font-bold tracking-tight">Your farm, one secure place.</h2><p className="mt-2 text-sm leading-6 text-slate-500">Sign in or create an account to save your farm information and recommendations.</p></div>
              <div className="mb-5 grid grid-cols-2 rounded-xl bg-stone-100 p-1"><button type="button" onClick={() => { setMethod('email'); setIsRegister(false); setErrorMsg(''); }} className={`rounded-lg py-2.5 text-sm font-semibold ${method === 'email' ? 'bg-white text-emerald-900 shadow-sm' : 'text-slate-500'}`}>Email</button><button type="button" onClick={() => { setMethod('phone'); setErrorMsg(''); setConfirmation(null); }} className={`rounded-lg py-2.5 text-sm font-semibold ${method === 'phone' ? 'bg-white text-emerald-900 shadow-sm' : 'text-slate-500'}`}>Mobile OTP</button></div>
              {errorMsg && <div role="alert" className="mb-4 rounded-xl border border-rose-200 bg-rose-50 p-3 text-sm text-rose-800">{errorMsg}</div>}
              {notice && <div role="status" className="mb-4 rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-900">{notice}</div>}

              {method === 'email' ? <form onSubmit={handleEmailSubmit} className="space-y-4">
                <div><label htmlFor="login-email" className="mb-1.5 block text-xs font-semibold text-slate-700">Email address</label><div className="relative"><Mail className="absolute left-3 top-3.5 h-4 w-4 text-slate-400"/><input id="login-email" type="email" required autoComplete="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@example.com" className="w-full rounded-xl border border-stone-200 bg-stone-50 py-3 pl-10 pr-3 text-sm outline-none transition focus:border-emerald-700 focus:ring-2 focus:ring-emerald-100"/></div></div>
                <div><label htmlFor="login-password" className="mb-1.5 block text-xs font-semibold text-slate-700">Password</label><div className="relative"><LockKeyhole className="absolute left-3 top-3.5 h-4 w-4 text-slate-400"/><input id="login-password" type={showPassword ? 'text' : 'password'} required minLength={6} autoComplete={isRegister ? 'new-password' : 'current-password'} value={password} onChange={e => setPassword(e.target.value)} placeholder="At least 6 characters" className="w-full rounded-xl border border-stone-200 bg-stone-50 py-3 pl-10 pr-11 text-sm outline-none transition focus:border-emerald-700 focus:ring-2 focus:ring-emerald-100"/><button type="button" onClick={() => setShowPassword(v => !v)} aria-label={showPassword ? 'Hide password' : 'Show password'} className="absolute right-3 top-3 text-slate-400">{showPassword ? <EyeOff className="h-4 w-4"/> : <Eye className="h-4 w-4"/>}</button></div></div>
                <button disabled={loading} type="submit" className="flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-emerald-800 px-4 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-900 disabled:opacity-60">{loading ? <Loader2 className="h-4 w-4 animate-spin"/> : <Mail className="h-4 w-4"/>}{isRegister ? 'Create account' : 'Sign in with email'}<ArrowRight className="h-4 w-4"/></button>
                <p className="text-center text-sm text-slate-500">{isRegister ? 'Already have an account?' : 'New to Krishi Setu?'} <button type="button" onClick={() => { setIsRegister(v => !v); setErrorMsg(''); setNotice(''); }} className="font-semibold text-emerald-800 hover:underline">{isRegister ? 'Sign in' : 'Create account'}</button></p>
              </form> : <div className="space-y-4">
                {!confirmation ? <><div><label htmlFor="phone-number" className="mb-1.5 block text-xs font-semibold text-slate-700">Mobile number</label><div className="relative"><Phone className="absolute left-3 top-3.5 h-4 w-4 text-slate-400"/><input id="phone-number" type="tel" inputMode="tel" value={phone} onChange={e => setPhone(e.target.value)} placeholder="9876543210 or +919876543210" className="w-full rounded-xl border border-stone-200 bg-stone-50 py-3 pl-10 pr-3 text-sm outline-none focus:border-emerald-700 focus:ring-2 focus:ring-emerald-100"/></div><p className="mt-1.5 text-xs text-slate-500">India country code +91 is added automatically if omitted.</p></div><div id="phone-recaptcha"/><button type="button" disabled={loading || !phone.trim()} onClick={handleRequestOtp} className="flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-emerald-800 px-4 py-3 text-sm font-semibold text-white hover:bg-emerald-900 disabled:opacity-60">{loading ? <Loader2 className="h-4 w-4 animate-spin"/> : <Phone className="h-4 w-4"/>}Send verification code</button></> : <form onSubmit={handleVerifyOtp} className="space-y-4"><div><label htmlFor="phone-otp" className="mb-1.5 block text-xs font-semibold text-slate-700">6-digit verification code</label><input id="phone-otp" inputMode="numeric" autoComplete="one-time-code" maxLength={6} required value={otp} onChange={e => setOtp(e.target.value.replace(/\D/g, '').slice(0,6))} placeholder="Enter OTP" className="w-full rounded-xl border border-stone-200 bg-stone-50 px-4 py-3 text-center text-lg tracking-[0.4em] outline-none focus:border-emerald-700 focus:ring-2 focus:ring-emerald-100"/></div><button type="submit" disabled={loading || otp.length !== 6} className="flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-emerald-800 px-4 py-3 text-sm font-semibold text-white hover:bg-emerald-900 disabled:opacity-60">{loading ? <Loader2 className="h-4 w-4 animate-spin"/> : <CheckCircle2 className="h-4 w-4"/>}Verify and continue</button><button type="button" onClick={() => { setConfirmation(null); setOtp(''); recaptchaRef.current?.clear(); recaptchaRef.current = null; }} className="w-full text-sm font-medium text-slate-500 hover:text-slate-800">Change mobile number</button></form>}
              </div>}

              <div className="my-6 flex items-center gap-3"><div className="h-px flex-1 bg-stone-200"/><span className="text-xs font-medium uppercase tracking-wider text-slate-400">or continue with</span><div className="h-px flex-1 bg-stone-200"/></div>
              <div className="grid gap-3 sm:grid-cols-2"><button type="button" onClick={handleGoogle} disabled={loading} className="flex min-h-12 items-center justify-center gap-2 rounded-xl border border-stone-200 bg-white px-3 py-3 text-sm font-semibold text-slate-700 transition hover:bg-stone-50 disabled:opacity-60"><Chrome className="h-4 w-4"/> Google</button><button type="button" onClick={handleGuest} disabled={loading} className="flex min-h-12 items-center justify-center gap-2 rounded-xl border border-stone-200 bg-white px-3 py-3 text-sm font-semibold text-slate-700 transition hover:bg-stone-50 disabled:opacity-60"><UserRound className="h-4 w-4"/> Explore as guest</button></div>
              <div className="mt-6 flex items-start gap-2 border-t border-stone-100 pt-5 text-xs leading-5 text-slate-500"><ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-emerald-700"/><span>Your farm records are stored under your Firebase account. Guest records are tied to this temporary account and may not follow you to another device.</span></div>
            </> : <>
              <div className="mb-5"><div className="mb-2 inline-flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-800"><CheckCircle2 className="h-3.5 w-3.5"/> Account authenticated</div><h2 className="text-2xl font-bold tracking-tight">Set up your farmer profile</h2><p className="mt-2 text-sm leading-6 text-slate-500">Add your farm details once. Your profile and farm records remain connected to this account.</p></div>
              {errorMsg && <div role="alert" className="mb-4 rounded-xl border border-rose-200 bg-rose-50 p-3 text-sm text-rose-800">{errorMsg}</div>}
              {notice && <div role="status" className="mb-4 rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-900">{notice}</div>}
              {firebaseUser.email && !firebaseUser.emailVerified && <div className="mb-4 rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900"><p className="font-semibold">Verify your email to continue</p><p className="mt-1 text-xs leading-5">Open the verification email sent by Firebase. Then return here and refresh the verification status.</p><div className="mt-3 flex flex-wrap gap-2"><button type="button" disabled={loading} onClick={() => runAuth(() => resendVerificationEmail(firebaseUser))} className="rounded-lg border border-amber-300 px-3 py-2 text-xs font-semibold">Resend email</button><button type="button" disabled={loading} onClick={handleRefreshVerification} className="rounded-lg bg-amber-800 px-3 py-2 text-xs font-semibold text-white">I have verified my email</button></div></div>}
              <form onSubmit={handleCompleteProfile} className="space-y-3">
                <div><label className="mb-1 block text-xs font-semibold text-slate-700">Farmer full name</label><input required maxLength={100} value={profileForm.name} onChange={e => setProfileForm({...profileForm,name:e.target.value})} placeholder="e.g. Ramesh Gowda" className="w-full rounded-xl border border-stone-200 bg-stone-50 px-3.5 py-3 text-sm outline-none focus:border-emerald-700 focus:ring-2 focus:ring-emerald-100"/></div>
                <div className="grid grid-cols-2 gap-3"><div><label className="mb-1 block text-xs font-semibold text-slate-700">Mobile number</label><input type="tel" maxLength={20} value={profileForm.mobile} onChange={e => setProfileForm({...profileForm,mobile:e.target.value})} placeholder="Mobile" className="w-full rounded-xl border border-stone-200 bg-stone-50 px-3 py-3 text-sm outline-none focus:border-emerald-700"/></div><div><label className="mb-1 block text-xs font-semibold text-slate-700">Land area (acres)</label><input type="number" min="0.1" max="100000" step="0.1" required value={profileForm.landArea} onChange={e => setProfileForm({...profileForm,landArea:Number(e.target.value)})} className="w-full rounded-xl border border-stone-200 bg-stone-50 px-3 py-3 text-sm outline-none focus:border-emerald-700"/></div></div>
                <div className="grid grid-cols-2 gap-3"><div><label className="mb-1 block text-xs font-semibold text-slate-700">Village / Taluk</label><input required maxLength={120} value={profileForm.village} onChange={e => setProfileForm({...profileForm,village:e.target.value})} placeholder="Village" className="w-full rounded-xl border border-stone-200 bg-stone-50 px-3 py-3 text-sm outline-none focus:border-emerald-700"/></div><div><label className="mb-1 block text-xs font-semibold text-slate-700">District</label><input required maxLength={80} value={profileForm.district} onChange={e => setProfileForm({...profileForm,district:e.target.value})} placeholder="District" className="w-full rounded-xl border border-stone-200 bg-stone-50 px-3 py-3 text-sm outline-none focus:border-emerald-700"/></div></div>
                <div className="grid grid-cols-2 gap-3"><div><label className="mb-1 block text-xs font-semibold text-slate-700">State</label><input required maxLength={80} value={profileForm.state} onChange={e => setProfileForm({...profileForm,state:e.target.value})} className="w-full rounded-xl border border-stone-200 bg-stone-50 px-3 py-3 text-sm outline-none focus:border-emerald-700"/></div><div><label className="mb-1 block text-xs font-semibold text-slate-700">Preferred language</label><select value={profileForm.preferredLanguage} onChange={e => setProfileForm({...profileForm,preferredLanguage:e.target.value as Language})} className="w-full rounded-xl border border-stone-200 bg-stone-50 px-3 py-3 text-sm outline-none focus:border-emerald-700">{LANGUAGE_OPTIONS.map(opt => <option key={opt.code} value={opt.code}>{opt.nativeLabel} ({opt.label})</option>)}</select></div></div>
                <label className="flex items-start gap-2 pt-1 text-xs leading-5 text-slate-600"><input type="checkbox" checked={seedSamplePlots} onChange={e => setSeedSamplePlots(e.target.checked)} className="mt-1"/><span>Add one example farm plot to explore the dashboard. You can edit or delete it later.</span></label>
                <button type="submit" disabled={loading || (!!firebaseUser.email && !firebaseUser.emailVerified)} className="flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-emerald-800 px-4 py-3 text-sm font-semibold text-white hover:bg-emerald-900 disabled:cursor-not-allowed disabled:opacity-50">{loading ? <Loader2 className="h-4 w-4 animate-spin"/> : <Database className="h-4 w-4"/>}Save profile and open dashboard<ArrowRight className="h-4 w-4"/></button>
              </form>
              <button type="button" onClick={handleSwitchAccount} className="mt-4 flex w-full items-center justify-center gap-2 text-xs font-medium text-slate-500 hover:text-slate-800"><LogOut className="h-3.5 w-3.5"/> Sign out and use another account</button>
            </>}
          </div>
        </section>
      </main>
      <div className="mx-auto max-w-7xl px-5 pb-6 text-center text-xs text-slate-400">Krishi Setu · Smarter tools for better farming decisions</div>
    </div>
  );
};
