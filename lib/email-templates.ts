interface EmailTemplateProps {
  participantName: string;
  email: string;
  eventName: string;
  participationType: string;
  registrationId: number;
  amount: number;
  eventDate?: string;
}

export const acceptanceEmailTemplate = (props: EmailTemplateProps) => {
  const { participantName, eventName, participationType, registrationId, amount, eventDate } = props;

  return {
    subject: `🎉 Your Registration Has Been Accepted - ${eventName}`,
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="UTF-8">
          <style>
            body { font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Arial, sans-serif; line-height: 1.6; color: #333; background: #0a0a0a; margin: 0; padding: 20px; }
            .container { max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15); }
            .brand-header { background: linear-gradient(135deg, #dc2626 0%, #991b1b 100%); padding: 40px 30px; text-align: center; }
            .logo { max-width: 180px; height: auto; margin-bottom: 15px; }
            .brand-name { font-size: 32px; font-weight: 800; color: white; margin: 0; letter-spacing: 2px; text-transform: uppercase; }
            .tagline { font-size: 14px; color: rgba(255,255,255,0.9); margin: 5px 0 0 0; letter-spacing: 1px; }
            .header { background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; padding: 30px; text-align: center; }
            .content { background: #f9f9f9; padding: 30px; }
            .success-badge { display: inline-block; background: #10b981; color: white; padding: 8px 16px; border-radius: 20px; font-weight: bold; margin-bottom: 15px; }
            .details { background: white; padding: 15px; margin: 15px 0; border-left: 4px solid #10b981; border-radius: 4px; }
            .detail-row { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #eee; }
            .detail-row:last-child { border-bottom: none; }
            .label { font-weight: bold; color: #666; }
            .value { color: #333; }
            .footer { text-align: center; margin-top: 30px; padding: 20px; background: #f3f4f6; font-size: 12px; color: #6b7280; }
            .cta-button { display: inline-block; background: #dc2626; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; margin-top: 20px; font-weight: 600; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="brand-header">
              <img src="https://synapse-daiict.co.in/Synapse%20Logo.png" alt="Synapse Logo" class="logo" />
              <h1 class="brand-name">SYNAPSE</h1>
              <p class="tagline">DA-IICT Annual Techno-Management Fest</p>
            </div>
            <div class="header">
              <h1 style="margin: 0; font-size: 28px;">Registration Accepted! 🎉</h1>
              <p style="margin: 10px 0 0 0; font-size: 16px;">Great news from ${eventName}</p>
            </div>
            <div class="content">
              <div class="success-badge">✓ ACCEPTED</div>
              
              <p>Dear <strong>${participantName}</strong>,</p>
              
              <p>We're thrilled to inform you that your registration for <strong>${eventName}</strong> has been <strong>accepted</strong>!</p>
              
              <div class="details">
                <div class="detail-row">
                  <span class="label">Registration ID:</span>
                  <span class="value">#${registrationId}</span>
                </div>
                <div class="detail-row">
                  <span class="label">Event:</span>
                  <span class="value">${eventName}</span>
                </div>
                <div class="detail-row">
                  <span class="label">Participation Type:</span>
                  <span class="value">${participationType}</span>
                </div>
                <div class="detail-row">
                  <span class="label">Amount Paid:</span>
                  <span class="value">₹${amount}</span>
                </div>
                ${eventDate ? `
                <div class="detail-row">
                  <span class="label">Event Date:</span>
                  <span class="value">${eventDate}</span>
                </div>
                ` : ''}
              </div>
              
              <p>Your participation has been confirmed. Please keep this email for your reference. Make sure to arrive on time and bring a valid ID.</p>
              
              <p>If you have any questions or need to make changes to your registration, please don't hesitate to contact our support team.</p>
              
              <p style="margin-top: 30px;">Best regards,<br><strong>The Event Team</strong></p>
              
              <div class="footer">
                <p>This is an automated email. Please do not reply to this message.</p>
              </div>
            </div>
          </div>
        </body>
      </html>
    `,
    text: `
Your Registration Has Been Accepted - ${eventName}

Dear ${participantName},

We're thrilled to inform you that your registration for ${eventName} has been accepted!

Registration Details:
- Registration ID: #${registrationId}
- Event: ${eventName}
- Participation Type: ${participationType}
- Amount Paid: ₹${amount}
${eventDate ? `- Event Date: ${eventDate}` : ''}

Your participation has been confirmed. Please keep this email for your reference.

Best regards,
The Event Team
    `,
  };
};

export const rejectionEmailTemplate = (props: EmailTemplateProps & { rejectionReason?: string }) => {
  const { participantName, eventName, participationType, registrationId, amount, rejectionReason } = props;

  return {
    subject: `Registration Status Update - ${eventName}`,
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="UTF-8">
          <style>
            body { font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Arial, sans-serif; line-height: 1.6; color: #333; background: #0a0a0a; margin: 0; padding: 20px; }
            .container { max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15); }
            .brand-header { background: linear-gradient(135deg, #dc2626 0%, #991b1b 100%); padding: 40px 30px; text-align: center; }
            .logo { max-width: 180px; height: auto; margin-bottom: 15px; }
            .brand-name { font-size: 32px; font-weight: 800; color: white; margin: 0; letter-spacing: 2px; text-transform: uppercase; }
            .tagline { font-size: 14px; color: rgba(255,255,255,0.9); margin: 5px 0 0 0; letter-spacing: 1px; }
            .header { background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); color: white; padding: 30px; text-align: center; }
            .content { background: #f9f9f9; padding: 30px; }
            .rejection-badge { display: inline-block; background: #ef4444; color: white; padding: 8px 16px; border-radius: 20px; font-weight: bold; margin-bottom: 15px; }
            .details { background: white; padding: 15px; margin: 15px 0; border-left: 4px solid #ef4444; border-radius: 4px; }
            .detail-row { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #eee; }
            .detail-row:last-child { border-bottom: none; }
            .label { font-weight: bold; color: #666; }
            .value { color: #333; }
            .reason-box { background: #fef2f2; border: 1px solid #fecaca; padding: 15px; border-radius: 4px; margin: 15px 0; }
            .footer { text-align: center; margin-top: 30px; padding: 20px; background: #f3f4f6; font-size: 12px; color: #6b7280; }
            .cta-button { display: inline-block; background: #dc2626; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; margin-top: 20px; font-weight: 600; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="brand-header">
              <img src="https://synapse-daiict.co.in/Synapse%20Logo.png" alt="Synapse Logo" class="logo" />
              <h1 class="brand-name">SYNAPSE</h1>
              <p class="tagline">DA-IICT Annual Techno-Management Fest</p>
            </div>
            <div class="header">
              <h1 style="margin: 0; font-size: 28px;">Registration Status Update</h1>
              <p style="margin: 10px 0 0 0; font-size: 16px;">Regarding your application to ${eventName}</p>
            </div>
            <div class="content">
              <div class="rejection-badge">⚠ NOT ACCEPTED</div>
              
              <p>Dear <strong>${participantName}</strong>,</p>
              
              <p>Thank you for your interest in registering for <strong>${eventName}</strong>. After careful review, we regret to inform you that your registration could not be accepted at this time.</p>
              
              <div class="details">
                <div class="detail-row">
                  <span class="label">Registration ID:</span>
                  <span class="value">#${registrationId}</span>
                </div>
                <div class="detail-row">
                  <span class="label">Event:</span>
                  <span class="value">${eventName}</span>
                </div>
                <div class="detail-row">
                  <span class="label">Participation Type:</span>
                  <span class="value">${participationType}</span>
                </div>
              </div>
              
              ${rejectionReason ? `
              <div class="reason-box">
                <strong>Reason:</strong><br>
                ${rejectionReason}
              </div>
              ` : ''}
              
              <p>We appreciate your understanding. If you believe this decision was made in error or if you have any questions, please feel free to contact our support team.</p>
              
              <p style="margin-top: 30px;">Best regards,<br><strong>The Event Team</strong></p>
              
              <div class="footer">
                <p>This is an automated email. Please do not reply to this message.</p>
              </div>
            </div>
          </div>
        </body>
      </html>
    `,
    text: `
Registration Status Update - ${eventName}

Dear ${participantName},

Thank you for your interest in registering for ${eventName}. After careful review, we regret to inform you that your registration could not be accepted at this time.

Registration Details:
- Registration ID: #${registrationId}
- Event: ${eventName}
- Participation Type: ${participationType}

${rejectionReason ? `Reason: ${rejectionReason}` : ''}

We appreciate your understanding. If you have any questions, please contact our support team.

Best regards,
The Event Team
    `,
  };
};
