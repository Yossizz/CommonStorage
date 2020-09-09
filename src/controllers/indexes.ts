import { Request, Response } from 'express';
import httpStatus from 'http-status-codes';
import { injectable } from 'tsyringe';
import client from '../elasticClient';
import { RequestParams, ApiResponse } from '@elastic/elasticsearch';

@injectable()
export class IndexesController {
  public async getAll(req: Request, res: Response): Promise<Response> {
    try {
      const indexes: ApiResponse = await client.indices.get({ index: '_all' });
      return res.status(httpStatus.OK).json({ indexes });
    } catch (err) {
      return res.status(httpStatus.BAD_REQUEST)
        .json({ message: 'Could not get all index' });
    }
  }

  public async getOne(req: Request, res: Response): Promise<Response> {
    try {
      const { name }: any = req.params;
      const indexes: ApiResponse = await client.indices.get({ index: name });
      return res.status(httpStatus.OK).json({ indexes });
    } catch (err) {
      return res.status(httpStatus.BAD_REQUEST)
        .json({ message: 'Could not get the specific index' });
    }
  }

  public async create(req: Request, res: Response): Promise<Response> {
    try {
      const index: string = req.body.index;
      const newIndex: ApiResponse = await client.indices.create({ index });
      return res.status(httpStatus.OK).json({ newIndex });
    } catch (err) {
      console.log(err);
      return res.status(httpStatus.BAD_REQUEST)
        .json({ message: 'Could not create index' })
    }
  }

  public async delete(req: Request, res: Response): Promise<Response> {
    try {
      const { name }: any = req.params;
      const deletedIndex: ApiResponse = await client.indices.delete({ index: name });
      return res.status(httpStatus.OK).json({ deletedIndex });
    } catch (err) {
      return res.status(httpStatus.BAD_REQUEST)
        .json({ message: 'Could not delete index' })
    }
  }
}
