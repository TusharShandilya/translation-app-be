const path = require("path");
if (process.env.NODE_ENV === "production") {
  require("dotenv").config();
} else {
  require("dotenv").config({path: path.resolve(process.cwd(), '.env.dev')});
}

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

sequelize
  .sync()
  .then(() => {
    const PORT = process.env.PORT || 3000;
    app.listen(PORT, () => {
      console.log("app started on port: ", PORT);
    });
  })
  .catch((err) => {
    console.log(err);
  });
