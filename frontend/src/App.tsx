import { useState } from 'react';
import { Landing } from './pages/Landing';
import { Auth } from './pages/Auth';
import { Dashboard } from './pages/Dashboard';
import { AssetDetail } from './pages/AssetDetail';
import { Simulator } from './pages/Simulator';
import { UploadInspection } from './pages/UploadInspection';
import { NationalCommand } from './pages/NationalCommand';
import { Prioritization } from './pages/Prioritization';
import { ExplainableAI } from './pages/ExplainableAI';
import { ExecutiveDecision } from './pages/ExecutiveDecision';
import { Watchtower } from './pages/Watchtower';
import { KnowledgeCenter } from './pages/KnowledgeCenter';
import { Shield, Activity, Upload, LayoutDashboard, Globe, Brain, Sparkles, Landmark, TrendingUp, BookOpen } from 'lucide-react';

type Page = 'landing' | 'auth' | 'dashboard' | 'asset-detail' | 'simulator' | 'upload' | 'national-command' | 'prioritization' | 'explainable' | 'executive-decision' | 'watchtower' | 'knowledge-center';

function App() {
  const [currentPage, setCurrentPage] = useState<Page>('landing');
  const [selectedAssetId, setSelectedAssetId] = useState<string | undefined>(undefined);
  const [user, setUser] = useState<{ name: string; email: string; avatar: string } | null>(null);

  const handleSelectAsset = (assetId: string) => {
    setSelectedAssetId(assetId);
    setCurrentPage('asset-detail');
  };

  const handleNavigateToAsset = (assetId: string) => {
    setSelectedAssetId(assetId);
    setCurrentPage('asset-detail');
  };

  if (currentPage === 'landing') {
    return (
      <Landing 
        onEnterApp={() => {
          if (user) {
            setCurrentPage('dashboard');
          } else {
            setCurrentPage('auth');
          }
        }} 
      />
    );
  }

  if (currentPage === 'auth') {
    return (
      <Auth 
        onLoginSuccess={(userData) => {
          setUser(userData);
          setCurrentPage('dashboard');
        }}
        onBackToLanding={() => setCurrentPage('landing')}
      />
    );
  }

  return (
    <div className="min-h-screen bg-dark-bg text-white flex flex-col font-sans">
      {/* Dynamic backdrop glows */}
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none overflow-hidden z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-500/5 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-500/5 rounded-full blur-[120px]" />
      </div>

      {/* Global Command Bar Navbar */}
      <nav className="relative w-full border-b border-dark-border bg-dark-bg/40 backdrop-blur-md z-30">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div 
            onClick={() => setCurrentPage('landing')} 
            className="flex items-center space-x-2.5 cursor-pointer group"
          >
            <div className="bg-brand-primary/10 p-1.5 rounded border border-brand-primary/20 group-hover:border-brand-primary/60 transition-colors">
              <Shield className="w-5 h-5 text-brand-primary" />
            </div>
            <span className="font-display font-black text-lg tracking-wider text-white">
              PRAHARI AI
            </span>
          </div>

          <div className="flex items-center space-x-1.5 md:space-x-4">
            <button
              onClick={() => setCurrentPage('dashboard')}
              className={`py-1.5 px-3 rounded text-xs font-bold uppercase transition-all flex items-center space-x-1.5 ${
                currentPage === 'dashboard' || currentPage === 'asset-detail'
                  ? 'bg-brand-primary/10 border border-brand-primary/30 text-brand-primary'
                  : 'text-dark-muted hover:text-white border border-transparent'
              }`}
            >
              <LayoutDashboard className="w-3.5 h-3.5" />
              <span className="hidden lg:inline">Telemetry Command</span>
            </button>

            <button
              onClick={() => setCurrentPage('national-command')}
              className={`py-1.5 px-3 rounded text-xs font-bold uppercase transition-all flex items-center space-x-1.5 ${
                currentPage === 'national-command'
                  ? 'bg-brand-primary/10 border border-brand-primary/30 text-brand-primary'
                  : 'text-dark-muted hover:text-white border border-transparent'
              }`}
            >
              <Globe className="w-3.5 h-3.5" />
              <span className="hidden lg:inline">Command Center</span>
            </button>

            <button
              onClick={() => setCurrentPage('prioritization')}
              className={`py-1.5 px-3 rounded text-xs font-bold uppercase transition-all flex items-center space-x-1.5 ${
                currentPage === 'prioritization'
                  ? 'bg-brand-primary/10 border border-brand-primary/30 text-brand-primary'
                  : 'text-dark-muted hover:text-white border border-transparent'
              }`}
            >
              <Brain className="w-3.5 h-3.5" />
              <span className="hidden lg:inline">AI Priority</span>
            </button>

            <button
              onClick={() => {
                setSelectedAssetId(undefined);
                setCurrentPage('simulator');
              }}
              className={`py-1.5 px-3 rounded text-xs font-bold uppercase transition-all flex items-center space-x-1.5 ${
                currentPage === 'simulator'
                  ? 'bg-brand-primary/10 border border-brand-primary/30 text-brand-primary'
                  : 'text-dark-muted hover:text-white border border-transparent'
              }`}
            >
              <Activity className="w-3.5 h-3.5" />
              <span className="hidden lg:inline">Simulator</span>
            </button>

            <button
              onClick={() => setCurrentPage('explainable')}
              className={`py-1.5 px-3 rounded text-xs font-bold uppercase transition-all flex items-center space-x-1.5 ${
                currentPage === 'explainable'
                  ? 'bg-brand-primary/10 border border-brand-primary/30 text-brand-primary'
                  : 'text-dark-muted hover:text-white border border-transparent'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span className="hidden lg:inline">XAI Portal</span>
            </button>

            <button
              onClick={() => setCurrentPage('executive-decision')}
              className={`py-1.5 px-3 rounded text-xs font-bold uppercase transition-all flex items-center space-x-1.5 ${
                currentPage === 'executive-decision'
                  ? 'bg-brand-primary/10 border border-brand-primary/30 text-brand-primary'
                  : 'text-dark-muted hover:text-white border border-transparent'
              }`}
            >
              <Landmark className="w-3.5 h-3.5" />
              <span className="hidden lg:inline">Exec Deck</span>
            </button>

            <button
              onClick={() => setCurrentPage('upload')}
              className={`py-1.5 px-3 rounded text-xs font-bold uppercase transition-all flex items-center space-x-1.5 ${
                currentPage === 'upload'
                  ? 'bg-brand-primary/10 border border-brand-primary/30 text-brand-primary'
                  : 'text-dark-muted hover:text-white border border-transparent'
              }`}
            >
              <Upload className="w-3.5 h-3.5" />
              <span className="hidden lg:inline">Audit Upload</span>
            </button>

            <button
              onClick={() => setCurrentPage('watchtower')}
              className={`py-1.5 px-3 rounded text-xs font-bold uppercase transition-all flex items-center space-x-1.5 ${
                currentPage === 'watchtower'
                  ? 'bg-brand-primary/10 border border-brand-primary/30 text-brand-primary'
                  : 'text-dark-muted hover:text-white border border-transparent'
              }`}
            >
              <TrendingUp className="w-3.5 h-3.5" />
              <span className="hidden lg:inline">AI Watchtower</span>
            </button>

            <button
              onClick={() => setCurrentPage('knowledge-center')}
              className={`py-1.5 px-3 rounded text-xs font-bold uppercase transition-all flex items-center space-x-1.5 ${
                currentPage === 'knowledge-center'
                  ? 'bg-brand-primary/10 border border-brand-primary/30 text-brand-primary'
                  : 'text-dark-muted hover:text-white border border-transparent'
              }`}
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span className="hidden lg:inline">Knowledge Center</span>
            </button>

            {/* User Profile Menu / Auth State */}
            {user ? (
              <div className="relative group pl-2 border-l border-dark-border/40">
                <button className="flex items-center space-x-2 p-1 bg-dark-card border border-dark-border hover:border-brand-primary/40 rounded-xl transition-all select-none">
                  <img src={user.avatar} alt={user.name} className="w-7 h-7 rounded-lg border border-dark-border shrink-0 object-cover" />
                  <span className="hidden md:inline text-xs font-bold text-gray-200 group-hover:text-white max-w-[120px] truncate">{user.name}</span>
                </button>
                {/* Dropdown Menu on Hover */}
                <div className="absolute right-0 mt-2 w-48 bg-dark-card border border-dark-border p-2 rounded-xl shadow-glass opacity-0 group-hover:opacity-100 pointer-events-none group-hover:pointer-events-auto transition-all z-50">
                  <div className="px-2 py-1.5 border-b border-dark-border/40 mb-1 text-[9px] font-mono text-dark-muted truncate">
                    {user.email}
                  </div>
                  <button
                    onClick={() => {
                      setUser(null);
                      setCurrentPage('landing');
                    }}
                    className="w-full text-left py-1.5 px-2.5 text-xs font-semibold text-brand-danger hover:bg-brand-danger/10 rounded transition-colors"
                  >
                    Sign Out Session
                  </button>
                </div>
              </div>
            ) : (
              <button
                onClick={() => setCurrentPage('auth')}
                className="py-1.5 px-3.5 rounded text-xs font-bold uppercase transition-all bg-brand-primary text-white hover:bg-brand-primary/80 shadow-glow"
              >
                Sign In
              </button>
            )}
          </div>
        </div>
      </nav>

      {/* Pages render */}
      <main className="flex-1 z-10 relative">
        {currentPage === 'dashboard' && (
          <Dashboard 
            onSelectAsset={handleSelectAsset} 
            onNavigateToUpload={() => setCurrentPage('upload')}
            onNavigateToSimulator={() => setCurrentPage('simulator')}
          />
        )}
        
        {currentPage === 'asset-detail' && selectedAssetId && (
          <AssetDetail 
            assetId={selectedAssetId} 
            onBack={() => setCurrentPage('dashboard')}
            onNavigateToSimulator={() => setCurrentPage('simulator')}
          />
        )}

        {currentPage === 'simulator' && (
          <Simulator 
            selectedAssetId={selectedAssetId}
            onBack={() => setCurrentPage('dashboard')} 
          />
        )}

        {currentPage === 'upload' && (
          <UploadInspection 
            onBack={() => setCurrentPage('dashboard')}
            onNavigateToAsset={handleNavigateToAsset}
          />
        )}

        {currentPage === 'national-command' && (
          <NationalCommand />
        )}

        {currentPage === 'prioritization' && (
          <Prioritization />
        )}

        {currentPage === 'explainable' && (
          <ExplainableAI />
        )}

        {currentPage === 'executive-decision' && (
          <ExecutiveDecision />
        )}

        {currentPage === 'watchtower' && (
          <Watchtower />
        )}

        {currentPage === 'knowledge-center' && (
          <KnowledgeCenter />
        )}
      </main>
    </div>
  );
}

export default App;
