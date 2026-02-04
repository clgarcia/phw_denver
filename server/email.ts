// Email sending utilities for registration confirmations using Mailgun
import Mailgun from "mailgun.js";
import formData from "form-data";

// Initialize Mailgun client
const mailgun = new Mailgun(formData);

const MAILGUN_API_KEY = process.env.MAILGUN_API_KEY;
const MAILGUN_DOMAIN = process.env.MAILGUN_DOMAIN;

// Only create client if credentials are present
const mg = MAILGUN_API_KEY && MAILGUN_DOMAIN ? mailgun.client({
  username: "api",
  key: MAILGUN_API_KEY,
}) : null;

// Data structure for registration confirmation emails
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
  tripName?: string;
  tripDate?: string;
  tripEndDate?: string;
  tripTime?: string;
  tripEndTime?: string;
  tripMeetupLocation?: string;
}

// Format a date string for email display
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

// Format a time string for email display
function formatTime(timeString: string): string {
  if (!timeString) return '';
  try {
    const [hours, minutes] = timeString.split(':').map(Number);
    const period = hours >= 12 ? 'PM' : 'AM';
    const displayHours = hours > 12 ? hours - 12 : hours === 0 ? 12 : hours;
    return `${displayHours}:${minutes.toString().padStart(2, '0')} ${period}`;
  } catch {
    return timeString;
  }
}

// Send a registration confirmation email to the user
export async function sendRegistrationConfirmation(data: RegistrationEmailData): Promise<boolean> {
  if (!mg || !MAILGUN_DOMAIN) {
    console.error("Mailgun not configured - skipping email", { 
      hasKey: !!MAILGUN_API_KEY, 
      hasDomain: !!MAILGUN_DOMAIN,
      hasClient: !!mg 
    });
    return false;
  }

  try {
    // Determine type and details for the email
    const isEvent = !!data.eventTitle;
    const isTrip = !!data.tripName;
    const registrationType = isTrip ? "Trip" : isEvent ? "Event" : "Program";
    const itemName = isTrip ? data.tripName : isEvent ? data.eventTitle : data.programName;
    const dateInfo = isTrip
      ? `${formatDate(data.tripDate || "")} - ${formatDate(data.tripEndDate || "")}${data.tripTime ? ` from ${formatTime(data.tripTime)}${data.tripEndTime ? ` - ${formatTime(data.tripEndTime)}` : ''}` : ""}`
      : isEvent 
      ? `${formatDate(data.eventDate || "")}${data.eventTime ? ` at ${formatTime(data.eventTime)}` : ""}`
      : formatDate(data.programStartDate || "");
    
    const participationLabel = data.participationType === "volunteer" ? "Volunteer" : "Participant";

    const subject = `Registration Confirmation - ${itemName}`;
    
    // Plain text body for email
    const textBody = `
Hello ${data.recipientName},

Thank you for registering for ${itemName}! 

Registration Details:
- ${registrationType}: ${itemName}
- Date: ${dateInfo}
${data.eventLocation ? `- Location: ${data.eventLocation}` : ""}
${data.tripMeetupLocation ? `- Meetup Location: ${data.tripMeetupLocation}` : ""}
- Role: ${participationLabel}

We look forward to seeing you there!

Best regards,
Project Healing Waters - Denver Chapter
    `.trim();

    // HTML body for email
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
        ${data.tripMeetupLocation ? `
        <div class="detail-row">
          <span class="label">Meetup Location:</span> ${data.tripMeetupLocation}
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
    `.trim();

    console.log(`Sending registration email to ${data.recipientEmail} for ${registrationType}: ${itemName}`);
    
    await mg.messages.create(MAILGUN_DOMAIN, {
      from: `Project Healing Waters <postmaster@${MAILGUN_DOMAIN}>`,
      to: [data.recipientEmail],
      subject,
      text: textBody,
      html: htmlBody,
    });
    
    console.log(`Registration confirmation email successfully sent to ${data.recipientEmail}`);
    return true;
  } catch (error) {
    console.error("Failed to send registration email:", error);
    return false;
  }
}
