import { UserInterface } from '@interfaces/User.Interface';
import UserRepository from '@repositories/User.repository';
import Service from '@services/service';
import { logger } from '@utils/logger';
import s3 from '@helpers/s3';

class UserService extends Service<UserInterface> {
  externalServices = { s3 };
  useS3Bucket = false;

  delete(data: string | Partial<UserInterface>) {
    if (this.useS3Bucket) {
      this.findOne(data)
        .then((user) => {
          return this.externalServices.s3.deleteObject(<string>user?.avatar?.split('/')[-1]);
        })
        .then((doc) => {
          logger.info(['deleted', doc]);
        })
        .catch((error) => {
          throw error;
        });
    }
    return this.repository.delete(data);
  }
}

export default new UserService(UserRepository);
