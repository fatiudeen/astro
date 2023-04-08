import { UserInterface } from '@interfaces/User.Interface';
import UserRepository from '@repositories/User.repository';
import Service from '@services/service';
// import { logger } from '@utils/logger';
// import s3 from '@helpers/multer';
// import { OPTIONS } from '@config';

class UserService extends Service<UserInterface, UserRepository> {
  protected repository = new UserRepository();
}

export default UserService;
