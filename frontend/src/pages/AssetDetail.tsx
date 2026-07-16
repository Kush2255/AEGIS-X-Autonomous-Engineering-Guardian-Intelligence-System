import React, { useState, useEffect } from 'react';
import { 
  ArrowLeft, Calendar, User, ShieldAlert, Sparkles, 
  Wrench, Activity, ChevronRight, Download, Clock 
} from 'lucide-react';
import type { AssetDetails, Inspection, Defect } from '../types';
import { Copilot } from '../components/Copilot';

interface AssetDetailProps {
  assetId: string;
  onBack: () => void;
  onNavigateToSimulator: () => void;
}

export const AssetDetail: React.FC<AssetDetailProps> = ({ assetId, onBack, onNavigateToSimulator }) => {
  const [data, setData] = useState<AssetDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [timelineIndex, setTimelineIndex] = useState(0);
  const [copilotOpen, setCopilotOpen] = useState(false);
  const [downloadingReport, setDownloadingReport] = useState(false);

  useEffect(() => {
    fetch(`http://localhost:8000/api/assets/${assetId}`)
      .then(res => res.json())
      .then(resData => {
        // Sort inspections oldest to newest for the timeline replay
        if (resData.inspections) {
          resData.inspections.sort((a: Inspection, b: Inspection) => 
            new Date(a.inspection_date).getTime() - new Date(b.inspection_date).getTime()
          );
        }
        setData(resData);
        // Default timeline index to the latest inspection (last element)
        if (resData.inspections && resData.inspections.length > 0) {
          setTimelineIndex(resData.inspections.length - 1);
        }
        setLoading(false);
      })
      .catch(err => {
        console.error('Error fetching asset detail:', err);
        setLoading(false);
      });
  }, [assetId]);

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center space-y-4">
        <div className="w-12 h-12 border-4 border-brand-primary border-t-transparent rounded-full animate-spin" />
        <span className="text-sm font-mono text-dark-muted">Accessing asset neural cores...</span>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center text-center p-6">
        <ShieldAlert className="w-12 h-12 text-brand-danger mb-4" />
        <h2 className="text-xl font-bold text-white">Asset Sync Error</h2>
        <p className="text-dark-muted mt-2">The selected digital twin could not be loaded from database.</p>
        <button onClick={onBack} className="mt-4 bg-brand-primary py-2 px-4 rounded text-xs font-bold text-white">
          Return to Command Center
        </button>
      </div>
    );
  }

  const selectedInspection: Inspection | undefined = data.inspections?.[timelineIndex];
  
  // Extract details payload (contains logs, report markdown, details)
  const inspectionDetails = selectedInspection?.details_json || {};
  const defects: Defect[] = selectedInspection ? 
    (selectedInspection.defects || []) : [];

  const handleDownloadReport = () => {
    if (!selectedInspection) return;
    setDownloadingReport(true);
    
    // Simulating downloading PDF report, using report agent markdown generated on backend
    const reportTitle = inspectionDetails.report?.title || `Structural_Audit_Report_${data.name}`;
    const reportContent = inspectionDetails.report?.markdown_content || 
      `# AEGIS X - Inspection Report \nAsset: ${data.name}\nDate: ${new Date(selectedInspection.inspection_date).toLocaleDateString()}`;
    
    const blob = new Blob([reportContent], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${reportTitle.replace(/\s+/g, '_')}.md`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    setTimeout(() => setDownloadingReport(false), 800);
  };

  const getSeverityColor = (sev: string) => {
    switch (sev) {
      case 'Critical': return 'bg-brand-danger/20 text-brand-danger border border-brand-danger/40';
      case 'High': return 'bg-brand-warning/20 text-brand-warning border border-brand-warning/40';
      case 'Medium': return 'bg-yellow-400/20 text-yellow-400 border border-yellow-400/40';
      default: return 'bg-brand-success/20 text-brand-success border border-brand-success/40';
    }
  };

  // Get structural profile memory
  const structuralProfile = data.memories?.find(m => m.key === 'structural_profile')?.value_json || {};

  return (
    <div className="min-h-screen p-6 relative">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Back navigation and controls */}
        <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <button 
            onClick={onBack}
            className="flex items-center space-x-2 text-dark-muted hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="text-xs font-semibold uppercase tracking-wider">Back to Center</span>
          </button>
          
          <div className="flex items-center space-x-3">
            <button 
              onClick={onNavigateToSimulator}
              className="border border-dark-border hover:bg-dark-hover py-2 px-4 rounded text-xs font-bold text-gray-200 transition-colors flex items-center space-x-1.5"
            >
              <Activity className="w-3.5 h-3.5 text-brand-primary" />
              <span>Simulate Scenario</span>
            </button>
            <button 
              onClick={() => setCopilotOpen(true)}
              className="bg-purple-600/30 border border-purple-500/40 hover:bg-purple-600/50 text-purple-200 py-2 px-4 rounded text-xs font-bold transition-all flex items-center space-x-1.5"
            >
              <Sparkles className="w-3.5 h-3.5 text-purple-400" />
              <span>Consult Copilot</span>
            </button>
          </div>
        </header>

        {/* Profile Card */}
        <section className="glass-panel rounded-2xl p-6 shadow-glass grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
          <div className="md:col-span-3">
            {data.image_url ? (
              <img src={data.image_url} alt={data.name} className="w-full h-44 object-cover rounded-xl border border-dark-border shadow-lg" />
            ) : (
              <div className="w-full h-44 bg-dark-bg border border-dark-border rounded-xl flex items-center justify-center text-dark-muted font-bold text-2xl uppercase">
                {data.type}
              </div>
            )}
          </div>
          
          <div className="md:col-span-6 space-y-3">
            <div>
              <span className="text-[10px] bg-brand-primary/10 border border-brand-primary/20 text-brand-primary py-0.5 px-2 rounded-full font-bold uppercase tracking-wider">
                {data.type} DIGITAL TWIN
              </span>
              <h2 className="text-2xl font-black mt-1 text-white">{data.name}</h2>
              <p className="text-xs text-dark-muted font-mono">{data.address}</p>
            </div>
            <p className="text-sm text-gray-300 leading-relaxed">{data.description}</p>
          </div>

          {/* Health index dials */}
          <div className="md:col-span-3 border-l border-dark-border/40 pl-6 flex flex-col items-center md:items-start space-y-4">
            <div className="text-center md:text-left">
              <span className="text-[10px] text-dark-muted uppercase font-bold tracking-wider">Neural Health Index</span>
              <div className="flex items-baseline space-x-2 mt-1">
                <span className="text-5xl font-black text-white">{data.current_health_score}%</span>
                <span className={`text-xs font-bold px-2 py-0.5 rounded ${
                  data.risk_level === 'Critical' ? 'text-brand-danger bg-brand-danger/10 border border-brand-danger/20' :
                  data.risk_level === 'Warning' ? 'text-brand-warning bg-brand-warning/10 border border-brand-warning/20' :
                  data.risk_level === 'Monitor' ? 'text-yellow-400 bg-yellow-400/10 border border-yellow-400/20' :
                  'text-brand-success bg-brand-success/10 border border-brand-success/20'
                }`}>
                  {data.risk_level}
                </span>
              </div>
            </div>
            <div className="w-full bg-dark-bg/60 border border-dark-border h-2 rounded-full overflow-hidden">
              <div 
                className={`h-full rounded-full ${
                  data.risk_level === 'Critical' ? 'bg-brand-danger shadow-[0_0_8px_#ef4444]' : 
                  data.risk_level === 'Warning' ? 'bg-brand-warning shadow-[0_0_8px_#f59e0b]' : 
                  data.risk_level === 'Monitor' ? 'bg-yellow-400' : 'bg-brand-success shadow-[0_0_8px_#10b981]'
                }`} 
                style={{ width: `${data.current_health_score}%` }} 
              />
            </div>
          </div>
        </section>

        {/* AI Memory and Replay Container */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Timeline Replay (Left Column) */}
          <div className="lg:col-span-8 glass-panel rounded-2xl p-6 shadow-glass flex flex-col justify-between">
            <div className="flex items-center justify-between pb-4 border-b border-dark-border mb-6">
              <div>
                <h3 className="font-display font-bold text-lg text-gray-200 flex items-center space-x-2">
                  <Clock className="w-5 h-5 text-brand-primary" />
                  <span>Timeline Replay</span>
                </h3>
                <p className="text-xs text-dark-muted">Scroll the slider to review historical structural deterioration scans.</p>
              </div>
              {selectedInspection && (
                <button 
                  onClick={handleDownloadReport}
                  disabled={downloadingReport}
                  className="bg-brand-primary hover:bg-brand-primary/80 disabled:opacity-50 text-white py-1.5 px-3 rounded text-xs font-bold transition-all flex items-center space-x-1.5"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>{downloadingReport ? 'Generating...' : 'Audit Report'}</span>
                </button>
              )}
            </div>

            {data.inspections && data.inspections.length > 0 ? (
              <div className="space-y-6">
                
                {/* Timeline slider widget */}
                <div className="bg-dark-bg/60 border border-dark-border p-4 rounded-xl space-y-4">
                  <div className="flex justify-between items-center text-xs text-dark-muted font-mono">
                    <span>{new Date(data.inspections[0].inspection_date).toLocaleDateString(undefined, { year: 'numeric', month: 'short' })}</span>
                    <span className="text-brand-primary font-bold">REPLAY SCAN MODE</span>
                    <span>{new Date(data.inspections[data.inspections.length - 1].inspection_date).toLocaleDateString(undefined, { year: 'numeric', month: 'short' })}</span>
                  </div>

                  <input
                    type="range"
                    min="0"
                    max={data.inspections.length - 1}
                    value={timelineIndex}
                    onChange={(e) => setTimelineIndex(Number(e.target.value))}
                    className="w-full accent-brand-primary bg-dark-bg border border-dark-border h-2 rounded cursor-pointer"
                  />

                  {/* Selected inspection meta */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between text-xs pt-2 gap-2">
                    <div className="flex items-center space-x-3 text-gray-300 font-mono">
                      <span className="flex items-center"><Calendar className="w-3.5 h-3.5 mr-1 text-brand-primary" /> {new Date(selectedInspection!.inspection_date).toLocaleDateString()}</span>
                      <span className="flex items-center"><User className="w-3.5 h-3.5 mr-1 text-brand-primary" /> {selectedInspection!.inspector_name}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-dark-muted">Assessed Risk Score:</span>
                      <span className={`font-bold font-mono ${
                        selectedInspection!.overall_risk_score >= 80 ? 'text-brand-danger' :
                        selectedInspection!.overall_risk_score >= 60 ? 'text-brand-warning' :
                        selectedInspection!.overall_risk_score >= 35 ? 'text-yellow-400' : 'text-brand-success'
                      }`}>
                        {selectedInspection!.overall_risk_score}/100
                      </span>
                    </div>
                  </div>
                </div>

                {/* Inspection Summary */}
                <div className="bg-dark-bg/30 border border-dark-border rounded-xl p-4 space-y-2">
                  <h4 className="text-xs text-dark-muted uppercase font-bold tracking-wider">AI Reconciled Audit Summary</h4>
                  <p className="text-sm text-gray-200 leading-relaxed">{selectedInspection?.summary}</p>
                </div>

                {/* Defects Identified */}
                <div className="space-y-3">
                  <h4 className="text-xs text-dark-muted uppercase font-bold tracking-wider">Detected Defects Database ({defects.length})</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {defects.map((def, idx) => (
                      <div key={idx} className="bg-dark-card border border-dark-border rounded-xl p-3.5 space-y-2.5">
                        <div className="flex justify-between items-start">
                          <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded uppercase ${getSeverityColor(def.severity)}`}>
                            {def.severity} {def.type}
                          </span>
                          <span className="text-[10px] text-dark-muted font-mono">Conf: {(def.confidence * 100).toFixed(0)}%</span>
                        </div>
                        <div className="text-xs font-semibold text-gray-200 flex items-center">
                          <span className="text-brand-primary mr-1">&bull;</span>
                          Location: {def.location_description || 'General'}
                        </div>
                        <p className="text-xs text-dark-muted leading-relaxed line-clamp-3">{def.description}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-10 text-dark-muted text-xs">No inspection logs available.</div>
            )}
          </div>

          {/* AI Memory Profile (Right Column) */}
          <div className="lg:col-span-4 glass-panel rounded-2xl p-6 shadow-glass flex flex-col justify-between space-y-6">
            <div>
              <div className="flex items-center space-x-2 pb-4 border-b border-dark-border mb-4">
                <Sparkles className="w-5 h-5 text-purple-400" />
                <h3 className="font-display font-bold text-gray-200">AI Digital Twin Memory</h3>
              </div>
              
              <div className="space-y-5 text-xs">
                {structuralProfile.deterioration_summary ? (
                  <>
                    <div className="space-y-1.5">
                      <span className="text-[10px] text-dark-muted uppercase font-bold tracking-wider">Deterioration Rate Vector</span>
                      <p className="text-gray-300 leading-relaxed font-sans">{structuralProfile.deterioration_summary}</p>
                    </div>

                    <div className="space-y-1.5">
                      <span className="text-[10px] text-dark-muted uppercase font-bold tracking-wider">Structural Criticality Profiler</span>
                      <p className="text-gray-300 leading-relaxed font-sans">{structuralProfile.structural_criticality}</p>
                    </div>

                    <div className="space-y-1.5">
                      <span className="text-[10px] text-dark-muted uppercase font-bold tracking-wider">Maintenance Alert Code bindings</span>
                      <p className="text-gray-300 leading-relaxed font-sans">{structuralProfile.maintenance_warning}</p>
                    </div>

                    <div className="space-y-1.5">
                      <span className="text-[10px] text-dark-muted uppercase font-bold tracking-wider">Referenced Codes</span>
                      <div className="flex flex-wrap gap-1.5 mt-1">
                        {structuralProfile.applied_codes?.map((code: string, idx: number) => (
                          <span key={idx} className="bg-purple-950/45 border border-purple-500/30 text-purple-300 py-0.5 px-2 rounded font-mono text-[9px] uppercase tracking-wider">
                            {code}
                          </span>
                        ))}
                      </div>
                    </div>
                  </>
                ) : (
                  <p className="text-dark-muted leading-relaxed">No memory state compiled. Complete a full multi-agent scan to initialize memory twin weights.</p>
                )}
              </div>
            </div>

            {/* Quick simulation link */}
            <div className="bg-purple-950/20 border border-purple-500/20 rounded-xl p-4 text-xs space-y-2">
              <span className="font-bold text-purple-300 block">Deterioration Forecasting</span>
              <p className="text-dark-muted leading-relaxed text-[11px]">Run maintenance postponement simulations on this asset profile to compare safety and structural repair budget risks.</p>
              <button 
                onClick={onNavigateToSimulator}
                className="w-full bg-purple-600/30 hover:bg-purple-600/50 border border-purple-500/30 text-purple-200 py-1.5 rounded font-bold transition-all text-[11px] flex items-center justify-center space-x-1"
              >
                <span>Initialize Simulator</span>
                <ChevronRight className="w-3 h-3" />
              </button>
            </div>
          </div>
        </div>

        {/* Maintenance Logs */}
        <section className="glass-panel rounded-2xl p-6 shadow-glass">
          <div>
            <h3 className="font-display font-bold text-gray-200 flex items-center space-x-2">
              <Wrench className="w-5 h-5 text-brand-primary" />
              <span>Maintenance & Repairs History</span>
            </h3>
            <p className="text-xs text-dark-muted mb-4">Historical contractor logs and remediation expenses.</p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-dark-border text-[9px] text-dark-muted uppercase font-bold tracking-wider">
                  <th className="pb-2">Repair Actions</th>
                  <th className="pb-2">Execution Date</th>
                  <th className="pb-2 text-right">Investment Cost</th>
                  <th className="pb-2 text-center">Status</th>
                  <th className="pb-2">Inspector Notes</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-dark-border/40 text-gray-300">
                {data.maintenance && data.maintenance.length > 0 ? (
                  data.maintenance.map(log => (
                    <tr key={log.id} className="hover:bg-dark-hover/10 transition-colors">
                      <td className="py-3 font-semibold text-white">{log.repair_type}</td>
                      <td className="py-3 font-mono">{new Date(log.repair_date).toLocaleDateString()}</td>
                      <td className="py-3 font-mono text-right text-brand-primary font-bold">${log.cost.toLocaleString()}</td>
                      <td className="py-3 text-center">
                        <span className={`px-2 py-0.5 rounded font-bold ${
                          log.status === 'Completed' ? 'bg-brand-success/10 text-brand-success border border-brand-success/20' : 'bg-brand-warning/10 text-brand-warning'
                        }`}>
                          {log.status}
                        </span>
                      </td>
                      <td className="py-3 text-dark-muted max-w-sm truncate">{log.notes || 'N/A'}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="py-4 text-center text-dark-muted">No maintenance actions logged.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>
      </div>

      {/* AI Copilot Side-Panel */}
      <Copilot 
        assetId={data.id} 
        assetName={data.name} 
        isOpen={copilotOpen} 
        onClose={() => setCopilotOpen(false)} 
      />
    </div>
  );
};
