import React, { useState } from 'react';
import { Droplets, CloudRain, Gauge, CheckCircle2 } from 'lucide-react';
import { Language, IrrigationResult } from '../types';
import { translations } from '../translations';
import { saveAdvisoryLog } from '../firebase';

interface IrrigationViewProps {
  userId: string;
  language: Language;
}

export const IrrigationView: React.FC<IrrigationViewProps> = ({ userId, language }) => {
  const t = translations[language];

  const [formData, setFormData] = useState({
    crop: 'Tomato',
    soilType: 'Red Loam',
    soilMoisture: 38,
    temperature: 28,
    rainfall: 10,
    landArea: 2.5
  });

  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<IrrigationResult | null>({
    status: 'Critical',
    waterVolumeLiters: 40000,
    frequencyDays: 2,
    methodRecommendation: 'Drip Irrigation with 2.0 LPH emitters spaced at 30 cm',
    tips: [
      'Water between 6:00 AM - 8:00 AM to minimize evaporation losses up to 30%.',
      'Use organic straw mulching around crop bases to retain root zone humidity.',
      'Flush lateral drip lines every fortnight to clear salt buildup.'
    ],
    rainAlert: 'Light rain expected tomorrow evening — hold sprinkler pumping for 24 hours.'
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch('/api/irrigation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      const data: IrrigationResult = await res.json();
      setResult(data);

      await saveAdvisoryLog(userId, {
        category: 'irrigation',
        cropName: formData.crop,
        title: `Irrigation Plan (${data.status}) — ${formData.crop}`,
        summary: `${data.waterVolumeLiters.toLocaleString()} L for ${formData.landArea} Acres (${formData.soilType}, ${formData.soilMoisture}% moisture). ${data.methodRecommendation}.`,
        metricLabel: `Every ${data.frequencyDays} Days`,
        language
      });
    } catch (err) {
      console.error('Irrigation query failed:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200 pb-12">
      <div className="bg-white rounded-2xl p-6 border border-emerald-100/80">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-cyan-700 text-white flex items-center justify-center">
            <Droplets className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900">{t.irrigation}</h2>
            <p className="text-xs text-gray-500 mt-0.5">
              Precision water requirement calculator — calculated irrigation schedules are saved to your farmer history.
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-5 bg-white rounded-2xl p-6 border border-emerald-100/80">
          <h3 className="font-bold text-gray-900 text-sm mb-4 pb-2 border-b border-gray-100 flex items-center gap-2">
            <Gauge className="w-4 h-4 text-cyan-600" />
            Soil & Farm Parameters
          </h3>

          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            <div>
              <label className="font-semibold text-gray-700 block mb-1">Crop Type</label>
              <select
                value={formData.crop}
                onChange={(e) => setFormData({ ...formData, crop: e.target.value })}
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-gray-900 font-medium focus:outline-none focus:ring-2 focus:ring-emerald-600"
              >
                <option value="Tomato">Tomato</option>
                <option value="Finger Millet">Finger Millet / Ragi</option>
                <option value="Paddy">Paddy / Rice</option>
                <option value="Maize">Maize / Corn</option>
                <option value="Cotton">Cotton</option>
                <option value="Sugarcane">Sugarcane</option>
              </select>
            </div>

            <div>
              <label className="font-semibold text-gray-700 block mb-1">{t.soilType}</label>
              <select
                value={formData.soilType}
                onChange={(e) => setFormData({ ...formData, soilType: e.target.value })}
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-gray-900 font-medium focus:outline-none focus:ring-2 focus:ring-emerald-600"
              >
                <option value="Red Loam">Red Loamy Soil</option>
                <option value="Black Cotton">Black Cotton Soil</option>
                <option value="Clay">Clay / Alluvial Soil</option>
                <option value="Sandy Loam">Sandy Loam</option>
              </select>
            </div>

            <div>
              <div className="flex justify-between font-semibold text-gray-700 mb-1">
                <span>{t.soilMoisture}</span>
                <span
                  className={`font-bold font-mono-tabular ${
                    formData.soilMoisture < 40 ? 'text-rose-600' : 'text-emerald-700'
                  }`}
                >
                  {formData.soilMoisture}% (
                  {formData.soilMoisture < 40
                    ? 'Low'
                    : formData.soilMoisture < 70
                    ? 'Optimal'
                    : 'Wet'}
                  )
                </span>
              </div>
              <input
                type="range"
                min="10"
                max="90"
                value={formData.soilMoisture}
                onChange={(e) => setFormData({ ...formData, soilMoisture: Number(e.target.value) })}
                className="w-full accent-cyan-700 h-2 bg-gray-200 rounded-lg cursor-pointer"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="font-semibold text-gray-700 block mb-1">Land Area (Acres)</label>
                <input
                  type="number"
                  step="0.5"
                  value={formData.landArea}
                  onChange={(e) => setFormData({ ...formData, landArea: Number(e.target.value) })}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 font-mono-tabular text-gray-900 font-medium focus:outline-none focus:ring-2 focus:ring-emerald-600"
                />
              </div>
              <div>
                <label className="font-semibold text-gray-700 block mb-1">
                  Rainfall Forecast (mm)
                </label>
                <input
                  type="number"
                  value={formData.rainfall}
                  onChange={(e) => setFormData({ ...formData, rainfall: Number(e.target.value) })}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 font-mono-tabular text-gray-900 font-medium focus:outline-none focus:ring-2 focus:ring-emerald-600"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-cyan-800 hover:bg-cyan-900 text-white font-semibold py-3 rounded-xl transition-colors flex items-center justify-center gap-2 mt-2 cursor-pointer"
            >
              {loading ? (
                <span>Calculating & Saving...</span>
              ) : (
                <>
                  <Droplets className="w-4 h-4 text-cyan-200" />
                  <span>{t.calculateIrrigationBtn}</span>
                </>
              )}
            </button>
          </form>
        </div>

        <div className="lg:col-span-7">
          {result && (
            <div className="bg-white rounded-2xl p-6 border border-emerald-100/80 space-y-5 animate-in fade-in duration-300">
              <div
                className={`p-5 rounded-2xl text-white ${
                  result.status === 'Critical'
                    ? 'bg-amber-700'
                    : result.status === 'Delay Needed'
                    ? 'bg-blue-700'
                    : 'bg-emerald-800'
                }`}
              >
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold">Status: {result.status}</span>
                  <span className="font-mono-tabular">
                    Frequency: Every {result.frequencyDays} Days
                  </span>
                </div>

                <div className="mt-4">
                  <div className="text-[11px] text-white/80 font-semibold">{t.requiredWater}</div>
                  <div className="text-3xl font-extrabold text-white mt-0.5 font-mono-tabular">
                    {result.waterVolumeLiters.toLocaleString()} Liters
                  </div>
                  <p className="text-xs text-white/90 mt-1">
                    For {formData.landArea} Acres plot ({formData.crop})
                  </p>
                </div>
              </div>

              {result.rainAlert && (
                <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-center gap-2.5">
                  <CloudRain className="w-5 h-5 text-amber-600 shrink-0" />
                  <span>
                    <strong>Weather Advisory:</strong> {result.rainAlert}
                  </span>
                </div>
              )}

              <div className="p-4 rounded-xl bg-slate-50 border border-gray-200">
                <span className="text-xs font-bold text-gray-900 block mb-1">
                  Recommended Irrigation System:
                </span>
                <p className="text-xs text-emerald-800 font-semibold">
                  {result.methodRecommendation}
                </p>
              </div>

              <div>
                <h4 className="font-bold text-xs text-gray-800 mb-2">Water Conservation Tips:</h4>
                <ul className="space-y-1.5 text-xs text-gray-700">
                  {result.tips.map((tip, idx) => (
                    <li
                      key={idx}
                      className="flex items-start gap-2 bg-emerald-50/50 p-2.5 rounded-xl border border-emerald-100"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                      <span>{tip}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
