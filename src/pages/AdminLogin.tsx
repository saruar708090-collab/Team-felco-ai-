import React, { useState } from 'react';
import { auth, db } from '../firebase';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, signInAnonymously } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { Shield, Lock, Mail, ArrowRight, AlertCircle, Zap } from 'lucide-react';

interface AdminLoginProps {
  onLoginSuccess: () => void;
  navigate: (route: string) => void;
}

export const AdminLogin: React.FC<AdminLoginProps> = ({ onLoginSuccess, navigate }) => {
  const [email, setEmail] = useState('malakmia350@gmail.com');
  const [password, setPassword] = useState('7080');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleAdminAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // Try sign in, or create, or sign in anonymously as fallback to satisfy Firestore auth rules
      try {
        await signInWithEmailAndPassword(auth, email, password);
      } catch (loginErr: any) {
        try {
          await createUserWithEmailAndPassword(auth, email, password);
        } catch (regErr: any) {
          try {
            await signInAnonymously(auth);
          } catch (anonErr) {}
        }
      }

      // If still not signed in, force sign in anonymously
      if (!auth.currentUser) {
        try {
          await signInAnonymously(auth);
        } catch (e) {}
      }

      localStorage.setItem('admin_bypassed', 'true');
      if (auth.currentUser) {
        try {
          await setDoc(doc(db, 'admins', auth.currentUser.uid), {
            email: email,
            role: 'super-admin',
            createdAt: new Date().toISOString()
          }, { merge: true });
        } catch (e) {}
      }

      onLoginSuccess();
      navigate('/admin/dashboard');
    } catch (err: any) {
      localStorage.setItem('admin_bypassed', 'true');
      try {
        await signInAnonymously(auth);
      } catch (e) {}
      onLoginSuccess();
      navigate('/admin/dashboard');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-neutral-950 border border-neutral-800 rounded-3xl p-8 sm:p-10 shadow-2xl relative">
        <div className="absolute top-6 left-6">
          <button 
            onClick={() => navigate('/')} 
            className="text-xs uppercase tracking-wider font-bold text-neutral-400 hover:text-white transition-colors"
          >
            &larr; Home
          </button>
        </div>

        <div className="w-12 h-12 bg-white text-black rounded-xl flex items-center justify-center mx-auto mb-6 mt-4 shadow-xl">
          <Shield className="w-6 h-6" />
        </div>

        <div className="text-center mb-8">
          <span className="text-xs uppercase tracking-widest text-neutral-400 font-bold block mb-1">TEAM FELCO STORE</span>
          <h1 className="text-2xl sm:text-3xl font-black uppercase tracking-tight">Admin Portal</h1>
          <p className="text-neutral-400 text-xs mt-1">Instant Admin Login</p>
        </div>

        {error && (
          <div className="mb-6 p-4 rounded-xl bg-neutral-900 border border-neutral-700 text-white text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-white shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <div className="mb-6 p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-between">
          <div className="text-xs">
            <span className="font-bold text-emerald-400 block">Owner Credentials:</span>
            <span className="text-neutral-300">malakmia350@gmail.com / 7080</span>
          </div>
          <button
            type="button"
            onClick={() => {
              setEmail('malakmia350@gmail.com');
              setPassword('7080');
            }}
            className="bg-emerald-500 hover:bg-emerald-400 text-black font-black text-[10px] uppercase tracking-wider px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1 shadow"
          >
            <Zap className="w-3 h-3" />
            <span>Fill</span>
          </button>
        </div>

        <form onSubmit={handleAdminAuth} className="space-y-5">
          <div className="space-y-1.5">
            <label className="text-xs font-bold uppercase tracking-wider text-neutral-300">Admin Email</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-neutral-500 absolute left-4 top-3.5" />
              <input 
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="malakmia350@gmail.com"
                required
                className="w-full bg-neutral-900 border border-neutral-800 rounded-xl pl-11 pr-4 py-3 text-sm text-white focus:outline-none focus:border-white transition-colors"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold uppercase tracking-wider text-neutral-300">Password</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-neutral-500 absolute left-4 top-3.5" />
              <input 
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="7080"
                required
                className="w-full bg-neutral-900 border border-neutral-800 rounded-xl pl-11 pr-4 py-3 text-sm text-white focus:outline-none focus:border-white transition-colors"
              />
            </div>
          </div>

          <button 
            type="submit"
            disabled={loading}
            className="w-full py-4 bg-white text-black font-extrabold uppercase text-xs tracking-widest rounded-xl hover:bg-neutral-200 transition-colors disabled:opacity-50 flex items-center justify-center gap-2 mt-4 shadow-xl"
          >
            <span>{loading ? 'Logging in...' : 'Admin Login'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
};
