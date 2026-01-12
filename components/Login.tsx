
import React, { useState } from 'react';
import { Button } from "./ui/button"
import { Input } from "./ui/input"
import { Label } from "./ui/label"
import { Loader2 } from 'lucide-react';
import { Logo } from './Logo';
import { agentService } from '../services/agentService';

interface LoginProps {
  onLogin: () => void;
}

export const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      // Login to agent-zero backend
      const formData = new URLSearchParams();
      formData.append('username', email);
      formData.append('password', password);

      // Get base URL from agentService configuration
      const baseUrl = (window as any).AGENT_ZERO_CONFIG?.apiBaseUrl || 'http://localhost:50080';

      const response = await fetch(`${baseUrl}/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: formData.toString(),
        credentials: 'include', // Important: include cookies
      });

      if (response.ok) {
        // Fetch CSRF token after successful login
        await agentService.fetchCsrfToken();
        setIsLoading(false);
        onLogin();
      } else {
        setIsLoading(false);
        setError('Invalid credentials. Please try again.');
      }
    } catch (error) {
      console.error('Login error:', error);
      setIsLoading(false);
      setError('Failed to connect to server. Please check if the agent-zero backend is running.');
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gradient-to-br from-zinc-950 via-zinc-900 to-zinc-950 text-foreground relative overflow-hidden">

      {/* Animated background gradient */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-blue-900/20 via-transparent to-transparent" />
      <div className="absolute top-0 left-0 w-full h-full bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0icmdiYSgyNTUsMjU1LDI1NSwwLjAzKSIgc3Ryb2tlLXdpZHRoPSIxIi8+PC9wYXR0ZXJuPjwvZGVmcz48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI2dyaWQpIi8+PC9zdmc+')] opacity-40" />

      {/* Login Card */}
      <div className="relative z-10 w-full max-w-md mx-4 animate-in fade-in slide-in-from-bottom-4 duration-700">
        <div className="bg-zinc-900/90 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl p-8 space-y-6">

          {/* Logo */}
          <div className="flex justify-center mb-8">
            <div className="h-16 w-52 p-3 bg-white/5 rounded-xl border border-white/10 backdrop-blur-sm shadow-xl flex items-center justify-center">
              <Logo variant="full" />
            </div>
          </div>

          {/* Header */}
          <div className="space-y-2 text-center">
            <h2 className="text-3xl font-bold tracking-tight">Welcome to Lumina</h2>
            <p className="text-zinc-400 text-sm">Sign in to access your AI workspace</p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5 mt-8">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-medium text-zinc-300">Username</Label>
              <Input
                id="email"
                type="text"
                placeholder="Enter your username"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="username"
                className="h-11 bg-white/10 border-white/20 text-white placeholder:text-zinc-500 focus:border-blue-500 focus:ring-blue-500/20"
                style={{ color: '#ffffff', WebkitTextFillColor: '#ffffff' }}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-sm font-medium text-zinc-300">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="current-password"
                className="h-11 bg-white/10 border-white/20 text-white placeholder:text-zinc-500 focus:border-blue-500 focus:ring-blue-500/20"
                style={{ color: '#ffffff', WebkitTextFillColor: '#ffffff' }}
              />
            </div>

            {error && (
              <div className="text-sm text-red-400 bg-red-500/10 border border-red-500/20 p-3 rounded-lg flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-red-400" />
                {error}
              </div>
            )}

            <Button
              type="submit"
              className="w-full h-11 bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-600/20 font-medium"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Signing in...
                </>
              ) : (
                'Sign In'
              )}
            </Button>
          </form>

          {/* Footer */}
          <div className="pt-4 text-center">
            <p className="text-xs text-zinc-500">
              © 2024 Lumina AI • Enterprise Agent Platform
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
