const express = require("express");
const isAuth = require("../middlewares/is-auth");

const {
  getTranslations,
  getLanguages,
  getRoles,
  putTranslations,
  putTranslationsReview,
  putTranslation,
  putTranslationReview,
} = require("../controllers/translate");

const router = express.Router();

// GET translations
router.get("/translations", getTranslations);

// GET languages
router.get("/languages", isAuth, getLanguages);

// GET roles
router.get("/roles", isAuth, getRoles);

// PUT translations
router.put("/translations", isAuth, putTranslations);

// PUT review translations
router.put("/translations/review", isAuth, putTranslationsReview);

//PUT translations 
router.put("/translation", isAuth, putTranslation);
// PUT review translation
router.put("/translation/review", isAuth, putTranslationReview);



module.exports = router;
