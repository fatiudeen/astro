// import nodeMailer from 'nodemailer';
import * as Config from '@config';
import { UserInterface } from '@interfaces/User.Interface';
// import SMTPTransport from 'nodemailer/lib/smtp-transport';
import { MailtrapClient } from 'mailtrap';

class Mailer {
  // private transporter;
  private templates = {
    verifyEmail: '786d3d80-98cb-494a-801b-4b8a9466c2ae',
    forgotPassword: '702fd4c0-e159-4bd2-aabd-771cc2fb42a3',
  } as const;
  client;

  constructor() {
    this.client = new MailtrapClient({ token: Config.MAIL_TOKEN });
  }

  async send(to: string, template: keyof typeof Mailer.prototype.templates, variables: {} = {}) {
    await this.client.send({
      from: { name: Config.MAIL_SENDER_NAME, email: Config.MAIL_SENDER_EMAIL },
      to: [{ email: to }],
      template_uuid: this.templates[template],
      template_variables: variables,
    });
  }
  async verifyEmail(user: UserInterface) {
    // eslint-disable-next-line no-useless-catch
    try {
      await this.send(user.email, 'verifyEmail', { token: user.verificationToken });
    } catch (error) {
      throw error;
    }
  }

  async sendResetPassword(user: UserInterface) {
    // eslint-disable-next-line no-useless-catch
    try {
      await this.send(user.email, 'forgotPassword', { token: user.resetToken });
    } catch (error) {
      throw error;
    }
  }
}

export default Config.OPTIONS.USE_SMTP ? new Mailer() : null;
