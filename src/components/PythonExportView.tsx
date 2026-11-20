import React, { useState } from 'react';
import {
  Code,
  Terminal,
  Copy,
  Check,
  FolderTree,
  FileCode,
  Play,
  ExternalLink,
  BookOpen
} from 'lucide-react';
import { Language } from '../types';
import { translations } from '../translations';

interface PythonExportViewProps {
  language: Language;
}

export const PythonExportView: React.FC<PythonExportViewProps> = ({ language }) => {
  const t = translations[language];
  const [activeTab, setActiveTab] = useState<'guide' | 'app_py' | 'crop_py' | 'chatbot_py' | 'req_txt'>('guide');
  const [copied, setCopied] = useState(false);

  const codeSnippets = {
    app_py: `# Python Flask Backend Entry Point - app.py
from flask import Flask, request, jsonify
from flask_cors import CORS
import sqlite3, os
from dotenv import load_dotenv

load_dotenv()
app = Flask(__name__)
CORS(app)

DATABASE = 'database/database.db'

def get_db():
    conn = sqlite3.connect(DATABASE)
    conn.row_factory = sqlite3.Row
    return conn

@app.route('/api/predict-crop', methods=['POST'])
def predict_crop():
    data = request.json or {}
    N = float(data.get('nitrogen', 60))
    P = float(data.get('phosphorus', 40))
    K = float(data.get('potassium', 40))
    ph = float(data.get('ph', 6.5))

    # Rule based evaluation
    if N > 50 and ph >= 6.0 and ph <= 7.5:
        crop = "Finger Millet (Ragi / à²°à²¾à²—à²¿)"
        score = 94
    else:
        crop = "Groundnut (à²•à²¡à²²à³†à²•à²¾à²¯à²¿)"
        score = 88

    return jsonify({
        "bestCrop": {
            "name": crop,
            "suitabilityScore": score,
            "growingDuration": "110-120 Days",
            "waterRequirement": "Medium (Rainfed)",
            "expectedYield": "12-15 Quintals / Acre",
            "marketDemand": "High in Mandya APMC"
        }
    })

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)`,

    crop_py: `# services/crop_prediction.py
class CropPredictionEngine:
    def __init__(self):
        self.crops_db = [
            {"name": "Finger Millet (Ragi)", "n_min": 40, "n_max": 90, "ph_min": 5.5, "ph_max": 7.5},
            {"name": "Tomato", "n_min": 60, "n_max": 120, "ph_min": 6.0, "ph_max": 7.0},
            {"name": "Paddy (Rice)", "n_min": 80, "n_max": 150, "ph_min": 5.0, "ph_max": 6.5}
        ]

    def predict(self, n, p, k, ph, rainfall):
        scores = []
        for crop in self.crops_db:
            score = 100
            if not (crop['n_min'] <= n <= crop['n_max']):
                score -= 20
            if not (crop['ph_min'] <= ph <= crop['ph_max']):
                score -= 15
            scores.append((crop['name'], max(score, 50)))

        scores.sort(key=lambda x: x[1], reverse=True)
        return scores`,

    chatbot_py: `# services/ai_chatbot.py
import os
from google import genai

class AIChatbotService:
    def __init__(self):
        api_key = os.getenv("GEMINI_API_KEY")
        self.ai = genai.Client(api_key=api_key) if api_key else None

    def get_reply(self, message: str, language: str = 'en'):
        if not self.ai:
            return "ðŸŒ± AI Krishi Mitra rule-based fallback response: Apply balanced NPK 19:19:19 for crop yellowing."

        response = self.ai.models.generate_content(
            model='gemini-3.6-flash',
            contents=f"You are AI Krishi Mitra, a helpful agricultural expert. Answer concisely in {language}: {message}"
        )
        return response.text`,

    req_txt: `flask==3.0.2
flask-cors==4.0.0
python-dotenv==1.0.1
requests==2.31.0
google-genai==2.4.0`
  };

  const copyCode = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200 pb-12">

      {/* Title Header */}
      <div className="bg-white rounded-3xl p-6 shadow-sm border border-emerald-100/80">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-emerald-800 text-white flex items-center justify-center shadow-md">
            <Code className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900">{t.pythonExport}</h2>
            <p className="text-xs text-gray-500 mt-0.5">
              Full VS Code Python Flask codebase structure, SQLite database, and execution instructions.
            </p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-gray-200 overflow-x-auto pb-2 text-xs">
        <button
          onClick={() => setActiveTab('guide')}
          className={`px-4 py-2 rounded-xl font-bold flex items-center gap-2 transition-all shrink-0 ${
            activeTab === 'guide'
              ? 'bg-emerald-800 text-white shadow-sm'
              : 'bg-white text-gray-700 hover:bg-emerald-50'
          }`}
        >
          <BookOpen className="w-4 h-4" />
          <span>VS Code Quick Start</span>
        </button>
        <button
          onClick={() => setActiveTab('app_py')}
          className={`px-3.5 py-2 rounded-xl font-medium flex items-center gap-2 transition-all shrink-0 ${
            activeTab === 'app_py'
              ? 'bg-emerald-800 text-white shadow-sm font-bold'
              : 'bg-white text-gray-700 hover:bg-emerald-50'
          }`}
        >
          <FileCode className="w-4 h-4 text-emerald-600" />
          <span>app.py</span>
        </button>
        <button
          onClick={() => setActiveTab('crop_py')}
          className={`px-3.5 py-2 rounded-xl font-medium flex items-center gap-2 transition-all shrink-0 ${
            activeTab === 'crop_py'
              ? 'bg-emerald-800 text-white shadow-sm font-bold'
              : 'bg-white text-gray-700 hover:bg-emerald-50'
          }`}
        >
          <FileCode className="w-4 h-4 text-emerald-600" />
          <span>crop_prediction.py</span>
        </button>
        <button
          onClick={() => setActiveTab('chatbot_py')}
          className={`px-3.5 py-2 rounded-xl font-medium flex items-center gap-2 transition-all shrink-0 ${
            activeTab === 'chatbot_py'
              ? 'bg-emerald-800 text-white shadow-sm font-bold'
              : 'bg-white text-gray-700 hover:bg-emerald-50'
          }`}
        >
          <FileCode className="w-4 h-4 text-emerald-600" />
          <span>ai_chatbot.py</span>
        </button>
        <button
          onClick={() => setActiveTab('req_txt')}
          className={`px-3.5 py-2 rounded-xl font-medium flex items-center gap-2 transition-all shrink-0 ${
            activeTab === 'req_txt'
              ? 'bg-emerald-800 text-white shadow-sm font-bold'
              : 'bg-white text-gray-700 hover:bg-emerald-50'
          }`}
        >
          <FileCode className="w-4 h-4 text-emerald-600" />
          <span>requirements.txt</span>
        </button>
      </div>

      {/* Tab Content */}
      {activeTab === 'guide' ? (
        <div className="space-y-6">

          {/* Project Directory Structure */}
          <div className="bg-white rounded-3xl p-6 shadow-sm border border-emerald-100">
            <h3 className="font-bold text-gray-900 text-sm mb-3 pb-2 border-b border-gray-100 flex items-center gap-2">
              <FolderTree className="w-4 h-4 text-emerald-700" />
              Project File Structure in VS Code
            </h3>

            <pre className="p-4 rounded-2xl bg-gray-900 text-emerald-400 font-mono text-xs overflow-x-auto leading-relaxed">
{`smart-crop-system/
â”‚
â”œâ”€â”€ app.py                      # Python Flask Backend & API Routes
â”œâ”€â”€ requirements.txt            # Python Dependencies
â”œâ”€â”€ .env.example                # Environment Variables (GEMINI_API_KEY, WEATHER_API_KEY)
â”œâ”€â”€ README.md                   # Full Setup Instructions
â”‚
â”œâ”€â”€ database/
â”‚   â””â”€â”€ database.db             # SQLite Farmer & Crop Database
â”‚
â”œâ”€â”€ services/
â”‚   â”œâ”€â”€ crop_prediction.py      # Rule-based NPK Crop Matching Engine
â”‚   â”œâ”€â”€ weather.py              # Weather API Integration Service
â”‚   â””â”€â”€ ai_chatbot.py           # Gemini 3.6 Flash Chatbot Assistant
â”‚
â”œâ”€â”€ src/                        # React TypeScript Frontend
â”‚   â”œâ”€â”€ components/             # Navbar, Sidebar, Chatbot, Views
â”‚   â”œâ”€â”€ translations.ts         # English, Kannada, Hindi i18n
â”‚   â””â”€â”€ types.ts                # TypeScript Interfaces
â”‚
â””â”€â”€ server.ts                   # Express & Vite Dev Server Proxy`}
            </pre>
          </div>

          {/* Step-by-Step Terminal Commands */}
          <div className="bg-white rounded-3xl p-6 shadow-sm border border-emerald-100 space-y-4">
            <h3 className="font-bold text-gray-900 text-sm pb-2 border-b border-gray-100 flex items-center gap-2">
              <Terminal className="w-4 h-4 text-emerald-700" />
              How to Run in VS Code Terminal
            </h3>

            <div className="space-y-3 text-xs">

              <div className="p-3.5 rounded-2xl bg-slate-50 border border-gray-200">
                <span className="font-bold text-gray-900 block mb-1">Step 1: Open VS Code & Open Terminal (`Ctrl + ~`)</span>
                <div className="p-2.5 rounded-xl bg-gray-900 text-emerald-300 font-mono flex items-center justify-between">
                  <span>cd smart-crop-system</span>
                  <button onClick={() => copyCode('cd smart-crop-system')} className="p-1 hover:text-white">
                    <Copy className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-50 border border-gray-200">
                <span className="font-bold text-gray-900 block mb-1">Step 2: Create Python Virtual Environment</span>
                <div className="p-2.5 rounded-xl bg-gray-900 text-emerald-300 font-mono space-y-1">
                  <div>python -m venv venv</div>
                  <div>source venv/bin/activate # On Windows: venv\Scripts\activate</div>
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-50 border border-gray-200">
                <span className="font-bold text-gray-900 block mb-1">Step 3: Install Requirements & Run Flask</span>
                <div className="p-2.5 rounded-xl bg-gray-900 text-emerald-300 font-mono space-y-1">
                  <div>pip install -r requirements.txt</div>
                  <div>python app.py</div>
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-50 border border-gray-200">
                <span className="font-bold text-gray-900 block mb-1">Step 4: Launch React Frontend (In a second terminal)</span>
                <div className="p-2.5 rounded-xl bg-gray-900 text-emerald-300 font-mono">
                  npm run dev
                </div>
              </div>

            </div>
          </div>

        </div>
      ) : (
        <div className="bg-gray-900 rounded-3xl p-5 border border-gray-800 shadow-xl relative text-xs">
          <div className="flex items-center justify-between mb-3 pb-3 border-b border-gray-800">
            <span className="text-emerald-400 font-mono font-bold">{activeTab}.py</span>
            <button
              onClick={() => copyCode(codeSnippets[activeTab as keyof typeof codeSnippets])}
              className="flex items-center gap-1.5 bg-emerald-800 hover:bg-emerald-700 text-white px-3 py-1.5 rounded-xl font-medium transition-all"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-300" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied!' : 'Copy Code'}</span>
            </button>
          </div>

          <pre className="p-3 text-gray-200 font-mono overflow-x-auto leading-relaxed">
            {codeSnippets[activeTab as keyof typeof codeSnippets]}
          </pre>
        </div>
      )}

    </div>
  );
};
