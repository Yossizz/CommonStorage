import { MCLogger } from '@map-colonies/mc-logger';
import {
  Request,
  Response,
  NextFunction,
  ErrorRequestHandler,
} from 'express';
import { injectable } from 'tsyringe';
import { StatusCodes } from 'http-status-codes';
import { IError } from '../globalModels';

@injectable()
export class ErrorHandler {
  public constructor(private readonly logger: MCLogger) {}

  private buildErrorMessage(elasticErrorObject: any): IError {
    if (
      elasticErrorObject &&
      elasticErrorObject.meta &&
      elasticErrorObject.meta.body
    ) {
      const { body } = elasticErrorObject.meta;
      return {
        status: body.status,
        type: body.error.type,
        reason: body.error.reason,
      };
    } else {
      return {
        status: StatusCodes.INTERNAL_SERVER_ERROR,
        type: 'Internal',
        reason: 'An unknown error occured',
      };
    }
  }

  public getErrorHandlerMiddleware(): ErrorRequestHandler {
    return (
      err: Error,
      req: Request,
      res: Response,
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      next: NextFunction
    ): void => {
      const errorSimplified: IError = this.buildErrorMessage(err);
      this.logger.error(
        `${req.method} request to ${req.originalUrl}  has failed with error: ${err.message}`
      );
      this.logger.error(JSON.stringify(errorSimplified));
      res.status(errorSimplified.status).json(errorSimplified);
    };
  }
}
