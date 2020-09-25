const Language = require("../models/language");
const Role = require("../models/role");
const User = require("../models/user");
const UserLanguageRole = require("../models/user-language-role");

// GET all users
exports.getUsers = (req, res, next) => {
  User.findByPk(req.userId)
    .then((loggedInUser) => {
      if (!loggedInUser.is_admin) {
        let error = new Error("Only admin allowed access");
        error.statusCode = 403;
        throw error;
      }

      return User.findAll({
        include: { model: UserLanguageRole, include: [Role, Language] },
      });
    })
    .then((users) => {
      if (!users) {
        const error = new Error("users not found");
        error.statusCode = 404;
        throw error;
      }
      res.status(200).json(
        users.map((user) => {
          return {
            user: {
              id: user.id,
              name: user.name,
              email: user.email,
              is_admin: user.is_admin,
            },
            user_language_roles: user.user_language_roles.map((ulr) => ({
              id: ulr.id,
              role: ulr.role.role_value,
              language: {
                language_code: ulr.language.language_code,
                language_name_native: ulr.language.language_name_native,
                language_name_english: ulr.language.language_name_english,
              },
            })),
          };
        })
      );
    })
    .catch((err) => {
      if (!err.statusCode) {
        err.statusCode = 500;
      }
      next(err);
    });
};

// GET user by user id
exports.getUserById = (req, res, next) => {
  const { userId } = req.params;

  User.findByPk(req.userId)
    .then((loggedInUser) => {
      if (!loggedInUser.is_admin) {
        if (loggedInUser.id !== userId) {
          const error = new Error("Only admin allowed access");
          error.statusCode = 403;
          throw error;
        }
      }

      return User.findByPk(userId, {
        include: { model: UserLanguageRole, include: [Role, Language] },
      });
    })
    .then((user) => {
      if (!user) {
        const error = new Error("user not found");
        error.statusCode = 404;
        throw error;
      }
      res.status(200).json({
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          is_admin: user.is_admin,
        },
        user_language_roles: user.user_language_roles.map((ulr) => ({
          id: ulr.id,
          role: ulr.role.role_value,
          language: {
            language_code: ulr.language.language_code,
            language_name_native: ulr.language.language_name_native,
            language_name_english: ulr.language.language_name_english,
          },
        })),
      });
    })
    .catch((err) => {
      if (!err.statusCode) {
        err.statusCode = 500;
      }
      next(err);
    });
};

// PUT user role by userId
exports.putUserRoleById = (req, res, next) => {
  const { userId } = req.params;
  const { role, language } = req.body;

  let jsonData = {};

  Language.findAll({ where: { language_code: language } })
    .then((languages) => {
      const language = languages[0];
      if (!language) {
        const error = new Error("language not found");
        error.statusCode = 404;
        throw error;
      }
      jsonData["language"] = language;
      return Role.findAll({ where: { role_value: role } });
    })
    .then((roles) => {
      const role = roles[0];

      if (!role) {
        const error = new Error("role not found");
        error.statusCode = 404;
        throw error;
      }
      jsonData["role"] = role;
      return User.findByPk(userId);
    })
    .then((user) => {
      if (!user) {
        const error = new Error("user not found");
        error.statusCode = 404;
        throw error;
      }
      if (!user.is_admin) {
        let error = new Error("Only admin allowed access");
        error.statusCode = 403;
        throw error;
      }
      jsonData["user"] = user;

      return UserLanguageRole.update(
        { roleId: jsonData["role"]["id"] },
        { where: { userId: userId, languageId: jsonData["language"]["id"] } }
      );
    })
    .then((result) => {
      if (!result || result[0] < 1) {
        const error = new Error("data mismatch");
        error.statusCode = 400;
        throw error;
      }
      res.status(201).json({
        success: true,
        message: "user role succefully changed",
        data: {
          user: {
            id: jsonData.user.id,
            name: jsonData.user.name,
            email: jsonData.user.email,
          },
          role: jsonData.role.role_value,
          language: {
            language_code: jsonData.language.language_code,
            language_name_native: jsonData.language.language_name_native,
            language_name_english: jsonData.language.language_name_english,
          },
        },
      });
    })
    .catch((err) => {
      if (!err.statusCode) {
        err.statusCode = 500;
      }
      next(err);
    });
};

