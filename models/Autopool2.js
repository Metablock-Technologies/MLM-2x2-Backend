const { sequelize, DataTypes } = require('../config/db');

// const sequelize = new Sequelize('sqlite::memory:');

const Autopool2 = sequelize.define('autopool2', {
    id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        unique: true,
        // field:'referral_user_id' // to match the column name in db table
    },
    amount:{
        type:DataTypes.FLOAT,
        defaultValue:0,
        allowNull:false
    },
    month: {
        type: DataTypes.DATEONLY,
        allowNull: false,
    },
    status:{
        type:DataTypes.STRING,
        validate:{
            isIn:[['pending','distributed']]
        }
    }

});


// Autopool2.sync({ force: true });
module.exports = { Autopool2 };