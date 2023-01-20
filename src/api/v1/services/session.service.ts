import { SessionInterface } from '@interfaces/Session.Interface';
import SessionRepository from '@repositories/Session.repository';
import Service from '@services/service';

class SessionService extends Service<SessionInterface> {
  // repository = SessionRepository;
  serviceName = 'sessionService';
  externalServices = null;
}

export default new SessionService(SessionRepository);
