import { UserInterface } from '@interfaces/User.Interface';
import User from '@models/User';
import Repository from '@repositories/repository';

class UserRepository extends Repository<UserInterface> {
  //   private model = User;
}

export default new UserRepository(User);
