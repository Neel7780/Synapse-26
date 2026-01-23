import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { getEmailTransporter, senderEmail } from "@/lib/email-config";

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { testEmail } = body;

    if (!testEmail) {
      return NextResponse.json({ error: "testEmail is required" }, { status: 400 });
    }

    if (!senderEmail) {
      return NextResponse.json(
        { error: "GODADDY_EMAIL_FROM or GODADDY_EMAIL_USER not configured" },
        { status: 500 }
      );
    }

    const transporter = getEmailTransporter();

    // Test SMTP connection
    await transporter.verify();

    // Send test email
    await transporter.sendMail({
      from: senderEmail,
      to: testEmail,
      subject: "✅ Synapse - SMTP Configuration Test",
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="UTF-8">
            <style>
              body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
              .container { max-width: 600px; margin: 0 auto; padding: 20px; }
              .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 8px; }
              .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 8px 8px; }
              .success { background: #d4edda; border: 1px solid #c3e6cb; padding: 15px; border-radius: 4px; margin: 15px 0; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1>✅ SMTP Configuration Test Successful</h1>
              </div>
              <div class="content">
                <div class="success">
                  <strong>Your email configuration is working correctly!</strong>
                </div>
                
                <p>This is a test email to verify that your GoDaddy SMTP settings are properly configured.</p>
                
                <h3>Configuration Details:</h3>
                <ul>
                  <li><strong>From Email:</strong> ${senderEmail}</li>
                  <li><strong>Timestamp:</strong> ${new Date().toISOString()}</li>
                  <li><strong>Status:</strong> ✅ Connected & Authenticated</li>
                </ul>
                
                <p>You can now proceed to accept/reject event registrations, and participants will receive notification emails automatically.</p>
                
                <p style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd; font-size: 12px; color: #666;">
                  This is an automated test email. Please do not reply.
                </p>
              </div>
            </div>
          </body>
        </html>
      `,
      text: `
SMTP Configuration Test Successful

Your email configuration is working correctly!

From Email: ${senderEmail}
Timestamp: ${new Date().toISOString()}
Status: ✅ Connected & Authenticated

You can now proceed to accept/reject event registrations, and participants will receive notification emails automatically.
      `,
    });

    return NextResponse.json({
      success: true,
      message: "Test email sent successfully",
      details: {
        from: senderEmail,
        to: testEmail,
        timestamp: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error("Error testing email:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      {
        success: false,
        error: "Failed to send test email",
        details: errorMessage,
        hint:
          errorMessage.includes("535") || errorMessage.includes("Authentication")
            ? "Check your email credentials in .env.local. Make sure GODADDY_EMAIL_PASSWORD is correct."
            : errorMessage.includes("connect")
            ? "Check your SMTP host and port settings in .env.local"
            : "See details for more information",
      },
      { status: 500 }
    );
  }
}
