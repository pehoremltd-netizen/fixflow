"use client";

export function runMigrations() {
  if (typeof window === "undefined") return;

  // 1. Migrate fixflow-stakeholder-links → fixflow-upline-manager-links
  try {
    const oldLinks = localStorage.getItem("fixflow-stakeholder-links");
    if (oldLinks) {
      const existing = localStorage.getItem("fixflow-upline-manager-links");
      if (!existing) {
        localStorage.setItem("fixflow-upline-manager-links", oldLinks);
      }
      localStorage.removeItem("fixflow-stakeholder-links");
    }
  } catch {}

  // 2. Migrate fixflow-stakeholders → fixflow-upline-managers
  try {
    const old = localStorage.getItem("fixflow-stakeholders");
    if (old) {
      const existing = localStorage.getItem("fixflow-upline-managers");
      if (!existing) {
        localStorage.setItem("fixflow-upline-managers", old);
      }
      localStorage.removeItem("fixflow-stakeholders");
    }
  } catch {}

  // 3. Migrate role values in fixflow-generated-users (stakeholder → upline_manager)
  try {
    const raw = localStorage.getItem("fixflow-generated-users");
    if (raw) {
      let changed = false;
      const data = JSON.parse(raw);
      for (const key of Object.keys(data)) {
        if (data[key]?.profile?.role === "stakeholder") {
          data[key].profile.role = "upline_manager";
          changed = true;
        }
      }
      if (changed) {
        localStorage.setItem("fixflow-generated-users", JSON.stringify(data));
      }
    }
  } catch {}

  // 4. Migrate fixflow-viewer-feedback: stakeholderLinkId → uplineManagerLinkId
  try {
    const raw = localStorage.getItem("fixflow-viewer-feedback");
    if (raw) {
      let changed = false;
      const data = JSON.parse(raw);
      for (const item of data) {
        if (item.stakeholderLinkId !== undefined) {
          item.uplineManagerLinkId = item.stakeholderLinkId;
          delete item.stakeholderLinkId;
          changed = true;
        }
      }
      if (changed) {
        localStorage.setItem("fixflow-viewer-feedback", JSON.stringify(data));
      }
    }
  } catch {}
}
