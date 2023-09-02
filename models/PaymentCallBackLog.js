// const { Model, DataTypes } = require('sequelize');

const { sequelize, DataTypes } = require("../config/db");

// const sequelize = new Sequelize(/* your sequelize config here */);

// class PaymentCallBackLog extends Model {}

const PaymentCallBackLog = sequelize.define("PaymentCallBackLog",{
    payment_id: { type: DataTypes.STRING, allowNull: true },
    payment_status: { type: DataTypes.STRING, allowNull: true },
    pay_address: { type: DataTypes.STRING, allowNull: true },
    price_amount: { type: DataTypes.FLOAT, allowNull: true },
    price_currency: { type: DataTypes.STRING, allowNull: true },
    pay_amount: { type: DataTypes.FLOAT, allowNull: true },
    amount_received: { type: DataTypes.FLOAT, allowNull: true },
    pay_currency: { type: DataTypes.STRING, allowNull: true },
    order_id: { type: DataTypes.STRING, allowNull: true },
    order_description: { type: DataTypes.STRING, allowNull: true },
    payin_extra_id: { type: DataTypes.STRING, allowNull: true },
    ipn_callback_url: { type: DataTypes.STRING, allowNull: true },
    created_at: { type: DataTypes.STRING, allowNull: true },
    updated_at: { type: DataTypes.STRING, allowNull: true },
    purchase_id: { type: DataTypes.STRING, allowNull: true },
    smart_contract: { type: DataTypes.STRING, allowNull: true },
    network: { type: DataTypes.STRING, allowNull: true },
    network_precision: { type: DataTypes.STRING, allowNull: true },
    time_limit: { type: DataTypes.STRING, allowNull: true },
    burning_percent: { type: DataTypes.FLOAT, allowNull: true },
    expiration_estimate_date: { type: DataTypes.STRING, allowNull: true },
    is_fixed_rate: { type: DataTypes.BOOLEAN, allowNull: true },
    is_fee_paid_by_user: { type: DataTypes.BOOLEAN, allowNull: true },
    valid_until: { type: DataTypes.STRING, allowNull: true },
    type: { type: DataTypes.STRING, allowNull: true },
});

// This syncs the model to the database. In production, you may not want to do this every time.
// PaymentCallBackLog.sync({alter:true});
module.exports = {PaymentCallBackLog}
