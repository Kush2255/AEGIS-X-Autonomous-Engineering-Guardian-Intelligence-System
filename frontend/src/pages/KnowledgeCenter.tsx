import React, { useState, useEffect } from 'react';
import { API_BASE } from '../config/api';
import { Search, BookOpen, Bookmark, BookmarkCheck, Sparkles, CheckCircle, Filter, Globe, FileText, Building2, ShieldCheck } from 'lucide-react';
import { ThreeDTilt } from '../components/ThreeDTilt';
import { ThreeDConstellation } from '../components/ThreeDConstellation';

interface ClauseEntry {
  section: string;
  title: string;
  summary: string;
  retrieved_reason: string;
}

interface Standard {
  id: string;
  code: string;
  title: string;
  publisher: string;
  year: number;
  revision: string;
  jurisdiction: string;
  infrastructure_type: string[];
  document_type: string;
  clauses: ClauseEntry[];
  source_validation: {
    verified: boolean;
    organization_recognized: boolean;
    full_traceability: boolean;
  };
}

interface FiltersData {
  jurisdictions: string[];
  document_types: string[];
  infrastructure_types: string[];
  publishers: string[];
}

export const KnowledgeCenter: React.FC = () => {
  const [query, setQuery] = useState('');
  const [standards, setStandards] = useState<Standard[]>([]);
  const [bookmarked, setBookmarked] = useState<string[]>(['IS 456:2000']);
  const [loading, setLoading] = useState(true);
  const [totalEntries, setTotalEntries] = useState(0);
  const [filteredCount, setFilteredCount] = useState(0);
  const [filters, setFilters] = useState<FiltersData>({ jurisdictions: [], document_types: [], infrastructure_types: [], publishers: [] });

  // Active filter state
  const [jurisdictionFilter, setJurisdictionFilter] = useState('');
  const [docTypeFilter, setDocTypeFilter] = useState('');
  const [infraTypeFilter, setInfraTypeFilter] = useState('');
  const [publisherFilter, setPublisherFilter] = useState('');

  const buildUrl = (q: string) => {
    const params = new URLSearchParams();
    if (q) params.set('q', q);
    if (jurisdictionFilter) params.set('jurisdiction', jurisdictionFilter);
    if (docTypeFilter) params.set('doc_type', docTypeFilter);
    if (infraTypeFilter) params.set('infra_type', infraTypeFilter);
    if (publisherFilter) params.set('publisher', publisherFilter);
    return `${API_BASE}/api/enterprise/standards-explorer?${params.toString()}`;
  };

  const fetchStandards = (q: string = query) => {
    setLoading(true);
    fetch(buildUrl(q))
      .then(res => res.json())
      .then(data => {
        setStandards(data.results || []);
        setTotalEntries(data.total_entries || 0);
        setFilteredCount(data.filtered_count || 0);
        if (data.filters) setFilters(data.filters);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchStandards('');
  }, []);

  useEffect(() => {
    fetchStandards(query);
  }, [jurisdictionFilter, docTypeFilter, infraTypeFilter, publisherFilter]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchStandards();
  };

  const toggleBookmark = (code: string) => {
    if (bookmarked.includes(code)) {
      setBookmarked(prev => prev.filter(c => c !== code));
    } else {
      setBookmarked(prev => [...prev, code]);
    }
  };

  const clearFilters = () => {
    setJurisdictionFilter('');
    setDocTypeFilter('');
    setInfraTypeFilter('');
    setPublisherFilter('');
    setQuery('');
  };

  return (
    <div className="min-h-screen p-6 relative">
      <ThreeDConstellation />
      <div className="max-w-7xl mx-auto space-y-6 relative z-10">
        
        {/* Header */}
        <header>
          <h1 className="text-3xl font-black text-white flex items-center space-x-2">
            <BookOpen className="w-8 h-8 text-brand-primary" />
            <span>ENGINEERING KNOWLEDGE CENTER</span>
          </h1>
          <p className="text-sm text-dark-muted">Authoritative engineering standards, codes, and technical guidance from verified sources only.</p>
        </header>

        {/* Statistics Header */}
        <section className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="glass-panel p-4 rounded-xl flex flex-col items-center justify-center">
            <span className="text-2xl font-black text-white">{totalEntries}</span>
            <span className="text-[9px] text-dark-muted uppercase font-bold tracking-wider mt-0.5">Total Entries</span>
          </div>
          <div className="glass-panel p-4 rounded-xl flex flex-col items-center justify-center">
            <span className="text-2xl font-black text-brand-primary">{filteredCount}</span>
            <span className="text-[9px] text-dark-muted uppercase font-bold tracking-wider mt-0.5">Filtered Results</span>
          </div>
          <div className="glass-panel p-4 rounded-xl flex flex-col items-center justify-center">
            <span className="text-2xl font-black text-white">{filters.publishers.length}</span>
            <span className="text-[9px] text-dark-muted uppercase font-bold tracking-wider mt-0.5">Publishers Indexed</span>
          </div>
          <div className="glass-panel p-4 rounded-xl flex flex-col items-center justify-center">
            <span className="text-2xl font-black text-brand-success">{filters.jurisdictions.length}</span>
            <span className="text-[9px] text-dark-muted uppercase font-bold tracking-wider mt-0.5">Jurisdictions</span>
          </div>
        </section>

        {/* Search input */}
        <section className="glass-panel p-4 rounded-xl shadow-glass">
          <form onSubmit={handleSearchSubmit} className="flex gap-3">
            <div className="relative flex-1">
              <Search className="w-5 h-5 text-dark-muted absolute left-3 top-3" />
              <input
                type="text"
                placeholder="Search standards... e.g. 'crack width', 'IS 456', 'shear stress', 'CFRP'"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="w-full bg-dark-bg border border-dark-border rounded-xl py-2.5 pl-10 pr-4 text-sm focus:outline-none focus:border-brand-primary text-gray-200"
              />
            </div>
            <button 
              type="submit"
              className="bg-brand-primary hover:bg-brand-primary/90 text-white font-bold py-2.5 px-6 rounded-xl text-xs uppercase font-mono tracking-wider transition-all"
            >
              Query
            </button>
          </form>
        </section>

        {/* Filter Controls Bar */}
        <section className="glass-panel p-4 rounded-xl shadow-glass">
          <div className="flex items-center gap-2 mb-3">
            <Filter className="w-4 h-4 text-brand-primary" />
            <span className="text-xs font-bold text-gray-200 uppercase tracking-wider">Source Filters</span>
            {(jurisdictionFilter || docTypeFilter || infraTypeFilter || publisherFilter) && (
              <button onClick={clearFilters} className="ml-auto text-[10px] text-brand-danger hover:text-white transition-colors font-bold font-mono">
                Clear All
              </button>
            )}
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div>
              <label className="text-[9px] text-dark-muted uppercase font-bold block mb-1">Jurisdiction</label>
              <select
                value={jurisdictionFilter}
                onChange={(e) => setJurisdictionFilter(e.target.value)}
                className="w-full bg-dark-bg border border-dark-border rounded-lg py-1.5 px-2.5 text-xs text-gray-200 focus:outline-none focus:border-brand-primary"
              >
                <option value="">All Jurisdictions</option>
                {filters.jurisdictions.map(j => (
                  <option key={j} value={j}>{j}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-[9px] text-dark-muted uppercase font-bold block mb-1">Document Type</label>
              <select
                value={docTypeFilter}
                onChange={(e) => setDocTypeFilter(e.target.value)}
                className="w-full bg-dark-bg border border-dark-border rounded-lg py-1.5 px-2.5 text-xs text-gray-200 focus:outline-none focus:border-brand-primary"
              >
                <option value="">All Document Types</option>
                {filters.document_types.map(d => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-[9px] text-dark-muted uppercase font-bold block mb-1">Infrastructure</label>
              <select
                value={infraTypeFilter}
                onChange={(e) => setInfraTypeFilter(e.target.value)}
                className="w-full bg-dark-bg border border-dark-border rounded-lg py-1.5 px-2.5 text-xs text-gray-200 focus:outline-none focus:border-brand-primary"
              >
                <option value="">All Infrastructure</option>
                {filters.infrastructure_types.map(it => (
                  <option key={it} value={it}>{it}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-[9px] text-dark-muted uppercase font-bold block mb-1">Publisher</label>
              <select
                value={publisherFilter}
                onChange={(e) => setPublisherFilter(e.target.value)}
                className="w-full bg-dark-bg border border-dark-border rounded-lg py-1.5 px-2.5 text-xs text-gray-200 focus:outline-none focus:border-brand-primary"
              >
                <option value="">All Publishers</option>
                {filters.publishers.map(p => (
                  <option key={p} value={p}>{p}</option>
                ))}
              </select>
            </div>
          </div>
        </section>

        {/* Results layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Main search results */}
          <div className="lg:col-span-8 space-y-4">
            <h3 className="text-sm text-dark-muted uppercase font-bold tracking-wider">
              Retrieved Standards &amp; Codes
              <span className="text-brand-primary ml-2 font-mono">({filteredCount})</span>
            </h3>
            
            {loading ? (
              <div className="py-12 text-center text-xs text-dark-muted font-mono animate-pulse">Querying authoritative knowledge base...</div>
            ) : standards.length === 0 ? (
              <div className="glass-panel p-8 text-center text-dark-muted text-xs">No matching standards found. Try broadening your search or clearing filters.</div>
            ) : (
              <div className="space-y-4">
                {standards.map((std) => (
                  <ThreeDTilt key={std.id}>
                    <div className="glass-panel p-5 rounded-2xl space-y-3">
                      {/* Header row */}
                      <div className="flex justify-between items-start">
                        <div className="flex items-center space-x-2 flex-wrap gap-y-1">
                          <span className="text-[10px] bg-brand-primary/10 border border-brand-primary/35 text-brand-primary font-mono py-0.5 px-2 rounded-full font-bold">
                            {std.code}
                          </span>
                          <span className="font-bold text-white text-sm">{std.title}</span>
                        </div>
                        <button 
                          onClick={() => toggleBookmark(std.code)}
                          className="text-dark-muted hover:text-white transition-colors shrink-0 ml-2"
                        >
                          {bookmarked.includes(std.code) ? (
                            <BookmarkCheck className="w-5 h-5 text-brand-success" />
                          ) : (
                            <Bookmark className="w-5 h-5" />
                          )}
                        </button>
                      </div>

                      {/* Source Provenance Panel */}
                      <div className="flex flex-wrap items-center gap-2 text-[9px]">
                        <span className="bg-dark-bg/60 border border-dark-border text-gray-300 py-0.5 px-2 rounded-full flex items-center space-x-1">
                          <Building2 className="w-2.5 h-2.5" />
                          <span>{std.publisher}</span>
                        </span>
                        <span className="bg-dark-bg/60 border border-dark-border text-gray-300 py-0.5 px-2 rounded-full font-mono">
                          {std.year}
                        </span>
                        <span className="bg-dark-bg/60 border border-dark-border text-gray-300 py-0.5 px-2 rounded-full">
                          {std.revision}
                        </span>
                        <span className={`py-0.5 px-2 rounded-full font-bold ${
                          std.jurisdiction === 'India' 
                            ? 'bg-orange-500/10 border border-orange-500/25 text-orange-400' 
                            : 'bg-blue-500/10 border border-blue-500/25 text-blue-400'
                        }`}>
                          <span className="flex items-center space-x-1">
                            <Globe className="w-2.5 h-2.5" />
                            <span>{std.jurisdiction}</span>
                          </span>
                        </span>
                        <span className="bg-purple-950/30 border border-purple-500/20 text-purple-300 py-0.5 px-2 rounded-full flex items-center space-x-1">
                          <FileText className="w-2.5 h-2.5" />
                          <span>{std.document_type}</span>
                        </span>
                        {std.source_validation?.verified && (
                          <span className="bg-brand-success/10 border border-brand-success/25 text-brand-success py-0.5 px-2 rounded-full flex items-center space-x-1 font-bold">
                            <ShieldCheck className="w-2.5 h-2.5" />
                            <span>Source Verified</span>
                          </span>
                        )}
                      </div>

                      {/* Infrastructure type tags */}
                      <div className="flex flex-wrap gap-1.5">
                        {std.infrastructure_type.map((it, idx) => (
                          <span key={idx} className="text-[8px] bg-dark-bg/40 border border-dark-border text-dark-muted py-0.5 px-1.5 rounded font-bold uppercase tracking-wider">
                            {it}
                          </span>
                        ))}
                      </div>

                      {/* Clauses */}
                      <div className="space-y-2 text-xs">
                        {std.clauses.map((clause, ci) => (
                          <div key={ci} className="p-3 bg-dark-bg/40 border border-dark-border/50 rounded-xl space-y-1.5">
                            <div className="flex items-center space-x-2">
                              <span className="text-[9px] text-brand-primary font-mono font-bold">{clause.section}</span>
                              <span className="text-gray-200 font-bold">{clause.title}</span>
                            </div>
                            <p className="text-gray-400 leading-relaxed text-[11px]">{clause.summary}</p>
                            <div className="bg-purple-950/20 border border-purple-500/15 p-2 rounded-lg text-[10px] text-purple-200 flex items-start space-x-1.5">
                              <Sparkles className="w-3 h-3 text-purple-400 shrink-0 mt-0.5" />
                              <p><strong>RAG Citation:</strong> {clause.retrieved_reason}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </ThreeDTilt>
                ))}
              </div>
            )}
          </div>

          {/* Bookmarked sidebar */}
          <div className="lg:col-span-4 space-y-4">
            <div className="glass-panel p-5 rounded-2xl h-fit space-y-4 shadow-glass">
              <div>
                <h3 className="font-display font-bold text-gray-200">Frequently Referenced</h3>
                <p className="text-[10px] text-dark-muted mt-0.5">Quick access shortcuts to bookmarked codes.</p>
              </div>

              <div className="space-y-2.5 text-xs">
                {bookmarked.length === 0 ? (
                  <div className="text-dark-muted text-center py-4">No bookmarked references.</div>
                ) : (
                  bookmarked.map((code) => (
                    <div key={code} className="p-3 bg-dark-bg/60 border border-dark-border rounded-xl flex justify-between items-center">
                      <span className="font-bold text-white">{code}</span>
                      <button 
                        onClick={() => toggleBookmark(code)}
                        className="text-brand-success hover:text-brand-danger transition-colors font-mono text-[10px] font-bold"
                      >
                        Remove
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* RAG Collections Catalog */}
            <div className="glass-panel p-5 rounded-2xl shadow-glass space-y-3">
              <div>
                <h3 className="font-display font-bold text-gray-200">Multi-Collection RAG Index</h3>
                <p className="text-[10px] text-dark-muted mt-0.5">Partitioned vector collections for explainable grounding.</p>
              </div>
              <div className="space-y-2 max-h-48 overflow-y-auto pr-1 text-[10px]">
                {[
                  { id: "01", name: "Engineering Standards", desc: "BIS, IRC, ACI, ASCE, ISO code specifications" },
                  { id: "02", name: "Infrastructure Assets", desc: "Roads, bridges, drainage, building pilot schemas" },
                  { id: "03", name: "Defect Library", desc: "Diagnostic templates (spalling, shear, rutting)" },
                  { id: "04", name: "Inspection Manuals", desc: "Drone paths, NDT rules, visual checklists" },
                  { id: "05", name: "Maintenance Procedures", desc: "Routine schedules & desiltation rules" },
                  { id: "06", name: "Repair Methods", desc: "Epoxy injections, CFRP wraps, jacketing specs" },
                  { id: "07", name: "Risk Assessment", desc: "Structural health score calculation matrix" },
                  { id: "08", name: "Weather & Environment", desc: "IMD monsoonal runoff & thermal joint stress data" },
                  { id: "09", name: "Disaster Management", desc: "TSDMA flood safety & rapid inspection guides" },
                  { id: "10", name: "Historical Case Studies", desc: "Forensic failure reviews (e.g. Mahad Bridge)" },
                  { id: "11", name: "Government Policies", desc: "Smart Cities asset management guidelines" },
                  { id: "12", name: "Engineering Glossary", desc: "Technical definitions & carbonation concepts" },
                  { id: "13", name: "AI Reasoning Knowledge", desc: "Agent reasoning chains & confidence index logs" },
                  { id: "14", name: "Materials Engineering", desc: "Steel rust chemistry & concrete hydration aging" },
                  { id: "15", name: "Sensors & IoT", desc: "SHM vibration accelerometer thresholds" },
                  { id: "16", name: "GIS & Geospatial", desc: "Geographic coordinate grids & risk heatmaps" },
                  { id: "17", name: "Predictive Maintenance", desc: "Condition index sigmoidal deterioration curves" },
                  { id: "18", name: "Budget Planning", desc: "Capital deferred repair optimization rules" },
                  { id: "19", name: "Safety Regulations", desc: "CPWD scaffolding & work-zone safety layouts" },
                  { id: "20", name: "Executive Intelligence", desc: "District conditions rating indices & ranks" },
                  { id: "21", name: "Telangana State Knowledge", desc: "GHMC, HMDA, TSRDC, & Mission Bhagiratha manuals" }
                ].map(col => (
                  <div key={col.id} className="p-2 bg-dark-bg/60 border border-dark-border/60 rounded-lg space-y-0.5 hover:border-brand-primary/40 transition-colors">
                    <div className="flex items-center space-x-1.5 font-bold text-white">
                      <span className="text-[9px] font-mono text-brand-primary">COL-{col.id}</span>
                      <span>{col.name}</span>
                    </div>
                    <p className="text-dark-muted text-[9px]">{col.desc}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Source Validation Rules */}
            <div className="glass-panel p-5 rounded-2xl shadow-glass space-y-3">
              <h3 className="font-display font-bold text-gray-200 flex items-center space-x-1.5">
                <CheckCircle className="w-4 h-4 text-brand-success" />
                <span>Source Validation</span>
              </h3>
              <div className="space-y-2 text-[10px] text-gray-400">
                <div className="flex items-start space-x-2">
                  <ShieldCheck className="w-3.5 h-3.5 text-brand-success shrink-0 mt-0.5" />
                  <span>Every entry verified against an officially recognized standards body or government agency.</span>
                </div>
                <div className="flex items-start space-x-2">
                  <ShieldCheck className="w-3.5 h-3.5 text-brand-success shrink-0 mt-0.5" />
                  <span>Full traceability from each clause back to its source publication.</span>
                </div>
                <div className="flex items-start space-x-2">
                  <ShieldCheck className="w-3.5 h-3.5 text-brand-success shrink-0 mt-0.5" />
                  <span>No blogs, wikis, AI-generated content, or unverified PDFs are accepted.</span>
                </div>
              </div>
              <div className="border-t border-dark-border/40 pt-2.5 text-[9px] text-dark-muted leading-relaxed">
                <strong>Approved sources include:</strong> BIS, IRC, NHAI, MoRTH, NDMA, CPWD, RDSO, ASCE, FHWA, AASHTO, ACI, ASTM, ISO, fib, TSDMA, GHMC, HMDA, TSRDC, Mission Bhagiratha, Telangana R&B Department.
              </div>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};
