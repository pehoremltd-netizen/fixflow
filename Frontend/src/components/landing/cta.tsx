"use client";

import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ArrowRight, Check } from "lucide-react";
import Link from "next/link";

const benefits = [
  "Multi-tenant SaaS architecture",
  "Role-based access control",
  "Mobile-first responsive design",
  "QR code integration",
  "Real-time analytics",
  "Dedicated subdomain workspace",
  "24/7 Support",
];

export function CTA() {
  return (
    <section className="py-24 relative overflow-hidden bg-background">
      <div className="absolute inset-0 bg-gradient-to-b from-primary/5 to-transparent" />
      <div className="container mx-auto px-4 max-w-7xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
          className="relative rounded-2xl bg-gradient-to-br from-primary to-mustard p-8 md:p-12 lg:p-16 overflow-hidden theme-glow"
        >
          <div className="absolute top-0 right-0 w-64 h-64 bg-primary-foreground/20 rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-primary-foreground/10 rounded-full blur-3xl" />

          <div className="relative grid lg:grid-cols-2 gap-8 items-center">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold mb-4 text-primary-foreground">
                Ready to Transform Your Facility Management?
              </h2>
              <p className="text-lg text-primary-foreground/70 mb-8">
                Join thousands of facilities using FixFlow to streamline their
                maintenance operations.
              </p>
              <div className="grid grid-cols-2 gap-3 mb-8">
                {benefits.map((benefit) => (
                  <div key={benefit} className="flex items-center gap-2 text-sm text-primary-foreground/80">
                    <Check className="h-4 w-4 shrink-0 text-primary-foreground" />
                    {benefit}
                  </div>
                ))}
              </div>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link href="/">
                  <Button
                    size="xl"
                    className="gap-2 w-full sm:w-auto bg-background text-primary hover:bg-background/90"
                  >
                    Sign In <ArrowRight className="h-5 w-5" />
                  </Button>
                </Link>
                <Link href="/">
                  <Button
                    size="xl"
                    variant="outline"
                    className="gap-2 w-full sm:w-auto border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10"
                  >
                    Book a Demo
                  </Button>
                </Link>
              </div>
            </div>
            <div className="hidden lg:block">
              <div className="grid grid-cols-2 gap-4">
                {[
                  { label: "Active Users", value: "50K+" },
                  { label: "Facilities", value: "10K+" },
                  { label: "Avg. Response", value: "< 2min" },
                  { label: "Satisfaction", value: "98%" },
                ].map((stat) => (
                  <div
                    key={stat.label}
                    className="bg-primary-foreground/10 backdrop-blur rounded-xl p-4 text-center"
                  >
                    <div className="text-3xl font-bold text-primary-foreground">{stat.value}</div>
                    <div className="text-sm text-primary-foreground/70">{stat.label}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
