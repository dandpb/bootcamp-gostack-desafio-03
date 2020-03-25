import * as Yup from 'yup';

import Delivery from '../models/Delivery';
import Deliveryman from '../models/Deliveryman';
import DeliveryProblem from '../models/DeliveryProblem';

import Queue from '../../lib/Queue';
import NotifyDeliverymanMail from '../jobs/NotifyDeliverymanMail';

class ProblemController {
  async destroy(req, res) {
    const { id } = req.params;
    const delivery = await Delivery.findByPk(id);
    if (!delivery) {
      return res.status(500).json({ error: 'Delivery not found' });
    }

    await Delivery.destroy({
      where: { id },
    });
    return res.status(200).send({ message: 'Delivery deleted' });
  }

  async index(req, res) {
    const deliveries = await DeliveryProblem.findAll();
    return res.json(deliveries);
  }
}

export default new ProblemController();
