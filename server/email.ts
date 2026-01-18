// Gmail integration for sending registration confirmation emails
// Uses Replit's Gmail connector with googleapis

import { google } from 'googleapis';

let connectionSettings: any;

async function getAccessToken() {
  if (connectionSettings && connectionSettings.settings.expires_at && new Date(connectionSettings.settings.expires_at).getTime() > Date.now()) {
    return connectionSettings.settings.access_token;
  }
  
  const hostname = process.env.REPLIT_CONNECTORS_HOSTNAME;
  const xReplitToken = process.env.REPL_IDENTITY 
    ? 'repl ' + process.env.REPL_IDENTITY 
    : process.env.WEB_REPL_RENEWAL 
    ? 'depl ' + process.env.WEB_REPL_RENEWAL 
    : null;

  if (!xReplitToken) {
    throw new Error('X_REPLIT_TOKEN not found for repl/depl');
  }

  connectionSettings = await fetch(
    'https://' + hostname + '/api/v2/connection?include_secrets=true&connector_names=google-mail',
    {
      headers: {
        'Accept': 'application/json',
        'X_REPLIT_TOKEN': xReplitToken
      }
    }
  ).then(res => res.json()).then(data => data.items?.[0]);

  const accessToken = connectionSettings?.settings?.access_token || connectionSettings.settings?.oauth?.credentials?.access_token;

  if (!connectionSettings || !accessToken) {
    throw new Error('Gmail not connected');
  }
  return accessToken;
}

async function getUncachableGmailClient() {
  const accessToken = await getAccessToken();

  const oauth2Client = new google.auth.OAuth2();
  oauth2Client.setCredentials({
    access_token: accessToken
  });

  return google.gmail({ version: 'v1', auth: oauth2Client });
}

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

function createEmailContent(to: string, subject: string, textBody: string, htmlBody: string): string {
  const boundary = "boundary_" + Date.now();
  
  const messageParts = [
    `To: ${to}`,
    `Subject: ${subject}`,
    'MIME-Version: 1.0',
    `Content-Type: multipart/alternative; boundary="${boundary}"`,
    '',
    `--${boundary}`,
    'Content-Type: text/plain; charset="UTF-8"',
    '',
    textBody,
    '',
    `--${boundary}`,
    'Content-Type: text/html; charset="UTF-8"',
    '',
    htmlBody,
    '',
    `--${boundary}--`
  ];
  
  const message = messageParts.join('\r\n');
  return Buffer.from(message).toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

export async function sendRegistrationConfirmation(data: RegistrationEmailData): Promise<boolean> {
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
    const gmail = await getUncachableGmailClient();
    const encodedMessage = createEmailContent(data.recipientEmail, subject, textBody, htmlBody);
    
    await gmail.users.messages.send({
      userId: 'me',
      requestBody: {
        raw: encodedMessage
      }
    });
    
    console.log(`Registration confirmation email sent to ${data.recipientEmail}`);
    return true;
  } catch (error) {
    console.error("Failed to send registration email:", error);
    return false;
  }
}
