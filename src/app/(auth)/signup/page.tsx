"use client";
import Link from 'next/link';
import { Navbar } from '@/components/landing/Navbar';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function SignupPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({ name: "", email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        router.push("/login?registered=true");
      } else {
        const data = await res.json();
        setError(data.error || "Registration failed");
      }
    } catch (err) {
      setError("An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />
      <div className="flex-1 flex items-center justify-center p-6 pt-24">
        <div className="bg-card p-8 rounded-3xl shadow-float-md w-full max-w-md border border-border">
          <h1 className="font-display font-bold text-3xl text-foreground mb-2 text-center">Create account</h1>
          <p className="font-body text-muted-foreground mb-8 text-center text-sm">Start your shared learning journey</p>
          
          <form className="space-y-5" onSubmit={handleSubmit}>
            {error && <p className="text-red-500 text-sm font-body text-center">{error}</p>}
            <div className="space-y-2">
              <label className="text-sm font-display font-semibold text-card-foreground">Full Name</label>
              <input 
                type="text" 
                placeholder="John Doe" 
                value={formData.name}
                onChange={e => setFormData({ ...formData, name: e.target.value })}
                required
                className="w-full text-sm font-body bg-secondary text-foreground rounded-xl px-4 py-3 border border-border outline-none focus:border-ring transition-all"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-display font-semibold text-card-foreground">Email address</label>
              <input 
                type="email" 
                placeholder="student@college.edu" 
                value={formData.email}
                onChange={e => setFormData({ ...formData, email: e.target.value })}
                required
                className="w-full text-sm font-body bg-secondary text-foreground rounded-xl px-4 py-3 border border-border outline-none focus:border-ring transition-all"
              />
            </div>
            
            <div className="space-y-2">
               <label className="text-sm font-display font-semibold text-card-foreground">Password</label>
               <input 
                 type="password" 
                 placeholder="••••••••" 
                 value={formData.password}
                 onChange={e => setFormData({ ...formData, password: e.target.value })}
                 required
                 className="w-full text-sm font-body bg-secondary text-foreground rounded-xl px-4 py-3 border border-border outline-none focus:border-ring transition-all"
               />
            </div>
            
            <button 
              type="submit" 
              disabled={loading}
              className="w-full bg-brand-500 text-white font-body font-medium px-4 py-3 rounded-xl hover:bg-brand-600 transition-colors mt-2 text-center block disabled:opacity-50"
            >
              {loading ? "Signing up..." : "Sign Up"}
            </button>
          </form>
          
          <p className="text-center text-sm font-body text-muted-foreground mt-8">
            Already have an account? <Link href="/login" className="text-brand-500 hover:underline font-medium">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
