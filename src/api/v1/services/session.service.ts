/* eslint-disable no-underscore-dangle */
import { SessionInterface } from '@interfaces/Session.Interface';
import { UserInterface } from '@interfaces/User.Interface';
import SessionRepository from '@repositories/Session.repository';
import Service from '@services/service';

class SessionService extends Service<SessionInterface, SessionRepository> {
  protected repository = new SessionRepository();
  protected observables?: Record<string, Function> | undefined = {
    'login-event': this.newSession,
  };

  async newSession(user: UserInterface & { _id: string; token: string }) {
    let session = await this.findOne({ userId: user._id });
    if (session) this.delete(session.id);
    session = await this.create({
      userId: user._id,
      token: user.token,
      isLoggedIn: true,
    });
  }
}

export default SessionService;
