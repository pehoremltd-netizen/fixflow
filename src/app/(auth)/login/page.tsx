"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Wrench, Mail, Lock, Eye, EyeOff, Loader2 } from "lucide-react";
import { mockLogin } from "@/lib/mockAuth";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("admin@fixflow.com");
  const [password, setPassword] = useState("Admin@2026!");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    await new Promise(r => setTimeout(r, 400)); // natural feel
    const session = mockLogin(email, password);
    if (!session) {
      setError("Invalid email or password");
      setLoading(false);
      return;
    }
    router.push(`/${session.role}`);
  };

  const DEMO_ACCOUNTS = [
    { role: 'Admin',       email: 'admin@fixflow.com',       password: 'Admin@2026!' },
    { role: 'Manager',     email: 'manager@fixflow.com',     password: 'Manager@2026!' },
    { role: 'Supervisor',  email: 'supervisor@fixflow.com',  password: 'Supervisor@2026!' },
    { role: 'Staff',       email: 'staff@fixflow.com',       password: 'Staff@2026!' },
    { role: 'Stakeholder', email: 'stakeholder@fixflow.com', password: 'Stake@2026!' },
    { role: 'Tenant',      email: 'tenant@fixflow.com',      password: 'Tenant@2026!' },
  ];

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-black">
      <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-[#D4AF37]/5 rounded-full blur-3xl" />
      <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-[#E1B000]/5 rounded-full blur-3xl" />

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 mb-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary">
              <Wrench className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="font-bold text-2xl">FixFlow</span>
          </Link>
          <h1 className="text-2xl font-bold">Welcome back</h1>
          <p className="text-muted-foreground mt-1">Sign in to your account</p>
        </div>

        <Card className="border-0 shadow-xl">
          <CardHeader>
            <CardTitle>Sign In</CardTitle>
            <CardDescription>Enter your credentials to access your portal</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input id="email" type="email" className="pl-10" value={email} onChange={e => setEmail(e.target.value)} required />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input id="password" type={showPassword ? "text" : "password"} className="pl-10 pr-10" value={password} onChange={e => setPassword(e.target.value)} required />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              {error && (
                <motion.p initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="text-sm text-destructive bg-destructive/10 rounded-lg p-3">
                  {error}
                </motion.p>
              )}

              <Button type="submit" className="w-full" size="lg" disabled={loading}>
                {loading && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
                Sign In
              </Button>
            </form>

            <div className="mt-6">
              <p className="text-xs text-muted-foreground text-center mb-3">Quick login — click any role:</p>
              <div className="grid grid-cols-3 gap-2">
                {DEMO_ACCOUNTS.map(a => (
                  <button key={a.role} type="button" onClick={() => { setEmail(a.email); setPassword(a.password); }}
                    className="text-xs bg-muted hover:bg-muted/80 rounded-lg p-2 text-left transition-colors">
                    <p className="font-medium text-foreground">{a.role}</p>
                    <p className="text-muted-foreground truncate">{a.email}</p>
                  </button>
                ))}
              </div>
              <p className="mt-4 text-center text-sm text-muted-foreground">
                No account?{" "}
                <Link href="/register" className="text-primary hover:underline font-medium">Register</Link>
              </p>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
