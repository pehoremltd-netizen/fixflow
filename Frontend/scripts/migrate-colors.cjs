const fs = require("fs");
const path = require("path");

const ROOT = path.resolve(__dirname, "..");

/* ─── Mapping: 6-char hex → CSS variable (for JS style objects) ─── */
const HEX_TO_VAR = {
  "#D4AF37": "var(--color-primary)",
  "#E1B000": "var(--color-mustard)",
  "#F5D76E": "var(--color-gold-light)",
  "#22C55E": "var(--color-success)",
  "#3B82F6": "var(--color-info)",
  "#EF4444": "var(--color-destructive)",
  "#F59E0B": "var(--color-warning)",
  "#F97316": "var(--color-warning)",
  "#7A7A7A": "var(--color-muted-foreground)",
  "#B8B8B8": "var(--color-secondary-foreground)",
  "#888888": "var(--color-text-muted)",
  "#888": "var(--color-text-muted)",
  "#4A9EFF": "var(--color-info)",
  "#16A34A": "var(--color-success)",
  "#0A0A0A": "var(--color-input-bg)",
  "#111111": "var(--color-secondary)",
  "#161616": "var(--color-card)",
  "#222222": "var(--color-border)",
  "#1A1A1A": "var(--color-card-alt)",
  "#000000": "var(--color-background)",
  "#FFFFFF": "var(--color-foreground)",
  "#4361EE": "var(--color-info)",
  "#D4A017": "var(--color-mustard)",
  "#E63946": "var(--color-destructive)",
  "#06B6D4": "var(--color-info)",
  "#DC2626": "var(--color-destructive)",
  "#2563EB": "var(--color-info)",
  "#FACC15": "var(--color-warning)",
  "#9CA3AF": "var(--color-text-muted)",
  "#6B7280": "var(--color-text-muted)",
  "#374151": "var(--color-secondary-foreground)",
};

/* ─── Mapping: 6-char hex → Tailwind token name (for classNames) ─── */
const HEX_TO_TOKEN = {
  "#D4AF37": "primary",
  "#E1B000": "mustard",
  "#F5D76E": "gold-light",
  "#22C55E": "success",
  "#3B82F6": "info",
  "#EF4444": "destructive",
  "#F59E0B": "warning",
  "#F97316": "warning",
  "#7A7A7A": "muted-foreground",
  "#B8B8B8": "secondary-foreground",
  "#888888": "muted-foreground",
  "#888": "muted-foreground",
  "#4A9EFF": "info",
  "#16A34A": "success",
  "#0A0A0A": "input-bg",
  "#111111": "secondary",
  "#161616": "card",
  "#222222": "border",
  "#1A1A1A": "card-alt",
  "#000000": "background",
  "#FFFFFF": "foreground",
  "#4361EE": "info",
  "#D4A017": "mustard",
  "#E63946": "destructive",
  "#06B6D4": "info",
  "#DC2626": "destructive",
  "#2563EB": "info",
  "#FACC15": "warning",
  "#9CA3AF": "muted-foreground",
  "#6B7280": "muted-foreground",
  "#374151": "secondary-foreground",
};

