import Mailgun from "mailgun.js";
import formData from "form-data";

const mailgun = new Mailgun(formData);

const MAILGUN_API_KEY = process.env.MAILGUN_API_KEY;
const MAILGUN_DOMAIN = process.env.MAILGUN_DOMAIN;

const mg = MAILGUN_API_KEY ? mailgun.client({
  username: "api",
  key: MAILGUN_API_KEY,
}) : null;

interface RegistrationEmailData {
  recipientEmail: string;
  recipientName: string;
  participationType: string;
  eventTitle?: string;
  eventDate?: string;
  eventTime?: string;
  eventLocation?: string;
  programName?: string;
  programStartDate?: string;
}

function formatDate(dateString: string): string {
  if (!dateString) return "";
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return "";
  return date.toLocaleDateString('en-US', { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });
}

export async function sendRegistrationConfirmation(data: RegistrationEmailData): Promise<boolean> {
  if (!mg || !MAILGUN_DOMAIN) {
    console.log("Mailgun not configured - skipping email");
    return false;
  }

  const isEvent = !!data.eventTitle;
  const registrationType = isEvent ? "Event" : "Program";
  const itemName = isEvent ? data.eventTitle : data.programName;
  const dateInfo = isEvent 
    ? `${formatDate(data.eventDate || "")}${data.eventTime ? ` at ${data.eventTime}` : ""}`
    : formatDate(data.programStartDate || "");
  
  const participationLabel = data.participationType === "volunteer" ? "Volunteer" : "Participant";

  const subject = `Registration Confirmation - ${itemName}`;
  
  const textBody = `
Hello ${data.recipientName},

Thank you for registering for ${itemName}!

Registration Details:
- ${registrationType}: ${itemName}
- Date: ${dateInfo}
${data.eventLocation ? `- Location: ${data.eventLocation}` : ""}
- Role: ${participationLabel}

We look forward to seeing you there!

Best regards,
Project Healing Waters - Denver Chapter
  `.trim();

  const htmlBody = `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background-color: #4A5D23; color: white; padding: 20px; text-align: center; }
    .content { padding: 20px; background-color: #f9f9f9; }
    .details { background-color: white; padding: 15px; border-radius: 8px; margin: 15px 0; }
    .detail-row { padding: 8px 0; border-bottom: 1px solid #eee; }
    .detail-row:last-child { border-bottom: none; }
    .label { font-weight: bold; color: #4A5D23; }
    .footer { padding: 20px; text-align: center; color: #666; font-size: 14px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Registration Confirmed!</h1>
    </div>
    <div class="content">
      <p>Hello ${data.recipientName},</p>
      <p>Thank you for registering for <strong>${itemName}</strong>!</p>
      
      <div class="details">
        <h3 style="margin-top: 0; color: #4A5D23;">Registration Details</h3>
        <div class="detail-row">
          <span class="label">${registrationType}:</span> ${itemName}
        </div>
        <div class="detail-row">
          <span class="label">Date:</span> ${dateInfo}
        </div>
        ${data.eventLocation ? `
        <div class="detail-row">
          <span class="label">Location:</span> ${data.eventLocation}
        </div>
        ` : ""}
        <div class="detail-row">
          <span class="label">Role:</span> ${participationLabel}
        </div>
      </div>
      
      <p>We look forward to seeing you there!</p>
    </div>
    <div class="footer">
      <p>Best regards,<br>Project Healing Waters - Denver Chapter</p>
    </div>
  </div>
</body>
</html>
  `.trim();

  try {
    await mg.messages.create(MAILGUN_DOMAIN, {
      from: `Project Healing Waters <postmaster@${MAILGUN_DOMAIN}>`,
      to: [data.recipientEmail],
      subject,
      text: textBody,
      html: htmlBody,
    });
    console.log(`Registration confirmation email sent to ${data.recipientEmail}`);
    return true;
  } catch (error) {
    console.error("Failed to send registration email:", error);
    return false;
  }
}
