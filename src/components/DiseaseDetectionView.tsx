import React, { useState } from 'react';
import {
  ShieldAlert,
  UploadCloud,
  FileImage,
  AlertTriangle,
  PhoneCall,
  Sparkles,
  RefreshCw,
  Info
} from 'lucide-react';
import { Language, DiseaseDetectionResult } from '../types';
import { translations } from '../translations';
import { saveAdvisoryLog } from '../firebase';

interface DiseaseDetectionViewProps {
  userId: string;
  language: Language;
}

function createSampleLeafDataUrl(bg: string, leafColor: string, spotColor: string, label: string): string {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="320" height="200" viewBox="0 0 320 200">
    <rect width="320" height="200" fill="${bg}"/>
    <path d="M70 140 C100 50, 210 40, 255 65 C235 140, 145 165, 70 140 Z" fill="${leafColor}" stroke="#14532d" stroke-width="3"/>
    <path d="M72 138 Q160 95 250 67" stroke="#dcfce7" stroke-width="2" fill="none" opacity="0.65"/>
    <circle cx="150" cy="95" r="10" fill="${spotColor}" opacity="0.85"/>
    <circle cx="185" cy="82" r="7" fill="${spotColor}" opacity="0.85"/>
    <circle cx="130" cy="115" r="6" fill="${spotColor}" opacity="0.85"/>
    <text x="16" y="184" font-family="sans-serif" font-size="13" font-weight="600" fill="#1e293b">${label}</text>
  </svg>`;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

export const DiseaseDetectionView: React.FC<DiseaseDetectionViewProps> = ({ userId, language }) => {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [selectedCrop, setSelectedCrop] = useState<string>('Tomato');
  const [analyzing, setAnalyzing] = useState(false);
  const [result, setResult] = useState<DiseaseDetectionResult | null>(null);

  const t = translations[language];

  const demoSamples = [
    {
      name: 'Tomato Leaf Blight',
      crop: 'Tomato',
      url: createSampleLeafDataUrl('#f1f5f9', '#4d7c0f', '#92400e', 'Tomato Blight Sample')
    },
    {
      name: 'Rice Leaf Blast',
      crop: 'Rice / Paddy',
      url: createSampleLeafDataUrl('#ecfdf5', '#15803d', '#b45309', 'Paddy Blast Sample')
    },
    {
      name: 'Healthy Ragi Leaf',
      crop: 'Finger Millet',
      url: createSampleLeafDataUrl('#f0fdf4', '#16a34a', '#22c55e', 'Healthy Ragi Sample')
    }
  ];

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setSelectedImage(reader.result as string);
        setResult(null);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAnalyze = async () => {
    if (!selectedImage) return;
    setAnalyzing(true);

    try {
      const res = await fetch('/api/disease-detection', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ crop: selectedCrop })
      });
      const data: DiseaseDetectionResult = await res.json();
      setResult(data);

      await saveAdvisoryLog(userId, {
        category: 'disease',
        cropName: data.affectedCrop,
        title: `Disease Diagnosis: ${data.diseaseName}`,
        summary: `${data.suggestedTreatment.organic} | ${data.suggestedTreatment.chemical}`,
        metricLabel: `${data.confidence}% Confidence`,
        language
      });
    } catch (err) {
      console.error('Disease evaluation failed:', err);
    } finally {
      setAnalyzing(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200 pb-12">
      <div className="bg-white rounded-2xl p-6 border border-emerald-100/80">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-amber-600 text-white flex items-center justify-center">
            <ShieldAlert className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900">{t.diseaseDetection}</h2>
            <p className="text-xs text-gray-500 mt-0.5">
              Upload or select a crop leaf sample for disease diagnosis & treatment history logging.
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-5 bg-white rounded-2xl p-6 border border-emerald-100/80 space-y-4">
          <h3 className="font-bold text-gray-900 text-sm pb-2 border-b border-gray-100 flex items-center gap-2">
            <UploadCloud className="w-4 h-4 text-emerald-600" />
            {t.uploadLeaf}
          </h3>

          <label className="border-2 border-dashed border-emerald-300 hover:border-emerald-500 bg-emerald-50/50 rounded-2xl p-6 flex flex-col items-center justify-center cursor-pointer transition-colors text-center">
            {selectedImage ? (
              <div className="relative group w-full">
                <img
                  src={selectedImage}
                  alt="Uploaded Crop Leaf"
                  referrerPolicy="no-referrer"
                  className="w-full max-h-56 object-cover rounded-xl"
                />
                <div className="absolute inset-0 bg-black/40 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-xs font-semibold">
                  Click to Change Photo
                </div>
              </div>
            ) : (
              <>
                <FileImage className="w-10 h-10 text-emerald-600 mb-2" />
                <span className="font-bold text-xs text-gray-800">{t.dragDropText}</span>
                <span className="text-[10px] text-gray-400 mt-1">Supports JPG, PNG (Max 10MB)</span>
              </>
            )}
            <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
          </label>

          <div>
            <span className="text-xs font-semibold text-gray-600 block mb-2">
              {t.selectDemoSample}
            </span>
            <div className="grid grid-cols-3 gap-2">
              {demoSamples.map((sample, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => {
                    setSelectedImage(sample.url);
                    setSelectedCrop(sample.crop);
                    setResult(null);
                  }}
                  className="border border-gray-200 rounded-xl overflow-hidden hover:border-emerald-500 transition-colors text-left bg-gray-50 cursor-pointer"
                >
                  <img
                    src={sample.url}
                    alt={sample.name}
                    referrerPolicy="no-referrer"
                    className="h-16 w-full object-cover"
                  />
                  <div className="p-1.5 text-[10px] font-semibold text-gray-800 truncate">
                    {sample.name}
                  </div>
                </button>
              ))}
            </div>
          </div>

          <button
            type="button"
            onClick={handleAnalyze}
            disabled={!selectedImage || analyzing}
            className="w-full bg-emerald-800 hover:bg-emerald-900 disabled:opacity-50 text-white font-semibold py-3 rounded-xl transition-colors flex items-center justify-center gap-2 cursor-pointer"
          >
            {analyzing ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Evaluating Plant Pathology...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 text-amber-300" />
                <span>{t.analyzeBtn}</span>
              </>
            )}
          </button>
        </div>

        <div className="lg:col-span-7">
          {!result ? (
            <div className="bg-white rounded-2xl p-8 text-center border border-emerald-100 flex flex-col items-center justify-center min-h-[380px]">
              <ShieldAlert className="w-12 h-12 text-gray-300 mb-3" />
              <h3 className="font-bold text-gray-700 text-sm">No Image Evaluated Yet</h3>
              <p className="text-xs text-gray-400 max-w-sm mt-1">
                Upload a photo or select a sample leaf above and click "{t.analyzeBtn}" to diagnose and record the result in your farmer history.
              </p>
            </div>
          ) : (
            <div className="bg-white rounded-2xl p-6 border border-emerald-100/80 space-y-5 animate-in fade-in duration-300">
              <div className="bg-amber-50 border border-amber-200 p-4 rounded-xl flex items-start justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0" />
                    <h3 className="font-extrabold text-base text-gray-900">{result.diseaseName}</h3>
                  </div>
                  <p className="text-xs text-gray-600 mt-1">
                    Affected Crop: <strong>{result.affectedCrop}</strong>
                  </p>
                </div>
                <span className="text-xs font-mono-tabular font-bold text-emerald-800 shrink-0">
                  {result.confidence}% Confidence
                </span>
              </div>

              <div className="bg-blue-50 border border-blue-200 text-blue-900 p-3 rounded-xl text-xs flex items-center gap-2">
                <Info className="w-4 h-4 text-blue-600 shrink-0" />
                <span>
                  <strong>Demo Diagnostic Mode:</strong> Saved to your Farmer History. Always verify with local agricultural officers before heavy chemical sprays.
                </span>
              </div>

              <div>
                <h4 className="font-bold text-xs text-gray-800 mb-2">{t.symptoms}:</h4>
                <ul className="space-y-1.5 text-xs text-gray-700">
                  {result.symptoms.map((symptom, idx) => (
                    <li key={idx} className="bg-slate-50 p-2.5 rounded-xl border border-gray-100">
                      {symptom}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200">
                  <span className="font-bold text-emerald-900 block mb-1 text-xs">
                    Organic / Biological Control:
                  </span>
                  <p className="text-emerald-950 leading-relaxed">{result.suggestedTreatment.organic}</p>
                </div>
                <div className="p-3.5 rounded-xl bg-slate-50 border border-gray-200">
                  <span className="font-bold text-gray-900 block mb-1 text-xs">
                    Chemical Spray Treatment:
                  </span>
                  <p className="text-gray-800 leading-relaxed">{result.suggestedTreatment.chemical}</p>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-emerald-900 text-white flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-emerald-700 flex items-center justify-center text-emerald-100 shrink-0">
                  <PhoneCall className="w-5 h-5" />
                </div>
                <div>
                  <div className="font-semibold text-xs text-emerald-200">Agricultural Helpline</div>
                  <div className="text-sm font-bold text-white">{t.callExpert}</div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
