const express = require("express");

const translateController = require("../controllers/translate");

const router = express.Router();

// GET all translations
router.get("/translations", translateController.getTranslations);



// GET translation by id
router.get("/translation/:translationId");

// PUT translation by id
router.put("/translation/:translationId");

module.exports = router;