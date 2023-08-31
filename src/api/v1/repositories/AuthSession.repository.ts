import { AuthSessionInterface } from '@interfaces/AuthSession.Interface';
import AuthSession from '@models/AuthSession';
import Repository from '@repositories/base';

class AuthSessionRepository extends Repository<AuthSessionInterface> {
  protected model = AuthSession;
}

export default AuthSessionRepository;
