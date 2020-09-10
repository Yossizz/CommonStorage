import { Request, Response } from 'express';
import httpStatus from 'http-status-codes';
import { injectable } from 'tsyringe';
import client from '../elasticClient';
import { ApiResponse } from '@elastic/elasticsearch';

@injectable()
export class IndexesController {

  private errorMessage(errorObject: any): object {
    if (errorObject.meta.body) {
      const { body } = errorObject.meta;
      return {
        status: body.status,
        type: body.error.type,
        reason: body.error.reason
      }
    }
    else {
      return {
        status: httpStatus.INTERNAL_SERVER_ERROR,
        type: "Internal",
        reason: "An unknown error occured"
      }
    }
  }

  public async getAll(req: Request, res: Response): Promise<Response> {
    try {
      const indexes: ApiResponse = await client.indices.get({ index: '_all' });
      return res.status(httpStatus.OK).json({ indexes });
    } catch (err) {
      return res.status(httpStatus.BAD_REQUEST)
        .json(this.errorMessage(err));
    }
  }

  public async getOne(req: Request, res: Response): Promise<Response> {
    try {
      const { name }: any = req.params;
      const indexes: ApiResponse = await client.indices.get({ index: name });
      return res.status(httpStatus.OK).json({ indexes });
    } catch (err) {
      return res.status(httpStatus.BAD_REQUEST)
        .json(this.errorMessage(err));
    }
  }

  public async create(req: Request, res: Response): Promise<Response> {
    try {
      const index: string = req.body.index;
      const newIndex: ApiResponse = await client.indices.create({ index });
      return res.status(httpStatus.OK).json({ newIndex });
    } catch (err) {
      return res.status(httpStatus.BAD_REQUEST)
        .json(this.errorMessage(err))
    }
  }

  public async delete(req: Request, res: Response): Promise<Response> {
    try {
      const { name }: any = req.params;
      const deletedIndex: ApiResponse = await client.indices.delete({ index: name });
      return res.status(httpStatus.OK).json({ deletedIndex });
    } catch (err) {
      return res.status(httpStatus.BAD_REQUEST)
        .json(this.errorMessage(err))
    }
  }

  public async addDocument(req: Request, res: Response): Promise<Response> {
    try {
      const { name }: any = req.params;
      const body: object = req.body.body;

      const newDocument = await client.index({ index: name, body });
      return res.status(httpStatus.OK).json({ newDocument });
    } catch (err) {
      return res.status(httpStatus.BAD_REQUEST)
        .json(this.errorMessage(err))
    }
  }

  public async deleteDocument(req: Request, res: Response): Promise<Response> {
    try {
      const { name }: any = req.params;
      const { id }: any = req.body;

      const deletedDocument = await client.delete({ index: name, id });
      return res.status(httpStatus.OK).json({ deletedDocument });
    } catch (err) {
      return res.status(httpStatus.BAD_REQUEST)
        .json(this.errorMessage(err))
    }
  }

  public async searchDocument(req: Request, res: Response): Promise<Response> {
    try {
      const { name }: any = req.params;
      const { query: match }: any = req;

      const searchResults: ApiResponse = await client.search({
        index: name, body: {
          query: {
            match
          }
        }
      });


      return res.status(httpStatus.OK).json({ searchResults });
    } catch (err) {
      return res.status(httpStatus.BAD_REQUEST)
        .json(this.errorMessage(err))
    }
  }
}
