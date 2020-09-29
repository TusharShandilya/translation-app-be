const Language = require("../models/language");
const Role = require("../models/role");
const User = require("../models/user");
const UserLanguageRole = require("../models/user-language-role");

// GET user by user id
exports.getUserById = async (req, res, next) => {
  try {
    const { userId } = req.params;

    if (userId !== req.userId) {
      let signedInUser = await User.findByPk(req.userId);

      if (!signedInUser.is_admin) {
        const error = new Error("user not allowed this operation");
        error.statusCode = 403;
        throw error;
      }
    }

    const user = await User.findByPk(userId, {
      include: { model: UserLanguageRole, include: [Role, Language] },
    });

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
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};

// PUT user role by userId
exports.putUserRoleById = async (req, res, next) => {
  try {
    const { userId, role, language } = req.body;

    const loggedInUser = await User.findByPk(req.userId);

    if (!loggedInUser.is_admin) {
      let error = new Error("User not allowed operation");
      error.statusCode = 403;
      throw error;
    }

    let jsonData = {};

    const languages = await Language.findAll({
      where: { language_code: language },
    });

    const fetchedLanguage = languages[0];
    if (!fetchedLanguage) {
      const error = new Error("language not found");
      error.statusCode = 404;
      throw error;
    }
    jsonData["language"] = fetchedLanguage;

    const roles = await Role.findAll({ where: { role_value: role } });
    const fetchedRole = roles[0];
    if (!fetchedRole) {
      const error = new Error("role not found");
      error.statusCode = 404;
      throw error;
    }

    jsonData["role"] = fetchedRole;

    const user = await User.findByPk(userId);

    if (!user) {
      const error = new Error("user not found");
      error.statusCode = 404;
      throw error;
    }

    jsonData["user"] = user;
    const result = await UserLanguageRole.update(
      { roleId: jsonData["role"]["id"] },
      { where: { userId: userId, languageId: jsonData["language"]["id"] } }
    );

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
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};

// PUT user personal info by user id
exports.putUserById = async (req, res, next) => {
  try {
    const userId = req.userId;
    const { name, email } = req.body;

    let jsonData = {};

    const user = await User.findByPk(userId);
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

    const result = await user.update(
      { name: name, email: email },
      { where: { userId: userId } }
    );

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
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};

// POST new language
exports.postLanguage = async (req, res, next) => {
  try {
    const { userEmail, language } = req.body;
    let jsonData = {};

    let signedInUser = await User.findOne({
      where: {
        email: req.decodedToken.email,
      },
    });

    if (userEmail !== req.decodedToken.email) {
      if (!signedInUser.is_admin) {
        const error = new Error("user not allowed this operation");
        error.statusCode = 403;
        throw error;
      }
    }

    let fetchedLanguage = await Language.findOne({
      where: { language_code: language },
    });

    
    if (!fetchedLanguage) {
      const error = new Error("language not found");
      error.statusCode = 404;
      throw error;
    }

    jsonData["language"] = fetchedLanguage;

    let userLanguageRoles = await UserLanguageRole.findAll({
      where: {
        userId: signedInUser.id,
        languageId: fetchedLanguage.id,
      },
    });

    let userLanguageRole = userLanguageRoles[0];

    if (!userLanguageRole) {
      userLanguageRole = await UserLanguageRole.create({
        languageId: jsonData["language"]["id"],
        userId: signedInUser.id,
        roleId: 3,
      });
    }

    res.status(201).json({
      success: true,
      user: {
        email: signedInUser.email,
      },
      role_value: "auditor",
      language: {
        code: jsonData.language.language_code,
        name_native: jsonData.language.language_name_native,
        name_english: jsonData.language.language_name_english,
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
