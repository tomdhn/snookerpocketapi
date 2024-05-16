
const { speeldagenModel } = require("../models/speeldag");

module.exports = async function getSpeeldag(req, res, next) {
    let speeldag;
    try {
      speeldag = await speeldagenModel.findById(req.params.id);
      if (speeldag == null) {
        console.log("speeldag niet gevonden");
      }
    } catch (error) {
      console.log(error);
    }
    res.speeldag = speeldag;
    next();
  }