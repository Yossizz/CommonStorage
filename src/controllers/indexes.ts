import { Request, Response } from 'express';
import httpStatus from 'http-status-codes';
import { injectable } from 'tsyringe';
import client from '../elasticClient';
import { RequestParams, ApiResponse } from '@elastic/elasticsearch';

@injectable()
export class IndexesController {
  public async get(req: Request, res: Response): Promise<Response> {
    try {
      const { name }: any = req.query;
      const indexes: ApiResponse = await client.indices.get({ index: name || '*', pretty: true });
      return res.status(httpStatus.OK).json({ indexes });
    } catch (err) {
      return res.status(httpStatus.BAD_REQUEST)
        .json({ message: 'Could not get the index' });
    }
  }

  public async insert(req: Request, res: Response): Promise<Response> {
    try {
      const index: string = req.body.index;
      const newIndex: ApiResponse = await client.indices.create({ index });
      return res.status(httpStatus.OK).json({ newIndex });
    } catch (err) {
      return res.status(httpStatus.BAD_REQUEST)
        .json({ message: 'Could not create index' })
    }
  }

  public async delete(req: Request, res: Response): Promise<Response> {
    try {
      const index: string = req.body.index;
      const deletedIndex: ApiResponse = await client.indices.delete({ index });
      return res.status(httpStatus.OK).json({ deletedIndex });
    } catch (err) {
      return res.status(httpStatus.BAD_REQUEST)
        .json({ message: 'Could not delete index' })
    }
  }
}
