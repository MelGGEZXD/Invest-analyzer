from fastapi import FastAPI, UploadFile, File, Form
from fastapi.middleware.cors import CORSMiddleware
import pandas as pd
import numpy as np
import json

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

def calculate_irr_helper(cash_flows, initial_inv):
    cfs = [-abs(initial_inv)] + cash_flows
    low, high = -0.99, 2.0
    for _ in range(100):
        mid = (low + high) / 2
        npv_mid = sum(cf / ((1 + mid) ** t) for t, cf in enumerate(cfs))
        if abs(npv_mid) < 1e-4:
            return round(mid * 100, 2)
        if npv_mid > 0:
            low = mid
        else:
            high = mid
    return round((low + high) / 2 * 100, 2)

@app.post("/api/upload")
async def upload_file(
    file: UploadFile = File(...),
    initial_investment: float = Form(...),
    discount_rate: float = Form(...)
):
    df = pd.read_csv(file.file)
    df.columns = [c.strip().upper() for c in df.columns]
    
    inflow_col = [c for c in df.columns if 'INFLOW' in c][0]
    outflow_col = [c for c in df.columns if 'OUTFLOW' in c][0]
    year_col = [c for c in df.columns if 'YEAR' in c][0]
    
    df['NET_CASH_FLOW'] = df[inflow_col] - df[outflow_col]
    cash_flows = df['NET_CASH_FLOW'].tolist()
    
    npv = -abs(initial_investment)
    for t, cf in enumerate(cash_flows, start=1):
        npv += cf / ((1 + discount_rate) ** t)
        
    irr_val = calculate_irr_helper(cash_flows, initial_investment)
    
    cumulative = -abs(initial_investment)
    payback_period = "N/A"
    for i, cf in enumerate(cash_flows, start=1):
        cumulative += cf
        if cumulative >= 0:
            prev_cumulative = cumulative - cf
            payback_period = round((i - 1) + abs(prev_cumulative) / cf, 1)
            break
            
    pi = round((npv + abs(initial_investment)) / abs(initial_investment), 2)
    roi = round(((sum(cash_flows) - abs(initial_investment)) / abs(initial_investment)) * 100, 1)
    
    data_preview = []
    for _, row in df.head(5).iterrows():
        data_preview.append({
            "year": int(row[year_col]),
            "inflow": float(row[inflow_col]),
            "outflow": float(row[outflow_col]),
            "net_cash_flow": float(row['NET_CASH_FLOW'])
        })
        
    return {
        "filename": file.filename,
        "npv": round(npv, 2),
        "irr": irr_val,
        "payback_period": payback_period,
        "pi": pi,
        "roi": roi,
        "extracted_years": len(cash_flows),
        "cash_flows_preview": cash_flows,
        "data_preview": data_preview
    }

@app.post("/api/monte-carlo")
async def run_monte_carlo(
    initial_investment: float = Form(...),
    discount_rate: float = Form(...),
    cash_flows_json: str = Form(...)
):
    base_flows = json.loads(cash_flows_json)
    iterations = 1000
    all_npvs = []
    
    
    for _ in range(iterations):
        sim_npv = -abs(initial_investment)
        for t, base_cf in enumerate(base_flows, start=1):
            noise = np.random.normal(0, abs(base_cf) * 0.1) 
            sim_cf = base_cf + noise
            sim_npv += sim_cf / ((1 + discount_rate) ** t)
        all_npvs.append(sim_npv)
    
    all_npvs = sorted(all_npvs)
    prob_success = len([v for v in all_npvs if v > 0]) / iterations * 100
    
    counts, bins = np.histogram(all_npvs, bins=10)
    histogram_data = [
        {"range": f"{int(bins[i]/1000)}k", "count": int(counts[i])} 
        for i in range(len(counts))
    ]
    
    return {
        "mean_npv": round(float(np.mean(all_npvs)), 2),
        "prob_success": prob_success,
        "min_npv": round(float(all_npvs[0]), 2),
        "max_npv": round(float(all_npvs[-1]), 2),
        "histogram": histogram_data
    }
