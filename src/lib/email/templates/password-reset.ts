export function passwordResetEmailTemplate(name: string, resetLink: string): { subject: string; html: string } {
  return {
    subject: "Reset Your Nextill AI Password",
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #6366f1;">Reset Your Password</h1>
        <p>Hi ${name},</p>
        <p>We received a request to reset your password. Click the button below to create a new one:</p>
        <a href="${resetLink}"
           style="display: inline-block; padding: 12px 24px; background: #6366f1; color: #fff; text-decoration: none; border-radius: 6px;">
          Reset Password
        </a>
        <p style="margin-top: 16px;">If you didn't request this, you can safely ignore this email.</p>
        <hr style="margin: 24px 0; border: none; border-top: 1px solid #e5e7eb;" />
        <p style="color: #6b7280; font-size: 12px;">Nextill AI — AI-powered SEO tools</p>
      </div>
    `,
  }
}
