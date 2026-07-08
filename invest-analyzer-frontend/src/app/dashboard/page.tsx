"use client";
import Link from "next/link";
import { useState } from "react";
import { useApp } from "@/context/AppContext";
import { 
  LayoutDashboard, FileSpreadsheet, LineChart as LineChartIcon, 
  Info, TrendingUp, DollarSign, Clock, Sliders, Download, Trash2, FolderOpen
} from "lucide-react";
import { ResponsiveContainer, ComposedChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
// Import PDF
import { toPng } from 'html-to-image';
import jsPDF from "jspdf";

export default function Dashboard() {
  const { results, initialInvestment, discountRate, scenarios, loadScenario, deleteScenario, selectedIds, toggleSelection } = useApp();
  const [exporting, setExporting] = useState(false);

  const npv = results?.npv || 0;
  const irr = results?.irr || 0;
  const payback = results?.payback_period || "--";
  const roi = results?.roi || 0;
  const pi = results?.pi || 0;

  const getChartData = () => {
    if (!results) return [];
    let cumulative = -Math.abs(Number(initialInvestment));
    const data = [{ year: 'Y0', 'Annual Net Cash Flow': 0, 'Cumulative Cash Flow': cumulative }];
    
    results.cash_flows_preview.forEach((cf: number, index: number) => {
      cumulative += cf;
      data.push({
        year: `Y${index + 1}`,
        'Annual Net Cash Flow': cf,
        'Cumulative Cash Flow': cumulative
      });
    });
    return data;
  };

  const chartData = getChartData();

  // 🔥 function PDF
  const handleExportPDF = async () => {
    const element = document.getElementById("dashboard-report-area");
    if (!element) return;
    
    setExporting(true);
    try {
      // Use toPng 
      const dataUrl = await toPng(element, { 
        quality: 1, 
        backgroundColor: '#f8fafc' 
      });
      
      const pdf = new jsPDF("p", "mm", "a4");
      const imgWidth = 210; // ขนาด A4
      const imgHeight = (element.offsetHeight * imgWidth) / element.offsetWidth;
      
      pdf.addImage(dataUrl, "PNG", 0, 0, imgWidth, imgHeight);
      pdf.save(`InvestAnalyzer-Report-${Date.now()}.pdf`);
    } catch (err) {
      console.error("PDF generation failed", err);
      alert("ไม่สามารถสร้างไฟล์ PDF ได้ ลองใหม่อีกครั้งครับ");
    } finally {
      setExporting(false);
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
            <Link href="/dashboard" className="flex items-center gap-3 px-4 py-2.5 rounded-lg bg-slate-100 text-slate-900 font-semibold text-sm transition-all border-l-4 border-slate-900">
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
        
        {/* Header bottom Export Report */}
        <header className="bg-white border-b border-slate-200 px-8 py-4 flex items-center justify-between">
          <h2 className="text-lg font-bold text-slate-900">Executive Dashboard</h2>
          <button 
            onClick={handleExportPDF}
            disabled={exporting || !results}
            className="bg-slate-900 text-white text-xs font-bold px-4 py-2 rounded-lg hover:bg-slate-800 flex items-center gap-1.5 disabled:bg-slate-200 disabled:text-slate-400"
          >
            <Download className="w-3.5 h-3.5" />
            {exporting ? "Generating PDF..." : "Export Report"}
          </button>
        </header>

        {/* Dashboard Body */}
        <div className="flex-1 p-8 overflow-auto space-y-6">
          
          {/* PDF Report Area */}
          <div id="dashboard-report-area" className="space-y-6 bg-slate-50 p-2 rounded-xl">
            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
                <div className="flex justify-between items-start mb-2">
                  <p className="text-xs font-bold text-slate-500 uppercase tracking-wide">Net Present Value (NPV)</p>
                  <Info className="w-4 h-4 text-slate-400" />
                </div>
                <p className="text-2xl font-black text-slate-900 mb-2">฿{npv.toLocaleString()}</p>
                <span className="text-[10px] font-bold px-2 py-1 rounded bg-emerald-50 text-emerald-700">↗ Active Model Target</span>
              </div>

              <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
                <div className="flex justify-between items-start mb-2">
                  <p className="text-xs font-bold text-slate-500 uppercase tracking-wide">Internal Rate of Return</p>
                  <TrendingUp className="w-4 h-4 text-slate-400" />
                </div>
                <p className="text-2xl font-black text-slate-900 mb-2">{irr}%</p>
                <p className="text-[10px] font-semibold text-slate-500">Exceeds hurdle rate of {(Number(discountRate)*100).toFixed(0)}%</p>
              </div>

              <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
                <div className="flex justify-between items-start mb-2">
                  <p className="text-xs font-bold text-slate-500 uppercase tracking-wide">Initial Investment</p>
                  <DollarSign className="w-4 h-4 text-slate-400" />
                </div>
                <p className="text-2xl font-black text-slate-900 mb-2">-฿{Number(initialInvestment).toLocaleString()}</p>
                <p className="text-[10px] font-semibold text-slate-500">Capital outlay in Year 0</p>
              </div>

              <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
                <div className="flex justify-between items-start mb-2">
                  <p className="text-xs font-bold text-slate-500 uppercase tracking-wide">Payback Period</p>
                  <Clock className="w-4 h-4 text-slate-400" />
                </div>
                <p className="text-2xl font-black text-slate-900 mb-2">{payback} <span className="text-sm font-medium text-slate-500">Yrs</span></p>
                <p className="text-[10px] font-semibold text-slate-500">Discounted payback: N/A</p>
              </div>
            </div>

            {/* Chart & Sidebar */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
                <div className="mb-6">
                  <h3 className="text-lg font-bold text-slate-900">Cash Flow Analysis</h3>
                  <p className="text-xs text-slate-500">Annual vs Cumulative Projection</p>
                </div>
                <div className="w-full h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <ComposedChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                      <XAxis dataKey="year" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 11, fontWeight: 600}} dy={10} />
                      <YAxis yAxisId="left" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 11, fontWeight: 600}} tickFormatter={(value) => `฿${(value/1000)}k`} />
                      <Tooltip contentStyle={{ borderRadius: '8px', border: 'none' }} formatter={(value: any) => `฿${Number(value).toLocaleString()}`} />
                      <Legend iconType="square" wrapperStyle={{ fontSize: '12px', fontWeight: 600 }} />
                      <Bar yAxisId="left" dataKey="Annual Net Cash Flow" barSize={35} fill="#0f172a" radius={[2, 2, 0, 0]} />
                      <Line yAxisId="left" type="monotone" dataKey="Cumulative Cash Flow" stroke="#34d399" strokeWidth={4} dot={{ r: 5, fill: '#34d399' }} />
                    </ComposedChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm h-fit">
                <div className="mb-6">
                  <h3 className="text-lg font-bold text-slate-900">Financial Ratios</h3>
                  <p className="text-xs text-slate-500">Key performance indicators</p>
                </div>
                <div className="space-y-0">
                  <div className="grid grid-cols-2 py-3 border-b border-slate-100">
                    <p className="text-xs font-semibold text-slate-600 font-mono">Return on Investment (ROI)</p>
                    <p className="text-right text-sm font-bold text-slate-900">{roi}%</p>
                  </div>
                  <div className="grid grid-cols-2 py-3 border-b border-slate-100">
                    <p className="text-xs font-semibold text-slate-600 font-mono">Profitability Index (PI)</p>
                    <p className={`text-right text-sm font-bold ${pi > 1 ? 'text-emerald-600' : 'text-rose-600'}`}>{pi}</p>
                  </div>
                  <div className="grid grid-cols-2 py-3 border-b border-slate-100">
                    <p className="text-xs font-semibold text-slate-600 font-mono">Discount Rate</p>
                    <p className="text-right text-sm font-bold text-slate-900">{(Number(discountRate) * 100).toFixed(1)}%</p>
                  </div>
                  <div className="grid grid-cols-2 py-3 border-b border-slate-100">
                    <p className="text-xs font-semibold text-slate-600 font-mono">EBITDA Margin</p>
                    <p className="text-right text-sm font-bold text-slate-900">24.5%</p>
                  </div>
                  <div className="grid grid-cols-2 py-3">
                    <p className="text-xs font-semibold text-slate-600 font-mono">Peak Funding Reqd</p>
                    <p className="text-right text-sm font-bold text-rose-600">฿{Number(initialInvestment).toLocaleString()}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* 💾(Scenarios History) */}
          <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
            <div className="p-4 border-b border-slate-200 bg-slate-50/50">
              <h3 className="text-xs font-bold text-slate-700">Saved Scenarios Vault (Local Storage)</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    <th className="p-3 pl-6">Scenario Name</th>
                    <th className="p-3">Initial Inv.</th>
                    <th className="p-3">NPV</th>
                    <th className="p-3">IRR</th>
                    <th className="p-3">Saved Time</th>
                    <th className="p-3 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium">
                  {scenarios.length > 0 ? (
                    scenarios.map((s) => (
                      <tr key={s.id} className="hover:bg-slate-50/50 transition-colors">
                        <td className="p-3 pl-6 font-bold text-slate-900">{s.name}</td>
                        <td className="p-3">฿{Number(s.initialInvestment).toLocaleString()}</td>
                        <td className={`p-3 font-bold ${s.npv > 0 ? "text-emerald-600" : "text-rose-600"}`}>฿{s.npv.toLocaleString()}</td>
                        <td className="p-3 font-semibold">{s.irr}%</td>
                        <td className="p-3 text-slate-400">{s.date}</td>
                        <td className="p-3 text-center flex items-center justify-center gap-2">
                          <button onClick={() => loadScenario(s)} className="text-blue-600 bg-blue-50 border border-blue-100 px-2 py-1 rounded flex items-center gap-0.5 hover:bg-blue-100">
                            <FolderOpen className="w-3 h-3" /> Load
                          </button>
                          <button onClick={() => deleteScenario(s.id)} className="text-rose-600 bg-rose-50 border border-rose-100 px-2 py-1 rounded flex items-center gap-0.5 hover:bg-rose-100">
                            <Trash2 className="w-3 h-3" /> Delete
                          </button>
                        </td>
                        <td className="p-3 pl-6">
                          <input 
                            type="checkbox" 
                            checked={selectedIds.includes(s.id)} 
                            onChange={() => toggleSelection(s.id)}
                            className="mr-3 accent-slate-900"
                          />
                          <span className="font-bold text-slate-900">{s.name}</span>
                        </td>
                      </tr>
                    ))
                    
                  ) : (
                    <tr>
                      <td colSpan={6} className="p-6 text-center text-slate-400">No saved scenarios found. Save your first scenario in the Workspace.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
            </div>
                {selectedIds.length > 0 && (
                <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm mt-6">
                  <div className="mb-6">
                    <h3 className="text-lg font-bold text-slate-900">Project Benchmarking</h3>
                    <p className="text-xs text-slate-500">Side-by-side comparison of selected scenarios</p>
                  </div>
                  <div className="w-full h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={scenarios.filter(s => selectedIds.includes(s.id))} margin={{ top: 20, right: 20, left: 0, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                        <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12, fontWeight: 600}} dy={10} />
                        <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 11, fontWeight: 600}} tickFormatter={(val) => `฿${val/1000}k`} />
                        <Tooltip 
                          cursor={{fill: '#f1f5f9'}}
                          contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                          formatter={(value: any) => `฿${Number(value).toLocaleString()}`}
                        />
                        <Legend iconType="circle" wrapperStyle={{ fontSize: '12px', fontWeight: 600, paddingTop: '10px' }} />
                        <Bar dataKey="npv" name="NPV (THB)" fill="#3b82f6" radius={[4, 4, 0, 0]} barSize={50} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              )}
        </div>
      </div>
    </div>
  );
}