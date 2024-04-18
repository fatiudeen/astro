import { EventInterface } from '@interfaces/Event.Interface';
import Event from '@models/Event';
import Repository from '@repositories/repository';

export default class EventRepository extends Repository<EventInterface> {
  protected model = Event;

  PaginatedFind(_query: Partial<EventInterface>, sort: any, startIndex: number, limit: number) {
    return new Promise<DocType<EventInterface>[]>((resolve, reject) => {
      const query: Record<string, any> = _query || {};

      const q = this.model.find(query).sort(sort).skip(startIndex).limit(limit);
      q.lean()
        .then((r) => {
          resolve(<DocType<EventInterface>[]>(<unknown>r));
        })
        .catch((e) => {
          reject(e);
        });
    });
  }

  findOne(_query: string | Partial<EventInterface>) {
    return new Promise<DocType<EventInterface> | null>((resolve, reject) => {
      const query = _query;
      const q = typeof query === 'object' ? this.model.findOne(query) : this.model.findById(query);
      q.then((r) => {
        if (!r) {
          resolve(null);
        } else resolve(<DocType<EventInterface>>r.toObject());
      }).catch((e) => {
        reject(e);
      });
    });
  }
}
