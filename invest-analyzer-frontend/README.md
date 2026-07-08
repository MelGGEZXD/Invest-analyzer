# 📈 InvestAnalyzer: Precision Fiscal 

InvestAnalyzer is a comprehensive Full-Stack financial analysis platform designed to evaluate project viability through advanced cash flow modeling, interactive stress testing, and probabilistic risk assessment.

## ✨ Key Features
* **Automated Financial Metrics:** Instantly calculates NPV, IRR, ROI, and Payback Period from uploaded cash flow datasets (CSV).
* **Interactive What-If Simulation:** Real-time adjustable sliders for discount rates, annual growth shifts, and initial investment variance to stress-test financial models.
* **Monte Carlo Risk Analysis:** Performs 1,000 algorithmic iterations applying Gaussian noise to cash flows, delivering expected mean NPV and probability of project success.
* **Scenario Benchmarking:** Save and compare multiple financial scenarios side-by-side using intuitive bar charts.
* **Executive PDF Reporting:** One-click export of comprehensive financial analysis and charts for stakeholder presentations.

## 🛠️ Tech Stack
* **Frontend:** Next.js, Tailwind CSS, Recharts (Data Visualization), Axios.
* **Backend:** Python, FastAPI, Pandas, NumPy (Statistical Computing).
* **Deployment:** Vercel (Frontend) & Render (Backend).

## 🚀 Live Demo
* **Frontend Web App:** [วางลิงก์ Vercel ของคุณที่นี่]
* **Backend API:** [วางลิงก์ Render ของคุณที่นี่]

## 💻 Local Installation & Setup

**1. Clone the repository:**
```bash
git clone [https://github.com/your-username/invest-analyzer-frontend.git](https://github.com/your-username/invest-analyzer-frontend.git)
```
**2. Install Frontend Dependencies:**

Bash
```cd invest-analyzer-frontend
npm install
npm run dev
```
**3. Setup Backend (Run in a separate terminal):**

```Bash
git clone [https://github.com/your-username/invest-analyzer-backend.git](https://github.com/your-username/invest-analyzer-backend.git)
cd invest-analyzer-backend
pip install -r requirements.txt
uvicorn main:app --reload
```