/* ─── Files to process (excluding QRCodeDisplay which uses canvas colors) ─── */
const FILES = [
  // Admin pages
  "src/app/(dashboard)/admin/fm-calculator/page.tsx",
  "src/app/(dashboard)/admin/work-orders/page.tsx",
  "src/app/(dashboard)/admin/reports/page.tsx",
  "src/app/(dashboard)/admin/sites/page.tsx",
  "src/app/(dashboard)/admin/observations/page.tsx",
  "src/app/(dashboard)/admin/utilities/page.tsx",
  "src/app/(dashboard)/admin/inventory/page.tsx",
  "src/app/(dashboard)/admin/attendance/page.tsx",
  "src/app/(dashboard)/admin/budget/page.tsx",
  "src/app/(dashboard)/admin/contracts/page.tsx",
  "src/app/(dashboard)/admin/contractors/page.tsx",
  "src/app/(dashboard)/admin/tenants/page.tsx",
  "src/app/(dashboard)/admin/stakeholders/page.tsx",
  "src/app/(dashboard)/admin/assets/page.tsx",
  "src/app/(dashboard)/admin/requisitions/page.tsx",
  "src/app/(dashboard)/admin/fault-reports/page.tsx",
  "src/app/(dashboard)/admin/pm-schedule/page.tsx",
  "src/app/(dashboard)/admin/generate-users/page.tsx",
  "src/app/(dashboard)/admin/weekly-reports/page.tsx",
  "src/app/(dashboard)/admin/settings/page.tsx",
  "src/app/(dashboard)/admin/page.tsx",
  "src/app/(dashboard)/admin/inspections/page.tsx",
  "src/app/(dashboard)/admin/daily-inspection/page.tsx",
  // Components
  "src/components/InspectionsPage.tsx",
  "src/components/DailyInspectionForm.tsx",
  // Budget lib
  "src/lib/budgetCalculator.ts",
  "src/lib/budgetTemplate.ts",
  "src/lib/budget.ts",
  "src/lib/budgetExport.ts",
  // Manager pages
  "src/app/(dashboard)/manager/inspections/page.tsx",
  "src/app/(dashboard)/manager/daily-inspection/page.tsx",
  "src/app/(dashboard)/manager/reports/page.tsx",
  "src/app/(dashboard)/manager/performance/page.tsx",
  "src/app/(dashboard)/manager/facilities/page.tsx",
  "src/app/(dashboard)/manager/page.tsx",
  "src/app/(dashboard)/manager/pm-schedule/page.tsx",
  "src/app/(dashboard)/manager/work-orders/page.tsx",
  // Supervisor pages
  "src/app/(dashboard)/supervisor/inspections/page.tsx",
  "src/app/(dashboard)/supervisor/daily-inspection/page.tsx",
  "src/app/(dashboard)/supervisor/page.tsx",
  "src/app/(dashboard)/supervisor/team/page.tsx",
  "src/app/(dashboard)/supervisor/tasks/page.tsx",
  "src/app/(dashboard)/supervisor/attendance/page.tsx",
  // Staff pages
  "src/app/(dashboard)/staff/inspections/page.tsx",
  "src/app/(dashboard)/staff/daily-inspection/page.tsx",
  "src/app/(dashboard)/staff/work-orders/page.tsx",
  "src/app/(dashboard)/staff/history/page.tsx",
  "src/app/(dashboard)/staff/page.tsx",
  "src/app/(dashboard)/staff/attendance/page.tsx",
  // Stakeholder pages
  "src/app/(dashboard)/stakeholder/inspections/page.tsx",
  "src/app/(dashboard)/stakeholder/daily-inspection/page.tsx",
  "src/app/(dashboard)/stakeholder/reports/page.tsx",
  "src/app/(dashboard)/stakeholder/documents/page.tsx",
  "src/app/(dashboard)/stakeholder/kpi/page.tsx",
  "src/app/(dashboard)/stakeholder/page.tsx",
  // Tenant pages
  "src/app/(dashboard)/tenant/inspections/page.tsx",
  "src/app/(dashboard)/tenant/daily-inspection/page.tsx",
  "src/app/(dashboard)/tenant/requests/page.tsx",
  "src/app/(dashboard)/tenant/history/page.tsx",
  "src/app/(dashboard)/tenant/documents/page.tsx",
  "src/app/(dashboard)/tenant/page.tsx",
];

