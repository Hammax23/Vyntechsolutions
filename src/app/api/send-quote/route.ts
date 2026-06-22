import { NextRequest, NextResponse } from 'next/server';
import nodemailer from 'nodemailer';
import fs from 'fs';
import path from 'path';

// Email configuration - Update these with your actual SMTP credentials
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.SMTP_PORT || '465'),
  secure: parseInt(process.env.SMTP_PORT || '465') === 465,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

// Admin email template
function getAdminEmailTemplate(data: {
  fullName: string;
  email: string;
  phone: string;
  companyName: string;
  companyUrl: string;
  services: string[];
  projectDetails: string;
  hearAbout: string;
}) {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>New Quote Request</title>
</head>
<body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f4f7fa;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f4f7fa; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 24px rgba(0,0,0,0.08);">
          
          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #1a1a2e 0%, #262b3f 100%); padding: 40px 40px 30px;">
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td>
                    <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: 600;">
                      VYN<span style="color: #00B4FF;">TECH</span>
                    </h1>
                    <p style="color: rgba(255,255,255,0.6); margin: 5px 0 0; font-size: 12px; letter-spacing: 2px;">SOLUTIONS</p>
                  </td>
                  <td align="right">
                    <span style="background: linear-gradient(135deg, #00E1FF 0%, #0055FF 100%); color: white; padding: 8px 16px; border-radius: 20px; font-size: 12px; font-weight: 600;">NEW LEAD</span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Title Section -->
          <tr>
            <td style="padding: 30px 40px 20px;">
              <h2 style="color: #1a1a2e; margin: 0; font-size: 24px; font-weight: 600;">New Quote Request Received</h2>
              <p style="color: #6b7280; margin: 10px 0 0; font-size: 14px;">A potential client has submitted a project inquiry.</p>
            </td>
          </tr>

          <!-- Client Details -->
          <tr>
            <td style="padding: 0 40px 30px;">
              <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f8fafc; border-radius: 12px; overflow: hidden;">
                <tr>
                  <td style="padding: 24px;">
                    <h3 style="color: #1a1a2e; margin: 0 0 20px; font-size: 16px; font-weight: 600; border-bottom: 2px solid #e5e7eb; padding-bottom: 12px;">
                      👤 Client Information
                    </h3>
                    
                    <table width="100%" cellpadding="0" cellspacing="0">
                      <tr>
                        <td style="padding: 8px 0;">
                          <span style="color: #6b7280; font-size: 12px; text-transform: uppercase; letter-spacing: 1px;">Full Name</span><br>
                          <span style="color: #1a1a2e; font-size: 16px; font-weight: 500;">${data.fullName}</span>
                        </td>
                        <td style="padding: 8px 0;">
                          <span style="color: #6b7280; font-size: 12px; text-transform: uppercase; letter-spacing: 1px;">Email</span><br>
                          <a href="mailto:${data.email}" style="color: #0055FF; font-size: 16px; font-weight: 500; text-decoration: none;">${data.email}</a>
                        </td>
                      </tr>
                      <tr>
                        <td style="padding: 8px 0;">
                          <span style="color: #6b7280; font-size: 12px; text-transform: uppercase; letter-spacing: 1px;">Phone</span><br>
                          <span style="color: #1a1a2e; font-size: 16px; font-weight: 500;">${data.phone}</span>
                        </td>
                        <td style="padding: 8px 0;">
                          <span style="color: #6b7280; font-size: 12px; text-transform: uppercase; letter-spacing: 1px;">Company</span><br>
                          <span style="color: #1a1a2e; font-size: 16px; font-weight: 500;">${data.companyName || 'Not provided'}</span>
                        </td>
                      </tr>
                      ${data.companyUrl ? `
                      <tr>
                        <td colspan="2" style="padding: 8px 0;">
                          <span style="color: #6b7280; font-size: 12px; text-transform: uppercase; letter-spacing: 1px;">Company Website</span><br>
                          <a href="${data.companyUrl}" style="color: #0055FF; font-size: 16px; font-weight: 500; text-decoration: none;">${data.companyUrl}</a>
                        </td>
                      </tr>
                      ` : ''}
                    </table>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Services Requested -->
          <tr>
            <td style="padding: 0 40px 30px;">
              <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f0f9ff; border-radius: 12px; overflow: hidden; border-left: 4px solid #0055FF;">
                <tr>
                  <td style="padding: 24px;">
                    <h3 style="color: #1a1a2e; margin: 0 0 16px; font-size: 16px; font-weight: 600;">
                      🛠️ Services Requested
                    </h3>
                    <div style="display: flex; flex-wrap: wrap; gap: 8px;">
                      ${data.services.map(service => `
                        <span style="background-color: #0055FF; color: white; padding: 6px 14px; border-radius: 20px; font-size: 13px; font-weight: 500; display: inline-block; margin: 4px 4px 4px 0;">${service}</span>
                      `).join('')}
                    </div>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Project Details -->
          <tr>
            <td style="padding: 0 40px 30px;">
              <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #fefce8; border-radius: 12px; overflow: hidden; border-left: 4px solid #eab308;">
                <tr>
                  <td style="padding: 24px;">
                    <h3 style="color: #1a1a2e; margin: 0 0 12px; font-size: 16px; font-weight: 600;">
                      📋 Project Details
                    </h3>
                    <p style="color: #374151; font-size: 15px; line-height: 1.7; margin: 0; white-space: pre-wrap;">${data.projectDetails || 'No details provided'}</p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- How They Heard -->
          ${data.hearAbout ? `
          <tr>
            <td style="padding: 0 40px 30px;">
              <p style="color: #6b7280; font-size: 13px; margin: 0;">
                <strong>How they heard about us:</strong> ${data.hearAbout}
              </p>
            </td>
          </tr>
          ` : ''}

          <!-- CTA -->
          <tr>
            <td style="padding: 0 40px 40px;">
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td align="center">
                    <a href="mailto:${data.email}" style="display: inline-block; background: linear-gradient(135deg, #0055FF 0%, #00B4FF 100%); color: white; padding: 14px 32px; border-radius: 8px; font-size: 14px; font-weight: 600; text-decoration: none;">
                      Reply to ${data.fullName}
                    </a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #f8fafc; padding: 24px 40px; border-top: 1px solid #e5e7eb;">
              <p style="color: #9ca3af; font-size: 12px; margin: 0; text-align: center;">
                This is an automated notification from VynTech Solutions.<br>
                © ${new Date().getFullYear()} VynTech Solutions. All rights reserved.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `;
}

// User confirmation email template
function getUserConfirmationTemplate(data: { fullName: string; services: string[] }) {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Quote Request Received</title>
</head>
<body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f4f7fa;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f4f7fa; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 24px rgba(0,0,0,0.08);">
          
          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #1a1a2e 0%, #262b3f 100%); padding: 50px 40px; text-align: center;">
              <h1 style="color: #ffffff; margin: 0; font-size: 32px; font-weight: 600;">
                VYN<span style="color: #00B4FF;">TECH</span>
              </h1>
              <p style="color: rgba(255,255,255,0.6); margin: 8px 0 0; font-size: 12px; letter-spacing: 3px;">SOLUTIONS</p>
            </td>
          </tr>

          <!-- Success Icon -->
          <tr>
            <td align="center" style="padding: 40px 40px 20px;">
              <div style="width: 80px; height: 80px; background: linear-gradient(135deg, #10b981 0%, #059669 100%); border-radius: 50%; display: inline-flex; align-items: center; justify-content: center;">
                <span style="color: white; font-size: 40px;">✓</span>
              </div>
            </td>
          </tr>

          <!-- Main Content -->
          <tr>
            <td style="padding: 0 40px 30px; text-align: center;">
              <h2 style="color: #1a1a2e; margin: 0 0 16px; font-size: 28px; font-weight: 600;">Thank You, ${data.fullName}!</h2>
              <p style="color: #6b7280; font-size: 16px; line-height: 1.7; margin: 0;">
                Your quote request has been successfully submitted.<br>
                Our team will review your requirements and get back to you shortly.
              </p>
            </td>
          </tr>

          <!-- What's Next Box -->
          <tr>
            <td style="padding: 0 40px 30px;">
              <table width="100%" cellpadding="0" cellspacing="0" style="background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%); border-radius: 12px; overflow: hidden;">
                <tr>
                  <td style="padding: 28px;">
                    <h3 style="color: #0055FF; margin: 0 0 16px; font-size: 18px; font-weight: 600;">What Happens Next?</h3>
                    
                    <table width="100%" cellpadding="0" cellspacing="0">
                      <tr>
                        <td style="padding: 10px 0;">
                          <table cellpadding="0" cellspacing="0">
                            <tr>
                              <td style="width: 32px; vertical-align: top;">
                                <span style="display: inline-block; width: 24px; height: 24px; background-color: #0055FF; color: white; border-radius: 50%; text-align: center; line-height: 24px; font-size: 12px; font-weight: 600;">1</span>
                              </td>
                              <td style="padding-left: 12px;">
                                <p style="color: #374151; margin: 0; font-size: 14px;"><strong>Review</strong> – Our experts will analyze your requirements</p>
                              </td>
                            </tr>
                          </table>
                        </td>
                      </tr>
                      <tr>
                        <td style="padding: 10px 0;">
                          <table cellpadding="0" cellspacing="0">
                            <tr>
                              <td style="width: 32px; vertical-align: top;">
                                <span style="display: inline-block; width: 24px; height: 24px; background-color: #0055FF; color: white; border-radius: 50%; text-align: center; line-height: 24px; font-size: 12px; font-weight: 600;">2</span>
                              </td>
                              <td style="padding-left: 12px;">
                                <p style="color: #374151; margin: 0; font-size: 14px;"><strong>Response</strong> – You'll receive a detailed proposal within 24-48 hours</p>
                              </td>
                            </tr>
                          </table>
                        </td>
                      </tr>
                      <tr>
                        <td style="padding: 10px 0;">
                          <table cellpadding="0" cellspacing="0">
                            <tr>
                              <td style="width: 32px; vertical-align: top;">
                                <span style="display: inline-block; width: 24px; height: 24px; background-color: #0055FF; color: white; border-radius: 50%; text-align: center; line-height: 24px; font-size: 12px; font-weight: 600;">3</span>
                              </td>
                              <td style="padding-left: 12px;">
                                <p style="color: #374151; margin: 0; font-size: 14px;"><strong>Consultation</strong> – We'll schedule a call to discuss your project in detail</p>
                              </td>
                            </tr>
                          </table>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Services Summary -->
          <tr>
            <td style="padding: 0 40px 30px;">
              <p style="color: #6b7280; font-size: 13px; margin: 0 0 12px; text-transform: uppercase; letter-spacing: 1px;">Services You're Interested In:</p>
              <div>
                ${data.services.map(service => `
                  <span style="display: inline-block; background-color: #f3f4f6; color: #374151; padding: 8px 16px; border-radius: 20px; font-size: 13px; margin: 4px 4px 4px 0;">${service}</span>
                `).join('')}
              </div>
            </td>
          </tr>

          <!-- Contact Info -->
          <tr>
            <td style="padding: 0 40px 40px;">
              <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #1a1a2e; border-radius: 12px; overflow: hidden;">
                <tr>
                  <td style="padding: 24px; text-align: center;">
                    <p style="color: rgba(255,255,255,0.8); font-size: 14px; margin: 0 0 8px;">Have questions? Reach out to us directly:</p>
                    <a href="mailto:info@vyntechsolutions.ca" style="color: #00B4FF; font-size: 16px; font-weight: 600; text-decoration: none;">info@vyntechsolutions.ca</a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #f8fafc; padding: 24px 40px; border-top: 1px solid #e5e7eb; text-align: center;">
              <p style="color: #6b7280; font-size: 13px; margin: 0 0 12px;">
                Follow us for the latest updates
              </p>
              <p style="margin: 0;">
                <a href="#" style="color: #0055FF; text-decoration: none; margin: 0 8px;">LinkedIn</a>
                <a href="#" style="color: #0055FF; text-decoration: none; margin: 0 8px;">Twitter</a>
                <a href="#" style="color: #0055FF; text-decoration: none; margin: 0 8px;">Instagram</a>
              </p>
              <p style="color: #9ca3af; font-size: 11px; margin: 16px 0 0;">
                © ${new Date().getFullYear()} VynTech Solutions. All rights reserved.<br>
                Canada (Head Office)
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `;
}

