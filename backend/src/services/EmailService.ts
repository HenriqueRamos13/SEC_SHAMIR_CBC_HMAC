import nodemailer, { Transporter } from 'nodemailer';
import { IEmailService, EmailData } from '../interfaces/IEmailService';

export class EmailService implements IEmailService {
  private transporter: Transporter;

  constructor() {
    this.transporter = nodemailer.createTransport({
      host: 'localhost',
      port: 1025,
      secure: false,
    });
  }

  async sendEmail(emailData: EmailData): Promise<boolean> {
    try {
      await this.transporter.sendMail({
        from: '"ElPAGADOR" <noreply@elpagador.com>',
        to: emailData.to,
        subject: emailData.subject,
        text: emailData.text,
        html: emailData.html,
      });
      return true;
    } catch (error) {
      console.error('Failed to send email:', error);
      return false;
    }
  }
}
