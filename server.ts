import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import dotenv from "dotenv";
import { GoogleGenAI } from "@google/genai";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json({ limit: "15mb" }));

// Initialize Gemini Client
let aiClient: GoogleGenAI | null = null;
if (process.env.GEMINI_API_KEY) {
  aiClient = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY,
    httpOptions: {
      headers: {
        "User-Agent": "aistudio-build"
      }
    }
  });
}

const LANGUAGE_NAMES: Record<string, string> = {
  en: "English",
  kn: "Kannada (ಕನ್ನಡ)",
  hi: "Hindi (हिंदी)",
  ta: "Tamil (தமிழ்)",
  te: "Telugu (తెలుగు)",
  mr: "Marathi (मराठी)"
};

// Crop Suggestion API
app.post("/api/predict-crop", (req, res) => {
  const {
    nitrogen = 60,
    phosphorus = 45,
    potassium = 40,
    ph = 6.5,
    season = "Kharif",
    availableWater = "Medium"
  } = req.body;

  const N = Number(nitrogen);
  const P = Number(phosphorus);
  const K = Number(potassium);
  const pHVal = Number(ph);

  const crops = [
    {
      name: "Finger Millet / Ragi (ರಾಗಿ)",
      category: "Nutri-Cereal Millet",
      suitabilityScore: 94,
      growingDuration: "105 - 120 Days",
      waterRequirement: "Low (400 - 500 mm)",
      idealSoil: "Red Loamy Soil, Well-Drained",
      expectedYield: "14 - 18 Quintals / Acre",
      marketDemand: "High" as const,
      description: "Drought-resilient superfood crop ideal for red loamy soil & monsoon weather.",
      tips: [
        "Sow with 4:2 ratio intercropping with Pigeonpea (Tur Dal).",
        "Requires minimal chemical fertilizer; apply Farmyard Manure.",
        "Harvest when earheads turn golden brown."
      ],
      npkRequirement: { n: 50, p: 35, k: 30, ph: "5.5 - 7.5" }
    },
    {
      name: "Maize / Corn (ಮೆಕ್ಕೆಜೋಳ)",
      category: "Coarse Grain",
      suitabilityScore: 88,
      growingDuration: "95 - 110 Days",
      waterRequirement: "Medium (500 - 650 mm)",
      idealSoil: "Deep Sandy Loam",
      expectedYield: "28 - 35 Quintals / Acre",
      marketDemand: "High" as const,
      description: "High yielding cereal crop with strong APMC market demand.",
      tips: [
        "Top-dress Urea at 30 days and 50 days after sowing.",
        "Ensure field drainage to prevent waterlogging.",
        "Monitor for Fall Armyworm during early whorl stage."
      ],
      npkRequirement: { n: 100, p: 50, k: 40, ph: "6.0 - 7.8" }
    },
    {
      name: "Hybrid Tomato (ಟೊಮೆಟೊ)",
      category: "Horticulture Vegetable",
      suitabilityScore: 85,
      growingDuration: "120 - 130 Days",
      waterRequirement: "Medium (600 mm - Drip Preferred)",
      idealSoil: "Rich Loam with good organic matter",
      expectedYield: "20 - 28 Tons / Acre",
      marketDemand: "High" as const,
      description: "Short duration cash crop with quick market returns.",
      tips: [
        "Adopt staking with GI wire to elevate fruits from soil.",
        "Foliar spray of Calcium Nitrate prevents Blossom End Rot.",
        "Use yellow sticky traps to catch whiteflies."
      ],
      npkRequirement: { n: 120, p: 60, k: 60, ph: "6.0 - 7.0" }
    },
    {
      name: "Paddy / Rice (ಭತ್ತ)",
      category: "Cereal Grain",
      suitabilityScore: 80,
      growingDuration: "135 - 150 Days",
      waterRequirement: "High (1200 - 1400 mm)",
      idealSoil: "Clay & Clay Loam",
      expectedYield: "22 - 26 Quintals / Acre",
      marketDemand: "Stable" as const,
      description: "Staple food grain crop suitable for canal-irrigated regions.",
      tips: [
        "Maintain 3-5 cm water level during tillering stage.",
        "Apply Zinc Sulphate @ 10 kg/acre if leaves turn rusty.",
        "Drain field 10 days prior to harvest."
      ],
      npkRequirement: { n: 110, p: 50, k: 50, ph: "5.5 - 7.0" }
    }
  ];

  if (N < 40) {
    crops[0].suitabilityScore = Math.min(99, crops[0].suitabilityScore + 4);
  }
  if (pHVal < 6.0) {
    crops[0].suitabilityScore = Math.min(99, crops[0].suitabilityScore + 2);
  }
  if (availableWater === "High") {
    crops[3].suitabilityScore = Math.min(97, crops[3].suitabilityScore + 12);
  }

  const sorted = [...crops].sort((a, b) => b.suitabilityScore - a.suitabilityScore);

  res.json({
    bestCrop: sorted[0],
    alternativeCrops: sorted.slice(1),
    soilAnalysisNotes: `Soil NPK (${N}-${P}-${K}) and pH (${pHVal}) match ${sorted[0].name} for ${season} season with ${availableWater} water availability.`
  });
});

