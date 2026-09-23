import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { sendLeadNotificationEmail } from "@/lib/email";

const leadSchema = z.object({
  name: z.string().trim().min(2, "Name must be at least 2 characters").max(100),
  phone: z
    .string()
    .trim()
    .min(6, "Phone number looks too short")
    .max(20)
    .regex(/^[0-9+\-\s()]+$/, "Phone can only contain digits, +, -, spaces"),
  email: z
    .string()
    .trim()
    .email("Invalid email address")
    .max(120)
    .optional()
    .or(z.literal("")),
  course: z.string().trim().max(120).optional().or(z.literal("")),
  message: z.string().trim().max(1000).optional().or(z.literal("")),
});

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => null);
    if (!body) {
      return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
    }

    const parsed = leadSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        {
          error: "Please check your information and try again.",
          issues: parsed.error.issues.map((i) => ({
            field: i.path.join("."),
            message: i.message,
          })),
        },
        { status: 400 }
      );
    }

    const { name, phone, email, course, message } = parsed.data;
    const lead = await db.lead.create({
      data: {
        name,
        phone,
        email: email || null,
        course: course && course !== "not-sure" ? course : null,
        message: message || null,
      },
    });

    // Best-effort transactional email notification via Resend
    sendLeadNotificationEmail({
      name,
      phone,
      email: email || undefined,
      course: course && course !== "not-sure" ? course : undefined,
      message: message || undefined,
    }).catch((err) => console.error("Resend lead notification failed:", err));

    return NextResponse.json({ ok: true, id: lead.id }, { status: 201 });
  } catch (error) {
    console.error("[api/leads] Failed to save lead:", error);
    return NextResponse.json(
      { error: "Something went wrong. Please try again or call us directly." },
      { status: 500 }
    );
  }
}
