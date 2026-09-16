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
// Team / CMS catalog types
// ---------------------------------------------------------------------------

export type AdminRole = "owner" | "admin" | "teacher";

export const ADMIN_ROLES: AdminRole[] = ["owner", "admin", "teacher"];

export const ROLE_LABEL: Record<AdminRole, string> = {
  owner: "Owner · মালিক",
  admin: "Admin · অ্যাডমিন",
  teacher: "Teacher · শিক্ষক",
};

export type AdminTeamMember = {
  id: string;
  name: string;
  email: string;
  role: AdminRole;
  status: string; // active | disabled
  createdAt: string; // ISO
};

export type AdminAuthUser = {
  id: string;
  name: string;
  email: string;
  role: AdminRole;
};

export type AdminCourseRow = {
  id: string;
  slug: string;
  title: string;
  titleBn: string;
  desc: string;
  lessons: number;
  duration: string;
  price: number | null; // null → call for price
  oldPrice: number | null;
  tag: string;
  icon: string;
  features: string[];
  category: string; // complete | beginner | exam
  rating: number;
  students: number;
  nextBatch: string;
  mode: string;
  scheduleNote: string;
  seatsLeft: number | null;
  seatsTotal: number | null;
  accessPeriod: string | null;
  syllabus: string[];
  published: boolean;
  createdAt: string; // ISO
};

export type AdminBookRow = {
  id: string;
  slug: string;
  title: string;
  titleBn: string;
  author: string;
  desc: string;
  price: number;
  oldPrice: number | null;
  category: string;
  cover: string;
  tag: string | null;
  pages: number;
  highlights: string[];
  listed: boolean;
  createdAt: string; // ISO
};

export type AdminResourceRow = {
  id: string;
  title: string;
  desc: string;
  category: string; // writing | speaking | vocabulary | mock-tools
  type: string;
  size: string;
  href: string;
  published: boolean;
  createdAt: string; // ISO
};

/** A file available under /public/downloads — offered as a pick-list when adding resources. */
export type AdminFileOption = {
  name: string;
  href: string;
  size: string;
};

export type AdminNoticeRow = {
  id: string;
  date: string; // display "10 Sep"
  tag: string;
  title: string;
  body: string;
  createdAt: string; // ISO
};

export const ADMIN_COURSE_CATEGORIES = [
  { value: "complete", label: "Complete Preparation" },
  { value: "beginner", label: "For Beginners" },
  { value: "exam", label: "Exam Boosters" },
] as const;

export const ADMIN_BOOK_CATEGORIES = [
  { value: "reading", label: "Reading" },
  { value: "writing", label: "Writing" },
  { value: "speaking", label: "Speaking" },
  { value: "listening", label: "Listening" },
  { value: "vocabulary", label: "Vocabulary" },
  { value: "mock", label: "Mock Tests" },
] as const;

export const ADMIN_RESOURCE_CATEGORIES = [
  { value: "writing", label: "Writing" },
  { value: "speaking", label: "Speaking" },
  { value: "vocabulary", label: "Vocabulary" },
  { value: "mock-tools", label: "Mock Tools" },
] as const;

export const ADMIN_NOTICE_TAGS = [
  "Notice",
  "Class Update",
  "Mock Test",
  "Speaking Club",
] as const;

// ---------------------------------------------------------------------------
// Stats payload (GET /api/admin/stats)
// ---------------------------------------------------------------------------

export type AdminRevenuePoint = {
  date: string; // YYYY-MM-DD in Asia/Dhaka
  label: string; // e.g. "Wed"
  total: number; // BDT
};

export type AdminStats = {
  /** Role of the requesting session — dashboard hides revenue for teachers. */
  role: AdminRole;
  orders: {
    total: number;
    byStatus: Record<AdminOrderStatus, number>;
  };
  /** Sum of Order.total for paid/verified, non-cancelled orders. Always 0 for teachers. */
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
  catalog: {
    courses: number;
    publishedCourses: number;
    books: number;
    listedBooks: number;
    resources: number;
    notices: number;
  };
  team: {
    total: number;
    owners: number;
    admins: number;
    teachers: number;
  };
  recentOrders: AdminOrderLite[];
  revenueByDay: AdminRevenuePoint[]; // last 7 days, oldest → today
};
