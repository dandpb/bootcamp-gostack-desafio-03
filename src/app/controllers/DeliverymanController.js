import * as Yup from 'yup';
import Deliveryman from '../models/Deliveryman';

class DeliverymanController {
  async store(req, res) {
    const schemaValidation = Yup.object().shape({
      name: Yup.string().required(),
      email: Yup.string().required(),
    });
    if (!(await schemaValidation.isValid(req.body))) {
      return res.status(400).json({ error: 'Validation fails' });
    }

    const deliverymanExists = await Deliveryman.findOne({
      where: { email: req.body.email },
    });

    if (deliverymanExists) {
      return res.status(400).json({ error: 'Deliveryman already exists.' });
    }

    const { id, name, email } = await Deliveryman.create(req.body);

    return res.json({
      id,
      name,
      email,
    });
  }

  async update(req, res) {
    const schemaValidation = Yup.object().shape({
      name: Yup.string(),
      email: Yup.string(),
    });

    if (!(await schemaValidation.isValid(req.body))) {
      return res.status(400).json({ error: 'Validation fails' });
    }

    const { id } = req.params;
    let deliveryman = await Deliveryman.findByPk(id);
    if (!deliveryman) {
      return res.status(400).json({ error: 'Deliveryman not found' });
    }

    const { email } = req.body;

    if (email && email !== deliveryman.email) {
      const deliverymanExists = await Deliveryman.findOne({ where: { email } });

      if (deliverymanExists) {
        return res
          .status(400)
          .json({ error: 'This email already in use in other deliveryman .' });
      }
    }

    await Deliveryman.update(req.body, { where: { id } });

    deliveryman = await Deliveryman.findByPk(id);
    return res.json(deliveryman);
  }

  async destroy(req, res) {
    const { id } = req.params;
    const deliveryman = await Deliveryman.findByPk(id);
    if (!deliveryman) {
      return res.status(500).json({ error: 'Deliveryman not found' });
    }

    await Deliveryman.destroy({
      where: { id },
    });
    return res.status(200).send({ message: 'Deliveryman deleted' });
  }

  async show(req, res) {
    const { id } = req.params;
    const deliveryman = await Deliveryman.findByPk(id);
    if (!deliveryman) {
      return res.status(500).json({ error: 'Deliveryman not found' });
    }
    return res.status(200).send(deliveryman);
  }

  async index(req, res) {
    const deliverymans = await Deliveryman.findAll();
    return res.json(deliverymans);
  }
}

export default new DeliverymanController();
