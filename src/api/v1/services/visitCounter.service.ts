import { VisitCounterInterface } from '@interfaces/VisitCounter.Interface';
import VisitCounterRepository from '@repositories/visitCounter.repository';
import Service from '@services/service';
// import { logger } from '@utils/logger';

class VisitCounter extends Service<VisitCounterInterface, VisitCounterRepository> {
  protected repository = new VisitCounterRepository();
}

export default VisitCounter;
