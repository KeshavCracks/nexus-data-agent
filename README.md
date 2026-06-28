# 🌌 Nexus Data Intelligence Agent

**Nexus** is a high-end, RAG-powered autonomous data analysis agent designed for business intelligence. It doesn't just summarize data—it reasons through complex queries, writes Python code to analyze datasets, and presents insights through a tactical Cyber-Defense HUD.

## 🛠️ Tech Stack

### Frontend (Tactical HUD)
- **Next.js 14** (App Router)
- **Tailwind CSS** (Custom Nexus Theme)
- **Framer Motion** (Animations)
- **Lucide React** (Interface Icons)

### Backend (The Intelligence Engine)
- **FastAPI** (High-performance Python API)
- **OpenAI GPT-4o** (Reasoning & Code Generation)
- **Pandas** (Dynamic Data Analysis)
- **ReAct Pattern** (Reasoning $\rightarrow$ Acting $\rightarrow$ Observation $\rightarrow$ Synthesis)

## 📐 Design System: Nexus Cyber Defense
The interface follows a strict tactical visual language:
- **Palette:** True Black background with High-Energy Amber (#FFAB00).
- **Typography:** Rajdhani for headings, JetBrains Mono for system logs.
- **Aesthetic:** 0px border-radius, scanline overlays, and glowing HUD borders.

## 🚀 Features
- **Autonomous Code Execution:** The agent writes and runs actual Pandas code to ensure 100% numerical accuracy.
- **Reasoning Trace:** A real-time "Thought" log showing how the agent is approaching the problem.
- **RAG-Enhanced Schema:** Uses a data dictionary to map business terms to technical column names.
- **Tactical UI:** A professional, command-center feel designed for high-density data visualization.

## 🛠️ Local Setup

### Backend
1. `cd backend`
2. `pip install -r requirements.txt`
3. Set your API Key: `export OPENAI_API_KEY='your-key'`
4. `python main.py`

### Frontend
1. `cd frontend`
2. `npm install`
3. `npm run dev`

## 🌐 Deployment

### Backend (Render)
- Connect your GitHub repo to **Render**.
- Create a **Web Service**.
- Build Command: `pip install -r backend/requirements.txt`
- Start Command: `uvicorn backend.main:app --host 0.0.0.0 --port $PORT`
- Add `OPENAI_API_KEY` to Environment Variables.

### Frontend (Vercel)
- Connect your GitHub repo to **Vercel**.
- Root Directory: `frontend`
- Framework Preset: `Next.js`
- Add `NEXT_PUBLIC_API_URL` pointing to your Render backend.
