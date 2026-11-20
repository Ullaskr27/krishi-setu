import React, { useState } from 'react';
import { TestTube2, Sparkles, AlertCircle, Leaf, FlaskConical, Scale } from 'lucide-react';
import { Language, FertilizerResult } from '../types';
import { translations } from '../translations';
import { saveAdvisoryLog } from '../firebase';

interface FertilizerViewProps {
  userId: string;
  language: Language;
}

export const FertilizerView: React.FC<FertilizerViewProps> = ({ userId, language }) => {
  const t = translations[language];

  const [formData, setFormData] = useState({
    crop: 'Finger Millet (Ragi)',
    nitrogen: 35,
    phosphorus: 25,
    potassium: 30,
    ph: 6.5,
    growthStage: 'Vegetative Growth' as
      | 'Basal / Sowing'
      | 'Vegetative Growth'
      | 'Flowering & Fruiting'
      | 'Pre-Harvest'
  });

  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<FertilizerResult | null>({
    deficiencies: [
      'Nitrogen level is 30% below requirement — leading to pale yellow lower leaves.',
      'Phosphorus is moderate — essential for tillering and earhead development.'
    ],
    recommendedCategory: 'NPK Balanced + Micro-Nutrient Bio-Fertilizer',
    chemicalFertilizers: [
      { name: 'Urea (46% N)', quantityKgPerAcre: 30, timing: 'Top-dress at 30 days after sowing' },
      { name: 'DAP (18:46:0)', quantityKgPerAcre: 25, timing: 'Incorporate near root zone during weeding' },
      { name: 'MOP (60% K)', quantityKgPerAcre: 20, timing: 'Apply before earhead emergence' }
    ],
    organicAlternatives: [
      { name: 'Neem-Coated Cake', quantityKgPerAcre: 100, benefits: 'Enhances Nitrogen absorption & repels soil nematodes' },
      { name: 'Vermicompost', quantityKgPerAcre: 500, benefits: 'Supplies humic acid and improves soil water holding' },
      { name: 'Azospirillum Bio-fertilizer', quantityKgPerAcre: 2, benefits: 'Fixes atmospheric Nitrogen naturally' }
    ],
    generalGuidance: [
      'Apply chemical fertilizers only when soil has adequate moisture.',
      'Do not mix Urea directly with Single Super Phosphate (SSP).'
    ]
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch('/api/fertilizer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      const data: FertilizerResult = await res.json();
      setResult(data);

      const topChem = data.chemicalFertilizers[0];
      await saveAdvisoryLog(userId, {
        category: 'fertilizer',
        cropName: formData.crop,
        title: `Fertilizer Advisory — ${formData.crop} (${formData.growthStage})`,
        summary: `NPK ${formData.nitrogen}-${formData.phosphorus}-${formData.potassium}: ${data.deficiencies[0] || data.recommendedCategory}`,
        metricLabel: topChem ? `${topChem.quantityKgPerAcre} kg ${topChem.name.split(' ')[0]}/ac` : 'Saved',
        language
      });
    } catch (err) {
      console.error('Fertilizer query failed:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200 pb-12">
      <div className="bg-white rounded-2xl p-6 border border-emerald-100/80">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-emerald-800 text-white flex items-center justify-center">
            <TestTube2 className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900">{t.fertilizerGuide}</h2>
            <p className="text-xs text-gray-500 mt-0.5">
              Targeted NPK nutrient deficiency analysis & eco-friendly dosage advisory saved to your farmer history.
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-5 bg-white rounded-2xl p-6 border border-emerald-100/80">
          <h3 className="font-bold text-gray-900 text-sm mb-4 pb-2 border-b border-gray-100 flex items-center gap-2">
            <FlaskConical className="w-4 h-4 text-emerald-700" />
            Crop & Soil NPK Inputs
          </h3>

          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            <div>
              <label className="font-semibold text-gray-700 block mb-1">Select Crop</label>
              <select
                value={formData.crop}
                onChange={(e) => setFormData({ ...formData, crop: e.target.value })}
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-gray-900 font-medium focus:outline-none focus:ring-2 focus:ring-emerald-600"
              >
                <option value="Finger Millet (Ragi)">Finger Millet / Ragi</option>
                <option value="Tomato">Tomato</option>
                <option value="Maize">Maize / Corn</option>
                <option value="Paddy">Paddy / Rice</option>
                <option value="Cotton">Cotton</option>
              </select>
            </div>

            <div>
              <label className="font-semibold text-gray-700 block mb-1">{t.growthStage}</label>
              <select
                value={formData.growthStage}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    growthStage: e.target.value as typeof formData.growthStage
                  })
                }
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-gray-900 font-medium focus:outline-none focus:ring-2 focus:ring-emerald-600"
              >
                <option value="Basal / Sowing">Basal / Sowing Stage</option>
                <option value="Vegetative Growth">Vegetative Growth Stage</option>
                <option value="Flowering & Fruiting">Flowering & Earhead Stage</option>
                <option value="Pre-Harvest">Pre-Harvest Stage</option>
              </select>
            </div>

            <div className="grid grid-cols-3 gap-2 bg-emerald-50/60 p-3 rounded-xl border border-emerald-100">
              <div>
                <label className="font-semibold text-emerald-950 block mb-1">Soil N</label>
                <input
                  type="number"
                  value={formData.nitrogen}
                  onChange={(e) => setFormData({ ...formData, nitrogen: Number(e.target.value) })}
                  className="w-full bg-white border border-emerald-200 rounded-lg px-2 py-1.5 font-bold font-mono-tabular text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-600"
                />
              </div>
              <div>
                <label className="font-semibold text-emerald-950 block mb-1">Soil P</label>
                <input
                  type="number"
                  value={formData.phosphorus}
                  onChange={(e) => setFormData({ ...formData, phosphorus: Number(e.target.value) })}
                  className="w-full bg-white border border-emerald-200 rounded-lg px-2 py-1.5 font-bold font-mono-tabular text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-600"
                />
              </div>
              <div>
                <label className="font-semibold text-emerald-950 block mb-1">Soil K</label>
                <input
                  type="number"
                  value={formData.potassium}
                  onChange={(e) => setFormData({ ...formData, potassium: Number(e.target.value) })}
                  className="w-full bg-white border border-emerald-200 rounded-lg px-2 py-1.5 font-bold font-mono-tabular text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-600"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-emerald-800 hover:bg-emerald-900 text-white font-semibold py-3 rounded-xl transition-colors flex items-center justify-center gap-2 mt-2 cursor-pointer"
            >
              {loading ? (
                <span>Analyzing & Saving...</span>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 text-amber-300" />
                  <span>{t.calculateFertilizerBtn}</span>
                </>
              )}
            </button>
          </form>
        </div>

        <div className="lg:col-span-7">
          {result && (
            <div className="bg-white rounded-2xl p-6 border border-emerald-100/80 space-y-5 animate-in fade-in duration-300">
              <div>
                <h4 className="font-bold text-xs text-amber-800 mb-2 flex items-center gap-1.5">
                  <AlertCircle className="w-4 h-4 text-amber-600" />
                  {t.deficiencyAlerts}:
                </h4>
                <div className="space-y-2 text-xs">
                  {result.deficiencies.map((def, idx) => (
                    <div key={idx} className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-950">
                      {def}
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="font-bold text-xs text-gray-800 mb-2 flex items-center gap-1.5">
                  <Scale className="w-4 h-4 text-emerald-700" />
                  {t.suggestedFertilizers}:
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                  {result.chemicalFertilizers.map((fert, idx) => (
                    <div key={idx} className="p-3 rounded-xl bg-slate-50 border border-gray-200 text-xs">
                      <div className="font-bold text-gray-900">{fert.name}</div>
                      <div className="text-emerald-800 font-bold text-sm my-0.5 font-mono-tabular">
                        {fert.quantityKgPerAcre} kg / Acre
                      </div>
                      <div className="text-[11px] text-gray-500">{fert.timing}</div>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="font-bold text-xs text-emerald-800 mb-2 flex items-center gap-1.5">
                  <Leaf className="w-4 h-4 text-emerald-600" />
                  {t.organicOptions}:
                </h4>
                <div className="space-y-2 text-xs">
                  {result.organicAlternatives.map((org, idx) => (
                    <div
                      key={idx}
                      className="p-3 rounded-xl bg-emerald-50/60 border border-emerald-200 flex items-center justify-between gap-3"
                    >
                      <div>
                        <div className="font-bold text-emerald-950">{org.name}</div>
                        <p className="text-[11px] text-emerald-800 mt-0.5">{org.benefits}</p>
                      </div>
                      <span className="font-bold font-mono-tabular text-emerald-900 text-xs shrink-0">
                        {org.quantityKgPerAcre} kg/acre
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
