import { Router } from 'express';
import multer from 'multer';
import multerConfig from './config/multer';

import UserController from './app/controllers/UserController';
import SessionController from './app/controllers/SessionController';
import RecipientController from './app/controllers/RecipientController';
import ProblemController from './app/controllers/ProblemController';
import DeliverymanController from './app/controllers/DeliverymanController';
import DeliveryController from './app/controllers/DeliveryController';
import DeliverymanDeliveriesController from './app/controllers/DeliverymanDeliveriesController';
import FileController from './app/controllers/FileController';

import authMiddleware from './app/middlewares/auth';

const upload = multer(multerConfig);

const routes = new Router();

routes.post('/sessions', SessionController.store);
routes.post('/users', UserController.store);

routes.use(authMiddleware);

routes.put('/users', UserController.update);

routes.get('/recipients', RecipientController.index);
routes.get('/recipients/:id', RecipientController.show);
routes.post('/recipients', RecipientController.store);
routes.put('/recipients/:id', RecipientController.update);
routes.delete('/recipients/:id', RecipientController.destroy);

routes.get('/deliverymans', DeliverymanController.index);
routes.get('/deliverymans/:id', DeliverymanController.show);
routes.post('/deliverymans', DeliverymanController.store);
routes.put('/deliverymans/:id', DeliverymanController.update);
routes.delete('/deliverymans/:id', DeliverymanController.destroy);

routes.get(
  '/deliveryman/:deliverymanId/deliveries',
  DeliverymanDeliveriesController.index
);
routes.put(
  '/deliveryman/:deliverymanId/deliveries/:deliveryId',
  DeliverymanDeliveriesController.update
);

routes.get('/deliveries', DeliveryController.index);
routes.get('/deliveries/:id', DeliveryController.show);
routes.post('/deliveries', DeliveryController.store);
routes.put('/deliveries/:id', DeliveryController.update);
routes.delete('/deliveries/:id', DeliveryController.destroy);

routes.post('/files', upload.single('file'), FileController.store);

routes.get('/deliveries/problems', ProblemController.index);
routes.delete('/problems/:id/cancel-delivery', ProblemController.destroy);

routes.get('/delivery/:id/problems', DeliveryController.index);
routes.post('/delivery/:id/problems', DeliveryController.store);
routes.put('/delivery/:id/problems', DeliveryController.update);

export default routes;
