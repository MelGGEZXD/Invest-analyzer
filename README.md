# 📈 InvestAnalyzer: Precision Fiscal 

InvestAnalyzer is a comprehensive Full-Stack financial analysis platform designed to evaluate project viability through advanced cash flow modeling, interactive stress testing, and probabilistic risk assessment.


<img width="1920" height="720" alt="{592FC464-3586-4FEF-95E2-997B62189F79}" src="https://github.com/user-attachments/assets/cc242003-33ba-48ea-8e1c-69e094182084" />
<img width="1905" height="916" alt="{0CA4A400-3191-43AB-9904-113DFAC9D30F}" src="https://github.com/user-attachments/assets/135801eb-ef61-4d63-8694-48ccb1ae860e" />
<img width="1905" height="903" alt="{E33C4AEB-257B-4517-92D0-13174DA8571A}" src="https://github.com/user-attachments/assets/74e4fb61-4ec4-44b2-a856-fb5a3947a105" />

## 🚀 Live Demo
* **Frontend Web App:** [https://invest-analyzer-six.vercel.app/](https://invest-analyzer-six.vercel.app/)
* **Backend API:** [https://invest-analyzer-mlwp.onrender.com](https://invest-analyzer-mlwp.onrender.com) 

## ✨ Key Features
* **Automated Financial Metrics:** Instantly calculates NPV, IRR, ROI, and Payback Period from uploaded cash flow datasets (CSV).
* **Interactive What-If Simulation:** Real-time adjustable sliders for discount rates, annual growth shifts, and initial investment variance.
* **Monte Carlo Risk Analysis:** Performs 1,000 algorithmic iterations applying Gaussian noise to cash flows to deliver expected mean NPV and probability of success.
* **Scenario Benchmarking:** Save and compare multiple financial scenarios side-by-side using intuitive bar charts.

## 🛠️ Tech Stack
* **Frontend:** Next.js, Tailwind CSS, Recharts, Axios
* **Backend:** Python, FastAPI, Pandas, NumPy
* **Infrastructure:** Vercel (Frontend Hosting), Render (Backend Hosting)

---

## 💻 Local Installation & Setup

This project uses a **Monorepo** structure. You only need to clone this single repository to get both the frontend and backend source code.

### 1. Clone the repository
```bash
git clone [https://github.com/MelGGEZXD/invest-analyzer.git](https://github.com/MelGGEZXD/invest-analyzer.git)
cd invest-analyzer
```
2. Setup Backend (FastAPI)
Open a terminal and navigate to the backend directory:

```Bash
cd invest-analyzer-backend
pip install -r requirements.txt
uvicorn main:app --reload --port 10000
The backend API will start running at http://127.0.0.1:10000
```
3. Setup Frontend (Next.js)
Open a new separate terminal and navigate to the frontend directory:

```Bash
cd invest-analyzer-frontend
npm install
```
```Environment Setup:
Create a .env.local file inside the invest-analyzer-frontend folder and link it to your local backend:


NEXT_PUBLIC_API_URL=[http://127.0.0.1:10000](http://127.0.0.1:10000)
```
Run the App:

```Bash
npm run dev
```
The frontend web app will start running at http://localhost:3000
