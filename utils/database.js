const Sequelize = require("sequelize");

const sequelize = new Sequelize("translation-dev", "root", "rado", {
  dialect: "mysql",
  host: "localhost",
});

module.exports = sequelize;
