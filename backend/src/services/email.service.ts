import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);
const FROM = process.env.RESEND_FROM_EMAIL || 'onboarding@resend.dev';

// ── Welcome email on register ──────────────────────────────
export const sendWelcomeEmail = async (
  to: string,
  name: string,
  role: string
): Promise<void> => {
  try {
    await resend.emails.send({
      from: FROM,
      to,
      subject: '🎉 Welcome to HireAI!',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #2563eb, #4f46e5); padding: 40px; border-radius: 16px 16px 0 0; text-align: center;">
            <h1 style="color: white; margin: 0; font-size: 28px;">Welcome to HireAI! 🚀</h1>
          </div>
          <div style="background: #f8fafc; padding: 40px; border-radius: 0 0 16px 16px;">
            <h2 style="color: #1e293b;">Hi ${name}! 👋</h2>
            <p style="color: #64748b; line-height: 1.6;">
              Your account has been created successfully as a <strong>${role}</strong>.
            </p>
            ${role === 'jobseeker' ? `
              <p style="color: #64748b; line-height: 1.6;">Here's what you can do:</p>
              <ul style="color: #64748b; line-height: 2;">
                <li>🔍 Browse thousands of jobs</li>
                <li>🤖 Get AI-powered job matches</li>
                <li>📄 Analyze your resume with AI</li>
                <li>🎯 Prepare for interviews with AI</li>
              </ul>
            ` : `
              <p style="color: #64748b; line-height: 1.6;">Here's what you can do:</p>
              <ul style="color: #64748b; line-height: 2;">
                <li>📝 Post job listings</li>
                <li>🤖 Generate JDs with AI</li>
                <li>👥 Manage applications</li>
                <li>📊 Track hiring analytics</li>
              </ul>
            `}
            <div style="text-align: center; margin-top: 30px;">
              <a href="${process.env.CLIENT_URL}" 
                style="background: #2563eb; color: white; padding: 14px 32px; border-radius: 8px; text-decoration: none; font-weight: bold;">
                Get Started →
              </a>
            </div>
            <p style="color: #94a3b8; font-size: 12px; margin-top: 30px; text-align: center;">
              © ${new Date().getFullYear()} HireAI. Built with MERN + AI.
            </p>
          </div>
        </div>
      `,
    });
  } catch (error) {
    console.error('Failed to send welcome email:', error);
  }
};

// ── Application confirmation email ─────────────────────────
export const sendApplicationConfirmationEmail = async (
  to: string,
  name: string,
  jobTitle: string,
  companyName: string
): Promise<void> => {
  try {
    await resend.emails.send({
      from: FROM,
      to,
      subject: `✅ Application submitted — ${jobTitle} at ${companyName}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #059669, #0d9488); padding: 40px; border-radius: 16px 16px 0 0; text-align: center;">
            <h1 style="color: white; margin: 0; font-size: 24px;">Application Submitted! ✅</h1>
          </div>
          <div style="background: #f8fafc; padding: 40px; border-radius: 0 0 16px 16px;">
            <h2 style="color: #1e293b;">Hi ${name}!</h2>
            <p style="color: #64748b; line-height: 1.6;">
              Your application for <strong>${jobTitle}</strong> at <strong>${companyName}</strong> has been submitted successfully.
            </p>
            <div style="background: white; border: 1px solid #e2e8f0; border-radius: 12px; padding: 20px; margin: 20px 0;">
              <p style="margin: 0; color: #64748b; font-size: 14px;">Position</p>
              <p style="margin: 4px 0 0; color: #1e293b; font-weight: bold; font-size: 18px;">${jobTitle}</p>
              <p style="margin: 4px 0 0; color: #64748b;">${companyName}</p>
            </div>
            <p style="color: #64748b; line-height: 1.6;">
              The recruiter will review your application and get back to you. 
              You can track your application status in your dashboard.
            </p>
            <div style="text-align: center; margin-top: 30px;">
              <a href="${process.env.CLIENT_URL}/dashboard" 
                style="background: #059669; color: white; padding: 14px 32px; border-radius: 8px; text-decoration: none; font-weight: bold;">
                Track Application →
              </a>
            </div>
          </div>
        </div>
      `,
    });
  } catch (error) {
    console.error('Failed to send application email:', error);
  }
};

// ── Application status update email ───────────────────────
export const sendStatusUpdateEmail = async (
  to: string,
  name: string,
  jobTitle: string,
  companyName: string,
  status: string
): Promise<void> => {
  const statusConfig: Record<string, { color: string; emoji: string; message: string }> = {
    reviewing: { color: '#2563eb', emoji: '👀', message: 'Your application is being reviewed by the recruiter.' },
    shortlisted: { color: '#7c3aed', emoji: '⭐', message: 'Congratulations! You have been shortlisted for this position.' },
    rejected: { color: '#dc2626', emoji: '❌', message: 'Unfortunately, your application was not selected this time. Keep applying!' },
    hired: { color: '#059669', emoji: '🎉', message: 'Congratulations! You have been selected for this position!' },
  };

  const config = statusConfig[status] || { color: '#64748b', emoji: '📋', message: 'Your application status has been updated.' };

  try {
    await resend.emails.send({
      from: FROM,
      to,
      subject: `${config.emoji} Application Update — ${jobTitle} at ${companyName}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: ${config.color}; padding: 40px; border-radius: 16px 16px 0 0; text-align: center;">
            <div style="font-size: 48px; margin-bottom: 10px;">${config.emoji}</div>
            <h1 style="color: white; margin: 0; font-size: 24px; text-transform: capitalize;">
              Status: ${status}
            </h1>
          </div>
          <div style="background: #f8fafc; padding: 40px; border-radius: 0 0 16px 16px;">
            <h2 style="color: #1e293b;">Hi ${name}!</h2>
            <p style="color: #64748b; line-height: 1.6;">${config.message}</p>
            <div style="background: white; border: 1px solid #e2e8f0; border-radius: 12px; padding: 20px; margin: 20px 0;">
              <p style="margin: 0; color: #64748b; font-size: 14px;">Position</p>
              <p style="margin: 4px 0 0; color: #1e293b; font-weight: bold; font-size: 18px;">${jobTitle}</p>
              <p style="margin: 4px 0 0; color: #64748b;">${companyName}</p>
              <div style="margin-top: 12px; padding-top: 12px; border-top: 1px solid #e2e8f0;">
                <span style="background: ${config.color}20; color: ${config.color}; padding: 4px 12px; border-radius: 20px; font-size: 14px; font-weight: bold; text-transform: capitalize;">
                  ${status}
                </span>
              </div>
            </div>
            <div style="text-align: center; margin-top: 30px;">
              <a href="${process.env.CLIENT_URL}/dashboard" 
                style="background: ${config.color}; color: white; padding: 14px 32px; border-radius: 8px; text-decoration: none; font-weight: bold;">
                View Dashboard →
              </a>
            </div>
          </div>
        </div>
      `,
    });
  } catch (error) {
    console.error('Failed to send status email:', error);
  }
};