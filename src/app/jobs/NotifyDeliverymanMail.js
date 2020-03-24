import { format, parseISO } from 'date-fns';
import pt from 'date-fns/locale/pt';
import Mail from '../../lib/Mail';

class NotifyDeliverymanEmail {
  get key() {
    return 'NotifyDeliverymanMail';
  }

  async handle({ data }) {
    const { delivery } = data;

    Mail.sendMail({
      to: `${delivery.deliveryman.name} <${delivery.deliveryman.email}>`,
      subject: 'Nova encomenda solicita pra você ',
      template: 'notifyDeliveryman',
      context: {
        deliveryman: delivery.deliveryman,
        recipient: delivery.recipient,
        product: delivery.product,
        date: format(
          parseISO(delivery.start_date),
          "'dia' dd 'de' MMMM', às' H:mm'h' ",
          {
            locale: pt,
          }
        ),
      },
    });
  }
}

export default new NotifyDeliverymanEmail();
