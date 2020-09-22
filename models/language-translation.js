const { DataTypes } = require("sequelize");
const sequelize = require("../utils/database");

const LanguageTranslation = sequelize.define("language_translation", {
  id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    primaryKey: true,
    autoIncrement: true,
  },
  updated_by_id: DataTypes.INTEGER,
  translation_value_current:DataTypes.STRING,
  translation_value_review: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  translation_status: {
    type: DataTypes.STRING,
    allowNull: false,
  },
});

module.exports = LanguageTranslation;
