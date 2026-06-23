export type UserRole = "admin" | "manager" | "supervisor" | "staff" | "upline_manager" | "tenant";

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
  checklist: InspectionChecklistItem[];
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
  label: string;
  condition: "good" | "fair" | "poor" | "critical" | "na";
  notes?: string;
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

export type UplineManagerLinkStatus = "active" | "revoked";

export interface UplineManagerLink {
  id: string;
  token: string;
  viewerName: string;
  viewerEmail: string;
  createdAt: string;
  lastAccessedAt: string | null;
  status: UplineManagerLinkStatus;
}

export type FeedbackStatus = "New" | "Read" | "Actioned";

export interface ViewerFeedback {
  id: string;
  viewerName: string;
  viewerEmail: string;
  uplineManagerLinkId?: string;
  pageContext: string;
  pageLabel: string;
  commentText: string;
  createdAt: string;
  status: FeedbackStatus;
  ajoseResponse: string;
}

export type CommentAuthorType = "ajose" | "upline_manager";

export interface UplineManagerComment {
  id: string;
  uplineManagerLinkId: string;
  itemType: string;
  itemId: string;
  authorType: CommentAuthorType;
  authorName: string;
  commentText: string;
  createdAt: string;
  parentCommentId: string | null;
  status: FeedbackStatus;
  orderKey: string;
}

export interface Generator {
  id: string;
  name: string;
  facility_id: string;
  tank_capacity: number;
  expected_lph: number;
  max_daily_usage: number;
  is_active: boolean;
  sites?: { name: string };
}

export type DieselLogStatus = "Draft" | "Submitted" | "Approved" | "Rejected";

export interface DieselLog {
  id: string;
  date: string;
  facility_id: string;
  generator_id: string;
  operator_name: string;
  time_on: string;
  time_off: string;
  run_hours: number;
  idr: number;
  fdr: number;
  diesel_used: number;
  diesel_supplied: number;
  supplier_name: string;
  delivery_reference: string;
  previous_balance: number;
  current_balance: number;
  lph: number;
  expected_lph: number;
  variance: number;
  flags: string[];
  status: DieselLogStatus;
  rejection_reason: string;
  remarks: string;
  approved_by: string;
  approved_at: string | null;
  created_by: string;
  created_at: string;
  updated_at: string;
  generators?: Generator;
  sites?: { name: string };
}

export interface DieselAlert {
  id: string;
  diesel_log_id: string;
  alert_type: string;
  severity: string;
  message: string;
  is_resolved: boolean;
  resolved_at: string | null;
  created_at: string;
  diesel_logs?: { date: string; generator_id: string; operator_name: string };
}

export interface Artisan {
  id: string;
  name: string;
  trade: string;
  phone: string;
  email: string;
  site: string;
  bank_name: string;
  account_number: string;
  account_holder_name: string;
  is_active: boolean;
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
  overdueTasks: number;
}
