"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { login } from "@/lib/api/auth";
import {
  Wrench, Mail, Lock, Eye, EyeOff, Loader2, Bell, MapPin, CheckCircle2,
  ArrowRight, Play, Shield, Activity, Radio, Users,
} from "lucide-react";
import InstallPrompt from "@/components/InstallPrompt";
import { BRAND } from "@/lib/brand";

function AnalyticsBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationId: number;
    let time = 0;
    const c = ctx;
    const cv = canvas;

    const resize = () => {
      cv.width = window.innerWidth;
      cv.height = window.innerHeight;
    };
    resize();
    window.addEventListener("resize", resize);

    const nodes: { x: number; y: number; vx: number; vy: number; r: number }[] = [];
    for (let i = 0; i < 40; i++) {
      nodes.push({
        x: Math.random() * cv.width,
        y: Math.random() * cv.height,
        vx: (Math.random() - 0.5) * 0.3,
        vy: (Math.random() - 0.5) * 0.3,
        r: Math.random() * 2 + 1,
      });
    }

    function draw() {
      time += 0.005;
      c.clearRect(0, 0, cv.width, cv.height);

      // Grid lines
      c.strokeStyle = "rgba(255,255,255,0.015)";
      c.lineWidth = 1;
      const step = 60;
      for (let x = 0; x < cv.width; x += step) {
        c.beginPath();
        c.moveTo(x, 0);
        c.lineTo(x, cv.height);
        c.stroke();
      }
      for (let y = 0; y < cv.height; y += step) {
        c.beginPath();
        c.moveTo(0, y);
        c.lineTo(cv.width, y);
        c.stroke();
      }

      // Sine wave data lines
      c.strokeStyle = "rgba(212, 175, 55, 0.04)";
      c.lineWidth = 2;
      for (let wave = 0; wave < 3; wave++) {
        c.beginPath();
        for (let x = 0; x < cv.width; x += 3) {
          const y = cv.height * (0.25 + wave * 0.25) +
            Math.sin(x * 0.008 + time + wave * 2) * 30 +
            Math.sin(x * 0.015 + time * 0.7 + wave) * 15;
          x === 0 ? c.moveTo(x, y) : c.lineTo(x, y);
        }
        c.stroke();
      }

      // Second wave set
      c.strokeStyle = "rgba(0, 180, 216, 0.03)";
      for (let wave = 0; wave < 2; wave++) {
        c.beginPath();
        for (let x = 0; x < cv.width; x += 3) {
          const y = cv.height * (0.15 + wave * 0.35) +
            Math.cos(x * 0.012 + time * 0.8 + wave * 3) * 25 +
            Math.sin(x * 0.02 + time * 0.5) * 10;
          x === 0 ? c.moveTo(x, y) : c.lineTo(x, y);
        }
        c.stroke();
      }

      // Nodes and connections
      for (let i = 0; i < nodes.length; i++) {
        const n = nodes[i];
        n.x += n.vx;
        n.y += n.vy;
        if (n.x < 0 || n.x > cv.width) n.vx *= -1;
        if (n.y < 0 || n.y > cv.height) n.vy *= -1;

        const pulse = Math.sin(time * 2 + i) * 0.3 + 0.7;
        c.beginPath();
        c.arc(n.x, n.y, n.r * pulse, 0, Math.PI * 2);
        c.fillStyle = `rgba(212, 175, 55, ${0.2 * pulse})`;
        c.fill();

        // Connections
        for (let j = i + 1; j < nodes.length; j++) {
          const m = nodes[j];
          const dx = n.x - m.x;
          const dy = n.y - m.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 180) {
            c.beginPath();
            c.moveTo(n.x, n.y);
            c.lineTo(m.x, m.y);
            c.strokeStyle = `rgba(212, 175, 55, ${0.06 * (1 - dist / 180)})`;
            c.lineWidth = 0.5;
            c.stroke();
          }
        }
      }

      animationId = requestAnimationFrame(draw);
    }

    draw();
    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 pointer-events-none z-0"
    />
  );
}

