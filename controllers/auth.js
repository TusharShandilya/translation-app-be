const { validationResult } = require("express-validator");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const User = require("../models/user");
const UserLanguageRole = require("../models/user-language-role");
const Language = require("../models/language");
const Role = require("../models/role");

const { v4: uuidv4 } = require("uuid");

const signUp = async (token) => {
  user = await User.create({
    id: uuidv4(),
    name: token["name"],
    email: token["email"],
    user_img: token["picture"],
  });

  // Add english to languages and give permission as "auditor"...

  let language = await Language.findOne({
    where: {
      language_code: "en",
    },
  });

  if (!language) {
    throw "failed to find language";
  }

  let role = await Role.findOne({
    where: {
      role_value: "auditor",
    },
  });

  if (!role) {
    throw "failed to find role";
  }

  let ulr = await UserLanguageRole.create({
    userId: user.id,
    roleId: role.id,
    languageId: language.id,
  });

  if (!ulr) {
    throw "failed to create userLanguagerole";
  }

  return {
    success: true,
    message: "user created",
    data: {
      name: user.name,
      email: user.email,
      user_img: user.user_img,
      is_admin: user.is_admin,
      user_language_roles: [
        {
          role_value: role.role_value,
          language: {
            code: language.language_code,
            name_english: language.language_name_english,
            name_native: language.language_name_native,
          },
        },
      ],
    },
  };
};

// POST login
exports.login = async (req, res, next) => {
  try {
    const user = await User.findOne({
      where: { email: req.decodedToken.email },
      include: { model: UserLanguageRole, include: [Role, Language] },
    });

    let jsonData;

    if (!user) {
      // Create new user...

      jsonData = await signUp(req.decodedToken);

      res.status(201).json(jsonData);
      return;
    }

    console.log("user", user);
    res.status(200).json({
      success: true,
      message: "user data sent",
      data: {
        name: user.name,
        email: user.email,
        user_img: user.user_img,
        is_admin: user.is_admin,
        user_language_roles: user.user_language_roles.map((ulr) => ({
          id: ulr.id,
          role: ulr.role.role_value,
          language: {
            code: ulr.language.language_code,
            name_native: ulr.language.language_name_native,
            name_english: ulr.language.language_name_english,
          },
        })),
      },
    });
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};
