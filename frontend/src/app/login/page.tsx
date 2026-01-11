"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Mail, Lock, AlertCircle, CheckCircle, Eye, EyeOff } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isSignUp, setIsSignUp] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      if (isSignUp) {
        const { error: signUpError } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/auth/callback`,
          },
        });
        if (signUpError) throw signUpError;
        setSuccess("Check your email to confirm your account!");
      } else {
        const { error: signInError } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (signInError) throw signInError;
        router.push("/");
      }
    } catch (err: any) {
      setError(err.message || "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div 
      className="min-h-screen flex items-center justify-center p-4"
      style={{ background: 'var(--bg-page)' }}
    >
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div 
            className="w-16 h-16 rounded-2xl mx-auto mb-4 flex items-center justify-center"
            style={{ background: 'var(--accent-primary)' }}
          >
            <span className="text-white font-bold text-3xl">S</span>
          </div>
          <h1 className="heading-1">Spivot</h1>
          <p style={{ color: 'var(--text-secondary)' }}>Digital Khata for MSMEs</p>
        </div>

        {/* Login Card */}
        <Card>
          <CardContent className="p-6">
            <h2 className="heading-2 text-center mb-6">
              {isSignUp ? "Create Account" : "Welcome back"}
            </h2>

            {/* Error Message */}
            {error && (
              <div 
                className="flex items-center gap-3 p-4 rounded-[var(--radius-lg)] mb-4"
                style={{ background: 'var(--loss-light)' }}
              >
                <AlertCircle className="w-5 h-5 flex-shrink-0" style={{ color: 'var(--loss-red)' }} />
                <p className="text-sm" style={{ color: 'var(--loss-red)' }}>{error}</p>
              </div>
            )}

            {/* Success Message */}
            {success && (
              <div 
                className="flex items-center gap-3 p-4 rounded-[var(--radius-lg)] mb-4"
                style={{ background: 'var(--profit-light)' }}
              >
                <CheckCircle className="w-5 h-5 flex-shrink-0" style={{ color: 'var(--profit-green)' }} />
                <p className="text-sm" style={{ color: 'var(--profit-green)' }}>{success}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Email */}
              <div>
                <label className="label-text block mb-2">Email</label>
                <div className="relative">
                  <Mail 
                    className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5"
                    style={{ color: 'var(--text-tertiary)' }}
                  />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="input pl-12"
                    placeholder="you@example.com"
                    autoComplete="email"
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <label className="label-text block mb-2">Password</label>
                <div className="relative">
                  <Lock 
                    className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5"
                    style={{ color: 'var(--text-tertiary)' }}
                  />
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    minLength={6}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="input pl-12 pr-12"
                    placeholder="••••••••"
                    autoComplete={isSignUp ? "new-password" : "current-password"}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 p-1"
                  >
                    {showPassword ? (
                      <EyeOff className="w-5 h-5" style={{ color: 'var(--text-tertiary)' }} />
                    ) : (
                      <Eye className="w-5 h-5" style={{ color: 'var(--text-tertiary)' }} />
                    )}
                  </button>
                </div>
                {isSignUp && (
                  <p className="small-text mt-1">Minimum 6 characters</p>
                )}
              </div>

              {/* Submit */}
              <Button type="submit" loading={loading} className="w-full">
                {isSignUp ? "Create Account" : "Sign In"}
              </Button>
            </form>

            {/* Toggle Sign Up / Sign In */}
            <div className="mt-6 text-center">
              <p style={{ color: 'var(--text-secondary)' }}>
                {isSignUp ? "Already have an account?" : "Don't have an account?"}
              </p>
              <button
                onClick={() => {
                  setIsSignUp(!isSignUp);
                  setError(null);
                  setSuccess(null);
                }}
                className="font-medium mt-1"
                style={{ color: 'var(--accent-primary)' }}
              >
                {isSignUp ? "Sign in" : "Create account"}
              </button>
            </div>
          </CardContent>
        </Card>

        {/* Footer */}
        <p className="text-center mt-6 small-text">
          By continuing, you agree to Spivot's Terms of Service and Privacy Policy.
        </p>
      </div>
    </div>
  );
}
