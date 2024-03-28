/* eslint-disable import/no-unresolved */
import BetSlipController from '@controllers/betSlip.controller';
import { betSlipRequestDTO } from '@dtos/betSlip.dto';
import Route from '@routes/route';
import { BetSlipInterface } from '@interfaces/BetSlip.Interface';

export default class BetSlipRoute extends Route<BetSlipInterface> {
  controller = new BetSlipController('betSlip');
  dto = betSlipRequestDTO;
  initRoutes() {
    this.router.route('/').get(this.controller.get).post(this.validator(this.dto.create), this.controller.create);
    this.router.route('/:betSlipId').get(this.controller.getOne);
    this.router.route('/sports').get(this.controller.sports);
    this.router.route('/leagues').get(this.controller.leagues);
    this.router.route('/games').get(this.controller.games);
    this.router.route('/markets/:gameId').get(this.controller.markets);
    this.router.route('/sportsBook').get(this.controller.sportsBook);
    this.router.route('/games/:gameId').get(this.controller.odds);
    this.router.route('/results/:gameId').get(this.controller.results);
    // this.router.route('/odds').get(this.controller.odds);
    // this.router
    //   .route('/bank')
    //   .get(this.controller.getBank)
    //   .post(this.validator(this.dto.addBank), this.controller.addBank);
    // this.router.route('/bank/:accountId').delete(this.validator(this.dto.removeBank), this.controller.removeBank);
    // this.router
    //   .route('/bank/confirm')
    // .post(this.validator(this.dto.confirmAccount), this.controller.resolveAccountNumber);
    // this.router.route('/withdraw').post(this.validator(this.dto.withdraw), this.controller.withdraw);
    this.router.route('/:betSlipId').get(this.controller.getOne);

    return this.router;
  }
}
