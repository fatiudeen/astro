/* eslint-disable no-underscore-dangle */
import { Request } from 'express';
import SubscriptionService from '@services/subscription.service';
import { SubscriptionInterface } from '@interfaces/Subscription.Interface';
import Controller from '@controllers/controller';
// import { OPTIONS } from '@config';
// import { subscriptionResponseDTO } from '@dtos/subscription.dto';

class SubscriptionController extends Controller<SubscriptionInterface> {
  service = new SubscriptionService();
  responseDTO = undefined; // subscriptionResponseDTO.subscription;
  toggle = this.control(async (req: Request) => {
    const result = req.params.userId
      ? await this.service.toggle(req.user?._id!, req.params.userId)
      : await this.service.toggleEvent(req.user?._id!, req.params.eventId);
    return result;
  });
  subscribers = this.control(async (req: Request) => {
    const params = { subscribed: req.params.userId || req.user?._id! };
    const result = await this.paginate(req, this.service, params);
    return result;
  });
  subscribed = this.control(async (req: Request) => {
    const params = { userId: req.params.userId || req.user?._id! };
    const result = await this.paginate(req, this.service, params);
    return result;
  });
}

export default SubscriptionController;
