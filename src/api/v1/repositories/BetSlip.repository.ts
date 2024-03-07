import { BetSlipInterface } from '@interfaces/BetSlip.Interface';
import BetSlip from '@models/BetSlip';
import Repository from '@repositories/repository';

export default class BetSlipRepository extends Repository<BetSlipInterface> {
  protected model = BetSlip;
}
