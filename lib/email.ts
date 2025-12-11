import { Resend } from 'resend'

// Initialize Resend client (will be undefined if no API key)
const resend = process.env.RESEND_API_KEY
  ? new Resend(process.env.RESEND_API_KEY)
  : null

// Email sender configuration
const FROM_EMAIL = 'Hypedrive <noreply@hypedrive.io>'
const REPLY_TO = 'support@hypedrive.io'

export interface SendEmailOptions {
  to: string | string[]
  subject: string
  html: string
  text?: string
  replyTo?: string
  cc?: string[]
  bcc?: string[]
  attachments?: Array<{
    filename: string
    content: Buffer | string
    contentType?: string
  }>
}

export interface EmailResult {
  success: boolean
  id?: string
  error?: string
}

/**
 * Send an email using Resend
 */
export async function sendEmail(options: SendEmailOptions): Promise<EmailResult> {
  if (!resend) {
    console.warn('Resend API key not configured, skipping email send')
    return { success: false, error: 'Email service not configured' }
  }

  try {
    const { data, error } = await resend.emails.send({
      from: FROM_EMAIL,
      to: options.to,
      subject: options.subject,
      html: options.html,
      text: options.text,
      replyTo: options.replyTo || REPLY_TO,
      cc: options.cc,
      bcc: options.bcc,
      attachments: options.attachments,
    })

    if (error) {
      console.error('Resend error:', error)
      return { success: false, error: error.message }
    }

    return { success: true, id: data?.id }
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    console.error('Email send failed:', message)
    return { success: false, error: message }
  }
}

// ============================================
// Pre-built email templates
// ============================================

/**
 * Send enrollment notification email to brand
 */
