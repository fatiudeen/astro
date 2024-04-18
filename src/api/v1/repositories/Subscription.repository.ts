/* eslint-disable no-restricted-syntax */
import { SubscriptionInterface } from '@interfaces/Subscription.Interface';
import Subscription from '@models/Subscription';
import Repository from '@repositories/repository';

export default class SubscriptionRepository extends Repository<SubscriptionInterface> {
  protected model = Subscription;
  find(
    _query?:
      | Partial<SubscriptionInterface>
      | Array<string>
      | { [K in keyof DocType<SubscriptionInterface>]?: Array<DocType<SubscriptionInterface>[K]> },
  ) {
    return new Promise<DocType<SubscriptionInterface>[]>((resolve, reject) => {
      let query: Record<string, any> = _query || {};
      // query = this.normalizeId(query);

      if (Array.isArray(_query) && _query.length > 0) {
        query = { _id: { $in: _query.map((val) => val) } };
      } else
        for (const [felid, value] of Object.entries(query)) {
          Array.isArray(value) ? (query[felid] = { $in: value }) : false;
        }

      const q = this.model.find(query).populate('subscribed', 'username avatar firstName lastName');
      q.lean()
        .then((r) => {
          resolve(<DocType<SubscriptionInterface>[]>(<unknown>r));
        })
        .catch((e) => {
          reject(e);
        });
    });
  }

  PaginatedFind(_query: Partial<SubscriptionInterface>, sort: any, startIndex: number, limit: number) {
    return new Promise<DocType<SubscriptionInterface>[]>((resolve, reject) => {
      const query: Record<string, any> = _query || {};
      const populateQuery = Object.keys(query)[0] === 'userId' ? 'subscribed' : 'userId';
      const q = this.model.find(query).sort(sort).skip(startIndex).limit(limit);

      q.populate(populateQuery, 'username avatar firstName lastName');
      if (populateQuery === 'subscribed') {
        q.populate('eventId', 'name price description expires');
        // userId: string | Types.ObjectId;
      }
      q.lean()
        .then((r) => {
          resolve(
            <DocType<SubscriptionInterface>[]>(<unknown>r.map((v) => {
              return v.eventId
                ? { ...(v.eventId as object), type: 'event' }
                : { ...(v[populateQuery] as object), type: 'user' };
            })),
          );
        })
        .catch((e) => {
          reject(e);
        });
    });
  }
}
