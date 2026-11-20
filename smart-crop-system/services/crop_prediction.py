"""
Crop Prediction Service (Rule-based ML Model & Agricultural Heuristics)
"""

CROP_DATABASE = [
    {
        "name": "Rice (Paddy / à²­à²¤à³à²¤)",
        "category": "Cereal Grain",
        "min_N": 60, "max_N": 120,
        "min_P": 30, "max_P": 60,
        "min_K": 35, "max_K": 80,
        "min_ph": 5.5, "max_ph": 7.2,
        "min_temp": 20, "max_temp": 38,
        "min_rain": 900, "max_rain": 2500,
        "seasons": ["Kharif", "Rabi"],
        "growing_duration": "120 - 150 days",
        "water_req": "High (1200 - 1500 mm / season)",
        "ideal_soil": "Clay, Clay Loam with poor drainage",
        "expected_yield": "20 - 25 Quintals / Acre",
        "market_demand": "High",
        "tips": [
            "Maintain 2-5 cm standing water during tillering stage.",
            "Apply Azospirillum biofertilizer to boost root growth.",
            "Monitor for Stem Borer and Brown Planthopper."
        ]
    },
    {
        "name": "Ragi / Finger Millet (à²°à²¾à²—à²¿)",
        "category": "Millet / Nutri-Cereal",
        "min_N": 30, "max_N": 60,
        "min_P": 20, "max_P": 45,
        "min_K": 20, "max_K": 40,
        "min_ph": 5.0, "max_ph": 8.0,
        "min_temp": 18, "max_temp": 35,
        "min_rain": 400, "max_rain": 900,
        "seasons": ["Kharif", "Rabi", "Summer"],
        "growing_duration": "100 - 120 days",
        "water_req": "Low - Medium (450 mm)",
        "ideal_soil": "Red Loam, Sandy Loam, Black Cotton",
        "expected_yield": "12 - 16 Quintals / Acre",
        "market_demand": "High (High health demand)",
        "tips": [
            "Highly drought-tolerant, ideal for dryland farming in Karnataka.",
            "Intercropping with Red Gram (Pigeonpea) in 4:2 ratio gives bonus income.",
            "Requires minimal chemical inputs."
        ]
    },
    {
        "name": "Maize / Corn (à²®à³†à²•à³à²•à³†à²œà³‹à²³)",
        "category": "Coarse Grain / Fodder",
        "min_N": 70, "max_N": 130,
        "min_P": 35, "max_P": 70,
        "min_K": 30, "max_K": 60,
        "min_ph": 5.8, "max_ph": 7.8,
        "min_temp": 18, "max_temp": 35,
        "min_rain": 500, "max_rain": 1100,
        "seasons": ["Kharif", "Rabi", "Summer"],
        "growing_duration": "95 - 115 days",
        "water_req": "Medium (500 - 600 mm)",
        "ideal_soil": "Well-drained Loamy Soil",
        "expected_yield": "25 - 32 Quintals / Acre",
        "market_demand": "High (Poultry & Starch industry)",
        "tips": [
            "Sensitive to waterlogging; ensure proper field drainage.",
            "Watch out for Fall Armyworm (FAW); use Emamectin benzoate if needed.",
            "Top-dress Urea at knee-high and tasseling stages."
        ]
    },
    {
        "name": "Cotton (à²¹à²¤à³à²¤à²¿)",
        "category": "Cash Commercial Crop",
        "min_N": 80, "max_N": 140,
        "min_P": 40, "max_P": 75,
        "min_K": 40, "max_K": 80,
        "min_ph": 6.0, "max_ph": 8.5,
        "min_temp": 22, "max_temp": 38,
        "min_rain": 600, "max_rain": 1200,
        "seasons": ["Kharif"],
        "growing_duration": "160 - 180 days",
        "water_req": "Medium - High (700 mm)",
        "ideal_soil": "Deep Black Cotton Soil, Heavy Clay Loam",
        "expected_yield": "10 - 14 Quintals / Acre",
        "market_demand": "High",
        "tips": [
            "Avoid excessive Nitrogen to prevent rank vegetative growth.",
            "Use pheromone traps for Pink Bollworm monitoring.",
            "Drip irrigation improves lint quality significantly."
        ]
    },
    {
        "name": "Sugarcane (à²•à²¬à³à²¬à³)",
        "category": "Commercial Cash Crop",
        "min_N": 100, "max_N": 200,
        "min_P": 50, "max_P": 100,
        "min_K": 60, "max_K": 120,
        "min_ph": 6.2, "max_ph": 8.2,
        "min_temp": 22, "max_temp": 40,
        "min_rain": 1200, "max_rain": 2500,
        "seasons": ["Kharif", "Rabi"],
        "growing_duration": "300 - 360 days",
        "water_req": "High (1800 - 2200 mm)",
        "ideal_soil": "Deep Alluvial, Heavy Clay Loam",
        "expected_yield": "40 - 55 Tons / Acre",
        "market_demand": "High (Sugar Mills)",
        "tips": [
            "Adopt Subsurface Drip Irrigation to save 40% water.",
            "Earthing-up operation mandatory at 4th month to prevent lodging.",
            "Trash mulching helps retain soil moisture."
        ]
    },
    {
        "name": "Groundnut / Peanut (à²•à²¡à²²à³†à²•à²¾à²¯à²¿)",
        "category": "Oilseed / Legume",
        "min_N": 20, "max_N": 50,
        "min_P": 35, "max_P": 70,
        "min_K": 25, "max_K": 55,
        "min_ph": 6.0, "max_ph": 7.5,
        "min_temp": 20, "max_temp": 34,
        "min_rain": 450, "max_rain": 850,
        "seasons": ["Kharif", "Rabi", "Summer"],
        "growing_duration": "105 - 125 days",
        "water_req": "Medium (500 mm)",
        "ideal_soil": "Friable Sandy Loam, Light Red Soil",
        "expected_yield": "10 - 14 Quintals / Acre",
        "market_demand": "High",
        "tips": [
            "Apply Gypsum (200 kg/acre) at flowering for pod development.",
            "Rhizobium seed treatment fixates atmospheric nitrogen.",
            "Avoid heavy clay soils which impede peg penetration."
        ]
    },
    {
        "name": "Tomato (à²Ÿà³Šà²®à³†à²Ÿà³Š)",
        "category": "Horticulture Vegetable",
        "min_N": 80, "max_N": 150,
        "min_P": 50, "max_P": 90,
        "min_K": 50, "max_K": 100,
        "min_ph": 6.0, "max_ph": 7.2,
        "min_temp": 18, "max_temp": 32,
        "min_rain": 500, "max_rain": 1000,
        "seasons": ["Kharif", "Rabi", "Summer"],
        "growing_duration": "110 - 130 days",
        "water_req": "Medium (600 mm)",
        "ideal_soil": "Rich Sandy Loam, Well-drained Soil",
        "expected_yield": "18 - 25 Tons / Acre",
        "market_demand": "High & Dynamic",
        "tips": [
            "Use staking/trellising for hybrid varieties to protect fruit.",
            "Calcium nitrate application prevents Blossom End Rot.",
            "Monitor for Leaf Curl Virus transmitted by whiteflies."
        ]
    }
]

