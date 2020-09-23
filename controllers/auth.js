const { validationResult } = require("express-validator");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const User = require("../models/user");
const UserLanguageRole = require("../models/user-language-role");
const Language = require("../models/language");
const Role = require("../models/role");

// POST signup
exports.signup = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const status = errors.statusCode || 500;
    const message = errors.message;
    const data = errors.data;

    res.json(status).json({ message, data });
  }

  const { email, name, password } = req.body;

  let jsonData = {};

  User.findAll({
    where: {
      email: email,
    },
  })
    .then((users) => {
      if (users[0]) {
        const error = new Error("User already exists");
        error.statusCode = 409;
        throw error;
      }

      return bcrypt.hash(password, 12);
    })
    .then((hashedPassword) => {
      return User.create(
        {
          name: name,
          email: email,
          password: hashedPassword,
        },
        { include: UserLanguageRole }
      );
    })
    .then((user) => {
      jsonData["user"] = user;
      return Language.findAll({
        where: {
          language_code: "en",
        },
      });
    })
    .then((languages) => {
      jsonData["language"] = languages[0];
      if (!languages[0]) {
        throw "failed to find language";
      }
      return Role.findAll({
        where: {
          role_value: "reviewer",
        },
      });
    })
    .then((roles) => {
      if (!roles[0]) {
        throw "failed to find role";
      }
      jsonData["role"] = roles[0];
      return UserLanguageRole.create({
        userId: jsonData["user"]["id"],
        roleId: jsonData["role"]["id"],
        languageId: jsonData["language"]["id"],
      });
    })
    .then((result) => {
      if (!result) {
        throw "failed to create userLanguagerole";
      }
      
      res.status(201).json({
        success: true,
        message: "User Created",
        userId: jsonData["user"]["id"],
      });
    })
    .catch((err) => {
      if (!err.statusCode) {
        err.statusCode = 500;
      }
      next(err);
    });
};

// POST login
exports.login = (req, res, next) => {
  const { email, password } = req.body;
  let loadedUser;
  User.findAll({
    where: {
      email: email,
    },
  })
    .then((users) => {
      const user = users[0];
      if (!user) {
        const error = new Error("A user with this email could not be found");
        throw error;
      }

      loadedUser = user;
      return bcrypt.compare(password, user.password);
    })
    .then((isEqual) => {
      if (!isEqual) {
        const error = new Error("Incorrect password");
        error.statusCode = 401;
        throw error;
      }

      const token = jwt.sign(
        {
          email: loadedUser.email,
          userId: loadedUser.id.toString(),
        },
        process.env.JWT_SECRET,
        { expiresIn: "1h" }
      );

      res.status(200).json({ token: token, userId: loadedUser.id.toString });
    })
    .catch((err) => {
      if (!err.statusCode) {
        err.statusCode = 500;
      }
      next(err);
    });
};
