"""
AI Farmer Assistant Service with Gemini API Integration & Rule-Based Fallback
"""
import os

try:
    from google import genai
    HAS_GENAI = True
except ImportError:
    HAS_GENAI = False

AGRICULTURAL_KNOWLEDGE_BASE = {
    "crop": [
        "For red loam soils in Karnataka, Finger Millet (Ragi), Groundnut, Maize, and Pulses like Red Gram are highly recommended.",
        "To maximize profit per acre, consider short-duration high-value crops like Hybrid Tomatoes, Chilli, or Sweet Corn."
    ],
    "water": [
        "Irrigate during early morning or late evening to minimize evaporation losses up to 30%.",
        "Adopt Drip Irrigation for row crops like Tomato, Cotton, and Sugarcane to save 40-50% water and reduce weed growth."
    ],
    "disease": [
        "Yellowing leaves can indicate Nitrogen deficiency or root rot / waterlogging. Ensure field drainage and top-dress Urea or Organic Neem Cake.",
        "For leaf spots or rust, spray Copper Oxychloride (2.5 g/L) or Neem oil (5 ml/L) as an organic preventive measure."
    ],
    "fertilizer": [
        "Soil testing every 2 years is essential before applying fertilizers to avoid soil acidification.",
        "Combine Chemical Fertilizers with Organic Compost (FYM) or Bio-fertilizers like Azospirillum and PSB for optimal soil fertility."
    ],
    "weather": [
        "Check daily weather forecasts before pesticide spraying to avoid chemical rain wash-off.",
        "In case of extreme heat waves, apply straw mulching around crop roots to conserve soil moisture."
    ]
}

def ask_farmer_assistant(prompt_text, user_language="en"):
    api_key = os.getenv("GEMINI_API_KEY")

    if HAS_GENAI and api_key and api_key != "your_gemini_api_key_here":
        try:
            client = genai.Client(api_key=api_key)
            system_inst = (
                "You are 'AI Krishi Mitra', an expert agricultural scientist and friendly farmer advisor. "
                "Provide simple, highly practical, empathetic farming guidance regarding crops, soil health, "
                "irrigation, pest control, fertilizers, and market advice. "
                f"Respond clearly in the farmer's preferred language ({user_language}). Keep answers direct, bulleted when helpful, and easy to read on mobile."
            )
            response = client.models.generate_content(
                model="gemini-3.6-flash",
                contents=prompt_text,
                config={"system_instruction": system_inst}
            )
            if response and response.text:
                return response.text
        except Exception as e:
            pass

    # Intelligent Predefined Agricultural Rule-Based Fallback
    lower = prompt_text.lower()

    if any(w in lower for w in ["yellow", "leaf", "disease", "spot", "blight", "pests", "à²®à²°à²³à³", "à²°à³‹à²—", "à²Žà²²à³†"]):
        return (
            "ðŸŒ± **AI Krishi Mitra Disease Advice:**\n\n"
            "â€¢ Yellowing of leaves is commonly caused by Nitrogen deficiency or excess water/root suffocation.\n"
            "â€¢ **Immediate Action:** Check field drainage. Apply 15-20 kg Urea per acre or 100 kg Neem-coated cake.\n"
            "â€¢ **For Leaf Spots/Blight:** Spray Mancozeb (2 g/L water) or Organic Neem Oil (5 mL/L).\n"
            "â€¢ You can also upload a leaf photo on our **Disease Detection** tab for automated visual analysis!"
        )
    elif any(w in lower for w in ["water", "irrigate", "drip", "frequency", "à²¨à³€à²°à³", "à²¨à³€à²°à²¾à²µà²°à²¿", "à¤ªà¤¾à¤¨à¥€"]):
        return (
            "ðŸ’§ **AI Krishi Mitra Irrigation Guidance:**\n\n"
            "â€¢ **Best Time:** Water your crops between 6:00 AM - 8:00 AM or after 5:30 PM.\n"
            "â€¢ **Drip Irrigation Advantage:** Saves 45% water and prevents weed proliferation between rows.\n"
            "â€¢ **Soil Moisture Rule:** Check soil at 3-inch depth; if it forms a firm ball, hold irrigation for 24 hours."
        )
    elif any(w in lower for w in ["crop", "grow", "recommend", "ragi", "rice", "à²¬à³†à²³à³†", "à²«à²¸à²²à³"]):
        return (
            "ðŸŒ¾ **AI Krishi Mitra Crop Selection Tip:**\n\n"
            "â€¢ **Kharif Season:** Ragi (Finger Millet), Maize, Paddy, Groundnut, and Pigeonpea.\n"
            "â€¢ **Low Water Areas:** Ragi and Groundnut thrive with minimal rainfall.\n"
            "â€¢ **High Returns:** Tomato, Chilli, and Polyhouse Vegetables yield faster cash returns.\n"
            "â€¢ Fill out our **Smart Crop Suggestion** form for customized NPK soil matching!"
        )
    elif any(w in lower for w in ["fertilizer", "npk", "urea", "dap", "à²—à³Šà²¬à³à²¬à²°", "à¤–à¤¾à¤¦"]):
        return (
            "ðŸ§ª **AI Krishi Mitra Fertilizer Tip:**\n\n"
            "â€¢ Balance is key: Excess Nitrogen increases pest attacks.\n"
            "â€¢ Apply Nitrogen in 3 split doses: At sowing, tillering/vegetative, and flowering.\n"
            "â€¢ Always incorporate Farmyard Manure (FYM) or Vermicompost before land preparation."
        )
    else:
        return (
            "ðŸŒ¾ **AI Krishi Mitra Assistant:**\n\n"
            "Greetings! I am here to assist you with:\n"
            "1. Best Crop Recommendations based on soil NPK\n"
            "2. Water-saving Drip Irrigation Schedules\n"
            "3. Pest & Leaf Disease Identification\n"
            "4. APMC Market Price trends\n"
            "How can I help your farm today?"
        )
