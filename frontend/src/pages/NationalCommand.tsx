import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import { ResponsiveContainer, XAxis, YAxis, Tooltip, LineChart, Line, CartesianGrid, Legend } from 'recharts';
import { Globe, Search, RefreshCw, BarChart3, TrendingUp } from 'lucide-react';
import { ThreeDTilt } from '../components/ThreeDTilt';
import { ThreeDConstellation } from '../components/ThreeDConstellation';

interface StateRanking {
  state: string;
  average_health: number;
  risk_level: string;
  asset_count: number;
}

interface DistrictRanking {
  district: string;
  state: string;
  average_health: number;
  risk_level: string;
  asset_count: number;
}

interface CommandCenterData {
  national_health_index: number;
  total_assets: number;
  pending_maintenance: number;
  healthy_count: number;
  critical_count: number;
  warning_count: number;
  monitor_count: number;
  state_rankings: StateRanking[];
  district_rankings: DistrictRanking[];
  health_trend: any[];
  monthly_risk_trend: any[];
  live_alerts: any[];
  assets_requiring_immediate_action: any[];
  heatmap_pins: any[];
  ai_prediction_summary: string;
}

export const NationalCommand: React.FC = () => {
  const [data, setData] = useState<CommandCenterData | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedState, setSelectedState] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [searching, setSearching] = useState(false);

  useEffect(() => {
    fetch('http://localhost:8000/api/enterprise/command-center')
      .then(res => res.json())
      .then(resData => {
        setData(resData);
        setLoading(false);
      })
      .catch(err => {
        console.error('Error fetching command center data:', err);
        setLoading(false);
      });
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    setSearching(true);
    fetch(`http://localhost:8000/api/enterprise/search?q=${encodeURIComponent(searchQuery)}`)
      .then(res => res.json())
      .then(resData => {
        setSearchResults(resData.results || []);
        setSearching(false);
      })
      .catch(err => {
        console.error('Error searching:', err);
        setSearching(false);
      });
  };

  if (loading || !data) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center space-y-4">
        <div className="w-12 h-12 border-4 border-brand-primary border-t-transparent rounded-full animate-spin" />
        <span className="text-sm font-mono text-dark-muted">Synchronizing National Infrastructure Command center...</span>
      </div>
    );
  }

  // Filter Pins for Drilldown
  const filteredPins = data.heatmap_pins.filter(pin => {
    if (selectedState === 'All') return true;
    return pin.address && pin.address.includes(selectedState);
  });



  const getRiskBadgeColor = (risk: string) => {
    switch (risk) {
      case 'Critical': return 'bg-brand-danger/15 border border-brand-danger/35 text-brand-danger';
      case 'Warning': return 'bg-brand-warning/15 border border-brand-warning/35 text-brand-warning';
      case 'Monitor': return 'bg-yellow-400/15 border border-yellow-400/35 text-yellow-400';
      default: return 'bg-brand-success/15 border border-brand-success/35 text-brand-success';
    }
  };

  const createCustomMarker = (riskLevel: string) => {
    const colorClass = 
      riskLevel === 'Critical' ? 'bg-brand-danger shadow-[0_0_12px_#ef4444]' : 
      riskLevel === 'Warning' ? 'bg-brand-warning shadow-[0_0_12px_#f59e0b]' : 
      riskLevel === 'Monitor' ? 'bg-yellow-400 shadow-[0_0_12px_#facc15]' : 
      'bg-brand-success shadow-[0_0_12px_#10b981]';
      
    return L.divIcon({
      className: 'custom-div-icon',
      html: `
        <div class="relative flex items-center justify-center w-6 h-6">
          <span class="animate-ping absolute inline-flex h-full w-full rounded-full ${colorClass} opacity-60"></span>
          <span class="relative inline-flex rounded-full h-3.5 w-3.5 ${colorClass} border border-white"></span>
        </div>`,
      iconSize: [24, 24],
      iconAnchor: [12, 12]
    });
  };

  return (
    <div className="min-h-screen p-6 relative">
      <ThreeDConstellation />
      <div className="max-w-7xl mx-auto space-y-6 relative z-10">
        
        {/* Header */}
        <header className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-black tracking-tight text-white flex items-center space-x-2">
              <Globe className="w-8 h-8 text-brand-primary animate-spin" style={{ animationDuration: '8s' }} />
              <span>TELANGANA COMMAND CENTER (PILOT)</span>
            </h1>
            <p className="text-sm text-dark-muted">Telangana Multi-Agent Infrastructure Health Deck & Geospatial Analytics. Built for nationwide deployment, validated through a Telangana pilot.</p>
          </div>

          {/* Drilldown Selectors */}
          <div className="flex flex-wrap items-center gap-3 bg-dark-card border border-dark-border p-2 rounded-xl">
            <div className="flex items-center space-x-2">
              <span className="text-[10px] uppercase font-bold text-dark-muted">District:</span>
              <select
                value={selectedState}
                onChange={(e) => {
                  setSelectedState(e.target.value);
                }}
                className="bg-dark-bg border border-dark-border text-xs font-bold p-1 px-3 rounded text-white"
              >
                <option value="All">All Districts</option>
                <option value="Hyderabad">Hyderabad</option>
                <option value="Nalgonda">Nalgonda</option>
                <option value="Siddipet">Siddipet</option>
              </select>
            </div>
          </div>
        </header>

        {/* NLP Search input */}
        <section className="glass-panel p-4 rounded-xl shadow-glass">
          <form onSubmit={handleSearch} className="flex gap-3">
            <div className="relative flex-1">
              <Search className="w-5 h-5 text-dark-muted absolute left-3 top-3" />
              <input
                type="text"
                placeholder="Ask Prahari search naturally... e.g. 'Show critical bridges in Hyderabad' or 'Show roads in Siddipet'"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-dark-bg border border-dark-border rounded-xl py-2.5 pl-10 pr-4 text-sm focus:outline-none focus:border-brand-primary text-gray-200"
              />
            </div>
            <button
              type="submit"
              disabled={searching}
              className="bg-brand-primary hover:bg-brand-primary/80 text-white font-bold py-2.5 px-6 rounded-xl transition-all duration-300 text-sm flex items-center space-x-2"
            >
              <RefreshCw className={`w-4 h-4 ${searching ? 'animate-spin' : ''}`} />
              <span>Query AI</span>
            </button>
          </form>

          {searchResults.length > 0 && (
            <div className="mt-4 p-4 bg-dark-bg/60 border border-dark-border rounded-xl space-y-2">
              <h4 className="text-xs font-mono text-brand-primary">AI Natural Language Filters Applied</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
                {searchResults.map((r, idx) => (
                  <div key={idx} className="p-3 bg-dark-card border border-dark-border rounded-lg flex items-center justify-between">
                    <div>
                      <div className="text-sm font-bold text-white">{r.name}</div>
                      <div className="text-[10px] text-dark-muted">{r.type} &bull; {r.address}</div>
                    </div>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${getRiskBadgeColor(r.risk)}`}>
                      {r.risk} ({r.health}%)
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </section>

        {/* National Health KPIs Grid */}
        <section className="grid grid-cols-2 lg:grid-cols-5 gap-4">
          <ThreeDTilt>
            <div className="glass-panel p-4 rounded-xl flex flex-col justify-between h-full border-t-2 border-brand-primary">
              <span className="text-[10px] uppercase font-bold tracking-wider text-dark-muted">National Health Index</span>
              <span className="text-4xl font-black mt-2 text-white">{data.national_health_index}%</span>
            </div>
          </ThreeDTilt>
          <ThreeDTilt>
            <div className="glass-panel p-4 rounded-xl flex flex-col justify-between h-full border-t-2 border-brand-danger">
              <span className="text-[10px] uppercase font-bold tracking-wider text-brand-danger">Immediate Action Queue</span>
              <span className="text-4xl font-black mt-2 text-brand-danger">{data.assets_requiring_immediate_action.length}</span>
            </div>
          </ThreeDTilt>
          <ThreeDTilt>
            <div className="glass-panel p-4 rounded-xl flex flex-col justify-between h-full border-t-2 border-brand-warning">
              <span className="text-[10px] uppercase font-bold tracking-wider text-brand-warning">Pending Maintenance</span>
              <span className="text-4xl font-black mt-2 text-brand-warning">{data.pending_maintenance}</span>
            </div>
          </ThreeDTilt>
          <ThreeDTilt>
            <div className="glass-panel p-4 rounded-xl flex flex-col justify-between h-full border-t-2 border-brand-success">
              <span className="text-[10px] uppercase font-bold tracking-wider text-brand-success">Safe Telemetry Logs</span>
              <span className="text-4xl font-black mt-2 text-brand-success">{data.healthy_count}</span>
            </div>
          </ThreeDTilt>
          <ThreeDTilt className="col-span-2 lg:col-span-1">
            <div className="glass-panel p-4 rounded-xl flex flex-col justify-between h-full border-t-2 border-purple-500">
              <span className="text-[10px] uppercase font-bold tracking-wider text-purple-400">Total Assets Registered</span>
              <span className="text-4xl font-black mt-2 text-purple-400">{data.total_assets}</span>
            </div>
          </ThreeDTilt>
        </section>

        {/* Main interactive grid: Map, Rankings, Trends */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Drilldown National Map (Left) */}
          <div className="lg:col-span-8 h-[480px] glass-panel rounded-2xl p-2 relative shadow-glass overflow-hidden">
            <div className="absolute top-4 left-4 z-20 bg-dark-bg/85 border border-dark-border px-3 py-1.5 rounded text-[10px] font-mono text-gray-200">
              GEOSPATIAL DATA LOCATOR
            </div>
            
            <MapContainer 
              center={[17.8486, 79.1118]} 
              zoom={8} 
              className="w-full h-full rounded-xl"
              style={{ minHeight: '100%' }}
            >
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              {filteredPins.map(pin => {
                const coords = pin.gps.split(',').map(Number);
                if (coords.length !== 2) return null;
                return (
                  <Marker 
                    key={pin.id} 
                    position={[coords[0], coords[1]]} 
                    icon={createCustomMarker(pin.risk)}
                  >
                    <Popup>
                      <div className="p-1 font-sans space-y-1">
                        <div className="font-bold text-sm text-white">{pin.name}</div>
                        <div className="text-[10px] text-gray-400">Health index rating is {pin.health}%</div>
                        <span className={`text-[9px] font-bold px-2 py-0.5 rounded block mt-1.5 w-fit ${getRiskBadgeColor(pin.risk)}`}>
                          {pin.risk}
                        </span>
                      </div>
                    </Popup>
                  </Marker>
                );
              })}
            </MapContainer>
          </div>

          {/* District Rankings Grid (Right) */}
          <div className="lg:col-span-4 glass-panel rounded-2xl p-5 shadow-glass flex flex-col justify-between">
            <div>
              <h3 className="font-display font-bold text-gray-200 flex items-center space-x-1.5">
                <BarChart3 className="w-5 h-5 text-brand-primary" />
                <span>District Infrastructure Rank</span>
              </h3>
              <p className="text-xs text-dark-muted mb-4">Ranked from highest average structural health to lowest.</p>
            </div>

            <div className="space-y-3 overflow-y-auto max-h-72 pr-1">
              {data.district_rankings.map((dist, idx) => (
                <div key={idx} className="bg-dark-bg/40 border border-dark-border p-3 rounded-xl flex items-center justify-between">
                  <div className="space-y-0.5">
                    <div className="text-xs font-bold text-white flex items-center space-x-1.5">
                      <span className="font-mono text-brand-primary">#0{idx+1}</span>
                      <span>{dist.district}</span>
                    </div>
                    <span className="text-[10px] text-dark-muted">{dist.asset_count} assets monitored</span>
                  </div>
                  
                  <div className="text-right">
                    <div className="text-xs font-bold text-white">{dist.average_health}%</div>
                    <span className={`inline-block text-[9px] px-1.5 py-0.5 rounded font-extrabold ${getRiskBadgeColor(dist.risk_level)}`}>
                      {dist.risk_level}
                    </span>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="border-t border-dark-border pt-4 mt-2 text-[10px] text-dark-muted font-sans leading-relaxed">
              Top District Conditions: {data.district_rankings.slice(0, 3).map(d => `${d.district} (${d.average_health}%)`).join(', ')}...
            </div>
          </div>

        </div>

        {/* AI Prediction Summary & Charts */}
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Health index forecasts chart (Left) */}
          <div className="lg:col-span-8 glass-panel rounded-2xl p-6 shadow-glass flex flex-col justify-between">
            <div>
              <h3 className="font-display font-bold text-gray-200 flex items-center space-x-1.5">
                <TrendingUp className="w-5 h-5 text-purple-400" />
                <span>Structural Decay & Budget Outlook</span>
              </h3>
              <p className="text-xs text-dark-muted mb-4">Chronological metrics comparing actual vs projected indices.</p>
            </div>

            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={data.monthly_risk_trend}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                  <XAxis dataKey="month" stroke="#9ca3af" fontSize={10} tickLine={false} />
                  <YAxis stroke="#9ca3af" fontSize={10} tickLine={false} />
                  <Tooltip contentStyle={{ backgroundColor: 'rgba(13, 20, 35, 0.95)', border: '1px solid rgba(255,255,255,0.08)' }} />
                  <Legend iconSize={10} style={{ fontSize: 10 }} />
                  <Line type="monotone" dataKey="safe" name="Safe Assets" stroke="#10b981" strokeWidth={2.5} />
                  <Line type="monotone" dataKey="warning" name="Warning Tiers" stroke="#f59e0b" strokeWidth={2} />
                  <Line type="monotone" dataKey="critical" name="Critical Tiers" stroke="#ef4444" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* AI Prediction Summary (Right) */}
          <div className="lg:col-span-4 glass-panel rounded-2xl p-6 shadow-glass flex flex-col justify-between border border-purple-500/20">
            <div>
              <div className="flex items-center space-x-2 text-purple-400 mb-2">
                <span className="text-[10px] font-bold uppercase tracking-wider">Explainable Prediction Summary</span>
              </div>
              <h3 className="font-display font-bold text-gray-200">AI Safety Outlook</h3>
              <p className="text-xs text-dark-muted mt-2 leading-relaxed font-sans">{data.ai_prediction_summary}</p>
            </div>

            <div className="bg-purple-950/20 border border-purple-500/20 rounded-xl p-4 space-y-2 text-xs">
              <span className="font-bold text-purple-300 block">Immediate Interventions Needed</span>
              <div className="space-y-2 max-h-32 overflow-y-auto pr-1">
                {data.assets_requiring_immediate_action.map((a, idx) => (
                  <div key={idx} className="flex justify-between items-center text-[10px] text-gray-300 font-mono">
                    <span className="truncate max-w-[150px]">{a.name}</span>
                    <span className="text-brand-danger font-bold">{a.health}%</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

        </section>

      </div>
    </div>
  );
};
