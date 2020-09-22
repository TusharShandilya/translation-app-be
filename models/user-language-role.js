const Sequelize = require("sequelize");
const sequelize = require("../utils/database");

const UserLanguageRole = sequelize.define("user_language_roles", {
  id: {
    type: Sequelize.INTEGER,
    allowNull: false,
    primaryKey: true,
    autoIncrement: true,
  },
});

module.exports = UserLanguageRole;