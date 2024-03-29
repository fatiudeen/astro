/* eslint-disable no-underscore-dangle */
import HttpError from '@helpers/HttpError';
import { FollowInterface } from '@interfaces/Follow.Interface';
import FollowRepository from '@repositories/Follow.repository';
import Service from '@services/service';
import UserService from '@services/user.service';

class FollowService extends Service<FollowInterface, FollowRepository> {
  protected repository = new FollowRepository();
  private readonly _userService = Service.instance(UserService);

  toggle(userId: string, follow: string) {
    return new Promise<DocType<FollowInterface>>((resolve, reject) => {
      this._userService()
        .findOne(follow)
        .then((user) => {
          if (!user) reject(new HttpError('invalid user', 404));
          return this.findOne({ userId, followed: follow });
        })
        .then((_follow) => {
          if (!_follow) return this.create({ userId, followed: follow });
          return this.delete(_follow._id);
        })
        .then((data) => {
          resolve(data!);
        })
        .catch((error) => reject(error));
    });
  }

  getFollowedUsers = async (userId: string) => {
    return (await this.find({ userId })).map((v) => (<any>v.followed)._id.toString());
  };
}

export default FollowService;
