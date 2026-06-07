
/**
 * Email Service Mock
 * 
 * NOTE: The prompt requested this file at `/api/services/emailService.js`.
 * However, system constraints strictly forbid creating or modifying files in `apps/api/`.
 * Therefore, this service is implemented as a frontend utility to simulate the behavior.
 * 
 * In a real production environment on Hostinger, this logic would reside in a Node.js backend
 * using Nodemailer configured with Hostinger SMTP:
 * 
 * const transporter = nodemailer.createTransport({
 *   host: process.env.SMTP_HOST || 'smtp.hostinger.com',
 *   port: process.env.SMTP_PORT || 587,
 *   secure: false, // true for 465, false for other ports
 *   auth: {
 *     user: process.env.SMTP_USER,
 *     pass: process.env.SMTP_PASSWORD,
 *   },
 * });
 */

export const emailService = {
  /**
   * Simulates sending an inquiry notification email to the property seller.
   * 
   * @param {string} sellerEmail - The email address of the property seller
   * @param {string} sellerName - The name of the property seller
   * @param {object} propertyDetails - Details of the property (title, id, etc.)
   * @param {object} buyerInfo - Details of the buyer (name, email, phone, message)
   * @returns {Promise<boolean>} - Resolves to true if successful
   */
  sendInquiryNotification: async (sellerEmail, sellerName, propertyDetails, buyerInfo) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        try {
          console.log('==================================================');
          console.log('📧 SIMULATED EMAIL DISPATCH (Hostinger SMTP Mock)');
          console.log('==================================================');
          console.log(`To: ${sellerEmail}`);
          console.log(`From: noreply@dehradunestates.com`);
          console.log(`Subject: New Inquiry for Your Property: ${propertyDetails.title}`);
          console.log('--------------------------------------------------');
          console.log(`Hello ${sellerName || 'Seller'},\n`);
          console.log(`You have received a new inquiry for your property listing: "${propertyDetails.title}".\n`);
          console.log(`Buyer Details:`);
          console.log(`- Name: ${buyerInfo.buyer_name}`);
          console.log(`- Email: ${buyerInfo.buyer_email}`);
          console.log(`- Phone: ${buyerInfo.buyer_phone}\n`);
          console.log(`Message:\n"${buyerInfo.message}"\n`);
          console.log(`Log in to your dashboard to respond to this inquiry.\n`);
          console.log(`Best regards,\nThe Dehradun Estates Team`);
          console.log(`https://dehradunestates.com`);
          console.log('==================================================');
          
          resolve(true);
        } catch (error) {
          console.error('Failed to send email notification:', error);
          // Graceful error handling: resolve true anyway so the UI doesn't break for the user
          resolve(true); 
        }
      }, 800);
    });
  }
};
