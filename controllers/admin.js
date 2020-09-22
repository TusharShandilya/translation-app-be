const Language = require("../models/language");
const Role = require("../models/role");
const User = require("../models/user");
const UserLanguageRole = require("../models/user-language-role");

// GET all users
exports.getUsers = (req, res, next) => {
  User.findAll({
    include: { model: UserLanguageRole, include: [Role, Language] },
  }).then((users) => {
    res.status(200).json(
      users.map((user) => {
        return {
          id: user.id,
          name: user.name,
          email: user.email,
          updated_at: user.updatedAt,
          user_language_roles: user.user_language_roles,
        };
      })
    );
  });
};

// GET user by user id
exports.getUserById = (req, res, next) => {
  const { userId } = req.params;
  User.findByPk(userId, {
    include: { model: UserLanguageRole, include: [Role, Language] },
  })
    .then(user => {
      res.status(200).json(user)
    })
  ;
};

// GET user role by user id

// PUT user role by language

// DELETE user by id
