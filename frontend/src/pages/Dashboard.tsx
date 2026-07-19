import React, { useState, useEffect } from 'react';
import { API_BASE } from '../config/api';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Cell } from 'recharts';
import { AlertCircle, AlertTriangle, CheckCircle, Activity, Play, Plus, Search, ShieldAlert, Sparkles, ArrowUpDown, ChevronLeft, ChevronRight } from 'lucide-react';
import type { Asset } from '../types';
import { Copilot } from '../components/Copilot';
import { ThreeDConstellation } from '../components/ThreeDConstellation';
import { ThreeDTilt } from '../components/ThreeDTilt';
import { getAssetThumbnailUrl } from '../utils/assetImages';

interface DashboardProps {
  onSelectAsset: (assetId: string) => void;
  onNavigateToUpload: () => void;
  onNavigateToSimulator: () => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ onSelectAsset, onNavigateToUpload, onNavigateToSimulator }) => {
  const [assets, setAssets] = useState<Asset[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Filtering states
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedDistrict, setSelectedDistrict] = useState<string>('All');
  const [selectedType, setSelectedType] = useState<string>('All');
  
  // Sorting states
  const [sortField, setSortField] = useState<string>('health');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  
  // Pagination states
  const [currentPageNumber, setCurrentPageNumber] = useState<number>(1);
  const itemsPerPage = 10;

  // Copilot sidebar state
  const [copilotOpen, setCopilotOpen] = useState(false);
  const [copilotAsset, setCopilotAsset] = useState<{ id: string; name: string } | null>(null);

  useEffect(() => {
    fetch(`${API_BASE}/api/assets`)
      .then(res => res.json())
      .then(data => {
        setAssets(data);
        setLoading(false);
        // Default copilot focus to first critical/warning asset if any
        const alertAsset = data.find((a: Asset) => a.risk_level === 'Critical' || a.risk_level === 'Warning');
        if (alertAsset) {
          setCopilotAsset({ id: alertAsset.id, name: alertAsset.name });
        } else if (data.length > 0) {
          setCopilotAsset({ id: data[0].id, name: data[0].name });
        }
      })
      .catch(err => {
        console.error('Error fetching assets:', err);
        setLoading(false);
      });
  }, []);

  // Compute unique dropdown values from loaded assets (no hardcoding)
  const uniqueDistricts = Array.from(new Set(assets.map(a => a.district).filter(Boolean) as string[])).sort();
  const uniqueTypes = Array.from(new Set(assets.map(a => a.type).filter(Boolean) as string[])).sort();

  // Reset pagination on filter updates
  useEffect(() => {
    setCurrentPageNumber(1);
  }, [searchTerm, selectedCategory, selectedDistrict, selectedType]);

  // 1. Filter assets
  const filteredAssets = assets.filter(a => {
    const matchesSearch = a.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          a.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          (a.address && a.address.toLowerCase().includes(searchTerm.toLowerCase())) ||
                          (a.responsible_department && a.responsible_department.toLowerCase().includes(searchTerm.toLowerCase()));
                          
    const matchesCategory = selectedCategory === 'All' || a.risk_level === selectedCategory;
    const matchesDistrict = selectedDistrict === 'All' || a.district === selectedDistrict;
    const matchesType = selectedType === 'All' || a.type === selectedType;
    
    return matchesSearch && matchesCategory && matchesDistrict && matchesType;
  });

  // 2. Sort assets
  const sortedAssets = [...filteredAssets].sort((a, b) => {
    if (!sortField) return 0;
    
    let aVal: any = a[sortField as keyof Asset] ?? '';
    let bVal: any = b[sortField as keyof Asset] ?? '';
    
    if (sortField === 'health') {
      aVal = a.current_health_score;
      bVal = b.current_health_score;
    } else if (sortField === 'age') {
      aVal = a.asset_age ?? 0;
      bVal = b.asset_age ?? 0;
    }
    
    if (typeof aVal === 'string') {
      return sortDirection === 'asc' 
        ? aVal.localeCompare(bVal) 
        : bVal.localeCompare(aVal);
    } else {
      return sortDirection === 'asc' 
        ? (aVal as number) - (bVal as number) 
        : (bVal as number) - (aVal as number);
    }
  });

  // 3. Paginate assets
  const totalFiltered = sortedAssets.length;
  const totalPages = Math.ceil(totalFiltered / itemsPerPage) || 1;
  const activePage = Math.min(currentPageNumber, totalPages);
  const startIndex = (activePage - 1) * itemsPerPage;
  const endIndex = Math.min(startIndex + itemsPerPage, totalFiltered);
  const paginatedAssets = sortedAssets.slice(startIndex, endIndex);

  // Calculate statistics (based on entire dataset for global command context)
  const totalAssets = assets.length;
  const criticalCount = assets.filter(a => a.risk_level === 'Critical').length;
  const warningCount = assets.filter(a => a.risk_level === 'Warning').length;
  const monitorCount = assets.filter(a => a.risk_level === 'Monitor').length;
  const safeCount = assets.filter(a => a.risk_level === 'Safe').length;

  // Chart data based on lowest health scores (up to 15 items to keep it clean)
  const chartData = [...assets]
    .sort((a, b) => a.current_health_score - b.current_health_score)
    .slice(0, 15)
    .map(a => ({
      name: a.name.split(' (')[0],
      health: a.current_health_score,
      risk: a.risk_level
    }));

  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  // Custom pulsing colored markers for Leaflet Map
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

  const getRiskIcon = (risk: string) => {
    switch (risk) {
      case 'Critical': return <ShieldAlert className="w-5 h-5 text-brand-danger" />;
      case 'Warning': return <AlertTriangle className="w-5 h-5 text-brand-warning" />;
      case 'Monitor': return <AlertCircle className="w-5 h-5 text-yellow-400" />;
      default: return <CheckCircle className="w-5 h-5 text-brand-success" />;
    }
  };

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
        <span className="text-sm font-mono text-dark-muted">Synchronizing telemetry layers...</span>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-6 relative">
      <ThreeDConstellation />
      <div className="max-w-7xl mx-auto space-y-6 relative z-10">
        
        {/* Upper Dashboard Controls */}
        <header className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-black tracking-tight text-white flex items-center space-x-2">
              <span>INTELLIGENT COMMAND CENTER</span>
            </h1>
            <p className="text-sm text-dark-muted">Digital Twin telemetry network and autonomous risk logs.</p>
          </div>
          
          <div className="flex items-center space-x-3">
            <button 
              onClick={onNavigateToSimulator}
              className="border border-dark-border hover:bg-dark-hover text-gray-200 hover:text-white py-2 px-4 rounded text-sm font-semibold transition-colors flex items-center space-x-2"
            >
              <Activity className="w-4 h-4 text-brand-primary" />
              <span>Simulate Scenarios</span>
            </button>
            <button 
              onClick={onNavigateToUpload}
              className="bg-brand-primary hover:bg-brand-primary/80 text-white py-2 px-4 rounded text-sm font-semibold transition-all shadow-glow flex items-center space-x-2"
            >
              <Plus className="w-4 h-4" />
              <span>Upload Inspection</span>
            </button>
            {copilotAsset && (
              <button 
                onClick={() => setCopilotOpen(true)}
                className="bg-purple-600/30 border border-purple-500/40 hover:bg-purple-600/50 text-purple-200 py-2 px-4 rounded text-sm font-semibold transition-all flex items-center space-x-2 animate-pulse"
              >
                <Sparkles className="w-4 h-4 text-purple-400" />
                <span>Ask Copilot</span>
              </button>
            )}
          </div>
        </header>

        {/* Stats Grid */}
        <section className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <ThreeDTilt>
            <div className="glass-panel p-4 rounded-xl flex flex-col justify-between h-full">
              <span className="text-[10px] uppercase font-bold tracking-wider text-dark-muted">Total Monitored</span>
              <span className="text-3xl font-black mt-2 text-white">{totalAssets}</span>
            </div>
          </ThreeDTilt>
          <ThreeDTilt>
            <div className="glass-panel p-4 rounded-xl border-l-4 border-brand-danger glow-critical flex flex-col justify-between h-full">
              <span className="text-[10px] uppercase font-bold tracking-wider text-brand-danger">Critical Risk</span>
              <span className="text-3xl font-black mt-2 text-brand-danger">{criticalCount}</span>
            </div>
          </ThreeDTilt>
          <ThreeDTilt>
            <div className="glass-panel p-4 rounded-xl border-l-4 border-brand-warning glow-warning flex flex-col justify-between h-full">
              <span className="text-[10px] uppercase font-bold tracking-wider text-brand-warning">Warning</span>
              <span className="text-3xl font-black mt-2 text-brand-warning">{warningCount}</span>
            </div>
          </ThreeDTilt>
          <ThreeDTilt>
            <div className="glass-panel p-4 rounded-xl border-l-4 border-yellow-400 glow-monitor flex flex-col justify-between h-full">
              <span className="text-[10px] uppercase font-bold tracking-wider text-yellow-400">Monitoring</span>
              <span className="text-3xl font-black mt-2 text-yellow-400">{monitorCount}</span>
            </div>
          </ThreeDTilt>
          <ThreeDTilt className="col-span-2 md:col-span-1">
            <div className="glass-panel p-4 rounded-xl border-l-4 border-brand-success glow-success flex flex-col justify-between h-full">
              <span className="text-[10px] uppercase font-bold tracking-wider text-brand-success">Safe / Optimal</span>
              <span className="text-3xl font-black mt-2 text-brand-success">{safeCount}</span>
            </div>
          </ThreeDTilt>
        </section>

        {/* Map and Chart Section */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Leaflet Map (Left Column) */}
          <div className="lg:col-span-8 h-[450px] glass-panel rounded-2xl p-2 relative shadow-glass overflow-hidden z-10">
            <div className="absolute top-4 left-4 z-20 bg-dark-bg/80 backdrop-blur border border-dark-border px-3 py-1.5 rounded text-[10px] font-mono text-gray-200">
              LIVE GEOSPATIAL DATABASE
            </div>
            
            <MapContainer 
              center={[17.8486, 79.1118]} 
              zoom={7.5} 
              className="w-full h-full rounded-xl"
              style={{ minHeight: '100%' }}
            >
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              
              {filteredAssets.map(a => {
                const coords = a.location_gps.split(',').map(Number);
                if (coords.length !== 2 || isNaN(coords[0]) || isNaN(coords[1])) return null;
                
                return (
                  <Marker 
                    key={a.id} 
                    position={[coords[0], coords[1]]} 
                    icon={createCustomMarker(a.risk_level)}
                  >
                    <Popup>
                      <div className="space-y-2 p-1 font-sans">
                        <div className="font-bold text-sm text-white">{a.name}</div>
                        <div className="text-xs text-gray-400">{a.type} &bull; {a.district}</div>
                        <div className="flex items-center justify-between mt-2 pt-2 border-t border-white/10">
                          <span className={`text-[10px] px-2 py-0.5 rounded font-bold ${getRiskBadgeColor(a.risk_level)}`}>
                            {a.risk_level}
                          </span>
                          <span className="text-xs font-semibold text-white">Health: {a.current_health_score}%</span>
                        </div>
                        <button 
                          onClick={() => onSelectAsset(a.id)}
                          className="w-full mt-2 bg-brand-primary text-center text-white py-1 px-2 rounded text-xs font-bold hover:bg-brand-primary/80 transition-colors flex items-center justify-center space-x-1"
                        >
                          <Play className="w-3 h-3 fill-current" />
                          <span>Enter Twin</span>
                        </button>
                      </div>
                    </Popup>
                  </Marker>
                );
              })}
            </MapContainer>
          </div>

          {/* Health Spectrum Chart (Right Column) */}
          <div className="lg:col-span-4 glass-panel rounded-2xl p-5 flex flex-col justify-between shadow-glass">
            <div>
              <h3 className="font-display font-bold text-gray-200">Asset Health Matrix</h3>
              <p className="text-xs text-dark-muted mb-4">Structural integrity ratings plotted lowest to highest.</p>
            </div>
            
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 10, right: 0, left: -25, bottom: 0 }}>
                  <XAxis dataKey="name" stroke="#9ca3af" fontSize={9} tickLine={false} />
                  <YAxis stroke="#9ca3af" fontSize={10} domain={[0, 100]} tickLine={false} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: 'rgba(13, 20, 35, 0.95)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '8px' }}
                    labelStyle={{ color: '#fff', fontWeight: 'bold' }}
                    itemStyle={{ color: '#3b82f6' }}
                  />
                  <Bar dataKey="health" fill="#3b82f6" radius={[4, 4, 0, 0]}>
                    {chartData.map((entry, index) => {
                      const color = 
                        entry.risk === 'Critical' ? '#ef4444' : 
                        entry.risk === 'Warning' ? '#f59e0b' : 
                        entry.risk === 'Monitor' ? '#facc15' : '#10b981';
                      return <Cell key={`cell-${index}`} fill={color} />;
                    })}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="border-t border-dark-border pt-4 mt-2 grid grid-cols-2 gap-4 text-xs text-dark-muted">
              <div className="flex items-center space-x-1.5">
                <span className="w-2.5 h-2.5 bg-brand-danger rounded-full" />
                <span>Critical (&lt; 65)</span>
              </div>
              <div className="flex items-center space-x-1.5">
                <span className="w-2.5 h-2.5 bg-brand-warning rounded-full" />
                <span>Warning (65-75)</span>
              </div>
              <div className="flex items-center space-x-1.5">
                <span className="w-2.5 h-2.5 bg-yellow-400 rounded-full" />
                <span>Monitor (75-85)</span>
              </div>
              <div className="flex items-center space-x-1.5">
                <span className="w-2.5 h-2.5 bg-brand-success rounded-full" />
                <span>Safe (&gt; 85)</span>
              </div>
            </div>
          </div>
        </div>

        {/* Database Search, Filter & Table View */}
        <section className="glass-panel rounded-2xl p-6 shadow-glass space-y-6">
          <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4">
            <div>
              <h3 className="font-display font-bold text-lg text-gray-200">Structural Assets Inventory</h3>
              <p className="text-xs text-dark-muted">Filter database by district, type, risk profile, and search keywords.</p>
            </div>
            
            <div className="flex flex-wrap items-center gap-3">
              {/* Search */}
              <div className="relative w-full sm:w-48">
                <Search className="w-4 h-4 text-dark-muted absolute left-3 top-3" />
                <input
                  type="text"
                  placeholder="Search name, dept..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full bg-dark-bg/60 border border-dark-border focus:border-brand-primary rounded pl-9 pr-4 py-2 text-xs text-white focus:outline-none placeholder-dark-muted transition-colors"
                />
              </div>

              {/* District Dropdown Filter */}
              <select
                value={selectedDistrict}
                onChange={(e) => setSelectedDistrict(e.target.value)}
                className="bg-dark-bg/60 border border-dark-border text-xs p-2 rounded text-gray-300 focus:outline-none focus:border-brand-primary cursor-pointer"
              >
                <option value="All">All Districts</option>
                {uniqueDistricts.map(dist => (
                  <option key={dist} value={dist}>{dist}</option>
                ))}
              </select>

              {/* Class Dropdown Filter */}
              <select
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
                className="bg-dark-bg/60 border border-dark-border text-xs p-2 rounded text-gray-300 focus:outline-none focus:border-brand-primary cursor-pointer"
              >
                <option value="All">All Classes</option>
                {uniqueTypes.map(t => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>

              {/* Alert Category Filter Buttons */}
              <div className="flex space-x-1 bg-dark-bg/60 p-1 border border-dark-border rounded overflow-x-auto">
                {['All', 'Critical', 'Warning', 'Monitor', 'Safe'].map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`py-1 px-3 rounded text-[10px] font-bold uppercase transition-all whitespace-nowrap ${
                      selectedCategory === cat 
                        ? 'bg-brand-primary text-white' 
                        : 'text-dark-muted hover:text-white'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-dark-border text-[10px] text-dark-muted uppercase font-bold tracking-wider">
                  <th 
                    className="pb-3 cursor-pointer select-none hover:text-white transition-colors"
                    onClick={() => handleSort('name')}
                  >
                    <div className="flex items-center space-x-1">
                      <span>Structure Class</span>
                      <ArrowUpDown className="w-3.5 h-3.5" />
                    </div>
                  </th>
                  <th 
                    className="pb-3 cursor-pointer select-none hover:text-white transition-colors"
                    onClick={() => handleSort('district')}
                  >
                    <div className="flex items-center space-x-1">
                      <span>District & Location</span>
                      <ArrowUpDown className="w-3.5 h-3.5" />
                    </div>
                  </th>
                  <th 
                    className="pb-3 cursor-pointer select-none hover:text-white transition-colors"
                    onClick={() => handleSort('age')}
                  >
                    <div className="flex items-center space-x-1">
                      <span>Asset Age & Dept</span>
                      <ArrowUpDown className="w-3.5 h-3.5" />
                    </div>
                  </th>
                  <th 
                    className="pb-3 cursor-pointer select-none hover:text-white transition-colors text-center"
                    onClick={() => handleSort('health')}
                  >
                    <div className="flex items-center space-x-1 justify-center">
                      <span>Health Score</span>
                      <ArrowUpDown className="w-3.5 h-3.5" />
                    </div>
                  </th>
                  <th className="pb-3">Alert Status & Telemetry</th>
                  <th className="pb-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-dark-border text-xs text-gray-300">
                {paginatedAssets.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-dark-muted text-xs">
                      No assets found matching filters.
                    </td>
                  </tr>
                ) : (
                  paginatedAssets.map(a => (
                    <tr key={a.id} className="hover:bg-dark-hover/30 transition-colors group">
                      <td className="py-3">
                        <div className="flex items-center space-x-3">
                          <img
                            src={a.image_url || getAssetThumbnailUrl(a.type, a.id)}
                            alt={a.name}
                            className="w-10 h-10 object-cover rounded border border-dark-border shrink-0"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = `https://source.unsplash.com/160x120/?infrastructure,india&sig=${a.id.length}`;
                            }}
                          />
                          <div>
                            <div className="font-bold text-white group-hover:text-brand-primary transition-colors text-sm">{a.name}</div>
                            <span className="inline-block text-[9px] font-bold px-1.5 py-0.5 rounded bg-dark-hover border border-dark-border/40 text-dark-muted mt-0.5">{a.type}</span>
                          </div>
                        </div>
                      </td>
                      <td className="py-3">
                        <div className="font-bold text-gray-200">{a.district}</div>
                        <div className="text-[11px] text-dark-muted max-w-xs truncate">{a.address}</div>
                        <span className="text-[9px] font-mono text-dark-muted block mt-0.5">{a.location_gps}</span>
                      </td>
                      <td className="py-3">
                        <div className="text-gray-200 font-semibold">{a.asset_age ? `${a.asset_age} Yrs` : 'N/A'}</div>
                        <div className="text-[10px] text-dark-muted max-w-[150px] truncate" title={a.responsible_department}>
                          {a.responsible_department || 'N/A'}
                        </div>
                      </td>
                      <td className="py-3 text-center">
                        <div className="inline-flex flex-col items-center">
                          <span className="font-bold font-mono text-white text-sm">{a.current_health_score}%</span>
                          <div className="w-16 bg-dark-bg border border-dark-border h-1 rounded-full overflow-hidden mt-1">
                            <div 
                              className={`h-full rounded-full ${
                                a.risk_level === 'Critical' ? 'bg-brand-danger' : 
                                a.risk_level === 'Warning' ? 'bg-brand-warning' : 
                                a.risk_level === 'Monitor' ? 'bg-yellow-400' : 'bg-brand-success'
                              }`} 
                              style={{ width: `${a.current_health_score}%` }} 
                            />
                          </div>
                        </div>
                      </td>
                      <td className="py-3">
                        <div className="flex flex-col space-y-1">
                          <span className={`w-fit inline-flex items-center space-x-1 px-2 py-0.5 rounded text-[10px] font-bold ${getRiskBadgeColor(a.risk_level)}`}>
                            {getRiskIcon(a.risk_level)}
                            <span>{a.risk_level}</span>
                          </span>
                          <div className="text-[10px] text-dark-muted font-sans italic max-w-xs truncate" title={a.current_status}>
                            {a.current_status || 'Surveillance status normal'}
                          </div>
                        </div>
                      </td>
                      <td className="py-3 text-right">
                        <div className="flex items-center justify-end space-x-2">
                          <button
                            onClick={() => {
                              setCopilotAsset({ id: a.id, name: a.name });
                              setCopilotOpen(true);
                            }}
                            className="p-1.5 hover:bg-purple-600/20 rounded border border-transparent hover:border-purple-500/30 text-purple-400 transition-colors shrink-0"
                            title="Consult AI Copilot"
                          >
                            <Sparkles className="w-4 h-4 animate-pulse" />
                          </button>
                          <button 
                            onClick={() => onSelectAsset(a.id)}
                            className="bg-dark-bg hover:bg-brand-primary text-gray-300 hover:text-white border border-dark-border hover:border-brand-primary py-1.5 px-3 rounded text-xs font-bold transition-all shrink-0"
                          >
                            Diagnostics
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="flex flex-col sm:flex-row items-center justify-between border-t border-dark-border/40 pt-4 mt-4 gap-4 text-xs">
              <div className="text-dark-muted font-mono">
                Showing <span className="font-bold text-white">{startIndex + 1}</span> to{' '}
                <span className="font-bold text-white">{endIndex}</span> of{' '}
                <span className="font-bold text-white">{totalFiltered}</span> assets
              </div>
              
              <div className="flex items-center space-x-3">
                <button
                  onClick={() => setCurrentPageNumber(prev => Math.max(prev - 1, 1))}
                  disabled={activePage === 1}
                  className="p-1.5 rounded border border-dark-border bg-dark-bg/60 text-dark-muted hover:text-white disabled:opacity-30 disabled:pointer-events-none transition-colors"
                  title="Previous Page"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                
                <span className="text-dark-muted font-bold font-mono text-[11px]">
                  Page <span className="text-white font-black">{activePage}</span> of <span className="text-white font-black">{totalPages}</span>
                </span>

                <button
                  onClick={() => setCurrentPageNumber(prev => Math.min(prev + 1, totalPages))}
                  disabled={activePage === totalPages}
                  className="p-1.5 rounded border border-dark-border bg-dark-bg/60 text-dark-muted hover:text-white disabled:opacity-30 disabled:pointer-events-none transition-colors"
                  title="Next Page"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </section>
      </div>

      {/* AI Copilot Side-Panel */}
      {copilotAsset && (
        <Copilot 
          assetId={copilotAsset.id} 
          assetName={copilotAsset.name} 
          isOpen={copilotOpen} 
          onClose={() => setCopilotOpen(false)} 
        />
      )}
    </div>
  );
};
