/* eslint-disable no-underscore-dangle */
import dayjs from 'dayjs';
import { Request, Response, NextFunction } from 'express';
import { v4 as uuid4 } from 'uuid';
import visitCounterService from '@services/visitCounter.service';

export default () => async (req: Request, res: Response, next: NextFunction) => {
  if (!(<any>req.session).token || ((<any>req.session).userId && !(<any>req.session).registered)) {
    (<any>req.session).token = uuid4();
    req.session.save();

    const visit = await visitCounterService.findOne({ date: dayjs().format('YYYY-MM-DD') });
    if (visit) {
      let registered = 0;
      let unregistered = 0;
      if ((<any>req.session).userId && !(<any>req.session).registered) {
        registered = 1;
        (<any>req.session).registered = true;
      } else unregistered = 1;
      await visitCounterService.increment(visit._id, <any>{
        unregistered,
        registered,
      });
    } else {
      await visitCounterService.create({
        date: dayjs().format('YYYY-MM-DD'),
        unregistered: 1,
        registered: 0,
      });
    }
  }

  next();
};
