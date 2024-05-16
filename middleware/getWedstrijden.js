const { speeldagenModel } = require("../models/speeldag");

module.exports = async function getWedstrijden(req, res, next) {
  let speeldagwedstrijden;
    try {
      speeldagwedstrijden = await speeldagenModel
        .findById(req.params.id)
        .populate("wedstrijden")
        .select("wedstrijden");
      if (speeldagwedstrijden == null) {
        console.log("wedstrijden not found");
      }
      console.log(res.wedstrijd);
    } catch (err) {
      console.log(err);
    }
    res.wedstrijd = speeldagwedstrijden;
    next();
  }