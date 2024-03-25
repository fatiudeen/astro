/* eslint-disable no-restricted-syntax */
/* eslint-disable no-underscore-dangle */
import { Request } from 'express';
import BetSlipService from '@services/betSlip.service';
import { BetSlipInterface } from '@interfaces/BetSlip.Interface';
import Controller from '@controllers/controller';
import toBase64 from '@utils/toBase64';
import calculateCumulativeOdds from '@utils/calculateCumulativeOdds';
// import { BetSlipResponseDTO } from '@dtos/betSlip.dto';

class BetSlipController extends Controller<BetSlipInterface> {
  service = new BetSlipService();
  responseDTO = undefined; // BetSlipResponseDTO.BetSlip;
  getOne = this.control(async (req: Request) => {
    const result = await this.service.findOne(req.params[this.resourceId]);
    if (!result) throw new this.HttpError(`${this.resource} not found`, 404);
    return result;
  });

  get = this.control(async (req: Request) => {
    const query = this.safeQuery(req);
    const params = { userId: req.user?._id };
    if (query.outcome) {
      Object.assign(params, query.outcome);
    }

    const result = await this.paginate(req, this.service, params);
    if (!result) throw new this.HttpError(`${this.resource} not found`, 404);
    return result;
  });

  // eslint-disable-next-line no-unused-vars
  sports = this.control((_req: Request) => {
    const result = this.service.sports();
    return result as unknown as Promise<any>;
  });

  // eslint-disable-next-line no-unused-vars
  sportsBook = this.control((_req: Request) => {
    const result = this.service.sportsBook();
    return result as unknown as Promise<any>;
  });

  leagues = this.control(async (req: Request) => {
    const result = await this.service.leagues(req.query.sport as any);
    if (!result) throw new this.HttpError(`${this.resource} not found`, 404);
    return result;
  });

  games = this.control(async (req: Request) => {
    const q = this.safeQuery(req);
    const result = await this.service.games(q.sport, q.league);
    return result;
  });

  markets = this.control(async (req: Request) => {
    const q = this.safeQuery(req);
    const result = await this.service.market(req.params.gameId, q.sportsBook, !!q.isLive, +q.page || 1);
    return result;
  });

  odds = this.control(async (req: Request) => {
    const q = this.safeQuery(req);
    const result = await this.service.odds(q.sportsBook, req.params.gameId);
    return result;
  });

  create = this.control(async (req: Request) => {
    const { games: _games, stake }: { games: Array<string>; stake: number } = req.body;
    const userId = req.user?._id;

    // const games = _games.map((game) => {

    const games: Array<any> = [];
    const odds: Array<number> = [];

    for await (const game of _games) {
      const _game = await this.service.QueryGameWithMarketId(game);
      odds.push((_games as any).price);

      games.push({ ..._game, _id: toBase64(game) });
    }
    const totalOdds = calculateCumulativeOdds(odds);
    return this.service.create({ userId, games, stake, totalOdds });
  });

  results = this.control(async (req: Request) => {
    // const q = this.safeQuery(req);
    const result = await this.service.results(req.params.gameId);
    return result;
  });
}

export default BetSlipController;
