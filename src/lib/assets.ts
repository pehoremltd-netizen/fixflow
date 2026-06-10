export type AssetCondition = "Excellent" | "Good" | "Fair" | "Poor" | "Critical";
export type AssetStatus = "active" | "maintenance" | "retired";

export interface Asset {
  id: string;
  name: string;
  category: string;
  location: string;
  serialNo: string;
  model: string;
  manufacturer: string;
  purchaseDate: string;
  warrantyExpiry: string;
  condition: AssetCondition;
  lastService: string;
  nextService: string;
  status: AssetStatus;
  notes: string;
}

const STORAGE_KEY = "fixflow-assets";

const daysAgo = (n: number) => new Date(Date.now() - n * 86400000).toISOString().split("T")[0];
const daysFromNow = (n: number) => new Date(Date.now() + n * 86400000).toISOString().split("T")[0];

const mockAssets: Asset[] = [
  { id: "AST-001", name: "HVAC Unit - Main Building", category: "HVAC", location: "Building A - Roof", serialNo: "TR-2024-001", model: "Trane XR18", manufacturer: "Trane", purchaseDate: "2024-01-15", warrantyExpiry: "2027-01-15", condition: "Good", lastService: daysAgo(60), nextService: daysFromNow(30), status: "active", notes: "Covers floors 1-3" },
  { id: "AST-002", name: "Generator - Backup Power", category: "Electrical", location: "Building A - Basement", serialNo: "KL-2023-045", model: "Kohler 60kW", manufacturer: "Kohler", purchaseDate: "2023-06-01", warrantyExpiry: "2026-06-01", condition: "Good", lastService: daysAgo(30), nextService: daysFromNow(60), status: "active", notes: "Monthly load test required" },
  { id: "AST-003", name: "Fire Alarm Panel", category: "Fire Safety", location: "Building B - Security Room", serialNo: "SP-2024-012", model: "Simplex 4100U", manufacturer: "Simplex", purchaseDate: "2024-03-20", warrantyExpiry: "2028-03-20", condition: "Excellent", lastService: daysAgo(15), nextService: daysFromNow(345), status: "active", notes: "Annual certification required" },
  { id: "AST-004", name: "Chiller - Cooling System", category: "HVAC", location: "Building A - Mechanical Room", serialNo: "CR-2023-078", model: "Carrier 30RB", manufacturer: "Carrier", purchaseDate: "2023-09-10", warrantyExpiry: "2026-09-10", condition: "Fair", lastService: daysAgo(90), nextService: daysFromNow(10), status: "maintenance", notes: "Scheduled for overhaul" },
  { id: "AST-005", name: "Water Pump - Main Supply", category: "Plumbing", location: "Building B - Pump Room", serialNo: "GF-2024-033", model: "Grundfos CR-45", manufacturer: "Grundfos", purchaseDate: "2024-01-05", warrantyExpiry: "2027-01-05", condition: "Good", lastService: daysAgo(45), nextService: daysFromNow(45), status: "active", notes: "" },
  { id: "AST-006", name: "Elevator - Passenger", category: "Mechanical", location: "Building A - Elevator 1", serialNo: "OT-2022-156", model: "Otis Gen2", manufacturer: "Otis", purchaseDate: "2022-08-15", warrantyExpiry: "2027-08-15", condition: "Good", lastService: daysAgo(20), nextService: daysFromNow(10), status: "active", notes: "Monthly safety inspection required" },
  { id: "AST-007", name: "Electrical Panel - Main", category: "Electrical", location: "Building A - Electrical Room", serialNo: "SQ-2023-089", model: "Square D QO", manufacturer: "Schneider Electric", purchaseDate: "2023-11-20", warrantyExpiry: "2028-11-20", condition: "Excellent", lastService: daysAgo(120), nextService: daysFromNow(60), status: "active", notes: "" },
  { id: "AST-008", name: "Water Heater - 200 Gal", category: "Plumbing", location: "Building B - Boiler Room", serialNo: "RH-2022-234", model: "Rheem RTG-200", manufacturer: "Rheem", purchaseDate: "2022-12-01", warrantyExpiry: "2027-12-01", condition: "Fair", lastService: daysAgo(180), nextService: daysFromNow(15), status: "active", notes: "Annual flushing required" },
  { id: "AST-009", name: "Security Camera System", category: "Security", location: "Building A - Server Room", serialNo: "HIK-2024-567", model: "Hikvision DS-2CD", manufacturer: "Hikvision", purchaseDate: "2024-02-01", warrantyExpiry: "2027-02-01", condition: "Good", lastService: daysAgo(30), nextService: daysFromNow(90), status: "active", notes: "32 channel NVR system" },
  { id: "AST-010", name: "HVAC Unit - Building B", category: "HVAC", location: "Building B - Roof", serialNo: "LG-2023-112", model: "LG Multi V 5", manufacturer: "LG", purchaseDate: "2023-04-10", warrantyExpiry: "2028-04-10", condition: "Poor", lastService: daysAgo(14), nextService: daysFromNow(1), status: "maintenance", notes: "Compressor making noise, needs monitoring" },
  { id: "AST-011", name: "Fire Suppression System", category: "Fire Safety", location: "Building A - Kitchen", serialNo: "ANS-2023-045", model: "Ansul R-102", manufacturer: "Ansul", purchaseDate: "2023-05-15", warrantyExpiry: "2026-05-15", condition: "Good", lastService: daysAgo(60), nextService: daysFromNow(90), status: "active", notes: "Hood suppression system" },
  { id: "AST-012", name: "Elevator - Freight", category: "Mechanical", location: "Building B - Freight Elevator", serialNo: "OT-2023-178", model: "Otis Gen3", manufacturer: "Otis", purchaseDate: "2023-10-01", warrantyExpiry: "2028-10-01", condition: "Critical", lastService: daysAgo(5), nextService: daysFromNow(0), status: "maintenance", notes: "Frequent breakdowns, replacement recommended" },
  { id: "AST-013", name: "Solar Panel Array", category: "Electrical", location: "Building A - Roof", serialNo: "SUN-2024-001", model: "SunPower M440", manufacturer: "SunPower", purchaseDate: "2024-06-01", warrantyExpiry: "2034-06-01", condition: "Excellent", lastService: daysAgo(90), nextService: daysFromNow(90), status: "active", notes: "Under manufacturer warranty" },
  { id: "AST-014", name: "Cooling Tower", category: "HVAC", location: "Building B - Exterior", serialNo: "BAC-2022-089", model: "Baltimore VXT-100", manufacturer: "Baltimore Aircoil", purchaseDate: "2022-07-15", warrantyExpiry: "2027-07-15", condition: "Fair", lastService: daysAgo(45), nextService: daysFromNow(20), status: "active", notes: "Chemical treatment required weekly" },
  { id: "AST-015", name: "Boiler System", category: "Mechanical", location: "Building A - Boiler Room", serialNo: "CW-2022-056", model: "Cleaver-Brooks 400HP", manufacturer: "Cleaver-Brooks", purchaseDate: "2022-11-01", warrantyExpiry: "2025-11-01", condition: "Critical", lastService: daysAgo(10), nextService: daysFromNow(5), status: "maintenance", notes: "Warranty expired, annual inspection needed" },
];

function loadAssets(): Asset[] {
  if (typeof window === "undefined") return [];
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) return JSON.parse(stored);
  } catch {}
  const initial = mockAssets;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(initial));
  return initial;
}

function saveAssets(assets: Asset[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(assets));
}

export function getAssets(): Asset[] {
  return loadAssets();
}

export function addAsset(data: Omit<Asset, "id">): Asset {
  const assets = loadAssets();
  const maxNum = assets.reduce((max, a) => {
    const num = parseInt(a.id.replace("AST-", ""));
    return num > max ? num : max;
  }, 0);
  const newAsset: Asset = {
    ...data,
    id: `AST-${String(maxNum + 1).padStart(3, "0")}`,
  };
  assets.push(newAsset);
  saveAssets(assets);
  return newAsset;
}

export function updateAsset(id: string, data: Partial<Asset>): Asset | null {
  const assets = loadAssets();
  const index = assets.findIndex(a => a.id === id);
  if (index === -1) return null;
  assets[index] = { ...assets[index], ...data };
  saveAssets(assets);
  return assets[index];
}

export function deleteAsset(id: string): void {
  const assets = loadAssets();
  saveAssets(assets.filter(a => a.id !== id));
}
