export type UserRole = "admin" | "manager" | "supervisor" | "staff" | "stakeholder" | "tenant";

export interface Organization {
  id: string;
  name: string;
  slug: string;
  logo_url?: string;
  subdomain: string;
  created_at: string;
  updated_at: string;
}

export interface Profile {
  id: string;
  organization_id: string;
  email: string;
  full_name: string;
  role: UserRole;
  avatar_url?: string;
  phone?: string;
  department?: string;
  job_title?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Site {
  id: string;
  organization_id: string;
  name: string;
  address: string;
  city: string;
  state: string;
  country: string;
  latitude: number;
  longitude: number;
  attendance_radius: number;
  qr_code?: string;
  is_active: boolean;
  created_at: string;
}

export interface Asset {
  id: string;
  organization_id: string;
  site_id: string;
  name: string;
  category: string;
  model?: string;
  serial_number?: string;
  manufacturer?: string;
  purchase_date?: string;
  warranty_expiry?: string;
  status: "active" | "maintenance" | "retired";
  qr_code?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface WorkOrder {
  id: string;
  organization_id: string;
  site_id: string;
  asset_id?: string;
  assigned_to?: string;
  created_by: string;
  title: string;
  description: string;
  priority: "low" | "medium" | "high" | "critical";
  status: "pending" | "approved" | "in-progress" | "completed" | "closed" | "cancelled";
  type: "preventive" | "corrective" | "emergency";
  due_date?: string;
  completed_at?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface Inspection {
  id: string;
  organization_id: string;
  site_id: string;
  template_id?: string;
  staff_id: string;
  title: string;
  type: string;
  status: "draft" | "submitted" | "reviewed" | "approved";
  notes?: string;
  photos?: string[];
  videos?: string[];
  signature?: string;
  recommendations?: string;
  submitted_at?: string;
  created_at: string;
  updated_at: string;
}

export interface InspectionChecklistItem {
  id: string;
  inspection_id: string;
  label: string;
  condition: "good" | "fair" | "poor" | "critical" | "na";
  notes?: string;
  created_at: string;
}

export interface Attendance {
  id: string;
  organization_id: string;
  user_id: string;
  site_id: string;
  type: "clock-in" | "clock-out";
  timestamp: string;
  latitude: number;
  longitude: number;
  device_info?: string;
  qr_code?: string;
  verified: boolean;
  photo_url?: string;
  created_at: string;
}

export interface InventoryItem {
  id: string;
  organization_id: string;
  site_id?: string;
  name: string;
  sku: string;
  category: string;
  quantity: number;
  min_quantity: number;
  unit: string;
  unit_price: number;
  supplier?: string;
  location?: string;
  created_at: string;
  updated_at: string;
}

export interface Contract {
  id: string;
  organization_id: string;
  vendor_name: string;
  service_type: string;
  start_date: string;
  end_date: string;
  value: number;
  status: "active" | "expired" | "terminated";
  sla?: string;
  notes?: string;
  created_at: string;
}

export interface MaintenanceRequest {
  id: string;
  organization_id: string;
  tenant_id: string;
  site_id: string;
  title: string;
  description: string;
  priority: "low" | "medium" | "high" | "urgent";
  status: "submitted" | "in-progress" | "completed" | "closed";
  category: string;
  attachments?: string[];
  created_at: string;
  updated_at: string;
}

export interface DashboardStats {
  totalWorkOrders: number;
  openWorkOrders: number;
  completedWorkOrders: number;
  pendingInspections: number;
  totalAssets: number;
  activeStaff: number;
  attendanceRate: number;
  overdueTasks: number;
}

export interface JwtPayload {
  sub: string;
  email: string;
  role: UserRole;
  organization_id: string;
}
