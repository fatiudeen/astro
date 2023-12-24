import { LikeInterface } from '@interfaces/Like.Interface';
import Like from '@models/Like';
import Repository from '@repositories/repository';

export default class LikeRepository extends Repository<LikeInterface> {
  protected model = Like;
}
