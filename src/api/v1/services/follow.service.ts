import { FollowInterface } from '@interfaces/Follow.Interface';
import FollowRepository from '@repositories/Follow.repository';
import Service from '@services/service';

class FollowService extends Service<FollowInterface, FollowRepository> {
  protected repository = new FollowRepository();
}

export default FollowService;
