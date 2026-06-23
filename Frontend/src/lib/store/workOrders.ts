export type WorkOrderStatus = "OPEN" | "ASSIGNED" | "IN_PROGRESS" | "COMPLETED" | "VERIFIED";
export type WorkOrderPriority = "low" | "medium" | "high" | "critical";
export type WorkOrderCategory = "mechanical" | "electrical" | "plumbing" | "hvac" | "safety" | "structural";
export type CostCode = "labour" | "materials" | "contractor" | "equipment" | "emergency";

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
  estimatedCost?: number;
  actualCost?: number;
  costCode: CostCode;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  statusHistory: StatusHistoryEntry[];
}

export const costCodeLabels: Record<CostCode, string> = {
  labour: "Labour",
  materials: "Materials",
  contractor: "Contractor",
  equipment: "Equipment",
  emergency: "Emergency",
};

const mockWorkOrders: WorkOrder[] = [];const STORAGE_KEY = "fixflow-work-orders";

let cache: WorkOrder[] | undefined;

function loadWorkOrders(): WorkOrder[] {
  if (cache !== undefined) return cache;
  if (typeof window === "undefined") return [];
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed: WorkOrder[] = JSON.parse(stored);
      cache = parsed;
      return parsed;
    }
  } catch {}
  return [];
}

function saveWorkOrders(orders: WorkOrder[]): void {
  cache = orders;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(orders));
}

export function getWorkOrders(): WorkOrder[] {
  return loadWorkOrders();
}

export function createWorkOrder(data: Omit<WorkOrder, "id" | "status" | "createdAt" | "updatedAt" | "statusHistory" | "createdBy" | "actualCost">): WorkOrder {
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
