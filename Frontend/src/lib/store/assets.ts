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

const mockAssets: Asset[] = [];

function loadAssets(): Asset[] {
  if (typeof window === "undefined") return [];
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) return JSON.parse(stored);
  } catch {}
  return [];
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
