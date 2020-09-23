const express = require("express");
const isAuth = require("../middlewares/is-auth");

const {
  getTranslations,
  getLanguages,
  getRoles,
  putTranslations,
  putTranslationsReview,
} = require("../controllers/translate");

const router = express.Router();

// GET translations
router.get("/translations",isAuth, getTranslations);

// GET languages
router.get("/languages", isAuth, getLanguages);

// GET roles
router.get("/roles", isAuth, getRoles);

// PUT translations
router.put("/translations", isAuth, putTranslations);

// PUT review translations
router.put("/translations/review", isAuth, putTranslationsReview);

module.exports = router;
