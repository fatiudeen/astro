/* eslint-disable import/no-unresolved */
import UserController from '@controllers/user.controller';
import { userRequestDTO } from '@dtos/user.dto';
import Route from '@routes/route';
import { UserInterface } from '@interfaces/User.Interface';

class UserRoute extends Route<UserInterface> {
  controller = new UserController('user');
  dto = userRequestDTO;
  initRoutes() {
    this.router.get('/', this.controller.get);
    this.router
      .route('/me')
      .get(this.controller.getOne)
      .put(
        this.fileProcessor.uploadOne<UserInterface>('avatar'),
        this.validator(this.dto.update),
        this.controller.update,
      )
      .delete(this.controller.delete);
    this.router
      .route('/:userId')
      .get(this.validator(this.dto.id), this.controller.getOne)
      .put(
        this.fileProcessor.uploadOne<UserInterface>('avatar'),
        this.validator(this.dto.update.concat(this.dto.id)),
        this.controller.update,
      )
      .delete(this.validator(this.dto.id), this.controller.delete);

    return this.router;
  }
}
export default UserRoute;
