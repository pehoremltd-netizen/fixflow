"use client";

import { type BudgetProposal, formatCurrency, getBudgetSettings } from "./budgetCalculator";
import { getPeriodLabel } from "./budgetTemplate";
import { BRAND } from "@/lib/brand";

export interface ExportData {
  proposal: BudgetProposal;
  generatedAt: string;
}

export function prepareExportData(proposal: BudgetProposal): ExportData {
  return { proposal, generatedAt: new Date().toISOString() };
}

export function exportToCSV(proposal: BudgetProposal): void {
  const rows: string[] = [];
  rows.push(`"${proposal.title}"`);
  rows.push(`"Facility: ${proposal.facilityName}","Period: ${getPeriodLabel(proposal.period)}","Fiscal Year: ${proposal.fiscalYear}"`);
  rows.push(`"Budget Control: ${proposal.budgetControlNumber}","Prepared by: ${proposal.preparedBy}","Date: ${new Date(proposal.preparedDate).toLocaleDateString()}"`);
  rows.push("");

  const headers = ["Category", "Description", "Qty", "Unit Rate", "Amount", "Work Type", "Notes"];
  rows.push(headers.map((h) => `"${h}"`).join(","));

  for (const cat of proposal.categories) {
    for (const item of cat.items) {
      rows.push([
        `"${cat.categoryName}"`,
        `"${item.description}"`,
        item.quantity,
        item.unitRate,
        item.amount,
        `"${item.workType}"`,
        `"${item.notes}"`,
      ].join(","));
    }
    rows.push(`"${cat.categoryName} Subtotal",,,,"${cat.subtotal}",,`);
  }

  rows.push("");
  rows.push(`"Total Opex",,,,"${proposal.totalOpex}",,`);
  rows.push(`"Total Capex",,,,"${proposal.totalCapex}",,`);
  rows.push(`"Contingency (${proposal.contingencyPercent}%)",,,,"${proposal.contingencyAmount}",,`);
  rows.push(`"VAT (${proposal.taxPercent}%)",,,,"${proposal.taxAmount}",,`);
  rows.push(`"Grand Total",,,,"${proposal.grandTotal}",,`);

  const blob = new Blob([rows.join("\n")], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${proposal.budgetControlNumber}_${getPeriodLabel(proposal.period)}_Budget.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

export function exportToJSON(proposal: BudgetProposal): void {
  const data = JSON.stringify(prepareExportData(proposal), null, 2);
  const blob = new Blob([data], { type: "application/json;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${proposal.budgetControlNumber}_${getPeriodLabel(proposal.period)}_Budget.json`;
  a.click();
  URL.revokeObjectURL(url);
}

export function printBudget(proposal: BudgetProposal): void {
  const settings = getBudgetSettings();
  const win = window.open("", "_blank");
  if (!win) return;

  const catRows = proposal.categories.map((cat) => `
    <div style="margin-bottom: 20px; page-break-inside: avoid;">
      <h3 style="color: #D4AF37; font-size: 14px; font-weight: 600; margin: 0 0 4px 0; border-bottom: 1px solid #E5E7EB; padding-bottom: 6px;">
        ${cat.categoryName} <span style="color: #6B7280; font-weight: 400; font-size: 12px;">— ${cat.workType}</span>
      </h3>
      <p style="color: #6B7280; font-size: 11px; margin: 2px 0 8px 0; font-style: italic;">${cat.definition}</p>
      <table style="width: 100%; border-collapse: collapse; font-size: 11px;">
        <thead>
          <tr style="background: #F3F4F6;">
            <th style="padding: 6px 8px; text-align: left; color: #374151; border-bottom: 1px solid #E5E7EB;">Description</th>
            <th style="padding: 6px 8px; text-align: right; color: #374151; border-bottom: 1px solid #E5E7EB;">Qty</th>
            <th style="padding: 6px 8px; text-align: right; color: #374151; border-bottom: 1px solid #E5E7EB;">Unit Rate</th>
            <th style="padding: 6px 8px; text-align: right; color: #374151; border-bottom: 1px solid #E5E7EB;">Amount</th>
          </tr>
        </thead>
        <tbody>
          ${cat.items.map((item) => `
            <tr>
              <td style="padding: 4px 8px; border-bottom: 1px solid #E5E7EB; color: #111827;">${item.description}
                ${item.notes ? `<br><span style="color: #6B7280; font-size: 10px;">${item.notes}</span>` : ""}
                ${item.assetName ? `<br><span style="color: #6B7280; font-size: 10px;">Asset: ${item.assetName} | Health: ${item.assetHealthScore}/100</span>` : ""}
              </td>
              <td style="padding: 4px 8px; border-bottom: 1px solid #E5E7EB; text-align: right; color: #111827;">${item.quantity}</td>
              <td style="padding: 4px 8px; border-bottom: 1px solid #E5E7EB; text-align: right; color: #111827;">${formatCurrency(item.unitRate)}</td>
              <td style="padding: 4px 8px; border-bottom: 1px solid #E5E7EB; text-align: right; color: #111827;">${formatCurrency(item.amount)}</td>
            </tr>
          `).join("")}
          <tr style="background: #F9FAFB;">
            <td style="padding: 6px 8px; font-weight: 600; color: #111827; border-top: 2px solid #D4AF37;" colspan="3">${cat.categoryName} Subtotal</td>
            <td style="padding: 6px 8px; text-align: right; font-weight: 600; color: #D4AF37; border-top: 2px solid #D4AF37;">${formatCurrency(cat.subtotal)}</td>
          </tr>
        </tbody>
      </table>
    </div>
  `).join("");

  const html = `<!DOCTYPE html>
<html>
<head><title>${proposal.budgetControlNumber} — ${getPeriodLabel(proposal.period)} Budget</title>
<style>
  @page { margin: 15mm; }
  body { font-family: 'Segoe UI', 'Helvetica Neue', Arial, sans-serif; background: #FFFFFF; color: #111827; padding: 40px; line-height: 1.5; }
  .title { color: #D4AF37; font-size: 22px; font-weight: 700; margin: 0; letter-spacing: 0.5px; }
  .subtitle { color: #6B7280; font-size: 13px; margin: 4px 0 20px 0; }
  .meta { display: flex; gap: 30px; flex-wrap: wrap; margin-bottom: 24px; padding: 16px; background: #F9FAFB; border-radius: 6px; border: 1px solid #E5E7EB; }
  .meta-item { font-size: 12px; }
  .meta-label { color: #6B7280; }
  .meta-value { color: #111827; font-weight: 500; }
  .summary-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; margin-bottom: 24px; }
  .summary-card { background: #F9FAFB; border: 1px solid #E5E7EB; border-radius: 6px; padding: 12px; text-align: center; }
  .summary-label { color: #6B7280; font-size: 10px; text-transform: uppercase; letter-spacing: 0.5px; }
  .summary-value { color: #D4AF37; font-size: 18px; font-weight: 700; margin-top: 4px; }
  .narrative { background: #F9FAFB; border: 1px solid #E5E7EB; border-radius: 6px; padding: 16px; margin-bottom: 24px; }
  .narrative h3 { color: #D4AF37; font-size: 13px; margin: 0 0 8px 0; }
  .narrative p { color: #4B5563; font-size: 12px; margin: 0; line-height: 1.6; }
  .totals-table { width: 350px; margin-left: auto; margin-top: 20px; }
  .totals-table td { padding: 6px 12px; font-size: 12px; }
  .totals-table .label { color: #6B7280; }
  .totals-table .value { text-align: right; color: #111827; }
  .grand-total { font-size: 18px; font-weight: 700; color: #D4AF37 !important; }
  .signature-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 20px; margin-top: 30px; padding-top: 20px; border-top: 1px solid #E5E7EB; }
  .signature-block { font-size: 11px; }
  .signature-line { border-bottom: 1px solid #D1D5DB; height: 30px; margin-bottom: 4px; }
  .signature-name { color: #6B7280; }
  .footer { margin-top: 30px; padding-top: 12px; border-top: 1px solid #E5E7EB; font-size: 10px; color: #9CA3AF; text-align: center; }
  @media print { body { -webkit-print-color-adjust: exact; print-color-adjust: exact; } }
  table { page-break-inside: auto; }
  tr { page-break-inside: avoid; page-break-after: auto; }
  thead { display: table-header-group; }
</style>
</head>
<body>
  <div style="text-align: center; margin-bottom: 20px;">
    <div style="font-size: 28px; color: #D4AF37; font-weight: 800; letter-spacing: 2px;">${BRAND.reportHeader}</div>
    <div class="title">FACILITY MAINTENANCE BUDGET PROPOSAL</div>
    <div class="subtitle">${proposal.facilityName} | ${proposal.location} | Fiscal Year ${proposal.fiscalYear}</div>
  </div>

  <div class="meta">
    <div class="meta-item"><span class="meta-label">Budget Control:</span> <span class="meta-value">${proposal.budgetControlNumber}</span></div>
    <div class="meta-item"><span class="meta-label">Period:</span> <span class="meta-value">${getPeriodLabel(proposal.period)}</span></div>
    <div class="meta-item"><span class="meta-label">Prepared By:</span> <span class="meta-value">${proposal.preparedBy}</span></div>
    <div class="meta-item"><span class="meta-label">Date:</span> <span class="meta-value">${new Date(proposal.preparedDate).toLocaleDateString("en-NG", { day: "numeric", month: "long", year: "numeric" })}</span></div>
    <div class="meta-item"><span class="meta-label">Facility Type:</span> <span class="meta-value">${proposal.facilityType.charAt(0).toUpperCase() + proposal.facilityType.slice(1)}</span></div>
    <div class="meta-item"><span class="meta-label">Assets:</span> <span class="meta-value">${proposal.assetCount} (${proposal.criticalAssetCount} critical)</span></div>
  </div>

  <h2 style="color: #D4AF37; font-size: 16px; margin: 0 0 12px 0;">Executive Summary</h2>
  <div class="summary-grid">
    <div class="summary-card">
      <div class="summary-label">Total Opex</div>
      <div class="summary-value" style="color: #2563EB;">${formatCurrency(proposal.totalOpex)}</div>
    </div>
    <div class="summary-card">
      <div class="summary-label">Total Capex</div>
      <div class="summary-value" style="color: #7C3AED;">${formatCurrency(proposal.totalCapex)}</div>
    </div>
    <div class="summary-card">
      <div class="summary-label">Contingency (${proposal.contingencyPercent}%)</div>
      <div class="summary-value" style="color: #D4AF37;">${formatCurrency(proposal.contingencyAmount)}</div>
    </div>
    <div class="summary-card">
      <div class="summary-label">Grand Total</div>
      <div class="summary-value" style="color: #16A34A;">${formatCurrency(proposal.grandTotal)}</div>
    </div>
  </div>

  <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; margin-bottom: 24px;">
    <div class="summary-card">
      <div class="summary-label">Capex vs Opex</div>
      <div class="summary-value" style="font-size: 14px;">${proposal.grandTotal > 0 ? Math.round((proposal.totalCapex / proposal.grandTotal) * 100) : 0}% / ${proposal.grandTotal > 0 ? Math.round((proposal.totalOpex / proposal.grandTotal) * 100) : 0}%</div>
    </div>
    <div class="summary-card">
      <div class="summary-label">Budget Per Asset</div>
      <div class="summary-value" style="font-size: 14px;">${formatCurrency(proposal.assetCount > 0 ? proposal.grandTotal / proposal.assetCount : 0)}</div>
    </div>
    <div class="summary-card">
      <div class="summary-label">SLA Target</div>
      <div class="summary-value" style="font-size: 12px; color: #16A34A;">${proposal.slaTargets}</div>
    </div>
  </div>

  <h2 style="color: #D4AF37; font-size: 16px; margin: 24px 0 12px 0;">Detailed Budget Breakdown</h2>
  ${catRows}

  <table class="totals-table">
    <tr><td class="label">Total Opex</td><td class="value">${formatCurrency(proposal.totalOpex)}</td></tr>
    <tr><td class="label">Total Capex</td><td class="value">${formatCurrency(proposal.totalCapex)}</td></tr>
    <tr><td class="label">Contingency (${proposal.contingencyPercent}%)</td><td class="value">${formatCurrency(proposal.contingencyAmount)}</td></tr>
    <tr><td class="label">VAT (${proposal.taxPercent}%)</td><td class="value">${formatCurrency(proposal.taxAmount)}</td></tr>
    <tr style="border-top: 2px solid #D4AF37;"><td class="label" style="font-weight: 700; color: #111827;">GRAND TOTAL</td><td class="value grand-total">${formatCurrency(proposal.grandTotal)}</td></tr>
  </table>

  <div class="narrative" style="margin-top: 24px;">
    <h3>Budget Justification &amp; Risk Analysis</h3>
    <p>${proposal.budgetNarrative || "No narrative provided."}</p>
  </div>

  ${proposal.riskAnalysis ? `
  <div class="narrative">
    <h3>Risk Mitigation Strategy</h3>
    <p>${proposal.riskAnalysis}</p>
  </div>` : ""}

  <h2 style="color: #D4AF37; font-size: 16px; margin: 24px 0 12px 0;">Approval</h2>
  <div class="signature-grid">
    <div class="signature-block">
      <div class="signature-line"></div>
      <div class="signature-name">${proposal.preparedBy || "Facility Manager"}</div>
      <div style="color: #6B7280;">Facility Manager</div>
    </div>
    <div class="signature-block">
      <div class="signature-line"></div>
      <div class="signature-name">${proposal.reviewedBy || "Operations Manager"}</div>
      <div style="color: #6B7280;">Operations Manager</div>
    </div>
    <div class="signature-block">
      <div class="signature-line"></div>
      <div class="signature-name">Finance / Accounting</div>
      <div style="color: #6B7280;">Finance Controller</div>
    </div>
    <div class="signature-block">
      <div class="signature-line"></div>
      <div class="signature-name">Director Approval</div>
      <div style="color: #6B7280;">Managing Director</div>
    </div>
  </div>

  <div class="footer">
    ${settings.organizationName} | ${proposal.facilityName} | ${proposal.location}<br>
    Budget Control: ${proposal.budgetControlNumber} | Generated: ${new Date().toLocaleDateString("en-NG", { day: "numeric", month: "long", year: "numeric" })} | ${BRAND.reportHeader}<br>
    ${BRAND.poweredBy} | ${BRAND.ownedBy}
  </div>

  <script>window.onload = function() { window.print(); }</script>
</body></html>`;

  win.document.write(html);
  win.document.close();
}
