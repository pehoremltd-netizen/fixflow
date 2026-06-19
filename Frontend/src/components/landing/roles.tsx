"use client";

import { motion } from "framer-motion";
import {
  Shield,
  BarChart3,
  Users,
  HardHat,
  Eye,
  Home,
} from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

const roles = [
  {
    icon: Shield,
    title: "Admin Portal",
    description: "Full system control, user management, site configuration, and company-wide analytics.",
    href: "/",
  },
  {
    icon: BarChart3,
    title: "Manager Portal",
    description: "Strategic oversight, performance monitoring, and facility analytics.",
    href: "/",
  },
  {
    icon: Users,
    title: "Supervisor Portal",
    description: "Team management, task assignment, and field operations coordination.",
    href: "/",
  },
  {
    icon: HardHat,
    title: "Staff Portal",
    description: "Inspections, QR attendance, work orders, and daily task management.",
    href: "/",
  },
  {
    icon: Eye,
    title: "Stakeholder Portal",
    description: "Read-only access to reports, KPIs, facility performance, and project progress.",
    href: "/",
  },
  {
    icon: Home,
    title: "Tenant Portal",
    description: "Submit maintenance requests, track service status, and view history.",
    href: "/",
  },
];

export function Roles() {
  return (
    <section className="py-24 relative bg-background">
      <div className="container mx-auto px-4 max-w-7xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-4xl font-bold mb-4 text-foreground">
            Six Dedicated <span className="gradient-text">Portals</span>
          </h2>
          <p className="text-lg text-text-secondary max-w-2xl mx-auto">
            Role-specific interfaces designed for every stakeholder in your
            facility management ecosystem.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {roles.map((role, index) => {
            const Icon = role.icon;
            return (
              <motion.div
                key={role.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="group relative overflow-hidden rounded-xl border border-border bg-card p-6 hover:theme-glow-subtle hover:border-primary/30 transition-all duration-300 card-hover"
              >
                <div className="absolute top-0 right-0 w-32 h-32 rounded-full bg-primary/5 blur-2xl group-hover:opacity-20 transition-opacity" />
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary mb-4">
                  <Icon className="h-6 w-6" />
                </div>
                <h3 className="font-semibold mb-2 text-foreground">{role.title}</h3>
                <p className="text-sm text-text-tertiary mb-4">{role.description}</p>
                <Link href={role.href}>
                  <Button variant="ghost" size="sm" className="gap-1 text-primary hover:text-primary hover:bg-primary/10">
                    Learn More
                  </Button>
                </Link>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