function LaptopMockup() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 80 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 1, delay: 0.2 }}
      className="w-full max-w-[520px]"
    >
      <div className="relative perspective-[1200px]">
        {/* Glow */}
        <div className="absolute -inset-4 bg-primary/5 rounded-[28px] blur-2xl" />
        <div className="relative transform -rotate-y-[2deg] rotate-x-[4deg]">
          {/* Screen */}
          <div className="bg-card rounded-t-xl overflow-hidden border border-border shadow-[0_30px_120px_rgba(0,0,0,0.6),0_0_0_1px_rgba(212,175,55,0.05)]">
            {/* Browser bar */}
            <div className="h-[30px] bg-muted flex items-center px-3 gap-2 border-b border-border">
              <div className="flex gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full bg-destructive" />
                <div className="w-2.5 h-2.5 rounded-full bg-warning" />
                <div className="w-2.5 h-2.5 rounded-full bg-success" />
              </div>
              <div className="flex-1 flex justify-center">
                <div className="bg-card-alt text-text-subtle text-[9px] rounded-full px-3 py-0.5 border border-border">
                  fixflow.app / technician
                </div>
              </div>
            </div>
            {/* Dashboard content */}
            <div className="p-4 bg-card">
              {/* Header */}
              <div className="flex items-center justify-between mb-3">
                <div>
                  <div className="text-text-muted text-[9px] font-medium tracking-wider uppercase">Field Operations</div>
                  <div className="text-foreground text-xs font-bold mt-0.5">Today's Schedule</div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1 bg-card rounded-full px-2 py-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-success" />
                    <span className="text-[9px] text-text-muted">Online</span>
                  </div>
                  <div className="w-6 h-6 rounded-full bg-gradient-to-br from-primary to-[#B8941A] flex items-center justify-center text-primary-foreground font-bold text-[9px]">
                    TK
                  </div>
                </div>
              </div>

              {/* Status cards */}
              <div className="grid grid-cols-3 gap-2 mb-3">
                {[
                  { label: "Open Jobs", value: "7", color: "var(--color-warning)" },
                  { label: "In Progress", value: "4", color: "var(--color-info)" },
                  { label: "Completed", value: "18", color: "var(--color-success)" },
                ].map((s) => (
                  <div key={s.label} className="bg-card rounded-lg p-2.5 border border-border">
                    <div className="flex items-center gap-1.5 mb-1">
                      <span className="w-1.5 h-1.5 rounded-full" style={{ background: s.color }} />
                      <span className="text-text-muted text-[8px]">{s.label}</span>
                    </div>
                    <div className="text-foreground font-bold text-base leading-none">{s.value}</div>
                  </div>
                ))}
              </div>

              {/* Work order list */}
              <div className="mb-3">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-text-muted text-[9px] font-medium uppercase tracking-wider">Active Work Orders</span>
                  <span className="text-primary text-[8px]">View All</span>
                </div>
                <div className="space-y-1">
                  {[
                    { task: "AHU-003 Filter Replacement", status: "In Progress", color: "var(--color-info)" },
                    { task: "Generator B2 Oil Change", status: "Open", color: "var(--color-warning)" },
                    { task: "Pump Station 4 Seal Check", status: "Completed", color: "var(--color-success)" },
                  ].map((item) => (
                    <div key={item.task} className="flex items-center gap-2 bg-card rounded-lg px-2.5 py-1.5 border border-border">
                      <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: item.color }} />
                      <span className="text-foreground text-[9px] flex-1 truncate">{item.task}</span>
                      <span className="text-[9px] text-text-muted shrink-0">{item.status}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Equipment checklist */}
              <div>
                <span className="text-text-muted text-[9px] font-medium uppercase tracking-wider mb-1 block">Equipment Checklist</span>
                <div className="flex gap-1.5">
                  {[
                    { label: "Tools", done: true },
                    { label: "PPE", done: true },
                    { label: "Parts", done: false },
                    { label: "Manual", done: true },
                  ].map((item) => (
                    <div
                      key={item.label}
                      className={`flex items-center gap-1 rounded-full px-2 py-0.5 text-[8px] border ${
                        item.done
                          ? "bg-success/10 border-success/20 text-success"
                          : "bg-warning/10 border-warning/20 text-warning"
                      }`}
                    >
                      {item.done ? <CheckCircle2 className="w-2 h-2" /> : <span className="w-2 h-2 rounded-full border border-current" />}
                      {item.label}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
          {/* Laptop base */}
          <div className="h-[10px] w-[103%] -ml-[1.5%] bg-gradient-to-b from-border to-card rounded-b-lg relative">
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-6 h-[2px] bg-text-subtle rounded-t" />
          </div>
          {/* Screen reflection */}
          <div className="absolute top-[2px] left-[2px] right-[2px] h-[30%] bg-gradient-to-b from-foreground/[0.02] to-transparent rounded-t-lg pointer-events-none" />
        </div>
      </div>
    </motion.div>
  );
}

function TabletMockup() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 60, x: 60 }}
      animate={{ opacity: 1, y: 0, x: 0 }}
      transition={{ duration: 0.9, delay: 0.5 }}
      className="absolute right-[2%] bottom-[2%] w-[32%] max-w-[220px] z-10"
    >
      <div className="relative">
        <div className="absolute -inset-3 bg-info/5 rounded-[24px] blur-xl" />
        <div className="bg-card rounded-2xl overflow-hidden border border-border shadow-[0_20px_60px_rgba(0,0,0,0.6)] p-1.5 relative">
          {/* Camera dot */}
          <div className="absolute top-3 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-text-subtle z-10" />
          <div className="bg-card rounded-xl p-2.5 mt-1">
            {/* Header */}
            <div className="flex items-center justify-between mb-2">
              <span className="text-primary text-[8px] font-bold tracking-wider">FACILITY OVERVIEW</span>
              <div className="w-1.5 h-1.5 rounded-full bg-success" />
            </div>

            {/* System status grid */}
            <div className="grid grid-cols-2 gap-1 mb-2">
              {[
                { label: "Power", value: "94%", color: "var(--color-success)" },
                { label: "Water", value: "87%", color: "var(--color-info)" },
                { label: "HVAC", value: "76%", color: "var(--color-warning)" },
                { label: "Safety", value: "All OK", color: "var(--color-success)" },
              ].map((s) => (
                <div key={s.label} className="bg-card rounded-lg p-1.5 border border-border">
                  <div className="text-text-muted text-[6px] uppercase tracking-wider">{s.label}</div>
                  <div className="flex items-center gap-1 mt-0.5">
                    <span className="w-1 h-1 rounded-full" style={{ background: s.color }} />
                    <span className="text-foreground text-[9px] font-semibold">{s.value}</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Mini bar chart */}
            <div className="bg-card rounded-lg p-2 border border-border mb-2">
              <div className="text-text-muted text-[6px] uppercase tracking-wider mb-1">Maintenance Overview</div>
              <div className="flex items-end gap-1 h-8">
                {[45, 70, 55, 85, 60, 90, 75].map((h, i) => (
                  <div key={i} className="flex-1 flex flex-col items-center gap-0.5">
                    <div
                      className="w-full rounded-sm transition-all"
                      style={{
                        height: `${h * 0.35}px`,
                        background: i === 3 || i === 5 ? "var(--color-primary)" : "var(--color-border)",
                      }}
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Active alerts */}
            <div>
              <span className="text-text-muted text-[6px] font-medium uppercase tracking-wider">Alerts</span>
              <div className="space-y-0.5 mt-0.5">
                {[
                  { text: "Gen set B2 due service", urgent: true },
                  { text: "Tank 4 level low", urgent: false },
                ].map((a) => (
                  <div key={a.text} className="flex items-center gap-1">
                    <span className={`w-1 h-1 rounded-full shrink-0 ${a.urgent ? "bg-destructive" : "bg-warning"}`} />
                    <span className="text-foreground text-[6px] truncate">{a.text}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

function PhoneMockup() {
  return (
    <motion.div
      initial={{ opacity: 0, x: 40, y: 40 }}
      animate={{ opacity: 1, x: 0, y: 0 }}
      transition={{ duration: 0.8, delay: 0.7 }}
      className="absolute left-[0%] bottom-[5%] w-[20%] max-w-[130px] z-20"
    >
      <div className="relative">
        <div className="absolute -inset-3 bg-primary/5 rounded-[24px] blur-xl" />
        <div className="bg-card rounded-[20px] overflow-hidden border border-border shadow-[0_20px_60px_rgba(0,0,0,0.6)] p-[3px]">
          {/* Notch */}
          <div className="flex justify-center pt-1 pb-0.5">
            <div className="w-8 h-[3px] bg-background rounded-full" />
          </div>
          <div className="bg-card rounded-[16px] p-2">
            {/* Status bar */}
            <div className="flex items-center justify-between mb-1.5">
              <Shield className="w-2.5 h-2.5 text-primary" />
              <div className="flex items-center gap-1">
                <span className="w-1 h-1 rounded-full bg-success" />
                <span className="text-success text-[5px] font-medium">Live</span>
              </div>
            </div>

            {/* Visitor check-in */}
            <div className="bg-card rounded-lg p-1.5 border border-border mb-1.5">
              <div className="flex items-center justify-between mb-1">
                <span className="text-text-muted text-[5px] uppercase tracking-wider">Visitor Log</span>
                <span className="text-primary text-[5px]">+ Check In</span>
              </div>
              <div className="space-y-0.5">
                {[
                  { name: "John Doe", time: "09:23", status: "IN" },
                  { name: "Sarah K.", time: "10:05", status: "IN" },
                ].map((v) => (
                  <div key={v.name} className="flex items-center justify-between">
                    <span className="text-foreground text-[6px]">{v.name}</span>
                    <div className="flex items-center gap-1">
                      <span className="text-text-muted text-[5px]">{v.time}</span>
                      <span className="text-[6px] font-bold text-success">{v.status}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Access logs */}
            <div className="bg-card rounded-lg p-1.5 border border-border mb-1.5">
              <span className="text-text-muted text-[5px] uppercase tracking-wider block mb-0.5">Access Logs</span>
              <div className="space-y-0.5">
                {[
                  { gate: "Main Gate", count: "24", trend: "up" },
                  { gate: "Service Bay", count: "8", trend: "down" },
                ].map((l) => (
                  <div key={l.gate} className="flex items-center justify-between">
                    <span className="text-foreground text-[6px]">{l.gate}</span>
                    <span className="text-primary text-[6px] font-semibold">{l.count}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* CCTV status */}
            <div className="flex gap-1">
              {[
                { cam: "CAM-01", ok: true },
                { cam: "CAM-02", ok: true },
                { cam: "CAM-03", ok: false },
                { cam: "CAM-04", ok: true },
              ].map((c) => (
                <div key={c.cam} className="flex-1 bg-card rounded p-1 border border-border text-center">
                  <div className={`w-1 h-1 rounded-full mx-auto mb-0.5 ${c.ok ? "bg-success" : "bg-destructive"}`} />
                  <span className="text-text-muted text-[4px] block truncate">{c.cam}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

export default function LandingPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Production bootstrapping: seed default admin on first-ever visit
  useEffect(() => {
    const raw = localStorage.getItem("fixflow-generated-users");
    if (raw) return;
    const ADMIN_CREDENTIALS = { email: "admin@fixflow.app", password: "admin" };
    const defaultAdmin = {
      password: ADMIN_CREDENTIALS.password,
      profile: {
        id: "gen-default-admin",
        email: ADMIN_CREDENTIALS.email,
        full_name: "Admin User",
        role: "admin",
        department: "Administration",
        organization_id: "0538a722-bba0-4c7f-b470-37d91a8c1c31",
      },
      createdAt: new Date().toISOString(),
    };
    localStorage.setItem("fixflow-generated-users", JSON.stringify({ [ADMIN_CREDENTIALS.email]: defaultAdmin }));
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const user = await login(email, password);
      const rolePath: Record<string, string> = { admin: "admin", manager: "manager", supervisor: "supervisor", staff: "staff", stakeholder: "stakeholder", tenant: "tenant" };
      router.push(rolePath[user.role] ? `/${rolePath[user.role]}` : "/");
    } catch (err: any) {
      setError(err.message || "Invalid email or password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground overflow-x-hidden">
      {/* Animated background */}
      <AnalyticsBackground />

      {/* Gradient overlays */}
      <div className="fixed top-[-20%] right-[-10%] w-[700px] h-[700px] bg-primary/[0.03] rounded-full blur-3xl pointer-events-none" />
      <div className="fixed bottom-[-10%] left-[-5%] w-[500px] h-[500px] bg-info/[0.02] rounded-full blur-3xl pointer-events-none" />

      {/* Top nav bar */}
      <div className="relative z-20 border-b border-border">
        <div className="max-w-[1400px] mx-auto px-6 lg:px-12 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Image
              src="/fixflow-logo.png"
              alt={BRAND.appName}
              width={32}
              height={32}
              className="rounded-lg"
            />
            <span className="font-bold text-lg text-foreground tracking-tight">{BRAND.appName}</span>
          </div>
          <div className="flex items-center gap-4">
            <Link
              href="#signin"
              className="hidden sm:inline-flex text-sm text-text-muted hover:text-foreground transition-colors"
            >
              Sign In
            </Link>
            <Link
              href="#demo"
              className="inline-flex items-center gap-1.5 text-sm font-medium px-4 py-1.5 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
            >
              Get Started <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </div>

      {/* Hero */}
      <section className="relative z-10 max-w-[1400px] mx-auto px-6 lg:px-12 pt-8 pb-12 lg:pt-12 lg:pb-20">
        <div className="flex flex-col lg:flex-row items-center gap-10 lg:gap-0 min-h-[85vh]">

          {/* ─── LEFT: Brand + Sign In ─── */}
          <div className="w-full lg:w-[440px] shrink-0">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-card border border-primary/20 text-foreground text-[11px] mb-5">
                <span className="w-1.5 h-1.5 rounded-full bg-success" />
                <span className="text-text-muted">Trusted by facility managers across Nigeria</span>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.1 }}
            >
              <h1 className="text-[2.8rem] md:text-[3.8rem] font-extrabold leading-[1.05] tracking-tight">
                Intelligent
                <br />
                <span className="text-primary">Facility Management</span>
                <br />
                System
              </h1>

              <p className="mt-4 text-text-muted text-base leading-relaxed max-w-[420px]">
                Real-time monitoring, workforce coordination, and building intelligence —
                unified in one platform.
              </p>
            </motion.div>

            {/* CTA buttons */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.25 }}
              className="flex items-center gap-3 mt-6"
            >
              <Link
                href="#demo"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-primary text-primary-foreground font-semibold text-sm hover:bg-primary/90 transition-all shadow-[0_4px_20px_rgba(212,175,55,0.15)]"
              >
                Request Demo <Play className="w-3.5 h-3.5" />
              </Link>
              <Link
                href="#signin"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg border border-border text-foreground text-sm font-medium hover:bg-accent transition-all"
              >
                Sign In <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </motion.div>

            {/* Trust indicators */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="flex items-center gap-4 mt-8 text-[10px] text-text-subtle"
            >
              <div className="flex items-center gap-1">
                <Radio className="w-3 h-3 text-primary" />
                Real-time
              </div>
              <div className="flex items-center gap-1">
                <Shield className="w-3 h-3 text-primary" />
                Secure
              </div>
              <div className="flex items-center gap-1">
                <Users className="w-3 h-3 text-primary" />
                500+ Sites
              </div>
            </motion.div>

            {/* Sign In Form */}
            <motion.div
              id="signin"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.35 }}
              className="mt-8"
            >
              <div className="bg-card border border-border rounded-xl p-5">
                <p className="text-foreground text-xs font-medium mb-3">Sign in to your account</p>
                <form onSubmit={handleLogin} className="space-y-3">
                  <div>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-subtle" />
                      <input
                        type="email"
                        placeholder="Email address"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        className="w-full h-10 pl-9 pr-3 rounded-lg bg-card-alt border border-input text-foreground text-[13px] placeholder:text-text-subtle outline-none focus:border-ring/40 transition-colors"
                      />
                    </div>
                  </div>

                  <div>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-subtle" />
                      <input
                        type={showPassword ? "text" : "password"}
                        placeholder="Password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        className="w-full h-10 pl-9 pr-9 rounded-lg bg-card-alt border border-input text-foreground text-[13px] placeholder:text-text-subtle outline-none focus:border-ring/40 transition-colors"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-text-subtle hover:text-foreground transition-colors"
                      >
                        {showPassword ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                      </button>
                    </div>
                  </div>

                  {error && (
                    <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-[11px] text-destructive bg-destructive/10 rounded-lg p-2.5">
                      {error}
                    </motion.p>
                  )}

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full h-10 rounded-lg bg-primary text-primary-foreground font-bold text-[13px] hover:bg-primary/90 transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
                  >
                    {loading && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                    {loading ? "Signing in..." : "Sign In"}
                  </button>

                  <div className="flex items-center justify-center">
                    <Link href="/reset-password" className="text-primary text-[11px] hover:underline">
                      Forgot password?
                    </Link>
                  </div>
                </form>
              </div>

              <p className="mt-3 text-[10px] text-text-subtle text-center">
                By signing in you agree to the{" "}
                <Link href="#" className="text-text-tertiary hover:text-foreground">Terms</Link> &amp;{" "}
                <Link href="#" className="text-text-tertiary hover:text-foreground">Privacy Policy</Link>
              </p>
            </motion.div>
          </div>

          {/* ─── RIGHT: Device Mockups ─── */}
          <div className="flex-1 flex items-center justify-center lg:pl-12">
            <div className="relative w-full max-w-[800px] h-[480px] md:h-[580px] flex items-center justify-center">
              {/* Background glow behind devices */}
              <div className="absolute inset-0 bg-gradient-radial from-primary/[0.03] via-transparent to-transparent" />

              {/* Laptop */}
              <div className="absolute bottom-[15%] left-[5%] w-[78%] max-w-[560px]">
                <LaptopMockup />
              </div>

              {/* Tablet */}
              <TabletMockup />

              {/* Phone */}
              <PhoneMockup />

              {/* Floating labels */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.2, duration: 0.6 }}
                className="absolute bottom-[2%] right-[18%] z-30 hidden lg:block"
              >
                <div className="flex items-center gap-1.5 bg-background/40 backdrop-blur-sm border border-border rounded-full px-2.5 py-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-success" />
                  <span className="text-[9px] text-text-muted">All systems operational</span>
                </div>
              </motion.div>
            </div>
          </div>

        </div>
      </section>

      {/* Features strip */}
      <section className="relative z-10 border-t border-border py-10">
        <div className="max-w-[1400px] mx-auto px-6 lg:px-12">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { icon: Wrench, label: "Workforce Mgmt", desc: "Track field teams in real-time" },
              { icon: Activity, label: "Building Intel", desc: "Monitor power, water, HVAC" },
              { icon: Shield, label: "Security Ops", desc: "Visitor logs & access control" },
              { icon: Radio, label: "Live Monitoring", desc: "Real-time dashboards & alerts" },
            ].map((f) => (
              <motion.div
                key={f.label}
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="bg-card border border-border rounded-xl p-4 hover:bg-accent transition-colors"
              >
                <f.icon className="w-4 h-4 text-primary mb-2" />
                <div className="text-foreground text-sm font-semibold">{f.label}</div>
                <div className="text-text-muted text-[11px] mt-0.5">{f.desc}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 border-t border-border bg-background/30 py-6 px-6">
        <div className="max-w-[1400px] mx-auto flex flex-col md:flex-row items-center justify-between gap-2 text-center md:text-left">
          <div className="flex items-center gap-2">
            <Image
              src="/fixflow-logo.png"
              alt={BRAND.appName}
              width={24}
              height={24}
              className="rounded"
            />
            <span className="text-sm font-bold text-foreground">{BRAND.appName}</span>
          </div>
          <p className="text-[11px] text-text-subtle">
            &copy; {new Date().getFullYear()} {BRAND.appName}. All rights reserved. {BRAND.ownedBy}
          </p>
        </div>
      </footer>

      <InstallPrompt />
    </div>
  );
}
