export type WorkOrderStatus = "OPEN" | "ASSIGNED" | "IN_PROGRESS" | "COMPLETED" | "VERIFIED";
export type WorkOrderPriority = "low" | "medium" | "high" | "critical";
export type WorkOrderCategory = "mechanical" | "electrical" | "plumbing" | "hvac" | "safety" | "structural";

export interface StatusHistoryEntry {
  status: WorkOrderStatus;
  timestamp: string;
  changedBy: string;
}

export interface WorkOrder {
  id: string;
  title: string;
  description: string;
  location: string;
  category: WorkOrderCategory;
  priority: WorkOrderPriority;
  status: WorkOrderStatus;
  assignedStaff: string;
  dueDate: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  statusHistory: StatusHistoryEntry[];
}

const staffMembers = ["Mike Chen", "Sarah Lee", "John Doe", "Emma Wilson", "Tom Green", "Lisa Park", "James Brown", "Anna Kim"];

const mockWorkOrders: WorkOrder[] = [
  { id: "WO-001", title: "HVAC Unit #3 Compressor Replacement", description: "Compressor on HVAC Unit #3 is making unusual noise and needs replacement. Access through roof hatch B.", location: "Building A - Roof", category: "hvac", priority: "critical", status: "IN_PROGRESS", assignedStaff: "Mike Chen", dueDate: new Date(Date.now() + 2 * 86400000).toISOString().split("T")[0], createdBy: "Admin", createdAt: new Date(Date.now() - 5 * 86400000).toISOString(), updatedAt: new Date(Date.now() - 1 * 86400000).toISOString(), statusHistory: [
    { status: "OPEN", timestamp: new Date(Date.now() - 5 * 86400000).toISOString(), changedBy: "System" },
    { status: "ASSIGNED", timestamp: new Date(Date.now() - 4 * 86400000).toISOString(), changedBy: "Admin" },
    { status: "IN_PROGRESS", timestamp: new Date(Date.now() - 1 * 86400000).toISOString(), changedBy: "Mike Chen" },
  ]},
  { id: "WO-002", title: "Electrical Panel Inspection - Floor 2", description: "Routine inspection of all electrical panels on the second floor. Check for loose connections and heat signs.", location: "Building A - Floor 2", category: "electrical", priority: "high", status: "ASSIGNED", assignedStaff: "Sarah Lee", dueDate: new Date(Date.now() + 3 * 86400000).toISOString().split("T")[0], createdBy: "Admin", createdAt: new Date(Date.now() - 3 * 86400000).toISOString(), updatedAt: new Date(Date.now() - 2 * 86400000).toISOString(), statusHistory: [
    { status: "OPEN", timestamp: new Date(Date.now() - 3 * 86400000).toISOString(), changedBy: "System" },
    { status: "ASSIGNED", timestamp: new Date(Date.now() - 2 * 86400000).toISOString(), changedBy: "Admin" },
  ]},
  { id: "WO-003", title: "Leaking Pipe Repair - Men's Restroom", description: "Water pipe under sink is leaking. Needs immediate repair to prevent water damage to floor.", location: "Building A - Floor 1", category: "plumbing", priority: "high", status: "OPEN", assignedStaff: "John Doe", dueDate: new Date(Date.now() + 1 * 86400000).toISOString().split("T")[0], createdBy: "Admin", createdAt: new Date(Date.now() - 1 * 86400000).toISOString(), updatedAt: new Date(Date.now() - 1 * 86400000).toISOString(), statusHistory: [
    { status: "OPEN", timestamp: new Date(Date.now() - 1 * 86400000).toISOString(), changedBy: "System" },
  ]},
  { id: "WO-004", title: "Fire Safety Check - West Wing", description: "Quarterly fire safety inspection including extinguishers, alarms, and emergency exits.", location: "Building B - West Wing", category: "safety", priority: "high", status: "IN_PROGRESS", assignedStaff: "Emma Wilson", dueDate: new Date(Date.now() + 5 * 86400000).toISOString().split("T")[0], createdBy: "Admin", createdAt: new Date(Date.now() - 7 * 86400000).toISOString(), updatedAt: new Date(Date.now() - 3 * 86400000).toISOString(), statusHistory: [
    { status: "OPEN", timestamp: new Date(Date.now() - 7 * 86400000).toISOString(), changedBy: "System" },
    { status: "ASSIGNED", timestamp: new Date(Date.now() - 6 * 86400000).toISOString(), changedBy: "Admin" },
    { status: "IN_PROGRESS", timestamp: new Date(Date.now() - 3 * 86400000).toISOString(), changedBy: "Emma Wilson" },
  ]},
  { id: "WO-005", title: "Generator Preventive Maintenance", description: "Monthly generator maintenance: oil change, filter replacement, battery check, and load test.", location: "Building A - Basement", category: "mechanical", priority: "medium", status: "ASSIGNED", assignedStaff: "Mike Chen", dueDate: new Date(Date.now() + 10 * 86400000).toISOString().split("T")[0], createdBy: "Admin", createdAt: new Date(Date.now() - 2 * 86400000).toISOString(), updatedAt: new Date(Date.now() - 1 * 86400000).toISOString(), statusHistory: [
    { status: "OPEN", timestamp: new Date(Date.now() - 2 * 86400000).toISOString(), changedBy: "System" },
    { status: "ASSIGNED", timestamp: new Date(Date.now() - 1 * 86400000).toISOString(), changedBy: "Admin" },
  ]},
  { id: "WO-006", title: "Emergency Elevator Repair", description: "Elevator #2 stuck between floors with passenger inside. Emergency response required immediately.", location: "Building A - Elevator 2", category: "mechanical", priority: "critical", status: "IN_PROGRESS", assignedStaff: "Sarah Lee", dueDate: new Date(Date.now()).toISOString().split("T")[0], createdBy: "Admin", createdAt: new Date(Date.now() - 1 * 86400000).toISOString(), updatedAt: new Date(Date.now() - 12 * 3600000).toISOString(), statusHistory: [
    { status: "OPEN", timestamp: new Date(Date.now() - 1 * 86400000).toISOString(), changedBy: "System" },
    { status: "ASSIGNED", timestamp: new Date(Date.now() - 20 * 3600000).toISOString(), changedBy: "Admin" },
    { status: "IN_PROGRESS", timestamp: new Date(Date.now() - 12 * 3600000).toISOString(), changedBy: "Sarah Lee" },
  ]},
  { id: "WO-007", title: "Roof Inspection - Building C", description: "Annual roof inspection checking for leaks, membrane damage, and structural integrity.", location: "Building C - Roof", category: "structural", priority: "medium", status: "OPEN", assignedStaff: "Tom Green", dueDate: new Date(Date.now() + 14 * 86400000).toISOString().split("T")[0], createdBy: "Admin", createdAt: new Date(Date.now() - 10 * 86400000).toISOString(), updatedAt: new Date(Date.now() - 10 * 86400000).toISOString(), statusHistory: [
    { status: "OPEN", timestamp: new Date(Date.now() - 10 * 86400000).toISOString(), changedBy: "System" },
  ]},
  { id: "WO-008", title: "HVAC Filter Replacement", description: "Replace all air filters in Building A HVAC system. 20 filters total.", location: "Building A - All Floors", category: "hvac", priority: "low", status: "COMPLETED", assignedStaff: "Lisa Park", dueDate: new Date(Date.now() - 2 * 86400000).toISOString().split("T")[0], createdBy: "Admin", createdAt: new Date(Date.now() - 14 * 86400000).toISOString(), updatedAt: new Date(Date.now() - 2 * 86400000).toISOString(), statusHistory: [
    { status: "OPEN", timestamp: new Date(Date.now() - 14 * 86400000).toISOString(), changedBy: "System" },
    { status: "ASSIGNED", timestamp: new Date(Date.now() - 12 * 86400000).toISOString(), changedBy: "Admin" },
    { status: "IN_PROGRESS", timestamp: new Date(Date.now() - 8 * 86400000).toISOString(), changedBy: "Lisa Park" },
    { status: "COMPLETED", timestamp: new Date(Date.now() - 2 * 86400000).toISOString(), changedBy: "Lisa Park" },
  ]},
  { id: "WO-009", title: "Security Camera Installation", description: "Install 4 new security cameras in parking lot. Run cabling and configure NVR.", location: "Parking Lot A", category: "electrical", priority: "medium", status: "VERIFIED", assignedStaff: "James Brown", dueDate: new Date(Date.now() - 5 * 86400000).toISOString().split("T")[0], createdBy: "Admin", createdAt: new Date(Date.now() - 30 * 86400000).toISOString(), updatedAt: new Date(Date.now() - 5 * 86400000).toISOString(), statusHistory: [
    { status: "OPEN", timestamp: new Date(Date.now() - 30 * 86400000).toISOString(), changedBy: "System" },
    { status: "ASSIGNED", timestamp: new Date(Date.now() - 28 * 86400000).toISOString(), changedBy: "Admin" },
    { status: "IN_PROGRESS", timestamp: new Date(Date.now() - 20 * 86400000).toISOString(), changedBy: "James Brown" },
    { status: "COMPLETED", timestamp: new Date(Date.now() - 6 * 86400000).toISOString(), changedBy: "James Brown" },
    { status: "VERIFIED", timestamp: new Date(Date.now() - 5 * 86400000).toISOString(), changedBy: "Admin" },
  ]},
  { id: "WO-010", title: "Chiller #2 Annual Service", description: "Annual chiller maintenance including refrigerant check, coil cleaning, and performance testing.", location: "Building B - Mechanical Room", category: "hvac", priority: "high", status: "OPEN", assignedStaff: "Anna Kim", dueDate: new Date(Date.now() + 7 * 86400000).toISOString().split("T")[0], createdBy: "Admin", createdAt: new Date(Date.now() - 3 * 86400000).toISOString(), updatedAt: new Date(Date.now() - 3 * 86400000).toISOString(), statusHistory: [
    { status: "OPEN", timestamp: new Date(Date.now() - 3 * 86400000).toISOString(), changedBy: "System" },
  ]},
  { id: "WO-011", title: "Parking Lot Resurfacing", description: "Cracked and uneven parking lot surface needs repair. Patch potholes and reseal.", location: "Parking Lot B", category: "structural", priority: "medium", status: "ASSIGNED", assignedStaff: "Tom Green", dueDate: new Date(Date.now() + 21 * 86400000).toISOString().split("T")[0], createdBy: "Admin", createdAt: new Date(Date.now() - 15 * 86400000).toISOString(), updatedAt: new Date(Date.now() - 14 * 86400000).toISOString(), statusHistory: [
    { status: "OPEN", timestamp: new Date(Date.now() - 15 * 86400000).toISOString(), changedBy: "System" },
    { status: "ASSIGNED", timestamp: new Date(Date.now() - 14 * 86400000).toISOString(), changedBy: "Admin" },
  ]},
  { id: "WO-012", title: "Emergency Lighting Test", description: "Test all emergency lighting and exit signs. Replace any failed units.", location: "Building A & B", category: "safety", priority: "low", status: "COMPLETED", assignedStaff: "Emma Wilson", dueDate: new Date(Date.now() - 1 * 86400000).toISOString().split("T")[0], createdBy: "Admin", createdAt: new Date(Date.now() - 10 * 86400000).toISOString(), updatedAt: new Date(Date.now() - 1 * 86400000).toISOString(), statusHistory: [
    { status: "OPEN", timestamp: new Date(Date.now() - 10 * 86400000).toISOString(), changedBy: "System" },
    { status: "ASSIGNED", timestamp: new Date(Date.now() - 9 * 86400000).toISOString(), changedBy: "Admin" },
    { status: "IN_PROGRESS", timestamp: new Date(Date.now() - 5 * 86400000).toISOString(), changedBy: "Emma Wilson" },
    { status: "COMPLETED", timestamp: new Date(Date.now() - 1 * 86400000).toISOString(), changedBy: "Emma Wilson" },
  ]},
  { id: "WO-013", title: "Water Heater Replacement", description: "Replace failed water heater in Building A boiler room. New unit is on order.", location: "Building A - Boiler Room", category: "plumbing", priority: "critical", status: "ASSIGNED", assignedStaff: "John Doe", dueDate: new Date(Date.now() + 4 * 86400000).toISOString().split("T")[0], createdBy: "Admin", createdAt: new Date(Date.now() - 2 * 86400000).toISOString(), updatedAt: new Date(Date.now() - 1 * 86400000).toISOString(), statusHistory: [
    { status: "OPEN", timestamp: new Date(Date.now() - 2 * 86400000).toISOString(), changedBy: "System" },
    { status: "ASSIGNED", timestamp: new Date(Date.now() - 1 * 86400000).toISOString(), changedBy: "Admin" },
  ]},
  { id: "WO-014", title: "HVAC Duct Cleaning", description: "Clean all HVAC ducts in Building A. Required for indoor air quality compliance.", location: "Building A - All Floors", category: "hvac", priority: "low", status: "OPEN", assignedStaff: "Lisa Park", dueDate: new Date(Date.now() + 30 * 86400000).toISOString().split("T")[0], createdBy: "Admin", createdAt: new Date(Date.now() - 20 * 86400000).toISOString(), updatedAt: new Date(Date.now() - 20 * 86400000).toISOString(), statusHistory: [
    { status: "OPEN", timestamp: new Date(Date.now() - 20 * 86400000).toISOString(), changedBy: "System" },
  ]},
  { id: "WO-015", title: "Fire Extinguisher Certification", description: "Annual certification of all fire extinguishers across all buildings. 45 units total.", location: "All Buildings", category: "safety", priority: "high", status: "VERIFIED", assignedStaff: "Sarah Lee", dueDate: new Date(Date.now() - 10 * 86400000).toISOString().split("T")[0], createdBy: "Admin", createdAt: new Date(Date.now() - 45 * 86400000).toISOString(), updatedAt: new Date(Date.now() - 10 * 86400000).toISOString(), statusHistory: [
    { status: "OPEN", timestamp: new Date(Date.now() - 45 * 86400000).toISOString(), changedBy: "System" },
    { status: "ASSIGNED", timestamp: new Date(Date.now() - 40 * 86400000).toISOString(), changedBy: "Admin" },
    { status: "IN_PROGRESS", timestamp: new Date(Date.now() - 30 * 86400000).toISOString(), changedBy: "Sarah Lee" },
    { status: "COMPLETED", timestamp: new Date(Date.now() - 12 * 86400000).toISOString(), changedBy: "Sarah Lee" },
    { status: "VERIFIED", timestamp: new Date(Date.now() - 10 * 86400000).toISOString(), changedBy: "Admin" },
  ]},
];

