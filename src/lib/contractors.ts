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

const daysAgo = (n: number) => new Date(Date.now() - n * 86400000).toISOString().split("T")[0];

const mockContractors: Contractor[] = [
  { id: "CTR-001", name: "Mike Hernandez", company: "Hernandez Electrical Services", specialty: "Electrical", phone: "(555) 234-5678", email: "mike@hernandezelec.com", licenseNo: "ELC-4521", status: "active", rating: 4.8, lastJob: daysAgo(5), notes: "Preferred vendor for all electrical work" },
  { id: "CTR-002", name: "Tom Watson", company: "Watson Plumbing Solutions", specialty: "Plumbing", phone: "(555) 345-6789", email: "tom@watsonplumb.com", licenseNo: "PLB-7823", status: "active", rating: 4.5, lastJob: daysAgo(2), notes: "24/7 emergency service available" },
  { id: "CTR-003", name: "David Kim", company: "Kim HVAC Services", specialty: "HVAC", phone: "(555) 456-7890", email: "david@kimhvac.com", licenseNo: "HVC-3341", status: "active", rating: 4.9, lastJob: daysAgo(1), notes: "Certified Trane and Carrier technician" },
  { id: "CTR-004", name: "Robert Chen", company: "Chen Generator Specialists", specialty: "Generator", phone: "(555) 567-8901", email: "robert@chengen.com", licenseNo: "GEN-2156", status: "active", rating: 4.7, lastJob: daysAgo(10), notes: "Kohler certified service provider" },
  { id: "CTR-005", name: "James Wilson", company: "Wilson Structural Repairs", specialty: "Structural", phone: "(555) 678-9012", email: "james@wilsonstruct.com", licenseNo: "STR-8976", status: "active", rating: 4.3, lastJob: daysAgo(20), notes: "Licensed structural engineer on staff" },
  { id: "CTR-006", name: "Sarah Parker", company: "Parker Security Systems", specialty: "Security", phone: "(555) 789-0123", email: "sarah@parkersec.com", licenseNo: "SEC-4567", status: "inactive", rating: 3.8, lastJob: daysAgo(60), notes: "Previously installed access control system. On hold due to contract renewal" },
  { id: "CTR-007", name: "Alex Turner", company: "Turner Cleaning Co", specialty: "Cleaning", phone: "(555) 890-1234", email: "alex@turnerclean.com", licenseNo: "CLN-1234", status: "active", rating: 4.1, lastJob: daysAgo(3), notes: "Weekly janitorial service contract" },
  { id: "CTR-008", name: "Lisa Park", company: "Park Elevator Maintenance", specialty: "Elevator", phone: "(555) 901-2345", email: "lisa@parkelevator.com", licenseNo: "ELV-6789", status: "active", rating: 4.6, lastJob: daysAgo(7), notes: "Otis certified maintenance provider" },
];

function loadContractors(): Contractor[] {
  if (typeof window === "undefined") return [];
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) return JSON.parse(stored);
  } catch {}
  const initial = mockContractors;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(initial));
  return initial;
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
