import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env['VITE_SUPABASE_URL'] || "https://bzlrkijwfcpslrqpumsw.supabase.co";
const supabaseAnonKey = import.meta.env['VITE_SUPABASE_ANON_KEY'] || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ6bHJraWp3ZmNwc2xycXB1bXN3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODc4NDU4NTEsImV4cCI6MjEwMzQyMTg1MX0.zAWuX_b3eXpLT-5opmS3B71T2cvgKbQAHa02GVeDnVA";

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type InquiryPayload = {
  name: string;
  email: string;
  phone: string;
  company?: string;
  product_name?: string;
  part_number?: string;
  quantity?: number;
  location?: string;
  message?: string;
};

export type ContactPayload = {
  name: string;
  email: string;
  phone: string;
  company?: string;
  subject?: string;
  message: string;
};

// The sales email endpoint for FormSubmit.co.
// Note: FormSubmit will send a one-time activation email for each new domain (including Vercel).
// Once you click "Activate Form" in that email, submissions from that domain are active.
const FORM_ENDPOINT = "sales@concept-auto-tech.com";

/**
 * Send an email notification to the sales team via FormSubmit.co
 * Free service — first submission triggers a verification email to the recipient.
 * Once verified, all future submissions are forwarded automatically.
 */
async function sendEmailNotification(subject: string, bodyFields: Record<string, string>) {
  try {
    await fetch(`https://formsubmit.co/ajax/${FORM_ENDPOINT}`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify({
        _subject: subject,
        _template: "table",
        _captcha: "false",
        ...bodyFields,
      }),
    });
  } catch (err) {
    // Email notification is best-effort — don't block the user flow
    console.warn("Email notification failed (non-blocking):", err);
  }
}

/**
 * Submit quote/product inquiry to Supabase inquiries table
 */
export async function submitInquiry(payload: InquiryPayload) {
  // Send email notification immediately (fire-and-forget) so it isn't blocked by database errors
  sendEmailNotification(
    `🔔 New Quote Request: ${payload.product_name || "General Inquiry"}`,
    {
      "Customer Name": payload.name,
      "Email": payload.email,
      "Phone": payload.phone,
      "Company": payload.company || "—",
      "Product": payload.product_name || "General Inquiry",
      "Part Number": payload.part_number || "—",
      "Quantity": String(payload.quantity || 1),
      "Location": payload.location || "—",
      "Message": payload.message || "—",
    }
  );

  try {
    const { data, error } = await supabase
      .from("inquiries")
      .insert([
        {
          full_name: payload.name,
          email: payload.email,
          phone: payload.phone,
          company: payload.company || "",
          product_name: payload.product_name || "General Quote Request",
          part_number: payload.part_number || "",
          quantity: payload.quantity || 1,
          location: payload.location || "",
          message: payload.message || "",
          created_at: new Date().toISOString(),
          status: "pending",
        },
      ])
      .select();

    if (error) {
      console.warn("Supabase inquiry error (falling back):", error.message);
      return { success: true, offline: true, data: [payload] };
    }

    return { success: true, data };
  } catch (err) {
    console.error("Failed to submit inquiry:", err);
    return { success: true, offline: true, data: [payload] };
  }
}

/**
 * Submit contact form to Supabase contact_submissions table
 */
export async function submitContactForm(payload: ContactPayload) {
  // Send email notification immediately (fire-and-forget) so it isn't blocked by database errors
  sendEmailNotification(
    `📩 New Contact Form: ${payload.subject || "Website Inquiry"}`,
    {
      "Customer Name": payload.name,
      "Email": payload.email,
      "Phone": payload.phone,
      "Company": payload.company || "—",
      "Subject": payload.subject || "Website Inquiry",
      "Message": payload.message,
    }
  );

  try {
    const { data, error } = await supabase
      .from("contact_submissions")
      .insert([
        {
          name: payload.name,
          email: payload.email,
          phone: payload.phone,
          company: payload.company || "",
          subject: payload.subject || "Website General Inquiry",
          message: payload.message,
          created_at: new Date().toISOString(),
        },
      ])
      .select();

    if (error) {
      console.warn("Supabase contact error (falling back):", error.message);
      return { success: true, offline: true, data: [payload] };
    }

    return { success: true, data };
  } catch (err) {
    console.error("Failed to submit contact form:", err);
    return { success: true, offline: true, data: [payload] };
  }
}

/**
 * Subscribe email newsletter
 */
export async function subscribeNewsletter(email: string) {
  try {
    const { data, error } = await supabase
      .from("newsletters")
      .insert([{ email, created_at: new Date().toISOString() }]);

    if (error && error.code !== "23505") { // Ignore unique constraint duplicate
      console.warn("Supabase newsletter error:", error.message);
    }

    // Send email notification (fire-and-forget)
    sendEmailNotification(
      "📧 New Newsletter Subscription",
      { "Subscriber Email": email }
    );

    return { success: true };
  } catch (err) {
    return { success: true };
  }
}
