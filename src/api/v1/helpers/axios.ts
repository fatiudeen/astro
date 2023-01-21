/* eslint-disable no-underscore-dangle */
import axios, { AxiosError } from 'axios';
import { logger } from '@utils/logger';

type Method = 'get' | 'post' | 'put' | 'patch' | 'delete';

class HttpServiceAdapter {
  private static _instance: HttpServiceAdapter;
  // eslint-disable-next-line no-useless-constructor, no-empty-function
  private constructor() {}

  private serviceAdapter = (baseURL: string) => {
    return axios.create({
      baseURL,
    });
  };

  public async baseService(baseUrl: string, method: Method, url: string, _data?: object) {
    try {
      const { data } = await this.serviceAdapter(baseUrl)[method](url, _data);
      let result;
      // fixed data.data issue
      if (data.data) {
        result = data.data;
      } else result = data;
      return result;
    } catch (error) {
      const e = this.errorHandler(error);
      throw e;
    }
  }

  private errorHandler(error: AxiosError | any) {
    let err!: string;
    if (error instanceof AxiosError) {
      if (error.message) {
        err = error.message;
      } else if (error.response) {
        if (typeof error.response.data === 'object') {
          const message = <any>error.response.data;
          err = message.message;
        } else err = <string>error.response.data;
      } else if (error.request) {
        if (typeof error.request.data === 'object') {
          const message = <any>error.request.data;
          err = message.message;
        } else err = <string>error.request.data;
      }
    } else err = error;
    logger.error(['axios error::::', err]);
    return err;
  }

  static instance() {
    if (HttpServiceAdapter._instance) {
      return HttpServiceAdapter._instance;
    }
    HttpServiceAdapter._instance = new HttpServiceAdapter();
    return HttpServiceAdapter._instance;
  }
}
export default HttpServiceAdapter.instance().baseService;
