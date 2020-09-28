const { DataTypes } = require("sequelize");
const sequelize = require("../utils/database");

/* 
  id,
  email,
  name,
  user_img,
  is_admin
*/
const User = sequelize.define("user", {
  id: {
    allowNull: false,
    primaryKey: true,
    type: DataTypes.UUID,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  user_img: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  is_admin: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    allowNull: false,
  },
});

module.exports = User;