// PUT user personal info by user id
exports.putUserById = (req, res, next) => {
  const userId = req.userId;
  const { name, email } = req.body;

  let jsonData = {};

  User.findByPk(userId)
    .then((user) => {
      if (!user) {
        const error = new Error("user not found");
        error.statusCode = 404;
        throw error;
      }
      jsonData["user"] = {
        id: user.id,
        name: name,
        email: email,
        is_admin: user.is_admin,
      };
      return user.update(
        { name: name, email: email },
        { where: { userId: userId } }
      );
    })
    .then((result) => {
      if (!result || result[0] < 1) {
        const error = new Error("data mismatch");
        error.statusCode = 400;
        throw error;
      }
      res.status(201).json({
        success: true,
        message: "user info updated",
        user: jsonData.user,
      });
    })
    .catch((err) => {
      if (!err.statusCode) {
        err.statusCode = 500;
      }
      next(err);
    });
};

// POST new language
exports.postLanguage = async (req, res, next) => {
  try {
    const { userId, language } = req.body;
    let jsonData = {};
    let isAdmin = false

    if(userId !== req.userId) {
      let user = await User.findByPk(userId);
      if(!user || !user.is_admin) {
        let error = new Error("operation not allowed for this user");
        error.statusCode = 403;
        throw error;
      }
    }

    let languages = await Language.findAll({ where: { language_code: language } });

    let fetchedLanguage = languages[0];
    if (!fetchedLanguage) {
      const error = new Error("language not found");
      error.statusCode = 404;
      throw error;
    }

    jsonData["language"] = fetchedLanguage;

    let userLanguageRoles = await UserLanguageRole.findAll({
      where: {
        userId: userId,
        languageId: fetchedLanguage.id,
      },
    });

    let userLanguageRole = userLanguageRoles[0];

    if (!userLanguageRole) {
      userLanguageRole = await UserLanguageRole.create({
        languageId: jsonData["language"]["id"],
        userId: userId,
        roleId: 3,
      });
    }

    res.status(201).json({
      success: true,
      user: {
        id: userLanguageRole.userId,
      },
      role_value: "auditor",
      language: {
        language_code: jsonData.language.language_code,
        language_name_native: jsonData.language.language_name_native,
        language_name_english: jsonData.language.language_name_english,
      },
    });
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};

// DELETE language
exports.deleteLanguage = (req, res, next) => {
  const userId = req.userId;
  const { language } = req.body;

  const jsonData = {};

  User.findByPk(2)
    .then((user) => {
      if (!user) {
        const error = new Error("user not found");
        error.statusCode = 404;
        throw error;
      }

      return Language.findAll({
        where: {
          language_code: language,
        },
      });
    })
    .then((languages) => {
      const language = languages[0];
      if (!language) {
        const error = new Error("language not found");
        error.statusCode = 404;
        throw error;
      }

      jsonData["language"] = {
        language_code: language.language_code,
        language_name_english: language.language_name_english,
        language_name_native: language.language_name_native,
      };

      return UserLanguageRole.destroy({
        where: {
          languageId: language.id,
          userId: userId,
        },
      });
    })
    .then((result) => {
      res.status(202).json({
        success: true,
        message: "Language for user deleted",
        data: { user: { id: userId }, language: jsonData["languages"] },
      });
    })

    .catch((err) => {
      if (!err.statusCode) {
        err.statusCode = 500;
      }
      next(err);
    });
};

// TODO DELETE user by id
