import type { CalculationRecord, CalculationType } from "./calculations/types";

const TAB_LABELS: Record<CalculationType, string> = {
  generator: "Generator Load",
  diesel: "Diesel Consumption",
  water: "Water Demand",
  pump: "Pump Sizing",
  electrical: "Electrical Load",
};

export function exportCalculationToCSV(records: CalculationRecord[]): void {
  const rows: string[] = [
    ["ID", "Type", "Status", "Timestamp", "User", "Error Code", "Error Message", "Inputs", "Outputs"].join(","),
  ];

  for (const r of records) {
    rows.push([
      escapeCsv(r.id),
      escapeCsv(TAB_LABELS[r.type] || r.type),
      r.status,
      r.timestamp,
      escapeCsv(r.user),
      r.errorCode || "",
      escapeCsv(r.errorMessage || ""),
      escapeCsv(JSON.stringify(r.inputs)),
      escapeCsv(JSON.stringify(r.outputs)),
    ].join(","));
  }

  const blob = new Blob([rows.join("\n")], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `fixflow-calculations-${new Date().toISOString().split("T")[0]}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

export function exportCalculationToJSON(records: CalculationRecord[]): void {
  const data = JSON.stringify(records, null, 2);
  const blob = new Blob([data], { type: "application/json;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `fixflow-calculations-${new Date().toISOString().split("T")[0]}.json`;
  a.click();
  URL.revokeObjectURL(url);
}

function escapeCsv(val: string): string {
  if (val.includes(",") || val.includes('"') || val.includes("\n")) {
    return `"${val.replace(/"/g, '""')}"`;
  }
  return val;
}
