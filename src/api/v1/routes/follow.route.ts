/* eslint-disable import/no-unresolved */
import FollowController from '@controllers/follow.controller';
import { followRequestDTO } from '@dtos/follow.dto';
import Route from '@routes/route';
import { FollowInterface } from '@interfaces/Follow.Interface';

class FollowRoute extends Route<FollowInterface> {
  controller = new FollowController('follow');
  dto = followRequestDTO;
  initRoutes() {
    this.router.route('/:userId/followers').get(this.validator(this.dto.id), this.controller.followers);
    this.router.route('/followers').get(this.controller.followers);
    this.router.route('/following').get(this.controller.following);
    this.router.route('/:userId/following').get(this.validator(this.dto.id), this.controller.following);
    this.router.route('/:userId/follow').put(this.validator(this.dto.id), this.controller.toggle);

    return this.router;
  }
}
export default FollowRoute;
