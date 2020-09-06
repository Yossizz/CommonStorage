import { Request, Response } from 'express';
import httpStatus from 'http-status-codes';
import { injectable } from 'tsyringe';

@injectable()
export class HelloWorldController {
  public get(req: Request, res: Response): Response {
    return res.status(httpStatus.OK).json({ hello: 'world' });
  }
}
