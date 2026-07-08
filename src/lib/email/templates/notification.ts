export function notificationTemplate(data: {
  name: string
  title: string
  body: string
  ctaText?: string
  ctaUrl?: string
}): { subject: string; html: string } {
  return {
    subject: data.title,
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #6366f1;">${data.title}</h1>
        <p>Hi ${data.name},</p>
        <p>${data.body}</p>
        ${data.ctaText && data.ctaUrl ? `
          <a href="${data.ctaUrl}"
             style="display: inline-block; padding: 12px 24px; background: #6366f1; color: #fff; text-decoration: none; border-radius: 6px;">
            ${data.ctaText}
          </a>
        ` : ""}
        <hr style="margin: 24px 0; border: none; border-top: 1px solid #e5e7eb;" />
        <p style="color: #6b7280; font-size: 12px;">Nextill AI — AI-powered SEO tools</p>
      </div>
    `,
  }
}
