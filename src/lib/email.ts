import { Resend } from "resend";

const RESEND_API_KEY = process.env.RESEND_API_KEY || "";
export const resend = new Resend(RESEND_API_KEY);

const DEFAULT_FROM = process.env.RESEND_FROM_EMAIL || "Sadia's IELTS <onboarding@resend.dev>";
const ADMIN_NOTIFICATION_EMAIL = process.env.ADMIN_NOTIFICATION_EMAIL || "sadiasielts@gmail.com";

export function isResendConfigured(): boolean {
  return Boolean(RESEND_API_KEY && RESEND_API_KEY.startsWith("re_"));
}

/**
 * Send an OTP code to a student via email
 */
export async function sendOtpEmail(to: string, otp: string) {
  if (!isResendConfigured()) return { ok: false, error: "Resend not configured" };

  try {
    const { data, error } = await resend.emails.send({
      from: DEFAULT_FROM,
      to,
      subject: `Your Login Verification Code: ${otp} - Sadia's IELTS`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 540px; margin: 0 auto; padding: 24px; border: 1px solid #e6dec8; border-radius: 16px; background-color: #fdfbf7;">
          <div style="text-align: center; margin-bottom: 20px;">
            <h1 style="color: #262012; font-size: 24px; margin: 0;">Sadia's <span style="color: #a97f2a;">IELTS</span></h1>
            <p style="color: #786d54; font-size: 13px; margin: 4px 0 0 0;">Unlock Your Future</p>
          </div>
          <div style="background-color: #ffffff; padding: 24px; border-radius: 12px; border: 1px solid #ece4d0; text-align: center;">
            <p style="font-size: 15px; color: #332b1a; margin-top: 0;">আপনার স্টুডেন্ট পোর্টাল লগইন ভেরিফিকেশন কোড:</p>
            <div style="font-size: 32px; font-weight: bold; letter-spacing: 6px; color: #a97f2a; padding: 16px 0; font-family: monospace;">
              ${otp}
            </div>
            <p style="font-size: 13px; color: #786d54; margin-bottom: 0;">এই কোডটি আগামী ১০ মিনিট কার্যকর থাকবে। কোডটি কারও সাথে শেয়ার করবেন না।</p>
          </div>
          <p style="font-size: 12px; color: #a0957b; text-align: center; margin-top: 20px;">
            যেকোনো প্রয়োজনে কল করুন: +880 1752-716238 | Sreemangal, Sylhet
          </p>
        </div>
      `,
    });

    if (error) {
      console.error("sendOtpEmail error:", error);
      return { ok: false, error };
    }
    return { ok: true, data };
  } catch (err) {
    console.error("sendOtpEmail exception:", err);
    return { ok: false, error: err };
  }
}

/**
 * Send an enrollment lead notification
 */
export async function sendLeadNotificationEmail(lead: {
  name: string;
  phone: string;
  email?: string | null;
  course?: string | null;
  message?: string | null;
}) {
  if (!isResendConfigured()) return { ok: false };

  try {
    // 1. Notify Admin Team
    await resend.emails.send({
      from: DEFAULT_FROM,
      to: ADMIN_NOTIFICATION_EMAIL,
      subject: `[নতুন ভর্তি অনুরোধ] ${lead.name} (${lead.phone})`,
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px;">
          <h2>নতুন ভর্তি লিড এসেছে!</h2>
          <table style="width: 100%; border-collapse: collapse;">
            <tr><td style="padding: 8px; font-weight: bold; width: 120px;">নাম:</td><td style="padding: 8px;">${lead.name}</td></tr>
            <tr><td style="padding: 8px; font-weight: bold;">মোবাইল:</td><td style="padding: 8px;"><a href="tel:${lead.phone}">${lead.phone}</a></td></tr>
            <tr><td style="padding: 8px; font-weight: bold;">ইমেইল:</td><td style="padding: 8px;">${lead.email || "দেওয়া হয়নি"}</td></tr>
            <tr><td style="padding: 8px; font-weight: bold;">কোর্স:</td><td style="padding: 8px;">${lead.course || "নির্দিষ্ট নেই"}</td></tr>
            <tr><td style="padding: 8px; font-weight: bold;">মেসেজ:</td><td style="padding: 8px;">${lead.message || "নাই"}</td></tr>
          </table>
        </div>
      `,
    }).catch((e) => console.error("Admin lead notification failed:", e));

    // 2. If student provided email, send confirmation to student
    if (lead.email) {
      await resend.emails.send({
        from: DEFAULT_FROM,
        to: lead.email,
        subject: `ভর্তি অনুরোধ গ্রহণ করা হয়েছে - Sadia's IELTS`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 540px; margin: 0 auto; padding: 24px; border: 1px solid #e6dec8; border-radius: 16px; background-color: #fdfbf7;">
            <h2 style="color: #262012;">প্রিয় ${lead.name},</h2>
            <p style="color: #332b1a; line-height: 1.6;">Sadia's IELTS-এ আপনার ভর্তির অনুরোধটি আমরা সফলভাবে পেয়েছি। আমাদের একাডেমি টিম আগামী ২৪ ঘণ্টার মধ্যে আপনার সাথে যোগাযোগ করে ব্যাচের সময়সূচি ও পরবর্তী ধাপ জানিয়ে দেবে।</p>
            <div style="background-color: #f0ebd8; padding: 16px; border-radius: 8px; margin: 20px 0;">
              <p style="margin: 0; color: #5a4f36; font-size: 14px;"><strong>কোর্স:</strong> ${lead.course || "General Consultation"}</p>
              <p style="margin: 4px 0 0 0; color: #5a4f36; font-size: 14px;"><strong>যোগাযোগ নম্বর:</strong> ${lead.phone}</p>
            </div>
            <p style="color: #786d54; font-size: 13px;">সরাসরি কথা বলতে চাইলে কল করুন: <strong>+880 1752-716238</strong></p>
          </div>
        `,
      }).catch((e) => console.error("Student lead confirmation failed:", e));
    }

    return { ok: true };
  } catch (err) {
    console.error("sendLeadNotificationEmail exception:", err);
    return { ok: false, error: err };
  }
}

/**
 * Send an Order Confirmation Email
 */
export async function sendOrderConfirmationEmail(order: {
  orderNo: string;
  name: string;
  phone: string;
  email?: string | null;
  total: number;
  items: Array<{ title: string; quantity: number; price: number }>;
}) {
  if (!isResendConfigured()) return { ok: false };

  try {
    const itemsHtml = order.items
      .map(
        (i) =>
          `<tr><td style="padding: 6px 0; color: #332b1a;">${i.title} (x${i.quantity})</td><td style="padding: 6px 0; text-align: right; color: #332b1a; font-weight: bold;">৳${i.price * i.quantity}</td></tr>`
      )
      .join("");

    if (order.email) {
      await resend.emails.send({
        from: DEFAULT_FROM,
        to: order.email,
        subject: `অর্ডার কনফার্মেশন: #${order.orderNo} - Sadia's IELTS Book Shop`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 560px; margin: 0 auto; padding: 24px; border: 1px solid #e6dec8; border-radius: 16px; background-color: #fdfbf7;">
            <h2 style="color: #262012; margin-top: 0;">ধন্যবাদ ${order.name}!</h2>
            <p style="color: #4a3e25;">আপনার বুক শপ অর্ডারটি প্লেস করা হয়েছে।</p>
            <div style="background-color: #ffffff; padding: 16px; border-radius: 10px; border: 1px solid #e6dec8; margin: 16px 0;">
              <p style="margin: 0 0 12px 0; font-size: 13px; color: #786d54;">অর্ডার নম্বর: <strong>#${order.orderNo}</strong></p>
              <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
                ${itemsHtml}
                <tr style="border-top: 1px solid #e6dec8;">
                  <td style="padding: 10px 0 0 0; font-weight: bold; color: #262012;">সর্বমোট</td>
                  <td style="padding: 10px 0 0 0; text-align: right; font-weight: bold; color: #a97f2a; font-size: 16px;">৳${order.total}</td>
                </tr>
              </table>
            </div>
            <p style="font-size: 13px; color: #786d54;">ডেলিভারি সংক্রান্ত তথ্যের জন্য আমাদের টিম আপনার নম্বরে (${order.phone}) যোগাযোগ করবে।</p>
          </div>
        `,
      }).catch((e) => console.error("Order student email failed:", e));
    }

    return { ok: true };
  } catch (err) {
    console.error("sendOrderConfirmationEmail exception:", err);
    return { ok: false, error: err };
  }
}
