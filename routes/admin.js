const express = require("express");

const { getUsers, getUserById,  } = require("../controllers/admin");

const router = express.Router();

// GET all users
router.get("/users", getUsers);

// GET user by id
router.get("/user/:userId", getUserById)

// DELETE user by id
router.delete("/user/:userId")

module.exports = router;