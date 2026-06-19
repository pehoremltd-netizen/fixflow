"use client";

import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ArrowRight, Play } from "lucide-react";
import Link from "next/link";

export function Hero() {
  return (
    <section className="relative min-h-screen flex items-center overflow-hidden bg-background">
      <div className="absolute inset-0 bg-gradient-to-b from-background via-muted to-background" />
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-primary/5 rounded-full blur-3xl" />
      <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-mustard/5 rounded-full blur-3xl" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-primary/3 rounded-full blur-3xl" />

      <div className="container relative mx-auto px-4 py-20 max-w-7xl">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Content */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center lg:text-left"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
              className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 backdrop-blur-sm px-4 py-1.5 text-sm theme-glow-subtle"
            >
              <span className="flex h-2 w-2 rounded-full bg-primary animate-pulse" />
              <span className="text-primary font-medium">Enterprise CMMS Platform</span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-4xl md:text-5xl lg:text-7xl font-bold tracking-tight mb-6 text-foreground"
            >
              Transform Your{" "}
              <span className="gradient-text">Facility Management</span>{" "}
              Operations
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="text-lg md:text-xl text-text-secondary mb-8 max-w-xl mx-auto lg:mx-0"
            >
              FixFlow is the next-generation CMMS platform that empowers facility
              teams with intelligent maintenance management, real-time analytics,
              and seamless multi-device access.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start"
            >
              <Link href="/">
                <Button size="xl" className="gap-2 w-full sm:w-auto theme-glow">
                  Sign In <ArrowRight className="h-5 w-5" />
                </Button>
              </Link>
              <Link href="/">
                <Button
                  size="xl"
                  variant="outline"
                  className="gap-2 w-full sm:w-auto border-primary/30 text-primary hover:bg-primary/10 hover:text-primary"
                >
                  <Play className="h-5 w-5" /> Book a Demo
                </Button>
              </Link>
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.7 }}
              className="mt-12 flex items-center gap-8 justify-center lg:justify-start"
            >
              <div className="text-center">
                <div className="text-2xl font-bold text-foreground">10K+</div>
                <div className="text-xs text-text-tertiary">Facilities</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-foreground">50K+</div>
                <div className="text-xs text-text-tertiary">Users</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-foreground">99.9%</div>
                <div className="text-xs text-text-tertiary">Uptime</div>
              </div>
            </motion.div>
          </motion.div>

          {/* Right Content - Device Mockups */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="relative hidden lg:block"
          >
            <div className="relative">
              <div className="absolute -inset-20 bg-primary/5 rounded-full blur-3xl" />
              {/* Laptop */}
              <motion.div
                animate={{ y: [0, -8, 0] }}
                transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
                className="relative z-10"
              >
                <div className="relative mx-auto w-[500px] theme-glow">
                  <div className="rounded-t-xl overflow-hidden bg-card shadow-2xl border border-border">
                    <div className="h-[300px] bg-gradient-to-br from-primary/20 via-primary/10 to-mustard/20 p-4">
                      <div className="bg-card/90 backdrop-blur rounded-lg p-3 mb-2">
                        <div className="flex justify-between items-center mb-2">
                          <div className="flex gap-1">
                            <div className="w-2 h-2 rounded-full bg-destructive" />
                            <div className="w-2 h-2 rounded-full bg-mustard" />
                            <div className="w-2 h-2 rounded-full bg-primary" />
                          </div>
                          <span className="text-text-tertiary text-xs">FixFlow Dashboard</span>
                        </div>
                        <div className="grid grid-cols-3 gap-2">
                          <div className="bg-primary/10 rounded p-2">
                            <div className="text-primary text-xs font-semibold">Work Orders</div>
                            <div className="text-foreground text-lg font-bold">142</div>
                          </div>
                          <div className="bg-primary/10 rounded p-2">
                            <div className="text-primary text-xs font-semibold">Completed</div>
                            <div className="text-foreground text-lg font-bold">89</div>
                          </div>
                          <div className="bg-primary/10 rounded p-2">
                            <div className="text-primary text-xs font-semibold">Pending</div>
                            <div className="text-foreground text-lg font-bold">23</div>
                          </div>
                        </div>
                        <div className="mt-2 bg-primary/10 rounded p-2">
                          <div className="flex justify-between text-foreground text-xs">
                            <span>Maintenance Performance</span>
                            <span className="text-primary">94%</span>
                          </div>
                          <div className="mt-1 h-1.5 bg-muted rounded-full overflow-hidden">
                            <motion.div
                              className="h-full bg-gradient-to-r from-primary to-mustard rounded-full"
                              initial={{ width: 0 }}
                              animate={{ width: "94%" }}
                              transition={{ duration: 2, delay: 1 }}
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="bg-card h-3 rounded-b-xl mx-auto w-[480px] border-x border-b border-border" />
                  <div className="bg-card-alt h-1 rounded-b mx-auto w-[200px] -mt-px" />
                </div>
              </motion.div>

              {/* Tablet */}
              <motion.div
                animate={{ y: [0, 8, 0] }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
                className="absolute -right-10 top-40 z-20"
              >
                <div className="bg-card rounded-2xl p-2 shadow-2xl w-[180px] border border-border theme-glow-subtle">
                  <div className="rounded-xl overflow-hidden bg-gradient-to-br from-primary/20 to-mustard/20 h-[240px] p-3">
                    <div className="flex justify-between items-center mb-2">
                      <div className="text-primary text-xs font-semibold">Inspections</div>
                      <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                    </div>
                    <div className="space-y-2">
                      {["Electrical", "Plumbing", "HVAC"].map((item, i) => (
                        <motion.div
                          key={item}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 1 + i * 0.2 }}
                          className="bg-accent rounded p-1.5 flex justify-between items-center"
                        >
                          <span className="text-foreground text-xs">{item}</span>
                          <span className="text-primary text-xs">✓</span>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* Phone */}
              <motion.div
                animate={{ y: [0, -5, 0] }}
                transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                className="absolute -left-5 bottom-0 z-30"
              >
                <div className="bg-card rounded-3xl p-2 shadow-2xl w-[120px] border border-border">
                  <div className="rounded-2xl overflow-hidden bg-gradient-to-br from-primary/20 to-mustard/20 h-[200px] p-3">
                    <div className="text-primary text-[10px] font-semibold mb-2">QR Scanner</div>
                    <div className="bg-accent rounded-lg p-2 text-center">
                      <div className="w-12 h-12 mx-auto border-2 border-primary/40 rounded mb-1 flex items-center justify-center">
                        <div className="grid grid-cols-2 gap-0.5">
                          {[...Array(4)].map((_, i) => (
                            <div key={i} className="w-2 h-2 bg-primary/60" />
                          ))}
                        </div>
                      </div>
                      <div className="text-text-secondary text-[8px]">Scan to Clock In</div>
                    </div>
                    <div className="mt-2 bg-accent rounded p-1 text-center">
                      <div className="text-foreground text-[8px]">GPS Verified</div>
                      <div className="text-primary text-[6px]">Within radius ✓</div>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
