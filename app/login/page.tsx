"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  RocketIcon,
  EyeIcon,
  EyeOffIcon,
  MailIcon,
  LockIcon,
  ArrowRightIcon,
  ServerIcon,
  CloudIcon,
  ShieldCheckIcon,
  ZapIcon,
} from "lucide-react";
import { useAuth } from "@/contexts/auth.context";
import { BASE_API_URL } from "@/lib/api-client";

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    
    try {
      const response = await fetch(`${BASE_API_URL}/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        throw new Error("Credenciales inválidas");
      }

      const responseBody = await response.json();
      login(responseBody.data);
      router.push("/admin");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al iniciar sesión");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative flex min-h-screen w-full">
      {/* Left Panel - Branding */}
      <div className="relative hidden w-1/2 overflow-hidden lg:flex lg:flex-col lg:justify-between">
        {/* Animated gradient background */}
        <div className="absolute inset-0 bg-gradient-to-br from-violet-950 via-indigo-950 to-slate-950" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,_rgba(139,92,246,0.3),_transparent_50%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_right,_rgba(59,130,246,0.2),_transparent_50%)]" />

        {/* Animated grid */}
        <div className="absolute inset-0 opacity-[0.07]">
          <div className="login-grid absolute inset-0" />
        </div>

        {/* Floating orbs */}
        <div className="login-orb absolute left-[15%] top-[20%] h-72 w-72 rounded-full bg-violet-500/20 blur-[100px]" />
        <div className="login-orb-delayed absolute bottom-[20%] right-[10%] h-96 w-96 rounded-full bg-blue-500/15 blur-[120px]" />
        <div className="login-orb-slow absolute left-[40%] top-[60%] h-48 w-48 rounded-full bg-indigo-400/10 blur-[80px]" />

        {/* Content */}
        <div className="relative z-10 flex flex-1 flex-col justify-between p-12">
          {/* Logo */}
          <div className="login-fade-in flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-sidebar text-white shadow-lg">
              <RocketIcon className="h-5 w-5 text-white" />
            </div>
            <span className="text-xl font-bold tracking-tight text-white">
              DeployLab
            </span>
          </div>

          {/* Hero */}
          <div className="login-slide-up space-y-8">
            <h1 className="text-5xl font-bold leading-tight tracking-tight text-white">
              Deploy with
              <br />
              <span className="bg-gradient-to-r from-violet-400 via-blue-400 to-indigo-400 bg-clip-text text-transparent">
                confidence.
              </span>
            </h1>
            <p className="max-w-md text-lg leading-relaxed text-indigo-200/70">
              Manage your infrastructure, monitor deployments, and scale your
              applications from a single powerful dashboard.
            </p>

            {/* Feature pills */}
            <div className="flex flex-wrap gap-3">
              {[
                { icon: ServerIcon, label: "Infrastructure" },
                { icon: CloudIcon, label: "Cloud Native" },
                { icon: ShieldCheckIcon, label: "Secure" },
                { icon: ZapIcon, label: "Fast" },
              ].map((feature, i) => (
                <div
                  key={feature.label}
                  className="login-pill flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-indigo-200/80 backdrop-blur-sm"
                  style={{ animationDelay: `${0.8 + i * 0.15}s` }}
                >
                  <feature.icon className="h-3.5 w-3.5" />
                  {feature.label}
                </div>
              ))}
            </div>
          </div>

          {/* Bottom stats */}
          <div className="login-fade-in-delayed flex gap-12">
            {[
              { value: "99.9%", label: "Uptime" },
              { value: "2.4k+", label: "Deployments" },
              { value: "<50ms", label: "Latency" },
            ].map((stat) => (
              <div key={stat.label}>
                <p className="text-2xl font-bold text-white">{stat.value}</p>
                <p className="text-sm text-indigo-300/50">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right Panel - Login Form */}
      <div className="flex w-full flex-col items-center justify-center bg-background px-6 lg:w-1/2">
        <div className="login-form-appear w-full max-w-[400px] space-y-8">
          {/* Mobile logo */}
          <div className="mb-4 flex items-center gap-3 lg:hidden">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500 to-indigo-600">
              <RocketIcon className="h-4 w-4 text-white" />
            </div>
            <span className="text-lg font-bold text-foreground">DeployLab</span>
          </div>

          {/* Header */}
          <div className="space-y-2">
            <h2 className="text-2xl font-bold tracking-tight text-foreground">
              Welcome back
            </h2>
            <p className="text-sm text-muted-foreground">
              Enter your credentials to access the admin panel
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div className="rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
                {error}
              </div>
            )}
            {/* Email */}
            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-medium">
                Email
              </Label>
              <div className="relative">
                <MailIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  placeholder="admin@deploylab.io"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="h-11 pl-10 transition-all duration-200 focus:ring-2 focus:ring-violet-500/20"
                  required
                />
              </div>
            </div>

            {/* Password */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password" className="text-sm font-medium">
                  Password
                </Label>
                <button
                  type="button"
                  className="text-xs text-violet-400 transition-colors hover:text-violet-300"
                >
                  Forgot password?
                </button>
              </div>
              <div className="relative">
                <LockIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="h-11 pl-10 pr-10 transition-all duration-200 focus:ring-2 focus:ring-violet-500/20"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground transition-colors hover:text-foreground"
                >
                  {showPassword ? (
                    <EyeOffIcon className="h-4 w-4" />
                  ) : (
                    <EyeIcon className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>

            {/* Remember me */}
            <div className="flex items-center gap-2">
              <Checkbox id="remember" />
              <Label
                htmlFor="remember"
                className="text-sm font-normal text-muted-foreground"
              >
                Remember me for 30 days
              </Label>
            </div>

            {/* Submit */}
            <Button
              type="submit"
              disabled={isLoading}
              className="h-11 w-full bg-sidebar hover:bg-sidebar-accent text-white shadow-lg transition-all duration-300 disabled:opacity-70"
            >
              {isLoading ? (
                <div className="flex items-center gap-2">
                  <div className="login-spinner h-4 w-4 rounded-full border-2 border-white/30 border-t-white" />
                  Signing in...
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  Sign in
                  <ArrowRightIcon className="h-4 w-4" />
                </div>
              )}
            </Button>
          </form>

          {/* Divider */}
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-border" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">
                Or continue with
              </span>
            </div>
          </div>

          {/* Social logins */}
          <div className="grid grid-cols-2 gap-3">
            <Button
              variant="outline"
              className="h-11 transition-all duration-200 hover:bg-accent"
            >
              <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
                <path
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
                  fill="#4285F4"
                />
                <path
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  fill="#34A853"
                />
                <path
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  fill="#FBBC05"
                />
                <path
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  fill="#EA4335"
                />
              </svg>
              Google
            </Button>
            <Button
              variant="outline"
              className="h-11 transition-all duration-200 hover:bg-accent"
            >
              <svg
                className="mr-2 h-4 w-4"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
              </svg>
              GitHub
            </Button>
          </div>

          {/* Footer */}
          <p className="text-center text-xs text-muted-foreground">
            By signing in, you agree to our{" "}
            <button className="text-violet-400 underline-offset-4 hover:underline">
              Terms of Service
            </button>{" "}
            and{" "}
            <button className="text-violet-400 underline-offset-4 hover:underline">
              Privacy Policy
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
