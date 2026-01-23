interface EmailTemplateProps {
  participantName: string;
  email: string;
  eventName: string;
  participationType: string;
  registrationId: number;
  amount: number;
  eventDate?: string;
  teamMembers?: Array<{
    user_name: string;
    email: string;
    phone?: string;
    college?: string;
  }>;
}

// Basic mapping to pick an event cover image for the email header
// Fallback to Synapse branding if not matched
const EVENT_COVERS: Record<string, string> = {
  "DANCE EVENT": "/images_events/dance.png",
  "Fashion Show": "/images_events/fashionshow.png",
  "MUSIC EVENT": "/images_events/music.png",
  "THEATRE SHOW": "/images_events/theatre.png",
  "GAMING EVENT": "/images_events/gaming.png",
};

const SITE_BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://synapse-daiict.co.in";

function getEventCoverUrl(eventName: string): string | null {
  const cover = EVENT_COVERS[eventName];
  return cover ? `${SITE_BASE_URL}${cover}` : null;
}

export const acceptanceEmailTemplate = (props: EmailTemplateProps) => {
  const { participantName, eventName, participationType, registrationId, amount, eventDate, teamMembers } = props;
  const coverUrl = getEventCoverUrl(eventName);

  // Build a unified team list that always includes the leader/solo participant
  const allMembers = [{ user_name: participantName, email: props.email, phone: undefined, college: undefined }, ...(teamMembers || [])];

  const teamMembersHtml = `
    <div style="margin-top: 24px;">
      <h3 style="color: #10b981; font-size: 16px; margin-bottom: 12px; font-weight: 700;">🎴 TEAM MEMBERS</h3>
      <div class="details">
        ${allMembers.map((member, index) => `
          <div style="padding: 12px; margin-bottom: 8px; background: rgba(16,185,129,0.05); border-left: 3px solid #10b981; border-radius: 6px;">
            <div style="color: #10b981; font-weight: 700; font-size: 13px; margin-bottom: 4px;">Member ${index + 1}</div>
            <div style="font-size: 14px; color: #e5e7eb; font-weight: 600;">${member.user_name}</div>
            ${member.email ? `<div style=\"font-size: 12px; color: #9ca3af; margin-top: 4px;\">${member.email}</div>` : ''}
            ${member.phone ? `<div style=\"font-size: 12px; color: #9ca3af;\">📞 ${member.phone}</div>` : ''}
            ${member.college ? `<div style=\"font-size: 12px; color: #9ca3af;\">🏛️ ${member.college}</div>` : ''}
          </div>
        `).join('')}
      </div>
    </div>
  `;

  return {
    subject: `🎴 GAME ENTERED — ${eventName} Registration Verified`,
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="UTF-8">
          <style>
            body { font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Arial, sans-serif; line-height: 1.6; color: #e5e7eb; background: #0a0a0a; margin: 0; padding: 24px; }
            .container { max-width: 640px; margin: 0 auto; background: #111827; border: 1px solid #1f2937; border-radius: 14px; overflow: hidden; box-shadow: 0 10px 30px rgba(0,0,0,0.35); }
            .brand { background: #0f172a; padding: 24px; text-align: center; border-bottom: 1px solid #1f2937; }
            .logo { max-width: 120px; height: auto; margin: 0 auto 8px; display: block; }
            .title { font-size: 22px; font-weight: 800; color: #ffffff; margin: 0; letter-spacing: 1px; }
            .banner { width: 100%; display: block; background: linear-gradient(135deg, #14b8a6 0%, #0ea5e9 100%); }
            .banner img { width: 100%; height: auto; display: block; }
            .hero { padding: 32px 24px; text-align: center; background: linear-gradient(135deg, rgba(16,185,129,0.15) 0%, rgba(34,197,94,0.15) 100%); border-bottom: 1px solid #1f2937; }
            .hero .game-cleared { font-size: 32px; color: #10b981; font-weight: 900; letter-spacing: 2px; margin: 0 0 12px 0; }
            .hero .subtitle { font-size: 16px; color: #d1fae5; font-weight: 600; margin: 0; }
            .content { padding: 24px; }
            .badge { display: inline-block; background: #10b981; color: #052e2b; padding: 8px 16px; border-radius: 999px; font-weight: 700; margin-bottom: 16px; font-size: 14px; letter-spacing: 0.5px; }
            .details { background: #0b1020; border: 1px solid #1f2937; border-radius: 10px; padding: 14px; margin: 16px 0; }
            .row { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px dashed #1f2937; font-size: 14px; }
            .row:last-child { border-bottom: none; }
            .label { color: #9ca3af; font-weight: 600; }
            .value { color: #e5e7eb; font-weight: 600; }
            .quote { font-style: italic; color: #10b981; font-size: 15px; margin: 24px 0; padding: 16px; border-left: 3px solid #10b981; background: rgba(16,185,129,0.05); }
            .footer { text-align: center; padding: 18px; border-top: 1px solid #1f2937; font-size: 12px; color: #9ca3af; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="brand">
              <img src="${SITE_BASE_URL}/Synapse%20Logo.png" alt="Synapse Logo" class="logo" />
              <p class="title">SYNAPSE • DA-IICT</p>
            </div>
            <div class="banner">${coverUrl ? `<img src="${coverUrl}" alt="${eventName} Banner"/>` : ""}</div>
            <div class="hero">
              <div class="game-cleared">🎴 GAME CLEARED</div>
              <p class="subtitle">Your visa has been approved for ${eventName}</p>
            </div>
            <div class="content">
              <div class="badge">✓ REGISTRATION VERIFIED</div>
              
              <p style="font-size: 16px; color: #e5e7eb;">Dear <strong>${participantName}</strong>,</p>
              
              <div class="quote">
                "The only way to survive is to keep moving forward."
              </div>
              
              <p style="color: #d1d5db;">Congratulations! Your registration for <strong>${eventName}</strong> has been <strong>verified</strong>. You've successfully entered the game.</p>
              
              <div class="details">
                <div class="row"><span class="label">👤 Team / Leader:</span><span class="value">${participantName}</span></div>
                <div class="row"><span class="label">🎯 Event:</span><span class="value">${eventName}</span></div>
                <div class="row"><span class="label">👥 Participation Type:</span><span class="value">${participationType}</span></div>
                <div class="row"><span class="label">💰 Amount Paid:</span><span class="value">₹${amount}</span></div>
                ${eventDate ? `<div class="row"><span class="label">📅 Event Date:</span><span class="value">${eventDate}</span></div>` : ''}
              </div>
              
              ${teamMembersHtml}
              
              <p style="margin-top: 24px; padding: 16px; background: rgba(16,185,129,0.08); border-radius: 8px; font-size: 14px; color: #d1d5db;">
                <strong>⚠️ Rules of the Game:</strong><br>
                • Arrive on time with a valid ID<br>
                • Keep this email for reference<br>
                • Your survival depends on your performance
              </p>

              <p style="margin-top: 20px; color:#9ca3af; font-size: 13px;">For further queries, contact the game master (event coordinator).</p>

              <p style="margin-top: 32px; font-size: 16px; color: #e5e7eb;">May the odds be in your favor,<br><strong style="color: #10b981;">Team Synapse</strong></p>
              
              <div class="footer">This is an automated message from The Joker's Realm. Do not reply.</div>
            </div>
          </div>
        </body>
      </html>
    `,
    text: `
🎴 GAME CLEARED — ${eventName} Registration Verified

Dear ${participantName},

"The only way to survive is to keep moving forward."

Congratulations! Your registration for ${eventName} has been verified. You've successfully entered the game.

Registration Details:
- 👤 Team / Leader: ${participantName}
- 🎯 Event: ${eventName}
- 👥 Participation Type: ${participationType}
- 💰 Amount Paid: ₹${amount}
${eventDate ? `- 📅 Event Date: ${eventDate}` : ''}

🎴 TEAM MEMBERS:
${allMembers.map((member, index) => `
Member ${index + 1}: ${member.user_name}
${member.email ? `Email: ${member.email}\n` : ''}${member.phone ? `Phone: ${member.phone}\n` : ''}${member.college ? `College: ${member.college}\n` : ''}` ).join('')}
⚠️ Rules of the Game:
• Arrive on time with a valid ID
• Keep this email for reference
• Your survival depends on your performance

For further queries, contact the game master (event coordinator).

May the odds be in your favor,
Team Synapse
    `,
  };
};

export const rejectionEmailTemplate = (props: EmailTemplateProps & { rejectionReason?: string }) => {
  const { participantName, eventName } = props;
  const coverUrl = getEventCoverUrl(eventName);

  return {
    subject: `🂡 GAME OVER — ${eventName}`,
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="UTF-8">
          <style>
            body { font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Arial, sans-serif; line-height: 1.6; color: #e5e7eb; background: #0a0a0a; margin: 0; padding: 24px; }
            .container { max-width: 640px; margin: 0 auto; background: #111827; border: 1px solid #1f2937; border-radius: 14px; overflow: hidden; box-shadow: 0 10px 30px rgba(0,0,0,0.35); }
            .brand { background: #0f172a; padding: 24px; text-align: center; border-bottom: 1px solid #1f2937; }
            .logo { max-width: 120px; height: auto; margin: 0 auto 8px; display: block; }
            .title { font-size: 22px; font-weight: 800; color: #ffffff; margin: 0; letter-spacing: 1px; }
            .banner { width: 100%; display: block; background: linear-gradient(135deg, #ef4444 0%, #f43f5e 100%); }
            .banner img { width: 100%; height: auto; display: block; }
            .hero { padding: 40px 24px; text-align: center; background: linear-gradient(135deg, rgba(244,63,94,0.2) 0%, rgba(239,68,68,0.2) 100%); border-bottom: 1px solid #1f2937; position: relative; }
            .hero .card-symbol { font-size: 48px; color: #ef4444; margin-bottom: 16px; opacity: 0.6; }
            .hero .game-over { font-size: 38px; color: #ef4444; font-weight: 900; letter-spacing: 3px; margin: 8px 0; text-shadow: 0 0 20px rgba(239,68,68,0.5); }
            .hero .subtitle { font-size: 15px; color: #fca5a5; font-weight: 600; margin: 8px 0 0 0; letter-spacing: 1px; }
            .content { padding: 32px 24px; text-align: center; }
            .quote { font-style: italic; color: #9ca3af; font-size: 17px; margin: 28px 0; padding: 20px; border-left: 4px solid #ef4444; background: rgba(239,68,68,0.08); border-radius: 4px; line-height: 1.7; }
            .warning-box { background: rgba(239,68,68,0.12); border: 1px solid #ef4444; border-radius: 8px; padding: 16px; margin: 24px 0; }
            .footer { text-align: center; padding: 18px; border-top: 1px solid #1f2937; font-size: 12px; color: #9ca3af; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="brand">
              <img src="${SITE_BASE_URL}/Synapse%20Logo.png" alt="Synapse Logo" class="logo" />
              <p class="title">SYNAPSE • DA-IICT</p>
            </div>
            <div class="banner">${coverUrl ? `<img src="${coverUrl}" alt="${eventName} Banner"/>` : ""}</div>
            <div class="hero">
              <div class="card-symbol">🂡</div>
              <div class="game-over">GAME OVER</div>
              <p class="subtitle">Your visa has been REJECTED for ${eventName}</p>
            </div>
            <div class="content">
              <p style="font-size: 18px; color: #d1d5db; margin-bottom: 8px;">Dear <strong>${participantName}</strong>,</p>
              <p style="font-size: 14px; color: #9ca3af; margin-top: 0;">Participant in ${eventName}</p>
              
              <div class="warning-box">
                <div style="font-size: 15px; color: #fca5a5; font-weight: 700; margin-bottom: 8px;">⚠️ REGISTRATION STATUS</div>
                <div style="font-size: 14px; color: #e5e7eb;">Your registration has been <strong style="color: #ef4444;">REJECTED</strong></div>
              </div>
              
<p style="margin-top: 28px; font-size: 14px; color: #d1d5db; line-height: 1.7;">
          Unfortunately, your participation cannot be approved at this time.<br>
          Contact the game master (event coordinator) for further details.
        </p>
        
        <p style="margin-top: 40px; font-size: 16px; font-weight: 600; color: #e5e7eb;">
                The game continues without you,<br>
                <strong style="color: #dc2626;">Team Synapse</strong>
              </p>
              
              <div class="footer">This is an automated message from The Joker's Realm. Do not reply.</div>
            </div>
          </div>
        </body>
      </html>
    `,
    text: `
🂡 GAME OVER — ${eventName}

Dear ${participantName},
Participant in ${eventName}


⚠️ REGISTRATION STATUS:
Your registration has been REJECTED

Unfortunately, your participation cannot be approved at this time.
Contact the game master (event coordinator) for further details.

The game continues without you,
Team Synapse
    `,
  };
};

// Accommodation Email Templates
interface AccommodationEmailProps {
  participantName: string;
  email: string;
  checkIn: string;
  checkOut: string;
  nights: number;
  amount: number;
  bookingReference?: string;
}

export const accommodationAcceptanceEmailTemplate = (props: AccommodationEmailProps) => {
  const { participantName, checkIn, checkOut, nights, amount, bookingReference } = props;

  return {
    subject: `ACCOMMODATION APPROVED — Your booking is confirmed`,
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="UTF-8">
          <style>
            body { font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Arial, sans-serif; line-height: 1.6; color: #e5e7eb; background: #0a0a0a; margin: 0; padding: 24px; }
            .container { max-width: 640px; margin: 0 auto; background: #111827; border: 1px solid #1f2937; border-radius: 14px; overflow: hidden; box-shadow: 0 10px 30px rgba(0,0,0,0.35); }
            .brand { background: #0f172a; padding: 24px; text-align: center; border-bottom: 1px solid #1f2937; }
            .logo { max-width: 120px; height: auto; margin: 0 auto 8px; display: block; }
            .title { font-size: 22px; font-weight: 800; color: #ffffff; margin: 0; letter-spacing: 1px; }
            .hero { padding: 32px 24px; text-align: center; background: linear-gradient(135deg, rgba(59,130,246,0.15) 0%, rgba(34,197,94,0.15) 100%); border-bottom: 1px solid #1f2937; }
            .hero .status { font-size: 32px; color: #3b82f6; font-weight: 900; letter-spacing: 2px; margin: 0 0 12px 0; }
            .hero .subtitle { font-size: 16px; color: #bfdbfe; font-weight: 600; margin: 0; }
            .content { padding: 24px; }
            .badge { display: inline-block; background: #3b82f6; color: #0c1117; padding: 8px 16px; border-radius: 999px; font-weight: 700; margin-bottom: 16px; font-size: 14px; letter-spacing: 0.5px; }
            .details { background: #0b1020; border: 1px solid #1f2937; border-radius: 10px; padding: 14px; margin: 16px 0; }
            .row { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px dashed #1f2937; font-size: 14px; }
            .row:last-child { border-bottom: none; }
            .label { color: #9ca3af; font-weight: 600; }
            .value { color: #e5e7eb; font-weight: 600; }
            .info-box { background: rgba(59,130,246,0.08); border-radius: 8px; padding: 16px; margin: 24px 0; color: #d1d5db; }
            .footer { text-align: center; padding: 18px; border-top: 1px solid #1f2937; font-size: 12px; color: #9ca3af; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="brand">
              <img src="${SITE_BASE_URL}/Synapse%20Logo.png" alt="Synapse Logo" class="logo" />
              <p class="title">SYNAPSE • DA-IICT</p>
            </div>
            <div class="hero">
              <div class="status">✅ APPROVED</div>
              <p class="subtitle">Your accommodation booking has been confirmed</p>
            </div>
            <div class="content">
              <div class="badge">🏠 BOOKING CONFIRMED</div>
              
              <p style="font-size: 16px; color: #e5e7eb;">Dear <strong>${participantName}</strong>,</p>
              
              <p style="color: #d1d5db;">Your accommodation booking for Synapse has been approved! We're excited to have you stay with us.</p>
              
              <div class="details">
                <div class="row"><span class="label">🏨 Stay Duration:</span><span class="value">${nights} night${nights > 1 ? 's' : ''}</span></div>
                <div class="row"><span class="label">📅 Check-in:</span><span class="value">${new Date(checkIn).toLocaleDateString('en-IN')}</span></div>
                <div class="row"><span class="label">📅 Check-out:</span><span class="value">${new Date(checkOut).toLocaleDateString('en-IN')}</span></div>
                <div class="row"><span class="label">💰 Amount Paid:</span><span class="value">₹${amount}</span></div>
                ${bookingReference ? `<div class="row"><span class="label">🎫 Booking Reference:</span><span class="value">${bookingReference}</span></div>` : ''}
              </div>
              
              <div class="info-box">
                <strong>📋 Important Information:</strong><br>
                • Check-in time is typically from 2:00 PM<br>
                • Check-out time is typically by 11:00 AM<br>
                • Keep your booking reference for check-in<br>
                • Contact support if you need any assistance
              </div>

              <p style="margin-top: 20px; color:#9ca3af; font-size: 13px;">For any queries regarding your accommodation, please contact the support team.</p>

              <p style="margin-top: 32px; font-size: 16px; color: #e5e7eb;">See you soon!<br><strong style="color: #3b82f6;">Team Synapse</strong></p>
              
              <div class="footer">This is an automated message from Synapse. Do not reply.</div>
            </div>
          </div>
        </body>
      </html>
    `,
    text: `
✅ ACCOMMODATION APPROVED

Dear ${participantName},

Your accommodation booking for Synapse has been approved! We're excited to have you stay with us.

Booking Details:
- 🏨 Stay Duration: ${nights} night${nights > 1 ? 's' : ''}
- 📅 Check-in: ${new Date(checkIn).toLocaleDateString('en-IN')}
- 📅 Check-out: ${new Date(checkOut).toLocaleDateString('en-IN')}
- 💰 Amount Paid: ₹${amount}
${bookingReference ? `- 🎫 Booking Reference: ${bookingReference}` : ''}

📋 Important Information:
• Check-in time is typically from 2:00 PM
• Check-out time is typically by 11:00 AM
• Keep your booking reference for check-in
• Contact support if you need any assistance

For any queries regarding your accommodation, please contact the support team.

See you soon!
Team Synapse
    `,
  };
};

export const accommodationRejectionEmailTemplate = (props: AccommodationEmailProps & { rejectionReason?: string }) => {
  const { participantName, amount, rejectionReason } = props;

  return {
    subject: `ACCOMMODATION REJECTED — Payment verification failed`,
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="UTF-8">
          <style>
            body { font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Arial, sans-serif; line-height: 1.6; color: #e5e7eb; background: #0a0a0a; margin: 0; padding: 24px; }
            .container { max-width: 640px; margin: 0 auto; background: #111827; border: 1px solid #1f2937; border-radius: 14px; overflow: hidden; box-shadow: 0 10px 30px rgba(0,0,0,0.35); }
            .brand { background: #0f172a; padding: 24px; text-align: center; border-bottom: 1px solid #1f2937; }
            .logo { max-width: 120px; height: auto; margin: 0 auto 8px; display: block; }
            .title { font-size: 22px; font-weight: 800; color: #ffffff; margin: 0; letter-spacing: 1px; }
            .hero { padding: 32px 24px; text-align: center; background: linear-gradient(135deg, rgba(239,68,68,0.2) 0%, rgba(244,63,94,0.2) 100%); border-bottom: 1px solid #1f2937; }
            .hero .status { font-size: 32px; color: #ef4444; font-weight: 900; letter-spacing: 2px; margin: 0 0 12px 0; }
            .hero .subtitle { font-size: 16px; color: #fca5a5; font-weight: 600; margin: 0; }
            .content { padding: 24px; }
            .badge { display: inline-block; background: #ef4444; color: #7f1d1d; padding: 8px 16px; border-radius: 999px; font-weight: 700; margin-bottom: 16px; font-size: 14px; letter-spacing: 0.5px; }
            .warning-box { background: rgba(239,68,68,0.12); border: 1px solid #ef4444; border-radius: 8px; padding: 16px; margin: 24px 0; color: #d1d5db; }
            .details { background: #0b1020; border: 1px solid #1f2937; border-radius: 10px; padding: 14px; margin: 16px 0; }
            .row { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px dashed #1f2937; font-size: 14px; }
            .row:last-child { border-bottom: none; }
            .label { color: #9ca3af; font-weight: 600; }
            .value { color: #e5e7eb; font-weight: 600; }
            .footer { text-align: center; padding: 18px; border-top: 1px solid #1f2937; font-size: 12px; color: #9ca3af; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="brand">
              <img src="${SITE_BASE_URL}/Synapse%20Logo.png" alt="Synapse Logo" class="logo" />
              <p class="title">SYNAPSE • DA-IICT</p>
            </div>
            <div class="hero">
              <div class="status">❌ REJECTED</div>
              <p class="subtitle">Your accommodation payment could not be verified</p>
            </div>
            <div class="content">
              <div class="badge">❌ PAYMENT VERIFICATION FAILED</div>
              
              <p style="font-size: 16px; color: #e5e7eb;">Dear <strong>${participantName}</strong>,</p>
              
              <div class="warning-box">
                <strong>⚠️ Payment Verification Status:</strong><br>
                Your accommodation booking payment verification has been <strong style="color: #ef4444;">REJECTED</strong>.
              </div>
              
              <p style="color: #d1d5db; margin-top: 20px;">Unfortunately, we could not verify your payment for the accommodation booking.</p>
              
              <div class="details">
                <div class="row"><span class="label">💰 Amount:</span><span class="value">₹${amount}</span></div>
                ${rejectionReason ? `<div class="row"><span class="label">📝 Reason:</span><span class="value">${rejectionReason}</span></div>` : ''}
              </div>
              
              <div style="background: rgba(239,68,68,0.08); border-radius: 8px; padding: 16px; margin: 24px 0; color: #d1d5db;">
                <strong>📋 What's Next:</strong><br>
                • Please review the feedback from our verification team<br>
                • Submit a new payment screenshot with clear details<br>
                • Ensure the transaction reference is correct<br>
                • Contact support if you need assistance
              </div>

              <p style="margin-top: 20px; color:#9ca3af; font-size: 13px;">If you have any questions or need to resubmit your payment, please contact the support team.</p>

              <p style="margin-top: 32px; font-size: 16px; color: #e5e7eb;">We look forward to helping you!<br><strong style="color: #ef4444;">Team Synapse</strong></p>
              
              <div class="footer">This is an automated message from Synapse. Do not reply.</div>
            </div>
          </div>
        </body>
      </html>
    `,
    text: `
❌ ACCOMMODATION REJECTED

Dear ${participantName},

Your accommodation booking payment verification has been rejected.

Amount: ₹${amount}
${rejectionReason ? `Reason: ${rejectionReason}` : ''}

📋 What's Next:
• Please review the feedback from our verification team
• Submit a new payment screenshot with clear details
• Ensure the transaction reference is correct
• Contact support if you need assistance

If you have any questions or need to resubmit your payment, please contact the support team.

We look forward to helping you!
Team Synapse
    `,
  };
};

