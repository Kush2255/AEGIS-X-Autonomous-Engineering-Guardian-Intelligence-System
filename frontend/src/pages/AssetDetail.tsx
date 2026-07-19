import React, { useState, useEffect } from 'react';
import { 
  ArrowLeft, Calendar, User, ShieldAlert, Sparkles, 
  Wrench, Activity, ChevronRight, Download, Clock 
} from 'lucide-react';
import type { AssetDetails, Inspection, Defect } from '../types';
import { Copilot } from '../components/Copilot';
import { ThreeDTilt } from '../components/ThreeDTilt';
import { ThreeDConstellation } from '../components/ThreeDConstellation';
import { getAssetImageUrl } from '../utils/assetImages';

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

  // Enterprise States
  const [activeSubTab, setActiveSubTab] = useState<'timeline' | 'root-cause' | 'forecast' | 'graph' | 'collaboration' | 'risk-timeline' | 'xai-diagnostics' | 'impact-map' | 'strategy-sim'>('timeline');
  const [rootCause, setRootCause] = useState<any>(null);
  const [forecast, setForecast] = useState<any>(null);
  const [repairComparison, setRepairComparison] = useState<any>(null);
  const [story, setStory] = useState<any>(null);
  const [graph, setGraph] = useState<any>(null);
  const [collab, setCollab] = useState<any>({ comments: [], tasks: [] });
  const [newComment, setNewComment] = useState('');
  const [newTask, setNewTask] = useState('');
  const collabAuthor = 'Lead Engineer';

  // Features 21-35 State Extensions
  const [riskTimeline, setRiskTimeline] = useState<any>(null);
  const [confidenceBreakdown, setConfidenceBreakdown] = useState<any>(null);
  const [dataCompleteness, setDataCompleteness] = useState<any>(null);
  const [dependencyMap, setDependencyMap] = useState<any>(null);
  const [incidentImpact, setIncidentImpact] = useState<any>(null);
  const [similarCases, setSimilarCases] = useState<any>(null);
  const [strategySimulator, setStrategySimulator] = useState<any>(null);
  const [feedbackStats, setFeedbackStats] = useState<any>(null);
  const [feedbackSubmitted, setFeedbackSubmitted] = useState<boolean>(false);
  const [selectedStrategy, setSelectedStrategy] = useState<string>('Immediate Repair (CFRP)');

  const fetchCollab = () => {
    fetch(`http://localhost:8000/api/enterprise/assets/${assetId}/collaboration`)
      .then(res => res.json())
      .then(setCollab)
      .catch(err => console.error(err));
  };

  useEffect(() => {
    if (!assetId) return;

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

    // Fetch all extra endpoints
    fetch(`http://localhost:8000/api/enterprise/assets/${assetId}/root-cause`).then(res => res.json()).then(setRootCause).catch(err => console.error(err));
    fetch(`http://localhost:8000/api/enterprise/assets/${assetId}/forecast`).then(res => res.json()).then(setForecast).catch(err => console.error(err));
    fetch(`http://localhost:8000/api/enterprise/assets/${assetId}/repair-comparison`).then(res => res.json()).then(setRepairComparison).catch(err => console.error(err));
    fetch(`http://localhost:8000/api/enterprise/assets/${assetId}/story`).then(res => res.json()).then(setStory).catch(err => console.error(err));
    fetch(`http://localhost:8000/api/enterprise/assets/${assetId}/graph`).then(res => res.json()).then(setGraph).catch(err => console.error(err));
    fetch(`http://localhost:8000/api/enterprise/assets/${assetId}/risk-timeline`).then(res => res.json()).then(setRiskTimeline).catch(err => console.error(err));
    fetch(`http://localhost:8000/api/enterprise/assets/${assetId}/confidence-breakdown`).then(res => res.json()).then(setConfidenceBreakdown).catch(err => console.error(err));
    fetch(`http://localhost:8000/api/enterprise/assets/${assetId}/data-completeness`).then(res => res.json()).then(setDataCompleteness).catch(err => console.error(err));
    fetch(`http://localhost:8000/api/enterprise/assets/${assetId}/dependency-map`).then(res => res.json()).then(setDependencyMap).catch(err => console.error(err));
    fetch(`http://localhost:8000/api/enterprise/assets/${assetId}/incident-impact`).then(res => res.json()).then(setIncidentImpact).catch(err => console.error(err));
    fetch(`http://localhost:8000/api/enterprise/assets/${assetId}/similar-cases`).then(res => res.json()).then(setSimilarCases).catch(err => console.error(err));
    fetch(`http://localhost:8000/api/enterprise/assets/${assetId}/recommendation-simulator`).then(res => res.json()).then(setStrategySimulator).catch(err => console.error(err));
    fetch(`http://localhost:8000/api/enterprise/assets/${assetId}/feedback-stats`).then(res => res.json()).then(setFeedbackStats).catch(err => console.error(err));
    fetchCollab();
  }, [assetId]);

  const submitFeedback = (action: string) => {
    fetch(`http://localhost:8000/api/enterprise/assets/${assetId}/feedback`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: action, notes: "Evaluated by engineer" })
    })
      .then(() => {
        setFeedbackSubmitted(true);
        fetch(`http://localhost:8000/api/enterprise/assets/${assetId}/feedback-stats`)
          .then(res => res.json())
          .then(setFeedbackStats);
      });
  };

  const handlePostComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    fetch(`http://localhost:8000/api/enterprise/assets/${assetId}/collaboration/comment`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ author: collabAuthor, content: newComment })
    })
    .then(() => {
      setNewComment('');
      fetchCollab();
    });
  };

  const handlePostTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTask.trim()) return;

    fetch(`http://localhost:8000/api/enterprise/assets/${assetId}/collaboration/task`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title: newTask, priority: 'Medium' })
    })
    .then(() => {
      setNewTask('');
      fetchCollab();
    });
  };

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
      `# PRAHARI AI - Inspection Report \nAsset: ${data.name}\nDate: ${new Date(selectedInspection.inspection_date).toLocaleDateString()}`;
    
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
      <ThreeDConstellation />
      <div className="max-w-7xl mx-auto space-y-6 relative z-10">
        
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
        <ThreeDTilt>
          <section className="glass-panel rounded-2xl p-6 shadow-glass grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
            <div className="md:col-span-3">
              <img
                src={data.image_url || getAssetImageUrl(data.type, data.id, 600, 400)}
                alt={data.name}
                className="w-full h-44 object-cover rounded-xl border border-dark-border shadow-lg"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = `https://source.unsplash.com/600x400/?infrastructure,india&sig=${data.id.length * 7}`;
                }}
              />
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
        </ThreeDTilt>

        {/* AI Memory and Replay Container */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Diagnostic Deck Column (Left) */}
          <ThreeDTilt className="lg:col-span-8">
            <div className="glass-panel rounded-2xl p-6 shadow-glass flex flex-col justify-between h-full">
              
              {/* Tab Bar selector */}
              <div className="flex flex-wrap gap-2 border-b border-dark-border pb-3 mb-4 text-xs font-bold uppercase font-mono">
                <button
                  onClick={() => setActiveSubTab('timeline')}
                  className={`py-1.5 px-3 rounded transition-all ${activeSubTab === 'timeline' ? 'bg-brand-primary text-white font-bold' : 'text-dark-muted hover:text-white border border-transparent'}`}
                >
                  Chronological Replay
                </button>
                <button
                  onClick={() => setActiveSubTab('root-cause')}
                  className={`py-1.5 px-3 rounded transition-all ${activeSubTab === 'root-cause' ? 'bg-brand-primary text-white font-bold' : 'text-dark-muted hover:text-white border border-transparent'}`}
                >
                  Root Cause & Story
                </button>
                <button
                  onClick={() => setActiveSubTab('forecast')}
                  className={`py-1.5 px-3 rounded transition-all ${activeSubTab === 'forecast' ? 'bg-brand-primary text-white font-bold' : 'text-dark-muted hover:text-white border border-transparent'}`}
                >
                  Forecasting & Repair
                </button>
                <button
                  onClick={() => setActiveSubTab('graph')}
                  className={`py-1.5 px-3 rounded transition-all ${activeSubTab === 'graph' ? 'bg-brand-primary text-white font-bold' : 'text-dark-muted hover:text-white border border-transparent'}`}
                >
                  Knowledge Graph
                </button>
                <button
                  onClick={() => setActiveSubTab('collaboration')}
                  className={`py-1.5 px-3 rounded transition-all ${activeSubTab === 'collaboration' ? 'bg-brand-primary text-white font-bold' : 'text-dark-muted hover:text-white border border-transparent'}`}
                >
                  Collab Hub
                </button>
                <button
                  onClick={() => setActiveSubTab('risk-timeline')}
                  className={`py-1.5 px-3 rounded transition-all ${activeSubTab === 'risk-timeline' ? 'bg-brand-primary text-white font-bold' : 'text-dark-muted hover:text-white border border-transparent'}`}
                >
                  Risk Explorer
                </button>
                <button
                  onClick={() => setActiveSubTab('xai-diagnostics')}
                  className={`py-1.5 px-3 rounded transition-all ${activeSubTab === 'xai-diagnostics' ? 'bg-brand-primary text-white font-bold' : 'text-dark-muted hover:text-white border border-transparent'}`}
                >
                  XAI Metrics
                </button>
                <button
                  onClick={() => setActiveSubTab('impact-map')}
                  className={`py-1.5 px-3 rounded transition-all ${activeSubTab === 'impact-map' ? 'bg-brand-primary text-white font-bold' : 'text-dark-muted hover:text-white border border-transparent'}`}
                >
                  Topological Impact
                </button>
                <button
                  onClick={() => setActiveSubTab('strategy-sim')}
                  className={`py-1.5 px-3 rounded transition-all ${activeSubTab === 'strategy-sim' ? 'bg-brand-primary text-white font-bold' : 'text-dark-muted hover:text-white border border-transparent'}`}
                >
                  Strategy Sim
                </button>
              </div>

              {activeSubTab === 'timeline' && (
                <div className="space-y-6 flex-1 flex flex-col justify-between">
                  <div className="flex items-center justify-between pb-4 border-b border-dark-border mb-2">
                    <div>
                      <h3 className="font-display font-bold text-base text-gray-200 flex items-center space-x-2">
                        <Clock className="w-5 h-5 text-brand-primary" />
                        <span>Timeline Replay</span>
                      </h3>
                      <p className="text-[11px] text-dark-muted">Scroll the slider to review historical structural deterioration scans.</p>
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
              )}

              {/* Tab 2: Root Cause & Story */}
              {activeSubTab === 'root-cause' && rootCause && (
                <div className="space-y-6 text-xs flex-1">
                  
                  {/* Root Cause Panel */}
                  <div className="p-4 bg-dark-bg/60 border border-dark-border rounded-xl space-y-3">
                    <div className="flex justify-between items-center border-b border-dark-border pb-2">
                      <span className="text-[10px] text-brand-primary font-bold uppercase tracking-wider">AI Root Cause Analysis</span>
                      <span className="text-[10px] bg-brand-primary/10 border border-brand-primary/20 text-brand-primary py-0.5 px-2 rounded-full font-bold">
                        Confidence: {rootCause.confidence}%
                      </span>
                    </div>

                    <div>
                      <span className="text-[9px] text-dark-muted uppercase font-bold block">Assessed Root Cause</span>
                      <p className="text-sm font-bold text-white mt-0.5">{rootCause.root_cause}</p>
                    </div>

                    <div>
                      <span className="text-[9px] text-dark-muted uppercase font-bold block">Supporting Evidence</span>
                      <p className="text-gray-300 mt-0.5 leading-relaxed">{rootCause.evidence}</p>
                    </div>

                    <div>
                      <span className="text-[9px] text-dark-muted uppercase font-bold block">Engineering Reference Codes</span>
                      <div className="flex flex-wrap gap-1.5 mt-1">
                        {rootCause.supporting_documents?.map((doc: string, idx: number) => (
                          <span key={idx} className="bg-purple-950/30 border border-purple-500/20 text-purple-300 py-0.5 px-2 rounded font-mono text-[9px]">{doc}</span>
                        ))}
                      </div>
                    </div>

                    <div>
                      <span className="text-[9px] text-dark-muted uppercase font-bold block">Preventive Recommendation</span>
                      <p className="text-gray-300 mt-0.5 leading-relaxed">{rootCause.preventive_recommendation}</p>
                    </div>
                  </div>

                  {/* Story Mode Timeline */}
                  {story && (
                    <div className="space-y-3">
                      <h4 className="text-[10px] text-dark-muted uppercase font-bold tracking-wider">Infrastructure Story Mode</h4>
                      <div className="relative border-l border-dark-border ml-2 pl-4 space-y-4">
                        {story.story_timeline?.map((step: any, idx: number) => (
                          <div key={idx} className="relative">
                            <span className="absolute -left-[21px] top-1 w-2.5 h-2.5 rounded-full bg-brand-primary border-2 border-dark-bg" />
                            <div className="space-y-0.5">
                              <span className="font-mono text-[10px] text-brand-primary font-bold">{step.year} &bull; {step.event}</span>
                              <p className="text-gray-300 leading-normal">{step.description}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Tab 3: Forecasting & Strategies */}
              {activeSubTab === 'forecast' && forecast && (
                <div className="space-y-6 text-xs flex-1">
                  
                  {/* Projections grid */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    {forecast.projections?.map((proj: any, idx: number) => (
                      <div key={idx} className="p-3 bg-dark-bg/60 border border-dark-border rounded-xl">
                        <span className="text-[9px] text-dark-muted uppercase font-bold block">{proj.label}</span>
                        <span className="text-lg font-black text-white mt-1 block">{proj.health}%</span>
                        <span className={`inline-block text-[8px] font-bold px-1.5 py-0.5 rounded mt-1.5 ${
                          proj.risk === 'Critical' ? 'bg-brand-danger/10 text-brand-danger border border-brand-danger/20' :
                          proj.risk === 'Warning' ? 'bg-brand-warning/10 text-brand-warning' : 'bg-brand-success/10 text-brand-success'
                        }`}>
                          {proj.risk} Risk
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* Repair strategy comparison list */}
                  {repairComparison && (
                    <div className="space-y-3">
                      <h4 className="text-[10px] text-dark-muted uppercase font-bold tracking-wider">Repair Strategy Comparison</h4>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {repairComparison.options?.map((opt: any, idx: number) => (
                          <div 
                            key={idx} 
                            className={`p-3.5 rounded-xl border flex flex-col justify-between h-52 ${
                              opt.ai_recommendation ? 'bg-brand-primary/5 border-brand-primary/50 shadow-glow' : 'bg-dark-card border-dark-border'
                            }`}
                          >
                            <div>
                              <div className="flex justify-between items-start">
                                <span className="text-[9px] font-black uppercase text-gray-200 truncate max-w-[120px]">{opt.name}</span>
                                {opt.ai_recommendation && <span className="text-[8px] bg-brand-primary text-white py-0.5 px-1.5 rounded uppercase font-bold">AI Rec</span>}
                              </div>
                              
                              <p className="text-[10px] text-dark-muted mt-2 line-clamp-3 leading-relaxed">{opt.benefits}</p>
                              <p className="text-[9px] text-brand-danger mt-1.5 truncate">Trade-offs: {opt.trade_offs}</p>
                            </div>

                            <div className="border-t border-dark-border/40 pt-2 mt-2 flex justify-between items-center text-[10px] font-mono">
                              <span className="text-dark-muted">Cost:</span>
                              <span className="font-bold text-white">${opt.cost.toLocaleString()}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Tab 4: Knowledge Graph Visualizer */}
              {activeSubTab === 'graph' && graph && (
                <div className="flex-1 flex flex-col items-center justify-center min-h-[320px]">
                  <h4 className="text-[10px] text-dark-muted uppercase font-bold tracking-wider mb-2 self-start">Interactive Infrastructure Knowledge Graph</h4>
                  <div className="w-full bg-dark-bg/60 border border-dark-border rounded-xl p-2 relative overflow-hidden flex items-center justify-center">
                    <svg className="w-full h-80" viewBox="0 0 400 360">
                      {/* Lines/Edges */}
                      {graph.edges?.map((e: any, idx: number) => {
                        const sNodeIdx = graph.nodes.findIndex((n: any) => n.id === e.source);
                        const tNodeIdx = graph.nodes.findIndex((n: any) => n.id === e.target);
                        if (sNodeIdx === -1 || tNodeIdx === -1) return null;

                        // Layout coords mapping
                        const totalNodes = graph.nodes.length;
                        const sAngle = (sNodeIdx / totalNodes) * 2 * Math.PI;
                        const tAngle = (tNodeIdx / totalNodes) * 2 * Math.PI;
                        const r = 100;
                        const sx = 200 + r * Math.cos(sAngle);
                        const sy = 180 + r * Math.sin(sAngle);
                        const tx = 200 + r * Math.cos(tAngle);
                        const ty = 180 + r * Math.sin(tAngle);

                        return (
                          <g key={idx}>
                            <line x1={sx} y1={sy} x2={tx} y2={ty} stroke="rgba(255,255,255,0.15)" strokeWidth={1} />
                            <text x={(sx+tx)/2} y={(sy+ty)/2 - 3} fill="#9ca3af" fontSize={6} textAnchor="middle" fontStyle="italic">{e.label}</text>
                          </g>
                        );
                      })}

                      {/* Circles/Nodes */}
                      {graph.nodes?.map((n: any, idx: number) => {
                        const totalNodes = graph.nodes.length;
                        const angle = (idx / totalNodes) * 2 * Math.PI;
                        const r = 100;
                        const x = 200 + r * Math.cos(angle);
                        const y = 180 + r * Math.sin(angle);

                        return (
                          <g key={idx} className="cursor-pointer">
                            <circle cx={x} cy={y} r={14} fill={n.color} stroke="rgba(255,255,255,0.2)" strokeWidth={2} />
                            <text x={x} y={y+25} fill="#fff" fontSize={7} textAnchor="middle" fontWeight="bold">{n.label}</text>
                            <text x={x} y={y+3} fill="#fff" fontSize={5} textAnchor="middle" fontWeight="bold">{n.type[0]}</text>
                          </g>
                        );
                      })}
                    </svg>
                  </div>
                </div>
              )}

              {/* Tab 5: Collaboration Hub */}
              {activeSubTab === 'collaboration' && collab && (
                <div className="space-y-6 text-xs flex-1 flex flex-col justify-between">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 flex-1 items-start animate-fade-in">
                    
                    {/* Comments Thread */}
                    <div className="space-y-3 h-full flex flex-col justify-between">
                      <h4 className="text-[10px] text-dark-muted uppercase font-bold tracking-wider">Engineering Discussion Thread</h4>
                      
                      <div className="space-y-2.5 overflow-y-auto max-h-48 flex-1 pr-1 bg-dark-bg/40 border border-dark-border p-3 rounded-xl min-h-[140px]">
                        {collab.comments?.map((c: any) => (
                          <div key={c.id} className="p-2.5 bg-dark-card border border-dark-border/40 rounded-lg">
                            <div className="flex justify-between items-center text-[9px] font-mono text-dark-muted">
                              <span className="font-bold text-brand-primary">{c.author}</span>
                              <span>{c.created_at}</span>
                            </div>
                            <p className="text-gray-300 mt-1 leading-relaxed">{c.content}</p>
                          </div>
                        ))}
                      </div>

                      <form onSubmit={handlePostComment} className="flex gap-2 pt-2">
                        <input
                          type="text"
                          placeholder="Type comment message..."
                          value={newComment}
                          onChange={(e) => setNewComment(e.target.value)}
                          className="flex-1 bg-dark-bg/60 border border-dark-border rounded px-3 py-1.5 focus:outline-none focus:border-brand-primary text-xs"
                        />
                        <button type="submit" className="bg-brand-primary text-white font-bold py-1.5 px-4 rounded hover:bg-brand-primary/85 transition-all text-xs">
                          Post
                        </button>
                      </form>
                    </div>

                    {/* Task Board */}
                    <div className="space-y-3 h-full flex flex-col justify-between">
                      <h4 className="text-[10px] text-dark-muted uppercase font-bold tracking-wider">Team Interventions Tasks</h4>
                      
                      <div className="space-y-2.5 overflow-y-auto max-h-48 flex-1 pr-1 bg-dark-bg/40 border border-dark-border p-3 rounded-xl min-h-[140px]">
                        {collab.tasks?.map((t: any) => (
                          <div key={t.id} className="p-2.5 bg-dark-card border border-dark-border/40 rounded-lg flex justify-between items-center">
                            <div>
                              <span className="font-bold text-gray-200">{t.title}</span>
                              <div className="text-[9px] text-dark-muted font-mono mt-0.5">Assignee: {t.assigned_to || 'Unassigned'}</div>
                            </div>
                            <span className="text-[8px] font-bold py-0.5 px-2 bg-brand-danger/10 text-brand-danger rounded">
                              {t.priority}
                            </span>
                          </div>
                        ))}
                      </div>

                      <form onSubmit={handlePostTask} className="flex gap-2 pt-2">
                        <input
                          type="text"
                          placeholder="Add new team task..."
                          value={newTask}
                          onChange={(e) => setNewTask(e.target.value)}
                          className="flex-1 bg-dark-bg/60 border border-dark-border rounded px-3 py-1.5 focus:outline-none focus:border-brand-primary text-xs"
                        />
                        <button type="submit" className="bg-purple-600 text-white font-bold py-1.5 px-4 rounded hover:bg-purple-600/85 transition-all text-xs">
                          Assign
                        </button>
                      </form>
                    </div>

                  </div>
                </div>
              )}

              {/* Tab 6: Risk Timeline Explorer */}
              {activeSubTab === 'risk-timeline' && riskTimeline && (
                <div className="space-y-6 text-xs flex-1">
                  <h4 className="text-[10px] text-dark-muted uppercase font-bold tracking-wider">AI Risk Timeline Explorer</h4>
                  <div className="relative border-l border-dark-border ml-2 pl-4 space-y-4">
                    {riskTimeline.events?.map((ev: any, idx: number) => (
                      <div key={idx} className="relative">
                        <span className="absolute -left-[21px] top-1 w-2.5 h-2.5 rounded-full bg-brand-primary border-2 border-dark-bg" />
                        <div className="space-y-0.5">
                          <span className="font-mono text-[10px] text-brand-primary font-bold">{ev.date} &bull; {ev.event}</span>
                          <span className={`inline-block text-[8px] font-bold px-1.5 py-0.5 rounded ml-2 ${
                            ev.risk === 'Critical' ? 'bg-brand-danger/10 text-brand-danger border border-brand-danger/20' :
                            ev.risk === 'Warning' ? 'bg-brand-warning/10 text-brand-warning' : 'bg-brand-success/10 text-brand-success font-bold'
                          }`}>{ev.risk} ({ev.health}%)</span>
                          <p className="text-gray-300 leading-normal mt-0.5">{ev.notes}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Tab 7: Explainable Confidence Analyzer */}
              {activeSubTab === 'xai-diagnostics' && confidenceBreakdown && (
                <div className="space-y-6 text-xs flex-1">
                  <div className="flex justify-between items-center border-b border-dark-border pb-2.5">
                    <h4 className="text-[10px] text-dark-muted uppercase font-bold tracking-wider">Explainable Confidence Analyzer</h4>
                    <span className="text-[10px] bg-brand-primary/10 border border-brand-primary/20 text-brand-primary py-0.5 px-2 rounded-full font-bold">
                      Overall Trust Index: {confidenceBreakdown.overall_confidence}%
                    </span>
                  </div>

                  <div className="space-y-4">
                    {confidenceBreakdown.breakdown?.map((item: any, idx: number) => (
                      <div key={idx} className="p-3 bg-dark-bg/60 border border-dark-border rounded-xl space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="font-bold text-white text-xs">{item.category}</span>
                          <span className="font-mono text-brand-primary font-bold">{item.score}%</span>
                        </div>
                        <div className="w-full bg-dark-bg/60 border border-dark-border h-1.5 rounded-full overflow-hidden">
                          <div className="h-full bg-brand-primary rounded-full" style={{ width: `${item.score}%` }} />
                        </div>
                        <div className="grid grid-cols-2 gap-3 text-[10px] pt-1">
                          <div>
                            <span className="text-brand-success font-bold block">&bull; Impact factors:</span>
                            <p className="text-dark-muted leading-relaxed">{item.why_increased}</p>
                          </div>
                          <div>
                            <span className="text-brand-danger font-bold block">&bull; Risk factors:</span>
                            <p className="text-dark-muted leading-relaxed">{item.why_decreased}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {dataCompleteness && (
                    <div className="p-4 bg-purple-950/10 border border-purple-500/20 rounded-xl space-y-3 mt-4">
                      <div className="flex justify-between items-center border-b border-purple-500/20 pb-2">
                        <span className="text-[10px] text-purple-300 font-bold uppercase tracking-wider block">AI Data Completeness Monitor</span>
                        <span className="font-bold text-purple-300 font-mono">Quality Score: {dataCompleteness.completeness_score}%</span>
                      </div>
                      <div className="grid grid-cols-2 gap-3 text-[10px]">
                        {dataCompleteness.checks?.map((chk: any, i: number) => (
                          <div key={i} className="flex justify-between items-center text-gray-300">
                            <span>{chk.parameter}</span>
                            <span className={chk.status === 'Passed' ? 'text-brand-success font-bold' : 'text-brand-warning font-bold'}>
                              {chk.status} ({chk.score}%)
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Tab 8: Dependency Map Graph */}
              {activeSubTab === 'impact-map' && dependencyMap && (
                <div className="space-y-6 text-xs flex-1 flex flex-col justify-between">
                  <h4 className="text-[10px] text-dark-muted uppercase font-bold tracking-wider">Topological Infrastructure Dependency Graph</h4>
                  
                  {incidentImpact && (
                    <div className="p-3 bg-brand-danger/10 border border-brand-danger/25 text-brand-danger rounded-xl leading-relaxed text-[11px] mb-3">
                      <strong>Cascading Impact Evaluation:</strong> Structural failures would compromise Emergency Route transit to Hospital: {incidentImpact.emergency_response}
                    </div>
                  )}

                  <div className="w-full bg-dark-bg/60 border border-dark-border rounded-xl p-2 relative overflow-hidden flex items-center justify-center min-h-[220px]">
                    <svg className="w-full h-60" viewBox="0 0 360 220">
                      {dependencyMap.edges?.map((e: any, idx: number) => {
                        const sNodeIdx = dependencyMap.nodes.findIndex((n: any) => n.id === e.source);
                        const tNodeIdx = dependencyMap.nodes.findIndex((n: any) => n.id === e.target);
                        if (sNodeIdx === -1 || tNodeIdx === -1) return null;

                        const sy = 110;
                        const sx = 40 + sNodeIdx * 70;
                        const ty = 110;
                        const tx = 40 + tNodeIdx * 70;

                        return (
                          <g key={idx}>
                            <line x1={sx} y1={sy} x2={tx} y2={ty} stroke="rgba(255,255,255,0.2)" strokeWidth={1} strokeDasharray="3 3" />
                            <text x={(sx+tx)/2} y={sy - 4} fill="#f59e0b" fontSize={5} textAnchor="middle">{e.label}</text>
                          </g>
                        );
                      })}

                      {dependencyMap.nodes?.map((n: any, idx: number) => {
                        const y = 110;
                        const x = 40 + idx * 70;

                        return (
                          <g key={idx}>
                            <circle cx={x} cy={y} r={12} fill={n.status === 'Critical' ? '#ef4444' : (n.status === 'Warning' ? '#f59e0b' : '#10b981')} stroke="rgba(255,255,255,0.15)" strokeWidth={1.5} />
                            <text x={x} y={y+20} fill="#fff" fontSize={5} textAnchor="middle" fontWeight="bold">{n.label}</text>
                            <text x={x} y={y+35} fill="#9ca3af" fontSize={4} textAnchor="middle">{n.desc}</text>
                          </g>
                        );
                      })}
                    </svg>
                  </div>

                  {incidentImpact && (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-2">
                      <div className="p-3 bg-dark-bg/60 border border-dark-border rounded-xl">
                        <span className="text-[9px] text-dark-muted uppercase font-bold block">Socio-Economic Impact</span>
                        <span className="text-sm font-black text-white mt-1 block uppercase">{incidentImpact.economic_category} Risk</span>
                      </div>
                      <div className="p-3 bg-dark-bg/60 border border-dark-border rounded-xl">
                        <span className="text-[9px] text-dark-muted uppercase font-bold block">Traffic Delays</span>
                        <p className="text-[9px] text-gray-300 leading-normal mt-0.5">{incidentImpact.traffic_disruption}</p>
                      </div>
                      <div className="p-3 bg-dark-bg/60 border border-dark-border rounded-xl">
                        <span className="text-[9px] text-dark-muted uppercase font-bold block">Environmental Risks</span>
                        <p className="text-[9px] text-gray-300 leading-normal mt-0.5">{incidentImpact.environmental_impact}</p>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Tab 9: Strategy Recommendation Simulator */}
              {activeSubTab === 'strategy-sim' && strategySimulator && (
                <div className="space-y-6 text-xs flex-1">
                  <div className="flex justify-between items-center border-b border-dark-border pb-2">
                    <h4 className="text-[10px] text-dark-muted uppercase font-bold tracking-wider">AI Recommendation Strategy Simulator</h4>
                    <span className="text-[9px] text-dark-muted">Evaluate and record engineering feedback loops</span>
                  </div>

                  <div className="flex gap-2 bg-dark-card border border-dark-border p-1 rounded-lg">
                    {strategySimulator.strategies?.map((st: any, i: number) => (
                      <button
                        key={i}
                        onClick={() => setSelectedStrategy(st.name)}
                        className={`flex-1 py-1 rounded text-[9px] font-bold transition-all ${
                          selectedStrategy === st.name ? 'bg-brand-primary text-white' : 'text-dark-muted hover:text-white'
                        }`}
                      >
                        {st.name}
                      </button>
                    ))}
                  </div>

                  {(() => {
                    const strat = strategySimulator.strategies?.find((s: any) => s.name === selectedStrategy);
                    if (!strat) return null;
                    return (
                      <div className="p-4 bg-dark-bg/60 border border-dark-border rounded-xl space-y-3 animate-fade-in">
                        <div className="flex justify-between items-center">
                          <span className="font-bold text-white text-sm">{strat.name}</span>
                          <span className="font-mono text-brand-primary font-bold">Target Health: {strat.expected_risk}</span>
                        </div>
                        <div>
                          <span className="text-[9px] text-dark-muted uppercase font-bold">Advantages</span>
                          <p className="text-gray-300 leading-relaxed mt-0.5">{strat.advantages}</p>
                        </div>
                        <div>
                          <span className="text-[9px] text-dark-muted uppercase font-bold">Trade-offs</span>
                          <p className="text-brand-warning leading-relaxed mt-0.5">{strat.trade_offs}</p>
                        </div>
                        <div className="grid grid-cols-2 gap-3 text-[10px] border-t border-dark-border/40 pt-2.5">
                          <div>
                            <span className="text-dark-muted block uppercase">AI Reasoning</span>
                            <span className="text-gray-300 font-bold mt-0.5 block">{strat.ai_reasoning}</span>
                          </div>
                          <div>
                            <span className="text-dark-muted block uppercase">Code grounded guidelines</span>
                            <span className="text-gray-300 font-bold mt-0.5 block">{strat.engineering_guidance}</span>
                          </div>
                        </div>

                        <div className="border-t border-dark-border/40 pt-3 flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <button
                              onClick={() => submitFeedback('Accept')}
                              disabled={feedbackSubmitted}
                              className="bg-brand-success hover:bg-brand-success/80 disabled:opacity-50 text-white font-bold py-1.5 px-3 rounded text-[10px] uppercase font-mono"
                            >
                              Accept Strategy
                            </button>
                            <button
                              onClick={() => submitFeedback('Modify')}
                              disabled={feedbackSubmitted}
                              className="bg-brand-warning hover:bg-brand-warning/80 disabled:opacity-50 text-white font-bold py-1.5 px-3 rounded text-[10px] uppercase font-mono"
                            >
                              Modify Parameters
                            </button>
                            <button
                              onClick={() => submitFeedback('Reject')}
                              disabled={feedbackSubmitted}
                              className="bg-brand-danger/25 hover:bg-brand-danger/40 border border-brand-danger/30 disabled:opacity-50 text-brand-danger font-bold py-1.5 px-3 rounded text-[10px] uppercase font-mono"
                            >
                              Reject
                            </button>
                          </div>

                          {feedbackStats && (
                            <span className="text-[9px] text-dark-muted font-mono font-bold">
                              Cumulative accept stats: {feedbackStats.acceptance_rate}%
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })()}

                  {similarCases && (
                    <div className="space-y-3 mt-4">
                      <h4 className="text-[10px] text-dark-muted uppercase font-bold tracking-wider">Similar Cases Recommendation Engine</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {similarCases.similar_cases?.map((c: any, i: number) => (
                          <div key={i} className="p-3.5 bg-dark-card border border-dark-border rounded-xl space-y-2 flex flex-col justify-between h-48">
                            <div>
                              <div className="flex justify-between items-center text-[10px]">
                                <span className="font-bold text-white">{c.name}</span>
                                <span className="text-brand-primary font-bold font-mono">{c.similarity_score}% match</span>
                              </div>
                              <p className="text-[9.5px] text-dark-muted mt-1.5 line-clamp-3 leading-relaxed">
                                <strong>Anomalies:</strong> {c.damage_pattern}
                              </p>
                              <p className="text-[9px] text-brand-success mt-1">
                                <strong>Decision Outcome:</strong> {c.outcomes}
                              </p>
                            </div>
                            <span className="text-[8.5px] text-purple-400 font-mono uppercase block pt-1.5 border-t border-dark-border/40 truncate">Lessons: {c.lessons_learned}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </ThreeDTilt>

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
