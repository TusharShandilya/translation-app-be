// IMPORTS
const express = require("express");
const bodyParser = require("body-parser");

// CUSTOM IMPORTS
const adminRoutes = require("./routes/admin");
const authRoutes = require("./routes/auth");
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
app.use("/admin", adminRoutes);
app.use("/translate", translateRoutes);

// ERROR HANDLING
// TODO: Add error controller?

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

// User.belongsToMany(Role, {through: UserLanguageRole})
// User.belongsToMany(Language, {through: UserLanguageRole})
// Role.belongsToMany(User, {through: UserLanguageRole})
// Role.belongsToMany(Language, {through: UserLanguageRole})
// Language.belongsToMany(User, {through: UserLanguageRole})
// Language.belongsToMany(Role, {through: UserLanguageRole})

TranslationItem.hasMany(LanguageTranslation);
LanguageTranslation.belongsTo(TranslationItem)
Language.hasMany(LanguageTranslation);
LanguageTranslation.belongsTo(Language)

// LanguageTranslation.hasMany(Language);

let force = true;

const refresher = require("./utils/script-refresh");

sequelize
  .sync({ force: force })
  .then((result) => {
    if (force) {
      refresher.createLanguages();
      refresher.createRoles();
      refresher.createTranslationItems();
    }

    return User.findByPk(1);
  })
  .then((user) => {
    if (!user) {
      return User.create({ name: "tushar", email: "test@test.com" });
    }
    return user;
  })
  .then((user) => {
    user.createUser_language_role({
      languageId: "1",
      roleId: "1"
    })
    user.createUser_language_role({
      languageId: "3",
      roleId: "2"
    })
    return true
  })
  .then((user) => {
    
      return User.create({ name: "bunny", email: "bunny@bunny.com" });
    
  })
  .then((user) => {
    user.createUser_language_role({
      languageId: "1",
      roleId: "3"
    })
    user.createUser_language_role({
      languageId: "3",
      roleId: "2"
    })
  })
  .then(result => {
        app.listen(8080, () => {
          console.log("app started");
        });
  })
  .catch((err) => {
    console.log(err);
  });
