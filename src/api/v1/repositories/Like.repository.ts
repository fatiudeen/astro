import { LikeInterface } from '@interfaces/Like.Interface';
import Like from '@models/Like';
import Repository from '@repositories/repository';

export default class LikeRepository extends Repository<LikeInterface> {
  protected model = Like;
  PaginatedFind(_query: Partial<LikeInterface>, sort: any, startIndex: number, limit: number) {
    return new Promise<DocType<LikeInterface>[]>((resolve, reject) => {
      const query: Record<string, any> = _query || {};

      const q = this.model
        .find(query)
        .populate('userId', 'username avatar firstName lastName')
        .sort(sort)
        .skip(startIndex)
        .limit(limit);
      q.lean()
        .then((r) => {
          resolve(<DocType<LikeInterface>[]>(<unknown>r));
        })
        .catch((e) => {
          reject(e);
        });
    });
  }
}
