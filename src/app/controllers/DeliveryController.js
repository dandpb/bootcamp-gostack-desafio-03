import * as Yup from 'yup';
import Delivery from '../models/Delivery';
import File from '../models/File';
import Recipient from '../models/Recipient';
import Deliveryman from '../models/Deliveryman';

class DeliveryController {
  async store(req, res) {
    const schemaValidation = Yup.object().shape({
      recipient_id: Yup.number().required(),
      deliveryman_id: Yup.number().required(),
      product: Yup.string().required(),
    });

    if (!(await schemaValidation.isValid(req.body))) {
      return res.status(400).json({ error: 'Validation fails' });
    }

    const { recipient_id, deliveryman_id, product } = req.body;
    const startDate = new Date();

    const { id, deliveryman, recipient, start_date } = await Delivery.create({
      recipient_id,
      deliveryman_id,
      product,
      start_date: startDate,
    });

    return res.json({
      id,
      deliveryman,
      recipient,
      product,
      start_date,
    });
  }

  async update(req, res) {
    const schemaValidation = Yup.object().shape({
      recipient_id: Yup.number(),
      deliveryman_id: Yup.number(),
      signature_id: Yup.number(),
      product: Yup.string(),
      canceled_at: Yup.date(),
      start_date: Yup.date(),
      end_date: Yup.date(),
    });

    if (!(await schemaValidation.isValid(req.body))) {
      return res.status(400).json({ error: 'Validation fails' });
    }

    const { id } = req.params;
    let deliveryman = await Delivery.findByPk(id);
    if (!deliveryman) {
      return res.status(400).json({ error: 'Delivery not found' });
    }

    const { email } = req.body;

    if (email && email !== deliveryman.email) {
      const deliverymanExists = await Delivery.findOne({ where: { email } });

      if (deliverymanExists) {
        return res
          .status(400)
          .json({ error: 'This email already in use in other deliveryman .' });
      }
    }

    await Delivery.update(req.body, { where: { id } });

    deliveryman = await Delivery.findByPk(id, {
      include: [
        {
          model: Deliveryman,
          as: 'deliveryman',
          attributes: ['name', 'email'],
        },
        {
          model: Recipient,
          as: 'recipient',
          attributes: ['name', 'street', 'number', 'complement'],
        },
        {
          model: File,
          as: 'signature',
          attributes: ['path', 'url'],
        },
      ],
    });
    return res.json(deliveryman);
  }

  async destroy(req, res) {
    const { id } = req.params;
    const deliveryman = await Delivery.findByPk(id);
    if (!deliveryman) {
      return res.status(500).json({ error: 'Delivery not found' });
    }

    await Delivery.destroy({
      where: { id },
    });
    return res.status(200).send({ message: 'Delivery deleted' });
  }

  async show(req, res) {
    const { id } = req.params;
    const deliveryman = await Delivery.findByPk(id, {
      include: [
        {
          model: Deliveryman,
          as: 'deliveryman',
          attributes: ['name', 'email'],
        },
        {
          model: Recipient,
          as: 'recipient',
          attributes: ['name', 'street', 'number', 'complement'],
        },
        {
          model: File,
          as: 'signature',
          attributes: ['path', 'url'],
        },
      ],
    });
    if (!deliveryman) {
      return res.status(500).json({ error: 'Delivery not found' });
    }
    return res.status(200).send(deliveryman);
  }

  async index(req, res) {
    const deliveries = await Delivery.findAll({
      include: [
        {
          model: Deliveryman,
          as: 'deliveryman',
          attributes: ['name', 'email'],
        },
        {
          model: Recipient,
          as: 'recipient',
          attributes: ['name', 'street', 'number', 'complement'],
        },
        {
          model: File,
          as: 'signature',
          attributes: ['path', 'url'],
        },
      ],
    });
    return res.json(deliveries);
  }
}

export default new DeliveryController();
