"use client";
import Link from "next/link";
import { useState, useEffect } from "react";
import axios from "axios";
import { useApp } from "@/context/AppContext";
import { 
  LayoutDashboard, FileSpreadsheet, LineChart as LineChartIcon, 
  Sliders, Info, HelpCircle
} from "lucide-react";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ReferenceLine } from 'recharts';

function calculateLocalIRR(cashFlows: number[], initialInv: number): string {
  const cfs = [-Math.abs(initialInv), ...cashFlows];
  let low = -0.99, high = 2.0;
  for (let i = 0; i < 50; i++) {
    const mid = (low + high) / 2;
    let npvMid = 0;
    for (let t = 0; t < cfs.length; t++) {
      npvMid += cfs[t] / Math.pow(1 + mid, t);
    }
    if (Math.abs(npvMid) < 1e-4) return (mid * 100).toFixed(2);
    if (npvMid > 0) low = mid;
    else high = mid;
  }
  return ((low + high) / 2 * 100).toFixed(2);
}

export default function Simulation() {
  const { results, initialInvestment, discountRate } = useApp();

  const [simDiscount, setSimDiscount] = useState(0.10);
  const [simGrowth, setSimGrowth] = useState(0);     
  const [simVariance, setSimVariance] = useState(0); 

  // State for Monte Carlo
  const [mcData, setMcData] = useState<any>(null);
  const [mcLoading, setMcLoading] = useState(false);

  useEffect(() => {
    if (discountRate) {
      setSimDiscount(Number(discountRate));
    }
  }, [discountRate]);

  const baseInv = results ? Math.abs(Number(initialInvestment)) : 100000;
  const baseRate = results ? Number(discountRate) : 0.10;
  const baseFlows = results?.cash_flows_preview || [30000, 40000, 40000, 30000, 20000];

  const currentInv = baseInv * (1 + simVariance / 100);
  const currentFlows = baseFlows.map((cf: number) => cf * (1 + simGrowth / 100));
  
  let currentNPV = -currentInv;
  currentFlows.forEach((cf: number, t: number) => {
    currentNPV += cf / Math.pow(1 + simDiscount, t + 1);
  });
  
  const currentIRR = calculateLocalIRR(currentFlows, currentInv);

  const baseNPV = results?.npv || 23292;
  const npvDiffPercent = (((currentNPV - baseNPV) / Math.abs(baseNPV)) * 100).toFixed(1);

  const getComparisonData = () => {
    const data = [{ 
      year: 'Y0 (Invest)', 
      'Baseline (Original)': -baseInv, 
      'Simulated (New)': -currentInv 
    }];
    
    baseFlows.forEach((cf: number, t: number) => {
      data.push({
        year: `Y${t + 1}`,
        'Baseline (Original)': cf,
        'Simulated (New)': currentFlows[t]
      });
    });
    
    return data;
  };

  // Call API for Monte Carlo
  const runMonteCarlo = async () => {
    setMcLoading(true);
    const formData = new FormData();
    formData.append("initial_investment", currentInv.toString());
    formData.append("discount_rate", simDiscount.toString());
    formData.append("cash_flows_json", JSON.stringify(currentFlows));

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";
      const res = await axios.post(`${apiUrl}/api/monte-carlo`, formData);
      setMcData(res.data);
    } catch (e) { 
      alert("Error running Monte Carlo simulation. Please check backend connection."); 
    } finally { 
      setMcLoading(false); 
    }
  };

  return (
    <div className="flex h-screen w-full bg-slate-50 text-slate-800 font-sans">
      
      {/* Sidebar */}
      <div className="w-64 bg-white border-r border-slate-200 p-6 flex flex-col">
        <div className="space-y-6">
          <div className="flex items-center gap-3">
            <div className="bg-slate-900 text-white p-2 rounded-lg">
              <LineChartIcon className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-md font-bold tracking-tight">InvestAnalyzer</h1>
              <p className="text-[10px] text-slate-400 font-semibold tracking-wider uppercase">Precision Fiscal</p>
            </div>
          </div>
          
          <nav className="flex flex-col gap-1">
            <Link href="/" className="flex items-center gap-3 px-4 py-2.5 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-50 font-medium text-sm transition-all">
              <FileSpreadsheet className="w-4 h-4" />
              Workspace
            </Link>
            <Link href="/dashboard" className="flex items-center gap-3 px-4 py-2.5 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-50 font-medium text-sm transition-all">
              <LayoutDashboard className="w-4 h-4" />
              Dashboard
            </Link>
            <Link href="/simulation" className="flex items-center gap-3 px-4 py-2.5 rounded-lg bg-slate-100 text-slate-900 font-semibold text-sm transition-all border-l-4 border-slate-900">
              <Sliders className="w-4 h-4" />
              Simulation
            </Link>
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        
        <header className="bg-white border-b border-slate-200 px-8 py-4 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-slate-900">What-If Simulation</h2>
            <p className="text-[11px] text-slate-400 font-medium">Adjust parameters below to see real-time impact on valuation.</p>
          </div>
        </header>

        <div className="flex-1 p-8 overflow-auto">
          
          {!results && (
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-6 flex items-center gap-3 text-xs font-medium text-amber-800">
              <Info className="w-4 h-4 flex-shrink-0" />
              <span>Viewing with mock data. For precise simulation, please upload your project dataset in the <b>Workspace</b> tab first.</span>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            
            {/* Simulation Controls Sidebar */}
            <div className="lg:col-span-4 space-y-6">
              <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm h-fit space-y-6">
                <h3 className="text-sm font-bold text-slate-900 border-b pb-3 flex items-center gap-2">
                  <Sliders className="w-4 h-4 text-slate-500" /> Simulation Controls
                </h3>

                <div className="space-y-2">
                  <div className="flex justify-between text-xs">
                    <span className="font-bold text-slate-500 uppercase">Discount Rate (%)</span>
                    <span className="font-mono font-bold text-emerald-600">{(simDiscount * 100).toFixed(1)}%</span>
                  </div>
                  <input 
                    type="range" min="0.05" max="0.20" step="0.005"
                    value={simDiscount} onChange={(e) => setSimDiscount(Number(e.target.value))}
                    className="w-full h-1.5 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-slate-950"
                  />
                  <div className="flex justify-between text-[10px] text-slate-400 font-medium"><span>5%</span><span>20%</span></div>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-xs">
                    <span className="font-bold text-slate-500 uppercase">Annual Growth Shift</span>
                    <span className={`font-mono font-bold ${simGrowth >= 0 ? 'text-blue-600' : 'text-rose-500'}`}>
                      {simGrowth >= 0 ? '+' : ''}{simGrowth.toFixed(1)}%
                    </span>
                  </div>
                  <input 
                    type="range" min="-5" max="10" step="0.5"
                    value={simGrowth} onChange={(e) => setSimGrowth(Number(e.target.value))}
                    className="w-full h-1.5 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-slate-950"
                  />
                  <div className="flex justify-between text-[10px] text-slate-400 font-medium"><span>-5%</span><span>+10%</span></div>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-xs">
                    <span className="font-bold text-slate-500 uppercase">Init. Investment Variance</span>
                    <span className={`font-mono font-bold ${simVariance >= 0 ? 'text-purple-600' : 'text-rose-500'}`}>
                      {simVariance >= 0 ? '+' : ''}{simVariance.toFixed(0)}%
                    </span>
                  </div>
                  <input 
                    type="range" min="-25" max="25" step="1"
                    value={simVariance} onChange={(e) => setSimVariance(Number(e.target.value))}
                    className="w-full h-1.5 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-slate-950"
                  />
                  <div className="flex justify-between text-[10px] text-slate-400 font-medium"><span>-25%</span><span>+25%</span></div>
                </div>

                <div className="bg-slate-50 rounded-lg p-3 border border-slate-100 text-[10px] text-slate-400 flex gap-2">
                  <HelpCircle className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" />
                  <span>Baseline values are securely locked from reports. Move sliders to simulate risk stress testing.</span>
                </div>
              </div>
            </div>

            {/* Dashboard & Chart Area */}
            <div className="lg:col-span-8 space-y-6">
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Projected NPV</p>
                  <p className="text-3xl font-black text-slate-900 mb-2">฿{Math.round(currentNPV).toLocaleString()}</p>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${Number(npvDiffPercent) >= 0 ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'}`}>
                    {Number(npvDiffPercent) >= 0 ? '↗ +' : '↘ '}{npvDiffPercent}% vs baseline
                  </span>
                </div>

                <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Projected IRR</p>
                  <p className="text-3xl font-black text-slate-900 mb-2">{currentIRR}%</p>
                  <span className="text-[10px] font-medium text-slate-400">
                    Baseline IRR: {results?.irr || "19.25"}%
                  </span>
                </div>
              </div>

              <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
                <div className="mb-4">
                  <h4 className="text-sm font-bold text-slate-900">Cash Flow Scenario Comparison</h4>
                  <p className="text-[11px] text-slate-400">Year-over-year comparison between baseline model and current simulation</p>
                </div>

                <div className="w-full h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={getComparisonData()} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                      <XAxis dataKey="year" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 11, fontWeight: 600}} dy={10} />
                      <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 11, fontWeight: 600}} tickFormatter={(val) => `฿${val/1000}k`} />
                      <Tooltip 
                        contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                        formatter={(value: any) => `฿${Number(value).toLocaleString()}`}
                        cursor={{fill: '#f1f5f9'}}
                      />
                      <Legend iconType="circle" wrapperStyle={{ fontSize: '11px', fontWeight: 600, paddingTop: '10px' }} />
                      
                      <ReferenceLine y={0} stroke="#94a3b8" />
                      <Bar dataKey="Baseline (Original)" fill="#cbd5e1" radius={[4, 4, 4, 4]} barSize={25} />
                      <Bar dataKey="Simulated (New)" fill="#3b82f6" radius={[4, 4, 4, 4]} barSize={25} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Monte Carlo Risk Analysis Module */}
              <div className="mt-8 bg-slate-900 text-white rounded-2xl p-8 shadow-xl overflow-hidden relative">
                <div className="relative z-10">
                  <div className="flex justify-between items-center mb-6">
                    <div>
                      <h3 className="text-xl font-bold">Monte Carlo Risk Analysis</h3>
                      <p className="text-slate-400 text-xs mt-1">1,000 simulations based on 10% volatility factor</p>
                    </div>
                    <button 
                      onClick={runMonteCarlo} 
                      disabled={mcLoading}
                      className="bg-emerald-500 hover:bg-emerald-400 text-white font-bold py-2 px-6 rounded-full text-sm transition-all disabled:bg-slate-700 disabled:text-slate-400"
                    >
                      {mcLoading ? "Simulating..." : "Run Risk Audit"}
                    </button>
                  </div>

                  {mcData && (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                      <div className="space-y-4">
                        <div className="bg-slate-800/50 p-4 rounded-xl border border-slate-700">
                          <p className="text-slate-400 text-[10px] uppercase font-bold tracking-widest">Success Probability</p>
                          <p className="text-3xl font-black text-emerald-400">{mcData.prob_success.toFixed(1)}%</p>
                        </div>
                        <div className="bg-slate-800/50 p-4 rounded-xl border border-slate-700">
                          <p className="text-slate-400 text-[10px] uppercase font-bold tracking-widest">Expected Mean NPV</p>
                          <p className="text-xl font-bold">฿{mcData.mean_npv.toLocaleString()}</p>
                        </div>
                      </div>
                      <div className="lg:col-span-2 h-[200px]">
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart data={mcData.histogram}>
                            <XAxis dataKey="range" hide />
                            <Tooltip 
                              cursor={{fill: 'transparent'}} 
                              contentStyle={{backgroundColor: '#1e293b', border: 'none', color: '#fff'}} 
                              formatter={(value: any) => [`${value} Scenarios`, 'Frequency']}
                            />
                            <Bar dataKey="count" fill="#10b981" radius={[2, 2, 0, 0]} />
                          </BarChart>
                        </ResponsiveContainer>
                        <p className="text-center text-[10px] text-slate-500 mt-2 font-mono">NPV Distribution Histogram (1000 Iterations)</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

            </div>
          </div>
        </div>
      </div>
    </div>
  );
}