/* ─── Step 1: Replace Tailwind arbitrary-value classes ─── */
function replaceArbitraryValues(code) {
  // Patterns: text-[#XXXXXX]/XX, bg-[#XXXXXX]/XX, border-[#XXXXXX]/XX
  // First handle with opacity suffix
  code = code.replace(
    /(text|bg|border)-\[#([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6})\]\/(\d+)/g,
    (match, prefix, hex, opacity) => {
      // Normalize 3-char hex to 6-char
      const fullHex = hex.length === 3 ? "#" + hex.split("").map(c => c + c).join("").toUpperCase() : "#" + hex.toUpperCase();
      const token = HEX_TO_TOKEN[fullHex];
      if (!token) return match;
      return `${prefix}-${token}/${opacity}`;
    }
  );
  // Then handle without opacity
  code = code.replace(
    /(text|bg|border)-\[#([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6})\]/g,
    (match, prefix, hex) => {
      const fullHex = hex.length === 3 ? "#" + hex.split("").map(c => c + c).join("").toUpperCase() : "#" + hex.toUpperCase();
      const token = HEX_TO_TOKEN[fullHex];
      if (!token) return match;
      return `${prefix}-${token}`;
    }
  );
  return code;
}

/* ─── Step 2: Replace standard Tailwind utility classes ─── */
function replaceStandardUtilities(code) {
  const replacements = [
    // text-white (but NOT inside compound tokens like text-primary-foreground)
    [/\btext-white\b(?!-)/g, "text-foreground"],
    [/\bbg-black\b/g, "bg-background"],
    [/\bhover:bg-white\//g, "hover:bg-foreground/"],
    [/\btext-green-500\b/g, "text-success"],
    [/\btext-green-600\b/g, "text-success"],
    [/\btext-red-500\b/g, "text-destructive"],
    [/\btext-orange-500\b/g, "text-warning"],
    [/\btext-blue-500\b/g, "text-info"],
    [/\btext-gray-500\b/g, "text-muted-foreground"],
    [/\bbg-gray-500\b/g, "bg-muted-foreground"],
    [/\bbg-blue-500\b/g, "bg-info"],
    [/\bbg-orange-500\b/g, "bg-warning"],
    [/\bbg-red-500\b/g, "bg-destructive"],
    // border-green-500 etc.
    [/\bborder-green-500\b/g, "border-success"],
    [/\bborder-red-500\b/g, "border-destructive"],
  ];
  for (const [pattern, replacement] of replacements) {
    code = code.replace(pattern, replacement);
  }
  return code;
}

/* ─── Step 3: Replace hex strings in JS expression context ─── */
function replaceHexInJS(code) {
  // Match all remaining hex strings (6-char or 3-char, but NOT inside arbitrary
  // value brackets since those were already handled in step 1)
  code = code.replace(/"#([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6})"/g, (match, hex) => {
    const fullHex = hex.length === 3 ? "#" + hex.split("").map(c => c + c).join("").toUpperCase() : "#" + hex.toUpperCase();
    const replacement = HEX_TO_VAR[fullHex];
    if (!replacement) return match;
    return `"${replacement}"`;
  });
  // Also handle single-quoted hex strings
  code = code.replace(/'#([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6})'/g, (match, hex) => {
    const fullHex = hex.length === 3 ? "#" + hex.split("").map(c => c + c).join("").toUpperCase() : "#" + hex.toUpperCase();
    const replacement = HEX_TO_VAR[fullHex];
    if (!replacement) return match;
    return `'${replacement}'`;
  });
  return code;
}

/* ─── Step 4: Apply special-case patterns ─── */
function applySpecialCases(code) {
  // DailyInspectionForm.tsx SEED_SEVERITIES
  code = code.replace(
    /{ value: "low", label: "Low", color: "bg-gray-500" }/g,
    '{ value: "low", label: "Low", color: "bg-muted-foreground" }'
  );
  code = code.replace(
    /{ value: "normal", label: "Normal", color: "bg-blue-500" }/g,
    '{ value: "normal", label: "Normal", color: "bg-info" }'
  );
  code = code.replace(
    /{ value: "high", label: "High", color: "bg-orange-500" }/g,
    '{ value: "high", label: "High", color: "bg-warning" }'
  );
  code = code.replace(
    /{ value: "critical", label: "Critical", color: "bg-red-500" }/g,
    '{ value: "critical", label: "Critical", color: "bg-destructive" }'
  );

  return code;
}

/* ─── Main ─── */
let count = 0;
for (const filePath of FILES) {
  const absolutePath = path.join(ROOT, filePath);
  if (!fs.existsSync(absolutePath)) {
    console.log(`[SKIP] ${filePath} — not found`);
    continue;
  }

  let code = fs.readFileSync(absolutePath, "utf-8");
  const original = code;

  code = replaceArbitraryValues(code);
  code = replaceStandardUtilities(code);
  code = replaceHexInJS(code);
  code = applySpecialCases(code);

  if (code !== original) {
    fs.writeFileSync(absolutePath, code, "utf-8");
    count++;
    console.log(`[MODIFIED] ${filePath}`);
  } else {
    console.log(`[UNCHANGED] ${filePath}`);
  }
}

console.log(`\nDone! ${count} files modified.`);
