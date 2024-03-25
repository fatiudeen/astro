/* eslint-disable consistent-return */
/* eslint-disable no-restricted-syntax */
import { NODE_ENV, ODDS_JAM_API_KEY } from '@config';
import {
  GameOddsAPIParams,
  GameResultAPIParams,
  GameResultAPIResponse,
  GamesAPIParams,
  Leagues,
  MarketsAPIParams,
} from '@interfaces/OddsJam.Interface';
import axios from 'axios';
import mockData from 'src/mock.json';
// import { createURL } from './constants.js';
// import { createUrlWithParams } from './formatParams.js';

const API_ROOT_ENDPOINT = 'https://api-external.oddsjam.com/api/v2/';
export const createURL = (apiKey: string) => (type: any) => `${API_ROOT_ENDPOINT}${type}/?key=${apiKey}&`;

/**
 *
 * @param url Our URL to append parameters to
 * @param params Our object of key value pairs to append as query params - we need some custom logic to in essense "flatten" this
 * if there are array values as URLSearchParams doesn't properly parse array values in objects
 * @returns Ready to go URL
 */
export const createUrlWithParams = (url: string, params: { [s: string]: unknown } | ArrayLike<unknown>) => {
  if (!params) return url;
  let arr: string | any[] | Record<string, string> | URLSearchParams | undefined = [];
  const parametersArray = Object.entries(params);
  for (const [key, val] of parametersArray) {
    if (!Array.isArray(val)) {
      arr.push([key, val]);
    } else {
      const mapped = val.map((v) => [key, v]);
      arr = [...arr, ...mapped];
    }
  }
  const queryParams = new URLSearchParams(arr);
  return url + queryParams;
};

const sendRequest = async (fullURL: string) => {
  try {
    const result = await axios.get(fullURL);
    return result;
  } catch (error) {
    // use mock
    if (NODE_ENV === 'development') {
      if (fullURL.includes('game-odds')) {
        return {
          data: {
            data: mockData.markets,
          },
        };
      }
      throw error;
    } else {
      throw error;
    }
  }
};

const OddsJamClient = (apiKey: string) => {
  const baseUrl = createURL(apiKey);
  // Get Games API Function
  const getGames = async (params: GamesAPIParams) => {
    const gamesURL = baseUrl('games');
    const fullURL = createUrlWithParams(gamesURL, params);
    const res = await sendRequest(fullURL);
    return res.data;
  };
  // Get Leagues API Function
  const getLeagues = async (params: ArrayLike<unknown> | { [s: string]: unknown }): Promise<Leagues> => {
    const leaguesURL = baseUrl('leagues');
    const fullURL = createUrlWithParams(leaguesURL, params);
    const res = await sendRequest(fullURL);
    return res.data;
  };
  // Get Markets API Function
  const getMarkets = async (params: MarketsAPIParams) => {
    const marketsURL = baseUrl('markets');
    const fullURL = createUrlWithParams(marketsURL, params);
    const res = await sendRequest(fullURL);
    return res.data;
  };
  // Get Game Odds API Function
  const getGameOdds = async (params: GameOddsAPIParams) => {
    const gameOddsURL = baseUrl('game-odds');
    const fullURL = createUrlWithParams(gameOddsURL, params);
    const res = await sendRequest(fullURL);
    return res.data;
  };
  // Get Futures API Function
  const getFutures = async (params: ArrayLike<unknown> | { [s: string]: unknown }) => {
    const futuresURL = baseUrl('futures');
    const fullURL = createUrlWithParams(futuresURL, params);
    const res = await sendRequest(fullURL);
    return res.data;
  };
  // Get Future Odds API Function
  const getFutureOdds = async (params: ArrayLike<unknown> | { [s: string]: unknown }) => {
    const futureOddsURL = baseUrl('future-odds');
    const fullURL = createUrlWithParams(futureOddsURL, params);
    const res = await sendRequest(fullURL);
    return res.data;
  };
  // Get Scores API Function
  const getScores = async (params: ArrayLike<unknown> | { [s: string]: unknown }) => {
    const scoresURL = baseUrl('scores');
    const fullURL = createUrlWithParams(scoresURL, params);
    const res = await sendRequest(fullURL);
    return res.data;
  };
  const getGameResult = async (params: GameResultAPIParams): Promise<GameResultAPIResponse> => {
    const gameOddsURL = baseUrl('grader');
    const fullURL = createUrlWithParams(gameOddsURL, params);
    const res = await sendRequest(fullURL);
    return res.data;
  };

  return {
    getGames,
    getLeagues,
    getMarkets,
    getGameOdds,
    getFutures,
    getFutureOdds,
    getScores,
    getGameResult,
  };
};
export default OddsJamClient(ODDS_JAM_API_KEY);
