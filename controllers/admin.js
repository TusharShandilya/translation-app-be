const Language = require("../models/language");
const Role = require("../models/role");
const User = require("../models/user");
const UserLanguageRole = require("../models/user-language-role");


// GET all users
exports.getUsers = async (req, res, next) => {
  try {
    // const loggedInUser = await User.findByPk(req.decodeToken.userid);

    // if (!loggedInUser.is_admin) {
    //   let error = new Error("User not allowed operation");
    //   error.statusCode = 403;
    //   throw error;
    // }

    const users = await User.findAll({
      include: { model: UserLanguageRole, include: [Role, Language] },
    });

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
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};

// PUT bulk update language roles by user id
exports.putRolesByUserEmail = async (req, res, next) => {
  try {
    /* data = [{
      languageCode,
      roleValue
    }] */
    const { userEmail, data } = req.body;

    let user = await User.findOne({ where: { email: userEmail } });


    if (!user) {
      const error = new Error("User not found");
      error.statusCode = 404;
      throw error;
    }

    let result = Promise.all(
      data.map(async (item) => {
        let language = await Language.findOne({
          where: { language_code: item.languageCode },
        });
        let role = await Role.findOne({
          where: { role_value: item.roleValue },
        });

        return UserLanguageRole.update(
          { roleId: role.id },
          {
            where: {
              userId: user.id,
              languageId: language.id,
            },
          }
        );
      })
    );

    res.json({
      success: true,
      message: result.length + " value(s) updated successfully",
      data: result
    })
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};
