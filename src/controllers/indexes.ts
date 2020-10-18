import { Request, Response } from 'express';
import httpStatus from 'http-status-codes';
import { injectable } from 'tsyringe';
import { ApiResponse } from '@elastic/elasticsearch';
import { get } from 'config';
import client from '../elasticClient';

interface IELasticRequest {
  from: number;
  size: number;
}
const elasticRequest: IELasticRequest = get('elasticRequest');

@injectable()
export class IndexesController {
  public async getAll(req: Request, res: Response): Promise<Response> {
    try {
      const indexes: ApiResponse = await client.indices.get({
        index: '_all',
      });
      return res.status(httpStatus.OK).json(indexes.body);
    } catch (err) {
      const errorSimplified = this.buildErrorMessage(err);
      return res.status(errorSimplified.status).json(errorSimplified);
    }
  }

  public async getOne(req: Request, res: Response): Promise<Response> {
    try {
      const { name } = req.params;
      const index: ApiResponse = await client.indices.get({
        index: name,
      });

      return res.status(httpStatus.OK).json(index.body);
    } catch (err) {
      const errorSimplified = this.buildErrorMessage(err);
      return res.status(errorSimplified.status).json(errorSimplified);
    }
  }

  public async create(req: Request, res: Response): Promise<Response> {
    try {
      const { index } = req.body;
      const newIndex: ApiResponse = await client.indices.create({ index });
      return res.status(httpStatus.OK).json(newIndex);
    } catch (err) {
      const errorSimplified = this.buildErrorMessage(err);
      return res.status(errorSimplified.status).json(errorSimplified);
    }
  }

  public async delete(req: Request, res: Response): Promise<Response> {
    try {
      const { name } = req.params;
      const deletedIndex: ApiResponse = await client.indices.delete({
        index: name,
      });
      return res.status(httpStatus.OK).json(deletedIndex);
    } catch (err) {
      const errorSimplified = this.buildErrorMessage(err);
      return res.status(errorSimplified.status).json(errorSimplified);
    }
  }

  public async getDoucmentById(req: Request, res: Response): Promise<Response> {
    try {
      const { documentId, name } = req.params;
      const document = await client.get({ index: name, id: documentId });
      return res.status(httpStatus.OK).json(document);
    } catch (err) {
      const errorSimplified = this.buildErrorMessage(err);
      return res.status(errorSimplified.status).json(errorSimplified);
    }
  }

  public async addDocument(req: Request, res: Response): Promise<Response> {
    try {
      const { name } = req.params;
      const { params } = req.body;

      const newDocument = await client.index({ index: name, body: params });
      return res.status(httpStatus.OK).json(newDocument);
    } catch (err) {
      const errorSimplified = this.buildErrorMessage(err);
      return res.status(errorSimplified.status).json(errorSimplified);
    }
  }

  public async deleteDocument(req: Request, res: Response): Promise<Response> {
    try {
      const { name, documentId }: any = req.params;

      const deletedDocument = await client.delete({
        index: name,
        id: documentId,
      });
      return res.status(httpStatus.OK).json(deletedDocument);
    } catch (err) {
      const errorSimplified = this.buildErrorMessage(err);
      return res.status(errorSimplified.status).json(errorSimplified);
    }
  }

  public async searchDocument(req: Request, res: Response): Promise<Response> {
    try {
      const { name } = req.params;
      
      const from = Number(req.query.from) || elasticRequest.from;
      const size = Number(req.query.size) || elasticRequest.size;

      // Delete [from] and [size] from req.query so we won't search for it in our records
      delete req.query.size;
      delete req.query.from;

      const elasticQuery = this.buildElasticQuery(req.query);

      const searchResults: ApiResponse = await client.search({
        index: name,
        body: {
          query: elasticQuery,
        },
        from,
        size,
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
      const errorSimplified = this.buildErrorMessage(err);
      return res.status(errorSimplified.status).json(errorSimplified);
    }
  }

  public async updateDocument(req: Request, res: Response): Promise<Response> {
    try {
      const { name } = req.params;
      const { params } = req.body;

      const elasticQuery = this.buildElasticQuery(req.query);
      const source = this.buildElasticSource(params);

      const updatedDoc: ApiResponse = await client.updateByQuery({
        index: name,
        body: {
          query: elasticQuery,
          script: {
            lang: 'painless',
            source,
            params,
          },
        },
      });
      return res.send(updatedDoc).status(httpStatus.OK);
    } catch (err) {
      const errorSimplified = this.buildErrorMessage(err);
      return res.status(errorSimplified.status).json(errorSimplified);
    }
  }

  // We get a key:value seearch-object that contains the request parameters
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

  private buildErrorMessage(errorObject: any): any {
    if (errorObject && errorObject.meta && errorObject.meta.body) {
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

  // An elastic 'painless' string that contains the values that we want to replace
  // with the new values
  private buildElasticSource(body: any): string {
    const prefix = 'ctx._source';
    let source = '';

    for (let key of Object.keys(body)) {
      source += prefix + '.' + key + '=params.' + key + ';';
    }
    return source;
  }
}
