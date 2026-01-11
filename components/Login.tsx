import React, { useState } from 'react';
import { Button } from "./ui/button"
import { Input } from "./ui/input"
import { Label } from "./ui/label"
import { Loader2, Github, Chrome, Command, CheckCircle2 } from 'lucide-react';
import { Logo } from './Logo';
import { cn } from '../lib/utils';

interface LoginProps {
  onLogin: () => void;
}

export const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    
    // Simulate auth check
    setTimeout(() => {
      if (email && password) {
          setIsLoading(false);
          onLogin();
      } else {
          setIsLoading(false);
          setError('Invalid credentials');
      }
    }, 1500);
  };

  return (
    <div className="min-h-screen w-full flex flex-col md:flex-row bg-background text-foreground relative overflow-hidden font-sans">
      
      {/* Left Panel - Hero/Brand */}
      <div className="hidden md:flex flex-col justify-between w-1/2 p-12 relative bg-zinc-950 border-r border-white/10 overflow-hidden">
         {/* Background Effects */}
         <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-indigo-900/40 via-zinc-950 to-zinc-950" />
         <div className="absolute top-0 left-0 w-full h-full bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 brightness-100 contrast-150 mix-blend-overlay"></div>
         
         {/* Decorative Grid */}
         <div className="absolute inset-0 opacity-[0.05]" style={{ 
             backgroundImage: 'linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)', 
             backgroundSize: '40px 40px' 
         }}></div>

         <div className="relative z-10 flex items-center gap-3">
             <div className="h-10 w-10 p-1 bg-white/5 rounded-xl border border-white/10 backdrop-blur-sm shadow-xl">
                 <Logo />
             </div>
             <span className="font-semibold text-xl tracking-tight text-white">Lumina AI</span>
         </div>

         <div className="relative z-10 space-y-8 max-w-lg mb-12">
             <div className="space-y-4">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-medium">
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
                    </span>
                    Now with Agentic Workflows
                </div>
                <h1 className="text-5xl font-bold tracking-tight text-white leading-[1.1]">
                    Intelligence <br/>
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-400">Redefined.</span>
                </h1>
             </div>
             <p className="text-lg text-zinc-400 leading-relaxed max-w-md">
                 Orchestrate complex tasks, analyze data streams, and deploy autonomous agents in a secure, enterprise-grade environment.
             </p>
             
             <div className="flex gap-4 pt-4">
                 <div className="flex -space-x-3">
                     {[1,2,3].map(i => (
                         <div key={i} className="w-8 h-8 rounded-full border-2 border-zinc-950 bg-zinc-800 flex items-center justify-center text-[10px] text-zinc-400">
                             <div className="w-full h-full bg-gradient-to-br from-zinc-700 to-zinc-800 rounded-full" />
                         </div>
                     ))}
                 </div>
                 <div className="flex flex-col justify-center">
                     <span className="text-xs font-medium text-white">Trusted by 500+ teams</span>
                     <span className="text-[10px] text-zinc-500">From startups to Fortune 500</span>
                 </div>
             </div>
         </div>

         <div className="relative z-10 flex items-center justify-between text-xs text-zinc-600 border-t border-white/5 pt-6">
             <div className="flex gap-4">
                 <a href="#" className="hover:text-zinc-400 transition-colors">Documentation</a>
                 <a href="#" className="hover:text-zinc-400 transition-colors">API Reference</a>
             </div>
             <span>© 2024 Lumina Technologies Inc.</span>
         </div>
      </div>

      {/* Right Panel - Login Form */}
      <div className="flex-1 flex items-center justify-center p-6 bg-background relative">
         <div className="w-full max-w-[400px] space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-700">
             <div className="space-y-2 text-center md:text-left">
                 <h2 className="text-3xl font-bold tracking-tight">Welcome back</h2>
                 <p className="text-muted-foreground">Enter your credentials to access your workspace.</p>
             </div>

             <div className="space-y-4">
                 <Button variant="outline" className="w-full justify-start h-11 relative bg-background hover:bg-muted/50 border-input font-normal" disabled={isLoading}>
                     <Github className="mr-3 h-4 w-4" />
                     Continue with GitHub
                 </Button>
                 <Button variant="outline" className="w-full justify-start h-11 relative bg-background hover:bg-muted/50 border-input font-normal" disabled={isLoading}>
                     <Chrome className="mr-3 h-4 w-4 text-blue-500" />
                     Continue with Google
                 </Button>
             </div>

             <div className="relative">
                 <div className="absolute inset-0 flex items-center">
                     <span className="w-full border-t border-border" />
                 </div>
                 <div className="relative flex justify-center text-xs uppercase">
                     <span className="bg-background px-3 text-muted-foreground font-medium">Or continue with email</span>
                 </div>
             </div>

             <form onSubmit={handleSubmit} className="space-y-5">
                 <div className="space-y-2">
                     <Label htmlFor="email">Email address</Label>
                     <Input 
                        id="email" 
                        type="email" 
                        placeholder="name@company.com" 
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        className="h-11 bg-muted/20"
                     />
                 </div>
                 <div className="space-y-2">
                     <div className="flex items-center justify-between">
                         <Label htmlFor="password">Password</Label>
                         <a href="#" className="text-xs text-primary hover:underline hover:text-primary/80 font-medium">Forgot password?</a>
                     </div>
                     <Input 
                        id="password" 
                        type="password" 
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        className="h-11 bg-muted/20"
                     />
                 </div>

                 {error && (
                     <div className="text-xs text-destructive bg-destructive/10 border border-destructive/20 p-3 rounded-md flex items-center gap-2">
                         <div className="w-1.5 h-1.5 rounded-full bg-destructive" />
                         {error}
                     </div>
                 )}

                 <Button type="submit" className="w-full h-11 shadow-lg shadow-primary/20" disabled={isLoading}>
                     {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                     {isLoading ? 'Authenticating...' : 'Sign In'}
                 </Button>
             </form>

             <p className="text-xs text-center text-muted-foreground px-8 leading-relaxed">
                 By clicking continue, you agree to our <a href="#" className="underline hover:text-foreground">Terms of Service</a> and <a href="#" className="underline hover:text-foreground">Privacy Policy</a>.
             </p>
         </div>
      </div>
    </div>
  );
};
