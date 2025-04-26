import fs from 'fs';
import path from 'path';
import handlebars from 'handlebars';
import { transporter, emailConfig } from '../config/emailConfig';

interface EmailOptions {
  to: string | string[];
  subject: string;
  html: string;
  from?: string;
  cc?: string | string[];
  bcc?: string | string[];
  attachments?: Array<{
    filename: string;
    content?: Buffer | string;
    path?: string;
    contentType?: string;
  }>;
}

// Service for handling emails
class EmailService {
  async sendVerificationEmail(email: string, verificationToken: string, userName?: string): Promise<void> {
    // Existing implementation
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

  /**
   * Send a generic email with the given options
   * @param options Email options including recipient, subject, and HTML content
   * @returns Promise that resolves when the email is sent
   */
  async sendEmail(options: EmailOptions): Promise<void> {
    console.log('Sending email with options:', emailConfig);
    try {
      // Prepare email data
      const emailData = {
        from: options.from || emailConfig.from,
        to: options.to,
        subject: options.subject,
        html: options.html,
        // Only include these optional fields if they're provided
        ...(options.cc && { cc: options.cc }),
        ...(options.bcc && { bcc: options.bcc }),
        ...(options.attachments && { attachments: options.attachments })
      };

      // Send the email
      await transporter.sendMail(emailData);

      // Log the success
      const recipient = Array.isArray(options.to) ? options.to.join(', ') : options.to;
      console.log(`Email sent successfully to ${recipient}`);
    } catch (error) {
      console.error('Error sending email:', error);
      throw error;
    }
  }

  /**
   * Render an email template with the provided data
   * @param templateName The name of the template file without extension
   * @param data Data to inject into the template
   * @returns The rendered HTML content
   */
  async renderTemplate(templateName: string, data: Record<string, any>): Promise<string> {
    try {
      // Add common template variables
      const templateData = {
        ...data,
        appName: process.env.APP_NAME || 'Your App',
        currentYear: new Date().getFullYear()
      };

      // Read template file
      const templatePath = path.join(__dirname, `../templates/${templateName}.html`);
      const templateContent = fs.readFileSync(templatePath, 'utf-8');
      
      // Compile and render template
      const template = handlebars.compile(templateContent);
      return template(templateData);
    } catch (error) {
      console.error(`Error rendering template ${templateName}:`, error);
      throw error;
    }
  }
}

export default new EmailService();