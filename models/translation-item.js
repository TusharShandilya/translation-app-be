const { DataTypes } = require("sequelize");
const sequelize = require("../utils/database");

const TranslationItem = sequelize.define("translation_item", {
  id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    primaryKey: true,
    autoIncrement: true,
  },
  translation_slug: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
  translation_active: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  translation_value: DataTypes.STRING,
});

module.exports = TranslationItem;