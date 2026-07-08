"use client";
import axios from "axios";
import Link from "next/link";
import { useState } from "react";
import { useApp } from "@/context/AppContext";
import { 
  LayoutDashboard, FileSpreadsheet, LineChart as LineChartIcon, 
  UploadCloud, Loader2, CheckCircle2, ArrowRight, Table, Sliders, Save
} from "lucide-react";

export default function Home() {
  const {
    file, setFile,
    initialInvestment, setInitialInvestment,
    discountRate, setDiscountRate,
    loading, setLoading,
    results, setResults,
    error, setError,
    saveScenario
  } = useApp();

  const [scenarioName, setScenarioName] = useState("");

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setError("");
    }
  };

  const handleUpload = async () => {
    if (!file) {
      setError("Please select a CSV file first.");
      return;
    }
    setLoading(true);
    setError("");

    const formData = new FormData();
    formData.append("file", file);
    formData.append("initial_investment", initialInvestment);
    formData.append("discount_rate", discountRate);

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";
      const response = await axios.post(`${apiUrl}/api/upload`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setResults(response.data);
    } catch (err: any) {
      setError(err.response?.data?.detail || "Server connection error.");
    } finally {
      setLoading(false);
    }
  };

  const handleSave = () => {
    if (!scenarioName.trim()) return;
    saveScenario(scenarioName);
    setScenarioName("");
    alert("Scenario saved successfully!");
  };

  return (
    <div className="flex h-screen w-full bg-slate-100 text-slate-800 font-sans">
      
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
            <Link href="/" className="flex items-center gap-3 px-4 py-2.5 rounded-lg bg-slate-100 text-slate-900 font-semibold text-sm transition-all border-l-4 border-slate-900">
              <FileSpreadsheet className="w-4 h-4" />
              Workspace
            </Link>
            <Link href="/dashboard" className="flex items-center gap-3 px-4 py-2.5 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-50 font-medium text-sm transition-all">
              <LayoutDashboard className="w-4 h-4" />
              Dashboard
            </Link>
            <Link href="/simulation" className="flex items-center gap-3 px-4 py-2.5 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-50 font-medium text-sm transition-all">
              <Sliders className="w-4 h-4" />
              Simulation
            </Link>
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="bg-white border-b border-slate-200 px-8 py-4 flex items-center justify-between">
          <h2 className="text-lg font-bold text-slate-900">Project Portfolio Review</h2>
        </header>

        <div className="flex-1 p-8 overflow-auto space-y-6">
          
          {/* Data Ingestion Card */}
          <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm space-y-4">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-md font-bold text-slate-900">Data Ingestion</h3>
                <p className="text-xs text-slate-500 mt-0.5">Upload and validate financial datasets.</p>
              </div>
              <div className="flex items-center gap-3">
                <span className={`text-[10px] font-bold px-3 py-1 rounded-full ${file ? 'bg-emerald-100 text-emerald-800 border border-emerald-200' : 'bg-slate-100 text-slate-500 border border-slate-200'}`}>
                  {file ? "✓ READY FOR CALCULATION" : "AWAITING FILE"}
                </span>
                <button 
                  onClick={handleUpload}
                  disabled={loading || !file}
                  className="bg-slate-900 text-white text-xs font-bold px-4 py-2 rounded-lg hover:bg-slate-800 transition-colors disabled:bg-slate-200 disabled:text-slate-400 disabled:cursor-not-allowed flex items-center gap-1.5"
                >
                  {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : "Analyze Data"}
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Inputs & Dropzone */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500">Initial Investment (THB)</label>
                <input type="number" value={initialInvestment} onChange={(e) => setInitialInvestment(e.target.value)} className="w-full text-sm border border-slate-200 rounded-lg p-2.5 bg-slate-50 outline-none" />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500">Discount Rate</label>
                <input type="number" step="0.01" value={discountRate} onChange={(e) => setDiscountRate(e.target.value)} className="w-full text-sm border border-slate-200 rounded-lg p-2.5 bg-slate-50 outline-none" />
              </div>
              <div className="relative group border border-slate-200 hover:border-slate-400 border-dashed rounded-lg bg-slate-50 p-3 flex items-center justify-center gap-3 cursor-pointer">
                <input type="file" className="hidden" id="file-upload" accept=".csv" onChange={handleFileChange} />
                <label htmlFor="file-upload" className="flex items-center gap-3 w-full h-full cursor-pointer justify-center">
                  <div className="w-8 h-8 bg-white rounded-md border border-slate-200 flex items-center justify-center shadow-sm">
                    {file ? <CheckCircle2 className="w-4 h-4 text-emerald-600" /> : <UploadCloud className="w-4 h-4 text-slate-500" />}
                  </div>
                  <div className="text-left">
                    <p className="text-xs font-bold text-slate-700 truncate max-w-[180px]">{file ? file.name : "Choose CSV file"}</p>
                    <p className="text-[10px] text-slate-400">Max size 50MB</p>
                  </div>
                </label>
              </div>
            </div>

            {/*  Save Scenario  */}
            {results && (
              <div className="flex gap-2 pt-2 border-t border-slate-100 items-center justify-end">
                <input 
                  type="text" placeholder="Name this scenario (e.g. Plan A: Expansion)..." 
                  value={scenarioName} onChange={(e) => setScenarioName(e.target.value)}
                  className="text-xs border border-slate-200 rounded-lg px-3 py-2 w-64 bg-slate-50 outline-none focus:bg-white"
                />
                <button onClick={handleSave} className="bg-emerald-600 text-white text-xs font-bold px-3 py-2 rounded-lg hover:bg-emerald-700 flex items-center gap-1">
                  <Save className="w-3.5 h-3.5" /> Save Scenario
                </button>
              </div>
            )}
            {error && <p className="text-xs text-red-500 font-semibold text-right">{error}</p>}
          </div>

          {/* Table Preview & Schema Mapping */}
          {results && results.data_preview && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              <div className="lg:col-span-8 bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
                <div className="p-4 border-b border-slate-200 bg-slate-50/50 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Table className="w-4 h-4 text-slate-500" />
                    <h4 className="text-xs font-bold text-slate-700">Preview: {results.filename}</h4>
                  </div>
                  <span className="text-[10px] font-medium text-slate-400">Showing top 5 rows</span>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-200 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                        <th className="p-3.5 pl-6">Year</th>
                        <th className="p-3.5">Inflow (USD)</th>
                        <th className="p-3.5">Outflow (USD)</th>
                        <th className="p-3.5">Net Cash Flow</th>
                        <th className="p-3.5 text-center">Status</th>
                      </tr>
                    </thead>
                    <tbody className="text-xs font-medium text-slate-700 divide-y divide-slate-100">
                      {results.data_preview.map((row: any, idx: number) => (
                        <tr key={idx} className="hover:bg-slate-50/80 transition-colors">
                          <td className="p-3.5 pl-6 font-bold text-slate-900">{row.year}</td>
                          <td className="p-3.5">{row.inflow.toLocaleString()}</td>
                          <td className="p-3.5">{row.outflow.toLocaleString()}</td>
                          <td className={`p-3.5 font-bold ${row.net_cash_flow >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                            {row.net_cash_flow >= 0 ? '+' : ''}{row.net_cash_flow.toLocaleString()}
                          </td>
                          <td className="p-3.5 text-center"><span className="inline-flex items-center justify-center w-5 h-5 bg-emerald-50 text-emerald-600 rounded-full text-[10px]">✓</span></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="lg:col-span-4 bg-white border border-slate-200 rounded-xl p-4 shadow-sm h-fit">
                <h4 className="text-xs font-bold text-slate-700 mb-4 flex items-center gap-1.5"><span>⚙</span> Schema Mapping</h4>
                <div className="space-y-3">
                  <div className="flex items-center justify-between bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-xs">
                    <span className="font-bold text-slate-600 bg-white border px-2 py-1 rounded shadow-sm">YEAR</span>
                    <span className="text-slate-400 text-[10px]">➔</span>
                    <span className="font-mono text-emerald-700 bg-emerald-50 px-2 py-1 rounded border">fiscal_year</span>
                  </div>
                  <div className="flex items-center justify-between bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-xs">
                    <span className="font-bold text-slate-600 bg-white border px-2 py-1 rounded shadow-sm">INFLOW</span>
                    <span className="text-slate-400 text-[10px]">➔</span>
                    <span className="font-mono text-emerald-700 bg-emerald-50 px-2 py-1 rounded border">annual_inflow</span>
                  </div>
                  <div className="flex items-center justify-between bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-xs">
                    <span className="font-bold text-slate-600 bg-white border px-2 py-1 rounded shadow-sm">OUTFLOW</span>
                    <span className="text-slate-400 text-[10px]">➔</span>
                    <span className="font-mono text-emerald-700 bg-emerald-50 px-2 py-1 rounded border">annual_outflow</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}