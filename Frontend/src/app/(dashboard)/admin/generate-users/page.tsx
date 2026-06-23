"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Check, Copy, Trash2, RefreshCw, UserPlus, Users, Eye, EyeOff, Key, Mail, Loader2 } from "lucide-react";

const ROLES = ["admin", "manager", "supervisor", "staff", "upline_manager", "tenant"] as const;

interface GeneratedUser {
  password: string;
  profile: {
    id: string;
    email: string;
    full_name: string;
    role: string;
    department?: string;
    phone?: string;
    organization_id: string;
  };
  createdAt: string;
}

const STORAGE_KEY = "fixflow-generated-users";
const ORG_ID = "0538a722-bba0-4c7f-b470-37d91a8c1c31";

function loadAll(): Record<string, GeneratedUser> {
  if (typeof window === "undefined") return {};
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch { return {}; }
}

function saveAll(data: Record<string, GeneratedUser>) {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

function generateEmail(name: string): string {
  const base = name.trim().toLowerCase().replace(/[^a-z0-9]/g, ".");
  return `${base || "user"}@fixflow.app`;
}

function generatePassword(): string {
  const upper = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  const lower = "abcdefghijklmnopqrstuvwxyz";
  const digits = "0123456789";
  const sym = "!@#$%";
  const all = upper + lower + digits;
  let pwd = "";
  pwd += upper[Math.floor(Math.random() * upper.length)];
  pwd += lower[Math.floor(Math.random() * lower.length)];
  pwd += digits[Math.floor(Math.random() * digits.length)];
  pwd += sym[Math.floor(Math.random() * sym.length)];
  for (let i = 0; i < 8; i++) pwd += all[Math.floor(Math.random() * all.length)];
  return pwd.split("").sort(() => Math.random() - 0.5).join("");
}

function getRoleColor(role: string): string {
  const colors: Record<string, string> = {
    admin: "bg-purple-500/10 text-purple-400",
    manager: "bg-info/10 text-blue-400",
    supervisor: "bg-warning/10 text-orange-400",
    staff: "bg-green-500/10 text-green-400",
    upline_manager: "bg-teal-500/10 text-teal-400",
    tenant: "bg-cyan-500/10 text-cyan-400",
  };
  return colors[role] || "bg-muted-foreground/10 text-gray-400";
}

export default function GenerateUsersPage() {
  const [accounts, setAccounts] = useState<Record<string, GeneratedUser>>({});
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("staff");
  const [password, setPassword] = useState("");
  const [department, setDepartment] = useState("");
  const [phone, setPhone] = useState("");
  const [showPwd, setShowPwd] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const [bulkCount, setBulkCount] = useState(5);
  const [bulkPrefix, setBulkPrefix] = useState("user");

  useEffect(() => {
    setAccounts(loadAll());
    setLoading(false);
  }, []);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 2500);
    return () => clearTimeout(t);
  }, [toast]);

  function resetForm() {
    setName("");
    setEmail("");
    setRole("staff");
    setPassword("");
    setDepartment("");
    setPhone("");
  }

  function handleAutoEmail() {
    if (!name.trim()) return;
    setEmail(generateEmail(name));
  }

  function handleAutoPwd() {
    setPassword(generatePassword());
  }

  function handleAdd() {
    if (!name.trim() || !email.trim() || !password.trim()) {
      setToast("Name, email, and password are required");
      return;
    }
    const existing = loadAll();
    if (existing[email.trim().toLowerCase()]) {
      setToast("A user with this email already exists");
      return;
    }
    const newUser: GeneratedUser = {
      password: password,
      profile: {
        id: `gen-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        email: email.trim().toLowerCase(),
        full_name: name.trim(),
        role: role,
        department: department.trim() || undefined,
        phone: phone.trim() || undefined,
        organization_id: ORG_ID,
      },
      createdAt: new Date().toISOString(),
    };
    existing[email.trim().toLowerCase()] = newUser;
    saveAll(existing);
    setAccounts(existing);
    resetForm();
    setToast("User generated successfully!");
  }

  function handleBulkGenerate() {
    const count = Math.min(Math.max(bulkCount, 1), 50);
    const existing = loadAll();
    for (let i = 0; i < count; i++) {
      const idx = i + 1;
      const e = `${bulkPrefix}${idx}@fixflow.app`.toLowerCase();
      if (existing[e]) continue;
      const pwd = generatePassword();
      existing[e] = {
        password: pwd,
        profile: {
          id: `gen-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
          email: e,
          full_name: `${bulkPrefix.charAt(0).toUpperCase() + bulkPrefix.slice(1)} ${idx}`,
          role: "staff",
          department: undefined,
          phone: undefined,
          organization_id: ORG_ID,
        },
        createdAt: new Date().toISOString(),
      };
    }
    saveAll(existing);
    setAccounts(existing);
    setToast(`${count} users generated!`);
  }

  function handleDelete(emailKey: string) {
    const existing = loadAll();
    delete existing[emailKey];
    saveAll(existing);
    setAccounts({ ...existing });
    setToast("User removed");
  }

  function copyCredentials(emailKey: string) {
    const acct = accounts[emailKey];
    if (!acct) return;
    const text = `Email: ${acct.profile.email}\nPassword: ${acct.password}`;
    navigator.clipboard.writeText(text).then(() => {
      setCopiedId(emailKey);
      setToast("Credentials copied!");
      setTimeout(() => setCopiedId(null), 2000);
    });
  }

  const entries = Object.entries(accounts);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-6 w-6 text-primary animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-4 sm:p-6 lg:p-8">
      {/* Toast */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-4 right-4 z-50 bg-primary text-primary-foreground text-sm font-medium px-4 py-2.5 rounded-lg shadow-lg"
          >
            {toast}
          </motion.div>
        )}
      </AnimatePresence>

      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between mb-6"
        >
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-foreground tracking-tight">Generate Users</h1>
            <p className="text-sm text-muted-foreground mt-1">Create user accounts with email & password credentials</p>
          </div>
          <Badge variant="outline" className="border-primary/30 text-primary text-xs px-3 py-1">
            {entries.length} generated
          </Badge>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          {/* ─── Form Panel ─── */}
          <div className="lg:col-span-2 space-y-5">
            {/* Single Generate */}
            <Card className="bg-input-bg border-border">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-semibold text-foreground flex items-center gap-2">
                  <UserPlus className="h-4 w-4 text-primary" />
                  New User
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <Label className="text-[11px] text-muted-foreground uppercase tracking-wider">Full Name</Label>
                  <Input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Full name"
                    className="bg-background border-border text-foreground text-sm h-9 mt-1.5 placeholder:text-text-subtle focus:border-primary/50"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between">
                    <Label className="text-[11px] text-muted-foreground uppercase tracking-wider">Email</Label>
                    <button
                      type="button"
                      onClick={handleAutoEmail}
                      className="text-[10px] text-primary hover:text-yellow-400 transition-colors flex items-center gap-1"
                    >
                      <RefreshCw className="h-3 w-3" /> Auto
                    </button>
                  </div>
                  <div className="flex gap-2 mt-1.5">
                    <Input
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="user@fixflow.app"
                      className="bg-background border-border text-foreground text-sm h-9 flex-1 placeholder:text-text-subtle focus:border-primary/50"
                    />
                  </div>
                </div>

                <div>
                  <Label className="text-[11px] text-muted-foreground uppercase tracking-wider">Role</Label>
                  <Select value={role} onValueChange={setRole}>
                    <SelectTrigger className="bg-background border-border text-foreground text-sm h-9 mt-1.5 focus:ring-[#D4AF37]/30">
                      <SelectValue placeholder="Select role" />
                    </SelectTrigger>
                    <SelectContent className="bg-input-bg border-border text-foreground">
                      {ROLES.map((r) => (
                        <SelectItem key={r} value={r} className="text-sm capitalize focus:bg-accent focus:text-foreground">
                          {r}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <div className="flex items-center justify-between">
                    <Label className="text-[11px] text-muted-foreground uppercase tracking-wider">Password</Label>
                    <button
                      type="button"
                      onClick={handleAutoPwd}
                      className="text-[10px] text-primary hover:text-yellow-400 transition-colors flex items-center gap-1"
                    >
                      <RefreshCw className="h-3 w-3" /> Generate
                    </button>
                  </div>
                  <div className="relative mt-1.5">
                    <Input
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      type={showPwd ? "text" : "password"}
                      placeholder="••••••••"
                      className="bg-background border-border text-foreground text-sm h-9 pr-9 placeholder:text-text-subtle focus:border-primary/50"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPwd(!showPwd)}
                      className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {showPwd ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label className="text-[11px] text-muted-foreground uppercase tracking-wider">Department</Label>
                    <Input
                      value={department}
                      onChange={(e) => setDepartment(e.target.value)}
                      placeholder="Engineering"
                      className="bg-background border-border text-foreground text-sm h-9 mt-1.5 placeholder:text-text-subtle focus:border-primary/50"
                    />
                  </div>
                  <div>
                    <Label className="text-[11px] text-muted-foreground uppercase tracking-wider">Phone</Label>
                    <Input
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+234-800-0000"
                      className="bg-background border-border text-foreground text-sm h-9 mt-1.5 placeholder:text-text-subtle focus:border-primary/50"
                    />
                  </div>
                </div>

                <Button
                  onClick={handleAdd}
                  className="w-full bg-primary hover:bg-yellow-500 text-black font-semibold text-sm h-10 mt-1"
                >
                  <UserPlus className="h-4 w-4 mr-2" />
                  Generate & Add User
                </Button>
              </CardContent>
            </Card>

            {/* Bulk Generate */}
            <Card className="bg-input-bg border-border">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-semibold text-foreground flex items-center gap-2">
                  <Users className="h-4 w-4 text-primary" />
                  Bulk Generate
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label className="text-[11px] text-muted-foreground uppercase tracking-wider">Count</Label>
                    <Input
                      type="number"
                      min={1}
                      max={50}
                      value={bulkCount}
                      onChange={(e) => setBulkCount(parseInt(e.target.value) || 5)}
                      className="bg-background border-border text-foreground text-sm h-9 mt-1.5 placeholder:text-text-subtle focus:border-primary/50"
                    />
                  </div>
                  <div>
                    <Label className="text-[11px] text-muted-foreground uppercase tracking-wider">Name Prefix</Label>
                    <Input
                      value={bulkPrefix}
                      onChange={(e) => setBulkPrefix(e.target.value)}
                      placeholder="user"
                      className="bg-background border-border text-foreground text-sm h-9 mt-1.5 placeholder:text-text-subtle focus:border-primary/50"
                    />
                  </div>
                </div>
                <p className="text-[10px] text-text-subtle">
                  Generates e.g. {bulkPrefix}1@fixflow.app, {bulkPrefix}2@fixflow.app etc.
                </p>
                <Button
                  onClick={handleBulkGenerate}
                  className="w-full bg-primary/10 hover:bg-primary/20 text-primary border border-primary/30 font-semibold text-sm h-10"
                >
                  <Users className="h-4 w-4 mr-2" />
                  Generate {Math.min(Math.max(bulkCount, 1), 50)} Users
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* ─── Generated Users List ─── */}
          <div className="lg:col-span-3">
            <Card className="bg-input-bg border-border">
              <CardHeader className="pb-3 flex flex-row items-center justify-between">
                <CardTitle className="text-sm font-semibold text-foreground flex items-center gap-2">
                  <Key className="h-4 w-4 text-primary" />
                  Generated Credentials
                </CardTitle>
                {entries.length > 0 && (
                  <span className="text-[11px] text-muted-foreground">{entries.length} account{entries.length !== 1 ? "s" : ""}</span>
                )}
              </CardHeader>
              <CardContent>
                {entries.length === 0 ? (
                  <div className="text-center py-12">
                    <Key className="h-10 w-10 text-text-tertiary mx-auto mb-3" />
                    <p className="text-sm text-muted-foreground">No generated users yet</p>
                    <p className="text-xs text-text-subtle mt-1">Use the form to create user credentials</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {entries.map(([emailKey, acct], idx) => (
                      <motion.div
                        key={emailKey}
                        initial={{ opacity: 0, y: 6 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.02 }}
                        className="bg-background border border-border rounded-lg p-3 sm:p-4 transition-all duration-200 hover:border-input"
                      >
                        <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                          {/* Info */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="text-sm font-medium text-foreground truncate">{acct.profile.full_name}</span>
                              <Badge className={`text-[9px] px-1.5 py-0.5 font-medium ${getRoleColor(acct.profile.role)}`}>
                                {acct.profile.role}
                              </Badge>
                            </div>
                            <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3 mt-1 text-xs text-muted-foreground">
                              <span className="flex items-center gap-1">
                                <Mail className="h-3 w-3" /> {acct.profile.email}
                              </span>
                              <span className="flex items-center gap-1">
                                <Key className="h-3 w-3" />
                                <span className={showPwd ? "text-foreground" : ""}>
                                  {showPwd ? acct.password : "••••••••"}
                                </span>
                              </span>
                              {acct.profile.department && (
                                <span className="hidden sm:inline text-text-subtle">{acct.profile.department}</span>
                              )}
                            </div>
                          </div>
                          {/* Actions */}
                          <div className="flex items-center gap-1.5 shrink-0">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => copyCredentials(emailKey)}
                              className="h-8 px-2.5 text-xs text-primary hover:text-yellow-400 hover:bg-primary/10"
                            >
                              {copiedId === emailKey ? (
                                <Check className="h-3.5 w-3.5" />
                              ) : (
                                <Copy className="h-3.5 w-3.5" />
                              )}
                              <span className="ml-1.5 hidden sm:inline">{copiedId === emailKey ? "Copied" : "Copy"}</span>
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDelete(emailKey)}
                              className="h-8 px-2.5 text-xs text-destructive hover:text-red-400 hover:bg-destructive/10"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                              <span className="ml-1.5 hidden sm:inline">Delete</span>
                            </Button>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

