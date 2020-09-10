import { Request, Response } from 'express';
import httpStatus from 'http-status-codes';
import { injectable } from 'tsyringe';
import client from '../elasticClient';
import { ApiResponse } from '@elastic/elasticsearch';

@injectable()
export class IndexesController {

  private errorMessage(errorObject: any): any {
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
      const errorSimplified = this.errorMessage(err);
      return res.status(errorSimplified.status)
        .json(errorSimplified);
    }
  }

  public async getOne(req: Request, res: Response): Promise<Response> {
    try {
      const { name }: any = req.params;
      const indexes: ApiResponse = await client.indices.get({ index: name });
      return res.status(httpStatus.OK).json({ indexes });
    } catch (err) {
      const errorSimplified = this.errorMessage(err);
      return res.status(errorSimplified.status)
        .json(errorSimplified);
    }
  }

  public async create(req: Request, res: Response): Promise<Response> {
    try {
      const index: string = req.body.index;
      const newIndex: ApiResponse = await client.indices.create({ index });
      return res.status(httpStatus.OK).json({ newIndex });
    } catch (err) {
      const errorSimplified = this.errorMessage(err);
      return res.status(errorSimplified.status)
        .json(errorSimplified);
    }
  }

  public async delete(req: Request, res: Response): Promise<Response> {
    try {
      const { name }: any = req.params;
      const deletedIndex: ApiResponse = await client.indices.delete({ index: name });
      return res.status(httpStatus.OK).json({ deletedIndex });
    } catch (err) {
      const errorSimplified = this.errorMessage(err);
      return res.status(errorSimplified.status)
        .json(errorSimplified);
    }
  }

  public async addDocument(req: Request, res: Response): Promise<Response> {
    try {
      const { name }: any = req.params;
      const body: object = req.body.body;

      const newDocument = await client.index({ index: name, body });
      return res.status(httpStatus.OK).json({ newDocument });
    } catch (err) {
      const errorSimplified = this.errorMessage(err);
      return res.status(errorSimplified.status)
        .json(errorSimplified);
    }
  }

  public async deleteDocument(req: Request, res: Response): Promise<Response> {
    try {
      const { name }: any = req.params;
      const { id }: any = req.body;

      const deletedDocument = await client.delete({ index: name, id });
      return res.status(httpStatus.OK).json({ deletedDocument });
    } catch (err) {
      const errorSimplified = this.errorMessage(err);
      return res.status(errorSimplified.status)
        .json(errorSimplified);
    }
  }

  public async searchDocument(req: Request, res: Response): Promise<Response> {
    try {
      const { name }: any = req.params;
      const match: any = req.query;

      // If no request query, return all documents
      const query : any = Object.keys(match).length ? { match } : { match_all: {} };

      const searchResults: ApiResponse = await client.search({
        index: name, body: {
          query
        },
      });

      return res.status(httpStatus.OK).json({ searchResults });
    } catch (err) {
      const errorSimplified = this.errorMessage(err);
      return res.status(errorSimplified.status)
        .json(errorSimplified);
    }
  }
}
