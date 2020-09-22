const TranslationItem = require("../models/translation-item");
const Language = require("../models/language");
const Role = require("../models/role");

const data = require("./script-refresh-data");

exports.createRoles = () => {
  console.log("hello hi");
  return Role.bulkCreate(data.roleData);
};

exports.createLanguages = () => {
  return Language.bulkCreate(data.languageData);
};

exports.createTranslationItems = () => {
  TranslationItem.bulkCreate(data.translationMasterData)
    .then((result) => {
      // console.log("\n\n\n TRANSITION ITEM \n\n\n", result[0]);
      // console.log("\n\n\n TRANSITION ITEM proto \n\n\n", result[0].__proto__);

      return result[0];
    })
    .then((data) => {
      data.createLanguage_translation({
        translation_status: "untranslated",
        updated_by_id: "2",
        languageId: "3",
        translation_value: "hello"
      });
    }); 
};
