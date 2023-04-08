import VisitCounter from '@models/VisitCounter';
import Repository from '@repositories/repository';
import { VisitCounterInterface } from '@interfaces/VisitCounter.Interface';

class VisitCounterRepository extends Repository<VisitCounterInterface> {
  protected model = VisitCounter;
}

export default VisitCounterRepository;
