const {wedstrijdModel} = require("../models/wedstrijd");

module.exports = async function getWedstrijd(req, res, next) {
    let wedstrijd;
    try {
        wedstrijd = await wedstrijdModel.findById(req.params.id);
        if (wedstrijd == null) {
        console.log("wedstrijd niet gevonden");
        }
    } catch (error) {
        console.log(error);
    }
    res.wedstrijd = wedstrijd;
    next();
}