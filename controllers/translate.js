const Language = require("../models/language");
const LanguageTranslation = require("../models/language-translation");
const Role = require("../models/role");
const TranslationItem = require("../models/translation-item");
const User = require("../models/user");
const UserLanguageRole = require("../models/user-language-role");

// GET translations
exports.getTranslations = (req, res, next) => {
  const { code } = req.query;
  let filterLanguage = {};

  if (code) {
    filterLanguage = {
      where: {
        language_code: code,
      },
    };
  }

  Language.findAll(filterLanguage)
    .then((languages) => {
      const language = languages[0];
      console.log(language);
      if (!language) {
        let error = new Error("Language not found");
        error.statusCode = 404;
        throw error;
      }
      let filter = { include: Language };

      if (code) {
        filter = {
          ...filter,
          where: {
            languageId: language["id"],
          },
        };
      }

      return LanguageTranslation.findAll(filter);
    })
    .then((items) => {
      // todo error handling here...
      // include value
      console.log(items[0].language);
      res.status(200).json({
        success: true,
        translations: items.map((item) => ({
          id: item.id,
          updated_by_id: item.updated_by_id,
          language: {
            id: item.language.id,
            language_code: item.language.language_code,
            language_name_english: item.language.language_name_english,
            language_name_native: item.language.language_name_native,
          },
          translation_value_review: item.translation_value_review,
          translation_value_current: item.translation_value_current,
          translation_status: item.translation_status,
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

// GET languages
exports.getLanguages = (req, res, next) => {
  Language.findAll()
    .then((languages) => {
      res.status(200).json({
        success: true,
        data: languages.map((language) => ({
          language_code: language.language_code,
          language_name_english: language.language_name_english,
          language_name_native: language.language_name_native,
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

// GET roles
exports.getRoles = (req, res, next) => {
  Role.findAll()
    .then((roles) => {
      res.status(200).json({
        success: true,
        data: roles.map((role) => ({
          id: role.id,
          role_value: role.role_value,
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

// PUT translations
exports.putTranslations = (req, res, next) => {
  const userId = req.userId;
  // translations [{
  //   translationId,
  //   translationValue,
  // }];
  const translations = req.body;
  let userLanguages = [];

  User.findByPk(userId, {
    include: { model: UserLanguageRole, include: [Role, Language] },
  })
    .then((user) => {
      if (!user) {
        const error = new Error("user not found");
        error.statusCode = 404;
        throw error;
      }

      user.user_language_roles.forEach((ulr) => {
        if (ulr.role.id === 1 || ulr.role.id === 2) {
          userLanguages.push(ulr.language.id);
        }
      });

      return Promise.all(
        translations.map((translation) => {
          return LanguageTranslation.findByPk(translation.translationId);
        })
      );
    })
    .then((result) => {
      result.forEach((translation) => {
        if (userLanguages.indexOf(translation.languageId) === -1) {
          const error = new Error("Language or Role not assigned to user");
          error.statusCode = 403;
          throw error;
        }
      });

      return Promise.all(
        translations.map((translation) => {
          console.log(translation);
          return LanguageTranslation.update(
            {
              translation_value_current: translation.translationValue,
              translation_status: "translated",
              updated_by_id: userId,
            },
            { where: { id: translation.translationId } }
          );
        })
      );
    })
    .then((result) => {
      // TODO: Error handling here...
      res.status(202).json({
        success: true,
        count: result.length,
        message: `${result.length} value(s) succesfully submitted for review`,
      });
    })
    .catch((err) => {
      if (!err.statusCode) {
        err.statusCode = 500;
      }
      next(err);
    });
};
// PUT translations review
exports.putTranslationsReview = (req, res, next) => {
  const userId = req.userId;
  // translations [{
  //   translationId
  // }];
  const translations = req.body;
  let userLanguages = [];

  User.findByPk(userId, {
    include: { model: UserLanguageRole, include: [Role, Language] },
  })
    .then((user) => {
      if (!user) {
        const error = new Error("user not found");
        error.statusCode = 404;
        throw error;
      }

      user.user_language_roles.forEach((ulr) => {
        if (ulr.role.id === 1) {
          userLanguages.push(ulr.language.id);
        }
      });

      return Promise.all(
        translations.map((translation) => {
          return LanguageTranslation.findByPk(translation.translationId);
        })
      );
    })
    .then((result) => {
      // res.json(result)
      result.forEach((translation) => {
        if (userLanguages.indexOf(translation.languageId) === -1) {
          const error = new Error("Language or Role not assigned to user");
          error.statusCode = 403;
          throw error;
        }
      });

      return Promise.all(
        result.map((translation) => {
          return LanguageTranslation.update(
            {
              reviewed_by_id: userId,
              translation_status: "reviewed",
              translation_value_review: translation.translation_value_current,
            },
            { where: { id: translation.id } }
          );
        })
      );
    })
    .then((result) => {
      // TODO: Error handling here...
      res.status(202).json({
        success: true,
        count: result.length,
        message: `${result.length} value(s) succesfully submitted for review`,
      });
    })
    .catch((err) => {
      if (!err.statusCode) {
        err.statusCode = 500;
      }
      next(err);
    });
};