// Weather API
app.get("/api/weather", (req, res) => {
  const city = (req.query.city as string) || "Mandya, Karnataka";

  res.json({
    city,
    temp: 28,
    condition: "Partly Cloudy",
    humidity: 65,
    windSpeed: 14,
    rainProbability: 40,
    uvIndex: 7,
    sunrise: "06:12 AM",
    sunset: "06:44 PM",
    forecast: [
      { day: "Today", tempMax: 29, tempMin: 20, condition: "Partly Cloudy", rainProb: 40, icon: "cloud-sun" },
      { day: "Tomorrow", tempMax: 27, tempMin: 19, condition: "Light Rain Expected", rainProb: 75, icon: "cloud-rain" },
      { day: "Wed", tempMax: 26, tempMin: 18, condition: "Thunderstorms", rainProb: 80, icon: "cloud-lightning" },
      { day: "Thu", tempMax: 30, tempMin: 21, condition: "Sunny / Clear", rainProb: 15, icon: "sun" },
      { day: "Fri", tempMax: 31, tempMin: 22, condition: "Clear Sky", rainProb: 10, icon: "sun" },
      { day: "Sat", tempMax: 29, tempMin: 20, condition: "Partly Cloudy", rainProb: 25, icon: "cloud-sun" },
      { day: "Sun", tempMax: 28, tempMin: 19, condition: "Overcast Breeze", rainProb: 35, icon: "wind" }
    ],
    farmerAdvice: [
      "Rain expected tomorrow afternoon — delay chemical fertilizer or pesticide sprays.",
      "High daytime relative humidity (65%) — monitor paddy fields for Blast fungus.",
      "Optimal temperatures (28°C) for transplanting tomato seedlings."
    ]
  });
});

// Disease Detection API
app.post("/api/disease-detection", (req, res) => {
  const { crop = "Tomato" } = req.body;

  res.json({
    diseaseName: "Early Blight (Alternaria solani)",
    affectedCrop: crop,
    confidence: 93.5,
    symptoms: [
      "Concentric ring dark brown spots on lower mature leaves.",
      "Yellow halo surrounding brown leaf lesions.",
      "Premature leaf drop leading to fruit sunburn."
    ],
    prevention: [
      "Maintain crop rotation with non-solanaceous crops (e.g. Maize, Legumes).",
      "Avoid overhead sprinkler irrigation to reduce foliage wetness duration.",
      "Remove and destroy infected lower leaves immediately."
    ],
    suggestedTreatment: {
      chemical: "Foliar spray of Mancozeb 75% WP @ 2.5 g/liter OR Chlorothalonil @ 2 g/liter water.",
      organic: "Spray 5% Neem seed kernel extract (NSKE) or Copper Hydroxide (2 g/L) twice at 10-day intervals.",
      dosage: "150-200 Liters spray solution per acre."
    },
    contactExpertNotice: "Contact Krishi Vigyan Kendra (KVK) or Kisan Call Center Hotline: 1800-180-1551 for free expert diagnosis.",
    isDemo: true
  });
});

