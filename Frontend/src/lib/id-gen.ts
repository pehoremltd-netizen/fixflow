const PREFIXES: Record<string, string> = {
  workOrder: "WO",
  utility: "UTIL",
  asset: "AST",
  pmTask: "PMS",
  fault: "FR",
  observation: "OBS",
  inspection: "INS",
  contractor: "CON",
  requisition: "REQ",
  notification: "NOT",
  calculation: "CALC",
  site: "SITE",
  budget: "BGT",
};

function padWithRandom(): string {
  const buf = new Uint8Array(4);
  crypto.getRandomValues(buf);
  const hex = Array.from(buf)
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
  return hex;
}

export function generateId(prefix: keyof typeof PREFIXES | string): string {
  const pfx = PREFIXES[prefix] || prefix.toUpperCase().slice(0, 4);
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = padWithRandom();
  return `${pfx}-${timestamp}-${random}`;
}

export function generateTimestampId(): string {
  const ts = Date.now().toString(36).toUpperCase();
  const random = padWithRandom();
  return `${ts}-${random}`;
}

export function generateUUID(): string {
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}
