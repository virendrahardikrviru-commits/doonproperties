import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

// Create transporter
let transporter;

try {
  transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.hostinger.com',
    port: parseInt(process.env.SMTP_PORT) || 465,
    secure: process.env.SMTP_SECURE !== 'false', // true for 465, false for other ports
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS
    }
  });

  // Verify connection configuration
  transporter.verify((error, success) => {
    if (error) {
      console.warn('⚠️  Email service not configured properly:', error.message);
      console.warn('   Email notifications will not be sent until SMTP is configured.');
    } else {
      console.log('✅ Email service ready');
    }
  });
} catch (error) {
  console.warn('⚠️  Email service initialization failed:', error.message);
}

// Send inquiry notification email to seller
export const sendInquiryNotification = async (sellerEmail, sellerName, listing, inquiry) => {
  if (!transporter) {
    console.warn('Email transporter not available, skipping email notification');
    return false;
  }

  const mailOptions = {
    from: process.env.EMAIL_FROM || 'Dehradun Estates <noreply@dehradunestates.com>',
    to: sellerEmail,
    subject: `New Inquiry: ${listing.title}`,
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #4F46E5; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
            .content { background: #f9f9f9; padding: 30px; border: 1px solid #e0e0e0; }
            .listing-info { background: white; padding: 15px; border-radius: 8px; margin: 15px 0; border: 1px solid #e0e0e0; }
            .inquiry-info { background: white; padding: 15px; border-radius: 8px; margin: 15px 0; border: 1px solid #e0e0e0; }
            .label { font-weight: bold; color: #666; }
            .value { color: #333; }
            .footer { text-align: center; padding: 15px; color: #666; font-size: 12px; }
            .btn { display: inline-block; background: #4F46E5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin-top: 15px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🏠 New Property Inquiry</h1>
            </div>
            <div class="content">
              <p>Hello ${sellerName},</p>
              <p>You have received a new inquiry for your property listing:</p>
              
              <div class="listing-info">
                <p class="label">Property:</p>
                <p class="value"><strong>${listing.title}</strong></p>
                ${listing.location ? `<p class="label">Location:</p><p class="value">${listing.location}</p>` : ''}
              </div>
              
              <div class="inquiry-info">
                <p class="label">Interested Buyer Details:</p>
                <p><span class="label">Name:</span> <span class="value">${inquiry.buyer_name}</span></p>
                <p><span class="label">Email:</span> <span class="value">${inquiry.buyer_email}</span></p>
                <p><span class="label">Phone:</span> <span class="value">${inquiry.buyer_phone}</span></p>
                ${inquiry.message ? `<p><span class="label">Message:</span></p><p class="value">${inquiry.message}</p>` : ''}
              </div>
              
              <p style="margin-top: 20px;">
                <a href="${process.env.FRONTEND_URL}/dashboard/inquiries" class="btn">View All Inquiries</a>
              </p>
              
              <p style="margin-top: 20px; font-size: 14px; color: #666;">
                Please respond to this inquiry as soon as possible to maintain a good response rate.
              </p>
            </div>
            <div class="footer">
              <p>This email was sent from Dehradun Estates</p>
              <p>© ${new Date().getFullYear()} Dehradun Estates. All rights reserved.</p>
            </div>
          </div>
        </body>
      </html>
    `
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log('✅ Email sent:', info.messageId);
    return true;
  } catch (error) {
    console.error('❌ Error sending email:', error);
    return false;
  }
};

// Send welcome email to new user
export const sendWelcomeEmail = async (userEmail, userName) => {
  if (!transporter) {
    console.warn('Email transporter not available, skipping welcome email');
    return false;
  }

  const mailOptions = {
    from: process.env.EMAIL_FROM || 'Dehradun Estates <noreply@dehradunestates.com>',
    to: userEmail,
    subject: 'Welcome to Dehradun Estates!',
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #4F46E5; color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
            .content { background: #f9f9f9; padding: 30px; border: 1px solid #e0e0e0; }
            .features { display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin: 20px 0; }
            .feature { background: white; padding: 15px; border-radius: 8px; border: 1px solid #e0e0e0; }
            .footer { text-align: center; padding: 15px; color: #666; font-size: 12px; }
            .btn { display: inline-block; background: #4F46E5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin-top: 15px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🏠 Welcome to Dehradun Estates!</h1>
            </div>
            <div class="content">
              <p>Hello ${userName || 'there'},</p>
              <p>Thank you for joining Dehradun Estates - your trusted platform for buying, renting, and selling properties in Dehradun.</p>
              
              <div class="features">
                <div class="feature">
                  <h3>🔍 Search Properties</h3>
                  <p>Browse through hundreds of verified listings</p>
                </div>
                <div class="feature">
                  <h3>📝 Post Your Ad</h3>
                  <p>List your property in minutes</p>
                </div>
                <div class="feature">
                  <h3>💬 Chat with Sellers</h3>
                  <p>Direct communication with property owners</p>
                </div>
                <div class="feature">
                  <h3>❤️ Save Favorites</h3>
                  <p>Keep track of properties you love</p>
                </div>
              </div>
              
              <p style="text-align: center;">
                <a href="${process.env.FRONTEND_URL}" class="btn">Start Exploring</a>
              </p>
            </div>
            <div class="footer">
              <p>© ${new Date().getFullYear()} Dehradun Estates. All rights reserved.</p>
            </div>
          </div>
        </body>
      </html>
    `
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log('✅ Welcome email sent:', info.messageId);
    return true;
  } catch (error) {
    console.error('❌ Error sending welcome email:', error);
    return false;
  }
};

export default { sendInquiryNotification, sendWelcomeEmail };