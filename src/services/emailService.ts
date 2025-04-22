import fs from 'fs';
import path from 'path';
import handlebars from 'handlebars';
import { transporter, emailConfig } from '../config/emailConfig';

// Service for handling emails
class EmailService {
  async sendVerificationEmail(email: string, verificationToken: string, userName?: string): Promise<void> {
    try {
      // Read email template
      const templatePath = path.join(__dirname, '../templates/emailVerification.html');
      const emailTemplate = fs.readFileSync(templatePath, 'utf-8');
      
      // Compile template with Handlebars
      const template = handlebars.compile(emailTemplate);
      
      // Create verification URL
      const verificationUrl = `${process.env.APP_URL || 'http://localhost:3000'}/api/auth/verify-email?token=${verificationToken}`;
      
      // Template data
      const data = {
        name: userName || 'User',
        verificationUrl,
        appName: process.env.APP_NAME || 'Your App',
        currentYear: new Date().getFullYear()
      };
      
      // Generate HTML content
      const html = template(data);
      
      // Send email
      await transporter.sendMail({
        from: emailConfig.from,
        to: email,
        subject: 'Verify Your Email',
        html: html,
      });
      
      console.log(`Verification email sent to ${email}`);
    } catch (error) {
      console.error('Error sending verification email:', error);
      throw error;
    }
  }
}

export default new EmailService();