const STORAGE_KEY = "fixflow-work-orders";

function loadWorkOrders(): WorkOrder[] {
  if (typeof window === "undefined") return mockWorkOrders;
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) return JSON.parse(stored);
  } catch {}
  const initial = mockWorkOrders;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(initial));
  return initial;
}

function saveWorkOrders(orders: WorkOrder[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(orders));
}

export function getWorkOrders(): WorkOrder[] {
  return loadWorkOrders();
}

export function createWorkOrder(data: Omit<WorkOrder, "id" | "status" | "createdAt" | "updatedAt" | "statusHistory" | "createdBy">): WorkOrder {
  const orders = loadWorkOrders();
  const maxNum = orders.reduce((max, wo) => {
    const num = parseInt(wo.id.replace("WO-", ""));
    return num > max ? num : max;
  }, 0);
  const newOrder: WorkOrder = {
    ...data,
    id: `WO-${String(maxNum + 1).padStart(3, "0")}`,
    status: "OPEN",
    createdBy: "Admin",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    statusHistory: [
      { status: "OPEN", timestamp: new Date().toISOString(), changedBy: "System" },
    ],
  };
  orders.push(newOrder);
  saveWorkOrders(orders);
  return newOrder;
}

export function updateStatus(id: string, newStatus: WorkOrderStatus, changedBy: string = "Admin"): WorkOrder | null {
  const orders = loadWorkOrders();
  const index = orders.findIndex((wo) => wo.id === id);
  if (index === -1) return null;
  orders[index].status = newStatus;
  orders[index].updatedAt = new Date().toISOString();
  orders[index].statusHistory.push({
    status: newStatus,
    timestamp: new Date().toISOString(),
    changedBy,
  });
  saveWorkOrders(orders);
  return orders[index];
}

export function assignStaff(id: string, staffId: string): WorkOrder | null {
  const orders = loadWorkOrders();
  const index = orders.findIndex((wo) => wo.id === id);
  if (index === -1) return null;
  orders[index].assignedStaff = staffId;
  orders[index].updatedAt = new Date().toISOString();
  if (orders[index].status === "OPEN") {
    orders[index].status = "ASSIGNED";
    orders[index].statusHistory.push({
      status: "ASSIGNED",
      timestamp: new Date().toISOString(),
      changedBy: "Admin",
    });
  }
  saveWorkOrders(orders);
  return orders[index];
}

export function deleteWorkOrder(id: string): void {
  const orders = loadWorkOrders();
  const filtered = orders.filter((wo) => wo.id !== id);
  saveWorkOrders(filtered);
}

export const statusFlow: WorkOrderStatus[] = ["OPEN", "ASSIGNED", "IN_PROGRESS", "COMPLETED", "VERIFIED"];

export function getNextStatus(current: WorkOrderStatus): WorkOrderStatus | null {
  const idx = statusFlow.indexOf(current);
  if (idx < statusFlow.length - 1) return statusFlow[idx + 1];
  return null;
}
