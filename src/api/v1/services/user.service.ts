import { UserInterface } from '@interfaces/User.Interface';
import UserRepository from '@repositories/User.repository';
import Service from '@services/service';
// import { logger } from '@utils/logger';
// import s3 from '@helpers/multer';
// import { OPTIONS } from '@config';
import FollowService from '@services/follow.service';

class UserService extends Service<UserInterface, UserRepository> {
  protected repository = new UserRepository();
  private readonly _followService = Service.instance(FollowService);

  async findOne(query: string | Partial<UserInterface>) {
    const user = await this.repository.findOneWithException(query);
    const [followers, following] = await Promise.all([
      this._followService().count({ followed: user?._id.toString() }),
      this._followService().count({ userId: user?._id.toString() }),
    ]);
    user.followers = followers;
    user.following = following;
    return user;
  }

  async updateFollowStatus(userId: string, user: DocType<UserInterface>) {
    const [iAmFollowing, isFollowingMe] = await Promise.all([
      this._followService().count({ followed: user?._id.toString(), userId }),
      this._followService().count({ userId: user?._id.toString(), followed: userId }),
    ]);

    user.isFollower = !!isFollowingMe;
    user.isFollowing = !!iAmFollowing;
  }
}

export default UserService;
