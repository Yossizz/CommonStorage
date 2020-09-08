import { Router } from 'express';
import { container } from 'tsyringe';
import { validate } from 'openapi-validator-middleware';
import { GetController } from '../controllers/get';

const getRouter = Router();
const controller = container.resolve(GetController);

getRouter.get('/', validate, controller.get.bind(controller));

export { getRouter };
