import React, { useState } from 'react';
import {
  AlertCircle,
  ArrowRight,
  CheckCircle2,
  Eye,
  EyeOff,
  KeyRound,
  Lock,
  Shield,
  ShieldAlert,
  ShieldCheck,
  Users
} from 'lucide-react';

interface AdminLoginProps {
  onSuccess: () => void;
  onCancelToFaculty?: () => void;
}

export const AdminLogin: React.FC<AdminLoginProps> = ({
  onSuccess,
  onCancelToFaculty,
}) => {
  const [groupCode, setGroupCode] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccessAnim, setIsSuccessAnim] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    const cleanGroupCode = groupCode.trim().toUpperCase();
    const cleanPassword = password.trim();

    // Verification against required credentials
    if (cleanGroupCode !== 'KVSRIT' || cleanPassword !== 'kvsradmin') {
      setTimeout(() => {
        setIsSubmitting(false);
        if (cleanGroupCode !== 'KVSRIT' && cleanPassword !== 'kvsradmin') {
          setError('Invalid Group Code and Password. Access is strictly restricted.');
        } else if (cleanGroupCode !== 'KVSRIT') {
          setError('Invalid Group Code. Please enter the authorized group code.');
        } else {
          setError('Incorrect password. Please verify administrative credentials.');
        }
      }, 400);
      return;
    }

    // Success flow
    setTimeout(() => {
      setIsSubmitting(false);
      setIsSuccessAnim(true);
      setTimeout(() => {
        onSuccess();
      }, 500);
    }, 400);
  };

  return (
    <div className="max-w-md mx-auto my-6 sm:my-12 px-4 animate-fadeIn">
      <div className="bg-[#0a0b14] border border-[#1f2238] rounded-3xl shadow-2xl overflow-hidden backdrop-blur-xl relative">
        {/* Ambient background glow */}
        <div className="absolute -top-24 -right-24 w-60 h-60 bg-purple-600/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-60 h-60 bg-cyan-600/15 rounded-full blur-3xl pointer-events-none" />

        {/* Top Header */}
        <div className="p-6 sm:p-8 text-center border-b border-[#1a1d30] bg-[#0f111e]/80 relative z-10">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-purple-600 via-indigo-600 to-cyan-500 p-0.5 shadow-xl shadow-purple-600/20 mx-auto mb-4">
            <div className="w-full h-full bg-[#0a0b14] rounded-[14px] flex items-center justify-center">
              <Shield className="w-8 h-8 text-purple-400" />
            </div>
          </div>

          <div className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-purple-500/10 text-purple-300 border border-purple-500/30 mb-2">
            <Lock className="w-3 h-3 mr-1 text-purple-400" />
            Restricted Administrative Access
          </div>

          <h2 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">
            KVSRIT Admin Portal
          </h2>
          <p className="text-xs text-slate-400 mt-1 max-w-xs mx-auto">
            Enter the authorized institutional Group Code and Admin Password to manage student records and system parameters.
          </p>
        </div>

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="p-6 sm:p-8 space-y-4 relative z-10">
          {/* Error Message */}
          {error && (
            <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-start space-x-2.5 animate-shake">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
              <div className="flex-1">
                <span className="font-bold">Access Denied: </span>
                {error}
              </div>
            </div>
          )}

          {/* Success Message Animation */}
          {isSuccessAnim && (
            <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-center space-x-2.5">
              <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0" />
              <div>
                <span className="font-bold">Authentication Verified: </span>
                Unlocking Admin Governance Dashboard...
              </div>
            </div>
          )}

          {/* Group Code Input */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider">
              Group Code <span className="text-purple-400">*</span>
            </label>
            <div className="relative">
              <div className="absolute left-3.5 top-3 text-slate-400">
                <Users className="w-4 h-4" />
              </div>
              <input
                type="text"
                required
                value={groupCode}
                onChange={(e) => {
                  setGroupCode(e.target.value.toUpperCase());
                  setError(null);
                }}
                className="w-full pl-10 pr-4 py-2.5 bg-[#0f111a] border border-[#1f2238] focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 rounded-xl text-sm text-white font-mono tracking-wider transition outline-none uppercase"
                disabled={isSubmitting || isSuccessAnim}
                autoFocus
              />
            </div>
          </div>

          {/* Password Input */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider">
                Admin Password <span className="text-purple-400">*</span>
              </label>
            </div>
            <div className="relative">
              <div className="absolute left-3.5 top-3 text-slate-400">
                <KeyRound className="w-4 h-4" />
              </div>
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  setError(null);
                }}
                className="w-full pl-10 pr-11 py-2.5 bg-[#0f111a] border border-[#1f2238] focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 rounded-xl text-sm text-white transition outline-none"
                disabled={isSubmitting || isSuccessAnim}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-2.5 p-1 text-slate-400 hover:text-slate-200 transition"
                tabIndex={-1}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isSubmitting || isSuccessAnim}
            className="w-full py-3 bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-600 hover:from-purple-500 hover:via-indigo-500 hover:to-blue-500 text-white font-bold rounded-xl text-sm shadow-lg shadow-purple-600/30 transition active:scale-[0.99] flex items-center justify-center space-x-2 mt-2 disabled:opacity-50"
          >
            {isSubmitting ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : isSuccessAnim ? (
              <>
                <CheckCircle2 className="w-4 h-4 text-emerald-300" />
                <span>Access Granted</span>
              </>
            ) : (
              <>
                <span>Authenticate & Access Portal</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>

          {/* Back button to Faculty dashboard */}
          {onCancelToFaculty && (
            <button
              type="button"
              onClick={onCancelToFaculty}
              className="w-full py-2 text-center text-xs text-slate-400 hover:text-slate-200 transition"
            >
              Return to Faculty Dashboard
            </button>
          )}
        </form>

        {/* Footer Security Notice */}
        <div className="px-6 py-3 bg-[#07080e] border-t border-[#1a1d30] text-[11px] text-slate-500 text-center flex items-center justify-center space-x-1.5">
          <ShieldAlert className="w-3.5 h-3.5 text-slate-500" />
          <span>KVSRIT Early-Warning Intelligence • ISO/IEC 27001 Security Gate</span>
        </div>
      </div>
    </div>
  );
};
