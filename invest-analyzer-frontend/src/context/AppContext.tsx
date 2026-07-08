"use client";
import { createContext, useContext, useState, useEffect, ReactNode } from "react";

// Input data structure for scenarios
interface Scenario {
  id: string;
  name: string;
  npv: number;
  irr: string;
  initialInvestment: string;
  discountRate: string;
  date: string;
}

interface AppContextType {
  file: File | null;
  setFile: (file: File | null) => void;
  initialInvestment: string;
  setInitialInvestment: (value: string) => void;
  discountRate: string;
  setDiscountRate: (value: string) => void;
  loading: boolean;
  setLoading: (value: boolean) => void;
  results: any;
  setResults: (value: any) => void;
  error: string;
  setError: (value: string) => void;
  scenarios: Scenario[];
  saveScenario: (name: string) => void;
  deleteScenario: (id: string) => void;
  loadScenario: (scenario: Scenario) => void;
  selectedIds: string[];
  toggleSelection: (id: string) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const [file, setFile] = useState<File | null>(null);
  const [initialInvestment, setInitialInvestment] = useState("100000");
  const [discountRate, setDiscountRate] = useState("0.10");
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<any>(null);
  const [error, setError] = useState("");
  const [scenarios, setScenarios] = useState<Scenario[]>([]);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const toggleSelection = (id: string) => {
    setSelectedIds(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  // Load scenarios from localStorage 
  useEffect(() => {
    const saved = localStorage.getItem("invest_scenarios");
    if (saved) {
      setScenarios(JSON.parse(saved));
    }
  }, []);

  // function to save a new scenario to the list and localStorage
  const saveScenario = (name: string) => {
    if (!results) return;
    const newScenario: Scenario = {
      id: Date.now().toString(),
      name,
      npv: results.npv,
      irr: results.irr,
      initialInvestment,
      discountRate,
      date: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    const updated = [newScenario, ...scenarios];
    setScenarios(updated);
    localStorage.setItem("invest_scenarios", JSON.stringify(updated));
  };

  // function to delete a scenario by its ID
  const deleteScenario = (id: string) => {
    const updated = scenarios.filter(s => s.id !== id);
    setScenarios(updated);
    localStorage.setItem("invest_scenarios", JSON.stringify(updated));
  };

  // Function to load a scenario into the current state
  const loadScenario = (scenario: Scenario) => {
    setInitialInvestment(scenario.initialInvestment);
    setDiscountRate(scenario.discountRate);
    setResults({
      npv: scenario.npv,
      irr: scenario.irr,
      cash_flows_preview: results?.cash_flows_preview || [30000, 40000, 40000, 30000, 20000],
      filename: "Restored Model",
      data_preview: results?.data_preview
    });
  };

  return (
    <AppContext.Provider value={{
      file, setFile,
      initialInvestment, setInitialInvestment,
      discountRate, setDiscountRate,
      loading, setLoading,
      results, setResults,
      error, setError,
      scenarios, saveScenario, deleteScenario, loadScenario,
      selectedIds, toggleSelection
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error("useApp must be used within an AppProvider");
  }
  return context;
}