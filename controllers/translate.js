
const LanguageTranslation = require("../models/language-translation");

exports.getTranslations = (req, res, next) => {
  LanguageTranslation.findAll()
    .then(items => {
      // Send json...
      res.json({
        success: true,
        translations: items
      })

      return items[0]
    })
    .then()
    .catch(err => {
      console.log(err);
      // Handle error...
      res.json({
        success: false,
        error: err
      })
    })
}