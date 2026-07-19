import React, { useState, useEffect } from 'react';
import { API_BASE } from '../config/api';
import { TrendingUp, Printer, Sparkles } from 'lucide-react';
import { ThreeDTilt } from '../components/ThreeDTilt';
import { ThreeDConstellation } from '../components/ThreeDConstellation';

interface WatchtowerData {
  rapidly_deteriorating: any[];
  hotspots: string[];
  weekly_brief: {
    title: string;
    date: string;
    emerging_risks: string[];
    newly_detected_trends: string[];
    high_attention_regions: string[];
    recommended_investigations: string[];
    preventive_actions: string[];
  };
  defect_clusters: any[];
  preventive_inspections: any[];
}

interface BudgetData {
  total_budget: number;
  backlog_cost: number;
  remaining_budget: number;
  mitigation_percentage: number;
  schedule: any[];
  deferred_impact: string;
}

interface SeasonalData {
  risk_calendar: any[];
  weather_correlations: any[];
  preventive_inspections: any[];
  recommendations: string[];
}

interface PortfolioData {
  portfolios: any[];
  insights: string;
}

export const Watchtower: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'watchtower' | 'budget' | 'seasonal' | 'portfolio' | 'executive'>('watchtower');
  const [watchtowerData, setWatchtowerData] = useState<WatchtowerData | null>(null);
  const [budgetLimit, setBudgetLimit] = useState<number>(500000);
  const [budgetData, setBudgetData] = useState<BudgetData | null>(null);
  const [seasonalData, setSeasonalData] = useState<SeasonalData | null>(null);
  const [portfolioData, setPortfolioData] = useState<PortfolioData | null>(null);
  const [execReport, setExecReport] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const fetchBudget = () => {
    fetch(`${API_BASE}/api/enterprise/budget-optimize`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ budget: budgetLimit })
    })
      .then(res => res.json())
      .then(setBudgetData)
      .catch(err => console.error(err));
  };

  useEffect(() => {
    setLoading(true);
    Promise.all([
      fetch(`${API_BASE}/api/enterprise/watchtower`).then(r => r.json()),
      fetch(`${API_BASE}/api/enterprise/seasonal-risk`).then(r => r.json()),
      fetch(`${API_BASE}/api/enterprise/portfolio-compare`).then(r => r.json()),
      fetch(`${API_BASE}/api/enterprise/executive-report`).then(r => r.json())
    ]).then(([w, s, p, e]) => {
      setWatchtowerData(w);
      setSeasonalData(s);
      setPortfolioData(p);
      setExecReport(e);
      setLoading(false);
    });
  }, []);

  useEffect(() => {
    fetchBudget();
  }, [budgetLimit]);

  if (loading || !watchtowerData) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center space-y-4">
        <div className="w-12 h-12 border-4 border-brand-primary border-t-transparent rounded-full animate-spin" />
        <span className="text-sm font-mono text-dark-muted">Synchronizing Watchtower feeds...</span>
      </div>
    );
  }

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="min-h-screen p-6 relative">
      <ThreeDConstellation />
      <div className="max-w-7xl mx-auto space-y-6 relative z-10">
        
        {/* Header */}
        <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-black text-white flex items-center space-x-2">
              <TrendingUp className="w-8 h-8 text-brand-primary animate-pulse" />
              <span>AI WATCHTOWER</span>
            </h1>
            <p className="text-sm text-dark-muted">Continuous structural anomalies tracking & macro risk coordination.</p>
          </div>

          {/* Navigation sub-tabs */}
          <div className="flex flex-wrap gap-2 border border-dark-border bg-dark-card p-1.5 rounded-xl text-xs font-bold uppercase font-mono">
            <button
              onClick={() => setActiveTab('watchtower')}
              className={`py-1.5 px-3 rounded transition-all ${activeTab === 'watchtower' ? 'bg-brand-primary text-white font-bold' : 'text-dark-muted hover:text-white'}`}
            >
              Watchtower Brief
            </button>
            <button
              onClick={() => setActiveTab('budget')}
              className={`py-1.5 px-3 rounded transition-all ${activeTab === 'budget' ? 'bg-brand-primary text-white font-bold' : 'text-dark-muted hover:text-white'}`}
            >
              Budget Optimizer
            </button>
            <button
              onClick={() => setActiveTab('seasonal')}
              className={`py-1.5 px-3 rounded transition-all ${activeTab === 'seasonal' ? 'bg-brand-primary text-white font-bold' : 'text-dark-muted hover:text-white'}`}
            >
              Seasonal Risks
            </button>
            <button
              onClick={() => setActiveTab('portfolio')}
              className={`py-1.5 px-3 rounded transition-all ${activeTab === 'portfolio' ? 'bg-brand-primary text-white font-bold' : 'text-dark-muted hover:text-white'}`}
            >
              Portfolios Compare
            </button>
            <button
              onClick={() => setActiveTab('executive')}
              className={`py-1.5 px-3 rounded transition-all ${activeTab === 'executive' ? 'bg-brand-primary text-white font-bold' : 'text-dark-muted hover:text-white'}`}
            >
              Exec Export
            </button>
          </div>
        </header>

        {/* Tab 1: AI Watchtower Brief */}
        {activeTab === 'watchtower' && (
          <div className="space-y-6 text-xs animate-fade-in">
            
            {/* Rapidly Deteriorating Assets List */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              
              <div className="lg:col-span-8 glass-panel rounded-2xl p-6 shadow-glass space-y-4">
                <h3 className="text-lg font-bold text-gray-200">National Intelligence Brief</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 bg-dark-bg/60 border border-dark-border rounded-xl space-y-2">
                    <span className="text-[10px] text-brand-primary uppercase font-bold tracking-wider">Emerging Anomaly Patterns</span>
                    <ul className="space-y-2 text-gray-300 list-disc list-inside leading-relaxed">
                      {watchtowerData.weekly_brief.emerging_risks.map((r, i) => (
                        <li key={i}>{r}</li>
                      ))}
                    </ul>
                  </div>

                  <div className="p-4 bg-dark-bg/60 border border-dark-border rounded-xl space-y-2">
                    <span className="text-[10px] text-brand-warning uppercase font-bold tracking-wider">Newly Detected Trends</span>
                    <ul className="space-y-2 text-gray-300 list-disc list-inside leading-relaxed">
                      {watchtowerData.weekly_brief.newly_detected_trends.map((t, i) => (
                        <li key={i}>{t}</li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div className="p-4 bg-purple-950/10 border border-purple-500/20 rounded-xl flex items-start space-x-3">
                  <Sparkles className="w-5 h-5 text-purple-400 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold text-purple-300">Recommended Investigations</span>
                    <p className="text-purple-200 mt-1 leading-relaxed">
                      {watchtowerData.weekly_brief.recommended_investigations.join(" & ")}
                    </p>
                  </div>
                </div>
              </div>

              {/* Anomaly hotspots panel */}
              <div className="lg:col-span-4 glass-panel rounded-2xl p-6 shadow-glass flex flex-col justify-between space-y-4">
                <div>
                  <h4 className="font-display font-bold text-gray-200">High Risk Hotspots</h4>
                  <p className="text-[10px] text-dark-muted mt-0.5">High attention states & districts calculated this cycle.</p>
                </div>

                <div className="space-y-2.5">
                  {watchtowerData.weekly_brief.high_attention_regions.map((region, idx) => (
                    <div key={idx} className="flex justify-between items-center p-3 bg-dark-bg/60 border border-dark-border rounded-xl">
                      <span className="font-bold text-white">{region}</span>
                      <span className="bg-brand-danger/10 border border-brand-danger/25 text-brand-danger py-0.5 px-2 rounded-full font-bold text-[9px]">Critical</span>
                    </div>
                  ))}
                </div>

                <div className="p-3 bg-dark-bg/30 border border-dark-border rounded-xl space-y-2">
                  <span className="text-[9px] text-dark-muted uppercase font-bold">Defect Clusters Breakdown</span>
                  <div className="space-y-1.5">
                    {watchtowerData.defect_clusters.map((c, i) => (
                      <div key={i} className="flex justify-between items-center text-[10px] text-gray-300">
                        <span>{c.type}</span>
                        <span className="font-mono font-bold text-brand-primary">{c.percentage}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

            </div>

            {/* Rapidly deteriorating assets grid */}
            <section className="glass-panel p-6 rounded-2xl shadow-glass">
              <h3 className="font-display font-bold text-gray-200 mb-4">Deterioration Hotlist</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {watchtowerData.rapidly_deteriorating.map((asset) => (
                  <ThreeDTilt key={asset.id}>
                    <div className="p-4 bg-dark-bg/60 border border-dark-border rounded-xl flex flex-col justify-between h-40">
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="font-bold text-white text-sm truncate max-w-[150px]">{asset.name}</h4>
                          <span className="text-[10px] text-dark-muted uppercase font-bold">{asset.district}, {asset.state}</span>
                        </div>
                        <span className="text-[10px] bg-brand-danger/10 text-brand-danger py-0.5 px-2 rounded font-bold">{asset.risk}</span>
                      </div>

                      <div className="flex justify-between items-center border-t border-dark-border/40 pt-3 mt-3 text-[10px]">
                        <div>
                          <span className="text-dark-muted block">Deterioration Rate</span>
                          <span className="font-bold text-white font-mono">{asset.rate}</span>
                        </div>
                        <div className="text-right">
                          <span className="text-dark-muted block">Health index</span>
                          <span className="font-bold text-brand-primary font-mono">{asset.health}%</span>
                        </div>
                      </div>
                    </div>
                  </ThreeDTilt>
                ))}
              </div>
            </section>
          </div>
        )}

        {/* Tab 2: Budget Optimizer */}
        {activeTab === 'budget' && budgetData && (
          <div className="space-y-6 text-xs animate-fade-in">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              {/* Controller card (Left) */}
              <div className="glass-panel p-5 rounded-2xl space-y-4 flex flex-col justify-between h-full">
                <div className="space-y-2">
                  <h3 className="font-display font-bold text-gray-200">Budget Parameters</h3>
                  <p className="text-[10px] text-dark-muted leading-normal">
                    Adjust the slider to simulate maintenance priority allocations.
                  </p>
                </div>

                <div className="space-y-4 my-4">
                  <div className="space-y-1">
                    <div className="flex justify-between font-mono font-bold text-white">
                      <span>Available Budget</span>
                      <span>${budgetLimit.toLocaleString()}</span>
                    </div>
                    <input
                      type="range"
                      min={100000}
                      max={1500000}
                      step={50000}
                      value={budgetLimit}
                      onChange={(e) => setBudgetLimit(Number(e.target.value))}
                      className="w-full accent-brand-primary bg-dark-bg border border-dark-border h-2 rounded cursor-pointer"
                    />
                  </div>

                  <div className="space-y-2 p-3 bg-dark-bg/60 border border-dark-border rounded-xl">
                    <div className="flex justify-between items-center text-[10px]">
                      <span className="text-dark-muted">Backlog cost:</span>
                      <span className="font-mono text-white font-bold">${budgetData.backlog_cost.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between items-center text-[10px]">
                      <span className="text-dark-muted">Remaining surplus:</span>
                      <span className="font-mono text-white font-bold">${budgetData.remaining_budget.toLocaleString()}</span>
                    </div>
                  </div>
                </div>

                <div className="p-3.5 bg-brand-primary/5 border border-brand-primary/20 rounded-xl space-y-1">
                  <span className="text-[10px] text-brand-primary font-bold uppercase tracking-wider block">Risk Mitigation Score</span>
                  <span className="text-2xl font-black text-white">{budgetData.mitigation_percentage}%</span>
                </div>
              </div>

              {/* Deferred Impact and Schedule table */}
              <div className="lg:col-span-2 glass-panel p-5 rounded-2xl flex flex-col justify-between space-y-4">
                <div>
                  <h3 className="font-display font-bold text-gray-200">Allocation Schedule</h3>
                  <p className="text-brand-warning text-[10px] bg-brand-warning/5 border border-brand-warning/20 p-2.5 rounded-xl mt-2 leading-relaxed">
                    <strong>Deferred Impact:</strong> {budgetData.deferred_impact}
                  </p>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-[11px] border-collapse">
                    <thead>
                      <tr className="border-b border-dark-border text-[9px] text-dark-muted uppercase font-bold tracking-wider">
                        <th className="pb-2">Asset Name</th>
                        <th className="pb-2">Risk</th>
                        <th className="pb-2 text-right">Estimate Cost</th>
                        <th className="pb-2 text-center">Status</th>
                        <th className="pb-2">Deduction Reason</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-dark-border/40 text-gray-300">
                      {budgetData.schedule.map((s, i) => (
                        <tr key={i} className="hover:bg-dark-hover/10 transition-colors">
                          <td className="py-2.5 font-bold text-white">{s.name}</td>
                          <td className="py-2.5">
                            <span className={`px-2 py-0.5 rounded text-[9px] font-bold ${
                              s.risk === 'Critical' ? 'bg-brand-danger/10 text-brand-danger' : 'bg-brand-warning/10 text-brand-warning'
                            }`}>{s.risk}</span>
                          </td>
                          <td className="py-2.5 text-right font-mono">${s.cost.toLocaleString()}</td>
                          <td className="py-2.5 text-center">
                            <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase ${
                              s.status === 'Allocated' ? 'bg-brand-success/15 text-brand-success' : 'bg-dark-muted/20 text-dark-muted'
                            }`}>{s.status}</span>
                          </td>
                          <td className="py-2.5 text-dark-muted truncate max-w-xs">{s.reason}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

            </div>
          </div>
        )}

        {/* Tab 3: Seasonal Risk calendar */}
        {activeTab === 'seasonal' && seasonalData && (
          <div className="space-y-6 text-xs animate-fade-in">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              
              {/* Calendar list */}
              <div className="lg:col-span-8 glass-panel p-5 rounded-2xl space-y-4">
                <h3 className="font-display font-bold text-gray-200">Seasonal Risk Calendar</h3>
                
                <div className="space-y-3">
                  {seasonalData.risk_calendar.map((cal, i) => (
                    <div key={i} className="flex justify-between items-center p-3.5 bg-dark-bg/60 border border-dark-border rounded-xl">
                      <div className="flex items-center space-x-3">
                        <span className="text-base font-black text-brand-primary w-8 uppercase font-mono">{cal.month}</span>
                        <div>
                          <span className="font-bold text-white block">{cal.event}</span>
                          <span className="text-[10px] text-dark-muted">Expected affected: {cal.assets_affected} twins</span>
                        </div>
                      </div>

                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                        cal.level === 'Critical' ? 'bg-brand-danger/10 text-brand-danger' : 'bg-brand-warning/10 text-brand-warning'
                      }`}>{cal.level}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Weather correlation parameters */}
              <div className="lg:col-span-4 glass-panel p-5 rounded-2xl flex flex-col justify-between space-y-6">
                <div>
                  <h3 className="font-display font-bold text-gray-200">Weather Correlations</h3>
                  <p className="text-[10px] text-dark-muted mt-1">Correlation statistics compiled against digital twin histories.</p>
                </div>

                <div className="space-y-4 my-2">
                  {seasonalData.weather_correlations.map((w, i) => (
                    <div key={i} className="p-3 bg-dark-bg/60 border border-dark-border rounded-xl space-y-1">
                      <div className="flex justify-between items-center text-[10px] font-mono">
                        <span className="font-bold text-white truncate max-w-[160px]">{w.parameter}</span>
                        <span className="text-brand-primary font-bold">r = {w.correlation_coefficient}</span>
                      </div>
                      <p className="text-dark-muted text-[10px] leading-relaxed">{w.description}</p>
                    </div>
                  ))}
                </div>

                <div className="p-3.5 bg-purple-950/20 border border-purple-500/20 rounded-xl space-y-1.5">
                  <span className="text-[10px] text-purple-300 font-bold uppercase block">AI Seasonal Recommendations</span>
                  <ul className="space-y-1 list-disc list-inside text-purple-200">
                    {seasonalData.recommendations.map((rec, i) => (
                      <li key={i}>{rec}</li>
                    ))}
                  </ul>
                </div>
              </div>

            </div>
          </div>
        )}

        {/* Tab 4: Portfolio Comparer */}
        {activeTab === 'portfolio' && portfolioData && (
          <div className="space-y-6 text-xs animate-fade-in">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {portfolioData.portfolios.map((port, i) => (
                <div key={i} className="glass-panel p-6 rounded-2xl space-y-4">
                  <h3 className="font-display font-bold text-base text-white border-b border-dark-border pb-2.5">{port.name}</h3>
                  
                  <div className="grid grid-cols-2 gap-4 text-xs font-mono">
                    <div className="p-3 bg-dark-bg/60 border border-dark-border rounded-xl">
                      <span className="text-[9px] text-dark-muted uppercase font-bold block">Avg Health score</span>
                      <span className="text-lg font-black text-white block mt-0.5">{port.health}%</span>
                    </div>
                    <div className="p-3 bg-dark-bg/60 border border-dark-border rounded-xl">
                      <span className="text-[9px] text-dark-muted uppercase font-bold block">Risk Trend</span>
                      <span className="text-sm font-bold text-brand-primary block mt-1">{port.risk_trend}</span>
                    </div>
                    <div className="p-3 bg-dark-bg/60 border border-dark-border rounded-xl">
                      <span className="text-[9px] text-dark-muted uppercase font-bold block">Efficiency Index</span>
                      <span className="text-lg font-bold text-white block mt-0.5">{port.maintenance_efficiency}</span>
                    </div>
                    <div className="p-3 bg-dark-bg/60 border border-dark-border rounded-xl">
                      <span className="text-[9px] text-dark-muted uppercase font-bold block">Coverage Index</span>
                      <span className="text-lg font-bold text-white block mt-0.5">{port.coverage}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <section className="glass-panel p-5 rounded-2xl border border-purple-500/20 bg-purple-950/5">
              <span className="text-[10px] text-purple-300 font-bold uppercase tracking-wider block">AI Comparative Insights</span>
              <p className="text-purple-200 mt-1 leading-relaxed leading-normal">{portfolioData.insights}</p>
            </section>
          </div>
        )}

        {/* Tab 5: Executive Report Export */}
        {activeTab === 'executive' && execReport && (
          <div className="glass-panel p-6 rounded-2xl space-y-4 animate-fade-in max-w-3xl mx-auto">
            <div className="flex justify-between items-center border-b border-dark-border pb-3">
              <h3 className="font-display font-bold text-gray-200">Executive Report Container</h3>
              <div className="flex gap-2">
                <button 
                  onClick={handlePrint}
                  className="bg-brand-primary hover:bg-brand-primary/80 text-white font-bold py-1.5 px-3 rounded text-[10px] uppercase font-mono flex items-center space-x-1"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Print Report</span>
                </button>
              </div>
            </div>

            <div className="bg-dark-bg/60 border border-dark-border p-6 rounded-xl font-sans text-xs text-gray-300 space-y-4 printable-section">
              <h1 className="text-lg font-bold text-white border-b border-dark-border/40 pb-2">PRAHARI AI WEEKLY INTELLIGENCE REPORT</h1>
              <p className="text-dark-muted text-[10px] font-mono">Date: {new Date().toLocaleDateString()}</p>
              
              <div className="space-y-3">
                <h3 className="font-bold text-gray-200">1. National Telemetry Indexes</h3>
                <p>National Health average index: <strong>{execReport.healthy_score}%</strong>. Total assets listed at Critical state: <strong>{execReport.critical_assets_count}</strong>.</p>
              </div>

              <div className="space-y-2">
                <h3 className="font-bold text-gray-200">2. Active Intervention Targets</h3>
                <ul className="list-disc list-inside space-y-1">
                  <li>Varanasi Ganga Bridge bypass columns: Carbon wrapping recommended ($250,000 estimate).</li>
                  <li>Delhi Executive Plaza column: Steel joints collar replacement ($120,000 estimate).</li>
                </ul>
              </div>

              <p className="text-purple-300 text-[10px] italic border-t border-dark-border/40 pt-3">
                Report generated automatically via coordinator multi-agent decision matrices.
              </p>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
