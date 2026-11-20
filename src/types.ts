export type Language = 'en' | 'kn' | 'hi' | 'ta' | 'te' | 'mr';

export const LANGUAGE_OPTIONS: {
  code: Language;
  label: string;
  nativeLabel: string;
  speechLocale: string;
}[] = [
  { code: 'en', label: 'English', nativeLabel: 'English', speechLocale: 'en-IN' },
  { code: 'kn', label: 'Kannada', nativeLabel: 'ಕನ್ನಡ', speechLocale: 'kn-IN' },
  { code: 'hi', label: 'Hindi', nativeLabel: 'हिंदी', speechLocale: 'hi-IN' },
  { code: 'ta', label: 'Tamil', nativeLabel: 'தமிழ்', speechLocale: 'ta-IN' },
  { code: 'te', label: 'Telugu', nativeLabel: 'తెలుగు', speechLocale: 'te-IN' },
  { code: 'mr', label: 'Marathi', nativeLabel: 'मराठी', speechLocale: 'mr-IN' }
];

export interface UserProfile {
  uid: string;
  name: string;
  email: string;
  mobile: string;
  village: string;
  district: string;
  state: string;
  landArea: number;
  preferredLanguage: Language;
  createdAt?: unknown;
  updatedAt?: unknown;
}

export interface CropSuggestionInput {
  nitrogen: number;
  phosphorus: number;
  potassium: number;
  ph: number;
  temperature: number;
  humidity: number;
  rainfall: number;
  location: string;
  season: 'Kharif' | 'Rabi' | 'Zaid';
  availableWater: 'High' | 'Medium' | 'Low';
  landSize: number;
}

export interface CropDetail {
  name: string;
  suitabilityScore: number;
  category: string;
  growingDuration: string;
  waterRequirement: string;
  idealSoil: string;
  expectedYield: string;
  marketDemand: 'High' | 'Medium' | 'Stable';
  tips: string[];
  npkRequirement: { n: number; p: number; k: number; ph: string };
  description: string;
}

export interface CropSuggestionResult {
  bestCrop: CropDetail;
  alternativeCrops: CropDetail[];
  soilAnalysisNotes: string;
}

export interface CropAdvisoryHistoryRecord {
  id: string;
  ownerId: string;
  nitrogen: number;
  phosphorus: number;
  potassium: number;
  ph: number;
  temperature: number;
  rainfall: number;
  location: string;
  season: 'Kharif' | 'Rabi' | 'Zaid';
  availableWater: 'High' | 'Medium' | 'Low';
  landSize: number;
  bestCropName: string;
  suitabilityScore: number;
  soilAnalysisNotes: string;
  createdAt?: unknown;
}

export type AdvisoryCategory = 'crop' | 'disease' | 'irrigation' | 'fertilizer' | 'voice';

export interface AdvisoryLogRecord {
  id: string;
  ownerId: string;
  category: AdvisoryCategory;
  cropName: string;
  title: string;
  summary: string;
  metricLabel: string;
  language: Language;
  createdAt?: unknown;
}

export interface WeatherData {
  city: string;
  temp: number;
  condition: string;
  humidity: number;
  windSpeed: number;
  rainProbability: number;
  uvIndex: number;
  sunrise: string;
  sunset: string;
  forecast: {
    day: string;
    tempMax: number;
    tempMin: number;
    condition: string;
    rainProb: number;
    icon: string;
  }[];
  farmerAdvice: string[];
}

export interface DiseaseDetectionResult {
  diseaseName: string;
  affectedCrop: string;
  confidence: number;
  symptoms: string[];
  prevention: string[];
  suggestedTreatment: {
    chemical: string;
    organic: string;
    dosage: string;
  };
  contactExpertNotice: string;
  isDemo: boolean;
}

export interface IrrigationInput {
  crop: string;
  soilType: string;
  soilMoisture: number;
  temperature: number;
  rainfall: number;
  landArea: number;
}

export interface IrrigationResult {
  status: 'Critical' | 'Optimal' | 'Delay Needed';
  waterVolumeLiters: number;
  frequencyDays: number;
  methodRecommendation: string;
  tips: string[];
  rainAlert: string;
}

export interface FertilizerInput {
  crop: string;
  nitrogen: number;
  phosphorus: number;
  potassium: number;
  ph: number;
  growthStage: 'Basal / Sowing' | 'Vegetative Growth' | 'Flowering & Fruiting' | 'Pre-Harvest';
}

export interface FertilizerResult {
  deficiencies: string[];
  recommendedCategory: string;
  chemicalFertilizers: { name: string; quantityKgPerAcre: number; timing: string }[];
  organicAlternatives: { name: string; quantityKgPerAcre: number; benefits: string }[];
  generalGuidance: string[];
}

export interface MarketPriceRecord {
  id: string;
  cropName: string;
  currentPrice: number; // ₹/Quintal
  previousPrice: number;
  marketLocation: string;
  priceTrendPercent: number;
  bestSellingPeriod: string;
  history: { month: string; price: number }[];
}

export interface FarmRecord {
  id: string;
  ownerId?: string;
  farmName: string;
  location: string;
  landArea: number; // in acres
  soilType: string;
  cropsPlanted: string;
  plantingDate: string;
  expectedHarvestDate: string;
  status: 'Growing' | 'Ready for Harvest' | 'Planted' | 'Fallow';
  createdAt?: unknown;
  updatedAt?: unknown;
}

export interface AlertNotification {
  id: string;
  title: string;
  message: string;
  type?: 'weather' | 'disease' | 'irrigation' | 'market' | 'fertilizer';
  severity: 'info' | 'warning' | 'critical';
  timestamp: string;
  read: boolean;
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  timestamp: string;
  language?: Language;
}
