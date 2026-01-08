# Spivot - Agentic Operating System for MSMEs

AI-powered multi-agent system where autonomous "Digital Employees" manage Demand, Inventory, Liquidity, and Credit for MSMEs.

## 🚀 Quick Start

### Frontend
```bash
cd frontend
npm install
npm run dev
```
Open http://localhost:3000

### Backend
```bash
cd backend
pip install -r requirements.txt
cp .env.example .env
# Edit .env with your credentials
uvicorn app.main:app --reload
```
Open http://localhost:8000/docs for API docs

## 🤖 The 5 Agents

| Agent | Function |
|-------|----------|
| **Visual Eye** | OCR & Document Ingestion (Gemini 2.0 Flash) |
| **Prophet** | Demand Forecasting with Market Sentiment |
| **Quartermaster** | Inventory Optimization & Reorder Alerts |
| **Treasurer** | Cashflow Analysis & Runway Monitoring |
| **Underwriter** | Credit Scoring (Spivot Score 300-900) |

## 🏗️ Tech Stack

**Frontend:** Next.js 14, TypeScript, Tailwind CSS, Recharts  
**Backend:** Python FastAPI, SQLAlchemy, Pydantic  
**Database:** Supabase (PostgreSQL)  
**AI:** Google Gemini 2.0 Flash

## 📦 Deployment

**Frontend → Vercel:** Auto-deploys on push  
**Backend → Cloud Run:** `gcloud run deploy spivot-backend --source .`

## 📄 License

MIT
