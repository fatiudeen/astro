import { UserInterface } from '@interfaces/User.Interface';
import User from '@models/User';
import Repository from '@repositories/base';

export default class UserRepository extends Repository<UserInterface> {
  protected model = User;
}
