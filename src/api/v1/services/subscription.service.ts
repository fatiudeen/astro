import HttpError from '@helpers/HttpError';
import { SubscriptionInterface } from '@interfaces/Subscription.Interface';
import SubscriptionRepository from '@repositories/Subscription.repository';
import Service from '@services/service';
import UserService from '@services/user.service';

class SubscriptionService extends Service<SubscriptionInterface, SubscriptionRepository> {
  protected repository = new SubscriptionRepository();
  private readonly _userService = Service.instance(UserService);

  toggle(userId: string, subscribe: string) {
    return new Promise<DocType<SubscriptionInterface>>((resolve, reject) => {
      this._userService()
        .findOne(subscribe)
        .then((user) => {
          if (!user) reject(new HttpError('invalid user', 404));
          return this.findOne({ userId, subscribed: subscribe });
        })
        .then((_subscribe) => {
          if (!_subscribe) return this.create({ userId, subscribed: subscribe });
          return this.delete(_subscribe._id);
        })
        .then((data) => {
          resolve(data!);
        })
        .catch((error) => reject(error));
    });
  }

  async getSubscribedUsers(userId: string) {
    return (await this.find({ userId })).map((v) => (<any>v.subscribed)._id.toString());
  }
}

export default SubscriptionService;
