const Language = require("../models/language");
const LanguageTranslation = require("../models/language-translation");
const Role = require("../models/role");
const TranslationItem = require("../models/translation-item");
const User = require("../models/user");
const UserLanguageRole = require("../models/user-language-role");

// GET translations
exports.getTranslations = (req, res, next) => {
  const { code, page, limit, status } = req.query;
  let pageLimit = parseInt(limit) || 10;
  let filterLanguage = {};

  if (code) {
    filterLanguage = {
      where: {
        language_code: code,
      },
    };
  } else {
    const error = new Error("missing info");
    error.statusCode = 400;
    throw err;
  }

  Language.findAll(filterLanguage)
    .then((languages) => {
      const language = languages[0];

      if (!language) {
        let error = new Error("Language not found");
        error.statusCode = 404;
        throw error;
      }
      let filter = { include: [Language, TranslationItem], where: {} };

      if (code) {
        filter.where["languageId"] = language["id"];
      }
      if (page) {
        filter["offset"] = (page - 1) * pageLimit;
        filter["limit"] = pageLimit;
      }
      if (["reviewed", "translated", "untranslated"].includes(status)) {
        filter.where["translation_status"] = status;
      }

      return LanguageTranslation.findAndCountAll(filter);
    })
    .then((items) => {
      // todo error handling here...

      if (pageLimit > items.count) pageLimit = items.count;
      res.status(200).json({
        success: true,
        total_items: items.count,
        items_per_page: pageLimit,
        translations: items.rows.map((item) => ({
          id: item.id,
          updated_by_id: item.updated_by_id,
          language: {
            id: item.language.id,
            language_code: item.language.language_code,
            language_name_english: item.language.language_name_english,
            language_name_native: item.language.language_name_native,
          },
          translation_value: item.translation_item.translation_value,
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
exports.getRoles = async (req, res, next) => {
  try {
    let roles = await Role.findAll();
    res.status(200).json({
      success: true,
      data: roles.map((role) => ({
        id: role.id,
        role_value: role.role_value,
      })),
    });
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
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

// PUT translations by id
exports.putTranslation = (req, res, next) => {
  const userId = req.userId;
  const { translationId, translationValue } = req.body;

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

      return LanguageTranslation.findByPk(translationId);
    })
    .then((translation) => {
      if (userLanguages.indexOf(translation.languageId) === -1) {
        const error = new Error("Language or Role not assigned to user");
        error.statusCode = 403;
        throw error;
      }

      return LanguageTranslation.update(
        {
          translation_value_current: translationValue,
          translation_status: "translated",
          updated_by_id: userId,
        },
        { where: { id: translationId } }
      );
    })
    .then((result) => {
      // TODO: Error handling here...
      res.status(202).json({
        success: true,
        count: 1,
        message: `${1} value(s) succesfully submitted for review`,
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

// PUT translations review
exports.putTranslationReview = (req, res, next) => {
  const userId = req.userId;
  const { translationId } = req.body;
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

      return LanguageTranslation.findByPk(translationId);
    })
    .then((translation) => {
      if (userLanguages.indexOf(translation.languageId) === -1) {
        const error = new Error("Language or Role not assigned to user");
        error.statusCode = 403;
        throw error;
      }

      return LanguageTranslation.update(
        {
          reviewed_by_id: userId,
          translation_status: "reviewed",
          translation_value_review: translation.translation_value_current,
        },
        { where: { id: translationId } }
      );
    })
    .then((result) => {
      // TODO: Error handling here...
      res.status(202).json({
        success: true,
        count: 1,
        message: `${1} value(s) succesfully reviewed`,
      });
    })
    .catch((err) => {
      if (!err.statusCode) {
        err.statusCode = 500;
      }
      next(err);
    });
};
