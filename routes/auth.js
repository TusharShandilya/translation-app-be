const express = require("express");
const { login } = require("../controllers/auth");
const isAuth = require("../middlewares/is-auth");

const router = express.Router()

// POST login
router.post("/login/",isAuth, login)

module.exports = router;