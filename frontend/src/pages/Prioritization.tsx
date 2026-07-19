import React, { useState, useEffect } from 'react';
import { Brain } from 'lucide-react';
import { ThreeDTilt } from '../components/ThreeDTilt';
import { ThreeDConstellation } from '../components/ThreeDConstellation';

interface PrioritizedAsset {
  id: string;
  name: string;
  type: string;
  health: number;
  risk: string;
  priority_score: number;
  asset_age: number;
  traffic_pcu: number;
  population_exposure: number;
  weather_impact: number;
  ai_confidence: number;
  logic_reasoning: string;
}

interface PrioritizationData {
  top_10_critical_assets: PrioritizedAsset[];
  top_50_maintenance_priorities: PrioritizedAsset[];
  highest_risk_states: any[];
  highest_risk_districts: any[];
}

export const Prioritization: React.FC = () => {
  const [data, setData] = useState<PrioritizationData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('http://localhost:8000/api/enterprise/prioritization')
      .then(res => res.json())
      .then(resData => {
        setData(resData);
        setLoading(false);
      })
      .catch(err => {
        console.error('Error fetching prioritization data:', err);
        setLoading(false);
      });
  }, []);

  if (loading || !data) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center space-y-4">
        <div className="w-12 h-12 border-4 border-brand-primary border-t-transparent rounded-full animate-spin" />
        <span className="text-sm font-mono text-dark-muted">Compiling priority queue mappings...</span>
      </div>
    );
  }

  const getRiskBadgeColor = (risk: string) => {
    switch (risk) {
      case 'Critical': return 'bg-brand-danger/15 border border-brand-danger/35 text-brand-danger';
      case 'Warning': return 'bg-brand-warning/15 border border-brand-warning/35 text-brand-warning';
      case 'Monitor': return 'bg-yellow-400/15 border border-yellow-400/35 text-yellow-400';
      default: return 'bg-brand-success/15 border border-brand-success/35 text-brand-success';
    }
  };

  return (
    <div className="min-h-screen p-6 relative">
      <ThreeDConstellation />
      <div className="max-w-7xl mx-auto space-y-6 relative z-10">
        
        {/* Header */}
        <header>
          <h1 className="text-3xl font-black tracking-tight text-white flex items-center space-x-2">
            <Brain className="w-8 h-8 text-brand-primary animate-pulse" />
            <span>AI ASSET PRIORITIZATION ENGINE</span>
          </h1>
          <p className="text-sm text-dark-muted">
            Prioritizes maintenance backlog by cross-checking structural safety ratios against public population matrices.
          </p>
        </header>

        {/* Top 10 Critical Assets Carousel/List */}
        <section className="space-y-4">
          <h2 className="text-lg font-black text-gray-200">Top Priority Interventions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {data.top_10_critical_assets.slice(0, 4).map((asset, idx) => (
              <ThreeDTilt key={asset.id}>
                <div className="glass-panel p-5 rounded-2xl flex flex-col justify-between space-y-4 h-full border-l-4 border-brand-danger glow-critical">
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="text-[9px] font-mono text-brand-primary uppercase">Rank #0{idx+1} &bull; Priority Score {asset.priority_score}%</span>
                      <h3 className="font-display font-bold text-base text-white mt-0.5">{asset.name}</h3>
                      <p className="text-[10px] text-dark-muted font-mono">{asset.type} &bull; Age {asset.asset_age} Yrs</p>
                    </div>

                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${getRiskBadgeColor(asset.risk)}`}>
                      {asset.risk} ({asset.health}%)
                    </span>
                  </div>

                  {/* Weights parameters */}
                  <div className="grid grid-cols-4 gap-2 text-center text-[10px] bg-dark-bg/60 border border-dark-border p-2.5 rounded-xl font-mono text-gray-300">
                    <div>
                      <span className="text-[8px] text-dark-muted block uppercase">Traffic</span>
                      <span className="font-bold">{asset.traffic_pcu}</span>
                    </div>
                    <div>
                      <span className="text-[8px] text-dark-muted block uppercase">Population</span>
                      <span className="font-bold">{asset.population_exposure}</span>
                    </div>
                    <div>
                      <span className="text-[8px] text-dark-muted block uppercase">Weather</span>
                      <span className="font-bold">{asset.weather_impact}</span>
                    </div>
                    <div>
                      <span className="text-[8px] text-dark-muted block uppercase">Confidence</span>
                      <span className="font-bold text-brand-primary">{asset.ai_confidence}%</span>
                    </div>
                  </div>

                  {/* Reasoning explainability */}
                  <p className="text-xs text-dark-muted leading-relaxed font-sans bg-dark-bg/25 border-t border-dark-border pt-2.5">
                    <strong>AI Deduction:</strong> {asset.logic_reasoning}
                  </p>
                </div>
              </ThreeDTilt>
            ))}
          </div>
        </section>

        {/* Master prioritization backlog table */}
        <section className="glass-panel rounded-2xl p-6 shadow-glass">
          <div>
            <h3 className="font-display font-bold text-lg text-gray-200">Telangana Pilot Priority Queue Log</h3>
            <p className="text-xs text-dark-muted mb-4">Ranked master queue compiled from active Telangana digital twin logs.</p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-dark-border text-[9px] text-dark-muted uppercase font-bold tracking-wider">
                  <th className="pb-2">Rk</th>
                  <th className="pb-2">Asset Name</th>
                  <th className="pb-2">Category</th>
                  <th className="pb-2 text-right">Age</th>
                  <th className="pb-2 text-right">Health Index</th>
                  <th className="pb-2 text-right font-mono text-brand-primary">Priority Index</th>
                  <th className="pb-2">Explanation</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-dark-border/40 text-gray-300">
                {data.top_50_maintenance_priorities.map((a, idx) => (
                  <tr key={a.id} className="hover:bg-dark-hover/10 transition-colors">
                    <td className="py-3 font-mono font-bold text-brand-primary">{idx + 1}</td>
                    <td className="py-3 font-semibold text-white">{a.name}</td>
                    <td className="py-3 text-dark-muted">{a.type}</td>
                    <td className="py-3 text-right font-mono">{a.asset_age} yr</td>
                    <td className="py-3 text-right font-mono font-semibold">{a.health}%</td>
                    <td className="py-3 text-right font-mono font-bold text-brand-primary">{a.priority_score}%</td>
                    <td className="py-3 text-dark-muted max-w-sm truncate">{a.logic_reasoning}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

      </div>
    </div>
  );
};
