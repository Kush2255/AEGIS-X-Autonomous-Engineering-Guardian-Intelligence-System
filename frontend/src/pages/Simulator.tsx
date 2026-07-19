import React, { useState, useEffect } from 'react';
import { API_BASE } from '../config/api';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, Legend } from 'recharts';
import { ArrowLeft, DollarSign, BookOpen, Clock, Activity } from 'lucide-react';
import type { Asset, Simulation } from '../types';
import { ThreeDConstellation } from '../components/ThreeDConstellation';
import { ThreeDTilt } from '../components/ThreeDTilt';

interface SimulatorProps {
  onBack: () => void;
  selectedAssetId?: string;
}

export const Simulator: React.FC<SimulatorProps> = ({ onBack, selectedAssetId }) => {
  const [assets, setAssets] = useState<Asset[]>([]);
  const [selectedAsset, setSelectedAsset] = useState<Asset | null>(null);
  const [simulations, setSimulations] = useState<Simulation[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch assets list
  useEffect(() => {
    fetch(`${API_BASE}/api/assets`)
      .then(res => res.json())
      .then(data => {
        setAssets(data);
        if (data.length > 0) {
          // If a selected asset is passed from parent, use it, else default to first asset
          const defaultAsset = selectedAssetId 
            ? data.find((a: Asset) => a.id === selectedAssetId) || data[0]
            : data[0];
          setSelectedAsset(defaultAsset);
        }
        setLoading(false);
      })
      .catch(err => {
        console.error('Error fetching assets for simulator:', err);
        setLoading(false);
      });
  }, [selectedAssetId]);

  // Fetch simulations for selected asset
  useEffect(() => {
    if (!selectedAsset) return;

    // We fetch the latest completed inspection's simulations
    fetch(`${API_BASE}/api/assets/${selectedAsset.id}`)
      .then(res => res.json())
      .then(data => {
        if (data.inspections && data.inspections.length > 0) {
          const latestInspection = data.inspections.sort((a: any, b: any) => 
            new Date(b.inspection_date).getTime() - new Date(a.inspection_date).getTime()
          )[0];
          
          // Get simulations for this inspection
          fetch(`${API_BASE}/api/inspections/${latestInspection.id}`)
            .then(res => res.json())
            .then(insData => {
              setSimulations(insData.simulations || []);
            });
        } else {
          setSimulations([]);
        }
      })
      .catch(err => console.error('Error fetching simulations:', err));
  }, [selectedAsset]);

  const handleAssetChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const asset = assets.find(a => a.id === e.target.value);
    if (asset) setSelectedAsset(asset);
  };

  // Map simulation scenarios for chart plotting
  const chartData = [
    { name: 'Current State', health: selectedAsset?.current_health_score || 100 },
    ...simulations.map(sim => ({
      name: sim.scenario_name,
      health: sim.projected_health,
      cost: sim.estimated_repair_cost / 1000 // In thousands
    }))
  ];

  const getRiskBadgeColor = (risk: string) => {
    switch (risk) {
      case 'Critical': return 'bg-brand-danger/10 border border-brand-danger/30 text-brand-danger';
      case 'Warning': return 'bg-brand-warning/10 border border-brand-warning/30 text-brand-warning';
      case 'Monitor': return 'bg-yellow-400/10 border border-yellow-400/30 text-yellow-400';
      default: return 'bg-brand-success/10 border border-brand-success/30 text-brand-success';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center space-y-4">
        <div className="w-12 h-12 border-4 border-brand-primary border-t-transparent rounded-full animate-spin" />
        <span className="text-sm font-mono text-dark-muted">Aligning simulator matrices...</span>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-6 relative">
      <ThreeDConstellation />
      <div className="max-w-7xl mx-auto space-y-6 relative z-10">
        
        {/* Navigation header */}
        <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center space-x-4">
            <button 
              onClick={onBack}
              className="flex items-center space-x-2 text-dark-muted hover:text-white transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="text-xs font-semibold uppercase tracking-wider">Back</span>
            </button>
            <h1 className="text-2xl font-black text-white flex items-center space-x-2">
              <Activity className="w-6 h-6 text-brand-primary animate-pulse" />
              <span>DIGITAL TWIN SIMULATOR</span>
            </h1>
          </div>

          {/* Select asset dropdown */}
          {selectedAsset && (
            <div className="flex items-center space-x-2">
              <span className="text-xs text-dark-muted font-bold uppercase tracking-wider">Focus Target:</span>
              <select
                value={selectedAsset.id}
                onChange={handleAssetChange}
                className="bg-dark-card border border-dark-border text-gray-200 text-xs font-bold py-1.5 px-3 rounded focus:outline-none focus:border-brand-primary"
              >
                {assets.map(a => (
                  <option key={a.id} value={a.id}>{a.name}</option>
                ))}
              </select>
            </div>
          )}
        </header>

        {/* Selected Asset Telemetry Banner */}
        {selectedAsset && (
          <div className="glass-panel p-4 rounded-xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 text-xs">
            <div className="space-y-1">
              <span className="text-[10px] text-dark-muted uppercase font-bold tracking-wider">Target Profile</span>
              <h2 className="text-base font-bold text-white">{selectedAsset.name} &bull; <span className="text-brand-primary">{selectedAsset.type}</span></h2>
            </div>
            
            <div className="flex items-center space-x-6">
              <div>
                <span className="text-[10px] text-dark-muted uppercase font-bold tracking-wider block">Telemetry Health</span>
                <span className="text-sm font-bold text-white">{selectedAsset.current_health_score}%</span>
              </div>
              <div>
                <span className="text-[10px] text-dark-muted uppercase font-bold tracking-wider block">Risk Rating</span>
                <span className={`text-[10px] font-bold py-0.5 px-2 rounded block mt-0.5 ${getRiskBadgeColor(selectedAsset.risk_level)}`}>
                  {selectedAsset.risk_level}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Simulation Chart */}
        {simulations.length > 0 ? (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            {/* Chart (Left Panel) */}
            <ThreeDTilt className="lg:col-span-7">
              <div className="glass-panel rounded-2xl p-6 shadow-glass flex flex-col justify-between h-full">
              <div>
                <h3 className="font-display font-bold text-gray-200">Deterioration Curve & Repair Budget</h3>
                <p className="text-xs text-dark-muted mb-4 font-sans">Simulating impact on structural health score (%) and repair cost ($ in thousands).</p>
              </div>

              <div className="h-72 w-full mt-2">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                    <XAxis dataKey="name" stroke="#9ca3af" fontSize={8} tickLine={false} />
                    <YAxis yAxisId="left" stroke="#3b82f6" fontSize={10} domain={[0, 100]} label={{ value: 'Health %', angle: -90, position: 'insideLeft', fill: '#3b82f6', offset: 10, style: {fontSize: 10} }} tickLine={false} />
                    <YAxis yAxisId="right" orientation="right" stroke="#ef4444" fontSize={10} label={{ value: 'Cost ($k)', angle: 90, position: 'insideRight', fill: '#ef4444', offset: 10, style: {fontSize: 10} }} tickLine={false} />
                    <Tooltip contentStyle={{ backgroundColor: 'rgba(13, 20, 35, 0.95)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '8px' }} />
                    <Legend verticalAlign="top" height={36} iconSize={10} style={{ fontSize: 10 }} />
                    <Line yAxisId="left" type="monotone" dataKey="health" name="Projected Health (%)" stroke="#3b82f6" strokeWidth={3} activeDot={{ r: 8 }} />
                    <Line yAxisId="right" type="monotone" dataKey="cost" name="Projected Repair Cost ($k)" stroke="#ef4444" strokeWidth={2} strokeDasharray="5 5" />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          </ThreeDTilt>

            {/* Analysis card (Right Panel) */}
            <ThreeDTilt className="lg:col-span-5">
              <div className="glass-panel rounded-2xl p-6 shadow-glass flex flex-col justify-between h-full">
              <div>
                <span className="text-[10px] text-brand-primary uppercase font-bold tracking-wider">Explainable AI Core</span>
                <h3 className="font-display font-bold text-gray-200 mt-0.5">Simulation Assumptions</h3>
                <p className="text-xs text-dark-muted mt-1 leading-relaxed">
                  These scenario paths model structural dynamics and stress distributions, referencing active regulations. They communicate risk indices rather than exact structural metrics.
                </p>
              </div>

              <div className="bg-dark-bg/60 border border-dark-border rounded-xl p-4 space-y-3.5 text-xs">
                <div className="flex items-start space-x-3">
                  <Clock className="w-5 h-5 text-brand-primary shrink-0 mt-0.5" />
                  <div>
                    <span className="font-semibold text-gray-200 block">Deterioration Rate Accelerations</span>
                    <p className="text-dark-muted text-[11px] mt-0.5 leading-relaxed">Postponing structural grouting allows moisture and oxygen to saturate internal steel rebar matrixes, causing rust volume expansion and peeling cover concrete.</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3">
                  <DollarSign className="w-5 h-5 text-brand-success shrink-0 mt-0.5" />
                  <div>
                    <span className="font-semibold text-gray-200 block">Compounding Reparation Costs</span>
                    <p className="text-dark-muted text-[11px] mt-0.5 leading-relaxed">Delays convert standard superficial patching into complex structural reconstruction, requiring hydraulic girder lifting, shoring columns, and speed closures, increasing cost 4-5x.</p>
                  </div>
                </div>
              </div>
              </div>
            </ThreeDTilt>
          </div>
        ) : (
          <div className="glass-panel rounded-2xl p-10 text-center text-dark-muted text-sm shadow-glass">
            No simulation data has been compiled for this asset. Upload a new inspection report to trigger multi-agent simulation routines.
          </div>
        )}

        {/* Side-by-Side Comparative Cards */}
        {simulations.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            {simulations.map((sim, idx) => (
              <ThreeDTilt key={idx}>
                <div 
                  className={`glass-panel p-5 rounded-2xl flex flex-col justify-between space-y-4 h-full ${
                    sim.projected_risk === 'Critical' ? 'glow-critical' :
                    sim.projected_risk === 'Warning' ? 'glow-warning' :
                    sim.projected_risk === 'Monitor' ? 'glow-monitor' : 'glow-success'
                  }`}
                >
                <div className="space-y-2">
                  <div className="text-xs font-black uppercase text-gray-200 tracking-wider flex items-center justify-between">
                    <span>{sim.scenario_name}</span>
                  </div>
                  
                  <div className="flex items-baseline space-x-1.5 pt-1">
                    <span className="text-2xl font-black text-white">{sim.projected_health}%</span>
                    <span className="text-[10px] text-dark-muted">health</span>
                  </div>

                  <span className={`inline-block text-[9px] font-bold py-0.5 px-2 rounded ${getRiskBadgeColor(sim.projected_risk)}`}>
                    {sim.projected_risk} Risk
                  </span>
                </div>

                <div className="space-y-3 pt-3 border-t border-dark-border">
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-dark-muted">Est. Cost:</span>
                    <span className="font-bold text-white font-mono">${sim.estimated_repair_cost.toLocaleString()}</span>
                  </div>
                  
                  {sim.code_reference && (
                    <div className="bg-purple-950/20 border border-purple-500/20 text-purple-300 py-1 px-2 rounded flex items-start space-x-1">
                      <BookOpen className="w-3 h-3 text-purple-400 shrink-0 mt-0.5" />
                      <span className="text-[9px] font-semibold font-mono tracking-tight leading-tight line-clamp-1">{sim.code_reference}</span>
                    </div>
                  )}

                  <p className="text-[10px] text-dark-muted leading-relaxed line-clamp-4">{sim.logic_explanation}</p>
                </div>
                </div>
              </ThreeDTilt>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
