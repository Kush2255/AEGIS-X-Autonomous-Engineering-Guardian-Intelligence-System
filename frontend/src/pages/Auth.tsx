import React, { useState } from 'react';
import { Shield, Mail, Lock, User, ArrowRight, CheckCircle2, AlertCircle } from 'lucide-react';
import { ThreeDConstellation } from '../components/ThreeDConstellation';

interface AuthProps {
  onLoginSuccess: (user: { name: string; email: string; avatar: string }) => void;
  onBackToLanding: () => void;
}

export const Auth: React.FC<AuthProps> = ({ onLoginSuccess, onBackToLanding }) => {
  const [activeTab, setActiveTab] = useState<'signin' | 'signup'>('signin');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form states
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [agreeTerms, setAgreeTerms] = useState(false);

  const validateEmail = (emailStr: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailStr);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!email) {
      setError('Please enter your email address.');
      return;
    }
    if (!validateEmail(email)) {
      setError('Please enter a valid email address.');
      return;
    }
    if (!password) {
      setError('Please enter your password.');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }
    if (activeTab === 'signup') {
      if (!name) {
        setError('Please enter your full name.');
        return;
      }
      if (!agreeTerms) {
        setError('You must agree to the Terms of Service and Privacy Policy.');
        return;
      }
    }

    // Trigger mock login loading animation
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setSuccess(true);
      setTimeout(() => {
        const resolvedName = activeTab === 'signup' ? name : email.split('@')[0];
        const formattedName = resolvedName.charAt(0).toUpperCase() + resolvedName.slice(1);
        onLoginSuccess({
          name: formattedName,
          email: email.toLowerCase(),
          avatar: `https://api.dicebear.com/7.x/adventurer/svg?seed=${encodeURIComponent(formattedName)}`
        });
      }, 1200);
    }, 1800);
  };

  const handleGoogleSignIn = () => {
    setError(null);
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setSuccess(true);
      setTimeout(() => {
        onLoginSuccess({
          name: 'Telangana Administrator',
          email: 'admin.ts@prahari.gov.in',
          avatar: 'https://api.dicebear.com/7.x/adventurer/svg?seed=TelanganaAdmin'
        });
      }, 1200);
    }, 1800);
  };

  return (
    <div className="min-h-screen bg-dark-bg text-white flex flex-col justify-center items-center p-6 relative overflow-hidden font-sans">
      <ThreeDConstellation />

      {/* Floating abstract glowing orbs */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-blue-500/10 rounded-full blur-[130px] pointer-events-none" />
      <div className="absolute bottom-[-15%] right-[-10%] w-[50%] h-[50%] bg-purple-500/10 rounded-full blur-[130px] pointer-events-none" />

      {/* Auth Frosted Glass Card Container */}
      <div className="w-full max-w-md relative z-10">
        
        {/* Logo and Tagline Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center p-2.5 bg-brand-primary/10 rounded-2xl border border-brand-primary/20 mb-3 shadow-glow hover:border-brand-primary/50 transition-colors cursor-pointer" onClick={onBackToLanding}>
            <Shield className="w-8 h-8 text-brand-primary" />
          </div>
          <h2 className="text-2xl font-black tracking-wider text-white">PRAHARI AI</h2>
          <p className="text-xs text-dark-muted mt-1 uppercase font-bold tracking-widest">
            Telangana Infrastructure Platform
          </p>
        </div>

        {/* The Card */}
        <div className="glass-panel rounded-3xl p-8 shadow-glass border border-white/5 relative overflow-hidden">
          
          {/* Main Form state */}
          {!loading && !success && (
            <div className="space-y-6">
              {/* Card Title */}
              <div className="flex justify-between items-center border-b border-dark-border/40 pb-4">
                <div className="flex space-x-4">
                  <button
                    onClick={() => {
                      setActiveTab('signin');
                      setError(null);
                    }}
                    className={`font-display text-base font-bold pb-2 relative transition-all ${
                      activeTab === 'signin' 
                        ? 'text-white border-b-2 border-brand-primary' 
                        : 'text-dark-muted hover:text-white'
                    }`}
                  >
                    Sign In
                  </button>
                  <button
                    onClick={() => {
                      setActiveTab('signup');
                      setError(null);
                    }}
                    className={`font-display text-base font-bold pb-2 relative transition-all ${
                      activeTab === 'signup' 
                        ? 'text-white border-b-2 border-brand-primary' 
                        : 'text-dark-muted hover:text-white'
                    }`}
                  >
                    Create Account
                  </button>
                </div>
                <span className="text-[10px] text-brand-primary bg-brand-primary/10 px-2 py-0.5 rounded-full font-mono border border-brand-primary/25">
                  v1.0-Pilot
                </span>
              </div>

              {/* Error Warning Banner */}
              {error && (
                <div className="bg-brand-danger/10 border border-brand-danger/30 rounded-xl p-3 flex items-start space-x-2 text-brand-danger text-xs animate-shake">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>{error}</span>
                </div>
              )}

              {/* Standard Credentials Form */}
              <form onSubmit={handleSubmit} className="space-y-4">
                
                {activeTab === 'signup' && (
                  <div className="space-y-1.5">
                    <label className="text-[10px] uppercase font-bold tracking-wider text-dark-muted">Full Name</label>
                    <div className="relative">
                      <User className="w-4 h-4 text-dark-muted absolute left-3.5 top-3.5" />
                      <input
                        type="text"
                        placeholder="Enter full name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="w-full bg-dark-bg/60 border border-dark-border focus:border-brand-primary rounded-xl pl-10 pr-4 py-3 text-xs text-white focus:outline-none placeholder-dark-muted transition-colors"
                      />
                    </div>
                  </div>
                )}

                <div className="space-y-1.5">
                  <label className="text-[10px] uppercase font-bold tracking-wider text-dark-muted">Email Address</label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-dark-muted absolute left-3.5 top-3.5" />
                    <input
                      type="email"
                      placeholder="e.g. engineer@ts.gov.in"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full bg-dark-bg/60 border border-dark-border focus:border-brand-primary rounded-xl pl-10 pr-4 py-3 text-xs text-white focus:outline-none placeholder-dark-muted transition-colors"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <div className="flex justify-between items-center">
                    <label className="text-[10px] uppercase font-bold tracking-wider text-dark-muted">Password</label>
                    {activeTab === 'signin' && (
                      <a href="#forgot" className="text-[10px] text-brand-primary hover:underline font-semibold" onClick={(e) => e.preventDefault()}>
                        Forgot Password?
                      </a>
                    )}
                  </div>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-dark-muted absolute left-3.5 top-3.5" />
                    <input
                      type="password"
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full bg-dark-bg/60 border border-dark-border focus:border-brand-primary rounded-xl pl-10 pr-4 py-3 text-xs text-white focus:outline-none placeholder-dark-muted transition-colors"
                    />
                  </div>
                </div>

                {activeTab === 'signup' && (
                  <label className="flex items-start space-x-2.5 pt-1.5 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={agreeTerms}
                      onChange={(e) => setAgreeTerms(e.target.checked)}
                      className="mt-0.5 bg-dark-bg border-dark-border text-brand-primary rounded focus:ring-0 focus:ring-offset-0 cursor-pointer"
                    />
                    <span className="text-[10px] text-dark-muted leading-relaxed">
                      I agree to the <a href="#terms" className="text-brand-primary hover:underline" onClick={(e) => e.preventDefault()}>Terms of Service</a> and <a href="#privacy" className="text-brand-primary hover:underline" onClick={(e) => e.preventDefault()}>Privacy Policy</a> for national security-cleared personnel.
                    </span>
                  </label>
                )}

                <button
                  type="submit"
                  className="w-full mt-2 bg-gradient-to-r from-brand-primary to-indigo-600 hover:from-brand-primary/95 hover:to-indigo-500 text-white font-semibold py-3 px-4 rounded-xl text-xs transition-all duration-300 shadow-glow flex items-center justify-center space-x-2 border border-brand-primary/20"
                >
                  <span>{activeTab === 'signin' ? 'Access Infrastructure Console' : 'Register Credentials'}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </form>

              {/* Form Divider */}
              <div className="flex items-center space-x-3 text-dark-muted text-[10px] uppercase font-bold tracking-widest my-4">
                <div className="flex-1 h-[1px] bg-dark-border/40" />
                <span>Or Continue With</span>
                <div className="flex-1 h-[1px] bg-dark-border/40" />
              </div>

              {/* Sign In with Google Button */}
              <button
                onClick={handleGoogleSignIn}
                className="w-full bg-white hover:bg-gray-50 text-gray-800 font-semibold py-2.5 px-4 rounded-xl text-xs transition-all duration-300 shadow-sm flex items-center justify-center space-x-2.5 border border-gray-300"
              >
                {/* Google SVG Logo (Authentic Layout) */}
                <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                  <path
                    fill="#EA4335"
                    d="M12 5.04c1.66 0 3.2.57 4.38 1.69l3.27-3.27C17.67 1.58 14.99 1 12 1 7.35 1 3.37 3.65 1.39 7.56l3.85 2.99C6.19 6.82 8.87 5.04 12 5.04z"
                  />
                  <path
                    fill="#4285F4"
                    d="M23.49 12.27c0-.81-.07-1.59-.2-2.36H12v4.51h6.46c-.29 1.48-1.14 2.73-2.4 3.58l3.73 2.89c2.18-2.01 3.7-4.97 3.7-8.62z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.24 10.55c-.24-.72-.38-1.49-.38-2.3s.14-1.58.38-2.3L1.39 2.96C.5 4.77 0 6.81 0 8.95c0 2.14.5 4.18 1.39 5.99l3.85-2.99z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c3.24 0 5.97-1.07 7.96-2.92l-3.73-2.89c-1.1.74-2.5 1.18-4.23 1.18-3.13 0-5.81-1.78-6.76-4.51l-3.85 2.99C3.37 20.35 7.35 23 12 23z"
                  />
                </svg>
                <span>{activeTab === 'signin' ? 'Sign In with Google' : 'Sign Up with Google'}</span>
              </button>
            </div>
          )}

          {/* Secure Handshake Loading Animation */}
          {loading && (
            <div className="py-12 flex flex-col items-center justify-center space-y-4">
              <div className="relative flex items-center justify-center w-16 h-16">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand-primary opacity-30"></span>
                <div className="w-12 h-12 border-4 border-brand-primary border-t-transparent rounded-full animate-spin relative z-10" />
              </div>
              <div className="text-center space-y-1">
                <div className="text-xs font-bold text-white uppercase tracking-widest font-mono">Secure Token Handshake</div>
                <div className="text-[10px] text-dark-muted font-mono animate-pulse">Resolving keys and credentials...</div>
              </div>
            </div>
          )}

          {/* Success Access Granted State */}
          {success && (
            <div className="py-12 flex flex-col items-center justify-center space-y-4">
              <div className="bg-brand-success/15 border border-brand-success/35 p-3 rounded-full text-brand-success">
                <CheckCircle2 className="w-10 h-10 animate-bounce" />
              </div>
              <div className="text-center space-y-1">
                <div className="text-sm font-black text-brand-success uppercase tracking-wider">Access Granted</div>
                <div className="text-[10px] text-dark-muted font-mono">Redirecting to console session...</div>
              </div>
            </div>
          )}

        </div>

        {/* Footer info link */}
        <div className="text-center mt-6">
          <button 
            onClick={onBackToLanding}
            className="text-[10px] uppercase font-bold text-dark-muted hover:text-white transition-colors tracking-widest"
          >
            ← Back to Landing Gate
          </button>
        </div>

      </div>
    </div>
  );
};
