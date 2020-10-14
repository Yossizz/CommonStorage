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
        reason: body.error.reason,
      };
    } else {
      return {
        status: httpStatus.INTERNAL_SERVER_ERROR,
        type: 'Internal',
        reason: 'An unknown error occured',
      };
    }
  }

  public async getAll(req: Request, res: Response): Promise<Response> {
    try {
      const indexes: ApiResponse = await client.indices.get({
        index: '_all',
      });
      return res.status(httpStatus.OK).json(indexes.body);
    } catch (err) {
      const errorSimplified = this.errorMessage(err);
      return res.status(errorSimplified.status).json(errorSimplified);
    }
  }

  public async getOne(req: Request, res: Response): Promise<Response> {
    try {
      const { name }: any = req.params;
      const index: ApiResponse = await client.indices.get({
        index: name,
      });

      return res.status(httpStatus.OK).json(index.body);
    } catch (err) {
      const errorSimplified = this.errorMessage(err);
      return res.status(errorSimplified.status).json(errorSimplified);
    }
  }

  public async create(req: Request, res: Response): Promise<Response> {
    try {
      const index: string = req.body.index;
      const newIndex: ApiResponse = await client.indices.create({ index });
      return res.status(httpStatus.OK).json(newIndex);
    } catch (err) {
      const errorSimplified = this.errorMessage(err);
      return res.status(errorSimplified.status).json(errorSimplified);
    }
  }

  public async delete(req: Request, res: Response): Promise<Response> {
    try {
      const { name }: any = req.params;
      const deletedIndex: ApiResponse = await client.indices.delete({
        index: name,
      });
      return res.status(httpStatus.OK).json(deletedIndex);
    } catch (err) {
      const errorSimplified = this.errorMessage(err);
      return res.status(errorSimplified.status).json(errorSimplified);
    }
  }

  public async addDocument(req: Request, res: Response): Promise<Response> {
    try {
      const { name }: any = req.params;
      const body: object = req.body.body;

      const newDocument = await client.index({ index: name, body });
      return res.status(httpStatus.OK).json(newDocument);
    } catch (err) {
      const errorSimplified = this.errorMessage(err);
      return res.status(errorSimplified.status).json(errorSimplified);
    }
  }

  public async deleteDocument(req: Request, res: Response): Promise<Response> {
    try {
      const { name }: any = req.params;
      const { documentId }: any = req.params;

      const deletedDocument = await client.delete({
        index: name,
        id: documentId,
      });
      return res.status(httpStatus.OK).json(deletedDocument);
    } catch (err) {
      const errorSimplified = this.errorMessage(err);
      return res.status(errorSimplified.status).json(errorSimplified);
    }
  }

  public async searchDocument(req: Request, res: Response): Promise<Response> {
    try {
      const { name }: any = req.params;

      const elasticQuery: object = this.buildElasticQuery(req.query);

      const searchResults: ApiResponse = await client.search({
        index: name,
        body: {
          query: elasticQuery,
        },
      });

      // Return a prettier JSON result
      const items = searchResults.body.hits.hits.map((res: any) => {
        return {
          index: res.index,
          id: res._id,
          ...res._source,
        };
      });

      return res.status(httpStatus.OK).json(items);
    } catch (err) {
      const errorSimplified = this.errorMessage(err);
      return res.status(errorSimplified.status).json(errorSimplified);
    }
  }

  // We get a key:value seearchobject that contains the request parameters
  // and we parser it to elastic typed search object
  // https://stackoverflow.com/questions/39507005/query-with-match-by-multiple-fields
  
  private buildElasticQuery(query: any): object {
    if (Object.keys(query).length) {
      const match: object = Object.keys(query).map((param) => {
        return { match: { [param]: query[param] } };
      });
      return { bool: { must: match } };
    } else {
      // If no query parameter is supplied, return all documents
      return { match_all: {} };
    }
  }
}