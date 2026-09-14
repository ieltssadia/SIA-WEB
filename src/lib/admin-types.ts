/**
 * Shared TypeScript types for the admin panel — used by the API routes
 * (serializers) and the admin UI components so both sides stay in sync.
 *
 * All enums mirror prisma/schema.prisma comments EXACTLY:
 *   Order.status        → placed | confirmed | shipped | delivered | cancelled
 *   Order.paymentStatus → pending | verified | paid | failed
 *   Lead.status         → new | contacted | enrolled | closed
 *   LiveClass.status    → scheduled | live | ended
 *   Enrollment.status   → active | paused | completed
 */

export type AdminOrderStatus =
  | "placed"
  | "confirmed"
  | "shipped"
  | "delivered"
  | "cancelled";

export type AdminPaymentStatus = "pending" | "verified" | "paid" | "failed";

export type AdminLeadStatus = "new" | "contacted" | "enrolled" | "closed";

export type AdminLiveClassStatus = "scheduled" | "live" | "ended";

export type AdminEnrollmentStatus = "active" | "paused" | "completed";

export const ADMIN_ORDER_STATUSES: AdminOrderStatus[] = [
  "placed",
  "confirmed",
  "shipped",
  "delivered",
  "cancelled",
];

export const ADMIN_LEAD_STATUSES: AdminLeadStatus[] = [
  "new",
  "contacted",
  "enrolled",
  "closed",
];

export const ADMIN_LIVE_STATUSES: AdminLiveClassStatus[] = [
  "scheduled",
  "live",
  "ended",
];

// ---------------------------------------------------------------------------
// Rows
// ---------------------------------------------------------------------------

export type AdminOrderItem = {
  id: string;
  slug: string;
  title: string;
  price: number;
  quantity: number;
  lineTotal: number;
};

export type AdminStudentLite = {
  id: string;
  name: string;
  phone: string;
};

export type AdminOrder = {
  id: string;
  orderNo: string;
  name: string;
  phone: string;
  email: string | null;
  zone: string;
  address: string | null;
  note: string | null;
  subtotal: number;
  deliveryFee: number;
  total: number;
  paymentMethod: string;
  transactionId: string | null;
  paymentStatus: string;
  status: string;
  createdAt: string; // ISO
  items: AdminOrderItem[];
  itemCount: number;
  /** Portal account matched by phone (Order has no studentId column). */
  student: AdminStudentLite | null;
};

/** Latest-5 feed row for the dashboard — slimmer than AdminOrder. */
export type AdminOrderLite = {
  id: string;
  orderNo: string;
  name: string;
  phone: string;
  total: number;
  paymentMethod: string;
  paymentStatus: string;
  status: string;
  createdAt: string; // ISO
  itemCount: number;
};

export type AdminLead = {
  id: string;
  name: string;
  phone: string;
  email: string | null;
  course: string | null;
  message: string | null;
  status: string;
  createdAt: string; // ISO
};

export type AdminEnrollmentLite = {
  id: string;
  courseSlug: string;
  batch: string;
  targetBand: string | null;
  examDate: string | null;
  progress: number;
  attendance: number;
  status: string;
  createdAt: string; // ISO
};

export type AdminMockLite = {
  id: string;
  label: string;
  date: string;
  listening: number;
  reading: number;
  writing: number;
  speaking: number;
  overall: number;
};

export type AdminStudentRow = {
  id: string;
  name: string;
  phone: string;
  createdAt: string; // ISO
  enrollmentCount: number;
  latestEnrollment: AdminEnrollmentLite | null;
};

export type AdminStudentDetail = AdminStudentRow & {
  enrollments: AdminEnrollmentLite[];
  mockResults: AdminMockLite[];
};

export type AdminLiveClass = {
  id: string;
  slug: string;
  title: string;
  courseSlug: string | null;
  teacher: string;
  description: string | null;
  startsAt: string; // ISO
  durationMin: number;
  status: string;
  createdAt: string; // ISO
};

export type AdminCertificate = {
  id: string; // human ID, e.g. "SIE-CERT-2417"
  name: string;
  course: string;
  batch: string;
  band: string;
  issued: string; // display date, e.g. "30 May 2025"
  studentId: string | null;
  createdAt: string; // ISO
};

// ---------------------------------------------------------------------------
// Stats payload (GET /api/admin/stats)
// ---------------------------------------------------------------------------

export type AdminRevenuePoint = {
  date: string; // YYYY-MM-DD in Asia/Dhaka
  label: string; // e.g. "Wed"
  total: number; // BDT
};

export type AdminStats = {
  orders: {
    total: number;
    byStatus: Record<AdminOrderStatus, number>;
  };
  /** Sum of Order.total for paid/verified, non-cancelled orders. */
  revenue: number;
  students: number;
  leads: {
    total: number;
    new: number;
    contacted: number;
    enrolled: number;
    closed: number;
  };
  enrollments: number;
  liveClasses: {
    total: number;
    scheduled: number;
    live: number;
    ended: number;
  };
  certificates: number;
  recentOrders: AdminOrderLite[];
  revenueByDay: AdminRevenuePoint[]; // last 7 days, oldest → today
};
