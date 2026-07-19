import React, { useState, useEffect } from 'react';
import { API_BASE } from '../config/api';
import { 
  ArrowLeft, Upload, FileText, CloudRain, Truck, 
  Terminal, Cpu, CheckCircle2, Play 
} from 'lucide-react';
import type { Asset } from '../types';

interface UploadInspectionProps {
  onBack: () => void;
  onNavigateToAsset: (assetId: string) => void;
}

interface AgentLog {
  timestamp: string;
  agent: string;
  message: string;
}

export const UploadInspection: React.FC<UploadInspectionProps> = ({ onBack, onNavigateToAsset }) => {
  const [assets, setAssets] = useState<Asset[]>([]);
  const [selectedAssetId, setSelectedAssetId] = useState('');
  const [inspectorName, setInspectorName] = useState('');
  const [engineerNotes, setEngineerNotes] = useState('');
  const [weather, setWeather] = useState('Dry / Clear, 30°C');
  const [trafficLoad, setTrafficLoad] = useState('Standard Highway Traffic');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [docFile, setDocFile] = useState<File | null>(null);
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [voiceFile, setVoiceFile] = useState<File | null>(null);
  const [sensorFile, setSensorFile] = useState<File | null>(null);
  const [gpsInput, setGpsInput] = useState('');
  
  // Pipeline status states
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentAgentIdx, setCurrentAgentIdx] = useState(-1);
  const [logs, setLogs] = useState<AgentLog[]>([]);
  const [executionResult, setExecutionResult] = useState<any>(null);

  // List of agents to show in the UI graph
  const agents = [
    { name: 'InspectorAgent', title: '🛰️ Inspector Agent', desc: 'Analyzes visual drone files & photos' },
    { name: 'DocumentAgent', title: '📄 Document Agent', desc: 'Parses contractor forms & text logs' },
    { name: 'KnowledgeAgent', title: '📚 Knowledge Agent', desc: 'RAG search for IS/IRC standards' },
    { name: 'StructuralEngineerAgent', title: '👷 Structural Engineer', desc: 'Reconciles anomalies & codes' },
    { name: 'RiskAnalystAgent', title: '📊 Risk Analyst Agent', desc: 'Models safety scores & likelihoods' },
    { name: 'SimulationAgent', title: '🎮 Simulation Agent', desc: 'Projects scenario cost curves' },
    { name: 'ReportAgent', title: '📥 Report Agent', desc: 'Formats printable audit PDF logs' },
  ];

  useEffect(() => {
    fetch(`${API_BASE}/api/assets`)
      .then(res => res.json())
      .then(data => {
        setAssets(data);
        if (data.length > 0) setSelectedAssetId(data[0].id);
      })
      .catch(err => console.error('Error fetching assets:', err));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAssetId || !inspectorName || isSubmitting) return;

    setIsSubmitting(true);
    setCurrentAgentIdx(0);
    setLogs([]);
    setExecutionResult(null);

    // Create Form data
    const formData = new FormData();
    formData.append('asset_id', selectedAssetId);
    formData.append('inspector_name', inspectorName);
    formData.append('engineer_notes', engineerNotes);
    formData.append('weather', weather);
    formData.append('traffic_load', trafficLoad);
    if (imageFile) formData.append('image', imageFile);
    if (docFile) formData.append('report_file', docFile);
    if (videoFile) formData.append('video_file', videoFile);
    if (voiceFile) formData.append('voice_file', voiceFile);
    if (sensorFile) formData.append('sensor_file', sensorFile);
    if (gpsInput) formData.append('gps_override', gpsInput);

    try {
      // 1. Submit upload and fetch final coordinates payload
      const response = await fetch(`${API_BASE}/api/inspections/upload`, {
        method: 'POST',
        body: formData
      });

      if (!response.ok) {
        throw new Error('Pipeline execution failed');
      }

      const resData = await response.json();
      
      // 2. Playback / Animate the execution sequence step by step in the UI
      const pipelineLogs = resData.data.logs || [];
      
      for (let i = 0; i < agents.length; i++) {
        setCurrentAgentIdx(i);
        // Find matching logs for this agent
        const agentLogs = pipelineLogs.filter((l: any) => l.agent === agents[i].name);
        
        // Add each log to terminal display with animation delays
        for (const log of agentLogs) {
          setLogs(prev => [...prev, log]);
          await new Promise(resolve => setTimeout(resolve, 600));
        }
        await new Promise(resolve => setTimeout(resolve, 800));
      }
      
      // Print system termination log
      const systemLogs = pipelineLogs.filter((l: any) => l.agent === 'System');
      for (const log of systemLogs) {
        setLogs(prev => [...prev, log]);
      }
      
      setExecutionResult(resData.data);
    } catch (err) {
      console.error('Error uploading inspection:', err);
      setLogs(prev => [...prev, {
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        agent: 'System',
        message: 'CRITICAL ERROR: Multi-Agent coordination pipeline aborted due to execution faults.'
      }]);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen p-6 relative">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Header */}
        <header className="flex items-center space-x-4">
          <button 
            onClick={onBack}
            className="flex items-center space-x-2 text-dark-muted hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="text-xs font-semibold uppercase tracking-wider">Back</span>
          </button>
          <h1 className="text-2xl font-black text-white flex items-center space-x-2">
            <Upload className="w-6 h-6 text-brand-primary" />
            <span>UPLOAD INSPECTION FILES</span>
          </h1>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Upload Form Panel (Left) */}
          <div className="lg:col-span-5 glass-panel rounded-2xl p-6 shadow-glass">
            <h3 className="font-display font-bold text-gray-200 border-b border-dark-border pb-3 mb-4">Inspection Parameters</h3>
            
            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              
              {/* Asset Select */}
              <div className="space-y-1">
                <label className="text-[10px] text-dark-muted uppercase font-bold tracking-wider">Target Structure</label>
                <select
                  value={selectedAssetId}
                  onChange={(e) => setSelectedAssetId(e.target.value)}
                  disabled={isSubmitting}
                  className="w-full bg-dark-bg/60 border border-dark-border focus:border-brand-primary text-gray-200 py-2 px-3 rounded focus:outline-none"
                >
                  {assets.map(a => (
                    <option key={a.id} value={a.id}>{a.name} ({a.type})</option>
                  ))}
                </select>
              </div>

              {/* Inspector Name */}
              <div className="space-y-1">
                <label className="text-[10px] text-dark-muted uppercase font-bold tracking-wider">Lead Inspector Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Dr. Amit Sen"
                  value={inspectorName}
                  onChange={(e) => setInspectorName(e.target.value)}
                  disabled={isSubmitting}
                  className="w-full bg-dark-bg/60 border border-dark-border focus:border-brand-primary text-gray-200 py-2 px-3 rounded focus:outline-none placeholder-dark-muted"
                />
              </div>

              {/* Weather and Traffic Fields */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] text-dark-muted uppercase font-bold tracking-wider flex items-center"><CloudRain className="w-3.5 h-3.5 mr-1 text-brand-primary" /> Weather</label>
                  <input
                    type="text"
                    value={weather}
                    onChange={(e) => setWeather(e.target.value)}
                    disabled={isSubmitting}
                    className="w-full bg-dark-bg/60 border border-dark-border focus:border-brand-primary text-gray-200 py-2 px-3 rounded focus:outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] text-dark-muted uppercase font-bold tracking-wider flex items-center"><Truck className="w-3.5 h-3.5 mr-1 text-brand-primary" /> Traffic Load</label>
                  <input
                    type="text"
                    value={trafficLoad}
                    onChange={(e) => setTrafficLoad(e.target.value)}
                    disabled={isSubmitting}
                    className="w-full bg-dark-bg/60 border border-dark-border focus:border-brand-primary text-gray-200 py-2 px-3 rounded focus:outline-none"
                  />
                </div>
              </div>

              {/* Inspector Notes */}
              <div className="space-y-1">
                <label className="text-[10px] text-dark-muted uppercase font-bold tracking-wider">Field Diagnostics / Engineer Notes</label>
                <textarea
                  placeholder="Notes from on-site visual checks..."
                  rows={4}
                  value={engineerNotes}
                  onChange={(e) => setEngineerNotes(e.target.value)}
                  disabled={isSubmitting}
                  className="w-full bg-dark-bg/60 border border-dark-border focus:border-brand-primary text-gray-200 py-2 px-3 rounded focus:outline-none placeholder-dark-muted font-sans"
                />
              </div>

              {/* Document upload fields */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] text-dark-muted uppercase font-bold tracking-wider">Drone Image</label>
                  <div className="relative border border-dashed border-dark-border hover:border-brand-primary rounded p-3 text-center transition-colors cursor-pointer">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => setImageFile(e.target.files?.[0] || null)}
                      disabled={isSubmitting}
                      className="absolute inset-0 opacity-0 cursor-pointer"
                    />
                    <Upload className="w-5 h-5 text-dark-muted mx-auto mb-1" />
                    <span className="text-[10px] text-gray-300 block truncate">{imageFile ? imageFile.name : 'Upload JPEG'}</span>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] text-dark-muted uppercase font-bold tracking-wider">Audit Form (PDF)</label>
                  <div className="relative border border-dashed border-dark-border hover:border-brand-primary rounded p-3 text-center transition-colors cursor-pointer">
                    <input
                      type="file"
                      accept=".pdf"
                      onChange={(e) => setDocFile(e.target.files?.[0] || null)}
                      disabled={isSubmitting}
                      className="absolute inset-0 opacity-0 cursor-pointer"
                    />
                    <FileText className="w-5 h-5 text-dark-muted mx-auto mb-1" />
                    <span className="text-[10px] text-gray-300 block truncate">{docFile ? docFile.name : 'Upload PDF'}</span>
                  </div>
                </div>
              </div>

              {/* Multi-modal drone video, voice note, and sensor logs */}
              <div className="grid grid-cols-3 gap-3">
                <div className="space-y-1.5">
                  <label className="text-[10px] text-dark-muted uppercase font-bold tracking-wider">Drone Video</label>
                  <div className="relative border border-dashed border-dark-border hover:border-brand-primary rounded p-2.5 text-center transition-colors cursor-pointer">
                    <input
                      type="file"
                      accept="video/*"
                      onChange={(e) => setVideoFile(e.target.files?.[0] || null)}
                      disabled={isSubmitting}
                      className="absolute inset-0 opacity-0 cursor-pointer"
                    />
                    <span className="text-[9px] text-gray-300 block truncate">{videoFile ? videoFile.name : 'Upload MP4'}</span>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] text-dark-muted uppercase font-bold tracking-wider">Voice Notes</label>
                  <div className="relative border border-dashed border-dark-border hover:border-brand-primary rounded p-2.5 text-center transition-colors cursor-pointer">
                    <input
                      type="file"
                      accept="audio/*"
                      onChange={(e) => setVoiceFile(e.target.files?.[0] || null)}
                      disabled={isSubmitting}
                      className="absolute inset-0 opacity-0 cursor-pointer"
                    />
                    <span className="text-[9px] text-gray-300 block truncate">{voiceFile ? voiceFile.name : 'Upload WAV'}</span>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] text-dark-muted uppercase font-bold tracking-wider">Sensor Logs</label>
                  <div className="relative border border-dashed border-dark-border hover:border-brand-primary rounded p-2.5 text-center transition-colors cursor-pointer">
                    <input
                      type="file"
                      accept=".csv,.json"
                      onChange={(e) => setSensorFile(e.target.files?.[0] || null)}
                      disabled={isSubmitting}
                      className="absolute inset-0 opacity-0 cursor-pointer"
                    />
                    <span className="text-[9px] text-gray-300 block truncate">{sensorFile ? sensorFile.name : 'Upload CSV'}</span>
                  </div>
                </div>
              </div>

              {/* GPS coordinates override */}
              <div className="space-y-1">
                <label className="text-[10px] text-dark-muted uppercase font-bold tracking-wider">GPS Coordinates Override</label>
                <input
                  type="text"
                  placeholder="e.g. 25.3176, 83.0062"
                  value={gpsInput}
                  onChange={(e) => setGpsInput(e.target.value)}
                  disabled={isSubmitting}
                  className="w-full bg-dark-bg/60 border border-dark-border focus:border-brand-primary text-gray-200 py-2 px-3 rounded focus:outline-none placeholder-dark-muted"
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-brand-primary hover:bg-brand-primary/80 disabled:opacity-50 text-white font-bold py-2.5 rounded shadow-glow transition-all flex items-center justify-center space-x-1.5 mt-4"
              >
                <Play className="w-4 h-4 fill-current" />
                <span>Execute Multi-Agent Audit</span>
              </button>

            </form>
          </div>

          {/* Live Node Graph and Terminal Logger (Right) */}
          <div className="lg:col-span-7 flex flex-col space-y-6">
            
            {/* Multi-Agent Graph Monitor */}
            <div className="glass-panel rounded-2xl p-6 shadow-glass">
              <h3 className="font-display font-bold text-gray-200 border-b border-dark-border pb-3 mb-4 flex items-center">
                <Cpu className="w-5 h-5 text-brand-primary mr-2" />
                <span>Coordinator Agent Node Network</span>
              </h3>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {agents.map((agent, index) => {
                  let status = 'Idle';
                  let styleClass = 'border-dark-border bg-dark-card text-dark-muted';
                  
                  if (currentAgentIdx === index && isSubmitting) {
                    status = 'Processing';
                    styleClass = 'border-brand-primary bg-brand-primary/5 text-brand-primary animate-pulse shadow-glow';
                  } else if (currentAgentIdx > index || (executionResult && currentAgentIdx === -1)) {
                    status = 'Completed';
                    styleClass = 'border-brand-success bg-brand-success/5 text-brand-success';
                  }

                  return (
                    <div 
                      key={agent.name} 
                      className={`border p-3 rounded-xl transition-all duration-300 flex flex-col justify-between h-24 ${styleClass}`}
                    >
                      <div>
                        <span className="text-[10px] font-black uppercase tracking-wider block">{agent.title}</span>
                        <p className="text-[9px] mt-0.5 line-clamp-2 leading-snug">{agent.desc}</p>
                      </div>
                      <div className="flex justify-between items-center text-[9px] font-mono mt-2 pt-1 border-t border-white/5">
                        <span>Node {index+1}</span>
                        <span className="font-bold uppercase">{status}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Terminal logs */}
            <div className="glass-panel rounded-2xl p-5 shadow-glass flex-1 flex flex-col h-[300px]">
              <div className="flex justify-between items-center pb-2 border-b border-dark-border mb-3">
                <div className="flex items-center space-x-2 text-[10px] font-mono text-dark-muted">
                  <Terminal className="w-3.5 h-3.5 text-brand-primary" />
                  <span>INTELLIGENCE PIPELINE TERMINAL LOGS</span>
                </div>
                {isSubmitting && (
                  <span className="w-2 h-2 rounded-full bg-brand-danger animate-ping" />
                )}
              </div>

              <div className="flex-1 bg-black/40 border border-dark-border rounded p-3 font-mono text-[10px] overflow-y-auto space-y-1.5 text-green-400">
                {logs.length === 0 ? (
                  <span className="text-dark-muted italic">Waiting for pipeline execution trigger...</span>
                ) : (
                  logs.map((log, idx) => (
                    <div key={idx} className="flex items-start space-x-2">
                      <span className="text-gray-500 font-semibold">{log.timestamp}</span>
                      <span className="text-purple-400 font-bold shrink-0">[{log.agent}]:</span>
                      <span className="text-gray-200 leading-normal">{log.message}</span>
                    </div>
                  ))
                )}
              </div>
              
              {/* Telemetry Success Link */}
              {executionResult && (
                <div className="mt-3 p-3 bg-brand-success/10 border border-brand-success/20 rounded-xl flex items-center justify-between text-xs animate-slide-in">
                  <div className="flex items-center space-x-2 text-brand-success">
                    <CheckCircle2 className="w-5 h-5 shrink-0" />
                    <span>Audit Pipeline finished. Safety Health score finalized at **{100 - (executionResult.risk?.risk_score || 0)}%**.</span>
                  </div>
                  <button 
                    onClick={() => onNavigateToAsset(executionResult.asset_id)}
                    className="bg-brand-success text-white py-1 px-3 rounded font-bold hover:bg-brand-success/80 transition-colors"
                  >
                    Load Twin
                  </button>
                </div>
              )}
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};
