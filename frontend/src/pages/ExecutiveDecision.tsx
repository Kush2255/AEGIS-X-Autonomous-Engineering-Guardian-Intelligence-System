import React, { useState, useEffect } from 'react';
import { Landmark, ShieldCheck, AlertCircle, ShieldAlert } from 'lucide-react';
import { ThreeDTilt } from '../components/ThreeDTilt';
import { ThreeDConstellation } from '../components/ThreeDConstellation';

interface ExecutiveStats {
  national_health_index: number;
  total_assets: number;
  healthy_count: number;
  critical_count: number;
  warning_count: number;
  pending_maintenance: number;
}

export const ExecutiveDecision: React.FC = () => {
  const [stats, setStats] = useState<ExecutiveStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('http://localhost:8000/api/enterprise/command-center')
      .then(res => res.json())
      .then(data => {
        setStats({
          national_health_index: data.national_health_index,
          total_assets: data.total_assets,
          healthy_count: data.healthy_count,
          critical_count: data.critical_count,
          warning_count: data.warning_count,
          pending_maintenance: data.pending_maintenance
        });
        setLoading(false);
      })
      .catch(err => {
        console.error('Error fetching exec data:', err);
        setLoading(false);
      });
  }, []);

  if (loading || !stats) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center space-y-4">
        <div className="w-12 h-12 border-4 border-brand-primary border-t-transparent rounded-full animate-spin" />
        <span className="text-sm font-mono text-dark-muted">Aggregating national budget matrices...</span>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-6 relative">
      <ThreeDConstellation />
      <div className="max-w-7xl mx-auto space-y-6 relative z-10">
        
        {/* Header */}
        <header>
          <h1 className="text-3xl font-black text-white flex items-center space-x-2">
            <Landmark className="w-8 h-8 text-brand-primary" />
            <span>EXECUTIVE DECISION DECK</span>
          </h1>
          <p className="text-sm text-dark-muted">National structural budgeting indices and infrastructure investment logs.</p>
        </header>

        {/* Budget Estimates & Financial Impact */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Budget block (Left) */}
          <ThreeDTilt>
            <div className="glass-panel p-5 rounded-2xl flex flex-col justify-between h-full space-y-4">
              <div className="space-y-1">
                <span className="text-[10px] text-brand-success uppercase font-bold tracking-wider">Infrastructure Repair Budget</span>
                <h3 className="font-display font-bold text-gray-200">Rehabilitation Estimates</h3>
              </div>

              <div className="space-y-3.5">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-dark-muted">Epoxy Injection Sealing:</span>
                  <span className="font-mono font-bold text-white">$370,000</span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-dark-muted">CFRP Concrete Jacketing:</span>
                  <span className="font-mono font-bold text-white">$750,000</span>
                </div>
                <div className="flex justify-between items-center text-xs border-t border-dark-border pt-3">
                  <span className="font-bold text-gray-200">Total Immediate Needs:</span>
                  <span className="font-mono font-black text-brand-success">$1,120,000</span>
                </div>
              </div>
            </div>
          </ThreeDTilt>

          {/* Investment Priority Index (Center) */}
          <ThreeDTilt>
            <div className="glass-panel p-5 rounded-2xl flex flex-col justify-between h-full space-y-4">
              <div className="space-y-1">
                <span className="text-[10px] text-brand-primary uppercase font-bold tracking-wider">Investment Priority Score</span>
                <h3 className="font-display font-bold text-gray-200">Risk Mitigation Value</h3>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-dark-muted">Varanasi Bypass Ganga River:</span>
                  <span className="text-brand-danger font-bold">96.2 / 100</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-dark-muted">Delhi Commercial Plaza:</span>
                  <span className="text-brand-warning font-bold">81.5 / 100</span>
                </div>
                <div className="flex items-center justify-between text-xs border-t border-dark-border pt-3">
                  <span className="text-dark-muted">Average Mitigation Index:</span>
                  <span className="text-brand-primary font-bold">88.8 / 100</span>
                </div>
              </div>
            </div>
          </ThreeDTilt>

          {/* Economic and Safety Impact (Right) */}
          <ThreeDTilt>
            <div className="glass-panel p-5 rounded-2xl flex flex-col justify-between h-full space-y-4">
              <div className="space-y-1">
                <span className="text-[10px] text-purple-400 uppercase font-bold tracking-wider">Socio-Economic Safety Index</span>
                <h3 className="font-display font-bold text-gray-200">Public Disruptions Summary</h3>
              </div>

              <div className="space-y-3 text-xs">
                <div className="flex justify-between items-center">
                  <span className="text-dark-muted">Daily Passenger Exposure:</span>
                  <span className="font-bold text-white">450k+ travelers</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-dark-muted">Freight Logistic Delay Risk:</span>
                  <span className="font-bold text-white">High (NH-2 closure)</span>
                </div>
                <div className="flex justify-between items-center border-t border-dark-border pt-3">
                  <span className="text-dark-muted">Emergency Safety Index:</span>
                  <span className="text-brand-danger font-bold uppercase">Breached limits</span>
                </div>
              </div>
            </div>
          </ThreeDTilt>

        </div>

        {/* Action center list */}
        <section className="glass-panel rounded-2xl p-6 shadow-glass relative overflow-hidden">
          <div className="flex items-center space-x-2 pb-4 border-b border-dark-border mb-4">
            <ShieldCheck className="w-6 h-6 text-brand-success" />
            <h3 className="font-display font-bold text-gray-200">Lead AI Recommended Interventions</h3>
          </div>

          <div className="space-y-4">
            <div className="p-4 bg-dark-bg/60 border border-dark-border rounded-xl flex items-start space-x-3 text-xs">
              <ShieldAlert className="w-5 h-5 text-brand-danger shrink-0 mt-0.5" />
              <div>
                <span className="font-bold text-white">Ganga Bridge (Varanasi): Grout Epoxy Immediately</span>
                <p className="text-dark-muted mt-1 leading-relaxed">
                  Mitigation ratio: 96%. Cost: $250,000. Postponing by 6 months will increase repair scope to $1.2M due to active diagonal shear cracks.
                </p>
              </div>
            </div>
            
            <div className="p-4 bg-dark-bg/60 border border-dark-border rounded-xl flex items-start space-x-3 text-xs">
              <AlertCircle className="w-5 h-5 text-brand-warning shrink-0 mt-0.5" />
              <div>
                <span className="font-bold text-white">Executive Plaza (Delhi): Column Structural Jacketing</span>
                <p className="text-dark-muted mt-1 leading-relaxed">
                  Mitigation ratio: 81%. Cost: $120,000. Column joint compression margins require secondary structural steel collar attachments.
                </p>
              </div>
            </div>
          </div>
        </section>

      </div>
    </div>
  );
};
