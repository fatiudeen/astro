import { LikeInterface } from '@interfaces/Like.Interface';
import LikeRepository from '@repositories/Like.repository';
import Service from '@services/service';

class LikeService extends Service<LikeInterface, LikeRepository> {
  protected repository = new LikeRepository();
}

export default LikeService;
