import { Request, Response } from 'express';
import httpStatus from 'http-status-codes';
import { injectable } from 'tsyringe';
import client from '../elasticClient';
import { RequestParams, ApiResponse } from '@elastic/elasticsearch';

@injectable()
export class GetController {
  public async get(req: Request, res: Response): Promise<Response> {
    try {
      const name: string = req.query.name as string;
      const matches: string[] = await this.getDataFromIndex(name);
      return res.status(httpStatus.OK).json({ matches });
    } catch (err) {
      return res.status(httpStatus.BAD_REQUEST)
        .json({ message: 'Could not process the request' });
    }
  }

  /**
   * 
   * @param index The index we search through
   * @param match JSON of pattern to look for
   */
  private async getDataFromIndex(index = ""): Promise<string[]> {
    const params: RequestParams.Search = { index }
    try {
      const res: ApiResponse = await client.search(params);
      return res.body.hits.hits;
    } catch (err) {
      throw err;
    }
  }
}
