// IMPORTS
const express = require("express");
const bodyParser = require("body-parser");

// CUSTOM IMPORTS
const authRoutes = require("./routes/auth");
const userRoutes = require("./routes/user");
const translateRoutes = require("./routes/translate");

// DATABASE IMPORTS
const sequelize = require("./utils/database");
const LanguageTranslation = require("./models/language-translation");
const Language = require("./models/language");
const Role = require("./models/role");
const TranslationItem = require("./models/translation-item");
const UserLanguageRole = require("./models/user-language-role");
const User = require("./models/user");

// CONFIG
const app = express();
// ? static folder needed?
app.use(bodyParser.json());

// HEADERS
app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader(
    "Access-Control-Allow-Methods",
    "OPTIONS, GET, POST, PUT, PATCH, DELETE"
  );
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  next();
});

// ROUTES
app.use("/auth", authRoutes);
app.use("/user", userRoutes);
app.use("/translate", translateRoutes);

// ERROR HANDLING
app.use((error, req, res, next) => {
  console.error("Error: ", error);
  const status = error.statusCode || 500;
  const message = error.message || "An Error has occured";
  res.status(status).json({
    success: false,
    message: message,
  });
});

// DATABASE ASSOCIATIONS
User.hasMany(UserLanguageRole);
UserLanguageRole.belongsTo(User);
Language.hasMany(UserLanguageRole);
UserLanguageRole.belongsTo(Language);
Role.hasMany(UserLanguageRole);
UserLanguageRole.belongsTo(Role);

TranslationItem.hasMany(LanguageTranslation);
LanguageTranslation.belongsTo(TranslationItem);
Language.hasMany(LanguageTranslation);
LanguageTranslation.belongsTo(Language);

let force = false;

const refresher = require("./utils/script-refresh");

sequelize
  .sync({ force: force })
  .then((result) => {
    if (force) {
      return refresher.refreshDb();
    }
    return true;
  })
  .then((result) => {
    return User.findByPk(1);
  })
  .then((user) => {
    if (!user) {
      return User.create({
        name: "tushar",
        email: "test@test.com",
        is_admin: true,
      });
    }
    return user;
  })
  // .then((user) => {
  // user.createUser_language_role({
  //   languageId: "1",
  //   roleId: "1",
  // });
  // user.createUser_language_role({
  //   languageId: "3",
  //   roleId: "2",
  // });
  //   return true
  // })
  .then((result) => {
    app.listen(8080, () => {
      console.log("app started");
    });
  })
  .catch((err) => {
    console.log(err);
  });
