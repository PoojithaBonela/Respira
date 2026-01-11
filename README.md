# 🌿 RESPIRA — A Mindful Path to Quitting

**RESPIRA** is an AI-powered habit awareness platform designed to help users navigate their journey away from smoking. It combines behavioral science with personalized data insights to help users understand their triggers, track their consistency, and achieve long-term cessation goals.

🔗 **Live Application:** [https://respira-green.vercel.app/](https://respira-green.vercel.app)

---

## ✨ Core Features

### 🧠 AI-Powered Insights
Personalized daily insights based on:
- **Smoke-free days**: Contextual tracking of your success.
- **Logged smoking activity**: Real-time habit analysis.
- **Triggers and habits**: Recognizing behavioral cues.
- **Progress-aware predictions**: AI-driven foresight (no medical claims).
- **Supportive tone**: Focused on non-judgmental encouragement.

### 📊 Progress Dashboard
A comprehensive snapshot including:
- **Smoke-free days**: Total successful days.
- **Days smoked**: Transparent habit tracking.
- **Consistency score**: Our unique metric for effort.
- **Trend visualizations**: Weekly and monthly progress graphs.
- **Reduction comparisons**: Visualizing improvement over time.

### 📅 Yearly Smoking Calendar
A visual overview for long-term perspective:
- **Smoke-free days** vs. **Smoking days** color-coded.
- Helps users recognize long-term patterns at a glance.

### 🆘 Urge Support Tools
Immediate behavioral tools for tough moments:
- **Quick Pause**: Short, guided delay during cravings.
- **Focus Game**: A distraction tool to help cravings pass.
- **Trigger Tracking**: Log stress, boredom, social pressure, habits, etc.

### 🏆 Rewards & Motivation
Systems to reinforce positive change:
- **Streak-based milestones**.
- **Consistency and effort badges**.
- **Focus game points** to reward positive behavior.

### 🔐 Secure Authentication
Safe and frictionless access:
- **Email & password login**.
- **Google OAuth** integration.
- **Secure JWT-based sessions**.

---

## 🛠️ Technical Implementation

### Frontend (React/Vite)
- **State Management**: React hooks for real-time dashboard reactivity.
- **Responsive Architecture**: Horizontal-scroll navigation tailored for mobile-first tracking.
- **Lucide Iconography**: Semantic icons for health and financial metrics.

### Backend (FastAPI/MongoDB)
- **High Performance**: Asynchronous Python (FastAPI) for low-latency logging.
- **MongoDB Atlas**: Flexible storage for diverse behavioral data.
- **JWT Authentication**: Secure, signed data exchanges.

---

## ⚙️ Quick Start

### 1. Requirements
*   Node.js (v18+)
*   Python 3.11.9
*   MongoDB Atlas Connection

### 2. Backend Setup
```bash
cd server
python -m venv venv
source venv/bin/activate  # Windows: venv\\Scripts\\activate
pip install -r requirements.txt
python main.py
```

### 3. Frontend Setup
```bash
cd client
npm install
npm run dev
```

---

## 🛡️ Disclaimer
RESPIRA is a tool for habit awareness and reflection. It is not a medical device and does not provide clinical advice. Always consult with a healthcare professional for smoking cessation treatments.

*Built with care to help the world breathe better.* 🌿
