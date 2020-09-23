const express = require("express");
const { login, signup } = require("../controllers/auth");

const router = express.Router()

// TODO add express validaiton...

// POST signup
router.post("/signup", signup)

// POST login
router.post("/login", login)

module.exports = router;