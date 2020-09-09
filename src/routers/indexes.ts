import { Router } from 'express';
import { container } from 'tsyringe';
import { validate } from 'openapi-validator-middleware';
import { IndexesController } from '../controllers/indexes';

const indexesRouter = Router();
const controller = container.resolve(IndexesController);

indexesRouter.get('/', validate, controller.get.bind(controller));
indexesRouter.post('/', validate, controller.insert.bind(controller));
indexesRouter.delete('/', validate, controller.delete.bind(controller));

export { indexesRouter };
