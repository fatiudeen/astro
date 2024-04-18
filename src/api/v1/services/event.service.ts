import { EventInterface } from '@interfaces/Event.Interface';
import EventRepository from '@repositories/Event.repository';
import Service from '@services/service';
// import SubscriptionService from '@services/subscription.service';

class EventService extends Service<EventInterface, EventRepository> {
  protected repository = new EventRepository();
  // private readonly _subscriptionService = Service.instance(SubscriptionService);

  PaginatedFind(
    query: Partial<EventInterface>,
    sort: any,
    startIndex: number,
    limit: number,
  ): Promise<DocType<EventInterface>[]> {
    return this.repository.PaginatedFind(query, sort, startIndex, limit);
  }

  findOne(query: string | Partial<EventInterface>): Promise<DocType<EventInterface> | null> {
    return this.repository.findOne(query);
  }
}

export default EventService;
