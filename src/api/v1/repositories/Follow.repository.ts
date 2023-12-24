import { FollowInterface } from '@interfaces/Follow.Interface';
import Follow from '@models/Follow';
import Repository from '@repositories/repository';

export default class FollowRepository extends Repository<FollowInterface> {
  protected model = Follow;
}
