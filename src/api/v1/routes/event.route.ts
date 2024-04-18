/* eslint-disable import/no-unresolved */
import EventController from '@controllers/event.controller';
import { eventRequestDTO } from '@dtos/event.dto';
import Route from '@routes/route';
import { EventInterface } from '@interfaces/Event.Interface';

class EventRoute extends Route<EventInterface> {
  controller = new EventController('event');
  dto = eventRequestDTO;
  initRoutes() {
    this.router.route('/').get(this.controller.get).post(this.validator(this.dto.create), this.controller.create);
    this.router
      .route('/:eventId')
      .get(this.validator(this.dto.id), this.controller.getOne)
      .put(this.validator(this.dto.update.concat(this.dto.id)), this.controller.update)
      .delete(this.validator(this.dto.id), this.controller.delete);

    return this.router;
  }
}
export default EventRoute;
