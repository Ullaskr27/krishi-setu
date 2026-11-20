import React, { useState, useEffect } from 'react';
import { Save, Check } from 'lucide-react';
import { UserProfile, Language, LANGUAGE_OPTIONS } from '../types';
import { translations } from '../translations';
import { updateFarmerProfile } from '../firebase';

interface ProfileViewProps {
  user: UserProfile;
  language: Language;
  onLanguageChange: (lang: Language) => void;
}

export const ProfileView: React.FC<ProfileViewProps> = ({
  user,
  onLanguageChange,
  language
}) => {
  const t = translations[language];
  const [formData, setFormData] = useState<UserProfile>(user);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    setFormData(user);
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setErrorMsg('');

    try {
      await updateFarmerProfile(user.uid, {
        name: formData.name,
        mobile: formData.mobile,
        village: formData.village,
        district: formData.district,
        state: formData.state,
        landArea: Number(formData.landArea) || 1,
        preferredLanguage: formData.preferredLanguage
      });
      onLanguageChange(formData.preferredLanguage);
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'Unable to save profile changes.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200 pb-12">
      {/* Title Header */}
      <div className="bg-white rounded-2xl p-6 border border-emerald-100/80">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-xl bg-emerald-800 text-white flex items-center justify-center font-bold text-lg shrink-0">
            {formData.name.charAt(0).toUpperCase()}
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900">{t.profile}</h2>
            <p className="text-xs text-gray-500 mt-0.5">
              {user.email} · Synced to your private farmer ledger
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-2xl bg-white rounded-2xl p-6 border border-emerald-100/80">
        {errorMsg && (
          <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs">
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div>
            <label className="font-semibold text-gray-700 block mb-1">Farmer Full Name</label>
            <input
              type="text"
              required
              maxLength={100}
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-gray-900 font-medium focus:outline-none focus:ring-2 focus:ring-emerald-600"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="font-semibold text-gray-700 block mb-1">Mobile Number</label>
              <input
                type="tel"
                maxLength={20}
                value={formData.mobile}
                onChange={(e) => setFormData({ ...formData, mobile: e.target.value })}
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-gray-900 font-medium focus:outline-none focus:ring-2 focus:ring-emerald-600"
              />
            </div>
            <div>
              <label className="font-semibold text-gray-700 block mb-1">Preferred Language</label>
              <select
                value={formData.preferredLanguage}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    preferredLanguage: e.target.value as Language
                  })
                }
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-gray-900 font-medium focus:outline-none focus:ring-2 focus:ring-emerald-600"
              >
                {LANGUAGE_OPTIONS.map((opt) => (
                  <option key={opt.code} value={opt.code}>
                    {opt.nativeLabel} ({opt.label})
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="font-semibold text-gray-700 block mb-1">Village / Taluk</label>
              <input
                type="text"
                maxLength={120}
                value={formData.village}
                onChange={(e) => setFormData({ ...formData, village: e.target.value })}
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-gray-900 font-medium focus:outline-none focus:ring-2 focus:ring-emerald-600"
              />
            </div>
            <div>
              <label className="font-semibold text-gray-700 block mb-1">District</label>
              <input
                type="text"
                maxLength={80}
                value={formData.district}
                onChange={(e) => setFormData({ ...formData, district: e.target.value })}
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-gray-900 font-medium focus:outline-none focus:ring-2 focus:ring-emerald-600"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="font-semibold text-gray-700 block mb-1">State</label>
              <input
                type="text"
                maxLength={80}
                value={formData.state}
                onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-gray-900 font-medium focus:outline-none focus:ring-2 focus:ring-emerald-600"
              />
            </div>
            <div>
              <label className="font-semibold text-gray-700 block mb-1">Total Land Area (Acres)</label>
              <input
                type="number"
                step="0.5"
                min="0"
                value={formData.landArea}
                onChange={(e) => setFormData({ ...formData, landArea: Number(e.target.value) })}
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-gray-900 font-mono-tabular font-medium focus:outline-none focus:ring-2 focus:ring-emerald-600"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={saving}
            className="w-full bg-emerald-800 hover:bg-emerald-900 disabled:opacity-60 text-white font-semibold py-3 rounded-xl transition-colors flex items-center justify-center gap-2 mt-4 cursor-pointer"
          >
            {saved ? (
              <>
                <Check className="w-4 h-4 text-emerald-300" />
                <span>Profile Saved Successfully!</span>
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                <span>{saving ? 'Saving Changes...' : 'Save Profile Changes'}</span>
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};
