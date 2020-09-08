import { Router } from 'express';
import { getRouter } from './get';
import { swaggerRouter } from './swagger';

const globalRouter = Router();
globalRouter.use(swaggerRouter);
globalRouter.use('/indexes', getRouter);

export { globalRouter };
