import { SessionInterface } from '@interfaces/Session.Interface';
import Session from '@models/Session';
import Repository from '@repositories/repository';

class SessionRepository extends Repository<SessionInterface> {
  //   private model = Session;
}

export default new SessionRepository(Session);
