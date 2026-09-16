import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getAuth, unauthorized } from "@/lib/admin-auth";
import type {
  AdminOrderLite,
  AdminOrderStatus,
  AdminStats,
} from "@/lib/admin-types";

/**
 * Payment statuses that count as revenue. "verified" = manual send-money
 * (bKash/Nagad) TrxID verified by the team; "paid" = online gateway settled.
 * Cancelled orders are always excluded from revenue even if paid.
 */
const REVENUE_PAYMENT_STATUSES = ["paid", "verified"];

/** Asia/Dhaka calendar key (YYYY-MM-DD) for a Date. Dhaka has no DST. */
function dhakaDayKey(d: Date): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Dhaka",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(d);
}

function dhakaWeekday(d: Date): string {
  return new Intl.DateTimeFormat("en-GB", {
    timeZone: "Asia/Dhaka",
    weekday: "short",
  }).format(d);
}

/**
 * GET /api/admin/stats — dashboard totals for the admin home:
 * orders (+ byStatus, revenue), students, leads (new vs contacted),
 * enrollments, live classes (live/upcoming/ended), certificates issued,
 * catalog + team counts, latest 5 orders and 7-day revenue series
 * (Asia/Dhaka).
 *
 * Teachers get operational stats but never financials: revenue is zeroed
 * and recent orders are omitted.
 */
export async function GET(req: Request) {
  const auth = await getAuth(req);
  if (!auth) return unauthorized();
  const isTeacher = auth.role === "teacher";

  try {
    const [
      orderTotal,
      orderGroups,
      revenueAgg,
      studentCount,
      leadGroups,
      enrollmentCount,
      liveGroups,
      certificateCount,
      recentOrdersRaw,
      paidRecent,
      courseTotal,
      publishedCourses,
      bookTotal,
      listedBooks,
      resourceTotal,
      noticeTotal,
      teamOwners,
      teamAdmins,
      teamTeachers,
    ] = await Promise.all([
      db.order.count(),
      db.order.groupBy({ by: ["status"], _count: { _all: true } }),
      db.order.aggregate({
        _sum: { total: true },
        where: {
          paymentStatus: { in: REVENUE_PAYMENT_STATUSES },
          status: { not: "cancelled" },
        },
      }),
      db.student.count(),
      db.lead.groupBy({ by: ["status"], _count: { _all: true } }),
      db.enrollment.count(),
      db.liveClass.groupBy({ by: ["status"], _count: { _all: true } }),
      db.certificate.count(),
      isTeacher
        ? Promise.resolve([])
        : db.order.findMany({
            orderBy: { createdAt: "desc" },
            take: 5,
            include: { _count: { select: { items: true } } },
          }),
      isTeacher
        ? Promise.resolve([])
        : db.order.findMany({
            where: {
              paymentStatus: { in: REVENUE_PAYMENT_STATUSES },
              status: { not: "cancelled" },
              createdAt: { gte: new Date(Date.now() - 6 * 86_400_000) },
            },
            select: { createdAt: true, total: true },
          }),
      db.course.count(),
      db.course.count({ where: { published: true } }),
      db.book.count(),
      db.book.count({ where: { listed: true } }),
      db.downloadResource.count(),
      db.notice.count(),
      db.adminUser.count({ where: { role: "owner" } }),
      db.adminUser.count({ where: { role: "admin" } }),
      db.adminUser.count({ where: { role: "teacher" } }),
    ]);

    // Orders by status — always emit every schema status (0 default).
    const byStatus: Record<AdminOrderStatus, number> = {
      placed: 0,
      confirmed: 0,
      shipped: 0,
      delivered: 0,
      cancelled: 0,
    };
    for (const g of orderGroups) {
      if (g.status in byStatus) byStatus[g.status as AdminOrderStatus] = g._count._all;
    }

    // Leads by status (schema: new | contacted | enrolled | closed).
    const leadCount = (status: string) =>
      leadGroups.find((g) => g.status === status)?._count._all ?? 0;
    const leadsTotal = leadGroups.reduce((s, g) => s + g._count._all, 0);

    // Live classes by status (schema: scheduled | live | ended).
    const liveCount = (status: string) =>
      liveGroups.find((g) => g.status === status)?._count._all ?? 0;
    const liveTotal = liveGroups.reduce((s, g) => s + g._count._all, 0);

    // 7-day revenue series — bucketed by Asia/Dhaka calendar day.
    const buckets = new Map<string, number>();
    for (const o of paidRecent) {
      const key = dhakaDayKey(o.createdAt);
      buckets.set(key, (buckets.get(key) ?? 0) + o.total);
    }
    const now = new Date();
    const revenueByDay = Array.from({ length: 7 }, (_, i) => {
      const d = new Date(now.getTime() - (6 - i) * 86_400_000);
      const key = dhakaDayKey(d);
      return { date: key, label: dhakaWeekday(d), total: buckets.get(key) ?? 0 };
    });

    const recentOrders: AdminOrderLite[] = recentOrdersRaw.map((o) => ({
      id: o.id,
      orderNo: o.orderNo,
      name: o.name,
      phone: o.phone,
      total: o.total,
      paymentMethod: o.paymentMethod,
      paymentStatus: o.paymentStatus,
      status: o.status,
      createdAt: o.createdAt.toISOString(),
      itemCount: o._count.items,
    }));

    const stats: AdminStats = {
      role: auth.role,
      orders: { total: orderTotal, byStatus },
      revenue: isTeacher ? 0 : (revenueAgg._sum.total ?? 0),
      students: studentCount,
      leads: {
        total: leadsTotal,
        new: leadCount("new"),
        contacted: leadCount("contacted"),
        enrolled: leadCount("enrolled"),
        closed: leadCount("closed"),
      },
      enrollments: enrollmentCount,
      liveClasses: {
        total: liveTotal,
        scheduled: liveCount("scheduled"),
        live: liveCount("live"),
        ended: liveCount("ended"),
      },
      certificates: certificateCount,
      catalog: {
        courses: courseTotal,
        publishedCourses,
        books: bookTotal,
        listedBooks,
        resources: resourceTotal,
        notices: noticeTotal,
      },
      team: {
        total: teamOwners + teamAdmins + teamTeachers,
        owners: teamOwners,
        admins: teamAdmins,
        teachers: teamTeachers,
      },
      recentOrders,
      revenueByDay,
    };

    return NextResponse.json({ ok: true, stats });
  } catch (error) {
    console.error("[api/admin/stats] Failed:", error);
    return NextResponse.json(
      { ok: false, error: "Stats লোড করতে সমস্যা হয়েছে — আবার চেষ্টা করুন।" },
      { status: 500 }
    );
  }
}
