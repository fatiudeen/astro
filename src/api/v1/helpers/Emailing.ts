import SendGrid from '@sendgrid/mail';
import { SENDGRID_API_KEY, DOMAIN_EMAIL, OPTIONS } from '@config';
import { UserInterface } from '@interfaces/User.Interface';
import { logger } from '@utils/logger';

class Emailing {
  useEmail = OPTIONS.USE_EMAILING;
  private sendGrid;
  private templates: Record<string, string> = { example: '<h1>example</h1>' }; // TODO: ADD TEMPLATES

  constructor() {
    this.sendGrid = SendGrid;
    if (this.useEmail) {
      this.sendGrid.setApiKey(SENDGRID_API_KEY);
    }
  }
  private sendEmail(to: string, subject: string, template: string) {
    if (!this.useEmail) {
      logger.error(['email not implemented']);
      return null;
    }
    const msg = {
      to,
      from: <string>DOMAIN_EMAIL,
      subject,
      html: this.templates[template],
    };
    return this.sendGrid.send(msg);
  }
  async verifyEmail(user: UserInterface) {
    // eslint-disable-next-line no-useless-catch
    try {
      await this.sendEmail(user.email, 'VERIFY YOUR EMAIL ADDRESS', 'example');
    } catch (error) {
      throw error;
    }
  }

  async sendResetPassword(user: UserInterface) {
    // eslint-disable-next-line no-useless-catch
    try {
      await this.sendEmail(user.email, 'PASSWORD RESET TOKEN', 'example');
    } catch (error) {
      throw error;
    }
  }
}

export default new Emailing();
