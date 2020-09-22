const { DataTypes } = require("sequelize");
const sequelize = require("../utils/database");

const Language = sequelize.define("language", {
  id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    primaryKey: true,
    autoIncrement: true,
  },
  language_code: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  },
  language_name_native: DataTypes.STRING,
  language_name_english: DataTypes.STRING,
});

module.exports = Language;
