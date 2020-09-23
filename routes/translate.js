const express = require("express");

const {
  getTranslations,
  getLanguages,
  getRoles,
  putTranslations,
  putTranslationsReview,
} = require("../controllers/translate");

const router = express.Router();

// GET translations
router.get("/translations", getTranslations);

// GET languages
router.get("/languages", getLanguages);

// GET roles
router.get("/roles", getRoles);

// PUT translations
router.put("/translations", putTranslations);

// PUT review translations
router.put("/translations/review", putTranslationsReview);

module.exports = router;
