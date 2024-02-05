/* eslint-disable no-restricted-syntax */
import { FollowInterface } from '@interfaces/Follow.Interface';
import Follow from '@models/Follow';
import Repository from '@repositories/repository';

export default class FollowRepository extends Repository<FollowInterface> {
  protected model = Follow;
  find(
    _query?:
      | Partial<FollowInterface>
      | Array<string>
      | { [K in keyof DocType<FollowInterface>]?: Array<DocType<FollowInterface>[K]> },
  ) {
    return new Promise<DocType<FollowInterface>[]>((resolve, reject) => {
      let query: Record<string, any> = _query || {};
      // query = this.normalizeId(query);

      if (Array.isArray(_query) && _query.length > 0) {
        query = { _id: { $in: _query.map((val) => val) } };
      } else
        for (const [felid, value] of Object.entries(query)) {
          Array.isArray(value) ? (query[felid] = { $in: value }) : false;
        }

      const q = this.model.find(query).populate('followed', 'username avatar firstName lastName');
      q.lean()
        .then((r) => {
          resolve(<DocType<FollowInterface>[]>(<unknown>r));
        })
        .catch((e) => {
          reject(e);
        });
    });
  }

  PaginatedFind(_query: Partial<FollowInterface>, sort: any, startIndex: number, limit: number) {
    return new Promise<DocType<FollowInterface>[]>((resolve, reject) => {
      const query: Record<string, any> = _query || {};
      const populateQuery = Object.keys(query)[0] === 'userId' ? 'followed' : 'userId';
      const q = this.model
        .find(query)
        .sort(sort)
        .skip(startIndex)
        .limit(limit)
        .populate(populateQuery, 'username avatar firstName lastName');
      q.lean()
        .then((r) => {
          resolve(<DocType<FollowInterface>[]>(<unknown>r.map((v) => v[populateQuery])));
        })
        .catch((e) => {
          reject(e);
        });
    });
  }
}