def predict_crop(data):
    """
    Calculates suitability score for each crop based on input soil and weather data.
    """
    try:
        N = float(data.get('nitrogen', 50))
        P = float(data.get('phosphorus', 40))
        K = float(data.get('potassium', 40))
        ph = float(data.get('ph', 6.5))
        temp = float(data.get('temperature', 26))
        humidity = float(data.get('humidity', 65))
        rainfall = float(data.get('rainfall', 800))
        season = data.get('season', 'Kharif')

        scored_crops = []

        for crop in CROP_DATABASE:
            score = 100.0

            # Nitrogen match
            if N < crop['min_N'] or N > crop['max_N']:
                score -= min(30, abs(N - (crop['min_N'] + crop['max_N'])/2) * 0.4)

            # Phosphorus match
            if P < crop['min_P'] or P > crop['max_P']:
                score -= min(25, abs(P - (crop['min_P'] + crop['max_P'])/2) * 0.4)

            # Potassium match
            if K < crop['min_K'] or K > crop['max_K']:
                score -= min(25, abs(K - (crop['min_K'] + crop['max_K'])/2) * 0.4)

            # pH match
            if ph < crop['min_ph'] or ph > crop['max_ph']:
                score -= min(30, abs(ph - (crop['min_ph'] + crop['max_ph'])/2) * 15)

            # Temperature match
            if temp < crop['min_temp'] or temp > crop['max_temp']:
                score -= min(25, abs(temp - (crop['min_temp'] + crop['max_temp'])/2) * 2)

            # Rainfall match
            if rainfall < crop['min_rain'] or rainfall > crop['max_rain']:
                score -= min(20, abs(rainfall - (crop['min_rain'] + crop['max_rain'])/2) * 0.03)

            # Season bonus
            if season in crop['seasons']:
                score += 5.0
            else:
                score -= 15.0

            final_score = max(45.0, min(98.5, score))

            crop_res = dict(crop)
            crop_res['suitabilityScore'] = round(final_score, 1)
            crop_res['npkRequirement'] = {
                "n": int((crop['min_N'] + crop['max_N']) / 2),
                "p": int((crop['min_P'] + crop['max_P']) / 2),
                "k": int((crop['min_K'] + crop['max_K']) / 2),
                "ph": f"{crop['min_ph']} - {crop['max_ph']}"
            }
            scored_crops.append(crop_res)

        # Sort by suitability
        scored_crops.sort(key=lambda x: x['suitabilityScore'], reverse=True)

        best_crop = scored_crops[0]
        alternative_crops = scored_crops[1:4]

        soil_analysis_notes = (
            f"Soil NPK values ({N}N, {P}P, {K}K, pH {ph}) are favorable for {best_crop['name']}. "
            f"Ensure adequate organic manure application prior to sowing."
        )

        return {
            "bestCrop": best_crop,
            "alternativeCrops": alternative_crops,
            "soilAnalysisNotes": soil_analysis_notes
        }

    except Exception as e:
        # Fallback return
        return {
            "bestCrop": CROP_DATABASE[0],
            "alternativeCrops": CROP_DATABASE[1:3],
            "soilAnalysisNotes": f"Error during evaluation: {str(e)}"
        }
