/* eslint-disable import/no-unresolved */
import SubscriptionController from '@controllers/subscription.controller';
import { subscriptionRequestDTO } from '@dtos/subscription.dto';
import Route from '@routes/route';
import { SubscriptionInterface } from '@interfaces/Subscription.Interface';

class SubscriptionRoute extends Route<SubscriptionInterface> {
  controller = new SubscriptionController('subscription');
  dto = subscriptionRequestDTO;
  initRoutes() {
    this.router.route('/:userId/subscribers').get(this.validator(this.dto.id), this.controller.subscribers);
    this.router.route('/subscribers').get(this.controller.subscribers);
    this.router.route('/subscribed').get(this.controller.subscribed);
    this.router.route('/:userId/subscribed').get(this.validator(this.dto.id), this.controller.subscribed);
    this.router.route('/:userId/subscribe').put(this.validator(this.dto.id), this.controller.toggle);

    return this.router;
  }
}
export default SubscriptionRoute;
