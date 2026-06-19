export type ContractorSpecialty =
  | "Electrical" | "Plumbing" | "HVAC" | "Generator"
  | "Structural" | "Security" | "Cleaning" | "Elevator" | "General";

export type ContractorStatus = "active" | "inactive";

export interface Contractor {
  id: string;
  name: string;
  company: string;
  specialty: ContractorSpecialty;
  phone: string;
  email: string;
  licenseNo: string;
  status: ContractorStatus;
  rating: number;
  lastJob: string;
  notes: string;
}

const STORAGE_KEY = "fixflow-contractors";

const mockContractors: Contractor[] = [];

function loadContractors(): Contractor[] {
  if (typeof window === "undefined") return [];
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) return JSON.parse(stored);
  } catch {}
  return [];
}

function saveContractors(contractors: Contractor[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(contractors));
}

export function getContractors(): Contractor[] {
  return loadContractors();
}

export function addContractor(data: Omit<Contractor, "id" | "status" | "rating" | "lastJob">): Contractor {
  const contractors = loadContractors();
  const maxNum = contractors.reduce((max, c) => {
    const num = parseInt(c.id.replace("CTR-", ""));
    return num > max ? num : max;
  }, 0);
  const newContractor: Contractor = {
    ...data,
    id: `CTR-${String(maxNum + 1).padStart(3, "0")}`,
    status: "active",
    rating: 0,
    lastJob: "N/A",
  };
  contractors.push(newContractor);
  saveContractors(contractors);
  return newContractor;
}

export function updateContractor(id: string, data: Partial<Contractor>): Contractor | null {
  const contractors = loadContractors();
  const index = contractors.findIndex(c => c.id === id);
  if (index === -1) return null;
  contractors[index] = { ...contractors[index], ...data };
  saveContractors(contractors);
  return contractors[index];
}

export function deleteContractor(id: string): void {
  const contractors = loadContractors();
  saveContractors(contractors.filter(c => c.id !== id));
}
