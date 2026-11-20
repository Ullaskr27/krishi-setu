# Smart Crop Suggestion System — Full-Stack Farmer Assistance Website

An intelligent, modern, responsive Web Application designed to help farmers make better agricultural decisions regarding crops, soil health, weather forecasts, irrigation schedules, fertilizers, crop diseases, and APMC market prices.

---

## 🚀 How to Run in VS Code (Local Python Flask)

### Step 1: Open Folder in VS Code
Open VS Code, click **File > Open Folder** and select the `smart-crop-system` directory.

### Step 2: Set Up Virtual Environment
Open the VS Code Terminal (`Ctrl + ~` or `Cmd + ~`) and run:

```bash
# Create Python virtual environment
python -m venv venv
```

Activate the virtual environment:
- **Windows (Command Prompt / PowerShell):**
  ```cmd
  venv\Scripts\activate
  ```
- **Mac / Linux:**
  ```bash
  source venv/bin/activate
  ```

### Step 3: Install Dependencies
```bash
pip install -r requirements.txt
```

### Step 4: Configure Environment Variables
Copy `.env.example` to create `.env`:
```bash
cp .env.example .env
```
*(Optional: Add your Google AI Studio Gemini API Key or OpenWeatherMap Key in `.env`)*

### Step 5: Start Flask Application
```bash
python app.py
```

Open your browser at: **`http://127.0.0.1:5000`**

---

## 🔑 Demo Login Credentials

- **Email:** `farmer@krishi.com`
- **Mobile:** `9876543210`
- **Password:** `farmer123`

---

## 📂 Project Architecture

```text
smart-crop-system/
│
├── app.py                      # Flask Server Entrypoint & SQLite Auth
├── requirements.txt            # Python Dependencies
├── .env.example                # Environment Variable Template
├── README.md                   # Setup Guide & Documentation
│
├── database/
│   └── database.db             # Auto-generated SQLite Database
│
├── services/
│   ├── crop_prediction.py      # Rule-based NPK Soil Match Engine
│   ├── weather.py              # Weather API & Advisory Generator
│   └── ai_chatbot.py           # Gemini AI Krishi Mitra Assistant
│
├── templates/
│   ├── login.html
│   ├── register.html
│   ├── dashboard.html
│   ├── crop-suggestion.html
│   ├── weather.html
│   ├── disease.html
│   ├── market.html
│   └── profile.html
│
└── static/
    ├── css/style.css
    └── js/script.js
```

---

## ☁️ Cloud Deployment Instructions (Render / Railway / Cloud Run)

1. Push code to GitHub repository.
2. Connect repository to Render or Railway.
3. Set Start Command: `python app.py` or `gunicorn app:app`.
4. Add environment variables (`SECRET_KEY`, `GEMINI_API_KEY`, `WEATHER_API_KEY`) in the cloud dashboard.
