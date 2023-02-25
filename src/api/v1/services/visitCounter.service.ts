import { VisitCounterInterface } from '@interfaces/VisitCounter.Interface';
import visitCounterRepository from '@repositories/visitCounter.repository';
import Service from '@services/service';
// import { logger } from '@utils/logger';

class VisitCounter extends Service<VisitCounterInterface> {
  externalServices = null;
}

export default new VisitCounter(visitCounterRepository);
