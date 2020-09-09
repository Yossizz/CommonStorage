import { Router } from 'express';
import { swaggerRouter } from './swagger';
import * as bodyparser from 'body-parser';
import { indexesRouter } from './indexes';
// import { documentsRouter } from './documents';

const globalRouter = Router();
globalRouter.use(bodyparser.json());

globalRouter.use(swaggerRouter);
globalRouter.use('/indexes', indexesRouter);
// globalRouter.use('/documents', documentsRouter);

export { globalRouter };
