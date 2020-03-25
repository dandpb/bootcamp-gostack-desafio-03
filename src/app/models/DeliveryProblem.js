import Sequelize, { Model } from 'sequelize';

class DeliveryProblem extends Model {
  static init(sequelize) {
    super.init(
      {
        description: Sequelize.STRING,
      },
      { sequelize }
    );
    return this;
  }

  static associate(models) {
    this.belongsToMany(models.Delivery, {
      through: 'delivery_problems',
      foreignKey: 'delivery_id',
      as: 'problems',
    });
  }
}

export default DeliveryProblem;
