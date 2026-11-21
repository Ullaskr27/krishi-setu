# Krishi Setu

<p align="center">
  <strong>Smart Farming Assistance for Indian Agriculture</strong><br />
  An agriculture-focused web application that brings crop guidance, farming utilities and AI-assisted support into one place.
</p>

<p align="center">
  <a href="https://krishi-setu-x0g6.onrender.com">Live application</a> ·
  <a href="https://github.com/Ullaskr27/krishi-setu">Source code</a>
</p>

---

## Overview

Krishi Setu is a smart farming assistant developed to help Indian farmers access practical information when making day-to-day agricultural decisions. The application brings together crop suggestions, weather information, plant-health guidance, irrigation and fertilizer assistance, market information, and a multilingual farming chatbot.

The project focuses on making agricultural information easier to access through a single web application. Recommendations are intended to support farmers' decisions, not replace local agricultural experts, soil testing, or official market and weather sources.

## Problem

Farmers often need to consult multiple sources to understand which crop may suit their land, how to respond to crop-health concerns, when to irrigate, and where to check market information. Access to clear, timely and understandable guidance can be difficult.

## What Krishi Setu provides

| Module | Purpose |
| --- | --- |
| Crop recommendation | Uses entered soil and farming parameters to rank suggested crops. |
| Weather dashboard | Displays weather-related information and farming advice. |
| Disease guidance | Presents crop-health information and possible prevention/treatment guidance. |
| Irrigation assistant | Provides rule-based irrigation guidance from entered soil-moisture and land-area values. |
| Fertilizer guide | Displays fertilizer and organic nutrient guidance. |
| Market information | Shows sample crop-price and trend information for selected markets. |
| AI farming assistant | Uses the Gemini API to answer agriculture-related questions in supported languages. |
| Voice features | Includes speech transcription and text-to-speech API integration; transcription is still being validated. |
| Farmer accounts | Uses Firebase Authentication and Firestore for account and profile functionality. |

> **Development status:** Some weather, disease, fertilizer and market responses currently use demonstration/sample data in the API. They should not be treated as live agricultural or market feeds. Validate recommendations with local agricultural experts and trusted sources before making farm decisions.

## Technology

- **Frontend:** React, TypeScript, Vite
- **Backend:** Node.js, Express
- **Authentication and data:** Firebase Authentication, Cloud Firestore
- **AI integration:** Google Gemini API through the `@google/genai` SDK
- **Styling and UI:** Tailwind CSS, Lucide React
- **Build tooling:** Vite, esbuild, TypeScript
- **Deployment:** Render

## Application architecture

```text
Farmer
  |
  v
React + TypeScript interface
  |
  v
Express API (server.ts)
  |              |
  |              +---- Firebase Authentication / Firestore
  |
  +------------------- Gemini API
  |
  +------------------- Farming feature endpoints
  |
  v
JSON responses displayed in the application
```

## Run locally

### Prerequisites

- Node.js (LTS recommended)
- npm
- A Firebase project configured for the application
- A Gemini API key for Gemini-powered features

### 1. Clone the repository

```bash
git clone https://github.com/Ullaskr27/krishi-setu.git
cd krishi-setu
```

### 2. Install dependencies

```bash
npm ci
```

### 3. Configure environment variables

Create a `.env` file in the project root and add your Gemini API key:

```env
GEMINI_API_KEY=your_gemini_api_key
```

Configure the Firebase client settings using the Firebase project configuration expected by the frontend. Never commit real API secrets, private keys, or service-account files.

### 4. Start the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### 5. Check the production build

```bash
npm run lint
npm run build
npm start
```

## Deployment

The application is deployed on Render:

**Live URL:** https://krishi-setu-x0g6.onrender.com

For deployment, configure the required environment variables in the hosting provider's environment settings. Do not place secrets in source code or commit them to Git.

## Engineering work

This repository contains the application implementation, including:

- React and TypeScript user-interface development.
- Express API routes for farming modules and AI-powered assistance.
- Firebase authentication and farmer-profile integration.
- Gemini API integration for conversational and voice-related features.
- Production build configuration and Render deployment setup.
- Environment-based server configuration and Git-based version control.

## Current limitations and next steps

- Replace demonstration weather and market values with verified live data providers.
- Connect disease guidance to a validated image-classification workflow and clearly communicate prediction confidence.
- Validate crop and fertilizer recommendations against region-specific agricultural datasets and expert guidance.
- Complete and test the speech-to-text integration across supported languages.
- Add automated tests for API routes and core recommendation logic.
- Improve accessibility, low-bandwidth support and multilingual usability.

## Responsible use

Krishi Setu is a decision-support project. Agricultural conditions vary by location, season, soil test results and crop variety. Always verify important decisions with local agricultural officers, Krishi Vigyan Kendras (KVKs), or other qualified experts.

## Developer

**Ullas K R**  
Developer of Krishi Setu

- GitHub: [@Ullaskr27](https://github.com/Ullaskr27)

---

<p align="center">
  Built to make useful farming information more accessible.
</p>
