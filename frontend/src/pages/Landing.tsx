import React from 'react';
import ReactFlow, { Background } from 'reactflow';
import 'reactflow/dist/style.css';
import { Shield, ArrowRight, Activity, Terminal, Layers, Cpu, Server } from 'lucide-react';

interface LandingProps {
  onEnterApp: () => void;
}

export const Landing: React.FC<LandingProps> = ({ onEnterApp }) => {
  // Define agent workflow nodes for React Flow
  const initialNodes = [
    {
      id: '1',
      data: { label: '🛰️ Inspector Agent (Vision AI)' },
      position: { x: 50, y: 30 },
      style: { background: 'rgba(59, 130, 246, 0.2)', color: '#fff', border: '1px solid #3b82f6', borderRadius: '8px', padding: '10px', width: 220 }
    },
    {
      id: '2',
      data: { label: '📄 Document Agent (OCR / NLP)' },
      position: { x: 300, y: 30 },
      style: { background: 'rgba(168, 85, 247, 0.2)', color: '#fff', border: '1px solid #a855f7', borderRadius: '8px', padding: '10px', width: 220 }
    },
    {
      id: '3',
      data: { label: '📚 Knowledge Agent (FAISS RAG)' },
      position: { x: 175, y: 120 },
      style: { background: 'rgba(236, 72, 153, 0.2)', color: '#fff', border: '1px solid #ec4899', borderRadius: '8px', padding: '10px', width: 220 }
    },
    {
      id: '4',
      data: { label: '👷 Structural Engineer Agent' },
      position: { x: 175, y: 210 },
      style: { background: 'rgba(245, 158, 11, 0.2)', color: '#fff', border: '1px solid #f59e0b', borderRadius: '8px', padding: '10px', width: 220 }
    },
    {
      id: '5',
      data: { label: '📊 Risk Analyst Agent' },
      position: { x: 175, y: 300 },
      style: { background: 'rgba(239, 68, 68, 0.2)', color: '#fff', border: '1px solid #ef4444', borderRadius: '8px', padding: '10px', width: 220 }
    },
    {
      id: '6',
      data: { label: '🎮 Simulation Agent (Digital Twin)' },
      position: { x: 175, y: 390 },
      style: { background: 'rgba(16, 185, 129, 0.2)', color: '#fff', border: '1px solid #10b981', borderRadius: '8px', padding: '10px', width: 220 }
    },
    {
      id: '7',
      data: { label: '📥 Report Agent (PDF Output)' },
      position: { x: 175, y: 480 },
      style: { background: 'rgba(59, 130, 246, 0.3)', color: '#fff', border: '1px solid #3b82f6', borderRadius: '8px', padding: '10px', width: 220 }
    }
  ];

  const initialEdges = [
    { id: 'e1-3', source: '1', target: '3', animated: true },
    { id: 'e2-3', source: '2', target: '3', animated: true },
    { id: 'e3-4', source: '3', target: '4', animated: true },
    { id: 'e4-5', source: '4', target: '5', animated: true },
    { id: 'e5-6', source: '5', target: '6', animated: true },
    { id: 'e6-7', source: '6', target: '7', animated: true }
  ];

  const features = [
    {
      icon: <Layers className="w-6 h-6 text-brand-primary" />,
      title: "Digital Twin Memories",
      description: "Aggregates weather metrics, repair logs, traffic cycles, and historical scans to build a learning structural twin."
    },
    {
      icon: <Shield className="w-6 h-6 text-brand-success" />,
      title: "Grounded RAG Search",
      description: "Cross-references structural cracking directly against building regulations (IS-456, IRC codes, NDMA manuals) to generate explainable AI advice."
    },
    {
      icon: <Activity className="w-6 h-6 text-brand-critical" />,
      title: "What-If Scenario Simulator",
      description: "Compare projected health scores and structural costs under heavy monsoons, traffic expansion, or delayed maintenance."
    }
  ];

  return (
    <div className="min-h-screen bg-dark-bg text-white relative">
      {/* Background radial effects */}
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none overflow-hidden z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-blue-500/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-pink-500/5 rounded-full blur-[120px]" />
      </div>

      {/* Navbar */}
      <nav className="relative max-w-7xl mx-auto px-6 py-4 flex items-center justify-between z-10 border-b border-dark-border bg-dark-bg/20 backdrop-blur-md">
        <div className="flex items-center space-x-3">
          <div className="bg-brand-primary/20 p-2 rounded border border-brand-primary/40 pulse-glow-blue">
            <Shield className="w-6 h-6 text-brand-primary" />
          </div>
          <span className="font-display text-2xl font-black tracking-wider bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-indigo-200 to-pink-400">
            AEGIS X
          </span>
        </div>
        <div className="flex items-center space-x-6">
          <span className="text-xs text-dark-muted font-mono tracking-widest hidden md:inline-block">
            V2.5.FLASH // MULTI-AGENT STATE ENGINE
          </span>
          <button 
            onClick={onEnterApp}
            className="bg-brand-primary hover:bg-brand-primary/80 text-white font-display text-sm font-bold py-2 px-5 rounded transition-all duration-300 shadow-glow flex items-center space-x-2"
          >
            <span>Launch Engine</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="relative max-w-7xl mx-auto px-6 py-16 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center z-10">
        {/* Left column */}
        <div className="lg:col-span-7 space-y-8">
          <div className="inline-flex items-center space-x-2 bg-dark-card border border-dark-border px-3 py-1.5 rounded text-xs text-brand-primary font-mono">
            <Cpu className="w-4 h-4 text-brand-primary animate-spin" style={{ animationDuration: '4s' }} />
            <span>EXPLAINABLE DECISION INTELLIGENCE PLATFORM</span>
          </div>
          
          <h1 className="font-display text-5xl md:text-6xl lg:text-7xl font-black leading-tight tracking-tight text-transparent bg-clip-text bg-gradient-to-br from-white via-gray-200 to-gray-400">
            Predict Infrastructure <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-indigo-300 to-pink-500">
              Disasters Before
            </span> <br />
            They Happen.
          </h1>

          <p className="text-lg text-dark-muted max-w-2xl leading-relaxed">
            AEGIS X is an enterprise AI-powered Predictive Infrastructure Digital Twin. 
            It leverages Gemini Vision, LangGraph multi-agent planning, and structural RAG standards 
            to evaluate inspection footage, model degradation, and compile compliance audit reports automatically.
          </p>

          <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
            <button 
              onClick={onEnterApp}
              className="bg-brand-primary hover:bg-brand-primary/85 text-white font-display font-bold py-3 px-8 rounded transition-all duration-300 shadow-glow flex items-center justify-center space-x-2"
            >
              <span>Access Control Panel</span>
              <ArrowRight className="w-5 h-5" />
            </button>
            <a 
              href="#agent-network" 
              className="border border-dark-border hover:bg-dark-hover py-3 px-8 rounded font-display font-semibold transition-colors flex items-center justify-center text-gray-300 hover:text-white"
            >
              System Topology
            </a>
          </div>

          {/* Metrics */}
          <div className="grid grid-cols-3 gap-6 pt-6 border-t border-dark-border max-w-lg">
            <div>
              <div className="text-2xl font-bold font-display text-brand-primary">7 Agents</div>
              <div className="text-xs text-dark-muted">Graph Network</div>
            </div>
            <div>
              <div className="text-2xl font-bold font-display text-brand-success">100%</div>
              <div className="text-xs text-dark-muted">Grounded RAG</div>
            </div>
            <div>
              <div className="text-2xl font-bold font-display text-brand-warning">&lt; 10s</div>
              <div className="text-xs text-dark-muted">Audit Time</div>
            </div>
          </div>
        </div>

        {/* Right column (Animated Mockup) */}
        <div className="lg:col-span-5 h-[480px] glass-panel rounded-2xl relative p-4 flex flex-col shadow-glass">
          <div className="flex items-center justify-between pb-3 border-b border-dark-border mb-3">
            <div className="flex space-x-1.5">
              <span className="w-3 h-3 bg-brand-danger/30 rounded-full" />
              <span className="w-3 h-3 bg-brand-warning/30 rounded-full" />
              <span className="w-3 h-3 bg-brand-success/30 rounded-full" />
            </div>
            <span className="text-[10px] font-mono text-dark-muted">AEGIS_AGENT_FLOW.PY</span>
          </div>
          
          {/* Simplified React Flow preview inside landing */}
          <div className="flex-1 rounded bg-black/40 border border-dark-border relative overflow-hidden">
            <ReactFlow
              nodes={initialNodes}
              edges={initialEdges}
              fitView
              zoomOnScroll={false}
              zoomOnDoubleClick={false}
              preventScrolling={true}
              nodesConnectable={false}
              nodesDraggable={false}
            >
              <Background color="rgba(255,255,255,0.08)" gap={16} size={1} />
            </ReactFlow>
          </div>
        </div>
      </main>

      {/* Features Grid */}
      <section className="relative max-w-7xl mx-auto px-6 py-20 border-t border-dark-border">
        <div className="text-center space-y-4 mb-16">
          <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight">
            Designed for Critical Infrastructure Safety
          </h2>
          <p className="text-dark-muted max-w-xl mx-auto">
            Decide with intelligence. Grounded engineering reasoning built upon standards, not stochastic guessing.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {features.map((f, idx) => (
            <div key={idx} className="glass-panel p-8 rounded-xl glass-panel-hover flex flex-col space-y-4">
              <div className="bg-dark-bg p-3 rounded-lg border border-dark-border w-fit">
                {f.icon}
              </div>
              <h3 className="font-display text-xl font-bold text-gray-200">{f.title}</h3>
              <p className="text-sm text-dark-muted leading-relaxed">{f.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* System Topology / Graph Details */}
      <section id="agent-network" className="relative max-w-7xl mx-auto px-6 py-20 border-t border-dark-border bg-black/10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight">
              LangGraph Orchestrated Agent Network
            </h2>
            <p className="text-dark-muted leading-relaxed">
              Every inspection triggers a parallel coordinate chain. 
              The Inspector identifies visually, the Document Agent scrapes notes, the Knowledge Agent vectors design codes, 
              and the Structural Engineer reconciles them. 
              Then the Risk Analyst models safety indices, and the Simulator projects 6-month timelines. 
              Finally, the Report Agent compiles the audit.
            </p>
            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <div className="bg-brand-primary/20 text-brand-primary p-1.5 rounded mt-0.5">
                  <Terminal className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="font-semibold text-gray-200 text-sm">Deterministic State Routing</h4>
                  <p className="text-xs text-dark-muted">No hallucinated agent loops. Ensures completion times are finite and state values persist.</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <div className="bg-brand-success/20 text-brand-success p-1.5 rounded mt-0.5">
                  <Server className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="font-semibold text-gray-200 text-sm">Local SQLite + Supabase Sync</h4>
                  <p className="text-xs text-dark-muted">Operates immediately offline. Easily links to standard enterprise cloud storage instances when requested.</p>
                </div>
              </div>
            </div>
          </div>
          
          <div className="glass-panel p-8 rounded-xl space-y-6">
            <div className="flex justify-between items-center text-xs text-brand-primary font-mono uppercase tracking-widest pb-4 border-b border-dark-border">
              <span>System Stack Integrations</span>
              <span>Online</span>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-dark-bg/60 border border-dark-border rounded">
                <div className="text-sm font-semibold text-gray-300">Gemini 2.5 Flash</div>
                <div className="text-[10px] text-dark-muted mt-1">Multi-modal AI Agent Reasoning</div>
              </div>
              <div className="p-4 bg-dark-bg/60 border border-dark-border rounded">
                <div className="text-sm font-semibold text-gray-300">LangGraph</div>
                <div className="text-[10px] text-dark-muted mt-1">State Coordination</div>
              </div>
              <div className="p-4 bg-dark-bg/60 border border-dark-border rounded">
                <div className="text-sm font-semibold text-gray-300">Leaflet Maps</div>
                <div className="text-[10px] text-dark-muted mt-1">Infrastructure Geolocator</div>
              </div>
              <div className="p-4 bg-dark-bg/60 border border-dark-border rounded">
                <div className="text-sm font-semibold text-gray-300">Recharts</div>
                <div className="text-[10px] text-dark-muted mt-1">Deterioration Curves</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-dark-border py-8 text-center text-xs text-dark-muted z-10 relative">
        <p>© 2026 AEGIS X. Fully compliance-grounded Engineering Decision Intelligence. All rights reserved.</p>
      </footer>
    </div>
  );
};
