"""
Smart Crop Suggestion System â€” Flask Application Entrypoint
"""
import os
import sqlite3
from flask import Flask, render_template, request, jsonify, session, redirect, url_for
from werkzeug.security import generate_password_hash, check_password_hash
from dotenv import load_dotenv

from services.crop_prediction import predict_crop
from services.weather import get_weather_data
from services.ai_chatbot import ask_farmer_assistant

load_dotenv()

app = Flask(__name__)
app.secret_key = os.getenv("SECRET_KEY", "smart_crop_secret_key_2026")
DB_PATH = os.path.join("database", "database.db")

def init_db():
    os.makedirs("database", exist_ok=True)
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()

    # Users table
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            mobile TEXT UNIQUE NOT NULL,
            email TEXT UNIQUE NOT NULL,
            password TEXT NOT NULL,
            village TEXT,
            language TEXT DEFAULT 'en',
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    ''')

    # Farms table
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS farms (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER,
            farm_name TEXT NOT NULL,
            location TEXT,
            land_area REAL,
            soil_type TEXT,
            crops_planted TEXT,
            planting_date TEXT,
            expected_harvest TEXT,
            status TEXT DEFAULT 'Growing',
            FOREIGN KEY (user_id) REFERENCES users (id)
        )
    ''')

    # Seed demo user if not exists
    cursor.execute("SELECT * FROM users WHERE email = 'farmer@krishi.com'")
    if not cursor.fetchone():
        hashed = generate_password_hash("farmer123")
        cursor.execute('''
            INSERT INTO users (name, mobile, email, password, village, language)
            VALUES (?, ?, ?, ?, ?, ?)
        ''', ("Ramesh Gowda", "9876543210", "farmer@krishi.com", hashed, "Mandya, Karnataka", "kn"))

        user_id = cursor.lastrowid
        cursor.execute('''
            INSERT INTO farms (user_id, farm_name, location, land_area, soil_type, crops_planted, planting_date, expected_harvest, status)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        ''', (user_id, "Gowda Organic Plot 1", "Mandya", 3.5, "Red Loamy Soil", "Ragi & Tomato", "2026-06-15", "2026-10-20", "Growing"))

    conn.commit()
    conn.close()

init_db()

@app.route("/")
def index():
    if "user_id" in session:
        return redirect(url_for("dashboard"))
    return redirect(url_for("login"))

@app.route("/login", methods=["GET", "POST"])
def login():
    if request.method == "POST":
        login_input = request.form.get("emailOrMobile")
        password = request.form.get("password")

        conn = sqlite3.connect(DB_PATH)
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM users WHERE email = ? OR mobile = ?", (login_input, login_input))
        user = cursor.fetchone()
        conn.close()

        if user and check_password_hash(user[4], password):
            session["user_id"] = user[0]
            session["user_name"] = user[1]
            session["user_email"] = user[3]
            session["village"] = user[5]
            session["language"] = user[6]
            return redirect(url_for("dashboard"))
        else:
            return render_template("login.html", error="Invalid Email/Mobile or Password. Try farmer@krishi.com / farmer123")

    return render_template("login.html")

@app.route("/register", methods=["GET", "POST"])
def register():
    if request.method == "POST":
        name = request.form.get("name")
        mobile = request.form.get("mobile")
        email = request.form.get("email")
        password = request.form.get("password")
        village = request.form.get("village")
        language = request.form.get("language", "en")

        hashed = generate_password_hash(password)
        try:
            conn = sqlite3.connect(DB_PATH)
            cursor = conn.cursor()
            cursor.execute('''
                INSERT INTO users (name, mobile, email, password, village, language)
                VALUES (?, ?, ?, ?, ?, ?)
            ''', (name, mobile, email, hashed, village, language))
            conn.commit()
            conn.close()
            return redirect(url_for("login"))
        except sqlite3.IntegrityError:
            return render_template("register.html", error="Mobile or Email already registered!")

    return render_template("register.html")

@app.route("/logout")
def logout():
    session.clear()
    return redirect(url_for("login"))

@app.route("/dashboard")
def dashboard():
    if "user_id" not in session:
        return redirect(url_for("login"))
    weather = get_weather_data(session.get("village", "Bengaluru"))
    return render_template("dashboard.html", user_name=session.get("user_name"), weather=weather)

@app.route("/crop-suggestion", methods=["GET", "POST"])
def crop_suggestion():
    if "user_id" not in session:
        return redirect(url_for("login"))
    result = None
    if request.method == "POST":
        result = predict_crop(request.form)
    return render_template("crop-suggestion.html", result=result)

@app.route("/weather")
def weather():
    if "user_id" not in session:
        return redirect(url_for("login"))
    weather_info = get_weather_data(session.get("village", "Bengaluru"))
    return render_template("weather.html", weather=weather_info)

@app.route("/disease")
def disease():
    if "user_id" not in session:
        return redirect(url_for("login"))
    return render_template("disease.html")

@app.route("/market")
def market():
    if "user_id" not in session:
        return redirect(url_for("login"))
    return render_template("market.html")

@app.route("/profile")
def profile():
    if "user_id" not in session:
        return redirect(url_for("login"))
    return render_template("profile.html", user_name=session.get("user_name"), email=session.get("user_email"), village=session.get("village"))

# API Routes
@app.route("/api/chatbot", methods=["POST"])
def chatbot_api():
    data = request.get_json() or {}
    user_msg = data.get("message", "")
    user_lang = session.get("language", "en")
    reply = ask_farmer_assistant(user_msg, user_lang)
    return jsonify({"reply": reply})

if __name__ == "__main__":
    port = int(os.getenv("PORT", 5000))
    app.run(host="0.0.0.0", port=port, debug=True)
