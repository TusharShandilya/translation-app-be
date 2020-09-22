const express = require("express");

const { getTranslations }= require("../controllers/translate");

const router = express.Router();

// GET translations
router.get("/translations", getTranslations);

// GET translation by id
router.get("/translation/:translationId");

// GET languages 
router.get("/language");

// GET roles
router.get("/role");

// PUT translation by id
router.put("/translation/:translationId");

module.exports = router;