const express = require("express");
const {
  getUserById,
  getUsers,
  postLanguage,
  putUserById,
  putUserRoleById,
  deleteLanguage,
} = require("../controllers/user");

const router = express.Router();

// GET all users
router.get("/all", getUsers);

// GET user by user id
router.get("/:userId", getUserById);

// PUT update user personal info by user id
router.put("/update-info", putUserById);

// PUT user role by userId
router.put("/role/:userId", putUserRoleById);

// POST new language
router.post("/language", postLanguage);

// DELETE delete language
router.delete("/language", deleteLanguage);

// TODO DELETE user by id

module.exports = router;
