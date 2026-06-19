"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Wrench, Lock, Loader2, CheckCircle2, XCircle } from "lucide-react";
import { api } from "@/lib/api/client";

function ResetForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  if (!token) {
    return (
      <div className="text-center py-6 space-y-4">
        <XCircle className="h-12 w-12 text-destructive mx-auto" />
        <p className="text-destructive font-medium">Invalid reset link</p>
        <p className="text-sm text-muted-foreground">This link is missing the reset token. Please request a new password reset.</p>
        <Button variant="outline" onClick={() => router.push("/")}>Back to Home</Button>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirm) {
      setError("Passwords do not match");
      return;
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }
    setLoading(true);
    setError("");
    try {
      await api.post("/auth/set-password-from-reset", { token, password });
      setSuccess(true);
      setTimeout(() => router.push("/"), 2000);
    } catch (err: any) {
      setError(err.message || "Failed to reset password. The link may have expired.");
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="text-center py-6 space-y-4">
        <CheckCircle2 className="h-12 w-12 text-green-500 mx-auto" />
        <p className="text-green-500 font-medium">Password set successfully!</p>
        <p className="text-sm text-muted-foreground">Redirecting you to sign in...</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="password">New Password</Label>
        <div className="relative">
          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input id="password" type="password" className="pl-10" placeholder="Minimum 6 characters" value={password} onChange={e => setPassword(e.target.value)} required minLength={6} />
        </div>
      </div>
      <div className="space-y-2">
        <Label htmlFor="confirm">Confirm Password</Label>
        <div className="relative">
          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input id="confirm" type="password" className="pl-10" placeholder="Repeat your password" value={confirm} onChange={e => setConfirm(e.target.value)} required />
        </div>
      </div>

      {error && (
        <motion.p initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="text-sm text-destructive bg-destructive/10 rounded-lg p-3">
          {error}
        </motion.p>
      )}

      <Button type="submit" className="w-full" disabled={loading}>
        {loading && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
        Set Password
      </Button>
    </form>
  );
}

export default function ResetPasswordPage() {
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
          <h1 className="text-2xl font-bold">Set Your Password</h1>
          <p className="text-muted-foreground mt-1">Choose a new password for your account</p>
        </div>

        <Card className="border-0 shadow-xl">
          <CardHeader>
            <CardTitle>Reset Password</CardTitle>
          </CardHeader>
          <CardContent>
            <Suspense fallback={<div className="flex justify-center py-6"><Loader2 className="h-5 w-5 animate-spin" /></div>}>
              <ResetForm />
            </Suspense>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
