import nodeMailer from 'nodemailer';
import * as Config from '@config';
import { UserInterface } from '@interfaces/User.Interface';
import SMTPTransport from 'nodemailer/lib/smtp-transport';

class Mailer {
  private transporter;
  private templates: Record<string, string> = { example: '<h1>example</h1>' }; // TODO: ADD TEMPLATES

  constructor() {
    this.transporter = nodeMailer.createTransport(<SMTPTransport.Options>{
      service: Config.SMTP_SERVICE,
      host: Config.SMTP_HOSTNAME,
      port: parseInt(Config.SMTP_PORT, 10),
      secure: false, // use TLS
      auth: {
        user: Config.SMTP_USERNAME,
        pass: Config.SMTP_PASSWORD,
      },
      // tls: {
      //     // do not fail on invalid certs
      //     rejectUnauthorized: false,
      //   }
    });
  }

  async send(to: string | string[], subject: string, template: string) {
    await this.transporter.sendMail({
      from: Config.DOMAIN_EMAIL,
      to,
      subject,
      // text,
      html: this.templates[template],
    });
  }
  async verifyEmail(user: UserInterface) {
    // eslint-disable-next-line no-useless-catch
    try {
      await this.send(user.email, 'VERIFY YOUR EMAIL ADDRESS', 'example');
    } catch (error) {
      throw error;
    }
  }

  async sendResetPassword(user: UserInterface) {
    // eslint-disable-next-line no-useless-catch
    try {
      await this.send(user.email, 'PASSWORD RESET TOKEN', 'example');
    } catch (error) {
      throw error;
    }
  }
}

export default Config.OPTIONS.USE_SMTP ? new Mailer() : null;