export async function sendEnrollmentNotification(options: {
  to: string
  brandName: string
  shopperName: string
  campaignTitle: string
  orderValue: number
  enrollmentUrl: string
}): Promise<EmailResult> {
  const { brandName, shopperName, campaignTitle, orderValue, enrollmentUrl } = options

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #1a1a1a; }
        .container { max-width: 560px; margin: 0 auto; padding: 40px 20px; }
        .header { text-align: center; margin-bottom: 32px; }
        .logo { font-size: 24px; font-weight: 700; color: #6366f1; }
        .card { background: #f8fafc; border-radius: 12px; padding: 24px; margin-bottom: 24px; }
        .label { font-size: 12px; color: #64748b; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 4px; }
        .value { font-size: 16px; font-weight: 600; color: #1a1a1a; }
        .button { display: inline-block; background: #6366f1; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: 600; }
        .footer { text-align: center; margin-top: 32px; font-size: 14px; color: #64748b; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <div class="logo">Hypedrive</div>
        </div>

        <h2>New Enrollment Received!</h2>
        <p>Hi ${brandName},</p>
        <p>A new enrollment has been submitted for your campaign and is awaiting review.</p>

        <div class="card">
          <div style="margin-bottom: 16px;">
            <div class="label">Shopper</div>
            <div class="value">${shopperName}</div>
          </div>
          <div style="margin-bottom: 16px;">
            <div class="label">Campaign</div>
            <div class="value">${campaignTitle}</div>
          </div>
          <div>
            <div class="label">Order Value</div>
            <div class="value">₹${orderValue.toLocaleString('en-IN')}</div>
          </div>
        </div>

        <p style="text-align: center;">
          <a href="${enrollmentUrl}" class="button">Review Enrollment</a>
        </p>

        <div class="footer">
          <p>This is an automated notification from Hypedrive.</p>
          <p>© ${new Date().getFullYear()} Hypedrive Technologies</p>
        </div>
      </div>
    </body>
    </html>
  `

  return sendEmail({
    to: options.to,
    subject: `New Enrollment: ${shopperName} for ${campaignTitle}`,
    html,
    text: `New enrollment from ${shopperName} for campaign "${campaignTitle}" with order value ₹${orderValue.toLocaleString('en-IN')}. Review at: ${enrollmentUrl}`,
  })
}

/**
 * Send invoice notification email
 */
export async function sendInvoiceNotification(options: {
  to: string
  brandName: string
  invoiceNumber: string
  totalAmount: number
  dueDate: Date
  invoiceUrl: string
}): Promise<EmailResult> {
  const { brandName, invoiceNumber, totalAmount, dueDate, invoiceUrl } = options

  const formattedDueDate = dueDate.toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #1a1a1a; }
        .container { max-width: 560px; margin: 0 auto; padding: 40px 20px; }
        .header { text-align: center; margin-bottom: 32px; }
        .logo { font-size: 24px; font-weight: 700; color: #6366f1; }
        .card { background: #f8fafc; border-radius: 12px; padding: 24px; margin-bottom: 24px; }
        .amount { font-size: 32px; font-weight: 700; color: #1a1a1a; text-align: center; }
        .label { font-size: 12px; color: #64748b; text-transform: uppercase; letter-spacing: 0.5px; }
        .button { display: inline-block; background: #6366f1; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: 600; }
        .footer { text-align: center; margin-top: 32px; font-size: 14px; color: #64748b; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <div class="logo">Hypedrive</div>
        </div>

        <h2>Invoice ${invoiceNumber}</h2>
        <p>Hi ${brandName},</p>
        <p>Your weekly invoice is ready for review.</p>

        <div class="card">
          <div class="amount">₹${totalAmount.toLocaleString('en-IN')}</div>
          <p style="text-align: center; margin-top: 8px;">
            <span class="label">Due by ${formattedDueDate}</span>
          </p>
        </div>

        <p style="text-align: center;">
          <a href="${invoiceUrl}" class="button">View Invoice</a>
        </p>

        <div class="footer">
          <p>This invoice will be auto-debited from your wallet balance.</p>
          <p>© ${new Date().getFullYear()} Hypedrive Technologies</p>
        </div>
      </div>
    </body>
    </html>
  `

  return sendEmail({
    to: options.to,
    subject: `Invoice ${invoiceNumber} - ₹${totalAmount.toLocaleString('en-IN')}`,
    html,
    text: `Invoice ${invoiceNumber} for ₹${totalAmount.toLocaleString('en-IN')} is due by ${formattedDueDate}. View at: ${invoiceUrl}`,
  })
}

/**
 * Send low wallet balance alert
 */
export async function sendLowBalanceAlert(options: {
  to: string
  brandName: string
  currentBalance: number
  threshold: number
  walletUrl: string
}): Promise<EmailResult> {
  const { brandName, currentBalance, threshold, walletUrl } = options

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #1a1a1a; }
        .container { max-width: 560px; margin: 0 auto; padding: 40px 20px; }
        .header { text-align: center; margin-bottom: 32px; }
        .logo { font-size: 24px; font-weight: 700; color: #6366f1; }
        .alert { background: #fef2f2; border: 1px solid #fecaca; border-radius: 12px; padding: 24px; margin-bottom: 24px; }
        .amount { font-size: 28px; font-weight: 700; color: #dc2626; }
        .button { display: inline-block; background: #6366f1; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: 600; }
        .footer { text-align: center; margin-top: 32px; font-size: 14px; color: #64748b; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <div class="logo">Hypedrive</div>
        </div>

        <h2>⚠️ Low Wallet Balance</h2>
        <p>Hi ${brandName},</p>
        <p>Your wallet balance has fallen below ₹${threshold.toLocaleString('en-IN')}.</p>

        <div class="alert">
          <p style="margin: 0; text-align: center;">
            <span style="font-size: 14px; color: #dc2626;">Current Balance</span><br>
            <span class="amount">₹${currentBalance.toLocaleString('en-IN')}</span>
          </p>
        </div>

        <p>Add funds to continue accepting new enrollments without interruption.</p>

        <p style="text-align: center;">
          <a href="${walletUrl}" class="button">Add Funds</a>
        </p>

        <div class="footer">
          <p>© ${new Date().getFullYear()} Hypedrive Technologies</p>
        </div>
      </div>
    </body>
    </html>
  `

  return sendEmail({
    to: options.to,
    subject: `⚠️ Low Wallet Balance - ₹${currentBalance.toLocaleString('en-IN')}`,
    html,
    text: `Your wallet balance (₹${currentBalance.toLocaleString('en-IN')}) is below ₹${threshold.toLocaleString('en-IN')}. Add funds at: ${walletUrl}`,
  })
}

/**
 * Send weekly summary email
 */
export async function sendWeeklySummary(options: {
  to: string
  brandName: string
  stats: {
    newEnrollments: number
    approved: number
    rejected: number
    totalPayout: number
    topCampaign?: string
  }
  dashboardUrl: string
}): Promise<EmailResult> {
  const { brandName, stats, dashboardUrl } = options

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #1a1a1a; }
        .container { max-width: 560px; margin: 0 auto; padding: 40px 20px; }
        .header { text-align: center; margin-bottom: 32px; }
        .logo { font-size: 24px; font-weight: 700; color: #6366f1; }
        .stats { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 24px; }
        .stat { background: #f8fafc; border-radius: 12px; padding: 20px; text-align: center; }
        .stat-value { font-size: 28px; font-weight: 700; color: #1a1a1a; }
        .stat-label { font-size: 12px; color: #64748b; text-transform: uppercase; letter-spacing: 0.5px; }
        .button { display: inline-block; background: #6366f1; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: 600; }
        .footer { text-align: center; margin-top: 32px; font-size: 14px; color: #64748b; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <div class="logo">Hypedrive</div>
        </div>

        <h2>Your Weekly Summary</h2>
        <p>Hi ${brandName},</p>
        <p>Here's how your campaigns performed this week:</p>

        <div class="stats">
          <div class="stat">
            <div class="stat-value">${stats.newEnrollments}</div>
            <div class="stat-label">New Enrollments</div>
          </div>
          <div class="stat">
            <div class="stat-value" style="color: #16a34a;">${stats.approved}</div>
            <div class="stat-label">Approved</div>
          </div>
          <div class="stat">
            <div class="stat-value" style="color: #dc2626;">${stats.rejected}</div>
            <div class="stat-label">Rejected</div>
          </div>
          <div class="stat">
            <div class="stat-value">₹${stats.totalPayout.toLocaleString('en-IN')}</div>
            <div class="stat-label">Total Payout</div>
          </div>
        </div>

        ${stats.topCampaign ? `<p><strong>Top Performing Campaign:</strong> ${stats.topCampaign}</p>` : ''}

        <p style="text-align: center;">
          <a href="${dashboardUrl}" class="button">View Dashboard</a>
        </p>

        <div class="footer">
          <p>© ${new Date().getFullYear()} Hypedrive Technologies</p>
        </div>
      </div>
    </body>
    </html>
  `

  return sendEmail({
    to: options.to,
    subject: `Weekly Summary: ${stats.newEnrollments} enrollments, ₹${stats.totalPayout.toLocaleString('en-IN')} payout`,
    html,
  })
}
