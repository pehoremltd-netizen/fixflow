export const BRAND = {
  appName: "FIXFLOW",
  appNameLower: "FixFlow",
  ownerName: "Ajose Enijeshiku",
  tagline: "Facility Management System",
  description: "FIXFLOW is a modern, enterprise-grade CMMS platform for facility management companies, property managers, and maintenance teams. Works offline, syncs automatically.",
  ogDescription: "Next-generation facility management and maintenance platform. Works offline.",
  sidebarVersion: "FIXFLOW CMMS v1.0",
  reportHeader: "FIXFLOW CMMS",
  budgetTitle: "FACILITY MAINTENANCE BUDGET PROPOSAL",
  orgDefault: "FIXFLOW Inc.",
  subdomainDefault: "fixflow",
  poweredBy: "Powered by FIXFLOW",
  ownedBy: "Owned by Ajose Enijeshiku",
} as const;

export function getDocumentTitle(page?: string): string {
  return page ? `${page} | ${BRAND.appName} - ${BRAND.tagline}` : `${BRAND.appName} - ${BRAND.tagline}`;
}
