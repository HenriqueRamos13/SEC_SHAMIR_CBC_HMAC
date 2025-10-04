export interface EmailData {
  to: string;
  subject: string;
  text: string;
  html?: string;
}

export interface IEmailService {
  sendEmail(emailData: EmailData): Promise<boolean>;
}
