import { SubscriptionInterface } from '@interfaces/Subscription.Interface';
import Subscription from '@models/Subscription';
import Repository from '@repositories/repository';

export default class SubscriptionRepository extends Repository<SubscriptionInterface> {
  protected model = Subscription;
}
