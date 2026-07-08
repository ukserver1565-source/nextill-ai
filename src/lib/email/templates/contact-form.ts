export function contactFormNotificationTemplate(data: {
  name: string
  email: string
  subject: string
  message: string
}): { subject: string; html: string } {
  return {
    subject: `[Contact Form] ${data.subject}`,
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #6366f1;">New Contact Message</h1>
        <table style="width: 100%; border-collapse: collapse;">
          <tr><td style="padding: 8px; font-weight: bold;">Name:</td><td style="padding: 8px;">${data.name}</td></tr>
          <tr><td style="padding: 8px; font-weight: bold;">Email:</td><td style="padding: 8px;">${data.email}</td></tr>
          <tr><td style="padding: 8px; font-weight: bold;">Subject:</td><td style="padding: 8px;">${data.subject}</td></tr>
        </table>
        <hr style="margin: 16px 0;" />
        <p style="white-space: pre-wrap;">${data.message}</p>
        <hr style="margin: 24px 0; border: none; border-top: 1px solid #e5e7eb;" />
        <p style="color: #6b7280; font-size: 12px;">Nextill AI — Contact Form Notification</p>
      </div>
    `,
  }
}
