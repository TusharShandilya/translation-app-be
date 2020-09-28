const express = require("express");
const { getUsers, putRolesByUserEmail } = require("../controllers/admin");
const isAuth = require("../middlewares/is-auth");

const router = express.Router()



// GET all users
router.get("/users/", getUsers)

// PUT bulk update language roles by user id
router.put("/roles", putRolesByUserEmail)

module.exports = router;