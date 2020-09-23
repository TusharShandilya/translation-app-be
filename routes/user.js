const express = require("express");

const isAuth = require("../middlewares/is-auth");
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
router.get("/all", isAuth, getUsers);

// GET user by user id
router.get("/:userId", isAuth, getUserById);

// PUT update user personal info by user id
router.put("/update-info", isAuth, putUserById);

// PUT user role by userId
router.put("/role/:userId", isAuth, putUserRoleById);

// POST new language
router.post("/language", isAuth, postLanguage);

// DELETE delete language
router.delete("/language", isAuth, deleteLanguage);

// TODO DELETE user by id

module.exports = router;
