import HttpError from '@helpers/HttpError';
import { SubscriptionInterface } from '@interfaces/Subscription.Interface';
import SubscriptionRepository from '@repositories/Subscription.repository';
import Service from '@services/service';
import UserService from '@services/user.service';
import EventService from '@services/event.service';

class SubscriptionService extends Service<SubscriptionInterface, SubscriptionRepository> {
  protected repository = new SubscriptionRepository();
  private readonly _userService = Service.instance(UserService);
  private readonly _eventService = Service.instance(EventService);

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

  // TODO: untested
  toggleEvent(userId: string, eventId: string) {
    return new Promise<DocType<SubscriptionInterface>>((resolve, reject) => {
      this._eventService()
        .findOne(eventId)
        .then((event) => {
          if (!event) reject(new HttpError('invalid event', 404));
          return this.findOne({ userId, eventId });
        })
        .then((_event) => {
          if (!_event) return this.create({ userId, eventId });
          return this.delete(_event._id);
        })
        .then((data) => {
          resolve(data!);
        })
        .catch((error) => reject(error));
    });
  }

  getSubscribedUsers = async (userId: string) => {
    return (await this.find({ userId })).map((v) => (<any>v.subscribed)._id.toString());
  };
}

export default SubscriptionService;
