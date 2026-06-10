"use client";

import { motion } from "framer-motion";
import {
  Building2,
  ClipboardCheck,
  QrCode,
  MapPin,
  Wrench,
  BarChart3,
  Shield,
  Users,
  Smartphone,
  FileText,
  Package,
  Clock,
} from "lucide-react";

const features = [
  {
    icon: Building2,
    title: "Multi-Site Management",
    description: "Manage multiple facilities, buildings, and sites from a single unified dashboard.",
  },
  {
    icon: ClipboardCheck,
    title: "Smart Inspections",
    description: "Digital inspection forms with checklists, photos, videos, signatures, and condition tracking.",
  },
  {
    icon: QrCode,
    title: "QR Code Attendance",
    description: "Site-specific QR codes for clock-in/out with GPS verification and geofencing.",
  },
  {
    icon: MapPin,
    title: "GPS Geofencing",
    description: "Ensure staff are physically present at work locations with GPS radius verification.",
  },
  {
    icon: Wrench,
    title: "Work Order Management",
    description: "Create, assign, track, and close work orders with approval workflows.",
  },
  {
    icon: BarChart3,
    title: "Analytics & Reports",
    description: "Real-time dashboards, KPIs, and executive reports for data-driven decisions.",
  },
  {
    icon: Package,
    title: "Asset & Inventory",
    description: "Track assets lifecycle, spare parts inventory, and automated reorder alerts.",
  },
  {
    icon: Smartphone,
    title: "Mobile-First Design",
    description: "Fully responsive across desktop, tablet, and mobile for field operations.",
  },
  {
    icon: Users,
    title: "Role-Based Portals",
    description: "Dedicated portals for Admin, Manager, Supervisor, Staff, Stakeholders, and Tenants.",
  },
  {
    icon: Shield,
    title: "Multi-Tenant SaaS",
    description: "Isolated workspaces with subdomain support and role-based access control.",
  },
  {
    icon: FileText,
    title: "Contract Management",
    description: "Vendor contracts, SLAs, service agreements with automated expiry notifications.",
  },
  {
    icon: Clock,
    title: "Preventive Maintenance",
    description: "Schedule recurring maintenance tasks with automated reminders and planning.",
  },
];

export function Features() {
  return (
    <section className="py-24 relative bg-[#0B0B0B]">
      <div className="container mx-auto px-4 max-w-7xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-4xl font-bold mb-4 text-white">
            Everything You Need for{" "}
            <span className="gradient-text">Facility Management</span>
          </h2>
          <p className="text-lg text-[#B8B8B8] max-w-2xl mx-auto">
            A complete CMMS platform with all the tools to streamline your
            maintenance operations.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.05 }}
                viewport={{ once: true }}
                className="group relative rounded-xl border border-[#222222] bg-[#161616] p-6 hover:border-[#D4AF37]/30 hover:gold-glow-subtle transition-all duration-300 card-hover"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-[#D4AF37]/10 text-[#D4AF37] mb-4 group-hover:scale-110 transition-transform">
                  <Icon className="h-6 w-6" />
                </div>
                <h3 className="font-semibold mb-2 text-white">{feature.title}</h3>
                <p className="text-sm text-[#7A7A7A]">{feature.description}</p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
