import React, { useState, useEffect } from 'react';
import { Sparkles, Terminal, BookOpen, AlertTriangle, Cpu, CheckCircle } from 'lucide-react';
import { ThreeDTilt } from '../components/ThreeDTilt';
import { ThreeDConstellation } from '../components/ThreeDConstellation';

interface Asset {
  id: string;
  name: string;
  type: string;
  health: number;
  risk: string;
}

export const ExplainableAI: React.FC = () => {
  const [assets, setAssets] = useState<Asset[]>([]);
  const [selectedAssetId, setSelectedAssetId] = useState<string>('');
  const [selectedAsset, setSelectedAsset] = useState<Asset | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('http://localhost:8000/api/assets')
      .then(res => res.json())
      .then(data => {
        setAssets(data);
        if (data.length > 0) {
          setSelectedAssetId(data[0].id);
          setSelectedAsset(data[0]);
        }
        setLoading(false);
      })
      .catch(err => {
        console.error('Error fetching assets:', err);
        setLoading(false);
      });
  }, []);

  const handleAssetChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const aid = e.target.value;
    setSelectedAssetId(aid);
    const found = assets.find(a => a.id === aid);
    if (found) setSelectedAsset(found);
  };

  if (loading || !selectedAsset) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center space-y-4">
        <div className="w-12 h-12 border-4 border-brand-primary border-t-transparent rounded-full animate-spin" />
        <span className="text-sm font-mono text-dark-muted">Aligning neural explainability maps...</span>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-6 relative">
      <ThreeDConstellation />
      <div className="max-w-7xl mx-auto space-y-6 relative z-10">
        
        {/* Header */}
        <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-black text-white flex items-center space-x-2">
              <Sparkles className="w-8 h-8 text-purple-400 animate-pulse" />
              <span>EXPLAINABLE AI PORTAL</span>
            </h1>
            <p className="text-sm text-dark-muted">Deep inspection logs, vision coordinates, and code grounding citations.</p>
          </div>

          <div className="flex items-center space-x-2">
            <span className="text-xs text-dark-muted font-bold uppercase tracking-wider">Asset Focus:</span>
            <select
              value={selectedAssetId}
              onChange={handleAssetChange}
              className="bg-dark-card border border-dark-border text-gray-200 text-xs font-bold py-1.5 px-3 rounded focus:outline-none focus:border-brand-primary"
            >
              {assets.map(a => (
                <option key={a.id} value={a.id}>{a.name}</option>
              ))}
            </select>
          </div>
        </header>

        {/* Explainability Matrix Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Vision Node Trace (Left) */}
          <ThreeDTilt>
            <div className="glass-panel p-5 rounded-2xl flex flex-col justify-between h-full space-y-4">
              <div>
                <div className="flex items-center space-x-2 text-brand-primary mb-2">
                  <Cpu className="w-5 h-5 text-brand-primary" />
                  <span className="text-[10px] font-bold uppercase tracking-wider">Vision AI Sensor Trace</span>
                </div>
                <h3 className="font-display font-bold text-gray-200">Defect Detection Tensor</h3>
                <p className="text-xs text-dark-muted mt-1 leading-relaxed">
                  Pixel-coordinate mapping of identified cracks, rust expansion limits, and surface anomalies.
                </p>
              </div>

              <div className="bg-dark-bg/60 border border-dark-border rounded-xl p-4 font-mono text-[10px] space-y-2 text-gray-300">
                <div>[MODULE] InspectorAgent_Vision</div>
                <div>[STATUS] COMPLETED (confidence: 94.2%)</div>
                <div className="text-brand-success">[DETECTION 1] Diagonal Shear Crack</div>
                <div>&bull; BoundingBox: [X: 142, Y: 852, W: 38, H: 450]</div>
                <div>&bull; Width: 5.2mm &bull; Area: 1,710 mm²</div>
                <div className="text-brand-warning">[DETECTION 2] Span 3 Spalling</div>
                <div>&bull; BoundingBox: [X: 388, Y: 1204, W: 110, H: 85]</div>
                <div>&bull; Area: 9,350 mm² &bull; Steel exposed: YES</div>
              </div>
            </div>
          </ThreeDTilt>

          {/* Document OCR Trace (Center) */}
          <ThreeDTilt>
            <div className="glass-panel p-5 rounded-2xl flex flex-col justify-between h-full space-y-4">
              <div>
                <div className="flex items-center space-x-2 text-brand-warning mb-2">
                  <Terminal className="w-5 h-5 text-brand-warning" />
                  <span className="text-[10px] font-bold uppercase tracking-wider">OCR & NLP Document Grounding</span>
                </div>
                <h3 className="font-display font-bold text-gray-200">Contractor Note Parsing</h3>
                <p className="text-xs text-dark-muted mt-1 leading-relaxed">
                  Decoded text and metadata retrieved from uploaded contractor reports and written records.
                </p>
              </div>

              <div className="bg-dark-bg/60 border border-dark-border rounded-xl p-4 font-mono text-[10px] space-y-2 text-gray-300">
                <div>[MODULE] DocumentAgent_OCR</div>
                <div>[STATUS] COMPLETED (confidence: 89.5%)</div>
                <div>[PARSED TEXT SNIPPETS]:</div>
                <div className="text-dark-muted italic">
                  "...re-inspection of Pier 2 columns reveals a widening of the 2024 diagonal fissures. Plaster cover exhibits hollow sounds on impact..."
                </div>
                <div>[METADATA EXTRACTED]:</div>
                <div>&bull; Date: March 2026 &bull; Author: Dr. Prasad</div>
              </div>
            </div>
          </ThreeDTilt>

          {/* RAG Knowledge retrieval (Right) */}
          <ThreeDTilt>
            <div className="glass-panel p-5 rounded-2xl flex flex-col justify-between h-full space-y-4">
              <div>
                <div className="flex items-center space-x-2 text-purple-400 mb-2">
                  <BookOpen className="w-5 h-5 text-purple-400" />
                  <span className="text-[10px] font-bold uppercase tracking-wider">Semantic Knowledge RAG</span>
                </div>
                <h3 className="font-display font-bold text-gray-200">Guideline Code Citations</h3>
                <p className="text-xs text-dark-muted mt-1 leading-relaxed">
                  Retrieved clauses matching target anomalies from standard design codes (IS-456, IRC SP-18).
                </p>
              </div>

              <div className="bg-dark-bg/60 border border-dark-border rounded-xl p-4 font-mono text-[10px] space-y-2 text-gray-300">
                <div>[MODULE] KnowledgeAgent_RAG</div>
                <div>[STATUS] COMPLETED (grounded: 100%)</div>
                <div className="text-purple-300">&bull; IS 456:2000 Clause 11.3</div>
                <div className="text-dark-muted text-[9px] line-clamp-2">"Concrete cover must be rebuilt using polymer mortar..."</div>
                <div className="text-purple-300">&bull; IRC:SP-18 Section 4</div>
                <div className="text-dark-muted text-[9px] line-clamp-2">"Shear cracks &gt; 3mm mandate load restriction bypasses..."</div>
              </div>
            </div>
          </ThreeDTilt>

        </div>

        {/* Data Quality and Reliability Check */}
        <section className="glass-panel rounded-2xl p-6 shadow-glass relative overflow-hidden">
          <div className="flex items-center space-x-2 pb-4 border-b border-dark-border mb-4">
            <CheckCircle className="w-6 h-6 text-brand-success" />
            <h3 className="font-display font-bold text-gray-200">AI Confidence & Data Quality Dashboard</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 text-center">
            <div className="p-4 bg-dark-bg/60 border border-dark-border rounded-xl">
              <span className="text-[10px] text-dark-muted uppercase font-bold block">Image Quality</span>
              <span className="text-2xl font-black text-white mt-1 block">92%</span>
            </div>
            <div className="p-4 bg-dark-bg/60 border border-dark-border rounded-xl">
              <span className="text-[10px] text-dark-muted uppercase font-bold block">Completeness Index</span>
              <span className="text-2xl font-black text-white mt-1 block">95%</span>
            </div>
            <div className="p-4 bg-dark-bg/60 border border-dark-border rounded-xl">
              <span className="text-[10px] text-dark-muted uppercase font-bold block">Knowledge Match</span>
              <span className="text-2xl font-black text-white mt-1 block">90%</span>
            </div>
            <div className="p-4 bg-dark-bg/60 border border-dark-border rounded-xl">
              <span className="text-[10px] text-dark-muted uppercase font-bold block">Recommendation Trust</span>
              <span className="text-2xl font-black text-white mt-1 block">High</span>
            </div>
          </div>

          <div className="mt-4 bg-purple-950/20 border border-purple-500/20 rounded-xl p-4 flex items-center space-x-3 text-xs">
            <AlertTriangle className="w-5 h-5 text-purple-400 shrink-0" />
            <p className="text-purple-200">
              <strong>Explainability Warning:</strong> Model projections are grounded on 3 local inspection scans.
              Regional temperature variations are simulated using meteorological fallbacks since direct sensor telemetry is offline.
            </p>
          </div>
        </section>

      </div>
    </div>
  );
};
