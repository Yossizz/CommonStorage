import { Router } from 'express';
import { indexesRouter } from './indexes';
import { swaggerRouter } from './swagger';
import * as bodyparser from 'body-parser';

const globalRouter = Router();
globalRouter.use(bodyparser.json());

globalRouter.use(swaggerRouter);
globalRouter.use('/indexes', indexesRouter);

export { globalRouter };
