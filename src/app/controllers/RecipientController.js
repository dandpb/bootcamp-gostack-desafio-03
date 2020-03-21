import * as Yup from 'yup';
import Recipient from '../models/Recipient';

const schemaValidation = Yup.object().shape({
  name: Yup.string().required(),
  street: Yup.string().required(),
  number: Yup.number().required(),
  complement: Yup.string(),
  state: Yup.string()
    .required()
    .max(2),
  city: Yup.string().required(),
  zip_code: Yup.string().required(),
});

class RecipientController {
  async store(req, res) {
    if (!(await schemaValidation.isValid(req.body))) {
      return res.status(400).json({ error: 'Validation fails' });
    }

    const {
      id,
      name,
      street,
      number,
      complement,
      state,
      city,
      zip_code,
    } = await Recipient.create(req.body);

    return res.json({
      id,
      name,
      street,
      number,
      complement,
      state,
      city,
      zip_code,
    });
  }

  async update(req, res) {
    if (!(await schemaValidation.isValid(req.body))) {
      return res.status(400).json({ error: 'Validation fails' });
    }

    const { id } = req.params;
    let recipient = await Recipient.findByPk(id);
    if (!recipient) {
      return res.status(400).json({ error: 'Recipient not found' });
    }

    await Recipient.update(req.body, { where: { id } });

    recipient = await Recipient.findByPk(id);
    return res.json(recipient);
  }

  async destroy(req, res) {
    const { id } = req.params;
    const recipient = await Recipient.findByPk(id);
    if (!recipient) {
      return res.status(500).json({ error: 'Recipient not found' });
    }

    await Recipient.destroy({
      where: { id },
    });
    return res.status(200).send({ message: 'Recipient deleted' });
  }

  async index(req, res) {
    const recipients = await Recipient.findAll();
    return res.json(recipients);
  }

  async show(req, res) {
    const { id } = req.params;
    const recipient = await Recipient.findByPk(id);
    if (!recipient) {
      return res.status(500).json({ error: 'Recipient not found' });
    }
    return res.status(200).send(recipient);
  }
}

export default new RecipientController();
