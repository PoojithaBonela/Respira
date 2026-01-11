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

## � Local Development (Getting Started)

Follow these steps to get a local copy of RESPIRA up and running.

### 1. Clone the Repository
```bash
git clone https://github.com/PoojithaBonela/Secure_File_Sharing.git
cd Secure_File_Sharing
```

### 2. Backend Setup (`/server`)
The backend is built with FastAPI and requires Python 3.11+.

```bash
cd server
python -m venv venv
source venv/bin/activate  # On Windows: venv\\Scripts\\activate
pip install -r requirements.txt
```

**Create a `.env` file in the `/server` directory:**
```env
MONGODB_URL=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret_key
GROQ_API_KEY=your_groq_ai_api_key
GOOGLE_CLIENT_ID=your_google_oauth_client_id
SMTP_EMAIL=your_gmail_for_alerts (optional)
SMTP_PASSWORD=your_app_password (optional)
```

**Run the backend:**
```bash
uvicorn main:app --reload
```

### 3. Frontend Setup (`/client`)
The frontend is built with React and Vite.

```bash
cd client
npm install
```

**Create a `.env` file in the `/client` directory:**
```env
VITE_BACKEND_URL=http://localhost:8000
VITE_GOOGLE_CLIENT_ID=your_google_oauth_client_id
```

**Run the frontend:**
```bash
npm run dev
```

---

## 🛠️ Tech Stack
- **Frontend**: React, Vite, Tailwind CSS, Lucide Icons.
- **Backend**: FastAPI (Python), JWT Auth.
- **Database**: MongoDB Atlas.
- **AI**: Groq (LLM) for behavioral insights.

---

## 🛡️ Disclaimer
RESPIRA is a tool for habit awareness and reflection. It is not a medical device and does not provide clinical advice. Always consult with a healthcare professional for smoking cessation treatments.

*Built with care to help the world breathe better.* 🌿
