import React, { useState } from 'react';
import {
  Sprout,
  Sparkles,
  CheckCircle2,
  TestTube,
  History,
  Trash2
} from 'lucide-react';
import { Language, CropSuggestionResult, CropAdvisoryHistoryRecord } from '../types';
import { translations } from '../translations';
import { saveCropHistory, saveAdvisoryLog, deleteCropHistory } from '../firebase';

interface CropSuggestionViewProps {
  userId: string;
  language: Language;
  defaultLocation?: string;
  cropHistory: CropAdvisoryHistoryRecord[];
}

export const CropSuggestionView: React.FC<CropSuggestionViewProps> = ({
  userId,
  language,
  defaultLocation = 'Mandya, Karnataka',
  cropHistory
}) => {
  const t = translations[language];

  const [formData, setFormData] = useState({
    nitrogen: 65,
    phosphorus: 45,
    potassium: 40,
    ph: 6.5,
    temperature: 28,
    humidity: 65,
    rainfall: 850,
    location: defaultLocation,
    season: 'Kharif' as 'Kharif' | 'Rabi' | 'Zaid',
    availableWater: 'Medium' as 'High' | 'Medium' | 'Low',
    landSize: 2.5
  });

  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<CropSuggestionResult | null>(null);
  const [savedNotice, setSavedNotice] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setSavedNotice(false);

    try {
      const res = await fetch('/api/predict-crop', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      const data: CropSuggestionResult = await res.json();
      setResult(data);

      await Promise.all([
        saveCropHistory(userId, {
          nitrogen: formData.nitrogen,
          phosphorus: formData.phosphorus,
          potassium: formData.potassium,
          ph: formData.ph,
          temperature: formData.temperature,
          rainfall: formData.rainfall,
          location: formData.location,
          season: formData.season,
          availableWater: formData.availableWater,
          landSize: formData.landSize,
          bestCropName: data.bestCrop.name,
          suitabilityScore: data.bestCrop.suitabilityScore,
          soilAnalysisNotes: data.soilAnalysisNotes
        }),
        saveAdvisoryLog(userId, {
          category: 'crop',
          cropName: data.bestCrop.name,
          title: `Crop Recommendation: ${data.bestCrop.name}`,
          summary: data.soilAnalysisNotes,
          metricLabel: `${data.bestCrop.suitabilityScore}% Match`,
          language
        })
      ]);
      setSavedNotice(true);
    } catch (err) {
      console.error('Crop prediction failed:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleReloadHistory = (item: CropAdvisoryHistoryRecord) => {
    setFormData({
      nitrogen: item.nitrogen,
      phosphorus: item.phosphorus,
      potassium: item.potassium,
      ph: item.ph,
      temperature: item.temperature,
      humidity: 65,
      rainfall: item.rainfall,
      location: item.location,
      season: item.season,
      availableWater: item.availableWater,
      landSize: item.landSize
    });
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200 pb-12">
      {/* Title Header */}
      <div className="bg-white rounded-2xl p-6 border border-emerald-100/80">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-emerald-800 text-white flex items-center justify-center">
            <Sprout className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900">{t.cropSuggestion}</h2>
            <p className="text-xs text-gray-500 mt-0.5">
              Enter soil NPK nutrients, pH, climate parameters, and water availability. Every evaluation is saved to your farmer history.
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Soil & Climate Parameters Form */}
        <div className="lg:col-span-5 bg-white rounded-2xl p-6 border border-emerald-100/80">
          <h3 className="font-bold text-gray-900 text-sm mb-4 pb-2 border-b border-gray-100 flex items-center gap-2">
            <TestTube className="w-4 h-4 text-emerald-600" />
            Soil Health & Climate Inputs
          </h3>

          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            <div className="grid grid-cols-3 gap-2 bg-emerald-50/50 p-3 rounded-xl border border-emerald-100">
              <div>
                <label className="font-semibold text-emerald-950 block mb-1">Nitrogen (N)</label>
                <input
                  type="number"
                  value={formData.nitrogen}
                  onChange={(e) => setFormData({ ...formData, nitrogen: Number(e.target.value) })}
                  className="w-full bg-white border border-emerald-200 rounded-lg px-2.5 py-1.5 font-bold font-mono-tabular text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-600"
                  required
                />
              </div>
              <div>
                <label className="font-semibold text-emerald-950 block mb-1">Phosphorus (P)</label>
                <input
                  type="number"
                  value={formData.phosphorus}
                  onChange={(e) => setFormData({ ...formData, phosphorus: Number(e.target.value) })}
                  className="w-full bg-white border border-emerald-200 rounded-lg px-2.5 py-1.5 font-bold font-mono-tabular text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-600"
                  required
                />
              </div>
              <div>
                <label className="font-semibold text-emerald-950 block mb-1">Potassium (K)</label>
                <input
                  type="number"
                  value={formData.potassium}
                  onChange={(e) => setFormData({ ...formData, potassium: Number(e.target.value) })}
                  className="w-full bg-white border border-emerald-200 rounded-lg px-2.5 py-1.5 font-bold font-mono-tabular text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-600"
                  required
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between font-semibold text-gray-700 mb-1">
                <span>{t.soilPh}</span>
                <span className="text-emerald-700 font-bold font-mono-tabular">{formData.ph}</span>
              </div>
              <input
                type="range"
                min="4.5"
                max="9.0"
                step="0.1"
                value={formData.ph}
                onChange={(e) => setFormData({ ...formData, ph: Number(e.target.value) })}
                className="w-full accent-emerald-700 h-2 bg-gray-200 rounded-lg cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-gray-400 mt-0.5">
                <span>Acidic (4.5)</span>
                <span>Neutral (7.0)</span>
                <span>Alkaline (9.0)</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="font-semibold text-gray-700 block mb-1">{t.temperature}</label>
                <input
                  type="number"
                  value={formData.temperature}
                  onChange={(e) => setFormData({ ...formData, temperature: Number(e.target.value) })}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-1.5 font-mono-tabular text-gray-900 font-medium focus:outline-none focus:ring-2 focus:ring-emerald-600"
                />
              </div>
              <div>
                <label className="font-semibold text-gray-700 block mb-1">{t.rainfallMm}</label>
                <input
                  type="number"
                  value={formData.rainfall}
                  onChange={(e) => setFormData({ ...formData, rainfall: Number(e.target.value) })}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-1.5 font-mono-tabular text-gray-900 font-medium focus:outline-none focus:ring-2 focus:ring-emerald-600"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="font-semibold text-gray-700 block mb-1">{t.season}</label>
                <select
                  value={formData.season}
                  onChange={(e) =>
                    setFormData({ ...formData, season: e.target.value as 'Kharif' | 'Rabi' | 'Zaid' })
                  }
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-1.5 text-gray-900 font-medium focus:outline-none focus:ring-2 focus:ring-emerald-600"
                >
                  <option value="Kharif">Kharif (Monsoon)</option>
                  <option value="Rabi">Rabi (Winter)</option>
                  <option value="Zaid">Zaid (Summer)</option>
                </select>
              </div>
              <div>
                <label className="font-semibold text-gray-700 block mb-1">{t.availableWater}</label>
                <select
                  value={formData.availableWater}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      availableWater: e.target.value as 'High' | 'Medium' | 'Low'
                    })
                  }
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-1.5 text-gray-900 font-medium focus:outline-none focus:ring-2 focus:ring-emerald-600"
                >
                  <option value="High">High (Canal / Borewell)</option>
                  <option value="Medium">Medium (Rainfed / Well)</option>
                  <option value="Low">Low (Dryland)</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="font-semibold text-gray-700 block mb-1">{t.location}</label>
                <input
                  type="text"
                  maxLength={120}
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-1.5 text-gray-900 font-medium focus:outline-none focus:ring-2 focus:ring-emerald-600"
                />
              </div>
              <div>
                <label className="font-semibold text-gray-700 block mb-1">{t.landSize}</label>
                <input
                  type="number"
                  step="0.5"
                  value={formData.landSize}
                  onChange={(e) => setFormData({ ...formData, landSize: Number(e.target.value) })}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-1.5 font-mono-tabular text-gray-900 font-medium focus:outline-none focus:ring-2 focus:ring-emerald-600"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-emerald-800 hover:bg-emerald-900 text-white font-semibold py-3 rounded-xl transition-colors flex items-center justify-center gap-2 mt-2 cursor-pointer"
            >
              {loading ? (
                <span>Evaluating Soil NPK & Climate...</span>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 text-amber-300" />
                  <span>{t.getRecommendationBtn}</span>
                </>
              )}
            </button>
          </form>
        </div>

        {/* Results Column */}
        <div className="lg:col-span-7 space-y-6">
          {!result ? (
            <div className="bg-white rounded-2xl p-8 text-center border border-emerald-100 flex flex-col items-center justify-center min-h-[380px]">
              <div className="w-16 h-16 rounded-full bg-emerald-50 text-emerald-700 flex items-center justify-center mb-4">
                <Sprout className="w-8 h-8" />
              </div>
              <h3 className="font-bold text-gray-800 text-base">Ready for Crop Evaluation</h3>
              <p className="text-xs text-gray-500 max-w-md mt-1 leading-relaxed">
                Fill out soil NPK parameters or load a former test below and click{' '}
                <strong>"{t.getRecommendationBtn}"</strong> to generate and save your suitability ranking.
              </p>
            </div>
          ) : (
            <div className="space-y-6 animate-in fade-in duration-300">
              <div className="bg-emerald-950 text-white rounded-2xl p-6 border border-emerald-800">
                <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                  <span className="text-emerald-300 text-xs font-semibold">
                    {t.bestCrop} {savedNotice ? '· Saved to Farmer History' : ''}
                  </span>
                  <span className="text-amber-300 text-xs font-mono-tabular font-bold">
                    {result.bestCrop.suitabilityScore}% Suitability Match
                  </span>
                </div>

                <h3 className="text-2xl font-extrabold text-white mt-2">{result.bestCrop.name}</h3>
                <p className="text-xs text-emerald-200 mt-1 leading-relaxed">
                  {result.bestCrop.description}
                </p>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-5 pt-4 border-t border-emerald-800/80 text-xs">
                  <div>
                    <span className="text-emerald-300 text-[11px] block">Duration</span>
                    <span className="font-semibold text-white">{result.bestCrop.growingDuration}</span>
                  </div>
                  <div>
                    <span className="text-emerald-300 text-[11px] block">Water Needs</span>
                    <span className="font-semibold text-white">{result.bestCrop.waterRequirement}</span>
                  </div>
                  <div>
                    <span className="text-emerald-300 text-[11px] block">Expected Yield</span>
                    <span className="font-semibold text-white">{result.bestCrop.expectedYield}</span>
                  </div>
                  <div>
                    <span className="text-emerald-300 text-[11px] block">Demand</span>
                    <span className="font-semibold text-amber-300">{result.bestCrop.marketDemand}</span>
                  </div>
                </div>

                <div className="mt-5 pt-4 border-t border-emerald-800/80">
                  <h4 className="font-bold text-xs text-emerald-200 mb-2">{t.cultivationTips}:</h4>
                  <ul className="space-y-1.5 text-xs text-emerald-100">
                    {result.bestCrop.tips.map((tip, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                        <span>{tip}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Alternative Suitable Crops */}
              <div className="bg-white rounded-2xl p-6 border border-emerald-100/80">
                <h4 className="font-bold text-gray-900 text-sm mb-4 pb-2 border-b border-gray-100">
                  {t.alternativeCrops}
                </h4>

                <div className="space-y-3">
                  {result.alternativeCrops.map((crop, idx) => (
                    <div
                      key={idx}
                      className="p-4 rounded-xl bg-stone-50 border border-gray-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                    >
                      <div>
                        <div className="font-bold text-sm text-gray-900">{crop.name}</div>
                        <p className="text-xs text-gray-500 mt-0.5">
                          {crop.category} · {crop.growingDuration}
                        </p>
                      </div>
                      <span className="text-xs font-mono-tabular font-bold text-emerald-800">
                        {crop.suitabilityScore}% Match
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Former Soil & Crop Evaluations */}
          {cropHistory.length > 0 && (
            <div className="bg-white rounded-2xl p-5 border border-emerald-100">
              <div className="flex items-center justify-between mb-3 pb-2 border-b border-gray-100">
                <h4 className="font-bold text-sm text-gray-900 flex items-center gap-2">
                  <History className="w-4 h-4 text-emerald-700" />
                  Recent Saved Soil & Crop Evaluations
                </h4>
                <span className="text-xs font-mono-tabular text-gray-500">
                  {cropHistory.length} Saved
                </span>
              </div>
              <div className="divide-y divide-gray-100">
                {cropHistory.slice(0, 5).map((item) => (
                  <div
                    key={item.id}
                    className="py-2.5 flex items-center justify-between gap-3 text-xs"
                  >
                    <button
                      type="button"
                      onClick={() => handleReloadHistory(item)}
                      className="text-left hover:text-emerald-800 transition-colors cursor-pointer min-w-0"
                    >
                      <div className="font-semibold text-gray-900 truncate">
                        {item.bestCropName}
                      </div>
                      <div className="text-gray-500 font-mono-tabular">
                        NPK {item.nitrogen}-{item.phosphorus}-{item.potassium} · pH {item.ph} ·{' '}
                        {item.location} ({item.season})
                      </div>
                    </button>
                    <div className="flex items-center gap-2 shrink-0">
                      <span className="font-mono-tabular font-semibold text-emerald-800">
                        {item.suitabilityScore}%
                      </span>
                      <button
                        type="button"
                        onClick={() => deleteCropHistory(userId, item.id)}
                        className="p-1 text-gray-400 hover:text-rose-600 rounded cursor-pointer"
                        title="Remove saved record"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