// Irrigation Assistant API
app.post("/api/irrigation", (req, res) => {
  const { soilMoisture = 35, landArea = 2 } = req.body;

  const moisture = Number(soilMoisture);
  let status: "Critical" | "Optimal" | "Delay Needed" = "Optimal";
  let waterLitersPerAcre = 12000;
  let frequencyDays = 3;

  if (moisture < 40) {
    status = "Critical";
    waterLitersPerAcre = 16000;
    frequencyDays = 2;
  } else if (moisture > 70) {
    status = "Delay Needed";
    waterLitersPerAcre = 0;
    frequencyDays = 5;
  }

  const totalVolume = waterLitersPerAcre * Number(landArea);

  res.json({
    status,
    waterVolumeLiters: totalVolume,
    frequencyDays,
    methodRecommendation: "Drip Irrigation with 2.0 LPH emitters spaced at 30 cm",
    tips: [
      "Water between 6:00 AM - 8:00 AM to minimize evaporation.",
      "Use organic straw mulching to conserve up to 30% soil moisture.",
      "Check lateral pipes for clogging every 15 days."
    ],
    rainAlert: "Light rain forecast in 24 hours — check soil moisture before turning on pump."
  });
});

// Fertilizer Guide API
app.post("/api/fertilizer", (_req, res) => {
  res.json({
    deficiencies: [
      "Nitrogen level is 25% below optimal requirement — causes leaf yellowing.",
      "Phosphorus is slightly low — essential for root expansion."
    ],
    recommendedCategory: "NPK Balanced + Micro-Nutrients",
    chemicalFertilizers: [
      { name: "Urea (46% N)", quantityKgPerAcre: 35, timing: "Split dose at 30 days after sowing" },
      { name: "DAP (18:46:0)", quantityKgPerAcre: 25, timing: "Apply near root zone during weeding" },
      { name: "MOP (60% K)", quantityKgPerAcre: 20, timing: "At flowering stage" }
    ],
    organicAlternatives: [
      { name: "Neem Coated Cake", quantityKgPerAcre: 100, benefits: "Enhances Nitrogen absorption & repels soil nematodes" },
      { name: "Vermicompost", quantityKgPerAcre: 500, benefits: "Supplies humic acid and improves soil structure" }
    ],
    generalGuidance: [
      "Apply chemical fertilizers when soil has adequate moisture.",
      "Do not mix Urea directly with Single Super Phosphate (SSP)."
    ]
  });
});

// Market Prices API
app.get("/api/market-prices", (_req, res) => {
  res.json([
    {
      id: "m-1",
      cropName: "Finger Millet / Ragi",
      currentPrice: 3450,
      previousPrice: 3200,
      marketLocation: "Mandya APMC",
      priceTrendPercent: 7.8,
      bestSellingPeriod: "Next 2 Weeks (High Demand)",
      history: [
        { month: "May", price: 3100 },
        { month: "Jun", price: 3150 },
        { month: "Jul", price: 3200 },
        { month: "Aug", price: 3450 }
      ]
    },
    {
      id: "m-2",
      cropName: "Hybrid Tomato",
      currentPrice: 2800,
      previousPrice: 2400,
      marketLocation: "Kolar / Bengaluru APMC",
      priceTrendPercent: 16.6,
      bestSellingPeriod: "Immediate Sale Recommended",
      history: [
        { month: "May", price: 1800 },
        { month: "Jun", price: 2100 },
        { month: "Jul", price: 2400 },
        { month: "Aug", price: 2800 }
      ]
    },
    {
      id: "m-3",
      cropName: "Maize / Corn",
      currentPrice: 2250,
      previousPrice: 2200,
      marketLocation: "Davanagere APMC",
      priceTrendPercent: 2.2,
      bestSellingPeriod: "Stable — Hold for 1 Month",
      history: [
        { month: "May", price: 2100 },
        { month: "Jun", price: 2150 },
        { month: "Jul", price: 2200 },
        { month: "Aug", price: 2250 }
      ]
    },
    {
      id: "m-4",
      cropName: "Paddy / Rice (Sona Masoori)",
      currentPrice: 2900,
      previousPrice: 2850,
      marketLocation: "Raichur APMC",
      priceTrendPercent: 1.7,
      bestSellingPeriod: "Steady APMC Rate",
      history: [
        { month: "May", price: 2750 },
        { month: "Jun", price: 2800 },
        { month: "Jul", price: 2850 },
        { month: "Aug", price: 2900 }
      ]
    }
  ]);
});

