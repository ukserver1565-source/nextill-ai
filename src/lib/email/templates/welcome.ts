export function welcomeEmailTemplate(name: string): { subject: string; html: string } {
  return {
    subject: "Welcome to Nextill AI!",
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #6366f1;">Welcome to Nextill AI, ${name}!</h1>
        <p>Thank you for signing up. You now have access to all our AI-powered SEO tools.</p>
        <p>Get started by visiting your dashboard:</p>
        <a href="{{SITE_URL}}/dashboard"
           style="display: inline-block; padding: 12px 24px; background: #6366f1; color: #fff; text-decoration: none; border-radius: 6px;">
          Go to Dashboard
        </a>
        <hr style="margin: 24px 0; border: none; border-top: 1px solid #e5e7eb;" />
        <p style="color: #6b7280; font-size: 12px;">Nextill AI — AI-powered SEO tools</p>
      </div>
    `,
  }
}