// Save submission to file for admin panel
function saveSubmission(data: {
  fullName: string;
  email: string;
  phone: string;
  companyName: string;
  companyUrl: string;
  services: string[];
  projectDetails: string;
  hearAbout: string;
}) {
  const DATA_FILE = path.join(process.cwd(), 'data', 'submissions.json');
  const dataDir = path.join(process.cwd(), 'data');
  
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }
  if (!fs.existsSync(DATA_FILE)) {
    fs.writeFileSync(DATA_FILE, JSON.stringify({ submissions: [] }, null, 2));
  }
  
  const fileData = JSON.parse(fs.readFileSync(DATA_FILE, 'utf-8'));
  const newSubmission = {
    id: `sub_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    ...data,
    submittedAt: new Date().toISOString(),
    status: 'new',
  };
  
  fileData.submissions.push(newSubmission);
  fs.writeFileSync(DATA_FILE, JSON.stringify(fileData, null, 2));
}

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();

    const { fullName, email, phone, companyName, companyUrl, services, projectDetails, hearAbout } = data;

    // Save to database for admin panel
    saveSubmission({ fullName, email, phone, companyName, companyUrl, services, projectDetails, hearAbout });

    // Send email to admin
    await transporter.sendMail({
      from: `"VynTech Solutions Website" <${process.env.SMTP_USER}>`,
      to: 'info@vyntechsolutions.ca',
      subject: `🚀 New Quote Request from ${fullName}`,
      html: getAdminEmailTemplate({
        fullName,
        email,
        phone,
        companyName,
        companyUrl,
        services,
        projectDetails,
        hearAbout,
      }),
    });

    // Send confirmation email to user
    await transporter.sendMail({
      from: `"VynTech Solutions" <${process.env.SMTP_USER}>`,
      to: email,
      subject: `Thank You for Your Quote Request - VynTech Solutions`,
      html: getUserConfirmationTemplate({
        fullName,
        services,
      }),
    });

    return NextResponse.json({ success: true, message: 'Emails sent successfully' });
  } catch (error) {
    console.error('Error sending email:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to send email' },
      { status: 500 }
    );
  }
}
