const TranslationItem = require("../models/translation-item");
const Language = require("../models/language");
const Role = require("../models/role");

const data = require("./script-refresh-data");
const LanguageTranslation = require("../models/language-translation");

exports.refreshDb = () => {
  let jsonData = {};
  return Language.bulkCreate(data.languageData)
    .then((result) => {
      jsonData["languages"] = result;

      console.log("\n\n\n Language \n\n\n", result[0]);
      console.log("\n\n\n Language proto \n\n\n", result[0].__proto__);
      return TranslationItem.bulkCreate(data.translationMasterData);
    })
    .then((result) => {
      console.log("\n\n\n TRANSITION ITEM \n\n\n", result[0]);
      console.log("\n\n\n TRANSITION ITEM proto \n\n\n", result[0].__proto__);
      return result;
    })
    .then((result) => {
      return Promise.all(
        result.map((item) => {
          jsonData["languages"].map((language) => {
            let jsonRefresh = {
              languageId: language["id"],
              translationItemId: item["id"],
            };
            if (language["id"] === 1) {
              jsonRefresh["translation_status"] = "reviewed";
              jsonRefresh["translation_value_current"] =
                item["translation_value"];
              jsonRefresh["translation_value_review"] =
                item["translation_value"];
            }
            return LanguageTranslation.create(jsonRefresh);
          });
        })
      );
    })
    .then((result) => {
      return Role.bulkCreate(data.roleData);
    })
    .then((result) => {
      return true;
    })
    .catch((err) => {
      console.log(err);
    });
};

exports.createLanguageTranslationsEnglish = () => {};
