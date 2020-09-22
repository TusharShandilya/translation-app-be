const { DataTypes } = require("sequelize");
const sequelize = require("../utils/database");

const Role = sequelize.define("role", {
  id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    primaryKey: true,
    autoIncrement: true,
  },
  role_value: {
    type: DataTypes.STRING,
    allowNull: false
  }
});

module.exports = Role;
