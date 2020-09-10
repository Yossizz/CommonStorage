import { Router } from 'express';
import { container } from 'tsyringe';
import { validate } from 'openapi-validator-middleware';
import { IndexesController } from '../controllers/indexes';

const indexesRouter = Router();
const controller = container.resolve(IndexesController);

indexesRouter.get('/', validate, controller.getAll.bind(controller));
indexesRouter.get('/:name', validate, controller.getOne.bind(controller));
indexesRouter.post('/', validate, controller.create.bind(controller));
indexesRouter.delete('/:name', validate, controller.delete.bind(controller));

indexesRouter.post('/:name/document', validate, controller.addDocument.bind(controller));
indexesRouter.delete('/:name/document/:id', validate, controller.delete.bind(controller));
indexesRouter.get('/:name/document', validate, controller.searchDocument.bind(controller));

export { indexesRouter };
