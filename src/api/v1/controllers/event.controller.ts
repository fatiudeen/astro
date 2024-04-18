/* eslint-disable no-underscore-dangle */
import { Request } from 'express';
import EventService from '@services/event.service';
import { EventInterface } from '@interfaces/Event.Interface';
import Controller from '@controllers/controller';
// import { OPTIONS } from '@config';
// import { eventResponseDTO } from '@dtos/event.dto';

class EventController extends Controller<EventInterface> {
  service = new EventService();
  responseDTO = undefined; // eventResponseDTO.event;

  create = this.control((req: Request) => {
    this.processFile(req, true);
    const data = req.body;
    return this.service.create({ ...data, userId: req.user?._id });
  });
}

export default EventController;
