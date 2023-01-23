/* eslint-disable import/no-unresolved */
import userController from '@controllers/user.controller';
import userDto from '@dtos/user.dto';
import Route from '@routes/route';
import { UserInterface } from '@interfaces/User.Interface';

class UserRoute extends Route<UserInterface> {
  controller = userController;
  dto = userDto;
  initRoutes() {
    this.router.get('/', this.controller.get);
    this.router
      .route('/me')
      .get(this.controller.getOne)
      .put(
        this.imageProcessor.uploadOne('avatar'),
        this.validator(this.dto.update.concat(this.dto.id)),
        this.controller.update,
      )
      .delete(this.controller.delete);
    this.router
      .route('/:userId')
      .get(this.validator(this.dto.id), this.controller.getOne)
      .put(
        this.imageProcessor.uploadOne('avatar'),
        this.validator(this.dto.update.concat(this.dto.id)),
        this.controller.update,
      )
      .delete(this.validator(this.dto.id), this.controller.delete);

    return this.router;
  }
}

export default new UserRoute();
