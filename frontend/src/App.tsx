import { useState } from 'react';
import { Landing } from './pages/Landing';
import { Dashboard } from './pages/Dashboard';
import { AssetDetail } from './pages/AssetDetail';
import { Simulator } from './pages/Simulator';
import { UploadInspection } from './pages/UploadInspection';
import { Shield, Activity, Upload, LayoutDashboard } from 'lucide-react';

type Page = 'landing' | 'dashboard' | 'asset-detail' | 'simulator' | 'upload';

function App() {
  const [currentPage, setCurrentPage] = useState<Page>('landing');
  const [selectedAssetId, setSelectedAssetId] = useState<string | undefined>(undefined);

  const handleSelectAsset = (assetId: string) => {
    setSelectedAssetId(assetId);
    setCurrentPage('asset-detail');
  };

  const handleNavigateToAsset = (assetId: string) => {
    setSelectedAssetId(assetId);
    setCurrentPage('asset-detail');
  };

  if (currentPage === 'landing') {
    return <Landing onEnterApp={() => setCurrentPage('dashboard')} />;
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
              AEGIS X
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
              <span className="hidden sm:inline">Telemetry Command</span>
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
              <span className="hidden sm:inline">Simulator</span>
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
              <span className="hidden sm:inline">Audit Upload</span>
            </button>
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
      </main>
    </div>
  );
}

export default App;
