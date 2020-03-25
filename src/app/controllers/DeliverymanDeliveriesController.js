import * as Yup from 'yup';
import {
  setHours,
  setMinutes,
  setSeconds,
  isBefore,
  isAfter,
  parseISO,
} from 'date-fns';

import { Op } from 'sequelize';

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
class DeliverymanDeliveriesController {
  async index(req, res) {
    const { deliverymanId } = req.params;

    let where = {
      deliveryman_id: deliverymanId,
      canceled_at: null,
      end_date: null,
    };

    const { done } = req.query;
    if (done) {
      where = {
        deliveryman_id: deliverymanId,
        end_date: { [Op.ne]: null },
      };
    }

    const deliveries = await Delivery.findAll({
      where,
      include: includeDbRelatiships,
    });
    return res.json(deliveries);
  }

  async update(req, res) {
    const schemaValidation = Yup.object().shape({
      signature_id: Yup.number(),
      start_date: Yup.date(),
      end_date: Yup.date(),
    });

    if (!(await schemaValidation.isValid(req.body))) {
      return res.status(400).json({ error: 'Validation fails' });
    }

    const { deliverymanId, deliveryId } = req.params;
    let delivery = await Delivery.findOne({
      where: {
        deliveryman_id: deliverymanId,
        id: deliveryId,
      },
    });
    if (!delivery) {
      return res.status(400).json({ error: 'Delivery not found' });
    }

    // check date between 8am - 6pm
    const { start_date } = req.body;
    if (start_date) {
      const startDate = parseISO(start_date);
      if (!checkValidTime(startDate)) {
        return res.status(400).json({
          error:
            'is not a valid date, the date need be in the interval 8am - 18pm',
        });
      }

      const deliveries = await Delivery.findAndCountAll({
        where: {
          deliveryman_id: deliverymanId,
          start_date: { [Op.ne]: null },
        },
      });

      if (deliveries.count >= 5) {
        return res.status(400).json({
          error: 'This deliveryman is already 5 delivery without',
        });
      }
    }

    await Delivery.update(req.body, { where: { id: deliveryId } });

    delivery = await Delivery.findByPk(deliveryId, {
      include: includeDbRelatiships,
    });

    // send email to the deliveryman
    await Queue.add(NotifyDeliverymanMail.key, {
      delivery,
    });

    return res.json(delivery);
  }
}

export default new DeliverymanDeliveriesController();
