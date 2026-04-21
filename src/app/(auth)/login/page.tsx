"use client";
import Link from 'next/link';
import { Navbar } from '@/components/landing/Navbar';
import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await signIn("credentials", {
        redirect: false,
        email: formData.email,
        password: formData.password,
      });

      if (res?.error) {
        setError("Invalid credentials");
      } else {
        router.push("/dashboard");
      }
    } catch (err) {
      setError("An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-surface-secondary flex flex-col dark:bg-slate-950">
      <Navbar />
      <div className="flex-1 flex items-center justify-center p-6 pt-24">
        <div className="bg-white p-8 rounded-3xl shadow-float-md w-full max-w-md dark:bg-slate-900">
          <h1 className="font-display font-bold text-3xl text-slate-900 mb-2 text-center dark:text-slate-100">Welcome back</h1>
          <p className="font-body text-slate-500 mb-8 text-center text-sm dark:text-slate-400">Sign in to your account</p>
          
          <form className="space-y-5" onSubmit={handleSubmit}>
            {error && <p className="text-red-500 text-sm font-body text-center">{error}</p>}
            <div className="space-y-2">
              <label className="text-sm font-display font-semibold text-slate-700 dark:text-slate-300">Email address</label>
              <input 
                type="email" 
                placeholder="student@college.edu" 
                value={formData.email}
                onChange={e => setFormData({ ...formData, email: e.target.value })}
                required
                className="w-full text-sm font-body bg-slate-50 rounded-xl px-4 py-3 border border-slate-100 outline-none focus:border-brand-300 transition-all dark:bg-slate-800 dark:border-slate-800"
              />
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                 <label className="text-sm font-display font-semibold text-slate-700 dark:text-slate-300">Password</label>
                 <a href="#" className="text-xs font-body text-brand-500 hover:underline">Forgot?</a>
              </div>
              <input 
                type="password" 
                placeholder="••••••••" 
                value={formData.password}
                onChange={e => setFormData({ ...formData, password: e.target.value })}
                required
                className="w-full text-sm font-body bg-slate-50 rounded-xl px-4 py-3 border border-slate-100 outline-none focus:border-brand-300 transition-all dark:bg-slate-800 dark:border-slate-800"
              />
            </div>
            
            <button 
              type="submit" 
              disabled={loading}
              className="w-full bg-brand-500 text-white font-body font-medium px-4 py-3 rounded-xl hover:bg-brand-600 transition-colors mt-2 disabled:opacity-50"
            >
              {loading ? "Signing in..." : "Sign In"}
            </button>
          </form>
          
          <p className="text-center text-sm font-body text-slate-500 mt-8 dark:text-slate-400">
            Don't have an account? <Link href="/signup" className="text-brand-500 hover:underline font-medium">Sign up</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
