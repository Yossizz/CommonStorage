import { Request, Response } from 'express';
import httpStatus from 'http-status-codes';
import { injectable } from 'tsyringe';
import { ApiResponse } from '@elastic/elasticsearch';
import { get } from 'config';
import client from '../elasticClient';

interface IELasticRequest {
  from?: number;
  size?: number;
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
      const searchResults: ApiResponse = await this.innerSearchDoc(
        name,
        req.query
      );

      // Return a prettier JSON result
      const items = searchResults.body.hits.hits.map((res: any) => {
        return {
          index: res.index,
          _id: res._id,
          ...res._source,
        };
      });

      return res.status(httpStatus.OK).json(items);
    } catch (err) {
      const errorSimplified = this.buildErrorMessage(err);
      return res.status(errorSimplified.status).json(errorSimplified);
    }
  }

  public async createOrUpdateDocument(
    req: Request,
    res: Response
  ): Promise<Response> {
    try {
      const { name } = req.params;
      const query = req.query;
      const { params } = req.body;
      const searchResults = await this.innerSearchDoc(name, query);

      let objectRetrurned = null;
      if (searchResults.body.hits.hits.length) {
        // we found hits. need to update
        objectRetrurned = await this.innerUpdateByQuery(name, req.query, params);
      } else {
        // create
        objectRetrurned = await this.innerCreateDoc(name, params);
      }

      return res.status(httpStatus.OK).json(objectRetrurned);
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

  private async innerCreateDoc(index: string, body: object ) : Promise<ApiResponse> {
    return await client.index({ index, body });
  }

  private async innerSearchDoc(index: string, q: IELasticRequest): Promise<ApiResponse> {
   const from = Number(q.from) || elasticRequest.from;
   const size = Number(q.size) || elasticRequest.size;
    
   delete q.size;
   delete q.from;

    const elasticQuery = this.buildElasticQuery(q);
    return await client.search({
      index,
      body: {
        query: elasticQuery,
      },
      from,
      size
    });
  }

  private async innerUpdateByQuery(
    index: string,
    q: object,
    params: object
  ): Promise<ApiResponse> {
    const elasticQuery = this.buildElasticQuery(q);
    const source = this.buildElasticSource(params);

    return await client.updateByQuery({
      index,
      body: {
        query: elasticQuery,
        script: {
          lang: 'painless',
          source,
          params,
        },
      },
    });
  }
}