// AI Farmer Assistant Chatbot API (Gemini 4 Hydrogen across all 6 languages)
app.post("/api/chatbot", async (req, res) => {
  const { message = "", language = "en" } = req.body;
  const targetLang = LANGUAGE_NAMES[language] || "English";

  if (!aiClient) {
    return res.status(503).json({
      error: "Gemini API key is not configured on the server. Add GEMINI_API_KEY in Settings > Secrets."
    });
  }

  try {
    const systemInstruction = `You are 'AI Krishi Mitra', an expert agricultural scientist and practical farmer advisor in India.
Provide concise, practical, clear farming guidance regarding crops, soil NPK health, drip irrigation, pest & disease control, fertilizers, and APMC markets.
CRITICAL: You MUST write your entire response strictly in ${targetLang} using its native script (unless English is requested). Keep responses clear and easy to read aloud for voice playback (avoid excessive symbols).`;

    const response = await aiClient.models.generateContent({
      model: "gemini-4-hydrogen",
      contents: message,
      config: {
        systemInstruction
      }
    });

    const reply = response.text?.trim();
    if (!reply) {
      return res.status(502).json({ error: "No response text returned from Gemini." });
    }
    return res.json({ reply });
  } catch (err) {
    console.error("Gemini Chatbot error:", err);
    return res.status(502).json({
      error: err instanceof Error ? err.message : "Failed to reach Gemini AI service."
    });
  }
});

// Voice AI: Speech-to-Text Transcription (Gemini 3.5 Transcribe)
app.post("/api/voice/transcribe", async (req, res) => {
  const { audioBase64, mimeType = "audio/webm", language = "en" } = req.body;

  if (!aiClient) {
    return res.status(503).json({
      error: "Gemini API key is not configured for voice transcription."
    });
  }

  if (!audioBase64 || typeof audioBase64 !== "string") {
    return res.status(400).json({ error: "Missing audio data." });
  }

  const targetLang = LANGUAGE_NAMES[language] || "English";

  try {
    const response = await aiClient.models.generateContent({
      model: "gemini-3.5-transcribe",
      contents: {
        parts: [
          {
            inlineData: {
              mimeType,
              data: audioBase64
            }
          },
          {
            text: `Transcribe this spoken agricultural question accurately. The speaker is likely speaking in ${targetLang}. Output only the transcribed text in the native script of ${targetLang} (or English if spoken in English), with no extra commentary.`
          }
        ]
      }
    });

    const transcript = (response.text || "").trim();
    if (!transcript) {
      return res.status(422).json({ error: "Could not hear clear speech. Please try speaking again." });
    }
    return res.json({ transcript });
  } catch (err) {
    console.error("Voice transcription error:", err);
    return res.status(502).json({
      error: err instanceof Error ? err.message : "Voice transcription failed."
    });
  }
});

// Voice AI: Text-to-Speech (Gemini 3.8 Flash Lite TTS)
app.post("/api/voice/tts", async (req, res) => {
  const { text = "", language = "en" } = req.body;

  if (!aiClient) {
    return res.status(503).json({
      error: "Gemini API key is not configured for voice synthesis."
    });
  }

  const cleanText = String(text)
    .replace(/[*#_`~]/g, "")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 1200);

  if (!cleanText) {
    return res.status(400).json({ error: "Missing text to speak." });
  }

  const targetLang = LANGUAGE_NAMES[language] || "English";

  try {
    const response = await aiClient.models.generateContent({
      model: "gemini-3.8-flash-lite-tts",
      contents: [
        {
          role: "user",
          parts: [
            {
              text: cleanText,
              speechMetadata: {
                style: `Warm, clear Indian agricultural advisor speaking naturally in ${targetLang}`
              }
            }
          ]
        }
      ],
      config: {
        responseModalities: ["AUDIO"],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName: "Kore" }
          }
        }
      }
    });

    const audioBase64 = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
    if (!audioBase64) {
      return res.status(502).json({ error: "No audio returned by TTS model." });
    }

    return res.json({ audioBase64, mimeType: "audio/wav" });
  } catch (err) {
    console.error("Voice TTS error:", err);
    return res.status(502).json({
      error: err instanceof Error ? err.message : "Voice synthesis failed."
    });
  }
});

// START SERVER
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa"
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (_req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Smart Crop Suggestion Server running on http://localhost:${PORT}`);
  });
}

startServer();
