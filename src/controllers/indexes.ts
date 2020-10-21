import { NextFunction, Request, Response } from 'express';
import httpStatus from 'http-status-codes';
import { injectable, inject, delay } from 'tsyringe';
import { ApiResponse } from '@elastic/elasticsearch';
import { get } from 'config';
import { MCLogger } from '@map-colonies/mc-logger';
import client from '../elasticClient';

interface IElasticRequestConfig {
  from: number;
  size: number;
}

@injectable()
export class IndexesController {
  private elasticRequestCfg: IElasticRequestConfig;

  public constructor(
    @inject(delay(() => MCLogger)) private readonly logger: MCLogger
  ) {
    this.elasticRequestCfg = get('elasticRequest');
  }

  public async getAll(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<Response | void> {
    try {
      const indexes: ApiResponse = await client.indices.get({
        index: '_all',
      });
      return res.status(httpStatus.OK).json(indexes.body);
    } catch (err) {
      return next(err);
    }
  }

  public async getOne(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<Response | void> {
    try {
      const { name } = req.params;
      const index: ApiResponse = await client.indices.get({
        index: name,
      });

      return res.status(httpStatus.OK).json(index.body);
    } catch (err) {
      return next(err);
    }
  }

  public async create(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<Response | void> {
    try {
      const { index } = req.body;
      const newIndex: ApiResponse = await client.indices.create({ index });
      this.logger.info(`Index ${index} was created`);
      return res.status(httpStatus.OK).json(newIndex);
    } catch (err) {
      return next(err);
    }
  }

  public async delete(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<Response | void> {
    try {
      const { name } = req.params;
      const deletedIndex: ApiResponse = await client.indices.delete({
        index: name,
      });
      this.logger.info(`Index ${name} was deleted`);
      return res.status(httpStatus.OK).json(deletedIndex);
    } catch (err) {
      return next(err);
    }
  }

  public async getDoucmentById(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<Response | void> {
    try {
      const { documentId, name } = req.params;
      const document = await client.get({ index: name, id: documentId });
      return res.status(httpStatus.OK).json(document);
    } catch (err) {
      return next(err);
    }
  }

  public async deleteDocument(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<Response | void> {
    try {
      const { name, documentId }: any = req.params;
      const deletedDocument = await client.delete({
        index: name,
        id: documentId,
      });
      this.logger.info(
        `Doucment ID ${documentId} from index ${name} was deleted`
      );
      return res.status(httpStatus.OK).json(deletedDocument);
    } catch (err) {
      return next(err);
    }
  }

  public async searchDocument(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<Response | void> {
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
      return next(err);
    }
  }

  public async createOrUpdateDocument(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<Response | void> {
    try {
      const { name } = req.params;
      const query = req.query;
      const { params } = req.body;
      const searchResults: ApiResponse = await this.innerSearchDoc(name, query);

      let objectRetrurned = null;
      if (searchResults.body.hits.hits.length) {
        // we found hits. need to update
        objectRetrurned = await this.innerUpdateByQuery(
          name,
          req.query,
          params
        );
        this.logger.info(`Document(s) was updated in index ${name}`);
      } else {
        // create
        objectRetrurned = await this.innerCreateDoc(name, params);
        this.logger.info(`Doucment(s) was created in index ${name}`);
      }

      return res.status(httpStatus.OK).json(objectRetrurned);
    } catch (err) {
      return next(err);
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

  private async innerCreateDoc(
    index: string,
    body: object
  ): Promise<ApiResponse> {
    return await client.index({ index, body });
  }

  private async innerSearchDoc(
    index: string,
    reqQuery: any
  ): Promise<ApiResponse> {

    let { from, size, ...restParams } = reqQuery;
    from = Number(from) >= 0 ? Math.round(Number(from)) : this.elasticRequestCfg.from;
    size = size > 0 ? Math.min(Number(size), this.elasticRequestCfg.size)
                    : this.elasticRequestCfg.size;    

    const elasticQuery = this.buildElasticQuery(restParams);
    return await client.search({
      index,
      body: {
        query: elasticQuery,
      },
      from,
      size,
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
