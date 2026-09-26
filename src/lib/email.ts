import { Resend } from "resend";

let resendInstance: Resend | null = null;

export function getResendClient(): Resend | null {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey || !apiKey.startsWith("re_")) return null;
  if (!resendInstance) {
    resendInstance = new Resend(apiKey);
  }
  return resendInstance;
}

export function isResendConfigured(): boolean {
  return getResendClient() !== null;
}

const DEFAULT_FROM = process.env.RESEND_FROM_EMAIL || "Sadia's IELTS <onboarding@resend.dev>";
const ADMIN_NOTIFICATION_EMAIL = process.env.ADMIN_NOTIFICATION_EMAIL || "sadiasielts@gmail.com";

/**
 * Send an OTP verification code to a student via email
 */
export async function sendOtpEmail(to: string, otp: string, name?: string) {
  const client = getResendClient();
  if (!client) return { ok: false, error: "Resend not configured" };

  try {
    const greeting = name ? `প্রিয় ${name},` : "প্রিয় শিক্ষার্থী,";
    const { data, error } = await client.emails.send({
      from: DEFAULT_FROM,
      to,
      subject: `${otp} - Sadia's IELTS Verification Code`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Verification Code</title>
        </head>
        <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f7f4ee; color: #211b10;">
          <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #f7f4ee; padding: 32px 16px;">
            <tr>
              <td align="center">
                <table role="presentation" width="100%" style="max-width: 520px; background-color: #ffffff; border-radius: 20px; border: 1px solid #e7dcbe; overflow: hidden; box-shadow: 0 10px 30px rgba(30,27,20,0.06);">
                  
                  <!-- Header with Luxury Gold Accent -->
                  <tr>
                    <td style="padding: 32px 32px 20px; text-align: center; background: linear-gradient(135deg, #1c1810 0%, #2a2215 100%);">
                      <h1 style="margin: 0; font-size: 26px; font-weight: 800; letter-spacing: 0.5px; color: #ffffff;">
                        Sadia's <span style="color: #dfb758;">IELTS</span>
                      </h1>
                      <p style="margin: 6px 0 0 0; font-size: 13px; color: #c8beab; font-weight: 500; letter-spacing: 1px;">
                        STUDENT PORTAL VERIFICATION
                      </p>
                    </td>
                  </tr>

                  <!-- Main Content -->
                  <tr>
                    <td style="padding: 32px 32px 24px; text-align: center;">
                      <h2 style="margin: 0 0 12px 0; font-size: 18px; color: #211b10; font-weight: 700;">
                        ${greeting}
                      </h2>
                      <p style="margin: 0 0 24px 0; font-size: 14px; line-height: 1.6; color: #5c5240;">
                        Sadia's IELTS অ্যাকাউন্টের ইমেইল যাচাইকরণের জন্য আপনার ৬ ডিজিটের ওটিপি (OTP) ভেরিফিকেশন কোড নিচে দেওয়া হলো:
                      </p>

                      <!-- OTP Box -->
                      <div style="background: linear-gradient(180deg, #fbf8f1 0%, #f4ede0 100%); border: 2px dashed #cca953; border-radius: 14px; padding: 22px 16px; margin: 20px 0;">
                        <div style="font-size: 38px; font-weight: 800; letter-spacing: 8px; color: #8a6417; font-family: 'Courier New', Courier, monospace; text-shadow: 0 1px 2px rgba(0,0,0,0.05);">
                          ${otp}
                        </div>
                        <p style="margin: 10px 0 0 0; font-size: 12px; color: #807460; font-weight: 600;">
                          ⏱️ মেয়াদ: আগামী ১০ মিনিট কার্যকর থাকবে
                        </p>
                      </div>

                      <p style="margin: 24px 0 0 0; font-size: 13px; line-height: 1.5; color: #736754;">
                        নিরাপত্তার স্বার্থে এই কোডটি অন্য কারও সাথে শেয়ার করবেন না। আপনি যদি এই অ্যাকাউন্ট খোলার অনুরোধ না করে থাকেন, তবে এই ইমেইলটি এড়িয়ে চলুন।
                      </p>
                    </td>
                  </tr>

                  <!-- Footer -->
                  <tr>
                    <td style="padding: 20px 32px; background-color: #fbf9f4; border-top: 1px solid #efe8d8; text-align: center;">
                      <p style="margin: 0; font-size: 12px; color: #8e8371; line-height: 1.5;">
                        Sadia's IELTS Care | Sreemangal, Sylhet<br/>
                        হেল্পলাইন: <a href="tel:+8801752716238" style="color: #996e1a; font-weight: 700; text-decoration: none;">+880 1752-716238</a>
                      </p>
                    </td>
                  </tr>

                </table>
              </td>
            </tr>
          </table>
        </body>
        </html>
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
  const client = getResendClient();
  if (!client) return { ok: false };

  try {
    // 1. Notify Admin Team
    await client.emails.send({
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
      await client.emails.send({
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
  const client = getResendClient();
  if (!client) return { ok: false };

  try {
    const itemsHtml = order.items
      .map(
        (i) =>
          `<tr><td style="padding: 6px 0; color: #332b1a;">${i.title} (x${i.quantity})</td><td style="padding: 6px 0; text-align: right; color: #332b1a; font-weight: bold;">৳${i.price * i.quantity}</td></tr>`
      )
      .join("");

    if (order.email) {
      await client.emails.send({
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
