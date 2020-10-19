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

indexesRouter.get('/:name/document/:documentId', validate, controller.getDoucmentById.bind(controller));
indexesRouter.delete('/:name/document/:documentId', validate, controller.deleteDocument.bind(controller));
// TODO: add validator. Issue at: https://github.com/PayU/openapi-validator-middleware/issues/140
indexesRouter.get('/:name/document', controller.searchDocument.bind(controller));
indexesRouter.post('/:name/document', controller.createOrUpdateDocument.bind(controller));

export { indexesRouter };
