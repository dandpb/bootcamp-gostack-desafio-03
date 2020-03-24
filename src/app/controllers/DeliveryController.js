import * as Yup from 'yup';
import {
  setHours,
  setMinutes,
  setSeconds,
  isBefore,
  isAfter,
  parseISO,
} from 'date-fns';

import Delivery from '../models/Delivery';
import File from '../models/File';
import Recipient from '../models/Recipient';
import Deliveryman from '../models/Deliveryman';

import Queue from '../../lib/Queue';
import NotifyDeliverymanMail from '../jobs/NotifyDeliverymanMail';

const includeDbRelatiships = [
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
];

function checkValidTime(startDate) {
  // check date between 8am - 6pm
  const initialValidDate = setSeconds(
    setMinutes(setHours(new Date(), 8), 0),
    0
  );
  const endValidDate = setSeconds(setMinutes(setHours(new Date(), 18), 0), 0);

  const isValidDate =
    isAfter(startDate, initialValidDate) && isBefore(startDate, endValidDate);

  return isValidDate;
}
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

    const { recipient_id, deliveryman_id, product, start_date } = req.body;

    // check recipient
    const recipient = await Recipient.findByPk(recipient_id);
    if (!recipient) {
      return res.status(400).json({ error: 'Recipient not found' });
    }

    // check deliveryman
    const deliveryman = await Deliveryman.findByPk(deliveryman_id);
    if (!deliveryman) {
      return res.status(400).json({ error: 'Deliveryman not found' });
    }

    // check date between 8am - 6pm
    const startDate = parseISO(start_date) || new Date();
    if (!checkValidTime(startDate)) {
      return res.status(400).json({
        error:
          'is not a valid date, the date need be in the interval 8am - 18pm',
      });
    }

    const { id } = await Delivery.create({
      recipient_id,
      deliveryman_id,
      product,
      start_date: startDate,
    });

    const delivery = await Delivery.findByPk(id, {
      include: includeDbRelatiships,
    });

    // send email to the deliveryman
    await Queue.add(NotifyDeliverymanMail.key, {
      delivery,
    });

    return res.json({ delivery });
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
    let delivery = await Delivery.findByPk(id);
    if (!delivery) {
      return res.status(400).json({ error: 'Delivery not found' });
    }

    // checkBussinesValidations

    const { recipient_id, deliveryman_id, start_date } = req.body;
    // check recipient
    if (recipient_id) {
      const recipient = await Recipient.findByPk(recipient_id);
      if (!recipient) {
        return res.status(400).json({ error: 'Recipient not found' });
      }
    }

    // check deliveryman
    if (deliveryman_id) {
      const deliveryman = await Deliveryman.findByPk(deliveryman_id);
      if (!deliveryman) {
        return res.status(400).json({ error: 'Deliveryman not found' });
      }
    }

    // check date between 8am - 6pm
    if (start_date) {
      const startDate = parseISO(start_date);
      if (!checkValidTime(startDate)) {
        return res.status(400).json({
          error:
            'is not a valid date, the date need be in the interval 8am - 18pm',
        });
      }
    }

    await Delivery.update(req.body, { where: { id } });

    delivery = await Delivery.findByPk(id, {
      include: includeDbRelatiships,
    });

    // send email to the deliveryman
    await Queue.add(NotifyDeliverymanMail.key, {
      delivery,
    });

    return res.json(delivery);
  }

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

  async show(req, res) {
    const { id } = req.params;
    const delivery = await Delivery.findByPk(id, {
      include: includeDbRelatiships,
    });
    if (!delivery) {
      return res.status(500).json({ error: 'Delivery not found' });
    }
    return res.status(200).send(delivery);
  }

  async index(req, res) {
    const deliveries = await Delivery.findAll({
      include: includeDbRelatiships,
    });
    return res.json(deliveries);
  }
}

export default new DeliveryController();
